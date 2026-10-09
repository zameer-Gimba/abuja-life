"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type CharacterLook = {
  gender: string;
  skinTone: string;
  hairstyle: string;
  hairColor: string;
  outfitTop: string;
  outfitBottom: string;
  outfitShoes: string;
  heightCm: number;
  background: string;
};

const skinPalette: Record<string, string> = {
  deep_brown: "#603923",
  dark_brown: "#75462f",
  medium_brown: "#8d5a3b",
  warm_brown: "#a66e49",
  light_brown: "#bc8660",
};

const topPalette: Record<string, string> = {
  tee_cream_v1: "#e8ddc8",
  tee_rose_v1: "#bd7182",
  polo_navy_v1: "#24395d",
  blouse_lilac_v1: "#a89bc9",
};

const bottomPalette: Record<string, string> = {
  jeans_dark_v1: "#26374b",
  chinos_sand_v1: "#c5ae86",
  trousers_charcoal_v1: "#34333a",
};

const shoePalette: Record<string, string> = {
  sneakers_black_v1: "#17191d",
  sneakers_white_v1: "#eee9df",
};

function RoomFurniture({ sceneId }: { sceneId: string }) {
  const isMansion = sceneId === "guzape_mansion_v1";
  return (
    <group>
      {/* Fixed floor and walls: all scene geometry is authored and reused. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={isMansion ? [13, 11] : [9, 8]} />
        <meshStandardMaterial color="#bba17e" roughness={0.92} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`tile-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-4 + i, 0.012, 0]} receiveShadow>
          <planeGeometry args={[0.98, 8]} />
          <meshStandardMaterial color={i % 2 ? "#cdb694" : "#d6c2a2"} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, isMansion ? 2.05 : 1.65, isMansion ? -5.5 : -4]} castShadow receiveShadow>
        <boxGeometry args={[isMansion ? 13 : 9, isMansion ? 4.1 : 3.3, 0.18]} />
        <meshStandardMaterial color="#d8c58e" roughness={0.95} />
      </mesh>
      <mesh position={[isMansion ? -6.5 : -4.5, isMansion ? 2.05 : 1.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, isMansion ? 4.1 : 3.3, isMansion ? 11 : 8]} />
        <meshStandardMaterial color="#c6ad70" roughness={0.95} />
      </mesh>
      <mesh position={[0, isMansion ? 4.1 : 3.33, isMansion ? -5.48 : -3.98]}>
        <boxGeometry args={[isMansion ? 13 : 9, 0.12, 0.22]} />
        <meshStandardMaterial color="#8f794e" />
      </mesh>

      {!isMansion && <group>
      {/* Single-room bed/mattress. */}
      <group position={[-2.5, 0, -2.75]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[2.1, 0.35, 1.2]} />
          <meshStandardMaterial color="#6f5747" />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[2.03, 0.16, 1.15]} />
          <meshStandardMaterial color="#b9c8cb" />
        </mesh>
        <mesh position={[-0.72, 0.61, -0.24]}>
          <boxGeometry args={[0.48, 0.12, 0.38]} />
          <meshStandardMaterial color="#eee6d7" />
        </mesh>
        <mesh position={[0, 0.7, -0.68]}>
          <boxGeometry args={[2.1, 0.85, 0.08]} />
          <meshStandardMaterial color="#684a37" />
        </mesh>
      </group>

      {/* Plastic chair. */}
      <group position={[1.6, 0, -0.6]}>
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.58, 0.12, 0.58]} />
          <meshStandardMaterial color="#9c3033" />
        </mesh>
        <mesh position={[0, 0.95, -0.24]} castShadow>
          <boxGeometry args={[0.58, 0.72, 0.1]} />
          <meshStandardMaterial color="#9c3033" />
        </mesh>
        {[-0.22, 0.22].map((x) => [-0.22, 0.22].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.28, z]}>
            <boxGeometry args={[0.07, 0.52, 0.07]} />
            <meshStandardMaterial color="#7e2427" />
          </mesh>
        )))}
      </group>

      {/* Small table and fan silhouette. */}
      <group position={[2.8, 0, -2.35]}>
        <mesh position={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[0.85, 0.12, 0.58]} />
          <meshStandardMaterial color="#805c3c" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <meshStandardMaterial color="#805c3c" />
        </mesh>
        <mesh position={[0, 1.24, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.12, 16]} />
          <meshStandardMaterial color="#477f78" />
        </mesh>
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.09, 12, 8]} />
          <meshStandardMaterial color="#333b3c" />
        </mesh>
      </group>

      </group>}

      {isMansion && <group>
        {/* Mansion lounge: sofa, coffee table, dining area and tall indoor plant. */}
        <group position={[-2.5, 0, -2.1]}>
          <mesh position={[0, 0.48, 0]} castShadow><boxGeometry args={[2.7, 0.7, 0.85]} /><meshStandardMaterial color="#d4c5ad" /></mesh>
          <mesh position={[0, 0.92, -0.32]} castShadow><boxGeometry args={[2.7, 0.38, 0.2]} /><meshStandardMaterial color="#c4b396" /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * 1.2, 0.8, 0]}><boxGeometry args={[0.25, 0.6, 0.85]} /><meshStandardMaterial color="#c4b396" /></mesh>)}
        </group>
        <group position={[0.4, 0, 0.1]}>
          <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[1.45, 0.12, 0.8]} /><meshStandardMaterial color="#60452f" /></mesh>
          {[-0.55, 0.55].map((x) => [-0.25, 0.25].map((z) => <mesh key={x + ":" + z} position={[x, 0.17, z]}><boxGeometry args={[0.06, 0.34, 0.06]} /><meshStandardMaterial color="#60452f" /></mesh>))}
        </group>
        <group position={[3.8, 0, -2.8]}>
          <mesh position={[0, 0.8, 0]}><boxGeometry args={[1.7, 0.12, 0.8]} /><meshStandardMaterial color="#76583b" /></mesh>
          {[-0.65, 0.65].map((x) => <mesh key={x} position={[x, 0.42, 0]}><boxGeometry args={[0.08, 0.8, 0.08]} /><meshStandardMaterial color="#76583b" /></mesh>)}
          <mesh position={[0, 1.15, 0]}><boxGeometry args={[0.7, 0.45, 0.48]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
        </group>
        <group position={[4.5, 0, 2.1]}>
          <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.35, 0.42, 0.12, 12]} /><meshStandardMaterial color="#7b6548" /></mesh>
          <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.08, 0.12, 1.2, 8]} /><meshStandardMaterial color="#876a42" /></mesh>
          <mesh position={[0, 1.95, 0]}><sphereGeometry args={[0.52, 10, 8]} /><meshStandardMaterial color="#34724b" /></mesh>
        </group>
      </group>}

      {/* Window and door markers. */}
      <mesh position={[1.3, 2.05, -3.88]}>
        <boxGeometry args={[2.1, 1.05, 0.05]} />
        <meshStandardMaterial color="#dce6e7" emissive="#6e9aa5" emissiveIntensity={0.16} />
      </mesh>
      {[-0.45, 0, 0.45].map((x) => (
        <mesh key={x} position={[1.3 + x, 2.05, -3.82]}>
          <boxGeometry args={[0.035, 1.05, 0.06]} />
          <meshStandardMaterial color="#58666a" />
        </mesh>
      ))}
      <group position={[-3.65, 1.12, 3.88]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 2.25, 0.08]} />
          <meshStandardMaterial color="#55351f" />
        </mesh>
        <mesh position={[0.38, 0, 0.06]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#d3b45f" metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export function Character({ look, onPosition, streetMode = false, showCrown = false }: { look: CharacterLook; onPosition: (x: number, z: number) => void; streetMode?: boolean; showCrown?: boolean }) {
  const root = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const lastPositionReport = useRef(0);
  const skin = skinPalette[look.skinTone] ?? skinPalette.medium_brown;
  const top = topPalette[look.outfitTop] ?? "#e8ddc8";
  const bottom = bottomPalette[look.outfitBottom] ?? "#26374b";
  const shoes = shoePalette[look.outfitShoes] ?? "#17191d";
  const hair = look.hairColor === "black" ? "#171514" : "#34261f";
  const isFemale = look.gender === "female";
  const scale = Math.max(0.88, Math.min(1.12, look.heightCm / 172));

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((state, delta) => {
    if (!root.current) return;
    const k = keys.current;
    const forward = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0);
    const side = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
    if (forward || side) {
      root.current.position.x += side * delta * 2.1;
      root.current.position.z -= forward * delta * 2.1;
      root.current.position.x = THREE.MathUtils.clamp(root.current.position.x, streetMode ? -8 : -3.35, streetMode ? 8 : 3.35);
      root.current.position.z = THREE.MathUtils.clamp(root.current.position.z, streetMode ? -3.4 : -3.3, streetMode ? 3.4 : 3.25);
      root.current.rotation.y = Math.atan2(side, forward || 0.0001);
      if (state.clock.elapsedTime - lastPositionReport.current >= 0.12) {
        lastPositionReport.current = state.clock.elapsedTime;
        onPosition(Number(root.current.position.x.toFixed(2)), Number(root.current.position.z.toFixed(2)));
      }
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} scale={scale}>
      {/* Stable low-poly character assembled from reusable meshes. */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.38, 0.18, 0.25]} />
        <meshStandardMaterial color={shoes} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <capsuleGeometry args={[0.105, 0.48, 4, 8]} />
        <meshStandardMaterial color={bottom} roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[isFemale ? 0.19 : 0.2, 0.42, 4, 10]} />
        <meshStandardMaterial color={top} roughness={0.8} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.25, 1.02, 0]} rotation={[0, 0, s * -0.08]} castShadow>
          <capsuleGeometry args={[0.065, 0.42, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.49, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.075, 0.16, 8]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.68, 0]} castShadow>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.92} />
      </mesh>
      {look.hairstyle.includes("puff") || look.hairstyle.includes("twist") ? (
        <group position={[0, 1.81, -0.015]}>
          <mesh position={[0, 0.015, 0]} castShadow>
            <sphereGeometry args={[0.17, 12, 10]} />
            <meshStandardMaterial color={hair} roughness={0.98} />
          </mesh>
          <mesh position={[0, 0.14, -0.035]} castShadow>
            <sphereGeometry args={[look.hairstyle.includes("puff") ? 0.16 : 0.19, 12, 10]} />
            <meshStandardMaterial color={hair} roughness={1} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, 1.79, -0.015]} castShadow>
          <sphereGeometry args={[0.168, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={hair} roughness={1} />
        </mesh>
      )}
      <mesh position={[0, 1.68, 0.15]}>
        <boxGeometry args={[0.075, 0.025, 0.025]} />
        <meshStandardMaterial color="#211914" />
      </mesh>
      {showCrown && <group position={[0, 2.02, 0]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.25, 0.035, 0.12]} /><meshStandardMaterial color="#f4c542" metalness={0.35} roughness={0.4} /></mesh>
        {[-0.09, 0, 0.09].map((x) => <mesh key={x} position={[x, 0.055, 0]}><coneGeometry args={[0.045, 0.11, 4]} /><meshStandardMaterial color="#f4c542" metalness={0.35} roughness={0.4} /></mesh>)}
      </group>}
    </group>
  );
}

