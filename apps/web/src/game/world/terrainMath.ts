/**
 * MelaVerse Nepal — Terrain & Elevation Mathematics
 * Computes realistic Nepali terraced hill heights, temple elevation, and structure collisions.
 */

export function getTerrainHeight(x: number, z: number): number {
  // 1. Mandir Temple Hill (Grand elevated sacred mound at center north)
  const distToMandir = Math.hypot(x - 0, z - (-40));
  if (distToMandir < 16) {
    const t = Math.max(0, 1 - distToMandir / 16);
    // Smooth cosine step to +2.5m elevation
    return (1 - Math.cos(t * Math.PI)) * 0.5 * 2.5;
  }

  // 2. North Himalayan Foothills slope
  if (z < -50) {
    const northDist = -50 - z;
    return Math.min(8.0, northDist * 0.22 + Math.sin(x * 0.12) * 0.5);
  }

  // 3. East & West Terraced Slopes
  let mound = 0;
  if (Math.abs(x) > 22) {
    const sideDist = Math.abs(x) - 22;
    mound += Math.min(2.2, sideDist * 0.08 + Math.sin(z * 0.1) * 0.35);
  }

  // 4. Southern Village Entrance slope
  if (z > 36) {
    mound += Math.min(1.8, (z - 36) * 0.08);
  }

  return Math.max(0, mound);
}

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const FESTIVAL_COLLIDERS: CollisionBox[] = [
  // 1. Mandir Temple Main Sanctum (with open doorway at center front)
  { minX: -7.5, maxX: -1.4, minZ: -45, maxZ: -35 },
  { minX: 1.4, maxX: 7.5, minZ: -45, maxZ: -35 },
  { minX: -7.5, maxX: 7.5, minZ: -47, maxZ: -44 },

  // 2. Dashain Tika House 1 (Mula Ghar)
  { minX: -33, maxX: -23, minZ: -39, maxZ: -31 },

  // 3. Dashain Tika House 2 (Purbiya Ghar)
  { minX: 23, maxX: 33, minZ: -39, maxZ: -31 },

  // 4. Chiya Tea Stall
  { minX: -18, maxX: -12, minZ: 8, maxZ: 14 },

  // 5. Sel Roti Stall
  { minX: 12, maxX: 18, minZ: 8, maxZ: 14 },

  // 6. Dhaka Topi Stall
  { minX: -18, maxX: -12, minZ: -4, maxZ: 2 },

  // 7. Changa Kite Stall
  { minX: 12, maxX: 18, minZ: -4, maxZ: 2 },

  // 8. Sanstha Committee Desk
  { minX: 22, maxX: 30, minZ: -5, maxZ: 1 },

  // 9. Central Chautari Banyan Tree Trunk
  { minX: -1.6, maxX: 1.6, minZ: -6.6, maxZ: -3.4 },

  // 10. Outer Fencing Perimeter (Keep players inside festival boundary)
  { minX: -52, maxX: 52, minZ: -66, maxZ: -64 }, // North Fence
  { minX: -52, maxX: 52, minZ: 52, maxZ: 54 },   // South Fence
  { minX: -54, maxX: -52, minZ: -66, maxZ: 54 }, // West Fence
  { minX: 52, maxX: 54, minZ: -66, maxZ: 54 },   // East Fence
];

export function checkStructureCollision(x: number, z: number, radius: number = 0.5): boolean {
  for (const box of FESTIVAL_COLLIDERS) {
    if (
      x + radius > box.minX &&
      x - radius < box.maxX &&
      z + radius > box.minZ &&
      z - radius < box.maxZ
    ) {
      return true;
    }
  }
  return false;
}
