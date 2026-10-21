import { Client, Room } from "@colyseus/sdk";
import { soundManager } from "../audio/SoundManager.js";
import { MelaWorldState } from "./schema/MelaWorldState.js";
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
  public onLangurPayout?: (data: { winAmount: number; newTokens: number }) => void;
  public onPingUpdated?: (ping: number) => void;
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
      this.room = await this.client.joinOrCreate(
        roomName,
        {
          displayName,
          ...customization,
        },
        MelaWorldState
      );

      this.isConnected = true;
      this.onStatusChange?.(true);

      const knownRemotePlayers = new Set<string>();
      let lastProcessedMessageCount = 0;

      // Reliable, typed state synchronization via Colyseus Schema
      this.room.onStateChange((state: MelaWorldState) => {
        if (!state) return;

        // Synchronize remote players
        if (state.players) {
          const currentRemoteIds = new Set<string>();

          state.players.forEach((player, sessionId) => {
            if (sessionId === this.room?.sessionId) return;
            currentRemoteIds.add(sessionId);

            const rPlayer: RemotePlayerData = {
              sessionId,
              displayName: player.displayName || "Yatri",
              position: { x: player.x, y: player.y, z: player.z },
              rotationY: player.rotationY || 0,
              animState: (player.animState as AnimationState) || "idle",
              isFlyingKite: Boolean(player.isFlyingKite),
              customization: {
                color: player.color || "#C41E3A",
                dhakaTopiColor: player.dhakaTopiColor || "#8B0000",
                hasDhakaTopi: player.hasDhakaTopi ?? true,
                hasVest: player.hasVest ?? true,
                vestColor: player.vestColor || "#D97706",
                skinTone: player.skinTone || "#E0AC69",
                hasTika: Boolean(player.hasTika),
                hasJamara: Boolean(player.hasTika),
                avatarType: (player.avatarType as any) || "boy1",
              },
            };

            if (!knownRemotePlayers.has(sessionId)) {
              knownRemotePlayers.add(sessionId);
              this.onPlayerJoined?.(rPlayer);
            } else {
              this.onPlayerUpdated?.(rPlayer);
            }
          });

          // Detect departed players
          for (const prevId of Array.from(knownRemotePlayers)) {
            if (!currentRemoteIds.has(prevId)) {
              knownRemotePlayers.delete(prevId);
              this.onPlayerLeft?.(prevId);
            }
          }
        }

        // Synchronize Linge Ping swing
        if (state.pingSwing) {
          this.onSwingUpdated?.({
            angle: state.pingSwing.swingAngle,
            occupantId: state.pingSwing.occupantSessionId,
            occupantName: state.pingSwing.occupantName,
          });
        }

        // Synchronize Tihar Diya stations
        if (state.diyas) {
          state.diyas.forEach((diya) => {
            this.onDiyaUpdated?.({
              id: diya.id,
              isLit: diya.isLit,
              litBy: diya.litBy,
            });
          });
        }

        // Synchronize Langur Burja game state
        if (state.langurBurja) {
          const lb = state.langurBurja;
          this.onLangurUpdated?.({
            phase: lb.phase,
            timer: lb.timerRemaining,
            dice: [lb.d1, lb.d2, lb.d3, lb.d4, lb.d5, lb.d6],
            roundId: lb.roundId,
          });
        }

        // Synchronize chat messages
        if (state.messages && state.messages.length > lastProcessedMessageCount) {
          for (let i = lastProcessedMessageCount; i < state.messages.length; i++) {
            const msg = state.messages[i];
            if (msg) {
              this.onChatMessage?.({
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                text: msg.text,
                timestamp: msg.timestamp,
                channel: msg.channel as any,
                isSystem: msg.senderId === "system",
              });
            }
          }
          lastProcessedMessageCount = state.messages.length;
        }
      });

      // Listen to custom server response events
      this.room.onMessage("pong", (timestamp: number) => {
        this.ping = Math.max(0, Date.now() - timestamp);
        this.onPingUpdated?.(this.ping);
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

      this.room.onMessage("langur_payout", (data: any) => {
        this.onLangurPayout?.(data);
      });

      this.room.onMessage("error", (msg: string) => {
        this.onError?.(msg);
      });

      // Send immediate initial ping
      this.room.send("ping", Date.now());

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