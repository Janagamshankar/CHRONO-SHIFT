import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import BriefingScene from '../scenes/BriefingScene.js';
import FoundationTestScene from '../scenes/FoundationTestScene.js';

export const GAME_SETTINGS = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TARGET_FPS: 60,
  
  // Tunable Player Attributes (Centralized per SPEC Section 17 & Section 6)
  PLAYER: {
    RUN_SPEED: 320,
    JUMP_VELOCITY: -520,
    SLIDE_VELOCITY: 420,
    SLIDE_DURATION_MS: 450,
    MAX_HEALTH: 100,
    INVULNERABILITY_MS: 1200
  },

  // Chrono Abilities (SPEC Section 7)
  CHRONO: {
    MAX_ENERGY: 100,
    CELL_RECHARGE_AMOUNT: 20,
    FREEZE_COST: 35,
    FREEZE_DURATION_MS: 2000,
    DASH_COST: 25,
    DASH_DURATION_MS: 300,
    DASH_SPEED_MULTIPLIER: 2.5
  },

  // Mission Countdown (SPEC Section 12)
  COUNTDOWN_SECONDS: 180,

  // Theme Colors (Light Theme per Reference: Bright Sky Blue, White, Silver, Cyan, Orange-Red Hazards)
  COLORS: {
    PRIMARY_CYAN: 0x00d8f6,
    ACCENT_PURPLE: 0x9333ea,
    ALERT_AMBER: 0xf59e0b,
    DANGER_RED: 0xf97316,
    SKY_BLUE: 0x7ec4fc,
    SURFACE_WHITE: 0xf8fafc,
    SURFACE_SILVER: 0xe2e8f0,
    TEXT_DARK: 0x0f172a,
    TEXT_LIGHT: 0xffffff
  }
};

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#7ec4fc',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800, x: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  },
  scene: [BootScene, PreloadScene, MenuScene, BriefingScene, FoundationTestScene]
};
