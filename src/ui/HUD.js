import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0).setDepth(40);

    // 1. Top Left: Operative Vitals Frame
    const vitalsX = 24;
    const vitalsY = 20;

    // Vitals panel background
    const vitalsBg = scene.add.graphics();
    vitalsBg.fillStyle(0x070c1b, 0.88);
    vitalsBg.fillRoundedRect(vitalsX, vitalsY, 260, 72, 6);
    vitalsBg.lineStyle(1.5, 0x1e293b, 0.8);
    vitalsBg.strokeRoundedRect(vitalsX, vitalsY, 260, 72, 6);

    // Health bar container & graphics
    this.healthFill = scene.add.graphics();
    const hpLabel = scene.add.text(vitalsX + 14, vitalsY + 12, 'HP', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ef4444'
    });
    this.hpText = scene.add.text(vitalsX + 210, vitalsY + 12, '100', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '13px',
      color: '#cbd5e1'
    }).setOrigin(1, 0);

    // Energy bar container & graphics
    this.energyFill = scene.add.graphics();
    const epLabel = scene.add.text(vitalsX + 14, vitalsY + 40, 'CHRONO', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#00f0ff'
    });
    this.epText = scene.add.text(vitalsX + 210, vitalsY + 40, '100', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '13px',
      color: '#00f0ff'
    }).setOrigin(1, 0);

    // 2. Top Center: Mission Countdown & Objective
    const centerCardX = width / 2;
    const centerCardY = 22;

    const timerBg = scene.add.graphics();
    timerBg.fillStyle(0x070c1b, 0.88);
    timerBg.fillRoundedRect(centerCardX - 160, centerCardY, 320, 52, 6);
    timerBg.lineStyle(1.5, 0x00f0ff, 0.6);
    timerBg.strokeRoundedRect(centerCardX - 160, centerCardY, 320, 52, 6);

    const timerHeader = scene.add.text(centerCardX, centerCardY + 10, 'ZERO SECOND COUNTDOWN', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.timerText = scene.add.text(centerCardX, centerCardY + 32, '03:00', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5);

    // 3. Bottom Right: Ability Action Indicators
    const abX = width - 200;
    const abY = height - 56;

    // Freeze badge [Q]
    this.freezeBadge = this.createAbilityBadge(abX - 130, abY, 'Q', 'FREEZE', '35');

    // Dash badge [E]
    this.dashBadge = this.createAbilityBadge(abX, abY, 'E', 'DASH', '25');

    // Notification banner text
    this.notifyText = scene.add.text(width / 2, height / 2 - 120, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ef4444'
    }).setOrigin(0.5).setAlpha(0);

    this.container.add([
      vitalsBg,
      this.healthFill,
      hpLabel,
      this.hpText,
      this.energyFill,
      epLabel,
      this.epText,
      timerBg,
      timerHeader,
      this.timerText,
      this.freezeBadge.container,
      this.dashBadge.container,
      this.notifyText
    ]);

    this.vitalsX = vitalsX;
    this.vitalsY = vitalsY;
  }

  createAbilityBadge(x, y, keyLabel, actionLabel, cost) {
    const badgeWidth = 118;
    const badgeHeight = 44;

    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x070c1b, 0.9);
    bg.fillRoundedRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 4);
    bg.lineStyle(1.5, 0x00f0ff, 0.7);
    bg.strokeRoundedRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 4);

    const keyBox = this.scene.add.text(-badgeWidth / 2 + 18, 0, `[${keyLabel}]`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    const title = this.scene.add.text(8, -6, actionLabel, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#e2e8f0',
      letterSpacing: 1
    }).setOrigin(0.5);

    const costTxt = this.scene.add.text(8, 10, `${cost} NRG`, {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '11px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    container.add([bg, keyBox, title, costTxt]);

    return { container, bg, keyBox, title, costTxt, badgeWidth, badgeHeight };
  }

  update(player, countdownSeconds) {
    if (!player) return;

    const barW = 120;
    const barH = 8;

    // 1. Health Bar Fill
    const hpRatio = Phaser.Math.Clamp(player.health / GAME_SETTINGS.PLAYER.MAX_HEALTH, 0, 1);
    this.healthFill.clear();
    this.healthFill.fillStyle(0x1e293b, 1);
    this.healthFill.fillRect(this.vitalsX + 80, this.vitalsY + 16, barW, barH);
    this.healthFill.fillStyle(hpRatio > 0.3 ? 0x10b981 : 0xef4444, 1);
    this.healthFill.fillRect(this.vitalsX + 80, this.vitalsY + 16, barW * hpRatio, barH);
    this.hpText.setText(`${Math.round(player.health)}`);

    // 2. Energy Bar Fill
    const epRatio = Phaser.Math.Clamp(player.energy / GAME_SETTINGS.CHRONO.MAX_ENERGY, 0, 1);
    this.energyFill.clear();
    this.energyFill.fillStyle(0x1e293b, 1);
    this.energyFill.fillRect(this.vitalsX + 80, this.vitalsY + 44, barW, barH);
    this.energyFill.fillStyle(0x00f0ff, 1);
    this.energyFill.fillRect(this.vitalsX + 80, this.vitalsY + 44, barW * epRatio, barH);
    this.epText.setText(`${Math.round(player.energy)}`);

    // 3. Mission Countdown Clock
    const totalSec = Math.max(0, Math.floor(countdownSeconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.timerText.setText(timeStr);
    if (totalSec < 30) {
      this.timerText.setColor('#ef4444');
    } else {
      this.timerText.setColor('#00f0ff');
    }

    // 4. Ability badges availability state
    this.updateBadgeState(this.freezeBadge, player.energy >= GAME_SETTINGS.CHRONO.FREEZE_COST);
    this.updateBadgeState(this.dashBadge, player.energy >= GAME_SETTINGS.CHRONO.DASH_COST);
  }

  updateBadgeState(badge, isAvailable) {
    badge.bg.clear();
    if (isAvailable) {
      badge.bg.fillStyle(0x070c1b, 0.9);
      badge.bg.fillRoundedRect(-badge.badgeWidth / 2, -badge.badgeHeight / 2, badge.badgeWidth, badge.badgeHeight, 4);
      badge.bg.lineStyle(1.5, 0x00f0ff, 0.7);
      badge.bg.strokeRoundedRect(-badge.badgeWidth / 2, -badge.badgeHeight / 2, badge.badgeWidth, badge.badgeHeight, 4);
      badge.title.setColor('#e2e8f0');
      badge.keyBox.setColor('#00f0ff');
    } else {
      badge.bg.fillStyle(0x070c1b, 0.9);
      badge.bg.fillRoundedRect(-badge.badgeWidth / 2, -badge.badgeHeight / 2, badge.badgeWidth, badge.badgeHeight, 4);
      badge.bg.lineStyle(1.5, 0x475569, 0.4);
      badge.bg.strokeRoundedRect(-badge.badgeWidth / 2, -badge.badgeHeight / 2, badge.badgeWidth, badge.badgeHeight, 4);
      badge.title.setColor('#64748b');
      badge.keyBox.setColor('#64748b');
    }
  }

  triggerAbilityPulse(abilityId, success) {
    const badge = abilityId === 'freeze' ? this.freezeBadge : this.dashBadge;
    if (!badge) return;

    if (success) {
      this.scene.tweens.add({
        targets: badge.container,
        scale: 1.15,
        duration: 120,
        yoyo: true,
        ease: 'Cubic.easeOut'
      });
    } else {
      // Rejection feedback: shake and flash warning
      this.scene.tweens.add({
        targets: badge.container,
        x: badge.container.x - 6,
        duration: 60,
        yoyo: true,
        repeat: 3,
        ease: 'Linear'
      });

      this.notifyText.setText('INSUFFICIENT CHRONO ENERGY');
      this.notifyText.setAlpha(1);
      this.scene.tweens.add({
        targets: this.notifyText,
        alpha: 0,
        delay: 500,
        duration: 350
      });
    }
  }
}
