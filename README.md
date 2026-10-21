# 🎪 Chatparva Mela — 3D Multiplayer Nepali Cultural Festival

**Chatparva Mela** (formerly MelaVerse Nepal) is a fully 3D, browser-based multiplayer social festival game celebrating Nepali Dashain and Tihar.
Players explore a stylized low-poly fairground (*mela*), meet other Yatris, ride the traditional bamboo swing (*Linge Ping*), fly *Changa* (kites), drink *Masala Chiya*, eat *Sel Roti*, receive Dashain *Tika & Jamara* blessings with Dakshina from village elders, watch the *Aama Samuha* cultural dance stage, play *Tash* (cards) and *Langur Burja*, light ceremonial *Tihar Diyas*, and trade with living NPC shopkeepers using Nepalese Rupees (NPR).

---

## 🛠️ Tech Stack
- **Frontend (`apps/web`)**: React 18, Three.js, `@react-three/fiber`, `@react-three/drei`, TypeScript, Vite.
- **Backend (`apps/server`)**: Node.js, TypeScript, Colyseus WebSocket Server (`@colyseus/core`, `@colyseus/ws-transport`, `@colyseus/schema`), Express.
- **Shared (`packages/shared`)**: Shared Zod schemas, constants, network protocols, types.
- **Audio Engine**: Web Audio API procedural synthesis (authentic Madal drums, bells, flame sizzle, swing creak, chai sipping, eating crunches).

---

## 🚀 Quickstart on Windows 11

### 1. Prerequisites
- **Node.js**: v20+ or v24+ (`v24.14.1` verified)
- **npm**: 10+ (`11.11.0` verified)
- Modern WebGL2-compatible browser (Chrome, Edge, Firefox, Safari)

### 2. Installation
From the repository root (`D:\Dashain`):
```powershell
npm install
```

### 3. Running the Game
Start both the Colyseus backend (port 2567) and Vite frontend (port 5173):
```powershell
npm run dev
```

Or start processes individually:
- **Game Server**: `npm run dev --workspace=apps/server` (Runs on `http://localhost:2567`)
- **Web Client**: `npm run dev --workspace=apps/web` (Runs on `http://localhost:5173`)

Open `http://localhost:5173` in your browser and click **"🎮 Enter 3D Mela"**!

---

## 🎮 Game Controls

| Action | Keyboard / Mouse | Mobile Touch |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` / Arrow Keys | On-Screen Touch Joystick |
| **Sprint** | `Left Shift` | — |
| **Jump** | `Spacebar` | On-Screen `JUMP` Button |
| **Orbit Camera** | Click & Drag Mouse | Touch & Drag Screen |
| **Zoom Camera** | Mouse Wheel Scroll | Pinch / Settings Slider |
| **Interact** | `E` key (context prompt above hotbar) | On-Screen Floating Prompt |
| **Select Hotbar Slot** | Number Keys `1`–`7` / Mouse Wheel | Tap Slot Directly |
| **Use Selected Item** | `F` key or Click active slot | Tap Active Slot |
| **Inventory [Full]** | `I` key | Top HUD Bag Button `🎒` |
| **Cancel / Stand Up** | `Escape` key | Close `✕` Button |
| **Pump Swing** | `Spacebar` while riding Linge Ping | Tap Jump |
| **Clap Rhythmically** | `Spacebar` while seated with Aama Samuha | Tap Jump |
| **Fly Kite** | `W/A/S/D` while flying Changa | Touch Steer Pad |
| **Emotes** | Namaste 🙏, Nach 💃, Clap 👏, Wave 👋, Cheer 🌟 | Bottom Emote Bar |

---

## 🌸 Cultural Attractions & Features

1. **Bada Dashain Tika & Jamara Houses**:
   - Visit the **Mula Ghar** (`-28, 0, -35`) or **Maiti Ghar** (`28, 0, -35`) to receive sacred red Tika and golden-green Jamara sprigs from village elders (*Aama* / *Bajai*).
   - In-world physical animation: Player kneels respectfully on the red blessing carpet; elder raises her arm with brass puja thali to apply forehead Tika and Jamara.
   - Server-enforced one-time Dashain blessing reward: grants **+ रू ५० NPR Dakshina**, temple bell chime, and visual forehead Tika & ear Jamara adornments on the avatar.
2. **Traditional Bamboo Linge Ping Swing**:
   - 4-pole curved bamboo structure (`-26, 0, -10`). Mount with `[E]`, pump with `[Space]` up to realistic harmonic swing speeds. Dismounts cleanly to ground level.
3. **Open-Ground Changa (Kite Flying)**:
   - Launch your diamond kite with `[Fly Kite]` from your Minecraft hotbar, inventory, or HUD. Steer your kite in real-time with responsive tether physics.
4. **Living NPC Festival Stalls**:
   - **Tea Stall (Ramesh Dai)**: Buy steaming Masala Chiya for रू 20 NPR. Sip it to play authentic drinking animation, sound, and +35% speed boost.
   - **Sel Roti Stall (Sita Didi)**: Buy freshly fried Sel Roti for रू 30 NPR. Eat it to trigger eating animation, crunchy audio bites, and +25 points.
   - **Kite & Lattai Stall (Bikash)**: Buy colorful kites for रू 50 NPR.
   - **Dhaka Topi Stall (Pooja Didi)**: Buy Palpali traditional Nepali topis for रू 80 NPR.
5. **Aama Samuha Gathering & Dance Stage**:
   - Community cultural performance stage (`26, 0, 22`) featuring 4 dancing women with distinct choreographies (*Nach*, *Clapping Dance*, *Swaying Dance*) and 2 live Madal drummers.
   - Courtyard audience benches where players can sit beside village elders and press `[Space]` to clap rhythmically!
6. **Forest Tash Circle (Card Game)**:
   - Seated card game area (`-28, 0, 20`) with physical 3D card piles, brass coins, and real-time player seating sync.
7. **Langur Burja Dice Booth with 3D Dice Shaker**:
   - Round betting table with green felt, vibrating 3D wooden dice shaker cup, and 6 physical 3D dice cubes that roll across the table in real time.
8. **Tihar Diya Stations & Rangoli Mandala**:
   - 8 clay diyas encircling a colorful rice flour Rangoli. Light diyas to ignite animated flames and festival points.
9. **Shree Durga Mata Mandir**:
   - Multi-tier Pagoda temple at the north fairground (`0, 0, -46`) with carved wooden pillars, golden pinnacle (Gajur), hanging brass bells, Goddess Durga murti on lion mount with trident, and prayer interaction (`[E]`) with folded hands and temple bell chimes.
10. **Synchronized Day-Night Cycle & Ghili-Mili Lights**:
    - Continuous cycle (Morning, Daytime, Sunset, Tihar Night) with smooth sky, sun, and ambient transitions.
    - At night, decorative Ghili-Mili fairy light strings on the entrance arch, temple eaves, and stalls glow warmly.

---

## 🌐 Free Hosting & Deployment (GitHub Pages + Render)

Follow this step-by-step guide to host Chatparva Mela completely free with zero lag.

### 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g. `chatparva-mela`).
2. Run in terminal from `D:\Dashain`:
   ```bash
   git remote add origin https://github.com/<your-username>/chatparva-mela.git
   git branch -M main
   git push -u origin main
   ```

### 2. Deploy Backend (Colyseus WebSocket Server) on Render (Free)
1. Log in to [Render.com](https://render.com) with your GitHub account.
2. Click **New +** ➔ **Web Service** ➔ Select your `chatparva-mela` repository.
3. Configure the service:
   - **Name**: `chatparva-mela-server`
   - **Region**: `Singapore (Southeast Asia)` *(Gives lowest ping <50ms to Nepal and South Asia!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Instance Type**: `Free`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `2567`
   - `CLIENT_ORIGIN` = `*`
5. Click **Create Web Service**. Render will deploy your Colyseus server and provide a URL like:
   `https://chatparva-mela-server.onrender.com`
   *(Your WebSocket URL is: `wss://chatparva-mela-server.onrender.com`)*

