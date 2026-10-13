import Phaser from 'phaser';
import { PlasmaProjectile } from './PlasmaProjectile.js';
import { ChronoVFX } from '../../effects/ChronoVFX.js';

export class PlasmaTurret {
  /**
   * Plasma Turret Hazard Spawner
   * Fires directional projectiles at steady intervals with clear visual tell
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.angleDeg = config.angleDeg || 180; // 180 = firing left, 0 = right, 90 = down
    this.fireIntervalMs = config.fireIntervalMs || 2200;
    this.chargeTellMs = config.chargeTellMs || 500;
    this.projSpeed = config.projSpeed || 250;
    this.damage = config.damage || 20;
    this.delayMs = config.delayMs || 400;

    this.isFrozen = false;
    this.fireTimer = null;
    this.chargeTimer = null;

    // Direction vector
    const rad = Phaser.Math.DegToRad(this.angleDeg);
    this.dirX = Math.cos(rad);
    this.dirY = Math.sin(rad);

    // 1. Turret Base Sprite
    this.turretSprite = scene.add.image(x, y, 'hazard_turret').setDepth(17);
    this.turretSprite.angle = this.angleDeg - 180;

    // 2. Muzzle Flash Warning Tell Node
    this.muzzleX = x + this.dirX * 18;
    this.muzzleY = y + this.dirY * 18;
    this.muzzleTell = scene.add.image(this.muzzleX, this.muzzleY, 'particle_cyan')
      .setScale(0.5)
      .setTint(0xf59e0b)
      .setAlpha(0)
      .setDepth(18);

    // Active projectiles tracked for freeze integration
    this.projectiles = scene.physics.add.group();

    // Start firing cycle
    this.scene.time.delayedCall(this.delayMs, () => {
      this.scheduleNextFire();
    });
  }

  scheduleNextFire() {
    if (this.isFrozen) return;

    this.fireTimer = this.scene.time.delayedCall(this.fireIntervalMs - this.chargeTellMs, () => {
      this.startChargeTell();
    });
  }

  startChargeTell() {
    if (this.isFrozen) return;

    // Visual warning tell: amber muzzle buildup
    this.muzzleTell.setAlpha(1).setScale(0.2);
    this.scene.tweens.add({
      targets: this.muzzleTell,
      scale: 1.1,
      alpha: 0.9,
      duration: this.chargeTellMs,
      ease: 'Quad.easeIn',
      onComplete: () => {
        if (!this.isFrozen) {
          this.fireProjectile();
        }
      }
    });
  }

  fireProjectile() {
    if (this.isFrozen) return;

    this.muzzleTell.setAlpha(0);

    // Spawn projectile
    const proj = new PlasmaProjectile(
      this.scene,
      this.muzzleX,
      this.muzzleY,
      this.dirX,
      this.dirY,
      this.projSpeed,
      this.damage
    );
    this.projectiles.add(proj);

    // Register into scene's eligible freeze hazards list
    if (this.scene.eligibleHazards) {
      this.scene.eligibleHazards.push(proj);
    }

    // Schedule next shot
    this.scheduleNextFire();
  }

  /**
   * Chrono Freeze interaction
   */
  freeze(duration) {
    if (this.isFrozen) return;
    this.isFrozen = true;

    this.turretSprite.setTint(0x00f0ff);
    if (this.muzzleTell) this.muzzleTell.setAlpha(0);

    if (this.fireTimer) this.fireTimer.remove();

    this.frostNode = this.scene.add.image(this.x, this.y, 'vfx_freeze_crystal')
      .setScale(1.5)
      .setDepth(19);

    // Freeze all existing active projectiles from this turret
    this.projectiles.getChildren().forEach(p => {
      if (p.active && p.freeze) {
        p.freeze(duration);
      }
    });

    this.scene.time.delayedCall(duration, () => {
      this.thaw();
    });
  }

  thaw() {
    if (!this.isFrozen) return;
    this.isFrozen = false;
    this.turretSprite.clearTint();

    if (this.frostNode) {
      this.frostNode.destroy();
      this.frostNode = null;
    }

    ChronoVFX.spawnFreezeRelease(this.scene, this.x, this.y);

    // Resume firing cycle
    this.scheduleNextFire();
  }

  destroy() {
    if (this.fireTimer) this.fireTimer.remove();
    if (this.turretSprite) this.turretSprite.destroy();
    if (this.muzzleTell) this.muzzleTell.destroy();
    if (this.frostNode) this.frostNode.destroy();
  }
}
