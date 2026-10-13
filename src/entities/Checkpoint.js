import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager.js';

export class Checkpoint {
  /**
   * Temporal Checkpoint Pylon
   * Idempotent progression marker that anchors the player's respawn coordinate
   */
  constructor(scene, x, y, sectionId = 'A', sectionTitle = 'AWAKENING') {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.sectionId = sectionId;
    this.sectionTitle = sectionTitle;
    this.isActivated = false;

    // 1. Holographic Pylon Sprite
    this.pylon = scene.add.image(x, y - 36, 'checkpoint_beacon').setDepth(16);
    this.pylon.setAlpha(0.65);

    // 2. Base Glow Emitter
    this.glow = scene.add.graphics().setDepth(15);
    this.glow.fillStyle(0x1e3a8a, 0.4);
    this.glow.fillEllipse(x, y - 6, 44, 16);

    // 3. Holographic Ring Animation
    this.ring = scene.add.image(x, y - 34, 'vfx_freeze_crystal').setDepth(17);
    this.ring.setScale(1.2).setAlpha(0.5);
    this.scene.tweens.add({
      targets: this.ring,
      y: y - 54,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0.1,
      duration: 1200,
      repeat: -1,
      ease: 'Sine.easeOut'
    });

    // 4. Section Indicator Text (Floating Hologram)
    this.label = scene.add.text(x, y - 80, `[CP-${sectionId}]`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#64748b',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(20);

    // 5. Arcade Physics Trigger Zone
    this.triggerZone = scene.physics.add.sprite(x, y - 36, null);
    this.triggerZone.setVisible(false);
    this.triggerZone.body.setSize(44, 72);
    this.triggerZone.body.setAllowGravity(false);
    this.triggerZone.body.setImmovable(true);
    this.triggerZone.parentCheckpoint = this;
  }

  /**
   * Activates the checkpoint idempotently
   * Returns: { activated: boolean, scoreBonus: number }
   */
  activate() {
    if (this.isActivated) {
      return { activated: false, scoreBonus: 0 };
    }

    this.isActivated = true;
    audioManager.play('checkpoint');

    // Visual activation feedback
    this.pylon.setAlpha(1.0);
    this.pylon.setTint(0x00f0ff);
    this.label.setColor('#00f0ff');
    this.label.setText(`[ACTIVE CP-${this.sectionId}]`);

    // High-energy beacon ground flare
    this.glow.clear();
    this.glow.fillStyle(0x00f0ff, 0.7);
    this.glow.fillEllipse(this.x, this.y - 6, 56, 20);

    // Expanding vertical light beacon conduit
    const beam = this.scene.add.graphics().setDepth(14);
    beam.lineStyle(4, 0x00f0ff, 0.85);
    beam.lineBetween(this.x, this.y - 6, this.x, this.y - 280);
    beam.lineStyle(1.5, 0xffffff, 1.0);
    beam.lineBetween(this.x, this.y - 6, this.x, this.y - 280);

    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => beam.destroy()
    });

    // Radial shockwave ring
    const ring = this.scene.add.image(this.x, this.y - 36, 'vfx_shockwave_ring').setDepth(22);
    ring.setScale(0.2);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.8,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });

    // Floating notification: +150 MATRIX ANCHORED
    const banner = this.scene.add.text(
      this.x,
      this.y - 100,
      `+150 CHECKPOINT ${this.sectionId} ANCHORED`,
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#00f0ff',
        letterSpacing: 2
      }
    ).setOrigin(0.5).setDepth(35);

    this.scene.tweens.add({
      targets: banner,
      y: this.y - 140,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => banner.destroy()
    });

    return { activated: true, scoreBonus: 150 };
  }

  destroy() {
    if (this.pylon) this.pylon.destroy();
    if (this.glow) this.glow.destroy();
    if (this.ring) this.ring.destroy();
    if (this.label) this.label.destroy();
    if (this.triggerZone) this.triggerZone.destroy();
  }
}
