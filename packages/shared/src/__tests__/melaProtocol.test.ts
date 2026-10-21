import { describe, it, expect } from "vitest";
import {
  Vector3Schema,
  PlayerInputSchema,
  PlayerNetworkStateSchema,
  ChatMessageSchema,
  LangurSymbolSchema,
  PingSwingStateSchema,
  DiyaStateSchema,
} from "../schemas/melaProtocol.js";

describe("Mela Protocol Schemas", () => {
  it("validates 3D vector", () => {
    const valid = Vector3Schema.safeParse({ x: 1.5, y: 0, z: -2.3 });
    expect(valid.success).toBe(true);

    const invalid = Vector3Schema.safeParse({ x: "bad", y: 0, z: 0 });
    expect(invalid.success).toBe(false);
  });

  it("validates player network input", () => {
    const input = {
      seq: 1,
      timestamp: Date.now(),
      position: { x: 0, y: 0, z: 0 },
      rotationY: 1.57,
      animState: "walk" as const,
      isGrounded: true,
    };
    expect(PlayerInputSchema.safeParse(input).success).toBe(true);
  });

  it("validates avatar customization and player network state", () => {
    const state = {
      sessionId: "test-session-123",
      displayName: "Biraj",
      position: { x: 10, y: 0, z: 5 },
      rotationY: 0,
      animState: "idle" as const,
      customization: {
        color: "#C41E3A",
        dhakaTopiColor: "#8B0000",
        hasDhakaTopi: true,
        hasVest: true,
        vestColor: "#D97706",
        skinTone: "#E0AC69",
      },
      ping: 25,
      isOnline: true,
      isModerator: false,
      lastActive: Date.now(),
    };
    expect(PlayerNetworkStateSchema.safeParse(state).success).toBe(true);
  });

  it("validates chat message with channels and length limits", () => {
    const validChat = {
      id: "msg-1",
      senderId: "sess-1",
      senderName: "Sita",
      text: "Subha Bijaya Dashami!",
      timestamp: Date.now(),
      channel: "proximity" as const,
      isSystem: false,
    };
    expect(ChatMessageSchema.safeParse(validChat).success).toBe(true);

    const tooLong = {
      ...validChat,
      text: "A".repeat(250),
    };
    expect(ChatMessageSchema.safeParse(tooLong).success).toBe(false);
  });

  it("validates Langur Burja symbols", () => {
    expect(LangurSymbolSchema.safeParse("jhanda").success).toBe(true);
    expect(LangurSymbolSchema.safeParse("burja").success).toBe(true);
    expect(LangurSymbolSchema.safeParse("invalid_symbol").success).toBe(false);
  });

  it("validates Ping Swing attraction state", () => {
    const swing = {
      occupantSessionId: "p-1",
      occupantName: "Aayush",
      swingAngle: 0.45,
      swingSpeed: 1.2,
      isPumping: true,
    };
    expect(PingSwingStateSchema.safeParse(swing).success).toBe(true);
  });

  it("validates Diya station state", () => {
    const diya = {
      id: "diya-1",
      position: { x: 0, y: 0.1, z: -25 },
      isLit: true,
      litBy: "p-1",
      litAt: 1234567,
    };
    expect(DiyaStateSchema.safeParse(diya).success).toBe(true);
  });
});
