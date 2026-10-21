import { useState, useEffect } from "react";
import { MelaGame } from "./game/MelaGame.js";

// ─── Nepali color palette ─────────────────────────────────────────────────────
const COLORS = {
  crimson: "#C41E3A",
  gold: "#FFD700",
  saffron: "#FF8C00",
  white: "#FFFFFF",
  bg: "#1a0a00",
  cardBg: "rgba(255, 255, 255, 0.05)",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface HealthData {
  status: string;
  version: string;
  timestamp: string;
  room_count: number;
}

type FetchState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; data: HealthData }
  | { phase: "error"; message: string };

export default function App() {
  const [fetchState, setFetchState] = useState<FetchState>({ phase: "idle" });
  const [activeView, setActiveView] = useState<"game" | "status">("status");

  const serverHttpUrl =
    import.meta.env.VITE_SERVER_URL_HTTP ??
    (typeof window !== "undefined" && window.location.port !== "5173" && window.location.port !== "3000"
      ? ""
      : "http://localhost:2567");
  const appName = import.meta.env.VITE_APP_NAME ?? "Chatparva Mela";

  useEffect(() => {
    setFetchState({ phase: "loading" });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);

    fetch(`${serverHttpUrl}/health`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data = (await res.json()) as HealthData;
        setFetchState({ phase: "success", data });
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") {
          setFetchState({ phase: "error", message: "Connection timed out" });
        } else {
          setFetchState({
            phase: "error",
            message: err.message ?? "Unknown error",
          });
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [serverHttpUrl]);

  // Seamlessly transition to 3D game once server verification succeeds
  useEffect(() => {
    if (fetchState.phase === "success") {
      const enterTimer = window.setTimeout(() => {
        setActiveView("game");
      }, 300);
      return () => clearTimeout(enterTimer);
    }
  }, [fetchState.phase]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* 3D Game World */}
      {activeView === "game" && <MelaGame />}

      {/* Diagnostics / Status Screen Overlay (Toggled via button or fallback) */}
      {activeView === "status" && (
        <div className="mela-root" style={{ position: "absolute", inset: 0, zIndex: 50, overflowY: "auto" }}>
          <header className="mela-header">
            <h1 className="mela-title">🎪 {appName}</h1>
            <p className="mela-subtitle">
              Dashain &amp; Tihar Cultural Multiplayer Mela — Loading World...
            </p>
          </header>

          <main className="mela-main">
            <div className="mela-card" role="status" aria-live="polite">
              <h2 className="mela-card-title">Server Status</h2>

              {fetchState.phase === "idle" && (
                <p className="mela-text">Initialising...</p>
              )}

              {fetchState.phase === "loading" && (
                <div className="mela-loading">
                  <div
                    className="mela-spinner"
                    aria-label="Checking server..."
                  ></div>
                  <p className="mela-text">Checking server...</p>
                </div>
              )}

              {fetchState.phase === "success" && (
                <div className="mela-success">
                  <div className="mela-status-row">
                    <span className="mela-dot online" aria-label="Online"></span>
                    <span className="mela-label">Status</span>
                    <span className="mela-value">{fetchState.data.status}</span>
                  </div>
                  <div className="mela-status-row">
                    <span className="mela-label">Version</span>
                    <span className="mela-value">{fetchState.data.version}</span>
                  </div>
                  <div className="mela-status-row">
                    <span className="mela-label">Server Time</span>
                    <span className="mela-value">
                      {new Date(fetchState.data.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mela-status-row">
                    <span className="mela-label">Active Rooms</span>
                    <span className="mela-value">{fetchState.data.room_count}</span>
                  </div>
                </div>
              )}

              {fetchState.phase === "error" && (
                <div className="mela-error">
                  <div className="mela-status-row">
                    <span className="mela-dot offline" aria-label="Offline"></span>
                    <span className="mela-label">Status</span>
                    <span className="mela-value error">Unreachable</span>
                  </div>
                  <p className="mela-error-msg">{fetchState.message}</p>
                  <p className="mela-text muted">
                    Server offline. You can still play in Standalone 3D mode!
                  </p>
                </div>
              )}

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={() => setActiveView("game")}
                  style={{
                    backgroundColor: "#C41E3A",
                    color: "#FFF",
                    border: "2px solid #FFD700",
                    borderRadius: "14px",
                    padding: "12px 28px",
                    fontSize: "16px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(196, 30, 58, 0.5)",
                    transition: "transform 0.1s ease",
                  }}
                >
                  🎮 Enter 3D Mela (Playable World)
                </button>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Works standalone offline & with real-time multiplayer!
                </span>
              </div>
            </div>

            <div className="mela-brand-strip">
              <span style={{ color: COLORS.crimson }}>●</span>
              <span style={{ color: COLORS.gold }}>●</span>
              <span style={{ color: COLORS.saffron }}>●</span>
              <span style={{ color: COLORS.white }}>●</span>
            </div>
          </main>
        </div>
      )}

      {/* Floating Diagnostics Button when in 3D game */}
      {activeView === "game" && (
        <button
          onClick={() => setActiveView("status")}
          style={{
            position: "absolute",
            top: 70,
            left: 12,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            color: "#94a3b8",
            padding: "4px 8px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            zIndex: 20,
          }}
        >
          🔍 Server Diagnostics
        </button>
      )}
    </div>
  );
}
