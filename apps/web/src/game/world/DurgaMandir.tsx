import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface DurgaMandirProps {
  position?: [number, number, number];
  onPray?: () => void;
  onOpenDanPeti?: () => void;
  nearbyInteraction?: string | null;
  playerPosition?: { x: number; y: number; z: number };
}

export const DurgaMandir: React.FC<DurgaMandirProps> = ({
  position = [0, 0, -46],
  onPray,
  onOpenDanPeti,
  nearbyInteraction,
  playerPosition,
}) => {
  const bellRef = useRef<THREE.Group>(null);
  const flame1Ref = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);
  const prabhaRef = useRef<THREE.Group>(null);

  const isNearMandir = playerPosition
    ? Math.hypot(playerPosition.x - position[0], playerPosition.z - (position[2] + 5.2)) <= 9.0
    : true;

  const isNearDanPeti = playerPosition
    ? Math.hypot(playerPosition.x - (position[0] + 2.2), playerPosition.z - (position[2] + 5.5)) <= 3.2
    : false;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flame1Ref.current) {
      flame1Ref.current.scale.y = 1 + Math.sin(t * 12) * 0.15;
    }
    if (flame2Ref.current) {
      flame2Ref.current.scale.y = 1 + Math.cos(t * 14) * 0.15;
    }
    if (bellRef.current) {
      bellRef.current.rotation.z = Math.sin(t * 2) * 0.04;
    }
    if (prabhaRef.current) {
      prabhaRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* ─── 1. Raised Stone & Terracotta Platform (Plinth) ───────────────── */}
      {/* Bottom plinth */}
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[14, 0.5, 14]} />
        <meshStandardMaterial color="#8B4513" roughness={0.85} />
      </mesh>
      {/* Second plinth tier */}
      <mesh position={[0, 0.65, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 0.4, 12]} />
        <meshStandardMaterial color="#A0522D" roughness={0.8} />
      </mesh>
      {/* Sanctum base plinth */}
      <mesh position={[0, 1.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.35, 10]} />
        <meshStandardMaterial color="#B25938" roughness={0.75} />
      </mesh>

      {/* Front Stone Steps */}
      <mesh position={[0, 0.18, 7.5]} receiveShadow>
        <boxGeometry args={[4.5, 0.35, 1.5]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.45, 6.5]} receiveShadow>
        <boxGeometry args={[4.0, 0.35, 1.5]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, 5.5]} receiveShadow>
        <boxGeometry args={[3.5, 0.35, 1.5]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </mesh>

      {/* ─── 2. Inner Sanctum Walls (Garbhagriha) ─────────────────────────── */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.0, 6.8]} />
        <meshStandardMaterial color="#7C2D12" roughness={0.8} />
      </mesh>

      {/* Carved Wooden Doorway Arch */}
      <mesh position={[0, 2.5, 3.42]}>
        <boxGeometry args={[2.4, 3.2, 0.1]} />
        <meshStandardMaterial color="#3E1F0D" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.2, 3.44]}>
        <boxGeometry args={[1.8, 2.6, 0.08]} />
        <meshBasicMaterial color="#1A0D06" />
      </mesh>

      {/* ─── 3. Carved Wooden Pillars (Veranda / Pradakshina Path) ───────── */}
      {[
        [-4.2, -4.2],
        [4.2, -4.2],
        [-4.2, 4.2],
        [4.2, 4.2],
        [-4.2, 0],
        [4.2, 0],
        [0, -4.2],
      ].map(([px, pz], i) => (
        <group key={`mandir-pillar-${i}`} position={[px, 1.2, pz]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.28, 0.3, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 1.7, 8]} />
            <meshStandardMaterial color="#451A03" roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[0.45, 0.2, 0.45]} />
            <meshStandardMaterial color="#78350F" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ─── 4. Multi-Tiered Pagoda Roofs with Golden Gajur ────────────────── */}
      {/* Lower roof tier */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[6.8, 2.0, 4]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.6} />
      </mesh>
      {/* Middle roof tier */}
      <mesh position={[0, 5.8, 0]} castShadow>
        <coneGeometry args={[5.2, 1.8, 4]} />
        <meshStandardMaterial color="#991B1B" roughness={0.6} />
      </mesh>
      {/* Top golden roof tier */}
      <mesh position={[0, 7.0, 0]} castShadow>
        <coneGeometry args={[3.6, 1.5, 4]} />
        <meshStandardMaterial color="#D97706" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Golden Pinnacle (Gajur) */}
      <group position={[0, 7.9, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 0.4, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial color="#FDE047" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Red & Gold Trishul Accent */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
          <meshStandardMaterial color="#DC2626" />
        </mesh>
      </group>

      {/* ─── 5. Hanging Brass Temple Bells (Ghanta) ────────────────────────── */}
      <group ref={bellRef} position={[0, 4.5, 4.2]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
          <meshStandardMaterial color="#78350F" />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.35, 0.45, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#D97706" metalness={0.9} />
        </mesh>
      </group>

      {/* ─── 6. Inner Durga Mata Pratima & Ceremonial Altar ─────────────────── */}
      <group position={[0, 1.2, 1.8]}>
        {/* Sacred Divine Illumination on Durga */}
        <pointLight
          position={[0, 2.2, 1.2]}
          color="#FEF08A"
          intensity={2.2}
          distance={8}
          decay={2}
          castShadow={false}
        />

        {/* Stone / Marble Altar Table */}
        <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.8, 1.8]} />
          <meshStandardMaterial color="#F5F5F4" roughness={0.5} />
        </mesh>

        {/* Detailed Goddess Durga Mata (Mahishasuramardini) 10-Armed Icon */}
        <group position={[0, 1.2, -0.2]}>
          {/* Luminous Golden Prabhamandala (Aura Halo) with Rays */}
          <group ref={prabhaRef} position={[0, 0.65, -0.15]}>
            <mesh>
              <circleGeometry args={[0.95, 32]} />
              <meshBasicMaterial color="#FEF08A" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <circleGeometry args={[1.08, 32]} />
              <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Mahishasura Demon & Buffalo Base at Lotus Pedestal */}
          <mesh position={[0, -0.18, 0.2]}>
            <cylinderGeometry args={[0.9, 1.0, 0.25, 12]} />
            <meshStandardMaterial color="#991B1B" roughness={0.7} />
          </mesh>
          <mesh position={[0.2, -0.1, 0.35]}>
            <boxGeometry args={[0.35, 0.2, 0.45]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>

          {/* Roaring Lion Mount (Simha Vahana) */}
          <group position={[-0.55, -0.05, 0.15]} rotation={[0, 0.35, 0]}>
            {/* Body */}
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.4, 0.9]} />
              <meshStandardMaterial color="#D97706" roughness={0.75} />
            </mesh>
            {/* Golden Mane & Head */}
            <mesh position={[0, 0.28, 0.4]}>
              <sphereGeometry args={[0.26, 10, 10]} />
              <meshStandardMaterial color="#B45309" roughness={0.7} />
            </mesh>
            {/* Snout */}
            <mesh position={[0, 0.22, 0.6]}>
              <boxGeometry args={[0.18, 0.16, 0.2]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.8} />
            </mesh>
            {/* Front paws */}
            <mesh position={[-0.18, -0.25, 0.35]}>
              <cylinderGeometry args={[0.07, 0.08, 0.3, 6]} />
              <meshStandardMaterial color="#D97706" />
            </mesh>
            <mesh position={[0.18, -0.25, 0.35]}>
              <cylinderGeometry args={[0.07, 0.08, 0.3, 6]} />
              <meshStandardMaterial color="#D97706" />
            </mesh>
          </group>

          {/* Deity Body in Traditional Nepali Crimson Red Sari with Golden Zari */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.38, 0.85, 10]} />
            <meshStandardMaterial color="#DC2626" roughness={0.55} emissive="#7F1D1D" emissiveIntensity={0.2} />
          </mesh>
          {/* Gold Tilhari / Naugedi Garland */}
          <mesh position={[0, 0.5, 0.15]}>
            <torusGeometry args={[0.16, 0.025, 6, 16]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Divine Head with Golden Skin Tone */}
          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.19, 14, 14]} />
            <meshStandardMaterial color="#FDE047" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Red Tika & Bindi on Forehead */}
          <mesh position={[0, 0.82, 0.18]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          {/* Traditional Patan Golden Mukut (Crown) */}
          <group position={[0, 1.05, 0]}>
            <mesh>
              <coneGeometry args={[0.18, 0.38, 10]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#EF4444" />
            </mesh>
          </group>

          {/* 10 Divine Arms & Ayudha (Weapons) */}
          {/* 1. Main Right Arm: Sacred Golden Trishul piercing downwards */}
          <group position={[0.3, 0.45, 0.15]} rotation={[-0.4, 0, -0.3]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <group position={[0, 0.4, 0]} rotation={[0, 0, 0.35]}>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 1.5, 6]} />
                <meshStandardMaterial color="#FBBF24" metalness={0.9} />
              </mesh>
              {/* Trident prongs */}
              <mesh position={[0, 0.6, 0]}>
                <coneGeometry args={[0.07, 0.24, 4]} />
                <meshStandardMaterial color="#FDE047" metalness={0.9} />
              </mesh>
              <mesh position={[-0.09, 0.52, 0]}>
                <coneGeometry args={[0.045, 0.18, 4]} />
                <meshStandardMaterial color="#FDE047" metalness={0.9} />
              </mesh>
              <mesh position={[0.09, 0.52, 0]}>
                <coneGeometry args={[0.045, 0.18, 4]} />
                <meshStandardMaterial color="#FDE047" metalness={0.9} />
              </mesh>
            </group>
          </group>

          {/* 2. Main Left Arm: Blessing / Holding Mahishasura hair */}
          <group position={[-0.3, 0.45, 0.15]} rotation={[-0.3, 0, 0.4]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
          </group>

          {/* 3. Upper Right 1: Sudarshana Chakra (Discus) */}
          <group position={[0.42, 0.62, 0.05]} rotation={[0, 0, -0.6]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>

          {/* 4. Upper Right 2: Khadga / Sacred Nepali Sword */}
          <group position={[0.48, 0.78, -0.05]} rotation={[0, 0, -0.9]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.05, 0.35, 0.015]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* 5. Upper Right 3: Golden Gada (Mace) */}
          <group position={[0.38, 0.92, -0.08]} rotation={[0, 0, -1.2]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.38, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.9} />
            </mesh>
          </group>

          {/* 6. Upper Left 1: Sacred Shankha (Conch) */}
          <group position={[-0.42, 0.62, 0.05]} rotation={[0, 0, 0.6]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
          </group>

          {/* 7. Upper Left 2: Dhanush (Golden Bow) */}
          <group position={[-0.48, 0.78, -0.05]} rotation={[0, 0, 0.9]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <torusGeometry args={[0.18, 0.02, 6, 12, Math.PI]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.8} />
            </mesh>
          </group>

          {/* 8. Upper Left 3: Sacred Padma (Pink Lotus) */}
          <group position={[-0.38, 0.92, -0.08]} rotation={[0, 0, 1.2]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.38, 6]} />
              <meshStandardMaterial color="#FDE047" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#F472B6" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Ceremonial Brass Oil Lamps (Akhanda Diya) */}
        <group position={[-1.2, 0.85, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.18, 0.25, 8]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.7} />
          </mesh>
          <mesh ref={flame1Ref} position={[0, 0.22, 0]}>
            <coneGeometry args={[0.07, 0.22, 6]} />
            <meshBasicMaterial color="#FF9F1C" />
          </mesh>
        </group>

        <group position={[1.2, 0.85, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.18, 0.25, 8]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.7} />
          </mesh>
          <mesh ref={flame2Ref} position={[0, 0.22, 0]}>
            <coneGeometry args={[0.07, 0.22, 6]} />
            <meshBasicMaterial color="#FF9F1C" />
          </mesh>
        </group>

        {/* Incense Pot with Fragrant Dhoop */}
        <mesh position={[0, 0.85, 0.5]}>
          <cylinderGeometry args={[0.12, 0.08, 0.14, 8]} />
          <meshStandardMaterial color="#78350F" metalness={0.5} />
        </mesh>
      </group>

      {/* ─── 7. Traditional 3D Dan Peti (दान पेटिका - Donation Box) ─────────── */}
      <group position={[2.2, 0.45, 5.5]}>
        {/* Carved Wood & Brass Bound Donation Box */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.6, 0.55]} />
          <meshStandardMaterial color="#451A03" roughness={0.7} />
        </mesh>
        {/* Brass corner brackets */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.74, 0.08, 0.59]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Coin Slot on top */}
        <mesh position={[0, 0.61, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.04]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Brass Padlock */}
        <mesh position={[0, 0.4, 0.29]}>
          <boxGeometry args={[0.12, 0.14, 0.05]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} />
        </mesh>
        {/* Red Vermilion Tika & Rice on box */}
        <mesh position={[0, 0.55, 0.15]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
          <meshBasicMaterial color="#DC2626" />
        </mesh>

        {/* Interactive Prompt on Dan Peti */}
        {isNearDanPeti && (
          <Html position={[0, 1.2, 0]} center distanceFactor={12} zIndexRange={[1, 10]}>
            <button
              onClick={onOpenDanPeti}
              style={{
                background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)",
                color: "#FFF",
                border: "2px solid #FDE047",
                borderRadius: "14px",
                padding: "6px 14px",
                fontWeight: 900,
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
              }}
            >
              🪙 [E] Open Dan Peti (दान पेटिका)
            </button>
          </Html>
        )}
      </group>

      {/* ─── 8. Additional Temple 1: Shree Ganesh Mandir (विघ्नहर्ता गणेश) ───── */}
      <group position={[-10.5, 0, 0]}>
        {/* Stone Plinth */}
        <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
          <boxGeometry args={[5.2, 0.7, 5.2]} />
          <meshStandardMaterial color="#78350F" roughness={0.85} />
        </mesh>
        {/* Shrine Sanctum */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[3.2, 2.2, 3.2]} />
          <meshStandardMaterial color="#991B1B" roughness={0.75} />
        </mesh>
        {/* Carved Doorway */}
        <mesh position={[0, 1.5, 1.62]}>
          <boxGeometry args={[1.2, 1.6, 0.06]} />
          <meshBasicMaterial color="#1E1B18" />
        </mesh>
        {/* Pagoda Roof */}
        <mesh position={[0, 3.4, 0]} castShadow>
          <coneGeometry args={[3.6, 1.4, 4]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.6} />
        </mesh>
        {/* Golden Gajur */}
        <mesh position={[0, 4.3, 0]}>
          <coneGeometry args={[0.14, 0.5, 6]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} />
        </mesh>
        {/* Lord Ganesh Idol Inside Shrine */}
        <group position={[0, 1.2, 0.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.24, 0.35, 0.5, 8]} />
            <meshStandardMaterial color="#F97316" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#F97316" roughness={0.6} />
          </mesh>
          {/* Elephant Trunk */}
          <mesh position={[0, 0.35, 0.16]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 0.22, 6]} />
            <meshStandardMaterial color="#F97316" />
          </mesh>
          {/* Modak / Laddu */}
          <mesh position={[-0.18, 0.3, 0.15]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#FDE047" />
          </mesh>
          {/* Mooshak (Mouse) Vahana */}
          <mesh position={[0.28, -0.15, 0.2]}>
            <boxGeometry args={[0.12, 0.08, 0.16]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>
        </group>
        {/* Temple Tag */}
        <Html position={[0, 3.8, 1.8]} center distanceFactor={14} zIndexRange={[1, 10]}>
          <div style={{ background: "rgba(15,23,42,0.85)", border: "1px solid #F59E0B", borderRadius: "10px", padding: "4px 8px", color: "#FDE047", fontSize: "11px", fontWeight: 800, whiteSpace: "nowrap" }}>
            🐘 श्री गणेश मन्दिर
          </div>
        </Html>
      </group>

      {/* ─── 9. Additional Temple 2: Shree Shiva Mandir & Shivalinga (भोलेनाथ) ── */}
      <group position={[10.5, 0, 0]}>
        {/* Stone Plinth */}
        <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
          <boxGeometry args={[5.2, 0.7, 5.2]} />
          <meshStandardMaterial color="#78350F" roughness={0.85} />
        </mesh>
        {/* Open Pavilion Pillars */}
        {[
          [-1.8, -1.8],
          [1.8, -1.8],
          [-1.8, 1.8],
          [1.8, 1.8],
        ].map(([px, pz], i) => (
          <mesh key={`shiva-col-${i}`} position={[px, 1.4, pz]}>
            <cylinderGeometry args={[0.12, 0.12, 1.8, 8]} />
            <meshStandardMaterial color="#451A03" />
          </mesh>
        ))}
        {/* Pavilion Roof */}
        <mesh position={[0, 2.8, 0]} castShadow>
          <coneGeometry args={[3.4, 1.2, 4]} />
          <meshStandardMaterial color="#991B1B" roughness={0.6} />
        </mesh>
        {/* Golden Gajur */}
        <mesh position={[0, 3.6, 0]}>
          <coneGeometry args={[0.14, 0.5, 6]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} />
        </mesh>
        {/* Sacred Panchamukhi Shivalingam on Yoni Peeth */}
        <group position={[0, 0.75, 0]}>
          {/* Yoni Peeth base */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.45, 0.55, 0.2, 12]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>
          {/* Black Stone Shivalingam */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.45, 12]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} />
          </mesh>
          {/* Tripundra (Three holy lines) */}
          <mesh position={[0, 0.5, 0.19]}>
            <boxGeometry args={[0.16, 0.04, 0.01]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Brass Trishul with Damaru */}
          <group position={[0.42, 0.5, -0.2]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <coneGeometry args={[0.06, 0.2, 4]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 6]} />
              <meshStandardMaterial color="#78350F" />
            </mesh>
          </group>
          {/* Seated Brass Nandi Bull facing Shivalingam */}
          <group position={[0, 0.12, 1.2]} rotation={[0, Math.PI, 0]}>
            <mesh>
              <boxGeometry args={[0.26, 0.2, 0.4]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.14, 0.2]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
          </group>
        </group>
        {/* Temple Tag */}
        <Html position={[0, 3.2, 1.8]} center distanceFactor={14} zIndexRange={[1, 10]}>
          <div style={{ background: "rgba(15,23,42,0.85)", border: "1px solid #F59E0B", borderRadius: "10px", padding: "4px 8px", color: "#FDE047", fontSize: "11px", fontWeight: 800, whiteSpace: "nowrap" }}>
            🔱 श्री शिव मन्दिर (भोलेनाथ)
          </div>
        </Html>
      </group>

      {/* ─── 10. Overhead Temple Banner & Interactive Pray Button ──────────── */}
      {isNearMandir && (
        <Html position={[0, 4.2, 5.2]} center distanceFactor={14} zIndexRange={[1, 10]}>
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              border: "2px solid #F59E0B",
              borderRadius: "16px",
              padding: "8px 16px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              userSelect: "none",
            }}
          >
            <div style={{ color: "#FDE047", fontWeight: 900, fontSize: "14px", whiteSpace: "nowrap" }}>
              🛕 श्री दुर्गा माता मन्दिर (Durga Mata Temple)
            </div>
            <div style={{ color: "#FED7AA", fontSize: "11px", fontWeight: 600 }}>
              जय माँ दुर्गा • दशमी महापूजा प्राङ्गण
            </div>
            <button
              onClick={onPray}
              style={{
                marginTop: "2px",
                background: nearbyInteraction === "mandir" ? "#B91C1C" : "rgba(180, 83, 9, 0.9)",
                color: "#FFF",
                border: "1px solid #FDE047",
                borderRadius: "12px",
                padding: "5px 14px",
                fontWeight: 800,
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              🌸 [E] Offer Flowers &amp; Pray (पूजा अर्चना)
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};
