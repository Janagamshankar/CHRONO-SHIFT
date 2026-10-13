import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';
import { UIComponents } from './UIComponents.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0).setDepth(40);
    this.container.setScrollFactor(0); // Anchors HUD to screen viewport

    // 1. Bottom Left: Quick Operations Bar ([M] Audio, [P] Pause, [R] Restart)
    const barY = height - 42;

    // Audio Toggle Badge
    this.audioBadge = scene.add.container(70, barY);
    this.audioGfx = scene.add.graphics();
    this.audioText = scene.add.text(0, 0, audioManager.isMuted ? '[M] MUTED' : '[M] AUDIO ON', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: audioManager.isMuted ? '#ef4444' : '#00f0ff',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.audioBadge.add([this.audioGfx, this.audioText]);
    this.audioBadge.setSize(110, 28);
    this.audioBadge.setInteractive({ useHandCursor: true });
    this.audioBadge.on('pointerdown', () => {
      const muted = audioManager.toggleMute();
      this.updateAudioBadge(muted);
      audioManager.play('uiClick');
    });
    this.updateAudioBadgeGfx(audioManager.isMuted);

    // Pause Hint Badge
    this.pauseBadge = scene.add.container(170, barY);
    const pauseGfx = scene.add.graphics();
    pauseGfx.fillStyle(0x070c1b, 0.85);
    pauseGfx.fillRoundedRect(-38, -14, 76, 28, 4);
    pauseGfx.lineStyle(1.2, 0x1e293b, 0.8);
    pauseGfx.strokeRoundedRect(-38, -14, 76, 28, 4);
    const pauseText = scene.add.text(0, 0, '[P] PAUSE', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 1
    }).setOrigin(0.5);
    this.pauseBadge.add([pauseGfx, pauseText]);
    this.pauseBadge.setSize(76, 28);
    this.pauseBadge.setInteractive({ useHandCursor: true });
    this.pauseBadge.on('pointerdown', () => {
      if (this.scene.pauseGame) this.scene.pauseGame();
    });

    // Restart Hint Badge
    this.restartBadge = scene.add.container(265, barY);
    const restartGfx = scene.add.graphics();
    restartGfx.fillStyle(0x070c1b, 0.85);
    restartGfx.fillRoundedRect(-44, -14, 88, 28, 4);
    restartGfx.lineStyle(1.2, 0x1e293b, 0.8);
    restartGfx.strokeRoundedRect(-44, -14, 88, 28, 4);
    const restartText = scene.add.text(0, 0, '[R] RESTART', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 1
    }).setOrigin(0.5);
    this.restartBadge.add([restartGfx, restartText]);
    this.restartBadge.setSize(88, 28);
    this.restartBadge.setInteractive({ useHandCursor: true });
    this.restartBadge.on('pointerdown', () => {
      if (this.scene.handlePlayerDeath) this.scene.handlePlayerDeath();
    });

    // 2. Top Left: Operative Vitals Frame (Health & Chrono Energy)
    const vitalsX = 24;
    const vitalsY = 20;
    const vitalsW = 280;
    const vitalsH = 80;

    const vitalsBg = scene.add.graphics();
    vitalsBg.fillStyle(0x070c1b, 0.92);
    vitalsBg.fillRoundedRect(vitalsX, vitalsY, vitalsW, vitalsH, 6);
    vitalsBg.lineStyle(1.5, 0x1e293b, 0.8);
    vitalsBg.strokeRoundedRect(vitalsX, vitalsY, vitalsW, vitalsH, 6);

    // Corner tech notches on vitals frame
    vitalsBg.lineStyle(2, 0x00f0ff, 0.9);
    vitalsBg.lineBetween(vitalsX, vitalsY + 10, vitalsX, vitalsY);
    vitalsBg.lineBetween(vitalsX, vitalsY, vitalsX + 10, vitalsY);

    // Health bar elements
    this.healthFill = scene.add.graphics();
    const hpLabel = scene.add.text(vitalsX + 14, vitalsY + 12, 'VITALITY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ef4444',
      letterSpacing: 1
    });
    this.hpText = scene.add.text(vitalsX + vitalsW - 14, vitalsY + 11, '100 / 100', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '13px',
      fontWeight: '700',
      color: '#f8fafc'
    }).setOrigin(1, 0);

    // Energy bar elements
    this.energyFill = scene.add.graphics();
    const epLabel = scene.add.text(vitalsX + 14, vitalsY + 44, 'CHRONO ENERGY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 1
    });
    this.epText = scene.add.text(vitalsX + vitalsW - 14, vitalsY + 43, '100 / 100', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '13px',
      fontWeight: '700',
      color: '#00f0ff'
    }).setOrigin(1, 0);

    // 3. Top Center: Zero Second Mission Clock
    const centerCardX = width / 2;
    const centerCardY = 22;

    const timerBg = scene.add.graphics();
    timerBg.fillStyle(0x070c1b, 0.92);
    timerBg.fillRoundedRect(centerCardX - 160, centerCardY, 320, 56, 6);
    timerBg.lineStyle(1.5, 0x00f0ff, 0.7);
    timerBg.strokeRoundedRect(centerCardX - 160, centerCardY, 320, 56, 6);

    // Corner notches
    timerBg.lineStyle(2, 0x00f0ff, 1);
    timerBg.lineBetween(centerCardX - 160, centerCardY + 10, centerCardX - 160, centerCardY);
    timerBg.lineBetween(centerCardX - 160, centerCardY, centerCardX - 150, centerCardY);
    timerBg.lineBetween(centerCardX + 150, centerCardY, centerCardX + 160, centerCardY);
    timerBg.lineBetween(centerCardX + 160, centerCardY, centerCardX + 160, centerCardY + 10);

    const timerHeader = scene.add.text(centerCardX, centerCardY + 12, 'ZERO SECOND COUNTDOWN', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 3
    }).setOrigin(0.5);

    this.timerText = scene.add.text(centerCardX, centerCardY + 34, '03:00', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5);

    // 4. Top Right: Score & Progression Sector Card
    const scoreX = width - 260;
    const scoreY = 20;
    const scoreW = 236;
    const scoreH = 80;

    const scoreBg = scene.add.graphics();
    scoreBg.fillStyle(0x070c1b, 0.92);
    scoreBg.fillRoundedRect(scoreX, scoreY, scoreW, scoreH, 6);
    scoreBg.lineStyle(1.5, 0x1e293b, 0.8);
    scoreBg.strokeRoundedRect(scoreX, scoreY, scoreW, scoreH, 6);

    scoreBg.lineStyle(2, 0x00f0ff, 0.9);
    scoreBg.lineBetween(scoreX + scoreW - 10, scoreY, scoreX + scoreW, scoreY);
    scoreBg.lineBetween(scoreX + scoreW, scoreY, scoreX + scoreW, scoreY + 10);

    const scoreTitle = scene.add.text(scoreX + 16, scoreY + 14, 'OPERATIVE SCORE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 1
    });

    this.scoreText = scene.add.text(scoreX + scoreW - 16, scoreY + 12, '0000', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f8fafc'
    }).setOrigin(1, 0);

    const sectionTitle = scene.add.text(scoreX + 16, scoreY + 48, 'SECTOR ZONE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#94a3b8',
      letterSpacing: 1
    });

    this.sectionText = scene.add.text(scoreX + scoreW - 16, scoreY + 46, 'SEC A: AWAKENING', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#38bdf8'
    }).setOrigin(1, 0);

    // 5. Bottom Right: Multi-State Ability Badges
    const abX = width - 200;
    const abY = height - 56;

    // Freeze badge [Q] (35 NRG)
    this.freezeBadge = this.createAbilityBadge(abX - 140, abY, 'Q', 'FREEZE', 35);

    // Dash badge [E] (25 NRG)
    this.dashBadge = this.createAbilityBadge(abX, abY, 'E', 'DASH', 25);

    // Alert notification text (middle screen)
    this.notifyText = scene.add.text(width / 2, height / 2 - 120, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ef4444',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);

    // Add everything to HUD master viewport container
    this.container.add([
      this.audioBadge,
      this.pauseBadge,
      this.restartBadge,
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
      scoreBg,
      scoreTitle,
      this.scoreText,
      sectionTitle,
      this.sectionText,
      this.freezeBadge.container,
      this.dashBadge.container,
      this.notifyText
    ]);

    this.vitalsX = vitalsX;
    this.vitalsY = vitalsY;
    this.vitalsW = vitalsW;
  }

  updateAudioBadgeGfx(isMuted) {
    this.audioGfx.clear();
    this.audioGfx.fillStyle(0x070c1b, 0.85);
    this.audioGfx.fillRoundedRect(-55, -14, 110, 28, 4);
    this.audioGfx.lineStyle(1.2, isMuted ? 0xef4444 : 0x00f0ff, 0.7);
    this.audioGfx.strokeRoundedRect(-55, -14, 110, 28, 4);
  }

  updateAudioBadge(isMuted) {
    if (!this.audioText) return;
    this.updateAudioBadgeGfx(isMuted);
    this.audioText.setText(isMuted ? '[M] MUTED' : '[M] AUDIO ON');
    this.audioText.setColor(isMuted ? '#ef4444' : '#00f0ff');
  }

  createAbilityBadge(x, y, keyLabel, actionLabel, cost) {
    const badgeWidth = 126;
    const badgeHeight = 46;

    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x070c1b, 0.92);
    bg.fillRoundedRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 5);
    bg.lineStyle(1.5, 0x00f0ff, 0.75);
    bg.strokeRoundedRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 5);

    const keyBox = this.scene.add.text(-badgeWidth / 2 + 20, 0, `[${keyLabel}]`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    const title = this.scene.add.text(12, -7, actionLabel, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8fafc',
      letterSpacing: 1
    }).setOrigin(0.5);

    const statusTag = this.scene.add.text(12, 10, `${cost} NRG`, {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '11px',
      fontWeight: '700',
      color: '#94a3b8'
    }).setOrigin(0.5);

    container.add([bg, keyBox, title, statusTag]);

    return {
      container,
      bg,
      keyBox,
      title,
      statusTag,
      badgeWidth,
      badgeHeight,
      cost,
      currentState: 'READY'
    };
  }

  /**
   * Updates ability badge appearance across 4 distinct authoritative states:
   * 'READY', 'ACTIVE', 'COOLING', 'LOW_ENERGY'
   */
  updateBadgeState(badge, state) {
    if (badge.currentState === state) return;
    badge.currentState = state;

    const w = badge.badgeWidth;
    const h = badge.badgeHeight;
    badge.bg.clear();

    if (state === 'ACTIVE') {
      // Temporal active state (Violet/Cyan glow)
      badge.bg.fillStyle(0x1a0b2e, 0.95);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
      badge.bg.lineStyle(2, 0xa855f7, 1.0);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);

      badge.keyBox.setColor('#c084fc');
      badge.title.setColor('#ffffff');
      badge.statusTag.setText('◆ ACTIVE ◆');
      badge.statusTag.setColor('#c084fc');
    } else if (state === 'COOLING') {
      // Cooldown state (Amber)
      badge.bg.fillStyle(0x140e06, 0.92);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
      badge.bg.lineStyle(1.5, 0xf59e0b, 0.8);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);

      badge.keyBox.setColor('#f59e0b');
      badge.title.setColor('#fde68a');
      badge.statusTag.setText('COOLING');
      badge.statusTag.setColor('#f59e0b');
    } else if (state === 'LOW_ENERGY') {
      // Insufficient energy (Muted Slate with red cost)
      badge.bg.fillStyle(0x070c1b, 0.88);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
      badge.bg.lineStyle(1.2, 0x334155, 0.5);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);

      badge.keyBox.setColor('#475569');
      badge.title.setColor('#64748b');
      badge.statusTag.setText(`${badge.cost} NRG`);
      badge.statusTag.setColor('#ef4444');
    } else {
      // READY (Cyan Electric)
      badge.bg.fillStyle(0x070c1b, 0.92);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
      badge.bg.lineStyle(1.5, 0x00f0ff, 0.8);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);

      badge.keyBox.setColor('#00f0ff');
      badge.title.setColor('#f8fafc');
      badge.statusTag.setText(`${badge.cost} NRG`);
      badge.statusTag.setColor('#94a3b8');
    }
  }

  update(player, countdownSeconds, score = 0, currentSection = 'SEC A: AWAKENING') {
    if (!player) return;

    const barW = 252;
    const barH = 6;
    const barX = this.vitalsX + 14;

    // 1. Health Bar with 3-tier color states (Normal green, Warning amber, Critical red)
    const hpRatio = Phaser.Math.Clamp(player.health / GAME_SETTINGS.PLAYER.MAX_HEALTH, 0, 1);
    this.healthFill.clear();
    // Background slot
    this.healthFill.fillStyle(0x141e33, 1);
    this.healthFill.fillRect(barX, this.vitalsY + 28, barW, barH);

    let hpColor = 0x10b981; // Green
    if (hpRatio <= 0.25) {
      hpColor = 0xef4444; // Red critical
    } else if (hpRatio <= 0.5) {
      hpColor = 0xf59e0b; // Amber warning
    }

    this.healthFill.fillStyle(hpColor, 1);
    this.healthFill.fillRect(barX, this.vitalsY + 28, barW * hpRatio, barH);
    this.hpText.setText(`${Math.max(0, Math.round(player.health))} / 100`);

    // 2. Energy Bar (Electric Cyan)
    const epRatio = Phaser.Math.Clamp(player.energy / GAME_SETTINGS.CHRONO.MAX_ENERGY, 0, 1);
    this.energyFill.clear();
    this.energyFill.fillStyle(0x141e33, 1);
    this.energyFill.fillRect(barX, this.vitalsY + 60, barW, barH);
    this.energyFill.fillStyle(0x00f0ff, 1);
    this.energyFill.fillRect(barX, this.vitalsY + 60, barW * epRatio, barH);
    this.epText.setText(`${Math.round(player.energy)} / 100`);

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

    // 4. Score & Progression Sector
    this.scoreText.setText(String(score).padStart(4, '0'));
    this.sectionText.setText(currentSection);

    // 5. Authoritative Multi-State Ability Status
    // Freeze Ability State
    if (player.isFreezeActive) {
      this.updateBadgeState(this.freezeBadge, 'ACTIVE');
    } else if (player.energy < GAME_SETTINGS.CHRONO.FREEZE_COST) {
      this.updateBadgeState(this.freezeBadge, 'LOW_ENERGY');
    } else {
      this.updateBadgeState(this.freezeBadge, 'READY');
    }

    // Dash Ability State
    if (player.isDashing) {
      this.updateBadgeState(this.dashBadge, 'ACTIVE');
    } else if (player.dashCooldown && player.dashCooldown > 0) {
      this.updateBadgeState(this.dashBadge, 'COOLING');
    } else if (player.energy < GAME_SETTINGS.CHRONO.DASH_COST) {
      this.updateBadgeState(this.dashBadge, 'LOW_ENERGY');
    } else {
      this.updateBadgeState(this.dashBadge, 'READY');
    }
  }

  /**
   * Displays floating holographic checkpoint confirmation banner
   */
  showCheckpointBanner(sectionId, sectionTitle = '') {
    UIComponents.createNotificationBanner(
      this.scene,
      '◆ TEMPORAL ANCHOR ESTABLISHED ◆',
      `CHECKPOINT CP-${sectionId} // ${sectionTitle}`,
      { accentColor: 0x00f0ff, titleColor: '#00f0ff' }
    );
  }

  /**
   * Displays floating holographic section transition banner
   */
  showSectionBanner(sectionTitle) {
    UIComponents.createNotificationBanner(
      this.scene,
      '◆ SECTOR TRANSITION DETECTED ◆',
      `ENTERING ${sectionTitle}`,
      { accentColor: 0xa855f7, titleColor: '#c084fc' }
    );
  }

  triggerAbilityPulse(abilityId, success) {
    const badge = abilityId === 'freeze' ? this.freezeBadge : this.dashBadge;
    if (!badge) return;

    if (success) {
      this.scene.tweens.add({
        targets: badge.container,
        scale: 1.12,
        duration: 120,
        yoyo: true,
        ease: 'Cubic.easeOut'
      });
    } else {
      audioManager.play('abilityReject');
      this.scene.tweens.add({
        targets: badge.container,
        x: badge.container.x - 6,
        duration: 50,
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

  /**
   * Displays victory level completion overlay with authoritative stats
   */
  showVictoryOverlay(stats = {}) {
    audioManager.play('victory');
    const { width, height } = this.scene.scale;
    const overlay = this.scene.add.container(width / 2, height / 2).setDepth(60);
    overlay.setScrollFactor(0);

    // Dark backdrop overlay
    const bgDim = this.scene.add.graphics();
    bgDim.fillStyle(0x040714, 0.92);
    bgDim.fillRect(-width / 2, -height / 2, width, height);

    // Victory modal card using UIComponents design tokens
    const cardW = 620;
    const cardH = 430;
    const card = this.scene.add.graphics();
    card.fillStyle(0x0a1128, 0.96);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
    card.lineStyle(2, 0x00f0ff, 0.9);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);

    // Top notches
    card.lineStyle(2, 0x00f0ff, 1);
    const nLen = 14;
    card.lineBetween(-cardW / 2, -cardH / 2 + nLen, -cardW / 2, -cardH / 2);
    card.lineBetween(-cardW / 2, -cardH / 2, -cardW / 2 + nLen, -cardH / 2);
    card.lineBetween(cardW / 2 - nLen, -cardH / 2, cardW / 2, -cardH / 2);
    card.lineBetween(cardW / 2, -cardH / 2, cardW / 2, -cardH / 2 + nLen);

    // Header
    const title = this.scene.add.text(0, -cardH / 2 + 45, 'TEMPORAL MATRIX STABILIZED', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5);

    const subtitle = this.scene.add.text(0, -cardH / 2 + 75, 'AETHELON CHRONO CORE SECURED • TIMELINE RESTORED', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Stats Grid Container
    const statBox = this.scene.add.graphics();
    statBox.fillStyle(0x060b1c, 0.85);
    statBox.fillRoundedRect(-cardW / 2 + 30, -70, cardW - 60, 175, 6);
    statBox.lineStyle(1, 0x1e293b, 0.8);
    statBox.strokeRoundedRect(-cardW / 2 + 30, -70, cardW - 60, 175, 6);

    // Add background, card, title, and statBox to overlay first
    overlay.add([bgDim, card, title, subtitle, statBox]);

    const statRows = [
      { label: 'OPERATIVE SCORE:', val: `${stats.score || 0} PTS` },
      { label: 'TIME REMAINING:', val: `${stats.timeStr || '02:00'}` },
      { label: 'CHECKPOINTS ANCHORED:', val: `${stats.checkpoints || 4} / 4` },
      { label: 'TIMELINE STABILITY:', val: '100% [OPTIMAL]' }
    ];

    statRows.forEach((r, idx) => {
      const yPos = -50 + idx * 38;
      const lbl = this.scene.add.text(-cardW / 2 + 54, yPos, r.label, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '15px',
        fontWeight: '700',
        color: '#94a3b8',
        letterSpacing: 1
      });
      const val = this.scene.add.text(cardW / 2 - 54, yPos, r.val, {
        fontFamily: 'Orbitron, monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: idx === 3 ? '#10b981' : '#f8fafc'
      }).setOrigin(1, 0);

      overlay.add([lbl, val]);
    });

    // Replay Button (Primary)
    const btnReplay = UIComponents.createButton(this.scene, -135, 150, 230, 44, 'REPLAY MISSION [ENTER]', {
      isPrimary: true,
      onClick: () => {
        audioManager.play('uiClick');
        this.scene.scene.restart();
      }
    });

    // Main Menu Button
    const btnMenu = UIComponents.createButton(this.scene, 135, 150, 230, 44, 'MAIN MENU [ESC]', {
      isPrimary: false,
      onClick: () => {
        audioManager.play('uiClick');
        this.scene.scene.start('MenuScene');
      }
    });

    overlay.add([btnReplay, btnMenu]);

    // Keyboard navigation for victory overlay
    const onEnter = () => {
      audioManager.play('uiClick');
      this.scene.input.keyboard.off('keydown-ENTER', onEnter);
      this.scene.scene.restart();
    };
    const onEsc = () => {
      audioManager.play('uiClick');
      this.scene.input.keyboard.off('keydown-ESC', onEsc);
      this.scene.scene.start('MenuScene');
    };
    this.scene.input.keyboard.once('keydown-ENTER', onEnter);
    this.scene.input.keyboard.once('keydown-ESC', onEsc);

    // Fade-in animation
    overlay.setAlpha(0);
    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 350,
      ease: 'Quad.easeOut'
    });
  }
}
