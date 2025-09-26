// src/components/BackgroundStars2.jsx
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- Starfield2 Shaders ---
const starVertexShader2 = `
  attribute float a_size;
  attribute vec3 a_customColor;
  varying vec3 v_color;

  void main() {
    v_color = a_customColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = a_size * (250.0 / -viewPosition.z);
  }
`;

const starFragmentShader2 = `
  varying vec3 v_color;
  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - smoothstep(0.35, 0.55, strength);
    gl_FragColor = vec4(v_color, strength * 0.85);
  }
`;

// --- Galaxy2 Shaders ---
const galaxyVertexShader2 = `
  uniform float u_time;
  attribute float a_size;
  attribute vec3 a_customColor;
  varying vec3 v_color;

  void main() {
    v_color = a_customColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float angle = u_time * 0.08;
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    modelPosition.xy = rotationMatrix * modelPosition.xy;
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = a_size * (90.0 / -viewPosition.z);
  }
`;

const galaxyFragmentShader2 = `
  varying vec3 v_color;
  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - smoothstep(0.25, 0.5, strength);
    gl_FragColor = vec4(v_color, strength * 0.4);
  }
`;

// --- Starfield2 Component (Blue-Purple theme) ---
function Starfield2({ mouse }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const numStars = 12000;
    const positions = new Float32Array(numStars * 3);
    const colors = new Float32Array(numStars * 3);
    const sizes = new Float32Array(numStars);

    const colorChoices = ["#99ccff", "#cc99ff", "#ffffff"]; // bluish + purplish
    const tempColor = new THREE.Color();

    for (let i = 0; i < numStars; i++) {
      const i3 = i * 3;
      const { x, y, z } = new THREE.Vector3(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300
      );
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      tempColor.set(
        colorChoices[Math.floor(Math.random() * colorChoices.length)]
      );
      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

      sizes[i] = Math.random() * 1.5 + 0.7;
    }
    return { positions, colors, sizes };
  }, []);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: starVertexShader2,
        fragmentShader: starFragmentShader2,
        transparent: true,
      }),
    []
  );

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00015;
      const targetX = (mouse.current.x - window.innerWidth / 2) * 0.001;
      const targetY = (window.innerHeight / 2 - mouse.current.y) * 0.001;
      pointsRef.current.position.lerp(
        new THREE.Vector3(targetX, targetY, 0),
        0.05
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

// --- Galaxy2 Component (Nebula style) ---
function Galaxy2({ particleCount = 4000, sizeFactor = 8 }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const inner = new THREE.Color("#ff99cc"); // pinkish
    const outer = new THREE.Color("#6699ff"); // blueish

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * sizeFactor;
      const spinAngle = radius * 2.5;
      const branchAngle = ((i % 5) / 5) * Math.PI * 2;

      positions[i3] =
        Math.cos(branchAngle + spinAngle) * radius +
        (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 2] =
        Math.sin(branchAngle + spinAngle) * radius +
        (Math.random() - 0.5) * 0.5;

      const mixedColor = inner.clone().lerp(outer, Math.random());
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
        vertexShader: galaxyVertexShader2,
        fragmentShader: galaxyFragmentShader2,
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

// --- Multiple Galaxies Scene ---
function GalaxyScene2() {
  const galaxies = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      list.push({
        size: 4 + Math.random() * 5,
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 100 - 120,
        ],
      });
    }
    return list;
  }, []);

  return (
    <group>
      {galaxies.map((g, idx) => (
        <group key={idx} position={g.position}>
          <Galaxy2 sizeFactor={g.size} />
        </group>
      ))}
    </group>
  );
}

// --- Main Exported Component ---
export default function BackgroundStars2() {
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="absolute inset-0 -z-10" onMouseMove={handleMouseMove}>
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        <fog attach="fog" args={["#050814", 50, 200]} />
        <Starfield2 mouse={mouse} />
        <GalaxyScene2 />
      </Canvas>
    </div>
  );
}
