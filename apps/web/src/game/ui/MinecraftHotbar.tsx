import React, { useEffect, useState } from "react";

export interface HotbarItem {
  id: string;
  name: string;
  nepaliName: string;
  icon: string;
  count: number;
  actionLabel: string;
  canUse: boolean;
  description: string;
}

interface MinecraftHotbarProps {
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  onUseItem: (itemId: string) => void;
  chiyaCount: number;
  selRotiCount: number;
  hasChanga: boolean;
  hasDhakaTopi: boolean;
  hasTika: boolean;
  isKiteFlying: boolean;
  nearbyInteraction: string | null;
  onInteract: () => void;
}

export const MinecraftHotbar: React.FC<MinecraftHotbarProps> = ({
  selectedSlot,
  onSelectSlot,
  onUseItem,
  chiyaCount,
  selRotiCount,
  hasChanga,
  hasDhakaTopi,
  hasTika,
  isKiteFlying,
  nearbyInteraction,
  onInteract,
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const slots: HotbarItem[] = [
    {
      id: "chiya",
      name: "Masala Chiya",
      nepaliName: "मसाला चिया",
      icon: "☕",
      count: chiyaCount,
      actionLabel: "Sip Chiya",
      canUse: chiyaCount > 0,
      description: "Hot spiced tea brewed with cloves and cardamom. Grants +Speed boost!",
    },
    {
      id: "sel_roti",
      name: "Sel Roti",
      nepaliName: "सेल रोटी",
      icon: "🍩",
      count: selRotiCount,
      actionLabel: "Eat Sel Roti",
      canUse: selRotiCount > 0,
      description: "Traditional sweet crispy rice bread fried in pure ghee. Awards +25 Points!",
    },
    {
      id: "changa",
      name: "Changa & Lattai",
      nepaliName: "चङ्गा र लट्टाई",
      icon: "🪁",
      count: hasChanga ? 1 : 0,
      actionLabel: isKiteFlying ? "Reel In Kite" : "Fly Changa",
      canUse: hasChanga,
      description: "Traditional diamond kite and bamboo string spool for flying in open fairgrounds.",
    },
    {
      id: "dhaka_topi",
      name: "Dhaka Topi",
      nepaliName: "ढाका टोपी",
      icon: "🎩",
      count: hasDhakaTopi ? 1 : 0,
      actionLabel: "Toggle Topi",
      canUse: hasDhakaTopi,
      description: "Traditional hand-woven Palpali geometric cap representing Mount Everest pride.",
    },
    {
      id: "tika_jamara",
      name: "Tika & Jamara",
      nepaliName: "रातो टीका र जमरा",
      icon: "🌸",
      count: hasTika ? 1 : 0,
      actionLabel: "View Blessing",
      canUse: hasTika,
      description: "Sacred Dashain red rice Akshata and golden-green Jamara sprigs from village elders.",
    },
    {
      id: "diya",
      name: "Tihar Diya",
      nepaliName: "माटोको पाला",
      icon: "🪔",
      count: 1,
      actionLabel: "Light Lamp",
      canUse: true,
      description: "Clay oil lamp lit during Deepawali / Tihar to welcome Goddess Lakshmi.",
    },
    {
      id: "tash",
      name: "Dashain Tash",
      nepaliName: "तास / बाघचाल",
      icon: "🃏",
      count: 1,
      actionLabel: "Play Cards",
      canUse: true,
      description: "Traditional Dashain gathering card games (Marriage, Teen Patti & Kitti).",
    },
  ];

  // Number Keys 1-7 and Use key (F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in chat
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= slots.length) {
        onSelectSlot(num - 1);
      } else if (e.code === "KeyF") {
        const item = slots[selectedSlot];
        if (item && item.canUse) {
          onUseItem(item.id);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Only capture when mouse is near bottom
      if (e.clientY > window.innerHeight - 120) {
        if (e.deltaY > 0) {
          onSelectSlot((selectedSlot + 1) % slots.length);
        } else if (e.deltaY < 0) {
          onSelectSlot((selectedSlot - 1 + slots.length) % slots.length);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [selectedSlot, slots, onSelectSlot, onUseItem]);

  const activeItem = slots[selectedSlot];
  const displayedTooltip = hoveredSlot !== null ? slots[hoveredSlot] : activeItem;

  const getInteractionPrompt = (type: string | null) => {
    switch (type) {
      case "ping":
        return { label: "🎋 [E] Ride Linge Ping (Bamboo Swing)", color: "#f59e0b" };
      case "chautari":
        return { label: "🪑 [E] Sit at Central Chautari under Banyan Tree", color: "#ca8a04" };
      case "langur":
        return { label: "🎲 [E] Play Langur Burja Dice Game", color: "#10b981" };
      case "taas":
        return { label: "🃏 [E] Sit in Forest Taas Circle", color: "#6366f1" };
      case "diya":
        return { label: "🕯️ [E] Light Ceremonial Tihar Diya", color: "#f97316" };
      case "tika1":
        return { label: "🌸 [E] Bada Dashain Mula Ghar (Elder Blessing)", color: "#ef4444" };
      case "tika2":
        return { label: "🌸 [E] Maiti Ghar Courtyard (Elder Blessing)", color: "#ec4899" };
      case "aama_samuha":
        return { label: "💃 [E] Sit & Celebrate with Aama Samuha", color: "#f59e0b" };
      case "mandir":
        return { label: "🛕 [E] Offer Prayers at Durga Mata Mandir", color: "#facc15" };
      case "dan_peti":
        return { label: "🪙 [E] Open Dan Peti (दान पेटिका)", color: "#eab308" };
      case "sanstha":
        return { label: "🏛️ [E] Mela Samiti Office / Inquire Updates (सचिवालय)", color: "#06b6d4" };
      case "chiya":
        return { label: "☕ [E] Ramesh Dai's Chiya Pasal (रू २०)", color: "#d97706" };
      case "sel_roti":
        return { label: "🍩 [E] Sita Didi's Sel Roti Stall (रू ३०)", color: "#0d9488" };
      case "changa":
        return { label: "🪁 [E] Bikash's Kite & Lattai Shop (रू ५०)", color: "#0284c7" };
      case "dhaka":
        return { label: "🎩 [E] Pooja Didi's Dhaka Topi Stall (रू ८०)", color: "#854d0e" };
      default:
        return null;
    }
  };

  const prompt = getInteractionPrompt(nearbyInteraction);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        zIndex: 150,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* ─── Context-Sensitive Interaction Prompt (Phase 1) ────────────────── */}
      {prompt && (
        <button
          onClick={onInteract}
          style={{
            pointerEvents: "auto",
            backgroundColor: "rgba(24, 18, 14, 0.94)",
            border: `2px solid ${prompt.color}`,
            borderRadius: "20px",
            padding: "8px 20px",
            color: "#fef08a",
            fontWeight: 900,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: `0 6px 20px rgba(0,0,0,0.6), 0 0 14px ${prompt.color}44`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            animation: "pulse 2s infinite ease-in-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          {prompt.label}
        </button>
      )}

      {/* ─── Active Slot Tooltip ───────────────────────────────────────────── */}
      {displayedTooltip && (
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(245, 158, 11, 0.5)",
            borderRadius: "10px",
            padding: "4px 12px",
            color: "#FDE047",
            fontSize: "11px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        >
          <span>{displayedTooltip.icon} {displayedTooltip.name} ({displayedTooltip.nepaliName})</span>
          {displayedTooltip.canUse && (
            <span style={{ color: "#38bdf8", fontSize: "10px", fontWeight: 700 }}>
              • Press [F] or Click to {displayedTooltip.actionLabel}
            </span>
          )}
        </div>
      )}

      {/* ─── Minecraft-Style Hotbar Row (Phase 2) ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          backgroundColor: "rgba(18, 12, 8, 0.92)",
          backdropFilter: "blur(8px)",
          padding: "6px",
          borderRadius: "14px",
          border: "2px solid rgba(180, 83, 9, 0.5)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)",
          pointerEvents: "auto",
        }}
      >
        {slots.map((item, idx) => {
          const isSelected = selectedSlot === idx;
          const isOwned = item.count > 0;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isSelected && item.canUse) {
                  onUseItem(item.id);
                } else {
                  onSelectSlot(idx);
                }
              }}
              onMouseEnter={() => setHoveredSlot(idx)}
              onMouseLeave={() => setHoveredSlot(null)}
              style={{
                width: "52px",
                height: "52px",
                position: "relative",
                backgroundColor: isSelected ? "rgba(245, 158, 11, 0.22)" : "rgba(35, 24, 18, 0.75)",
                border: isSelected
                  ? "2px solid #FCD34D"
                  : "2px solid rgba(80, 50, 30, 0.6)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: isSelected
                  ? "0 0 12px rgba(251, 191, 36, 0.5), inset 0 0 6px rgba(251, 191, 36, 0.3)"
                  : "inset 0 2px 4px rgba(0,0,0,0.4)",
                transition: "all 0.12s ease",
                transform: isSelected ? "translateY(-4px)" : "none",
                opacity: isOwned ? 1 : 0.35,
              }}
            >
              {/* Slot Number Indicator (1-7) */}
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: 4,
                  fontSize: "9px",
                  fontWeight: 800,
                  color: isSelected ? "#FDE047" : "#94A3B8",
                }}
              >
                {idx + 1}
              </span>

              {/* Item Icon */}
              <span style={{ fontSize: "24px", filter: isOwned ? "none" : "grayscale(80%)" }}>
                {item.icon}
              </span>

              {/* Stack Quantity Badge */}
              {item.count > 1 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 4,
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    textShadow: "1px 1px 2px #000, -1px -1px 2px #000",
                  }}
                >
                  {item.count}
                </span>
              )}

              {/* Active Selection Indicator */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -3,
                    width: "16px",
                    height: "3px",
                    backgroundColor: "#FCD34D",
                    borderRadius: "2px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
