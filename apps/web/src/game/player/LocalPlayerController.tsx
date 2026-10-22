import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CharacterAvatar } from "./CharacterAvatar.js";
import { soundManager } from "../audio/SoundManager.js";
import { getTerrainHeight, checkStructureCollision } from "../world/terrainMath.js";
import { MOVEMENT_LIMITS, ATTRACTION_LOCATIONS } from "@melaverse/shared";
import type { AnimationState, AvatarCustomization, EmoteType } from "@melaverse/shared";

interface LocalPlayerControllerProps {
  displayName: string;
  customization?: Partial<AvatarCustomization>;
  speechBubble?: string | null;
  isLobby?: boolean;
  onPositionChange?: (pos: { x: number; y: number; z: number; rotationY: number; animState: AnimationState }) => void;
  onNearbyInteractionChange?: (nearby: string | null) => void;
  virtualJoystick?: { x: number; y: number } | null;
  virtualJump?: boolean;
  cameraRotateStep?: number;
  isLockedInAttraction?: boolean;
  isSeatedOnSwing?: boolean;
  swingAngle?: number;
  isSeatedAtTaas?: boolean;
  isSeatedAtAama?: boolean;
  isSeatedAtChautari?: boolean;
  isBlessingActive?: boolean;
  interactionTarget?: { x: number; z: number } | null;
  activeEmote?: EmoteType | null;
  activeAction?: "drinking" | "eating" | "wearing_topi" | "flying_kite" | null;
  isKiteFlying?: boolean;
  kiteData?: { x: number; y: number; z: number; bank: number };
  onKiteControl?: (steerX: number, steerY: number) => void;
  heldItem?: "chiya" | "sel_roti" | "kite" | "diya" | null;
  speedMultiplier?: number;
  isNight?: boolean;
}

const OBSTACLES = [
  { x: 0, z: 5, radius: 1.1 }, // Central Chautari Banyan Tree Trunk (stone seating tiers are walkable!)
  // Linge Ping Bamboo Corner Legs (Center swing seat at [-26, -10] is fully open & walkable!)
  { x: -28.4, z: -7.6, radius: 0.35 },
  { x: -23.6, z: -7.6, radius: 0.35 },
  { x: -28.4, z: -12.4, radius: 0.35 },
  { x: -23.6, z: -12.4, radius: 0.35 },
  { x: 24, z: -12, radius: 3.8 }, // Langur Burja Booth
  { x: -6.5, z: 28, radius: 2.2 }, // Chiya Stall (Village Street West)
  { x: 6.5, z: 28, radius: 2.2 }, // Sel Roti Stall (Village Street East)
  { x: -6.5, z: 18, radius: 2.2 }, // Changa Stall (Village Street West)
  { x: 6.5, z: 18, radius: 2.2 }, // Dhaka Stall (Village Street East)
  { x: -28, z: -35, radius: 4.6 }, // Tika House 1 (Bada Dashain Mula Ghar)
  { x: 28, z: -35, radius: 4.6 }, // Tika House 2 (Maiti Ghar)
  { x: 26, z: 22, radius: 4.2 }, // Aama Samuha Stage
  { x: 0, z: -78.5, radius: 2.2 }, // Temple Sanctum Back Altar (Front stairs, portico, and prayer area at z=-53 to -74 are open!)
  // Individual Pine Trees around Taas Grove
  { x: -32, z: 16, radius: 0.6 },
  { x: -24, z: 16, radius: 0.6 },
  { x: -32, z: 24, radius: 0.6 },
  { x: -24, z: 24, radius: 0.6 },
  { x: -28, z: 26, radius: 0.6 },
  // Entrance Arch Posts
  { x: -3.5, z: 42, radius: 0.9 },
  { x: 3.5, z: 42, radius: 0.9 },
];

// Clean 2D Line segments [x1, z1, x2, z2] (Open festival layout — no fences blocking exploration)
const FENCE_SEGMENTS: [number, number, number, number][] = [];

// Helper to calculate shortest distance from point (px, pz) to line segment (x1, z1) -> (x2, z2)
function distToSegment(px: number, pz: number, x1: number, z1: number, x2: number, z2: number): number {
  const l2 = (x2 - x1) * (x2 - x1) + (z2 - z1) * (z2 - z1);
  if (l2 === 0) return Math.hypot(px - x1, pz - z1);
  let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), pz - (z1 + t * (z2 - z1)));
}

