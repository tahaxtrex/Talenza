import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NetworkGraphProps {
  nodeCount?: number;
  radius?: number;
  color?: string;
  accentColor?: string;
  speed?: number;
}

export default function NetworkGraph({
  nodeCount = 24,
  radius = 2.5,
  color = '#0A66C2',
  accentColor = '#1A7F4B',
  speed = 0.3,
}: NetworkGraphProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, connections, dummy, nodeColors } = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const connections: number[] = [];
    const dummy = new THREE.Object3D();
    const nodeColors: Float32Array = new Float32Array(nodeCount * 3);

    // Generate node positions on a sphere-ish distribution
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = radius * (0.7 + Math.random() * 0.3);
      positions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );

      // Assign colors - mix primary and accent
      const c = new THREE.Color(Math.random() > 0.7 ? accentColor : color);
      nodeColors[i * 3] = c.r;
      nodeColors[i * 3 + 1] = c.g;
      nodeColors[i * 3 + 2] = c.b;
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < radius * 1.1) {
          connections.push(i, j);
        }
      }
    }

    return { positions, connections, dummy, nodeColors };
  }, [nodeCount, radius, color, accentColor]);

  // Line geometry
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(connections.length * 3);
    for (let i = 0; i < connections.length; i++) {
      const pos = positions[connections[i]];
      linePositions[i * 3] = pos.x;
      linePositions[i * 3 + 1] = pos.y;
      linePositions[i * 3 + 2] = pos.z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [connections, positions]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !nodesRef.current) return;
    const t = clock.getElapsedTime() * speed;

    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;

    // Animate node positions slightly
    for (let i = 0; i < nodeCount; i++) {
      const base = positions[i];
      const offset = Math.sin(t * 2 + i) * 0.08;
      dummy.position.set(
        base.x + offset,
        base.y + Math.cos(t * 1.5 + i * 0.5) * 0.08,
        base.z
      );
      const s = 0.06 + Math.sin(t * 3 + i * 0.7) * 0.02;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      nodesRef.current.setMatrixAt(i, dummy.matrix);
    }
    nodesRef.current.instanceMatrix.needsUpdate = true;

    // Update line positions
    if (linesRef.current) {
      const posAttr = linesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < connections.length; i++) {
        const idx = connections[i];
        const base = positions[idx];
        const offset = Math.sin(t * 2 + idx) * 0.08;
        arr[i * 3] = base.x + offset;
        arr[i * 3 + 1] = base.y + Math.cos(t * 1.5 + idx * 0.5) * 0.08;
        arr[i * 3 + 2] = base.z;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </instancedMesh>

      {/* Connections */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.15} />
      </lineSegments>

      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.3}
          roughness={0}
          metalness={1}
        />
      </mesh>
    </group>
  );
}
