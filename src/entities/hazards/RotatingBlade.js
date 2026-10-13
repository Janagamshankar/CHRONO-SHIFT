import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';

export class RotatingBlade {
  /**
   * Rotating Blade / Energy Turbine Hazard
   * Smooth angular rotation around fixed pivot
   * Arcade Physics circular approximation for fair, consistent collision
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.radius = config.radius || 28;
    this.angularSpeed = config.angularSpeed || 200; // degrees per second
    this.damage = config.damage || 20;

    this.isFrozen = false;
    this.currentAngle = config.initialAngle || 0;

    // 1. Pivot Mounting Bracket
    this.pivotBase = scene.add.graphics().setDepth(17);
    this.pivotBase.fillStyle(0x0f172a, 1);
    this.pivotBase.fillCircle(x, y, 14);
    this.pivotBase.lineStyle(1.5, 0x334155, 0.8);
    this.pivotBase.strokeCircle(x, y, 14);

    // 2. Rotating Quad Blade Sprite
    this.bladeSprite = scene.add.image(x, y, 'hazard_blade_quad').setDepth(18);
    this.bladeSprite.setScale((this.radius * 2) / 64);
    this.bladeSprite.angle = this.currentAngle;

    // 3. Central Glowing Hub
    this.hub = scene.add.graphics().setDepth(19);
    this.hub.fillStyle(0xef4444, 1);
    this.hub.fillCircle(x, y, 5);
    this.hub.fillStyle(0xffffff, 0.9);
    this.hub.fillCircle(x, y, 2);

    // 4. Authoritative Arcade Physics Hitbox
    // Note: Arcade Physics uses circular or AABB colliders.
    // A conservative circle matching 75% of blade radius prevents phantom tip collisions
    // while ensuring completely fair, reliable damage detection.
    this.hitbox = scene.physics.add.sprite(x, y, null);
    this.hitbox.setVisible(false);
    this.hitbox.body.setCircle(this.radius * 0.75, -(this.radius * 0.75), -(this.radius * 0.75));
    this.hitbox.body.setAllowGravity(false);
    this.hitbox.body.setImmovable(true);
    this.hitbox.parentHazard = this;

    // Freeze crystal node reference
    this.frostNode = null;
  }

  update(time, delta) {
    if (this.isFrozen) return;

    // Update smooth rotation based on delta time
    const angleDelta = (this.angularSpeed * delta) / 1000;
    this.currentAngle = (this.currentAngle + angleDelta) % 360;
    this.bladeSprite.angle = this.currentAngle;
  }

  /**
   * Chrono Freeze interaction
   */
  freeze(duration) {
    if (this.isFrozen) return;
    this.isFrozen = true;

    // Visual frost tint
    this.bladeSprite.setTint(0x00f0ff);

    // Temporal frost rim
    this.frostNode = this.scene.add.image(this.x, this.y, 'vfx_freeze_crystal')
      .setScale(this.bladeSprite.scale * 2.2)
      .setDepth(20);

    this.scene.time.delayedCall(duration, () => {
      this.thaw();
    });
  }

  thaw() {
    if (!this.isFrozen) return;
    this.isFrozen = false;
    this.bladeSprite.clearTint();

    if (this.frostNode) {
      this.frostNode.destroy();
      this.frostNode = null;
    }

    ChronoVFX.spawnFreezeRelease(this.scene, this.x, this.y);
  }

  destroy() {
    if (this.pivotBase) this.pivotBase.destroy();
    if (this.bladeSprite) this.bladeSprite.destroy();
    if (this.hub) this.hub.destroy();
    if (this.hitbox) this.hitbox.destroy();
    if (this.frostNode) this.frostNode.destroy();
  }
}
