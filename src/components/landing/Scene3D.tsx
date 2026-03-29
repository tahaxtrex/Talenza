import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import NetworkGraph from './NetworkGraph';

interface Scene3DProps {
  className?: string;
  variant?: 'hero' | 'agents' | 'pipeline';
}

export default function Scene3D({ className = '', variant = 'hero' }: Scene3DProps) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-3, -3, 2]} intensity={0.4} color="#0A66C2" />

          {variant === 'hero' && (
            <NetworkGraph
              nodeCount={30}
              radius={3}
              color="#0A66C2"
              accentColor="#1A7F4B"
              speed={0.25}
            />
          )}

          {variant === 'agents' && (
            <NetworkGraph
              nodeCount={18}
              radius={2}
              color="#9A6B00"
              accentColor="#C5372A"
              speed={0.35}
            />
          )}

          {variant === 'pipeline' && (
            <NetworkGraph
              nodeCount={20}
              radius={2.2}
              color="#0A66C2"
              accentColor="#0855A3"
              speed={0.3}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
