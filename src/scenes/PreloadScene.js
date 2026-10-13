import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Background aesthetic
    this.add.rectangle(width / 2, height / 2, width, height, 0x070b16);

    // Title & status text
    const title = this.add.text(width / 2, height / 2 - 60, 'CHRONO SHIFT', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 2 - 20, 'INITIALIZING TEMPORAL MATRIX', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      color: '#94a3b8',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Progress bar frame & fill
    const barWidth = 420;
    const barHeight = 16;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 30;

    const barBg = this.add.graphics();
    barBg.lineStyle(2, 0x1e293b, 1);
    barBg.strokeRoundedRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 4);
    barBg.fillStyle(0x0f172a, 0.8);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 2);

    const progressBar = this.add.graphics();

    const percentText = this.add.text(width / 2, barY + 36, '0%', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    // Track loader progress
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00f0ff, 1);
      progressBar.fillRoundedRect(barX, barY, barWidth * value, barHeight, 2);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    // Graceful error recovery: missing optional assets do not crash startup (SPEC Section 3)
    this.load.on('loaderror', (file) => {
      console.warn(`[AssetLoadWarning] Could not load optional asset: ${file.key}`);
    });

    // Generate procedural fallback textures offline
    this.createProceduralTextures();
  }

  createProceduralTextures() {
    // 1. Cyan particle (radial gradient glow)
    const pCyan = this.make.graphics({ x: 0, y: 0, add: false });
    pCyan.fillStyle(0x00f0ff, 1);
    pCyan.fillCircle(8, 8, 8);
    pCyan.fillStyle(0xffffff, 0.9);
    pCyan.fillCircle(8, 8, 4);
    pCyan.generateTexture('particle_cyan', 16, 16);
    pCyan.destroy();

    // 2. Purple particle
    const pPurple = this.make.graphics({ x: 0, y: 0, add: false });
    pPurple.fillStyle(0xa855f7, 1);
    pPurple.fillCircle(8, 8, 8);
    pPurple.fillStyle(0xffffff, 0.9);
    pPurple.fillCircle(8, 8, 4);
    pPurple.generateTexture('particle_purple', 16, 16);
    pPurple.destroy();

    // 3. Chrono Cell Pickup Orb
    const cellGfx = this.make.graphics({ x: 0, y: 0, add: false });
    cellGfx.lineStyle(2, 0x00f0ff, 0.8);
    cellGfx.strokeCircle(16, 16, 14);
    cellGfx.fillStyle(0x00f0ff, 0.6);
    cellGfx.fillCircle(16, 16, 8);
    cellGfx.fillStyle(0xffffff, 1);
    cellGfx.fillCircle(16, 16, 3);
    cellGfx.generateTexture('cell_orb', 32, 32);
    cellGfx.destroy();

    // 4. Player Silhouette / Placeholder Avatar
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Head / visor
    playerGfx.fillStyle(0x00f0ff, 1);
    playerGfx.fillRoundedRect(8, 4, 16, 12, 3);
    // Torso & Chrono Gauntlet
    playerGfx.fillStyle(0x38bdf8, 1);
    playerGfx.fillRect(6, 18, 20, 18);
    // Gauntlet glow
    playerGfx.fillStyle(0xa855f7, 1);
    playerGfx.fillRect(22, 22, 6, 8);
    // Legs
    playerGfx.fillStyle(0x1e293b, 1);
    playerGfx.fillRect(7, 36, 8, 12);
    playerGfx.fillRect(17, 36, 8, 12);
    playerGfx.generateTexture('player_avatar', 32, 48);
    playerGfx.destroy();

    // 5. Rotating Geometric Hazard (Triangular Blade)
    const hazardGfx = this.make.graphics({ x: 0, y: 0, add: false });
    hazardGfx.fillStyle(0xf59e0b, 1);
    hazardGfx.beginPath();
    hazardGfx.moveTo(24, 2);
    hazardGfx.lineTo(44, 42);
    hazardGfx.lineTo(4, 42);
    hazardGfx.closePath();
    hazardGfx.fillPath();
    // Inner pulse core
    hazardGfx.fillStyle(0xef4444, 1);
    hazardGfx.fillCircle(24, 28, 6);
    hazardGfx.generateTexture('hazard_triangle', 48, 48);
    hazardGfx.destroy();

    // 6. Grid Platform Tile
    const platformGfx = this.make.graphics({ x: 0, y: 0, add: false });
    platformGfx.fillStyle(0x0f172a, 1);
    platformGfx.fillRect(0, 0, 64, 32);
    platformGfx.fillStyle(0x00f0ff, 1);
    platformGfx.fillRect(0, 0, 64, 3);
    platformGfx.lineStyle(1, 0x1e293b, 0.7);
    platformGfx.strokeRect(0, 3, 64, 29);
    platformGfx.generateTexture('grid_platform', 64, 32);
    platformGfx.destroy();

    // 7. Distant Skyline Layer (Seamless parallax width 1280, height 400)
    const skyGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Dark silhouette skyscrapers of Aethelon City
    const buildings = [
      { x: 0, w: 90, h: 260 },
      { x: 90, w: 60, h: 320, spire: true },
      { x: 150, w: 110, h: 220 },
      { x: 260, w: 80, h: 290, spire: true },
      { x: 340, w: 130, h: 240 },
      { x: 470, w: 70, h: 340, spire: true },
      { x: 540, w: 100, h: 200 },
      { x: 640, w: 80, h: 270 },
      { x: 720, w: 120, h: 310, spire: true },
      { x: 840, w: 90, h: 230 },
      { x: 930, w: 110, h: 330, spire: true },
      { x: 1040, w: 90, h: 210 },
      { x: 1130, w: 150, h: 280, spire: true }
    ];

    buildings.forEach(b => {
      // Building silhouette
      skyGfx.fillStyle(0x0a1226, 0.95);
      skyGfx.fillRect(b.x, 400 - b.h, b.w, b.h);

      // Spire beacon
      if (b.spire) {
        skyGfx.lineStyle(2, 0x00f0ff, 0.8);
        skyGfx.lineBetween(b.x + b.w / 2, 400 - b.h, b.x + b.w / 2, 400 - b.h - 30);
        skyGfx.fillStyle(0x00f0ff, 1);
        skyGfx.fillCircle(b.x + b.w / 2, 400 - b.h - 30, 2.5);
      }

      // Small glowing windows / energy strips
      skyGfx.fillStyle(0x1e3a8a, 0.6);
      for (let wy = 400 - b.h + 20; wy < 380; wy += 28) {
        for (let wx = b.x + 10; wx < b.x + b.w - 12; wx += 18) {
          if ((wx + wy) % 5 === 0) {
            skyGfx.fillRect(wx, wy, 6, 12);
          }
        }
      }
    });
    skyGfx.generateTexture('bg_distant_skyline', 1280, 400);
    skyGfx.destroy();

    // 8. Midground Architecture Layer (Width 1280, height 450)
    const midGfx = this.make.graphics({ x: 0, y: 0, add: false });
    const midStructures = [
      { x: 0, w: 140, h: 200 },
      { x: 170, w: 180, h: 270, rail: true },
      { x: 380, w: 160, h: 180 },
      { x: 570, w: 200, h: 290, rail: true },
      { x: 800, w: 150, h: 220 },
      { x: 980, w: 190, h: 260, rail: true },
      { x: 1200, w: 80, h: 190 }
    ];

    midStructures.forEach(s => {
      midGfx.fillStyle(0x0f1c3f, 0.9);
      midGfx.fillRect(s.x, 450 - s.h, s.w, s.h);
      // Top edge highlight
      midGfx.lineStyle(1.5, 0x38bdf8, 0.7);
      midGfx.strokeRect(s.x, 450 - s.h, s.w, s.h);

      if (s.rail) {
        // Glowing cyan energy conduit
        midGfx.lineStyle(3, 0x00f0ff, 0.85);
        midGfx.lineBetween(s.x, 450 - s.h + 40, s.x + s.w, 450 - s.h + 40);
        // Violet temporal fracture conduit
        midGfx.lineStyle(2, 0xa855f7, 0.85);
        midGfx.lineBetween(s.x + 15, 450 - s.h + 80, s.x + s.w - 15, 450 - s.h + 80);
      }
    });
    // Skyway overpass bridge
    midGfx.lineStyle(4, 0x00f0ff, 0.4);
    midGfx.lineBetween(0, 360, 1280, 360);
    midGfx.generateTexture('bg_midground_city', 1280, 450);
    midGfx.destroy();

    // 9. Foreground Structural Overlay (Framing girders & columns)
    const foreGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Left column
    foreGfx.fillStyle(0x050814, 0.85);
    foreGfx.fillRect(0, 0, 60, 720);
    foreGfx.lineStyle(2, 0x00f0ff, 0.4);
    foreGfx.lineBetween(60, 0, 60, 720);

    // Right column
    foreGfx.fillStyle(0x050814, 0.85);
    foreGfx.fillRect(1220, 0, 60, 720);
    foreGfx.lineStyle(2, 0x00f0ff, 0.4);
    foreGfx.lineBetween(1220, 0, 1220, 720);

    // Top beam with hazard markings
    foreGfx.fillStyle(0x070c1b, 0.9);
    foreGfx.fillRect(60, 0, 1160, 24);
    foreGfx.lineStyle(1.5, 0xa855f7, 0.5);
    foreGfx.lineBetween(60, 24, 1220, 24);

    foreGfx.generateTexture('bg_foreground_structures', 1280, 720);
    foreGfx.destroy();

    // 10. Geometric Shard (Floating temporal crystal)
    const shardGfx = this.make.graphics({ x: 0, y: 0, add: false });
    shardGfx.lineStyle(2, 0x00f0ff, 0.9);
    shardGfx.fillStyle(0xa855f7, 0.4);
    shardGfx.beginPath();
    shardGfx.moveTo(20, 4);
    shardGfx.lineTo(36, 20);
    shardGfx.lineTo(20, 36);
    shardGfx.lineTo(4, 20);
    shardGfx.closePath();
    shardGfx.fillPath();
    shardGfx.strokePath();
    shardGfx.fillStyle(0xffffff, 0.9);
    shardGfx.fillCircle(20, 20, 3);
    shardGfx.generateTexture('geometric_shard', 40, 40);
    shardGfx.destroy();
  }

  create() {
    // Transition cleanly to MenuScene
    this.scene.start('MenuScene');
  }
}
