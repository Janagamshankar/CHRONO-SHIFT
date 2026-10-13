import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';

export class LaserGate {
  /**
   * Timed Laser Gate Hazard
   * Cycles through: CHARGING (warning) -> ACTIVE (lethal beam) -> COOLING (inactive)
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.height = config.height || 160;
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

    // 1. Emitters at top and bottom
    const halfH = this.height / 2;
    this.topEmitter = scene.add.image(x, y - halfH, 'hazard_laser_emitter').setDepth(17);
    this.bottomEmitter = scene.add.image(x, y + halfH, 'hazard_laser_emitter').setDepth(17).setFlipY(true);

    // 2. Visual Graphics for Warning & Beam
    this.beamGfx = scene.add.graphics().setDepth(16);
    this.warningGfx = scene.add.graphics().setDepth(15);

    // 3. Authoritative Arcade Physics Hitbox
    this.hitbox = scene.physics.add.sprite(x, y, null);
    this.hitbox.setVisible(false);
    this.hitbox.body.setSize(12, this.height - 24);
    this.hitbox.body.setAllowGravity(false);
    this.hitbox.body.setImmovable(true);
    this.hitbox.body.enable = false; // Disabled by default until ACTIVE

    // Link hazard reference
    this.hitbox.parentHazard = this;

    // 4. Start cycling with optional initial delay
    if (this.delayMs > 0) {
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

    // Pulse warning light on emitters
    this.topEmitter.setTint(0xf59e0b);
    this.bottomEmitter.setTint(0xf59e0b);

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

    this.topEmitter.setTint(0xef4444);
    this.bottomEmitter.setTint(0xef4444);

    // Spark burst at emitters
    for (let i = 0; i < 3; i++) {
      const pTop = this.scene.add.image(this.x, this.y - this.height / 2 + 10, 'particle_cyan').setScale(0.4).setTint(0xef4444);
      pTop.setDepth(18);
      this.scene.tweens.add({
        targets: pTop,
        x: this.x + Phaser.Math.Between(-15, 15),
        alpha: 0,
        duration: 180,
        onComplete: () => pTop.destroy()
      });
    }

    this.cycleTimer = this.scene.time.delayedCall(this.activeMs, () => {
      this.startCooling();
    });
  }

  startCooling() {
    if (this.isFrozen) return;
    this.state = 'COOLING';
    this.stateStartTime = this.scene.time.now;
    this.stateDuration = this.coolMs;
    this.hitbox.body.enable = false; // Harmless
    this.beamGfx.clear();
    this.warningGfx.clear();

    this.topEmitter.clearTint();
    this.bottomEmitter.clearTint();

    this.cycleTimer = this.scene.time.delayedCall(this.coolMs, () => {
      this.startCharging();
    });
  }

  update(time, delta) {
    if (this.isFrozen) return;

    const halfH = this.height / 2;

    if (this.state === 'CHARGING') {
      // Draw pulsing warning laser filament
      this.warningGfx.clear();
      const elapsed = time - this.stateStartTime;
      const progress = Math.min(1, elapsed / this.stateDuration);
      const pulseAlpha = 0.35 + Math.sin(time * 0.02) * 0.25 + progress * 0.4;

      this.warningGfx.lineStyle(1.5, 0xf59e0b, pulseAlpha);
      this.warningGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
    } else if (this.state === 'ACTIVE') {
      // Draw high-energy lethal laser beam
      this.warningGfx.clear();
      this.beamGfx.clear();

      // Outer glow beam
      this.beamGfx.lineStyle(14, 0xef4444, 0.4);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);

      // Mid laser beam
      this.beamGfx.lineStyle(6, 0xf59e0b, 0.85);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);

      // Lethal core filament
      this.beamGfx.lineStyle(2, 0xffffff, 1.0);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
    } else {
      this.warningGfx.clear();
      this.beamGfx.clear();
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
    this.topEmitter.setTint(0x00f0ff);
    this.bottomEmitter.setTint(0x00f0ff);

    if (this.state === 'ACTIVE') {
      // Render frozen crystallized laser beam
      const halfH = this.height / 2;
      this.beamGfx.clear();
      this.beamGfx.lineStyle(10, 0x00f0ff, 0.5);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
      this.beamGfx.lineStyle(2, 0xffffff, 0.9);
      this.beamGfx.lineBetween(this.x, this.y - halfH + 8, this.x, this.y + halfH - 8);
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

    // Resume cycle from remaining time in current state
    if (this.state === 'CHARGING') {
      this.topEmitter.setTint(0xf59e0b);
      this.bottomEmitter.setTint(0xf59e0b);
      this.cycleTimer = this.scene.time.delayedCall(this.remainingMs, () => this.startActive());
    } else if (this.state === 'ACTIVE') {
      this.hitbox.body.enable = true;
      this.topEmitter.setTint(0xef4444);
      this.bottomEmitter.setTint(0xef4444);
      this.cycleTimer = this.scene.time.delayedCall(this.remainingMs, () => this.startCooling());
    } else {
      this.topEmitter.clearTint();
      this.bottomEmitter.clearTint();
      this.cycleTimer = this.scene.time.delayedCall(this.remainingMs, () => this.startCharging());
    }
  }

  destroy() {
    if (this.cycleTimer) this.cycleTimer.remove();
    if (this.topEmitter) this.topEmitter.destroy();
    if (this.bottomEmitter) this.bottomEmitter.destroy();
    if (this.beamGfx) this.beamGfx.destroy();
    if (this.warningGfx) this.warningGfx.destroy();
    if (this.hitbox) this.hitbox.destroy();
    if (this.frostNode) this.frostNode.destroy();
  }
}
