// Web Audio API Procedural Sound Synthesizer
// Clean cyber audio effects without external asset dependencies

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
    // Fix: single master GainNode that all oscillators connect through.
    // This makes global volume control trivial — change masterGain.gain.value
    // once instead of touching every sound method.
    this.masterGain = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        // Create the master gain node and wire it to the speakers once
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    // Mute/unmute via the master gain so any in-flight oscillators also go silent
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? 1.0 : 0.0;
    }
    return this.enabled;
  }

  /**
   * Set master volume (0.0 – 1.0).
   * Useful if you add a volume slider in the future.
   */
  setVolume(level) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.min(Math.max(level, 0), 1);
    }
  }

  // ─── Private helper ──────────────────────────────────────────────────────
  // Creates an oscillator + local gain, connects them to the master gain node,
  // and returns { osc, gain } ready for configuration.
  _makeOscGain() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain); // all sounds go through master gain
    return { osc, gain };
  }

  // ─── Sound effects ────────────────────────────────────────────────────────

  // Soft futuristic UI click
  playClick() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const { osc, gain } = this._makeOscGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Tactic change cyber pulse
  playTacticChange() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Two oscillators share one local gain, both routed through master gain
      const gain = this.ctx.createGain();
      gain.connect(this.masterGain);

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.connect(gain);
      osc2.connect(gain);

      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(660, now + 0.15);
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.start(now); osc2.start(now);
      osc1.stop(now + 0.22); osc2.stop(now + 0.22);
    } catch (e) {}
  }

  // Network packet flow blip
  playPacketPulse() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const { osc, gain } = this._makeOscGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // SOC alert warning chime
  playSocAlert() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const { osc, gain } = this._makeOscGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  // Impact / Ransomware explosion drone
  playImpactAlarm() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const { osc, gain } = this._makeOscGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.6);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  // Correct quiz choice chime — four-note ascending arpeggio
  playSuccess() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      // Fix: all four notes share one local gain routed through master gain,
      // rather than four separate gain→destination connections.
      const sharedGain = this.ctx.createGain();
      sharedGain.connect(this.masterGain);

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        noteGain.gain.setValueAtTime(0.08, now + idx * 0.06);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
        osc.connect(noteGain);
        noteGain.connect(sharedGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.18);
      });
    } catch (e) {}
  }

  // Incorrect quiz buzzer
  playError() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const { osc, gain } = this._makeOscGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(130, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const soundFX = new SoundFX();
