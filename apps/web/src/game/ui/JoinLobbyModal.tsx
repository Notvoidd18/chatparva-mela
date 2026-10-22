import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AVATAR_PRESETS, type AvatarCustomization } from "@melaverse/shared";
import { soundManager } from "../audio/SoundManager.js";
import { CharacterAvatar } from "../player/CharacterAvatar.js";

export interface JoinLobbyModalProps {
  isOpen: boolean;
  initialUsername: string;
  initialAvatarType: "boy1" | "boy2" | "girl1" | "girl2";
  onJoinMultiplayer: (username: string, avatarType: "boy1" | "boy2" | "girl1" | "girl2", serverId?: string) => void;
  onPlaySolo?: (username: string, avatarType: "boy1" | "boy2" | "girl1" | "girl2") => void;
  onOpenSettings?: () => void;
  onOpenControls?: () => void;
  onExit?: () => void;
  serverStatus: "online" | "connecting" | "offline";
  ping?: number;
  serverName?: string;
  isMobileMode?: boolean;
  onToggleMobileMode?: (isMobile: boolean) => void;
  sfxVolume?: number;
  onSfxVolumeChange?: (vol: number) => void;
  musicVolume?: number;
  onMusicVolumeChange?: (vol: number) => void;
  server1Players?: number;
  server2Players?: number;
}

const BOY_NAMES = ["Aayush", "Sagar", "Bhojraj", "Bishnu", "Rohan", "Niraj", "Milan", "Dipesh", "Bikash", "Kiran"];
const GIRL_NAMES = ["Sita", "Prakriti", "Anjali", "Puja", "Rojina", "Samikshya", "Sunita", "Dikshya", "Shristi", "Alisha"];

// ─── 3D Avatar Interactive Preview Component ─────────────────────────────────
const Avatar3DViewer: React.FC<{
  customization: Partial<AvatarCustomization>;
  name: string;
}> = ({ customization, name }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "270px",
        borderRadius: "18px",
        overflow: "hidden",
        background: "radial-gradient(circle at center, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.96) 100%)",
        border: "1.5px solid rgba(250, 204, 21, 0.5)",
        position: "relative",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)",
      }}
    >
      <Canvas camera={{ position: [0, 0.85, 2.5], fov: 42 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 4, 3]} intensity={1.8} />
        <directionalLight position={[-2, 1, -2]} intensity={0.8} color="#38bdf8" />
        <group position={[0, -0.65, 0]}>
          <CharacterAvatar
            displayName={name}
            animState="idle"
            customization={customization}
            isLocalPlayer={false}
          />
        </group>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={2.2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "11px",
          color: "#cbd5e1",
          pointerEvents: "none",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          padding: "3px 10px",
          borderRadius: "12px",
          whiteSpace: "nowrap",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        🔄 Drag or swipe to rotate 3D Avatar
      </div>
    </div>
  );
};

