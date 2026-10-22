/**
 * MelaVerse Nepal — Terrain & Elevation Mathematics (Expanded World v0.2.5)
 * Computes natural Nepali terraced hill heights, grand temple hill elevation,
 * flat sacred Rangoli courtyards, and authoritative structure collisions without invisible barriers.
 */

export function getTerrainHeight(x: number, z: number): number {
  // 1. Flat Central Cultural Core: Rangoli Courtyard, Chautari Plaza, Village Market Street
  // Strictly level (y = 0) so Rangoli and plazas NEVER clip or get buried by terrain
  if (Math.abs(x) < 28 && z > -45 && z < 45) {
    return 0;
  }

  // 2. Grand Elevated Durga Mandir Hill Mound (North Terrace at z = -75)
  // Rises smoothly from z = -50 up to +2.8m at the temple plateau
  const distToMandir = Math.hypot(x, z - (-75));
  if (distToMandir < 22) {
    const t = Math.max(0, 1 - distToMandir / 22);
    // Smooth cosine terraced elevation curve up to +2.8m
    return (1 - Math.cos(t * Math.PI)) * 0.5 * 2.8;
  }

  // 3. North Himalayan Foothills (Beyond Mandir, z < -90)
  if (z < -90) {
    const northDist = -90 - z;
    return Math.min(12.0, northDist * 0.28 + Math.sin(x * 0.08) * 0.8);
  }

  // 4. Far East & Far West Terraced Farmlands (Gradual rolling hills for natural exploration)
  let mound = 0;
  if (Math.abs(x) > 48) {
    const sideDist = Math.abs(x) - 48;
    mound += Math.min(3.2, sideDist * 0.06 + Math.sin(z * 0.08) * 0.4);
  }

  // 5. Far Southern Valley Entrance (z > 55)
  if (z > 55) {
    mound += Math.min(2.5, (z - 55) * 0.06);
  }

  return Math.max(0, mound);
}

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name?: string;
}

export const FESTIVAL_COLLIDERS: CollisionBox[] = [
  // 1. Elevated Mandir Temple Sanctum (Grand North Temple at z = -75)
  { minX: -7.5, maxX: -1.6, minZ: -80, maxZ: -70, name: "mandir_west_wall" },
  { minX: 1.6, maxX: 7.5, minZ: -80, maxZ: -70, name: "mandir_east_wall" },
  { minX: -7.5, maxX: 7.5, minZ: -82, maxZ: -79, name: "mandir_back_wall" },

  // 2. Dashain Tika House 1: Bada Dashain Mula Ghar (Northwest hill at x = -45, z = -45)
  { minX: -51, maxX: -39, minZ: -51, maxZ: -39, name: "tika_house_1" },

  // 3. Dashain Tika House 2: Maiti Ghar (Northeast hill at x = 45, z = -45)
  { minX: 39, maxX: 51, minZ: -51, maxZ: -39, name: "tika_house_2" },

  // 4. Central Village Chautari Sacred Banyan Tree Trunk
  { minX: -1.8, maxX: 1.8, minZ: -1.8, maxZ: 1.8, name: "chautari_banyan_trunk" },

  // 5. Traditional Bamboo Linge Ping Posts (West Meadow at x = -55, z = -10)
  { minX: -58.5, maxX: -51.5, minZ: -12.5, maxZ: -11.0, name: "ping_north_pillar" },
  { minX: -58.5, maxX: -51.5, minZ: -9.0, maxZ: -7.5, name: "ping_south_pillar" },

  // 6. Aama Samuha Gathering Stage (Southeast at x = 42, z = 24)
  { minX: 36, maxX: 48, minZ: 19, maxZ: 26, name: "aama_stage_wall" },

  // 7. Langur Burja Dice Table Pavilion (Southwest at x = -38, z = 18)
  { minX: -42, maxX: -34, minZ: 14, maxZ: 22, name: "langur_burja_pavilion" },

  // 8. Village Market Stalls (Spaced wide along the stone festival street)
  { minX: -16, maxX: -10, minZ: 12, maxZ: 18, name: "chiya_tea_stall" },
  { minX: 10, maxX: 16, minZ: 12, maxZ: 18, name: "sel_roti_stall" },
  { minX: -16, maxX: -10, minZ: -8, maxZ: -2, name: "dhaka_topi_stall" },
  { minX: 10, maxX: 16, minZ: -8, maxZ: -2, name: "changa_kite_stall" },
  { minX: 20, maxX: 28, minZ: -4, maxZ: 2, name: "sanstha_desk" },

  // 9. Natural World Outer Bounds (Generous 240m x 240m exploration border — NO invisible fences in fairground!)
  { minX: -122, maxX: 122, minZ: -118, maxZ: -115, name: "far_north_himalaya_cliff" },
  { minX: -122, maxX: 122, minZ: 115, maxZ: 118, name: "far_south_valley_boundary" },
  { minX: -122, maxX: -119, minZ: -118, maxZ: 118, name: "far_west_terrace_edge" },
  { minX: 119, maxX: 122, minZ: -118, maxZ: 118, name: "far_east_terrace_edge" },
];

export function checkStructureCollision(x: number, z: number, radius: number = 0.55): boolean {
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
