# Chatparva Mela — Known Issues & Staging Considerations

## 1. Current Stage & Scope
- **Network Protocol**: Real-time binary WebSocket replication powered by Colyseus 0.18 over TCP.
- **Session & Identity**: Username registration modal with reserved-name filtering and room duplicate suffixing. LocalStorage maintains client preferences across sessions.
- **Audio Autoplay Policy**: Modern web browsers require user interaction before the Web Audio API AudioContext resumes. Clicking any button or interacting with the world automatically unlocks audio playback.

## 2. Low-End / 8GB RAM Laptop Optimizations
- **Polygon Budget & Shared Materials**: All cultural assets (bamboo ping, houses, stalls, avatars, diyas, cards) use low-poly meshes with vertex colors and shared materials to maintain 60 FPS on integrated GPUs.
- **Shadow Passes**: If running on ultra-low-power integrated graphics, toggle "Graphics: Low" in the Settings menu (`⚙️`) to disable real-time shadow computation.
- **Touch & Mobile Controls**: Responsive touch controls automatically scale on viewports under 768px, including dual-touch joystick and jump/interact actions.
