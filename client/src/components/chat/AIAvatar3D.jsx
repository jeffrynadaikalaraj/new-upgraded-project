import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, useGLTF } from '@react-three/drei';
import { useChatStore } from '../../stores/chatStore';
import * as THREE from 'three';

const AvatarModel = () => {
  const { isThinking, isStreaming } = useChatStore();
  const groupRef = useRef();
  const [headMesh, setHeadMesh] = useState(null);
  
  // Load a realistic human face (ReadyPlayerMe standard avatar)
  const { scene } = useGLTF('https://models.readyplayer.me/64fcb8332a4e21fc121b6d17.glb');
  
  useEffect(() => {
    if (scene) {
      scene.traverse((node) => {
        if (node.isMesh && node.morphTargetDictionary) {
          if (node.morphTargetDictionary['mouthOpen'] !== undefined) {
            setHeadMesh(node);
          }
        }
      });
    }
  }, [scene]);

  // Animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Default gentle floating / breathing
    let targetRotationX = 0.1; // slight tilt down
    let targetRotationY = 0;
    let targetMouthOpen = 0;

    // React to states (Mouse tracking removed)
    if (isThinking) {
      targetRotationX = -0.15; // Look up
      targetRotationY = Math.sin(t * 1.5) * 0.1; // Gentle head shake
    } else if (isStreaming) {
      targetRotationX = Math.sin(t * 3) * 0.05 + 0.1; // Slight nodding
      targetMouthOpen = 0.5 + Math.sin(t * 20) * 0.5; // Fast mouth movement (simulated talking)
    }

    // Smoothly interpolate rotations (No mouse tracking)
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
    }
    
    // Animate jaw/mouth if the model has a mouthOpen morph target
    if (headMesh && headMesh.morphTargetDictionary) {
      const jawIndex = headMesh.morphTargetDictionary['mouthOpen'];
      if (jawIndex !== undefined) {
        headMesh.morphTargetInfluences[jawIndex] = THREE.MathUtils.lerp(
           headMesh.morphTargetInfluences[jawIndex], 
           targetMouthOpen, 
           0.3
        );
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, -1.6, 0]} scale={2.2}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.05}>
         <primitive object={scene} />
      </Float>
    </group>
  );
};

const AIAvatar3D = () => {
  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
      <Canvas shadows camera={{ position: [0, 0, 1.2], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} castShadow />
        <pointLight position={[-5, 0, 5]} intensity={1} color="#4f46e5" />
        
        <AvatarModel />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
};

// Preload the model to avoid pop-in
useGLTF.preload('https://models.readyplayer.me/64fcb8332a4e21fc121b6d17.glb');

export default AIAvatar3D;
