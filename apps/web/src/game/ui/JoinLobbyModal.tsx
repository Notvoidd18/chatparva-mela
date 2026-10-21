import React, { useState } from "react";
import { AVATAR_PRESETS } from "@melaverse/shared";
import { soundManager } from "../audio/SoundManager.js";

interface JoinLobbyModalProps {
  isOpen: boolean;
  initialUsername: string;
  initialAvatarType: "boy1" | "boy2" | "girl1" | "girl2";
  onJoinMultiplayer: (username: string, avatarType: "boy1" | "boy2" | "girl1" | "girl2") => void;
  onPlaySolo?: (username: string, avatarType: "boy1" | "boy2" | "girl1" | "girl2") => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  onExit?: () => void;
  serverStatus: "online" | "connecting" | "offline";
  ping?: number;
  serverName?: string;
}

const BOY_NAMES = ["Bhojraj", "Aayush", "Bishnu", "Sagar", "Rohan", "Niraj", "Milan", "Dipesh", "Bikash", "Kiran"];
const GIRL_NAMES = ["Sita", "Anjali", "Puja", "Prakriti", "Rojina", "Samikshya", "Sunita", "Dikshya", "Shristi", "Alisha"];

export const JoinLobbyModal: React.FC<JoinLobbyModalProps> = ({
  isOpen,
  initialUsername,
  initialAvatarType = "boy1",
  onJoinMultiplayer,
  onPlaySolo,
  onOpenSettings,
  onOpenControls,
  onExit,
  serverStatus,
  ping = 0,
}) => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [selectedAvatar, setSelectedAvatar] = useState<"boy1" | "boy2" | "girl1" | "girl2">(initialAvatarType);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRandomName = () => {
    const isGirl = selectedAvatar === "girl1" || selectedAvatar === "girl2";
    const list = isGirl ? GIRL_NAMES : BOY_NAMES;
    const name = list[Math.floor(Math.random() * list.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setUsername(`${name}-${num}`);
    setError(null);
  };

  const validate = (): string | null => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      return "Username must be at least 3 characters.";
    }
    if (trimmed.length > 16) {
      return "Username must be 16 characters or less.";
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
      return "Letters, numbers, hyphens, and spaces only.";
    }
    return null;
  };

  const handlePlayMultiplayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    try {
      localStorage.setItem("chatparva_username", username.trim());
      localStorage.setItem("chatparva_avatar", selectedAvatar);
    } catch {}
    soundManager.playTempleBell();
    onJoinMultiplayer(username.trim(), selectedAvatar);
  };

  const handlePlaySolo = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    try {
      localStorage.setItem("chatparva_username", username.trim());
      localStorage.setItem("chatparva_avatar", selectedAvatar);
    } catch {}
    soundManager.playTempleBell();
    onPlaySolo?.(username.trim(), selectedAvatar);
  };

  const handleExitClick = () => {
    if (onExit) {
      onExit();
    } else {
      setShowExitConfirm(true);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pointerEvents: "none",
        background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.25) 0%, rgba(10, 5, 2, 0.85) 90%)",
        padding: "16px 20px",
        boxSizing: "border-box",
        overflowY: "auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─── Top Bar: Clean Game Header & Server Status ─── */}
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
          padding: "10px 18px",
          background: "rgba(18, 18, 22, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>🎪</span>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#facc15", letterSpacing: "1px" }}>
              CHATPARVA MELA
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
              Dashain &amp; Tihar Cultural Festival
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Server status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(9, 9, 11, 0.75)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              color: "#f8fafc",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: serverStatus === "online" ? "#22c55e" : serverStatus === "connecting" ? "#eab308" : "#ef4444",
                boxShadow: serverStatus === "online" ? "0 0 8px #22c55e" : "none",
              }}
            />
            <span style={{ fontWeight: 700 }}>
              {serverStatus === "online" ? "Online" : serverStatus === "connecting" ? "Connecting..." : "Offline"}
            </span>
            {serverStatus === "online" && (
              <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "2px" }}>
                ({ping > 0 ? `${ping}ms` : "Fast"})
              </span>
            )}
          </div>

          {/* Exit Button */}
          <button
            onClick={handleExitClick}
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              color: "#fca5a5",
              borderRadius: "10px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Exit"
          >
            🚪 Exit
          </button>
        </div>
      </div>

      {/* ─── Main Center Game Lobby Card ─── */}
      <div
        style={{
          pointerEvents: "auto",
          maxWidth: "820px",
          width: "100%",
          margin: "16px auto",
          background: "rgba(18, 18, 22, 0.92)",
          backdropFilter: "blur(18px)",
          border: "1.5px solid rgba(202, 138, 4, 0.5)",
          borderRadius: "20px",
          padding: "24px 28px",
          color: "#f5f5f4",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 900, color: "#fef08a", letterSpacing: "0.5px" }}>
            SELECT YOUR CHARACTER
          </h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
            Pick an avatar and enter your name to play
          </p>
        </div>

        {/* ─── 4 Character Cards (2 Boys, 2 Girls) ─── */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "10px",
            }}
          >
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedAvatar === preset.id;
              const isBoy = preset.gender === "boy";
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedAvatar(preset.id)}
                  style={{
                    backgroundColor: isSelected ? "rgba(185, 28, 28, 0.4)" : "rgba(32, 32, 38, 0.7)",
                    border: isSelected ? "2px solid #facc15" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    padding: "12px",
                    cursor: "pointer",
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected ? "0 6px 20px rgba(250, 204, 21, 0.25)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        backgroundColor: isBoy ? "rgba(37, 99, 235, 0.3)" : "rgba(225, 29, 72, 0.3)",
                        border: isBoy ? "1px solid #3b82f6" : "1px solid #f43f5e",
                        color: isBoy ? "#93c5fd" : "#fbcfe8",
                        padding: "2px 7px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 800,
                      }}
                    >
                      {isBoy ? "Boy" : "Girl"}
                    </span>
                    {isSelected && (
                      <span style={{ color: "#facc15", fontSize: "14px", fontWeight: 900 }}>✓</span>
                    )}
                  </div>

                  <h3 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 800, color: isSelected ? "#fef08a" : "#fff" }}>
                    {preset.name}
                  </h3>
                  <div style={{ fontSize: "11px", color: isSelected ? "#fcd34d" : "#a1a1aa", marginBottom: "8px" }}>
                    {preset.nepaliName}
                  </div>

                  {/* Color dots */}
                  <div style={{ display: "flex", gap: "5px", marginBottom: "6px" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: preset.customization.color,
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                    />
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: preset.customization.vestColor,
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                    />
                    {preset.customization.hasDhakaTopi && (
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: preset.customization.dhakaTopiColor,
                          border: "1px solid rgba(255,255,255,0.4)",
                        }}
                      />
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1", lineHeight: "1.3" }}>
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Username Input Section ─── */}
        <form onSubmit={handlePlayMultiplayer} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 800, color: "#fef08a", letterSpacing: "0.5px" }}>
              PLAYER USERNAME:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                maxLength={16}
                placeholder="Enter player name..."
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: error ? "1.5px solid #ef4444" : "1px solid #ca8a04",
                  backgroundColor: "rgba(9, 9, 11, 0.8)",
                  color: "#f8fafc",
                  fontSize: "14px",
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="button"
                onClick={handleRandomName}
                style={{
                  backgroundColor: "rgba(39, 39, 42, 0.8)",
                  color: "#fef08a",
                  border: "1px solid rgba(254, 240, 138, 0.3)",
                  borderRadius: "10px",
                  padding: "0 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  whiteSpace: "nowrap",
                }}
              >
                🎲 Random
              </button>
            </div>
            {error && (
              <p style={{ margin: "4px 0 0", color: "#f87171", fontSize: "11px", fontWeight: 600 }}>
                {error}
              </p>
            )}
          </div>
        </form>

        {/* ─── Main Game Buttons (Real Game Flow) ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Play Multiplayer Button */}
          <button
            type="button"
            onClick={handlePlayMultiplayer}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #c41e3a 0%, #b91c1c 50%, #991b1b 100%)",
              color: "#ffffff",
              border: "1.5px solid #facc15",
              borderRadius: "14px",
              padding: "14px 24px",
              fontSize: "17px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(196, 30, 58, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              letterSpacing: "0.5px",
            }}
          >
            <span>▶</span>
            <span>PLAY MULTIPLAYER</span>
          </button>

          {/* Secondary Buttons Row */}
          <div style={{ display: "flex", gap: "8px" }}>
            {onPlaySolo && (
              <button
                type="button"
                onClick={handlePlaySolo}
                style={{
                  flex: 1.2,
                  backgroundColor: "rgba(32, 32, 38, 0.85)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>🕹️</span>
                <span>Play Solo (Offline)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenControls}
              style={{
                flex: 1,
                backgroundColor: "rgba(32, 32, 38, 0.85)",
                color: "#cbd5e1",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>🎮</span>
              <span>Controls</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              style={{
                flex: 1,
                backgroundColor: "rgba(32, 32, 38, 0.85)",
                color: "#cbd5e1",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div
        style={{
          maxWidth: "820px",
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          fontSize: "11px",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <span>शुभ विजया दशमी तथा दीपावली २०८३ 🙏</span>
      </div>

      {/* Exit Game Confirmation Dialog */}
      {showExitConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #71717a",
              borderRadius: "16px",
              padding: "24px 28px",
              maxWidth: "380px",
              width: "90%",
              textAlign: "center",
              color: "#f4f4f5",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚪</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#facc15" }}>Exit Chatparva Mela?</h3>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#a1a1aa" }}>
              Thanks for visiting! You can close this tab or return to the game anytime.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  backgroundColor: "#27272a",
                  color: "#e4e4e7",
                  border: "1px solid #52525b",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Back to Game
              </button>
              <button
                onClick={() => {
                  try {
                    window.close();
                  } catch {}
                  window.location.href = "about:blank";
                }}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
