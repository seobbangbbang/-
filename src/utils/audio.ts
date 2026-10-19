/**
 * Web Audio API synthesizer for cute game sounds & kawaii BGM
 * Completely self-contained: no external audio assets needed!
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isBgmMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // AudioContext will be initialized upon first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enableAudio() {
    this.initContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setBgmMuted(muted: boolean) {
    this.isBgmMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
  }

  public getIsBgmMuted(): boolean {
    return this.isBgmMuted;
  }

  // --- Sound Effects ---

  // 1. Move tick (gentle cute bubble pop)
  public playMove() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 2. Rotate chirp (cute rising sweep)
  public playRotate() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // 3. Soft drop tick
  public playSoftDrop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  // 4. Hard drop juicy thud
  public playHardDrop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Sub bass impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    // Cute high 'pop' click
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(900, now);
    click.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    click.connect(clickGain);
    clickGain.connect(this.sfxGain);

    osc.start(now);
    click.start(now);
    osc.stop(now + 0.16);
    click.stop(now + 0.05);
  }

  // 5. Hold piece swap
  public playHold() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [659.25, 880]; // E5, A5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.12);
    });
  }

  // 6. Line clear with combo multiplier
  public playLineClear(lines: number, combo: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Pitch rises with combo
    const comboOffset = Math.min(combo * 1.5, 8);
    const baseFreqs = lines >= 4
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6
      : lines === 3
      ? [440, 554.37, 659.25, 880]               // A4, C#5, E5, A5
      : lines === 2
      ? [523.25, 659.25, 783.99]                 // C5, E5, G5
      : [523.25, 659.25];                        // C5, E5

    baseFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const pitch = freq * Math.pow(2, comboOffset / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + i * 0.055;

      osc.type = lines >= 4 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(pitch, now);

      const duration = lines >= 4 ? 0.35 : 0.2;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // 7. Tetris 4-Line Clear Celebration (Bespoke sparkle chords)
  public playTetris() {
    this.playLineClear(4, 3);
  }

  // 8. Level Up
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + i * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  // 9. Game Over cute sad sigh
  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  // --- Cute Lo-Fi Kawaii Chiptune BGM Generator ---
  public startBgm() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Melody: Cute bouncy pentatonic notes in C major (C4, D4, E4, G4, A4, C5, D5, E5)
    // 16-step kawaii loop:
    const melody = [
      { note: 523.25, len: 0.14 }, // C5
      { note: 659.25, len: 0.14 }, // E5
      { note: 783.99, len: 0.14 }, // G5
      { note: 659.25, len: 0.14 }, // E5
      { note: 880.00, len: 0.22 }, // A5
      { note: 783.99, len: 0.14 }, // G5
      { note: 659.25, len: 0.22 }, // E5
      { note: 523.25, len: 0.14 }, // C5
      { note: 587.33, len: 0.14 }, // D5
      { note: 659.25, len: 0.14 }, // E5
      { note: 587.33, len: 0.14 }, // D5
      { note: 440.00, len: 0.22 }, // A4
      { note: 523.25, len: 0.28 }, // C5
      { note: 0,      len: 0.14 }, // rest
      { note: 659.25, len: 0.14 }, // E5
      { note: 783.99, len: 0.24 }, // G5
    ];

    const bass = [
      261.63, // C4
      261.63,
      220.00, // A3
      220.00,
      174.61, // F3
      174.61,
      196.00, // G3
      196.00,
    ];

    const stepInterval = 210; // ms per 16th beat (~142 BPM cute shuffle)

    const tick = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;
      const step = this.bgmStep % melody.length;
      const item = melody[step];

      // Play lead note
      if (item.note > 0 && !this.isBgmMuted) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Soft marimba-like bell tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.note, now);

        noteGain.gain.setValueAtTime(0.12, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + item.len);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + item.len);
      }

      // Play soft bass every 2 steps
      if (this.bgmStep % 2 === 0 && !this.isBgmMuted) {
        const bassIdx = Math.floor((this.bgmStep / 2) % bass.length);
        const bassFreq = bass[bassIdx];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bassFreq, now);

        bGain.gain.setValueAtTime(0.14, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);

        bOsc.start(now);
        bOsc.stop(now + 0.32);
      }

      this.bgmStep++;
      this.bgmTimer = window.setTimeout(tick, stepInterval);
    };

    tick();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new SoundEngine();
