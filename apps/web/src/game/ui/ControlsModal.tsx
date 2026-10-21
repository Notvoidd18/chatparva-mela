import React from "react";

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const keyGroups = [
    {
      category: "🏃 Movement & Exploration",
      items: [
        { keys: ["W", "A", "S", "D"], desc: "Move your Yatri around the Mela" },
        { keys: ["Arrow Keys"], desc: "Alternative movement keys" },
        { keys: ["Spacebar"], desc: "Jump / Pump Linge Ping swing" },
        { keys: ["Shift"], desc: "Sprint fast through festival grounds" },
        { keys: ["Mouse Drag"], desc: "Orbit 3D camera / Look around" },
      ],
    },
    {
      category: "🎪 Festival Mini-Games & Interactions",
      items: [
        { keys: ["E"], desc: "Interact (Ride Ping, Light Diya, Play Taas, Buy Sel Roti)" },
        { keys: ["W / S", "or Space"], desc: "Pump Linge Ping to swing higher & higher!" },
        { keys: ["1", "2", "3", "4"], desc: "Use hotbar items (Chiya, Sel Roti, Kite, Diya)" },
        { keys: ["B"], desc: "Open Nepali Cultural Emotes (Namaste, Nach, Wave)" },
        { keys: ["C", "or Enter"], desc: "Open Festival Live Chat" },
        { keys: ["Esc"], desc: "Close menus / Pause game" },
      ],
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 5, 2, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1c1917",
          border: "2px solid #ca8a04",
          borderRadius: "20px",
          width: "92%",
          maxWidth: "560px",
          padding: "24px 28px",
          color: "#f5f5f4",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #44403c", paddingBottom: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#facc15", display: "flex", alignItems: "center", gap: "10px" }}>
            🎮 Festival Game Controls &amp; Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "#cbd5e1",
              fontSize: "18px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>
          {keyGroups.map((group, idx) => (
            <div key={idx}>
              <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#f59e0b", fontWeight: 700 }}>
                {group.category}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(41, 37, 36, 0.7)",
                      border: "1px solid rgba(120, 113, 108, 0.4)",
                      padding: "8px 12px",
                      borderRadius: "10px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {item.keys.map((k, kIdx) => (
                        <span
                          key={kIdx}
                          style={{
                            backgroundColor: "#292524",
                            border: "1px solid #78716c",
                            boxShadow: "0 2px 0 #44403c",
                            color: "#fef08a",
                            fontWeight: 800,
                            fontSize: "11px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: "12px", color: "#e7e5e4", textAlign: "right" }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#b91c1c",
              color: "#fff",
              border: "1px solid #f59e0b",
              borderRadius: "10px",
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(185, 28, 28, 0.4)",
            }}
          >
            Got it, Let's Play! 🙏
          </button>
        </div>
      </div>
    </div>
  );
};
