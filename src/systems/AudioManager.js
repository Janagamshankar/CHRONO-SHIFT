import { settingsManager } from './SettingsManager.js';

/**
 * AudioManager - Comprehensive Procedural Sci-Fi Audio System
 * Powered by Web Audio API synthesizers for 100% self-contained, zero-dependency,
 * zero-latency sci-fi sound effects, dynamic music, and temporal filtering.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;

    // Master bus nodes
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.freezeFilter = null; // Low-pass filter for Chrono Freeze time-suspension

    // Music playback state
    this.isPlayingMusic = false;
    this.musicLoopTimer = null;
    this.activeMusicNodes = [];
    this.currentBar = 0;

    // Active hazard loops (for laser hum, blade whir, etc.)
    this.activeLoops = new Map();

    // Volume cache
    this.masterVol = settingsManager.get('masterVolume') / 100;
    this.musicVol = settingsManager.get('musicVolume') / 100;
    this.sfxVol = settingsManager.get('sfxVolume') / 100;
    this.isMuted = settingsManager.get('isMuted') || false;

    // Listen to settings changes
    settingsManager.subscribe((settings) => {
      this.masterVol = (settings.masterVolume ?? 80) / 100;
      this.musicVol = (settings.musicVolume ?? 70) / 100;
      this.sfxVol = (settings.sfxVolume ?? 90) / 100;
      this.isMuted = settings.isMuted || false;
      this.updateGainLevels();
    });
  }

  /**
   * Initializes the AudioContext upon user gesture (click/keydown)
   * Complies strictly with browser autoplay policies.
   */
  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => { });
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();

      // Master bus
      this.masterGain = this.ctx.createGain();

      // Freeze low-pass filter (normal: 20000Hz, frozen: 360Hz)
      this.freezeFilter = this.ctx.createBiquadFilter();
      this.freezeFilter.type = 'lowpass';
      this.freezeFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
      this.freezeFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Separate sub-busses
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      // Signal routing:
      // Music -> FreezeFilter -> MasterGain -> Destination
      // SFX -> MasterGain -> Destination
      this.musicGain.connect(this.freezeFilter);
      this.freezeFilter.connect(this.masterGain);

      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateGainLevels();
      this.isInitialized = true;

      // Resume context if suspended by browser
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => { });
      }
    } catch (err) {
      console.warn('[AudioManager] Web Audio initialization deferred:', err);
    }
  }

  updateGainLevels() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const effectiveMaster = this.isMuted ? 0 : this.masterVol;

    this.masterGain.gain.setValueAtTime(effectiveMaster, now);
    this.musicGain.gain.setValueAtTime(this.musicVol * 0.45, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVol, now);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    settingsManager.set('isMuted', this.isMuted);
    this.updateGainLevels();
    return this.isMuted;
  }

  // ==========================================
  // SFX SYNTHESIS ENGINE
  // ==========================================

  play(soundId, options = {}) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      switch (soundId) {
        // --- PLAYER MOVEMENT ---
        case 'jump':
          this.synthJump(now);
          break;
        case 'land':
          this.synthLand(now);
          break;
        case 'slide':
          this.synthSlide(now);
          break;
        case 'footstep':
          this.synthFootstep(now);
          break;

        // --- CHRONO ABILITIES ---
        case 'dash':
          this.synthDash(now);
          break;
        case 'dashEnd':
          this.synthDashEnd(now);
          break;
        case 'freeze':
          this.synthFreeze(now);
          this.applyTemporalFilter(true);
          break;
        case 'freezeRelease':
          this.synthFreezeRelease(now);
          this.applyTemporalFilter(false);
          break;
        case 'abilityReject':
          this.synthReject(now);
          break;

        // --- HAZARDS & COMBAT ---
        case 'laserCharge':
          this.synthLaserCharge(now, options.duration || 1.2);
          break;
        case 'laserFire':
          this.synthLaserFire(now, options.duration || 1.6);
          break;
        case 'bladeWhir':
          this.synthBladeWhir(now);
          break;
        case 'plasmaShoot':
          this.synthPlasmaShoot(now);
          break;
        case 'plasmaExplode':
          this.synthPlasmaExplode(now);
          break;
        case 'platformCrumble':
          this.synthPlatformCrumble(now);
          break;
        case 'damage':
          this.synthDamage(now);
          break;
        case 'death':
          this.synthDeath(now);
          break;
        case 'respawn':
          this.synthRespawn(now);
          break;

        // --- PROGRESSION & OBJECTIVES ---
        case 'checkpoint':
          this.synthCheckpoint(now);
          break;
        case 'cellPickup':
          this.synthCellPickup(now);
          break;
        case 'pylonCalibrate':
          this.synthPylonCalibrate(now);
          break;
        case 'corePulse':
          this.synthCorePulse(now);
          break;
        case 'barrierHum':
          this.synthBarrierHum(now);
          break;
        case 'coreStabilize':
          this.synthCoreStabilize(now);
          break;
        case 'victory':
          this.synthVictory(now);
          break;

        // --- UI ---
        case 'uiClick':
          this.synthUiClick(now);
          break;
        case 'uiHover':
          this.synthUiHover(now);
          break;
      }
    } catch (e) {
      // Audio errors must never crash gameplay
    }
  }

  // --- INDIVIDUAL SYNTHESIZERS ---

  synthJump(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.12);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  synthLand(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  synthSlide(t) {
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.25);
  }

  synthFootstep(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  synthDash(t) {
    // 1. Synth sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.25);

    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.27);
  }

  synthDashEnd(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  synthFreeze(t) {
    // Deep sub-bass pulse + crystal chord
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, t);
    sub.frequency.exponentialRampToValueAtTime(40, t + 0.45);
    subGain.gain.setValueAtTime(0.45, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.46);

    // Crystalline triad (E5, G#5, B5)
    [659, 830, 987].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + idx * 0.1);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  synthFreezeRelease(t) {
    // Frost shatter crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  synthReject(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  synthLaserCharge(t, duration = 1.2) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + duration);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + duration * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  synthLaserFire(t, duration = 1.6) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.setValueAtTime(0.18, t + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  synthBladeWhir(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.2);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  synthPlasmaShoot(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(640, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);
    gain.gain.setValueAtTime(0.26, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  synthPlasmaExplode(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);
    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  synthPlatformCrumble(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(75, t);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  synthDamage(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  synthDeath(t) {
    // Slow temporal collapse chord
    [180, 135, 90].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.8 + idx * 0.2);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9 + idx * 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  synthRespawn(t) {
    // Uplifting harmonic chord (D4, F#4, A4, D5)
    [293, 370, 440, 587].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.22, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + idx * 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + 0.6);
    });
  }

  synthCheckpoint(t) {
    // Joyful crystal triad (C5, E5, G5, C6)
    [523, 659, 783, 1046].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.24, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45 + idx * 0.07);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + 0.6);
    });
  }

  synthCellPickup(t) {
    [880, 1320].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.22, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + idx * 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + 0.4);
    });
  }

  synthPylonCalibrate(t) {
    // Ascending harmonic chime: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.24, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + idx * 0.07);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + 0.7);
    });
  }

  synthCorePulse(t) {
    // Deep spatial sub-bass reactor sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.45);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.52);
  }

  synthBarrierHum(t) {
    // High-voltage electromagnetic barrier engagement
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.3);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  synthCoreStabilize(t) {
    // Grand harmonic chord
    [220, 277, 330, 440, 554, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  synthVictory(t) {
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.26, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7 + idx * 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.12);
      osc.stop(t + 1.2);
    });
  }

  synthUiClick(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  synthUiHover(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  // ==========================================
  // DYNAMIC CHRONO FREEZE FILTER
  // ==========================================

  applyTemporalFilter(isFrozen) {
    if (!this.ctx || !this.freezeFilter) return;
    const now = this.ctx.currentTime;
    if (isFrozen) {
      // Muffle background music to low frequencies (360Hz) during time freeze
      this.freezeFilter.frequency.exponentialRampToValueAtTime(360, now + 0.15);
    } else {
      // Restore full spectrum (20000Hz) upon thaw
      this.freezeFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.2);
    }
  }

  // ==========================================
  // PROCEDURAL CYBERPUNK MUSIC ENGINE
  // ==========================================

  startMusic() {
    this.init();
    if (this.isPlayingMusic || !this.ctx) return;
    this.isPlayingMusic = true;
    this.currentBar = 0;
    this.scheduleNextBar();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicLoopTimer) {
      clearTimeout(this.musicLoopTimer);
      this.musicLoopTimer = null;
    }
    this.activeMusicNodes.forEach(n => {
      try { n.stop(); } catch (e) { }
    });
    this.activeMusicNodes = [];
  }

  scheduleNextBar() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const barDuration = 2.4; // 100 BPM (4 beats per bar)
    const now = this.ctx.currentTime;

    // D minor progression: Dm -> F -> C -> Bb
    const progressions = [
      { bass: 73.42, pad: [220, 261.63, 329.63] }, // D2, A3, C4, E4
      { bass: 87.31, pad: [261.63, 329.63, 392.0] }, // F2, C4, E4, G4
      { bass: 65.41, pad: [196.0, 261.63, 329.63] }, // C2, G3, C4, E4
      { bass: 58.27, pad: [233.08, 293.66, 349.23] } // Bb1, Bb3, D4, F4
    ];

    const chord = progressions[this.currentBar % progressions.length];

    // 1. Pulsing sub-bass note
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(chord.bass, now);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(240, now);

    bassGain.gain.setValueAtTime(0.22, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + barDuration * 0.95);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);

    bassOsc.start(now);
    bassOsc.stop(now + barDuration);
    this.activeMusicNodes.push(bassOsc);

    // 2. Ambient pad chord
    chord.pad.forEach(freq => {
      const padOsc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      padOsc.type = 'triangle';
      padOsc.frequency.setValueAtTime(freq, now);

      padGain.gain.setValueAtTime(0.04, now);
      padGain.gain.linearRampToValueAtTime(0.08, now + barDuration * 0.5);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + barDuration);

      padOsc.connect(padGain);
      padGain.connect(this.musicGain);
      padOsc.start(now);
      padOsc.stop(now + barDuration);
      this.activeMusicNodes.push(padOsc);
    });

    this.currentBar++;

    // Schedule next bar loop slightly ahead of time
    this.musicLoopTimer = setTimeout(() => {
      this.scheduleNextBar();
    }, (barDuration - 0.05) * 1000);
  }
}

export const audioManager = new AudioManager();
