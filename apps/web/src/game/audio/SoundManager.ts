/**
 * MelaVerse Nepal — Web Audio Sound Engine
 * Provides authentic festival sound effects, emote audio cues, and ambient SFX.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicMuted: boolean = false;
  public volume: number = 0.5;
  private lastPlayed = new Map<string, number>();

  public canPlay(id: string, cooldownMs: number): boolean {
    const now = performance.now();
    const last = this.lastPlayed.get(id) ?? 0;
    if (now - last < cooldownMs) return false;
    this.lastPlayed.set(id, now);
    return true;
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public ensureAudio() {
    this.initContext();
  }

  public stopMusic() {
    this.isMusicMuted = true;
  }

  public toggleMusic(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    return !this.isMusicMuted;
  }

  /** Generic snack consumption sound */
  public playSipOrCrunch() {
    this.playChiyaSip();
  }

  /** Namaste Emote Sound (Gentle temple chime & resonating harmonic tone) */
  public playNamasteSound() {
    if (this.isMuted || !this.canPlay("namaste", 1200)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major meditative chime
    chords.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 1.8);
    });
  }

  /** Nach / Dance Emote Sound (Energetic Nepali Jhyaure folk dance Madal groove) */
  public playNachSong() {
    if (this.isMuted || !this.canPlay("nach", 3000)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 8-beat Nepali folk groove: Dhin-Dhin-Taa / Dhin-Taa
    const beats = [
      { t: 0.0, pitch: "low" },
      { t: 0.15, pitch: "high" },
      { t: 0.3, pitch: "low" },
      { t: 0.45, pitch: "high" },
      { t: 0.6, pitch: "high" },
      { t: 0.75, pitch: "low" },
      { t: 0.9, pitch: "high" },
      { t: 1.05, pitch: "low" },
    ];

    beats.forEach((b) => {
      setTimeout(() => {
        this.playMadalBeat(b.pitch as any, 0.45);
      }, b.t * 1000);
    });

    // Flute harmony overlay
    const notes = [440, 523.25, 587.33, 659.25, 587.33, 523.25];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.18;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  /** Wave Emote Sound (Friendly ascending two-tone whistle) */
  public playWaveSound() {
    if (this.isMuted || !this.canPlay("wave", 1000)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /** Cheer Emote Sound (Celebration fanfare & joyful trumpet flourish) */
  public playCheerSound() {
    if (this.isMuted || !this.canPlay("cheer", 1500)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  /** Chiya drinking sip sound */
  public playChiyaSip() {
    if (this.isMuted || !this.canPlay("chiya", 1000)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Inhaling sip whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(750, now + 0.25);
    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /** Sel Roti crispy crunch sound */
  public playSelRotiCrunch() {
    if (this.isMuted || !this.canPlay("crunch", 1000)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Dual crisp crackles
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140 + Math.random() * 80, t);
      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  }

  /** Changa kite flying wind & string sound */
  public playKiteWhoosh() {
    if (this.isMuted || !this.canPlay("kite", 1200)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
    osc.frequency.linearRampToValueAtTime(330, now + 0.7);
    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  /** Dhaka Topi wearing chime */
  public playTopiChime() {
    if (this.isMuted || !this.canPlay("topi", 800)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(784, now); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2); // C6
    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** Temple bell chime */
  public playTempleBell() {
    if (this.isMuted || !this.canPlay("bell", 600)) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, now);
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 1.2);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  /** Madal drum strike */
  public playMadalBeat(pitch: "high" | "low" = "high", customVolume?: number) {
    if (this.isMuted || !this.canPlay(`madal_${pitch}`, 140)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    const freq = pitch === "high" ? 320 : 130;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

    const vol = (customVolume ?? this.volume) * 0.35;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Diya flame lighting sizzle / chime */
  public playDiyaLight() {
    if (this.isMuted || !this.canPlay("diya", 600)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.4);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /** Swing rope creak */
  public playSwingCreak() {
    if (this.isMuted || !this.canPlay("swing", 1200)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Dice shake & roll */
  public playDiceRoll() {
    if (this.isMuted || !this.canPlay("dice", 1200)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(200 + Math.random() * 300, t);
      gain.gain.setValueAtTime(0.1 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  /** Card deal / snap */
  public playCardSnap() {
    if (this.isMuted || !this.canPlay("card", 160)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Footstep sound */
  public playFootstep() {
    if (this.isMuted || !this.canPlay("step", 280)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

    gain.gain.setValueAtTime(0.08 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Win fanfare */
  public playWinFanfare() {
    if (this.isMuted || !this.canPlay("fanfare", 2500)) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }
}

export const soundManager = new SoundEngine();
