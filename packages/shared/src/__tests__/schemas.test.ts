import { describe, it, expect } from "vitest";
import {
  Position3DSchema,
  PlayerInputSchema,
  PlayerStateSchema,
  ChatMessageSchema,
} from "../schemas/player.js";

// ─── Position3D ───────────────────────────────────────────────────────────────
describe("Position3DSchema", () => {
  it("accepts valid position", () => {
    const result = Position3DSchema.safeParse({ x: 1.5, y: 0, z: -3.14 });
    expect(result.success).toBe(true);
  });

  it("rejects infinite values", () => {
    const result = Position3DSchema.safeParse({ x: Infinity, y: 0, z: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = Position3DSchema.safeParse({ x: 1, y: 2 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric values", () => {
    const result = Position3DSchema.safeParse({ x: "a", y: 0, z: 0 });
    expect(result.success).toBe(false);
  });
});

// ─── PlayerInput ──────────────────────────────────────────────────────────────
describe("PlayerInputSchema", () => {
  const valid = {
    sessionId: "abc123",
    direction: { x: 0, y: 0, z: 1 },
    jumping: false,
    timestamp: Date.now(),
  };

  it("accepts valid input without chat", () => {
    expect(PlayerInputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts valid input with chat", () => {
    const withChat = { ...valid, chat: "Hello mela!" };
    expect(PlayerInputSchema.safeParse(withChat).success).toBe(true);
  });

  it("rejects chat exceeding 256 chars", () => {
    const tooLong = { ...valid, chat: "x".repeat(257) };
    expect(PlayerInputSchema.safeParse(tooLong).success).toBe(false);
  });

  it("rejects empty sessionId", () => {
    const bad = { ...valid, sessionId: "" };
    expect(PlayerInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects negative timestamp", () => {
    const bad = { ...valid, timestamp: -1 };
    expect(PlayerInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects missing jumping field", () => {
    const { jumping: _, ...rest } = valid;
    expect(PlayerInputSchema.safeParse(rest).success).toBe(false);
  });
});

// ─── PlayerState ──────────────────────────────────────────────────────────────
describe("PlayerStateSchema", () => {
  const valid = {
    sessionId: "sess-001",
    displayName: "Hari",
    position: { x: 10, y: 0, z: 5 },
    rotation: 1.57,
    avatarColor: "#C41E3A",
    isOnline: true,
    joinedAt: Date.now(),
  };

  it("accepts valid player state", () => {
    expect(PlayerStateSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid hex color", () => {
    const bad = { ...valid, avatarColor: "red" };
    expect(PlayerStateSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects rotation out of range", () => {
    const bad = { ...valid, rotation: 10 };
    expect(PlayerStateSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects displayName over 32 chars", () => {
    const bad = { ...valid, displayName: "x".repeat(33) };
    expect(PlayerStateSchema.safeParse(bad).success).toBe(false);
  });
});

// ─── ChatMessage ──────────────────────────────────────────────────────────────
describe("ChatMessageSchema", () => {
  const valid = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    sessionId: "sess-001",
    displayName: "Sita",
    text: "Subha Dashain!",
    timestamp: Date.now(),
    channel: "global" as const,
  };

  it("accepts valid chat message", () => {
    expect(ChatMessageSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults channel to global when omitted", () => {
    const { channel: _, ...withoutChannel } = valid;
    const result = ChatMessageSchema.safeParse(withoutChannel);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.channel).toBe("global");
    }
  });

  it("rejects empty text", () => {
    const bad = { ...valid, text: "" };
    expect(ChatMessageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects text over 256 chars", () => {
    const bad = { ...valid, text: "x".repeat(257) };
    expect(ChatMessageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid channel", () => {
    const bad = { ...valid, channel: "private" };
    expect(ChatMessageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects non-UUID id", () => {
    const bad = { ...valid, id: "not-a-uuid" };
    expect(ChatMessageSchema.safeParse(bad).success).toBe(false);
  });
});
