import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";

function SpaceFlight({ onComplete }) {
  const camProgress = useRef(0);

  // Earth model
  const { scene } = useGLTF("/models/earth.glb");
  const earthRef = useRef();

  useFrame((state, delta) => {
    const cam = state.camera;
    if (camProgress.current < 1) {
      camProgress.current += delta * 0.8; // flight speed
      cam.position.z = 40 - 50 * camProgress.current; // move forward
      cam.position.y = 0;
      if (earthRef.current) earthRef.current.rotation.y += 0.002; // rotate earth
    } else {
      onComplete(); // flight finished
    }
  });

  return (
    <>
      <primitive
        ref={earthRef}
        object={scene}
        scale={[20, 5, 20]}
        position={[0, -40, 0]}
      />
      {/* Add lights or stars as needed */}
    </>
  );
}
