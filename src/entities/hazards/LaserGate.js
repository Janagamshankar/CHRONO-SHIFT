import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';
import { audioManager } from '../../systems/AudioManager.js';

export class LaserGate {
  /**
   * Timed Laser Gate Hazard
   * Cycles through: CHARGING (warning) -> ACTIVE (lethal beam) -> COOLING (inactive)
   * Supports both horizontal suspended gate (matching reference) and vertical gate.
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.isHorizontal = config.horizontal !== undefined ? config.horizontal : false;
    this.width = config.width || (this.isHorizontal ? 220 : 36);
    this.height = config.height || (this.isHorizontal ? 96 : 160);
    this.chargeMs = config.chargeMs || 1200;
    this.activeMs = config.activeMs || 1800;
    this.coolMs = config.coolMs || 1500;
    this.delayMs = config.delayMs || 0;
    this.damage = config.damage || 25;

    this.state = 'IDLE'; // 'CHARGING', 'ACTIVE', 'COOLING'
    this.isFrozen = false;
    this.cycleTimer = null;
    this.stateStartTime = 0;
    this.stateDuration = 0;
    this.remainingMs = 0;

    // Visual graphics for suspension rods, warning tell, and laser beams
    this.structureGfx = scene.add.graphics().setDepth(15);
    this.warningGfx = scene.add.graphics().setDepth(16);
    this.beamGfx = scene.add.graphics().setDepth(17);

    if (this.isHorizontal) {
      // Suspended Pod Chassis Sprite
      this.podSprite = scene.add.image(x, y, 'hazard_suspended_gate').setDepth(18);

      // Render vertical suspension rods ascending to ceiling
      this.structureGfx.lineStyle(2.5, 0x94a3b8, 0.9);
      this.structureGfx.lineBetween(x - 52, 0, x - 52, y - 48);
      this.structureGfx.lineBetween(x + 52, 0, x + 52, y - 48);
      this.structureGfx.lineStyle(1.5, 0xffffff, 0.95);
      this.structureGfx.lineBetween(x - 52, 0, x - 52, y - 48);
      this.structureGfx.lineBetween(x + 52, 0, x + 52, y - 48);

      // Arcade Physics Hitbox (horizontal lethal zone)
      this.hitbox = scene.physics.add.sprite(x, y, null);
      this.hitbox.setVisible(false);
      this.hitbox.body.setSize(170, 56);
      this.hitbox.body.setAllowGravity(false);
      this.hitbox.body.setImmovable(true);
      this.hitbox.body.enable = false;
    } else {
      // Vertical Emitters at top and bottom
      const halfH = this.height / 2;
      this.topEmitter = scene.add.image(x, y - halfH, 'hazard_laser_emitter').setDepth(18);
      this.bottomEmitter = scene.add.image(x, y + halfH, 'hazard_laser_emitter').setDepth(18).setFlipY(true);

      // Arcade Physics Hitbox (vertical lethal zone)
      this.hitbox = scene.physics.add.sprite(x, y, null);
      this.hitbox.setVisible(false);
      this.hitbox.body.setSize(16, this.height - 24);
      this.hitbox.body.setAllowGravity(false);
      this.hitbox.body.setImmovable(true);
      this.hitbox.body.enable = false;
    }

    // Link hazard reference
    this.hitbox.parentHazard = this;

    // Start cycling with optional initial delay or immediate active state
    if (config.startActive) {
      this.startActive();
    } else if (this.delayMs > 0) {
      this.cycleTimer = scene.time.delayedCall(this.delayMs, () => this.startCharging());
    } else {
      this.startCharging();
    }
  }

  startCharging() {
    if (this.isFrozen) return;
    this.state = 'CHARGING';
    this.stateStartTime = this.scene.time.now;
    this.stateDuration = this.chargeMs;
    this.hitbox.body.enable = false;
    this.beamGfx.clear();

    if (this.podSprite) {
      this.podSprite.setTint(0xfde68a);
    } else {
      if (this.topEmitter) this.topEmitter.setTint(0xf59e0b);
      if (this.bottomEmitter) this.bottomEmitter.setTint(0xf59e0b);
    }

    // Hazard audio tell (proximity constrained)
    const cam = this.scene.cameras.main;
    const isNearby = cam && Math.abs(cam.scrollX + cam.width / 2 - this.x) < 700;
    if (isNearby) {
      audioManager.play('laserCharge', { duration: this.chargeMs / 1000 });
    }

    this.cycleTimer = this.scene.time.delayedCall(this.chargeMs, () => {
      this.startActive();
    });
  }

  startActive() {
    if (this.isFrozen) return;
    this.state = 'ACTIVE';
    this.stateStartTime = this.scene.time.now;
    this.stateDuration = this.activeMs;
    this.hitbox.body.enable = true; // Lethal damage active!

    if (this.podSprite) {
      this.podSprite.clearTint();
    } else {
      if (this.topEmitter) this.topEmitter.setTint(0xef4444);
      if (this.bottomEmitter) this.bottomEmitter.setTint(0xef4444);
    }

    this.renderActiveBeams();

    // Hazard audio fire hum (proximity constrained)
    const cam = this.scene.cameras.main;
    const isNearby = cam && Math.abs(cam.scrollX + cam.width / 2 - this.x) < 700;
    if (isNearby) {
      audioManager.play('laserFire', { duration: this.activeMs / 1000 });
    }

    // Spark burst at emitters
    for (let i = 0; i < 4; i++) {
      const sparkX = this.isHorizontal ? this.x + Phaser.Math.Between(-80, 80) : this.x;
      const sparkY = this.isHorizontal ? this.y + Phaser.Math.Between(-20, 20) : this.y - this.height / 2 + 10;
      const p = this.scene.add.image(sparkX, sparkY, 'particle_cyan').setScale(0.4).setTint(0xf97316);
      p.setDepth(19);
      this.scene.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0.1,
        duration: 180,
        onComplete: () => p.destroy()
      });
    }

    this.cycleTimer = this.scene.time.delayedCall(this.activeMs, () => {
      this.startCooling();
    });
  }

  renderActiveBeams() {
    this.warningGfx.clear();
    this.beamGfx.clear();

    if (this.isHorizontal) {
      const leftX = this.x - 86;
      const rightX = this.x + 86;
      const beamYs = [this.y - 20, this.y - 7, this.y + 7, this.y + 20];

      // Inner chamber orange volumetric plasma glow (Reference Recreation)
      this.beamGfx.fillStyle(0xf97316, 0.18);
      this.beamGfx.fillRect(leftX, this.y - 24, rightX - leftX, 48);

      beamYs.forEach(by => {
        // Outer coral/orange glow beam
        this.beamGfx.lineStyle(10, 0xf97316, 0.55);
        this.beamGfx.lineBetween(leftX, by, rightX, by);
        // Mid beam
        this.beamGfx.lineStyle(5, 0xef4444, 0.95);
        this.beamGfx.lineBetween(leftX, by, rightX, by);
        // Lethal white core filament
        this.beamGfx.lineStyle(2, 0xffffff, 1.0);
        this.beamGfx.lineBetween(leftX, by, rightX, by);
      });
    } else {
      const halfH = this.height / 2;
      this.beamGfx.lineStyle(14, 0xf97316, 0.45);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
      this.beamGfx.lineStyle(6, 0xef4444, 0.85);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
      this.beamGfx.lineStyle(2, 0xffffff, 1.0);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
    }
  }

  startCooling() {
    if (this.isFrozen) return;
    this.state = 'COOLING';
    this.stateStartTime = this.scene.time.now;
    this.stateDuration = this.coolMs;
    this.hitbox.body.enable = false; // Harmless
    this.beamGfx.clear();
    this.warningGfx.clear();

    if (this.podSprite) this.podSprite.clearTint();
    if (this.topEmitter) this.topEmitter.clearTint();
    if (this.bottomEmitter) this.bottomEmitter.clearTint();

    this.cycleTimer = this.scene.time.delayedCall(this.coolMs, () => {
      this.startCharging();
    });
  }

  update(time, delta) {
    if (this.isFrozen) return;

    if (this.isHorizontal) {
      const leftX = this.x - 86;
      const rightX = this.x + 86;
      const beamYs = [this.y - 20, this.y - 7, this.y + 7, this.y + 20];

      if (this.state === 'CHARGING') {
        this.warningGfx.clear();
        const elapsed = time - this.stateStartTime;
        const progress = Math.min(1, elapsed / this.stateDuration);
        const pulseAlpha = 0.35 + Math.sin(time * 0.02) * 0.25 + progress * 0.4;

        this.warningGfx.lineStyle(1.5, 0xf97316, pulseAlpha);
        beamYs.forEach(by => {
          this.warningGfx.lineBetween(leftX, by, rightX, by);
        });
      } else if (this.state === 'ACTIVE') {
        this.renderActiveBeams();
      } else {
        this.warningGfx.clear();
        this.beamGfx.clear();
      }
    } else {
      const halfH = this.height / 2;

      if (this.state === 'CHARGING') {
        this.warningGfx.clear();
        const elapsed = time - this.stateStartTime;
        const progress = Math.min(1, elapsed / this.stateDuration);
        const pulseAlpha = 0.35 + Math.sin(time * 0.02) * 0.25 + progress * 0.4;

        this.warningGfx.lineStyle(1.5, 0xf97316, pulseAlpha);
        this.warningGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
      } else if (this.state === 'ACTIVE') {
        this.renderActiveBeams();
      } else {
        this.warningGfx.clear();
        this.beamGfx.clear();
      }
    }
  }

  /**
   * Chrono Freeze interaction
   * Suspends cycle timer, freezes beam visually, and disables lethal collider so player can pass
   */
  freeze(duration) {
    if (this.isFrozen) return;
    this.isFrozen = true;

    // Calculate remaining time in current cycle state
    const elapsed = this.scene.time.now - this.stateStartTime;
    this.remainingMs = Math.max(100, this.stateDuration - elapsed);

    // Cancel pending state timer
    if (this.cycleTimer) this.cycleTimer.remove();

    // Disable lethal hitbox during temporal freeze (rewarding freeze utility)
    this.hitbox.body.enable = false;

    // Apply cyan frost aesthetics
    if (this.isHorizontal) {
      if (this.podSprite) this.podSprite.setTint(0x00f0ff);
    } else {
      if (this.topEmitter) this.topEmitter.setTint(0x00f0ff);
      if (this.bottomEmitter) this.bottomEmitter.setTint(0x00f0ff);
    }

    if (this.state === 'ACTIVE') {
      // Render frozen crystallized laser beam
      this.beamGfx.clear();
      if (this.isHorizontal) {
        const leftX = this.x - 86;
        const rightX = this.x + 86;
        const beamYs = [this.y - 20, this.y - 7, this.y + 7, this.y + 20];
        this.beamGfx.fillStyle(0x00f0ff, 0.2);
        this.beamGfx.fillRect(leftX, this.y - 24, rightX - leftX, 48);
        beamYs.forEach(by => {
          this.beamGfx.lineStyle(4, 0x00f0ff, 0.7);
          this.beamGfx.lineBetween(leftX, by, rightX, by);
          this.beamGfx.lineStyle(1.5, 0xffffff, 0.9);
          this.beamGfx.lineBetween(leftX, by, rightX, by);
        });
      } else {
        const halfH = this.height / 2;
        this.beamGfx.lineStyle(10, 0x00f0ff, 0.5);
        this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
        this.beamGfx.lineStyle(2, 0xffffff, 0.9);
        this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
      }
    }

    // Freeze crystal node
    this.frostNode = this.scene.add.image(this.x, this.y, 'vfx_freeze_crystal').setScale(1.8).setDepth(18);

    // Resume after duration
    this.scene.time.delayedCall(duration, () => {
      this.thaw();
    });
  }

