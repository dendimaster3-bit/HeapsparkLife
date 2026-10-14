/** A simple low-poly car (body, cabin, 4 wheels). Front is +z. */
import { forwardRef } from 'react';
import type * as THREE from 'three';
import { Box, Cyl } from '../kit';

export const Car = forwardRef<THREE.Group, { color?: string; position?: [number, number, number]; rotation?: [number, number, number] }>(
  ({ color = '#ef4444', ...rest }, ref) => (
    <group ref={ref} {...rest}>
      <Box size={[0.7, 0.28, 1.4]} position={[0, 0.3, 0]} color={color} />
      <Box size={[0.62, 0.24, 0.75]} position={[0, 0.55, -0.08]} color="#bfdbfe" />
      {[-0.36, 0.36].flatMap((x) =>
        [-0.45, 0.45].map((z) => (
          <Cyl key={`${x}${z}`} d={0.3} h={0.12} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]} color="#111827" />
        )),
      )}
    </group>
  ),
);
