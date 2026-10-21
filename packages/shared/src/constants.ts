// ─── World Dimensions & Boundaries ──────────────────────────────────────────
export const WORLD_BOUNDS = {
  minX: -120,
  maxX: 120,
  minY: -5,
  maxY: 50,
  minZ: -120,
  maxZ: 120,
} as const;

export const SPAWN_POSITION = {
  x: 0,
  y: 0,
  z: 46,
} as const;

// ─── Movement & Physics Rules (Authoritative Server Validation) ─────────────
export const MOVEMENT_LIMITS = {
  MAX_WALK_SPEED: 8.0, // units per second
  MAX_SPRINT_SPEED: 14.0, // units per second
  MAX_JUMP_VELOCITY: 10.0,
  MAX_DELTA_POSITION_PER_TICK: 3.5, // max movement allowed in one tick (anticheat)
  INTERACTION_DISTANCE: 4.5, // meters for interaction prompt
  PROXIMITY_CHAT_RADIUS: 25.0, // meters for proximity chat
} as const;

// ─── Server & Network Constants ─────────────────────────────────────────────
export const MAX_PLAYERS_PER_ROOM = 30;
export const TICK_RATE_HZ = 20; // 20 updates per second
export const TICK_INTERVAL_MS = Math.round(1000 / TICK_RATE_HZ);

export const SERVER_PORT = 2567;
export const CLIENT_PORT = 5173;

export const ROOM_NAMES = {
  MELA_WORLD: "melaverse-main",
  SERVER_1: "melaverse-server-1",
  SERVER_2: "melaverse-server-2",
} as const;

export const SERVERS_LIST = [
  {
    id: "melaverse-server-1",
    roomName: "melaverse-server-1",
    name: "Server 1: Kathmandu Mela",
    nepaliName: "सर्भर १: काठमाडौं मुख्य मेला",
    region: "Kathmandu Valley",
    maxPlayers: 30,
  },
  {
    id: "melaverse-server-2",
    roomName: "melaverse-server-2",
    name: "Server 2: Pokhara Chautari",
    nepaliName: "सर्भर २: पोखरा चौतारी मेला",
    region: "Pokhara / Western",
    maxPlayers: 30,
  },
] as const;

export const PROTOCOL_VERSION = "0.2.0";

// ─── Attraction Locations (World Landmarks) ──────────────────────────────────
export const ATTRACTION_LOCATIONS = {
  ENTRANCE_ARCH: { x: 0, y: 0, z: 40 },
  CENTRAL_CHAUTARI: { x: 0, y: 0, z: 5 },
  LINGE_PING: { x: -26, y: 0, z: -10 },
  LANGUR_BURJA_BOOTH: { x: 24, y: 0, z: -12 },
  TIHAR_RANGOLI_AREA: { x: 0, y: 0, z: -25 },
  CHIYA_STALL: { x: -6.5, y: 0, z: 28 },
  SEL_ROTI_STALL: { x: 6.5, y: 0, z: 28 },
  CHANGA_KITE_STALL: { x: -6.5, y: 0, z: 18 },
  DHAKA_TEXTILE_STALL: { x: 6.5, y: 0, z: 18 },
  FOREST_TAAS_CIRCLE: { x: -28, y: 0, z: 20 },
  AAMA_SAMUHA_STAGE: { x: 26, y: 0, z: 22 },
  TIKA_HOUSE_1: { x: -28, y: 0, z: -35 },
  TIKA_HOUSE_2: { x: 28, y: 0, z: -35 },
  DURGA_MATA_MANDIR: { x: 0, y: 0, z: -46 },
  DAN_PETI: { x: 2.2, y: 0.45, z: -40.5 },
  SANSTHA_DESK: { x: -9.5, y: 0, z: 8 },
} as const;

// ─── Diya Stations (Tihar Festival Area) ──────────────────────────────────────
export const INITIAL_DIYA_STATIONS = [
  { id: "diya-1", x: -4, y: 0.1, z: -25 },
  { id: "diya-2", x: 4, y: 0.1, z: -25 },
  { id: "diya-3", x: 0, y: 0.1, z: -21 },
  { id: "diya-4", x: 0, y: 0.1, z: -29 },
  { id: "diya-5", x: -2.8, y: 0.1, z: -22.2 },
  { id: "diya-6", x: 2.8, y: 0.1, z: -22.2 },
  { id: "diya-7", x: -2.8, y: 0.1, z: -27.8 },
  { id: "diya-8", x: 2.8, y: 0.1, z: -27.8 },
] as const;

// ─── Chat & Moderation Limits ───────────────────────────────────────────────
export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 200,
  RATE_LIMIT_MS: 800, // min ms between chat messages
  MAX_NAME_LENGTH: 20,
  MIN_NAME_LENGTH: 2,
} as const;

// ─── Langur Burja Configuration ──────────────────────────────────────────────
export const LANGUR_BURJA_CONFIG = {
  BETTING_DURATION_SEC: 15,
  ROLLING_DURATION_SEC: 5,
  PAYOUT_DURATION_SEC: 6,
  INITIAL_TOKENS: 100,
} as const;
