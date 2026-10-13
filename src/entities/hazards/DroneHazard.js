import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';

export class DroneHazard extends Phaser.Physics.Arcade.Sprite {
  /**
   * Sentinel Patrol Drone Hazard
   * Predictable bounded patrol between two horizontal coordinates
   * Subtle hover bobbing and complete Chrono Freeze support
   */
  constructor(scene, startX, y, endX, config = {}) {
    super(scene, startX, y, 'drone_patrol');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.startX = startX;
    this.endX = endX;
    this.baseY = y;
    this.speed = config.speed || 80;
    this.damage = config.damage || 20;

    this.setDepth(17);
    this.body.setAllowGravity(false);
    this.body.setCircle(12, 8, 0);

    this.direction = 1; // 1 = right, -1 = left
    this.setVelocityX(this.direction * this.speed);

    this.isFrozen = false;
    this.hoverTime = 0;
    this.parentHazard = this;
    this.frostNode = null;
  }

  update(time, delta) {
    if (this.isFrozen) {
      this.setVelocity(0, 0);
      return;
    }

    // Hover bobbing
    this.hoverTime += delta * 0.003;
    this.y = this.baseY + Math.sin(this.hoverTime) * 6;

    // Check patrol bounds
    if (this.direction === 1 && this.x >= this.endX) {
      this.direction = -1;
      this.setFlipX(true);
      this.setVelocityX(this.direction * this.speed);
    } else if (this.direction === -1 && this.x <= this.startX) {
      this.direction = 1;
      this.setFlipX(false);
      this.setVelocityX(this.direction * this.speed);
    }
  }

  /**
   * Chrono Freeze interaction
   */
  freeze(duration) {
    if (this.isFrozen) return;
    this.isFrozen = true;

    this.setVelocity(0, 0);
    this.setTint(0x00f0ff);

    this.frostNode = this.scene.add.image(this.x, this.y, 'vfx_freeze_crystal')
      .setScale(1.5)
      .setDepth(19);

    this.scene.time.delayedCall(duration, () => {
      this.thaw();
    });
  }

  thaw() {
    if (!this.isFrozen) return;
    this.isFrozen = false;
    this.clearTint();

    if (this.frostNode) {
      this.frostNode.destroy();
      this.frostNode = null;
    }

    ChronoVFX.spawnFreezeRelease(this.scene, this.x, this.y);
    this.setVelocityX(this.direction * this.speed);
  }

  destroy(fromScene) {
    if (this.frostNode) this.frostNode.destroy();
    super.destroy(fromScene);
  }
}
