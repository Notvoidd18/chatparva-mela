# MelaVerse Nepal — Architecture

## Monorepo Structure

```
melaverse-nepal/                    ← npm workspace root
│
├── apps/
│   ├── server/                     ← @melaverse/server
│   │   ├── src/
│   │   │   ├── index.ts            ← Express + Colyseus entry point
│   │   │   ├── rooms/
│   │   │   │   └── MelaWorldRoom.ts  ← Main game room
│   │   │   └── __tests__/
│   │   │       └── health.test.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                        ← @melaverse/web
│       ├── src/
│       │   ├── main.tsx            ← React root mount
│       │   ├── App.tsx             ← Server status / health screen
│       │   ├── App.css
│       │   ├── vite-env.d.ts
│       │   └── __tests__/
│       │       └── App.test.tsx
│       ├── index.html
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── vitest.config.ts
│
├── packages/
│   └── shared/                     ← @melaverse/shared
│       ├── src/
│       │   ├── index.ts            ← Barrel exports
│       │   ├── constants.ts        ← Game constants
│       │   ├── types.ts            ← TypeScript types (derived from Zod)
│       │   ├── schemas/
│       │   │   └── player.ts       ← Zod schemas
│       │   └── __tests__/
│       │       └── schemas.test.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── .env.example
├── package.json                    ← Workspace root + dev scripts
├── tsconfig.base.json              ← Shared TS compiler options
├── vitest.config.ts                ← Root test config
├── README.md
└── ARCHITECTURE.md
```

---

## Technology Choices

| Technology | Version | Rationale |
|---|---|---|
| **TypeScript** | 5.7 | End-to-end type safety; shared types between client and server |
| **npm Workspaces** | built-in | Simple monorepo without heavy tooling (Turborepo can be added later) |
| **Colyseus** | 0.18 | Purpose-built multiplayer framework; handles room lifecycle, schema delta sync, and WebSocket transport |
| **Express** | 4.x | Minimal HTTP layer for health/REST endpoints alongside Colyseus |
| **React** | 18 | Concurrent rendering; large ecosystem |
| **Vite** | 6 | Sub-second HMR; native ESM; excellent React + TS support |
| **@react-three/fiber** | 8 | Declarative Three.js in React; pairs well with Drei helpers |
| **Zod** | 3 | Runtime schema validation shared between client and server |
| **Vitest** | 2 | Fast, Vite-native test runner; compatible with jest assertions |
| **concurrently** | 9 | Run server and client dev scripts in parallel from workspace root |

---

## Network Protocol

```
Browser (React + colyseus.js)
        │
        │  WebSocket (ws://localhost:2567)
        │  Colyseus protocol (binary delta encoding)
        ▼
Colyseus Server (Node.js)
        │
        ├── Room: mela_world  (MelaWorldRoom)
        │         maxClients: 30
        │         onMessage: player_input | chat
        │
        └── Express HTTP
              GET /health → JSON { status, version, timestamp, room_count }
```

### Message Flow

```
Client                              Server (Colyseus Room)
  │                                         │
  │──── join("mela_world") ────────────────►│ onJoin(client)
  │                                         │
  │──── send("player_input", {...}) ───────►│ onMessage("player_input")
  │                                         │   → validate with Zod
  │                                         │   → update schema state
  │                                         │
  │◄─── state patch (binary delta) ─────────│ Colyseus auto-sync
  │                                         │
  │──── send("chat", {...}) ───────────────►│ onMessage("chat")
  │                                         │   → broadcast to room
  │◄─── message("chat", {...}) ─────────────│
  │                                         │
  │──── leave() ───────────────────────────►│ onLeave(client)
```

---

## Data Flow

```
User Input (keyboard / gamepad)
        │
        ▼
React Component → colyseus.js Client
        │
        │  send("player_input", PlayerInput)
        ▼
Colyseus Room (MelaWorldRoom)
        │
        │  validate → update Room Schema State
        ▼
Colyseus Schema Delta Sync (automatic, ~50ms)
        │
        ▼
All Connected Clients (colyseus.js)
        │
        ▼
Three.js Scene Update (React Three Fiber)
        │
        ▼
Rendered Frame (WebGL / Canvas)
```

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 0** | Repository foundation, monorepo setup, shared schemas, health endpoint | ✅ Complete |
| **Phase 1** | Colyseus Schema state, player position sync, basic lobby UI | 🔲 Planned |
| **Phase 2** | 3D world: Three.js scene, avatar meshes, terrain | 🔲 Planned |
| **Phase 3** | Chat system, proximity-based local chat | 🔲 Planned |
| **Phase 4** | Dashain festival content: Kite flying, Deusi-Bhailo, fireworks | 🔲 Planned |
| **Phase 5** | Authentication (optional), persistent player profiles | 🔲 Planned |
| **Phase 6** | Performance optimisation, spatial partitioning, LOD | 🔲 Planned |
| **Phase 7** | Mobile support, progressive web app | 🔲 Planned |
| **Phase 8** | Production deployment, CDN, monitoring | 🔲 Planned |

---

## Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| Colyseus + Express server | 2567 | HTTP + WebSocket |
| Vite dev server (web) | 5173 | HTTP |

---

## Key Design Decisions

1. **Shared package for schemas** — Zod schemas defined once in `@melaverse/shared` are used for both server-side validation and client-side type inference, eliminating drift between client and server contracts.

2. **Colyseus 0.18 (not 0.15/0.16)** — The latest stable release with improved performance and a cleaner API. Avoids the legacy `@colyseus/uwebsockets-transport` in favour of `@colyseus/ws-transport`.

3. **`colyseus.js` 0.16 for the client** — The JavaScript client package that matches the 0.18 server protocol. (The server and client versions don't need to match exactly but should be within the same major family.)

4. **ESM throughout** — All packages use `"type": "module"`. TypeScript targets `NodeNext` module resolution on the server and `Bundler` on the client (Vite handles bundling).

5. **No Turborepo yet** — npm workspaces with `concurrently` is sufficient for Phase 0. Turborepo or Nx can be layered in later for build caching.
