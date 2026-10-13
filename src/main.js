import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

// Prevent duplicate game instances
function initGame() {
  if (window.__CHRONO_GAME__) {
    window.__CHRONO_GAME__.destroy(true);
    window.__CHRONO_GAME__ = null;
  }
  const game = new Phaser.Game(gameConfig);
  window.__CHRONO_GAME__ = game;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

