import Phaser from 'phaser';
import { settingsManager } from '../systems/SettingsManager.js';

export class ChronoVFX {
  /**
   * Spawns a directional high-speed dash burst effect
   */
  static spawnDashBurst(scene, x, y, dirX = 1, dirY = 0) {
    const isReduced = settingsManager.get('reducedMotion');

    // 1. Expanding cyan origin flare ring
    const flare = scene.add.image(x, y, 'vfx_shockwave_ring').setDepth(21);
    flare.setScale(0.2);
    flare.setAlpha(0.9);
    flare.setTint(0x00f0ff);

    scene.tweens.add({
      targets: flare,
      scale: 1.2,
      alpha: 0,
      duration: 220,
      ease: 'Cubic.easeOut',
      onComplete: () => flare.destroy()
    });

    // 2. Directional streak
    const streak = scene.add.image(x - dirX * 20, y - dirY * 10, 'vfx_dash_streak').setDepth(20);
    streak.setAngle(Math.atan2(dirY, dirX) * (180 / Math.PI));
    streak.setScale(1.4, 1.2);
    streak.setAlpha(0.85);

    scene.tweens.add({
      targets: streak,
      scaleX: 2.2,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => streak.destroy()
    });

    // 3. Backward dispersing particles (capped to 6 particles)
    const particleCount = isReduced ? 3 : 6;
    for (let i = 0; i < particleCount; i++) {
      const p = scene.add.image(
        x + Phaser.Math.Between(-8, 8),
        y + Phaser.Math.Between(-12, 12),
        'particle_cyan'
      ).setDepth(21);
      p.setScale(Phaser.Math.FloatBetween(0.5, 0.9));
      p.setAlpha(0.8);

      const speed = Phaser.Math.Between(80, 220);
      const angle = Math.atan2(-dirY, -dirX) + Phaser.Math.FloatBetween(-0.5, 0.5);

      scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * (speed * 0.25),
        y: p.y + Math.sin(angle) * (speed * 0.25),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(180, 300),
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }

    // 4. Subtle camera impulse
    if (!isReduced && scene.cameras && scene.cameras.main) {
      scene.cameras.main.shake(120, 0.003);
    }
  }

  /**
   * Spawns a fading afterimage silhouette of the player
   */
  static spawnAfterimage(scene, x, y, textureKey = 'player_avatar', flipX = false) {
    const ghost = scene.add.image(x, y, textureKey).setDepth(17);
    ghost.setFlipX(flipX);
    ghost.setTint(0x00f0ff);
    ghost.setAlpha(0.55);

    scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: ghost.scaleX * 1.05,
      duration: 240,
      ease: 'Linear',
      onComplete: () => ghost.destroy()
    });
  }

  /**
   * Spawns an expanding temporal shockwave ring for Chrono Freeze
   */
  static spawnFreezeShockwave(scene, x, y) {
    const isReduced = settingsManager.get('reducedMotion');

    // 1. Primary Shockwave Ring
    const ring1 = scene.add.image(x, y, 'vfx_shockwave_ring').setDepth(24);
    ring1.setScale(0.15);
    ring1.setAlpha(1);

    scene.tweens.add({
      targets: ring1,
      scale: 5.2,
      alpha: 0,
      duration: 480,
      ease: 'Cubic.easeOut',
      onComplete: () => ring1.destroy()
    });

    // 2. Secondary Violet Resonance Ring
    const ring2 = scene.add.image(x, y, 'vfx_shockwave_ring').setDepth(23);
    ring2.setScale(0.1);
    ring2.setTint(0xa855f7);
    ring2.setAlpha(0.85);

    scene.tweens.add({
      targets: ring2,
      scale: 4.0,
      alpha: 0,
      delay: 50,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => ring2.destroy()
    });

    // 3. Radial Temporal Spark Burst (capped to 8 particles)
    const count = isReduced ? 4 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = Phaser.Math.Between(90, 200);
      const spark = scene.add.image(x, y, 'vfx_freeze_crystal').setDepth(25);
      spark.setScale(0.7);
      spark.setAlpha(0.9);

      scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(350, 500),
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy()
      });
    }

    // 4. Subtle brief camera flash
    if (!isReduced && scene.cameras && scene.cameras.main) {
      scene.cameras.main.flash(180, 0, 240, 255, 0.15);
    }
  }

  /**
   * Spawns frost release / shatter particles when freeze ends
   */
  static spawnFreezeRelease(scene, x, y) {
    for (let i = 0; i < 5; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(20, 60);
      const p = scene.add.image(x, y, 'vfx_freeze_crystal').setDepth(22);
      p.setScale(0.6);
      p.setAlpha(0.8);

      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 250,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  /**
   * Spawns particle burst and notification when Chrono Cell is collected
   */
  static spawnEnergyCollectBurst(scene, x, y) {
    // 1. Radiant burst particles
    for (let i = 0; i < 8; i++) {
      const p = scene.add.image(x, y, 'particle_cyan').setDepth(23);
      p.setScale(0.8);
      const angle = (i / 8) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 75);

      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }

    // 2. Floating +20 ENERGY text
    const text = scene.add.text(x, y - 10, '+20 ENERGY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5).setDepth(30);

    scene.tweens.add({
      targets: text,
      y: y - 48,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy()
    });
  }
}
