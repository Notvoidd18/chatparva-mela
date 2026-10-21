import { Client, Room } from "@colyseus/sdk";
import { soundManager } from "../audio/SoundManager.js";
import type {
  AnimationState,
  AvatarCustomization,
  ChatMessage,
  EmoteType,
  LangurSymbol,
} from "@melaverse/shared";

export interface RemotePlayerData {
  sessionId: string;
  displayName: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  animState: AnimationState;
  customization: AvatarCustomization;
  speechBubble?: string | null;
  isFlyingKite?: boolean;
}

export class NetworkManager {
  private client: Client;
  private room: Room<any> | null = null;
  private pingInterval: any = null;
  private lastInputSendTime = 0;

  public isConnected = false;
  public ping = 0;
  public currentRoomName = "melaverse-server-1";

  // Callbacks
  public onPlayerJoined?: (player: RemotePlayerData) => void;
  public onPlayerLeft?: (sessionId: string) => void;
  public onPlayerUpdated?: (player: RemotePlayerData) => void;
  public onChatMessage?: (msg: ChatMessage) => void;
  public onSwingUpdated?: (swing: { angle: number; occupantId: string; occupantName: string }) => void;
  public onDiyaUpdated?: (diya: { id: string; isLit: boolean; litBy: string }) => void;
  public onLangurUpdated?: (data: { phase: string; timer: number; dice: string[]; roundId: number }) => void;
  public onStatusChange?: (online: boolean, error?: string) => void;
  public onInventoryUpdated?: (data: { itemType: string; count?: number; hasChanga?: boolean; dhakaTopiColor?: string; npr: number }) => void;
  public onTikaResponse?: (data: { success: boolean; alreadyClaimed: boolean; message: string; npr?: number; hasTika?: boolean }) => void;
  public onFoodConsumed?: (data: { itemType: string; remaining: number; score?: number }) => void;
  public onError?: (msg: string) => void;

  constructor() {
    // Check environment variable (VITE_SERVER_URL) first for cloud hosting (Render / Railway / GitHub Pages)
    let serverUrl = "";
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SERVER_URL) {
      serverUrl = import.meta.env.VITE_SERVER_URL;
    } else if (typeof window !== "undefined") {
      const isLocalDevPort = window.location.port === "5173" || window.location.port === "3000";
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      if (isLocalDevPort) {
        // Local Vite dev server: connects to local Colyseus backend on port 2567
        serverUrl = `${protocol}//${window.location.hostname}:2567`;
      } else {
        // Production deployment (Render / Single origin): uses same host and protocol (port 443 wss://)
        serverUrl = `${protocol}//${window.location.host}`;
      }
    } else {
      serverUrl = "ws://localhost:2567";
    }

