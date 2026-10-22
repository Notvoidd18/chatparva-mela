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

// ─── Custom Vector SVG Icons (No Emojis) ─────────────────────────────────────
const MelaPagodaLogo: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crossed Kites in background */}
    <g opacity="0.85">
      {/* Left Kite */}
      <path d="M10 18L18 10L26 18L18 26Z" fill="#EF4444" stroke="#FEF08A" strokeWidth="1.2" transform="rotate(-18 18 18)" />
      <path d="M12 18L24 18M18 12L18 24" stroke="#FFF" strokeWidth="0.8" opacity="0.6" transform="rotate(-18 18 18)" />
      {/* Right Kite */}
      <path d="M22 18L30 10L38 18L30 26Z" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.2" transform="rotate(18 30 18)" />
      <path d="M24 18L36 18M30 12L30 24" stroke="#FFF" strokeWidth="0.8" opacity="0.6" transform="rotate(18 30 18)" />
    </g>
    {/* Pagoda Base Mound */}
    <path d="M6 44H42L38 38H10L6 44Z" fill="#78350F" stroke="#FDE047" strokeWidth="1" />
    {/* Pagoda Lower Tier */}
    <path d="M11 38H37L34 30H14L11 38Z" fill="#B91C1C" stroke="#FCD34D" strokeWidth="1" />
    <path d="M8 30H40L36 24H12L8 30Z" fill="#991B1B" stroke="#FEF08A" strokeWidth="1.2" />
    {/* Pagoda Upper Tier */}
    <path d="M14 24H34L31 17H17L14 24Z" fill="#B91C1C" stroke="#FCD34D" strokeWidth="1" />
    <path d="M12 17H36L31 12H17L12 17Z" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.2" />
    {/* Golden Gajur Pinnacle */}
    <path d="M24 4L22 12H26L24 4Z" fill="#FACC15" stroke="#FEF08A" strokeWidth="1" />
    <circle cx="24" cy="4" r="2" fill="#FEF08A" />
    {/* Bell hanging under roof */}
    <path d="M24 30V33M23 33H25" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconGamepad: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <rect x="2" y="6" width="20" height="12" rx="6" />
  </svg>
);

const IconAvatar: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconSettings: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconBook: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconGlobe: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconExit: React.FC<{ size?: number; color?: string }> = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconDice: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8" cy="8" r="1.5" fill={color} />
    <circle cx="16" cy="8" r="1.5" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <circle cx="8" cy="16" r="1.5" fill={color} />
    <circle cx="16" cy="16" r="1.5" fill={color} />
  </svg>
);

const IconScroll: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const IconSpeaker: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const IconPC: React.FC<{ size?: number; color?: string }> = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const IconMobile: React.FC<{ size?: number; color?: string }> = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
  </svg>
);

