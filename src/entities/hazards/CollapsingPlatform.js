import Phaser from 'phaser';
import { ChronoVFX } from '../../effects/ChronoVFX.js';
import { audioManager } from '../../systems/AudioManager.js';

export class CollapsingPlatform {
  /**
   * Collapsing Platform Hazard
   * Reacts when player lands on it:
   * 1. Normal state -> 2. Triggered on valid landing -> 3. Warning shake -> 4. Collapse/drop -> 5. Reset/respawn
   */
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.startX = x;
    this.startY = y;

    this.warningDurationMs = config.warningDurationMs || 550;
    this.respawnDelayMs = config.respawnDelayMs || 2600;
    this.textureKey = config.textureKey || 'platform_collapsing';

    this.state = 'NORMAL'; // 'NORMAL', 'TRIGGERED', 'COLLAPSED', 'RESPAWNING'
    this.isFrozen = false;
    this.shakeTween = null;
    this.collapseTimer = null;
    this.respawnTimer = null;
    this.remainingWarningMs = 0;
    this.warningStartTime = 0;

    // 1. Arcade Physics Sprite
    this.sprite = scene.physics.add.image(x, y, this.textureKey);
    this.sprite.setImmovable(true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setDepth(16);
    this.sprite.parentPlatform = this;

    this.frostNode = null;
  }

  /**
   * Triggered when player lands on top
   */
  trigger(player) {
    if (this.state !== 'NORMAL' || this.isFrozen) {
      return;
    }

    this.state = 'TRIGGERED';
    this.warningStartTime = this.scene.time.now;
    this.remainingWarningMs = this.warningDurationMs;

    // Audio cue for crumbling platform
    audioManager.play('platformCrumble');

    // Visual warning: amber tint and crumble dust
    this.sprite.setTint(0xf59e0b);
    ChronoVFX.spawnPlatformDust(this.scene, this.startX, this.startY + 14, 80);

    // Warning shake tween
    this.shakeTween = this.scene.tweens.add({
      targets: this.sprite,
      x: this.startX + 3,
      duration: 45,
      yoyo: true,
      repeat: Math.floor(this.warningDurationMs / 90),
      ease: 'Sine.easeInOut'
    });

    // Schedule collapse
    this.collapseTimer = this.scene.time.delayedCall(this.warningDurationMs, () => {
      this.collapse();
    });
  }

  collapse() {
    this.state = 'COLLAPSED';
    if (this.shakeTween) this.shakeTween.stop();
    this.sprite.x = this.startX;

    // Disable physics collider so player falls through
    this.sprite.body.enable = false;

    // Collapse drop animation and fade
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.startY + 28,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Schedule clean respawn
        this.scheduleRespawn();
      }
    });
  }

  scheduleRespawn() {
    this.state = 'RESPAWNING';
    this.respawnTimer = this.scene.time.delayedCall(this.respawnDelayMs, () => {
      this.reset();
    });
  }

  /**
   * Restores platform to normal initial state
   */
  reset() {
    this.state = 'NORMAL';
    this.isFrozen = false;
    this.sprite.x = this.startX;
    this.sprite.y = this.startY;
    this.sprite.clearTint();
    this.sprite.setAlpha(0);
    this.sprite.body.enable = true;

    // Gentle fade-in reappearance
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 250,
      ease: 'Linear'
    });
  }

  /**
   * Chrono Freeze interaction
   */
  freeze(duration) {
    if (this.isFrozen) return;
    this.isFrozen = true;

    this.sprite.setTint(0x00f0ff);

    if (this.state === 'TRIGGERED') {
      // Pause warning shake and timer
      if (this.shakeTween) this.shakeTween.pause();
      const elapsed = this.scene.time.now - this.warningStartTime;
      this.remainingWarningMs = Math.max(100, this.warningDurationMs - elapsed);
      if (this.collapseTimer) this.collapseTimer.remove();
    } else if (this.state === 'RESPAWNING') {
      if (this.respawnTimer) this.respawnTimer.paused = true;
    }

    this.frostNode = this.scene.add.image(this.sprite.x, this.sprite.y, 'vfx_freeze_crystal')
      .setScale(1.5)
      .setDepth(17);

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

    ChronoVFX.spawnFreezeRelease(this.scene, this.sprite.x, this.sprite.y);

    if (this.state === 'NORMAL') {
      this.sprite.clearTint();
    } else if (this.state === 'TRIGGERED') {
      this.sprite.setTint(0xf59e0b);
      if (this.shakeTween) this.shakeTween.resume();
      this.collapseTimer = this.scene.time.delayedCall(this.remainingWarningMs, () => {
        this.collapse();
      });
    } else if (this.state === 'RESPAWNING') {
      if (this.respawnTimer) this.respawnTimer.paused = false;
    }
  }

  destroy() {
    if (this.shakeTween) this.shakeTween.stop();
    if (this.collapseTimer) this.collapseTimer.remove();
    if (this.respawnTimer) this.respawnTimer.remove();
    if (this.sprite) this.sprite.destroy();
    if (this.frostNode) this.frostNode.destroy();
  }
}
