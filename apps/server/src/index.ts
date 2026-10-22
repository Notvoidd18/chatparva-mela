import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Server, createNodeMatchmakingMiddleware, matchMaker } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { MelaWorldRoom } from "./rooms/MelaWorldRoom.js";
import { ROOM_NAMES } from "@melaverse/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env["PORT"] ?? 2567);
const CLIENT_ORIGIN = process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173";
const NODE_ENV = process.env["NODE_ENV"] ?? "development";

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: "*", // Allow cross-device dev access (LAN IP / localhost)
    methods: ["GET", "POST", "OPTIONS"],
  })
);

// Colyseus HTTP Matchmaker middleware (handles POST /matchmake/:method/:roomName)
app.use(createNodeMatchmakingMiddleware());

app.use(express.json());

// ─── Health Endpoint ──────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  let server1Clients = 0;
  let server2Clients = 0;
  try {
    const rooms = await matchMaker.query({});
    rooms.forEach((r: any) => {
      if (r.name === ROOM_NAMES.SERVER_1) server1Clients = r.clients;
      if (r.name === ROOM_NAMES.SERVER_2) server2Clients = r.clients;
    });
  } catch {}

  res.json({
    status: "ok",
    version: "0.2.4",
    timestamp: new Date().toISOString(),
    room_count: 2,
    rooms: [ROOM_NAMES.SERVER_1, ROOM_NAMES.SERVER_2],
    servers: {
      "melaverse-server-1": { name: "Kathmandu Mela", clients: server1Clients, maxClients: 30 },
      "melaverse-server-2": { name: "Pokhara Chautari", clients: server2Clients, maxClients: 30 },
    },
  });
});

// ─── Static Web Client Serving (for Unified Single-Service Deployment on Render) ─
const candidatePaths = [
  path.resolve(__dirname, "../../web/dist"),
  path.resolve(__dirname, "../../../apps/web/dist"),
  path.resolve(process.cwd(), "apps/web/dist"),
  path.resolve(process.cwd(), "web/dist"),
  path.resolve(process.cwd(), "dist"),
];

const webDistPath = candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html")));

if (webDistPath) {
  console.log(`[Static] Serving web client from: ${webDistPath}`);

  // Serve static assets with appropriate caching
  app.use(
    express.static(webDistPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          // Never cache HTML so normal browser tabs load the latest release immediately
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (filePath.includes("assets")) {
          // Hashed JS/CSS chunks can be cached safely
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  app.get("*", (req, res, next) => {
    if (req.path === "/health" || req.path.startsWith("/colyseus") || req.path.startsWith("/matchmake")) return next();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(webDistPath, "index.html"));
  });
} else {
  // Graceful fallback if static web bundle is not yet built
  app.get("/", (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>🎪 Chatparva Mela Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 40px 20px; }
            .card { max-width: 520px; margin: 40px auto; background: #1e293b; border: 2px solid #f59e0b; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { color: #fde047; font-size: 24px; margin-bottom: 8px; }
            p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
            a { color: #38bdf8; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🎪 Chatparva Mela Server is Running!</h1>
            <p>Colyseus Multiplayer Game Server is active on port <strong>${PORT}</strong>.</p>
            <p>To serve the 3D game directly from this service, ensure your build command is set to:</p>
            <p><code style="background: #0f172a; padding: 6px 10px; border-radius: 6px; color: #4ade80;">npm run build</code></p>
            <p>Health check: <a href="/health">/health</a></p>
          </div>
        </body>
      </html>
    `);
  });
}

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