const IconUsers: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

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
        Drag or swipe to rotate 3D Avatar
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
  const [showChangelog, setShowChangelog] = useState<boolean>(false);

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
        background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(10, 5, 2, 0.88) 90%)",
        padding: "16px 20px",
        boxSizing: "border-box",
        overflowY: "auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─── Top Bar: Brand Logo, Server Health, and Profile Icon ─── */}
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
          background: "rgba(18, 18, 22, 0.9)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Left: Custom SVG Site Logo & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MelaPagodaLogo size={42} />
          <div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: "#facc15", letterSpacing: "1px", lineHeight: "1.2" }}>
              CHATPARVA MELAVERSE
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
              चाडपर्व मेला • Dashain &amp; Tihar Cultural 3D
            </div>
          </div>
        </div>

        {/* Right: Server Badge, Profile Avatar Badge & Exit */}
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
            onClick={() => setActiveTab("avatar")}
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
            title="Click to customize Avatar & Username"
          >
            {/* PFP Avatar Badge */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: currentPreset.customization.color,
                border: "2px solid #FCD34D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
            >
              <IconAvatar size={16} color="#FFF" />
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
              gap: "6px",
            }}
            title="Exit game"
          >
            <IconExit size={14} color="#fca5a5" />
            Exit
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
            { id: "play", label: "PLAY (खेल्नुहोस्)", icon: <IconGamepad size={16} /> },
            { id: "avatar", label: "3D AVATAR (अवतार)", icon: <IconAvatar size={16} /> },
            { id: "settings", label: "SETTINGS (सेटिङ)", icon: <IconSettings size={16} /> },
            { id: "controls", label: "CONTROLS (नियन्त्रण)", icon: <IconBook size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundManager.playTempleBell();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
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
              {tab.icon}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div style={{ background: "rgba(56, 189, 248, 0.2)", padding: "8px", borderRadius: "10px", border: "1px solid rgba(56, 189, 248, 0.4)" }}>
                      <IconGamepad size={22} color="#38BDF8" />
                    </div>
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
                    Explore the complete 3D Dashain festival at your own pace. Ride the Linge Ping, climb the temple hill, visit puja stalls, and play Langur Burja dice.
                  </p>
                </div>
                <button
                  onClick={handlePlaySolo}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
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
                  <IconGamepad size={16} />
                  Play Single Player
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(250, 204, 21, 0.2)", padding: "8px", borderRadius: "10px", border: "1px solid rgba(250, 204, 21, 0.4)" }}>
                    <IconGlobe size={22} color="#FACC15" />
                  </div>
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
                      Server 1: Kathmandu Mela
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                      Online • {server1Players} Live Yatri{server1Players === 1 ? "" : "s"}
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
                    Join
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
                      Server 2: Pokhara Chautari
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                      Online • {server2Players} Live Yatri{server2Players === 1 ? "" : "s"}
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
                    Join
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
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
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
                      <IconDice size={13} color="#FDE047" />
                      Random
                    </button>
                  </div>
                  {error && (
                    <div style={{ color: "#F87171", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>
                      {error}
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
                            {isBoy ? "Boy (केटा)" : "Girl (केटी)"}
                          </span>
                          {isSelected && <span style={{ color: "#FACC15", fontWeight: 900, fontSize: "11px" }}>✓ Selected</span>}
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
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
                    <IconGlobe size={15} />
                    Play Multiplayer
                  </button>
                  <button
                    onClick={handlePlaySolo}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
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
                    <IconGamepad size={15} />
                    Play Solo Mode
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 800, color: "#38BDF8" }}>
                  <IconSpeaker size={18} color="#38BDF8" />
                  Audio &amp; Sound Effects
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 800, color: "#FEF08A" }}>
                  <IconMobile size={18} color="#FEF08A" />
                  Special Platform Mode (PC / Mobile)
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
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
                    <IconPC size={15} />
                    PC Keyboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMobile(true)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
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
                    <IconMobile size={15} />
                    Mobile Touch
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, color: "#38BDF8", fontSize: "13px", marginBottom: "4px" }}>
                  <IconPC size={15} color="#38BDF8" />
                  PC Controls
                </div>
                <div style={{ fontSize: "11px", color: "#E2E8F0", lineHeight: "1.7" }}>
                  • <strong>[W][A][S][D]</strong>: Walk &amp; Steer<br />
                  • <strong>[Space]</strong>: Jump / Swing Pump / Dance Clap<br />
                  • <strong>[E]</strong>: Interact (Ride swing, sit on mat, talk to stalls)<br />
                  • <strong>[0-9]</strong>: Dynamic Hotbar Slot Selection<br />
                  • <strong>[Mouse Drag]</strong>: Orbit Camera Look
                </div>
              </div>

              <div style={{ background: "rgba(30, 41, 59, 0.6)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, color: "#FBBF24", fontSize: "13px", marginBottom: "4px" }}>
                  <IconMobile size={15} color="#FBBF24" />
                  Mobile Controls (Roblox Style)
                </div>
                <div style={{ fontSize: "11px", color: "#E2E8F0", lineHeight: "1.7" }}>
                  • <strong>Virtual Joystick (Bottom Left)</strong>: Move player<br />
                  • <strong>Jump Button</strong>: Jump obstacles &amp; climb steps<br />
                  • <strong>[E] Button</strong>: Ride Ping, sit on sukul &amp; celebrate<br />
                  • <strong>Rotate Buttons [◀] [▶]</strong>: Pan &amp; turn camera<br />
                  • <strong>Screen Drag</strong>: Free look touch camera rotation
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Footer: Version Update, Changelog Button, and Players Visited Counter ─── */}
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
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* Bottom Left: Dynamic Update Version Tag & Changelog Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
            <span style={{ color: "#38BDF8", fontWeight: 800 }}>Update:</span> v0.2.5 • Expanded World &amp; Dance Circles
          </div>
          <button
            onClick={() => setShowChangelog(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid #38BDF8",
              color: "#38BDF8",
              borderRadius: "8px",
              padding: "2px 8px",
              fontSize: "10px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <IconScroll size={12} color="#38BDF8" />
            Changelog
          </button>
        </div>

        {/* Bottom Right: Total Players Visited Counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
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
          <IconUsers size={13} color="#FEF08A" />
          <span>{totalVisited}+ Yatris Have Played Chatparva Mela</span>
        </div>
      </div>

      {/* ─── Changelog Modal Popup ─── */}
      {showChangelog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            padding: "16px",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "rgba(24, 24, 30, 0.98)",
              border: "1.5px solid #FCD34D",
              borderRadius: "20px",
              padding: "22px 26px",
              color: "#F8FAFC",
              boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <IconScroll size={22} color="#FACC15" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#FEF08A" }}>
                  Chatparva Mela Changelog
                </h3>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "#FFF",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Version 0.2.5 */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#4ADE80" }}>
                  v0.2.5 — Expanded World, 3 Dance Spots &amp; Cultural Beats (Current)
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>October 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#CBD5E1", lineHeight: "1.6" }}>
                <li><strong>Expanded Festival World (240m x 240m):</strong> Wide open exploration with distant structures, winding cobblestone streets, and removed tight invisible fences.</li>
                <li><strong>Rangoli Hill Clearance:</strong> Relocated Durga Mandir hill to z = -75 with grand ceremonial stairs, keeping the sacred Tihar Rangoli completely flat and unobstructed.</li>
                <li><strong>3 Dedicated Dance Circles:</strong> Added 3 sacred dance rings across the map (Aama Samuha, Deusi Bhailo, Mandir Hill) with automatic Aama Bhailo folk song and synchronized dancing.</li>
                <li><strong>Cultural Sit-and-Stand Dance Step:</strong> Authentic Nepali folk dance choreo where avatars sway, gracefully sit/kneel, rise, and spin 360 degrees.</li>
                <li><strong>Madal Player &amp; 5 Dancers on Stage:</strong> Added Kancha Dai playing a 3D Madal with rhythmic beat + Bikram Bhai flute player + 5 dancing aunties.</li>
                <li><strong>Individual Gundri Seating:</strong> 8 distinct ground mats so real players sit in separate spots instead of overlapping.</li>
                <li><strong>Multiplayer Kite Synchronization:</strong> Soaring Dashain Changa kite rendered high in the sky with string visible across all multiplayer clients.</li>
                <li><strong>Live Working FPS Counter:</strong> Real-time frame rate metric on the HUD.</li>
                <li><strong>Tab Favicon &amp; Hover Effects:</strong> Custom SVG temple/kite favicon on browser tab and tactile button micro-animations.</li>
              </ul>
            </div>

            {/* Version 0.2.4 */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8" }}>
                  v0.2.4 — Cultural &amp; Physics Elevation Update
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>October 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#CBD5E1", lineHeight: "1.6" }}>
                <li><strong>Terraced Hill &amp; Step Elevation:</strong> Mandir temple elevated onto a +2.5m terrace with 6 ceremonial stone steps.</li>
                <li><strong>Structure Collision Mesh:</strong> AABB bounding colliders around Mandir, Chautari trees, and stalls to prevent clipping.</li>
                <li><strong>Aama Samuha Exclusivity:</strong> Center stage reserved for dancing aunties (Radhika Didi, Sita Didi, Parvati Aama); all ground mats (सुकुल/गुन्द्री) reserved for real players.</li>
                <li><strong>Acoustic Sound Synthesizers:</strong> Physically synthesized bronze bell with 4 harmonics, dual-tone Madal drum, and wooden swing creak.</li>
                <li><strong>Dynamic Minecraft Hotbar:</strong> Only displays items in inventory; Slot 0 defaults to "Empty Hands" (खाली हात).</li>
                <li><strong>Device Badges:</strong> Mobile vs PC indicator badge displayed above player avatars.</li>
                <li><strong>Anti-Selection Safeguards:</strong> Prevented text selection &amp; Ctrl+A highlights across 3D canvas while preserving input typing.</li>
                <li><strong>Day/Night Lighting Boost:</strong> Daytime ambient boosted to eliminate darkness and shader lag.</li>
              </ul>
            </div>

            {/* Version 0.2.3 */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8" }}>
                  v0.2.3 — Mobile Controls &amp; Latency Sync
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>October 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#CBD5E1", lineHeight: "1.6" }}>
                <li>Added Roblox-style mobile virtual joystick, jump button, and camera orbit turn buttons.</li>
                <li>Added real-time ping diagnostic and heartbeat synchronization.</li>
              </ul>
            </div>

            {/* Version 0.2.2 */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#FCD34D" }}>
                  v0.2.2 — Multi-Server Selection &amp; 3D Lobby Viewer
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>October 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#CBD5E1", lineHeight: "1.6" }}>
                <li>Live server selection for Server 1 (Kathmandu Mela) and Server 2 (Pokhara Chautari).</li>
                <li>Real-time 3D interactive avatar viewer in lobby before joining world.</li>
              </ul>
            </div>

            {/* Version 0.2.0 - 0.2.1 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#A78BFA" }}>
                  v0.2.0 – v0.2.1 — Monorepo &amp; Multiplayer Protocol
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>October 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#CBD5E1", lineHeight: "1.6" }}>
                <li>Colyseus room state synchronization with Colyseus v0.15 SchemaSerializer fix.</li>
                <li>4 Traditional Nepali avatar models (Daura Suruwal, Dhaka Topi, Gunyo Cholo).</li>
              </ul>
            </div>

            <button
              onClick={() => setShowChangelog(false)}
              style={{
                width: "100%",
                marginTop: "16px",
                background: "linear-gradient(135deg, #B91C1C 0%, #D97706 100%)",
                color: "#FFF",
                border: "1px solid #FCD34D",
                borderRadius: "12px",
                padding: "10px 0",
                fontSize: "13px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Close Changelog
            </button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            padding: "16px",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "380px",
              width: "100%",
              background: "rgba(24, 24, 30, 0.98)",
              border: "1.5px solid #EF4444",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              color: "#FFF",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#FCA5A5", fontSize: "16px", fontWeight: 800 }}>
              Exit Chatparva Mela?
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#CBD5E1" }}>
              Are you sure you want to close this session?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  background: "rgba(30, 41, 59, 0.8)",
                  border: "1px solid #64748B",
                  color: "#FFF",
                  borderRadius: "10px",
                  padding: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                style={{
                  flex: 1,
                  background: "#DC2626",
                  border: "1px solid #EF4444",
                  color: "#FFF",
                  borderRadius: "10px",
                  padding: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
