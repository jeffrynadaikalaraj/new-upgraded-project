import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, useGLTF } from '@react-three/drei';
import { useChatStore } from '../../stores/chatStore';
import * as THREE from 'three';

// --- Error Boundary to prevent crashes if URL is dead ---
class AvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    console.error("3D Avatar Failed to load:", error);
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.2, 64, 64]} />
            <meshStandardMaterial color="#fca5a5" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
      );
    }
    return this.props.children;
  }
}

const AvatarModel = () => {
  const { isThinking, isStreaming } = useChatStore();
  const groupRef = useRef();
  const [headMesh, setHeadMesh] = useState(null);
  
  // Use CloudFront CDN to bypass strict DNS blocks
  const avatarUrl = 'https://d1a370nemizbjq.cloudfront.net/06a9d701-fa89-4b6e-827b-232d30f36f6d.glb';
  const { scene } = useGLTF(avatarUrl);
  
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

    let targetRotationX = 0.1;
    let targetRotationY = 0;
    let targetMouthOpen = 0;

    if (isThinking) {
      targetRotationX = -0.15; 
      targetRotationY = Math.sin(t * 1.5) * 0.1; 
    } else if (isStreaming) {
      targetRotationX = Math.sin(t * 3) * 0.05 + 0.1; 
      targetMouthOpen = 0.5 + Math.sin(t * 20) * 0.5; 
    }

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
    }
    
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
        
        <AvatarErrorBoundary>
          <React.Suspense fallback={null}>
            <AvatarModel />
          </React.Suspense>
        </AvatarErrorBoundary>
        
        <Environment preset="city" />
        <ContactShadows position={[0, -1.8, 0]} opacity={0.5} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
};

export default AIAvatar3D;
