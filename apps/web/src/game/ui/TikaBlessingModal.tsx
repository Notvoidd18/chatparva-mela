import React from "react";
import { soundManager } from "../audio/SoundManager.js";

interface TikaBlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  elderName: string;
  hasClaimedReward: boolean;
  onClaimBlessing: () => void;
  npr: number;
}

export const TikaBlessingModal: React.FC<TikaBlessingModalProps> = ({
  isOpen,
  onClose,
  houseName,
  elderName,
  hasClaimedReward,
  onClaimBlessing,
  npr,
}) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    soundManager.playTempleBell();
    onClaimBlessing();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#1c1917",
          border: "3px solid #b91c1c",
          borderRadius: "20px",
          width: "92%",
          maxWidth: "520px",
          padding: "24px",
          color: "#f5f5f4",
          boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
          textAlign: "center",
        }}
      >
        {/* Brass Puja Thali Header */}
        <div style={{ fontSize: "44px", marginBottom: "6px" }}>🌺</div>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#facc15" }}>
          {houseName}
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#a8a29e" }}>
          Dashain Elder Blessing &amp; Dakshina • {elderName}
        </p>

        {/* Traditional Blessing Verse Card */}
        <div
          style={{
            backgroundColor: "#292524",
            border: "1px solid #78350f",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "18px",
            textAlign: "left",
          }}
        >
          <div style={{ fontStyle: "italic", color: "#fde047", fontSize: "13px", lineHeight: "1.6", marginBottom: "8px" }}>
            "आयुर्द्रोणसुते श्रियो दशरथे शत्रुक्षयो राघवे, ऐश्वर्यं नहुषे गतिश्च पवने मानञ्च वैकुण्ठपे..."
          </div>
          <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.5" }}>
            May Goddess Durga bestow upon you strength, wisdom, good health, and prosperity.
            May this Dashain bring boundless happiness to your life!
          </div>
        </div>

        {/* Reward Status Banner */}
        {hasClaimedReward ? (
          <div
            style={{
              backgroundColor: "rgba(22, 101, 52, 0.4)",
              border: "1px solid #22c55e",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "18px",
              fontSize: "12px",
              color: "#86efac",
            }}
          >
            ✓ तपाईंले यस वर्षको आशिर्वाद र रू ५० दक्षिणा प्राप्त गरिसक्नुभयो।
            <div style={{ color: "#e2e8f0", fontSize: "11px", marginTop: "4px" }}>
              (Blessing &amp; NPR 50 Dakshina already received this season. The elder wishes you continued happiness!)
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "rgba(180, 83, 9, 0.35)",
              border: "1px solid #f59e0b",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "18px",
              fontSize: "13px",
              color: "#fef08a",
              fontWeight: 700,
            }}
          >
            🎁 One-Time Festival Blessing Reward:
            <div style={{ color: "#38bdf8", fontSize: "12px", marginTop: "2px" }}>
              • Crimson Tika &amp; Sacred Jamara on your avatar
            </div>
            <div style={{ color: "#4ade80", fontSize: "12px" }}>
              • +रू ५० (NPR 50) Traditional Dakshina Currency
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {!hasClaimedReward ? (
            <button
              onClick={handleClaim}
              style={{
                backgroundColor: "#b91c1c",
                color: "#fff",
                border: "2px solid #facc15",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(185,28,28,0.5)",
              }}
            >
              🌸 Take Tika, Jamara &amp; Dakshina (आशिर्वाद लिनुहोस्)
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#15803d",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 24px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              धन्यवाद (Thank You, Aama) 🙏
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              backgroundColor: "#292524",
              color: "#a8a29e",
              border: "1px solid #44403c",
              borderRadius: "12px",
              padding: "10px 18px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};