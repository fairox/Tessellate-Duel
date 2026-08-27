/**
 * Procedural Web Audio API Sound Engine for Tessellate Duel
 * Zero external audio files, ultra-low latency, crystal-clear synthesizers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Load persisted mute preference
    try {
      const saved = localStorage.getItem('tessellate_duel_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('tessellate_duel_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    if (!this.isMuted) {
      this.playStatSelect();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Card Flip: Realistic tactile card snap / flick
   */
  public playCardFlip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Card Deal: Soft airy sliding sound
   */
  public playCardDeal() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
  }

  /**
   * Stat Selection: Sleek modern tactile chime
   */
  public playStatSelect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [880, 1320, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.12, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.23);
    });
  }

  /**
   * Countdown Tick: Crisp subtle chronometer tick
   */
  public playTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 1400 : 900, now);

    gain.gain.setValueAtTime(isUrgent ? 0.2 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Pattern Resonance: Dramatic deep suspense swell & resonant chime
   */
  public playResonance() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Bass suspense drone
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(110, now);
    bass.frequency.exponentialRampToValueAtTime(55, now + 0.8);

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(400, now);
    bassFilter.frequency.exponentialRampToValueAtTime(120, now + 0.8);

    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(ctx.destination);

    bass.start(now);
    bass.stop(now + 0.9);

    // High shimmer harmonics (minor 9th tension chord)
    [587.33, 659.25, 880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.1, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.95);
    });
  }

  /**
   * Round Won / Card Capture: Satisfying ascending swoop
   */
  public playCardCapture() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  /**
   * Match Champion / Victory Fanfare: Radiant triumphant major chords
   */
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.25 },  // C5
      { f: 659.25, t: 0.15, d: 0.25 }, // E5
      { f: 783.99, t: 0.3, d: 0.35 },  // G5
      { f: 1046.5, t: 0.5, d: 0.8 },   // C6
      { f: 1318.5, t: 0.55, d: 0.8 },  // E6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }
}

export const soundEngine = new SoundEngine();
