import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { audioManager } from '../systems/AudioManager.js';
import { UIComponents } from './UIComponents.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.container = scene.add.container(0, 0).setDepth(40);
    this.container.setScrollFactor(0); // Anchored to camera viewport

    // 1. TOP-LEFT HUD: Frosted Angular Instrument Panel (Reference Exact Match)
    const hudX = 22;
    const hudY = 16;
    const hudW = 340;
    const hudH = 118;

    this.vitalsX = hudX;
    this.vitalsY = hudY;
    this.vitalsW = hudW;

    // Translucent frosted glass backing with crisp cyan angular borders
    this.hudBg = scene.add.graphics();
    // Soft deep-sky tint backing for maximum readability over daylight sky & clouds
    this.hudBg.fillStyle(0x0c2548, 0.45);
    this.hudBg.fillRoundedRect(hudX, hudY, hudW, hudH, 6);
    // Subtle frosted highlight sheen
    this.hudBg.fillStyle(0xffffff, 0.12);
    this.hudBg.fillRoundedRect(hudX + 1, hudY + 1, hudW - 2, 28, 4);
    // Thin precision electric cyan border
    this.hudBg.lineStyle(1.5, 0x00f0ff, 0.85);
    this.hudBg.strokeRoundedRect(hudX, hudY, hudW, hudH, 6);

    // Angular corner accents
    this.hudBg.lineStyle(2, 0xffffff, 0.95);
    this.hudBg.lineBetween(hudX, hudY + 12, hudX, hudY);
    this.hudBg.lineBetween(hudX, hudY, hudX + 12, hudY);
    this.hudBg.lineBetween(hudX + hudW - 12, hudY, hudX + hudW, hudY);
    this.hudBg.lineBetween(hudX + hudW, hudY, hudX + hudW, hudY + 12);

    // --- ROW 1: HEALTH ---
    const row1Y = hudY + 14;

    // Circular Health Icon
    const hpIconGfx = scene.add.graphics();
    hpIconGfx.fillStyle(0x00f0ff, 0.2);
    hpIconGfx.fillCircle(hudX + 18, row1Y + 6, 8);
    hpIconGfx.lineStyle(1.5, 0x00f0ff, 0.9);
    hpIconGfx.strokeCircle(hudX + 18, row1Y + 6, 8);
    // Mini heart/cross
    hpIconGfx.fillStyle(0x00f0ff, 1);
    hpIconGfx.fillRect(hudX + 16, row1Y + 3, 4, 6);
    hpIconGfx.fillRect(hudX + 15, row1Y + 4, 6, 4);

    const hpLabel = scene.add.text(hudX + 32, row1Y, 'HEALTH', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 1.5
    });

    // Slanted segmented health graphics
    this.healthSegmentsGfx = scene.add.graphics();

    this.hpValueText = scene.add.text(hudX + hudW - 14, row1Y - 1, '100', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // --- ROW 2: CHRONO ENERGY ---
    const row2Y = hudY + 42;

    // Circular Energy Icon
    const epIconGfx = scene.add.graphics();
    epIconGfx.fillStyle(0x38bdf8, 0.2);
    epIconGfx.fillCircle(hudX + 18, row2Y + 6, 8);
    epIconGfx.lineStyle(1.5, 0x38bdf8, 0.9);
    epIconGfx.strokeCircle(hudX + 18, row2Y + 6, 8);
    // Mini lightning core
    epIconGfx.fillStyle(0x38bdf8, 1);
    epIconGfx.fillTriangle(hudX + 18, row2Y + 2, hudX + 21, row2Y + 6, hudX + 17, row2Y + 7);
    epIconGfx.fillTriangle(hudX + 18, row2Y + 6, hudX + 20, row2Y + 11, hudX + 16, row2Y + 7);

    const epLabel = scene.add.text(hudX + 32, row2Y, 'CHRONO ENERGY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#38bdf8',
      letterSpacing: 1.5
    });

    // Slanted segmented energy graphics
    this.energySegmentsGfx = scene.add.graphics();

    // --- ROW 3: ABILITY BADGES ([E] DASH & [Q] FREEZE) ---
    const badgeY = hudY + 84;
    this.dashBadge = this.createCompactAbilityBadge(hudX + 76, badgeY, 'E', 'DASH', 25);
    this.freezeBadge = this.createCompactAbilityBadge(hudX + 224, badgeY, 'Q', 'FREEZE', 35);

    // 2. TOP-RIGHT HUD: Compact Frosted Pill (Score & Time)
    this.rightPillW = 270;
    this.rightPillH = 36;
    this.rightPillContainer = scene.add.container(width - 22, 16);

    const rightPillBg = scene.add.graphics();
    rightPillBg.fillStyle(0x0c2548, 0.45);
    rightPillBg.fillRoundedRect(-this.rightPillW, 0, this.rightPillW, this.rightPillH, 18);
    rightPillBg.fillStyle(0xffffff, 0.12);
    rightPillBg.fillRoundedRect(-this.rightPillW + 1, 1, this.rightPillW - 2, 16, 12);
    rightPillBg.lineStyle(1.5, 0x00f0ff, 0.85);
    rightPillBg.strokeRoundedRect(-this.rightPillW, 0, this.rightPillW, this.rightPillH, 18);

    this.scoreTimeText = scene.add.text(-this.rightPillW / 2, this.rightPillH / 2, 'SCORE: 0000   |   TIME: 03:00', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    this.rightPillContainer.add([rightPillBg, this.scoreTimeText]);

    // 2B. TOP-RIGHT FRAGMENTS PILL (Core Fragments Tracker)
    this.fragPillW = 270;
    this.fragPillH = 28;
    this.fragPillContainer = scene.add.container(width - 22, 56);

    const fragPillBg = scene.add.graphics();
    fragPillBg.fillStyle(0x0c2548, 0.45);
    fragPillBg.fillRoundedRect(-this.fragPillW, 0, this.fragPillW, this.fragPillH, 14);
    fragPillBg.fillStyle(0xffffff, 0.1);
    fragPillBg.fillRoundedRect(-this.fragPillW + 1, 1, this.fragPillW - 2, 12, 10);
    fragPillBg.lineStyle(1.2, 0x38bdf8, 0.75);
    fragPillBg.strokeRoundedRect(-this.fragPillW, 0, this.fragPillW, this.fragPillH, 14);

    this.fragmentsText = scene.add.text(-this.fragPillW / 2, this.fragPillH / 2, 'CORE FRAGMENTS: ◇ ◇ ◇  (0/3)', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#38bdf8',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.fragPillContainer.add([fragPillBg, this.fragmentsText]);

    // 3. TOP-CENTER MINIMAL CONTROLS HINT (Non-intrusive, Leaves Bottom-Left 100% Clear)
    this.controlsHintText = scene.add.text(width / 2, 22, '[M] AUDIO • [P] PAUSE • [R] RESTART • [F] FULLSCREEN', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0.75);

    // Alert notification banner (middle screen)
    this.notifyText = scene.add.text(width / 2, height / 2 - 120, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ef4444',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);

    // Add HUD elements to master container
    this.container.add([
      this.hudBg,
      hpIconGfx,
      hpLabel,
      this.healthSegmentsGfx,
      this.hpValueText,
      epIconGfx,
      epLabel,
      this.energySegmentsGfx,
      this.dashBadge.container,
      this.freezeBadge.container,
      this.rightPillContainer,
      this.fragPillContainer,
      this.controlsHintText,
      this.notifyText
    ]);
  }

  handleResize(width, height) {
    if (this.rightPillContainer) {
      this.rightPillContainer.x = width - 22;
    }
    if (this.fragPillContainer) {
      this.fragPillContainer.x = width - 22;
    }
    if (this.controlsHintText) {
      this.controlsHintText.x = width / 2;
    }
    if (this.notifyText) {
      this.notifyText.x = width / 2;
      this.notifyText.y = height / 2 - 120;
    }
  }

  /**
   * Creates a compact translucent ability badge matching the reference layout
   */
  createCompactAbilityBadge(x, y, keyLabel, actionLabel, cost) {
    const w = 132;
    const h = 32;

    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0c2548, 0.5);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.2, 0x00f0ff, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    // Icon Circle
    const iconGfx = this.scene.add.graphics();
    iconGfx.fillStyle(0x00f0ff, 0.25);
    iconGfx.fillCircle(-w / 2 + 16, 0, 9);
    iconGfx.lineStyle(1, 0x00f0ff, 0.9);
    iconGfx.strokeCircle(-w / 2 + 16, 0, 9);

    const keyBox = this.scene.add.text(-w / 2 + 16, 0, keyLabel, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    const title = this.scene.add.text(4, -4, actionLabel, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const statusTag = this.scene.add.text(4, 7, `${cost} NRG`, {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '10px',
      fontWeight: '700',
      color: '#94a3b8'
    }).setOrigin(0.5);

    container.add([bg, iconGfx, keyBox, title, statusTag]);

    return {
      container,
      bg,
      iconGfx,
      keyBox,
      title,
      statusTag,
      w,
      h,
      cost,
      currentState: 'READY'
    };
  }

  updateAudioBadge(isMuted) {
    if (!this.controlsHintText) return;
    const audioStatus = isMuted ? '[M] MUTED' : '[M] AUDIO ON';
    this.controlsHintText.setText(`${audioStatus} • [P] PAUSE • [R] RESTART`);
    this.controlsHintText.setColor(isMuted ? '#ef4444' : '#94a3b8');
  }

  /**
   * Updates ability badge appearance across 4 distinct authoritative states:
   * 'READY', 'ACTIVE', 'COOLING', 'LOW_ENERGY'
   */
  updateBadgeState(badge, state) {
    if (badge.currentState === state) return;
    badge.currentState = state;

    const w = badge.w;
    const h = badge.h;
    badge.bg.clear();

    if (state === 'ACTIVE') {
      badge.bg.fillStyle(0x2e1065, 0.7);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      badge.bg.lineStyle(1.8, 0xa855f7, 1.0);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

      badge.keyBox.setColor('#c084fc');
      badge.title.setColor('#ffffff');
      badge.statusTag.setText('ACTIVE');
      badge.statusTag.setColor('#c084fc');
    } else if (state === 'COOLING') {
      badge.bg.fillStyle(0x451a03, 0.7);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      badge.bg.lineStyle(1.5, 0xf59e0b, 0.9);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

      badge.keyBox.setColor('#f59e0b');
      badge.title.setColor('#fde68a');
      badge.statusTag.setText('COOLING');
      badge.statusTag.setColor('#f59e0b');
    } else if (state === 'LOW_ENERGY') {
      badge.bg.fillStyle(0x0f172a, 0.5);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      badge.bg.lineStyle(1, 0x334155, 0.6);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

      badge.keyBox.setColor('#475569');
      badge.title.setColor('#64748b');
      badge.statusTag.setText(`${badge.cost} NRG`);
      badge.statusTag.setColor('#ef4444');
    } else {
      // READY
      badge.bg.fillStyle(0x0c2548, 0.5);
      badge.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      badge.bg.lineStyle(1.2, 0x00f0ff, 0.8);
      badge.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

      badge.keyBox.setColor('#00f0ff');
      badge.title.setColor('#ffffff');
      badge.statusTag.setText(`${badge.cost} NRG`);
      badge.statusTag.setColor('#94a3b8');
    }
  }

  /**
   * Draws 10 slanted parallelogram segments for health and energy
   */
  drawSlantedSegments(gfx, startX, startY, count, filledRatio, activeColor, inactiveColor = 0x0c2548) {
    gfx.clear();
    const segW = 14;
    const segH = 9;
    const spacing = 4;
    const slant = 4;

    const filledCount = Math.ceil(filledRatio * count);

    for (let i = 0; i < count; i++) {
      const sx = startX + i * (segW + spacing);
      const isFilled = i < filledCount;

      gfx.beginPath();
      gfx.moveTo(sx + slant, startY);
      gfx.lineTo(sx + segW + slant, startY);
      gfx.lineTo(sx + segW, startY + segH);
      gfx.lineTo(sx, startY + segH);
      gfx.closePath();

      if (isFilled) {
        gfx.fillStyle(activeColor, 0.95);
        gfx.fillPath();
        // Top 1.5px bevel highlight
        gfx.lineStyle(1, 0xffffff, 0.8);
        gfx.lineBetween(sx + slant, startY, sx + segW + slant, startY);
      } else {
        gfx.fillStyle(inactiveColor, 0.4);
        gfx.fillPath();
        gfx.lineStyle(1, 0x1e3a5f, 0.45);
        gfx.strokePath();
      }
    }
  }

  update(player, countdownSeconds, score = 0, currentSection = 'SEC A: AWAKENING', coreFragments = 0) {
    if (!player) return;

    // 1. Slanted Segmented Health Bar (10 segments)
    const hpRatio = Phaser.Math.Clamp(player.health / GAME_SETTINGS.PLAYER.MAX_HEALTH, 0, 1);
    let hpColor = 0x00f0ff; // Brilliant electric cyan matching reference
    if (hpRatio <= 0.25) {
      hpColor = 0xef4444; // Warning red
    } else if (hpRatio <= 0.5) {
      hpColor = 0xf59e0b; // Warning amber
    }

    const segmentsStartX = this.vitalsX + 90;
    this.drawSlantedSegments(this.healthSegmentsGfx, segmentsStartX, this.vitalsY + 14, 10, hpRatio, hpColor);
    this.hpValueText.setText(`${Math.max(0, Math.round(player.health))}`);

    // 2. Slanted Segmented Energy Bar (10 segments)
    const epRatio = Phaser.Math.Clamp(player.energy / GAME_SETTINGS.CHRONO.MAX_ENERGY, 0, 1);
    this.drawSlantedSegments(this.energySegmentsGfx, segmentsStartX, this.vitalsY + 44, 10, epRatio, 0x00f0ff);

    // 3. Score & Time Pill (Upper-Right)
    const totalSec = Math.max(0, Math.floor(countdownSeconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const scoreStr = String(score).padStart(4, '0');
    this.scoreTimeText.setText(`SCORE: ${scoreStr}   |   TIME: ${timeStr}`);
    if (totalSec < 30) {
      this.scoreTimeText.setColor('#ef4444');
    } else {
      this.scoreTimeText.setColor('#ffffff');
    }

    // 3B. Core Fragments Pill (Upper-Right)
    if (this.fragmentsText) {
      const frags = Math.min(3, Math.max(0, coreFragments || 0));
      const icons = [
        frags >= 1 ? '◆' : '◇',
        frags >= 2 ? '◆' : '◇',
        frags >= 3 ? '◆' : '◇'
      ].join(' ');
      this.fragmentsText.setText(`CORE FRAGMENTS: ${icons}  (${frags}/3)`);
      if (frags === 3) {
        this.fragmentsText.setColor('#10b981');
      } else {
        this.fragmentsText.setColor('#38bdf8');
      }
    }

    // 4. Ability Badges Status (Freeze & Dash)
    if (player.isFreezeActive) {
      this.updateBadgeState(this.freezeBadge, 'ACTIVE');
    } else if (player.energy < GAME_SETTINGS.CHRONO.FREEZE_COST) {
      this.updateBadgeState(this.freezeBadge, 'LOW_ENERGY');
    } else {
      this.updateBadgeState(this.freezeBadge, 'READY');
    }

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

  /**
   * Displays floating holographic fragment collection banner
   */
  showFragmentBanner(fragLabel, collectedCount) {
    UIComponents.createNotificationBanner(
      this.scene,
      '◆ CHRONO CORE FRAGMENT RECOVERED ◆',
      `${fragLabel} // MATRIX SYNC [${collectedCount}/3]`,
      { accentColor: 0x00f0ff, titleColor: '#00f0ff' }
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
   * Displays defeat game-over overlay with checkpoint retry options
   */
  showGameOverOverlay(stats = {}, onRetry, onRestart, onMenu) {
    audioManager.play('death');
    const { width, height } = this.scene.scale;

    // Prevent duplicate game-over overlays from stacking
    if (this.currentGameOverCleanup) {
      this.currentGameOverCleanup();
    } else if (this.currentGameOverOverlay) {
      this.currentGameOverOverlay.destroy();
      this.currentGameOverOverlay = null;
    }

    const overlay = this.scene.add.container(width / 2, height / 2).setDepth(100);
    overlay.setScrollFactor(0);
    this.currentGameOverOverlay = overlay;

    // Dark backdrop overlay
    const bgDim = this.scene.add.graphics();
    bgDim.fillStyle(0x040714, 0.94);
    bgDim.fillRect(-width / 2, -height / 2, width, height);

    // Defeat card frame
    const cardW = 620;
    const cardH = 430;
    const card = this.scene.add.graphics();
    card.fillStyle(0x0a1128, 0.96);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
    card.lineStyle(2, 0xef4444, 0.9);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);

    // Top danger accent notch lines
    card.lineStyle(2, 0xef4444, 1);
    const nLen = 14;
    card.lineBetween(-cardW / 2, -cardH / 2 + nLen, -cardW / 2, -cardH / 2);
    card.lineBetween(-cardW / 2, -cardH / 2, -cardW / 2 + nLen, -cardH / 2);
    card.lineBetween(cardW / 2 - nLen, -cardH / 2, cardW / 2, -cardH / 2);
    card.lineBetween(cardW / 2, -cardH / 2, cardW / 2, -cardH / 2 + nLen);

    // Header: GAME OVER
    const title = this.scene.add.text(0, -cardH / 2 + 42, 'GAME OVER', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#ef4444',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Subtitle: Kael has fallen into the temporal abyss.
    const messageText = stats.message || 'Kael has fallen into the temporal abyss.';
    const subtitle = this.scene.add.text(0, -cardH / 2 + 76, messageText, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      fontStyle: 'italic',
      fontWeight: '700',
      color: '#fca5a5',
      letterSpacing: 1
    }).setOrigin(0.5);

    // Stats Grid Box
    const statBox = this.scene.add.graphics();
    statBox.fillStyle(0x060b1c, 0.88);
    statBox.fillRoundedRect(-cardW / 2 + 30, -70, cardW - 60, 160, 6);
    statBox.lineStyle(1, 0x1e293b, 0.8);
    statBox.strokeRoundedRect(-cardW / 2 + 30, -70, cardW - 60, 160, 6);

    overlay.add([bgDim, card, title, subtitle, statBox]);

    const statRows = [
      { label: 'LAST TEMPORAL ANCHOR:', val: `CP-${stats.checkpointId || 'A'} // ${stats.checkpointTitle || 'SEC A: AWAKENING'}` },
      { label: 'CORE FRAGMENTS RECOVERED:', val: `${stats.coreFragments !== undefined ? stats.coreFragments : 0} / 3` },
      { label: 'MISSION SCORE:', val: `${stats.score || 0} PTS` },
      { label: 'TIME REMAINING:', val: `${stats.timeStr || '00:00'}` }
    ];

    statRows.forEach((r, idx) => {
      const yPos = -52 + idx * 36;
      const lbl = this.scene.add.text(-cardW / 2 + 50, yPos, r.label, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '14px',
        fontWeight: '700',
        color: '#94a3b8',
        letterSpacing: 1
      });
      const val = this.scene.add.text(cardW / 2 - 50, yPos, r.val, {
        fontFamily: 'Orbitron, monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: idx === 0 ? '#00f0ff' : '#f8fafc'
      }).setOrigin(1, 0);

      overlay.add([lbl, val]);
    });

    let isActionHandled = false;

    const cleanup = () => {
      if (this.scene && this.scene.input && this.scene.input.keyboard) {
        this.scene.input.keyboard.off('keydown', onPhaserKeyDown);
      }
      window.removeEventListener('keydown', onWindowKeyDown);
      this.currentGameOverCleanup = null;
      if (this.currentGameOverOverlay === overlay) {
        this.currentGameOverOverlay = null;
      }
      overlay.destroy();
    };
    this.currentGameOverCleanup = cleanup;

    const handleRetry = () => {
      if (isActionHandled) return;
      isActionHandled = true;
      audioManager.play('uiClick');
      cleanup();
      if (onRetry) onRetry();
    };

    const handleMenu = () => {
      if (isActionHandled) return;
      isActionHandled = true;
      audioManager.play('uiClick');
      cleanup();
      if (onMenu) onMenu();
    };

    // Action Buttons: RETRY and MAIN MENU
    const btnRetry = UIComponents.createButton(this.scene, -125, 145, 210, 44, 'RETRY [R / ENTER]', {
      isPrimary: true,
      scrollFactor: 0,
      onClick: () => handleRetry()
    });
    btnRetry.setScrollFactor(0);

    const btnMenu = UIComponents.createButton(this.scene, 125, 145, 210, 44, 'MAIN MENU [ESC]', {
      isPrimary: false,
      scrollFactor: 0,
      onClick: () => handleMenu()
    });
    btnMenu.setScrollFactor(0);

    overlay.add([btnRetry, btnMenu]);

    // Keyboard handlers via Phaser input system
    const onPhaserKeyDown = (e) => {
      if (isActionHandled) return;
      if (e.code === 'KeyR' || e.code === 'Enter') {
        handleRetry();
      } else if (e.code === 'Escape') {
        handleMenu();
      }
    };
    if (this.scene && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.on('keydown', onPhaserKeyDown);
    }

    // Window keyboard fallback in case canvas lost focus
    const onWindowKeyDown = (e) => {
      if (isActionHandled) return;
      if (e.code === 'KeyR' || e.code === 'Enter') {
        handleRetry();
      } else if (e.code === 'Escape') {
        handleMenu();
      }
    };
    window.addEventListener('keydown', onWindowKeyDown);

    overlay.setAlpha(0);
    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 250,
      ease: 'Quad.easeOut'
    });
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
    bgDim.fillStyle(0x040714, 0.94);
    bgDim.fillRect(-width / 2, -height / 2, width, height);

    // Victory modal card using UIComponents design tokens
    const cardW = 680;
    const cardH = 490;
    const card = this.scene.add.graphics();
    card.fillStyle(0x0a1128, 0.97);
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
    const title = this.scene.add.text(0, -cardH / 2 + 40, 'CHRONO SHIFT — MISSION COMPLETE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 2
    }).setOrigin(0.5);

    const subtitle = this.scene.add.text(0, -cardH / 2 + 68, 'AETHELON RESTORED • CHRONO CORE SECURED', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#10b981',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Narrative Box
    const narrativeText = this.scene.add.text(0, -cardH / 2 + 112, 
      '"The Chrono Core stabilizes. Across Aethelon, the fractured timelines converge once more. The city survives, its future restored. Kael Veyron has bent time and defied fate."', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13.5px',
      fontWeight: '600',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: cardW - 70 },
      lineSpacing: 4
    }).setOrigin(0.5);

    // Stats Grid Container
    const statBox = this.scene.add.graphics();
    statBox.fillStyle(0x060b1c, 0.85);
    statBox.fillRoundedRect(-cardW / 2 + 30, -cardH / 2 + 158, cardW - 60, 162, 6);
    statBox.lineStyle(1, 0x1e293b, 0.8);
    statBox.strokeRoundedRect(-cardW / 2 + 30, -cardH / 2 + 158, cardW - 60, 162, 6);

    overlay.add([bgDim, card, title, subtitle, narrativeText, statBox]);

    const statRows = [
      { label: 'CORE FRAGMENTS:', val: `${stats.coreFragments !== undefined ? stats.coreFragments : 3} / 3 [RECOVERED]` },
      { label: 'OPERATIVE SCORE:', val: `${stats.score || 0} PTS` },
      { label: 'TIME REMAINING:', val: `${stats.timeStr || '02:00'}` },
      { label: 'ANCHORS ACTIVE:', val: `${stats.checkpoints || 4} / 4` }
    ];

    statRows.forEach((r, idx) => {
      const yPos = -cardH / 2 + 175 + idx * 36;
      const lbl = this.scene.add.text(-cardW / 2 + 54, yPos, r.label, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '14px',
        fontWeight: '700',
        color: '#94a3b8',
        letterSpacing: 1
      });
      const val = this.scene.add.text(cardW / 2 - 54, yPos, r.val, {
        fontFamily: 'Orbitron, monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: idx === 0 ? '#00f0ff' : idx === 1 ? '#f59e0b' : '#f8fafc'
      }).setOrigin(1, 0);

      overlay.add([lbl, val]);
    });

    const cleanup = () => {
      window.removeEventListener('keydown', onKeyDown);
      overlay.destroy();
    };

    // Buttons: Play Again [Enter], Credits [C], Main Menu [Esc]
    const btnReplay = UIComponents.createButton(this.scene, -180, cardH / 2 - 50, 180, 42, 'PLAY AGAIN [ENTER]', {
      isPrimary: true,
      onClick: () => {
        cleanup();
        this.scene.scene.restart();
      }
    });

    const btnCredits = UIComponents.createButton(this.scene, 0, cardH / 2 - 50, 150, 42, 'CREDITS [C]', {
      isPrimary: false,
      onClick: () => {
        this.showCreditsOverlay();
      }
    });

    const btnMenu = UIComponents.createButton(this.scene, 180, cardH / 2 - 50, 160, 42, 'MAIN MENU [ESC]', {
      isPrimary: false,
      onClick: () => {
        cleanup();
        this.scene.scene.start('MenuScene');
      }
    });

    overlay.add([btnReplay, btnCredits, btnMenu]);

    const onKeyDown = (e) => {
      if (e.code === 'Enter') {
        cleanup();
        this.scene.scene.restart();
      } else if (e.code === 'KeyC') {
        this.showCreditsOverlay();
      } else if (e.code === 'Escape') {
        cleanup();
        this.scene.scene.start('MenuScene');
      }
    };

    window.addEventListener('keydown', onKeyDown);

    overlay.setAlpha(0);
    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 350,
      ease: 'Quad.easeOut'
    });
  }

  showCreditsOverlay() {
    audioManager.play('uiClick');
    const { width, height } = this.scene.scale;
    const credOverlay = this.scene.add.container(width / 2, height / 2).setDepth(70);
    credOverlay.setScrollFactor(0);

    const bgDim = this.scene.add.graphics();
    bgDim.fillStyle(0x020510, 0.96);
    bgDim.fillRect(-width / 2, -height / 2, width, height);

    const cardW = 640;
    const cardH = 460;
    const card = this.scene.add.graphics();
    card.fillStyle(0x0a1128, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
    card.lineStyle(2, 0x00f0ff, 0.9);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);

    const title = this.scene.add.text(0, -cardH / 2 + 36, 'CHRONO SHIFT', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 4
    }).setOrigin(0.5);

    const tag = this.scene.add.text(0, -cardH / 2 + 65, 'BEND TIME. DEFY FATE.', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#94a3b8',
      letterSpacing: 3
    }).setOrigin(0.5);

    const teamBox = this.scene.add.text(0, -cardH / 2 + 105, 'DEVELOPED BY TEAM PIXELFORGE\nHoly Mary Institute of Technology and Science, Hyderabad', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
      fontWeight: '700',
      color: '#38bdf8',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    const members = [
      { name: 'KAVALI ARUN', role: 'Team Lead • Systems & Core Engine' },
      { name: 'GOTTIPAMULA KARTHIK', role: 'Lead Gameplay Developer & Time Mechanics' },
      { name: 'HEMANTH KUMAR KUPPANNAGARI', role: 'Environment & Level Design' },
      { name: 'PALTYAVATH RENUKA', role: 'UI/UX & Visual Effects' }
    ];

    members.forEach((m, idx) => {
      const y = -cardH / 2 + 165 + idx * 34;
      const t1 = this.scene.add.text(-cardW / 2 + 50, y, m.name, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#f8fafc'
      });
      const t2 = this.scene.add.text(cardW / 2 - 50, y, m.role, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '13px',
        fontWeight: '600',
        color: '#94a3b8'
      }).setOrigin(1, 0);
      credOverlay.add([t1, t2]);
    });

    const eventText = this.scene.add.text(0, cardH / 2 - 95, 'RESPAWN — 2D Game Jam | Pravrutti 2.0\nBuilt with Phaser 3, JavaScript & Vite', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      color: '#64748b',
      align: 'center',
      lineSpacing: 3
    }).setOrigin(0.5);

    const closeCreds = () => {
      window.removeEventListener('keydown', onKey);
      credOverlay.destroy();
    };

    const btnBack = UIComponents.createButton(this.scene, 0, cardH / 2 - 40, 200, 38, 'BACK [ESC]', {
      isPrimary: true,
      onClick: () => {
        closeCreds();
      }
    });

    credOverlay.add([bgDim, card, title, tag, teamBox, eventText, btnBack]);

    const onKey = (e) => {
      if (e.code === 'Escape' || e.code === 'Enter') {
        closeCreds();
      }
    };

    window.addEventListener('keydown', onKey);
  }
}
