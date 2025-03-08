"use client";

import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three";

function BrainModel({ points }) {
  const { scene } = useGLTF("/Brain.glb");
  const brainRef = useRef();
  const [i, setI] = useState(-1);

  const [{ rotation }, setRotation] = useSpring(() => ({
    rotation: [0, 0, 0], // Default rotation (brain at initial orientation)
    config: { mass: 10, tension: 180, friction: 120 },
  }));

  useEffect(() => {
    setTimeout(rotateInterval, 3000);
  }, [i]);

  const rotateInterval = () => {
    setRotation({ rotation: [0, 0, 0] });
    setTimeout(() => {
      console.log("Rotating to point:", points[i]);
      rotateToPoint(points[i + 1].x, points[i + 1].y, points[i + 1].z);
      setI((i + 1) % points.length);
    }, 200)
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

    // Step 1: Compute normalized direction to the target point
    const targetDirection = new THREE.Vector3(x, y, z).normalize();

    // Step 2: Compute normalized direction to the camera
    const cameraDirection = new THREE.Vector3(0, 0, 1)

    // Step 3: Compute rotation axis (cross product)
    const rotationAxis = new THREE.Vector3().crossVectors(targetDirection, cameraDirection);
    if (rotationAxis.length() === 0) return; // Avoid zero-axis rotation

    // Step 4: Compute rotation angle (dot product and arccos)
    let angle = Math.acos(targetDirection.dot(cameraDirection)); // Angle in radians

    // Step 5: Create quaternion rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(rotationAxis.normalize(), angle);

    // Step 6: Convert quaternion to Euler angles
    const targetEuler = new THREE.Euler().setFromQuaternion(quaternion);

    // Step 7: Animate the rotation smoothly
    setRotation({ rotation: [targetEuler.x, targetEuler.y, targetEuler.z] });
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
