import React, { useState } from "react";
import { soundManager } from "../audio/SoundManager.js";
import type { LangurSymbol } from "@melaverse/shared";

interface LangurBurjaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: number;
  phase: string;
  timerRemaining: number;
  diceResults: string[];
  onPlaceBet: (symbol: LangurSymbol, amount: number) => void;
  myBets: Map<string, number>;
  onClearBets?: () => void;
  onInstantRoll?: (bets: Map<string, number>) => void;
  isOnline?: boolean;
}

const SYMBOLS: { id: LangurSymbol; label: string; icon: string; color: string; nepali: string }[] = [
  { id: "jhanda", label: "Jhanda", nepali: "झण्डा", icon: "🚩", color: "#DC2626" },
  { id: "burja", label: "Burja", nepali: "बुर्जा", icon: "👑", color: "#D97706" },
  { id: "ita", label: "Ita", nepali: "ईँटा", icon: "♦", color: "#EA580C" },
  { id: "paan", label: "Paan", nepali: "पान", icon: "♥", color: "#E11D48" },
  { id: "hukum", label: "Hukum", nepali: "हुकुम", icon: "♠", color: "#1E293B" },
  { id: "chidi", label: "Chidi", nepali: "चिडी", icon: "♣", color: "#047857" },
];

export const LangurBurjaModal: React.FC<LangurBurjaModalProps> = ({
  isOpen,
  onClose,
  tokens,
  phase,
  timerRemaining,
  diceResults,
  onPlaceBet,
  myBets,
  onClearBets,
  onInstantRoll,
  isOnline = false,
}) => {
  const [selectedBetAmount, setSelectedBetAmount] = useState<number>(10);
  const [localIsRolling, setLocalIsRolling] = useState<boolean>(false);
  const [lastWinSummary, setLastWinSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalBet = Array.from(myBets.values()).reduce((sum, val) => sum + val, 0);

  const handleBetClick = (symbol: LangurSymbol) => {
    if (localIsRolling) return;
    if (tokens < selectedBetAmount) return;
    soundManager.playMadalBeat("high");
    onPlaceBet(symbol, selectedBetAmount);
  };

  const handleLocalShakeAndRoll = () => {
    if (localIsRolling || totalBet === 0) return;
    setLocalIsRolling(true);
    setLastWinSummary(null);
    soundManager.playDiceRoll();

    setTimeout(() => {
      onInstantRoll?.(myBets);
      setLocalIsRolling(false);
    }, 1800);
  };

  const isBowlCovering = localIsRolling || phase === "rolling";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#0f172a",
          border: "2px solid #f59e0b",
          borderRadius: "20px",
          width: "92%",
          maxWidth: "600px",
          padding: "24px",
          color: "#f8fafc",
          boxShadow: "0 24px 48px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
              🎲 Langur Burja (Jhandi Munda)
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
              Traditional Dashain &amp; Tihar Game • dashain.site/games/langur-burja
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#334155",
              border: "none",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Shaker Bowl (कचौरा) & Dice Area */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            border: "2px dashed #ca8a04",
            padding: "16px",
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            minHeight: "110px",
            justifyContent: "center",
          }}
        >
          {isBowlCovering ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                animation: "wobble 0.3s infinite",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "60px",
                  backgroundColor: "#b45309",
                  borderRadius: "50px 50px 10px 10px",
                  border: "4px solid #fde047",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🥣
              </div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#facc15" }}>
                🎲 Shaking the Dice Bowl (कचौरा हल्लाउँदै)...
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "8px" }}>
                6 Traditional Dice Outcome:
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {diceResults.map((sym, idx) => {
                  const item = SYMBOLS.find((s) => s.id === sym) ?? SYMBOLS[0];
                  const hasBetOnThis = (myBets.get(sym) ?? 0) > 0;
                  return (
                    <div
                      key={`die-${idx}`}
                      style={{
                        width: "52px",
                        height: "52px",
                        backgroundColor: hasBetOnThis ? "#1e3a8a" : "#334155",
                        border: hasBetOnThis ? "2px solid #60a5fa" : "2px solid #e2e8f0",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                      }}
                    >
                      <span>{item.icon}</span>
                      <span style={{ fontSize: "8px", color: "#94a3b8" }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6 Betting Symbols Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
          {SYMBOLS.map((sym) => {
            const currentBet = myBets.get(sym.id) ?? 0;
            const matchCount = isBowlCovering ? 0 : diceResults.filter((s) => s === sym.id).length;
            const wonOnThis = !isBowlCovering && currentBet > 0 && matchCount > 0;

            return (
              <button
                key={sym.id}
                onClick={() => handleBetClick(sym.id)}
                disabled={localIsRolling || tokens < selectedBetAmount}
                style={{
                  backgroundColor: wonOnThis ? "#065f46" : currentBet > 0 ? "#1e3a8a" : "#1e293b",
                  border: wonOnThis
                    ? "2px solid #4ade80"
                    : currentBet > 0
                    ? "2px solid #60a5fa"
                    : "1px solid #334155",
                  borderRadius: "12px",
                  padding: "10px",
                  cursor: !localIsRolling && tokens >= selectedBetAmount ? "pointer" : "not-allowed",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: "28px" }}>{sym.icon}</span>
                <span style={{ fontWeight: 800, fontSize: "13px", color: sym.color }}>
                  {sym.label} ({sym.nepali})
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: wonOnThis ? "#86efac" : currentBet > 0 ? "#93c5fd" : "#64748b",
                  }}
                >
                  {currentBet > 0 ? `Bet: ${currentBet} 🪙` : "Tap to Bet"}
                </span>
                {wonOnThis && (
                  <span style={{ fontSize: "10px", backgroundColor: "#15803d", color: "#fff", borderRadius: "6px", padding: "1px 6px" }}>
                    +{currentBet * matchCount} Win (x{matchCount})!
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls & Chip Selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: "1px solid #334155",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {/* Chip Size Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Chip:</span>
            {[5, 10, 25, 50].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedBetAmount(amt)}
                style={{
                  backgroundColor: selectedBetAmount === amt ? "#d97706" : "#334155",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Action Buttons: Clear & Shake & Roll */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {totalBet > 0 && onClearBets && (
              <button
                onClick={onClearBets}
                disabled={localIsRolling}
                style={{
                  backgroundColor: "#475569",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}

            {!isOnline && (
              <button
                onClick={handleLocalShakeAndRoll}
                disabled={localIsRolling || totalBet === 0}
                style={{
                  backgroundColor: totalBet > 0 ? "#059669" : "#334155",
                  color: "#FFF",
                  border: totalBet > 0 ? "2px solid #34d399" : "none",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: totalBet > 0 && !localIsRolling ? "pointer" : "not-allowed",
                  boxShadow: totalBet > 0 ? "0 4px 12px rgba(5,150,105,0.4)" : "none",
                }}
              >
                {localIsRolling ? "Rolling..." : "🥣 Shake & Roll"}
              </button>
            )}

            <div style={{ fontWeight: 800, color: "#fbbf24", fontSize: "14px" }}>
              Tokens: {tokens} 🪙
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};