### 3. Deploy Frontend on GitHub Pages (Free)
1. In your GitHub repository, go to **Settings** ➔ **Pages**.
2. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
3. Under **Settings** ➔ **Secrets and variables** ➔ **Actions**, click **New repository secret**:
   - **Name**: `VITE_SERVER_URL`
   - **Value**: `wss://chatparva-mela-server.onrender.com` *(use your Render URL)*
4. Every time you push to `main`, GitHub Actions automatically builds and deploys your game with zero hosting costs!

### 4. Zero-Lag Optimization (Prevent Free Tier Sleep on Render)
Free Render web services spin down after 15 minutes of inactivity. To keep your server awake 24/7 with instant 0-second connections:
1. Go to [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) (both 100% free).
2. Create a ping monitor for:
   `https://chatparva-mela-server.onrender.com/health`
3. Set the interval to **every 10 minutes**.
4. The server stays perpetually warm in memory with 0ms spin-up lag!

---

## 🧪 Verification & Automated Tests

```powershell
# Run all Vitest suites (42 unit/schema/room tests)
npm test

# Verify TypeScript across all workspaces
npm run typecheck

# Run production build
npm run build
```

---

## 📁 Repository Structure

```
d:\Dashain\
├── apps/
│   ├── web/                     # React + Three.js + R3F web client
│   │   ├── public/assets/       # Asset manifests, licenses, procedural metadata
│   │   └── src/
│   │       ├── game/
│   │       │   ├── audio/       # Procedural Web Audio Sound Engine
│   │       │   ├── network/     # Colyseus connection manager & state listeners
│   │       │   ├── player/      # Avatar, Controller, Remote Interpolation, Tika/Topi
│   │       │   ├── ui/          # HUD, Inventory, Username, Tika, Langur Burja, Stalls
│   │       │   └── world/       # 3D Scene, Tika Houses, Aama Samuha, Bamboo Swing
│   │       └── App.tsx          # Launcher & server status diagnostic
│   └── server/                  # Colyseus authoritative multiplayer server
│       └── src/
│           ├── rooms/           # MelaWorldRoom & MelaWorldState schema
│           └── index.ts         # Express & Colyseus entry point
├── packages/
│   └── shared/                  # Zod schemas, network message protocols, constants
├── docs/
│   ├── ARCHITECTURE.md          # Real architecture & data flow diagrams
│   ├── TESTING.md               # 2-client multiplayer test procedure
│   └── KNOWN-ISSUES.md          # Performance & staging considerations
└── package.json                 # Monorepo workspaces configuration
```

---

## 📜 Asset License & Provenance
All procedural models (Nepali Humanoid Avatar, Dhaka Topi, Tika & Jamara, Bamboo Linge Ping, Langur Burja booth, Tihar Rangoli/Diyas, Market Stalls, and Tika Houses) and procedural audio synthesis scripts are original creations released under **CC0 1.0 Universal / MIT**. See [apps/web/public/assets/LICENSES.md](apps/web/public/assets/LICENSES.md) for full documentation.
