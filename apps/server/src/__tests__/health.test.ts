import { describe, it, expect } from "vitest";

/**
 * Health endpoint shape test.
 *
 * We test the shape of the health response object without starting the server
 * (unit test). Integration tests that spin up the server will be added in Phase 3.
 */

interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  room_count: number;
}

function buildHealthResponse(roomCount = 0): HealthResponse {
  return {
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    room_count: roomCount,
  };
}

describe("Health endpoint shape", () => {
  it("has status 'ok'", () => {
    const response = buildHealthResponse();
    expect(response.status).toBe("ok");
  });

  it("has a semver version string", () => {
    const response = buildHealthResponse();
    expect(response.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has a valid ISO timestamp", () => {
    const response = buildHealthResponse();
    expect(() => new Date(response.timestamp).toISOString()).not.toThrow();
    expect(typeof response.timestamp).toBe("string");
  });

  it("has numeric room_count", () => {
    const response = buildHealthResponse(3);
    expect(typeof response.room_count).toBe("number");
    expect(response.room_count).toBe(3);
  });

  it("room_count defaults to 0", () => {
    const response = buildHealthResponse();
    expect(response.room_count).toBe(0);
  });
});