    this.client = new Client(serverUrl);
  }

  public async connect(
    displayName: string,
    customization: AvatarCustomization,
    roomName: string = "melaverse-server-1"
  ): Promise<boolean> {
    this.currentRoomName = roomName;
    try {
      this.room = await this.client.joinOrCreate(roomName, {
        displayName,
        ...customization,
      });

      this.isConnected = true;
      this.onStatusChange?.(true);

      // Listen to Remote Players
      this.room.state.players.onAdd((player: any, sessionId: string) => {
        if (sessionId === this.room?.sessionId) return; // Ignore local player

        const rPlayer: RemotePlayerData = {
          sessionId,
          displayName: player.displayName,
          position: { x: player.x, y: player.y, z: player.z },
          rotationY: player.rotationY,
          animState: player.animState,
          isFlyingKite: player.isFlyingKite,
          customization: {
            color: player.color,
            dhakaTopiColor: player.dhakaTopiColor,
            hasDhakaTopi: player.hasDhakaTopi,
            hasVest: player.hasVest,
            vestColor: player.vestColor,
            skinTone: player.skinTone,
            hasTika: player.hasTika,
            hasJamara: player.hasTika,
          },
        };

        this.onPlayerJoined?.(rPlayer);

        player.onChange(() => {
          rPlayer.position = { x: player.x, y: player.y, z: player.z };
          rPlayer.rotationY = player.rotationY;
          rPlayer.animState = player.animState;
          rPlayer.isFlyingKite = player.isFlyingKite;
          rPlayer.customization.hasTika = player.hasTika;
          rPlayer.customization.hasJamara = player.hasTika;
          rPlayer.customization.dhakaTopiColor = player.dhakaTopiColor;
          this.onPlayerUpdated?.(rPlayer);
        });
      });

      this.room.state.players.onRemove((_: any, sessionId: string) => {
        this.onPlayerLeft?.(sessionId);
      });

      // Listen to Swing State
      if (this.room.state.pingSwing) {
        this.room.state.pingSwing.onChange(() => {
          const sw = this.room!.state.pingSwing;
          this.onSwingUpdated?.({
            angle: sw.swingAngle,
            occupantId: sw.occupantSessionId,
            occupantName: sw.occupantName,
          });
        });
      }

      // Listen to Diyas
      if (this.room.state.diyas) {
        this.room.state.diyas.forEach((diya: any) => {
          diya.onChange(() => {
            this.onDiyaUpdated?.({
              id: diya.id,
              isLit: diya.isLit,
              litBy: diya.litBy,
            });
          });
        });
      }

      // Listen to Langur Burja
      if (this.room.state.langurBurja) {
        this.room.state.langurBurja.onChange(() => {
          const lb = this.room!.state.langurBurja;
          this.onLangurUpdated?.({
            phase: lb.phase,
            timer: lb.timerRemaining,
            dice: [lb.d1, lb.d2, lb.d3, lb.d4, lb.d5, lb.d6],
            roundId: lb.roundId,
          });
        });
      }

      // Listen to Chat messages
      if (this.room.state.messages) {
        this.room.state.messages.onAdd((msg: any) => {
          this.onChatMessage?.({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            text: msg.text,
            timestamp: msg.timestamp,
            channel: msg.channel as any,
            isSystem: msg.senderId === "system",
          });
        });
      }

      // Listen to custom server response events
      this.room.onMessage("pong", (timestamp: number) => {
        this.ping = Math.max(0, Date.now() - timestamp);
      });

      this.room.onMessage("inventory_update", (data: any) => {
        this.onInventoryUpdated?.(data);
      });

      this.room.onMessage("food_consumed", (data: any) => {
        this.onFoodConsumed?.(data);
      });

      this.room.onMessage("tika_response", (data: any) => {
        this.onTikaResponse?.(data);
      });

      this.room.onMessage("error", (msg: string) => {
        this.onError?.(msg);
      });

      // Periodic ping
      this.pingInterval = setInterval(() => {
        if (this.isConnected && this.room) {
          this.room.send("ping", Date.now());
        }
      }, 3000);

      this.room.onLeave((code) => {
        this.isConnected = false;
        this.onStatusChange?.(false, `Disconnected (code: ${code})`);
        clearInterval(this.pingInterval);
      });

      return true;
    } catch (err: any) {
      console.warn("[NetworkManager] Failed to connect to server:", err.message);
      this.isConnected = false;
      this.onStatusChange?.(false, err.message);
      return false;
    }
  }

  public disconnect() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    this.isConnected = false;
    clearInterval(this.pingInterval);
    this.onStatusChange?.(false);
  }

  public sendInput(x: number, y: number, z: number, rotationY: number, animState: AnimationState) {
    if (!this.isConnected || !this.room) return;
    const now = performance.now();
    // Throttle network updates to ~20 Hz (50ms)
    if (now - this.lastInputSendTime < 45) return;
    this.lastInputSendTime = now;

    this.room.send("player_input", { x, y, z, rotationY, animState });
  }

  public sendChat(text: string, channel: "global" | "proximity") {
    if (!this.isConnected || !this.room) return;
    this.room.send("chat", { text, channel });
  }

  public sendEmote(emote: EmoteType) {
    if (!this.isConnected || !this.room) return;
    this.room.send("emote", emote);
  }

  public interactPingSwing() {
    if (!this.isConnected || !this.room) return;
    this.room.send("interact_ping_swing");
  }

  public pumpSwing() {
    if (!this.isConnected || !this.room) return;
    this.room.send("pump_swing");
  }

  public lightDiya(diyaId: string) {
    if (!this.isConnected || !this.room) return;
    this.room.send("light_diya", diyaId);
  }

  public placeLangurBet(symbol: LangurSymbol, amount: number) {
    if (!this.isConnected || !this.room) return;
    this.room.send("langur_bet", { symbol, amount });
  }

  public buyItem(itemType: string, price: number, data?: any) {
    if (!this.isConnected || !this.room) return;
    this.room.send("buy_item", { itemType, price, data });
  }

  public eatFood(itemType: string) {
    if (!this.isConnected || !this.room) return;
    this.room.send("eat_food", { itemType });
  }

  public claimTika(houseId: string) {
    if (!this.isConnected || !this.room) return;
    this.room.send("claim_tika", { houseId });
  }

  public toggleChanga(isFlying: boolean) {
    if (!this.isConnected || !this.room) return;
    this.room.send("toggle_changa", isFlying);
  }

  public async switchServer(
    newRoomName: string,
    displayName: string,
    customization: AvatarCustomization
  ): Promise<boolean> {
    this.disconnect();
    return this.connect(displayName, customization, newRoomName);
  }

  public getSessionId(): string | null {
    return this.room?.sessionId ?? null;
  }
}

export const networkManager = new NetworkManager();