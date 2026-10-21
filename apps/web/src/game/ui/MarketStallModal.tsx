import React, { useEffect } from "react";
import { soundManager } from "../audio/SoundManager.js";

interface MarketStallModalProps {
  stallType: "chiya" | "sel_roti" | "changa" | "dhaka" | null;
  onClose: () => void;
  npr: number;
  onBuyItem: (cost: number, type: "chiya" | "sel_roti" | "changa" | "dhaka", data?: any) => void;
}

export const MarketStallModal: React.FC<MarketStallModalProps> = ({
  stallType,
  onClose,
  npr,
  onBuyItem,
}) => {
  useEffect(() => {
    if (!stallType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stallType, onClose]);

  if (!stallType) return null;

  const handlePurchase = (cost: number, itemType: "chiya" | "sel_roti" | "changa" | "dhaka", data?: any) => {
    if (npr < cost) return;
    onBuyItem(cost, itemType, data);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#1e1b18",
          border: "2px solid #ca8a04",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "500px",
          padding: "24px",
          color: "#f5f5f4",
          boxShadow: "0 20px 45px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header with NPC Shopkeeper Greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#facc15" }}>
              {stallType === "chiya" && "☕ Chiya Dai ko Pasal (Nepali Tea Stall)"}
              {stallType === "sel_roti" && "🍩 Roti Didi ko Mithai Stand"}
              {stallType === "changa" && "🪁 Changa Bhai ko Kite Shop"}
              {stallType === "dhaka" && "🎩 Dhaka Master ko Topi Stall"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#a8a29e" }}>
              Your Balance: <strong style={{ color: "#fde047" }}>रू {npr.toLocaleString()} NPR</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#292524",
              border: "1px solid #78716c",
              color: "#a8a29e",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Shopkeeper Greeting Quote */}
        <div
          style={{
            backgroundColor: "#292524",
            borderLeft: "3px solid #ca8a04",
            padding: "8px 14px",
            fontSize: "12px",
            fontStyle: "italic",
            color: "#fde047",
            marginBottom: "16px",
            borderRadius: "0 8px 8px 0",
          }}
        >
          {stallType === "chiya" && '"नमस्ते! हिउँदे चिसोमा तातो मसला चियाको मज्जा लिनुहोस्।"'}
          {stallType === "sel_roti" && '"ताजा घ्यूमा तारेको सेल रोटी तयार छ हजुर!"'}
          {stallType === "changa" && '"दशैंको नीलो आकाशमा लट्टाई समातेर चङ्गा चेट पार्नुहोस्!"'}
          {stallType === "dhaka" && '"पाल्पाली ढाका टोपी लगाउनुहोस्, दशैंको शान बढाउनुहोस्!"'}
        </div>

        {/* Chiya Pasal Items */}
        {stallType === "chiya" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#26221f",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #78350f",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#fdba74" }}>
                  ☕ Hot Spiced Masala Chiya
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px" }}>
                  Fresh boiled milk tea with cardamom, ginger &amp; clove. +35% Sprint Speed boost!
                </div>
              </div>
              <button
                onClick={() => handlePurchase(15, "chiya")}
                disabled={npr < 15}
                style={{
                  backgroundColor: npr >= 15 ? "#d97706" : "#44403c",
                  color: "#FFF",
                  border: npr >= 15 ? "1px solid #f59e0b" : "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontWeight: 900,
                  fontSize: "13px",
                  cursor: npr >= 15 ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Buy (रू १५ NPR)
              </button>
            </div>
          </div>
        )}

        {/* Sel Roti Stall Items */}
        {stallType === "sel_roti" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#26221f",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #78350f",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#fef08a" }}>
                  🍩 Fresh Crispy Sel Roti
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px" }}>
                  Golden ring-shaped traditional sweet rice bread. Awards +25 Festival Score!
                </div>
              </div>
              <button
                onClick={() => handlePurchase(25, "sel_roti")}
                disabled={npr < 25}
                style={{
                  backgroundColor: npr >= 25 ? "#ca8a04" : "#44403c",
                  color: "#FFF",
                  border: npr >= 25 ? "1px solid #eab308" : "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontWeight: 900,
                  fontSize: "13px",
                  cursor: npr >= 25 ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Buy (रू २५ NPR)
              </button>
            </div>
          </div>
        )}

        {/* Changa / Kite Stall Items */}
        {stallType === "changa" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#26221f",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #78350f",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#38bdf8" }}>
                  🪁 Sky-High Dashain Changa &amp; Lattai
                </div>
                <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px" }}>
                  Colorful diamond kite with wooden spool. Usable across festival grounds via Inventory [I]!
                </div>
              </div>
              <button
                onClick={() => handlePurchase(50, "changa")}
                disabled={npr < 50}
                style={{
                  backgroundColor: npr >= 50 ? "#0284c7" : "#44403c",
                  color: "#FFF",
                  border: npr >= 50 ? "1px solid #38bdf8" : "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontWeight: 900,
                  fontSize: "13px",
                  cursor: npr >= 50 ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Buy (रू ५० NPR)
              </button>
            </div>
          </div>
        )}

        {/* Dhaka Topi Stall Items */}
        {stallType === "dhaka" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { name: "Palpali Crimson", color: "#8B0000" },
              { name: "Royal Saffron", color: "#D97706" },
              { name: "Himalayan Blue", color: "#1D4ED8" },
              { name: "Terai Emerald", color: "#047857" },
            ].map((hat) => (
              <div
                key={hat.name}
                style={{
                  backgroundColor: "#26221f",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "1px solid #78350f",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: hat.color,
                    border: "2px solid #FFF",
                  }}
                />
                <span style={{ fontSize: "12px", fontWeight: 700 }}>{hat.name}</span>
                <button
                  onClick={() => handlePurchase(100, "dhaka", { dhakaTopiColor: hat.color, hasDhakaTopi: true })}
                  disabled={npr < 100}
                  style={{
                    backgroundColor: npr >= 100 ? "#b45309" : "#44403c",
                    color: "#FFF",
                    border: npr >= 100 ? "1px solid #f59e0b" : "none",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: npr >= 100 ? "pointer" : "not-allowed",
                  }}
                >
                  Buy (रू १०० NPR)
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#a8a29e",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Leave Shop (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};