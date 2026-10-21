import React, { useEffect } from "react";
import { soundManager } from "../audio/SoundManager.js";

export interface InventoryItem {
  id: "chiya" | "sel_roti" | "changa" | "tika_jamara" | "dhaka_topi";
  name: string;
  nepaliName: string;
  icon: string;
  quantity: number;
  category: "food" | "cosmetic" | "equipment";
  description: string;
  effect: string;
  canEat?: boolean;
  canUse?: boolean;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  npr: number;
  inventory: {
    chiya: number;
    selRoti: number;
    hasChanga: boolean;
    hasTika: boolean;
    hasDhakaTopi: boolean;
    dhakaTopiColor: string;
  };
  onEatItem: (itemType: "chiya" | "sel_roti") => void;
  onToggleChanga: () => void;
  isKiteFlying: boolean;
  onEquipItem?: (itemId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  npr,
  inventory,
  onEatItem,
  onToggleChanga,
  isKiteFlying,
  onEquipItem,
}) => {
  // Listen for Escape or 'I' key to close inventory
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "KeyI") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: InventoryItem[] = [
    {
      id: "sel_roti",
      name: "Sel Roti (सेल रोटी)",
      nepaliName: "सेल रोटी",
      icon: "🍩",
      quantity: inventory.selRoti,
      category: "food",
      description: "Crispy fried traditional Nepali ring-shaped rice pastry cooked in pure ghee.",
      effect: "+25 Score, Instant festive celebration effect!",
      canEat: true,
    },
    {
      id: "chiya",
      name: "Masala Chiya (मसला चिया)",
      nepaliName: "मसला चिया",
      icon: "☕",
      quantity: inventory.chiya,
      category: "food",
      description: "Steaming hot spiced Himalayan milk tea infused with cardamom, ginger, and cloves.",
      effect: "+35% Sprint Speed boost for 30 seconds!",
      canEat: true,
    },
    {
      id: "changa",
      name: "Changa & Lattai (चङ्गा र लट्टाई)",
      nepaliName: "चङ्गा",
      icon: "🪁",
      quantity: inventory.hasChanga ? 1 : 0,
      category: "equipment",
      description: "Handcrafted Dashain paper kite with bamboo struts and glass-powdered Manja string spool.",
      effect: "Soar and fly your kite freely across open festival grounds!",
      canUse: true,
    },
    {
      id: "tika_jamara",
      name: "Dashain Tika & Jamara (रातो टीका र जमरा)",
      nepaliName: "टीका र जमरा",
      icon: "🌸",
      quantity: inventory.hasTika ? 1 : 0,
      category: "cosmetic",
      description: "Sacred crimson Akshata vermilion on forehead with golden barley seedlings of prosperity.",
      effect: "Bestowed by family elders at traditional Tika houses (+NPR 50 Dakshina)!",
    },
    {
      id: "dhaka_topi",
      name: "Palpali Dhaka Topi (ढाका टोपी)",
      nepaliName: "ढाका टोपी",
      icon: "🎩",
      quantity: inventory.hasDhakaTopi ? 1 : 0,
      category: "cosmetic",
      description: "Traditional Nepali national headwear woven with handloom Palpali geometric patterns.",
      effect: "Festive pride and elegant cultural appearance.",
    },
  ];

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
          backgroundColor: "#1e1b18",
          border: "2px solid #ca8a04",
          borderRadius: "20px",
          width: "92%",
          maxWidth: "640px",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "24px",
          color: "#f5f5f4",
          boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#facc15", display: "flex", alignItems: "center", gap: "8px" }}>
              🎒 Festival Inventory (झोला)
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#a8a29e" }}>
              Your festival items, food supplies &amp; Dashain blessings • Press [I] or [Esc] to close
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#292524",
              border: "1px solid #78716c",
              color: "#e7e5e4",
              borderRadius: "10px",
              padding: "6px 12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Currency Card (Nepalese Rupees - NPR) */}
        <div
          style={{
            backgroundColor: "#292524",
            border: "1px solid #ca8a04",
            borderRadius: "14px",
            padding: "12px 18px",
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>💰</span>
            <div>
              <div style={{ fontSize: "11px", color: "#a8a29e", textTransform: "uppercase", letterSpacing: "1px" }}>
                Festival Currency
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#fde047" }}>
                रू {npr.toLocaleString()} <span style={{ fontSize: "12px", color: "#facc15" }}>NPR</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1", maxWidth: "240px", textAlign: "right" }}>
            Earn NPR by lighting Tihar Diyas (+NPR 10) &amp; receiving Elder Tika blessings (+NPR 50)!
          </div>
        </div>

        {/* Items Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {items.map((item) => {
            const isOwned = item.quantity > 0;
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: isOwned ? "#26221f" : "#171412",
                  border: isOwned ? "1px solid #78350f" : "1px solid #292524",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: isOwned ? 1 : 0.65,
                  transition: "all 0.15s ease",
                  cursor: isOwned ? "pointer" : "default",
                }}
                onClick={() => {
                  if (isOwned && onEquipItem) {
                    onEquipItem(item.id);
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#3a2a1a",
                      borderRadius: "12px",
                      border: isOwned ? "1px solid #ca8a04" : "1px solid #44403c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "14px", color: isOwned ? "#fde047" : "#a8a29e" }}>
                        {item.name}
                      </strong>
                      <span
                        style={{
                          backgroundColor: isOwned ? "#047857" : "#44403c",
                          color: "#fff",
                          borderRadius: "8px",
                          padding: "1px 7px",
                          fontSize: "10px",
                          fontWeight: 800,
                        }}
                      >
                        {item.category === "food" ? `Qty: ${item.quantity}` : isOwned ? "Owned" : "Not Owned"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px" }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "2px" }}>
                      ✨ {item.effect}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {item.canEat && (
                    <button
                      onClick={() => onEatItem(item.id as "chiya" | "sel_roti")}
                      disabled={item.quantity <= 0}
                      style={{
                        backgroundColor: item.quantity > 0 ? "#ea580c" : "#44403c",
                        color: "#fff",
                        border: item.quantity > 0 ? "1px solid #fb923c" : "none",
                        borderRadius: "10px",
                        padding: "8px 16px",
                        fontSize: "12px",
                        fontWeight: 900,
                        cursor: item.quantity > 0 ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap",
                        boxShadow: item.quantity > 0 ? "0 2px 8px rgba(234,88,12,0.4)" : "none",
                      }}
                    >
                      {item.id === "chiya" ? "☕ Sip Chiya" : "🍩 Eat Roti"}
                    </button>
                  )}

                  {item.id === "changa" && (
                    <button
                      onClick={onToggleChanga}
                      disabled={!isOwned}
                      style={{
                        backgroundColor: !isOwned ? "#44403c" : isKiteFlying ? "#dc2626" : "#0284c7",
                        color: "#fff",
                        border: isOwned ? "1px solid #38bdf8" : "none",
                        borderRadius: "10px",
                        padding: "8px 16px",
                        fontSize: "12px",
                        fontWeight: 900,
                        cursor: isOwned ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isKiteFlying ? "Reel In Kite ✕" : "🪁 Fly Changa"}
                    </button>
                  )}

                  {!item.canEat && item.id !== "changa" && isOwned && (
                    <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 800 }}>
                      ✓ Equipped
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #44403c", paddingTop: "12px", fontSize: "11px", color: "#a8a29e" }}>
          <span>Tip: Visit festival market stalls to buy more food &amp; goods!</span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#292524",
              border: "1px solid #78716c",
              color: "#f5f5f4",
              borderRadius: "8px",
              padding: "4px 12px",
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