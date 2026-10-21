import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { FestivalWorld } from "./world/FestivalWorld.js";
import { DayNightCycle } from "./world/DayNightCycle.js";
import { LocalPlayerController } from "./player/LocalPlayerController.js";
import { RemotePlayer } from "./player/RemotePlayer.js";
import { GameHUD } from "./ui/GameHUD.js";
import { LangurBurjaModal } from "./ui/LangurBurjaModal.js";
import { TashGameModal } from "./ui/TashGameModal.js";
import { MarketStallModal } from "./ui/MarketStallModal.js";
import { InventoryModal } from "./ui/InventoryModal.js";
import { UsernameModal } from "./ui/UsernameModal.js";
import { TikaBlessingModal } from "./ui/TikaBlessingModal.js";
import { SettingsModal } from "./ui/SettingsModal.js";
import { DanPetiModal } from "./ui/DanPetiModal.js";
import { SansthaModal } from "./ui/SansthaModal.js";
import { MusicPlayer } from "./ui/MusicPlayer.js";
import { soundManager } from "./audio/SoundManager.js";
import { networkManager, type RemotePlayerData } from "./network/NetworkManager.js";
import { INITIAL_DIYA_STATIONS, ATTRACTION_LOCATIONS } from "@melaverse/shared";
import type {
  AnimationState,
  AvatarCustomization,
  ChatMessage,
  EmoteType,
  LangurSymbol,
} from "@melaverse/shared";

