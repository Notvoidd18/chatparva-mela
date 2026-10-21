import React, { useState, useEffect } from "react";
import type { EmoteType, ChatMessage, AvatarCustomization } from "@melaverse/shared";
import { MinecraftHotbar } from "./MinecraftHotbar.js";

interface GameHUDProps {
  displayName: string;
  onDisplayNameChange?: (name: string) => void;
  onOpenNameModal?: () => void;
  npr: number;
  tokens: number;
  score: number;
  ping: number;
  isOnline: boolean;
  connectionState: "connecting" | "online" | "reconnecting" | "disconnected";
  playerCount: number;
  onToggleOnline: () => void;
  onOpenInventory: () => void;
  chatMessages: ChatMessage[];
  onSendChat: (text: string, channel: "global" | "proximity") => void;
  onTriggerEmote: (emote: EmoteType) => void;
  onOpenSettings: () => void;
  onOpenControls?: () => void;
  onToggleMusic: () => boolean;
  isMusicPlaying: boolean;
  nearbyInteraction: string | null;
  onInteract: () => void;
  customization: AvatarCustomization;
  onUpdateCustomization: (c: Partial<AvatarCustomization>) => void;
  showMobileControls: boolean;
  onJoystickMove?: (vec: { x: number; y: number } | null) => void;
  onJumpTouch?: (jump: boolean) => void;
  heldItem?: "chiya" | "sel_roti" | "kite" | "diya" | null;
  selectedHotbarSlot: number;
  onSelectHotbarSlot: (slot: number) => void;
  onUseHotbarItem: (itemId: string) => void;
  chiyaCount: number;
  selRotiCount: number;
  hasChanga: boolean;
  isKiteFlying: boolean;
  timeOfDayPhase?: "morning" | "day" | "sunset" | "night";
  canJoinDance?: boolean;
  onJoinDance?: () => void;
  isDancing?: boolean;
  currentServerId?: string;
  onSwitchServer?: (serverId: string) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  displayName,
  onOpenNameModal,
  npr,
  tokens = 0,
  score,
  ping,
  isOnline,
  connectionState,
  playerCount,
  onToggleOnline,
  onOpenInventory,
  chatMessages,
  onSendChat,
  onTriggerEmote,
  onOpenSettings,
  onOpenControls,
  onToggleMusic,
  isMusicPlaying,
  nearbyInteraction,
  onInteract,
  customization,
  onUpdateCustomization,
  showMobileControls,
  onJoystickMove,
  onJumpTouch,
  heldItem,
  selectedHotbarSlot,
  onSelectHotbarSlot,
  onUseHotbarItem,
  chiyaCount,
  selRotiCount,
  hasChanga,
  isKiteFlying,
  timeOfDayPhase = "day",
  canJoinDance = false,
  onJoinDance,
  isDancing = false,
  currentServerId = "melaverse-server-1",
  onSwitchServer,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [chatChannel, setChatChannel] = useState<"global" | "proximity">("global");
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [fps, setFps] = useState<number>(60);

