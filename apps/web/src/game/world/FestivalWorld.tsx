import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { INITIAL_DIYA_STATIONS } from "@melaverse/shared";
import { CharacterAvatar } from "../player/CharacterAvatar.js";
import { DurgaMandir } from "./DurgaMandir.js";
import { GhilimiliLights } from "./GhilimiliLights.js";
import { getTerrainHeight } from "./terrainMath.js";

const FESTIVE_DIYAS: [number, number, number][] = [
  // Shree Durga Mata Mandir Steps & Entrance (Temple Hill at [0, 2.8, -75])
  [-2.2, 0.45, -54],
  [2.2, 0.45, -54],
  [-2.0, 1.45, -62],
  [2.0, 1.45, -62],
  [-1.6, 2.9, -70],
  [1.6, 2.9, -70],

  // Central Chautari stone platform edges
  [3.2, 0.75, 5],
  [-3.2, 0.75, 5],
  [0, 0.75, 8.2],
  [0, 0.75, 1.8],

  // Bada Dashain Mula Ghar (House 1) porch entrance
  [-30.5, 0.3, -30],
  [-25.5, 0.3, -30],

  // Dashain Maiti Ghar (House 2) porch entrance
  [25.5, 0.3, -30],
  [30.5, 0.3, -30],

  // Aama Samuha cultural stage front corners
  [22.2, 0.45, 25.8],
  [29.8, 0.45, 25.8],

  // Entrance Archway Toran base
  [-3.5, 0.1, 41.5],
  [3.5, 0.1, 41.5],
];

const LAMPPOST_POSITIONS: [number, number, number][] = [
  // Entrance Archway
  [-3.5, 0, 41],
  [3.5, 0, 41],

  // Village Market Street
  [-4.4, 0, 33],
  [4.4, 0, 33],
  [-4.4, 0, 23],
  [4.4, 0, 23],
  [-4.4, 0, 13],
  [4.4, 0, 13],

  // Central Chautari Banyan Tree Plaza
  [-4.8, 0, 9],
  [4.8, 0, 9],
  [-4.8, 0, 1],
  [4.8, 0, 1],

  // North Promenade towards Mandir (Before Rangoli)
  [-3.8, 0, -8],
  [3.8, 0, -8],
  [-3.8, 0, -15],
  [3.8, 0, -15],

  // North Promenade (Leading to Mandir steps and hill)
  [-3.8, 0, -35],
  [3.8, 0, -35],
  [-4.2, 0.4, -50],
  [4.2, 0.4, -50],
  [-4.0, 1.8, -64],
  [4.0, 1.8, -64],

  // Pathways to Attractions
  [-14, 0, -3],
  [-20, 0, -7],
  [14, 0, 14],
  [20, 0, 18],
];

// Clean layout without artificial path-blocking fences
const FENCE_SEGMENTS: [number, number, number, number][] = [];

const FenceLine: React.FC<{ x1: number; z1: number; x2: number; z2: number }> = ({ x1, z1, x2, z2 }) => {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);
  const midX = (x1 + x2) / 2;
  const midZ = (z1 + z2) / 2;
  const postInterval = 2.8;
  const count = Math.max(2, Math.round(len / postInterval) + 1);

  return (
    <group position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
      {/* Horizontal Rails */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.05, 0.06, len]} />
        <meshStandardMaterial color="#6B4423" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.05, 0.06, len]} />
        <meshStandardMaterial color="#6B4423" roughness={0.8} />
      </mesh>
      {/* Vertical Posts */}
      {Array.from({ length: count }).map((_, i) => {
        const pz = -len / 2 + (i / (count - 1)) * len;
        return (
          <mesh key={`post-${i}`} position={[0, 0.45, pz]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.9, 6]} />
            <meshStandardMaterial color="#4A2E18" roughness={0.85} />
          </mesh>
        );
      })}
    </group>
  );
};

interface FestivalWorldProps {
  swingAngle?: number;
  diyaStates?: Map<string, { isLit: boolean; litBy?: string }>;
  onInteractPing?: () => void;
  onInteractLangur?: () => void;
  onInteractDiya?: (id: string) => void;
  onInteractStall?: (type: "chiya" | "sel_roti" | "changa" | "dhaka") => void;
  onInteractTaas?: () => void;
  onInteractTikaHouse?: (houseId: "house1" | "house2") => void;
  onInteractAamaSamuha?: () => void;
  onPrayMandir?: () => void;
  onOpenDanPeti?: () => void;
  onInteractSanstha?: () => void;
  onInteractAamaBench?: () => void;
  onInteractChautari?: () => void;
  nearbyInteraction?: string | null;
  isSeatedOnSwing?: boolean;
  swingOccupantName?: string | null;
  taasPlayerCount?: number;
  isSeatedAtTaas?: boolean;
  isSeatedAtAama?: boolean;
  isSeatedAtChautari?: boolean;
  blessingActiveElder?: "house1" | "house2" | null;
  langurPhase?: "betting" | "rolling" | "payout";
  langurDice?: string[];
  isNight?: boolean;
  isKiteFlying?: boolean;
  kiteData?: { x: number; y: number; z: number; bank: number };
  playerPosition?: { x: number; y: number; z: number };
  onJoinDance?: () => void;
  isDancing?: boolean;
}

