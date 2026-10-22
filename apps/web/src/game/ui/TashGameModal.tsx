import React, { useState, useEffect } from "react";
import { soundManager } from "../audio/SoundManager.js";

export interface RealTablePlayer {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

interface TashGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: number;
  onWinTokens: (amt: number) => void;
  playerName: string;
  taasPlayerCount: number;
  onPlayerCountChange: (count: number) => void;
  realPlayers?: RealTablePlayer[];
  isOnline?: boolean;
}

interface Card {
  suit: "♠" | "♥" | "♦" | "♣";
  value: number; // 2 - 14 (14 is Ace)
  name: string;
}

const SUITS: ("♠" | "♥" | "♦" | "♣")[] = ["♠", "♥", "♦", "♣"];
const VALUES = [
  { val: 2, name: "2" },
  { val: 3, name: "3" },
  { val: 4, name: "4" },
  { val: 5, name: "5" },
  { val: 6, name: "6" },
  { val: 7, name: "7" },
  { val: 8, name: "8" },
  { val: 9, name: "9" },
  { val: 10, name: "10" },
  { val: 11, name: "J" },
  { val: 12, name: "Q" },
  { val: 13, name: "K" },
  { val: 14, name: "A" },
];

export const TashGameModal: React.FC<TashGameModalProps> = ({
  isOpen,
  onClose,
  tokens,
  onWinTokens,
  playerName,
  taasPlayerCount,
  onPlayerCountChange,
  realPlayers = [],
  isOnline = false,
}) => {
  // Game Selector: "teen_patti" | "kitti" | "bagh_chal"
  const [selectedGame, setSelectedGame] = useState<"teen_patti" | "kitti" | "bagh_chal">("teen_patti");

  // Real Multiplayer Seating
  const seat1 = realPlayers[0] ?? null;
  const seat2 = realPlayers[1] ?? null;
  const seat3 = realPlayers[2] ?? null;

  // ─── Teen Patti State ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState<"ready" | "dealt" | "showdown">("ready");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [pot, setPot] = useState<number>(40);
  const [isSeen, setIsSeen] = useState<boolean>(false);
  const [hasFolded, setHasFolded] = useState<boolean>(false);

  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bot1Hand, setBot1Hand] = useState<Card[]>([]);
  const [bot2Hand, setBot2Hand] = useState<Card[]>([]);
  const [bot3Hand, setBot3Hand] = useState<Card[]>([]);
  const [winnerMessage, setWinnerMessage] = useState<string>("");

  // ─── Bagh-Chal 2-Player Real Play State (5x5 grid) ──────────────────────────
  // 0: empty, 1: Goat, 2: Tiger
  const [baghBoard, setBaghBoard] = useState<number[][]>(() => {
    const b = Array.from({ length: 5 }, () => Array(5).fill(0));
    // 4 Tigers on corners
    b[0][0] = 2;
    b[0][4] = 2;
    b[4][0] = 2;
    b[4][4] = 2;
    return b;
  });
  const [goatsToPlace, setGoatsToPlace] = useState<number>(20);
  const [goatsCaptured, setGoatsCaptured] = useState<number>(0);
  const [turn, setTurn] = useState<"goat" | "tiger">("goat");
  const [selectedPiece, setSelectedPiece] = useState<{ r: number; c: number } | null>(null);
  const [baghMessage, setBaghMessage] = useState<string>("Place goats on empty intersections to trap the 4 tigers!");

  const seatedPlayers = [
    seat1 ? { name: seat1.name, avatar: seat1.avatar || "👤", color: seat1.color || "#0D9488", isReal: true } : { name: "Seat 2 (Waiting)", avatar: "🪑", color: "#64748B", isReal: false },
    seat2 ? { name: seat2.name, avatar: seat2.avatar || "👤", color: seat2.color || "#C41E3A", isReal: true } : { name: "Seat 3 (Waiting)", avatar: "🪑", color: "#64748B", isReal: false },
    seat3 ? { name: seat3.name, avatar: seat3.avatar || "👤", color: seat3.color || "#2563EB", isReal: true } : { name: "Seat 4 (Waiting)", avatar: "🪑", color: "#64748B", isReal: false },
  ];

  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const v of VALUES) {
        deck.push({ suit, value: v.val, name: v.name });
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const evaluateHandRank = (hand: Card[]): { rank: number; label: string; score: number } => {
    if (hand.length < 3) return { rank: 0, label: "High Card", score: 0 };
    const sorted = [...hand].sort((a, b) => b.value - a.value);
    const isFlush = sorted[0].suit === sorted[1].suit && sorted[1].suit === sorted[2].suit;
    const isSeq =
      (sorted[0].value === sorted[1].value + 1 && sorted[1].value === sorted[2].value + 1) ||
      (sorted[0].value === 14 && sorted[1].value === 3 && sorted[2].value === 2); // A-2-3
    const isTrio = sorted[0].value === sorted[1].value && sorted[1].value === sorted[2].value;
    const isPair = sorted[0].value === sorted[1].value || sorted[1].value === sorted[2].value;

    const baseScore = sorted[0].value * 100 + sorted[1].value * 10 + sorted[2].value;

    if (isTrio) return { rank: 6, label: "Trio (Trail) 🔥", score: 60000 + baseScore };
    if (isFlush && isSeq) return { rank: 5, label: "Pure Sequence (Pakki Run) 🌟", score: 50000 + baseScore };
    if (isSeq) return { rank: 4, label: "Sequence (Kacchi Run) ✨", score: 40000 + baseScore };
    if (isFlush) return { rank: 3, label: "Color (Flush) 🎨", score: 30000 + baseScore };
    if (isPair) return { rank: 2, label: "Pair (Jodi) 👥", score: 20000 + baseScore };
    return { rank: 1, label: `High Card (${sorted[0].name})`, score: 10000 + baseScore };
  };

  // Start Teen Patti Hand
  const startTeenPatti = () => {
    if (tokens < betAmount) return;

    soundManager.playCardSnap();
    const deck = createDeck();
    setPlayerHand([deck[0], deck[1], deck[2]]);
    setBot1Hand([deck[3], deck[4], deck[5]]);
    setBot2Hand([deck[6], deck[7], deck[8]]);
    setBot3Hand([deck[9], deck[10], deck[11]]);

    setPot(betAmount * 4);
    setPhase("dealt");
    setIsSeen(false);
    setHasFolded(false);
    setWinnerMessage("");
    onPlayerCountChange(4); // 4 players active at table
  };

  // See Cards (Chaal / Seen mode)
  const handleSeeCards = () => {
    setIsSeen(true);
    soundManager.playCardSnap();
  };

  // Pack / Fold
  const handleFold = () => {
    setHasFolded(true);
    setWinnerMessage("You folded your hand. Round surrendered.");
    onWinTokens(-betAmount);
    setPhase("showdown");
  };

  // Showdown with real seated players
  const handleShowdown = () => {
    soundManager.playDiceRoll();
    const myEval = evaluateHandRank(playerHand);
    const b1Eval = evaluateHandRank(bot1Hand);
    const b2Eval = evaluateHandRank(bot2Hand);
    const b3Eval = evaluateHandRank(bot3Hand);

    const scores = [
      { name: `${playerName} (You)`, eval: myEval, isPlayer: true },
    ];
    if (seat1) scores.push({ name: seat1.name, eval: b1Eval, isPlayer: false });
    if (seat2) scores.push({ name: seat2.name, eval: b2Eval, isPlayer: false });
    if (seat3) scores.push({ name: seat3.name, eval: b3Eval, isPlayer: false });
    // If practicing solo, evaluate against table dealer hand
    if (scores.length === 1) {
      scores.push({ name: "Practice Hand", eval: b1Eval, isPlayer: false });
    }

    scores.sort((a, b) => b.eval.score - a.eval.score);
    const winner = scores[0];

    if (winner.isPlayer) {
      soundManager.playWinFanfare();
      setWinnerMessage(`🎉 You won the pot with ${myEval.label}! (+${pot} tokens)`);
      onWinTokens(pot - betAmount);
    } else {
      soundManager.playMadalBeat("low");
      setWinnerMessage(`${winner.name} won with ${winner.eval.label}! Better luck next hand!`);
      onWinTokens(-betAmount);
    }

    setPhase("showdown");
    setIsSeen(true);
  };

  // ─── 2-Player Real Bagh-Chal Logic (Traditional 5x5 board) ────────────────
  const handleBaghCellClick = (r: number, c: number) => {
    // 1. GOAT'S TURN (Player 1)
    if (turn === "goat") {
      if (goatsToPlace > 0) {
        // Place phase
        if (baghBoard[r][c] === 0) {
          soundManager.playCardSnap();
          const nextB = baghBoard.map((row) => [...row]);
          nextB[r][c] = 1; // Goat placed
          setBaghBoard(nextB);
          const remaining = goatsToPlace - 1;
          setGoatsToPlace(remaining);
          setTurn("tiger");
          setBaghMessage(`Goat placed (${remaining} in hand)! Player 2 (Tiger)'s turn.`);
        }
      } else {
        // Move phase for Goats
        if (!selectedPiece && baghBoard[r][c] === 1) {
          setSelectedPiece({ r, c });
          setBaghMessage("Goat selected. Click adjacent empty point to move.");
        } else if (selectedPiece && baghBoard[selectedPiece.r][selectedPiece.c] === 1) {
          const dr = Math.abs(selectedPiece.r - r);
          const dc = Math.abs(selectedPiece.c - c);
          if (baghBoard[r][c] === 0 && dr <= 1 && dc <= 1) {
            soundManager.playCardSnap();
            const nextB = baghBoard.map((row) => [...row]);
            nextB[selectedPiece.r][selectedPiece.c] = 0;
            nextB[r][c] = 1;
            setBaghBoard(nextB);
            setSelectedPiece(null);
            setTurn("tiger");
            setBaghMessage("Goat moved! Player 2 (Tiger)'s turn.");
          } else {
            setSelectedPiece(null);
          }
        }
      }
      return;
    }

    // 2. TIGER'S TURN (Player 2)
    if (turn === "tiger") {
      if (!selectedPiece && baghBoard[r][c] === 2) {
        setSelectedPiece({ r, c });
        setBaghMessage("Tiger selected. Click adjacent empty spot to move, or leap 2 steps over a goat to capture!");
      } else if (selectedPiece && baghBoard[selectedPiece.r][selectedPiece.c] === 2) {
        const sr = selectedPiece.r;
        const sc = selectedPiece.c;
        const dr = Math.abs(sr - r);
        const dc = Math.abs(sc - c);

        // Case A: 1-step move to adjacent empty spot
        if (baghBoard[r][c] === 0 && dr <= 1 && dc <= 1) {
          soundManager.playCardSnap();
          const nextB = baghBoard.map((row) => [...row]);
          nextB[sr][sc] = 0;
          nextB[r][c] = 2;
          setBaghBoard(nextB);
          setSelectedPiece(null);
          setTurn("goat");
          setBaghMessage("Tiger moved! Player 1 (Goat)'s turn.");
        }
        // Case B: 2-step jump over an adjacent goat to capture
        else if (
          baghBoard[r][c] === 0 &&
          ((dr === 2 && dc === 0) || (dr === 0 && dc === 2) || (dr === 2 && dc === 2))
        ) {
          const midR = (sr + r) / 2;
          const midC = (sc + c) / 2;
          if (baghBoard[midR][midC] === 1) {
            // Valid capture jump!
            soundManager.playMadalBeat("high");
            const nextB = baghBoard.map((row) => [...row]);
            nextB[sr][sc] = 0;
            nextB[midR][midC] = 0; // Goat captured!
            nextB[r][c] = 2;
            const newCap = goatsCaptured + 1;
            setGoatsCaptured(newCap);
            setBaghBoard(nextB);
            setSelectedPiece(null);
            setTurn("goat");
            if (newCap >= 5) {
              soundManager.playWinFanfare();
              setBaghMessage("Tigers win by capturing 5 goats! 🐅");
            } else {
              setBaghMessage(`Tiger captured a goat! (${newCap}/5 captured). Player 1 (Goat)'s turn.`);
            }
          } else {
            setSelectedPiece(null);
          }
        } else {
          setSelectedPiece(null);
        }
      }
    }
  };

  const resetBaghChal = () => {
    const b = Array.from({ length: 5 }, () => Array(5).fill(0));
    b[0][0] = 2;
    b[0][4] = 2;
    b[4][0] = 2;
    b[4][4] = 2;
    setBaghBoard(b);
    setGoatsToPlace(20);
    setGoatsCaptured(0);
    setTurn("goat");
    setSelectedPiece(null);
    setBaghMessage("Place goats on empty intersections to trap the 4 tigers!");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
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
          border: "2px solid #ca8a04",
          borderRadius: "20px",
          width: "94%",
          maxWidth: "760px",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "24px",
          color: "#f5f5f4",
          boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header & Close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#facc15", display: "flex", alignItems: "center", gap: "8px" }}>
              🃏 Dashain Festival Games (dashain.site)
            </h2>
            <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px" }}>
              Pine Grove Table • 👥 <strong style={{ color: "#38bdf8" }}>{taasPlayerCount}/4 Players Seated</strong> • Tokens: <strong style={{ color: "#facc15" }}>{tokens} 🪙</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#7f1d1d",
              color: "#FFF",
              border: "1px solid #ef4444",
              borderRadius: "10px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Leave Table (Stand Up) ✕
          </button>
        </div>

        {/* Game Mode Tabs matching dashain.site */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #44403c", paddingBottom: "10px" }}>
          <button
            onClick={() => setSelectedGame("teen_patti")}
            style={{
              backgroundColor: selectedGame === "teen_patti" ? "#ca8a04" : "#292524",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🂡 Faras (Teen Patti)
          </button>
          <button
            onClick={() => setSelectedGame("kitti")}
            style={{
              backgroundColor: selectedGame === "kitti" ? "#ca8a04" : "#292524",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🂠 Kitti (9-Card Show)
          </button>
          <button
            onClick={() => setSelectedGame("bagh_chal")}
            style={{
              backgroundColor: selectedGame === "bagh_chal" ? "#ca8a04" : "#292524",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🐯 Bagh-Chal (Tigers & Goats)
          </button>
        </div>

        {/* ─── TAB 1: Teen Patti / Faras ─────────────────────────────────────── */}
        {selectedGame === "teen_patti" && (
          <div>
            <div
              style={{
                backgroundColor: "#3a2a1a",
                border: "3px dashed #a16207",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "16px",
                minHeight: "260px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* North Player (Seat 2) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: seatedPlayers[1].color }}>
                  {seatedPlayers[1].avatar} {seatedPlayers[1].name}
                </span>
                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  {bot2Hand.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: "36px",
                        height: "50px",
                        backgroundColor: phase === "showdown" ? "#fff" : "#78350f",
                        color: c.suit === "♥" || c.suit === "♦" ? "#dc2626" : "#000",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {phase === "showdown" ? `${c.name}${c.suit}` : "🂠"}
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* West (Seat 1) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: seatedPlayers[0].color }}>
                    {seatedPlayers[0].avatar} {seatedPlayers[0].name}
                  </span>
                  <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                    {bot1Hand.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: "34px",
                          height: "48px",
                          backgroundColor: phase === "showdown" ? "#fff" : "#78350f",
                          color: c.suit === "♥" || c.suit === "♦" ? "#dc2626" : "#000",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {phase === "showdown" ? `${c.name}${c.suit}` : "🂠"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Central Pot */}
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.65)",
                    border: "2px solid #eab308",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "9px", color: "#facc15" }}>POT</span>
                  <span style={{ fontSize: "16px", fontWeight: 900, color: "#fef08a" }}>🪙 {pot}</span>
                </div>

                {/* East (Seat 3) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: seatedPlayers[2].color }}>
                    {seatedPlayers[2].avatar} {seatedPlayers[2].name}
                  </span>
                  <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                    {bot3Hand.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: "34px",
                          height: "48px",
                          backgroundColor: phase === "showdown" ? "#fff" : "#78350f",
                          color: c.suit === "♥" || c.suit === "♦" ? "#dc2626" : "#000",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {phase === "showdown" ? `${c.name}${c.suit}` : "🂠"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* South Player: Your Hand */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24" }}>
                  ⭐ You ({playerName}) {isSeen ? "(Seen)" : "(Blind)"}
                </span>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {playerHand.length === 0 ? (
                    <div style={{ color: "#d6d3d1", fontSize: "12px", fontStyle: "italic" }}>
                      Press "Deal Hand" to start the 4-player round!
                    </div>
                  ) : (
                    playerHand.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: "56px",
                          height: "78px",
                          backgroundColor: isSeen ? "#ffffff" : "#78350f",
                          color: c.suit === "♥" || c.suit === "♦" ? "#dc2626" : "#0f172a",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: 900,
                          boxShadow: "0 6px 12px rgba(0,0,0,0.5)",
                        }}
                      >
                        {isSeen ? (
                          <>
                            <span>{c.name}</span>
                            <span style={{ fontSize: "20px" }}>{c.suit}</span>
                          </>
                        ) : (
                          <span style={{ color: "#fef08a", fontSize: "22px" }}>🂠</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {isSeen && playerHand.length > 0 && (
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", marginTop: "4px" }}>
                    {evaluateHandRank(playerHand).label}
                  </span>
                )}
              </div>
            </div>

            {winnerMessage && (
              <div
                style={{
                  backgroundColor: winnerMessage.startsWith("🎉") ? "#14532d" : "#7f1d1d",
                  border: "1px solid #facc15",
                  borderRadius: "10px",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: 800,
                  fontSize: "13px",
                  marginBottom: "14px",
                  color: "#fff",
                }}
              >
                {winnerMessage}
              </div>
            )}

            {/* Teen Patti Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#a8a29e" }}>Ante:</span>
                {[5, 10, 20].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    disabled={phase === "dealt"}
                    style={{
                      backgroundColor: betAmount === amt ? "#ca8a04" : "#292524",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {amt} 🪙
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {phase === "dealt" ? (
                  <>
                    {!isSeen && (
                      <button
                        onClick={handleSeeCards}
                        style={{
                          backgroundColor: "#0284c7",
                          color: "#FFF",
                          border: "none",
                          borderRadius: "10px",
                          padding: "8px 14px",
                          fontWeight: 800,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        👁️ See Cards
                      </button>
                    )}
                    <button
                      onClick={handleFold}
                      style={{
                        backgroundColor: "#b91c1c",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontWeight: 800,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Pack (Fold)
                    </button>
                    <button
                      onClick={handleShowdown}
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#FFF",
                        border: "2px solid #86efac",
                        borderRadius: "10px",
                        padding: "8px 18px",
                        fontWeight: 900,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Showdown!
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startTeenPatti}
                    disabled={tokens < betAmount}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "#FFF",
                      border: "2px solid #f87171",
                      borderRadius: "12px",
                      padding: "10px 22px",
                      fontWeight: 900,
                      fontSize: "14px",
                      cursor: tokens >= betAmount ? "pointer" : "not-allowed",
                    }}
                  >
                    Deal New Round ({betAmount} 🪙)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Kitti (9-Card Game) ────────────────────────────────────── */}
        {selectedGame === "kitti" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h3 style={{ margin: "0 0 8px", color: "#facc15" }}>🂠 Kitti (9-Card Showdown)</h3>
            <p style={{ fontSize: "12px", color: "#a8a29e", maxWidth: "480px", margin: "0 auto 16px" }}>
              Players are dealt 9 cards and arrange them into 3 distinct hands. Each hand goes head-to-head in 3 consecutive show rounds!
            </p>
            <button
              onClick={startTeenPatti}
              style={{
                backgroundColor: "#ca8a04",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px 24px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Deal 9-Card Kitti Round (10 🪙)
            </button>
          </div>
        )}

        {/* ─── TAB 3: Bagh-Chal (Tigers & Goats 5x5 Board) ──────────────────── */}
        {selectedGame === "bagh_chal" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "380px", marginBottom: "8px", fontSize: "12px" }}>
              <span>Goats Left: <strong style={{ color: "#38bdf8" }}>{goatsToPlace}</strong></span>
              <span>Goats Captured: <strong style={{ color: "#ef4444" }}>{goatsCaptured} / 5</strong></span>
              <button onClick={resetBaghChal} style={{ background: "#44403c", color: "#fff", border: "none", borderRadius: "6px", padding: "2px 8px", cursor: "pointer" }}>Reset</button>
            </div>

            <div style={{ fontSize: "12px", color: "#facc15", marginBottom: "12px", fontWeight: 700 }}>
              {baghMessage}
            </div>

            {/* 5x5 Grid Board */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 54px)",
                gridTemplateRows: "repeat(5, 54px)",
                gap: "8px",
                backgroundColor: "#78350f",
                padding: "14px",
                borderRadius: "14px",
                border: "2px solid #fde047",
              }}
            >
              {baghBoard.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleBaghCellClick(r, c)}
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "50%",
                      backgroundColor: cell === 2 ? "#b91c1c" : cell === 1 ? "#0284c7" : "#451a03",
                      border: selectedPiece?.r === r && selectedPiece?.c === c ? "3px solid #facc15" : "1px solid #a16207",
                      color: "#FFF",
                      fontSize: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {cell === 2 ? "🐯" : cell === 1 ? "🐐" : "•"}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
