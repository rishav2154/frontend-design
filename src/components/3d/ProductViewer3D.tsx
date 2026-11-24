import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html, 
  Text,
  Float,
  Center,
  RoundedBox
} from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ProductViewer3DProps {
  productType: 'mug' | 'frame' | 'phone' | 'keychain-heart' | 'keychain-circle' | 'keychain-square' | 'keychain-cubes' | 'night-lamp' | 'frame-6x8';
  color?: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  fontFamily?: string;
  imageTransform?: ImageTransform;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-accent rounded-full animate-spin" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Loading 3D Model...</span>
      </div>
    </Html>
  );
}

// Premium Magic Cup with realistic ceramic finish
function MugModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const imageScale = 1.2 * imageTransform.scale;

  // Create curved mug profile using lathe geometry
  const mugProfile = useMemo(() => {
    const points = [];
    // Bottom curve
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.7, 0));
    points.push(new THREE.Vector2(0.75, 0.1));
    // Body curve (slightly wider at top)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const radius = 0.75 + Math.sin(t * Math.PI * 0.3) * 0.08 + t * 0.15;
      points.push(new THREE.Vector2(radius, 0.1 + t * 2.2));
    }
    // Rim curve
    points.push(new THREE.Vector2(0.95, 2.35));
    points.push(new THREE.Vector2(0.92, 2.4));
    return points;
  }, []);

  return (
    <Float speed={1} rotationIntensity={0.03} floatIntensity={0.15}>
      <group ref={meshRef} scale={1.1}>
        {/* Main Mug Body - Lathe geometry for smooth curves */}
        <mesh position={[0, -1.1, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 64]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.12}
            metalness={0.02}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Inner cavity */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.82, 0.72, 2.1, 48, 1, true]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.4}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Coffee surface inside (optional visual) */}
        <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.75, 48]} />
          <meshStandardMaterial color="#2a1810" roughness={0.9} />
        </mesh>
        
        {/* Handle - Proper torus knot look */}
        <group position={[1.05, 0, 0]}>
          {/* Main handle curve */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.5, 0.1, 20, 48, Math.PI * 0.95]} />
            <meshStandardMaterial color={color} roughness={0.12} metalness={0.02} />
          </mesh>
        </group>
        
        {/* Custom Image - curved to fit mug surface */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.2, 0 + imageTransform.y * 0.3, 0.95]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[imageScale, imageScale * 0.9]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              opacity={0.95}
              roughness={0.25}
            />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.7 : 0, 0.95]}
            fontSize={0.12}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.5}
            textAlign="center"
            font="/fonts/inter-bold.woff"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Premium Fibre Photo Frame 
