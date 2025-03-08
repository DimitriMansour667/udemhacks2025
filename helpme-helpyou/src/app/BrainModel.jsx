"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef } from "react";

const points = [
  { position: [1.2, 2.1, 0.5], info: "Frontal lobe: Reasoning & problem-solving" },
  { position: [-1.0, 1.8, -0.3], info: "Occipital lobe: Vision processing" }
];

function BrainModel() {
  const { scene } = useGLTF("/Brain.glb");
const brainRef = useRef();

  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <OrbitControls enableZoom={true} />

      {/* Wrapper group to recenter the model */}
      <group ref={brainRef} position={[0, -1, -0.3]}>
        <primitive object={scene} scale={0.01} />
      </group>
    </Canvas>
  );
}

export default BrainModel;
