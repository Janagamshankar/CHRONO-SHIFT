import Phaser from 'phaser';
import { PlayerSpriteGenerator } from '../entities/PlayerSpriteGenerator.js';

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

    // Load high-resolution Aethelon floating city matte painting
    this.load.image('bg_aethelon_city', 'assets/images/bg_aethelon_city.jpg');

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

    // 3B. Chrono Core Fragment (Collectable Narrative Objective Shard - 40x40)
    const fragGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer temporal pulse halo
    fragGfx.fillStyle(0x00f0ff, 0.25);
    fragGfx.fillCircle(20, 20, 18);
    // Concentric calibration ring
    fragGfx.lineStyle(1.5, 0x00f0ff, 0.85);
    fragGfx.strokeCircle(20, 20, 15);
    // Geometric Crystalline Diamond Shard
    fragGfx.fillStyle(0x38bdf8, 0.9);
    fragGfx.beginPath();
    fragGfx.moveTo(20, 4);
    fragGfx.lineTo(34, 20);
    fragGfx.lineTo(20, 36);
    fragGfx.lineTo(6, 20);
    fragGfx.closePath();
    fragGfx.fillPath();
    // Inner facet shading
    fragGfx.fillStyle(0xa855f7, 0.8);
    fragGfx.beginPath();
    fragGfx.moveTo(20, 8);
    fragGfx.lineTo(30, 20);
    fragGfx.lineTo(20, 32);
    fragGfx.closePath();
    fragGfx.fillPath();
    // Silver beveled border
    fragGfx.lineStyle(2, 0xffffff, 1);
    fragGfx.beginPath();
    fragGfx.moveTo(20, 4);
    fragGfx.lineTo(34, 20);
    fragGfx.lineTo(20, 36);
    fragGfx.lineTo(6, 20);
    fragGfx.closePath();
    fragGfx.strokePath();
    // Radiant core spark
    fragGfx.fillStyle(0xffffff, 1);
    fragGfx.fillCircle(20, 20, 3.5);
    fragGfx.generateTexture('core_fragment', 40, 40);
    fragGfx.destroy();

    // 4. White & Silver Armored Runner Avatar Suite (Kael Veyron - Reference Recreation)
    // Generates 6-frame run cycle, idle, jump, fall, slide, and dash animations
    PlayerSpriteGenerator.generateAll(this);

    // 5. Rotating Geometric Hazard (Triangular Blade)
    const hazardGfx = this.make.graphics({ x: 0, y: 0, add: false });
    hazardGfx.fillStyle(0xf97316, 1);
    hazardGfx.beginPath();
    hazardGfx.moveTo(24, 2);
    hazardGfx.lineTo(44, 42);
    hazardGfx.lineTo(4, 42);
    hazardGfx.closePath();
    hazardGfx.fillPath();
    hazardGfx.fillStyle(0xef4444, 1);
    hazardGfx.fillCircle(24, 28, 6);
    hazardGfx.fillStyle(0xffffff, 1);
    hazardGfx.fillCircle(24, 28, 2.5);
    hazardGfx.generateTexture('hazard_triangle', 48, 48);
    hazardGfx.destroy();

    // 6. Grid Platform Tile (Light Theme)
    const platformGfx = this.make.graphics({ x: 0, y: 0, add: false });
    platformGfx.fillStyle(0xffffff, 1);
    platformGfx.fillRect(0, 0, 64, 32);
    platformGfx.fillStyle(0x00f0ff, 1);
    platformGfx.fillRect(0, 0, 64, 3);
    platformGfx.lineStyle(1, 0xcbd5e1, 0.9);
    platformGfx.strokeRect(0, 3, 64, 29);
    platformGfx.generateTexture('grid_platform', 64, 32);
    platformGfx.destroy();

    // 7. Distant White Spires & Architectural Skyline (1280x400)
    const skyGfx = this.make.graphics({ x: 0, y: 0, add: false });
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
      // White & pale silver distant tower silhouette
      skyGfx.fillStyle(0xffffff, 0.55);
      skyGfx.fillRect(b.x, 400 - b.h, b.w, b.h);
      skyGfx.fillStyle(0xe0f2fe, 0.65);
      skyGfx.fillRect(b.x + 8, 400 - b.h + 8, b.w - 16, b.h - 8);

      if (b.spire) {
        skyGfx.lineStyle(2, 0x00f0ff, 0.85);
        skyGfx.lineBetween(b.x + b.w / 2, 400 - b.h, b.x + b.w / 2, 400 - b.h - 35);
        skyGfx.fillStyle(0x00f0ff, 1);
        skyGfx.fillCircle(b.x + b.w / 2, 400 - b.h - 35, 3);
      }

      // Cyan architectural light conduits
      skyGfx.fillStyle(0x00f0ff, 0.5);
      for (let wy = 400 - b.h + 20; wy < 380; wy += 36) {
        for (let wx = b.x + 12; wx < b.x + b.w - 16; wx += 22) {
          skyGfx.fillRect(wx, wy, 4, 16);
        }
      }
    });
    skyGfx.generateTexture('bg_distant_skyline', 1280, 400);
    skyGfx.destroy();

    // 8. Midground Floating White Arch & Towers Layer (1280x450)
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
      // White & pale silver architecture
      midGfx.fillStyle(0xffffff, 0.7);
      midGfx.fillRect(s.x, 450 - s.h, s.w, s.h);
      midGfx.fillStyle(0xf1f5f9, 0.8);
      midGfx.fillRect(s.x + 6, 450 - s.h + 6, s.w - 12, s.h - 6);
      midGfx.lineStyle(1.5, 0x38bdf8, 0.75);
      midGfx.strokeRect(s.x, 450 - s.h, s.w, s.h);

      if (s.rail) {
        // Glowing cyan energy conduit
        midGfx.lineStyle(3, 0x00f0ff, 0.9);
        midGfx.lineBetween(s.x, 450 - s.h + 30, s.x + s.w, 450 - s.h + 30);
      }
    });
    // Skyway overpass bridge
    midGfx.lineStyle(3, 0x00f0ff, 0.6);
    midGfx.lineBetween(0, 360, 1280, 360);
    midGfx.generateTexture('bg_midground_city', 1280, 450);
    midGfx.destroy();

    // 9. Foreground Framing Architectural Column (Right Edge Pylon matching reference - 140x720)
    const foreGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // White column body
    foreGfx.fillStyle(0xffffff, 0.95);
    foreGfx.fillRect(20, 0, 120, 720);
    foreGfx.fillStyle(0xf1f5f9, 1);
    foreGfx.fillRect(35, 0, 90, 720);
    foreGfx.lineStyle(2, 0xcbd5e1, 0.9);
    foreGfx.lineBetween(20, 0, 20, 720);
    // Glowing cyan vertical energy conduits
    foreGfx.lineStyle(3, 0x00f0ff, 0.95);
    foreGfx.lineBetween(30, 0, 30, 720);
    foreGfx.lineStyle(1.5, 0xffffff, 0.9);
    foreGfx.lineBetween(30, 0, 30, 720);
    foreGfx.lineStyle(2, 0x00f0ff, 0.8);
    foreGfx.lineBetween(110, 0, 110, 720);
    // Observation balconies & tech notches
    for (let by = 80; by < 700; by += 160) {
      foreGfx.fillStyle(0xe2e8f0, 1);
      foreGfx.fillRoundedRect(0, by, 40, 18, 4);
      foreGfx.fillStyle(0x00f0ff, 1);
      foreGfx.fillRect(4, by + 14, 32, 2.5);
    }
    foreGfx.generateTexture('bg_right_tower', 140, 720);
    foreGfx.destroy();

    // 10. Geometric Shard (Floating temporal crystal)
    const shardGfx = this.make.graphics({ x: 0, y: 0, add: false });
    shardGfx.lineStyle(2, 0x00f0ff, 0.95);
    shardGfx.fillStyle(0xe0f2fe, 0.6);
    shardGfx.beginPath();
    shardGfx.moveTo(20, 4);
    shardGfx.lineTo(36, 20);
    shardGfx.lineTo(20, 36);
    shardGfx.lineTo(4, 20);
    shardGfx.closePath();
    shardGfx.fillPath();
    shardGfx.strokePath();
    shardGfx.fillStyle(0xffffff, 1);
    shardGfx.fillCircle(20, 20, 3);
    shardGfx.generateTexture('geometric_shard', 40, 40);
    shardGfx.destroy();

    // 11. Bright Cinematic Daylight Sky Gradient (1280x720)
    const skyGrad = this.make.graphics({ x: 0, y: 0, add: false });
    for (let y = 0; y < 720; y += 4) {
      const ratio = y / 720;
      let r, g, b;
      if (ratio < 0.45) {
        // Top azure sky (0x4ba3e3) -> Clear sky blue (0x93c5fd)
        const t = ratio / 0.45;
        r = Math.floor(75 + (147 - 75) * t);
        g = Math.floor(163 + (197 - 163) * t);
        b = Math.floor(227 + (253 - 227) * t);
      } else {
        // Clear sky blue (0x93c5fd) -> Horizon cloud haze (0xf0f9ff / 0xffffff)
        const t = (ratio - 0.45) / 0.55;
        r = Math.floor(147 + (245 - 147) * t);
        g = Math.floor(197 + (250 - 197) * t);
        b = Math.floor(253 + (255 - 253) * t);
      }
      const col = (r << 16) | (g << 8) | b;
      skyGrad.fillStyle(col, 1);
      skyGrad.fillRect(0, y, 1280, 4);
    }
    skyGrad.generateTexture('bg_sky_gradient', 1280, 720);
    skyGrad.destroy();

    // 12. Volumetric White Cumulus Cloud Deck (1280x280 seamless tile)
    const cloudGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Soft base cloud mist
    cloudGfx.fillStyle(0xe0f2fe, 0.7);
    cloudGfx.fillRect(0, 100, 1280, 180);

    const cloudLobes = [
      { x: 50, y: 130, r: 65 }, { x: 130, y: 110, r: 80 }, { x: 210, y: 120, r: 70 },
      { x: 330, y: 140, r: 75 }, { x: 410, y: 100, r: 90 }, { x: 510, y: 120, r: 65 },
      { x: 630, y: 130, r: 80 }, { x: 730, y: 110, r: 85 }, { x: 830, y: 125, r: 70 },
      { x: 950, y: 135, r: 75 }, { x: 1050, y: 105, r: 90 }, { x: 1150, y: 120, r: 80 },
      { x: 1240, y: 125, r: 70 }
    ];

    cloudLobes.forEach(c => {
      // Soft ambient blue shadow base
      cloudGfx.fillStyle(0xbfdbfe, 0.55);
      cloudGfx.fillCircle(c.x, c.y + 10, c.r * 1.05);
      // Bright white cloud body
      cloudGfx.fillStyle(0xf8fafc, 0.9);
      cloudGfx.fillCircle(c.x, c.y, c.r);
      // Pure white sunlit highlight
      cloudGfx.fillStyle(0xffffff, 1);
      cloudGfx.fillCircle(c.x - 4, c.y - 12, c.r * 0.85);
      cloudGfx.fillCircle(c.x - 8, c.y - 20, c.r * 0.6);
    });
    cloudGfx.generateTexture('cloud_bank_layer', 1280, 280);
    cloudGfx.destroy();

    // 13. White & Silver High-Tech Platform Deck Tile (64x44)
    const platGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // White metallic landing surface
    platGfx.fillStyle(0xffffff, 1);
    platGfx.fillRect(0, 4, 64, 40);
    // Silver beveled trim
    platGfx.fillStyle(0xf1f5f9, 1);
    platGfx.fillRect(0, 8, 64, 32);
    platGfx.lineStyle(1, 0xcbd5e1, 0.9);
    platGfx.strokeRect(0, 4, 64, 40);

    // Beveled vents / silver panel seams
    platGfx.fillStyle(0xe2e8f0, 1);
    platGfx.fillRect(8, 16, 20, 14);
    platGfx.fillRect(36, 16, 20, 14);
    platGfx.lineStyle(1, 0x94a3b8, 0.6);
    platGfx.strokeRect(8, 16, 20, 14);
    platGfx.strokeRect(36, 16, 20, 14);

    // Cyan status LED conduits
    platGfx.fillStyle(0x00f0ff, 1);
    platGfx.fillRect(10, 36, 4, 3);
    platGfx.fillRect(18, 36, 4, 3);
    platGfx.fillRect(38, 36, 4, 3);
    platGfx.fillRect(46, 36, 4, 3);

    // Luminous electric cyan rail on top landing deck
    platGfx.fillStyle(0x00f0ff, 1);
    platGfx.fillRect(0, 0, 64, 4);
    platGfx.fillStyle(0xffffff, 0.95);
    platGfx.fillRect(0, 1, 64, 1.5);

    // Underside anti-gravity node
    platGfx.fillStyle(0x00f0ff, 0.8);
    platGfx.fillRect(26, 40, 12, 4);

    platGfx.generateTexture('platform_tech_tile', 64, 44);
    platGfx.destroy();

    // 13B. Architectural Column Bracket Support (Underneath Platforms - Reference Recreation)
    // 240 width, 260 height: Flared bracket arms, central glowing cyan crest, twin fluted columns
    const bracketGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Flared bracket arms reaching left and right
    bracketGfx.fillStyle(0xffffff, 1);
    bracketGfx.beginPath();
    bracketGfx.moveTo(10, 0);
    bracketGfx.lineTo(230, 0);
    bracketGfx.lineTo(190, 48);
    bracketGfx.lineTo(145, 60);
    bracketGfx.lineTo(145, 260);
    bracketGfx.lineTo(95, 260);
    bracketGfx.lineTo(95, 60);
    bracketGfx.lineTo(50, 48);
    bracketGfx.closePath();
    bracketGfx.fillPath();

    // Silver beveled panel shading on brackets
    bracketGfx.fillStyle(0xe2e8f0, 1);
    bracketGfx.beginPath();
    bracketGfx.moveTo(25, 6);
    bracketGfx.lineTo(90, 6);
    bracketGfx.lineTo(80, 42);
    bracketGfx.lineTo(55, 38);
    bracketGfx.closePath();
    bracketGfx.fillPath();

    bracketGfx.beginPath();
    bracketGfx.moveTo(215, 6);
    bracketGfx.lineTo(150, 6);
    bracketGfx.lineTo(160, 42);
    bracketGfx.lineTo(185, 38);
    bracketGfx.closePath();
    bracketGfx.fillPath();

    // Diagonal bracket bevel lines
    bracketGfx.lineStyle(2, 0xcbd5e1, 0.95);
    bracketGfx.lineBetween(10, 0, 50, 48);
    bracketGfx.lineBetween(230, 0, 190, 48);
    bracketGfx.lineBetween(50, 48, 95, 60);
    bracketGfx.lineBetween(190, 48, 145, 60);

    // Twin Fluted Columns with Recessed Cyan Conduits
    bracketGfx.fillStyle(0xf1f5f9, 1);
    bracketGfx.fillRect(98, 62, 44, 198);
    bracketGfx.lineStyle(1.5, 0x94a3b8, 0.8);
    bracketGfx.strokeRect(98, 62, 44, 198);

    // Vertical glowing cyan energy conduit in column center
    bracketGfx.fillStyle(0x00f0ff, 1);
    bracketGfx.fillRect(116, 68, 8, 186);
    bracketGfx.fillStyle(0xffffff, 0.9);
    bracketGfx.fillRect(118, 70, 4, 182);

    // Central Embossed Diamond Crest (matching reference)
    bracketGfx.fillStyle(0xffffff, 1);
    bracketGfx.beginPath();
    bracketGfx.moveTo(120, 24);
    bracketGfx.lineTo(142, 48);
    bracketGfx.lineTo(120, 72);
    bracketGfx.lineTo(98, 48);
    bracketGfx.closePath();
    bracketGfx.fillPath();
    bracketGfx.lineStyle(2, 0xcbd5e1, 1);
    bracketGfx.strokePath();

    // Glowing Cyan Core Diamond
    bracketGfx.fillStyle(0x00f0ff, 1);
    bracketGfx.beginPath();
    bracketGfx.moveTo(120, 32);
    bracketGfx.lineTo(134, 48);
    bracketGfx.lineTo(120, 64);
    bracketGfx.lineTo(106, 48);
    bracketGfx.closePath();
    bracketGfx.fillPath();
    bracketGfx.fillStyle(0xffffff, 1);
    bracketGfx.fillCircle(120, 48, 3.5);

    bracketGfx.generateTexture('platform_pillar_bracket', 240, 260);
    bracketGfx.destroy();

    // 13C. Compact Floating Island Platform (160x70 - Right Platform in Reference)
    const smallPlatGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // White top deck
    smallPlatGfx.fillStyle(0xffffff, 1);
    smallPlatGfx.fillRoundedRect(0, 4, 160, 24, 3);
    smallPlatGfx.lineStyle(1, 0xcbd5e1, 1);
    smallPlatGfx.strokeRoundedRect(0, 4, 160, 24, 3);
    // Cyan top rail
    smallPlatGfx.fillStyle(0x00f0ff, 1);
    smallPlatGfx.fillRect(2, 0, 156, 4);
    smallPlatGfx.fillStyle(0xffffff, 0.9);
    smallPlatGfx.fillRect(2, 1, 156, 1.5);
    // Inverted trapezoid silver base
    smallPlatGfx.fillStyle(0xf1f5f9, 1);
    smallPlatGfx.beginPath();
    smallPlatGfx.moveTo(25, 28);
    smallPlatGfx.lineTo(135, 28);
    smallPlatGfx.lineTo(105, 65);
    smallPlatGfx.lineTo(55, 65);
    smallPlatGfx.closePath();
    smallPlatGfx.fillPath();
    smallPlatGfx.lineStyle(1.5, 0x94a3b8, 0.9);
    smallPlatGfx.strokePath();
    // Cyan glowing triangle/diamond in base
    smallPlatGfx.fillStyle(0x00f0ff, 1);
    smallPlatGfx.beginPath();
    smallPlatGfx.moveTo(80, 34);
    smallPlatGfx.lineTo(96, 54);
    smallPlatGfx.lineTo(64, 54);
    smallPlatGfx.closePath();
    smallPlatGfx.fillPath();
    smallPlatGfx.fillStyle(0xffffff, 1);
    smallPlatGfx.fillCircle(80, 48, 2.5);

    smallPlatGfx.generateTexture('platform_floating_small', 160, 70);
    smallPlatGfx.destroy();

    // 13D. Floating Temporal Energy Orb (64x64 - Reference Recreation)
    const orbGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer luminous cyan halo
    orbGfx.fillStyle(0x00f0ff, 0.25);
    orbGfx.fillCircle(32, 32, 28);
    orbGfx.fillStyle(0x00f0ff, 0.45);
    orbGfx.fillCircle(32, 32, 22);

    // Outer concentric ring
    orbGfx.lineStyle(2, 0x00f0ff, 0.95);
    orbGfx.strokeCircle(32, 32, 20);

    // Inner concentric ring
    orbGfx.lineStyle(1.5, 0x38bdf8, 0.85);
    orbGfx.strokeCircle(32, 32, 14);

    // 4 Cardinal bracket notches with technical nodes
    orbGfx.fillStyle(0x00f0ff, 1);
    orbGfx.fillCircle(32, 12, 3);
    orbGfx.fillCircle(32, 52, 3);
    orbGfx.fillCircle(12, 32, 3);
    orbGfx.fillCircle(52, 32, 3);
    orbGfx.fillStyle(0xffffff, 1);
    orbGfx.fillCircle(32, 12, 1.5);
    orbGfx.fillCircle(32, 52, 1.5);
    orbGfx.fillCircle(12, 32, 1.5);
    orbGfx.fillCircle(52, 32, 1.5);

    // Radiant glowing cyan energy core
    orbGfx.fillStyle(0x00f0ff, 1);
    orbGfx.fillCircle(32, 32, 9);
    orbGfx.fillStyle(0xffffff, 1);
    orbGfx.fillCircle(32, 32, 4.5);

    orbGfx.generateTexture('temporal_orb', 64, 64);
    orbGfx.destroy();

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

    // 16. Dash Tapered Streak (60x14)
    const dashGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dashGfx.fillStyle(0x00f0ff, 0.95);
    dashGfx.beginPath();
    dashGfx.moveTo(0, 7);
    dashGfx.lineTo(60, 1);
    dashGfx.lineTo(60, 13);
    dashGfx.closePath();
    dashGfx.fillPath();
    dashGfx.fillStyle(0xffffff, 1);
    dashGfx.fillRect(28, 5, 32, 4);
    dashGfx.generateTexture('vfx_dash_streak', 60, 14);
    dashGfx.destroy();

    // 16B. Aerodynamic Chrono Dash Cone Shockwave (80x50)
    const coneGfx = this.make.graphics({ x: 0, y: 0, add: false });
    coneGfx.fillStyle(0x00f0ff, 0.35);
    coneGfx.beginPath();
    coneGfx.moveTo(80, 25);
    coneGfx.lineTo(0, 0);
    coneGfx.lineTo(16, 25);
    coneGfx.lineTo(0, 50);
    coneGfx.closePath();
    coneGfx.fillPath();
    // Inner white-hot speed lines
    coneGfx.lineStyle(2, 0xffffff, 0.9);
    coneGfx.lineBetween(70, 25, 10, 10);
    coneGfx.lineBetween(70, 25, 10, 40);
    coneGfx.lineStyle(1.5, 0x00f0ff, 0.8);
    coneGfx.lineBetween(60, 25, 15, 18);
    coneGfx.lineBetween(60, 25, 15, 32);
    coneGfx.generateTexture('vfx_dash_cone', 80, 50);
    coneGfx.destroy();

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
    projGfx.fillStyle(0xf97316, 0.85);
    projGfx.fillCircle(14, 14, 9);
    projGfx.fillStyle(0xffffff, 1);
    projGfx.fillCircle(14, 14, 4);
    projGfx.generateTexture('hazard_projectile', 28, 28);
    projGfx.destroy();

    // 19. Moving Platform Tile (96x28 - White/Silver Light Theme)
    const movPlatGfx = this.make.graphics({ x: 0, y: 0, add: false });
    movPlatGfx.fillStyle(0xffffff, 1);
    movPlatGfx.fillRoundedRect(0, 0, 96, 28, 4);
    movPlatGfx.lineStyle(1.5, 0x00f0ff, 0.9);
    movPlatGfx.strokeRoundedRect(0, 0, 96, 28, 4);
    movPlatGfx.fillStyle(0x00f0ff, 1);
    movPlatGfx.fillRect(4, 2, 88, 3);
    movPlatGfx.fillStyle(0xe2e8f0, 1);
    movPlatGfx.fillRect(6, 8, 84, 16);
    movPlatGfx.generateTexture('moving_platform_tile', 96, 28);
    movPlatGfx.destroy();

    // 20. Collapsing Platform Tile (96x28 with amber warning markers)
    const colPlatGfx = this.make.graphics({ x: 0, y: 0, add: false });
    colPlatGfx.fillStyle(0xffffff, 1);
    colPlatGfx.fillRoundedRect(0, 0, 96, 28, 4);
    colPlatGfx.lineStyle(1.5, 0xf59e0b, 0.9);
    colPlatGfx.strokeRoundedRect(0, 0, 96, 28, 4);
    // Amber top rail
    colPlatGfx.fillStyle(0xf59e0b, 1);
    colPlatGfx.fillRect(4, 2, 88, 3);
    // Hazard hash marks
    colPlatGfx.fillStyle(0xef4444, 0.85);
    for (let hx = 12; hx < 88; hx += 16) {
      colPlatGfx.fillTriangle(hx, 10, hx + 8, 10, hx + 4, 18);
    }
    colPlatGfx.generateTexture('platform_collapsing', 96, 28);
    colPlatGfx.destroy();

    // 21. Rotating Blade (64x64 Quad Energy Turbine)
    const bladeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // 4 angular turbine blades
    bladeGfx.fillStyle(0xf97316, 0.9);
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
    bladeGfx.fillStyle(0xffffff, 1);
    bladeGfx.fillCircle(32, 6, 2.5);
    bladeGfx.fillCircle(32, 58, 2.5);
    bladeGfx.fillCircle(6, 32, 2.5);
    bladeGfx.fillCircle(58, 32, 2.5);
    // Central metallic hub (White & Silver)
    bladeGfx.fillStyle(0xffffff, 1);
    bladeGfx.fillCircle(32, 32, 10);
    bladeGfx.lineStyle(2, 0xef4444, 0.95);
    bladeGfx.strokeCircle(32, 32, 10);
    bladeGfx.fillStyle(0xef4444, 1);
    bladeGfx.fillCircle(32, 32, 4);
    bladeGfx.generateTexture('hazard_blade_quad', 64, 64);
    bladeGfx.destroy();

    // 22. Laser Emitter Cap (White & Silver with orange warning aperture)
    const emitGfx = this.make.graphics({ x: 0, y: 0, add: false });
    emitGfx.fillStyle(0xffffff, 1);
    emitGfx.fillRoundedRect(0, 0, 36, 22, 3);
    emitGfx.lineStyle(1.5, 0xcbd5e1, 1);
    emitGfx.strokeRoundedRect(0, 0, 36, 22, 3);
    // Warning accent aperture
    emitGfx.fillStyle(0xf97316, 0.85);
    emitGfx.fillCircle(18, 11, 7);
    emitGfx.fillStyle(0xffffff, 1);
    emitGfx.fillCircle(18, 11, 3);
    // Top caution stripes
    emitGfx.fillStyle(0xfbbf24, 1);
    emitGfx.fillRect(4, 2, 6, 3);
    emitGfx.fillRect(26, 2, 6, 3);
    emitGfx.generateTexture('hazard_laser_emitter', 36, 22);
    emitGfx.destroy();

    // 22B. Suspended Mechanical Laser Gate Chassis (220x96 - Reference Recreation)
    const gatePodGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // White chamfered mechanical chassis
    gatePodGfx.fillStyle(0xffffff, 1);
    gatePodGfx.fillRoundedRect(0, 0, 220, 96, 8);
    gatePodGfx.lineStyle(2, 0xcbd5e1, 1);
    gatePodGfx.strokeRoundedRect(0, 0, 220, 96, 8);

    // Inner chamber recession (dark aperture allowing laser beams to glow inside)
    gatePodGfx.fillStyle(0x0a1128, 0.45);
    gatePodGfx.fillRect(24, 16, 172, 64);
    gatePodGfx.lineStyle(1.5, 0xe2e8f0, 0.6);
    gatePodGfx.strokeRect(24, 16, 172, 64);

    // Top caution hazard stripes (diagonal yellow/orange hashes)
    for (let hx = 60; hx < 160; hx += 16) {
      gatePodGfx.fillStyle(0xfbbf24, 1);
      gatePodGfx.fillRect(hx, 4, 8, 8);
      gatePodGfx.fillStyle(0xf97316, 1);
      gatePodGfx.fillRect(hx + 8, 4, 8, 8);
    }

    // Left and right vertical emitter caps with status LEDs
    gatePodGfx.fillStyle(0xe2e8f0, 1);
    gatePodGfx.fillRect(4, 14, 20, 68);
    gatePodGfx.fillRect(196, 14, 20, 68);
    gatePodGfx.fillStyle(0xf97316, 1);
    gatePodGfx.fillCircle(14, 26, 4);
    gatePodGfx.fillCircle(14, 48, 4);
    gatePodGfx.fillCircle(14, 70, 4);
    gatePodGfx.fillCircle(206, 26, 4);
    gatePodGfx.fillCircle(206, 48, 4);
    gatePodGfx.fillCircle(206, 70, 4);

    // Suspension mount brackets on top
    gatePodGfx.fillStyle(0x94a3b8, 1);
    gatePodGfx.fillRect(50, -6, 16, 8);
    gatePodGfx.fillRect(154, -6, 16, 8);

    gatePodGfx.generateTexture('hazard_suspended_gate', 220, 96);
    gatePodGfx.destroy();

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

    // 29. Fractured Celestial Temporal Moon / Gas Giant (140x140)
    const moonGfx = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer orbital ring
    moonGfx.lineStyle(2, 0x38bdf8, 0.4);
    moonGfx.strokeEllipse(70, 70, 136, 44);
    // Dark planetary body
    moonGfx.fillStyle(0x0b1329, 0.95);
    moonGfx.fillCircle(70, 70, 48);
    // Subtle crater shadows
    moonGfx.fillStyle(0x070c1a, 0.7);
    moonGfx.fillCircle(54, 58, 14);
    moonGfx.fillCircle(82, 80, 18);
    moonGfx.fillCircle(85, 52, 10);
    // Illuminated crescent horizon rim
    moonGfx.lineStyle(3, 0x00f0ff, 0.85);
    moonGfx.beginPath();
    moonGfx.arc(70, 70, 48, -Math.PI * 0.7, Math.PI * 0.1);
    moonGfx.strokePath();
    moonGfx.lineStyle(1.5, 0xffffff, 0.95);
    moonGfx.beginPath();
    moonGfx.arc(70, 70, 48, -Math.PI * 0.55, -Math.PI * 0.05);
    moonGfx.strokePath();
    // Violet temporal anomaly fracture fissures
    moonGfx.lineStyle(2, 0xa855f7, 0.85);
    moonGfx.lineBetween(48, 62, 68, 74);
    moonGfx.lineBetween(68, 74, 92, 66);
    moonGfx.fillStyle(0xffffff, 0.9);
    moonGfx.fillCircle(68, 74, 2.5);
    moonGfx.generateTexture('celestial_temporal_moon', 140, 140);
    moonGfx.destroy();

    // 30. Distant Skyway Transit Cruiser (28x10)
    const trafficGfx = this.make.graphics({ x: 0, y: 0, add: false });
    trafficGfx.fillStyle(0x0f1c3f, 0.9);
    trafficGfx.fillRoundedRect(0, 2, 28, 6, 2);
    // Headlight
    trafficGfx.fillStyle(0x00f0ff, 1);
    trafficGfx.fillRect(24, 3, 4, 4);
    // Tail thruster
    trafficGfx.fillStyle(0xf59e0b, 1);
    trafficGfx.fillRect(0, 3, 4, 4);
    trafficGfx.generateTexture('bg_skyway_traffic', 28, 10);
    trafficGfx.destroy();

    // 31. Near-Background Tech Cable Conduits (128x220)
    const conduitGfx = this.make.graphics({ x: 0, y: 0, add: false });
    conduitGfx.lineStyle(2, 0x1e293b, 0.8);
    // Vertical conduit trunk with diagonal tech braces
    conduitGfx.lineBetween(16, 0, 16, 220);
    conduitGfx.lineBetween(32, 0, 32, 220);
    conduitGfx.lineBetween(16, 40, 64, 90);
    conduitGfx.lineBetween(64, 90, 64, 220);
    conduitGfx.lineBetween(32, 80, 80, 130);
    conduitGfx.lineBetween(80, 130, 80, 220);
    // Glowing cyan data conduits
    conduitGfx.lineStyle(1.5, 0x00f0ff, 0.7);
    conduitGfx.lineBetween(24, 0, 24, 220);
    conduitGfx.lineBetween(24, 60, 72, 110);
    conduitGfx.lineBetween(72, 110, 72, 220);
    // Conduit junction nodes
    conduitGfx.fillStyle(0x00f0ff, 1);
    conduitGfx.fillCircle(24, 60, 3);
    conduitGfx.fillCircle(72, 110, 3);
    conduitGfx.generateTexture('near_tech_conduits', 128, 220);
    conduitGfx.destroy();

    // 32. Landing Dust Puff (24x12)
    const dustGfx = this.make.graphics({ x: 0, y: 0, add: false });
    dustGfx.fillStyle(0x00f0ff, 0.5);
    dustGfx.fillCircle(6, 6, 5);
    dustGfx.fillCircle(18, 6, 5);
    dustGfx.fillStyle(0xffffff, 0.7);
    dustGfx.fillCircle(12, 6, 4);
    dustGfx.generateTexture('vfx_landing_dust', 24, 12);
    dustGfx.destroy();

    // 33. Pylon Flux Node (40x64)
    const pylonGfx = this.make.graphics({ x: 0, y: 0, add: false });
    pylonGfx.fillStyle(0x0a1020, 1);
    pylonGfx.fillRoundedRect(4, 46, 32, 18, 4);
    pylonGfx.lineStyle(1.5, 0x1e3a8a, 0.9);
    pylonGfx.strokeRoundedRect(4, 46, 32, 18, 4);
    pylonGfx.fillStyle(0x0f172a, 1);
    pylonGfx.fillRect(12, 12, 16, 34);
    pylonGfx.lineStyle(1.5, 0x00f0ff, 0.8);
    pylonGfx.strokeRect(12, 12, 16, 34);
    pylonGfx.fillStyle(0x00f0ff, 0.8);
    pylonGfx.fillRect(15, 16, 10, 26);
    pylonGfx.fillStyle(0xffffff, 1);
    pylonGfx.fillRect(18, 20, 4, 18);
    pylonGfx.fillStyle(0x00f0ff, 1);
    pylonGfx.fillTriangle(20, 2, 28, 12, 12, 12);
    pylonGfx.generateTexture('pylon_flux_node', 40, 64);
    pylonGfx.destroy();

    // 34. Pylon Glyph Alpha (28x28)
    const alphaGfx = this.make.graphics({ x: 0, y: 0, add: false });
    alphaGfx.lineStyle(2.5, 0x00f0ff, 1);
    alphaGfx.beginPath();
    alphaGfx.arc(12, 14, 7, 0, Math.PI * 2);
    alphaGfx.moveTo(7, 9);
    alphaGfx.lineTo(24, 21);
    alphaGfx.strokePath();
    alphaGfx.generateTexture('pylon_glyph_alpha', 28, 28);
    alphaGfx.destroy();

    // 35. Pylon Glyph Beta (28x28)
    const betaGfx = this.make.graphics({ x: 0, y: 0, add: false });
    betaGfx.lineStyle(2.5, 0xa855f7, 1);
    betaGfx.lineBetween(7, 4, 7, 24);
    betaGfx.beginPath();
    betaGfx.arc(14, 9, 5, -Math.PI / 2, Math.PI / 2);
    betaGfx.arc(14, 17, 5, -Math.PI / 2, Math.PI / 2);
    betaGfx.strokePath();
    betaGfx.generateTexture('pylon_glyph_beta', 28, 28);
    betaGfx.destroy();

    // 36. Arena Barrier Field (20x240)
    const barrierGfx = this.make.graphics({ x: 0, y: 0, add: false });
    barrierGfx.fillStyle(0x00f0ff, 0.25);
    barrierGfx.fillRect(4, 0, 12, 240);
    barrierGfx.lineStyle(2, 0x00f0ff, 0.9);
    barrierGfx.lineBetween(10, 0, 10, 240);
    barrierGfx.lineStyle(1.5, 0xa855f7, 0.8);
    for (let by = 0; by < 240; by += 24) {
      barrierGfx.lineBetween(2, by, 18, by + 12);
      barrierGfx.lineBetween(2, by + 12, 18, by);
    }
    barrierGfx.generateTexture('arena_barrier_field', 20, 240);
    barrierGfx.destroy();

    // 37. Sine Platform (84x22)
    const sinePlatGfx = this.make.graphics({ x: 0, y: 0, add: false });
    sinePlatGfx.fillStyle(0x0a1128, 1);
    sinePlatGfx.fillRoundedRect(2, 2, 80, 18, 4);
    sinePlatGfx.lineStyle(1.5, 0x00f0ff, 0.85);
    sinePlatGfx.strokeRoundedRect(2, 2, 80, 18, 4);
    sinePlatGfx.fillStyle(0x00f0ff, 1);
    sinePlatGfx.fillRect(6, 2, 72, 3);
    sinePlatGfx.lineStyle(1.5, 0x38bdf8, 0.9);
    sinePlatGfx.beginPath();
    for (let sx = 14; sx <= 70; sx += 2) {
      const sy = 11 + Math.sin((sx - 14) * 0.18) * 4;
      if (sx === 14) sinePlatGfx.moveTo(sx, sy);
      else sinePlatGfx.lineTo(sx, sy);
    }
    sinePlatGfx.strokePath();
    sinePlatGfx.generateTexture('sine_platform', 84, 22);
    sinePlatGfx.destroy();

    // 38. Vector Reticle (32x32)
    const reticleGfx = this.make.graphics({ x: 0, y: 0, add: false });
    reticleGfx.lineStyle(1.5, 0x00f0ff, 0.9);
    reticleGfx.strokeCircle(16, 16, 12);
    reticleGfx.lineBetween(16, 2, 16, 8);
    reticleGfx.lineBetween(16, 24, 16, 30);
    reticleGfx.lineBetween(2, 16, 8, 16);
    reticleGfx.lineBetween(24, 16, 30, 16);
    reticleGfx.fillStyle(0x00f0ff, 1);
    reticleGfx.fillCircle(16, 16, 2);
    reticleGfx.generateTexture('vector_reticle', 32, 32);
    reticleGfx.destroy();
  }

  create() {
    // Transition cleanly to MenuScene
    this.scene.start('MenuScene');
  }
}
