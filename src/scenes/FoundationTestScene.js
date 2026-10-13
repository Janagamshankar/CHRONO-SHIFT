import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { settingsManager } from '../systems/SettingsManager.js';
import { Player } from '../entities/Player.js';
import { HUD } from '../ui/HUD.js';
import { ChronoVFX } from '../effects/ChronoVFX.js';

export default class FoundationTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FoundationTestScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Camera Setup
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.fadeIn(350, 5, 8, 20);

    // 2. Parallax Environment (Visual Foundation)
    this.add.image(width / 2, height / 2, 'bg_sky_gradient').setDepth(0);

    const anomalyGlow = this.add.graphics().setDepth(1);
    anomalyGlow.fillStyle(0x3b0764, 0.25);
    anomalyGlow.fillCircle(width / 2, height / 2 - 80, 360);

    this.bgSkyline = this.add.tileSprite(width / 2, 360, width, 400, 'bg_distant_skyline').setDepth(2);
    this.bgSkyline.setAlpha(0.65);

    this.bgCloudsBack = this.add.tileSprite(width / 2, 450, width, 240, 'cloud_bank_layer').setDepth(3);
    this.bgCloudsBack.setAlpha(0.75);

    this.bgCity = this.add.tileSprite(width / 2, 460, width, 450, 'bg_midground_city').setDepth(4);
    this.bgCity.setAlpha(0.9);

    this.bgCloudsFront = this.add.tileSprite(width / 2, 530, width, 240, 'cloud_bank_layer').setDepth(5);
    this.bgCloudsFront.setAlpha(0.5);

    // Floating Geometric Shards
    this.shards = [];
    for (let i = 0; i < 5; i++) {
      const shard = this.add.image(140 + i * 250, 180 + (i % 3) * 60, 'geometric_shard').setDepth(6);
      shard.setScale(0.75 + (i % 2) * 0.35);
      shard.setAlpha(0.7);
      this.shards.push(shard);

      if (!settingsManager.get('reducedMotion')) {
        this.tweens.add({
          targets: shard,
          y: shard.y - 16,
          angle: 360,
          duration: 3000 + i * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Atmospheric Temporal Particles
    this.particles = [];
    for (let i = 0; i < 18; i++) {
      const pKey = i % 2 === 0 ? 'particle_cyan' : 'particle_purple';
      const p = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(100, 600),
        pKey
      ).setDepth(7);
      p.setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      p.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
      p.vx = Phaser.Math.FloatBetween(0.3, 1.2);
      p.vy = Phaser.Math.FloatBetween(-0.2, 0.2);
      this.particles.push(p);
    }

    // 3. High-Tech Suspended Platform
    this.groundPlatforms = this.physics.add.staticGroup();
    const groundY = 615;
    const tileWidth = 64;
    const numTiles = Math.ceil(width / tileWidth);

    for (let i = 0; i < numTiles; i++) {
      const tileX = i * tileWidth + tileWidth / 2;
      const tile = this.groundPlatforms.create(tileX, groundY, 'platform_tech_tile');
      tile.setDepth(15);
      tile.refreshBody();

      if (i % 3 === 1) {
        const agGlow = this.add.image(tileX, groundY + 34, 'anti_grav_glow').setDepth(14);
        agGlow.setAlpha(0.65);
        this.tweens.add({
          targets: agGlow,
          alpha: 0.35,
          scaleY: 1.25,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    const energyRail = this.add.graphics().setDepth(16);
    energyRail.lineStyle(2, 0x00f0ff, 0.9);
    energyRail.lineBetween(0, groundY - 22, width, groundY - 22);
    energyRail.lineStyle(1, 0xffffff, 0.8);
    energyRail.lineBetween(0, groundY - 22, width, groundY - 22);

    // 4. Player Entity Setup
    this.player = new Player(this, 180, groundY - 50);
    this.physics.add.collider(this.player, this.groundPlatforms);

    // 5. Eligible Freeze Hazards & Interactive Elements
    this.eligibleHazards = [];

    // Hazard A: Rotating Geometric Blade
    this.rotor = this.add.image(width / 2 + 100, groundY - 65, 'hazard_triangle').setDepth(18);
    this.rotor.setScale(1.5);
    this.rotor.isFrozen = false;
    this.rotor.angularVelocity = 2.0;

    this.rotor.freeze = (duration) => {
      this.rotor.isFrozen = true;
      this.rotor.setTint(0x00f0ff);
      // Frozen rim outline ring
      const rim = this.add.image(this.rotor.x, this.rotor.y, 'vfx_freeze_crystal').setScale(2.5).setDepth(19);

      this.time.delayedCall(duration, () => {
        this.rotor.isFrozen = false;
        this.rotor.clearTint();
        if (rim) rim.destroy();
        ChronoVFX.spawnFreezeRelease(this, this.rotor.x, this.rotor.y);
      });
    };
    this.eligibleHazards.push(this.rotor);

    // Hazard B: Moving Plasma Projectile
    this.projectile = this.add.image(width / 2 + 280, groundY - 60, 'hazard_projectile').setDepth(18);
    this.projectile.isFrozen = false;
    this.projTween = this.tweens.add({
      targets: this.projectile,
      x: width / 2 + 480,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.projectile.freeze = (duration) => {
      this.projectile.isFrozen = true;
      this.projectile.setTint(0x00f0ff);
      if (this.projTween) this.projTween.pause();

      this.time.delayedCall(duration, () => {
        this.projectile.isFrozen = false;
        this.projectile.clearTint();
        if (this.projTween) this.projTween.resume();
        ChronoVFX.spawnFreezeRelease(this, this.projectile.x, this.projectile.y);
      });
    };
    this.eligibleHazards.push(this.projectile);

    // Hazard C: Suspended Moving Platform
    this.movePlatform = this.physics.add.image(width / 2 - 120, groundY - 140, 'moving_platform_tile');
    this.movePlatform.setImmovable(true);
    this.movePlatform.body.setAllowGravity(false);
    this.movePlatform.setDepth(16);
    this.movePlatform.isFrozen = false;

    this.platformTween = this.tweens.add({
      targets: this.movePlatform,
      x: width / 2 + 40,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.movePlatform.freeze = (duration) => {
      this.movePlatform.isFrozen = true;
      this.movePlatform.setTint(0x00f0ff);
      if (this.platformTween) this.platformTween.pause();

      this.time.delayedCall(duration, () => {
        this.movePlatform.isFrozen = false;
        this.movePlatform.clearTint();
        if (this.platformTween) this.platformTween.resume();
        ChronoVFX.spawnFreezeRelease(this, this.movePlatform.x, this.movePlatform.y);
      });
    };
    this.eligibleHazards.push(this.movePlatform);
    this.physics.add.collider(this.player, this.movePlatform);

    // 6. Collectible Chrono Cell
    this.chronoCell = this.physics.add.image(width / 2 - 40, groundY - 180, 'cell_orb').setDepth(18);
    this.chronoCell.body.setAllowGravity(false);
    this.chronoCell.setScale(1.2);

    this.tweens.add({
      targets: this.chronoCell,
      y: groundY - 195,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Overlap collection handler
    this.physics.add.overlap(this.player, this.chronoCell, () => {
      if (!this.chronoCell.visible) return;
      this.chronoCell.setVisible(false);
      this.player.rechargeEnergy(GAME_SETTINGS.CHRONO.CELL_RECHARGE_AMOUNT);

      // Respawn cell after 4 seconds for continuous testing
      this.time.delayedCall(4000, () => {
        this.chronoCell.setVisible(true);
      });
    });

    // 7. Mission Countdown Timer
    this.countdownSeconds = GAME_SETTINGS.COUNTDOWN_SECONDS;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.countdownSeconds > 0) {
          this.countdownSeconds--;
        }
      }
    });

    // 8. In-Game HUD
    this.hud = new HUD(this);

    // 9. Input Setup
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
      const res = this.player.activateChronoFreeze(this.eligibleHazards);
      this.hud.triggerAbilityPulse('freeze', res.success);
    });

    // E or Shift: Chrono Dash activation
    const triggerDash = () => {
      const res = this.player.activateChronoDash();
      this.hud.triggerAbilityPulse('dash', res.success);
    };

    this.input.keyboard.on('keydown-E', triggerDash);
    this.input.keyboard.on('keydown-SHIFT', triggerDash);

    // ESC: Return to Menu
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });

    // Diagnostics toggle (~ or D)
    this.debugVisible = false;
    this.debugContainer = this.add.container(width / 2 + 160, 260).setDepth(50);
    const panelWidth = 520;
    const panelHeight = 200;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0f172a, 0.85);
    panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);
    panelBg.lineStyle(1.5, 0x00f0ff, 0.5);
    panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 8);

    this.diagText = this.add.text(-panelWidth / 2 + 24, -panelHeight / 2 + 20, '', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '17px',
      color: '#e2e8f0',
      lineSpacing: 6
    });
    this.debugContainer.add([panelBg, this.diagText]);
    this.debugContainer.setVisible(false);

    const toggleDiagnostics = () => {
      this.debugVisible = !this.debugVisible;
      this.debugContainer.setVisible(this.debugVisible);
    };
    this.input.keyboard.on('keydown-TILDE', toggleDiagnostics);
    this.input.keyboard.on('keydown-D', toggleDiagnostics);

    // 10. Sleek Controls Bar
    this.controlsPrompt = this.add.text(
      width / 2,
      height - 18,
      '[ A / D ] Move  •  [ Space ] Jump  •  [ S ] Slide  •  [ Q ] Freeze (35)  •  [ E ] Dash (25)  •  [ ESC ] Menu',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        color: '#64748b',
        letterSpacing: 2
      }
    ).setOrigin(0.5).setDepth(35);

    // Cleanup listeners on shutdown
    this.events.on('shutdown', () => {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.off('keydown-Q');
        this.input.keyboard.off('keydown-E');
        this.input.keyboard.off('keydown-SHIFT');
        this.input.keyboard.off('keydown-ESC');
        this.input.keyboard.off('keydown-TILDE');
        this.input.keyboard.off('keydown-D');
      }
    });
  }

  update(time, delta) {
    const isReduced = settingsManager.get('reducedMotion');

    // 1. Parallax environment drift
    if (!isReduced) {
      if (this.bgSkyline) this.bgSkyline.tilePositionX += 0.12;
      if (this.bgCloudsBack) this.bgCloudsBack.tilePositionX += 0.28;
      if (this.bgCity) this.bgCity.tilePositionX += 0.45;
      if (this.bgCloudsFront) this.bgCloudsFront.tilePositionX += 0.65;
    }

    // 2. Player movement update
    if (this.player) {
      this.player.updateMovement(this.cursors, this.keys);
    }

    // 3. Hazard angular rotation (frozen check)
    if (this.rotor && !this.rotor.isFrozen) {
      this.rotor.angle += this.rotor.angularVelocity;
    }

    // 4. Update HUD
    if (this.hud && this.player) {
      this.hud.update(this.player, this.countdownSeconds);
    }

    // 5. Drifting particles
    const { width, height } = this.scale;
    if (this.particles) {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > width + 20) p.x = -20;
        if (p.y < 80) p.y = 620;
        if (p.y > 620) p.y = 80;
      });
    }

    // 6. Diagnostics readout (if toggled)
    if (this.debugVisible && this.diagText && this.game.loop && this.player) {
      const lines = [
        `[DIAGNOSTICS MODE ACTIVE]`,
        `FPS: ${Math.round(this.game.loop.actualFps)} / 60`,
        `Player State: x:${Math.round(this.player.x)}, y:${Math.round(this.player.y)} | Facing:${this.player.facing}`,
        `Dash State: ${this.player.isDashing ? 'ACTIVE' : 'IDLE'} | Slide: ${this.player.isSliding ? 'ACTIVE' : 'IDLE'}`,
        `Chrono Energy: ${Math.round(this.player.energy)} / 100`,
        `Countdown: ${this.countdownSeconds}s (Active: ${!this.scene.isPaused()})`,
        `Hazards Frozen: ${this.rotor && this.rotor.isFrozen ? 'YES' : 'NO'}`
      ];
      this.diagText.setText(lines);
    }
  }
}