export const FestivalWorld: React.FC<FestivalWorldProps> = ({
  swingAngle = 0,
  diyaStates = new Map(),
  onInteractPing,
  onInteractLangur,
  onInteractDiya,
  onInteractStall,
  onInteractTaas,
  onInteractTikaHouse,
  onInteractAamaSamuha,
  onPrayMandir,
  onOpenDanPeti,
  onInteractSanstha,
  onInteractAamaBench,
  onInteractChautari,
  onJoinDance,
  isDancing = false,
  nearbyInteraction,
  isSeatedOnSwing = false,
  swingOccupantName = null,
  taasPlayerCount = 0,
  isSeatedAtTaas = false,
  isSeatedAtAama = false,
  isSeatedAtChautari = false,
  blessingActiveElder = null,
  langurPhase = "betting",
  langurDice = ["jhanda", "burja", "ita", "paan", "hukum", "chidi"],
  isNight = false,
  isKiteFlying = false,
  kiteData = { x: 0, y: 28, z: 0, bank: 0 },
  playerPosition = { x: 0, y: 0, z: 46 },
}) => {
  const swingPivotRef = useRef<THREE.Group>(null);
  const prayerFlagsRef = useRef<THREE.Group>(null);
  const flyingKiteRef = useRef<THREE.Group>(null);
  const kiteStringRef = useRef<THREE.Mesh>(null);
  const dancersRef = useRef<THREE.Group>(null);
  const diceCupRef = useRef<THREE.Group>(null);
  const diceGroupRef = useRef<THREE.Group>(null);

  // Proximity helper: only mount interactive HTML text buttons when player is nearby (LOD text optimization)
  const isNear = (x: number, z: number, maxDist: number = 7.0) =>
    Math.hypot(playerPosition.x - x, playerPosition.z - z) <= maxDist;

  // Animate swing seat, prayer flags, Aama Samuha dancers, and flying kites
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (swingPivotRef.current) {
      swingPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        swingPivotRef.current.rotation.x,
        swingAngle,
        0.35
      );
    }
    if (prayerFlagsRef.current) {
      prayerFlagsRef.current.children.forEach((flag, idx) => {
        flag.rotation.z = Math.sin(t * 3 + idx * 0.5) * 0.08;
      });
    }
    if (flyingKiteRef.current) {
      if (isKiteFlying) {
        const kx = playerPosition.x + kiteData.x;
        const ky = playerPosition.y + kiteData.y;
        const kz = playerPosition.z - 16 + kiteData.z;
        flyingKiteRef.current.position.set(kx, ky, kz);
        flyingKiteRef.current.rotation.z = kiteData.bank + Math.sin(t * 8) * 0.08;
        flyingKiteRef.current.rotation.x = 0.45 + Math.cos(t * 6) * 0.05;
        flyingKiteRef.current.rotation.y = Math.sin(t * 5) * 0.08;

        // Position and orient the taut kite string connecting player's hands to the kite
        if (kiteStringRef.current) {
          kiteStringRef.current.visible = true;
          const hx = playerPosition.x;
          const hy = playerPosition.y + 1.1;
          const hz = playerPosition.z - 0.2;
          const mx = (hx + kx) / 2;
          const my = (hy + ky - 0.4) / 2;
          const mz = (hz + kz) / 2;
          kiteStringRef.current.position.set(mx, my, mz);
          const len = Math.hypot(kx - hx, (ky - 0.4) - hy, kz - hz);
          kiteStringRef.current.scale.set(1, len, 1);
          kiteStringRef.current.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(kx - hx, (ky - 0.4) - hy, kz - hz).normalize()
          );
        }
      } else {
        // Ambient festive kite swaying gracefully in the festival sky
        flyingKiteRef.current.position.set(Math.sin(t * 0.8) * 10, 30 + Math.sin(t * 1.5) * 2.5, Math.cos(t * 0.6) * 8);
        flyingKiteRef.current.rotation.z = Math.sin(t * 2) * 0.2;
        flyingKiteRef.current.rotation.x = 0.4 + Math.cos(t * 2.5) * 0.06;
        if (kiteStringRef.current) {
          kiteStringRef.current.visible = false;
        }
      }
    }

    if (diceCupRef.current) {
      if (langurPhase === "rolling") {
        diceCupRef.current.position.y = 1.35 + Math.abs(Math.sin(t * 22)) * 0.18;
        diceCupRef.current.rotation.z = Math.sin(t * 26) * 0.25;
        diceCupRef.current.rotation.x = Math.cos(t * 20) * 0.15;
      } else {
        diceCupRef.current.position.y = 1.35;
        diceCupRef.current.rotation.set(0, 0, 0);
      }
    }
    if (diceGroupRef.current) {
      if (langurPhase === "rolling") {
        diceGroupRef.current.children.forEach((die, idx) => {
          die.rotation.x += 0.25 + idx * 0.05;
          die.rotation.y += 0.3 + idx * 0.04;
          die.position.y = 0.08 + Math.abs(Math.sin(t * 18 + idx)) * 0.12;
        });
      } else {
        diceGroupRef.current.children.forEach((die) => {
          die.position.y = 0.08;
          die.rotation.set(0, 0, 0);
        });
      }
    }
  });

  // Procedural 3D Terraced Landscape Mesh matching getTerrainHeight() exactly with biome vertex colors
  const terrainGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(320, 320, 56, 56);
    geom.rotateX(-Math.PI / 2);
    const pos = geom.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const h = getTerrainHeight(vx, vz);
      pos.setY(i, h);

      // Procedural Nepali Biome vertex coloring
      const isMustard = Math.abs(vx) > 55 && Math.abs(vx) < 115 && vz > -15 && vz < 55;
      const isNorthHill = vz < -80;
      const isVillage = Math.abs(vx) < 28 && vz > -45 && vz < 45;

      let r = 0.24;
      let g = 0.42;
      let b = 0.20; // Default lush green meadow
      if (isMustard) {
        // Vibrant yellow blooming mustard field (पहेँलो तोरीबारी)
        r = 0.80;
        g = 0.70;
        b = 0.06;
      } else if (isVillage) {
        // Fairground clay / earthen courtyard
        r = 0.49;
        g = 0.41;
        b = 0.30;
      } else if (isNorthHill) {
        // High pine slopes
        r = 0.18;
        g = 0.35;
        b = 0.15;
      } else if (h > 1.2) {
        // Terraced hillside transition
        r = 0.29;
        g = 0.48;
        b = 0.22;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <group>
      {/* ─── Ground & Terrains (Expanded 320x320 Nepal Landscape) ─────────── */}
      {/* Procedural 3D Terraced Hills, Valley & Mustard Fields (Visible & Collidable) */}
      <mesh geometry={terrainGeometry} position={[0, -0.02, 0]} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} />
      </mesh>

      {/* ─── Elevated Mandir Hill Sacred Stone Courtyard (मन्दिर प्राङ्गण at y = 2.81m, z = -75) ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.81, -75]} receiveShadow>
        <circleGeometry args={[17.5, 36]} />
        <meshStandardMaterial color="#78716C" roughness={0.82} />
      </mesh>
      {/* Ornate Terracotta Border Curb around the Temple Courtyard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.815, -75]}>
        <ringGeometry args={[16.8, 17.5, 36]} />
        <meshStandardMaterial color="#991B1B" roughness={0.7} />
      </mesh>

      {/* Grand Ceremonial Stone Steps leading up to the Mandir Hill from z = -53 to -69 */}
      {[
        { y: 0.35, z: -53.0, width: 8.2, depth: 2.0 },
        { y: 0.70, z: -55.0, width: 8.0, depth: 2.0 },
        { y: 1.05, z: -57.0, width: 7.8, depth: 2.0 },
        { y: 1.40, z: -59.0, width: 7.6, depth: 2.0 },
        { y: 1.75, z: -61.0, width: 7.4, depth: 2.0 },
        { y: 2.10, z: -63.0, width: 7.2, depth: 2.0 },
        { y: 2.45, z: -65.0, width: 7.0, depth: 2.0 },
        { y: 2.80, z: -67.0, width: 6.8, depth: 2.0 },
      ].map((step, idx) => (
        <group key={`mandir-hill-step-${idx}`} position={[0, step.y - 0.175, step.z]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[step.width, 0.35, step.depth]} />
            <meshStandardMaterial color="#B45309" roughness={0.75} />
          </mesh>
          {/* Stone step edging curb */}
          <mesh position={[0, 0.18, step.depth / 2 - 0.05]}>
            <boxGeometry args={[step.width, 0.05, 0.1]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ─── Detailed Interconnected Festival Pathways (बाटो तथा चौतारीहरू) ───────── */}
      {/* 1. Central Chautari Plaza Flagstone Roundabout (Centered at [0, 5]) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 5]} receiveShadow>
        <circleGeometry args={[11.5, 36]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>
      {/* Decorative Red Brick Outer Border for Plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 5]}>
        <ringGeometry args={[10.9, 11.5, 36]} />
        <meshStandardMaterial color="#7C2D12" roughness={0.75} />
      </mesh>

      {/* 2. South Entrance Walkway Avenue (Bazaar Street: South Gate to Chautari border) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 31.5]} receiveShadow>
        <planeGeometry args={[7.2, 30]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>
      {/* Entrance Avenue Brick Edging */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.75, 0.012, 31.5]}>
        <planeGeometry args={[0.3, 30]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.75, 0.012, 31.5]}>
        <planeGeometry args={[0.3, 30]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>

      {/* 3. North Grand Mandir Promenade — Section 1 (Chautari border at z=-6.5 to Rangoli south border at z=-15.8) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, -11.15]} receiveShadow>
        <planeGeometry args={[7.2, 9.3]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>
      {/* Section 1 Curbs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.75, 0.012, -11.15]}>
        <planeGeometry args={[0.3, 9.3]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.75, 0.012, -11.15]}>
        <planeGeometry args={[0.3, 9.3]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>

      {/* 4. North Grand Mandir Promenade — Section 2 (Rangoli north border at z=-34.2 to Mandir Stairs at z=-52.0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, -43.1]} receiveShadow>
        <planeGeometry args={[7.2, 17.8]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>
      {/* Section 2 Curbs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.75, 0.012, -43.1]}>
        <planeGeometry args={[0.3, 17.8]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.75, 0.012, -43.1]}>
        <planeGeometry args={[0.3, 17.8]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>

      {/* 5. West Cross Branch to Bada Dashain Mula Ghar (House 1: Promenade curb x=-3.75 to House 1 porch x=-23.5) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.625, 0.007, -37.5]} receiveShadow>
        <planeGeometry args={[19.75, 4.0]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>

      {/* 6. East Cross Branch to Dashain Maiti Ghar (House 2: Promenade curb x=+3.75 to House 2 porch x=+23.5) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.625, 0.007, -37.5]} receiveShadow>
        <planeGeometry args={[19.75, 4.0]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>

      {/* 7. West Path to Traditional Bamboo Linge Ping (Chautari border to Linge Ping Apron) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.52]} position={[-15.75, 0.007, -4.0]} receiveShadow>
        <planeGeometry args={[4.4, 14.5]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>
      {/* Linge Ping Bamboo Courtyard Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.005, -10]} receiveShadow>
        <circleGeometry args={[5.5, 24]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>

      {/* 8. Northwest Pathway — Section A (Linge Ping Apron z=-15.5 to House 1 Cross Branch z=-35.5) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.007, -25.5]} receiveShadow>
        <planeGeometry args={[4.0, 20]} />
        <meshStandardMaterial color="#9C4124" roughness={0.8} />
      </mesh>

      {/* 9. Northwest Pathway — Section B (House 1 Cross Branch z=-39.5 to Dance Ring Apron z=-41.5) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.007, -40.5]} receiveShadow>
        <planeGeometry args={[4.0, 2.0]} />
        <meshStandardMaterial color="#9C4124" roughness={0.8} />
      </mesh>
      {/* Northwest Dance Ring Courtyard Apron Behind Mula Ghar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.005, -46]} receiveShadow>
        <circleGeometry args={[4.5, 24]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>

      {/* 10. Southwest Path to Forest Taas Circle (Chautari border to Taas Apron) */}
      <mesh rotation={[-Math.PI / 2, 0, -0.49]} position={[-16.1, 0.007, 13.6]} receiveShadow>
        <planeGeometry args={[4.4, 14.5]} />
        <meshStandardMaterial color="#9C4124" roughness={0.8} />
      </mesh>
      {/* Forest Taas Circle Ground Clearing Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-28, 0.005, 20]} receiveShadow>
        <circleGeometry args={[5.5, 24]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>

      {/* 11. Southeast Path to Aama Samuha Gathering Stage (Chautari border to Stage Apron) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.58]} position={[15.35, 0.007, 15.0]} receiveShadow>
        <planeGeometry args={[4.4, 14.5]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>

      {/* 12. Northeast Path to Langur Burja Game Pavilion (Chautari border to Pavilion Apron) */}
      <mesh rotation={[-Math.PI / 2, 0, -0.61]} position={[15.25, 0.007, -5.85]} receiveShadow>
        <planeGeometry args={[4.4, 14.8]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>
      {/* Langur Burja Pavilion Ground Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.005, -12]} receiveShadow>
        <circleGeometry args={[5.0, 24]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>

      {/* ─── Distant Nepal Scenery (Himalayan Giants & Rolling Hills on Far Horizon) ─ */}
      <group position={[0, 0, -260]}>
        {/* Mid-Hill Green Ridges (Nepal Mahabharat range) */}
        <mesh position={[-110, 26, -20]}>
          <coneGeometry args={[95, 60, 8]} />
          <meshStandardMaterial color="#23491E" roughness={0.95} />
        </mesh>
        <mesh position={[0, 34, -40]}>
          <coneGeometry args={[115, 75, 8]} />
          <meshStandardMaterial color="#2F5C26" roughness={0.95} />
        </mesh>
        <mesh position={[110, 28, -15]}>
          <coneGeometry args={[95, 62, 8]} />
          <meshStandardMaterial color="#23491E" roughness={0.95} />
        </mesh>

        {/* Snow-capped Himalayan Giants (Ganesh Himal / Langtang / Machhapuchhre) */}
        <mesh position={[-70, 75, -80]}>
          <coneGeometry args={[85, 150, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
        <mesh position={[60, 90, -100]}>
          <coneGeometry args={[100, 180, 6]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
        </mesh>
        <mesh position={[0, 105, -120]}>
          <coneGeometry args={[115, 210, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
      </group>

      {/* ─── Flying Dashain Kite (चङ्गा) Soaring in the Sky ────────────────── */}
      <group ref={flyingKiteRef} position={[0, 28, 0]}>
        {/* Diamond Paper Sail (Traditional Nepali Festival Palette) */}
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh>
            <planeGeometry args={[2.8, 2.8]} />
            <meshBasicMaterial color="#DC2626" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.7, 0.7, 0.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.7, -0.7, 0.01]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshBasicMaterial color="#0284C7" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1.1, 1.1]} />
            <meshBasicMaterial color="#FDE047" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Bamboo Structural Spars (ठाडो र कमानो) */}
        {/* Thado (Vertical Center Bamboo Spine) */}
        <mesh position={[0, 0, 0.03]}>
          <cylinderGeometry args={[0.025, 0.025, 3.8, 6]} />
          <meshStandardMaterial color="#D4A373" roughness={0.7} />
        </mesh>
        {/* Kamano (Curved Horizontal Crossbow) */}
        <mesh position={[0, 0.4, 0.04]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 3.7, 6]} />
          <meshStandardMaterial color="#C68B59" roughness={0.7} />
        </mesh>

        {/* Fluttering Triple Tail Ribbons (पुच्छर) */}
        <group position={[0, -1.9, 0]}>
          <mesh position={[0, -1.8, 0]}>
            <cylinderGeometry args={[0.05, 0.02, 3.6, 4]} />
            <meshBasicMaterial color="#E11D48" />
          </mesh>
          <mesh position={[-0.35, -1.4, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.04, 0.02, 2.8, 4]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
          <mesh position={[0.35, -1.4, 0]} rotation={[0, 0, -0.15]}>
            <cylinderGeometry args={[0.04, 0.02, 2.8, 4]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
        </group>
      </group>

      {/* Taut Manjha / Thread String Connecting Player Hands to Flying Kite */}
      <mesh ref={kiteStringRef} visible={false}>
        <cylinderGeometry args={[0.008, 0.008, 1, 4]} />
        <meshBasicMaterial color="#F8FAFC" />
      </mesh>

      {/* ─── 1. Entrance Arch (Chatparva Mela Toran) ────────────────────────── */}
      <group position={[0, 0, 42]}>
        <mesh position={[-3.5, 3, 0]} castShadow>
          <boxGeometry args={[0.6, 6, 0.6]} />
          <meshStandardMaterial color="#4A2E18" roughness={0.8} />
        </mesh>
        <mesh position={[3.5, 3, 0]} castShadow>
          <boxGeometry args={[0.6, 6, 0.6]} />
          <meshStandardMaterial color="#4A2E18" roughness={0.8} />
        </mesh>
        <mesh position={[0, 6.2, 0]} castShadow>
          <boxGeometry args={[8.6, 0.4, 1.4]} />
          <meshStandardMaterial color="#8B0000" roughness={0.7} />
        </mesh>
        <mesh position={[0, 6.7, 0]} castShadow>
          <boxGeometry args={[6.8, 0.5, 1.1]} />
          <meshStandardMaterial color="#B22222" roughness={0.7} />
        </mesh>

        <group position={[0, 5.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[5.8, 1.1, 0.2]} />
            <meshStandardMaterial color="#2B1810" roughness={0.6} />
          </mesh>
          {isNear(0, 42, 16.0) && (
            <Html position={[0, 0, 0.15]} center transform distanceFactor={10} zIndexRange={[1, 5]}>
              <div
                style={{
                  fontFamily: "serif",
                  fontWeight: 900,
                  fontSize: "24px",
                  color: "#FFD700",
                  textShadow: "0 2px 4px #000",
                  letterSpacing: "2px",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                🎪 CHATPARVA MELA
              </div>
            </Html>
          )}
        </group>

        {/* Marigold Toran Garland */}
        <mesh position={[0, 4.4, 0.15]}>
          <boxGeometry args={[6.8, 0.15, 0.15]} />
          <meshStandardMaterial color="#FF8C00" roughness={0.9} />
        </mesh>
        <mesh position={[0, 4.1, 0]}>
          <cylinderGeometry args={[0.15, 0.3, 0.4, 8]} />
          <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Ghili-Mili Decorative Festival Lights on Arch (Phase 9) */}
        {[-3, -2, -1, 0, 1, 2, 3].map((x, i) => (
          <mesh key={`arch-light-${i}`} position={[x * 0.9, 4.3, 0.2]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color={["#F59E0B", "#EF4444", "#10B981", "#38BDF8"][i % 4]}
              emissive={["#F59E0B", "#EF4444", "#10B981", "#38BDF8"][i % 4]}
              emissiveIntensity={isNight ? 1.8 : 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* ─── 2. Traditional Linge Ping (Bamboo Swing) ───────────────────────── */}
      <group position={[-26, 0, -10]}>
        <mesh position={[-2.4, 5.8, 2.4]} rotation={[-0.22, 0, 0.22]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 12.5, 8]} />
          <meshStandardMaterial color="#A3B18A" roughness={0.7} />
        </mesh>
        <mesh position={[2.4, 5.8, 2.4]} rotation={[-0.22, 0, -0.22]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 12.5, 8]} />
          <meshStandardMaterial color="#A3B18A" roughness={0.7} />
        </mesh>
        <mesh position={[-2.4, 5.8, -2.4]} rotation={[0.22, 0, 0.22]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 12.5, 8]} />
          <meshStandardMaterial color="#A3B18A" roughness={0.7} />
        </mesh>
        <mesh position={[2.4, 5.8, -2.4]} rotation={[0.22, 0, -0.22]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 12.5, 8]} />
          <meshStandardMaterial color="#A3B18A" roughness={0.7} />
        </mesh>

        {/* Bamboo Crossbeam Header */}
        <mesh position={[0, 11.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 5.8, 8]} />
          <meshStandardMaterial color="#8F9E78" roughness={0.7} />
        </mesh>

        {/* Animated Swing Seat Pivot */}
        <group ref={swingPivotRef} position={[0, 11.2, 0]}>
          <mesh position={[-0.65, -5.2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 10.4, 6]} />
            <meshStandardMaterial color="#C2A649" roughness={0.9} />
          </mesh>
          <mesh position={[0.65, -5.2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 10.4, 6]} />
            <meshStandardMaterial color="#C2A649" roughness={0.9} />
          </mesh>
          <mesh position={[0, -10.4, 0]} castShadow>
            <boxGeometry args={[1.8, 0.12, 0.45]} />
            <meshStandardMaterial color="#6B4226" roughness={0.8} />
          </mesh>
        </group>

        {/* Interaction Prompt */}
        {isNear(-26, -10, 8.0) && (
          <Html position={[0, 2.6, 0]} center distanceFactor={14} zIndexRange={[1, 10]}>
            <button
              onClick={onInteractPing}
              style={{
                background: isSeatedOnSwing ? "#DC2626" : nearbyInteraction === "ping" ? "#D97706" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #FCD34D",
                borderRadius: "14px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              {isSeatedOnSwing
                ? "Dismount Ping [E]"
                : swingOccupantName
                ? `🎋 Linge Ping (Occupied by ${swingOccupantName})`
                : nearbyInteraction === "ping"
                ? "🎋 [E] Ride Traditional Ping!"
                : "🎋 Linge Ping Swing"}
            </button>
          </Html>
        )}
      </group>

      {/* ─── 3. Langur Burja Game Pavilion ─────────────────────────────────── */}
      <group position={[24, 0, -12]}>
        <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.2, 4.5, 0.5, 16]} />
          <meshStandardMaterial color="#6B4226" roughness={0.85} />
        </mesh>
        <mesh position={[0, 4.4, 0]} castShadow>
          <coneGeometry args={[4.8, 2.0, 8]} />
          <meshStandardMaterial color="#991B1B" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.4, 0.8, 12]} />
          <meshStandardMaterial color="#B45309" roughness={0.7} />
        </mesh>

        {/* 3D Round Green Felt Betting Cloth on Table */}
        <mesh position={[0, 1.31, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.5, 24]} />
          <meshStandardMaterial color="#065F46" roughness={0.7} />
        </mesh>

        {/* 3D Wooden Dice Shaker Cup (Phase 7B) */}
        <group ref={diceCupRef} position={[0, 1.45, -0.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.16, 0.35, 12]} />
            <meshStandardMaterial color="#78350F" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.04, 12]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.7} />
          </mesh>
        </group>

        {/* 6 Physical 3D Dice Cubes with Distinct Faces & Symbols (Phase 7B) */}
        <group ref={diceGroupRef} position={[0, 1.32, 0]}>
          {langurDice.slice(0, 6).map((symbol, idx) => {
            const row = Math.floor(idx / 3);
            const col = idx % 3;
            const dx = (col - 1) * 0.44;
            const dz = (row - 0.5) * 0.44;
            const symbolMap: { [k: string]: { icon: string; color: string; label: string } } = {
              jhanda: { icon: "🚩", color: "#DC2626", label: "Jhanda" },
              burja: { icon: "👑", color: "#F59E0B", label: "Burja" },
              ita: { icon: "♦️", color: "#2563EB", label: "Ita" },
              paan: { icon: "♥️", color: "#E11D48", label: "Paan" },
              hukum: { icon: "♠️", color: "#1F2937", label: "Hukum" },
              chidi: { icon: "♣️", color: "#16A34A", label: "Chidi" },
            };
            const sym = symbolMap[symbol] ?? symbolMap.jhanda;

            return (
              <group key={`3d-die-${idx}`} position={[dx, 0.1, dz]}>
                <mesh castShadow>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color={sym.color} roughness={0.3} metalness={0.15} />
                </mesh>
                {isNear(24, -12, 5.0) && (
                  <Html position={[0, 0.26, 0]} center distanceFactor={10} zIndexRange={[1, 5]}>
                    <div
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.92)",
                        borderRadius: "6px",
                        padding: "2px 5px",
                        color: "#FDE047",
                        fontSize: "9px",
                        fontWeight: 900,
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sym.icon} {sym.label}
                    </div>
                  </Html>
                )}
              </group>
            );
          })}
        </group>

        {isNear(24, -12, 8.0) && (
          <Html position={[0, 2.6, 0]} center distanceFactor={14} zIndexRange={[1, 10]}>
            <button
              onClick={onInteractLangur}
              style={{
                background: nearbyInteraction === "langur" ? "#059669" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #34D399",
                borderRadius: "14px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              🎲 {nearbyInteraction === "langur" ? "[E] Play Langur Burja" : "Langur Burja Game"}
            </button>
          </Html>
        )}
      </group>

      {/* ─── 4. Tihar Rangoli & Diya Stations (Sacred Flat Paved Plaza) ──────── */}
      <group position={[0, 0.04, -25]}>
        {/* Sacred Octagonal Courtyard Paving — perfectly flat and above fairground earth */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[9.2, 8]} />
          <meshStandardMaterial color="#881337" roughness={0.75} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
          <circleGeometry args={[7.8, 32]} />
          <meshStandardMaterial color="#E11D48" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[4.8, 7.5, 32]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[2.2, 4.5, 32]} />
          <meshStandardMaterial color="#0284C7" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[1.8, 16]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.6} />
        </mesh>

        {INITIAL_DIYA_STATIONS.map((station, idx) => {
          const isLit = diyaStates.get(station.id)?.isLit ?? false;
          return (
            <group key={station.id} position={[station.x, station.y, station.z + 25]}>
              <mesh position={[0, 0.06, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.16, 0.12, 12]} />
                <meshStandardMaterial color="#B45309" roughness={0.9} />
              </mesh>

              {isLit ? (
                <group position={[0, 0.14, 0]}>
                  <mesh>
                    <coneGeometry args={[0.1, 0.24, 6]} />
                    <meshBasicMaterial color="#FF9F1C" />
                  </mesh>
                </group>
              ) : (
                <mesh position={[0, 0.08, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.08, 4]} />
                  <meshStandardMaterial color="#4A4A4A" />
                </mesh>
              )}

              {isNear(station.x, station.z + 25, 6.0) && (
                <Html position={[0, 0.45, 0]} center distanceFactor={12} zIndexRange={[1, 10]}>
                  <button
                    onClick={() => onInteractDiya?.(station.id)}
                    style={{
                      background: isLit ? "rgba(234, 88, 12, 0.95)" : "rgba(30, 41, 59, 0.85)",
                      color: "#FFF",
                      border: isLit ? "2px solid #FCD34D" : "1px solid #9CA3AF",
                      borderRadius: "12px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    }}
                  >
                    {isLit ? `🔥 Lit! (+10)` : `🕯️ [E] Light #${idx + 1}`}
                  </button>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* ─── 5. Forest Taas Circle (4-Player Dashain Card Gathering) ────────── */}
      <group position={[-28, 0, 20]}>
        {[
          [-4, -4],
          [4, -4],
          [-4, 4],
          [4, 4],
          [0, 6],
        ].map(([px, pz], i) => (
          <group key={`pine-${i}`} position={[px, 0, pz]}>
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.35, 4, 6]} />
              <meshStandardMaterial color="#3E2723" roughness={0.9} />
            </mesh>
            <mesh position={[0, 4.5, 0]} castShadow>
              <coneGeometry args={[1.8, 3.5, 6]} />
              <meshStandardMaterial color="#1B4D3E" roughness={0.8} />
            </mesh>
            <mesh position={[0, 6.5, 0]} castShadow>
              <coneGeometry args={[1.3, 2.8, 6]} />
              <meshStandardMaterial color="#2E5A27" roughness={0.8} />
            </mesh>
          </group>
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
          <circleGeometry args={[3.6, 24]} />
          <meshStandardMaterial color="#B45309" roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[3.2, 3.5, 24]} />
          <meshStandardMaterial color="#78350F" />
        </mesh>

        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.5, 8]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
        </mesh>

        {isNear(-28, 20, 8.5) && (
          <Html position={[0, 2.6, 0]} center distanceFactor={14} zIndexRange={[1, 10]}>
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "2px solid #ca8a04",
                borderRadius: "16px",
                padding: "6px 14px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                userSelect: "none",
              }}
            >
              <div style={{ color: "#FCD34D", fontWeight: 900, fontSize: "13px", whiteSpace: "nowrap" }}>
                🃏 Forest Taas Circle
              </div>
              <div
                style={{
                  backgroundColor: taasPlayerCount > 0 ? "#047857" : "#334155",
                  color: "#FFF",
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                👥 {taasPlayerCount}/4 Players Seated
              </div>
              <button
                onClick={onInteractTaas}
                style={{
                  background: isSeatedAtTaas ? "#DC2626" : nearbyInteraction === "taas" ? "#D97706" : "rgba(30, 41, 59, 0.9)",
                  color: "#FFF",
                  border: "1px solid #FCD34D",
                  borderRadius: "12px",
                  padding: "4px 12px",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: "pointer",
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                {isSeatedAtTaas
                  ? "Stand Up (Leave Table)"
                  : nearbyInteraction === "taas"
                  ? "👉 [E] Sit & Play (Join Table)"
                  : "Join Table"}
              </button>
            </div>
          </Html>
        )}

        {/* 4 Seating Cushions for Real Players */}
        {[-1.8, 1.8].map((x, idx) => (
          <mesh key={`taas-cushion-x-${idx}`} position={[x, 0.05, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
            <meshStandardMaterial color={idx === 0 ? "#991B1B" : "#B45309"} roughness={0.8} />
          </mesh>
        ))}
        {[-1.8, 1.8].map((z, idx) => (
          <mesh key={`taas-cushion-z-${idx}`} position={[0, 0.05, z]}>
            <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
            <meshStandardMaterial color={idx === 0 ? "#15803D" : "#1E3A8A"} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ─── 6. Aama Samuha Cultural Gathering Stage (Phase 9A) ───────────── */}
      <group position={[26, 0, 22]}>
        {/* Stage Warm Overhead Illumination */}
        <pointLight
          position={[0, 4.5, 0]}
          color="#FEF08A"
          intensity={2.8}
          distance={14}
          decay={2}
          castShadow={false}
        />

        {/* 4 Corner Bamboo Stage Floodlight Posts */}
        {[
          [-4.8, -3.8],
          [4.8, -3.8],
          [-4.8, 3.8],
          [4.8, 3.8],
        ].map(([px, pz], li) => (
          <group key={`stage-corner-light-${li}`} position={[px, 0, pz]}>
            <mesh position={[0, 2.0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 4.0, 6]} />
              <meshStandardMaterial color="#854D0E" roughness={0.7} />
            </mesh>
            {/* Lamp Lantern */}
            <mesh position={[0, 3.9, 0]}>
              <cylinderGeometry args={[0.18, 0.12, 0.35, 8]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.8} />
            </mesh>
            {/* Glowing Lamp Core */}
            <mesh position={[0, 3.85, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color="#FEF08A" />
            </mesh>
          </group>
        ))}

        {/* Stage Perimeter Garland Fairy Lights */}
        {[-4, -2, 0, 2, 4].map((gx, gi) => (
          <mesh key={`stage-bead-${gi}`} position={[gx, 0.85, 3.95]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color={gi % 2 === 0 ? "#FBBF24" : "#EF4444"} />
          </mesh>
        ))}

        {/* Raised Wooden Dance Platform */}
        <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
          <boxGeometry args={[10, 0.8, 8]} />
          <meshStandardMaterial color="#5C3A21" roughness={0.8} />
        </mesh>
        {/* Stage Backdrop & Festive Banners */}
        <mesh position={[0, 2.8, -3.8]} castShadow>
          <boxGeometry args={[9.6, 4.2, 0.2]} />
          <meshStandardMaterial color="#991B1B" roughness={0.7} />
        </mesh>
        {/* Overhead Stage Banner */}
        {isNear(26, 22, 16.0) && (
          <Html position={[0, 5.0, -3.6]} center distanceFactor={14} zIndexRange={[1, 6]}>
            <div
              style={{
                backgroundColor: "rgba(153, 27, 27, 0.95)",
                color: "#FDE047",
                border: "2px solid #CA8A04",
                borderRadius: "14px",
                padding: "6px 16px",
                fontWeight: 900,
                fontSize: "13px",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                textAlign: "center",
              }}
            >
              🌸 आमा समूह दशैं-तिहार सांस्कृतिक कार्यक्रम
              <div style={{ fontSize: "10px", color: "#FEF08A" }}>
                (Aama Samuha Community Cultural Program)
              </div>
            </div>
          </Html>
        )}

        {/* Traditional Nepali Instruments on Stage (Madal Drums & Harmonium) */}
        <group position={[0, 0.8, 0]}>
          {/* Madal 1 on Wooden Stand (Left) */}
          <group position={[-2.8, 0.35, -0.5]} rotation={[0, 0.3, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.28, 0.85, 16]} />
              <meshStandardMaterial color="#451A03" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.43, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.43, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.8} />
            </mesh>
          </group>

          {/* Madal 2 on Wooden Stand (Right) */}
          <group position={[2.8, 0.35, -0.5]} rotation={[0, -0.3, -Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.28, 0.85, 16]} />
              <meshStandardMaterial color="#451A03" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.43, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.43, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.8} />
            </mesh>
          </group>

          {/* Center Stage Performance Area for Real Players & Cultural Dancers */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.5, 24]} />
            <meshStandardMaterial color="#991B1B" roughness={0.75} />
          </mesh>
        </group>

        {/* Dedicated Cultural Dancers & Folk Musicians on Stage (Optimized trio) */}
        <group ref={dancersRef} position={[0, 0.8, 0]}>
          {/* 1. Parvati Aama - Graceful Sit-and-Stand Maruni Dance */}
          <group position={[-1.6, 0, 0.2]}>
            <CharacterAvatar
              displayName="Parvati Aama (मारुनी)"
              animState="nach"
              customization={{ color: "#DC2626", vestColor: "#EAB308", hasDhakaTopi: false, skinTone: "#D49B6A", device: "pc" }}
              showNameTag={false}
            />
          </group>
          {/* 2. Laxmi Didi - Cultural Deusi Folk Rhythm Dance */}
          <group position={[0, 0, 0.4]}>
            <CharacterAvatar
              displayName="Laxmi Didi (झ्याउरे)"
              animState="clapping_dance"
              customization={{ color: "#D97706", vestColor: "#DC2626", hasDhakaTopi: false, skinTone: "#D49B6A", device: "pc" }}
              showNameTag={false}
            />
          </group>
          {/* 3. Kancha Dai - Live Madal Percussionist */}
          <group position={[1.8, 0, 0]}>
            <CharacterAvatar
              displayName="Kancha Dai (मादले)"
              animState="playing_madal"
              customization={{ color: "#374151", vestColor: "#991B1B", hasDhakaTopi: true, skinTone: "#C68642", device: "pc" }}
              showNameTag={false}
            />
          </group>
        </group>

        {/* Stage Marigold Garlands & Ghili-Mili Fairy Lights */}
        <mesh position={[0, 4.4, -3.7]}>
          <boxGeometry args={[9.4, 0.15, 0.15]} />
          <meshStandardMaterial color="#FF8C00" roughness={0.9} />
        </mesh>
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x, i) => (
          <mesh key={`stage-light-${i}`} position={[x * 1.0, 4.3, -3.6]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={["#F59E0B", "#EF4444", "#10B981", "#38BDF8"][i % 4]}
              emissive={["#F59E0B", "#EF4444", "#10B981", "#38BDF8"][i % 4]}
              emissiveIntensity={isNight ? 1.8 : 0.2}
            />
          </mesh>
        ))}

        {/* ─── Expanded Grand Gundri Ground Seating Courtyard (गुन्द्री / सुकुल) ── */}
        <group position={[0, 0, 6.2]}>
          {/* Main Wide Straw Mat (14.5m x 6.5m) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[14.5, 6.5]} />
            <meshStandardMaterial color="#B45309" roughness={0.9} />
          </mesh>
          {/* Traditional Crimson Border Fabric */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
            <planeGeometry args={[13.8, 5.8]} />
            <meshStandardMaterial color="#991B1B" roughness={0.85} />
          </mesh>
          {/* Golden Yellow Inner Woven Runners */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
            <planeGeometry args={[13.0, 5.0]} />
            <meshStandardMaterial color="#CA8A04" roughness={0.8} />
          </mesh>

          {/* 8 Traditional Straw & Velvet Seating Mats (गुन्द्री चकटीहरू) for Real Players to sit in different places */}
          {[
            { x: -4.5, z: -0.8, color: "#991B1B" },
            { x: -2.2, z: -0.8, color: "#15803D" },
            { x: 0.0, z: -0.8, color: "#D97706" },
            { x: 2.2, z: -0.8, color: "#1E3A8A" },
            { x: 4.5, z: -0.8, color: "#7C2D12" },
            { x: -3.2, z: 1.4, color: "#065F46" },
            { x: 0.0, z: 1.4, color: "#B45309" },
            { x: 3.2, z: 1.4, color: "#831843" },
          ].map((mat, idx) => (
            <group key={`gundri-seat-${idx}`} position={[mat.x, 0.05, mat.z]}>
              <mesh>
                <cylinderGeometry args={[0.55, 0.55, 0.08, 16]} />
                <meshStandardMaterial color={mat.color} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.045, 0]}>
                <cylinderGeometry args={[0.38, 0.38, 0.02, 16]} />
                <meshStandardMaterial color="#FEF08A" roughness={0.7} />
              </mesh>
            </group>
          ))}

          {/* Festive Tea & Puja Brass Plates on the Ground */}
          <mesh position={[-1.0, 0.06, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.04, 12]} />
            <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[1.0, 0.06, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.04, 12]} />
            <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Interactive Player Ground Seating Button */}
          {isNear(26, 28.2, 8.0) && (
            <Html position={[0, 0.7, 0]} center distanceFactor={14} zIndexRange={[1, 10]}>
              <button
                onClick={onInteractAamaBench}
                style={{
                  background: isSeatedAtAama ? "#DC2626" : nearbyInteraction === "aama_samuha" ? "#D97706" : "rgba(30, 41, 59, 0.85)",
                  color: "#FFF",
                  border: "2px solid #FCD34D",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                }}
              >
                {isSeatedAtAama ? "Stand Up [E]" : "🌸 [E] Sit on Ground & Celebrate with Aama"}
              </button>
            </Html>
          )}
        </group>

        {/* Left Side Courtyard Bench for Real Players */}
        <group position={[-5.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[3.4, 0.12, 0.6]} />
            <meshStandardMaterial color="#6B4226" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ─── 7. Dashain Tika House 1: Bada Dashain Mula Ghar (Phase 9B) ──────── */}
      <group position={[-28, 0, -35]}>
        {/* House Warm Porch Light */}
        <pointLight
          position={[0, 2.8, 4.6]}
          color="#FFA726"
          intensity={1.8}
          distance={8}
          decay={2}
          castShadow={false}
        />
        {/* Brass Porch Hanging Lamp */}
        <mesh position={[0, 2.9, 4.6]}>
          <cylinderGeometry args={[0.14, 0.2, 0.28, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.76, 4.6]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Traditional Tihar Eaves Garland Fairy Lights (Tole Batti) */}
        {[-3.5, -2.1, -0.7, 0.7, 2.1, 3.5].map((ex, ei) => (
          <mesh key={`h1-eaves-light-${ei}`} position={[ex, 3.65, 3.85]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshBasicMaterial color={["#FBBF24", "#EF4444", "#10B981", "#3B82F6"][ei % 4]} />
          </mesh>
        ))}

        {/* Cozy Glowing Windows */}
        <mesh position={[-2.4, 2.2, 3.82]}>
          <planeGeometry args={[1.2, 1.4]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
        <mesh position={[2.4, 2.2, 3.82]}>
          <planeGeometry args={[1.2, 1.4]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* House Stone Foundation */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.5, 3.6, 7.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Whitewashed Upper Plaster */}
        <mesh position={[0, 4.4, 0]} castShadow>
          <boxGeometry args={[8.2, 2.0, 7.2]} />
          <meshStandardMaterial color="#F5F5F4" roughness={0.85} />
        </mesh>
        {/* Traditional Slanted Slate / Tile Roof */}
        <mesh position={[0, 6.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[7.2, 2.6, 4]} />
          <meshStandardMaterial color="#44403C" roughness={0.7} />
        </mesh>

        {/* Front Porch (पिंढी / Baranda) */}
        <mesh position={[0, 0.25, 4.6]} receiveShadow>
          <boxGeometry args={[6.5, 0.5, 2.2]} />
          <meshStandardMaterial color="#78350F" roughness={0.8} />
        </mesh>

        {/* Elder NPC: Aama (Hajuraama) sitting with Puja Thali */}
        <group position={[0, 0.5, 4.2]} rotation={[0, 0, 0]}>
          <CharacterAvatar
            displayName="Hajuraama"
            animState={blessingActiveElder === "house1" ? "giving_tika" : "idle"}
            customization={{ color: "#991B1B", vestColor: "#EAB308", hasDhakaTopi: false, skinTone: "#D49B6A" }}
            speechBubble={blessingActiveElder === "house1" ? "रातो टीका र जमराको आशिर्वाद! 🌸🙏" : "रातो टीका र जमराको आशिर्वाद! 🌸"}
          />
        </group>

        {/* Ceremonial Red Blessing Carpet on Porch Front (Phase 4) */}
        <mesh position={[0, 0.02, 5.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.8, 2.0]} />
          <meshStandardMaterial color="#991B1B" roughness={0.7} />
        </mesh>
        {blessingActiveElder === "house1" && (
          <group position={[0, 0.5, 5.8]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 1.3, 24]} />
              <meshBasicMaterial color="#FCD34D" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Brass Puja Thali on Porch Table */}
        <mesh position={[0.7, 0.6, 4.2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Overhead House Label & Interactive Blessing Button */}
        {isNear(-28, -35, 8.5) && (
          <Html position={[0, 2.6, 4.5]} center distanceFactor={14} zIndexRange={[1, 10]}>
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "2px solid #b91c1c",
                borderRadius: "16px",
                padding: "6px 14px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                userSelect: "none",
              }}
            >
              <div style={{ color: "#FCD34D", fontWeight: 900, fontSize: "13px", whiteSpace: "nowrap" }}>
                🏡 Bada Dashain Mula Ghar (बडादशैं मूल घर)
              </div>
              <button
                onClick={() => onInteractTikaHouse?.("house1")}
                style={{
                  background: nearbyInteraction === "tika1" ? "#B91C1C" : "rgba(30, 41, 59, 0.9)",
                  color: "#FFF",
                  border: "1px solid #FCD34D",
                  borderRadius: "12px",
                  padding: "4px 12px",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                🌸 [E] Receive Tika, Jamara &amp; Dakshina
              </button>
            </div>
          </Html>
        )}
      </group>

      {/* ─── 8. Dashain Tika House 2: Maiti Ghar Courtyard (Phase 9B) ────────── */}
      <group position={[28, 0, -35]}>
        {/* House Warm Porch Light */}
        <pointLight
          position={[0, 2.8, 4.6]}
          color="#FFA726"
          intensity={1.8}
          distance={8}
          decay={2}
          castShadow={false}
        />
        {/* Brass Porch Hanging Lamp */}
        <mesh position={[0, 2.9, 4.6]}>
          <cylinderGeometry args={[0.14, 0.2, 0.28, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.76, 4.6]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* Traditional Tihar Eaves Garland Fairy Lights (Tole Batti) */}
        {[-3.5, -2.1, -0.7, 0.7, 2.1, 3.5].map((ex, ei) => (
          <mesh key={`h2-eaves-light-${ei}`} position={[ex, 3.65, 3.85]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshBasicMaterial color={["#FBBF24", "#EF4444", "#10B981", "#3B82F6"][ei % 4]} />
          </mesh>
        ))}

        {/* Cozy Glowing Windows */}
        <mesh position={[-2.4, 2.2, 3.82]}>
          <planeGeometry args={[1.2, 1.4]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
        <mesh position={[2.4, 2.2, 3.82]}>
          <planeGeometry args={[1.2, 1.4]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>

        {/* House Stone Foundation */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.5, 3.6, 7.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.4, 0]} castShadow>
          <boxGeometry args={[8.2, 2.0, 7.2]} />
          <meshStandardMaterial color="#F5F5F4" roughness={0.85} />
        </mesh>
        <mesh position={[0, 6.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[7.2, 2.6, 4]} />
          <meshStandardMaterial color="#44403C" roughness={0.7} />
        </mesh>

        <mesh position={[0, 0.25, 4.6]} receiveShadow>
          <boxGeometry args={[6.5, 0.5, 2.2]} />
          <meshStandardMaterial color="#78350F" roughness={0.8} />
        </mesh>

        {/* Elder NPC: Bajai welcoming visitors */}
        <group position={[0, 0.5, 4.2]} rotation={[0, 0, 0]}>
          <CharacterAvatar
            displayName="Bajai"
            animState={blessingActiveElder === "house2" ? "giving_tika" : "idle"}
            customization={{ color: "#0D9488", vestColor: "#D97706", hasDhakaTopi: false, skinTone: "#E0AC69" }}
            speechBubble={blessingActiveElder === "house2" ? "शुभ विजया दशमी हजुर! जय दुर्गा भवानी! 🌸🙏" : "शुभ विजया दशमी हजुर! 🌸"}
          />
        </group>

        {/* Ceremonial Red Blessing Carpet on Porch Front (Phase 4) */}
        <mesh position={[0, 0.02, 5.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.8, 2.0]} />
          <meshStandardMaterial color="#991B1B" roughness={0.7} />
        </mesh>
        {blessingActiveElder === "house2" && (
          <group position={[0, 0.5, 5.8]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 1.3, 24]} />
              <meshBasicMaterial color="#FCD34D" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Overhead House Label & Interactive Blessing Button */}
        {isNear(28, -35, 8.5) && (
          <Html position={[0, 2.6, 4.5]} center distanceFactor={14} zIndexRange={[1, 10]}>
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "2px solid #ca8a04",
                borderRadius: "16px",
                padding: "6px 14px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                userSelect: "none",
              }}
            >
              <div style={{ color: "#FCD34D", fontWeight: 900, fontSize: "13px", whiteSpace: "nowrap" }}>
                🏡 Maiti Ghar (माइती घर आँगन)
              </div>
              <button
                onClick={() => onInteractTikaHouse?.("house2")}
                style={{
                  background: nearbyInteraction === "tika2" ? "#CA8A04" : "rgba(30, 41, 59, 0.9)",
                  color: "#FFF",
                  border: "1px solid #FCD34D",
                  borderRadius: "12px",
                  padding: "4px 12px",
                  fontWeight: 800,
                  fontSize: "11px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                🌸 [E] Receive Tika &amp; Blessing
              </button>
            </div>
          </Html>
        )}
      </group>

      {/* ─── 9. Village Market Street (गाउँको बजार गल्ली) & Shops ───────────── */}
      {/* 9A. Street Ground & Pavements */}
      <group position={[0, -0.038, 23]}>
        {/* Village Flagstone & Terracotta Paved Street */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[11.5, 23]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.85} />
        </mesh>
        {/* Center stone promenade runner */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
          <planeGeometry args={[4.2, 22.8]} />
          <meshStandardMaterial color="#A0522D" roughness={0.75} />
        </mesh>
        {/* Overhead Toran String Garlands */}
        <mesh position={[0, 4.2, 6]}>
          <boxGeometry args={[11.4, 0.08, 0.08]} />
          <meshStandardMaterial color="#EA580C" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.2, -6]}>
          <boxGeometry args={[11.4, 0.08, 0.08]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.8} />
        </mesh>

        {/* Village Market Street Entrance Overhead Sign */}
        {isNear(0, 34, 14.0) && (
          <Html position={[0, 4.6, 11]} center distanceFactor={14} zIndexRange={[1, 6]}>
            <div
              style={{
                backgroundColor: "rgba(120, 53, 15, 0.95)",
                color: "#FEF08A",
                border: "2px solid #CA8A04",
                borderRadius: "14px",
                padding: "4px 14px",
                fontWeight: 900,
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                textAlign: "center",
                whiteSpace: "nowrap",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              🏮 गाउँको बजार गल्ली (Village Bazaar Street)
            </div>
          </Html>
        )}
      </group>

      {/* 9B. Chiya Pasal (Tea Stall - West Side of Bazaar Street) */}
      <group position={[-6.5, 0, 28]} rotation={[0, Math.PI / 2, 0]}>
        {/* Warm Shop Lantern Light */}
        <pointLight
          position={[0, 2.5, 1.2]}
          color="#FFA726"
          intensity={1.5}
          distance={7}
          decay={2}
          castShadow={false}
        />
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[4.2, 2.8, 2.5]} />
          <meshStandardMaterial color="#4A3525" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.0, 0.4]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4.8, 0.2, 3.2]} />
          <meshStandardMaterial color="#EA580C" />
        </mesh>
        <mesh position={[0.8, 1.6, 0.8]}>
          <cylinderGeometry args={[0.22, 0.25, 0.4, 8]} />
          <meshStandardMaterial color="#B87333" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Hanging Festive Batti Lanterns */}
        {[-1.4, 1.4].map((lx, li) => (
          <group key={`chiya-batti-${li}`} position={[lx, 2.7, 1.2]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 4]} />
              <meshBasicMaterial color="#1E293B" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.15, 0.08, 6]} />
              <meshStandardMaterial color="#B87333" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#FFB020" />
            </mesh>
          </group>
        ))}

        <group position={[0, 0.05, -0.6]}>
          <CharacterAvatar
            displayName="Chiya Dai"
            animState="idle"
            customization={{ color: "#9A3412", vestColor: "#EA580C", hasDhakaTopi: true }}
            speechBubble="तातो चिया पिउनुहोस्! ☕"
          />
        </group>

        {isNear(-6.5, 28, 7.0) && (
          <Html position={[0, 2.3, 1.4]} center distanceFactor={12} zIndexRange={[1, 10]}>
            <button
              onClick={() => onInteractStall?.("chiya")}
              style={{
                background: nearbyInteraction === "chiya" ? "#EA580C" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #FDBA74",
                borderRadius: "14px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ☕ [E] Chiya Pasal (रू १५)
            </button>
          </Html>
        )}
      </group>

      {/* 9C. Sel Roti Stall (East Side of Bazaar Street) */}
      <group position={[6.5, 0, 28]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Warm Shop Lantern Light */}
        <pointLight
          position={[0, 2.5, 1.2]}
          color="#F59E0B"
          intensity={1.5}
          distance={7}
          decay={2}
          castShadow={false}
        />
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[4.2, 2.8, 2.5]} />
          <meshStandardMaterial color="#4A3525" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.0, 0.4]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4.8, 0.2, 3.2]} />
          <meshStandardMaterial color="#0D9488" />
        </mesh>
        <mesh position={[0, 1.5, 0.9]}>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 12]} />
          <meshStandardMaterial color="#EAB308" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Hanging Festive Batti Lanterns */}
        {[-1.4, 1.4].map((lx, li) => (
          <group key={`roti-batti-${li}`} position={[lx, 2.7, 1.2]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 4]} />
              <meshBasicMaterial color="#1E293B" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.15, 0.08, 6]} />
              <meshStandardMaterial color="#D97706" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#FFB020" />
            </mesh>
          </group>
        ))}

        <group position={[0, 0.05, -0.6]}>
          <CharacterAvatar
            displayName="Roti Didi"
            animState="idle"
            customization={{ color: "#DC2626", vestColor: "#F59E0B", hasDhakaTopi: false }}
            speechBubble="ताजा सेल रोटी! 🍩"
          />
        </group>

        {isNear(6.5, 28, 7.0) && (
          <Html position={[0, 2.3, 1.4]} center distanceFactor={12} zIndexRange={[1, 10]}>
            <button
              onClick={() => onInteractStall?.("sel_roti")}
              style={{
                background: nearbyInteraction === "sel_roti" ? "#0D9488" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #5EEAD4",
                borderRadius: "14px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🍩 [E] Sel Roti (रू २५)
            </button>
          </Html>
        )}
      </group>

      {/* 9D. Changa / Kite Stall (West Side of Bazaar Street) */}
      <group position={[-6.5, 0, 18]} rotation={[0, Math.PI / 2, 0]}>
        {/* Vibrant Kite Shop Lantern Light */}
        <pointLight
          position={[0, 2.5, 1.2]}
          color="#38BDF8"
          intensity={1.5}
          distance={7}
          decay={2}
          castShadow={false}
        />
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[4.2, 2.8, 2.5]} />
          <meshStandardMaterial color="#4A3525" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.0, 0.4]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4.8, 0.2, 3.2]} />
          <meshStandardMaterial color="#DC2626" />
        </mesh>
        <mesh position={[-0.8, 2.2, 1.3]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
        </mesh>

        {/* Hanging Festive Batti Lanterns */}
        {[-1.4, 1.4].map((lx, li) => (
          <group key={`changa-batti-${li}`} position={[lx, 2.7, 1.2]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 4]} />
              <meshBasicMaterial color="#1E293B" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.15, 0.08, 6]} />
              <meshStandardMaterial color="#0284C7" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#FFB020" />
            </mesh>
          </group>
        ))}

        <group position={[0, 0.05, -0.6]}>
          <CharacterAvatar
            displayName="Changa Bhai"
            animState="idle"
            customization={{ color: "#0284C7", vestColor: "#E11D48", hasDhakaTopi: true }}
            speechBubble="लट्टाई र चङ्गा! 🪁"
          />
        </group>

        {isNear(-6.5, 18, 7.0) && (
          <Html position={[0, 2.3, 1.4]} center distanceFactor={12} zIndexRange={[1, 10]}>
            <button
              onClick={() => onInteractStall?.("changa")}
              style={{
                background: nearbyInteraction === "changa" ? "#DC2626" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #F87171",
                borderRadius: "14px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🪁 [E] Changa &amp; Lattai (रू ५०)
            </button>
          </Html>
        )}
      </group>

      {/* 9E. Dhaka Topi Stall (East Side of Bazaar Street) */}
      <group position={[6.5, 0, 18]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Warm Textile Shop Lantern Light */}
        <pointLight
          position={[0, 2.5, 1.2]}
          color="#F43F5E"
          intensity={1.5}
          distance={7}
          decay={2}
          castShadow={false}
        />
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[4.2, 2.8, 2.5]} />
          <meshStandardMaterial color="#4A3525" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.0, 0.4]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4.8, 0.2, 3.2]} />
          <meshStandardMaterial color="#B45309" />
        </mesh>

        {/* Hanging Festive Batti Lanterns */}
        {[-1.4, 1.4].map((lx, li) => (
          <group key={`dhaka-batti-${li}`} position={[lx, 2.7, 1.2]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 4]} />
              <meshBasicMaterial color="#1E293B" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.15, 0.08, 6]} />
              <meshStandardMaterial color="#B45309" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#FFB020" />
            </mesh>
          </group>
        ))}

        <group position={[0, 0.05, -0.6]}>
          <CharacterAvatar
            displayName="Dhaka Master"
            animState="idle"
            customization={{ color: "#7C2D12", dhakaTopiColor: "#8B0000", vestColor: "#451A03", hasDhakaTopi: true }}
            speechBubble="पाल्पाली ढाका टोपी! 🎩"
          />
        </group>

        {isNear(6.5, 18, 7.0) && (
          <Html position={[0, 2.3, 1.4]} center distanceFactor={12} zIndexRange={[1, 10]}>
            <button
              onClick={() => onInteractStall?.("dhaka")}
              style={{
                background: nearbyInteraction === "dhaka" ? "#B45309" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #FCD34D",
                borderRadius: "14px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🎩 [E] Dhaka Topi (रू १००)
            </button>
          </Html>
        )}
      </group>

      {/* ─── 10. Central Chautari (Resting Platform & Banyan Tree) ───────────── */}
      <group position={[0, 0, 5]}>
        {/* Lower Stone Bench Tier - Standard 48cm sitting height */}
        <mesh position={[0, 0.24, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.2, 4.4, 0.48, 24]} />
          <meshStandardMaterial color="#78716C" roughness={0.9} />
        </mesh>
        {/* Upper Stone Terrace Tier */}
        <mesh position={[0, 0.71, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.8, 3.0, 0.46, 24]} />
          <meshStandardMaterial color="#A8A29E" roughness={0.9} />
        </mesh>
        {/* Central Banyan Tree Trunk */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.95, 5.0, 10]} />
          <meshStandardMaterial color="#44281D" roughness={0.9} />
        </mesh>
        {/* Lush Banyan Canopy */}
        <mesh position={[0, 7.2, 0]} castShadow>
          <dodecahedronGeometry args={[4.2, 1]} />
          <meshStandardMaterial color="#2D5A27" roughness={0.8} />
        </mesh>

        {/* Chautari Interactive Seating Prompt with Friends */}
        {isNear(0, 5, 5.5) && (
          <Html position={[0, 1.8, 0]} center distanceFactor={14} zIndexRange={[1, 10]}>
            <button
              onClick={onInteractChautari}
              style={{
                background: isSeatedAtChautari ? "#DC2626" : nearbyInteraction === "chautari" ? "#D97706" : "rgba(30, 41, 59, 0.85)",
                color: "#FFF",
                border: "2px solid #FCD34D",
                borderRadius: "14px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              {isSeatedAtChautari
                ? "Stand Up [E]"
                : nearbyInteraction === "chautari"
                ? "🪑 [E] Sit at Chautari with Friends"
                : "🪑 Central Chautari"}
            </button>
          </Html>
        )}
      </group>

      {/* ─── 10B. Mela Byawasthapan Sanstha (Festival Committee Office & Info Desk) ─ */}
      <group position={[-9.5, 0, 8]} rotation={[0, 0.35, 0]}>
        {/* Wooden Committee Pavilion Booth */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 2.8, 2.6]} />
          <meshStandardMaterial color="#3B2314" roughness={0.85} />
        </mesh>
        {/* Festive Red & Gold Awning */}
        <mesh position={[0, 2.9, 0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[4.6, 0.18, 3.2]} />
          <meshStandardMaterial color="#0891B2" roughness={0.6} />
        </mesh>

        {/* Info Desk Table */}
        <mesh position={[0, 0.6, 1.1]} receiveShadow>
          <boxGeometry args={[3.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
        </mesh>
        {/* Ledger Registry & Microphone */}
        <mesh position={[-0.6, 1.05, 1.1]}>
          <boxGeometry args={[0.5, 0.08, 0.4]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        <mesh position={[0.6, 1.15, 1.1]}>
          <cylinderGeometry args={[0.03, 0.04, 0.25, 6]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>

        {/* Committee Officer NPC: "Mela Sachiv" */}
        <group position={[0, 0.05, 0.3]}>
          <CharacterAvatar
            displayName="मेला सचिव (Secretary)"
            animState="idle"
            customization={{ color: "#0E7490", vestColor: "#CA8A04", hasDhakaTopi: true }}
            speechBubble="नयाँ अपडेट र सुझावका लागि स्वागत छ! 🏛️"
          />
        </group>

        {/* Warm Booth Light */}
        <pointLight
          position={[0, 2.4, 1.2]}
          color="#67E8F9"
          intensity={1.6}
          distance={8}
          decay={2}
          castShadow={false}
        />

        {/* Notice Board */}
        <mesh position={[-1.7, 1.8, 1.3]}>
          <boxGeometry args={[0.7, 0.9, 0.05]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>

        {/* Interactive Committee Prompt */}
        {isNear(-9.5, 8, 7.0) && (
          <Html position={[0, 2.4, 1.4]} center distanceFactor={12} zIndexRange={[1, 10]}>
            <button
              onClick={onInteractSanstha}
              style={{
                background: nearbyInteraction === "sanstha" ? "#0891B2" : "rgba(15, 23, 42, 0.88)",
                color: "#FFF",
                border: "2px solid #67E8F9",
                borderRadius: "14px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              }}
            >
              🏛️ [E] Mela Samiti Office / Inquire Updates (सचिवालय)
            </button>
          </Html>
        )}
      </group>

      {/* ─── 11. Fluttering Prayer Flags ─────────────────────────────────────── */}
      <group ref={prayerFlagsRef}>
        {[-15, -7, 0, 7, 15].map((xOffset, idx) => {
          const colors = ["#2563EB", "#FFFFFF", "#DC2626", "#16A34A", "#FBBF24"];
          return (
            <mesh key={`flag-${idx}`} position={[xOffset * 1.5, 6.5, 12]}>
              <planeGeometry args={[1.2, 0.8]} />
              <meshStandardMaterial color={colors[idx % colors.length]} side={THREE.DoubleSide} roughness={0.7} />
            </mesh>
          );
        })}
      </group>

      {/* ─── 12. Shree Durga Mata Mandir (Phase 8 Elevated North Hill) ─────── */}
      <DurgaMandir
        position={[0, 2.8, -75]}
        onPray={onPrayMandir}
        onOpenDanPeti={onOpenDanPeti}
        nearbyInteraction={nearbyInteraction}
        playerPosition={playerPosition}
      />

      {/* ─── 13. Stationary Festive Deepawali Diyas (माटोको पाला) ─────────── */}
      <group>
        {FESTIVE_DIYAS.map(([x, y, z], idx) => {
          return (
            <group key={`festive-diya-${idx}`} position={[x, y, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.13, 0.08, 0.07, 8]} />
                <meshStandardMaterial color="#9A3412" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.038, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.01, 8]} />
                <meshStandardMaterial color="#451A03" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.11, 0]}>
                <coneGeometry args={[0.05, 0.15, 6]} />
                <meshBasicMaterial color="#FF9F1C" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ─── 14. Ghilimili (झिलीमिली) Festive Fairy Lights (Phase 9) ───────── */}
      <GhilimiliLights isNight={isNight} />

      {/* ─── 15. Decorative Street Lampposts (बत्तीको खम्बा) with Distance LOD ── */}
      <group>
        {LAMPPOST_POSITIONS.map(([lx, ly, lz], idx) => {
          return (
            <group key={`lamppost-${idx}`} position={[lx, ly, lz]}>
              {/* Stone base plinth */}
              <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.28, 0.5, 8]} />
                <meshStandardMaterial color="#374151" roughness={0.9} />
              </mesh>
              {/* Cast iron vertical pole */}
              <mesh position={[0, 1.9, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.1, 3.2, 8]} />
                <meshStandardMaterial color="#1F2937" roughness={0.6} metalness={0.7} />
              </mesh>
              {/* Ornate decorative bracket arm */}
              <mesh position={[0, 3.4, 0]}>
                <cylinderGeometry args={[0.04, 0.05, 0.8, 6]} />
                <meshStandardMaterial color="#1F2937" roughness={0.6} metalness={0.7} />
              </mesh>
              {/* Lantern housing */}
              <mesh position={[0, 3.2, 0]}>
                <cylinderGeometry args={[0.2, 0.14, 0.35, 6]} />
                <meshStandardMaterial color="#78350F" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Glowing warm amber lantern interior */}
              <mesh position={[0, 3.12, 0]}>
                <cylinderGeometry args={[0.13, 0.1, 0.24, 6]} />
                <meshStandardMaterial
                  color="#F59E0B"
                  emissive="#F59E0B"
                  emissiveIntensity={isNight ? 2.5 : 0.4}
                  roughness={0.2}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ─── 16. Traditional Bamboo & Timber Pathway Fences (बाँसको बार) ───── */}
      {/* ─── 17. 3 Cultural Dance Circles across the Map (नाच मण्डलहरू) ───────── */}
      {[
        { id: "spot1_aama", name: "Aama Samuha Chautari Stage", x: 42, y: 0.02, z: 34 },
        { id: "spot2_bhailo", name: "Deusi Bhailo Village Plaza", x: -38, y: 0.02, z: 36 },
        { id: "spot3_mandir", name: "Scenic Hillside Maruni Ring", x: -26, y: 0.02, z: -46 },
      ].map((spot) => {
        const isPlayerNear = isNear(spot.x, spot.z, 5.0);
        return (
          <group key={spot.id} position={[spot.x, spot.y, spot.z]}>
            {/* Sacred Lotus / Mandala Dance Ring Ground Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[3.8, 32]} />
              <meshStandardMaterial color="#991B1B" roughness={0.7} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[2.2, 3.7, 32]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.6} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
              <ringGeometry args={[0.8, 2.1, 32]} />
              <meshStandardMaterial color="#DC2626" roughness={0.6} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry args={[0.7, 16]} />
              <meshStandardMaterial color="#FEF08A" roughness={0.5} />
            </mesh>

            {/* Single Gentle Center Lantern Glow per Dance Spot for Ultra-High Performance (replaces 24 redundant dynamic lights) */}
            <pointLight color="#FF9F1C" intensity={0.6} distance={6} decay={2} position={[0, 0.4, 0]} />

            {/* Perimeter Festive Oil Lamps around the Dance Ring (Emissive Flames) */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i / 8) * Math.PI * 2;
              const dx = Math.cos(angle) * 3.6;
              const dz = Math.sin(angle) * 3.6;
              return (
                <group key={`dance-lamp-${spot.id}-${i}`} position={[dx, 0.08, dz]}>
                  <mesh>
                    <cylinderGeometry args={[0.12, 0.08, 0.08, 8]} />
                    <meshStandardMaterial color="#B45309" roughness={0.8} />
                  </mesh>
                  <mesh position={[0, 0.08, 0]}>
                    <coneGeometry args={[0.04, 0.12, 6]} />
                    <meshBasicMaterial color="#FF9F1C" />
                  </mesh>
                </group>
              );
            })}

            {/* Interactive Join the Dance Prompt */}
            {isPlayerNear && (
              <Html position={[0, 1.4, 0]} center distanceFactor={12} zIndexRange={[1, 10]}>
                <button
                  onClick={onJoinDance}
                  style={{
                    background: isDancing
                      ? "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)"
                      : "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                    color: "#FFF",
                    border: "2px solid #FCD34D",
                    borderRadius: "16px",
                    padding: "8px 18px",
                    fontSize: "12px",
                    fontWeight: 900,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                  }}
                >
                  {isDancing ? "🛑 [E] Stop Dancing" : "💃 [E] Join the Dance (नाचमा सहभागी हुनुहोस्)"}
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* ─── 18. Optimized Nepali Trees (सल्ला, लालीगुराँस र पीपल) ─────────── */}
      <OptimizedFestivalTrees />
    </group>
  );
};

/** Optimized Low-Poly Himalayan & Festival Trees with Shared Geometries & Materials */
const OptimizedFestivalTrees: React.FC = () => {
  const pinePositions: [number, number, number][] = [
    [-36, 0, 22],
    [-35, 0, 14],
    [-24, 0, 28],
    [-20, 0, 25],
    [-32, 0, 26],
    [-30, 0, 12],
  ];

  const rhododendronPositions: [number, number, number][] = [
    [-14, 0, -42],
    [14, 0, -42],
    [-15, 0, -34],
    [15, 0, -34],
  ];

  const peepalPositions: [number, number, number][] = [
    [-12, 0, 36],
    [12, 0, 36],
    [-12, 0, 12],
    [12, 0, 12],
  ];

  return (
    <group>
      {/* 1. Sallako Rukh (Himalayan Pines in Forest Grove) */}
      {pinePositions.map(([px, py, pz], idx) => (
        <group key={`pine-${idx}`} position={[px, py, pz]}>
          {/* Trunk */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.3, 2.8, 6]} />
            <meshStandardMaterial color="#451A03" roughness={0.9} />
          </mesh>
          {/* Multi-tiered Pine Foliage */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[1.8, 2.2, 6]} />
            <meshStandardMaterial color="#14532D" roughness={0.8} />
          </mesh>
          <mesh position={[0, 4.6, 0]} castShadow>
            <coneGeometry args={[1.4, 2.0, 6]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
          <mesh position={[0, 5.8, 0]} castShadow>
            <coneGeometry args={[0.9, 1.6, 6]} />
            <meshStandardMaterial color="#15803D" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 2. Laligurans (Nepali National Flower Rhododendron Trees near Temple) */}
      {rhododendronPositions.map(([rx, ry, rz], idx) => (
        <group key={`rhodo-${idx}`} position={[rx, ry, rz]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.35, 3.0, 6]} />
            <meshStandardMaterial color="#3E1F0D" roughness={0.85} />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <dodecahedronGeometry args={[2.0, 1]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
          {/* Vibrant Red Blossom Clusters */}
          {[-0.8, 0, 0.8].map((bx, bi) => (
            <mesh key={`blossom-${bi}`} position={[bx, 4.1 + (bi % 2) * 0.4, 0.8]}>
              <sphereGeometry args={[0.4, 6, 6]} />
              <meshStandardMaterial color="#E11D48" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 3. Peepal / Barako Rukh along Entrance Avenue */}
      {peepalPositions.map(([px, py, pz], idx) => (
        <group key={`peepal-${idx}`} position={[px, py, pz]}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.42, 3.2, 8]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.9} />
          </mesh>
          <mesh position={[0, 4.2, 0]} castShadow>
            <sphereGeometry args={[2.5, 8, 8]} />
            <meshStandardMaterial color="#15803D" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