  thaw() {
    if (!this.isFrozen) return;
    this.isFrozen = false;
    if (this.frostNode) {
      this.frostNode.destroy();
      this.frostNode = null;
    }
    ChronoVFX.spawnFreezeRelease(this.scene, this.x, this.y);

    if (this.isHorizontal) {
      if (this.podSprite) this.podSprite.clearTint();
    } else {
      if (this.topEmitter) this.topEmitter.clearTint();
      if (this.bottomEmitter) this.bottomEmitter.clearTint();
    }

    // Resume cycle from remaining time in current state
    if (this.state === 'CHARGING') {
      if (this.topEmitter) this.topEmitter.setTint(0xf59e0b);
      if (this.bottomEmitter) this.bottomEmitter.setTint(0xf59e0b);
      this.cycleTimer = this.scene.time.delayedCall(this.remainingMs, () => this.startActive());
    } else if (this.state === 'ACTIVE') {
      this.hitbox.body.enable = true;
      if (this.topEmitter) this.topEmitter.setTint(0xef4444);
      if (this.bottomEmitter) this.bottomEmitter.setTint(0xef4444);
      this.cycleTimer = this.scene.time.delayedCall(this.remainingMs, () => this.startCooling());
    } else {
      if (this.topEmitter) this.topEmitter.clearTint();
      if (this.bottomEmitter) this.bottomEmitter.clearTint();
      this.cycleTimer = this.scene.time.delayedCall(this.remainingMs, () => this.startCharging());
    }
  }

  destroy() {
    if (this.cycleTimer) this.cycleTimer.remove();
    if (this.podSprite) this.podSprite.destroy();
    if (this.topEmitter) this.topEmitter.destroy();
    if (this.bottomEmitter) this.bottomEmitter.destroy();
    if (this.beamGfx) this.beamGfx.destroy();
    if (this.warningGfx) this.warningGfx.destroy();
    if (this.hitbox) this.hitbox.destroy();
    if (this.frostNode) this.frostNode.destroy();
  }
}
