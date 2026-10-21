import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { MelaWorldRoom } from "./rooms/MelaWorldRoom.js";
import { ROOM_NAMES } from "@melaverse/shared";

const PORT = Number(process.env["PORT"] ?? 2567);
const CLIENT_ORIGIN = process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173";
const NODE_ENV = process.env["NODE_ENV"] ?? "development";

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: "*", // Allow cross-device dev access (LAN IP / localhost)
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ─── Health Endpoint ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "0.2.0",
    timestamp: new Date().toISOString(),
    room_count: 2,
    rooms: [ROOM_NAMES.SERVER_1, ROOM_NAMES.SERVER_2],
  });
});

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ─── Colyseus Game Server ─────────────────────────────────────────────────────
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define(ROOM_NAMES.MELA_WORLD, MelaWorldRoom);
gameServer.define("mela_world", MelaWorldRoom);
gameServer.define(ROOM_NAMES.SERVER_1, MelaWorldRoom);
gameServer.define(ROOM_NAMES.SERVER_2, MelaWorldRoom);

// ─── Start ────────────────────────────────────────────────────────────────────
gameServer.listen(PORT).then(() => {
  console.log(`
╔══════════════════════════════════════════════════╗
║          🎪 MelaVerse Nepal — Server             ║
╠══════════════════════════════════════════════════╣
║  Port      : ${String(PORT).padEnd(34)}║
║  Env       : ${NODE_ENV.padEnd(34)}║
║  Client    : ${CLIENT_ORIGIN.padEnd(34)}║
║  Health    : http://localhost:${PORT}/health${" ".repeat(Math.max(0, 14 - String(PORT).length))} ║
╚══════════════════════════════════════════════════╝
`);
});