/** Calculates walkable 3D stair, terraced hill, and platform surface heights */
function getSurfaceHeight(x: number, z: number): number {
  const hillHeight = getTerrainHeight(x, z);

  // 1. Shree Durga Mata Mandir Steps & Terracotta Plinth (Temple Hill at [0, -75])
  const distToMandir = Math.hypot(x, z - (-75));
  // Central grand stone staircase (width 8.4m, from z = -52 to -68)
  if (Math.abs(x) <= 4.2 && z <= -52 && z >= -68) {
    const stepIdx = Math.floor((-52 - z) / 2.0);
    return Math.min(2.8, 0.35 + stepIdx * 0.35);
  }
  // Elevated Mandir Plateau Plinth (level surface around temple)
  if (distToMandir <= 18) {
    return 2.8;
  }

  // 2. Central Chautari Stone Benches & Steps (Center at [0, 5])
  const chautariDist = Math.hypot(x, z - 5);
  if (chautariDist < 4.4 && chautariDist >= 2.9) {
    return hillHeight + 0.48; // Lower stone tier bench
  }
  if (chautariDist < 2.9 && chautariDist >= 1.1) {
    return hillHeight + 0.94; // Upper stone tier terrace
  }

  // 3. Dashain Tika House 1 Porch (Mula Ghar at [-28, -35])
  if (x >= -31.5 && x <= -24.5 && z >= -34.0 && z <= -30.5) {
    return hillHeight + 0.35; // Front porch
  }

  // 4. Dashain Tika House 2 Porch (Maiti Ghar at [28, -35])
  if (x >= 24.5 && x <= 31.5 && z >= -34.0 && z <= -30.5) {
    return hillHeight + 0.35; // Front porch
  }

  // 5. Aama Samuha Dance Platform Steps (Stage at [26, 22])
  if (x >= 21.0 && x <= 31.0 && z >= 19.0 && z <= 25.8) {
    return hillHeight + 0.8; // Raised wooden stage
  }

  return hillHeight;
}

