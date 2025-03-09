"use client";

import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useSpring, animated, a } from "@react-spring/three";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

function HearthModel({ points, currentKey }) {
  const { scene } = useGLTF("/Heart.glb");
  const brainRef = useRef();

  const { camera } = useThree();

  const [{ rotation }, setRotation] = useSpring(() => ({
    rotation: [0, 0, 0], // Default rotation (brain at initial orientation)
    config: { mass: 1, tension: 1, friction: 30 }, // Adjusted for slower animation
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
      console.log(camera.position, targetPosition, currentPosition);
      currentPosition.copy(camera.position); // Copy current camera position

      currentPosition.lerp(targetPosition.current, 0.03); // 0.05 is the speed factor

      // Update camera position
      camera.position.copy(currentPosition);

      // If the camera is close enough to the target, stop the animation
      if (camera.position.distanceTo(targetPosition.current) < 0.01) {
        setIsResetting(false); // Stop resetting once close enough
      }
    }
  });

  useEffect(() => {
    rotateInterval();
  }, [currentKey]);

  const rotateInterval = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    resetCamera();

    setTimeout(() => {
      console.log("Rotating to point:", points[currentKey]);
      rotateToPoint(points[currentKey].x, points[currentKey].y, points[currentKey].z);
    }, 200)
  }

  const handleModelClick = (event) => {
    event.stopPropagation(); // Prevents unwanted interactions
    const { x, y, z } = event.point; // Get the clicked 3D coordinates

    console.log("Clicked at:", { x, y, z }); // Log XYZ position

    setClickedPoints([...clickedPoints, { x, y, z }]);
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
        <a.group position={[0, -0.8, 0]}>
          <primitive object={scene} scale={0.033} onClick={handleModelClick} />
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

export default HearthModel;
