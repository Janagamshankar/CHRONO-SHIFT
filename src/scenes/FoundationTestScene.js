import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { settingsManager } from '../systems/SettingsManager.js';
import { audioManager } from '../systems/AudioManager.js';
import { Player } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { ChronoVFX } from '../effects/ChronoVFX.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { ChronoCore } from '../entities/ChronoCore.js';
import { LaserGate } from '../entities/hazards/LaserGate.js';
import { RotatingBlade } from '../entities/hazards/RotatingBlade.js';
import { MovingPlatform } from '../entities/hazards/MovingPlatform.js';
import { CollapsingPlatform } from '../entities/hazards/CollapsingPlatform.js';
import { PlasmaTurret } from '../entities/hazards/PlasmaTurret.js';
import { DroneHazard } from '../entities/hazards/DroneHazard.js';

export default class FoundationTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FoundationTestScene' });
  }

  create() {
    const { width, height } = this.scale;
    const worldWidth = 5120; // 4 Distinct 1280px Sections (A, B, C, D)
    const groundY = 615;

    // Start background music loop
    audioManager.startMusic();

    // 1. Authoritative Game Run State
    this.score = 0;
    this.countdownSeconds = GAME_SETTINGS.COUNTDOWN_SECONDS;
    this.currentSectionName = 'SEC A: AWAKENING';
    this.isLevelComplete = false;
    this.latestCheckpoint = { x: 120, y: groundY - 50, sectionId: 'A', title: 'SEC A: AWAKENING' };
    this.visitedSections = new Set(['A']);
    this.checkpointsActivatedCount = 0;

    // 2. Physics World & Camera Setup
    this.physics.world.setBounds(0, 0, worldWidth, height + 80);
    this.cameras.main.setBounds(0, 0, worldWidth, height);
    this.cameras.main.fadeIn(350, 5, 8, 20);

    // 3. Parallax Environment (Anchored with Camera Tracking)
    this.bgSkyGradient = this.add.image(width / 2, height / 2, 'bg_sky_gradient').setDepth(0);

    // Celestial Fractured Temporal Moon (Very slow deep celestial drift)
    this.bgMoon = this.add.image(width / 2, 140, 'celestial_temporal_moon').setDepth(1).setAlpha(0.85);

    this.bgSkyline = this.add.tileSprite(width / 2, 360, width, 400, 'bg_distant_skyline').setDepth(2).setAlpha(0.65);
    this.bgCloudsBack = this.add.tileSprite(width / 2, 450, width, 240, 'cloud_bank_layer').setDepth(3).setAlpha(0.75);
    this.bgCity = this.add.tileSprite(width / 2, 460, width, 450, 'bg_midground_city').setDepth(4).setAlpha(0.9);
    this.bgCloudsFront = this.add.tileSprite(width / 2, 530, width, 240, 'cloud_bank_layer').setDepth(5).setAlpha(0.5);

    // Distant Skyway Transit Traffic
    this.skyCruisers = [];
    const cruiserY = [220, 260, 310, 350];
    cruiserY.forEach((cy, idx) => {
      const c = this.add.image(idx * 800 + 200, cy, 'bg_skyway_traffic').setDepth(2);
      c.setAlpha(0.7);
      c.speed = 45 + idx * 25;
      this.skyCruisers.push(c);
    });

    // Near-Background Structural Tech Conduits
    const conduitPositions = [600, 1220, 1800, 2480, 3100, 3760, 4400];
    conduitPositions.forEach(cx => {
      const cond = this.add.image(cx, 440, 'near_tech_conduits').setDepth(13).setAlpha(0.6);
      cond.setScale(1.2);
    });

    // Holographic Gateway Arches at Section Boundaries
    const gateways = [
      { x: 1280, label: '// GATEWAY 02: BROKEN TIMELINE //' },
      { x: 2560, label: '// GATEWAY 03: ZERO ZONE //' },
      { x: 3840, label: '// GATEWAY 04: CHRONO CORE //' }
    ];

    gateways.forEach(g => {
      // Dual boundary laser pillar lines
      const gBeam = this.add.graphics().setDepth(14);
      gBeam.lineStyle(2, 0x00f0ff, 0.45);
      gBeam.lineBetween(g.x, 260, g.x, groundY);
      gBeam.lineStyle(1, 0xa855f7, 0.7);
      gBeam.lineBetween(g.x + 8, 260, g.x + 8, groundY);

      // Overhead holographic banner
      this.add.text(g.x, 280, g.label, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#00f0ff',
        letterSpacing: 2
      }).setOrigin(0.5).setDepth(20);
    });

    // 4. Ground Platforms & Suspended World Architecture
    this.groundPlatforms = this.physics.add.staticGroup();
    this.pitZones = this.physics.add.group();

    // Helper: Build tiled platform segment
    const buildPlatformSegment = (startX, endX, y = groundY) => {
      const tileW = 64;
      const count = Math.ceil((endX - startX) / tileW);
      for (let i = 0; i < count; i++) {
        const tx = startX + i * tileW + tileW / 2;
        if (tx <= endX) {
          const tile = this.groundPlatforms.create(tx, y, 'platform_tech_tile');
          tile.setDepth(15);
          tile.refreshBody();
          if (i % 3 === 1) {
            const ag = this.add.image(tx, y + 34, 'anti_grav_glow').setDepth(14).setAlpha(0.65);
          }
        }
      }

      // Glowing surface rail
      const rail = this.add.graphics().setDepth(16);
      rail.lineStyle(2, 0x00f0ff, 0.9);
      rail.lineBetween(startX, y - 22, endX, y - 22);
      rail.lineStyle(1, 0xffffff, 0.7);
      rail.lineBetween(startX, y - 22, endX, y - 22);
    };

    // Helper: Build void lethal pit zone
    const buildVoidPit = (startX, endX) => {
      const pitW = endX - startX;
      const pit = this.pitZones.create(startX + pitW / 2, groundY + 50, null);
      pit.setVisible(false);
      pit.body.setSize(pitW, 60);
      pit.body.setAllowGravity(false);
      pit.body.setImmovable(true);

      const hazardLine = this.add.graphics().setDepth(13);
      hazardLine.lineStyle(3, 0xef4444, 0.85);
      hazardLine.lineBetween(startX, groundY + 44, endX, groundY + 44);
      hazardLine.lineStyle(1.5, 0xf59e0b, 0.9);
      hazardLine.lineBetween(startX, groundY + 44, endX, groundY + 44);
    };

    // --- SECTION A: AWAKENING (x: 0 -> 1280) ---
    // Teach basic movement, safe running, jump, and vector dash
    buildPlatformSegment(0, 480);
    buildVoidPit(480, 620); // 140px jump gap (feasibility: max jump reach 416px)
    buildPlatformSegment(620, 920);
    buildVoidPit(920, 1100); // 180px gap with dash arrow
    buildPlatformSegment(1100, 1340);

    // Vector Jump/Dash Guide Visual in Section A
    this.add.image(960, 540, 'trajectory_arrow').setDepth(16).setScale(1.2);
    const vectorHint = this.add.text(960, 515, 'VECTOR DASH [E]', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#00f0ff',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    // Section A Control Hints
    this.add.text(180, 520, '[ A / D ] RUN • [ SPACE ] JUMP', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    this.add.text(760, 520, '[ S ] CROUCH / SLIDE TO CLEAR HAZARDS', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    // --- SECTION B: BROKEN TIMELINE (x: 1280 -> 2560) ---
    // Timed laser gates, rotating blade obstacle, moving platform
    buildPlatformSegment(1340, 1680);
    buildVoidPit(1680, 1820);
    buildPlatformSegment(1820, 2180);
    // Overhead ledge for alternative path
    buildPlatformSegment(1920, 2080, 470);
    buildVoidPit(2180, 2340);
    buildPlatformSegment(2340, 2640);

    // --- SECTION C: ZERO ZONE (x: 2560 -> 3840) ---
    // Collapsing platforms over void, plasma turret, sentinel drone
    buildPlatformSegment(2640, 2820);
    buildVoidPit(2820, 3040); // Spanned by Collapsing Platform 1
    buildPlatformSegment(3040, 3420);
    // Upper sniper / turret ledge
    buildPlatformSegment(3220, 3380, 480);
    buildVoidPit(3420, 3580);
    buildPlatformSegment(3580, 3900);

    // --- SECTION D: CHRONO CORE (x: 3840 -> 5120) ---
    // Climax set-piece: Dual hazards, synchronized laser, collapsing platform 2, and Chrono Core!
    buildPlatformSegment(3900, 4200);
    buildVoidPit(4200, 4360);
    buildPlatformSegment(4360, 4720);
    // Elevated Chrono Core reactor dais
    buildPlatformSegment(4720, 5080, groundY);

    // 5. Player Entity Setup
    this.player = new Player(this, this.latestCheckpoint.x, this.latestCheckpoint.y);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.groundPlatforms);

    // Camera follow configuration
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Void Pit Collision
    this.physics.add.overlap(this.player, this.pitZones, () => {
      this.player.takeDamage(35, 0, -320);
    });

    // 6. PHASE 5 CHECKPOINTS
    this.checkpoints = [];

    // Checkpoint A (End of Section A)
    const cpA = new Checkpoint(this, 1260, groundY, 'A', 'SEC A: AWAKENING');
    // Checkpoint B (End of Section B)
    const cpB = new Checkpoint(this, 2540, groundY, 'B', 'SEC B: BROKEN TIMELINE');
    // Checkpoint C (End of Section C)
    const cpC = new Checkpoint(this, 3820, groundY, 'C', 'SEC C: ZERO ZONE');

    this.checkpoints.push(cpA, cpB, cpC);

    this.checkpoints.forEach(cp => {
      this.physics.add.overlap(this.player, cp.triggerZone, () => {
        const res = cp.activate();
        if (res.activated) {
          this.score += res.scoreBonus;
          this.checkpointsActivatedCount++;
          this.latestCheckpoint = {
            x: cp.x,
            y: cp.y - 10,
            sectionId: cp.sectionId,
            title: cp.sectionTitle
          };
        }
      });
    });

    // 7. HAZARD & OBSTACLE ARCHITECTURE

    // --- Section B Hazards ---
    // Timed Laser Gate 1 at x: 1750
    this.laserGate1 = new LaserGate(this, 1750, 535, {
      height: 160,
      chargeMs: 1200,
      activeMs: 1600,
      coolMs: 1400,
      damage: 25
    });

    // Moving Platform 1 overhead in Section B (x: 1840 -> 2100 at y: 460)
    this.movePlatform1 = new MovingPlatform(this, 1840, 460, 2100, 460, {
      speed: 90,
      pauseDuration: 600
    });

    // Rotating Blade 1 in Section B at x: 2260, y: 558
    // Mathematical clearance: Hub y: 558, radius 28 -> lower tip at 586 -> 29px ground clearance!
    // Standing player (46px) collides; sliding player (24px) slides safely under!
    this.rotatingBlade1 = new RotatingBlade(this, 2260, 558, {
      radius: 28,
      angularSpeed: 200,
      damage: 20
    });

    // --- Section C Hazards ---
    // Collapsing Platform 1 bridging void pit at x: 2930, y: groundY
    this.colPlatform1 = new CollapsingPlatform(this, 2930, groundY, {
      warningDurationMs: 550,
      respawnDelayMs: 2500
    });

    // Sentinel Patrol Drone in Section C
    this.drone1 = new DroneHazard(this, 3100, 420, 3350, {
      speed: 80,
      damage: 20
    });

    // Plasma Turret 1 mounted at x: 3390, y: 575 firing leftward
    this.plasmaTurret1 = new PlasmaTurret(this, 3390, 575, {
      angleDeg: 180,
      fireIntervalMs: 2400,
      chargeTellMs: 600,
      projSpeed: 240,
      damage: 20,
      delayMs: 600
    });

    // --- Section D Hazards (Climax Set-Piece) ---
    // Timed Laser Gate 2 at x: 4120
    this.laserGate2 = new LaserGate(this, 4120, 535, {
      height: 160,
      chargeMs: 1000,
      activeMs: 1500,
      coolMs: 1300,
      damage: 25,
      delayMs: 400
    });

    // Rotating Blade 2 at x: 4320, y: 558
    this.rotatingBlade2 = new RotatingBlade(this, 4320, 558, {
      radius: 28,
      angularSpeed: 240,
      damage: 20
    });

    // Collapsing Platform 2 bridging final gap at x: 4480, y: groundY
    this.colPlatform2 = new CollapsingPlatform(this, 4480, groundY, {
      warningDurationMs: 500,
      respawnDelayMs: 2400
    });

    // Plasma Turret 2 mounted at x: 4700, y: 575
    this.plasmaTurret2 = new PlasmaTurret(this, 4700, 575, {
      angleDeg: 180,
      fireIntervalMs: 2200,
      chargeTellMs: 500,
      projSpeed: 250,
      damage: 20,
      delayMs: 800
    });

    // 8. CHRONO CORE FINALE REACTOR (Section D Destination)
    this.chronoCore = new ChronoCore(this, 4920, 510);
    this.physics.add.overlap(this.player, this.chronoCore.triggerZone, () => {
      this.handleLevelCompletion();
    });

    // Colliders and Overlaps for All Hazards
    this.physics.add.collider(this.player, this.colPlatform1.sprite, (player, plat) => {
      if (player.body.touching.down && plat.body.touching.up) {
        this.colPlatform1.trigger(player);
      }
    });
    this.physics.add.collider(this.player, this.colPlatform2.sprite, (player, plat) => {
      if (player.body.touching.down && plat.body.touching.up) {
        this.colPlatform2.trigger(player);
      }
    });

    this.physics.add.collider(this.player, this.movePlatform1.sprite, (player, plat) => {
      this.movePlatform1.handleRider(player);
    });

    this.physics.add.overlap(this.player, this.laserGate1.hitbox, () => {
      if (!this.laserGate1.isFrozen && this.laserGate1.state === 'ACTIVE') {
        this.player.takeDamage(this.laserGate1.damage);
      }
    });
    this.physics.add.overlap(this.player, this.laserGate2.hitbox, () => {
      if (!this.laserGate2.isFrozen && this.laserGate2.state === 'ACTIVE') {
        this.player.takeDamage(this.laserGate2.damage);
      }
    });

    this.physics.add.overlap(this.player, this.rotatingBlade1.hitbox, () => {
      if (!this.rotatingBlade1.isFrozen) {
        this.player.takeDamage(this.rotatingBlade1.damage);
      }
    });
    this.physics.add.overlap(this.player, this.rotatingBlade2.hitbox, () => {
      if (!this.rotatingBlade2.isFrozen) {
        this.player.takeDamage(this.rotatingBlade2.damage);
      }
    });

    this.physics.add.overlap(this.player, this.plasmaTurret1.projectiles, (player, proj) => {
      if (!proj.isFrozen) {
        const hit = player.takeDamage(proj.damage);
        if (hit !== false) proj.detonate();
      }
    });
    this.physics.add.overlap(this.player, this.plasmaTurret2.projectiles, (player, proj) => {
      if (!proj.isFrozen) {
        const hit = player.takeDamage(proj.damage);
        if (hit !== false) proj.detonate();
      }
    });

    this.physics.add.overlap(this.player, this.drone1, () => {
      if (!this.drone1.isFrozen) {
        this.player.takeDamage(this.drone1.damage);
      }
    });

    // 9. Chrono Energy Recharge Pickups Across All Sections
    this.energyCells = [];
    const cellPositions = [
      { x: 320, y: 550 },
      { x: 800, y: 550 },
      { x: 1540, y: 550 },
      { x: 2000, y: 400 },
      { x: 2740, y: 550 },
      { x: 3300, y: 420 },
      { x: 4040, y: 550 },
      { x: 4420, y: 550 }
    ];

    cellPositions.forEach((pos, idx) => {
      const cell = this.physics.add.image(pos.x, pos.y, 'cell_orb').setDepth(18);
      cell.body.setAllowGravity(false);
      cell.setScale(1.2);

      this.tweens.add({
        targets: cell,
        y: pos.y - 14,
        duration: 1100 + (idx % 3) * 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.physics.add.overlap(this.player, cell, () => {
        if (!cell.visible) return;
        cell.setVisible(false);
        this.player.rechargeEnergy(GAME_SETTINGS.CHRONO.CELL_RECHARGE_AMOUNT);
        this.score += 50;

        // Respawn cell after 5 seconds
        this.time.delayedCall(5000, () => {
          cell.setVisible(true);
        });
      });

      this.energyCells.push(cell);
    });

    // 10. Chrono Freeze Eligible Targets List
    this.eligibleHazards = [
      this.laserGate1,
      this.laserGate2,
      this.rotatingBlade1,
      this.rotatingBlade2,
      this.movePlatform1,
      this.colPlatform1,
      this.colPlatform2,
      this.plasmaTurret1,
      this.plasmaTurret2,
      this.drone1
    ];

    // 11. Mission Countdown Clock
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.isLevelComplete && this.countdownSeconds > 0) {
          this.countdownSeconds--;
        }
      }
    });

    // 12. In-Game Fixed Viewport HUD
    this.hud = new HUD(this);

    // 13. Input Controls Setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
      TILDE: Phaser.Input.Keyboard.KeyCodes.TILDE
    });

    // Q: Chrono Freeze activation
    this.input.keyboard.on('keydown-Q', () => {
      if (this.isLevelComplete) return;
      const res = this.player.activateChronoFreeze(this.eligibleHazards);
      this.hud.triggerAbilityPulse('freeze', res.success);
    });

    // E or Shift: Chrono Dash activation
    const triggerDash = () => {
      if (this.isLevelComplete) return;
      const res = this.player.activateChronoDash();
      this.hud.triggerAbilityPulse('dash', res.success);
    };

    this.input.keyboard.on('keydown-E', triggerDash);
    this.input.keyboard.on('keydown-SHIFT', triggerDash);

    // ESC: Return to Menu
    this.input.keyboard.on('keydown-ESC', () => {
      audioManager.applyTemporalFilter(false);
      this.scene.start('MenuScene');
    });

    // M: Toggle Audio Mute
    this.input.keyboard.on('keydown-M', () => {
      const muted = audioManager.toggleMute();
      if (this.hud && this.hud.updateAudioBadge) {
        this.hud.updateAudioBadge(muted);
      }
      audioManager.play('uiClick');
    });

    this.events.on('shutdown', () => {
      audioManager.applyTemporalFilter(false);
    });

    // Diagnostics overlay (~ or D)
    this.debugVisible = false;
    this.debugContainer = this.add.container(width / 2 + 160, 260).setDepth(55);
    this.debugContainer.setScrollFactor(0);
    const panelWidth = 560;
    const panelHeight = 220;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0f172a, 0.88);
    panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    panelBg.lineStyle(1.5, 0x00f0ff, 0.5);
    panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);

    this.diagText = this.add.text(-panelWidth / 2 + 20, -panelHeight / 2 + 16, '', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '15px',
      color: '#e2e8f0',
      lineSpacing: 5
    });
    this.debugContainer.add([panelBg, this.diagText]);
    this.debugContainer.setVisible(false);

    const toggleDiagnostics = () => {
      this.debugVisible = !this.debugVisible;
      this.debugContainer.setVisible(this.debugVisible);
    };
    this.input.keyboard.on('keydown-TILDE', toggleDiagnostics);
    this.input.keyboard.on('keydown-D', toggleDiagnostics);

    // Clean scene shutdown
    this.events.on('shutdown', () => {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.off('keydown-Q');
        this.input.keyboard.off('keydown-E');
        this.input.keyboard.off('keydown-SHIFT');
        this.input.keyboard.off('keydown-ESC');
        this.input.keyboard.off('keydown-TILDE');
        this.input.keyboard.off('keydown-D');
      }
      if (this.timerEvent) this.timerEvent.remove();
      this.checkpoints.forEach(cp => cp.destroy());
      this.eligibleHazards.forEach(h => {
        if (h && h.destroy) h.destroy();
      });
      if (this.chronoCore) this.chronoCore.destroy();
    });
  }

  /**
   * Authoritative player death & checkpoint respawn handler
   */
  handlePlayerDeath() {
    this.player.respawnAt(this.latestCheckpoint.x, this.latestCheckpoint.y);
    this.cameras.main.pan(this.latestCheckpoint.x, this.latestCheckpoint.y, 400, 'Quad.easeOut');
  }

  /**
   * Level completion sequence when Chrono Core is stabilized
   */
  handleLevelCompletion() {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;

    // Stabilize the reactor
    this.chronoCore.stabilize();

    // Freeze active hazards
    this.eligibleHazards.forEach(h => {
      if (h && h.freeze) h.freeze(999999);
    });

    // Disable player physics & movement
    this.player.setVelocity(0, 0);
    this.player.body.enable = false;

    // Calculate completion bonuses
    const timeBonus = this.countdownSeconds * 5;
    this.score += 500 + timeBonus; // 500 core bonus + time bonus

    const totalSec = Math.max(0, Math.floor(this.countdownSeconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Show victory modal overlay after short delay
    this.time.delayedCall(800, () => {
      this.hud.showVictoryOverlay({
        score: this.score,
        timeStr,
        checkpoints: this.checkpointsActivatedCount + 1
      });
    });
  }

  update(time, delta) {
    const isReduced = settingsManager.get('reducedMotion');
    const { width } = this.scale;
    const camX = this.cameras.main.scrollX;

    // 1. Dynamic Camera-Anchored Parallax Scrolling
    this.bgSkyGradient.x = camX + width / 2;
    if (this.bgMoon) {
      this.bgMoon.x = camX * 0.05 + width / 2 + 120;
    }

    if (!isReduced) {
      this.bgSkyline.x = camX + width / 2;
      this.bgSkyline.tilePositionX = camX * 0.15 + time * 0.005;

      this.bgCloudsBack.x = camX + width / 2;
      this.bgCloudsBack.tilePositionX = camX * 0.28 + time * 0.012;

      this.bgCity.x = camX + width / 2;
      this.bgCity.tilePositionX = camX * 0.45;

      this.bgCloudsFront.x = camX + width / 2;
      this.bgCloudsFront.tilePositionX = camX * 0.65 + time * 0.02;

      // Update Skyway Cruisers
      if (this.skyCruisers) {
        this.skyCruisers.forEach(c => {
          c.x += (c.speed * delta) / 1000;
          if (c.x > 5300) c.x = -100;
        });
      }
    }

    // 2. Player Movement Update
    if (this.player && !this.player.isDead && !this.isLevelComplete) {
      this.player.updateMovement(this.cursors, this.keys);
    }

    // 3. Update Current Section Progress & Score
    if (this.player) {
      const px = this.player.x;
      let currentSection = 'SEC A: AWAKENING';
      let secKey = 'A';

      if (px >= 3840) {
        currentSection = 'SEC D: CHRONO CORE';
        secKey = 'D';
      } else if (px >= 2560) {
        currentSection = 'SEC C: ZERO ZONE';
        secKey = 'C';
      } else if (px >= 1280) {
        currentSection = 'SEC B: BROKEN TIMELINE';
        secKey = 'B';
      }

      this.currentSectionName = currentSection;

      // Award +100 discovery bonus on entering a new section
      if (!this.visitedSections.has(secKey)) {
        this.visitedSections.add(secKey);
        this.score += 100;
      }
    }

    // 4. Update Hazard Systems
    if (this.laserGate1) this.laserGate1.update(time, delta);
    if (this.laserGate2) this.laserGate2.update(time, delta);
    if (this.rotatingBlade1) this.rotatingBlade1.update(time, delta);
    if (this.rotatingBlade2) this.rotatingBlade2.update(time, delta);
    if (this.movePlatform1) this.movePlatform1.update(time, delta);
    if (this.drone1) this.drone1.update(time, delta);

    if (this.plasmaTurret1 && this.plasmaTurret1.projectiles) {
      this.plasmaTurret1.projectiles.getChildren().forEach(p => {
        if (p.active && p.update) p.update(time, delta);
      });
    }
    if (this.plasmaTurret2 && this.plasmaTurret2.projectiles) {
      this.plasmaTurret2.projectiles.getChildren().forEach(p => {
        if (p.active && p.update) p.update(time, delta);
      });
    }

    // 5. Update HUD
    if (this.hud && this.player) {
      this.hud.update(this.player, this.countdownSeconds, this.score, this.currentSectionName);
    }

    // 6. Diagnostics Readout (if toggled)
    if (this.debugVisible && this.diagText && this.game.loop && this.player) {
      const p1Count = this.plasmaTurret1 ? this.plasmaTurret1.projectiles.getLength() : 0;
      const p2Count = this.plasmaTurret2 ? this.plasmaTurret2.projectiles.getLength() : 0;

      const lines = [
        `[PHASE 5 LEVEL & MATHEMATICAL DIAGNOSTICS]`,
        `FPS: ${Math.round(this.game.loop.actualFps)} / 60 | Score: ${this.score}`,
        `Current Zone: ${this.currentSectionName} | Checkpoint: CP-${this.latestCheckpoint.sectionId}`,
        `Player Vector: x:${Math.round(this.player.x)}, y:${Math.round(this.player.y)} | Facing: ${this.player.facing}`,
        `Velocity: vx:${Math.round(this.player.body.velocity.x)}, vy:${Math.round(this.player.body.velocity.y)}`,
        `Jump Apex Reach: ~416px | Dash Vector: ${this.player.isDashing ? '800 px/s' : 'IDLE'}`,
        `Laser 1 [${this.laserGate1.state}] | Laser 2 [${this.laserGate2.state}]`,
        `Blade 1: ${Math.round(this.rotatingBlade1.currentAngle)}° | Blade 2: ${Math.round(this.rotatingBlade2.currentAngle)}°`,
        `Active Projectiles: ${p1Count + p2Count} | Drone X: ${Math.round(this.drone1.x)}`,
        `Countdown: ${this.countdownSeconds}s | Core Stabilized: ${this.isLevelComplete ? 'YES' : 'NO'}`
      ];
      this.diagText.setText(lines);
    }
  }
}
