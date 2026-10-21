import { describe, it, expect, beforeEach } from "vitest";
import { MelaWorldRoom } from "../rooms/MelaWorldRoom.js";
import { MelaWorldState } from "../rooms/schema/MelaWorldState.js";
import {
  WORLD_BOUNDS,
  MOVEMENT_LIMITS,
  MAX_PLAYERS_PER_ROOM,
} from "@melaverse/shared";

describe("MelaWorldRoom Authoritative Server", () => {
  let room: MelaWorldRoom;

  beforeEach(() => {
    room = new MelaWorldRoom();
    room.onCreate({});
  });

  it("initializes room with max 30 players and empty players map", () => {
    expect(room.maxClients).toBe(MAX_PLAYERS_PER_ROOM);
    expect(room.state.players.size).toBe(0);
  });

  it("initializes 8 Tihar Diya stations unlit", () => {
    expect(room.state.diyas.size).toBe(8);
    for (const [_, diya] of room.state.diyas) {
      expect(diya.isLit).toBe(false);
      expect(diya.litBy).toBe("");
    }
  });

  it("initializes Ping Swing in vacant stationary state", () => {
    expect(room.state.pingSwing.occupantSessionId).toBe("");
    expect(room.state.pingSwing.swingAngle).toBe(0);
    expect(room.state.pingSwing.swingSpeed).toBe(0);
  });

  it("handles player join with sanitized display name and default spawn", () => {
    const mockClient = { sessionId: "client-test-1" } as any;
    room.onJoin(mockClient, { displayName: "<b>Aayush</b><script>" });

    const player = room.state.players.get("client-test-1");
    expect(player).toBeDefined();
    expect(player?.displayName).toBe("Aayush");
    expect(player?.x).toBeGreaterThanOrEqual(WORLD_BOUNDS.minX);
    expect(player?.x).toBeLessThanOrEqual(WORLD_BOUNDS.maxX);
    expect(player?.animState).toBe("idle");
  });

  it("handles player disconnect and clears swing occupancy if player was riding", () => {
    const mockClient = { sessionId: "client-test-2" } as any;
    room.onJoin(mockClient, { displayName: "Rider" });

    // Force player onto swing
    room.state.pingSwing.occupantSessionId = "client-test-2";
    room.state.pingSwing.occupantName = "Rider";

    room.onLeave(mockClient);

    expect(room.state.players.has("client-test-2")).toBe(false);
    expect(room.state.pingSwing.occupantSessionId).toBe("");
    expect(room.state.pingSwing.occupantName).toBe("");
  });
});
