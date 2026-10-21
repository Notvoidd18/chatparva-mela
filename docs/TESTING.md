# Chatparva Mela — Testing & Verification Guide

This document provides reproducible instructions for testing **Chatparva Mela** locally on Windows 11.

## 1. Automated Test Suites

### Run All Unit and Schema Tests
```powershell
npm test
```
Expected output: 42 passed tests across `apps/server`, `apps/web`, and `packages/shared`.

### Run TypeScript Verification
```powershell
npm run typecheck
```
Expected output: 0 errors across all workspaces (`packages/shared`, `apps/server`, `apps/web`).

### Run Production Build Verification
```powershell
npm run build
```
Expected output: Clean compilation of all packages and successful Vite bundle.

---

## 2. Two-Device / Two-Browser Multiplayer Verification

### Step 1: Start the Backend and Frontend
In the workspace root `D:\Dashain`:
```powershell
npm run dev
```
Or in separate terminals:
- Terminal 1 (Colyseus Server): `npm run dev --workspace=apps/server` (Port: 2567)
- Terminal 2 (Vite Web App): `npm run dev --workspace=apps/web` (Port: 5173)

### Step 2: Open Client 1 (Player A)
1. Open Chrome or Edge to `http://localhost:5173`.
2. Click **"🎮 Enter 3D Mela (Playable World)"**.
3. In the **Choose Your Yatri Name** modal, type a name (e.g. `Aayush-Yatri`) or click "🎲 Random Name", then click **"Enter Chatparva Mela 🎪"**.
4. Observe the HUD show **Online (1 Yatri • ~5ms)** and the initial balance of **रू 100 NPR**.

### Step 3: Open Client 2 (Player B - Incognito or Second Browser)
1. Open a second browser window (or Incognito tab) to `http://localhost:5173`.
2. Click **"🎮 Enter 3D Mela (Playable World)"**.
3. Choose a different name (e.g. `Pooja-Kathmandu`).
4. In Client 1's view, observe `Pooja-Kathmandu` appear near the entrance arch with their name tag and customized clothing!

### Step 4: Verify Synchronized Interactions
- **Movement & Animation**: Move Player A with `W/A/S/D`. Verify Player B sees smooth walking/running/jumping animations and correct orientations.
- **Emotes**: In Player A, click `Namaste 🙏` or `Nach 💃`. Verify Player B sees the synchronized cultural animation with sound effects.
- **Chat**: Type a message in Player A's chat box. Verify that the message appears in Player B's chat log and as a 3D speech bubble above Player A's head.
- **Inventory & Eating**:
  - Walk to the Tea Stall (`-10, 0, 10`) and press `[E]` to buy Masala Chiya for रू 20 NPR.
  - Press `[I]` to open inventory. Observe Masala Chiya count = 1, Balance = रू 80 NPR.
  - Click **"☕ Sip Chiya"**. Verify Player A drinks with realistic sipping audio, and Player B observes the drinking animation!
  - Repeat with Sel Roti at the food stall (`-15, 0, 10`).
- **Dashain Tika & Jamara Blessing**:
  - Walk to the Dashain Tika Mula Ghar (`-18, 0, 16`) and press `[E]` to interact with Aama/Bajai.
  - Read the cultural blessing and click **"🌸 ग्रहण गर्नुहोस् (Receive Tika & Jamara)"**.
  - Verify +रू 50 Dakshina added to balance, temple bell chime plays, broadcast message appears in chat, and visual red Tika with rice grains and golden-green Jamara sprigs appear on both clients' avatars.
  - Try claiming again: verify the server responds that the one-time blessing has already been claimed.
- **Changa (Kite Flying)**:
  - Walk to the Kite Stall (`-5, 0, 10`) and purchase a Changa for रू 50 NPR.
  - In open ground, press `[I]` and click **"🪁 Fly Changa"** (or press the Kite button).
  - Use `W/A/S/D` to steer the kite in the sky. Observe tether string and kite motion on both clients.
- **Linge Ping Swing**:
  - Walk to the bamboo swing (`-26, 0, -10`) and press `[E]` to mount.
  - Press `[Space]` repeatedly to pump swing. Observe Player B sees Player A swinging.
  - Press `[E]` or `[Escape]` to dismount. Verify player lands safely on the ground without floating in midair.
- **Aama Samuha Stage**:
  - Walk to the stage (`0, 0, -50`) and verify the 4 dancing women and 2 Madal drummers performing cultural choreography.
- **Langur Burja & Tihar Diyas**:
  - Place bets at the dice booth (`24, 0, -12`) and verify dice rolls.
  - Press `[E]` next to clay diyas around the lotus mandala (`0, 0, -25`) to light them and view flames.
