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

    // 11. Atmospheric Sky Gradient (1280x720)
    const skyGrad = this.make.graphics({ x: 0, y: 0, add: false });
    // Layered gradient fill simulating atmospheric depth
    for (let y = 0; y < 720; y += 4) {
      const ratio = y / 720;
      // Interpolate from deep cosmic navy (0x02040a) -> indigo (0x081026) -> temporal horizon haze (0x121e42)
      let r, g, b;
      if (ratio < 0.5) {
        const t = ratio * 2;
        r = Math.floor(2 + (8 - 2) * t);
        g = Math.floor(4 + (16 - 4) * t);
        b = Math.floor(10 + (38 - 10) * t);
      } else {
        const t = (ratio - 0.5) * 2;
        r = Math.floor(8 + (18 - 8) * t);
        g = Math.floor(16 + (30 - 16) * t);
        b = Math.floor(38 + (66 - 38) * t);
      }
      const col = (r << 16) | (g << 8) | b;
      skyGrad.fillStyle(col, 1);
      skyGrad.fillRect(0, y, 1280, 4);
    }
    skyGrad.generateTexture('bg_sky_gradient', 1280, 720);
    skyGrad.destroy();

    // 12. Drifting Volumetric Cloud Deck (1280x240 seamless tile)
    const cloudGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Base cloud mist
    cloudGfx.fillStyle(0x0a142e, 0.6);
    cloudGfx.fillRect(0, 80, 1280, 160);

    // Cloud puffs along the horizon
    const cloudLobes = [
      { x: 60, y: 120, r: 60 }, { x: 140, y: 100, r: 75 }, { x: 220, y: 110, r: 65 },
      { x: 340, y: 130, r: 70 }, { x: 420, y: 95, r: 85 }, { x: 520, y: 115, r: 60 },
      { x: 640, y: 125, r: 75 }, { x: 740, y: 105, r: 80 }, { x: 840, y: 120, r: 65 },
      { x: 960, y: 130, r: 70 }, { x: 1060, y: 100, r: 85 }, { x: 1160, y: 115, r: 75 },
      { x: 1240, y: 120, r: 65 }
    ];

    cloudLobes.forEach(c => {
      // Darker base
      cloudGfx.fillStyle(0x0e1a38, 0.7);
      cloudGfx.fillCircle(c.x, c.y, c.r);
      // Soft illuminated highlight edge
      cloudGfx.fillStyle(0x1e3a6a, 0.35);
      cloudGfx.fillCircle(c.x, c.y - 12, c.r * 0.85);
      cloudGfx.fillStyle(0x38bdf8, 0.12);
      cloudGfx.fillCircle(c.x, c.y - 20, c.r * 0.6);
    });
    cloudGfx.generateTexture('cloud_bank_layer', 1280, 240);
    cloudGfx.destroy();

    // 13. High-Tech Suspended Platform Tile (64x44)
    const platGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Composite platform chassis
    platGfx.fillStyle(0x0c1322, 1);
    platGfx.fillRect(0, 4, 64, 40);

    // Bevel side borders
    platGfx.lineStyle(1, 0x1e293b, 0.9);
    platGfx.strokeRect(0, 4, 64, 40);

    // Structural vents / tech trusses
    platGfx.fillStyle(0x060911, 1);
    platGfx.fillRect(8, 14, 20, 14);
    platGfx.fillRect(36, 14, 20, 14);
    platGfx.lineStyle(1, 0x1e3a8a, 0.5);
    platGfx.strokeRect(8, 14, 20, 14);
    platGfx.strokeRect(36, 14, 20, 14);

    // Status micro-LED conduits
    platGfx.fillStyle(0x00f0ff, 0.9);
    platGfx.fillRect(10, 34, 4, 3);
    platGfx.fillRect(18, 34, 4, 3);
    platGfx.fillStyle(0xa855f7, 0.9);
    platGfx.fillRect(38, 34, 4, 3);
    platGfx.fillRect(46, 34, 4, 3);

    // Luminous Energy Rail on top surface (4px dual-beam)
    platGfx.fillStyle(0x00f0ff, 1);
    platGfx.fillRect(0, 0, 64, 4);
    platGfx.fillStyle(0xffffff, 0.8);
    platGfx.fillRect(0, 1, 64, 1.5);

    // Underside anti-gravity emitter node
    platGfx.fillStyle(0x00f0ff, 0.7);
    platGfx.fillRect(26, 40, 12, 4);

    platGfx.generateTexture('platform_tech_tile', 64, 44);
    platGfx.destroy();

    // 14. Anti-gravity Downward Glow Flare
    const agGfx = this.make.graphics({ x: 0, y: 0, add: false });
    agGfx.fillStyle(0x00f0ff, 0.25);
    agGfx.beginPath();
    agGfx.moveTo(16, 0);
    agGfx.lineTo(32, 28);
    agGfx.lineTo(0, 28);
    agGfx.closePath();
    agGfx.fillPath();
    agGfx.generateTexture('anti_grav_glow', 32, 28);
    agGfx.destroy();

    // 15. Freeze Shockwave Ring (128x128)
    const shockGfx = this.make.graphics({ x: 0, y: 0, add: false });
    shockGfx.lineStyle(4, 0x00f0ff, 1);
    shockGfx.strokeCircle(64, 64, 60);
    shockGfx.lineStyle(2, 0xffffff, 0.9);
    shockGfx.strokeCircle(64, 64, 59);
    shockGfx.lineStyle(6, 0xa855f7, 0.4);
    shockGfx.strokeCircle(64, 64, 56);
    shockGfx.generateTexture('vfx_shockwave_ring', 128, 128);
    shockGfx.destroy();

    // 16. Dash Tapered Streak (48x12)
    const dashGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dashGfx.fillStyle(0x00f0ff, 0.9);
    dashGfx.beginPath();
    dashGfx.moveTo(0, 6);
    dashGfx.lineTo(48, 1);
    dashGfx.lineTo(48, 11);
    dashGfx.closePath();
    dashGfx.fillPath();
    dashGfx.fillStyle(0xffffff, 1);
    dashGfx.fillRect(24, 4, 24, 4);
    dashGfx.generateTexture('vfx_dash_streak', 48, 12);
    dashGfx.destroy();

    // 17. Freeze Frost Crystal (16x16)
    const frostGfx = this.make.graphics({ x: 0, y: 0, add: false });
    frostGfx.lineStyle(1.5, 0x00f0ff, 1);
    frostGfx.fillStyle(0xffffff, 0.85);
    frostGfx.strokeCircle(8, 8, 6);
    frostGfx.fillCircle(8, 8, 3);
    frostGfx.generateTexture('vfx_freeze_crystal', 16, 16);
    frostGfx.destroy();

    // 18. Plasma Projectile Hazard (28x28)
    const projGfx = this.make.graphics({ x: 0, y: 0, add: false });
    projGfx.fillStyle(0xef4444, 0.4);
    projGfx.fillCircle(14, 14, 14);
    projGfx.fillStyle(0xf59e0b, 0.8);
    projGfx.fillCircle(14, 14, 9);
    projGfx.fillStyle(0xffffff, 1);
    projGfx.fillCircle(14, 14, 4);
    projGfx.generateTexture('hazard_projectile', 28, 28);
    projGfx.destroy();

    // 19. Moving Platform Tile (96x28)
    const movPlatGfx = this.make.graphics({ x: 0, y: 0, add: false });
    movPlatGfx.fillStyle(0x111c38, 1);
    movPlatGfx.fillRoundedRect(0, 0, 96, 28, 4);
    movPlatGfx.lineStyle(1.5, 0x00f0ff, 0.8);
    movPlatGfx.strokeRoundedRect(0, 0, 96, 28, 4);
    movPlatGfx.fillStyle(0x00f0ff, 1);
    movPlatGfx.fillRect(4, 2, 88, 3);
    movPlatGfx.generateTexture('moving_platform_tile', 96, 28);
    movPlatGfx.destroy();

    // 20. Collapsing Platform Tile (96x28 with amber warning markers)
    const colPlatGfx = this.make.graphics({ x: 0, y: 0, add: false });
    colPlatGfx.fillStyle(0x171626, 1);
    colPlatGfx.fillRoundedRect(0, 0, 96, 28, 4);
    colPlatGfx.lineStyle(1.5, 0xf59e0b, 0.9);
    colPlatGfx.strokeRoundedRect(0, 0, 96, 28, 4);
    // Amber top rail
    colPlatGfx.fillStyle(0xf59e0b, 1);
    colPlatGfx.fillRect(4, 2, 88, 3);
    // Honeycomb/hazard hash marks
    colPlatGfx.fillStyle(0xef4444, 0.8);
    for (let hx = 12; hx < 88; hx += 16) {
      colPlatGfx.fillTriangle(hx, 10, hx + 8, 10, hx + 4, 18);
    }
    colPlatGfx.generateTexture('platform_collapsing', 96, 28);
    colPlatGfx.destroy();

    // 21. Rotating Blade (64x64 Quad Energy Turbine)
    const bladeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // 4 angular turbine blades
    bladeGfx.fillStyle(0xf59e0b, 0.9);
    bladeGfx.lineStyle(1.5, 0xef4444, 1);
    for (let b = 0; b < 4; b++) {
      const angle = (b * Math.PI) / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const p1x = 32 + cos * 28;
      const p1y = 32 + sin * 28;
      const p2x = 32 + Math.cos(angle + 0.35) * 16;
      const p2y = 32 + Math.sin(angle + 0.35) * 16;
      const p3x = 32 + Math.cos(angle - 0.35) * 16;
      const p3y = 32 + Math.sin(angle - 0.35) * 16;
      bladeGfx.beginPath();
      bladeGfx.moveTo(32, 32);
      bladeGfx.lineTo(p2x, p2y);
      bladeGfx.lineTo(p1x, p1y);
      bladeGfx.lineTo(p3x, p3y);
      bladeGfx.closePath();
      bladeGfx.fillPath();
      bladeGfx.strokePath();
    }
    // Outer blade tip glow dots
    bladeGfx.fillStyle(0xffffff, 1);
    bladeGfx.fillCircle(32, 6, 2.5);
    bladeGfx.fillCircle(32, 58, 2.5);
    bladeGfx.fillCircle(6, 32, 2.5);
    bladeGfx.fillCircle(58, 32, 2.5);
    // Central metallic hub
    bladeGfx.fillStyle(0x0f172a, 1);
    bladeGfx.fillCircle(32, 32, 10);
    bladeGfx.lineStyle(2, 0xef4444, 0.9);
    bladeGfx.strokeCircle(32, 32, 10);
    bladeGfx.fillStyle(0xef4444, 1);
    bladeGfx.fillCircle(32, 32, 4);
    bladeGfx.generateTexture('hazard_blade_quad', 64, 64);
    bladeGfx.destroy();

    // 22. Laser Emitter Cap (32x20)
    const emitGfx = this.make.graphics({ x: 0, y: 0, add: false });
    emitGfx.fillStyle(0x0f172a, 1);
    emitGfx.fillRoundedRect(0, 0, 32, 20, 3);
    emitGfx.lineStyle(1.5, 0xef4444, 0.9);
    emitGfx.strokeRoundedRect(0, 0, 32, 20, 3);
    // Emitter aperture lens
    emitGfx.fillStyle(0xef4444, 0.6);
    emitGfx.fillCircle(16, 10, 6);
    emitGfx.fillStyle(0xffffff, 1);
    emitGfx.fillCircle(16, 10, 2.5);
    // Warning accent
    emitGfx.fillStyle(0xf59e0b, 1);
    emitGfx.fillRect(4, 3, 4, 3);
    emitGfx.fillRect(24, 3, 4, 3);
    emitGfx.generateTexture('hazard_laser_emitter', 32, 20);
    emitGfx.destroy();

    // 23. Plasma Turret Base (32x32)
    const turretGfx = this.make.graphics({ x: 0, y: 0, add: false });
    turretGfx.fillStyle(0x111827, 1);
    turretGfx.fillRoundedRect(4, 4, 24, 24, 4);
    turretGfx.lineStyle(1.5, 0x00f0ff, 0.7);
    turretGfx.strokeRoundedRect(4, 4, 24, 24, 4);
    // Cannon barrel
    turretGfx.fillStyle(0x1e293b, 1);
    turretGfx.fillRect(0, 12, 10, 8);
    turretGfx.lineStyle(1, 0xef4444, 0.9);
    turretGfx.strokeRect(0, 12, 10, 8);
    // Core energy cell
    turretGfx.fillStyle(0xef4444, 1);
    turretGfx.fillCircle(16, 16, 5);
    turretGfx.fillStyle(0xffffff, 1);
    turretGfx.fillCircle(16, 16, 2);
    turretGfx.generateTexture('hazard_turret', 32, 32);
    turretGfx.destroy();

    // 24. Patrol Drone Silhouette (40x24)
    const droneGfx = this.make.graphics({ x: 0, y: 0, add: false });
    droneGfx.fillStyle(0x0f172a, 1);
    droneGfx.fillRoundedRect(4, 4, 32, 16, 6);
    droneGfx.lineStyle(1.5, 0xef4444, 0.85);
    droneGfx.strokeRoundedRect(4, 4, 32, 16, 6);
    // Sensor eye optic
    droneGfx.fillStyle(0xef4444, 1);
    droneGfx.fillCircle(20, 12, 4);
    droneGfx.fillStyle(0xffffff, 1);
    droneGfx.fillCircle(21, 11, 1.5);
    // Side thruster fins
    droneGfx.fillStyle(0x38bdf8, 0.9);
    droneGfx.fillRect(1, 8, 4, 8);
    droneGfx.fillRect(35, 8, 4, 8);
    droneGfx.generateTexture('drone_patrol', 40, 24);
    droneGfx.destroy();

    // 25. Impact Hit Spark (16x16)
    const hitGfx = this.make.graphics({ x: 0, y: 0, add: false });
    hitGfx.fillStyle(0xffffff, 1);
    hitGfx.fillCircle(8, 8, 3);
    hitGfx.lineStyle(1.5, 0xef4444, 1);
    hitGfx.lineBetween(8, 0, 8, 16);
    hitGfx.lineBetween(0, 8, 16, 8);
    hitGfx.lineStyle(1, 0xf59e0b, 0.8);
    hitGfx.lineBetween(2, 2, 14, 14);
    hitGfx.lineBetween(2, 14, 14, 2);
    hitGfx.generateTexture('vfx_hit_spark', 16, 16);
    hitGfx.destroy();

    // 26. Checkpoint Beacon (48x72 Holographic Pillar)
    const cpGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Pedestal base
    cpGfx.fillStyle(0x0a1020, 1);
    cpGfx.fillRoundedRect(6, 52, 36, 18, 4);
    cpGfx.lineStyle(1.5, 0x1e293b, 0.9);
    cpGfx.strokeRoundedRect(6, 52, 36, 18, 4);
    // Base emitter light
    cpGfx.fillStyle(0x00f0ff, 0.6);
    cpGfx.fillCircle(24, 52, 6);
    // Vertical crystalline pillar
    cpGfx.fillStyle(0x1e3a8a, 0.7);
    cpGfx.fillRect(18, 16, 12, 36);
    cpGfx.lineStyle(1.5, 0x00f0ff, 0.8);
    cpGfx.strokeRect(18, 16, 12, 36);
    // Floating temporal diamond cap
    cpGfx.fillStyle(0x00f0ff, 0.9);
    cpGfx.beginPath();
    cpGfx.moveTo(24, 2);
    cpGfx.lineTo(34, 14);
    cpGfx.lineTo(24, 26);
    cpGfx.lineTo(14, 14);
    cpGfx.closePath();
    cpGfx.fillPath();
    cpGfx.fillStyle(0xffffff, 1);
    cpGfx.fillCircle(24, 14, 3);
    cpGfx.generateTexture('checkpoint_beacon', 48, 72);
    cpGfx.destroy();

    // 27. Chrono Core Finale Reactor (96x96)
    const coreGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer containment housing
    coreGfx.lineStyle(3, 0x1e293b, 1);
    coreGfx.strokeCircle(48, 48, 44);
    // Outer resonance ring
    coreGfx.lineStyle(2, 0xa855f7, 0.85);
    coreGfx.strokeCircle(48, 48, 38);
    // Inner magnetic flux field
    coreGfx.lineStyle(2.5, 0x00f0ff, 0.9);
    coreGfx.strokeCircle(48, 48, 28);
    // Temporal plasma singularity core
    coreGfx.fillStyle(0x3b82f6, 0.5);
    coreGfx.fillCircle(48, 48, 22);
    coreGfx.fillStyle(0x00f0ff, 0.85);
    coreGfx.fillCircle(48, 48, 14);
    coreGfx.fillStyle(0xffffff, 1);
    coreGfx.fillCircle(48, 48, 6);
    // 4 radial stabilization pylons
    coreGfx.lineStyle(3, 0x38bdf8, 0.9);
    coreGfx.lineBetween(48, 4, 48, 20);
    coreGfx.lineBetween(48, 76, 48, 92);
    coreGfx.lineBetween(4, 48, 20, 48);
    coreGfx.lineBetween(76, 48, 92, 48);
    coreGfx.generateTexture('chrono_core_reactor', 96, 96);
    coreGfx.destroy();

    // 28. Mathematical Vector Trajectory Arrow (32x16)
    const arrowGfx = this.make.graphics({ x: 0, y: 0, add: false });
    arrowGfx.lineStyle(2, 0x00f0ff, 0.85);
    arrowGfx.lineBetween(0, 8, 24, 8);
    arrowGfx.beginPath();
    arrowGfx.moveTo(24, 2);
    arrowGfx.lineTo(32, 8);
    arrowGfx.lineTo(24, 14);
    arrowGfx.closePath();
    arrowGfx.fillStyle(0x00f0ff, 0.9);
    arrowGfx.fillPath();
    arrowGfx.generateTexture('trajectory_arrow', 32, 16);
    arrowGfx.destroy();
  }

  create() {
    // Transition cleanly to MenuScene
    this.scene.start('MenuScene');
  }
}
