/**
 * MelaVerse Nepal — Web Audio Sound Engine
 * Provides authentic festival sound effects, emote audio cues, and ambient SFX.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicMuted: boolean = false;
  public volume: number = 0.5;
  public musicVolume: number = 0.5;
  private lastPlayed = new Map<string, number>();

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.isMuted = this.volume === 0;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.isMusicMuted = this.musicVolume === 0;
  }

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

  /** Authentic Temple Bell (घन्टी) with multi-frequency brass resonance and long ring tail */
  public playTempleBell() {
    if (this.isMuted || !this.canPlay("bell", 600)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Harmonic frequencies for bronze temple bell: Fundamental (C6), Tierce (E6), Quint (G6), Octave (C7)
    const harmonics = [1046.5, 1318.5, 1567.9, 2093.0];
    const weights = [0.28, 0.16, 0.12, 0.08];

    harmonics.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      // Slight acoustic pitch droop characteristic of struck bronze
      osc.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 1.8);

      const amp = weights[i] * this.volume;
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    });
  }

  /** Authentic Nepali Madal (मादल) drum beat: resonant bass 'Dhum' or crisp treble 'Ta' */
  public playMadalBeat(pitch: "high" | "low" = "high", customVolume?: number) {
    if (this.isMuted || !this.canPlay(`madal_${pitch}`, 120)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const vol = (customVolume ?? this.volume) * 0.4;

    if (pitch === "low") {
      // Bass head (बायाँ - धुम्): resonant membrane thump with body decay
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.18);

      gain.gain.setValueAtTime(vol * 1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Treble head (दायाँ - ता / तिं): crisp Khari strike with metallic ring
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(380, now);
      osc1.frequency.exponentialRampToValueAtTime(160, now + 0.12);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(760, now);
      osc2.frequency.exponentialRampToValueAtTime(320, now + 0.09);

      gain.gain.setValueAtTime(vol * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.14);
      osc2.stop(now + 0.14);
    }
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
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.35); // E6

    gain.gain.setValueAtTime(0.22 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /** Natural wooden swing & hemp rope creak */
  public playSwingCreak() {
    if (this.isMuted || !this.canPlay("swing", 900)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(260, now);
    filter.Q.setValueAtTime(3.5, now);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(115, now + 0.16);

    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /** Natural wooden dice clatter & roll */
  public playDiceRoll() {
    if (this.isMuted || !this.canPlay("dice", 900)) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.045 + Math.random() * 0.015;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320 + Math.random() * 240, t);
      filter.Q.setValueAtTime(4.0, t);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(140 + Math.random() * 180, t);

      gain.gain.setValueAtTime(0.09 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
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

  // ─── Aama Bhailo & Deusi Cultural Folk Song Engine ────────────────────────
  private bhailoInterval: any = null;
  private isBhailoPlaying: boolean = false;

  /** Start playing the authentic Aama Samuha Deusi-Bhailo melody with rhythmic Madal accompaniment */
  public playAamaBhailoSong() {
    if (this.isBhailoPlaying || this.isMusicMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBhailoPlaying = true;
    const melody = [
      { freq: 392.0, madal: "low" },   // G4 "Bhai-"
      { freq: 392.0, madal: null },    // G4 "-li-"
      { freq: 440.0, madal: "high" },   // A4 "-ni"
      { freq: 392.0, madal: null },    // G4 "aai-"
      { freq: 329.63, madal: "low" },  // E4 "-na"
      { freq: 293.66, madal: null },   // D4 "aan-"
      { freq: 329.63, madal: "high" },  // E4 "-gan"
      { freq: 392.0, madal: null },    // G4 "ba-"
      { freq: 440.0, madal: "low" },   // A4 "-ri"
      { freq: 493.88, madal: null },   // B4 "lai,"
      { freq: 440.0, madal: "high" },  // A4 "he"
      { freq: 392.0, madal: null },    // G4 "aa-"
      { freq: 329.63, madal: "low" },  // E4 "-ma"
      { freq: 392.0, madal: null },    // G4 "bhai-"
      { freq: 392.0, madal: "high" },  // G4 "-lo!"
      { freq: 0, madal: null },        // Rest
    ];

    let step = 0;
    const stepDuration = 185; // ms per eighth note

    const playStep = () => {
      if (!this.isBhailoPlaying || this.isMusicMuted || !this.ctx) return;
      const note = melody[step % melody.length];
      const now = this.ctx.currentTime;

      // Play Bansuri / Harmonium flute note
      if (note.freq > 0) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Warm bamboo bansuri harmonics
        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(note.freq * 2.8, now);

        const vol = 0.16 * this.musicVolume;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      }

      // Play accompanying Madal strike
      if (note.madal === "low") {
        this.playMadalBeat("low");
      } else if (note.madal === "high") {
        this.playMadalBeat("high");
      }

      step++;
    };

    playStep();
    this.bhailoInterval = setInterval(playStep, stepDuration);
  }

  /** Stop Aama Bhailo song */
  public stopAamaBhailoSong() {
    this.isBhailoPlaying = false;
    if (this.bhailoInterval) {
      clearInterval(this.bhailoInterval);
      this.bhailoInterval = null;
    }
  }
}

export const soundManager = new SoundEngine();
