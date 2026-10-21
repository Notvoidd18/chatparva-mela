import { z } from "zod";

// ─── 3D Vector ──────────────────────────────────────────────────────────────
export const Vector3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

export type Vector3Type = z.infer<typeof Vector3Schema>;

// ─── Animation & Emote State ────────────────────────────────────────────────
export const AnimationStateSchema = z.enum([
  "idle",
  "walk",
  "run",
  "jump",
  "fall",
  "namaste",
  "nach",
  "wave",
  "cheer",
  "clapping",
  "swinging",
  "seated",
  "seated_clapping",
  "kneeling_tika",
  "giving_tika",
  "clapping_dance",
  "swaying_dance",
  "drinking",
  "eating",
  "wearing_topi",
  "flying_kite",
]);

export type AnimationStateType = z.infer<typeof AnimationStateSchema>;

export const EmoteTypeSchema = z.enum([
  "namaste",
  "nach",
  "wave",
  "cheer",
  "clapping",
  "clapping_dance",
  "swaying_dance",
]);
export type EmoteType = z.infer<typeof EmoteTypeSchema>;

// ─── Avatar Customization ───────────────────────────────────────────────────
export const AvatarCustomizationSchema = z.object({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#C41E3A"),
  dhakaTopiColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#8B0000"),
  hasDhakaTopi: z.boolean().default(true),
  hasVest: z.boolean().default(true),
  vestColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#D97706"),
  skinTone: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#E0AC69"),
  hasTika: z.boolean().default(false),
  hasJamara: z.boolean().default(false),
  avatarType: z.enum(["boy1", "boy2", "girl1", "girl2"]).default("boy1").optional(),
});

export type AvatarCustomizationType = z.infer<typeof AvatarCustomizationSchema>;

// ─── Player Input Protocol (client → server) ─────────────────────────────────
export const PlayerInputSchema = z.object({
  seq: z.number().int().nonnegative(),
  timestamp: z.number().nonnegative(),
  position: Vector3Schema,
  rotationY: z.number().finite(),
  velocity: Vector3Schema.optional(),
  animState: AnimationStateSchema,
  isGrounded: z.boolean().default(true),
});

export type PlayerInputType = z.infer<typeof PlayerInputSchema>;

// ─── Player State Protocol (server → client) ─────────────────────────────────
export const PlayerNetworkStateSchema = z.object({
  sessionId: z.string().min(1),
  displayName: z.string().min(1).max(24),
  position: Vector3Schema,
  rotationY: z.number().finite(),
  animState: AnimationStateSchema,
  customization: AvatarCustomizationSchema,
  ping: z.number().nonnegative().default(0),
  isOnline: z.boolean().default(true),
  isModerator: z.boolean().default(false),
  lastActive: z.number().default(0),
});

export type PlayerNetworkStateType = z.infer<typeof PlayerNetworkStateSchema>;

// ─── Chat Message Protocol ──────────────────────────────────────────────────
export const ChatMessageSchema = z.object({
  id: z.string().min(1),
  senderId: z.string().min(1),
  senderName: z.string().min(1).max(24),
  text: z.string().min(1).max(200),
  timestamp: z.number().int().positive(),
  channel: z.enum(["global", "proximity", "system"]).default("global"),
  isSystem: z.boolean().default(false),
});

export type ChatMessageType = z.infer<typeof ChatMessageSchema>;

// ─── Langur Burja Mini-Game Protocol ─────────────────────────────────────────
export const LangurSymbolSchema = z.enum([
  "jhanda", // Flag
  "burja",  // Crown
  "ita",    // Diamond
  "paan",   // Heart
  "hukum",  // Spade
  "chidi",  // Club
]);

export type LangurSymbolType = z.infer<typeof LangurSymbolSchema>;

export const LangurBetSchema = z.object({
  symbol: LangurSymbolSchema,
  amount: z.number().int().positive().max(100),
});

export type LangurBetType = z.infer<typeof LangurBetSchema>;

export const LangurGameStateSchema = z.object({
  roundId: z.number().int().nonnegative(),
  phase: z.enum(["betting", "rolling", "payout"]),
  timerRemaining: z.number().nonnegative(),
  diceResults: z.array(LangurSymbolSchema).length(6),
});

export type LangurGameStateType = z.infer<typeof LangurGameStateSchema>;

// ─── Ping Swing Attraction State ─────────────────────────────────────────────
export const PingSwingStateSchema = z.object({
  occupantSessionId: z.string().nullable().default(null),
  occupantName: z.string().nullable().default(null),
  swingAngle: z.number().default(0),
  swingSpeed: z.number().default(0),
  isPumping: z.boolean().default(false),
});

export type PingSwingStateType = z.infer<typeof PingSwingStateSchema>;

// ─── Tihar Diya Station State ───────────────────────────────────────────────
export const DiyaStateSchema = z.object({
  id: z.string(),
  position: Vector3Schema,
  isLit: z.boolean().default(false),
  litBy: z.string().nullable().default(null),
  litAt: z.number().default(0),
});

export type DiyaStateType = z.infer<typeof DiyaStateSchema>;