function RoomScene({ look, onPosition }: { look: CharacterLook; onPosition: (x: number, z: number) => void }) {
  return (
    <>
      <color attach="background" args={["#252b2d"]} />
      <ambientLight intensity={1.55} />
      <directionalLight position={[4, 8, 5]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight args={["#fff1d2", "#7b8067", 1.1]} />
      <RoomFurniture sceneId={look.background === "rich" ? "guzape_mansion_v1" : "nyanya_shared_room_v1"} />
      <Character look={look} onPosition={onPosition} showCrown />
      <Text position={[-3.65, 2.75, 3.72]} rotation={[0, 0, 0]} fontSize={0.14} color="#f4e5b5" anchorX="center">EXIT</Text>
      <Environment preset="apartment" />
    </>
  );
}


type AmbientPedestrianProps = {
  x: number;
  z: number;
  shirt: string;
  trousers: string;
  skin: string;
  hair: string;
  walking?: boolean;
  waving?: boolean;
};

function AmbientPedestrian({ x, z, shirt, trousers, skin, hair, walking = false, waving = false }: AmbientPedestrianProps) {
  const root = useRef<THREE.Group>(null);
  const waveArm = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (root.current && walking) root.current.position.x = x + Math.sin(clock.getElapsedTime() * 0.45 + x) * 0.75;
    if (waveArm.current && waving) waveArm.current.rotation.z = -0.45 - Math.sin(clock.getElapsedTime() * 3.2) * 0.5;
  });

  return (
    <group ref={root} position={[x, 0, z]}>
      <mesh position={[0, 0.63, 0]} castShadow><capsuleGeometry args={[0.14, 0.55, 4, 8]} /><meshStandardMaterial color={shirt} roughness={0.86} /></mesh>
      <mesh position={[0, 1.12, 0]} castShadow><sphereGeometry args={[0.135, 10, 8]} /><meshStandardMaterial color={skin} roughness={0.9} /></mesh>
      <mesh position={[0, 1.19, -0.01]} castShadow><sphereGeometry args={[0.139, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.48]} /><meshStandardMaterial color={hair} roughness={1} /></mesh>
      <mesh position={[-0.07, 0.18, 0]} castShadow><capsuleGeometry args={[0.052, 0.3, 3, 6]} /><meshStandardMaterial color={trousers} /></mesh>
      <mesh position={[0.07, 0.18, 0]} castShadow><capsuleGeometry args={[0.052, 0.3, 3, 6]} /><meshStandardMaterial color={trousers} /></mesh>
      <mesh position={[-0.19, 0.72, 0]} rotation={[0, 0, 0.08]}><capsuleGeometry args={[0.045, 0.28, 3, 6]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh ref={waveArm} position={[0.19, 0.82, 0]} rotation={[0, 0, waving ? -0.9 : -0.08]}><capsuleGeometry args={[0.045, 0.3, 3, 6]} /><meshStandardMaterial color={skin} /></mesh>
      {waving && <mesh position={[0.22, 1.08, 0]}><sphereGeometry args={[0.06, 8, 6]} /><meshStandardMaterial color={skin} /></mesh>}
    </group>
  );
}

