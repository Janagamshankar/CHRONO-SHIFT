import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { settingsManager } from '../systems/SettingsManager.js';

export default class FoundationTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FoundationTestScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Camera Setup
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.fadeIn(350, 5, 8, 20);

    // 2. Layered Futuristic City Above Clouds (Visual Overhaul)
    // Layer A: Atmospheric Sky Gradient
    this.add.image(width / 2, height / 2, 'bg_sky_gradient').setDepth(0);

    // Deep violet anomaly glow in the upper stratosphere
    const anomalyGlow = this.add.graphics().setDepth(1);
    anomalyGlow.fillStyle(0x3b0764, 0.25);
    anomalyGlow.fillCircle(width / 2, height / 2 - 80, 360);

    // Layer B: Distant Spires & Skyline
    this.bgSkyline = this.add.tileSprite(width / 2, 360, width, 400, 'bg_distant_skyline').setDepth(2);
    this.bgSkyline.setAlpha(0.65);

    // Layer C: Volumetric Cloud Deck Drifting Over Skyline Base
    this.bgCloudsBack = this.add.tileSprite(width / 2, 450, width, 240, 'cloud_bank_layer').setDepth(3);
    this.bgCloudsBack.setAlpha(0.75);

    // Layer D: Midground High-Tech City & Energy Conduits
    this.bgCity = this.add.tileSprite(width / 2, 460, width, 450, 'bg_midground_city').setDepth(4);
    this.bgCity.setAlpha(0.9);

    // Layer E: Lower Cloud Deck Underneath Midground
    this.bgCloudsFront = this.add.tileSprite(width / 2, 530, width, 240, 'cloud_bank_layer').setDepth(5);
    this.bgCloudsFront.setAlpha(0.5);

    // Floating Geometric Shards (Temporal crystal fragments drifting above clouds)
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

    // Atmospheric Temporal Particles (Cyan & Purple mists drifting)
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

    // 3. Cinematic Scene Title & World Context
    this.sceneHeader = this.add.container(width / 2, 55).setDepth(20);

    const titleTxt = this.add.text(0, -12, 'CHRONO SHIFT', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '34px',
      fontStyle: '900',
      color: '#00f0ff',
      letterSpacing: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#38bdf8', blur: 10, stroke: true, fill: true }
    }).setOrigin(0.5);

    const tagTxt = this.add.text(0, 22, '“Bend Time. Defy Fate.” — SECTOR AETHELON 2189', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      color: '#c084fc',
      letterSpacing: 3
    }).setOrigin(0.5);

    this.sceneHeader.add([titleTxt, tagTxt]);

    // 4. High-Tech Suspended Gameplay Platform (Task 10 & Visual Overhaul)
    this.groundPlatforms = this.physics.add.staticGroup();
    const groundY = 615;
    const tileWidth = 64;
    const numTiles = Math.ceil(width / tileWidth);

    for (let i = 0; i < numTiles; i++) {
      const tileX = i * tileWidth + tileWidth / 2;
      const tile = this.groundPlatforms.create(tileX, groundY, 'platform_tech_tile');
      tile.setDepth(15);
      tile.refreshBody();

      // Add downward anti-gravity glow cone beneath every 3rd tile emitter
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

    // Continuous glowing dual-beam energy rail across the platform surface
    const energyRail = this.add.graphics().setDepth(16);
    energyRail.lineStyle(2, 0x00f0ff, 0.9);
    energyRail.lineBetween(0, groundY - 22, width, groundY - 22);
    energyRail.lineStyle(1, 0xffffff, 0.8);
    energyRail.lineBetween(0, groundY - 22, width, groundY - 22);

    // 5. Player Placeholder (Standing on High-Tech Platform)
    const spawnX = 260;
    const spawnY = groundY - 50;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_avatar').setDepth(18);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 46);
    this.player.body.setOffset(4, 2);

    // Collision between player and suspended platform
    this.physics.add.collider(this.player, this.groundPlatforms);

    // Subtle gauntlet idle pulse
    this.tweens.add({
      targets: this.player,
      alpha: 0.9,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 6. Interactive Temporal Demonstration Objects
    // Rotating Geometric Hazard (Triangular Blade)
    this.rotor = this.add.image(width / 2 + 120, groundY - 70, 'hazard_triangle').setDepth(18);
    this.rotor.setScale(1.6);

    // Chrono Cell Energy Orb
    this.cellOrb = this.add.image(width / 2 + 220, groundY - 75, 'cell_orb').setDepth(18);
    this.cellOrb.setScale(1.4);
    this.tweens.add({
      targets: this.cellOrb,
      y: groundY - 95,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 7. Diagnostics & Debug Overlay (HIDDEN BY DEFAULT during normal gameplay)
    this.debugVisible = false;
    this.debugContainer = this.add.container(width / 2 + 160, 260).setDepth(30);

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
    this.debugContainer.setVisible(false); // Clean cinematic display

    // 8. Sleek Bottom Prompt HUD
    this.bottomPrompt = this.add.text(
      width / 2,
      height - 30,
      '[ Spacebar / Click ] Trigger Pulse   •   [ ESC ] Return to Menu   •   [ ~ / D ] Toggle Diagnostics',
      {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '15px',
        fontWeight: '600',
        color: '#38bdf8',
        letterSpacing: 2
      }
    ).setOrigin(0.5).setDepth(25);

    this.tweens.add({
      targets: this.bottomPrompt,
      alpha: 0.45,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    // 9. Input & Interactive Handlers
    const triggerPulse = () => {
      const ring = this.add.graphics().setDepth(22);
      ring.lineStyle(3, 0x00f0ff, 1);
      ring.strokeCircle(this.player.x, this.player.y, 16);

      this.tweens.add({
        targets: ring,
        scale: 4.5,
        alpha: 0,
        duration: 480,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });

      this.tweens.add({
        targets: [this.player, this.rotor],
        scale: 1.85,
        duration: 120,
        yoyo: true
      });
    };

    const returnToMenu = () => {
      this.scene.start('MenuScene');
    };

    const toggleDiagnostics = () => {
      this.debugVisible = !this.debugVisible;
      this.debugContainer.setVisible(this.debugVisible);
    };

    this.input.on('pointerdown', triggerPulse);
    this.input.keyboard.on('keydown-SPACE', triggerPulse);
    this.input.keyboard.on('keydown-ESC', returnToMenu);
    this.input.keyboard.on('keydown-TILDE', toggleDiagnostics);
    this.input.keyboard.on('keydown-D', toggleDiagnostics);

    // Shutdown cleanup
    this.events.on('shutdown', () => {
      this.input.off('pointerdown', triggerPulse);
      if (this.input.keyboard) {
        this.input.keyboard.off('keydown-SPACE', triggerPulse);
        this.input.keyboard.off('keydown-ESC', returnToMenu);
        this.input.keyboard.off('keydown-TILDE', toggleDiagnostics);
        this.input.keyboard.off('keydown-D', toggleDiagnostics);
      }
    });
  }

  update(time, delta) {
    const isReduced = settingsManager.get('reducedMotion');

    // Smooth multi-depth parallax drifting
    if (!isReduced) {
      if (this.bgSkyline) this.bgSkyline.tilePositionX += 0.12;
      if (this.bgCloudsBack) this.bgCloudsBack.tilePositionX += 0.28;
      if (this.bgCity) this.bgCity.tilePositionX += 0.45;
      if (this.bgCloudsFront) this.bgCloudsFront.tilePositionX += 0.65;
    }

    // Angular hazard rotation
    if (this.rotor) {
      this.rotor.angle += 1.5;
    }

    // Drifting atmospheric particles
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

    // Diagnostics update (only when toggled on)
    if (this.debugVisible && this.diagText && this.game.loop && this.player) {
      const currentFps = Math.round(this.game.loop.actualFps);
      const lines = [
        `[DIAGNOSTICS MODE ACTIVE]`,
        `Engine: Phaser v${Phaser.VERSION} (${this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'})`,
        `Resolution: ${GAME_SETTINGS.CANVAS_WIDTH} x ${GAME_SETTINGS.CANVAS_HEIGHT}`,
        `Player: Grounded (x:${Math.round(this.player.x)}, y:${Math.round(this.player.y)})`,
        `Bounds: 24x46 [Arcade Physics]`,
        `FPS: ${currentFps} / 60`
      ];
      this.diagText.setText(lines);
    }
  }
}
