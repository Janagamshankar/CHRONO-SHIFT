import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager.js';

export class ChronoCore {
  /**
   * Chrono Core Climax Reactor
   * The primary objective at the terminus of Section D (Chrono Core)
   * Stabilizing the reactor completes the mission with cinematic temporal resolution
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isStabilized = false;

    // 1. Core Base Infrastructure
    this.basePylon = scene.add.graphics().setDepth(15);
    this.basePylon.fillStyle(0x0c1322, 1);
    this.basePylon.fillRect(x - 40, y + 20, 80, 50);
    this.basePylon.lineStyle(2, 0x1e3a8a, 0.8);
    this.basePylon.strokeRect(x - 40, y + 20, 80, 50);

    // Anti-gravity emitter glow under base
    this.agGlow = scene.add.image(x, y + 68, 'anti_grav_glow').setScale(2.2).setDepth(14);

    // 2. Main Singularity Reactor Core
    this.coreSprite = scene.add.image(x, y, 'chrono_core_reactor').setDepth(18);
    this.coreSprite.setScale(1.3);

    // Continuous rotation of outer magnetic field
    this.scene.tweens.add({
      targets: this.coreSprite,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });

    // Breathing pulse of core energy
    this.scene.tweens.add({
      targets: this.coreSprite,
      scale: 1.45,
      yoyo: true,
      duration: 1400,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Floating Temporal Flux Rings
    this.ring1 = scene.add.image(x, y, 'vfx_shockwave_ring').setScale(0.8).setDepth(17).setTint(0x00f0ff);
    this.ring2 = scene.add.image(x, y, 'vfx_shockwave_ring').setScale(0.5).setDepth(17).setTint(0xa855f7);

    this.scene.tweens.add({
      targets: this.ring1,
      scale: 1.6,
      alpha: 0.1,
      yoyo: true,
      duration: 1800,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Holographic Objective Header
    this.objectiveLabel = scene.add.text(x, y - 90, 'CHRONO CORE SINGULARITY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(25);

    this.statusLabel = scene.add.text(x, y - 70, '[CRITICAL INSTABILITY: APPROACH TO STABILIZE]', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#ef4444',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(25);

    this.scene.tweens.add({
      targets: this.statusLabel,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 400
    });

    // 5. Arcade Physics Trigger Zone
    this.triggerZone = scene.physics.add.sprite(x, y, null);
    this.triggerZone.setVisible(false);
    this.triggerZone.body.setSize(90, 110);
    this.triggerZone.body.setAllowGravity(false);
    this.triggerZone.body.setImmovable(true);
    this.triggerZone.parentCore = this;
  }

  /**
   * Stabilizes the core when reached
   */
  stabilize() {
    if (this.isStabilized) return false;
    this.isStabilized = true;

    audioManager.play('coreStabilize');

    // Visual transformation to stable radiant matrix
    this.statusLabel.setText('[TEMPORAL MATRIX STABILIZED • 100%]');
    this.statusLabel.setColor('#10b981');
    this.coreSprite.setTint(0x00f0ff);

    // Blinding radial stabilization shockwaves
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const blast = this.scene.add.image(this.x, this.y, 'vfx_shockwave_ring').setDepth(30);
        blast.setScale(0.3);
        blast.setTint(i % 2 === 0 ? 0x00f0ff : 0xa855f7);

        this.scene.tweens.add({
          targets: blast,
          scale: 6.0,
          alpha: 0,
          duration: 700,
          ease: 'Cubic.easeOut',
          onComplete: () => blast.destroy()
        });
      });
    }

    // Camera flash and celebratory camera impulse
    this.scene.cameras.main.flash(450, 0, 240, 255, 0.4);
    this.scene.cameras.main.shake(300, 0.008);

    return true;
  }

  destroy() {
    if (this.basePylon) this.basePylon.destroy();
    if (this.agGlow) this.agGlow.destroy();
    if (this.coreSprite) this.coreSprite.destroy();
    if (this.ring1) this.ring1.destroy();
    if (this.ring2) this.ring2.destroy();
    if (this.objectiveLabel) this.objectiveLabel.destroy();
    if (this.statusLabel) this.statusLabel.destroy();
    if (this.triggerZone) this.triggerZone.destroy();
  }
}
