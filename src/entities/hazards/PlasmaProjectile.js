import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';
import { audioManager } from '../../systems/AudioManager.js';

export class PlasmaProjectile extends Phaser.Physics.Arcade.Sprite {
  /**
   * Plasma Projectile Hazard
   * Moves along directional velocity vector
   * Supports Chrono Freeze mid-flight suspension and clean detonation
   */
  constructor(scene, x, y, dirX = -1, dirY = 0, speed = 240, damage = 20) {
    super(scene, x, y, 'hazard_projectile');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.dirX = dirX;
    this.dirY = dirY;
    this.speed = speed;
    this.damage = damage;

    this.body.setAllowGravity(false);
    this.body.setCircle(10, 4, 4);
    this.setDepth(18);

    this.isFrozen = false;
    this.storedVx = dirX * speed;
    this.storedVy = dirY * speed;

    this.setVelocity(this.storedVx, this.storedVy);

    // Subtle plasma rotation
    this.setAngularVelocity(180);

    // Particle trail counter
    this.trailCounter = 0;
  }

  update(time, delta) {
    if (this.isFrozen) {
      this.setVelocity(0, 0);
      return;
    }

    // Spawn subtle particle trail
    this.trailCounter += delta;
    if (this.trailCounter > 120) {
      this.trailCounter = 0;
      const trail = this.scene.add.image(this.x, this.y, 'particle_cyan').setScale(0.35).setTint(0xef4444).setAlpha(0.6);
      trail.setDepth(17);
      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0.1,
        duration: 200,
        onComplete: () => trail.destroy()
      });
    }

    // Check bounds
    const { width, height } = this.scene.scale;
    if (this.x < -30 || this.x > width + 30 || this.y < -30 || this.y > height + 30) {
      this.destroy();
    }
  }

  /**
   * Chrono Freeze interaction: pauses projectile in mid-air
   */
  freeze(duration) {
    if (this.isFrozen || !this.active) return;
    this.isFrozen = true;

    if (this.body && this.body.velocity) {
      this.storedVx = this.body.velocity.x;
      this.storedVy = this.body.velocity.y;
      this.setVelocity(0, 0);
    } else {
      this.storedVx = this.dirX * this.speed;
      this.storedVy = this.dirY * this.speed;
    }

    this.setAngularVelocity(0);

    // Cyan frost tint
    this.setTint(0x00f0ff);

    if (this.scene) {
      this.frostNode = this.scene.add.image(this.x, this.y, 'vfx_freeze_crystal').setScale(1.2).setDepth(19);

      this.scene.time.delayedCall(duration, () => {
        this.thaw();
      });
    }
  }

  thaw() {
    if (!this.isFrozen || !this.active) return;
    this.isFrozen = false;
    this.clearTint();

    if (this.frostNode) {
      this.frostNode.destroy();
      this.frostNode = null;
    }

    if (this.scene) {
      ChronoVFX.spawnFreezeRelease(this.scene, this.x, this.y);
    }

    if (this.body) {
      this.setVelocity(this.storedVx, this.storedVy);
    }
    this.setAngularVelocity(180);
  }

  /**
   * Impact detonation handler
   */
  detonate() {
    audioManager.play('plasmaExplode');
    ChronoVFX.spawnProjectileExplosion(this.scene, this.x, this.y);
    if (this.frostNode) this.frostNode.destroy();
    this.destroy();
  }
}
