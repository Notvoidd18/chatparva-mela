import React, { useState } from "react";
import { soundManager } from "../audio/SoundManager.js";

interface UsernameModalProps {
  isOpen: boolean;
  initialName: string;
  onConfirm: (name: string) => void;
  isFirstTime?: boolean;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({
  isOpen,
  initialName,
  onConfirm,
  isFirstTime = true,
}) => {
  const [name, setName] = useState<string>(initialName);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (trimmed.length > 16) {
      setError("Username must be 16 characters or less.");
      return;
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
      setError("Username can only contain letters, numbers, hyphens, and spaces.");
      return;
    }

    const reserved = ["system", "admin", "moderator", "staff", "server", "mela", "chatparva"];
    if (reserved.includes(trimmed.toLowerCase())) {
      setError("This username is reserved. Please pick another festive name!");
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem("chatparva_username", trimmed);
    } catch {}

    soundManager.playTempleBell();
    onConfirm(trimmed);
  };

  const handleQuickName = (prefix: string) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generated = `${prefix}${randomSuffix}`;
    setName(generated);
    setError(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 5, 2, 0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#1c1917",
          border: "3px solid #ca8a04",
          borderRadius: "24px",
          width: "90%",
          maxWidth: "460px",
          padding: "28px",
          color: "#f5f5f4",
          boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🙏</div>
        <h2 style={{ margin: "0 0 6px", fontSize: "24px", color: "#facc15" }}>
          {isFirstTime ? "Welcome to Chatparva Mela!" : "Change Display Name"}
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#a8a29e" }}>
          मेला प्रवेशको लागि आफ्नो नाम रोज्नुहोस् (Enter your name for the festival)
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#fef08a", fontWeight: 700, marginBottom: "6px" }}>
              Your Festival Name (३ देखि १६ अक्षर):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Biraj, Aarav, Anusha"
              maxLength={16}
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 700,
                backgroundColor: "#292524",
                border: error ? "2px solid #ef4444" : "2px solid #78350f",
                borderRadius: "12px",
                color: "#ffffff",
                outline: "none",
              }}
            />
            {error && (
              <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Quick festive suggestions */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: "#a8a29e", marginBottom: "6px" }}>Quick Festive Presets:</div>
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
              {["Yatri", "Gorkhali", "Himali", "Shrestha", "Tamang"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickName(preset)}
                  style={{
                    backgroundColor: "#292524",
                    border: "1px solid #78716c",
                    color: "#fde047",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#c41e3a",
              color: "#ffffff",
              border: "2px solid #ffd700",
              borderRadius: "14px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(196,30,58,0.5)",
              letterSpacing: "0.5px",
            }}
          >
            {isFirstTime ? "🎪 Enter Festival Grounds (मेला प्रवेश)" : "Save Name"}
          </button>
        </form>

        <p style={{ margin: "14px 0 0", fontSize: "10px", color: "#78716c" }}>
          Locally saved display name • Case-insensitive uniqueness enforced by server
        </p>
      </div>
    </div>
  );
};