import { Room, Client } from "@colyseus/core";
import {
  MelaWorldState,
  PlayerSchema,
  DiyaSchema,
  ChatMessageSchema,
} from "./schema/MelaWorldState.js";
import {
  WORLD_BOUNDS,
  SPAWN_POSITION,
  MOVEMENT_LIMITS,
  MAX_PLAYERS_PER_ROOM,
  TICK_RATE_HZ,
  INITIAL_DIYA_STATIONS,
  CHAT_LIMITS,
  LANGUR_BURJA_CONFIG,
} from "@melaverse/shared";

interface ClientJoinOptions {
  displayName?: string;
  color?: string;
  dhakaTopiColor?: string;
  hasDhakaTopi?: boolean;
  hasVest?: boolean;
  vestColor?: string;
  skinTone?: string;
  avatarType?: string;
}

interface PlayerInputMessage {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  animState: string;
}

interface BetMessage {
  symbol: string;
  amount: number;
}

export class MelaWorldRoom extends Room<{ state: MelaWorldState }> {
  maxClients = MAX_PLAYERS_PER_ROOM;

  private playerLastMoveTime = new Map<string, number>();
  private playerLastChatTime = new Map<string, number>();
  private playerLastEmoteTime = new Map<string, number>();
  private playerBets = new Map<string, Map<string, number>>();

  // Langur Burja loop timer
  private langurTimerSeconds: number = LANGUR_BURJA_CONFIG.BETTING_DURATION_SEC;
  private langurDiceSymbols = ["jhanda", "burja", "ita", "paan", "hukum", "chidi"];

  onCreate(options: Record<string, unknown>): void {
    console.log("[MelaWorldRoom] Initializing MelaVerse World Room. Options:", options);
    this.setState(new MelaWorldState());

    // Initialize Tihar Diya Stations
    for (const d of INITIAL_DIYA_STATIONS) {
      const diya = new DiyaSchema();
      diya.id = d.id;
      diya.x = d.x;
      diya.y = d.y;
      diya.z = d.z;
      diya.isLit = false;
      this.state.diyas.set(d.id, diya);
    }

    // Set authoritative server tick rate (20 Hz = 50ms)
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / TICK_RATE_HZ);

    // Register Network Handlers
    this.registerMessageHandlers();

