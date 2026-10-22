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
  onExit?: () => void;
  onToggleMusic: () => boolean;
  isMusicPlaying: boolean;
  nearbyInteraction: string | null;
  onInteract: () => void;
  customization: AvatarCustomization;
  onUpdateCustomization: (c: Partial<AvatarCustomization>) => void;
  showMobileControls: boolean;
  onJoystickMove?: (vec: { x: number; y: number } | null) => void;
  onJumpTouch?: (jump: boolean) => void;
  onRotateCamera?: (step: number) => void;
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
  onExit,
  onToggleMusic,
  isMusicPlaying,
  nearbyInteraction,
  onInteract,
  customization,
  showMobileControls,
  onJoystickMove,
  onJumpTouch,
  onRotateCamera,
  heldItem,
  selectedHotbarSlot,
  onSelectHotbarSlot,
  onUseHotbarItem,
  chiyaCount,
  selRotiCount,
  hasChanga,
  isKiteFlying,
  canJoinDance = false,
  onJoinDance,
  isDancing = false,
  currentServerId = "melaverse-server-1",
  onSwitchServer,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  // Handle Joystick Touch
  const handleJoystickStart = (e: React.TouchEvent | React.PointerEvent) => {
    setJoystickActive(true);
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.PointerEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const baseEl = document.getElementById("virtual-joystick-base");
    if (!baseEl) return;
    const rect = baseEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = 40;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: stickX, y: stickY });
    onJoystickMove?.({ x: stickX / maxRadius, y: stickY / maxRadius });
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onJoystickMove?.(null);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim(), "global");
    setChatInput("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─── Ultra-Clean Modern Top Bar ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "auto",
        }}
      >
        {/* Left: Currency & Connection Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* NPR Currency Pill */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(250, 204, 21, 0.4)",
              borderRadius: "20px",
              padding: "5px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ fontSize: "14px" }}>🇳🇵</span>
            <span style={{ fontWeight: 900, color: "#FEF08A", fontSize: "13px" }}>
              रू {npr}
            </span>
          </div>

          {/* Festival Tokens Pill */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "20px",
              padding: "5px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ fontSize: "14px" }}>🪙</span>
            <span style={{ fontWeight: 900, color: "#FDE047", fontSize: "13px" }}>
              {tokens}
            </span>
          </div>

          {/* Connection Dot Badge */}
          <button
            onClick={onToggleOnline}
            style={{
              background: "rgba(18, 18, 24, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "20px",
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            title="Server Connection Status"
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  connectionState === "online"
                    ? "#22c55e"
                    : connectionState === "connecting"
                    ? "#eab308"
                    : "#ef4444",
                boxShadow: connectionState === "online" ? "0 0 8px #22c55e" : "none",
              }}
            />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#E2E8F0" }}>
              {connectionState === "online" ? `${ping}ms` : "Offline"}
            </span>
          </button>
        </div>

        {/* Right: Profile, Audio & Dropdown Menu Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Profile Badge */}
          <button
            onClick={onOpenNameModal}
            style={{
              background: "rgba(18, 18, 24, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(250, 204, 21, 0.35)",
              borderRadius: "20px",
              padding: "4px 10px 4px 6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            title="Change name or avatar"
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: customization.color || "#C41E3A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              👤
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFF" }}>
              {displayName}
            </span>
          </button>

          {/* Quick Sound/Music Toggle */}
          <button
            onClick={onToggleMusic}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(18, 18, 24, 0.85)",
              border: isMusicPlaying ? "1px solid #FCD34D" : "1px solid rgba(255,255,255,0.15)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
            title="Toggle Festival Music"
          >
            {isMusicPlaying ? "🎵" : "🔇"}
          </button>

          {/* Menu Button (Settings, Inventory, Exit) */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(18, 18, 24, 0.85)",
                border: isMenuOpen ? "1.5px solid #38BDF8" : "1px solid rgba(255,255,255,0.15)",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px",
              }}
              title="Game Menu"
            >
              ⚙️
            </button>

            {/* Dropdown Menu Modal */}
            {isMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "44px",
                  right: 0,
                  width: "210px",
                  background: "rgba(18, 18, 24, 0.96)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(250, 204, 21, 0.3)",
                  borderRadius: "14px",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.8)",
                  zIndex: 200,
                }}
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenInventory();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    color: "#FFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <span>🎒</span> Inventory Backpack [I]
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    color: "#FFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <span>⚙️</span> Audio &amp; Settings
                </button>

                {onOpenControls && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenControls();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      color: "#FFF",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <span>📖</span> Controls Guide
                  </button>
                )}

                {/* Server Switcher */}
                <div style={{ padding: "4px 8px" }}>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 700, marginBottom: "4px" }}>
                    SERVER:
                  </div>
                  <select
                    value={currentServerId}
                    onChange={(e) => {
                      onSwitchServer?.(e.target.value);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      background: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid #64748B",
                      borderRadius: "6px",
                      padding: "4px",
                      color: "#FDE047",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <option value="melaverse-server-1">🇳🇵 Server 1 (KTM)</option>
                    <option value="melaverse-server-2">🏔️ Server 2 (PKR)</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExit?.();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(220, 38, 38, 0.25)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    color: "#FCA5A5",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    marginTop: "4px",
                  }}
                >
                  <span>🚪</span> Exit to Main Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom-Left: Collapsible Chat Bubble ──────────────────────────────── */}
      <div style={{ position: "absolute", bottom: showMobileControls ? 140 : 20, left: 16, pointerEvents: "auto", zIndex: 110 }}>
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(18, 18, 24, 0.88)",
              border: "1.5px solid #FCD34D",
              color: "#FFF",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
            }}
            title="Open Chat"
          >
            💬
          </button>
        ) : (
          <div
            style={{
              width: "290px",
              background: "rgba(18, 18, 24, 0.94)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(250, 204, 21, 0.4)",
              borderRadius: "16px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#FEF08A" }}>
                💬 Festival Chat
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                maxHeight: "130px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "11px",
              }}
            >
              {chatMessages.slice(-10).map((msg) => (
                <div key={msg.id} style={{ lineHeight: "1.3" }}>
                  <span style={{ color: msg.isSystem ? "#F59E0B" : "#38BDF8", fontWeight: 700 }}>
                    {msg.senderName}:{" "}
                  </span>
                  <span style={{ color: msg.isSystem ? "#FEF08A" : "#F8FAFC" }}>{msg.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say Namaste... (Enter)"
                maxLength={100}
                style={{
                  flex: 1,
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  padding: "6px 8px",
                  fontSize: "11px",
                  color: "#FFF",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#D97706",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 10px",
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
        )}
      </div>

      {/* ─── Bottom-Center: Minecraft Hotbar ───────────────────────────────────── */}
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

      {/* ─── Mobile Player Integration: Roblox-Style Controls ─────────────────── */}
      {showMobileControls && (
        <>
          {/* Virtual Joystick (Bottom Left) */}
          <div
            id="virtual-joystick-base"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onPointerDown={handleJoystickStart}
            onPointerMove={joystickActive ? handleJoystickMove : undefined}
            onPointerUp={handleJoystickEnd}
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              border: "2px solid rgba(250, 204, 21, 0.4)",
              pointerEvents: "auto",
              touchAction: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Joystick Thumb Stick */}
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                border: "2px solid #FEF08A",
                transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            />
          </div>

          {/* Action & Rotate Buttons Cluster (Bottom Right) */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
              pointerEvents: "auto",
            }}
          >
            {/* Camera Rotate Buttons (Roblox Style: Spin Camera Left/Right) */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onPointerDown={() => onRotateCamera?.(1)}
                onPointerUp={() => onRotateCamera?.(0)}
                onTouchStart={() => onRotateCamera?.(1)}
                onTouchEnd={() => onRotateCamera?.(0)}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  border: "2px solid #38BDF8",
                  color: "#38BDF8",
                  fontSize: "18px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                }}
                title="Rotate Camera Left"
              >
                ◀🔄
              </button>
              <button
                onPointerDown={() => onRotateCamera?.(-1)}
                onPointerUp={() => onRotateCamera?.(0)}
                onTouchStart={() => onRotateCamera?.(-1)}
                onTouchEnd={() => onRotateCamera?.(0)}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  border: "2px solid #38BDF8",
                  color: "#38BDF8",
                  fontSize: "18px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                }}
                title="Rotate Camera Right"
              >
                🔄▶
              </button>
            </div>

            {/* Jump & Interact Action Row */}
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Interact [E] Button */}
              <button
                onClick={onInteract}
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
                  border: "2px solid #34D399",
                  color: "#FFF",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                <span>⚡</span>
                <span style={{ fontSize: "10px" }}>USE [E]</span>
              </button>

              {/* Jump [Space] Button */}
              <button
                onPointerDown={() => onJumpTouch?.(true)}
                onPointerUp={() => onJumpTouch?.(false)}
                onTouchStart={() => onJumpTouch?.(true)}
                onTouchEnd={() => onJumpTouch?.(false)}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)",
                  border: "2.5px solid #FCD34D",
                  color: "#FFF",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
                }}
              >
                <span>🦘</span>
                <span style={{ fontSize: "11px" }}>JUMP</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