export const LocalPlayerController: React.FC<LocalPlayerControllerProps> = ({
  displayName,
  customization,
  speechBubble,
  isLobby = false,
  onPositionChange,
  onNearbyInteractionChange,
  virtualJoystick,
  virtualJump,
  cameraRotateStep = 0,
  isLockedInAttraction = false,
  isSeatedOnSwing = false,
  swingAngle = 0,
  isSeatedAtTaas = false,
  isSeatedAtAama = false,
  isSeatedAtChautari = false,
  isBlessingActive = false,
  interactionTarget = null,
  activeEmote = null,
  activeAction = null,
  isKiteFlying = false,
  kiteData = { x: 0, y: 26, z: 0, bank: 0 },
  onKiteControl,
  heldItem = null,
  speedMultiplier = 1.0,
  isNight = false,
}) => {
  const playerRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  // Movement physics state - Spawn at Entrance Arch looking into the festival!
  const posRef = useRef(new THREE.Vector3(0, 0, 46));
  const velocityYRef = useRef(0);
  const isGroundedRef = useRef(true);
  const rotYRef = useRef(0);
  const [animState, setAnimState] = useState<AnimationState>("idle");
  const [showLocalName, setShowLocalName] = useState(false);
  const wasSeatedAtTaasRef = useRef(false);
  const wasSeatedAtAamaRef = useRef(false);
  const aamaSitSlotRef = useRef<{ x: number; z: number }>({ x: 42.0, z: 30.5 });
  const wasSeatedAtChautariRef = useRef(false);
  const chautariSitAngleRef = useRef(0);
  const wasSeatedOnSwingRef = useRef(false);
  const taasSitStartTimeRef = useRef<number | null>(null);

  // Camera Orbit angles & distance - Facing north (theta: 0) looking into the mela
  const cameraAngleRef = useRef({ theta: 0, phi: 0.28, distance: 7.2 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastFootstepRef = useRef(0);

  // Setup keyboard & mouse listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "a") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          return;
        }
      }
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      keysRef.current[e.code] = true;
      // Start music on first player interaction
      soundManager.ensureAudio();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      soundManager.ensureAudio();
      if (e.button === 0 || e.button === 2) {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= dx * 0.006;
      cameraAngleRef.current.phi = Math.max(0.08, Math.min(1.2, cameraAngleRef.current.phi + dy * 0.005));
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleWheel = (e: WheelEvent) => {
      cameraAngleRef.current.distance = Math.max(0.8, Math.min(16, cameraAngleRef.current.distance + e.deltaY * 0.008));
    };

    // Mobile touch look / pan controls
    const handleTouchStart = (e: TouchEvent) => {
      soundManager.ensureAudio();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // Only drag camera if touch is on the right 65% of the screen (away from joystick area)
        if (touch.clientX > window.innerWidth * 0.35) {
          isDraggingRef.current = true;
          lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePosRef.current.x;
      const dy = touch.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };

      cameraAngleRef.current.theta -= dx * 0.008;
      cameraAngleRef.current.phi = Math.max(0.08, Math.min(1.2, cameraAngleRef.current.phi + dy * 0.006));
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleBlur = () => {
      keysRef.current = {};
      isDraggingRef.current = false;
    };
    window.addEventListener("blur", handleBlur);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const canvas = gl.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: true });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl]);

  // Main game tick loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.08);

    // Continuous smooth camera rotation from mobile rotate buttons (Roblox style)
    if (cameraRotateStep !== 0) {
      cameraAngleRef.current.theta += cameraRotateStep * dt * 2.4;
    }

    // If in Start Lobby, provide a cinematic overview orbit of the festive map
    if (isLobby) {
      const t = state.clock.getElapsedTime() * 0.12;
      const radius = 62;
      const camX = Math.sin(t) * radius;
      const camZ = Math.cos(t) * radius + 5;
      const camY = 24 + Math.sin(t * 0.6) * 4;
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 4, 0); // Looking at the illuminated central temple and festival square

      if (playerRef.current) {
        playerRef.current.position.set(0, 0, 46);
        playerRef.current.rotation.set(0, 0, 0);
      }
      return;
    }

    // Handle transition out of swing (safe ground dismount, no midair floating!)
    if (wasSeatedOnSwingRef.current && !isSeatedOnSwing) {
      wasSeatedOnSwingRef.current = false;
      posRef.current.set(-26, 0, -5.5); // Safe ground spot in front of bamboo frame
      velocityYRef.current = 0;
      isGroundedRef.current = true;
      rotYRef.current = 0;
      if (playerRef.current) {
        playerRef.current.position.set(-26, 0, -5.5);
        playerRef.current.rotation.set(0, 0, 0);
      }
      setAnimState("idle");
    }

    // If seated on the swing, anchor player directly to the swing seat
    if (isSeatedOnSwing) {
      wasSeatedOnSwingRef.current = true;
      // Swing center is at x: -26, y: 11.2 (pivot), z: -10
      // Rope length is ~10.4m
      const ropeLength = 10.4;
      const seatX = -26;
      const seatY = 11.2 - Math.cos(swingAngle) * ropeLength + 0.3;
      const seatZ = -10 - Math.sin(swingAngle) * ropeLength;

      posRef.current.set(seatX, Math.max(0.3, seatY), seatZ);
      rotYRef.current = 0; // Face forward

      if (animState !== "swinging") setAnimState("swinging");

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.y = rotYRef.current;
        playerRef.current.rotation.x = swingAngle; // Tilt with swing
      }

      // Camera follow swing smoothly
      const { theta, phi, distance } = cameraAngleRef.current;
      const targetCamX = posRef.current.x + distance * Math.sin(theta) * Math.cos(phi);
      const targetCamY = posRef.current.y + 2.0 + distance * Math.sin(phi);
      const targetCamZ = posRef.current.z + distance * Math.cos(theta) * Math.cos(phi);
      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
      camera.lookAt(posRef.current.x, posRef.current.y + 1.2, posRef.current.z);

      onPositionChange?.({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotationY: rotYRef.current,
        animState: "swinging",
      });
      return;
    }

    // Handle transition out of seating (standing up)
    if (wasSeatedAtTaasRef.current && !isSeatedAtTaas) {
      wasSeatedAtTaasRef.current = false;
      taasSitStartTimeRef.current = null;
      posRef.current.set(-28, 0, 24.2); // Stand cleanly outside the mat
      rotYRef.current = 0;
      velocityYRef.current = 0;
      isGroundedRef.current = true;
      setAnimState("idle");
    }

    // If seated at Forest Taas circle
    if (isSeatedAtTaas) {
      wasSeatedAtTaasRef.current = true;
      if (taasSitStartTimeRef.current === null) {
        taasSitStartTimeRef.current = performance.now();
      }

      posRef.current.set(-28, 0.05, 21.8);
      rotYRef.current = Math.PI; // Face North towards mat

      if (animState !== "seated") setAnimState("seated");

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.set(0, rotYRef.current, 0);
      }

      const now = performance.now();
      const elapsed = (now - taasSitStartTimeRef.current) / 1000;
      if (elapsed < 3.8) {
        // 3.8s Cinematic Camera Pan / Orbit around the gathering
        const progress = elapsed / 3.8;
        const orbitAngle = Math.PI * 0.9 + progress * 1.5;
        const camDist = 6.2 - progress * 2.0;
        const camHeight = 3.6 - progress * 1.6;
        const camX = posRef.current.x + Math.sin(orbitAngle) * camDist;
        const camZ = posRef.current.z + Math.cos(orbitAngle) * camDist;
        const camY = posRef.current.y + camHeight;
        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        camera.lookAt(posRef.current.x, posRef.current.y + 0.6, posRef.current.z - 1.8);
      } else {
        const { theta, phi, distance } = cameraAngleRef.current;
        const targetCamX = posRef.current.x + distance * Math.sin(theta) * Math.cos(phi);
        const targetCamY = posRef.current.y + 2.0 + distance * Math.sin(phi);
        const targetCamZ = posRef.current.z + distance * Math.cos(theta) * Math.cos(phi);
        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
        camera.lookAt(posRef.current.x, posRef.current.y + 0.8, posRef.current.z);
      }

      onPositionChange?.({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotationY: rotYRef.current,
        animState: "seated",
      });
      return;
    }

    // Handle transition out of seating at Aama Samuha
    if (wasSeatedAtAamaRef.current && !isSeatedAtAama) {
      wasSeatedAtAamaRef.current = false;
      const slot = aamaSitSlotRef.current;
      posRef.current.set(slot.x, 0, slot.z + 1.2); // Stand safely beside the seating mat
      velocityYRef.current = 0;
      isGroundedRef.current = true;
      rotYRef.current = 0;
      setAnimState("idle");
    }

    // If seated at Aama Samuha Gathering Stage on the physical mats in front of stage
    if (isSeatedAtAama) {
      if (!wasSeatedAtAamaRef.current) {
        wasSeatedAtAamaRef.current = true;
        // Exact world coordinates of the 8 woven velvet mats in front of stage [26, 0, 22]
        const AAMA_SEAT_SLOTS = [
          { x: 21.5, z: 27.4 },
          { x: 23.8, z: 27.4 },
          { x: 26.0, z: 27.4 },
          { x: 28.2, z: 27.4 },
          { x: 30.5, z: 27.4 },
          { x: 22.8, z: 29.6 },
          { x: 26.0, z: 29.6 },
          { x: 29.2, z: 29.6 },
        ];
        let closest = AAMA_SEAT_SLOTS[0];
        let minD = Infinity;
        for (const s of AAMA_SEAT_SLOTS) {
          const d = Math.hypot(posRef.current.x - s.x, posRef.current.z - s.z);
          if (d < minD) {
            minD = d;
            closest = s;
          }
        }
        aamaSitSlotRef.current = closest;
      }

      const slot = aamaSitSlotRef.current;
      posRef.current.set(slot.x, 0.05, slot.z);
      rotYRef.current = 0; // Face North directly toward the cultural stage dancers!

      const isClapPressed = keysRef.current["Space"] || virtualJump;
      const sitAnim = isClapPressed ? "seated_clapping" : "seated";
      if (animState !== sitAnim) setAnimState(sitAnim);

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.set(0, rotYRef.current, 0);
      }

      // Camera positioned behind seated player looking over shoulders at the performers on stage
      camera.position.lerp(new THREE.Vector3(slot.x, 1.8, slot.z + 3.2), 0.12);
      camera.lookAt(slot.x, 1.3, 22.8);

      onPositionChange?.({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotationY: rotYRef.current,
        animState: sitAnim,
      });
      return;
    }

    // Handle transition out of seating at Central Chautari
    if (wasSeatedAtChautariRef.current && !isSeatedAtChautari) {
      wasSeatedAtChautariRef.current = false;
      const exitAngle = chautariSitAngleRef.current;
      posRef.current.set(Math.sin(exitAngle) * 4.85, 0, 5 + Math.cos(exitAngle) * 4.85);
      velocityYRef.current = 0;
      isGroundedRef.current = true;
      rotYRef.current = exitAngle;
      setAnimState("idle");
    }

    // If seated at Central Chautari Banyan Tree platform
    if (isSeatedAtChautari) {
      if (!wasSeatedAtChautariRef.current) {
        wasSeatedAtChautariRef.current = true;
        // Remember approach angle so player sits on the circular bench facing outward!
        chautariSitAngleRef.current = Math.atan2(posRef.current.x, posRef.current.z - 5);
      }
      const seatAngle = chautariSitAngleRef.current;
      // Position right on the outer rim of the lower stone bench tier (radius ~4.15m from tree center at [0, 5], height 0.48m)
      posRef.current.set(Math.sin(seatAngle) * 4.15, 0.48, 5 + Math.cos(seatAngle) * 4.15);
      rotYRef.current = seatAngle; // Face outward from tree center toward mela ground

      if (animState !== "seated") setAnimState("seated");

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.set(0, rotYRef.current, 0);
      }

      const { theta, phi, distance } = cameraAngleRef.current;
      const targetCamX = posRef.current.x + distance * Math.sin(theta) * Math.cos(phi);
      const targetCamY = posRef.current.y + 2.0 + distance * Math.sin(phi);
      const targetCamZ = posRef.current.z + distance * Math.cos(theta) * Math.cos(phi);
      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
      camera.lookAt(posRef.current.x, posRef.current.y + 0.8, posRef.current.z);

      onPositionChange?.({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotationY: rotYRef.current,
        animState: "seated",
      });
      return;
    }

    // If actively in Dashain Tika blessing physical animation
    if (isBlessingActive) {
      if (animState !== "kneeling_tika") setAnimState("kneeling_tika");
      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.set(0, rotYRef.current, 0);
      }
      onPositionChange?.({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotationY: rotYRef.current,
        animState: "kneeling_tika",
      });
      return;
    }

    // If actively flying kite
    if (isKiteFlying) {
      let steerX = 0;
      let steerY = 0;
      if (keysRef.current["KeyA"] || keysRef.current["ArrowLeft"]) steerX -= 1;
      if (keysRef.current["KeyD"] || keysRef.current["ArrowRight"]) steerX += 1;
      if (keysRef.current["KeyW"] || keysRef.current["ArrowUp"]) steerY += 1;
      if (keysRef.current["KeyS"] || keysRef.current["ArrowDown"]) steerY -= 1;
      if (virtualJoystick) {
        steerX += virtualJoystick.x;
        steerY -= virtualJoystick.y;
      }
      onKiteControl?.(steerX, steerY);

      // Current 3D position of the player's flying kite in the sky
      const currentKiteX = posRef.current.x + (kiteData?.x ?? 0);
      const currentKiteY = posRef.current.y + (kiteData?.y ?? 26);
      const currentKiteZ = posRef.current.z - 16 + (kiteData?.z ?? 0);

      // Camera positions behind and slightly above the player, looking UP directly at the soaring kite
      const kiteCamX = posRef.current.x;
      const kiteCamY = posRef.current.y + 2.2;
      const kiteCamZ = posRef.current.z + 6.0;
      camera.position.lerp(new THREE.Vector3(kiteCamX, kiteCamY, kiteCamZ), 0.1);
      camera.lookAt(currentKiteX, currentKiteY, currentKiteZ);

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        rotYRef.current = Math.PI; // Face north toward the soaring kite
        playerRef.current.rotation.set(0, rotYRef.current, 0);
      }

      if (animState !== ("flying_kite" as any)) setAnimState("flying_kite" as any);
      onPositionChange?.({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotationY: rotYRef.current,
        animState: "idle",
      });
      return;
    }

    // Determine movement direction from Keyboard & Mobile Joystick
    let moveForward = 0;
    let moveRight = 0;

    if (keysRef.current["KeyW"] || keysRef.current["ArrowUp"]) moveForward += 1;
    if (keysRef.current["KeyS"] || keysRef.current["ArrowDown"]) moveForward -= 1;
    if (keysRef.current["KeyA"] || keysRef.current["ArrowLeft"]) moveRight -= 1;
    if (keysRef.current["KeyD"] || keysRef.current["ArrowRight"]) moveRight += 1;

    if (virtualJoystick) {
      moveRight += virtualJoystick.x;
      moveForward -= virtualJoystick.y;
    }

    const isSprint = keysRef.current["ShiftLeft"] || keysRef.current["ShiftRight"];
    const isJumpPressed = keysRef.current["Space"] || virtualJump;

    // Jump handling
    const gravity = 24.0;
    if (isJumpPressed && isGroundedRef.current) {
      velocityYRef.current = 8.5;
      isGroundedRef.current = false;
    }

    // Apply gravity
    const currentGroundHeight = getSurfaceHeight(posRef.current.x, posRef.current.z);
    if (!isGroundedRef.current) {
      velocityYRef.current -= gravity * dt;
      posRef.current.y += velocityYRef.current * dt;

      if (posRef.current.y <= currentGroundHeight) {
        posRef.current.y = currentGroundHeight;
        velocityYRef.current = 0;
        isGroundedRef.current = true;
      }
    } else {
      // Strict terrain collision: avatar must NEVER sink beneath ground level, stairs or hill slope
      if (posRef.current.y < currentGroundHeight) {
        posRef.current.y = currentGroundHeight;
      } else if (posRef.current.y > currentGroundHeight + 0.25) {
        // Walked off an elevated terrace or ledge — begin natural fall
        isGroundedRef.current = false;
        velocityYRef.current = 0;
      } else {
        // Firmly track ground level and stairs
        posRef.current.y = currentGroundHeight;
      }
    }

    const isMoving = Math.abs(moveForward) > 0.05 || Math.abs(moveRight) > 0.05;
    let currentAnim: AnimationState = "idle";

    if (!isGroundedRef.current) {
      currentAnim = velocityYRef.current > 0 ? "jump" : "fall";
    } else if (isMoving) {
      currentAnim = isSprint ? "run" : "walk";
    } else if (activeAction) {
      // Priority for eating, drinking, wearing topi, flying kite
      currentAnim = activeAction as any;
    } else if (activeEmote) {
      // Prioritize active emote when standing still!
      currentAnim = activeEmote;
    } else {
      currentAnim = "idle";
    }

    if (currentAnim !== animState) {
      setAnimState(currentAnim);
    }

    // Translate input vector relative to Camera Yaw Angle
    if (isMoving) {
      const baseSpeed = isSprint ? MOVEMENT_LIMITS.MAX_SPRINT_SPEED : MOVEMENT_LIMITS.MAX_WALK_SPEED;
      const speed = baseSpeed * speedMultiplier;
      const camTheta = cameraAngleRef.current.theta;

      const forwardDir = new THREE.Vector3(-Math.sin(camTheta), 0, -Math.cos(camTheta));
      const rightDir = new THREE.Vector3(Math.cos(camTheta), 0, -Math.sin(camTheta));

      const moveDir = new THREE.Vector3()
        .addScaledVector(forwardDir, moveForward)
        .addScaledVector(rightDir, moveRight)
        .normalize();

      const nextX = posRef.current.x + moveDir.x * speed * dt;
      const nextZ = posRef.current.z + moveDir.z * speed * dt;

      // Check obstacle collisions
      let canMove = true;
      for (const obs of OBSTACLES) {
        const dist = Math.hypot(nextX - obs.x, nextZ - obs.z);
        if (dist < obs.radius) {
          canMove = false;
          break;
        }
      }

      // Check collidable wooden & bamboo fences along pathways
      if (canMove) {
        for (const [x1, z1, x2, z2] of FENCE_SEGMENTS) {
          if (distToSegment(nextX, nextZ, x1, z1, x2, z2) < 0.45) {
            canMove = false;
            break;
          }
        }
      }

      // Check stairs & elevation step-up limit (smoothly step up to 1.25m stairs/hills, blocks steep walls)
      const nextSurfaceHeight = getSurfaceHeight(nextX, nextZ);
      if (nextSurfaceHeight - posRef.current.y > 1.25) {
        canMove = false;
      }

      // Perimeter boundary (expanded 250m x 250m world) & structure wall collision checks
      if (
        Math.abs(nextX) > 125 ||
        Math.abs(nextZ) > 125 ||
        checkStructureCollision(nextX, nextZ, 0.42)
      ) {
        canMove = false;
      }

      if (canMove) {
        posRef.current.x = nextX;
        posRef.current.z = nextZ;
        const targetRotY = Math.atan2(moveDir.x, moveDir.z);
        // Shortest-arc angular interpolation: prevents 360-degree spinning and snapping!
        let diff = targetRotY - rotYRef.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        rotYRef.current += diff * 0.25;
      }

      // Footstep sound tick
      const now = performance.now();
      const footstepInterval = isSprint ? 260 : 380;
      if (isGroundedRef.current && now - lastFootstepRef.current > footstepInterval) {
        soundManager.playFootstep();
        lastFootstepRef.current = now;
      }
    } else if (interactionTarget) {
      // When standing still and interacting with an NPC, Elder, or Shrine, face them smoothly!
      const targetAngle = Math.atan2(interactionTarget.x - posRef.current.x, interactionTarget.z - posRef.current.z);
      let diff = targetAngle - rotYRef.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      rotYRef.current += diff * 0.18;
    }

    // Update avatar position & rotation
    if (playerRef.current) {
      playerRef.current.position.copy(posRef.current);
      playerRef.current.rotation.set(0, rotYRef.current, 0);
    }

    // Camera follow calculation (Third-Person Orbit)
    const { theta, phi, distance } = cameraAngleRef.current;
    const targetCamX = posRef.current.x + distance * Math.sin(theta) * Math.cos(phi);
    const targetCamY = posRef.current.y + 1.6 + distance * Math.sin(phi);
    const targetCamZ = posRef.current.z + distance * Math.cos(theta) * Math.cos(phi);

    camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
    camera.lookAt(posRef.current.x, posRef.current.y + 1.4, posRef.current.z);

    // Camera proximity fading: remove user avatar when camera is too close (< 1.8m)
    const actualCamDist = camera.position.distanceTo(posRef.current);
    if (playerRef.current) {
      playerRef.current.visible = actualCamDist >= 1.8;
    }

    // Only load/show local user name tag when camera is far (> 5.0m)
    const nameVisible = actualCamDist > 5.0;
    if (nameVisible !== showLocalName) {
      setShowLocalName(nameVisible);
    }

    // Check nearby interactions
    let nearby: string | null = null;
    const px = posRef.current.x;
    const pz = posRef.current.z;

    const distToChautari = Math.hypot(px - ATTRACTION_LOCATIONS.CENTRAL_CHAUTARI.x, pz - ATTRACTION_LOCATIONS.CENTRAL_CHAUTARI.z);
    const distToPing = Math.hypot(px - ATTRACTION_LOCATIONS.LINGE_PING.x, pz - ATTRACTION_LOCATIONS.LINGE_PING.z);
    const distToLangur = Math.hypot(px - ATTRACTION_LOCATIONS.LANGUR_BURJA_BOOTH.x, pz - ATTRACTION_LOCATIONS.LANGUR_BURJA_BOOTH.z);
    const distToDiya = Math.hypot(px - ATTRACTION_LOCATIONS.TIHAR_RANGOLI_AREA.x, pz - ATTRACTION_LOCATIONS.TIHAR_RANGOLI_AREA.z);
    const distToTaas = Math.hypot(px - ATTRACTION_LOCATIONS.FOREST_TAAS_CIRCLE.x, pz - ATTRACTION_LOCATIONS.FOREST_TAAS_CIRCLE.z);
    const distToTika1 = Math.hypot(px - ATTRACTION_LOCATIONS.TIKA_HOUSE_1.x, pz - ATTRACTION_LOCATIONS.TIKA_HOUSE_1.z);
    const distToTika2 = Math.hypot(px - ATTRACTION_LOCATIONS.TIKA_HOUSE_2.x, pz - ATTRACTION_LOCATIONS.TIKA_HOUSE_2.z);
    const distToAama = Math.hypot(px - ATTRACTION_LOCATIONS.AAMA_SAMUHA_STAGE.x, pz - ATTRACTION_LOCATIONS.AAMA_SAMUHA_STAGE.z);
    const distToChiya = Math.hypot(px - ATTRACTION_LOCATIONS.CHIYA_STALL.x, pz - ATTRACTION_LOCATIONS.CHIYA_STALL.z);
    const distToSelRoti = Math.hypot(px - ATTRACTION_LOCATIONS.SEL_ROTI_STALL.x, pz - ATTRACTION_LOCATIONS.SEL_ROTI_STALL.z);
    const distToChanga = Math.hypot(px - ATTRACTION_LOCATIONS.CHANGA_KITE_STALL.x, pz - ATTRACTION_LOCATIONS.CHANGA_KITE_STALL.z);
    const distToDhaka = Math.hypot(px - ATTRACTION_LOCATIONS.DHAKA_TEXTILE_STALL.x, pz - ATTRACTION_LOCATIONS.DHAKA_TEXTILE_STALL.z);
    const distToMandir = Math.hypot(px - ATTRACTION_LOCATIONS.DURGA_MATA_MANDIR.x, pz - ATTRACTION_LOCATIONS.DURGA_MATA_MANDIR.z);
    const distToDanPeti = Math.hypot(px - ATTRACTION_LOCATIONS.DAN_PETI.x, pz - ATTRACTION_LOCATIONS.DAN_PETI.z);
    const distToSanstha = Math.hypot(px - ATTRACTION_LOCATIONS.SANSTHA_DESK.x, pz - ATTRACTION_LOCATIONS.SANSTHA_DESK.z);

    if (distToPing < 5.0) nearby = "ping";
    else if (distToDanPeti < 3.0) nearby = "dan_peti";
    else if (distToSanstha < 4.5) nearby = "sanstha";
    else if (distToChautari >= 1.2 && distToChautari <= 5.4) nearby = "chautari";
    else if (distToLangur < 5.0) nearby = "langur";
    else if (distToTaas < 5.0) nearby = "taas";
    else if (distToDiya < 7.5) nearby = "diya";
    else if (distToTika1 < 5.5) nearby = "tika1";
    else if (distToTika2 < 5.5) nearby = "tika2";
    else if (distToAama < 6.0) nearby = "aama_samuha";
    else if (distToMandir < 6.5) nearby = "mandir";
    else if (distToChiya < 4.5) nearby = "chiya";
    else if (distToSelRoti < 4.5) nearby = "sel_roti";
    else if (distToChanga < 4.5) nearby = "changa";
    else if (distToDhaka < 4.5) nearby = "dhaka";

    onNearbyInteractionChange?.(nearby);

    // Notify parent / network
    onPositionChange?.({
      x: posRef.current.x,
      y: posRef.current.y,
      z: posRef.current.z,
      rotationY: rotYRef.current,
      animState: currentAnim,
    });
  });

  return (
    <group ref={playerRef} position={[0, 0, 46]}>
      <CharacterAvatar
        displayName={displayName}
        animState={activeAction ?? animState}
        customization={customization}
        speechBubble={speechBubble}
        isLocalPlayer={true}
        heldItem={heldItem}
        showCardsInHand={isSeatedAtTaas}
        showNameTag={showLocalName}
      />

      {/* Mobile Personal Diya Light: Single optimized warm pointLight only when holding Diya or dark night */}
      {(isNight || heldItem === "diya") && (
        <pointLight
          position={[0, 1.2, 0.4]}
          color="#FFA726"
          intensity={1.8}
          distance={10}
          decay={2}
          castShadow={false}
        />
      )}
    </group>
  );
};
