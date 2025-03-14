"use client";

import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useSpring, animated, a } from "@react-spring/three";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { Exo_2 } from "next/font/google";

function LungModel({ points, currentKey, historyIndex }) {
  const { scene } = useGLTF("/Lungs.glb");
  const brainRef = useRef();

  const { camera } = useThree();

  const [{ rotation }, setRotation] = useSpring(() => ({
    rotation: [0, 0, 0], // Default rotation (brain at initial orientation)
    config: { mass: 1, tension: 60, friction: 12 }, // Adjusted for slower animation
  }));

  // Flag to indicate when camera reset should happen
  const [isResetting, setIsResetting] = useState(false);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 4));

  const resetCamera = () => {
    setIsResetting(true); // Start the reset process
  };

  useFrame(() => {
    if (isResetting) {
      // If the current camera position is not the target, animate it towards the target

      const currentPosition = new THREE.Vector3(0, 0, 0);
      currentPosition.copy(camera.position); // Copy current camera position

      currentPosition.lerp(targetPosition.current, 0.05); // 0.05 is the speed factor

      // Update camera position
      camera.position.copy(currentPosition);

      // If the camera is close enough to the target, stop the animation
      if (camera.position.distanceTo(targetPosition.current) < 0.025) {
        setIsResetting(false); // Stop resetting once close enough
      }
    }
  });

  useEffect(() => {
    rotateInterval();
  }, [currentKey, historyIndex]);

  const rotateInterval = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    resetCamera();

    setTimeout(() => {
      rotateToPoint(points[currentKey].x, points[currentKey].y, points[currentKey].z);
    }, 200)
  }

  const handleModelClick = (event) => {
    event.stopPropagation(); // Prevents unwanted interactions
  };

  const rotateToPoint = (x, y, z) => {
    if (!brainRef.current) return;

    const targetDirection = new THREE.Vector3(x, y, z).normalize();

    const cameraDirection = new THREE.Vector3(0, 0, 1)

    const rotationAxis = new THREE.Vector3().crossVectors(targetDirection, cameraDirection);
    if (rotationAxis.length() === 0) return; // Avoid zero-axis rotation

    let angle = Math.acos(targetDirection.dot(cameraDirection)); // Angle in radians

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(rotationAxis.normalize(), angle);

    const targetEuler = new THREE.Euler().setFromQuaternion(quaternion);

    setRotation({ rotation: [targetEuler.x, targetEuler.y, targetEuler.z] });
  };

  return (
    <>
      {/* Wrapper group to recenter the model */}
      <a.group ref={brainRef} position={[0, 0, 0]} rotation={rotation} scale={1}>
        {/* <a.group ref={brainRef} position={[0, -1, -0.3]} rotation={rotation}> */}
        <a.group position={[-0.83, -0.67, -0.28]} rotation={[Math.PI / 2, 0, 0, ]}>
          <primitive object={scene} scale={0.42} onClick={handleModelClick} />
        </a.group>
        {Object.entries(points).map(([mkey, point], index) => (
          <mesh key={index} position={[point.x, point.y, point.z]}>
            <sphereGeometry args={[0.03, 16, 16]} /> {/* Small Sphere */}
            <meshStandardMaterial color={currentKey === mkey ? "red" : "white"} />
          </mesh>
        ))}
      </a.group>
    </>
  );
}

export default LungModel;
