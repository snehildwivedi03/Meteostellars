import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- Starfield Shaders ---
const starVertexShader = `
  attribute float a_size;
  attribute vec3 a_customColor;
  varying vec3 v_color;

  void main() {
    v_color = a_customColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = a_size * (300.0 / -viewPosition.z);
  }
`;

const starFragmentShader = `
  varying vec3 v_color;
  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - smoothstep(0.4, 0.5, strength);
    gl_FragColor = vec4(v_color, strength * 0.7);
  }
`;

// --- Galaxy Shaders ---
const galaxyVertexShader = `
  uniform float u_time;
  attribute float a_size;
  attribute vec3 a_customColor;
  varying vec3 v_color;

  void main() {
    v_color = a_customColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float angle = u_time * 0.1;
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    modelPosition.xz = rotationMatrix * modelPosition.xz;
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = a_size * (100.0 / -viewPosition.z);
  }
`;

const galaxyFragmentShader = `
  varying vec3 v_color;
  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - smoothstep(0.3, 0.5, strength);
    gl_FragColor = vec4(v_color, strength * 0.3);
  }
`;

// --- Starfield Component (Interactive) ---
function Starfield({ mouse }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const numStars = 15000;
    const positions = new Float32Array(numStars * 3);
    const colors = new Float32Array(numStars * 3);
    const sizes = new Float32Array(numStars);
    const baseColor = new THREE.Color("#ffffff");

    for (let i = 0; i < numStars; i++) {
      const i3 = i * 3;
      const { x, y, z } = new THREE.Vector3(
        (Math.random() - 0.5) * 250,
        (Math.random() - 0.5) * 250,
        (Math.random() - 0.5) * 250
      );
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      colors[i3] = baseColor.r;
      colors[i3 + 1] = baseColor.g;
      colors[i3 + 2] = baseColor.b;
      sizes[i] = 1.0;
    }
    return { positions, colors, sizes };
  }, []);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true,
      }),
    []
  );

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
      const targetX = (mouse.current.x - window.innerWidth / 2) * 0.001;
      const targetY = (window.innerHeight / 2 - mouse.current.y) * 0.001;
      pointsRef.current.position.lerp(
        new THREE.Vector3(targetX, targetY, 0),
        0.06 // Increased this value from 0.035 for faster response
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-a_customColor"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-a_size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
}

// --- Galaxy Components (Decorative) ---
function Galaxy({ particleCount = 5000, sizeFactor = 10 }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const core = new THREE.Color("#ffcc99");
    const arm = new THREE.Color("#66ccff");

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * sizeFactor;
      const spinAngle = radius * 3;
      const branchAngle = ((i % 4) / 4) * Math.PI * 2;
      positions[i3] =
        Math.cos(branchAngle + spinAngle) * radius +
        (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[i3 + 2] =
        Math.sin(branchAngle + spinAngle) * radius +
        (Math.random() - 0.5) * 0.5;
      const mixedColor = core.clone().lerp(arm, Math.random());
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
      sizes[i] = Math.random() * 2 + 1;
    }
    return { positions, colors, sizes };
  }, [particleCount, sizeFactor]);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms: { u_time: { value: 0 } },
        transparent: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (pointsRef.current)
      pointsRef.current.material.uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-a_customColor"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-a_size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
}

function GalaxyScene() {
  const galaxies = useMemo(() => {
    const list = [];
    for (let i = 0; i < 8; i++) {
      list.push({
        size: 5 + Math.random() * 4,
        position: [
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 80 - 100,
        ],
      });
    }
    return list;
  }, []);

  return (
    <group>
      {galaxies.map((g, idx) => (
        <group key={idx} position={g.position}>
          <Galaxy sizeFactor={g.size} />
        </group>
      ))}
    </group>
  );
}

// --- Main Exported Component ---
export default function BackgroundStars() {
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="absolute inset-0 -z-10" onMouseMove={handleMouseMove}>
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        <fog attach="fog" args={["#0a0f1f", 50, 200]} />
        <Starfield mouse={mouse} />
        <GalaxyScene />
      </Canvas>
    </div>
  );
}
