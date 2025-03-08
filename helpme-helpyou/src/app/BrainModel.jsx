"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three";

function BrainModel({ points }) {
  const { scene } = useGLTF("/Brain.glb");
  const brainRef = useRef();
  const [i, setI] = useState(0);

  const [{ rotation }, setRotation] = useSpring(() => ({
    rotation: [0, 0, 0], // Default rotation (brain at initial orientation)
    config: { mass: 1, tension: 180, friction: 12 },
  }));

  useEffect(() => {
    setTimeout(rotateInterval, 3000);
  }, [i]);

  const rotateInterval = () => {
    console.log("Rotating to point:", points[i]);
    rotateToPoint(points[i].x, points[i].y, points[i].z);
    setI((i + 1) % points.length);
  }

  const handleModelClick = (event) => {
    event.stopPropagation(); // Prevents unwanted interactions
    const { x, y, z } = event.point; // Get the clicked 3D coordinates

    console.log("Clicked at:", { x, y, z }); // Log XYZ position

    // Optionally store the points in state
    setClickedPoints([...clickedPoints, { x, y, z }]);
  };

  // Method to rotate the model to face a point (x, y, z)
  const rotateToPoint = (x, y, z) => {
    if (!brainRef.current) return;

    // Get the camera position (static position here)
    const cameraPosition = new THREE.Vector3(0, 0, 4); // Camera position (assumed)

    // The target point is relative to the brain's initial position (origin)
    const targetPoint = new THREE.Vector3(x, y, z); // Relative point (e.g., (1, 1, 1))

    // Calculate the direction vector from the brain's center to the camera
    const directionToCamera = cameraPosition.sub(new THREE.Vector3(0, 0, 0)).normalize();

    // Calculate the direction vector from the brain's center to the target point
    const directionToTarget = targetPoint.sub(new THREE.Vector3(0, 0, 0)).normalize();

    // Calculate the angle between the target direction and camera direction
    const angle = Math.acos(directionToCamera.dot(directionToTarget));

    // To make the target point align between the brain's center and the camera, we need to calculate
    // the rotation axis, which is perpendicular to both directionToCamera and directionToTarget.
    const rotationAxis = new THREE.Vector3()
      .crossVectors(directionToCamera, directionToTarget)
      .normalize();

    // Now apply the rotation to the brain
    const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
    brainRef.current.quaternion.multiplyQuaternions(quaternion, new THREE.Quaternion(1, 0, 0, 0));

    // Update rotation using the quaternion
    const newRotation = brainRef.current.rotation.clone();
    setRotation({ rotation: [newRotation.x, newRotation.y, newRotation.z] });
  };

  return (
    <>
      {/* Wrapper group to recenter the model */}
        <a.group ref={brainRef} position={[0, 0, 0]} rotation={rotation}>
        {/* <a.group ref={brainRef} position={[0, -1, -0.3]} rotation={rotation}> */}
        <a.group position={[0, -1, -0.3]}>
        <primitive object={scene} scale={0.0098} onClick={handleModelClick} />
      </a.group>
        {points.map((point, index) => (

          <mesh key={index} position={[point.x, point.y, point.z]}>
          {/* <mesh key={index} position={[point.x, point.y + 1, point.z + 0.3]}> */}
            <sphereGeometry args={[0.03, 16, 16]} /> {/* Small Sphere */}
            <meshStandardMaterial color={index==i ? "red" : "white"} />
          </mesh>
        ))}
      </a.group>
    </>
  );
}

export default BrainModel;