function MovingCar({ startX, z, speed, color, roofColor }: { startX: number; z: number; speed: number; color: string; roofColor: string }) {
  const root = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!root.current) return;
    root.current.position.x += speed * delta;
    if (root.current.position.x > 18) root.current.position.x = -18;
    if (root.current.position.x < -18) root.current.position.x = 18;
  });

  return (
    <group ref={root} position={[startX, 0, z]} rotation={[0, speed < 0 ? Math.PI : 0, 0]}>
      <mesh position={[0, 0.36, 0]} castShadow><boxGeometry args={[1.45, 0.42, 0.76]} /><meshStandardMaterial color={color} metalness={0.12} roughness={0.55} /></mesh>
      <mesh position={[-0.05, 0.65, 0]} castShadow><boxGeometry args={[0.76, 0.27, 0.63]} /><meshStandardMaterial color={roofColor} roughness={0.4} /></mesh>
      {[-0.48, 0.48].map((wx) => [-0.39, 0.39].map((wz) => (
        <mesh key={wx + ":" + wz} position={[wx, 0.17, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.09, 10]} /><meshStandardMaterial color="#22252a" roughness={0.95} />
        </mesh>
      )))}
      <mesh position={[0.73, 0.39, 0]}><boxGeometry args={[0.035, 0.12, 0.24]} /><meshStandardMaterial color="#f8e7ae" emissive="#e7be58" emissiveIntensity={0.35} /></mesh>
    </group>
  );
}

