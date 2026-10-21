import React, { useEffect, useState } from "react";
import { soundManager } from "../audio/SoundManager.js";

interface DanPetiModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerNpr: number;
  onDonateCoins: (amount: number) => void;
}

export const DanPetiModal: React.FC<DanPetiModalProps> = ({
  isOpen,
  onClose,
  playerNpr,
  onDonateCoins,
}) => {
  const [selectedCoinAmount, setSelectedCoinAmount] = useState<number>(50);
  const [donationSuccess, setDonationSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInGameDonate = () => {
    if (playerNpr < selectedCoinAmount) {
      setDonationSuccess("Not enough coins! Play minigames or light diyas to earn coins.");
      return;
    }
    onDonateCoins(selectedCoinAmount);
    soundManager.playTempleBell();
    setDonationSuccess(`🙏 धन्यवाद! रु ${selectedCoinAmount} दान गरियो। माँ दुर्गाको आशिर्वाद तपाईंलाई रहोस्!`);
    setTimeout(() => {
      setDonationSuccess(null);
    }, 4000);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText("mela-admin@fonepay");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "linear-gradient(145deg, #1E1B18 0%, #12100E 100%)",
          border: "2px solid #F59E0B",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.2)",
          color: "#F3F4F6",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🪙</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 900, color: "#FDE047" }}>
                श्री दुर्गा मन्दिर दान पेटिका
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#FBBF24" }}>
                Temple Dan Peti &amp; Mela Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid #EF4444",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FCA5A5",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        {/* Essential User-Specified Disclosure Notice */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid #F59E0B",
            borderRadius: "12px",
            padding: "12px 14px",
            fontSize: "13px",
            lineHeight: "1.45",
            color: "#FEF08A",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: "4px", color: "#FDE047" }}>
            📌 महत्वपूर्ण जानकारी (Notice):
          </div>
          <p style={{ margin: "0 0 6px 0", color: "#FFFBEB" }}>
            "यो दान यस मेलाको व्यवस्थापन र विकासका लागि व्यवस्थापक (Admin) लाई जानेछ। सहयोग गर्ने वा नगर्ने तपाईंको स्वेच्छा हो।"
          </p>
          <div style={{ fontSize: "11px", color: "#FCD34D", fontStyle: "italic" }}>
            (This contribution directly goes to the Admin for maintaining server costs, animations &amp; continuous Nepali festival development. It is completely your choice to support or not.)
          </div>
        </div>

        {/* QR Code Graphic Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#FFF",
            padding: "16px",
            borderRadius: "16px",
            gap: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px" }}>
            🇳🇵 Fonepay / eSewa / Khalti / Mobile Banking QR
          </div>

          {/* High-quality SVG QR Code Design */}
          <div
            style={{
              width: "180px",
              height: "180px",
              background: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg viewBox="0 0 100 100" width="180" height="180">
              {/* Outer border & corner squares */}
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              {/* Top-Left Finder */}
              <rect x="8" y="8" width="24" height="24" fill="#0f172a" />
              <rect x="12" y="12" width="16" height="16" fill="#ffffff" />
              <rect x="16" y="16" width="8" height="8" fill="#0f172a" />

              {/* Top-Right Finder */}
              <rect x="68" y="8" width="24" height="24" fill="#0f172a" />
              <rect x="72" y="12" width="16" height="16" fill="#ffffff" />
              <rect x="76" y="16" width="8" height="8" fill="#0f172a" />

              {/* Bottom-Left Finder */}
              <rect x="8" y="68" width="24" height="24" fill="#0f172a" />
              <rect x="12" y="72" width="16" height="16" fill="#ffffff" />
              <rect x="16" y="76" width="8" height="8" fill="#0f172a" />

              {/* Data Blocks Pattern */}
              <rect x="36" y="10" width="6" height="6" fill="#0f172a" />
              <rect x="46" y="10" width="6" height="6" fill="#0f172a" />
              <rect x="56" y="10" width="6" height="6" fill="#0f172a" />

              <rect x="36" y="20" width="10" height="6" fill="#0f172a" />
              <rect x="52" y="20" width="10" height="6" fill="#0f172a" />

              <rect x="10" y="38" width="8" height="8" fill="#0f172a" />
              <rect x="22" y="38" width="8" height="8" fill="#0f172a" />
              <rect x="34" y="34" width="8" height="8" fill="#0f172a" />
              <rect x="46" y="38" width="8" height="8" fill="#0f172a" />
              <rect x="58" y="34" width="8" height="8" fill="#0f172a" />
              <rect x="70" y="38" width="8" height="8" fill="#0f172a" />
              <rect x="82" y="38" width="8" height="8" fill="#0f172a" />

              <rect x="10" y="50" width="8" height="8" fill="#0f172a" />
              <rect x="26" y="50" width="10" height="8" fill="#0f172a" />
              <rect x="64" y="50" width="10" height="8" fill="#0f172a" />
              <rect x="80" y="50" width="10" height="8" fill="#0f172a" />

              <rect x="36" y="64" width="8" height="8" fill="#0f172a" />
              <rect x="48" y="64" width="8" height="8" fill="#0f172a" />
              <rect x="60" y="68" width="8" height="8" fill="#0f172a" />
              <rect x="72" y="68" width="8" height="8" fill="#0f172a" />
              <rect x="84" y="68" width="8" height="8" fill="#0f172a" />

              <rect x="36" y="78" width="8" height="8" fill="#0f172a" />
              <rect x="50" y="78" width="12" height="8" fill="#0f172a" />
              <rect x="68" y="82" width="8" height="8" fill="#0f172a" />
              <rect x="80" y="82" width="10" height="8" fill="#0f172a" />

              {/* Center Nepali Mela Icon */}
              <circle cx="50" cy="50" r="10" fill="#DC2626" />
              <text x="50" y="54" fontSize="10" fill="#FFF" textAnchor="middle" fontWeight="bold">
                🇳🇵
              </text>
            </svg>
          </div>

          <button
            onClick={handleCopyId}
            style={{
              background: copied ? "#10B981" : "#0F172A",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copied ? "✓ Copied: mela-admin@fonepay" : "📋 Copy Admin Fonepay ID"}
          </button>
        </div>

        {/* In-Game Coin Donation Option */}
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "14px", padding: "12px", border: "1px solid #374151" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#FCD34D", marginBottom: "8px" }}>
            🪙 Or Support with In-Game Festival Coins (उपलब्ध: रु {playerNpr}):
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            {[20, 50, 100, 250].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedCoinAmount(amt)}
                style={{
                  flex: 1,
                  background: selectedCoinAmount === amt ? "#D97706" : "rgba(255,255,255,0.06)",
                  color: selectedCoinAmount === amt ? "#FFF" : "#D1D5DB",
                  border: selectedCoinAmount === amt ? "2px solid #FCD34D" : "1px solid #4B5563",
                  borderRadius: "8px",
                  padding: "6px 0",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                रु {amt}
              </button>
            ))}
          </div>

          <button
            onClick={handleInGameDonate}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)",
              color: "#FFF",
              border: "1px solid #FCD34D",
              borderRadius: "10px",
              padding: "10px",
              fontWeight: 900,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.4)",
            }}
          >
            🌸 दान पेस गर्नुहोस् (Offer रू {selectedCoinAmount} Coins)
          </button>
        </div>

        {donationSuccess && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10B981",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#6EE7B7",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {donationSuccess}
          </div>
        )}
      </div>
    </div>
  );
};
