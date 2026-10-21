import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { AnimationState, AvatarCustomization } from "@melaverse/shared";

interface CharacterAvatarProps {
  displayName: string;
  animState: AnimationState | "drinking" | "eating" | "wearing_topi" | "flying_kite";
  customization?: Partial<AvatarCustomization>;
  speechBubble?: string | null;
  isLocalPlayer?: boolean;
  heldItem?: "chiya" | "sel_roti" | "kite" | "diya" | null;
  showCardsInHand?: boolean;
  showNameTag?: boolean;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  displayName,
  animState,
  customization = {},
  speechBubble,
  isLocalPlayer = false,
  heldItem = null,
  showCardsInHand = false,
  showNameTag = true,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Customization defaults
  const skinTone = customization.skinTone ?? "#E0AC69";
  const vestColor = customization.vestColor ?? "#D97706";
  const bodyColor = customization.color ?? "#C41E3A";
  const dhakaColor = customization.dhakaTopiColor ?? "#8B0000";
  const hasTopi = customization.hasDhakaTopi ?? true;
  const hasVest = customization.hasVest ?? true;
  const hasTika = customization.hasTika ?? false;
  const hasJamara = customization.hasJamara ?? hasTika;

  // Procedural Limb Animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (!leftArmRef.current || !rightArmRef.current || !leftLegRef.current || !rightLegRef.current || !headRef.current || !torsoRef.current) {
      return;
    }

    // Safety resets for legs and torso to prevent glitching after standing up
    if (animState !== "seated" && animState !== "swinging") {
      leftLegRef.current.position.set(-0.16, 0.55, 0);
      rightLegRef.current.position.set(0.16, 0.55, 0);
      leftLegRef.current.rotation.z = THREE.MathUtils.lerp(leftLegRef.current.rotation.z, 0, 0.3);
      rightLegRef.current.rotation.z = THREE.MathUtils.lerp(rightLegRef.current.rotation.z, 0, 0.3);
      leftLegRef.current.rotation.y = THREE.MathUtils.lerp(leftLegRef.current.rotation.y, 0, 0.3);
      rightLegRef.current.rotation.y = THREE.MathUtils.lerp(rightLegRef.current.rotation.y, 0, 0.3);
      if (animState === "idle" || animState === "walk" || animState === "run") {
        torsoRef.current.rotation.z = THREE.MathUtils.lerp(torsoRef.current.rotation.z, 0, 0.2);
      }
    }

    if (animState === "idle") {
      headRef.current.rotation.x = Math.sin(t * 1.5) * 0.04;
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.05;
      torsoRef.current.rotation.set(0, 0, 0);
      torsoRef.current.position.y = 0.95 + Math.sin(t * 2) * 0.02;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.sin(t * 2) * 0.05, 0.1);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -Math.sin(t * 2) * 0.05, 0.1);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.15, 0.1);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.15, 0.1);
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);
    } else if (animState === "walk") {
      const walkSpeed = 9;
      const legAngle = Math.sin(t * walkSpeed) * 0.6;
      leftLegRef.current.rotation.x = legAngle;
      rightLegRef.current.rotation.x = -legAngle;
      leftArmRef.current.rotation.x = -legAngle * 0.8;
      rightArmRef.current.rotation.x = legAngle * 0.8;
      torsoRef.current.rotation.set(0, 0, 0);
      torsoRef.current.position.y = 0.95 + Math.abs(Math.sin(t * walkSpeed)) * 0.08;
    } else if (animState === "run") {
      const runSpeed = 14;
      const legAngle = Math.sin(t * runSpeed) * 0.9;
      leftLegRef.current.rotation.x = legAngle;
      rightLegRef.current.rotation.x = -legAngle;
      leftArmRef.current.rotation.x = -legAngle * 1.1;
      rightArmRef.current.rotation.x = legAngle * 1.1;
      torsoRef.current.rotation.x = 0.2;
      torsoRef.current.position.y = 0.95 + Math.abs(Math.sin(t * runSpeed)) * 0.12;
    } else if (animState === "jump" || animState === "fall") {
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.6, 0.2);
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.4, 0.2);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.0, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.0, 0.2);
    } else if (animState === "namaste") {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.35, 0.2);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.2, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.2, 0.2);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.7, 0.2);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.7, 0.2);
      leftLegRef.current.rotation.x = 0;
      rightLegRef.current.rotation.x = 0;
    } else if (animState === "nach") {
      const danceSpeed = 7;
      const sway = Math.sin(t * danceSpeed);
      torsoRef.current.rotation.z = sway * 0.18;
      torsoRef.current.position.y = 0.95 + Math.abs(sway) * 0.12;
      headRef.current.rotation.y = -sway * 0.25;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.8 + Math.cos(t * danceSpeed) * 0.5, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.8 - Math.cos(t * danceSpeed) * 0.5, 0.2);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.85, 0.2);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.85, 0.2);
      leftLegRef.current.rotation.x = Math.sin(t * danceSpeed) * 0.3;
      rightLegRef.current.rotation.x = -Math.sin(t * danceSpeed) * 0.3;
    } else if (animState === "wave") {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.5, 0.2);
      rightArmRef.current.rotation.z = -0.3 + Math.sin(t * 12) * 0.4;
      headRef.current.rotation.y = Math.sin(t * 4) * 0.15;
    } else if (animState === "cheer") {
      const bounce = Math.sin(t * 8);
      torsoRef.current.position.y = 0.95 + Math.abs(bounce) * 0.15;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.7, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.7, 0.2);
      leftArmRef.current.rotation.z = 0.35 + bounce * 0.15;
      rightArmRef.current.rotation.z = -0.35 - bounce * 0.15;
    } else if (animState === "drinking") {
      // Right arm raises tea cup to lips, head tilts back
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.9, 0.2);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.4, 0.2);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.25, 0.2);
    } else if (animState === "eating") {
      // Right arm brings Sel Roti to mouth, chewing jaw bob
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.8, 0.2);
      headRef.current.position.y = 0.52 + Math.sin(t * 10) * 0.02;
    } else if (animState === "wearing_topi") {
      // Both hands reach up to head to adjust Dhaka Topi
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.3, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.3, 0.2);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.5, 0.2);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.5, 0.2);
    } else if (animState === "flying_kite") {
      // Right arm up holding string, left arm holding lattai spool
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.2, 0.2);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.1, 0.2);
      headRef.current.rotation.x = -0.3; // Looking up at kite
    } else if (animState === "swinging") {
      leftLegRef.current.rotation.x = -1.4;
      rightLegRef.current.rotation.x = -1.4;
      leftArmRef.current.rotation.x = -1.1;
      rightArmRef.current.rotation.x = -1.1;
      torsoRef.current.position.y = 0.55;
    } else if (animState === "seated") {
      torsoRef.current.position.y = 0.48;
      leftLegRef.current.position.set(-0.16, 0.48, 0);
      rightLegRef.current.position.set(0.16, 0.48, 0);
      leftLegRef.current.rotation.set(-1.42, 0, 0.04);
      rightLegRef.current.rotation.set(-1.42, 0, -0.04);
      leftArmRef.current.rotation.set(-0.65, 0, 0.14);
      rightArmRef.current.rotation.set(-0.65, 0, -0.14);
      headRef.current.rotation.set(0.04, 0, 0);
    } else if (animState === "kneeling_tika") {
      // Respectful kneeling pose to receive Dashain Tika from elder
      torsoRef.current.position.y = 0.45;
      leftLegRef.current.position.y = 0.35;
      rightLegRef.current.position.y = 0.35;
      leftLegRef.current.rotation.x = -1.4;
      rightLegRef.current.rotation.x = -1.4;
      leftLegRef.current.rotation.z = 0.3;
      rightLegRef.current.rotation.z = -0.3;
      headRef.current.rotation.x = 0.22; // Respectful slight bow
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.8, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8, 0.2);
      leftArmRef.current.rotation.z = 0.25;
      rightArmRef.current.rotation.z = -0.25;
    } else if (animState === "giving_tika") {
      // Elder Aama blessing pose: right arm reaches forward to forehead with tika, left hand holds puja thali
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.65, 0.2);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.15, 0.2);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.9, 0.2);
      leftArmRef.current.rotation.z = 0.35;
      headRef.current.rotation.x = 0.12;
    } else if (animState === "clapping") {
      // Standing clapping hands together rhythmically
      const clap = Math.sin(t * 14);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.3, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.3, 0.2);
      leftArmRef.current.rotation.z = 0.42 + clap * 0.16;
      rightArmRef.current.rotation.z = -0.42 - clap * 0.16;
      headRef.current.rotation.x = 0.08 + Math.abs(clap) * 0.05;
    } else if (animState === "seated_clapping") {
      // Seated on bench / mat, clapping rhythmically
      torsoRef.current.position.y = 0.48;
      leftLegRef.current.position.set(-0.16, 0.48, 0);
      rightLegRef.current.position.set(0.16, 0.48, 0);
      leftLegRef.current.rotation.set(-1.42, 0, 0.04);
      rightLegRef.current.rotation.set(-1.42, 0, -0.04);
      const clap = Math.sin(t * 12);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.15, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.15, 0.2);
      leftArmRef.current.rotation.z = 0.35 + clap * 0.15;
      rightArmRef.current.rotation.z = -0.35 - clap * 0.15;
      headRef.current.rotation.y = Math.sin(t * 3) * 0.1;
    } else if (animState === "clapping_dance") {
      // Dance variation: rhythmic footwork with clapping
      const step = Math.sin(t * 6);
      const clap = Math.sin(t * 12);
      torsoRef.current.position.y = 0.95 + Math.abs(step) * 0.12;
      torsoRef.current.rotation.y = step * 0.2;
      leftLegRef.current.rotation.x = step * 0.45;
      rightLegRef.current.rotation.x = -step * 0.45;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.4, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.4, 0.2);
      leftArmRef.current.rotation.z = 0.45 + clap * 0.18;
      rightArmRef.current.rotation.z = -0.45 - clap * 0.18;
    } else if (animState === "swaying_dance") {
      // Nepali folk sway: gentle hip sway with alternating raised arm motions
      const sway = Math.sin(t * 4);
      torsoRef.current.rotation.z = sway * 0.14;
      torsoRef.current.position.y = 0.95 + Math.abs(sway) * 0.08;
      headRef.current.rotation.y = -sway * 0.2;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -1.4 + Math.cos(t * 4) * 0.35, 0.2);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.4 - Math.cos(t * 4) * 0.35, 0.2);
      leftArmRef.current.rotation.z = 0.7;
      rightArmRef.current.rotation.z = -0.7;
      leftLegRef.current.rotation.x = sway * 0.25;
      rightLegRef.current.rotation.x = -sway * 0.25;
    }
  });

  return (
    <group ref={rootRef}>
      {/* ─── Name Tag & Chat Bubble with controlled zIndex ──────────────────── */}
      {(showNameTag || speechBubble) && (
        <Html
          position={[0, 2.2, 0]}
          center
          distanceFactor={14}
          zIndexRange={[1, 10]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div style={{ pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {speechBubble && (
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  color: "#1f2937",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  marginBottom: "4px",
                  maxWidth: "160px",
                  textAlign: "center",
                  wordBreak: "break-word",
                  border: "1px solid #e5e7eb",
                }}
              >
                {speechBubble}
              </div>
            )}
            {showNameTag && (
              <div
                style={{
                  backgroundColor: isLocalPlayer ? "rgba(196, 30, 58, 0.88)" : "rgba(30, 41, 59, 0.82)",
                  color: "#ffffff",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  letterSpacing: "0.5px",
                  border: isLocalPlayer ? "1px solid #ffd700" : "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {isLocalPlayer ? `⭐ ${displayName}` : displayName}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* ─── Torso / Body ───────────────────────────────────────────────────── */}
      <group ref={torsoRef} position={[0, 0.95, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.65, 0.32]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>

        {hasVest && (
          <mesh position={[0, 0.02, 0.02]}>
            <boxGeometry args={[0.57, 0.62, 0.33]} />
            <meshStandardMaterial color={vestColor} roughness={0.6} />
          </mesh>
        )}

        {/* ─── Head ────────────────────────────────────────────────────────── */}
        <group ref={headRef} position={[0, 0.52, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.38, 0.38]} />
            <meshStandardMaterial color={skinTone} roughness={0.6} />
          </mesh>

          <mesh position={[-0.09, 0.04, 0.2]}>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0.09, 0.04, 0.2]}>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>

          <mesh position={[0, -0.08, 0.2]}>
            <boxGeometry args={[0.12, 0.03, 0.01]} />
            <meshStandardMaterial color="#991b1b" />
          </mesh>

          {/* Dashain Red Tika & Akshata on Forehead */}
          {hasTika && (
            <group position={[0, 0.09, 0.201]}>
              <mesh>
                <circleGeometry args={[0.045, 16]} />
                <meshBasicMaterial color="#DC2626" />
              </mesh>
              {/* Rice grain Akshata accents */}
              <mesh position={[0.015, 0.01, 0.001]}>
                <circleGeometry args={[0.012, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[-0.012, -0.01, 0.001]}>
                <circleGeometry args={[0.01, 6]} />
                <meshBasicMaterial color="#FEF08A" />
              </mesh>
            </group>
          )}

          {/* Sacred Golden-Green Jamara tucked above ear / under Topi */}
          {hasJamara && (
            <group position={[0.18, 0.16, 0.06]} rotation={[0, 0, -0.4]}>
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.015, 0.025, 0.22, 5]} />
                <meshStandardMaterial color="#84CC16" roughness={0.6} />
              </mesh>
              <mesh position={[0.04, 0.06, 0.02]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.01, 0.02, 0.18, 5]} />
                <meshStandardMaterial color="#EAB308" roughness={0.6} />
              </mesh>
            </group>
          )}

          {/* Dhaka Topi */}
          {hasTopi && (
            <group position={[0, 0.22, 0]}>
              <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.23, 0.16, 8]} />
                <meshStandardMaterial color={dhakaColor} roughness={0.8} />
              </mesh>
              <mesh position={[-0.03, 0.12, 0]} rotation={[0, 0, 0.15]}>
                <coneGeometry args={[0.2, 0.12, 8]} />
                <meshStandardMaterial color="#B91C1C" roughness={0.8} />
              </mesh>
            </group>
          )}
        </group>

        {/* ─── Arms ────────────────────────────────────────────────────────── */}
        <group ref={leftArmRef} position={[-0.38, 0.22, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.18, 0.55, 0.2]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0, -0.56, 0]}>
            <boxGeometry args={[0.15, 0.14, 0.16]} />
            <meshStandardMaterial color={skinTone} />
          </mesh>

          {/* Lattai (Kite String Spool) when flying kite */}
          {heldItem === "kite" && (
            <group position={[0, -0.65, 0.15]} rotation={[0, 0, Math.PI / 4]}>
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
                <meshStandardMaterial color="#A16207" />
              </mesh>
            </group>
          )}
        </group>

        <group ref={rightArmRef} position={[0.38, 0.22, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.18, 0.55, 0.2]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0, -0.56, 0]}>
            <boxGeometry args={[0.15, 0.14, 0.16]} />
            <meshStandardMaterial color={skinTone} />
          </mesh>

          {/* Held Items */}
          {heldItem === "chiya" && (
            <group position={[0, -0.65, 0.15]}>
              <mesh>
                <cylinderGeometry args={[0.07, 0.05, 0.14, 8]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
            </group>
          )}
          {heldItem === "sel_roti" && (
            <group position={[0, -0.65, 0.15]} rotation={[Math.PI / 4, 0, 0]}>
              <mesh>
                <torusGeometry args={[0.1, 0.03, 8, 16]} />
                <meshStandardMaterial color="#D97706" />
              </mesh>
            </group>
          )}
          {heldItem === "kite" && (
            <group position={[0, -0.65, 0.2]} rotation={[0, 0, Math.PI / 4]}>
              <mesh>
                <planeGeometry args={[0.35, 0.35]} />
                <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
          {heldItem === "diya" && (
            <group position={[0, -0.62, 0.18]}>
              {/* Terracotta Clay Pala */}
              <mesh castShadow>
                <cylinderGeometry args={[0.08, 0.05, 0.05, 10]} />
                <meshStandardMaterial color="#9A3412" roughness={0.85} />
              </mesh>
              {/* Sacred Oil Pool */}
              <mesh position={[0, 0.026, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.01, 8]} />
                <meshStandardMaterial color="#451A03" roughness={0.2} />
              </mesh>
              {/* Golden Teardrop Flame */}
              <mesh position={[0, 0.08, 0]}>
                <coneGeometry args={[0.038, 0.1, 8]} />
                <meshBasicMaterial color="#FF9F1C" />
              </mesh>
              {/* Warm Diya Glow */}
              <pointLight color="#FFA500" intensity={2.4} distance={10} decay={2} position={[0, 0.12, 0]} />
            </group>
          )}
        </group>

        {/* 3D Playing Cards held in hand when playing Taas */}
        {showCardsInHand && (
          <group position={[0, 0.05, 0.35]} rotation={[-0.3, 0, 0]}>
            {[-0.1, 0, 0.1].map((x, i) => (
              <mesh key={`hand-card-${i}`} position={[x, 0, i * 0.01]} rotation={[0, 0, (i - 1) * 0.15]}>
                <planeGeometry args={[0.15, 0.22]} />
                <meshStandardMaterial color="#FFFFFF" side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* ─── Legs (Suruwal) ─────────────────────────────────────────────────── */}
      <group ref={leftLegRef} position={[-0.16, 0.55, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.22]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.58, 0.04]}>
          <boxGeometry args={[0.22, 0.12, 0.28]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.16, 0.55, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.22]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.58, 0.04]}>
          <boxGeometry args={[0.22, 0.12, 0.28]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    </group>
  );
};
