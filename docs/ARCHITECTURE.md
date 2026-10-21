# Chatparva Mela — System Architecture & Engineering Design

## 1. High-Level Overview
**Chatparva Mela** (formerly MelaVerse Nepal) is a fully 3D browser-based multiplayer social festival game celebrating Nepali Dashain and Tihar.
Players can navigate a low-poly festive fairground (*Mela*), ride the traditional bamboo swing (*Linge Ping*), play *Langur Burja* and *Tash*, fly *Changa*, eat *Sel Roti*, drink *Masala Chiya*, receive Dashain *Tika & Jamara* blessings from village elders, light ceremonial *Tihar Diyas*, chat with nearby Yatris, and perform cultural emotes (*Namaste*, *Nach* folk dance, *Wave*, *Cheer*).

```
                      ┌────────────────────────────────────────────────────────┐
                      │                   Client (Browser)                     │
                      │       React 18 + Three.js + R3F + Drei + Vite          │
                      │                                                        │
                      │  ┌───────────────────────┐   ┌──────────────────────┐  │
                      │  │    3D World Canvas    │   │      2D Game HUD     │  │
                      │  │ - Character Rig       │   │ - Emote Wheel        │  │
                      │  │ - Tika & Jamara Mesh  │   │ - Real-time Chat     │  │
                      │  │ - Bamboo Linge Ping   │   │ - Inventory (I)      │  │
                      │  │ - Flying Changa Kite  │   │ - NPR Currency (रू)  │  │
                      │  │ - Tika Blessing Houses│   │ - Username Modal     │  │
                      │  │ - Aama Samuha Stage   │   │ - Shop Stalls        │  │
                      │  │ - Langur Burja & Tash │   │ - Langur Burja Modal │  │
                      │  │ - Tihar Diyas Rangoli │   │ - Settings & Audio   │  │
                      │  └───────────────────────┘   └──────────────────────┘  │
                      └───────────────────────────┬────────────────────────────┘
                                                  │ WebSocket / Colyseus.js
                                                  ▼
                      ┌────────────────────────────────────────────────────────┐
                      │              Colyseus Game Server (Node.js)            │
                      │          Room: "melaverse-main" (Capacity: 30)         │
                      │                                                        │
                      │  - Authoritative Movement & Speed Validation (20 Hz)   │
                      │  - Pendulum Harmonic Swing Simulation                  │
                      │  - Authoritative Currency & Inventory System (NPR)     │
                      │  - Server-Enforced One-Time Tika Blessing (+50 Dakshina)│
                      │  - Food Consumption Handlers (Chiya, Sel Roti)         │
                      │  - Authoritative Langur Burja Dice Rounds              │
                      │  - Diya Lighting State Synchronization                 │
                      │  - Case-Insensitive Unique Display Name Enforcement    │
                      │  - Chat Sanitization & Rate Limits                     │
                      └────────────────────────────────────────────────────────┘
                                                  ▲
                                                  │ Shared Types & Schemas
                      ┌───────────────────────────┴────────────────────────────┐
                      │                     packages/shared                    │
                      │       Zod Schemas • Constants • Network Protocol       │
                      └────────────────────────────────────────────────────────┘
```

## 2. Monorepo Organization
- `apps/web`: React 18, `@react-three/fiber`, `@react-three/drei`, `three`, `colyseus.js`, `vite`.
- `apps/server`: Node.js, TypeScript, `@colyseus/core`, `@colyseus/ws-transport`, `@colyseus/schema`, `express`.
- `packages/shared`: Shared types, Zod schemas, game constants, attraction coordinates, rate limit rules.

## 3. Authoritative Network Protocol & State Machine
- **Room**: `melaverse-main`
- **Tick Rate**: 20 Hz (50ms interval)
- **State Synchronization**: Colyseus schema binary delta encoding (`MelaWorldState`).
- **Currency & Inventory**:
  - Currency strictly standardized as **Nepalese Rupees (NPR)** across all stalls, HUD, and backend state.
  - Server validates inventory decrement on consumption (`eat_food` for `chiya` and `sel_roti`) and triggers synchronized player animation states (`drinking`, `eating`).
- **One-Time Dashain Tika Reward**:
  - The server tracks `player.hasReceivedTikaReward` in `MelaWorldRoom`.
  - When a player interacts with the elders at Mula Ghar or Maiti Ghar, the server verifies that the reward has not been claimed previously, sets `player.hasReceivedTikaReward = true`, grants +50 NPR Dakshina, marks `hasTika = true`, and broadcasts an announcement to all festival players.
- **Movement Anticheat & Dismounting**:
  - Distance delta validation (`MAX_DELTA_POSITION_PER_TICK = 3.5m`).
  - Authoritative bounding box clamping (`WORLD_BOUNDS = [-150, 150]`).
  - Linge Ping Swing dismount is firmly anchored to ground level `[-26, 0, -5.5]` with zero vertical velocity to prevent floating.
- **Attractions**:
  - **Linge Ping**: Single-occupant mutex lock. Server simulates damped pendulum harmonic motion $\theta(t) = A \sin(\omega t)$.
  - **Changa (Kite Flying)**: Client sends `toggle_changa` state, allowing real-time steering and tether simulation.
  - **Langur Burja**: 3-phase round state machine (`betting` 15s, `rolling` 5s, `payout` 6s) with authoritative dice generation.
  - **Tihar Diya Stations**: 8 clay diya stations around the lotus Rangoli mandala with synchronized lighting states.

## 4. Audio Engine
- Built directly on the browser **Web Audio API** (`SoundEngine`).
- Produces authentic Nepali folk sounds procedurally:
  - Madal rhythmic drum strikes
  - Temple brass bell chimes
  - Hot oil flame sizzle
  - Bamboo swing rope creaks
  - Masala Chiya sipping slurps
  - Sel Roti crunchy bites
  - Dice rattle & victory fanfares
