import Phaser from 'phaser';
import { settingsManager } from '../systems/SettingsManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.activeModal = null;
    this.selectedIndex = 0;
    this.buttons = [];
    this.isActionLocked = false;

    // 1. Parallax Background Layers
    // Base sky gradient rectangle
    this.add.rectangle(width / 2, height / 2, width, height, 0x050814);

    // Deep radial anomaly glow behind the city
    const anomalyGaze = this.add.graphics();
    anomalyGaze.fillStyle(0x3b0764, 0.28);
    anomalyGaze.fillCircle(width / 2, height / 2 - 30, 320);

    // Subtle atmospheric grid
    this.add.grid(width / 2, height / 2, width, height, 64, 64, 0x000000, 0, 0x00f0ff, 0.05);

    // Layer 1: Distant Skyline
    this.bgSkyline = this.add.tileSprite(width / 2, 420, width, 400, 'bg_distant_skyline');
    this.bgSkyline.setAlpha(0.7);

    // Layer 2: Midground City Architecture
    this.bgCity = this.add.tileSprite(width / 2, 480, width, 450, 'bg_midground_city');
    this.bgCity.setAlpha(0.9);

    // Floating Geometric Shards (Temporal crystal fragments)
    this.shards = [];
    for (let i = 0; i < 4; i++) {
      const shard = this.add.image(180 + i * 280, 220 + (i % 2) * 90, 'geometric_shard');
      shard.setScale(0.8 + (i % 3) * 0.2);
      shard.setAlpha(0.65);
      this.shards.push(shard);

      if (!settingsManager.get('reducedMotion')) {
        this.tweens.add({
          targets: shard,
          y: shard.y - 18,
          angle: 360,
          duration: 3500 + i * 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Layer 3: Foreground structural overlay
    this.add.image(width / 2, height / 2, 'bg_foreground_structures').setDepth(5);

    // 2. Title & Visual Identity Treatment
    const titleY = 135;

    this.titleText = this.add.text(width / 2, titleY, 'CHRONO SHIFT', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '62px',
      fontStyle: '900',
      color: '#00f0ff',
      letterSpacing: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#38bdf8', blur: 14, stroke: true, fill: true }
    }).setOrigin(0.5).setDepth(10);

    // Glowing cyan horizontal accent line
    const accentLine = this.add.graphics().setDepth(10);
    accentLine.lineStyle(2, 0x00f0ff, 0.8);
    accentLine.lineBetween(width / 2 - 280, titleY + 44, width / 2 + 280, titleY + 44);
    accentLine.fillStyle(0xa855f7, 1);
    accentLine.fillCircle(width / 2, titleY + 44, 4);

    this.taglineText = this.add.text(width / 2, titleY + 65, '“Bend Time. Defy Fate.”', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: '600',
      color: '#c084fc',
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(10);

    this.eventBadge = this.add.text(width / 2, titleY + 95, 'RESPAWN 2026 // PRAVRUTTI 2.0 // PIXELFORGE', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#64748b',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(10);

    // 3. Main Menu Actions
    const menuItems = [
      { id: 'start', label: 'START MISSION', isPrimary: true, action: () => this.handleStartMission() },
      { id: 'howto', label: 'HOW TO PLAY', isPrimary: false, action: () => this.openHowToPlayModal() },
      { id: 'settings', label: 'SETTINGS', isPrimary: false, action: () => this.openSettingsModal() },
      { id: 'credits', label: 'CREDITS', isPrimary: false, action: () => this.openCreditsModal() }
    ];

    const startMenuY = 320;
    const itemSpacing = 64;

    menuItems.forEach((item, index) => {
      const btn = this.createMenuButton(width / 2, startMenuY + index * itemSpacing, item, index);
      this.buttons.push(btn);
    });

    // Navigation Keyboard Hints
    this.navHint = this.add.text(width / 2, height - 42, '[ ↑ / ↓ or W / S ] Navigate  •  [ ENTER / Space ] Select  •  [ ESC ] Back', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
      color: '#475569',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(10);

    // Setup Keyboard Navigation
    this.setupKeyboardInput();

    // Select primary button by default
    this.updateButtonFocus();
  }

  update(time, delta) {
    const isReduced = settingsManager.get('reducedMotion');
    if (!isReduced) {
      if (this.bgSkyline) this.bgSkyline.tilePositionX += 0.15;
      if (this.bgCity) this.bgCity.tilePositionX += 0.45;
    }
  }

  createMenuButton(x, y, item, index) {
    const btnWidth = item.isPrimary ? 340 : 310;
    const btnHeight = 48;

    const container = this.add.container(x, y).setDepth(10);

    const bgGfx = this.add.graphics();
    const borderGfx = this.add.graphics();

    const indicator = this.add.text(-btnWidth / 2 + 24, 0, item.isPrimary ? '►' : '•', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: item.isPrimary ? '#00f0ff' : '#64748b'
    }).setOrigin(0.5);

    const labelText = this.add.text(item.isPrimary ? 10 : 0, 0, item.label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: item.isPrimary ? '17px' : '15px',
      fontStyle: 'bold',
      color: item.isPrimary ? '#00f0ff' : '#cbd5e1',
      letterSpacing: 3
    }).setOrigin(0.5);

    container.add([bgGfx, borderGfx, indicator, labelText]);
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    const redraw = (state) => {
      bgGfx.clear();
      borderGfx.clear();

      if (state === 'focused') {
        bgGfx.fillStyle(item.isPrimary ? 0x00f0ff : 0x1e293b, item.isPrimary ? 0.22 : 0.6);
        bgGfx.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        borderGfx.lineStyle(2, 0x00f0ff, 1);
        borderGfx.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        labelText.setColor(item.isPrimary ? '#ffffff' : '#00f0ff');
        indicator.setColor('#00f0ff');
        indicator.setText('►');
      } else if (state === 'pressed') {
        bgGfx.fillStyle(0x00f0ff, 0.35);
        bgGfx.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      } else {
        // Normal state
        bgGfx.fillStyle(item.isPrimary ? 0x0f172a : 0x080e1e, 0.8);
        bgGfx.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        borderGfx.lineStyle(1.5, item.isPrimary ? 0x00f0ff : 0x1e3a8a, item.isPrimary ? 0.7 : 0.5);
        borderGfx.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        labelText.setColor(item.isPrimary ? '#00f0ff' : '#94a3b8');
        indicator.setColor(item.isPrimary ? '#00f0ff' : '#475569');
        indicator.setText(item.isPrimary ? '►' : '•');
      }
    };

    redraw('normal');

    container.on('pointerover', () => {
      if (this.activeModal) return;
      this.selectedIndex = index;
      this.updateButtonFocus();
    });

    container.on('pointerdown', () => {
      if (this.activeModal || this.isActionLocked) return;
      redraw('pressed');
      this.triggerButtonAction(index);
    });

    return {
      container,
      item,
      redraw,
      btnWidth,
      btnHeight
    };
  }

  updateButtonFocus() {
    this.buttons.forEach((btn, idx) => {
      const isFocused = idx === this.selectedIndex;
      btn.redraw(isFocused ? 'focused' : 'normal');
      btn.container.setScale(isFocused ? 1.03 : 1.0);
    });
  }

  setupKeyboardInput() {
    this.input.keyboard.on('keydown-UP', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-W', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.navigateMenu(1));
    this.input.keyboard.on('keydown-S', () => this.navigateMenu(1));

    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.activeModal) return;
      this.triggerButtonAction(this.selectedIndex);
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.activeModal) return;
      this.triggerButtonAction(this.selectedIndex);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.activeModal) {
        this.closeModal();
      }
    });

    this.events.on('shutdown', () => {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.off('keydown-UP');
        this.input.keyboard.off('keydown-W');
        this.input.keyboard.off('keydown-DOWN');
        this.input.keyboard.off('keydown-S');
        this.input.keyboard.off('keydown-ENTER');
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.off('keydown-ESC');
      }
    });
  }

  navigateMenu(delta) {
    if (this.activeModal) return;
    this.selectedIndex = (this.selectedIndex + delta + this.buttons.length) % this.buttons.length;
    this.updateButtonFocus();
  }

  triggerButtonAction(index) {
    if (this.isActionLocked) return;
    this.isActionLocked = true;
    this.time.delayedCall(180, () => {
      this.isActionLocked = false;
    });

    const target = this.buttons[index];
    if (target && target.item && target.item.action) {
      target.item.action();
    }
  }

  handleStartMission() {
    this.scene.start('BriefingScene');
  }

  // --- MODAL DIALOGS ---

  createModalBase(titleText, modalWidth = 840, modalHeight = 490) {
    if (this.activeModal) {
      this.closeModal();
    }

    const { width, height } = this.scale;
    const modalContainer = this.add.container(0, 0).setDepth(50);

    // Dark backdrop overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.85);
    overlay.setInteractive(); // block pointer events from passing through

    // Modal frame
    const boxX = width / 2;
    const boxY = height / 2;
    const boxGfx = this.add.graphics();
    boxGfx.fillStyle(0x0b1329, 0.95);
    boxGfx.fillRoundedRect(boxX - modalWidth / 2, boxY - modalHeight / 2, modalWidth, modalHeight, 8);
    boxGfx.lineStyle(1.5, 0x00f0ff, 0.75);
    boxGfx.strokeRoundedRect(boxX - modalWidth / 2, boxY - modalHeight / 2, modalWidth, modalHeight, 8);

    // Header Title
    const header = this.add.text(boxX, boxY - modalHeight / 2 + 36, titleText, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Accent line
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x1e3a8a, 0.8);
    divider.lineBetween(boxX - modalWidth / 2 + 30, boxY - modalHeight / 2 + 64, boxX + modalWidth / 2 - 30, boxY - modalHeight / 2 + 64);

    // Close Button [ESC]
    const closeBtn = this.add.container(boxX, boxY + modalHeight / 2 - 38);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x1e293b, 0.9);
    closeBg.fillRoundedRect(-120, -18, 240, 36, 4);
    closeBg.lineStyle(1, 0x38bdf8, 0.7);
    closeBg.strokeRoundedRect(-120, -18, 240, 36, 4);

    const closeText = this.add.text(0, 0, 'CLOSE [ESC]', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(240, 36);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    closeBtn.on('pointerover', () => closeBtn.setScale(1.04));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));

    modalContainer.add([overlay, boxGfx, header, divider, closeBtn]);
    this.activeModal = modalContainer;

    return { container: modalContainer, boxX, boxY, modalWidth, modalHeight };
  }

  closeModal() {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }
  }

  openHowToPlayModal() {
    const { container, boxX, boxY, modalWidth, modalHeight } = this.createModalBase('HOW TO PLAY // OPERATIVE CONTROLS');

    const sections = [
      {
        title: 'MOVEMENT CONTROLS',
        color: '#38bdf8',
        y: boxY - modalHeight / 2 + 85,
        items: [
          '• [ A / D ] or [ Arrow Left / Right ]: Run & lateral repositioning',
          '• [ Spacebar ] or [ Arrow Up ]: Jump across hazardous gaps',
          '• [ S ] or [ Arrow Down ]: Low-profile slide beneath overhead barriers'
        ]
      },
      {
        title: 'CHRONO GAUNTLET POWERS',
        color: '#c084fc',
        y: boxY - modalHeight / 2 + 185,
        items: [
          '• [ Q ] Chrono Freeze (Cost: 35 Energy) — Pauses rotating hazards, projectiles & platforms for 2.0s',
          '• [ E / Shift ] Chrono Dash (Cost: 25 Energy) — High-velocity directional burst through danger'
        ]
      },
      {
        title: 'VITAL SYSTEMS & OBJECTIVE',
        color: '#f59e0b',
        y: boxY - modalHeight / 2 + 285,
        items: [
          '• HEALTH (100) & ENERGY (100) — Replenish energy by collecting Chrono Cells (+20)',
          '• OBJECTIVE — Navigate through 4 fractured sectors to reach the Chrono Core before Zero Second!'
        ]
      }
    ];

    sections.forEach(s => {
      const title = this.add.text(boxX - modalWidth / 2 + 40, s.y, s.title, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: s.color,
        letterSpacing: 2
      });
      container.add(title);

      s.items.forEach((txt, idx) => {
        const line = this.add.text(boxX - modalWidth / 2 + 45, s.y + 24 + idx * 20, txt, {
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '16px',
          color: '#e2e8f0'
        });
        container.add(line);
      });
    });
  }

  openSettingsModal() {
    const { container, boxX, boxY, modalWidth, modalHeight } = this.createModalBase('SYSTEM CONFIGURATION // SETTINGS', 760, 480);

    const settingItems = [
      { key: 'masterVolume', label: 'MASTER VOLUME', type: 'stepper', step: 10, min: 0, max: 100 },
      { key: 'musicVolume', label: 'MUSIC VOLUME', type: 'stepper', step: 10, min: 0, max: 100 },
      { key: 'sfxVolume', label: 'SFX VOLUME', type: 'stepper', step: 10, min: 0, max: 100 },
      { key: 'reducedMotion', label: 'REDUCED MOTION', type: 'toggle' },
      { key: 'fullscreen', label: 'FULLSCREEN DISPLAY', type: 'action', actionLabel: 'TOGGLE FULLSCREEN' }
    ];

    const startY = boxY - modalHeight / 2 + 95;
    const rowHeight = 54;

    settingItems.forEach((item, idx) => {
      const rowY = startY + idx * rowHeight;

      // Label
      const label = this.add.text(boxX - modalWidth / 2 + 50, rowY, item.label, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '14px',
        color: '#94a3b8',
        letterSpacing: 2
      }).setOrigin(0, 0.5);
      container.add(label);

      if (item.type === 'stepper') {
        const valText = this.add.text(boxX + 130, rowY, `${settingsManager.get(item.key)}%`, {
          fontFamily: 'Rajdhani, monospace',
          fontSize: '18px',
          color: '#00f0ff'
        }).setOrigin(0.5);
        container.add(valText);

        // Minus button
        const minusBtn = this.createSettingIconButton(boxX + 70, rowY, '−', () => {
          const current = settingsManager.get(item.key);
          const next = Math.max(item.min, current - item.step);
          settingsManager.set(item.key, next);
          valText.setText(`${next}%`);
          if (this.sound) {
            this.sound.volume = settingsManager.get('masterVolume') / 100;
          }
        });

        // Plus button
        const plusBtn = this.createSettingIconButton(boxX + 190, rowY, '+', () => {
          const current = settingsManager.get(item.key);
          const next = Math.min(item.max, current + item.step);
          settingsManager.set(item.key, next);
          valText.setText(`${next}%`);
          if (this.sound) {
            this.sound.volume = settingsManager.get('masterVolume') / 100;
          }
        });

        container.add([minusBtn, plusBtn]);
      } else if (item.type === 'toggle') {
        const isEnabled = settingsManager.get(item.key);
        const toggleBtn = this.add.container(boxX + 130, rowY);
        const toggleBg = this.add.graphics();

        const updateToggleView = (val) => {
          toggleBg.clear();
          toggleBg.fillStyle(val ? 0x00f0ff : 0x1e293b, 0.85);
          toggleBg.fillRoundedRect(-60, -16, 120, 32, 4);
          toggleBg.lineStyle(1.5, 0x38bdf8, 0.8);
          toggleBg.strokeRoundedRect(-60, -16, 120, 32, 4);
        };

        const toggleText = this.add.text(0, 0, isEnabled ? 'ON' : 'OFF', {
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: isEnabled ? '#050814' : '#94a3b8'
        }).setOrigin(0.5);

        updateToggleView(isEnabled);

        toggleBtn.add([toggleBg, toggleText]);
        toggleBtn.setSize(120, 32);
        toggleBtn.setInteractive({ useHandCursor: true });

        toggleBtn.on('pointerdown', () => {
          const nextVal = !settingsManager.get(item.key);
          settingsManager.set(item.key, nextVal);
          updateToggleView(nextVal);
          toggleText.setText(nextVal ? 'ON' : 'OFF');
          toggleText.setColor(nextVal ? '#050814' : '#94a3b8');
        });

        container.add(toggleBtn);
      } else if (item.type === 'action') {
        const actBtn = this.add.container(boxX + 130, rowY);
        const actBg = this.add.graphics();
        actBg.fillStyle(0x1e293b, 0.85);
        actBg.fillRoundedRect(-90, -16, 180, 32, 4);
        actBg.lineStyle(1.5, 0x00f0ff, 0.6);
        actBg.strokeRoundedRect(-90, -16, 180, 32, 4);

        const actText = this.add.text(0, 0, item.actionLabel, {
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '11px',
          color: '#38bdf8'
        }).setOrigin(0.5);

        actBtn.add([actBg, actText]);
        actBtn.setSize(180, 32);
        actBtn.setInteractive({ useHandCursor: true });
        actBtn.on('pointerdown', () => {
          if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
          } else {
            this.scale.startFullscreen();
          }
        });
        container.add(actBtn);
      }
    });
  }

  createSettingIconButton(x, y, char, callback) {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.8);
    bg.fillRoundedRect(-16, -14, 32, 28, 4);
    bg.lineStyle(1, 0x00f0ff, 0.5);
    bg.strokeRoundedRect(-16, -14, 32, 28, 4);

    const txt = this.add.text(0, 0, char, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '18px',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setSize(32, 28);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', callback);
    btn.on('pointerover', () => btn.setScale(1.1));
    btn.on('pointerout', () => btn.setScale(1.0));
    return btn;
  }

  openCreditsModal() {
    const { container, boxX, boxY, modalWidth, modalHeight } = this.createModalBase('TRANSMISSION ARCHIVE // CREDITS', 780, 480);

    const creditLines = [
      { header: 'DEVELOPMENT TEAM', content: 'PixelForge' },
      { header: 'GAME JAM EVENT', content: 'RESPAWN — 2D Game Jam, Pravrutti 2.0' },
      { header: 'DIRECTOR & GAMEPLAY ARCHITECTURE', content: 'Kael Veyron Temporal Protocol' },
      { header: 'CORE ENGINE', content: 'Phaser 3 (v3.90.0) — Photon Storm Ltd. [MIT License]' },
      { header: 'BUILD TOOL & MODULE SYSTEM', content: 'Vite (v6.2.0) & JavaScript ES Modules [MIT License]' },
      { header: 'TYPOGRAPHY', content: 'Orbitron & Rajdhani — Google Fonts [SIL Open Font License]' },
      { header: 'ASSETS & GRAPHICS', content: '100% Original Procedural Vector Synthesis & Canvas Shaders' }
    ];

    const startY = boxY - modalHeight / 2 + 85;
    creditLines.forEach((c, idx) => {
      const curY = startY + idx * 46;

      const hdr = this.add.text(boxX, curY, c.header, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        color: '#38bdf8',
        letterSpacing: 2
      }).setOrigin(0.5);

      const cnt = this.add.text(boxX, curY + 16, c.content, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '16px',
        fontWeight: '600',
        color: '#e2e8f0'
      }).setOrigin(0.5);

      container.add([hdr, cnt]);
    });
  }
}
