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
    const baseHeight = Math.max(720, height);
    const groundY = 615;

    // Start background music loop
    audioManager.startMusic();

    // 1. Authoritative Game Run State
    this.score = 0;
    this.countdownSeconds = GAME_SETTINGS.COUNTDOWN_SECONDS;
    this.currentSectionName = 'SEC A: AWAKENING';
    this.isLevelComplete = false;
    this.isGameOver = false;
    this.latestCheckpoint = { x: 120, y: groundY - 50, sectionId: 'A', title: 'SEC A: AWAKENING' };
    this.visitedSections = new Set(['A']);
    this.checkpointsActivatedCount = 0;
    this.coreFragmentsCollected = 0;

    // 2. Physics World & Camera Setup (generous bottom world bounds so falls through holes are unhindered)
    this.physics.world.setBounds(0, 0, worldWidth, 2000);
    this.cameras.main.setBounds(0, 0, worldWidth, baseHeight);
    this.cameras.main.setViewport(0, 0, width, height);
    this.cameras.main.fadeIn(350, 5, 8, 20);

    // Responsive window resize listener
    this.scale.on('resize', this.onWindowResize, this);

    // Fullscreen toggle or Core Restoration interaction via [F] key
    this.input.keyboard.on('keydown-F', () => {
      if (this.chronoCore && this.chronoCore.state === 'PHASE_3' && Math.abs(this.player.x - 4760) < 180) {
        this.handleLevelCompletion();
        return;
      }
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // 3. Parallax Environment (Anchored with Camera Tracking)
    this.bgSkyGradient = this.add.image(width / 2, baseHeight / 2, 'bg_sky_gradient').setDepth(0);
    this.bgSkyGradient.setDisplaySize(Math.max(1280, width) + 300, baseHeight + 100);

    // High-resolution Aethelon Floating Sky City Matte Painting (Distant Layer)
    this.bgCityMatte = this.add.image(width / 2, baseHeight / 2, 'bg_aethelon_city')
      .setDepth(1)
      .setScale(Math.max(1.18, width / 1280))
      .setAlpha(0.92);

    this.bgSkyline = this.add.tileSprite(width / 2, 360, width + 200, 400, 'bg_distant_skyline').setDepth(2).setAlpha(0.25);
    this.bgCloudsBack = this.add.tileSprite(width / 2, 590, width + 200, 280, 'cloud_bank_layer').setDepth(3).setAlpha(0.45);
    this.bgCity = this.add.tileSprite(width / 2, 460, width + 200, 450, 'bg_midground_city').setDepth(4).setAlpha(0.3);
    this.bgCloudsFront = this.add.tileSprite(width / 2, 635, width + 200, 280, 'cloud_bank_layer').setDepth(5).setAlpha(0.4);

    // Right Edge Framing Architectural Spire Tower (Anchored to right screen edge matching reference)
    this.bgRightTower = this.add.image(width, height / 2, 'bg_right_tower')
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(12);

    // Distant Skyway Transit Traffic
    this.skyCruisers = [];
    const cruiserY = [220, 260, 310, 350];
    cruiserY.forEach((cy, idx) => {
      const c = this.add.image(idx * 800 + 200, cy, 'bg_skyway_traffic').setDepth(2);
      c.setAlpha(0.75);
      c.speed = 45 + idx * 25;
      this.skyCruisers.push(c);
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

    // Helper: Build tiled platform segment with white architectural columns & brackets
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

      // Add architectural column bracket support underneath floating platforms (Reference Recreation)
      const segW = endX - startX;
      if (segW >= 220) {
        const midX = (startX + endX) / 2;
        this.add.image(midX, y + 115, 'platform_pillar_bracket').setDepth(13);
      } else if (segW >= 120) {
        const midX = (startX + endX) / 2;
        this.add.image(midX, y + 25, 'platform_floating_small').setDepth(13);
      }

      // Glowing surface rail
      const rail = this.add.graphics().setDepth(16);
      rail.lineStyle(2, 0x00f0ff, 0.95);
      rail.lineBetween(startX, y - 22, endX, y - 22);
      rail.lineStyle(1, 0xffffff, 0.8);
      rail.lineBetween(startX, y - 22, endX, y - 22);
    };

    // Helper: Build void lethal pit zone
    const buildVoidPit = (startX, endX) => {
      const pitW = endX - startX;
      const pit = this.pitZones.create(startX + pitW / 2, groundY + 50, null);
      pit.setVisible(false);
      pit.body.setSize(pitW, 140);
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
    buildVoidPit(920, 1100); // 180px gap with dash arrow & temporal orb
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
    // Approach gauntlet (3840 -> 4460) & Chrono Core Singularity Chamber (4460 -> 5100)
    buildPlatformSegment(3840, 4140);
    buildVoidPit(4140, 4280); // 140px gap bridged by Collapsing Platform 2 at x: 4210
    buildPlatformSegment(4280, 4460); // Approach chasm platform with LaserGate 2 and RotatingBlade 2
    // Grand Chrono Core reactor chamber floor
    buildPlatformSegment(4460, 5100, groundY);
    // Elevated Pylon Daises for Pylon Alpha and Beta
    buildPlatformSegment(4530, 4630, 505);
    buildPlatformSegment(4890, 4990, 505);

    // 5. Player Entity Setup
    this.player = new Player(this, this.latestCheckpoint.x, this.latestCheckpoint.y);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.groundPlatforms);

    // Camera follow configuration
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Void Pit Collision (Lethal fall triggers immediate game over)
    this.physics.add.overlap(this.player, this.pitZones, () => {
      this.triggerGameOver('abyss');
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
          if (this.hud && this.hud.showCheckpointBanner) {
            this.hud.showCheckpointBanner(cp.sectionId, cp.sectionTitle);
          }
        }
      });
    });

    // 7. HAZARD & OBSTACLE ARCHITECTURE

    // --- Section A Hazards ---
    // Suspended Horizontal Laser Gate in Section A (Matching Reference Screenshot)
    this.laserGate0 = new LaserGate(this, 310, 220, {
      horizontal: true,
      startActive: true,
      activeMs: 3200,
      coolMs: 1400,
      chargeMs: 1200,
      damage: 25
    });

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

    // --- Section D Hazards (Approach Gauntlet & Climax Set-Piece) ---
    // Collapsing Platform 2 bridging approach gap at x: 4210, y: groundY
    this.colPlatform2 = new CollapsingPlatform(this, 4210, groundY, {
      warningDurationMs: 500,
      respawnDelayMs: 2400
    });

    // Vector Dash Trajectory Guide above approach gap
    this.add.image(4210, 530, 'trajectory_arrow').setDepth(16).setScale(1.2);
    this.add.text(4210, 505, 'VECTOR DASH [E]', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#00f0ff',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    // Timed Laser Gate 2 at x: 4340 (Synchronized approach gate)
    this.laserGate2 = new LaserGate(this, 4340, 535, {
      height: 160,
      chargeMs: 1000,
      activeMs: 1500,
      coolMs: 1300,
      damage: 25,
      delayMs: 300
    });

    // Rotating Blade 2 at x: 4410, y: 558
    this.rotatingBlade2 = new RotatingBlade(this, 4410, 558, {
      radius: 28,
      angularSpeed: 240,
      damage: 20
    });

    // 8. CHRONO CORE FINALE REACTOR (Section D Destination: Chamber Center at 4760, 440)
    this.chronoCore = new ChronoCore(this, 4760, 440);

    // Chrono Core Chamber Colliders & Overlaps
    this.physics.add.collider(this.player, this.chronoCore.barrier);

    this.physics.add.collider(this.player, this.chronoCore.sinePlatform, (player, plat) => {
      if (player.body.touching.down && plat.body.touching.up) {
        if (!this.chronoCore.isPlatformFrozen && plat.platVx) {
          player.x += plat.platVx * (1 / 60);
        }
      }
    });

    this.physics.add.overlap(this.player, this.chronoCore.pylonAlpha.trigger, () => {
      this.chronoCore.calibratePylon('alpha');
    });

    this.physics.add.overlap(this.player, this.chronoCore.pylonBeta.trigger, () => {
      this.chronoCore.calibratePylon('beta');
    });

    this.physics.add.overlap(this.player, this.chronoCore.triggerZone, () => {
      if (this.chronoCore.state === 'PHASE_3') {
        this.handleLevelCompletion();
      }
    });

    this.chronoCore.harmonicLasers.forEach(laser => {
      this.physics.add.overlap(this.player, laser.hitbox, () => {
        if (!laser.isFrozen && laser.isActive) {
          this.player.takeDamage(laser.damage);
        }
      });
    });

    this.chronoCore.arenaCells.forEach(cell => {
      this.physics.add.overlap(this.player, cell, () => {
        this.chronoCore.handleCellPickup(this.player, cell);
      });
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

    this.physics.add.overlap(this.player, this.laserGate0.hitbox, () => {
      if (!this.laserGate0.isFrozen && this.laserGate0.state === 'ACTIVE') {
        this.player.takeDamage(this.laserGate0.damage);
      }
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

    this.physics.add.overlap(this.player, this.drone1, () => {
      if (!this.drone1.isFrozen) {
        this.player.takeDamage(this.drone1.damage);
      }
    });

    // 9. Chrono Energy Recharge Pickups & Floating Temporal Orbs Across All Sections
    this.energyCells = [];
    const cellPositions = [
      { x: 320, y: 550 },
      { x: 800, y: 550 },
      { x: 960, y: 460, isTemporalOrb: true }, // The iconic Floating Temporal Orb from Reference!
      { x: 1540, y: 550 },
      { x: 2000, y: 400 },
      { x: 2740, y: 550 },
      { x: 3300, y: 420 },
      { x: 4040, y: 550 },
      { x: 4420, y: 550 }
    ];

    cellPositions.forEach((pos, idx) => {
      const tex = pos.isTemporalOrb ? 'temporal_orb' : 'temporal_orb';
      const cell = this.physics.add.image(pos.x, pos.y, tex).setDepth(18);
      cell.body.setAllowGravity(false);
      cell.setScale(pos.isTemporalOrb ? 1.05 : 0.85);

      this.tweens.add({
        targets: cell,
        y: pos.y - 12,
        duration: 1100 + (idx % 3) * 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Subtle slow rotation of concentric rings
      this.tweens.add({
        targets: cell,
        angle: 360,
        duration: 16000,
        repeat: -1,
        ease: 'Linear'
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

    // 9b. Chrono Core Fragment Collectibles (3 Fragments Required for Chrono Core Synthesis)
    this.coreFragments = [];
    const fragmentDefs = [
      { id: 1, x: 800, y: 535, label: 'CORE FRAGMENT α' },
      { id: 2, x: 2000, y: 390, label: 'CORE FRAGMENT β' },
      { id: 3, x: 3300, y: 400, label: 'CORE FRAGMENT γ' }
    ];

    fragmentDefs.forEach((fDef) => {
      const frag = this.physics.add.image(fDef.x, fDef.y, 'core_fragment').setDepth(22);
      frag.body.setAllowGravity(false);
      frag.collected = false;

      // Floating sine wave animation
      this.tweens.add({
        targets: frag,
        y: fDef.y - 12,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Subtle rotation
      this.tweens.add({
        targets: frag,
        angle: 360,
        duration: 9000,
        repeat: -1,
        ease: 'Linear'
      });

      // Ambient pulsing glow aura
      const aura = this.add.circle(fDef.x, fDef.y, 22, 0x00f0ff, 0.28).setDepth(21);
      this.tweens.add({
        targets: aura,
        scale: 1.45,
        alpha: 0.08,
        yoyo: true,
        repeat: -1,
        duration: 1000
      });

      this.physics.add.overlap(this.player, frag, () => {
        if (frag.collected) return;
        frag.collected = true;
        this.coreFragmentsCollected++;
        this.score += 250;
        audioManager.play('cellPickup');
        this.player.rechargeEnergy(100);

        // Radial temporal shockwave
        ChronoVFX.spawnFreezeShockwave(this, frag.x, frag.y);

        // Ascension pickup animation
        this.tweens.add({
          targets: [frag, aura],
          y: frag.y - 35,
          alpha: 0,
          scale: 1.6,
          duration: 350,
          onComplete: () => {
            frag.destroy();
            aura.destroy();
          }
        });

        // Holographic HUD notification banner
        if (this.hud && this.hud.showFragmentBanner) {
          this.hud.showFragmentBanner(fDef.label, this.coreFragmentsCollected);
        }
      });

      this.coreFragments.push(frag);
    });

    // 10. Chrono Freeze Eligible Targets List
    this.eligibleHazards = [
      this.laserGate0,
      this.laserGate1,
      this.laserGate2,
      this.rotatingBlade1,
      this.rotatingBlade2,
      this.movePlatform1,
      this.colPlatform1,
      this.colPlatform2,
      this.plasmaTurret1,
      this.drone1,
      this.chronoCore.sinePlatform,
      ...this.chronoCore.harmonicLasers
    ];

    // 11. Mission Countdown Clock
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.isLevelComplete && !this.isGameOver && !this.isGamePaused && this.countdownSeconds > 0) {
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
      P: Phaser.Input.Keyboard.KeyCodes.P,
      R: Phaser.Input.Keyboard.KeyCodes.R,
      TILDE: Phaser.Input.Keyboard.KeyCodes.TILDE
    });

    this.isGamePaused = false;
    this.pauseModal = null;

    // Q: Chrono Freeze activation
    this.input.keyboard.on('keydown-Q', () => {
      if (this.isLevelComplete || this.isGamePaused || this.isGameOver) return;
      const res = this.player.activateChronoFreeze(this.eligibleHazards);
      this.hud.triggerAbilityPulse('freeze', res.success);
    });

    // E or Shift: Chrono Dash activation
    const triggerDash = () => {
      if (this.isLevelComplete || this.isGamePaused || this.isGameOver) return;
      const res = this.player.activateChronoDash();
      this.hud.triggerAbilityPulse('dash', res.success);
    };

    this.input.keyboard.on('keydown-E', triggerDash);
    this.input.keyboard.on('keydown-SHIFT', triggerDash);

    // P or ESC: In-game Pause Menu
    const togglePause = () => {
      if (this.isLevelComplete || this.isGameOver) return;
      if (this.isGamePaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    };

    this.input.keyboard.on('keydown-P', togglePause);
    this.input.keyboard.on('keydown-ESC', togglePause);

    // R: Quick Restart from Checkpoint
    this.input.keyboard.on('keydown-R', () => {
      if (this.isLevelComplete) return;
      if (this.isGamePaused) this.resumeGame();
      this.handlePlayerDeath();
    });

    // QA Showcase Navigation Hotkeys [1-5]: Jump directly to any section or Core Arena
    this.input.keyboard.on('keydown-ONE', () => {
      if (this.player && !this.isLevelComplete) {
        this.player.x = 120; this.player.y = 550; this.player.setVelocity(0, 0);
      }
    });
    this.input.keyboard.on('keydown-TWO', () => {
      if (this.player && !this.isLevelComplete) {
        this.player.x = 1300; this.player.y = 550; this.player.setVelocity(0, 0);
      }
    });
    this.input.keyboard.on('keydown-THREE', () => {
      if (this.player && !this.isLevelComplete) {
        this.player.x = 2580; this.player.y = 550; this.player.setVelocity(0, 0);
      }
    });
    this.input.keyboard.on('keydown-FOUR', () => {
      if (this.player && !this.isLevelComplete) {
        this.player.x = 3860; this.player.y = 550; this.player.setVelocity(0, 0);
      }
    });
    this.input.keyboard.on('keydown-FIVE', () => {
      if (this.player && !this.isLevelComplete) {
        this.player.x = 4480; this.player.y = 550; this.player.setVelocity(0, 0);
      }
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

    // Clean scene shutdown
    this.events.on('shutdown', () => {
      audioManager.applyTemporalFilter(false);
      if (this.input && this.input.keyboard) {
        this.input.keyboard.off('keydown-Q');
        this.input.keyboard.off('keydown-E');
        this.input.keyboard.off('keydown-SHIFT');
        this.input.keyboard.off('keydown-ESC');
        this.input.keyboard.off('keydown-TILDE');
        this.input.keyboard.off('keydown-P');
        this.input.keyboard.off('keydown-R');
        this.input.keyboard.off('keydown-M');
        this.input.keyboard.off('keydown-ONE');
        this.input.keyboard.off('keydown-TWO');
        this.input.keyboard.off('keydown-THREE');
        this.input.keyboard.off('keydown-FOUR');
        this.input.keyboard.off('keydown-FIVE');
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
   * Toggles pause state and displays the in-game operations suspend menu
   */
  pauseGame() {
    if (this.isGamePaused || this.isLevelComplete) return;
    this.isGamePaused = true;
    this.physics.world.pause();
    if (this.timerEvent) this.timerEvent.paused = true;
    audioManager.play('uiClick');

    const { width, height } = this.scale;
    const modal = this.add.container(width / 2, height / 2).setDepth(65);
    modal.setScrollFactor(0);

    // Dark backdrop overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x030712, 0.85);
    overlay.setInteractive();

    // Modal frame
    const boxW = 560;
    const boxH = 410;
    const box = this.add.graphics();
    box.fillStyle(0x0a1128, 0.96);
    box.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    box.lineStyle(2, 0x00f0ff, 0.85);
    box.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);

    // Title
    const title = this.add.text(0, -boxH / 2 + 38, 'TIMELINE SUSPENDED // PAUSED', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -boxH / 2 + 68, 'CHRONO RUNTIME HALTED • CHOOSE DIRECTIVE', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5);

    modal.add([overlay, box, title, subtitle]);

    // Sub-containers for Main Pause Actions and Settings View
    const actionsContainer = this.add.container(0, 0);
    const settingsContainer = this.add.container(0, 0);
    modal.add([actionsContainer, settingsContainer]);
    settingsContainer.setVisible(false);

    // --- MAIN PAUSE ACTIONS ---
    const btnW = 300;
    const btnH = 38;
    const startY = -62;
    const spacing = 48;

    const pauseActions = [
      {
        label: 'RESUME MISSION [ESC / P]',
        color: 0x00f0ff,
        textColor: '#050814',
        action: () => this.resumeGame()
      },
      {
        label: 'RESTART CHECKPOINT [R]',
        color: 0x1e293b,
        textColor: '#e2e8f0',
        action: () => {
          this.resumeGame();
          this.handlePlayerDeath();
        }
      },
      {
        label: 'AUDIO & SYSTEM SETTINGS',
        color: 0x1e293b,
        textColor: '#e2e8f0',
        action: () => {
          actionsContainer.setVisible(false);
          settingsContainer.setVisible(true);
          subtitle.setText('SYSTEM CONFIGURATION • LIVE AUDIO ADJUSTMENTS');
        }
      },
      {
        label: 'RESTART MISSION',
        color: 0x1e293b,
        textColor: '#e2e8f0',
        action: () => {
          audioManager.applyTemporalFilter(false);
          this.scene.restart();
        }
      },
      {
        label: 'ABORT TO MAIN MENU',
        color: 0x1e293b,
        textColor: '#e2e8f0',
        action: () => {
          audioManager.applyTemporalFilter(false);
          this.scene.start('MenuScene');
        }
      }
    ];

    pauseActions.forEach((act, idx) => {
      const bY = startY + idx * spacing;
      const btn = this.add.container(0, bY);
      const bg = this.add.graphics();
      bg.fillStyle(act.color, 1);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
      bg.lineStyle(1.5, 0x00f0ff, 0.7);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);

      const txt = this.add.text(0, 0, act.label, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: act.textColor
      }).setOrigin(0.5);

      btn.add([bg, txt]);
      btn.setSize(btnW, btnH);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => {
        btn.setScale(1.04);
        audioManager.play('uiHover');
      });
      btn.on('pointerout', () => btn.setScale(1.0));
      btn.on('pointerdown', () => {
        audioManager.play('uiClick');
        act.action();
      });

      actionsContainer.add(btn);
    });

    // --- SETTINGS VIEW ---
    const buildSettingsView = () => {
      settingsContainer.removeAll(true);
      const sStartY = -70;
      const sRowH = 46;

      const items = [
        { key: 'masterVolume', label: 'MASTER VOL', step: 10, min: 0, max: 100 },
        { key: 'musicVolume', label: 'MUSIC VOL', step: 10, min: 0, max: 100 },
        { key: 'sfxVolume', label: 'SFX VOL', step: 10, min: 0, max: 100 },
        { key: 'reducedMotion', label: 'REDUCED MOTION', isToggle: true }
      ];

      items.forEach((item, idx) => {
        const rY = sStartY + idx * sRowH;
        const rowLabel = this.add.text(-220, rY, item.label, {
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#94a3b8',
          letterSpacing: 1
        }).setOrigin(0, 0.5);
        settingsContainer.add(rowLabel);

        if (item.isToggle) {
          const isReduced = settingsManager.get('reducedMotion');
          const toggleBtn = this.add.container(140, rY);
          const tBg = this.add.graphics();
          tBg.fillStyle(isReduced ? 0x00f0ff : 0x1e293b, 0.9);
          tBg.fillRoundedRect(-45, -14, 90, 28, 4);
          tBg.lineStyle(1.2, 0x38bdf8, 0.8);
          tBg.strokeRoundedRect(-45, -14, 90, 28, 4);

          const tTxt = this.add.text(0, 0, isReduced ? 'ENABLED' : 'DISABLED', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: isReduced ? '#050814' : '#94a3b8'
          }).setOrigin(0.5);

          toggleBtn.add([tBg, tTxt]);
          toggleBtn.setSize(90, 28);
          toggleBtn.setInteractive({ useHandCursor: true });
          toggleBtn.on('pointerdown', () => {
            const next = !settingsManager.get('reducedMotion');
            settingsManager.set('reducedMotion', next);
            audioManager.play('uiClick');
            buildSettingsView();
          });
          settingsContainer.add(toggleBtn);
        } else {
          const val = settingsManager.get(item.key);
          const valTxt = this.add.text(140, rY, `${val}%`, {
            fontFamily: 'Rajdhani, monospace',
            fontSize: '16px',
            fontWeight: '700',
            color: '#00f0ff'
          }).setOrigin(0.5);

          // Minus button
          const mBtn = this.add.container(90, rY);
          const mBg = this.add.graphics();
          mBg.fillStyle(0x1e293b, 0.9);
          mBg.fillRoundedRect(-14, -14, 28, 28, 4);
          mBg.lineStyle(1, 0x00f0ff, 0.7);
          mBg.strokeRoundedRect(-14, -14, 28, 28, 4);
          const mTxt = this.add.text(0, 0, '−', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00f0ff'
          }).setOrigin(0.5);
          mBtn.add([mBg, mTxt]);
          mBtn.setSize(28, 28);
          mBtn.setInteractive({ useHandCursor: true });
          mBtn.on('pointerdown', () => {
            const next = Math.max(item.min, val - item.step);
            settingsManager.set(item.key, next);
            audioManager.play('uiClick');
            buildSettingsView();
          });

          // Plus button
          const pBtn = this.add.container(190, rY);
          const pBg = this.add.graphics();
          pBg.fillStyle(0x1e293b, 0.9);
          pBg.fillRoundedRect(-14, -14, 28, 28, 4);
          pBg.lineStyle(1, 0x00f0ff, 0.7);
          pBg.strokeRoundedRect(-14, -14, 28, 28, 4);
          const pTxt = this.add.text(0, 0, '+', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00f0ff'
          }).setOrigin(0.5);
          pBtn.add([pBg, pTxt]);
          pBtn.setSize(28, 28);
          pBtn.setInteractive({ useHandCursor: true });
          pBtn.on('pointerdown', () => {
            const next = Math.min(item.max, val + item.step);
            settingsManager.set(item.key, next);
            audioManager.play('uiClick');
            buildSettingsView();
          });

          settingsContainer.add([valTxt, mBtn, pBtn]);
        }
      });

      // Back to pause menu button
      const backBtn = this.add.container(0, 140);
      const bBg = this.add.graphics();
      bBg.fillStyle(0x00f0ff, 1);
      bBg.fillRoundedRect(-120, -18, 240, 36, 4);
      const bTxt = this.add.text(0, 0, '◄ RETURN TO PAUSE DIRECTIVES', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#050814'
      }).setOrigin(0.5);
      backBtn.add([bBg, bTxt]);
      backBtn.setSize(240, 36);
      backBtn.setInteractive({ useHandCursor: true });
      backBtn.on('pointerover', () => backBtn.setScale(1.03));
      backBtn.on('pointerout', () => backBtn.setScale(1.0));
      backBtn.on('pointerdown', () => {
        audioManager.play('uiClick');
        settingsContainer.setVisible(false);
        actionsContainer.setVisible(true);
        subtitle.setText('CHRONO RUNTIME HALTED • CHOOSE DIRECTIVE');
      });
      settingsContainer.add(backBtn);
    };

    buildSettingsView();
    this.pauseModal = modal;
  }

  resumeGame() {
    if (!this.isGamePaused) return;
    this.isGamePaused = false;
    this.physics.world.resume();
    if (this.timerEvent) this.timerEvent.paused = false;
    if (this.pauseModal) {
      this.pauseModal.destroy();
      this.pauseModal = null;
    }
    audioManager.play('uiClick');
  }

  /**
   * Single authoritative game-over handler
   * Halts player movement, hazards, abilities, and camera tracking, then shows Game Over overlay immediately
   */
  triggerGameOver(reason = 'abyss') {
    if (this.isGameOver || this.isLevelComplete) return;
    this.isGameOver = true;

    // Immediately stop camera following into the abyss
    this.cameras.main.stopFollow();

    // Safely stop and disable player physics, movement, and abilities
    if (this.player) {
      this.player.isDead = true;
      this.player.setVelocity(0, 0);
      if (this.player.body) {
        this.player.body.setAllowGravity(false);
        this.player.body.enable = false;
        this.player.body.stop();
      }
      this.player.clearActiveTimers();
    }

    // Freeze all hazards and active projectiles
    if (this.eligibleHazards) {
      this.eligibleHazards.forEach(h => {
        if (h && h.freeze) h.freeze(999999);
      });
    }

    // Reset boss encounter if active
    if (this.chronoCore) {
      this.chronoCore.resetEncounter();
    }

    // Calculate stats
    const totalSec = Math.max(0, Math.floor(this.countdownSeconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const message = reason === 'abyss'
      ? 'Kael has fallen into the temporal abyss.'
      : reason === 'hazard'
        ? 'Kael suffered critical chronal disruption.'
        : 'Timeline collapsed before reaching the core.';

    // Show Game Over UI immediately
    this.hud.showGameOverOverlay(
      {
        reason,
        message,
        score: this.score,
        checkpointId: this.latestCheckpoint.sectionId,
        checkpointTitle: this.latestCheckpoint.title,
        coreFragments: this.coreFragmentsCollected,
        timeStr
      },
      () => {
        this.retryFromCheckpoint();
      },
      () => {
        this.scene.restart();
      },
      () => {
        this.scene.start('MenuScene');
      }
    );
  }

  /**
   * Resumes gameplay cleanly from the latest anchored checkpoint
   */
  retryFromCheckpoint() {
    this.isGameOver = false;
    this.isGamePaused = false;

    // Respawn player cleanly at checkpoint coordinates with full health & energy
    this.player.respawnAt(this.latestCheckpoint.x, this.latestCheckpoint.y);

    // Re-engage camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Unfreeze hazards
    if (this.eligibleHazards) {
      this.eligibleHazards.forEach(h => {
        if (h && h.unfreeze) h.unfreeze();
        else if (h && h.isFrozen) h.isFrozen = false;
      });
    }

    // Reset boss arena if active
    if (this.chronoCore) {
      this.chronoCore.resetEncounter();
    }
  }

  /**
   * Authoritative player death handler (invoked by hazards / health loss)
   */
  handlePlayerDeath() {
    this.triggerGameOver('hazard');
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
    const fragBonus = this.coreFragmentsCollected * 500;
    this.score += 500 + timeBonus + fragBonus; // 500 core bonus + time bonus + fragments bonus

    const totalSec = Math.max(0, Math.floor(this.countdownSeconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Show victory modal overlay after short delay
    this.time.delayedCall(800, () => {
      this.hud.showVictoryOverlay({
        score: this.score,
        timeStr,
        coreFragments: this.coreFragmentsCollected,
        checkpoints: this.checkpointsActivatedCount + 1
      });
    });
  }

  update(time, delta) {
    if (this.isGamePaused || this.isGameOver || this.isLevelComplete) return;

    // Robust Pit & Hole Fall Detection
    // All playable platforms are at groundY = 615 (surface y: 593).
    // If player y >= 645, they have fallen through a hole or off the platform.
    const FALL_THRESHOLD_Y = 645;
    if (this.player && this.player.y >= FALL_THRESHOLD_Y) {
      this.triggerGameOver('abyss');
      return;
    }

    const isReduced = settingsManager.get('reducedMotion');
    const { width } = this.scale;
    const camX = this.cameras.main.scrollX;

    // 1. Dynamic Camera-Anchored Parallax Scrolling
    this.bgSkyGradient.x = camX + width / 2;
    if (this.bgCityMatte) {
      this.bgCityMatte.x = camX * 0.05 + width / 2;
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
        if (secKey !== 'A' && this.hud && this.hud.showSectionBanner) {
          this.hud.showSectionBanner(currentSection);
        }
      }
    }

    // 4. Update Hazard Systems
    if (this.laserGate0) this.laserGate0.update(time, delta);
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

    if (this.chronoCore) {
      this.chronoCore.update(time, delta, this.player);
    }

    // 5. Update HUD
    if (this.hud && this.player) {
      this.hud.update(this.player, this.countdownSeconds, this.score, this.currentSectionName, this.coreFragmentsCollected);
    }

    // 6. Diagnostics Readout (if toggled)
    if (this.debugVisible && this.diagText && this.game.loop && this.player) {
      const p1Count = this.plasmaTurret1 ? this.plasmaTurret1.projectiles.getLength() : 0;
      const coreState = this.chronoCore ? this.chronoCore.state : 'N/A';
      const aCal = this.chronoCore && this.chronoCore.pylonAlpha.isCalibrated ? 'CALIBRATED' : 'WAITING';
      const bCal = this.chronoCore && this.chronoCore.pylonBeta.isCalibrated ? 'CALIBRATED' : 'WAITING';

      const lines = [
        `[PHASE 10 LEVEL & MATHEMATICAL DIAGNOSTICS]`,
        `FPS: ${Math.round(this.game.loop.actualFps)} / 60 | Score: ${this.score}`,
        `Current Zone: ${this.currentSectionName} | Checkpoint: CP-${this.latestCheckpoint.sectionId}`,
        `Player Vector: x:${Math.round(this.player.x)}, y:${Math.round(this.player.y)} | Facing: ${this.player.facing}`,
        `Velocity: vx:${Math.round(this.player.body.velocity.x)}, vy:${Math.round(this.player.body.velocity.y)}`,
        `Jump Apex Reach: ~416px | Dash Vector: ${this.player.isDashing ? '800 px/s' : 'IDLE'}`,
        `Laser 1 [${this.laserGate1.state}] | Laser 2 [${this.laserGate2.state}]`,
        `Blade 1: ${Math.round(this.rotatingBlade1.currentAngle)}° | Blade 2: ${Math.round(this.rotatingBlade2.currentAngle)}°`,
        `Core State: [${coreState}] | Pylon α: ${aCal} | Pylon β: ${bCal}`,
        `Active Projectiles: ${p1Count} | Drone X: ${Math.round(this.drone1.x)}`,
        `Countdown: ${this.countdownSeconds}s | Core Stabilized: ${this.isLevelComplete ? 'YES' : 'NO'}`
      ];
      this.diagText.setText(lines);
    }
  }

  onWindowResize(gameSize) {
    const w = gameSize.width;
    const h = gameSize.height;
    const baseH = Math.max(720, h);

    this.cameras.main.setViewport(0, 0, w, h);
    this.cameras.main.setBounds(0, 0, 5120, baseH);
    this.physics.world.setBounds(0, 0, 5120, baseH + 100);

    if (this.hud && this.hud.handleResize) {
      this.hud.handleResize(w, h);
    }
    if (this.bgSkyGradient) {
      this.bgSkyGradient.setDisplaySize(w + 300, baseH + 100);
      this.bgSkyGradient.y = baseH / 2;
    }
    if (this.bgCityMatte) {
      this.bgCityMatte.setScale(Math.max(1.18, w / 1280));
      this.bgCityMatte.y = baseH / 2;
    }
    if (this.bgRightTower) {
      this.bgRightTower.setPosition(w, h / 2);
    }
    if (this.bgSkyline) this.bgSkyline.setSize(w + 200, 400);
    if (this.bgCloudsBack) this.bgCloudsBack.setSize(w + 200, 280);
    if (this.bgCity) this.bgCity.setSize(w + 200, 450);
    if (this.bgCloudsFront) this.bgCloudsFront.setSize(w + 200, 280);
  }
}
