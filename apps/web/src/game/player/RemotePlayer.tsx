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
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({
  displayName,
  targetPosition,
  targetRotationY,
  animState,
  customization,
  speechBubble,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z));
  const currentRotY = useRef(targetRotationY);

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth dead-reckoning lerp for position (factor 0.2 per frame at 60fps)
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
  });

  return (
    <group ref={groupRef} position={[targetPosition.x, targetPosition.y, targetPosition.z]}>
      <CharacterAvatar
        displayName={displayName}
        animState={animState}
        customization={customization}
        speechBubble={speechBubble}
        isLocalPlayer={false}
      />
    </group>
  );
};
