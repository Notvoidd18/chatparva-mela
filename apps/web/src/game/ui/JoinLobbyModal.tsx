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
  serverStatus,
  ping = 0,
  serverName = "🇳🇵 Kathmandu Mela (Server 1)",
}) => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [selectedAvatar, setSelectedAvatar] = useState<"boy1" | "boy2" | "girl1" | "girl2">(initialAvatarType);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRandomName = () => {
    const isGirl = selectedAvatar === "girl1" || selectedAvatar === "girl2";
    const list = isGirl ? GIRL_NAMES : BOY_NAMES;
    const name = list[Math.floor(Math.random() * list.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setUsername(`${name}-${num}`);
    setError(null);
    soundManager.playMadalBeat("high");
  };

  const validate = (): string | null => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      return "Username must be at least 3 characters long.";
    }
    if (trimmed.length > 16) {
      return "Username must be 16 characters or less.";
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
      return "Username can only contain letters, numbers, hyphens, and spaces.";
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
        background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.35) 0%, rgba(10, 5, 2, 0.82) 85%)",
        padding: "16px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      {/* ─── Top Header Bar: Festival Branding & Server Status ─── */}
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1050px",
          width: "100%",
          margin: "0 auto",
          padding: "8px 16px",
          background: "rgba(24, 24, 27, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(254, 240, 138, 0.2)",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>🎪</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#facc15", letterSpacing: "0.5px" }}>
              चटपर्व मेला (Chatparva Mela)
            </h1>
            <p style={{ margin: 0, fontSize: "11px", color: "#e2e8f0" }}>
              Dashain &amp; Tihar Cultural 3D Multiplayer Metaverse
            </p>
          </div>
        </div>

        {/* Server Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(9, 9, 11, 0.65)",
              border: "1px solid rgba(255,255,255,0.15)",
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
            <span style={{ fontWeight: 600 }}>
              {serverStatus === "online" ? "Server Online" : serverStatus === "connecting" ? "Connecting..." : "Offline"}
            </span>
            {serverStatus === "online" && (
              <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "4px" }}>
                • {ping > 0 ? `${ping}ms` : "Fast"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Center Card: Lobby Joining Hub ─── */}
      <div
        style={{
          pointerEvents: "auto",
          maxWidth: "880px",
          width: "100%",
          margin: "16px auto",
          background: "rgba(24, 24, 27, 0.88)",
          backdropFilter: "blur(16px)",
          border: "2px solid #ca8a04",
          borderRadius: "24px",
          padding: "24px 28px",
          color: "#f5f5f4",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ display: "inline-block", backgroundColor: "rgba(202, 138, 4, 0.15)", border: "1px solid #ca8a04", color: "#fef08a", padding: "4px 14px", borderRadius: "12px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            ✨ Choose Your Festive Avatar
          </span>
          <h2 style={{ margin: "4px 0", fontSize: "24px", fontWeight: 900, color: "#fef08a" }}>
            मेला प्रवेश (Join Festival World)
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>
            Select your Yatri identity and step into the 3D Dashain &amp; Tihar Mela
          </p>
        </div>

        {/* ─── 4 Avatar Types Selector (2 Boys, 2 Girls) ─── */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#fef08a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Avatars (४ प्रकारका नेपाली पहिरन):
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedAvatar === preset.id;
              const isBoy = preset.gender === "boy";
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedAvatar(preset.id);
                    soundManager.playMadalBeat("high");
                  }}
                  style={{
                    backgroundColor: isSelected ? "rgba(185, 28, 28, 0.35)" : "rgba(39, 39, 42, 0.65)",
                    border: isSelected ? "2.5px solid #facc15" : "1.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected ? "0 8px 24px rgba(250, 204, 21, 0.3)" : "none",
                    position: "relative",
                  }}
                >
                  {/* Category Pill */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span
                      style={{
                        backgroundColor: isBoy ? "rgba(37, 99, 235, 0.3)" : "rgba(225, 29, 72, 0.3)",
                        border: isBoy ? "1px solid #3b82f6" : "1px solid #f43f5e",
                        color: isBoy ? "#93c5fd" : "#fbcfe8",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: 800,
                      }}
                    >
                      {isBoy ? (preset.id === "boy1" ? "👦 Boy 1" : "👦 Boy 2") : (preset.id === "girl1" ? "👧 Girl 1" : "👧 Girl 2")}
                    </span>

                    {isSelected && (
                      <span
                        style={{
                          backgroundColor: "#facc15",
                          color: "#18181b",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Avatar Name */}
                  <h3 style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 800, color: isSelected ? "#fef08a" : "#ffffff" }}>
                    {preset.name}
                  </h3>
                  <div style={{ fontSize: "11px", color: isSelected ? "#fcd34d" : "#a1a1aa", fontWeight: 600, marginBottom: "8px" }}>
                    {preset.nepaliName}
                  </div>

                  {/* Cultural Color Swatches */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: preset.customization.color,
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                      title="Main Dress"
                    />
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: preset.customization.vestColor,
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                      title="Vest / Dupatta"
                    />
                    {preset.customization.hasDhakaTopi && (
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: preset.customization.dhakaTopiColor,
                          border: "1px solid rgba(255,255,255,0.4)",
                        }}
                        title="Dhaka Topi"
                      />
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ margin: 0, fontSize: "11px", color: "#d4d4d8", lineHeight: "1.35" }}>
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
            <label style={{ fontSize: "12px", fontWeight: 800, color: "#fef08a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Username (आफ्नो नाम):
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "16px",
                  }}
                >
                  👤
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  maxLength={16}
                  placeholder="Enter your Yatri name..."
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "12px",
                    border: error ? "2px solid #ef4444" : "1.5px solid #ca8a04",
                    backgroundColor: "rgba(9, 9, 11, 0.75)",
                    color: "#f8fafc",
                    fontSize: "15px",
                    fontWeight: 700,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Random Name Generator */}
              <button
                type="button"
                onClick={handleRandomName}
                style={{
                  backgroundColor: "rgba(63, 63, 70, 0.75)",
                  color: "#fef08a",
                  border: "1px solid rgba(254, 240, 138, 0.3)",
                  borderRadius: "12px",
                  padding: "0 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
                title="Generate Random Nepali Name"
              >
                🎲 Random Name
              </button>
            </div>
            {error && (
              <p style={{ margin: "4px 0 0", color: "#f87171", fontSize: "12px", fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            )}
          </div>
        </form>

        {/* ─── Action Buttons: Play Multiplayer, Settings, Controls ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Main Play Multiplayer Button */}
          <button
            type="button"
            onClick={handlePlayMultiplayer}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #c41e3a 0%, #b91c1c 50%, #991b1b 100%)",
              color: "#ffffff",
              border: "2px solid #facc15",
              borderRadius: "16px",
              padding: "15px 24px",
              fontSize: "18px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(196, 30, 58, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span>🎮</span>
            <span>PLAY MULTIPLAYER (मेला प्रवेश)</span>
          </button>

          {/* Secondary Action Row: Settings & Controls */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={onOpenControls}
              style={{
                flex: 1,
                backgroundColor: "rgba(39, 39, 42, 0.8)",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>📖</span>
              <span>Controls</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              style={{
                flex: 1,
                backgroundColor: "rgba(39, 39, 42, 0.8)",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            {onPlaySolo && (
              <button
                type="button"
                onClick={handlePlaySolo}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span>🕹️</span>
                <span>Play Solo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Status Hint ─── */}
      <div
        style={{
          maxWidth: "880px",
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
          fontSize: "11px",
          color: "rgba(255,255,255,0.6)",
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        <span>🌸 शुभ विजया दशमी तथा दीपावलीको पावन अवसरमा सम्पूर्ण नेपालीमा हार्दिक मङ्गलमय शुभकामना!</span>
      </div>
    </div>
  );
};
