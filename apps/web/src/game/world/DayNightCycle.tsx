import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface DayNightCycleProps {
  cycleDuration?: number; // duration of full day/night cycle in seconds (600s = 5 min day, 5 min night)
  onPhaseChange?: (phase: "morning" | "day" | "sunset" | "night", isNight: boolean) => void;
  graphicsQuality?: "low" | "medium" | "high";
}

export const DayNightCycle: React.FC<DayNightCycleProps> = ({
  cycleDuration = 600,
  onPhaseChange,
  graphicsQuality = "medium",
}) => {
  const { scene, camera } = useThree();
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemisphereLightRef = useRef<THREE.HemisphereLight>(null);

  const sunGroupRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);

  const lastPhaseRef = useRef<string>("");

  // Generate 350 twinkling Himalayan night stars distributed across the sky dome
  const starPositions = useMemo(() => {
    const coords = new Float32Array(350 * 3);
    for (let i = 0; i < 350; i++) {
      const radius = 130 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85); // Only upper hemisphere (sky)
      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = radius * Math.cos(phi); // Above horizon
      coords[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return coords;
  }, []);

  useFrame(() => {
    // Universal synchronized time based on epoch seconds (5-minute loop)
    const timeSec = (Date.now() / 1000) % cycleDuration;
    const progress = timeSec / cycleDuration; // 0.0 to 1.0

    // Sun angle in orbit: 0 is dawn (east horizon), 0.25 is noon (zenith), 0.5 is sunset (west horizon), 0.75 is midnight
    const sunAngle = progress * Math.PI * 2;
    const orbitDistance = 95;
    const sunX = Math.cos(sunAngle) * orbitDistance;
    const sunY = Math.sin(sunAngle) * orbitDistance;
    const sunZ = Math.sin(sunAngle * 0.5) * 35;

    // Moon is directly opposite the Sun in orbit
    const moonX = -sunX;
    const moonY = -sunY;
    const moonZ = -sunZ;

    // Position physical celestial meshes
    if (sunGroupRef.current) {
      sunGroupRef.current.position.set(sunX, sunY, sunZ);
      sunGroupRef.current.visible = sunY > -10;
      sunGroupRef.current.lookAt(camera.position);
    }

    if (moonGroupRef.current) {
      moonGroupRef.current.position.set(moonX, moonY, moonZ);
      moonGroupRef.current.visible = moonY > -10;
      moonGroupRef.current.lookAt(camera.position);
    }

    let skyColor: THREE.Color;
    let sunColor: THREE.Color;
    let ambientColor: THREE.Color;
    let sunIntensity = 1.6;
    let ambientIntensity = 0.7;
    let currentPhase: "morning" | "day" | "sunset" | "night" = "day";
    let isNight = false;

    if (progress >= 0.0 && progress < 0.10) {
      // 1. Morning / Dawn (~60s transition)
      currentPhase = "morning";
      const sub = progress / 0.10;
      skyColor = new THREE.Color().lerpColors(new THREE.Color("#1e1b4b"), new THREE.Color("#fed7aa"), sub);
      sunColor = new THREE.Color("#f97316").lerp(new THREE.Color("#fde047"), sub);
      ambientColor = new THREE.Color("#451a03").lerp(new THREE.Color("#78350f"), sub);
      sunIntensity = THREE.MathUtils.lerp(0.3, 1.4, sub);
      ambientIntensity = THREE.MathUtils.lerp(0.3, 0.7, sub);
    } else if (progress >= 0.10 && progress < 0.45) {
      // 2. Daytime / High Sun (~210s, total daytime ~270s = ~4.5 to 5 mins)
      currentPhase = "day";
      skyColor = new THREE.Color("#7dd3fc");
      sunColor = new THREE.Color("#ffffff");
      ambientColor = new THREE.Color("#ffffff");
      sunIntensity = 1.6;
      ambientIntensity = 0.8;
    } else if (progress >= 0.45 && progress < 0.55) {
      // 3. Sunset / Dusk (~60s twilight transition into night)
      currentPhase = "sunset";
      const sub = (progress - 0.45) / 0.10;
      skyColor = new THREE.Color().lerpColors(new THREE.Color("#7dd3fc"), new THREE.Color("#991b1b"), sub);
      sunColor = new THREE.Color("#fbbf24").lerp(new THREE.Color("#ea580c"), sub);
      ambientColor = new THREE.Color("#fed7aa").lerp(new THREE.Color("#451a03"), sub);
      sunIntensity = THREE.MathUtils.lerp(1.5, 0.4, sub);
      ambientIntensity = THREE.MathUtils.lerp(0.8, 0.4, sub);
    } else {
      // 4. Night / Deepawali Starlight & Moon (~270s = ~4.5 to 5 mins)
      currentPhase = "night";
      isNight = true;
      skyColor = new THREE.Color("#090d16"); // Deep Himalayan night sky
      sunColor = new THREE.Color("#93c5fd"); // Cool gentle moonlight
      ambientColor = new THREE.Color("#1e1b4b");
      sunIntensity = 0.45;
      ambientIntensity = 0.35;
    }

    // Apply colors to scene
    scene.background = skyColor;

    if (dirLightRef.current) {
      if (isNight) {
        // Light originates from the Moon position at night
        dirLightRef.current.position.set(moonX, Math.max(10, moonY), moonZ);
      } else {
        // Light originates from the Sun position during daytime
        dirLightRef.current.position.set(sunX, Math.max(8, sunY), sunZ);
      }
      dirLightRef.current.color.copy(sunColor);
      dirLightRef.current.intensity = graphicsQuality === "low" ? sunIntensity * 0.8 : sunIntensity;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.copy(ambientColor);
      ambientLightRef.current.intensity = ambientIntensity;
    }

    if (hemisphereLightRef.current) {
      hemisphereLightRef.current.color.copy(skyColor);
      hemisphereLightRef.current.groundColor.copy(ambientColor);
      hemisphereLightRef.current.intensity = isNight ? 0.25 : 0.5;
    }

    // Stars visibility and soft twinkling during night
    if (starsRef.current) {
      starsRef.current.visible = isNight;
      if (isNight) {
        const mat = starsRef.current.material as THREE.PointsMaterial;
        mat.opacity = 0.8 + Math.sin(Date.now() * 0.003) * 0.15;
      }
    }

    // Apply atmospheric distance fog matching sky color to optimize rendering & soften distant horizons
    if (!scene.fog) {
      scene.fog = new THREE.Fog(skyColor, 35, 135);
    } else {
      scene.fog.color.copy(skyColor);
      (scene.fog as THREE.Fog).near = isNight ? 28 : 38;
      (scene.fog as THREE.Fog).far = isNight ? 110 : 135;
    }

    if (currentPhase !== lastPhaseRef.current) {
      lastPhaseRef.current = currentPhase;
      onPhaseChange?.(currentPhase, isNight);
    }
  });

  return (
    <>
      <fog attach="fog" args={["#7DD3FC", 38, 135]} />
      <ambientLight ref={ambientLightRef} intensity={0.7} />
      <directionalLight
        ref={dirLightRef}
        position={[40, 60, 30]}
        intensity={1.5}
        castShadow={graphicsQuality !== "low"}
        shadow-mapSize-width={graphicsQuality === "high" ? 2048 : 1024}
        shadow-mapSize-height={graphicsQuality === "high" ? 2048 : 1024}
        shadow-camera-far={180}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <hemisphereLight ref={hemisphereLightRef} groundColor="#8B7355" intensity={0.5} />

      {/* ─── 3D Celestial Body: Sun ────────────────────────────────────────── */}
      <group ref={sunGroupRef}>
        {/* Core Glowing Sun Sphere */}
        <mesh>
          <sphereGeometry args={[4.8, 24, 24]} />
          <meshBasicMaterial color="#FFEB3B" />
        </mesh>
        {/* Luminous Corona Outer Glow */}
        <mesh>
          <sphereGeometry args={[6.2, 16, 16]} />
          <meshBasicMaterial color="#FFA000" transparent opacity={0.35} side={THREE.BackSide} />
        </mesh>
        {/* Sun Aura Disc */}
        <mesh>
          <ringGeometry args={[5.5, 9.2, 32]} />
          <meshBasicMaterial color="#FF8F00" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ─── 3D Celestial Body: Moon ───────────────────────────────────────── */}
      <group ref={moonGroupRef}>
        {/* Core Lunar Sphere */}
        <mesh>
          <sphereGeometry args={[3.8, 24, 24]} />
          <meshBasicMaterial color="#E2E8F0" />
        </mesh>
        {/* Lunar Starlight Halo */}
        <mesh>
          <sphereGeometry args={[5.0, 16, 16]} />
          <meshBasicMaterial color="#93C5FD" transparent opacity={0.3} side={THREE.BackSide} />
        </mesh>
        {/* Soft Moonlight Glow Ring */}
        <mesh>
          <ringGeometry args={[4.4, 7.5, 32]} />
          <meshBasicMaterial color="#60A5FA" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ─── Himalayan Starfield (Visible at Night) ─────────────────────────── */}
      <points ref={starsRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.6}
          color="#FFFFFF"
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
    </>
  );
};
