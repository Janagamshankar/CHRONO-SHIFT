import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { ChronoVFX } from '../effects/ChronoVFX.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_avatar');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics configuration
    this.setCollideWorldBounds(true);
    this.body.setSize(24, 46);
    this.body.setOffset(4, 2);
    this.setDepth(18);

    // Authoritative attributes
    this.health = GAME_SETTINGS.PLAYER.MAX_HEALTH;
    this.energy = GAME_SETTINGS.CHRONO.MAX_ENERGY;
    this.facing = 1; // 1 = right, -1 = left

    // State flags
    this.isDashing = false;
    this.isSliding = false;
    this.isInvulnerable = false;
    this.dashTimer = null;
    this.slideTimer = null;
    this.afterimageTimer = null;

    // Movement tuning
    this.runSpeed = GAME_SETTINGS.PLAYER.RUN_SPEED;
    this.jumpVelocity = GAME_SETTINGS.PLAYER.JUMP_VELOCITY;
    this.slideVelocity = GAME_SETTINGS.PLAYER.SLIDE_VELOCITY;
    this.dashSpeed = this.runSpeed * GAME_SETTINGS.CHRONO.DASH_SPEED_MULTIPLIER;
  }

  updateMovement(cursors, keys) {
    if (this.isDashing) {
      // Physics handled in dash state
      return;
    }

    const isGrounded = this.body.blocked.down || this.body.touching.down;

    // 1. Sliding
    if ((keys.S.isDown || cursors.down.isDown) && isGrounded && !this.isSliding) {
      this.startSlide();
      return;
    }

    if (this.isSliding) {
      // Maintain slide velocity in facing direction
      this.setVelocityX(this.facing * this.slideVelocity);
      return;
    }

    // 2. Horizontal Movement
    if (cursors.left.isDown || keys.A.isDown) {
      this.setVelocityX(-this.runSpeed);
      this.facing = -1;
      this.setFlipX(true);
    } else if (cursors.right.isDown || keys.D.isDown) {
      this.setVelocityX(this.runSpeed);
      this.facing = 1;
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // 3. Jump
    if ((Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(keys.SPACE)) && isGrounded) {
      this.setVelocityY(this.jumpVelocity);
      // Small takeoff dust effect
      this.scene.add.image(this.x, this.y + 22, 'particle_cyan').setScale(0.7).setAlpha(0.6);
    }
  }

  startSlide() {
    this.isSliding = true;
    // Reduce collision height safely
    this.body.setSize(24, 24);
    this.body.setOffset(4, 24);
    this.setVelocityX(this.facing * this.slideVelocity);
    this.setAngle(this.facing * 18); // Dynamic slide pose tilt

    if (this.slideTimer) this.slideTimer.remove();
    this.slideTimer = this.scene.time.delayedCall(GAME_SETTINGS.PLAYER.SLIDE_DURATION_MS, () => {
      this.stopSlide();
    });
  }

  stopSlide() {
    this.isSliding = false;
    this.setAngle(0);
    // Restore standing collision box safely
    this.body.setSize(24, 46);
    this.body.setOffset(4, 2);
  }

  /**
   * Activates Chrono Dash
   * Returns: { success: boolean, reason?: string }
   */
  activateChronoDash() {
    if (this.isDashing) {
      return { success: false, reason: 'ALREADY_DASHING' };
    }

    const cost = GAME_SETTINGS.CHRONO.DASH_COST;
    if (this.energy < cost) {
      return { success: false, reason: 'INSUFFICIENT_ENERGY' };
    }

    // Deduct energy exactly once
    this.energy = Math.max(0, this.energy - cost);
    this.isDashing = true;

    // Determine dash vector
    const dirX = this.facing;
    const dirY = 0;

    // Apply high-speed velocity and suspend vertical gravity during dash
    this.body.setAllowGravity(false);
    this.setVelocity(dirX * this.dashSpeed, 0);

    // Spawn origin dash burst & streaks
    ChronoVFX.spawnDashBurst(this.scene, this.x, this.y, dirX, dirY);

    // Spawn afterimages every 60ms
    if (this.afterimageTimer) this.afterimageTimer.remove();
    this.afterimageTimer = this.scene.time.addEvent({
      delay: 60,
      repeat: 4,
      callback: () => {
        ChronoVFX.spawnAfterimage(this.scene, this.x, this.y, 'player_avatar', this.flipX);
      }
    });

    // End dash cleanly after duration
    if (this.dashTimer) this.dashTimer.remove();
    this.dashTimer = this.scene.time.delayedCall(GAME_SETTINGS.CHRONO.DASH_DURATION_MS, () => {
      this.endChronoDash();
    });

    return { success: true, energy: this.energy };
  }

  endChronoDash() {
    this.isDashing = false;
    this.body.setAllowGravity(true);
    // Restore normal run speed
    this.setVelocityX(this.facing * this.runSpeed);

    // End cue: small landing particle
    const endRing = this.scene.add.image(this.x, this.y, 'vfx_freeze_crystal').setScale(1.2).setAlpha(0.8);
    this.scene.tweens.add({
      targets: endRing,
      alpha: 0,
      scale: 0.2,
      duration: 180,
      onComplete: () => endRing.destroy()
    });
  }

  /**
   * Activates Chrono Freeze
   * Returns: { success: boolean, reason?: string }
   */
  activateChronoFreeze(eligibleTargets = []) {
    const cost = GAME_SETTINGS.CHRONO.FREEZE_COST;
    if (this.energy < cost) {
      return { success: false, reason: 'INSUFFICIENT_ENERGY' };
    }

    // Deduct energy exactly once
    this.energy = Math.max(0, this.energy - cost);

    // Spawn expanding temporal shockwave ring at player
    ChronoVFX.spawnFreezeShockwave(this.scene, this.x, this.y);

    // Freeze each eligible target
    const duration = GAME_SETTINGS.CHRONO.FREEZE_DURATION_MS;
    eligibleTargets.forEach(target => {
      if (target && target.freeze) {
        target.freeze(duration);
      }
    });

    return { success: true, energy: this.energy, duration };
  }

  /**
   * Recharges energy when collecting a cell
   */
  rechargeEnergy(amount = GAME_SETTINGS.CHRONO.CELL_RECHARGE_AMOUNT) {
    this.energy = Math.min(GAME_SETTINGS.CHRONO.MAX_ENERGY, this.energy + amount);
    ChronoVFX.spawnEnergyCollectBurst(this.scene, this.x, this.y);
    return this.energy;
  }
}