function StreetBuilding({ x, z, height, width, color, label }: { x: number; z: number; height: number; width: number; color: string; label: string }) {
  const front = -Math.sign(z) * 2.03;
  const floors = Math.max(1, Math.floor(height / 1.35));
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[width, height, 4]} /><meshStandardMaterial color={color} roughness={0.92} /></mesh>
      {Array.from({ length: floors }, (_, floor) => Array.from({ length: Math.max(2, Math.floor(width / 1.4)) }, (_, index) => {
        const cols = Math.max(2, Math.floor(width / 1.4));
        const wx = (index - (cols - 1) / 2) * (width - 0.6) / cols;
        return <mesh key={floor + ":" + index} position={[wx, 0.72 + floor * 1.28, front]}><boxGeometry args={[0.42, 0.48, 0.045]} /><meshStandardMaterial color={floor === 0 ? "#93b6bd" : "#a9c5ca"} emissive="#355e66" emissiveIntensity={0.12} roughness={0.35} /></mesh>;
      }))}
      <mesh position={[0, 1.12, front - Math.sign(z) * 0.04]}><boxGeometry args={[Math.min(width - 0.5, 2.8), 0.48, 0.12]} /><meshStandardMaterial color="#185e52" roughness={0.75} /></mesh>
      <Text position={[0, 1.12, front - Math.sign(z) * 0.11]} rotation={[0, z > 0 ? Math.PI : 0, 0]} fontSize={0.17} color="#f5efdc" anchorX="center" anchorY="middle">{label}</Text>
    </group>
  );
}

