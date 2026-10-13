import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';

export class MovingPlatform {
  /**
   * Moving Platform Hazard / Traversal Obstacle
   * Deterministic linear motion between two defined endpoints
   * Supports Chrono Freeze and reliable rider physics
   */
  constructor(scene, startX, startY, endX, endY, config = {}) {
    this.scene = scene;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.speed = config.speed || 90; // pixels per second
    this.pauseDuration = config.pauseDuration || 600; // ms at endpoints
    this.textureKey = config.textureKey || 'moving_platform_tile';

    this.targetX = endX;
    this.targetY = endY;
    this.isPausing = false;
    this.isFrozen = false;
    this.pauseTimer = null;

    // 1. Arcade Physics Sprite
    this.sprite = scene.physics.add.image(startX, startY, this.textureKey);
    this.sprite.setImmovable(true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.friction.x = 1;
    this.sprite.body.friction.y = 0;
    this.sprite.setDepth(16);
    this.sprite.parentPlatform = this;

    // Calculate initial velocity vector
    this.calculateVelocity();

    // Previous position for rider displacement tracking
    this.prevX = this.sprite.x;
    this.prevY = this.sprite.y;
    this.deltaX = 0;

    this.frostNode = null;
  }

  calculateVelocity() {
    if (this.isPausing || this.isFrozen) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
      // Reached endpoint: initiate pause
      this.sprite.setVelocity(0, 0);
      this.isPausing = true;
      this.pauseTimer = this.scene.time.delayedCall(this.pauseDuration, () => {
        this.isPausing = false;
        // Swap targets
        if (this.targetX === this.endX && this.targetY === this.endY) {
          this.targetX = this.startX;
          this.targetY = this.startY;
        } else {
          this.targetX = this.endX;
          this.targetY = this.endY;
        }
        this.calculateVelocity();
      });
      return;
    }

    // Normalized direction vector multiplied by speed
    const vx = (dx / dist) * this.speed;
    const vy = (dy / dist) * this.speed;
    this.sprite.setVelocity(vx, vy);
  }

  update(time, delta) {
    if (this.isFrozen) {
      this.sprite.setVelocity(0, 0);
      this.deltaX = 0;
      return;
    }

    if (!this.isPausing) {
      this.calculateVelocity();
    }

    // Compute actual delta for riding entities
    this.deltaX = this.sprite.x - this.prevX;
    this.prevX = this.sprite.x;
    this.prevY = this.sprite.y;
  }

  /**
   * Helper called during collision to transport standing players
   */
  handleRider(player) {
    if (this.isFrozen) return;
    if (player.body.touching.down && this.sprite.body.touching.up) {
      // Displace player horizontally with the platform to prevent slipping
      player.x += this.deltaX;
    }
  }

  /**
   * Chrono Freeze interaction
   */
  freeze(duration) {
    if (this.isFrozen) return;
    this.isFrozen = true;

    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0x00f0ff);

    if (this.pauseTimer) {
      this.pauseTimer.paused = true;
    }

    this.frostNode = this.scene.add.image(this.sprite.x, this.sprite.y, 'vfx_freeze_crystal')
      .setScale(1.6)
      .setDepth(17);

    this.scene.time.delayedCall(duration, () => {
      this.thaw();
    });
  }

  thaw() {
    if (!this.isFrozen) return;
    this.isFrozen = false;
    this.sprite.clearTint();

    if (this.pauseTimer) {
      this.pauseTimer.paused = false;
    }

    if (this.frostNode) {
      this.frostNode.destroy();
      this.frostNode = null;
    }

    ChronoVFX.spawnFreezeRelease(this.scene, this.sprite.x, this.sprite.y);
    this.calculateVelocity();
  }

  destroy() {
    if (this.pauseTimer) this.pauseTimer.remove();
    if (this.sprite) this.sprite.destroy();
    if (this.frostNode) this.frostNode.destroy();
  }
}
