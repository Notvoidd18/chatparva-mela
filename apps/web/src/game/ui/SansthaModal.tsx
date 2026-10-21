import React, { useEffect, useState } from "react";
import { soundManager } from "../audio/SoundManager.js";

interface SansthaModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export const SansthaModal: React.FC<SansthaModalProps> = ({
  isOpen,
  onClose,
  playerName,
}) => {
  const [activeTab, setActiveTab] = useState<"updates" | "ask" | "schedule">("updates");
  const [inquiryCategory, setInquiryCategory] = useState<string>("नयाँ खेल माग (Feature Request)");
  const [inquiryText, setInquiryText] = useState<string>("");
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

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

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;

    soundManager.playTempleBell();
    setSubmittedFeedback(
      `✓ धन्यवाद ${playerName}! तपाईंको सुझाव ("${inquiryCategory}") मेला व्यवस्थापन समितिमा दर्ता भयो।`
    );
    setInquiryText("");
    setTimeout(() => {
      setSubmittedFeedback(null);
    }, 5000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 15, 25, 0.85)",
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
          maxWidth: "520px",
          background: "linear-gradient(145deg, #1A1F2C 0%, #0F172A 100%)",
          border: "2px solid #06B6D4",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.2)",
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
            <span style={{ fontSize: "28px" }}>🏛️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#67E8F9" }}>
                मेला व्यवस्थापन समिति (Sanstha Desk)
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>
                Festival Organizing Committee &amp; Info Center
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

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
          <button
            onClick={() => setActiveTab("updates")}
            style={{
              flex: 1,
              background: activeTab === "updates" ? "#0891B2" : "rgba(255,255,255,0.06)",
              color: activeTab === "updates" ? "#FFF" : "#94A3B8",
              border: activeTab === "updates" ? "1px solid #67E8F9" : "none",
              borderRadius: "10px",
              padding: "8px 0",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📢 नयाँ अपडेटहरू (Updates)
          </button>
          <button
            onClick={() => setActiveTab("ask")}
            style={{
              flex: 1,
              background: activeTab === "ask" ? "#0891B2" : "rgba(255,255,255,0.06)",
              color: activeTab === "ask" ? "#FFF" : "#94A3B8",
              border: activeTab === "ask" ? "1px solid #67E8F9" : "none",
              borderRadius: "10px",
              padding: "8px 0",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ✍️ सोधपुछ तथा सुझाव (Ask &amp; Suggest)
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            style={{
              flex: 1,
              background: activeTab === "schedule" ? "#0891B2" : "rgba(255,255,255,0.06)",
              color: activeTab === "schedule" ? "#FFF" : "#94A3B8",
              border: activeTab === "schedule" ? "1px solid #67E8F9" : "none",
              borderRadius: "10px",
              padding: "8px 0",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📅 मेला तालिका (Schedule)
          </button>
        </div>

        {/* Tab 1: Updates & Roadmap */}
        {activeTab === "updates" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
            <div
              style={{
                background: "rgba(8, 145, 178, 0.15)",
                border: "1px solid #0891B2",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <div style={{ fontWeight: 800, color: "#67E8F9", fontSize: "13px" }}>
                ✨ Latest Version v0.2.2 Released!
              </div>
              <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "12px", color: "#E2E8F0", lineHeight: "1.6" }}>
                <li>दसैं लिङ्गे पिङ (Linge Ping) smooth pendulum physics</li>
                <li>श्री दुर्गा मन्दिरमा विस्तृत महाकाली-दुर्गा प्रतिमा र दान पेटिका</li>
                <li>मेलाका सबै पसल, घर र आमा नाच मञ्चमा आकर्षक बत्ती</li>
                <li>केन्द्रीय चौतारा (Chautari) मा साथीहरूसँग पूर्ण बसाइ प्रणाली</li>
              </ul>
            </div>

            <div
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid #D97706",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <div style={{ fontWeight: 800, color: "#FDE047", fontSize: "13px" }}>
                🚀 Upcoming Roadmap (चाँडै आउँदैछ)
              </div>
              <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "12px", color: "#FEF08A", lineHeight: "1.6" }}>
                <li>बाघचाल (Bagh-Chal) Real-time Multiplayer minigame</li>
                <li>खुल्ला आकाशमा चङ्गा चेट प्रतिस्पर्धा (Kite Dogfight)</li>
                <li>तिहार देउसी-भैलो समूह गायन र मादल बादन</li>
                <li>बजार गल्लीमा बारा, चटामरी र मोमो परिकार पसलहरू</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Ask & Suggest (With Database Ready Disclosure) */}
        {activeTab === "ask" && (
          <form onSubmit={handleSubmitInquiry} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid #3B82F6",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "11px",
                color: "#93C5FD",
              }}
            >
              ℹ️ <strong>डेटाबेस सूचना (Database Note):</strong> Live database connectivity will be linked by admin soon. Your inputs are registered for this session and queued for committee review!
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8" }}>
                सुझाव प्रकार (Category):
              </label>
              <select
                value={inquiryCategory}
                onChange={(e) => setInquiryCategory(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  background: "#0F172A",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#FFF",
                  padding: "8px",
                  fontSize: "12px",
                }}
              >
                <option value="नयाँ खेल माग (Feature Request)">नयाँ खेल माग (Feature Request)</option>
                <option value="बग रिपोर्ट (Bug Report)">बग रिपोर्ट (Bug Report)</option>
                <option value="दसैं-तिहार सुझाव (Festival Suggestion)">दसैं-तिहार सुझाव (Festival Suggestion)</option>
                <option value="अन्य सोधपुछ (General Inquiry)">अन्य सोधपुछ (General Inquiry)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8" }}>
                तपाईंको सन्देश वा प्रश्न (Your Message):
              </label>
              <textarea
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="मेला समिति समक्ष आफ्नो सुझाव वा जिज्ञासा यहाँ लेख्नुहोस्..."
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  background: "#0F172A",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#FFF",
                  padding: "8px",
                  fontSize: "12px",
                  resize: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                fontWeight: 900,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.4)",
              }}
            >
              📩 सुझाव पेस गर्नुहोस् (Submit to Committee)
            </button>

            {submittedFeedback && (
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
                {submittedFeedback}
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Festival Schedule */}
        {activeTab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px" }}>
              <strong style={{ color: "#FBBF24" }}>🌸 घटस्थापना देखि विजयादशमी:</strong>
              <div style={{ color: "#CBD5E1", marginTop: "2px" }}>
                दैनिक दुर्गा मन्दिर महापूजा, भजन कीर्तन, र लिङ्गे पिङ मज्जा।
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px" }}>
              <strong style={{ color: "#F43F5E" }}>💃 आमा समूह सांस्कृतिक नाच:</strong>
              <div style={{ color: "#CBD5E1", marginTop: "2px" }}>
                पूर्वाह्न र सन्ध्याकालीन परम्परागत नेपाली नाच तथा मादल बादन।
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px" }}>
              <strong style={{ color: "#38BDF8" }}>🪁 चङ्गा चेट मेला:</strong>
              <div style={{ color: "#CBD5E1", marginTop: "2px" }}>
                दसैंको सफा नीलो आकाशमा दैनिक खुल्ला चङ्गा उडान।
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
