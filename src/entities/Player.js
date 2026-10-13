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
    this.wasGrounded = true;
    this.footstepTimer = 0;
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

    // Landing detection: transition from airborne to grounded
    if (!this.wasGrounded && isGrounded && !this.isSliding) {
      // Squash & stretch recovery
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.15,
        scaleY: 0.88,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          if (!this.isSliding) this.setScale(1, 1);
        }
      });
      ChronoVFX.spawnLandingDust(this.scene, this.x, this.y + 22);
    }

    // 1. Sliding
    if ((keys.S.isDown || cursors.down.isDown) && isGrounded && !this.isSliding) {
      this.startSlide();
      this.wasGrounded = isGrounded;
      return;
    }

    if (this.isSliding) {
      // Maintain slide velocity in facing direction
      this.setVelocityX(this.facing * this.slideVelocity);
      this.wasGrounded = isGrounded;
      return;
    }

    // 2. Horizontal Movement
    if (cursors.left.isDown || keys.A.isDown) {
      this.setVelocityX(-this.runSpeed);
      this.facing = -1;
      this.setFlipX(true);
      if (isGrounded) {
        this.setAngle(-4); // Dynamic running stride tilt
        this.footstepTimer += 16;
        if (this.footstepTimer > 180) {
          this.footstepTimer = 0;
          ChronoVFX.spawnFootstepSpark(this.scene, this.x, this.y, this.facing);
        }
      }
    } else if (cursors.right.isDown || keys.D.isDown) {
      this.setVelocityX(this.runSpeed);
      this.facing = 1;
      this.setFlipX(false);
      if (isGrounded) {
        this.setAngle(4); // Dynamic running stride tilt
        this.footstepTimer += 16;
        if (this.footstepTimer > 180) {
          this.footstepTimer = 0;
          ChronoVFX.spawnFootstepSpark(this.scene, this.x, this.y, this.facing);
        }
      }
    } else {
      this.setVelocityX(0);
      if (isGrounded) this.setAngle(0);
    }

    // 3. Jump
    if ((Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(keys.SPACE)) && isGrounded) {
      this.setVelocityY(this.jumpVelocity);
      this.setTexture('player_avatar_jump');
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.92,
        scaleY: 1.08,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
      // Small takeoff dust effect
      this.scene.add.image(this.x, this.y + 22, 'particle_cyan').setScale(0.7).setAlpha(0.6);
    }

    // 4. State-driven Poses
    if (!isGrounded && !this.isSliding) {
      this.setTexture('player_avatar_jump');
      this.setAngle(this.facing * (this.body.velocity.y < 0 ? -2 : 3));
    } else if (!this.isSliding) {
      this.setTexture('player_avatar');
    }

    this.wasGrounded = isGrounded;
  }

  startSlide() {
    this.isSliding = true;
    this.setTexture('player_avatar_slide');
    // Reduce collision height safely
    this.body.setSize(24, 24);
    this.body.setOffset(4, 24);
    this.setVelocityX(this.facing * this.slideVelocity);
    this.setAngle(this.facing * 12); // Dynamic slide pose tilt

    if (this.slideTimer) this.slideTimer.remove();
    this.slideTimer = this.scene.time.delayedCall(GAME_SETTINGS.PLAYER.SLIDE_DURATION_MS, () => {
      this.stopSlide();
    });
  }

  stopSlide() {
    this.isSliding = false;
    this.setTexture('player_avatar');
    this.setAngle(0);
    this.setScale(1, 1);
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

  /**
   * Authoritative hazard damage handler
   * Prevents repeated damage spam via invulnerability window
   * Respects Chrono Dash invulnerability phase
   */
  takeDamage(amount = 25, knockbackX = 0, knockbackY = -220) {
    // Guards: invulnerable, already dead, or phasing via Chrono Dash
    if (this.isInvulnerable || this.isDead || this.health <= 0) {
      return false;
    }

    if (this.isDashing) {
      // Chrono Dash phases safely through hazards
      return false;
    }

    // Deduct health
    this.health = Math.max(0, this.health - amount);
    this.isInvulnerable = true;

    // Visual & audio feedback
    ChronoVFX.spawnDamageImpact(this.scene, this.x, this.y);

    // Red impact tint
    this.setTint(0xef4444);
    this.scene.time.delayedCall(140, () => {
      if (!this.isDead) this.clearTint();
    });

    // Knockback physics
    const kbX = knockbackX !== 0 ? knockbackX : -this.facing * 180;
    this.setVelocity(kbX, knockbackY);

    if (this.health <= 0) {
      this.die();
      return true;
    }

    // Flashing invulnerability indicator
    if (this.flashTween) this.flashTween.stop();
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      yoyo: true,
      repeat: 5,
      duration: 100,
      onComplete: () => {
        this.setAlpha(1);
      }
    });

    // Invulnerability window timer
    if (this.invulnTimer) this.invulnTimer.remove();
    this.invulnTimer = this.scene.time.delayedCall(GAME_SETTINGS.PLAYER.INVULNERABILITY_MS, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });

    return true;
  }

  /**
   * Handles player death sequence cleanly
   */
  die() {
    this.isDead = true;
    this.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;

    // Death shatter particles
    for (let i = 0; i < 12; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle_purple').setDepth(25);
      p.setTint(0xef4444);
      p.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
      const angle = (i / 12) * Math.PI * 2;
      const dist = Phaser.Math.Between(40, 110);

      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }

    // Fade out avatar
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 400,
      ease: 'Quad.easeIn'
    });

    // Show respawn banner anchored to camera viewport
    const cam = this.scene.cameras.main;
    const deathBanner = this.scene.add.text(
      cam.scrollX + cam.width / 2,
      cam.scrollY + cam.height / 2 - 30,
      'TEMPORAL DISRUPTION — REBOOTING MATRIX',
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ef4444',
        letterSpacing: 3
      }
    ).setOrigin(0.5).setDepth(45);

    this.scene.tweens.add({
      targets: deathBanner,
      alpha: 0.3,
      yoyo: true,
      repeat: 3,
      duration: 180,
      onComplete: () => deathBanner.destroy()
    });

    // Notify scene to respawn at latest checkpoint or restart
    this.scene.time.delayedCall(1200, () => {
      if (this.scene.handlePlayerDeath) {
        this.scene.handlePlayerDeath();
      } else {
        this.scene.scene.restart();
      }
    });
  }

  /**
   * Respawns the player cleanly at the specified checkpoint coordinates
   */
  respawnAt(x, y) {
    this.isDead = false;
    this.x = x;
    this.y = y;
    this.setVelocity(0, 0);
    this.body.setAllowGravity(true);
    this.body.enable = true;
    this.setAlpha(1);
    this.setScale(1);
    this.clearTint();
    this.health = GAME_SETTINGS.PLAYER.MAX_HEALTH;
    this.isInvulnerable = true;

    // Temporal arrival shockwave ring
    const ring = this.scene.add.image(this.x, this.y, 'vfx_shockwave_ring').setDepth(24);
    ring.setScale(0.15).setTint(0x00f0ff);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });

    // Temporary invulnerability blinking (1500ms grace period)
    if (this.flashTween) this.flashTween.stop();
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      yoyo: true,
      repeat: 6,
      duration: 110,
      onComplete: () => {
        this.setAlpha(1);
      }
    });

    if (this.invulnTimer) this.invulnTimer.remove();
    this.invulnTimer = this.scene.time.delayedCall(1500, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });
  }
}
