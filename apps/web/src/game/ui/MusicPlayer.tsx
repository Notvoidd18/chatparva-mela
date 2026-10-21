import React, { useEffect, useRef, useState } from "react";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  videoId: string;
}

const PLAYLIST: MusicTrack[] = [
  {
    id: "track-aama",
    title: "Aama Samuha Deusi-Bhailo (आमा समूह देउसी-भैलो)",
    artist: "Nepali Cultural Folk Ensemble",
    videoId: "NvBr2Ad6ysk",
  },
  {
    id: "track-1",
    title: "Dashain Tihar (दशैं तिहार)",
    artist: "Trishna Gurung",
    videoId: "RqQ0nrcOzQk",
  },
  {
    id: "track-2",
    title: "Malshree Dhun (मालश्री धुन)",
    artist: "Traditional Nepali Instrumental",
    videoId: "N0rS5sWwzBw",
  },
  {
    id: "track-3",
    title: "Tihar Bhailo Song (भैलो गीत)",
    artist: "Nepali Cultural Ensemble",
    videoId: "wVvT0yQ8h7E",
  },
];

interface MusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  spatialVolumeMultiplier?: number; // 0.0 to 1.0 (raised near Aama Samuha)
  activeTrackId?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  spatialVolumeMultiplier = 1.0,
  activeTrackId,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Sync to activeTrackId if specified (e.g. proximity to Aama Samuha)
  useEffect(() => {
    if (activeTrackId) {
      const idx = PLAYLIST.findIndex((t) => t.id === activeTrackId);
      if (idx !== -1 && idx !== currentTrackIndex) {
        setCurrentTrackIndex(idx);
      }
    }
  }, [activeTrackId]);
  const [volume, setVolume] = useState(35); // default 35%
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (iframeRef.current) {
      if (isPlaying && !isMuted) {
        const vid = currentTrack.videoId;
        iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&loop=1&playlist=${vid}&enablejsapi=1&origin=${window.location.origin}`;
      } else {
        iframeRef.current.src = "";
      }
    }
  }, [isPlaying, isMuted, currentTrackIndex]);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 68,
        right: 12,
        zIndex: 140,
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {/* Hidden YouTube audio player */}
      <div style={{ width: 0, height: 0, opacity: 0, pointerEvents: "none", overflow: "hidden" }}>
        <iframe
          ref={iframeRef}
          title="Dashain Tihar Festival Music"
          width="200"
          height="200"
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Floating Music Widget */}
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.94)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(245, 158, 11, 0.5)",
          borderRadius: "14px",
          padding: "6px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          color: "#f8fafc",
          boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
          fontSize: "11px",
          minWidth: isExpanded ? "260px" : "200px",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
            <span style={{ fontSize: "14px" }}>{isPlaying && !isMuted ? "🎵" : "🔇"}</span>
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <strong
                style={{
                  color: "#fbbf24",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {currentTrack.title}
              </strong>
              <span style={{ color: "#94a3b8", fontSize: "9px" }}>{currentTrack.artist}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={onTogglePlay}
              style={{
                backgroundColor: isPlaying ? "#b45309" : "#059669",
                color: "#FFF",
                border: "none",
                borderRadius: "8px",
                padding: "3px 8px",
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "11px",
                padding: "2px 4px",
              }}
            >
              {isExpanded ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* Expanded Controls: Next / Prev, Volume slider, Mute */}
        {isExpanded && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              borderTop: "1px solid #334155",
              paddingTop: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={handlePrevTrack}
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#FFF",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  ⏮ Prev
                </button>
                <button
                  onClick={handleNextTrack}
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#FFF",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Next ⏭
                </button>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  backgroundColor: isMuted ? "#dc2626" : "#334155",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Vol:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                style={{ width: "100%", accentColor: "#f59e0b", height: "4px" }}
              />
              <span style={{ fontSize: "10px", color: "#fef08a", minWidth: "24px" }}>
                {isMuted ? "0%" : `${volume}%`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