    // Start Langur Burja periodic timer (1s interval)
    this.clock.setInterval(() => this.tickLangurBurja(), 1000);
  }

  private registerMessageHandlers(): void {
    // 1. Movement & Input with Authoritative Validation
    this.onMessage("player_input", (client, message: PlayerInputMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Rate limit movement updates per client
      const now = Date.now();
      this.playerLastMoveTime.set(client.sessionId, now);
      player.lastActive = now;

      // Validate numeric types
      if (
        typeof message.x !== "number" ||
        typeof message.y !== "number" ||
        typeof message.z !== "number" ||
        typeof message.rotationY !== "number"
      ) {
        return;
      }

      // If player is on the swing, server physics loop is the authoritative source of position
      // Do not allow client walking updates to fight server pendulum simulation
      if (this.state.pingSwing.occupantSessionId === client.sessionId) {
        player.animState = "swinging";
        return;
      }

      // Delta validation (speed anticheat)
      const dx = message.x - player.x;
      const dz = message.z - player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > MOVEMENT_LIMITS.MAX_DELTA_POSITION_PER_TICK) {
        // Clamp movement to max allowed per tick to prevent teleporting/speed hacks
        const ratio = MOVEMENT_LIMITS.MAX_DELTA_POSITION_PER_TICK / distance;
        player.x += dx * ratio;
        player.z += dz * ratio;
      } else {
        player.x = message.x;
        player.z = message.z;
      }

      // Authoritative world boundary clamping
      player.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, player.x));
      player.z = Math.max(WORLD_BOUNDS.minZ, Math.min(WORLD_BOUNDS.maxZ, player.z));
      player.y = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, message.y));
      player.rotationY = message.rotationY;

      if (typeof message.animState === "string") {
        player.animState = message.animState;
      }
    });

    // 2. Emotes
    this.onMessage("emote", (client, emoteName: string) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const now = Date.now();
      const lastEmote = this.playerLastEmoteTime.get(client.sessionId) ?? 0;
      if (now - lastEmote < 1500) return; // 1.5s cooldown

      this.playerLastEmoteTime.set(client.sessionId, now);
      const validEmotes = [
        "namaste",
        "nach",
        "wave",
        "cheer",
        "clapping",
        "clapping_dance",
        "swaying_dance",
      ];
      if (validEmotes.includes(emoteName)) {
        player.animState = emoteName;
      }
    });

    // 3. Chat with length limit & rate limiting
    this.onMessage("chat", (client, payload: { text: string; channel?: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const now = Date.now();
      const lastChat = this.playerLastChatTime.get(client.sessionId) ?? 0;
      if (now - lastChat < CHAT_LIMITS.RATE_LIMIT_MS) return; // Spam throttle
      this.playerLastChatTime.set(client.sessionId, now);

      if (!payload || typeof payload.text !== "string") return;

      // Sanitize & truncate text
      const cleanText = payload.text
        .replace(/<[^>]*>?/gm, "") // strip HTML
        .trim()
        .slice(0, CHAT_LIMITS.MAX_MESSAGE_LENGTH);

      if (cleanText.length === 0) return;

      const msg = new ChatMessageSchema();
      msg.id = `chat-${now}-${Math.random().toString(36).substring(2, 7)}`;
      msg.senderId = client.sessionId;
      msg.senderName = player.displayName;
      msg.text = cleanText;
      msg.timestamp = now;
      msg.channel = payload.channel === "proximity" ? "proximity" : "global";

      this.state.messages.push(msg);
      // Keep message buffer under 50
      if (this.state.messages.length > 50) {
        this.state.messages.shift();
      }
    });

    // 4. Ping Swing Attraction Interaction
    this.onMessage("interact_ping_swing", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const swingPos = { x: -26, y: 0, z: -10 };
      const dist = Math.hypot(player.x - swingPos.x, player.z - swingPos.z);

      if (dist > 8.0) return;

      if (this.state.pingSwing.occupantSessionId === client.sessionId) {
        // Safe Dismount
        this.state.pingSwing.occupantSessionId = "";
        this.state.pingSwing.occupantName = "";
        this.state.pingSwing.isPumping = false;
        player.animState = "idle";
        player.x = -26;
        player.y = 0;
        player.z = -5.5; // Safe ground position in front of swing
      } else if (!this.state.pingSwing.occupantSessionId) {
        // Mount
        this.state.pingSwing.occupantSessionId = client.sessionId;
        this.state.pingSwing.occupantName = player.displayName;
        if (Math.abs(this.state.pingSwing.swingSpeed) < 0.2) {
          this.state.pingSwing.swingSpeed = 1.0;
        }
        player.animState = "swinging";
        player.x = swingPos.x;
        player.y = 0.5;
        player.z = swingPos.z;
      }
    });

    // 6. Shop Purchases (Server Authoritative NPR Transactions)
    this.onMessage("buy_item", (client, payload: { itemType: string; price: number; data?: any }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (typeof payload.price !== "number" || payload.price < 0) return;

      if (player.npr < payload.price) {
        client.send("error", "पर्याप्त नेपाली रुपैयाँ छैन! (Insufficient NPR!)");
        return;
      }

      player.npr -= payload.price;

      if (payload.itemType === "chiya") {
        player.chiyaCount += 1;
        client.send("inventory_update", { itemType: "chiya", count: player.chiyaCount, npr: player.npr });
      } else if (payload.itemType === "sel_roti") {
        player.selRotiCount += 1;
        client.send("inventory_update", { itemType: "sel_roti", count: player.selRotiCount, npr: player.npr });
      } else if (payload.itemType === "changa") {
        player.hasChanga = true;
        client.send("inventory_update", { itemType: "changa", hasChanga: true, npr: player.npr });
      } else if (payload.itemType === "dhaka" && payload.data?.dhakaTopiColor) {
        player.dhakaTopiColor = payload.data.dhakaTopiColor;
        player.hasDhakaTopi = true;
        client.send("inventory_update", { itemType: "dhaka", dhakaTopiColor: player.dhakaTopiColor, npr: player.npr });
      }
    });

    // 7. Eating Food (Server Authoritative Consumption)
    this.onMessage("eat_food", (client, payload: { itemType: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (payload.itemType === "chiya") {
        if (player.chiyaCount <= 0) {
          client.send("error", "No Masala Chiya in inventory!");
          return;
        }
        player.chiyaCount -= 1;
        player.animState = "drinking";
        client.send("food_consumed", { itemType: "chiya", remaining: player.chiyaCount });
        this.clock.setTimeout(() => {
          if (player.animState === "drinking") player.animState = "idle";
        }, 3500);
      } else if (payload.itemType === "sel_roti") {
        if (player.selRotiCount <= 0) {
          client.send("error", "No Sel Roti in inventory!");
          return;
        }
        player.selRotiCount -= 1;
        player.score += 25;
        player.animState = "eating";
        client.send("food_consumed", { itemType: "sel_roti", remaining: player.selRotiCount, score: player.score });
        this.clock.setTimeout(() => {
          if (player.animState === "eating") player.animState = "idle";
        }, 3500);
      }
    });

    // 8. Tika & Jamara Blessing Claim (Strictly One-Time per Player on Server)
    this.onMessage("claim_tika", (client, payload: { houseId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (player.hasReceivedTikaReward) {
        client.send("tika_response", {
          success: false,
          alreadyClaimed: true,
          message: "शुभ विजया दशमी! तपाईंले यस वर्षको आशिर्वाद र दक्षिणा लिइसक्नुभएको छ। (You have already received your Dashain blessing & Dakshina!)",
          hasTika: player.hasTika,
        });
        return;
      }

      player.hasTika = true;
      player.hasReceivedTikaReward = true;
      player.npr += 50; // Dakshina of 50 NPR!
      player.score += 50;

      client.send("tika_response", {
        success: true,
        alreadyClaimed: false,
        message: "🌸 रातो अक्षता र पहेंलो जमराको आशिर्वाद! तपाईंलाई रू ५० दक्षिणा प्राप्त भयो! (Dashain Tika & Jamara Blessing + NPR 50 Dakshina)",
        npr: player.npr,
        hasTika: true,
      });

      // Broadcast celebratory announcement
      const msg = new ChatMessageSchema();
      msg.id = `tika-${Date.now()}-${client.sessionId}`;
      msg.senderId = "system";
      msg.senderName = "🌸 Chatparva Mela";
      msg.text = `${player.displayName} received Dashain Tika & Jamara blessing (+NPR 50 Dakshina)! 🌸🙏`;
      msg.timestamp = Date.now();
      msg.channel = "global";
      this.state.messages.push(msg);
    });

    // 9. Changa Kite Flying State Toggle
    this.onMessage("toggle_changa", (client, isFlying: boolean) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (!player.hasChanga && isFlying) {
        client.send("error", "You do not own a Changa yet! Visit the Kite Stall to buy one.");
        return;
      }
      player.isFlyingKite = Boolean(isFlying);
      player.animState = isFlying ? "flying_kite" : "idle";
    });

    // 5. Ping Swing Pumping (Timing Mechanic with Cooldown & Clamping)
    this.onMessage("pump_swing", (client) => {
      if (this.state.pingSwing.occupantSessionId === client.sessionId) {
        const now = Date.now();
        const lastPump = this.playerLastEmoteTime.get(`pump_${client.sessionId}`) ?? 0;
        if (now - lastPump < 350) return; // 350ms cooldown between pumps
        this.playerLastEmoteTime.set(`pump_${client.sessionId}`, now);

        this.state.pingSwing.isPumping = true;
        // Directional momentum boost
        const currentSpeed = this.state.pingSwing.swingSpeed;
        const boost = 0.45;
        if (Math.abs(currentSpeed) < 0.1) {
          this.state.pingSwing.swingSpeed = boost;
        } else if (currentSpeed > 0) {
          this.state.pingSwing.swingSpeed = Math.min(2.4, currentSpeed + boost);
        } else {
          this.state.pingSwing.swingSpeed = Math.max(-2.4, currentSpeed - boost);
        }
      }
    });

    // 6. Tihar Diya Station Lighting
    this.onMessage("light_diya", (client, diyaId: string) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const diya = this.state.diyas.get(diyaId);
      if (!diya) return;

      const dist = Math.hypot(player.x - diya.x, player.z - diya.z);
      if (dist > 8.0) return;

      if (!diya.isLit) {
        diya.isLit = true;
        diya.litBy = player.displayName;
        diya.litAt = Date.now();
        player.score += 10;
        player.npr += 10;
        player.tokens += 10;

        // Broadcast celebratory notification
        const msg = new ChatMessageSchema();
        msg.id = `sys-${Date.now()}`;
        msg.senderId = "system";
        msg.senderName = "🌸 Chatparva Mela";
        msg.text = `${player.displayName} lit a ceremonial Tihar Diya! (+NPR 10)`;
        msg.timestamp = Date.now();
        msg.channel = "global";
        this.state.messages.push(msg);
      }
    });

    // 7. Langur Burja Bets
    this.onMessage("langur_bet", (client, bet: BetMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.langurBurja.phase !== "betting") {
        client.send("error", "Betting is currently closed!");
        return;
      }

      if (!this.langurDiceSymbols.includes(bet.symbol)) return;
      if (bet.amount <= 0 || player.tokens < bet.amount) {
        client.send("error", "Insufficient festival tokens!");
        return;
      }

      player.tokens -= bet.amount;

      if (!this.playerBets.has(client.sessionId)) {
        this.playerBets.set(client.sessionId, new Map());
      }
      const bets = this.playerBets.get(client.sessionId)!;
      bets.set(bet.symbol, (bets.get(bet.symbol) ?? 0) + bet.amount);

      client.send("bet_confirmed", {
        symbol: bet.symbol,
        totalOnSymbol: bets.get(bet.symbol),
        remainingTokens: player.tokens,
      });
    });

    // 8. Ping / Latency calculation
    this.onMessage("ping", (client, timestamp: number) => {
      const player = this.state.players.get(client.sessionId);
      if (player && typeof timestamp === "number") {
        player.ping = Math.max(0, Date.now() - timestamp);
      }
      client.send("pong", timestamp);
    });
  }

  onJoin(client: Client, options?: ClientJoinOptions): void {
    console.log(`[MelaWorldRoom] Player joined: ${client.sessionId}`);

    const player = new PlayerSchema();
    player.sessionId = client.sessionId;

    // Validate, sanitize and ensure unique display name (Phase 8)
    const rawName = (options?.displayName ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .slice(0, 16);
    let finalName = rawName.length >= 3 ? rawName : `Yatri-${client.sessionId.slice(0, 4)}`;

    const reserved = ["system", "admin", "moderator", "staff", "server", "mela", "chatparva"];
    if (reserved.includes(finalName.toLowerCase())) {
      finalName = `Yatri-${client.sessionId.slice(0, 4)}`;
    }

    // Check duplicate username in room (case-insensitive)
    let isDuplicate = false;
    for (const existing of this.state.players.values()) {
      if (existing.displayName.toLowerCase() === finalName.toLowerCase()) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) {
      finalName = `${finalName}-${Math.floor(100 + Math.random() * 900)}`;
    }
    player.displayName = finalName;
    player.npr = 100; // Starting balance: 100 NPR

    // Initial spawn with deterministic slight offset
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.2 * Math.random();
    player.x = SPAWN_POSITION.x + Math.cos(angle) * radius;
    player.y = SPAWN_POSITION.y;
    player.z = SPAWN_POSITION.z + Math.sin(angle) * radius;
    player.rotationY = 0;
    player.animState = "idle";

    // Customization
    if (options?.color) player.color = options.color;
    if (options?.dhakaTopiColor) player.dhakaTopiColor = options.dhakaTopiColor;
    if (typeof options?.hasDhakaTopi === "boolean") player.hasDhakaTopi = options.hasDhakaTopi;
    if (typeof options?.hasVest === "boolean") player.hasVest = options.hasVest;
    if (options?.vestColor) player.vestColor = options.vestColor;
    if (options?.skinTone) player.skinTone = options.skinTone;
    if (options?.avatarType) player.avatarType = options.avatarType;

    this.state.players.set(client.sessionId, player);

    // Broadcast system welcome
    const sysMsg = new ChatMessageSchema();
    sysMsg.id = `join-${Date.now()}-${client.sessionId}`;
    sysMsg.senderId = "system";
    sysMsg.senderName = "🎪 Chatparva Mela";
    sysMsg.text = `${player.displayName} has arrived at Chatparva Mela! Namaste 🙏`;
    sysMsg.timestamp = Date.now();
    sysMsg.channel = "global";
    this.state.messages.push(sysMsg);
  }

  onLeave(client: Client, code?: number): void {
    console.log(`[MelaWorldRoom] Player left: ${client.sessionId} (code: ${code})`);

    const player = this.state.players.get(client.sessionId);
    if (player) {
      // Free swing if occupant left
      if (this.state.pingSwing.occupantSessionId === client.sessionId) {
        this.state.pingSwing.occupantSessionId = "";
        this.state.pingSwing.occupantName = "";
        this.state.pingSwing.isPumping = false;
      }

      // Cleanup bets & rate limiters
      this.playerBets.delete(client.sessionId);
      this.playerLastMoveTime.delete(client.sessionId);
      this.playerLastChatTime.delete(client.sessionId);
      this.playerLastEmoteTime.delete(client.sessionId);

      this.state.players.delete(client.sessionId);
    }
  }

  onDispose(): void {
    console.log("[MelaWorldRoom] Disposed MelaVerse room instance.");
  }

  // ─── Authoritative Simulation Loop (20 Hz) ──────────────────────────────────
  private update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    // Simulate Ping Swing physics
    const swing = this.state.pingSwing;
    if (swing.occupantSessionId) {
      // Natural pendulum harmonic oscillation with damping
      // d^2(theta)/dt^2 = -(g/L) * sin(theta) - damping * speed + pumping
      const gravityOverLength = 4.0;
      const damping = 0.35;
      const acceleration = -gravityOverLength * Math.sin(swing.swingAngle) - damping * swing.swingSpeed;
      swing.swingSpeed += acceleration * dt;
      // Clamp swing speed to safe bounds
      swing.swingSpeed = Math.max(-2.2, Math.min(2.2, swing.swingSpeed));
      swing.swingAngle += swing.swingSpeed * dt;
      // Clamp swing angle to max ~68 degrees (1.2 radians)
      swing.swingAngle = Math.max(-1.2, Math.min(1.2, swing.swingAngle));

      // Keep occupant pinned to swing seat in world space along Z axis (matching FestivalWorld 3D ropes)
      const occupant = this.state.players.get(swing.occupantSessionId);
      if (occupant) {
        occupant.x = -26;
        occupant.y = Math.max(0.3, 11.2 - Math.cos(swing.swingAngle) * 10.4 + 0.3);
        occupant.z = -10 - Math.sin(swing.swingAngle) * 10.4;
        occupant.animState = "swinging";
      }
    } else {
      // Free damping to rest when empty
      swing.swingSpeed *= Math.exp(-0.8 * dt);
      swing.swingAngle *= Math.exp(-0.8 * dt);
      if (Math.abs(swing.swingAngle) < 0.01) {
        swing.swingAngle = 0;
        swing.swingSpeed = 0;
      }
    }
  }

  // ─── Langur Burja State Machine (1s tick) ───────────────────────────────────
  private tickLangurBurja(): void {
    const lb = this.state.langurBurja;
    this.langurTimerSeconds--;
    lb.timerRemaining = Math.max(0, this.langurTimerSeconds);

    if (this.langurTimerSeconds <= 0) {
      if (lb.phase === "betting") {
        // Transition to rolling
        lb.phase = "rolling";
        this.langurTimerSeconds = LANGUR_BURJA_CONFIG.ROLLING_DURATION_SEC;
        lb.timerRemaining = this.langurTimerSeconds;

        // Roll 6 authoritative dice on server
        const rollDie = () =>
          this.langurDiceSymbols[Math.floor(Math.random() * this.langurDiceSymbols.length)];
        lb.d1 = rollDie();
        lb.d2 = rollDie();
        lb.d3 = rollDie();
        lb.d4 = rollDie();
        lb.d5 = rollDie();
        lb.d6 = rollDie();
      } else if (lb.phase === "rolling") {
        // Transition to payout
        lb.phase = "payout";
        this.langurTimerSeconds = LANGUR_BURJA_CONFIG.PAYOUT_DURATION_SEC;
        lb.timerRemaining = this.langurTimerSeconds;
        this.calculateLangurPayouts();
      } else if (lb.phase === "payout") {
        // Start next round
        lb.roundId++;
        lb.phase = "betting";
        this.langurTimerSeconds = LANGUR_BURJA_CONFIG.BETTING_DURATION_SEC;
        lb.timerRemaining = this.langurTimerSeconds;
        this.playerBets.clear();
      }
    }
  }

  private calculateLangurPayouts(): void {
    const lb = this.state.langurBurja;
    const rolled = [lb.d1, lb.d2, lb.d3, lb.d4, lb.d5, lb.d6];

    // Count occurrences of each symbol
    const counts = new Map<string, number>();
    for (const s of rolled) {
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }

    // Evaluate bets
    for (const [sessionId, bets] of this.playerBets.entries()) {
      const player = this.state.players.get(sessionId);
      if (!player) continue;

      let totalWin = 0;
      for (const [symbol, amount] of bets.entries()) {
        const matchCount = counts.get(symbol) ?? 0;
        if (matchCount > 0) {
          // Traditional Langur Burja rule: return bet + (matchCount * bet)
          const payout = amount + amount * matchCount;
          totalWin += payout;
        }
      }

      if (totalWin > 0) {
        player.tokens += totalWin;
        player.score += Math.floor(totalWin / 2);

        const client = this.clients.find((c) => c.sessionId === sessionId);
        if (client) {
          client.send("langur_payout", {
            winAmount: totalWin,
            newTokens: player.tokens,
          });
        }
      }
    }
  }
}