export const MelaGame: React.FC = () => {
  // Player name & identity (Phase 8)
  const [displayName, setDisplayName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("chatparva_username");
      if (saved && saved.length >= 3) return saved;
    } catch {}
    return `Yatri-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem("chatparva_username");
    } catch {
      return false;
    }
  });

  // Customization
  const [customization, setCustomization] = useState<AvatarCustomization>({
    color: "#C41E3A",
    dhakaTopiColor: "#8B0000",
    hasDhakaTopi: true,
    hasVest: true,
    vestColor: "#D97706",
    skinTone: "#E0AC69",
    hasTika: false,
    hasJamara: false,
  });

  // Currency & Inventory (Phase 4 & 9D)
  const [npr, setNpr] = useState<number>(100);
  const [tokens, setTokens] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [inventory, setInventory] = useState({
    chiya: 0,
    selRoti: 0,
    hasChanga: false,
    hasTika: false,
    hasDhakaTopi: true,
    dhakaTopiColor: "#8B0000",
  });
  const [hasReceivedTikaReward, setHasReceivedTikaReward] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);

  // Active Emote & Actions
  const [activeEmote, setActiveEmote] = useState<EmoteType | null>(null);
  const [activeAction, setActiveAction] = useState<"drinking" | "eating" | "wearing_topi" | "flying_kite" | null>(null);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [heldItem, setHeldItem] = useState<"chiya" | "sel_roti" | "kite" | "diya" | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);

  // Interactive Changa (Kite Flying)
  const [isKiteFlying, setIsKiteFlying] = useState<boolean>(false);
  const [kiteData, setKiteData] = useState<{ x: number; y: number; z: number; bank: number }>({
    x: 0,
    y: 28,
    z: 0,
    bank: 0,
  });
  const [localPlayerPos, setLocalPlayerPos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 46 });

  // Floating celebratory feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastPumpTimeRef = useRef<number>(0);

  // Multiplayer State (Phase 2)
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "online" | "reconnecting" | "disconnected">("connecting");
  const [currentServerId, setCurrentServerId] = useState<string>("melaverse-server-1");
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayerData>>(new Map());
  const [ping, setPing] = useState<number>(0);

  // Attractions & Mini-Games State
  const [nearbyInteraction, setNearbyInteraction] = useState<string | null>(null);
  const [isSeatedOnSwing, setIsSeatedOnSwing] = useState<boolean>(false);
  const [swingAngle, setSwingAngle] = useState<number>(0);
  const [swingSpeed, setSwingSpeed] = useState<number>(0);
  const [isSeatedAtTaas, setIsSeatedAtTaas] = useState<boolean>(false);
  const [taasPlayerCount, setTaasPlayerCount] = useState<number>(0);

  const [diyaStates, setDiyaStates] = useState<Map<string, { isLit: boolean; litBy?: string }>>(() => {
    const map = new Map();
    INITIAL_DIYA_STATIONS.forEach((s) => map.set(s.id, { isLit: false }));
    return map;
  });

  // Modals State
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState<number>(0);
  const [isSeatedAtAama, setIsSeatedAtAama] = useState<boolean>(false);
  const [isSeatedAtChautari, setIsSeatedAtChautari] = useState<boolean>(false);
  const [swingOccupantName, setSwingOccupantName] = useState<string | null>(null);
  const [isBlessingActive, setIsBlessingActive] = useState<boolean>(false);
  const [blessingActiveElder, setBlessingActiveElder] = useState<"house1" | "house2" | null>(null);
  const [timeOfDayPhase, setTimeOfDayPhase] = useState<"morning" | "day" | "sunset" | "night">("day");
  const [isNight, setIsNight] = useState<boolean>(false);
  const [interactionTarget, setInteractionTarget] = useState<{ x: number; z: number } | null>(null);

  const [isLangurModalOpen, setIsLangurModalOpen] = useState<boolean>(false);
  const [langurPhase, setLangurPhase] = useState<string>("betting");
  const [langurTimer, setLangurTimer] = useState<number>(15);
  const [langurDice, setLangurDice] = useState<string[]>(["jhanda", "burja", "ita", "paan", "hukum", "chidi"]);
  const [myBets, setMyBets] = useState<Map<string, number>>(new Map());

  const [isTaasModalOpen, setIsTaasModalOpen] = useState<boolean>(false);
  const [activeStallModal, setActiveStallModal] = useState<"chiya" | "sel_roti" | "changa" | "dhaka" | null>(null);
  const [activeTikaModal, setActiveTikaModal] = useState<"house1" | "house2" | null>(null);
  const [isDanPetiModalOpen, setIsDanPetiModalOpen] = useState<boolean>(false);
  const [isSansthaModalOpen, setIsSansthaModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // UI & Settings State
  const [graphicsQuality, setGraphicsQuality] = useState<"low" | "medium" | "high">("medium");
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showMobileControls, setShowMobileControls] = useState<boolean>(() => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  });
  const [virtualJoystick, setVirtualJoystick] = useState<{ x: number; y: number } | null>(null);
  const [virtualJump, setVirtualJump] = useState<boolean>(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Global Escape & Interaction key listeners (Phase 1 Fix)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;

      if (e.code === "Escape") {
        if (isInventoryOpen) setIsInventoryOpen(false);
        if (activeStallModal) setActiveStallModal(null);
        if (activeTikaModal) setActiveTikaModal(null);
        if (isDanPetiModalOpen) setIsDanPetiModalOpen(false);
        if (isSansthaModalOpen) setIsSansthaModalOpen(false);
        if (isLangurModalOpen) setIsLangurModalOpen(false);
        if (isTaasModalOpen) {
          setIsTaasModalOpen(false);
          setIsSeatedAtTaas(false);
        }
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isKiteFlying) {
          setIsKiteFlying(false);
          setActiveAction(null);
          networkManager.toggleChanga(false);
          showToast("Kite string safely reeled in! 🪁");
        }
        if (isSeatedOnSwing) {
          setIsSeatedOnSwing(false);
          networkManager.interactPingSwing();
        }
      } else if (e.code === "KeyI") {
        setIsInventoryOpen((prev) => !prev);
        soundManager.playTempleBell();
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [
    isInventoryOpen,
    activeStallModal,
    activeTikaModal,
    isDanPetiModalOpen,
    isSansthaModalOpen,
    isLangurModalOpen,
    isTaasModalOpen,
    isSettingsOpen,
    isKiteFlying,
    isSeatedOnSwing,
  ]);

  const swingAngleRef = useRef<number>(0);
  const swingSpeedRef = useRef<number>(0);

  // Continuous 60 FPS pendulum physics for ultra-smooth Linge Ping swinging
  useEffect(() => {
    if (!isSeatedOnSwing) {
      swingAngleRef.current = 0;
      swingSpeedRef.current = 0;
      setSwingAngle(0);
      setSwingSpeed(0);
      return;
    }

    let animationFrameId: number;
    let lastTime = performance.now();
    if (swingSpeedRef.current === 0) {
      swingSpeedRef.current = 1.2;
    }

    const animateSwing = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      // Pendulum angular acceleration: theta'' = -g/L * sin(theta)
      const gOverL = 3.2; // Natural pendulum rhythm for 10.4m tall bamboo swing
      const damping = Math.pow(0.994, dt * 60);

      const accel = -gOverL * Math.sin(swingAngleRef.current);
      swingSpeedRef.current = (swingSpeedRef.current + accel * dt) * damping;
      swingSpeedRef.current = Math.max(-2.4, Math.min(2.4, swingSpeedRef.current));

      swingAngleRef.current += swingSpeedRef.current * dt;
      swingAngleRef.current = Math.max(-1.15, Math.min(1.15, swingAngleRef.current));

      setSwingAngle(swingAngleRef.current);
      setSwingSpeed(swingSpeedRef.current);

      animationFrameId = requestAnimationFrame(animateSwing);
    };

    animationFrameId = requestAnimationFrame(animateSwing);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSeatedOnSwing]);

  // Connect to Multiplayer Server on initial mount or server switch (Phase 2)
  useEffect(() => {
    setConnectionState("connecting");
    setRemotePlayers(new Map());
    networkManager.connect(displayName, customization, currentServerId).then((connected) => {
      if (connected) {
        setIsOnline(true);
        setConnectionState("online");
        showToast(
          `Connected to ${
            currentServerId === "melaverse-server-2"
              ? "🏔️ Server 2: Pokhara Chautari"
              : "🇳🇵 Server 1: Kathmandu Mela"
          }! 🌐`
        );
      } else {
        setIsOnline(false);
        setConnectionState("disconnected");
      }
    });
  }, [displayName, currentServerId]);

  // Setup Network Manager Callbacks
  useEffect(() => {
    networkManager.onPlayerJoined = (player) => {
      setRemotePlayers((prev) => new Map(prev).set(player.sessionId, player));
    };

    networkManager.onPlayerLeft = (sessionId) => {
      setRemotePlayers((prev) => {
        const next = new Map(prev);
        next.delete(sessionId);
        return next;
      });
    };

    networkManager.onPlayerUpdated = (player) => {
      setRemotePlayers((prev) => new Map(prev).set(player.sessionId, player));
    };

    networkManager.onChatMessage = (msg) => {
      setChatMessages((prev) => [...prev.slice(-30), msg]);
      soundManager.playMadalBeat("high");
    };

    networkManager.onSwingUpdated = (swing) => {
      setSwingAngle(swing.angle);
      const isMe = swing.occupantId === networkManager.getSessionId();
      setIsSeatedOnSwing(isMe);
      setSwingOccupantName(swing.occupantName || null);
      if (Math.abs(swing.angle) > 0.3) {
        soundManager.playSwingCreak();
      }
    };

    networkManager.onDiyaUpdated = (diya) => {
      setDiyaStates((prev) => {
        const next = new Map(prev);
        next.set(diya.id, { isLit: diya.isLit, litBy: diya.litBy });
        return next;
      });
      if (diya.isLit) {
        soundManager.playDiyaLight();
      }
    };

    networkManager.onLangurUpdated = (data) => {
      setLangurPhase(data.phase);
      setLangurTimer(data.timer);
      setLangurDice(data.dice);

      if (data.phase === "rolling") {
        soundManager.playDiceRoll();
      } else if (data.phase === "payout") {
        soundManager.playWinFanfare();
      } else if (data.phase === "betting") {
        setMyBets(new Map());
      }
    };

    networkManager.onInventoryUpdated = (data) => {
      if (typeof data.npr === "number") setNpr(data.npr);
      if (data.itemType === "chiya") setInventory((prev) => ({ ...prev, chiya: data.count ?? prev.chiya + 1 }));
      if (data.itemType === "sel_roti") setInventory((prev) => ({ ...prev, selRoti: data.count ?? prev.selRoti + 1 }));
      if (data.itemType === "changa") setInventory((prev) => ({ ...prev, hasChanga: true }));
      if (data.itemType === "dhaka" && data.dhakaTopiColor) {
        const topiColor: string = data.dhakaTopiColor;
        setCustomization((prev) => ({ ...prev, dhakaTopiColor: topiColor }));
        setInventory((prev) => ({ ...prev, dhakaTopiColor: topiColor }));
      }
      showToast(`🛒 Purchased ${data.itemType}! Balance: रू ${data.npr} NPR`);
    };

    networkManager.onTikaResponse = (data) => {
      if (data.success) {
        setHasReceivedTikaReward(true);
        setCustomization((prev) => ({ ...prev, hasTika: true, hasJamara: true }));
        setInventory((prev) => ({ ...prev, hasTika: true }));
        if (typeof data.npr === "number") setNpr(data.npr);
        soundManager.playTempleBell();
        showToast(data.message);
      } else {
        showToast(data.message);
      }
    };

    networkManager.onFoodConsumed = (data) => {
      if (data.itemType === "chiya") setInventory((prev) => ({ ...prev, chiya: data.remaining }));
      if (data.itemType === "sel_roti") setInventory((prev) => ({ ...prev, selRoti: data.remaining }));
    };

    networkManager.onError = (msg) => {
      showToast(`⚠️ ${msg}`);
    };

    networkManager.onStatusChange = (online) => {
      setIsOnline(online);
      setConnectionState(online ? "online" : "disconnected");
    };

    const pingTimer = setInterval(() => {
      setPing(networkManager.ping);
    }, 1500);

    return () => {
      clearInterval(pingTimer);
      networkManager.disconnect();
    };
  }, []);

  // Real-time dynamic Taas player count: counts local player if seated + any connected remote player seated in circle
  const dynamicTaasCount = useMemo(() => {
    const remoteSeated = Array.from(remotePlayers.values()).filter(
      (p) => Math.hypot(p.position.x - (-28), p.position.z - 20) < 5.0 && p.animState === "seated"
    ).length;
    return Math.min(4, (isSeatedAtTaas ? 1 : 0) + remoteSeated);
  }, [remotePlayers, isSeatedAtTaas]);

  // Check if player is in a cultural dance hotspot or near another dancing player
  const isNearDanceZone =
    Math.hypot(localPlayerPos.x - 26, localPlayerPos.z - 22) < 9.5 || // Aama Samuha courtyard
    Math.hypot(localPlayerPos.x - 0, localPlayerPos.z - 5) < 7.5 || // Central Chautari plaza
    Math.hypot(localPlayerPos.x - 0, localPlayerPos.z - (-38)) < 8.5; // Mandir courtyard

  const isNearDancingPlayer = Array.from(remotePlayers.values()).some((p) => {
    const d = Math.hypot(p.position.x - localPlayerPos.x, p.position.z - localPlayerPos.z);
    return d < 9.0 && (p.animState === "nach" || p.animState === "clapping_dance" || p.animState === "swaying_dance");
  });

  const canJoinDance = isNearDanceZone || isNearDancingPlayer;
  const isDancing = activeEmote === "nach" || activeEmote === "clapping_dance" || activeEmote === "swaying_dance";

  // Group Dancing Toggle: syncs dance state across multiplayer
  const handleJoinDance = useCallback(() => {
    if (isDancing) {
      setActiveEmote(null);
      showToast("Dance paused.");
    } else {
      setActiveEmote("nach");
      soundManager.playMadalBeat("high");
      setIsMusicPlaying(true);
      soundManager.ensureAudio();
      if (isOnline) {
        networkManager.sendEmote("nach");
      }
      showToast("💃 Joined the Nepali group dance! नाचौं सबै मिलेर!");
    }
  }, [isDancing, isOnline]);

  // Handle interaction with nearby attraction, shop, or Tika house
  const handleInteract = useCallback(() => {
    if (nearbyInteraction === "ping" || isSeatedOnSwing) {
      if (isOnline) {
        networkManager.interactPingSwing();
      } else {
        const nextState = !isSeatedOnSwing;
        setIsSeatedOnSwing(nextState);
        if (nextState) {
          soundManager.playSwingCreak();
          setSwingAngle(0.5);
          setSwingSpeed(1.2);
        } else {
          setSwingAngle(0);
          setSwingSpeed(0);
        }
      }
    } else if (nearbyInteraction === "chautari") {
      const nextSeated = !isSeatedAtChautari;
      setIsSeatedAtChautari(nextSeated);
      soundManager.playTempleBell();
      if (nextSeated) {
        showToast("🪑 Seated at Central Chautari under the Banyan Tree with friends! Press [E] to stand up.");
      } else {
        showToast("Stood up safely from the Chautari.");
      }
    } else if (nearbyInteraction === "langur") {
      setIsLangurModalOpen(true);
      soundManager.playTempleBell();
    } else if (nearbyInteraction === "taas") {
      const nextSeated = !isSeatedAtTaas;
      setIsSeatedAtTaas(nextSeated);
      setIsTaasModalOpen(nextSeated);
      soundManager.playCardSnap();
    } else if (nearbyInteraction === "diya") {
      for (const [id, s] of diyaStates.entries()) {
        if (!s.isLit) {
          if (isOnline) {
            networkManager.lightDiya(id);
          } else {
            setDiyaStates((prev) => new Map(prev).set(id, { isLit: true, litBy: displayName }));
            setNpr((t) => t + 10);
            setScore((s) => s + 10);
            soundManager.playDiyaLight();
            showToast("✨ Ceremonial Tihar Diya Lit! +NPR 10!");
          }
          break;
        }
      }
    } else if (nearbyInteraction === "tika1" || nearbyInteraction === "tika2") {
      handleTriggerPhysicalBlessing(nearbyInteraction === "tika1" ? "house1" : "house2");
    } else if (nearbyInteraction === "mandir") {
      handlePrayAtMandir();
    } else if (nearbyInteraction === "dan_peti") {
      setIsDanPetiModalOpen(true);
      soundManager.playTempleBell();
    } else if (nearbyInteraction === "sanstha") {
      setIsSansthaModalOpen(true);
      soundManager.playTempleBell();
    } else if (nearbyInteraction === "aama_samuha") {
      const nextSeated = !isSeatedAtAama;
      setIsSeatedAtAama(nextSeated);
      soundManager.playTempleBell();
      if (nextSeated) {
        setIsMusicPlaying(true);
        soundManager.ensureAudio();
        showToast("🌸 Seated with Aama Samuha! Cultural song playing. Press [Space] to clap!");
      } else {
        showToast("Stood up safely from the dance gathering.");
      }
    } else if (
      nearbyInteraction === "chiya" ||
      nearbyInteraction === "sel_roti" ||
      nearbyInteraction === "changa" ||
      nearbyInteraction === "dhaka"
    ) {
      setActiveStallModal(nearbyInteraction as any);
      soundManager.playTempleBell();
    }
  }, [nearbyInteraction, isSeatedOnSwing, isSeatedAtChautari, isOnline, diyaStates, displayName, isSeatedAtAama]);

  // Keyboard shortcut [E] for interactions, [G] for dance, and [Space] for swing pumping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;

      if (e.code === "KeyE") {
        handleInteract();
      } else if (e.code === "KeyG") {
        if (canJoinDance || isDancing) {
          handleJoinDance();
        }
      } else if (e.code === "Space" && isSeatedOnSwing) {
        const now = Date.now();
        if (now - lastPumpTimeRef.current < 450) return;
        lastPumpTimeRef.current = now;

        soundManager.playSwingCreak();
        if (isOnline) {
          networkManager.pumpSwing();
        } else {
          const delta = swingSpeedRef.current >= 0 ? 0.45 : -0.45;
          swingSpeedRef.current = Math.max(-2.4, Math.min(2.4, swingSpeedRef.current + delta));
          setSwingSpeed(swingSpeedRef.current);
        }
      } else if (e.code === "KeyI") {
        setIsInventoryOpen((prev) => !prev);
      } else if (e.code === "Escape") {
        setIsInventoryOpen(false);
        setIsLangurModalOpen(false);
        setIsTaasModalOpen(false);
        setIsSettingsOpen(false);
        setIsDanPetiModalOpen(false);
        setIsSansthaModalOpen(false);
        setActiveStallModal(null);
        setActiveTikaModal(null);
        setIsSeatedOnSwing(false);
        setIsSeatedAtTaas(false);
        setIsSeatedAtAama(false);
        setIsSeatedAtChautari(false);
        setIsKiteFlying(false);
        setIsBlessingActive(false);
        setBlessingActiveElder(null);
        setInteractionTarget(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInteract, canJoinDance, isDancing, handleJoinDance, isSeatedOnSwing, isOnline]);

  // Physical Dashain Tika & Jamara Blessing Sequence (Phase 4)
  const handleTriggerPhysicalBlessing = (houseId: "house1" | "house2") => {
    const targetPos = houseId === "house1"
      ? { x: ATTRACTION_LOCATIONS.TIKA_HOUSE_1.x, z: ATTRACTION_LOCATIONS.TIKA_HOUSE_1.z }
      : { x: ATTRACTION_LOCATIONS.TIKA_HOUSE_2.x, z: ATTRACTION_LOCATIONS.TIKA_HOUSE_2.z };

    setInteractionTarget(targetPos);
    setIsBlessingActive(true);
    setBlessingActiveElder(houseId);
    soundManager.playTempleBell();

    if (hasReceivedTikaReward) {
      showToast("🌸 हजुरआमा: 'आयुष्मान भवः! दशैंको आशिर्वाद सधैं रहोस्!' (Blessing already received)");
      setTimeout(() => {
        setIsBlessingActive(false);
        setBlessingActiveElder(null);
        setInteractionTarget(null);
      }, 2500);
      return;
    }

    if (isOnline) {
      networkManager.claimTika(houseId);
    } else {
      setHasReceivedTikaReward(true);
      setCustomization((prev) => ({ ...prev, hasTika: true, hasJamara: true }));
      setInventory((prev) => ({ ...prev, hasTika: true }));
      setNpr((n) => n + 50);
      setScore((s) => s + 50);
      showToast("🌸 रातो अक्षता र पहेंलो जमराको आशिर्वाद! तपाईंलाई रू ५० दक्षिणा प्राप्त भयो! (+NPR 50 Dakshina)");
    }

    setTimeout(() => {
      setIsBlessingActive(false);
      setBlessingActiveElder(null);
      setInteractionTarget(null);
      showToast("✨ Tika & Jamara blessing complete! Dashain Mubarak!");
    }, 3200);
  };

  // Respectful Offering & Prayer at Shree Durga Mata Mandir (Phase 8)
  const handlePrayAtMandir = () => {
    setInteractionTarget({ x: ATTRACTION_LOCATIONS.DURGA_MATA_MANDIR.x, z: ATTRACTION_LOCATIONS.DURGA_MATA_MANDIR.z });
    setActiveEmote("namaste");
    soundManager.playTempleBell();
    setScore((s) => s + 15);
    showToast("🙏 'जय माँ दुर्गा! शुभ विजया दशमीको पावन शुभकामना!' (+15 Blessing Points)");
    setTimeout(() => {
      setActiveEmote(null);
      setInteractionTarget(null);
    }, 2800);
  };

  // Functional Item Use from Minecraft Hotbar (Phase 2)
  const handleUseHotbarItem = (itemId: string) => {
    switch (itemId) {
      case "chiya":
        if (inventory.chiya > 0) {
          handleEatItem("chiya");
        } else {
          showToast("⚠️ No Chiya in inventory! Visit Ramesh Dai's Tea Stall.");
        }
        break;
      case "sel_roti":
        if (inventory.selRoti > 0) {
          handleEatItem("sel_roti");
        } else {
          showToast("⚠️ No Sel Roti in inventory! Visit Sita Didi's Sweets Stall.");
        }
        break;
      case "changa":
        if (inventory.hasChanga) {
          const nextKite = !isKiteFlying;
          setIsKiteFlying(nextKite);
          setActiveAction(nextKite ? "flying_kite" : null);
          setHeldItem(nextKite ? "kite" : null);
          if (isOnline) networkManager.toggleChanga(nextKite);
          showToast(nextKite ? "🪁 Launched Dashain Changa into the sky! Use [W/A/S/D] to steer." : "Kite safely reeled in! 🪁");
        } else {
          showToast("⚠️ No Changa owned! Visit Bikash's Kite Stall.");
        }
        break;
      case "dhaka_topi":
        if (customization.hasDhakaTopi) {
          setActiveAction("wearing_topi");
          soundManager.playTopiChime();
          showToast("🎩 Adjusted traditional Dhaka Topi with pride!");
          setTimeout(() => setActiveAction(null), 2500);
        } else {
          showToast("⚠️ No Dhaka Topi in inventory! Visit Pooja Didi's Stall.");
        }
        break;
      case "tika_jamara":
        if (customization.hasTika) {
          showToast("🌸 रातो अक्षता र जमराको आशिर्वाद तपाईंको निधारमा सजिएको छ!");
        } else {
          showToast("🌸 Visit Bada Dashain Mula Ghar to receive Tika & Jamara!");
        }
        break;
      case "diya":
        const nextDiya = heldItem === "diya" ? null : "diya";
        setHeldItem(nextDiya);
        soundManager.playDiyaLight();
        showToast(nextDiya ? "🪔 Tihar Diya held in hand! Glowing brightly." : "Diya set aside.");
        break;
      case "tash":
        setIsTaasModalOpen(true);
        setIsSeatedAtTaas(true);
        setTaasPlayerCount(1);
        soundManager.playCardSnap();
        break;
      default:
        break;
    }
  };

  // Handle hotbar slot selection & immediate item equipping/clearing
  const handleSelectHotbarSlot = (slot: number) => {
    setSelectedHotbarSlot(slot);
    switch (slot) {
      case 0: // Chiya
        if (inventory.chiya > 0) {
          setHeldItem("chiya");
          showToast("☕ Holding steaming Masala Chiya in hand!");
        } else {
          setHeldItem(null);
          showToast("☕ No Chiya in inventory! Visit Ramesh Dai's Tea Stall.");
        }
        break;
      case 1: // Sel Roti
        if (inventory.selRoti > 0) {
          setHeldItem("sel_roti");
          showToast("🍩 Holding freshly fried Sel Roti in hand!");
        } else {
          setHeldItem(null);
          showToast("🍩 No Sel Roti in inventory! Visit Sita Didi's Stall.");
        }
        break;
      case 2: // Changa & Lattai
        if (inventory.hasChanga) {
          setHeldItem("kite");
          showToast("🪁 Holding Dashain Changa & Lattai! Press [F] to fly.");
        } else {
          setHeldItem(null);
          showToast("🪁 No Changa owned! Visit Bikash's Kite Shop.");
        }
        break;
      case 5: // Diya
        setHeldItem("diya");
        showToast("🪔 Holding glowing Tihar Diya in hand!");
        break;
      default:
        setHeldItem(null);
        break;
    }
  };

  // Handle direct item equipping from Inventory modal
  const handleEquipInventoryItem = (itemId: string) => {
    switch (itemId) {
      case "chiya":
        if (inventory.chiya > 0) {
          setHeldItem("chiya");
          setSelectedHotbarSlot(0);
          showToast("☕ Masala Chiya held in hand!");
        } else {
          setHeldItem(null);
        }
        break;
      case "sel_roti":
        if (inventory.selRoti > 0) {
          setHeldItem("sel_roti");
          setSelectedHotbarSlot(1);
          showToast("🍩 Sel Roti held in hand!");
        } else {
          setHeldItem(null);
        }
        break;
      case "changa":
        if (inventory.hasChanga) {
          setHeldItem("kite");
          setSelectedHotbarSlot(2);
          showToast("🪁 Changa & Lattai held in hand!");
        } else {
          setHeldItem(null);
        }
        break;
      case "dhaka_topi":
        if (customization.hasDhakaTopi) {
          showToast("🎩 Palpali Dhaka Topi adjusted proudly!");
        }
        break;
      case "tika_jamara":
        if (customization.hasTika) {
          showToast("🌸 Rato Tika & Jamara blessing active on forehead!");
        }
        break;
    }
  };

  // Handle Buying Items from Stalls (Phase 4 & 7)
  const handleBuyItem = (cost: number, itemType: "chiya" | "sel_roti" | "changa" | "dhaka", data?: any) => {
    if (npr < cost) {
      showToast("⚠️ Not enough Nepalese Rupees (NPR)!");
      return;
    }

    if (isOnline) {
      networkManager.buyItem(itemType, cost, data);
    } else {
      setNpr((t) => Math.max(0, t - cost));
      if (itemType === "chiya") setInventory((prev) => ({ ...prev, chiya: prev.chiya + 1 }));
      else if (itemType === "sel_roti") setInventory((prev) => ({ ...prev, selRoti: prev.selRoti + 1 }));
      else if (itemType === "changa") {
        setInventory((prev) => ({ ...prev, hasChanga: true }));
        showToast("🪁 Dashain Changa added to Inventory! Open with [I] to fly anytime.");
      } else if (itemType === "dhaka" && data?.dhakaTopiColor) {
        setCustomization((prev) => ({ ...prev, dhakaTopiColor: data.dhakaTopiColor }));
        setActiveAction("wearing_topi");
        soundManager.playTopiChime();
        setTimeout(() => setActiveAction(null), 3000);
      }
      showToast(`🛒 Purchased ${itemType}!`);
    }

    setActiveStallModal(null);
  };

  // Handle Eating / Drinking Food Items from Inventory (Phase 4)
  const handleEatItem = (itemType: "chiya" | "sel_roti") => {
    if (itemType === "chiya") {
      if (inventory.chiya <= 0) return;
      if (isOnline) {
        networkManager.eatFood("chiya");
      } else {
        setInventory((prev) => ({ ...prev, chiya: Math.max(0, prev.chiya - 1) }));
      }
      setHeldItem("chiya");
      setActiveAction("drinking");
      soundManager.playChiyaSip();
      setSpeedMultiplier(1.35); // 35% sprint boost!
      showToast("☕ Hot Masala Chiya Sipped! Speed +35% for 30s!");

      setTimeout(() => {
        setActiveAction(null);
      }, 3500);

      setTimeout(() => {
        setHeldItem(null);
        setSpeedMultiplier(1.0);
      }, 30000);
    } else if (itemType === "sel_roti") {
      if (inventory.selRoti <= 0) return;
      if (isOnline) {
        networkManager.eatFood("sel_roti");
      } else {
        setInventory((prev) => ({ ...prev, selRoti: Math.max(0, prev.selRoti - 1) }));
        setScore((s) => s + 25);
      }
      setHeldItem("sel_roti");
      setActiveAction("eating");
      soundManager.playSelRotiCrunch();
      showToast("🍩 Hot Crispy Sel Roti Eaten! +25 Points!");

      setTimeout(() => {
        setActiveAction(null);
      }, 3500);

      setTimeout(() => setHeldItem(null), 8000);
    }
  };

  // Toggle Changa Kite Flying from Inventory anywhere in the map (Phase 5)
  const handleToggleKiteFromInventory = () => {
    if (!inventory.hasChanga && !isKiteFlying) {
      showToast("⚠️ You need to purchase a Changa from the Kite Stall first!");
      return;
    }

    const nextState = !isKiteFlying;
    setIsKiteFlying(nextState);
    setActiveAction(nextState ? "flying_kite" : null);
    setHeldItem(nextState ? "kite" : null);

    if (isOnline) {
      networkManager.toggleChanga(nextState);
    }

    if (nextState) {
      soundManager.playKiteWhoosh();
      showToast("🪁 Changa Airborne! Use [A]/[D] to steer, [W]/[S] for line tension!");
      setIsInventoryOpen(false); // Close inventory so player can fly immediately
    } else {
      showToast("Kite string reeled in and packed! 🪁");
    }
  };

  // Claim Tika & Jamara Blessing (Phase 9B & 9C - Strictly One Time per Player on Server)
  const handleClaimTikaBlessing = (houseId: "house1" | "house2") => {
    if (isOnline) {
      networkManager.claimTika(houseId);
    } else {
      if (hasReceivedTikaReward) {
        showToast("🌸 तपाईंले यस वर्षको आशिर्वाद र दक्षिणा लिइसक्नुभएको छ। (Blessing already received!)");
        return;
      }
      setHasReceivedTikaReward(true);
      setCustomization((prev) => ({ ...prev, hasTika: true, hasJamara: true }));
      setInventory((prev) => ({ ...prev, hasTika: true }));
      setNpr((t) => t + 50);
      setScore((s) => s + 50);
      soundManager.playTempleBell();
      showToast("🌸 Dashain Tika & Jamara Received! +NPR 50 Dakshina!");
    }
    setActiveTikaModal(null);
  };

  // Toggle Background Music
  const handleToggleMusic = () => {
    soundManager.stopMusic();
    const nextState = !isMusicPlaying;
    setIsMusicPlaying(nextState);
    return nextState;
  };

  // Toggle Multiplayer connection
  const handleToggleOnline = async () => {
    if (isOnline) {
      networkManager.disconnect();
      setIsOnline(false);
      setConnectionState("disconnected");
      setRemotePlayers(new Map());
    } else {
      setConnectionState("connecting");
      const ok = await networkManager.connect(displayName, customization);
      if (ok) {
        setIsOnline(true);
        setConnectionState("online");
        soundManager.playTempleBell();
      } else {
        setIsOnline(false);
        setConnectionState("disconnected");
      }
    }
  };

  // Confirm username from UsernameModal (Phase 8)
  const handleConfirmUsername = (name: string) => {
    setDisplayName(name);
    setIsNameModalOpen(false);
    if (isOnline) {
      networkManager.disconnect();
      networkManager.connect(name, customization).then((connected) => {
        setIsOnline(connected);
        setConnectionState(connected ? "online" : "disconnected");
      });
    }
  };

  // Dispatch local player position & animation
  const handlePositionChange = (pos: {
    x: number;
    y: number;
    z: number;
    rotationY: number;
    animState: AnimationState;
  }) => {
    setLocalPlayerPos({ x: pos.x, y: pos.y, z: pos.z });
    if (isOnline) {
      networkManager.sendInput(pos.x, pos.y, pos.z, pos.rotationY, pos.animState);
    }
  };

  // Send Chat
  const handleSendChat = (text: string, channel: "global" | "proximity") => {
    if (isOnline) {
      networkManager.sendChat(text, channel);
    } else {
      const msg: ChatMessage = {
        id: `local-${Date.now()}`,
        senderId: "local",
        senderName: displayName,
        text,
        timestamp: Date.now(),
        channel,
        isSystem: false,
      };
      setChatMessages((prev) => [...prev, msg]);
      setSpeechBubble(text);
      setTimeout(() => setSpeechBubble(null), 4000);
      soundManager.playMadalBeat("high");
    }
  };

  // Trigger Emote (Namaste, Nach, Wave, Cheer) with authentic sound effects!
  const handleTriggerEmote = (emote: EmoteType) => {
    setActiveEmote(emote);
    if (isOnline) {
      networkManager.sendEmote(emote);
    }

    if (emote === "namaste") {
      soundManager.playNamasteSound();
    } else if (emote === "nach") {
      soundManager.playNachSong();
    } else if (emote === "wave") {
      soundManager.playWaveSound();
    } else if (emote === "cheer") {
      soundManager.playCheerSound();
    }

    setTimeout(() => {
      setActiveEmote((curr) => (curr === emote ? null : curr));
    }, 3500);
  };

  // Kite steering controller handler (Phase 5)
  const handleKiteControl = useCallback((steerX: number, steerY: number) => {
    setKiteData((prev) => {
      const newX = Math.max(-45, Math.min(45, prev.x + steerX * 0.9));
      const newY = Math.max(16, Math.min(50, prev.y + steerY * 0.7));
      const newBank = THREE.MathUtils.lerp(prev.bank, steerX * 0.45, 0.25);
      if (Math.abs(steerX) > 0.1 || Math.abs(steerY) > 0.1) {
        soundManager.playKiteWhoosh();
      }
      return { ...prev, x: newX, y: newY, bank: newBank };
    });
  }, []);

  // Langur Bet
  const handlePlaceLangurBet = (symbol: LangurSymbol, amount: number) => {
    if (tokens < amount) return;
    setTokens((t) => t - amount);
    setMyBets((prev) => {
      const next = new Map(prev);
      next.set(symbol, (next.get(symbol) ?? 0) + amount);
      return next;
    });

    if (isOnline) {
      networkManager.placeLangurBet(symbol, amount);
    }
  };

  // Instant Roll for Langur Burja (Offline / Local Mode)
  const handleLocalLangurRoll = (bets: Map<string, number>) => {
    const symbols: LangurSymbol[] = ["jhanda", "burja", "ita", "paan", "hukum", "chidi"];
    const rolled = Array.from({ length: 6 }).map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    setLangurDice(rolled);

    let totalWinnings = 0;
    for (const [symbol, bet] of bets.entries()) {
      const matchCount = rolled.filter((s) => s === symbol).length;
      if (matchCount > 0) {
        totalWinnings += bet + bet * matchCount;
      }
    }

    if (totalWinnings > 0) {
      setTokens((t) => t + totalWinnings);
      setScore((s) => s + totalWinnings);
      soundManager.playWinFanfare();
      showToast(`🏆 Won ${totalWinnings} Festival Tokens on Langur Burja!`);
    } else {
      soundManager.playMadalBeat("low");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", backgroundColor: "#87CEEB" }}>
      {/* ─── 3D WebGL Canvas ────────────────────────────────────────────────── */}
      <Canvas
        shadows={graphicsQuality === "high"}
        camera={{ position: [0, 6, 52], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ powerPreference: "high-performance", antialias: false, stencil: false }}
        dpr={[1, 1.25]}
      >
        {/* Continuous Smooth Synchronized Day-Night Cycle (Phase 9 - 5-minute cycle) */}
        <DayNightCycle
          cycleDuration={300}
          graphicsQuality={graphicsQuality}
          onPhaseChange={(phase, night) => {
            setTimeOfDayPhase(phase);
            setIsNight(night);
          }}
        />

        {/* Dashain / Tihar Festival Ground Terrain, Landmarks & Stalls */}
        <FestivalWorld
          swingAngle={swingAngle}
          swingOccupantName={swingOccupantName}
          diyaStates={diyaStates}
          onInteractPing={handleInteract}
          onInteractLangur={handleInteract}
          onInteractDiya={(id) => {
            if (isOnline) {
              networkManager.lightDiya(id);
            } else {
              setDiyaStates((prev) => new Map(prev).set(id, { isLit: true, litBy: displayName }));
              setNpr((t) => t + 10);
              setScore((s) => s + 10);
              soundManager.playDiyaLight();
              showToast("✨ Ceremonial Tihar Diya Lit! +NPR 10!");
            }
          }}
          onInteractStall={(type) => {
            setActiveStallModal(type);
            soundManager.playTempleBell();
          }}
          onInteractTaas={handleInteract}
          onInteractTikaHouse={(houseId) => {
            handleTriggerPhysicalBlessing(houseId);
          }}
          onInteractAamaSamuha={() => {
            const next = !isSeatedAtAama;
            setIsSeatedAtAama(next);
            soundManager.playTempleBell();
            if (next) {
              setIsMusicPlaying(true);
              soundManager.ensureAudio();
              showToast("🌸 Seated with Aama Samuha! Cultural song playing. Press [Space] to clap!");
            }
          }}
          onPrayMandir={handlePrayAtMandir}
          onOpenDanPeti={() => setIsDanPetiModalOpen(true)}
          onInteractSanstha={() => setIsSansthaModalOpen(true)}
          onInteractAamaBench={() => {
            const next = !isSeatedAtAama;
            setIsSeatedAtAama(next);
            soundManager.playTempleBell();
            if (next) {
              setIsMusicPlaying(true);
              soundManager.ensureAudio();
              showToast("🌸 Seated with Aama Samuha! Cultural song playing. Press [Space] to clap!");
            }
          }}
          onInteractChautari={handleInteract}
          nearbyInteraction={nearbyInteraction}
          isSeatedOnSwing={isSeatedOnSwing}
          taasPlayerCount={dynamicTaasCount}
          isSeatedAtTaas={isSeatedAtTaas}
          isSeatedAtAama={isSeatedAtAama}
          isSeatedAtChautari={isSeatedAtChautari}
          blessingActiveElder={blessingActiveElder}
          langurPhase={langurPhase as any}
          langurDice={langurDice}
          isNight={isNight}
          isKiteFlying={isKiteFlying}
          kiteData={kiteData}
          playerPosition={localPlayerPos}
        />

        {/* Local Player Controller */}
        <LocalPlayerController
          displayName={displayName}
          customization={customization}
          speechBubble={speechBubble}
          onPositionChange={handlePositionChange}
          onNearbyInteractionChange={setNearbyInteraction}
          virtualJoystick={virtualJoystick}
          virtualJump={virtualJump}
          isLockedInAttraction={isSeatedOnSwing}
          isSeatedOnSwing={isSeatedOnSwing}
          swingAngle={swingAngle}
          isSeatedAtTaas={isSeatedAtTaas}
          isSeatedAtAama={isSeatedAtAama}
          isSeatedAtChautari={isSeatedAtChautari}
          isBlessingActive={isBlessingActive}
          interactionTarget={interactionTarget}
          activeEmote={activeEmote}
          activeAction={activeAction}
          isKiteFlying={isKiteFlying}
          onKiteControl={handleKiteControl}
          kiteData={kiteData}
          heldItem={heldItem}
          speedMultiplier={speedMultiplier}
          isNight={isNight}
        />

        {/* Synchronized Remote Players */}
        {Array.from(remotePlayers.values()).map((rPlayer) => (
          <RemotePlayer
            key={rPlayer.sessionId}
            displayName={rPlayer.displayName}
            targetPosition={rPlayer.position}
            targetRotationY={rPlayer.rotationY}
            animState={rPlayer.animState}
            customization={rPlayer.customization}
            speechBubble={rPlayer.speechBubble}
          />
        ))}
      </Canvas>

      {/* ─── Celebratory Floating Notification Toast ───────────────────────── */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(15, 23, 42, 0.94)",
            border: "2px solid #ca8a04",
            borderRadius: "16px",
            padding: "10px 24px",
            color: "#fef08a",
            fontWeight: 800,
            fontSize: "14px",
            zIndex: 1000,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            pointerEvents: "none",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ─── Interactive Kite Flying HUD Controller (Phase 5) ───────────────── */}
      {isKiteFlying && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              border: "2px solid #0284c7",
              borderRadius: "18px",
              padding: "8px 20px",
              color: "#38bdf8",
              fontSize: "12px",
              fontWeight: 800,
              boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>🪁 Flying Dashain Changa</span>
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              Controls: [A]/[D] Steer • [W]/[S] Line Tension
            </span>
            <button
              onClick={() => {
                setIsKiteFlying(false);
                setActiveAction(null);
                networkManager.toggleChanga(false);
                showToast("Kite string safely reeled in! 🪁");
              }}
              style={{
                backgroundColor: "#dc2626",
                color: "#FFF",
                border: "none",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Exit Kite Flying ✕
            </button>
          </div>

          {/* Dedicated Touch Controller Pad for Mobile */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onPointerDown={() => handleKiteControl(-1, 0)}
              style={{
                width: "48px",
                height: "44px",
                backgroundColor: "#0284c7",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ◀
            </button>
            <button
              onPointerDown={() => handleKiteControl(0, 1)}
              style={{
                width: "48px",
                height: "44px",
                backgroundColor: "#0284c7",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ▲
            </button>
            <button
              onPointerDown={() => handleKiteControl(0, -1)}
              style={{
                width: "48px",
                height: "44px",
                backgroundColor: "#0284c7",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ▼
            </button>
            <button
              onPointerDown={() => handleKiteControl(1, 0)}
              style={{
                width: "48px",
                height: "44px",
                backgroundColor: "#0284c7",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* ─── 2D HUD & Overlay ───────────────────────────────────────────────── */}
      <GameHUD
        displayName={displayName}
        onOpenNameModal={() => setIsNameModalOpen(true)}
        npr={npr}
        tokens={tokens}
        score={score}
        ping={ping}
        isOnline={isOnline}
        connectionState={connectionState}
        playerCount={remotePlayers.size + 1}
        onToggleOnline={handleToggleOnline}
        onOpenInventory={() => setIsInventoryOpen(true)}
        chatMessages={chatMessages}
        onSendChat={handleSendChat}
        onTriggerEmote={handleTriggerEmote}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleMusic={handleToggleMusic}
        isMusicPlaying={isMusicPlaying}
        nearbyInteraction={nearbyInteraction}
        onInteract={handleInteract}
        customization={customization}
        onUpdateCustomization={(c) => setCustomization((prev: AvatarCustomization) => ({ ...prev, ...c }))}
        showMobileControls={showMobileControls}
        onJoystickMove={setVirtualJoystick}
        onJumpTouch={setVirtualJump}
        heldItem={heldItem}
        selectedHotbarSlot={selectedHotbarSlot}
        onSelectHotbarSlot={handleSelectHotbarSlot}
        onUseHotbarItem={handleUseHotbarItem}
        chiyaCount={inventory.chiya}
        selRotiCount={inventory.selRoti}
        hasChanga={inventory.hasChanga}
        isKiteFlying={isKiteFlying}
        timeOfDayPhase={timeOfDayPhase}
        canJoinDance={canJoinDance}
        onJoinDance={handleJoinDance}
        isDancing={isDancing}
        currentServerId={currentServerId}
        onSwitchServer={(srv) => {
          showToast(`Switching to ${srv === "melaverse-server-2" ? "🏔️ Server 2" : "🇳🇵 Server 1"}...`);
          setCurrentServerId(srv);
        }}
      />

      {/* ─── Inventory Modal (Phase 4) ───────────────────────────────────────── */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        npr={npr}
        inventory={{
          chiya: inventory.chiya,
          selRoti: inventory.selRoti,
          hasChanga: inventory.hasChanga,
          hasTika: customization.hasTika,
          hasDhakaTopi: customization.hasDhakaTopi,
          dhakaTopiColor: customization.dhakaTopiColor,
        }}
        onEatItem={handleEatItem}
        onToggleChanga={handleToggleKiteFromInventory}
        isKiteFlying={isKiteFlying}
        onEquipItem={handleEquipInventoryItem}
      />

      {/* ─── Username Selection Modal (Phase 8) ─────────────────────────────── */}
      <UsernameModal
        isOpen={isNameModalOpen}
        initialName={displayName}
        onConfirm={handleConfirmUsername}
        isFirstTime={!localStorage.getItem("chatparva_username")}
      />

      {/* ─── Dashain Tika & Jamara Blessing Modal (Phase 9B & 9C) ───────────── */}
      <TikaBlessingModal
        isOpen={activeTikaModal !== null}
        onClose={() => setActiveTikaModal(null)}
        houseName={activeTikaModal === "house1" ? "🏡 Bada Dashain Mula Ghar" : "🏡 Maiti Ghar Courtyard"}
        elderName={activeTikaModal === "house1" ? "Aama (Hajuraama)" : "Bajai (Elder Didi)"}
        hasClaimedReward={hasReceivedTikaReward}
        onClaimBlessing={() => handleClaimTikaBlessing(activeTikaModal!)}
        npr={npr}
      />

      {/* ─── Langur Burja Modal ──────────────────────────────────────────────── */}
      <LangurBurjaModal
        isOpen={isLangurModalOpen}
        onClose={() => setIsLangurModalOpen(false)}
        tokens={tokens}
        phase={langurPhase}
        timerRemaining={langurTimer}
        diceResults={langurDice}
        onPlaceBet={handlePlaceLangurBet}
        myBets={myBets}
        onClearBets={() => setMyBets(new Map())}
        onInstantRoll={handleLocalLangurRoll}
        isOnline={isOnline}
      />

      {/* ─── 4-Player Forest Taas (Card Game) Modal ──────────────────────────── */}
      <TashGameModal
        isOpen={isTaasModalOpen}
        onClose={() => {
          setIsTaasModalOpen(false);
          setIsSeatedAtTaas(false);
          setTaasPlayerCount(0);
        }}
        tokens={tokens}
        onWinTokens={(amt) => {
          setTokens((t) => Math.max(0, t + amt));
          if (amt > 0) setScore((s) => s + amt);
        }}
        playerName={displayName}
        taasPlayerCount={taasPlayerCount}
        onPlayerCountChange={setTaasPlayerCount}
      />

      {/* ─── Functional Market Stalls Modal (Phase 7) ────────────────────────── */}
      <MarketStallModal
        stallType={activeStallModal}
        onClose={() => setActiveStallModal(null)}
        npr={npr}
        onBuyItem={handleBuyItem}
      />

      {/* ─── Background Music Player (With Proximity to Aama Samuha) ────── */}
      <MusicPlayer
        isPlaying={isMusicPlaying}
        onTogglePlay={handleToggleMusic}
        activeTrackId={Math.hypot(localPlayerPos.x - 26, localPlayerPos.z - 22) < 18 ? "track-aama" : undefined}
      />

      {/* ─── Settings Modal ─────────────────────────────────────────────────── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        graphicsQuality={graphicsQuality}
        onGraphicsQualityChange={setGraphicsQuality}
        isAudioMuted={isAudioMuted}
        onToggleAudio={() => {
          soundManager.isMuted = !isAudioMuted;
          setIsAudioMuted(!isAudioMuted);
        }}
        showMobileControls={showMobileControls}
        onToggleMobileControls={() => setShowMobileControls(!showMobileControls)}
      />

      {/* ─── Shree Durga Mandir Dan Peti (Donation Box) Modal ─────────────────── */}
      <DanPetiModal
        isOpen={isDanPetiModalOpen}
        onClose={() => setIsDanPetiModalOpen(false)}
        playerNpr={npr}
        onDonateCoins={(amount) => {
          setNpr((c) => Math.max(0, c - amount));
          setScore((s) => s + amount);
        }}
      />

      {/* ─── Mela Byawasthapan Sanstha (Committee Office) Modal ──────────────── */}
      <SansthaModal
        isOpen={isSansthaModalOpen}
        onClose={() => setIsSansthaModalOpen(false)}
        playerName={displayName}
      />
    </div>
  );
};