function FrameModel({ 
  color, 
  customImage,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 },
  size = '7x5'
}: { 
  color: string; 
  customImage?: string | null;
  imageTransform?: ImageTransform;
  size?: '7x5' | '6x8';
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
    }
  });

  const imageScale = imageTransform.scale;
  
  // Aspect ratio based on size
  const frameWidth = size === '6x8' ? 2.0 : 2.4;
  const frameHeight = size === '6x8' ? 2.7 : 1.7;
  const borderWidth = 0.25;

  return (
    <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={meshRef} scale={1.2}>
        {/* Back panel */}
        <mesh position={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[frameWidth + 0.1, frameHeight + 0.1, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        
        {/* Frame borders - individual pieces for realistic look */}
        {/* Top border */}
        <mesh position={[0, frameHeight/2 - borderWidth/2, 0]} castShadow>
          <boxGeometry args={[frameWidth, borderWidth, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Bottom border */}
        <mesh position={[0, -frameHeight/2 + borderWidth/2, 0]} castShadow>
          <boxGeometry args={[frameWidth, borderWidth, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Left border */}
        <mesh position={[-frameWidth/2 + borderWidth/2, 0, 0]} castShadow>
          <boxGeometry args={[borderWidth, frameHeight - borderWidth * 2, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Right border */}
        <mesh position={[frameWidth/2 - borderWidth/2, 0, 0]} castShadow>
          <boxGeometry args={[borderWidth, frameHeight - borderWidth * 2, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </mesh>
        
        {/* Inner bevel highlight */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[frameWidth - borderWidth * 2 + 0.05, frameHeight - borderWidth * 2 + 0.05]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.9} />
        </mesh>
        
        {/* Glass cover */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[frameWidth - borderWidth * 2 - 0.1, frameHeight - borderWidth * 2 - 0.1]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent
            opacity={0.1}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
        
        {/* Photo/Custom Image */}
        <mesh 
          position={[imageTransform.x * 0.2, imageTransform.y * 0.2, 0.04]} 
          rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
        >
          <planeGeometry args={[(frameWidth - borderWidth * 2 - 0.15) * imageScale, (frameHeight - borderWidth * 2 - 0.15) * imageScale]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.6} />
          ) : (
            <meshStandardMaterial color="#e5e5e5" roughness={0.8} />
          )}
        </mesh>
        
        {/* Frame Stand - angled back */}
        <mesh position={[0, -frameHeight/2 - 0.15, -0.35]} rotation={[Math.PI / 4.5, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 1.2, 0.06]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

// Premium Phone Cover with realistic details
function PhoneModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
    }
  });

  const imageScale = 1.0 * imageTransform.scale;

  return (
    <Float speed={1} rotationIntensity={0.06} floatIntensity={0.12}>
      <group ref={meshRef} scale={1.4} rotation={[0, Math.PI, 0]}>
        {/* Phone Case Body - with rounded edges */}
        <RoundedBox 
          args={[1.5, 3.1, 0.14]} 
          radius={0.12} 
          smoothness={8}
          position={[0, 0, 0]}
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial 
            color={color} 
            roughness={0.35}
            metalness={0.1}
            envMapIntensity={0.8}
          />
        </RoundedBox>
        
        {/* Raised lip around edge */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[1.55, 3.15, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.15} transparent opacity={0.8} />
        </mesh>
        
        {/* Camera Module Island */}
        <RoundedBox 
          args={[0.65, 0.85, 0.12]} 
          radius={0.08} 
          smoothness={4}
          position={[-0.32, 1.0, -0.13]}
        >
          <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.9} />
        </RoundedBox>
        
        {/* Camera Lens 1 - Main */}
        <group position={[-0.5, 1.2, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.06, 32]} />
            <meshStandardMaterial color="#1a1a2a" roughness={0.05} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
            <meshPhysicalMaterial color="#0a0a15" roughness={0} metalness={1} clearcoat={1} />
          </mesh>
        </group>
        
        {/* Camera Lens 2 */}
        <group position={[-0.18, 1.2, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.06, 32]} />
            <meshStandardMaterial color="#1a1a2a" roughness={0.05} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
            <meshPhysicalMaterial color="#0a0a15" roughness={0} metalness={1} clearcoat={1} />
          </mesh>
        </group>
        
        {/* Camera Lens 3 */}
        <group position={[-0.5, 0.88, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 32]} />
            <meshStandardMaterial color="#1a1a2a" roughness={0.05} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0, -0.025]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 32]} />
            <meshPhysicalMaterial color="#0a0a15" roughness={0} metalness={1} clearcoat={1} />
          </mesh>
        </group>
        
        {/* Flash */}
        <mesh position={[-0.18, 0.88, -0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <meshStandardMaterial color="#fff8e0" roughness={0.2} emissive="#fff8e0" emissiveIntensity={0.15} />
        </mesh>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.15, -0.25 + imageTransform.y * 0.2, -0.08]} 
            rotation={[0, Math.PI, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[imageScale * 1.1, imageScale * 1.4]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.35} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -1.2 : -0.3, -0.08]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.09}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.2}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Heart Shape Keychain - improved heart geometry
function KeychainHeartModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const imageScale = 0.6 * imageTransform.scale;

  // Improved heart shape with smoother curves
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const scale = 0.7;
    shape.moveTo(0, -0.8 * scale);
    shape.bezierCurveTo(0.05 * scale, -0.75 * scale, 0.4 * scale, -0.7 * scale, 0.5 * scale, -0.4 * scale);
    shape.bezierCurveTo(0.6 * scale, -0.15 * scale, 0.55 * scale, 0.2 * scale, 0.4 * scale, 0.4 * scale);
    shape.bezierCurveTo(0.25 * scale, 0.55 * scale, 0.1 * scale, 0.65 * scale, 0, 0.5 * scale);
    shape.bezierCurveTo(-0.1 * scale, 0.65 * scale, -0.25 * scale, 0.55 * scale, -0.4 * scale, 0.4 * scale);
    shape.bezierCurveTo(-0.55 * scale, 0.2 * scale, -0.6 * scale, -0.15 * scale, -0.5 * scale, -0.4 * scale);
    shape.bezierCurveTo(-0.4 * scale, -0.7 * scale, -0.05 * scale, -0.75 * scale, 0, -0.8 * scale);
    return shape;
  }, []);

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={meshRef} scale={2.2}>
        {/* Metal Keyring */}
        <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 16, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Connector loop */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 12]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Heart pendant */}
        <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]} castShadow>
          <extrudeGeometry args={[heartShape, { 
            depth: 0.12, 
            bevelEnabled: true, 
            bevelThickness: 0.03, 
            bevelSize: 0.03,
            bevelSegments: 4
          }]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
        </mesh>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.15, -0.15 + imageTransform.y * 0.15, 0.15]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <circleGeometry args={[imageScale * 0.55, 32]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.3} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.55 : -0.15, 0.15]}
            fontSize={0.06}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.6}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Circle Keychain - with beveled edges
function KeychainCircleModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const imageScale = 0.75 * imageTransform.scale;

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={meshRef} scale={2}>
        {/* Metal Keyring */}
        <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 16, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Connector */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 12]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Main circle body */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 48]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
        </mesh>
        
        {/* Beveled edge ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.5, 0.035, 16, 48]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.25} />
        </mesh>
        
        {/* Front face highlight */}
        <mesh position={[0, 0, 0.052]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 48]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.15, imageTransform.y * 0.15, 0.055]} 
            rotation={[-Math.PI / 2, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <circleGeometry args={[0.38 * imageScale, 48]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.3} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.3 : 0, 0.055]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.06}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.7}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Square Keychain - with rounded corners
function KeychainSquareModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const imageScale = 0.8 * imageTransform.scale;

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={meshRef} scale={2}>
        {/* Metal Keyring */}
        <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 16, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Connector */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 12]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Square body with rounded corners */}
        <RoundedBox 
          args={[0.85, 0.85, 0.1]} 
          radius={0.08} 
          smoothness={4}
          position={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
        </RoundedBox>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.15, imageTransform.y * 0.15, 0.052]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[0.7 * imageScale, 0.7 * imageScale]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.3} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.3 : 0, 0.052]}
            fontSize={0.06}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.75}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Cubes Keychain - 3D rotating photo cube
function KeychainCubesModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      cubeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    }
  });

  const imageScale = 0.65 * imageTransform.scale;

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef} scale={1.8}>
        {/* Metal Keyring */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 16, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Connector chain links */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.15, 12]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.015, 8, 16]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>
        
        {/* Rotating Cube */}
        <group ref={cubeRef} position={[0, 0, 0]}>
          <RoundedBox 
            args={[0.75, 0.75, 0.75]} 
            radius={0.06} 
            smoothness={4}
            castShadow
          >
            <meshStandardMaterial color={color} roughness={0.22} metalness={0.2} />
          </RoundedBox>
          
          {/* Images on cube faces */}
          {texture && (
            <>
              {/* Front */}
              <mesh position={[0, 0, 0.38]}>
                <planeGeometry args={[0.6 * imageScale, 0.6 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Back */}
              <mesh position={[0, 0, -0.38]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.6 * imageScale, 0.6 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Right */}
              <mesh position={[0.38, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.6 * imageScale, 0.6 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Left */}
              <mesh position={[-0.38, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[0.6 * imageScale, 0.6 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Top */}
              <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.6 * imageScale, 0.6 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
            </>
          )}
          
          {/* Custom Text on front if no image */}
          {customText && !texture && (
            <Text
              position={[0, 0, 0.38]}
              fontSize={0.08}
              color={textColor || '#ffffff'}
              anchorX="center"
              anchorY="middle"
              maxWidth={0.6}
              textAlign="center"
            >
              {customText}
            </Text>
          )}
        </group>
      </group>
    </Float>
  );
}

// Night Lamp with LED glow effect
function NightLampModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.12;
    }
  });

  const imageScale = imageTransform.scale;
  const glowColor = color === '#ffffff' ? '#e0f0ff' : color;

  return (
    <Float speed={0.5} rotationIntensity={0.03} floatIntensity={0.08}>
      <group ref={meshRef} scale={1}>
        {/* Base - wooden/plastic look */}
        <mesh position={[0, -1.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.15, 0.35, 48]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.5} />
        </mesh>
        
        {/* Base top plate */}
        <mesh position={[0, -1.7, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 0.08, 48]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.6} />
        </mesh>
        
        {/* LED strip groove */}
        <mesh position={[0, -1.62, 0]}>
          <torusGeometry args={[0.85, 0.03, 8, 48]} />
          <meshStandardMaterial 
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
        
        {/* Acrylic slot in base */}
        <mesh position={[0, -1.55, 0]}>
          <boxGeometry args={[0.15, 0.2, 1.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
        
        {/* Main Acrylic Panel */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 3.2, 0.1]} />
          <meshPhysicalMaterial 
            color={glowColor}
            transparent
            opacity={0.25}
            roughness={0.02}
            metalness={0}
            transmission={0.6}
            thickness={0.5}
            envMapIntensity={0.5}
          />
        </mesh>
        
        {/* Edge glow effect */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[2.45, 3.25, 0.08]} />
          <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.08}
            emissive={glowColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Point lights for glow */}
        <pointLight position={[0, -1.2, 0.8]} intensity={0.6} color={glowColor} distance={4} />
        <pointLight position={[0, -1.2, -0.8]} intensity={0.4} color={glowColor} distance={3} />
        <pointLight position={[0, 1.5, 0]} intensity={0.2} color={glowColor} distance={2} />
        
        {/* Engraved/printed image on acrylic */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.25, 0.2 + imageTransform.y * 0.35, 0.052]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[1.9 * imageScale, 2.5 * imageScale]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              opacity={0.85}
              emissive="#ffffff"
              emissiveIntensity={0.08}
            />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -1.0 : 0.2, 0.052]}
            fontSize={0.14}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

function Scene({ productType, color, customImage, customText, textColor, imageTransform }: ProductViewer3DProps & { imageTransform?: ImageTransform }) {
  const productColor = color || '#ffffff';
  const transform = imageTransform || { x: 0, y: 0, scale: 1, rotation: 0 };

  return (
    <>
      {/* Enhanced Studio Lighting */}
      <ambientLight intensity={0.35} />
      <spotLight 
        position={[5, 8, 5]} 
        angle={0.22} 
        penumbra={1} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <spotLight 
        position={[-5, 5, -5]} 
        angle={0.28} 
        penumbra={1} 
        intensity={0.5}
        color="#ffeedd"
      />
      <pointLight position={[0, 6, 0]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-4, 3, 5]} intensity={0.25} color="#fff5ee" />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Center>
          {productType === 'mug' && (
            <MugModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'frame' && (
            <FrameModel 
              color={productColor} 
              customImage={customImage}
              imageTransform={transform}
              size="7x5"
            />
          )}
          {productType === 'frame-6x8' && (
            <FrameModel 
              color={productColor} 
              customImage={customImage}
              imageTransform={transform}
              size="6x8"
            />
          )}
          {productType === 'phone' && (
            <PhoneModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-heart' && (
            <KeychainHeartModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-circle' && (
            <KeychainCircleModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-square' && (
            <KeychainSquareModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-cubes' && (
            <KeychainCubesModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'night-lamp' && (
            <NightLampModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
        </Center>
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2.2} 
          far={6}
          color="#000000"
        />
        <Environment preset="studio" environmentIntensity={0.6} />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minDistance={3} 
        maxDistance={14}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

export default function ProductViewer3D({ 
  productType, 
  color, 
  customImage, 
  customText, 
  textColor, 
  fontFamily,
  imageTransform
}: ProductViewer3DProps) {
  return (
    <div className="relative h-[340px] w-full min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-muted/30 via-background to-muted/20 sm:h-full sm:min-h-[450px]">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <Canvas
        camera={{ position: [0, 0, 7], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
        shadows
      >
        <Scene 
          productType={productType} 
          color={color} 
          customImage={customImage} 
          customText={customText}
          textColor={textColor}
          imageTransform={imageTransform}
        />
      </Canvas>
    </div>
  );
}
