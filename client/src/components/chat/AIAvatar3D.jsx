import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, useGLTF, MeshWobbleMaterial } from '@react-three/drei';
import { useChatStore } from '../../stores/chatStore';
import * as THREE from 'three';

// The actual 3D character component
const BotHead = () => {
  const { isThinking, isStreaming, avatarEmotion, avatarTheme } = useChatStore();
  const groupRef = useRef();
  const mouthRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const headRef = useRef();

  // Animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Default gentle floating & looking around
    let targetRotationX = Math.sin(t / 4) / 8;
    let targetRotationY = Math.cos(t / 4) / 8;
    let mouthScaleY = 0.1;
    let eyeScaleY = 1;

    // React to states
    if (isThinking) {
      targetRotationX = -0.3; // Look up
      targetRotationY = Math.sin(t * 2) * 0.2; // Shake head slightly
      eyeScaleY = 0.8 + Math.sin(t * 10) * 0.1; // Squinting
    } else if (isStreaming) {
      targetRotationX = Math.sin(t * 2) * 0.1; // Nodding while talking
      mouthScaleY = 0.2 + Math.abs(Math.sin(t * 15)) * 0.8; // Fast mouth movement
      eyeScaleY = 1;
    } else if (avatarEmotion === 'happy') {
      targetRotationX = 0.1; // Look slightly down
      eyeScaleY = 0.2; // Happy eyes (closed/squinting)
      mouthScaleY = 0.5; // Smiling mouth
    } else if (avatarEmotion === 'concerned') {
      targetRotationX = 0.2;
      eyeScaleY = 1.2; // Wide eyes
    }

    // Smoothly interpolate rotations
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
      
      // Follow mouse slightly
      const mouseX = (state.pointer.x * Math.PI) / 4;
      const mouseY = (state.pointer.y * Math.PI) / 4;
      groupRef.current.rotation.y += (mouseX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-mouseY - groupRef.current.rotation.x) * 0.05;
    }

    // Smoothly interpolate mouth scale
    if (mouthRef.current) {
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, mouthScaleY, 0.2);
    }

    // Smoothly interpolate eyes scale (blinking logic)
    if (leftEyeRef.current && rightEyeRef.current) {
      // Occasional blink
      if (!isThinking && Math.random() > 0.99) {
        eyeScaleY = 0.1; // Blink
      }
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, eyeScaleY, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, eyeScaleY, 0.3);
    }
  });

  // Dynamic colors based on theme
  const colors = useMemo(() => {
    switch (avatarTheme) {
      case 'jarvis': return { head: '#eab308', eyes: '#22c55e', mouth: '#000000' }; // yellow/green
      case 'cyber': return { head: '#0f172a', eyes: '#ec4899', mouth: '#06b6d4' }; // dark/neon
      case 'minimal': return { head: '#ffffff', eyes: '#000000', mouth: '#000000' }; // white/black
      case 'anime': return { head: '#fbcfe8', eyes: '#8b5cf6', mouth: '#ec4899' }; // pink/purple
      case 'male': return { head: '#3b82f6', eyes: '#ffffff', mouth: '#1e3a8a' }; // blue/white
      case 'female':
      default: return { head: '#8b5cf6', eyes: '#ffffff', mouth: '#4c1d95' }; // purple/white
    }
  }, [avatarTheme]);

  return (
    <group ref={groupRef} dispose={null}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* Main Head */}
        <mesh ref={headRef} castShadow receiveShadow>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial 
            color={colors.head} 
            roughness={0.2} 
            metalness={0.8} 
            envMapIntensity={2} 
          />
        </mesh>

        {/* Outer Glass Shell (Holographic effect) */}
        <mesh>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.9} 
            opacity={1} 
            metalness={0} 
            roughness={0} 
            ior={1.5} 
            thickness={0.5} 
            specularIntensity={1} 
            transparent 
          />
        </mesh>

        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.5, 0.3, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.15, 0.3, 16, 16]} />
          <meshStandardMaterial color={colors.eyes} emissive={colors.eyes} emissiveIntensity={2} toneMapped={false} />
        </mesh>

        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.5, 0.3, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.15, 0.3, 16, 16]} />
          <meshStandardMaterial color={colors.eyes} emissive={colors.eyes} emissiveIntensity={2} toneMapped={false} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.4, 1.4]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.08, 0.6, 16, 16]} />
          <meshStandardMaterial color={colors.mouth} />
        </mesh>

        {/* Headphone/Ears */}
        <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>

      </Float>
    </group>
  );
};

const AIAvatar3D = () => {
  return (
    <div className="w-full h-full relative cursor-crosshair flex items-center justify-center">
      {/* Fallback loading state could go here */}
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={2} 
          castShadow 
          shadow-mapSize={1024} 
        />
        <pointLight position={[-5, 0, 5]} intensity={1} color="#4f46e5" />
        <spotLight 
          position={[0, 5, 5]} 
          angle={0.5} 
          penumbra={1} 
          intensity={2} 
          castShadow 
        />

        {/* The Avatar */}
        <BotHead />

        {/* Environment Reflections */}
        <Environment preset="city" />

        {/* Soft shadow underneath */}
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2} 
          far={4} 
        />
      </Canvas>
    </div>
  );
};

export default AIAvatar3D;