function StreetScene({ look, area, onPosition }: { look: CharacterLook; area: string; onPosition: (x: number, z: number) => void }) {
  const buildings = [
    { x: -13, z: -9, height: 4.8, width: 4.4, color: "#c9b79d", label: "PROVISIONS" },
    { x: -7, z: -9.2, height: 6.2, width: 4.6, color: "#c6c1b3", label: "SHOPPING" },
    { x: -1, z: -9.4, height: 3.9, width: 4.7, color: "#d0a77f", label: "MAMA T'S" },
    { x: 5.5, z: -9.3, height: 5.2, width: 5, color: "#b8c4bf", label: "PHARMACY" },
    { x: 12, z: -9, height: 4.4, width: 4.6, color: "#d2b8a1", label: "SUYA & GRILL" },
    { x: -11, z: 9.3, height: 3.8, width: 5, color: "#d3bba0", label: "SALON" },
    { x: -4, z: 9.5, height: 5.4, width: 5, color: "#c1b9a9", label: "PHONE ACCESSORIES" },
    { x: 3, z: 9.2, height: 6.1, width: 5.1, color: "#c4cbc5", label: "MINI MART" },
    { x: 10.5, z: 9.4, height: 4.3, width: 5.5, color: "#d0af8d", label: "LAUNDRY" },
  ];

  return (
    <>
      <color attach="background" args={["#a9d4ee"]} />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#d7edff", "#9c9072", 1.1]} />
      <directionalLight position={[8, 14, 6]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow><planeGeometry args={[42, 30]} /><meshStandardMaterial color="#c5bca9" roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><planeGeometry args={[36, 8.4]} /><meshStandardMaterial color="#50565b" roughness={0.95} /></mesh>
      <mesh position={[0, 0.09, -4.9]} receiveShadow><boxGeometry args={[36, 0.18, 1.7]} /><meshStandardMaterial color="#b9b3a4" roughness={1} /></mesh>
      <mesh position={[0, 0.09, 4.9]} receiveShadow><boxGeometry args={[36, 0.18, 1.7]} /><meshStandardMaterial color="#b9b3a4" roughness={1} /></mesh>
      {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-16 + i * 2.1, 0.055, 0]}><boxGeometry args={[0.95, 0.035, 0.1]} /><meshStandardMaterial color="#eee9d9" /></mesh>)}
      {buildings.map((building) => <StreetBuilding key={building.label} {...building} />)}
      <group position={[-16, 0, -5.5]}>
        <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.075, 0.09, 2.6, 8]} /><meshStandardMaterial color="#484d52" /></mesh>
        <mesh position={[0.3, 2.55, 0]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.65, 0.08, 0.08]} /><meshStandardMaterial color="#484d52" /></mesh>
        <mesh position={[0.54, 2.45, 0]}><boxGeometry args={[0.25, 0.12, 0.18]} /><meshStandardMaterial color="#f2df9f" emissive="#f2df9f" emissiveIntensity={0.3} /></mesh>
      </group>
      <StreetBuilding x={-15} z={-9} height={4.2} width={3.8} color="#d0b79b" label="CORNER SHOP" />
      <MovingCar startX={-10} z={-1.35} speed={2.2} color="#ba3f37" roofColor="#3b464f" />
      <MovingCar startX={3} z={-1.35} speed={1.5} color="#e2bd45" roofColor="#475b63" />
      <MovingCar startX={9} z={1.45} speed={-1.8} color="#477c65" roofColor="#384b51" />
      <MovingCar startX={-4} z={1.45} speed={-2.5} color="#ece6d8" roofColor="#536778" />
      <AmbientPedestrian x={-8} z={-5.3} shirt="#276f58" trousers="#26364a" skin="#75462f" hair="#181513" walking />
      <AmbientPedestrian x={-3} z={-5.4} shirt="#b64b45" trousers="#182c3e" skin="#8d5a3b" hair="#171514" waving />
      <AmbientPedestrian x={4} z={-5.35} shirt="#e4ba37" trousers="#334b39" skin="#603923" hair="#171514" walking />
      <AmbientPedestrian x={8} z={5.25} shirt="#293d7a" trousers="#d2b88d" skin="#a66e49" hair="#171514" waving />
      <AmbientPedestrian x={-5} z={5.35} shirt="#166b70" trousers="#26374b" skin="#8d5a3b" hair="#171514" walking />
      <AmbientPedestrian x={2} z={5.35} shirt="#87456d" trousers="#302f38" skin="#75462f" hair="#171514" />
      <Character look={look} onPosition={onPosition} streetMode showCrown />
      <Text position={[0, 3.8, -5.4]} rotation={[0, 0, 0]} fontSize={0.38} color="#153c37" anchorX="center">{area.toUpperCase()} · ABUJA</Text>
      <Environment preset="city" />
    </>
  );
}

