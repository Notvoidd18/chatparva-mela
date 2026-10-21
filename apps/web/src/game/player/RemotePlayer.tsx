import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CharacterAvatar } from "./CharacterAvatar.js";
import type { AnimationState, AvatarCustomization } from "@melaverse/shared";

interface RemotePlayerProps {
  displayName: string;
  targetPosition: { x: number; y: number; z: number };
  targetRotationY: number;
  animState: AnimationState;
  customization?: Partial<AvatarCustomization>;
  speechBubble?: string | null;
  isFlyingKite?: boolean;
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({
  displayName,
  targetPosition,
  targetRotationY,
  animState,
  customization,
  speechBubble,
  isFlyingKite = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z));
  const currentRotY = useRef(targetRotationY);
  const kiteGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Smooth dead-reckoning lerp for position (factor 0.22 per frame at 60fps)
    currentPos.current.lerp(
      new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z),
      0.22
    );

    // Smooth angular interpolation
    let diff = targetRotationY - currentRotY.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentRotY.current += diff * 0.22;

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentRotY.current;

    // Animate remote kite swaying in the wind
    if (kiteGroupRef.current && isFlyingKite) {
      const t = clock.getElapsedTime();
      kiteGroupRef.current.position.set(Math.sin(t * 2) * 1.5, 18 + Math.cos(t * 1.8) * 0.8, -12);
      kiteGroupRef.current.rotation.z = Math.sin(t * 3) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[targetPosition.x, targetPosition.y, targetPosition.z]}>
      <CharacterAvatar
        displayName={displayName}
        animState={isFlyingKite ? "flying_kite" : animState}
        customization={customization}
        speechBubble={speechBubble}
        isLocalPlayer={false}
        heldItem={isFlyingKite ? "kite" : null}
      />

      {/* Synchronized Dashain Changa Kite Soaring for Remote Player */}
      {isFlyingKite && (
        <group ref={kiteGroupRef} position={[0, 18, -12]}>
          <group rotation={[0, 0, Math.PI / 4]}>
            <mesh>
              <planeGeometry args={[2.2, 2.2]} />
              <meshBasicMaterial color={customization?.color || "#38BDF8"} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -1.2, 0.01]}>
              <coneGeometry args={[0.3, 0.7, 3]} />
              <meshBasicMaterial color="#FBBF24" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
