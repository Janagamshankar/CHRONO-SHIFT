import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager.js';
import { ChronoVFX } from '../effects/ChronoVFX.js';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export class ChronoCore {
  /**
   * Chrono Core Climax Reactor & Mathematical Encounter
   * The signature finale of CHRONO SHIFT:
   * 1. Approach: Enter the Core Chamber, containment barrier engages.
   * 2. Phase 1 (Vector Harmony): Core fires vector plasma; player reads trajectory and calibrates Pylon Alpha.
   * 3. Phase 2 (Wave Resonance): Core deploys high-frequency laser harmonic; player uses Chrono Freeze [Q] to dilate time and calibrate Pylon Beta.
   * 4. Phase 3 (Singularity Convergence): Core singularity aperture exposes; player times sinusoidal platform oscillation and executes Vector Dash [E] into the Core.
   * 5. Resolution: Full temporal matrix stabilization, grand shockwaves, victory sequence.
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x; // Default: 4760
    this.y = y; // Default: 440

    this.isStabilized = false;
    this.state = 'DORMANT'; // 'DORMANT', 'PHASE_1', 'PHASE_2', 'PHASE_3', 'STABILIZED'
    this.isFrozen = false;
    this.activeTimers = [];

    // --- 1. CORE BASE INFRASTRUCTURE ---
    this.basePylon = scene.add.graphics().setDepth(15);
    this.basePylon.fillStyle(0x0c1322, 1);
    this.basePylon.fillRect(x - 45, y + 40, 90, 60);
    this.basePylon.lineStyle(2, 0x1e3a8a, 0.9);
    this.basePylon.strokeRect(x - 45, y + 40, 90, 60);

    // Anti-gravity emitter glow under base
    this.agGlow = scene.add.image(x, y + 95, 'anti_grav_glow').setScale(2.4).setDepth(14);

    // --- 2. MAIN SINGULARITY REACTOR CORE ---
    this.coreSprite = scene.add.image(x, y, 'chrono_core_reactor').setDepth(18).setScale(1.35);

    // Continuous rotation of outer magnetic field
    this.coreRotateTween = scene.tweens.add({
      targets: this.coreSprite,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });

    // Breathing pulse of core energy
    this.corePulseTween = scene.tweens.add({
      targets: this.coreSprite,
      scale: 1.5,
      yoyo: true,
      duration: 1400,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- 3. FLOATING TEMPORAL FLUX RINGS ---
    this.ring1 = scene.add.image(x, y, 'vfx_shockwave_ring').setScale(0.8).setDepth(17).setTint(0x00f0ff);
    this.ring2 = scene.add.image(x, y, 'vfx_shockwave_ring').setScale(0.5).setDepth(17).setTint(0xa855f7);

    this.ringTween = scene.tweens.add({
      targets: this.ring1,
      scale: 1.7,
      alpha: 0.15,
      yoyo: true,
      duration: 1800,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Outer Containment Shield graphics (active in Phases 1 & 2)
    this.shieldGfx = scene.add.graphics().setDepth(19);

    // --- 4. HOLOGRAPHIC OBJECTIVE & MATHEMATICAL TELEMETRY ---
    this.objectiveLabel = scene.add.text(x, y - 110, 'CHRONO CORE SINGULARITY NEXUS', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(25);

    this.statusLabel = scene.add.text(x, y - 88, '[CRITICAL INSTABILITY: APPROACH CHAMBER]', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#ef4444',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25);

    this.scene.tweens.add({
      targets: this.statusLabel,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 400
    });

    // Live Mathematical Telemetry Hologram Panel
    this.telemetryBox = scene.add.graphics().setDepth(24);
    this.telemetryText = scene.add.text(x, y - 56, '', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '12px',
      fontWeight: '700',
      color: '#38bdf8',
      align: 'center',
      lineSpacing: 3
    }).setOrigin(0.5).setDepth(25);

    // Dynamic Geometry Lines Graphic
    this.geometryGfx = scene.add.graphics().setDepth(16);

    // --- 5. ARCADE PHYSICS TRIGGER ZONE (CORE APERTURE) ---
    this.triggerZone = scene.physics.add.sprite(x, y, null);
    this.triggerZone.setVisible(false);
    this.triggerZone.body.setSize(90, 90);
    this.triggerZone.body.setAllowGravity(false);
    this.triggerZone.body.setImmovable(true);
    this.triggerZone.parentCore = this;

    // --- 6. FLUX PYLONS (ALPHA & BETA) ---
    this.pylonAlpha = this.createFluxPylon(x - 180, 505, 'α', 'ALPHA', 0x00f0ff);
    this.pylonBeta = this.createFluxPylon(x + 180, 505, 'β', 'BETA', 0xa855f7);

    // --- 7. MOVING SINUSOIDAL HARMONIC PLATFORM ---
    this.sinePlatformX0 = x;
    this.sinePlatformY = 535;
    this.sinePlatformAmp = 85;
    this.sinePlatformSpeed = 1.8;
    this.sinePlatformTime = 0;

    this.sinePlatform = scene.physics.add.image(x, this.sinePlatformY, 'sine_platform').setDepth(17);
    this.sinePlatform.body.setAllowGravity(false);
    this.sinePlatform.body.setImmovable(true);
    this.sinePlatform.body.setSize(80, 18);
    this.sinePlatform.body.checkCollision.down = false;
    this.sinePlatform.body.checkCollision.left = false;
    this.sinePlatform.body.checkCollision.right = false;

    // Chrono Freeze eligibility for the platform
    this.sinePlatform.freeze = (dur) => {
      this.isPlatformFrozen = true;
      this.sinePlatform.setTint(0x00f0ff);
      scene.time.delayedCall(dur, () => {
        this.sinePlatform.thaw();
      });
    };
    this.sinePlatform.thaw = () => {
      this.isPlatformFrozen = false;
      this.sinePlatform.clearTint();
    };
    this.isPlatformFrozen = false;

    // --- 8. ARENA ENTRANCE CONTAINMENT BARRIER ---
    this.barrierX = x - 300; // 4460
    this.barrier = scene.physics.add.image(this.barrierX, 510, 'arena_barrier_field').setDepth(17);
    this.barrier.body.setAllowGravity(false);
    this.barrier.body.setImmovable(true);
    this.barrier.body.setSize(20, 240);
    this.barrier.setVisible(false);
    this.barrier.body.enable = false;

    // Barrier label
    this.barrierLabel = scene.add.text(this.barrierX, 390, '// CONTAINMENT FIELD //', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25).setVisible(false);

    // --- 9. RESONANT LASER HARMONIC HAZARDS (PHASE 2) ---
    this.laser1X = x - 60; // 4700
    this.laser2X = x + 60; // 4820
    this.harmonicLasers = this.createHarmonicLasers();

    // --- 10. ARENA RECHARGE CELLS ---
    this.arenaCells = this.createArenaCells();

    // --- 11. COMBAT / ENCOUNTER TIMERS ---
    this.plasmaAttackTimer = 0;
    this.corePulseAttackTimer = 0;
    this.activeProjectiles = scene.physics.add.group();
  }

  createFluxPylon(x, y, symbol, name, tint) {
    const node = this.scene.add.image(x, y, 'pylon_flux_node').setDepth(16).setTint(tint);
    const glyph = this.scene.add.image(x, y - 40, symbol === 'α' ? 'pylon_glyph_alpha' : 'pylon_glyph_beta').setDepth(17);

    // Floating pulsing glyph
    this.scene.tweens.add({
      targets: glyph,
      y: y - 48,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Holographic label
    const label = this.scene.add.text(x, y - 64, `[PYLON ${symbol}]`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: symbol === 'α' ? '#00f0ff' : '#c084fc',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(25);

    // Arcade trigger zone
    const trigger = this.scene.physics.add.sprite(x, y - 10, null);
    trigger.setVisible(false);
    trigger.body.setSize(44, 70);
    trigger.body.setAllowGravity(false);
    trigger.body.setImmovable(true);

    return {
      x,
      y,
      symbol,
      name,
      tint,
      node,
      glyph,
      label,
      trigger,
      isCalibrated: false,
      beamLine: null
    };
  }

  createHarmonicLasers() {
    const lasers = [];
    [this.laser1X, this.laser2X].forEach((lx, idx) => {
      const topCap = this.scene.add.image(lx, 440, 'hazard_laser_emitter').setDepth(17).setFlipY(true);
      const botCap = this.scene.add.image(lx, 615, 'hazard_laser_emitter').setDepth(17);
      topCap.setVisible(false);
      botCap.setVisible(false);

      const gfx = this.scene.add.graphics().setDepth(16);

      const hitbox = this.scene.physics.add.sprite(lx, 528, null);
      hitbox.setVisible(false);
      hitbox.body.setSize(12, 160);
      hitbox.body.setAllowGravity(false);
      hitbox.body.setImmovable(true);
      hitbox.body.enable = false;

      const laserObj = {
        x: lx,
        topCap,
        botCap,
        gfx,
        hitbox,
        isActive: false,
        isFrozen: false,
        phaseOffset: idx * Math.PI,
        damage: 20
      };

      // Chrono Freeze capability
      laserObj.freeze = (dur) => {
        laserObj.isFrozen = true;
        laserObj.hitbox.body.enable = false;
        laserObj.topCap.setTint(0x00f0ff);
        laserObj.botCap.setTint(0x00f0ff);
        this.scene.time.delayedCall(dur, () => {
          laserObj.thaw();
        });
      };
      laserObj.thaw = () => {
        laserObj.isFrozen = false;
        laserObj.topCap.clearTint();
        laserObj.botCap.clearTint();
      };

      lasers.push(laserObj);
    });

    return lasers;
  }

  createArenaCells() {
    const cells = [];
    const positions = [
      { x: this.x - 180, y: 430 },
      { x: this.x + 180, y: 430 }
    ];

    positions.forEach(pos => {
      const orb = this.scene.physics.add.image(pos.x, pos.y, 'cell_orb').setDepth(18).setScale(1.1);
      orb.body.setAllowGravity(false);

      this.scene.tweens.add({
        targets: orb,
        y: pos.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      cells.push(orb);
    });

    return cells;
  }

  /**
   * Called on player collision with arena recharge cells
   */
  handleCellPickup(player, cell) {
    if (!cell.visible) return;
    cell.setVisible(false);
    player.rechargeEnergy(GAME_SETTINGS.CHRONO.CELL_RECHARGE_AMOUNT);
    this.scene.score += 50;

    // Fast 3-second respawn in boss arena
    this.scene.time.delayedCall(3000, () => {
      if (this.state !== 'STABILIZED') cell.setVisible(true);
    });
  }

  /**
   * Checks if player crossed threshold into the arena chamber
   */
  checkPlayerInArena(player) {
    if (this.state === 'DORMANT' && player.x >= this.x - 290) {
      this.startEncounter();
    }
  }

  /**
   * Initializes the Chrono Core Encounter Sequence
   */
  startEncounter() {
    this.state = 'PHASE_1';

    // Lock containment barrier
    this.barrier.setVisible(true);
    this.barrier.body.enable = true;
    this.barrierLabel.setVisible(true);
    audioManager.play('barrierHum');

    // Camera dramatic framing
    this.scene.cameras.main.shake(200, 0.005);
    this.statusLabel.setText('[PHASE 1: VECTOR ALIGNMENT • PYLON α REQUIRED]');
    this.statusLabel.setColor('#00f0ff');

    audioManager.play('laserCharge', { duration: 1.5 });
  }

  /**
   * Calibrates one of the mathematical flux pylons
   */
  calibratePylon(pylonKey) {
    if (this.isStabilized) return;

    if (pylonKey === 'alpha' && this.state === 'PHASE_1' && !this.pylonAlpha.isCalibrated) {
      this.pylonAlpha.isCalibrated = true;
      audioManager.play('pylonCalibrate');
      this.scene.score += 250;

      // Cyan shockwave burst
      ChronoVFX.spawnFreezeShockwave(this.scene, this.pylonAlpha.x, this.pylonAlpha.y);
      this.pylonAlpha.label.setText('[PYLON α: 100% HARMONIZED]');
      this.pylonAlpha.label.setColor('#10b981');
      this.pylonAlpha.node.setTint(0x10b981);

      // Transition to Phase 2: Resonance
      this.state = 'PHASE_2';
      this.statusLabel.setText('[PHASE 2: DILATE TIME [Q] • CALIBRATE PYLON β]');
      this.statusLabel.setColor('#c084fc');

      // Activate harmonic lasers
      this.harmonicLasers.forEach(l => {
        l.topCap.setVisible(true);
        l.botCap.setVisible(true);
      });

      audioManager.play('laserFire', { duration: 1.2 });
    } else if (pylonKey === 'beta' && this.state === 'PHASE_2' && !this.pylonBeta.isCalibrated) {
      this.pylonBeta.isCalibrated = true;
      audioManager.play('pylonCalibrate');
      this.scene.score += 250;

      // Violet shockwave burst
      ChronoVFX.spawnFreezeShockwave(this.scene, this.pylonBeta.x, this.pylonBeta.y);
      this.pylonBeta.label.setText('[PYLON β: 100% HARMONIZED]');
      this.pylonBeta.label.setColor('#10b981');
      this.pylonBeta.node.setTint(0x10b981);

      // Disable harmonic lasers
      this.harmonicLasers.forEach(l => {
        l.isActive = false;
        l.hitbox.body.enable = false;
        l.gfx.clear();
        l.topCap.setVisible(false);
        l.botCap.setVisible(false);
      });

      // Transition to Phase 3: Singularity Convergence
      this.state = 'PHASE_3';
      this.statusLabel.setText('[PHASE 3: CORE EXPOSED • PRESS [F] OR DASH [E] TO RESTORE CORE]');
      this.statusLabel.setColor('#f59e0b');

      // Core shield overload sound and flash
      audioManager.play('laserCharge', { duration: 0.8 });
      this.scene.cameras.main.flash(300, 0, 240, 255, 0.3);
    }
  }

  /**
   * Primary frame update loop
   */
  update(time, delta, player) {
    if (this.isStabilized || !player) return;

    // 1. Check entry into arena
    this.checkPlayerInArena(player);

    // 2. Update Sinusoidal Resonance Platform
    if (!this.isPlatformFrozen) {
      this.sinePlatformTime += (delta / 1000) * this.sinePlatformSpeed;
      const targetX = this.sinePlatformX0 + Math.sin(this.sinePlatformTime) * this.sinePlatformAmp;
      const prevX = this.sinePlatform.x;
      this.sinePlatform.x = targetX;
      this.sinePlatform.body.updateFromGameObject();

      // Platform velocity for rider carry
      const platVx = ((targetX - prevX) / (delta / 1000));
      this.sinePlatform.platVx = platVx;
    }

    // 3. Update Visual Shield around Core (Active in Phase 1 & 2)
    this.shieldGfx.clear();
    if (this.state === 'PHASE_1' || this.state === 'PHASE_2') {
      const shieldRadius = 58 + Math.sin(time * 0.005) * 4;
      this.shieldGfx.lineStyle(2, this.state === 'PHASE_1' ? 0x00f0ff : 0xa855f7, 0.75);
      this.shieldGfx.strokeCircle(this.x, this.y, shieldRadius);

      // Rotating vector hash marks on containment shield
      for (let i = 0; i < 4; i++) {
        const ang = time * 0.002 + (i * Math.PI) / 2;
        const hx1 = this.x + Math.cos(ang) * (shieldRadius - 6);
        const hy1 = this.y + Math.sin(ang) * (shieldRadius - 6);
        const hx2 = this.x + Math.cos(ang) * (shieldRadius + 6);
        const hy2 = this.y + Math.sin(ang) * (shieldRadius + 6);
        this.shieldGfx.lineBetween(hx1, hy1, hx2, hy2);
      }
    }

    // 4. Update Dynamic Geometry and Trajectory Lines
    this.geometryGfx.clear();

    // Render calibrated pylon flux conduit lines to Core
    if (this.pylonAlpha.isCalibrated) {
      this.geometryGfx.lineStyle(2, 0x00f0ff, 0.85);
      this.geometryGfx.lineBetween(this.pylonAlpha.x, this.pylonAlpha.y - 40, this.x - 30, this.y + 10);
    }
    if (this.pylonBeta.isCalibrated) {
      this.geometryGfx.lineStyle(2, 0xa855f7, 0.85);
      this.geometryGfx.lineBetween(this.pylonBeta.x, this.pylonBeta.y - 40, this.x + 30, this.y + 10);
    }

    // 5. Phase-Specific Mechanics & Mathematical Telemetry Readout
    this.updatePhaseLogic(time, delta, player);
  }

  updatePhaseLogic(time, delta, player) {
    const isFrozen = player.isFreezeActive;

    // --- PHASE 1: VECTOR ALIGNMENT ---
    if (this.state === 'PHASE_1') {
      // Directional vector from Core to Pylon Alpha
      const dx = this.pylonAlpha.x - this.x;
      const dy = (this.pylonAlpha.y - 40) - this.y;
      const angleDeg = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
      const dist = Math.round(Math.hypot(dx, dy));

      // Draw dotted vector guide line from Core to Pylon Alpha
      this.geometryGfx.lineStyle(1.5, 0x00f0ff, 0.45);
      for (let step = 0; step < dist; step += 18) {
        const t1 = step / dist;
        const t2 = Math.min(1, (step + 10) / dist);
        this.geometryGfx.lineBetween(this.x + dx * t1, this.y + dy * t1, this.x + dx * t2, this.y + dy * t2);
      }

      // Live Telemetry Readout
      const pVx = Math.round(player.body ? player.body.velocity.x : 0);
      const pVy = Math.round(player.body ? player.body.velocity.y : 0);
      this.telemetryText.setText([
        `// MATHEMATICAL TELEMETRY: VECTOR DYNAMICS //`,
        `FLUX VECTOR: v = (-180, +65) | θ = ${angleDeg}° | |v| = ${dist}px`,
        `OPERATIVE VECTOR: v = (${pVx}, ${pVy}) | STATUS: INTERCEPT PYLON α`
      ]);

      // Core Hazard: Vector Plasma Surge along readable trajectory
      if (!isFrozen) {
        this.plasmaAttackTimer += delta;
        if (this.plasmaAttackTimer > 2200) {
          this.plasmaAttackTimer = 0;
          this.fireVectorPlasma(player);
        }
      }
    }

    // --- PHASE 2: WAVE RESONANCE ---
    else if (this.state === 'PHASE_2') {
      // Update Harmonic Lasers (Frequency f = 1.25 Hz, Period T = 0.8s)
      this.harmonicLasers.forEach(laser => {
        if (laser.isFrozen) {
          // Render frozen cyan crystalline beam
          laser.gfx.clear();
          laser.gfx.lineStyle(8, 0x00f0ff, 0.5);
          laser.gfx.lineBetween(laser.x, 440, laser.x, 615);
          laser.gfx.lineStyle(2, 0xffffff, 0.9);
          laser.gfx.lineBetween(laser.x, 440, laser.x, 615);
          return;
        }

        const waveVal = Math.sin(time * 0.005 + laser.phaseOffset);
        laser.gfx.clear();

        if (waveVal > 0.1) {
          // Active lethal beam
          laser.isActive = true;
          laser.hitbox.body.enable = true;
          laser.topCap.setTint(0xef4444);
          laser.botCap.setTint(0xef4444);

          laser.gfx.lineStyle(10, 0xef4444, 0.4);
          laser.gfx.lineBetween(laser.x, 440, laser.x, 615);
          laser.gfx.lineStyle(4, 0xf59e0b, 0.8);
          laser.gfx.lineBetween(laser.x, 440, laser.x, 615);
          laser.gfx.lineStyle(1.5, 0xffffff, 1.0);
          laser.gfx.lineBetween(laser.x, 440, laser.x, 615);
        } else if (waveVal > -0.3) {
          // Warning charge filament
          laser.isActive = false;
          laser.hitbox.body.enable = false;
          laser.topCap.setTint(0xf59e0b);
          laser.botCap.setTint(0xf59e0b);

          laser.gfx.lineStyle(1.5, 0xf59e0b, 0.6);
          laser.gfx.lineBetween(laser.x, 440, laser.x, 615);
        } else {
          // Cooling inactive
          laser.isActive = false;
          laser.hitbox.body.enable = false;
          laser.topCap.clearTint();
          laser.botCap.clearTint();
        }
      });

      // Live Telemetry Readout
      this.telemetryText.setText([
        `// MATHEMATICAL TELEMETRY: PERIODIC OSCILLATION //`,
        `HARMONIC FREQUENCY: f = 1.25 Hz | PERIOD: T = 0.80s`,
        `TEMPORAL STATE: ${isFrozen ? '[DILATED: Δt = 2.0s • SAFE CROSSING]' : '[NOMINAL: FREEZE [Q] TO CROSS TO PYLON β]'}`
      ]);
      this.telemetryText.setColor(isFrozen ? '#00f0ff' : '#c084fc');
    }

    // --- PHASE 3: SINGULARITY CONVERGENCE ---
    else if (this.state === 'PHASE_3') {
      const omega = this.sinePlatformSpeed.toFixed(2);
      const phaseAngle = Math.round(((this.sinePlatformTime % (Math.PI * 2)) / (Math.PI * 2)) * 360);

      // Draw sinusoidal wave path arc below platform
      this.geometryGfx.lineStyle(1.5, 0x00f0ff, 0.5);
      this.geometryGfx.beginPath();
      for (let px = this.sinePlatformX0 - this.sinePlatformAmp; px <= this.sinePlatformX0 + this.sinePlatformAmp; px += 4) {
        const offset = px - this.sinePlatformX0;
        const py = this.sinePlatformY + Math.sin(offset * 0.05) * 8 + 14;
        if (px === this.sinePlatformX0 - this.sinePlatformAmp) this.geometryGfx.moveTo(px, py);
        else this.geometryGfx.lineTo(px, py);
      }
      this.geometryGfx.strokePath();

      // Trajectory vector arrow pointing to Core
      this.geometryGfx.lineStyle(2, 0xf59e0b, 0.8);
      this.geometryGfx.lineBetween(this.sinePlatform.x, this.sinePlatform.y - 12, this.x, this.y + 40);

      // Live Telemetry Readout
      this.telemetryText.setText([
        `// MATHEMATICAL TELEMETRY: HARMONIC CONVERGENCE //`,
        `SINE HARMONIC: x(t) = 4760 + 85·sin(${omega}·t) | PHASE: φ = ${phaseAngle}°`,
        `CONVERGENCE READY: JUMP PLATFORM & EXECUTE VECTOR DASH [E] INTO CORE!`
      ]);
      this.telemetryText.setColor('#f59e0b');

      // Core Radial Pulse Wave Hazard
      if (!isFrozen) {
        this.corePulseAttackTimer += delta;
        if (this.corePulseAttackTimer > 2600) {
          this.corePulseAttackTimer = 0;
          this.fireSingularityPulse();
        }
      }
    }

    // --- STABILIZED ---
    else if (this.state === 'STABILIZED') {
      this.telemetryText.setText([
        `// MATHEMATICAL TELEMETRY: TEMPORAL RESOLUTION //`,
        `SPACETIME CONTINUUM: RESTORED | FLUX DIVERGENCE: 0.00`,
        `ALL SECTOR ANOMALIES HARMONIZED • 100% TIMELINE STABILITY`
      ]);
      this.telemetryText.setColor('#10b981');
    }
  }

  /**
   * Fires a directional vector plasma surge toward a readable target point
   */
  fireVectorPlasma(player) {
    if (this.isStabilized || !player) return;

    // Target alternates between left and right floor areas
    const targetX = player.x < this.x ? this.x - 120 : this.x + 120;
    const targetY = 605;

    // Visual trajectory warning line
    const warnLine = this.scene.add.graphics().setDepth(16);
    warnLine.lineStyle(1.5, 0xef4444, 0.7);
    warnLine.lineBetween(this.x, this.y, targetX, targetY);

    this.scene.time.delayedCall(500, () => {
      warnLine.destroy();
      if (this.isStabilized) return;

      // Calculate exact vector
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const angle = Math.atan2(dy, dx);
      const speed = 240;

      const proj = this.scene.physics.add.sprite(this.x, this.y, 'cell_orb').setDepth(18).setScale(0.85);
      proj.setTint(0xef4444);
      proj.body.setAllowGravity(false);
      proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      proj.damage = 20;

      // Chrono Freeze capability on projectile
      proj.freeze = (dur) => {
        proj.body.velocity.x = 0;
        proj.body.velocity.y = 0;
        proj.setTint(0x00f0ff);
        this.scene.time.delayedCall(dur, () => {
          if (proj.active) {
            proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            proj.setTint(0xef4444);
          }
        });
      };

      this.scene.physics.add.overlap(player, proj, () => {
        if (!proj.isFrozen) {
          player.takeDamage(proj.damage);
          proj.destroy();
        }
      });

      // Self cleanup
      this.scene.time.delayedCall(3000, () => {
        if (proj.active) proj.destroy();
      });

      audioManager.play('plasmaShoot');
    });
  }

  /**
   * Emits expanding radial danger pulse from the Core
   */
  fireSingularityPulse() {
    if (this.isStabilized) return;
    audioManager.play('corePulse');

    // Warning contract tween on Core
    this.scene.tweens.add({
      targets: this.coreSprite,
      scale: 1.15,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        if (this.isStabilized) return;

        // Expanding radial energy ring
        const ring = this.scene.add.image(this.x, this.y, 'vfx_shockwave_ring').setDepth(17).setTint(0xf59e0b);
        ring.setScale(0.3);

        this.scene.tweens.add({
          targets: ring,
          scale: 4.5,
          alpha: 0,
          duration: 900,
          ease: 'Cubic.easeOut',
          onComplete: () => ring.destroy()
        });

        // Floor wave detection: damage player if on the low ground floor
        const player = this.scene.player;
        if (player && player.y > 580 && !player.isInvulnerable && !player.isDashing) {
          player.takeDamage(15);
        }
      }
    });
  }

  /**
   * Stabilizes the Core upon final convergence
   */
  stabilize() {
    if (this.isStabilized) return false;
    this.isStabilized = true;
    this.state = 'STABILIZED';

    audioManager.play('coreStabilize');

    // Visual transformation to radiant matrix
    this.statusLabel.setText('[TEMPORAL MATRIX STABILIZED • 100%]');
    this.statusLabel.setColor('#10b981');
    this.coreSprite.setTint(0x00f0ff);

    // Retract barrier
    if (this.barrier) {
      this.barrier.setVisible(false);
      this.barrier.body.enable = false;
    }
    if (this.barrierLabel) this.barrierLabel.setVisible(false);

    // Multi-stage radial stabilization shockwaves
    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 180, () => {
        const blast = this.scene.add.image(this.x, this.y, 'vfx_shockwave_ring').setDepth(30);
        blast.setScale(0.3);
        blast.setTint(i % 2 === 0 ? 0x00f0ff : 0xa855f7);

        this.scene.tweens.add({
          targets: blast,
          scale: 7.0,
          alpha: 0,
          duration: 800,
          ease: 'Cubic.easeOut',
          onComplete: () => blast.destroy()
        });
      });
    }

    // Camera flash and celebratory camera impulse
    this.scene.cameras.main.flash(450, 0, 240, 255, 0.4);
    this.scene.cameras.main.shake(350, 0.01);

    return true;
  }

  /**
   * Resets encounter cleanly on player death or checkpoint restart
   */
  resetEncounter() {
    this.state = 'DORMANT';
    this.isStabilized = false;
    this.statusLabel.setText('[CRITICAL INSTABILITY: APPROACH CHAMBER]');
    this.statusLabel.setColor('#ef4444');
    this.telemetryText.setText('');
    this.coreSprite.clearTint();

    if (this.barrier) {
      this.barrier.setVisible(false);
      this.barrier.body.enable = false;
    }
    if (this.barrierLabel) this.barrierLabel.setVisible(false);

    if (this.pylonAlpha) {
      this.pylonAlpha.isCalibrated = false;
      this.pylonAlpha.label.setText('[PYLON α]');
      this.pylonAlpha.label.setColor('#00f0ff');
      this.pylonAlpha.node.setTint(0x00f0ff);
    }
    if (this.pylonBeta) {
      this.pylonBeta.isCalibrated = false;
      this.pylonBeta.label.setText('[PYLON β]');
      this.pylonBeta.label.setColor('#a855f7');
      this.pylonBeta.node.setTint(0xa855f7);
    }

    this.harmonicLasers.forEach(l => {
      l.isActive = false;
      l.hitbox.body.enable = false;
      l.gfx.clear();
      l.topCap.setVisible(false);
      l.botCap.setVisible(false);
    });

    this.geometryGfx.clear();
    this.shieldGfx.clear();
  }

  destroy() {
    if (this.basePylon) this.basePylon.destroy();
    if (this.agGlow) this.agGlow.destroy();
    if (this.coreSprite) this.coreSprite.destroy();
    if (this.ring1) this.ring1.destroy();
    if (this.ring2) this.ring2.destroy();
    if (this.shieldGfx) this.shieldGfx.destroy();
    if (this.objectiveLabel) this.objectiveLabel.destroy();
    if (this.statusLabel) this.statusLabel.destroy();
    if (this.telemetryBox) this.telemetryBox.destroy();
    if (this.telemetryText) this.telemetryText.destroy();
    if (this.geometryGfx) this.geometryGfx.destroy();
    if (this.triggerZone) this.triggerZone.destroy();

    if (this.pylonAlpha) {
      if (this.pylonAlpha.node) this.pylonAlpha.node.destroy();
      if (this.pylonAlpha.glyph) this.pylonAlpha.glyph.destroy();
      if (this.pylonAlpha.label) this.pylonAlpha.label.destroy();
      if (this.pylonAlpha.trigger) this.pylonAlpha.trigger.destroy();
    }
    if (this.pylonBeta) {
      if (this.pylonBeta.node) this.pylonBeta.node.destroy();
      if (this.pylonBeta.glyph) this.pylonBeta.glyph.destroy();
      if (this.pylonBeta.label) this.pylonBeta.label.destroy();
      if (this.pylonBeta.trigger) this.pylonBeta.trigger.destroy();
    }

    if (this.sinePlatform) this.sinePlatform.destroy();
    if (this.barrier) this.barrier.destroy();
    if (this.barrierLabel) this.barrierLabel.destroy();

    this.harmonicLasers.forEach(l => {
      if (l.topCap) l.topCap.destroy();
      if (l.botCap) l.botCap.destroy();
      if (l.gfx) l.gfx.destroy();
      if (l.hitbox) l.hitbox.destroy();
    });

    this.arenaCells.forEach(c => {
      if (c && c.destroy) c.destroy();
    });
  }
}
