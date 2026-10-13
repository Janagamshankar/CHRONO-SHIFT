import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export default class FoundationTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FoundationTestScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Camera Setup (Task 10)
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.fadeIn(300, 7, 11, 22);

    // 2. Dark Navy Foundation & Parallax/Energy Grid (Visual Requirement)
    this.add.rectangle(width / 2, height / 2, width, height, 0x070b16);

    // Deep violet energy haze
    const haze = this.add.graphics();
    haze.fillStyle(0x3b0764, 0.25);
    haze.fillCircle(width / 2, height / 2 - 40, 280);

    // Restrained futuristic grid
    this.add.grid(width / 2, height / 2, width, height, 64, 64, 0x000000, 0, 0x00f0ff, 0.07);

    // Ambient temporal horizon rail
    const horizonRail = this.add.graphics();
    horizonRail.lineStyle(1.5, 0xa855f7, 0.35);
    horizonRail.lineBetween(0, 480, width, 480);

    // 3. Title and Tagline Display (Task 8)
    this.titleText = this.add.text(width / 2, 54, 'CHRONO SHIFT', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '44px',
      fontStyle: '900',
      color: '#00f0ff',
      letterSpacing: 6
    }).setOrigin(0.5);

    this.taglineText = this.add.text(width / 2, 98, '“Bend Time. Defy Fate.”', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: '600',
      color: '#c084fc',
      letterSpacing: 3
    }).setOrigin(0.5);

    this.badgeText = this.add.text(width / 2, 130, 'PHASE 1 — PROJECT FOUNDATION', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '14px',
      fontWeight: '700',
      color: '#64748b',
      letterSpacing: 4
    }).setOrigin(0.5);

    // 4. Ground Platform Setup (Task 10)
    this.groundPlatforms = this.physics.add.staticGroup();
    const groundY = 620;
    const tileWidth = 64;
    const numTiles = Math.ceil(width / tileWidth);

    for (let i = 0; i < numTiles; i++) {
      const tileX = i * tileWidth + tileWidth / 2;
      const tile = this.groundPlatforms.create(tileX, groundY, 'grid_platform');
      tile.refreshBody();
    }

    // Luminous cyan top rail for the ground platform
    const platformRail = this.add.graphics();
    platformRail.lineStyle(2, 0x00f0ff, 0.8);
    platformRail.lineBetween(0, groundY - 16, width, groundY - 16);

    // 5. Player Placeholder with Defined Position and Bounds (Task 9)
    const spawnX = 260;
    const spawnY = groundY - 50;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_avatar');
    this.player.setCollideWorldBounds(true);
    // Explicit collision bounds
    this.player.body.setSize(24, 46);
    this.player.body.setOffset(4, 2);

    // Player and ground collision
    this.physics.add.collider(this.player, this.groundPlatforms);

    // Player callout / bounds readout indicator
    this.playerTag = this.add.text(spawnX, spawnY - 42, 'KAEL (PLAYER)\nBOUNDS: 24x46', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '12px',
      color: '#38bdf8',
      align: 'center'
    }).setOrigin(0.5);

    // Gentle gauntlet pulse tween on player
    this.tweens.add({
      targets: this.player,
      alpha: 0.88,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 6. Diagnostics & System Verification Panel
    const panelX = width / 2 + 150;
    const panelY = 320;
    const panelWidth = 560;
    const panelHeight = 230;

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0f172a, 0.75);
    panelBg.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 8);
    panelBg.lineStyle(1.5, 0x00f0ff, 0.4);
    panelBg.strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 8);

    // Animated Rotating Geometric Hazard Sample
    this.rotor = this.add.image(panelX - 180, panelY, 'hazard_triangle');
    this.rotor.setScale(1.5);

    // Chrono Cell Orb Sample
    this.cellOrb = this.add.image(panelX - 90, panelY, 'cell_orb');
    this.cellOrb.setScale(1.3);
    this.tweens.add({
      targets: this.cellOrb,
      y: panelY - 12,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Live diagnostics text
    this.diagText = this.add.text(panelX - 20, panelY - 90, [
      `Engine: Phaser v${Phaser.VERSION}`,
      `Render Mode: ${this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'}`,
      `Resolution: ${GAME_SETTINGS.CANVAS_WIDTH} x ${GAME_SETTINGS.CANVAS_HEIGHT}`,
      `Scale Mode: Phaser.Scale.FIT`,
      `Player State: Grounded (x:${Math.round(this.player.x)}, y:${Math.round(this.player.y)})`,
      `FPS: Calculating...`
    ], {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '18px',
      color: '#e2e8f0',
      lineSpacing: 8
    });

    // 7. Interactive Pulse Cue & Return to Menu
    const promptText = this.add.text(width / 2, height - 35, '[ Spacebar / Click ] Trigger Pulse  •  [ ESC ] Return to Menu', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: promptText,
      alpha: 0.35,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Interactive pulse handler
    const triggerPulse = () => {
      const ring = this.add.graphics();
      ring.lineStyle(3, 0x00f0ff, 1);
      ring.strokeCircle(this.player.x, this.player.y, 16);

      this.tweens.add({
        targets: ring,
        scale: 4,
        alpha: 0,
        duration: 450,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });

      this.tweens.add({
        targets: [this.player, this.rotor],
        scale: 1.8,
        duration: 120,
        yoyo: true
      });
    };

    const returnToMenu = () => {
      this.scene.start('MenuScene');
    };

    this.input.on('pointerdown', triggerPulse);
    this.input.keyboard.on('keydown-SPACE', triggerPulse);
    this.input.keyboard.on('keydown-ESC', returnToMenu);

    // Clean up event listeners on shutdown
    this.events.on('shutdown', () => {
      this.input.off('pointerdown', triggerPulse);
      if (this.input.keyboard) {
        this.input.keyboard.off('keydown-SPACE', triggerPulse);
        this.input.keyboard.off('keydown-ESC', returnToMenu);
      }
    });
  }

  update(time, delta) {
    // Angular rotation on geometric hazard
    if (this.rotor) {
      this.rotor.angle += 1.5;
    }

    // Keep player indicator aligned with player
    if (this.player && this.playerTag) {
      this.playerTag.setPosition(this.player.x, this.player.y - 42);
    }

    // Refresh live diagnostic metrics
    if (this.diagText && this.game.loop && this.player) {
      const currentFps = Math.round(this.game.loop.actualFps);
      const lines = [
        `Engine: Phaser v${Phaser.VERSION}`,
        `Render Mode: ${this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'}`,
        `Resolution: ${GAME_SETTINGS.CANVAS_WIDTH} x ${GAME_SETTINGS.CANVAS_HEIGHT}`,
        `Scale Mode: Phaser.Scale.FIT`,
        `Player State: Grounded (x:${Math.round(this.player.x)}, y:${Math.round(this.player.y)})`,
        `FPS: ${currentFps} / 60`
      ];
      this.diagText.setText(lines);
    }
  }
}