  // Smooth realtime FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim(), chatChannel);
    setChatInput("");
  };

  const getTimePhaseBadge = (phase: string) => {
    switch (phase) {
      case "morning":
        return { icon: "🌅", label: "बिहानी (Morning)" };
      case "day":
        return { icon: "☀️", label: "दिउँसो (Daytime)" };
      case "sunset":
        return { icon: "🌇", label: "साँझ (Sunset)" };
      case "night":
        return { icon: "🌙", label: "राती (Tihar Night)" };
      default:
        return { icon: "☀️", label: "Mela" };
    }
  };

  const timeBadge = getTimePhaseBadge(timeOfDayPhase);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>
      {/* ─── Top Header Bar ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "auto",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* Festival Branding & Player Info */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(245, 158, 11, 0.5)",
            borderRadius: "14px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#fbbf24", letterSpacing: "0.5px" }}>
              🎪 Chatparva Mela
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Dashain &amp; Tihar Festival</div>
          </div>

          <div style={{ width: "1px", height: "24px", backgroundColor: "#334155" }} />

          {/* NPR Currency & Score */}
          <div style={{ display: "flex", gap: "10px", fontSize: "12px", fontWeight: 700, alignItems: "center" }}>
            <span style={{ color: "#fde047" }}>💰 रू {npr.toLocaleString()} NPR</span>
            <span style={{ color: "#38bdf8" }}>⭐ {score} Pts</span>
            <span style={{ backgroundColor: "rgba(30, 41, 59, 0.8)", border: "1px solid #475569", color: "#fef08a", padding: "2px 8px", borderRadius: "8px", fontSize: "11px" }}>
              {timeBadge.icon} {timeBadge.label}
            </span>
            <span
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                border: `1px solid ${fps >= 50 ? "#22c55e" : fps >= 30 ? "#eab308" : "#ef4444"}`,
                color: fps >= 50 ? "#4ade80" : fps >= 30 ? "#fde047" : "#f87171",
                padding: "2px 8px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              ⚡ {fps} FPS
            </span>
            {customization.hasTika && (
              <span style={{ backgroundColor: "#831843", color: "#fbcfe8", padding: "2px 7px", borderRadius: "8px", fontSize: "10px", fontWeight: 800 }}>
                🌸 Tika Blessed
              </span>
            )}
            {heldItem && (
              <span style={{ backgroundColor: "#334155", padding: "2px 6px", borderRadius: "8px", fontSize: "11px" }}>
                {heldItem === "chiya" && "☕ Hot Chiya Active (+Speed)"}
                {heldItem === "sel_roti" && "🍩 Eating Sel Roti"}
                {heldItem === "kite" && "🪁 Flying Changa"}
                {heldItem === "diya" && "🪔 Tihar Diya Glowing"}
              </span>
            )}
          </div>
        </div>

        {/* Top Right Controls: Inventory, Music, Connection, Settings */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            style={{
              backgroundColor: "rgba(180, 83, 9, 0.9)",
              color: "#FFF",
              border: "1px solid #facc15",
              borderRadius: "12px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🎒</span>
            <span>Inventory [I]</span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={onToggleMusic}
            style={{
              backgroundColor: isMusicPlaying ? "rgba(180, 83, 9, 0.85)" : "rgba(51, 65, 85, 0.85)",
              color: "#FFF",
              border: isMusicPlaying ? "1px solid #fde047" : "1px solid #64748b",
              borderRadius: "12px",
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{isMusicPlaying ? "🎵" : "🔇"}</span>
            <span>{isMusicPlaying ? "Music (Playing)" : "Music (Off)"}</span>
          </button>

          {/* Online Connection Badge */}
          <button
            onClick={onToggleOnline}
            style={{
              backgroundColor:
                connectionState === "online"
                  ? "rgba(5, 150, 105, 0.9)"
                  : connectionState === "connecting" || connectionState === "reconnecting"
                  ? "rgba(180, 83, 9, 0.9)"
                  : "rgba(185, 28, 28, 0.9)",
              color: "#FFF",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  connectionState === "online"
                    ? "#4ade80"
                    : connectionState === "connecting" || connectionState === "reconnecting"
                    ? "#facc15"
                    : "#ef4444",
              }}
            />
            <span>
              {connectionState === "online" && `Online (${playerCount} Players • ${ping}ms)`}
              {connectionState === "connecting" && "Connecting to Server..."}
              {connectionState === "reconnecting" && "Reconnecting..."}
              {connectionState === "disconnected" && "Offline (Click to Connect)"}
            </span>
          </button>

          {/* Server 1 / Server 2 Room Switcher */}
          <select
            value={currentServerId}
            onChange={(e) => onSwitchServer?.(e.target.value)}
            title="Switch Multiplayer Server"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              color: "#FDE047",
              border: "1.5px solid #F59E0B",
              borderRadius: "12px",
              padding: "7px 10px",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <option value="melaverse-server-1">🇳🇵 Server 1: Kathmandu Mela</option>
            <option value="melaverse-server-2">🏔️ Server 2: Pokhara Chautari</option>
          </select>

          {/* Player Name / Customizer */}
          <button
            onClick={onOpenNameModal}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              color: "#f8fafc",
              border: "1px solid #475569",
              borderRadius: "12px",
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            👤 {displayName}
          </button>

          {/* Controls */}
          {onOpenControls && (
            <button
              onClick={onOpenControls}
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                color: "#facc15",
                border: "1px solid #475569",
                borderRadius: "12px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              aria-label="Controls"
              title="Controls & Shortcuts"
            >
              🎮 <span style={{ display: "none" }}>Controls</span>
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              color: "#94a3b8",
              border: "1px solid #475569",
              borderRadius: "12px",
              padding: "8px 12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ─── Group Dancing Prompt (नाचौं सबै मिलेर!) ───────────────────────── */}
      {canJoinDance && (
        <div
          style={{
            position: "absolute",
            bottom: showMobileControls ? 140 : 86,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "auto",
            zIndex: 120,
          }}
        >
          <button
            onClick={onJoinDance}
            style={{
              backgroundColor: isDancing ? "rgba(220, 38, 38, 0.95)" : "rgba(234, 88, 12, 0.95)",
              color: "#FFF",
              border: "2px solid #FDE047",
              borderRadius: "18px",
              padding: "10px 22px",
              fontSize: "13px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💃</span>
            <span>{isDancing ? "Stop Dancing [G]" : "Join Nepali Group Dance [G] (नाचौं!)"}</span>
          </button>
        </div>
      )}

      {/* ─── Minecraft-Style Bottom Hotbar & Context Interaction Prompt (Phase 1 & 2) ─── */}
      <MinecraftHotbar
        selectedSlot={selectedHotbarSlot}
        onSelectSlot={onSelectHotbarSlot}
        onUseItem={onUseHotbarItem}
        chiyaCount={chiyaCount}
        selRotiCount={selRotiCount}
        hasChanga={hasChanga}
        hasDhakaTopi={customization.hasDhakaTopi}
        hasTika={customization.hasTika}
        isKiteFlying={isKiteFlying}
        nearbyInteraction={nearbyInteraction}
        onInteract={onInteract}
      />

      {/* ─── Emote Action Wheel / Bar ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: showMobileControls ? 80 : 20,
          left: 12,
          display: "flex",
          gap: "6px",
          pointerEvents: "auto",
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          padding: "6px 8px",
          borderRadius: "14px",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={() => onTriggerEmote("namaste")}
          title="Namaste (नमस्ते)"
          style={{
            backgroundColor: "#292524",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🙏 Namaste
        </button>
        <button
          onClick={() => onTriggerEmote("nach")}
          title="Nach (नाच)"
          style={{
            backgroundColor: "#292524",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          💃 Nach
        </button>
        <button
          onClick={() => onTriggerEmote("clapping")}
          title="Clap (ताली बजाउनुहोस्)"
          style={{
            backgroundColor: "#292524",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          👏 Clap
        </button>
        <button
          onClick={() => onTriggerEmote("wave")}
          title="Wave (हात हल्लाउनुहोस्)"
          style={{
            backgroundColor: "#292524",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          👋 Wave
        </button>
        <button
          onClick={() => onTriggerEmote("cheer")}
          title="Cheer (जय जयकार)"
          style={{
            backgroundColor: "#292524",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🎉 Cheer
        </button>
      </div>

      {/* ─── Chat Panel ───────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: showMobileControls ? 80 : 20,
          right: 12,
          width: "320px",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {/* Toggle Chat Box */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            borderRadius: "14px",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "8px 12px",
            maxHeight: isChatExpanded ? "220px" : "100px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "11px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontWeight: 800, color: "#facc15" }}>💬 Festival Chat</span>
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "11px" }}
            >
              {isChatExpanded ? "Collapse ▲" : "Expand ▼"}
            </button>
          </div>

          {chatMessages.slice(isChatExpanded ? -20 : -3).map((msg) => (
            <div key={msg.id} style={{ lineHeight: "1.4" }}>
              <span style={{ color: msg.isSystem ? "#f59e0b" : "#38bdf8", fontWeight: 700 }}>
                {msg.senderName}:{" "}
              </span>
              <span style={{ color: msg.isSystem ? "#fef08a" : "#f8fafc" }}>{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "4px" }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Say something to festival... (Enter)"
            maxLength={140}
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #475569",
              borderRadius: "10px",
              padding: "6px 10px",
              fontSize: "11px",
              color: "#FFF",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#ca8a04",
              border: "none",
              borderRadius: "10px",
              padding: "6px 12px",
              color: "#FFF",
              fontWeight: 800,
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* ─── Mobile Touch Controls ────────────────────────────────────────────── */}
      {showMobileControls && (
        <div style={{ position: "absolute", bottom: 20, right: 12, pointerEvents: "auto" }}>
          <button
            onPointerDown={() => onJumpTouch?.(true)}
            onPointerUp={() => onJumpTouch?.(false)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(196, 30, 58, 0.85)",
              border: "2px solid #ffd700",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            JUMP
          </button>
        </div>
      )}
    </div>
  );
};