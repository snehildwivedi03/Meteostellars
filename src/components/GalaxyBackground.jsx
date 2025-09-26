import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
uniform float u_time;
attribute float a_size;
attribute vec3 a_customColor;
varying vec3 v_color;

void main() {
  v_color = a_customColor;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float angle = u_time * 0.1; // slower rotation
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  modelPosition.xz = rotationMatrix * modelPosition.xz;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
  gl_PointSize = a_size * (100.0 / -viewPosition.z);
}
`;

const fragmentShader = `
varying vec3 v_color;
void main() {
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - smoothstep(0.3, 0.5, strength);
  gl_FragColor = vec4(v_color, strength * 0.2); // lower alpha
}
`;

function Galaxy({
  type = "spiral",
  particleCount = 5000,
  sizeFactor = 10,
  coreColor = "#ffcc99",
  armColor = "#66ccff",
}) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const core = new THREE.Color(coreColor);
    const arm = new THREE.Color(armColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      let x, y, z;

      // Random galaxy patterns
      if (type === "spiral") {
        const radius = Math.random() * sizeFactor;
        const spinAngle = radius * 3;
        const branchAngle = ((i % 4) / 4) * Math.PI * 2;
        x =
          Math.cos(branchAngle + spinAngle) * radius +
          (Math.random() - 0.5) * 0.5;
        y = (Math.random() - 0.5) * 0.1;
        z =
          Math.sin(branchAngle + spinAngle) * radius +
          (Math.random() - 0.5) * 0.5;
      } else if (type === "elliptical") {
        x = (Math.random() - 0.5) * sizeFactor * 1.5;
        y = (Math.random() - 0.5) * sizeFactor * 0.3;
        z = (Math.random() - 0.5) * sizeFactor * 1.5;
      } else if (type === "irregular") {
        x = (Math.random() - 0.5) * sizeFactor * 2;
        y = (Math.random() - 0.5) * sizeFactor * 0.5;
        z = (Math.random() - 0.5) * sizeFactor * 2;
      }

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const mixedColor = core.clone().lerp(arm, Math.random());
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 2 + 1; // smaller particles
    }

    return { positions, colors, sizes };
  }, [particleCount, sizeFactor, type, coreColor, armColor]);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader,
        fragmentShader,
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
  const groupRef = useRef();

  // Pre-generate galaxies with random initial positions, types, and speeds
  const galaxies = useMemo(() => {
    const types = ["spiral", "elliptical", "irregular"];
    const list = [];
    for (let i = 0; i < 8; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      list.push({
        type,
        particleCount: 4000 + Math.floor(Math.random() * 6000),
        size: 5 + Math.random() * 4,
        core: `#${Math.floor(Math.random() * 0xffffff).toString(16)}`,
        arm: `#${Math.floor(Math.random() * 0xffffff).toString(16)}`,
        position: [
          (Math.random() - 0.5) * 60, // x
          (Math.random() - 0.5) * 30, // y
          (Math.random() - 0.5) * 60, // z
        ],
        speed: 0.001 + Math.random() * 0.003, // drift speed
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    galaxies.forEach((g, idx) => {
      // Move each galaxy slowly in a random direction
      g.position[0] += (Math.random() - 0.5) * g.speed;
      g.position[1] += (Math.random() - 0.5) * g.speed * 0.5;
      g.position[2] += (Math.random() - 0.5) * g.speed;

      // Wrap around if galaxy goes too far
      g.position[0] =
        g.position[0] > 30 ? -30 : g.position[0] < -30 ? 30 : g.position[0];
      g.position[1] =
        g.position[1] > 15 ? -15 : g.position[1] < -15 ? 15 : g.position[1];
      g.position[2] =
        g.position[2] > 30 ? -30 : g.position[2] < -30 ? 30 : g.position[2];
    });
  });

  return (
    <group ref={groupRef}>
      {galaxies.map((g, idx) => (
        <group key={idx} position={g.position}>
          <Galaxy
            type={g.type}
            particleCount={g.particleCount}
            sizeFactor={g.size}
            coreColor={g.core}
            armColor={g.arm}
          />
        </group>
      ))}
    </group>
  );
}

export default function GalaxyBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-30">
      {" "}
      {/* faded for less focus */}
      <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
        <ambientLight intensity={0.15} />
        <pointLight position={[50, 50, 50]} intensity={0.6} />
        <GalaxyScene />
      </Canvas>
    </div>
  );
}
