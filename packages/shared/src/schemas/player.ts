import { z } from "zod";

// ─── Position3D ──────────────────────────────────────────────────────────────
export const Position3DSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

// ─── PlayerInput (client → server) ───────────────────────────────────────────
export const PlayerInputSchema = z.object({
  /** Unique session ID assigned by Colyseus */
  sessionId: z.string().min(1),
  /** Movement direction vector (normalized) */
  direction: Position3DSchema,
  /** Whether the player is currently jumping */
  jumping: z.boolean(),
  /** Optional chat message attached to this input tick */
  chat: z.string().max(256).optional(),
  /** Client timestamp for lag compensation */
  timestamp: z.number().int().positive(),
});

// ─── PlayerState (server → client) ───────────────────────────────────────────
export const PlayerStateSchema = z.object({
  sessionId: z.string().min(1),
  displayName: z.string().min(1).max(32),
  position: Position3DSchema,
  rotation: z.number().min(-Math.PI).max(Math.PI),
  avatarColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  isOnline: z.boolean(),
  joinedAt: z.number().int().positive(),
});

// ─── ChatMessage ─────────────────────────────────────────────────────────────
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().min(1),
  displayName: z.string().min(1).max(32),
  text: z.string().min(1).max(256),
  timestamp: z.number().int().positive(),
  channel: z.enum(["global", "local", "system"]).default("global"),
});
