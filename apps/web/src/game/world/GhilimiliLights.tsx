import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GhilimiliLightsProps {
  isNight: boolean;
}

const FESTIVE_COLORS = [
  "#F59E0B", // Marigold Amber
  "#EF4444", // Crimson Red
  "#10B981", // Emerald Green
  "#06B6D4", // Sky Blue
  "#FBBF24", // Golden Yellow
  "#EC4899", // Festive Pink
];

interface BulbData {
  position: [number, number, number];
  color: string;
}

/**
 * Minimal, optimized Ghilimili (झिलीमिली) festive fairy lights.
 * Restricted strictly to main cultural landmarks:
 *  1. Shree Durga Mata Mandir eaves
 *  2. Central Chautari Banyan Tree lower canopy
 *  3. Bada Dashain Mula Ghar (House 1) porch
 *  4. Dashain Maiti Ghar (House 2) porch
 *
 * Strictly unlit during the daytime; warmly illuminating & twinkling at night.
 */
export const GhilimiliLights: React.FC<GhilimiliLightsProps> = ({ isNight }) => {
  const bulbsGroupRef = useRef<THREE.Group>(null);

  // Generate a minimal set of catenary strings for the main landmarks (~48 bulbs total)
  const bulbs: BulbData[] = useMemo(() => {
    const list: BulbData[] = [];
    let colorIdx = 0;

    const addString = (
      p1: [number, number, number],
      p2: [number, number, number],
      count: number,
      sag: number = 0.35
    ) => {
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const x = p1[0] + (p2[0] - p1[0]) * t;
        const z = p1[2] + (p2[2] - p1[2]) * t;
        const yDip = Math.sin(t * Math.PI) * sag;
        const y = p1[1] + (p2[1] - p1[1]) * t - yDip;
        list.push({
          position: [x, y, z],
          color: FESTIVE_COLORS[colorIdx % FESTIVE_COLORS.length],
        });
        colorIdx++;
      }
    };

    // 1. Shree Durga Mata Mandir Entrance & Eaves (North Temple Hill at [0, 2.8, -75])
    addString([-4.2, 6.6, -72], [4.2, 6.6, -72], 9, 0.4);
    addString([-3.2, 8.6, -73.5], [3.2, 8.6, -73.5], 7, 0.3);

    // 2. Central Chautari Banyan Tree lower canopy ring (World [0, y, 5])
    const chautariRadius = 4.8;
    const chautariCount = 14;
    for (let i = 0; i < chautariCount; i++) {
      const angle = (i / chautariCount) * Math.PI * 2;
      const x = Math.sin(angle) * chautariRadius;
      const z = 5 + Math.cos(angle) * chautariRadius;
      const y = 3.4 + Math.sin(i * 1.5) * 0.15;
      list.push({
        position: [x, y, z],
        color: FESTIVE_COLORS[colorIdx % FESTIVE_COLORS.length],
      });
      colorIdx++;
    }

    // 3. Bada Dashain Mula Ghar (House 1) Porch eaves (World [-28, y, -31])
    addString([-31.5, 3.2, -30.5], [-24.5, 3.2, -30.5], 9, 0.3);

    // 4. Dashain Maiti Ghar (House 2) Porch eaves (World [28, y, -31])
    addString([24.5, 3.2, -30.5], [31.5, 3.2, -30.5], 9, 0.3);

    return list;
  }, []);

  // Soft twinkling animation at night
  useFrame(({ clock }) => {
    if (!bulbsGroupRef.current) return;
    const t = clock.getElapsedTime();

    bulbsGroupRef.current.children.forEach((mesh, idx) => {
      const mat = (mesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (!mat) return;

      if (isNight) {
        const twinkle = Math.sin(t * 3.0 + idx * 0.7) * 0.35;
        mat.emissiveIntensity = 2.0 + twinkle;
      } else {
        mat.emissiveIntensity = 0.0;
      }
    });
  });

  return (
    <group>
      {/* Minimal Festive Bulbs */}
      <group ref={bulbsGroupRef}>
        {bulbs.map((bulb, idx) => (
          <mesh key={`ghilimili-${idx}`} position={bulb.position}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial
              color={isNight ? bulb.color : "#4B5563"}
              emissive={isNight ? bulb.color : "#000000"}
              emissiveIntensity={isNight ? 2.0 : 0.0}
              roughness={isNight ? 0.2 : 0.8}
            />
          </mesh>
        ))}
      </group>

      {/* 4 Soft Warm Landmark Glow Lights (Strictly mounted at night) */}
      {isNight && (
        <group>
          {/* Temple Sanctum Glow */}
          <pointLight position={[0, 3.5, -44]} color="#FFA500" intensity={2.2} distance={14} decay={2} />
          {/* Chautari Sacred Tree Glow */}
          <pointLight position={[0, 3.2, 5]} color="#FBBF24" intensity={2.0} distance={12} decay={2} />
          {/* Mula Ghar Porch Warmth */}
          <pointLight position={[-28, 2.5, -31]} color="#F59E0B" intensity={1.8} distance={10} decay={2} />
          {/* Maiti Ghar Porch Warmth */}
          <pointLight position={[28, 2.5, -31]} color="#F59E0B" intensity={1.8} distance={10} decay={2} />
        </group>
      )}
    </group>
  );
};