export default function WorldHome({ look, sceneId, immersive = false, worldScene = "home", area = "Nyanya" }: { look: CharacterLook; sceneId: string; immersive?: boolean; worldScene?: "home" | "street"; area?: string }) {
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const homeTitle = worldScene === "street" ? `${area.toUpperCase()} STREET` : sceneId === "guzape_mansion_v1" ? "GUZAPE MANSION" : "NYANYA SHARED ROOM";

  const positionLabel = useMemo(() => `Room position: ${position.x.toFixed(1)}, ${position.z.toFixed(1)}`, [position]);

  return (
    <section className={immersive ? "relative h-full w-full overflow-hidden bg-[#252b2d] text-white" : "overflow-hidden rounded-3xl border border-slate-700 bg-[#252b2d] text-white shadow-2xl"}>
      {!immersive && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-4 py-3 sm:px-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Abuja Life · Home</p>
          <h1 className="mt-1 text-lg font-black sm:text-xl">{homeTitle}</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">W A S D / Arrow keys to move</div>
      </div>}
      <div className={immersive ? "absolute inset-0 h-full w-full" : "relative h-[520px] w-full sm:h-[620px]"}>
        <Canvas shadows dpr={[1, 1.5]} camera={worldScene === "street" ? { position: [12, 10, 13], fov: 42 } : { position: [7, 7.8, 8], fov: 36 }}>
          <Suspense fallback={null}>
            {worldScene === "street"
              ? <StreetScene look={look} area={area} onPosition={(x, z) => setPosition({ x, z })} />
              : <RoomScene look={look} onPosition={(x, z) => setPosition({ x, z })} />}
            <OrbitControls target={worldScene === "street" ? [0, 0.7, 0] : [0, 0.7, 0]} minDistance={worldScene === "street" ? 9 : 7} maxDistance={worldScene === "street" ? 19 : 13} minPolarAngle={0.35} maxPolarAngle={1.15} enablePan={false} />
          </Suspense>
        </Canvas>
        {!immersive && <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-xs text-slate-200 backdrop-blur">{positionLabel}</div>}
        {!immersive && <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-xs text-slate-200 backdrop-blur">{look.gender === "female" ? "Female character" : "Male character"} · {look.skinTone.replaceAll("_", " ")}</div>}
      </div>
      {!immersive && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-4 py-3 sm:px-6">
        <p className="text-xs leading-5 text-slate-300">Your character and outfit are loaded from saved player data.</p>
        <span className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-black text-slate-950">FIRST PLAYABLE SCENE</span>
      </div>}
    </section>
  );
}