export const JoinLobbyModal: React.FC<JoinLobbyModalProps> = ({
  isOpen,
  initialUsername,
  initialAvatarType = "boy1",
  onJoinMultiplayer,
  onPlaySolo,
  onExit,
  serverStatus,
  ping = 0,
  isMobileMode = false,
  onToggleMobileMode,
  sfxVolume = 0.5,
  onSfxVolumeChange,
  musicVolume = 0.5,
  onMusicVolumeChange,
  server1Players = 1,
  server2Players = 0,
}) => {
  const [activeTab, setActiveTab] = useState<"play" | "avatar" | "settings" | "controls">("play");
  const [username, setUsername] = useState<string>(initialUsername);
  const [selectedAvatar, setSelectedAvatar] = useState<"boy1" | "boy2" | "girl1" | "girl2">(initialAvatarType);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showNameEditModal, setShowNameEditModal] = useState<boolean>(false);

  // Sound & volume states
  const [currentSfxVol, setCurrentSfxVol] = useState<number>(sfxVolume);
  const [currentMusicVol, setCurrentMusicVol] = useState<number>(musicVolume);
  const [mobileModeActive, setMobileModeActive] = useState<boolean>(isMobileMode);

  // Total players counter (stored and incremented)
  const [totalVisited, setTotalVisited] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("chatparva_total_visits");
      if (stored) return parseInt(stored, 10);
      const initial = 18 + Math.floor(Math.random() * 12);
      localStorage.setItem("chatparva_total_visits", String(initial));
      return initial;
    } catch {
      return 24;
    }
  });

  useEffect(() => {
    try {
      const updated = totalVisited + 1;
      localStorage.setItem("chatparva_total_visits", String(updated));
      setTotalVisited(updated);
    } catch {}
  }, []);

  if (!isOpen) return null;

  const currentPreset = AVATAR_PRESETS.find((p) => p.id === selectedAvatar) ?? AVATAR_PRESETS[0];

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

  const handlePlayMultiplayer = (serverId: string = "melaverse-server-1") => {
    const err = validate();
    if (err) {
      setError(err);
      setActiveTab("avatar");
      return;
    }
    try {
      localStorage.setItem("chatparva_username", username.trim());
      localStorage.setItem("chatparva_avatar", selectedAvatar);
    } catch {}
    soundManager.playTempleBell();
    onJoinMultiplayer(username.trim(), selectedAvatar, serverId);
  };

  const handlePlaySolo = () => {
    const err = validate();
    if (err) {
      setError(err);
      setActiveTab("avatar");
      return;
    }
    try {
      localStorage.setItem("chatparva_username", username.trim());
      localStorage.setItem("chatparva_avatar", selectedAvatar);
    } catch {}
    soundManager.playTempleBell();
    onPlaySolo?.(username.trim(), selectedAvatar);
  };

  const handleSfxChange = (val: number) => {
    setCurrentSfxVol(val);
    soundManager.setVolume(val);
    onSfxVolumeChange?.(val);
    if (val > 0) soundManager.playTempleBell();
  };

  const handleMusicChange = (val: number) => {
    setCurrentMusicVol(val);
    soundManager.setMusicVolume(val);
    onMusicVolumeChange?.(val);
  };

  const handleToggleMobile = (val: boolean) => {
    setMobileModeActive(val);
    onToggleMobileMode?.(val);
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
        background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.35) 0%, rgba(10, 5, 2, 0.82) 90%)",
        padding: "16px 20px",
        boxSizing: "border-box",
        overflowY: "auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─── Top Bar: Game Title, Server Health, and Profile Icon ─── */}
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1050px",
          width: "100%",
          margin: "0 auto",
          padding: "10px 18px",
          background: "rgba(18, 18, 22, 0.88)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Left: Game Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "26px" }}>🎪</span>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#facc15", letterSpacing: "1px" }}>
              CHATPARVA MELAVERSE
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
              Dashain &amp; Tihar Cultural Multiplayer Mela
            </div>
          </div>
        </div>

        {/* Right: Server Badge & Interactive Profile Avatar Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Live Server Indicator */}
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
            {serverStatus === "online" && ping > 0 && (
              <span style={{ color: "#94a3b8", fontSize: "11px" }}>({ping}ms)</span>
            )}
          </div>

          {/* Profile Icon (Avatar Head Photo PFP + Username Selector) */}
          <button
            onClick={() => {
              setActiveTab("avatar");
              setShowNameEditModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)",
              border: "1.5px solid #FCD34D",
              borderRadius: "24px",
              padding: "4px 12px 4px 6px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(250, 204, 21, 0.2)",
              transition: "transform 0.15s ease",
            }}
            title="Click to change your Avatar & Username"
          >
            {/* PFP Avatar Head Photo */}
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: currentPreset.customization.color,
                border: "2px solid #FCD34D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
            >
              {currentPreset.gender === "boy" ? "👦" : "👧"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#FEF08A" }}>
                {username || "Set Username"}
              </div>
              <div style={{ fontSize: "9px", color: "#94A3B8" }}>
                {currentPreset.name} (Edit)
              </div>
            </div>
          </button>

          {/* Exit Button */}
          <button
            onClick={() => (onExit ? onExit() : setShowExitConfirm(true))}
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              color: "#fca5a5",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Exit game"
          >
            🚪 Exit
          </button>
        </div>
      </div>

      {/* ─── Center Game Card: Navigation Tabs & Content ─── */}
      <div
        style={{
          pointerEvents: "auto",
          maxWidth: "880px",
          width: "100%",
          margin: "12px auto",
          background: "rgba(18, 18, 24, 0.94)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(202, 138, 4, 0.5)",
          borderRadius: "22px",
          padding: "20px 24px",
          color: "#f5f5f4",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Navigation Tabs (Play, Avatar 3D, Settings, Controls) */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1.5px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "play", label: "🎮 PLAY (खेल्नुहोस्)" },
            { id: "avatar", label: "👤 3D AVATAR (अवतार)" },
            { id: "settings", label: "⚙️ SETTINGS (सेटिङ)" },
            { id: "controls", label: "📖 CONTROLS (नियन्त्रण)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundManager.playTempleBell();
              }}
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg, #B91C1C 0%, #D97706 100%)" : "rgba(30, 41, 59, 0.6)",
                color: activeTab === tab.id ? "#FFF" : "#94A3B8",
                border: activeTab === tab.id ? "1.5px solid #FCD34D" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: activeTab === tab.id ? "0 4px 14px rgba(217, 119, 6, 0.35)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: PLAY ─── */}
        {activeTab === "play" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 900, color: "#FEF08A" }}>
                CHOOSE GAME MODE
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>
                Select Single Player standalone mode or join a live Nepal multiplayer server
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {/* Single Player Card */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.7)",
                  border: "1.5px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "16px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "24px" }}>🎮</span>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFF" }}>
                        Single Player (Solo Mela)
                      </div>
                      <div style={{ fontSize: "11px", color: "#38BDF8" }}>
                        Offline • Zero Lag • Full Attractions
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#CBD5E1", lineHeight: "1.4" }}>
                    Explore the complete 3D Dashain festival at your own pace. Ride the Linge Ping, fly kites, visit puja stalls, and play Langur Burja dice.
                  </p>
                </div>
                <button
                  onClick={handlePlaySolo}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                    color: "#FFF",
                    border: "1.5px solid #38BDF8",
                    borderRadius: "12px",
                    padding: "10px 0",
                    fontSize: "13px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)",
                  }}
                >
                  ✨ Play Single Player
                </button>
              </div>

              {/* Multiplayer Card with Server 1 & Server 2 */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.7)",
                  border: "1.5px solid #FCD34D",
                  borderRadius: "16px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 8px 24px rgba(250, 204, 21, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>🌐</span>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#FEF08A" }}>
                      Multiplayer (Live Melaverse)
                    </div>
                    <div style={{ fontSize: "11px", color: "#4ADE80" }}>
                      Real-Time Sync • Live Yatris
                    </div>
                  </div>
                </div>

                {/* Server 1 Option */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFF" }}>
                      🇳🇵 Server 1: Kathmandu Mela
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                      🟢 Online • 👥 {server1Players} Live Yatri{server1Players === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayMultiplayer("melaverse-server-1")}
                    style={{
                      background: "linear-gradient(135deg, #B91C1C 0%, #D97706 100%)",
                      color: "#FFF",
                      border: "1px solid #FCD34D",
                      borderRadius: "10px",
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🚀 Join
                  </button>
                </div>

                {/* Server 2 Option */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFF" }}>
                      🏔️ Server 2: Pokhara Chautari
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                      🟢 Online • 👥 {server2Players} Live Yatri{server2Players === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayMultiplayer("melaverse-server-2")}
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
                      color: "#FFF",
                      border: "1px solid #34D399",
                      borderRadius: "10px",
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🚀 Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: AVATAR & 3D VIEWER ─── */}
        {activeTab === "avatar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 300px) 1fr", gap: "16px" }}>
              {/* Left Column: 3D Live Avatar Preview */}
              <div>
                <Avatar3DViewer customization={currentPreset.customization} name={username} />
                {/* Username Input and Random Button */}
                <div style={{ marginTop: "12px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    PLAYER USERNAME (खेलाडीको नाम):
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      maxLength={16}
                      placeholder="Enter name..."
                      style={{
                        flex: 1,
                        background: "rgba(15, 23, 42, 0.8)",
                        border: error ? "1.5px solid #EF4444" : "1px solid #64748B",
                        borderRadius: "10px",
                        padding: "8px 12px",
                        color: "#FFF",
                        fontSize: "13px",
                        fontWeight: 700,
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRandomName}
                      style={{
                        background: "rgba(217, 119, 6, 0.25)",
                        border: "1px solid #F59E0B",
                        color: "#FDE047",
                        borderRadius: "10px",
                        padding: "0 10px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      🎲 Random
                    </button>
                  </div>
                  {error && (
                    <div style={{ color: "#F87171", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: 4 Authentic Nepali Character Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#FEF08A" }}>
                  SELECT ATTIRE &amp; PRESET (४ परम्परागत नेपाली अवतारहरू):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatar === preset.id;
                    const isBoy = preset.gender === "boy";
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setSelectedAvatar(preset.id);
                          soundManager.playTempleBell();
                        }}
                        style={{
                          backgroundColor: isSelected ? "rgba(185, 28, 28, 0.35)" : "rgba(32, 32, 38, 0.7)",
                          border: isSelected ? "2px solid #FACC15" : "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "14px",
                          padding: "12px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          transform: isSelected ? "scale(1.02)" : "scale(1)",
                          boxShadow: isSelected ? "0 6px 18px rgba(250, 204, 21, 0.25)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span
                            style={{
                              backgroundColor: isBoy ? "rgba(37, 99, 235, 0.3)" : "rgba(225, 29, 72, 0.3)",
                              border: isBoy ? "1px solid #3B82F6" : "1px solid #F43F5E",
                              color: isBoy ? "#93C5FD" : "#FBCFE8",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              fontSize: "10px",
                              fontWeight: 800,
                            }}
                          >
                            {isBoy ? "👦 Boy" : "👧 Girl"}
                          </span>
                          {isSelected && <span style={{ color: "#FACC15", fontWeight: 900 }}>✓ Selected</span>}
                        </div>
                        <h4 style={{ margin: "2px 0", fontSize: "14px", fontWeight: 800, color: isSelected ? "#FEF08A" : "#FFF" }}>
                          {preset.name}
                        </h4>
                        <div style={{ fontSize: "11px", color: isSelected ? "#FCD34D" : "#94A3B8", marginBottom: "6px" }}>
                          {preset.nepaliName}
                        </div>
                        <p style={{ margin: 0, fontSize: "11px", color: "#CBD5E1", lineHeight: "1.3" }}>
                          {preset.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Direct Launch Buttons from Avatar Tab */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => handlePlayMultiplayer("melaverse-server-1")}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #B91C1C 0%, #D97706 100%)",
                      color: "#FFF",
                      border: "1px solid #FCD34D",
                      borderRadius: "12px",
                      padding: "10px",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🌐 Play Multiplayer
                  </button>
                  <button
                    onClick={handlePlaySolo}
                    style={{
                      flex: 1,
                      background: "rgba(30, 41, 59, 0.8)",
                      color: "#FFF",
                      border: "1px solid #64748B",
                      borderRadius: "12px",
                      padding: "10px",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✨ Play Solo Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: SETTINGS ─── */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 900, color: "#FEF08A" }}>
                GAME SETTINGS &amp; CONTROLS
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>
                Audio levels, mobile/PC platform toggles, and performance settings
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              {/* Audio Controls */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8" }}>
                  🔊 Audio &amp; Sound Effects
                </div>

                {/* SFX Volume */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#CBD5E1", marginBottom: "4px" }}>
                    <span>SFX Volume (ध्वनि स्तर):</span>
                    <span style={{ fontWeight: 700 }}>{Math.round(currentSfxVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentSfxVol}
                    onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: "#F59E0B", cursor: "pointer" }}
                  />
                </div>

                {/* Music Volume */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#CBD5E1", marginBottom: "4px" }}>
                    <span>Festival Music (चाडपर्व संगीत):</span>
                    <span style={{ fontWeight: 700 }}>{Math.round(currentMusicVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentMusicVol}
                    onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: "#F59E0B", cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* Special Platform Option: Mobile or PC */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1.5px solid #FCD34D",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#FEF08A" }}>
                  📱 Special Platform Mode (PC / Mobile)
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: "#CBD5E1", lineHeight: "1.4" }}>
                  Choose your control layout. Mobile mode activates the on-screen joystick, jump button, and Roblox-style camera rotation buttons.
                </p>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleMobile(false)}
                    style={{
                      flex: 1,
                      background: !mobileModeActive ? "#0284C7" : "rgba(15, 23, 42, 0.8)",
                      color: "#FFF",
                      border: !mobileModeActive ? "1.5px solid #38BDF8" : "1px solid #475569",
                      borderRadius: "10px",
                      padding: "8px 0",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    💻 PC Keyboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMobile(true)}
                    style={{
                      flex: 1,
                      background: mobileModeActive ? "#D97706" : "rgba(15, 23, 42, 0.8)",
                      color: "#FFF",
                      border: mobileModeActive ? "1.5px solid #FCD34D" : "1px solid #475569",
                      borderRadius: "10px",
                      padding: "8px 0",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    📱 Mobile Touch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: CONTROLS ─── */}
        {activeTab === "controls" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 900, color: "#FEF08A" }}>
                HOW TO PLAY (खेल नियन्त्रणहरू)
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
              <div style={{ background: "rgba(30, 41, 59, 0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontWeight: 800, color: "#38BDF8", fontSize: "13px", marginBottom: "4px" }}>
                  💻 PC Controls
                </div>
                <div style={{ fontSize: "11px", color: "#E2E8F0", lineHeight: "1.7" }}>
                  • <strong>[W][A][S][D]</strong>: Walk &amp; Steer<br />
                  • <strong>[Space]</strong>: Jump / Swing Pump / Dance Clap<br />
                  • <strong>[E]</strong>: Interact (Ride swing, sit, talk to stalls)<br />
                  • <strong>[I]</strong>: Inventory Backpack<br />
                  • <strong>[Mouse Drag]</strong>: Orbit Camera Look
                </div>
              </div>

              <div style={{ background: "rgba(30, 41, 59, 0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontWeight: 800, color: "#FBBF24", fontSize: "13px", marginBottom: "4px" }}>
                  📱 Mobile Controls (Roblox Style)
                </div>
                <div style={{ fontSize: "11px", color: "#E2E8F0", lineHeight: "1.7" }}>
                  • <strong>Virtual Joystick (Bottom Left)</strong>: Move player<br />
                  • <strong>🦘 Jump Button</strong>: Jump obstacles<br />
                  • <strong>⚡ [E] Button</strong>: Ride Ping, sit &amp; celebrate<br />
                  • <strong>🔄 Rotate Buttons [◀] [▶]</strong>: Pan &amp; turn camera<br />
                  • <strong>Screen Drag</strong>: Free look camera rotation
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Footer: Version Update & Total Players Visited Counter ─── */}
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1050px",
          width: "100%",
          margin: "0 auto",
          padding: "4px 10px",
          boxSizing: "border-box",
        }}
      >
        {/* Bottom Left: Dynamic Update Version Tag */}
        <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
          <span style={{ color: "#38BDF8", fontWeight: 800 }}>Update:</span> v0.2.3 • Git Push Engine • Dashain-Tihar Edition
        </div>

        {/* Bottom Right: Total Players Visited Counter */}
        <div
          style={{
            background: "rgba(18, 18, 22, 0.85)",
            border: "1px solid rgba(250, 204, 21, 0.4)",
            borderRadius: "14px",
            padding: "4px 12px",
            fontSize: "11px",
            color: "#FEF08A",
            fontWeight: 800,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          👥 {totalVisited}+ Yatris Have Played Chatparva Mela
        </div>
      </div>
    </div>
  );
};
