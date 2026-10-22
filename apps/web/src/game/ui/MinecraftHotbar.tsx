import React, { useState } from "react";

export interface HotbarItem {
  id: string;
  name: string;
  nepaliName: string;
  renderIcon: () => React.ReactNode;
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

// ─── Custom Clean SVG Icons (NO EMOJIS) ───────────────────────────────────────
const Icons = {
  Hand: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-4 0v5"/>
      <path d="M14 10V4a2 2 0 0 0-4 0v7"/>
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  ),
  Chiya: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" y1="2" x2="6" y2="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  ),
  SelRoti: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="3.5" fill="#18181B"/>
    </svg>
  ),
  Kite: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 21 11 12 20 3 11" fill="rgba(56, 189, 248, 0.2)"/>
      <line x1="12" y1="2" x2="12" y2="20"/>
      <line x1="3" y1="11" x2="21" y2="11"/>
      <path d="M12 20l2 3-2 1-2-1z" fill="#FBBF24"/>
    </svg>
  ),
  DhakaTopi: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18h16l-3-10H7L4 18z" fill="rgba(239, 68, 68, 0.25)"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <line x1="10" y1="8" x2="14" y2="18"/>
      <line x1="14" y1="8" x2="10" y2="18"/>
    </svg>
  ),
  Tika: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="10" r="4.5" fill="#E11D48"/>
      <path d="M12 14v8" stroke="#16A34A" strokeWidth="2.5"/>
      <path d="M9 18l3-2 3 2" stroke="#16A34A" strokeWidth="2"/>
    </svg>
  ),
};

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

  // Dynamic Item List: ONLY display items the player currently owns, starting with slot 0 (Empty Hands)
  const items: HotbarItem[] = [
    {
      id: "bare_hands",
      name: "Empty Hands",
      nepaliName: "खाली हात",
      renderIcon: Icons.Hand,
      count: 0,
      actionLabel: "Unequip Item",
      canUse: true,
      description: "Default free hands mode. Ready to explore, jump, ride the swing, or clap.",
    },
  ];

  if (chiyaCount > 0) {
    items.push({
      id: "chiya",
      name: "Masala Chiya",
      nepaliName: "मसाला चिया",
      renderIcon: Icons.Chiya,
      count: chiyaCount,
      actionLabel: "Sip Chiya",
      canUse: true,
      description: "Hot spiced tea brewed with cloves and cardamom. Grants +Speed boost!",
    });
  }

  if (selRotiCount > 0) {
    items.push({
      id: "sel_roti",
      name: "Sel Roti",
      nepaliName: "सेल रोटी",
      renderIcon: Icons.SelRoti,
      count: selRotiCount,
      actionLabel: "Eat Sel Roti",
      canUse: true,
      description: "Crispy traditional Dashain sweet bread fried in pure ghee. Grants points!",
    });
  }

  if (hasChanga) {
    items.push({
      id: "changa",
      name: "Dashain Changa",
      nepaliName: "चङ्गा र लट्टाई",
      renderIcon: Icons.Kite,
      count: 1,
      actionLabel: isKiteFlying ? "Reel In Kite" : "Fly Changa",
      canUse: true,
      description: "Traditional diamond kite and bamboo spool. Fly high in the clear blue sky!",
    });
  }

  if (hasDhakaTopi) {
    items.push({
      id: "dhaka_topi",
      name: "Dhaka Topi",
      nepaliName: "ढाका टोपी",
      renderIcon: Icons.DhakaTopi,
      count: 1,
      actionLabel: "Toggle Topi",
      canUse: true,
      description: "Traditional hand-woven Palpali geometric cap representing Nepali pride.",
    });
  }

  if (hasTika) {
    items.push({
      id: "tika_jamara",
      name: "Tika & Jamara",
      nepaliName: "रातो टीका र जमरा",
      renderIcon: Icons.Tika,
      count: 1,
      actionLabel: "Blessed",
      canUse: false,
      description: "Sacred Dashain red rice Akshata and golden-green Jamara sprigs from village elders.",
    });
  }

  // Ensure selected slot stays within valid range
  const currentSlotIndex = Math.min(selectedSlot, items.length - 1);
  const activeItem = items[currentSlotIndex] ?? items[0];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {/* Active Item Description Tooltip */}
      {activeItem && (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.92)",
            border: "1px solid rgba(250, 204, 21, 0.4)",
            borderRadius: "12px",
            padding: "4px 12px",
            color: "#FEF08A",
            fontSize: "11px",
            fontWeight: 800,
            boxShadow: "0 4px 14px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{activeItem.nepaliName}</span>
          <span style={{ color: "#94A3B8", fontWeight: 600 }}>({activeItem.name})</span>
          {activeItem.canUse && activeItem.id !== "bare_hands" && (
            <button
              onClick={() => onUseItem(activeItem.id)}
              style={{
                background: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
                border: "1px solid #34D399",
                borderRadius: "6px",
                padding: "2px 8px",
                color: "#FFF",
                fontSize: "10px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {activeItem.actionLabel}
            </button>
          )}
        </div>
      )}

      {/* Dynamic Hotbar Slots */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          background: "rgba(18, 18, 24, 0.88)",
          backdropFilter: "blur(14px)",
          border: "2px solid rgba(250, 204, 21, 0.35)",
          borderRadius: "16px",
          padding: "6px 8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.75)",
        }}
      >
        {items.map((item, index) => {
          const isSelected = index === currentSlotIndex;
          const isHovered = hoveredSlot === index;

          return (
            <div
              key={item.id}
              onClick={() => {
                onSelectSlot(index);
                onUseItem(item.id);
              }}
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: isSelected
                  ? "linear-gradient(135deg, rgba(185, 28, 28, 0.6) 0%, rgba(217, 119, 6, 0.6) 100%)"
                  : isHovered
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(30, 41, 59, 0.65)",
                border: isSelected
                  ? "2px solid #FCD34D"
                  : "1.5px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.15s ease",
                transform: isSelected ? "scale(1.08)" : "scale(1)",
                boxShadow: isSelected ? "0 4px 14px rgba(250, 204, 21, 0.35)" : "none",
              }}
              title={`${item.name} [${index + 1}]`}
            >
              {/* Slot Number Keybind (1, 2, 3...) */}
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "5px",
                  fontSize: "9px",
                  fontWeight: 900,
                  color: isSelected ? "#FDE047" : "#64748B",
                }}
              >
                {index + 1}
              </span>

              {/* Vector Icon */}
              <div style={{ marginTop: "2px" }}>
                {item.renderIcon()}
              </div>

              {/* Item Count Badge if > 1 */}
              {item.count > 1 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "4px",
                    fontSize: "10px",
                    fontWeight: 900,
                    color: "#FFF",
                    background: "#0284C7",
                    borderRadius: "4px",
                    padding: "0 4px",
                    lineHeight: "1.2",
                  }}
                >
                  {item.count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
