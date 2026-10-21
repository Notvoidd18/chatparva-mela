import React from "react";
import { soundManager } from "../audio/SoundManager.js";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphicsQuality: "low" | "medium" | "high";
  onGraphicsQualityChange: (q: "low" | "medium" | "high") => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  showMobileControls: boolean;
  onToggleMobileControls: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  graphicsQuality,
  onGraphicsQualityChange,
  isAudioMuted,
  onToggleAudio,
  showMobileControls,
  onToggleMobileControls,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#1e293b",
          border: "2px solid #e2e8f0",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "480px",
          padding: "24px",
          color: "#f8fafc",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚙️ MelaVerse Settings
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Graphics Quality */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#cbd5e1", marginBottom: "8px" }}>
            Graphics Quality
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["low", "medium", "high"] as const).map((q) => (
              <button
                key={q}
                onClick={() => onGraphicsQualityChange(q)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: graphicsQuality === q ? "2px solid #38bdf8" : "1px solid #475569",
                  backgroundColor: graphicsQuality === q ? "#0369a1" : "#0f172a",
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: "12px",
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Mute */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "8px 0", borderTop: "1px solid #334155" }}>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>Festival SFX & Audio</span>
          <button
            onClick={onToggleAudio}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: isAudioMuted ? "#475569" : "#059669",
              color: "#FFF",
              border: "none",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {isAudioMuted ? "🔇 Muted" : "🔊 Enabled"}
          </button>
        </div>

        {/* Mobile Touch Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "8px 0", borderTop: "1px solid #334155" }}>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>Mobile Touch Joystick</span>
          <button
            onClick={onToggleMobileControls}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: showMobileControls ? "#059669" : "#475569",
              color: "#FFF",
              border: "none",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {showMobileControls ? "📱 On Screen" : "Hidden"}
          </button>
        </div>

        {/* Controls Reference */}
        <div style={{ backgroundColor: "#0f172a", borderRadius: "10px", padding: "12px", fontSize: "12px", color: "#94a3b8" }}>
          <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>🎮 Keyboard & Mouse Controls:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
            <div><strong style={{ color: "#e2e8f0" }}>W A S D / Arrows:</strong> Walk</div>
            <div><strong style={{ color: "#e2e8f0" }}>Shift:</strong> Sprint</div>
            <div><strong style={{ color: "#e2e8f0" }}>Space:</strong> Jump / Pump Swing</div>
            <div><strong style={{ color: "#e2e8f0" }}>E:</strong> Interact (Attractions)</div>
            <div><strong style={{ color: "#e2e8f0" }}>Mouse Drag:</strong> Orbit Camera</div>
            <div><strong style={{ color: "#e2e8f0" }}>Mouse Wheel:</strong> Zoom In/Out</div>
          </div>
        </div>
      </div>
    </div>
  );
};
