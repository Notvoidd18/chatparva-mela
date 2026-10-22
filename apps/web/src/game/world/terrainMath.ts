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

  // 2a. Grand Ceremonial Stone Staircase Corridor (|x| <= 4.5, z between -51 and -69)
  // Carve a smooth foundation under the stone steps so green terrain never clips through the stairs
  if (Math.abs(x) <= 4.5 && z <= -51 && z >= -69) {
    const tStairs = (-51 - z) / 18;
    return Math.max(0, tStairs * 2.65);
  }

  // 2b. Grand Elevated Durga Mandir Hill Mound (North Terrace at z = -75)
  // Rises smoothly from z = -49 up to a flat ceremonial plateau (+2.8m)
  const distToMandir = Math.hypot(x, z - (-75));
  if (distToMandir < 26) {
    if (distToMandir <= 18) {
      return 2.8; // Level plateau under the temple sanctum and courtyard
    }
    const t = (26 - distToMandir) / 8;
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
  // 1. Elevated Mandir Temple Building & Inner Sanctum (Grand North Temple at z = -75)
  // Devotees pray, offer flowers, and ring the brass bell from the front portico (z = -70.8 to -68.0);
  // solid temple collider blocks walking through walls, altar, or inside the temple building
  { minX: -3.8, maxX: 3.8, minZ: -78.8, maxZ: -71.4, name: "durga_mandir_sanctum" },
  { minX: 1.8, maxX: 2.6, minZ: -69.8, maxZ: -69.2, name: "mandir_dan_peti" },

  // 2. Dashain Tika House 1: Bada Dashain Mula Ghar (Northwest at x = -28, z = -35)
  { minX: -32.5, maxX: -23.5, minZ: -39.0, maxZ: -33.5, name: "tika_house_1" },

  // 3. Dashain Tika House 2: Maiti Ghar (Northeast at x = 28, z = -35)
  { minX: 23.5, maxX: 32.5, minZ: -39.0, maxZ: -33.5, name: "tika_house_2" },

  // 4. Central Village Chautari Sacred Banyan Tree Trunk (at x = 0, z = 5)
  { minX: -1.0, maxX: 1.0, minZ: 4.0, maxZ: 6.0, name: "chautari_banyan_trunk" },

  // 5. Traditional Bamboo Linge Ping Posts (West Meadow at x = -26, z = -10)
  { minX: -28.9, maxX: -27.9, minZ: -12.9, maxZ: -7.1, name: "ping_west_posts" },
  { minX: -24.1, maxX: -23.1, minZ: -12.9, maxZ: -7.1, name: "ping_east_posts" },

  // 6. Aama Samuha Gathering Stage Backdrop (Southeast at x = 26, z = 22)
  { minX: 21.2, maxX: 30.8, minZ: 17.5, maxZ: 19.0, name: "aama_stage_backdrop" },

  // 7. Langur Burja Dice Table Pavilion Center Table (at x = 24, z = -12)
  { minX: 22.4, maxX: 25.6, minZ: -13.6, maxZ: -10.4, name: "langur_burja_table" },

  // 8. Village Market Stalls (Aligned along the stone festival street)
  // Chiya Tea Stall (West at x = -6.5, z = 28)
  { minX: -7.8, maxX: -5.2, minZ: 26.0, maxZ: 30.0, name: "chiya_tea_stall" },
  // Sel Roti Stall (East at x = 6.5, z = 28)
  { minX: 5.2, maxX: 7.8, minZ: 26.0, maxZ: 30.0, name: "sel_roti_stall" },
  // Changa Kite Stall (West at x = -6.5, z = 18)
  { minX: -7.8, maxX: -5.2, minZ: 16.0, maxZ: 20.0, name: "changa_kite_stall" },
  // Dhaka Topi Stall (East at x = 6.5, z = 18)
  { minX: 5.2, maxX: 7.8, minZ: 16.0, maxZ: 20.0, name: "dhaka_topi_stall" },
  // Mela Byawasthapan Sanstha Desk (West at x = -9.5, z = 8)
  { minX: -11.6, maxX: -7.4, minZ: 6.6, maxZ: 9.4, name: "sanstha_desk" },

  // 9. Natural World Outer Bounds (Generous 260m x 260m exploration border — NO invisible fences in fairground!)
  { minX: -132, maxX: 132, minZ: -128, maxZ: -125, name: "far_north_himalaya_cliff" },
  { minX: -132, maxX: 132, minZ: 125, maxZ: 128, name: "far_south_valley_boundary" },
  { minX: -132, maxX: -129, minZ: -128, maxZ: 128, name: "far_west_terrace_edge" },
  { minX: 129, maxX: 132, minZ: -128, maxZ: 128, name: "far_east_terrace_edge" },
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
