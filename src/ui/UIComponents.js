import Phaser from 'phaser';

/**
 * UIComponents - Cohesive Sci-Fi Interface Design System for CHRONO SHIFT
 * Provides standardized panels, interactive cybernetic buttons, keycaps, and progress meters.
 */
export class UIComponents {
  // Theme Color Palette
  static COLORS = {
    BG_DARK: 0x070c1b,
    BG_CARD: 0x0a1128,
    SURFACE_BORDER: 0x1e293b,
    PRIMARY_CYAN: 0x00f0ff,
    CYAN_GLOW: 0x38bdf8,
    ACCENT_PURPLE: 0xa855f7,
    PURPLE_GLOW: 0xc084fc,
    ALERT_AMBER: 0xf59e0b,
    DANGER_RED: 0xef4444,
    SUCCESS_GREEN: 0x10b981,
    TEXT_WHITE: '#f8fafc',
    TEXT_LIGHT: '#e2e8f0',
    TEXT_MUTED: '#94a3b8',
    TEXT_DIM: '#64748b'
  };

  /**
   * Creates a cybernetic panel card with corner notches and glowing borders
   */
  static createPanel(scene, x, y, width, height, options = {}) {
    const radius = options.radius ?? 6;
    const bgColor = options.bgColor ?? UIComponents.COLORS.BG_CARD;
    const bgAlpha = options.bgAlpha ?? 0.94;
    const borderColor = options.borderColor ?? UIComponents.COLORS.PRIMARY_CYAN;
    const borderAlpha = options.borderAlpha ?? 0.8;
    const borderWidth = options.borderWidth ?? 1.5;

    const container = scene.add.container(x, y);

    const gfx = scene.add.graphics();
    gfx.fillStyle(bgColor, bgAlpha);
    gfx.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    gfx.lineStyle(borderWidth, borderColor, borderAlpha);
    gfx.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

    // Corner tech notches
    if (options.techNotches !== false) {
      gfx.lineStyle(2, UIComponents.COLORS.PRIMARY_CYAN, 1.0);
      const notchLen = 12;
      // Top-left notch
      gfx.lineBetween(-width / 2, -height / 2 + notchLen, -width / 2, -height / 2);
      gfx.lineBetween(-width / 2, -height / 2, -width / 2 + notchLen, -height / 2);
      // Top-right notch
      gfx.lineBetween(width / 2 - notchLen, -height / 2, width / 2, -height / 2);
      gfx.lineBetween(width / 2, -height / 2, width / 2, -height / 2 + notchLen);
      // Bottom-left notch
      gfx.lineBetween(-width / 2, height / 2 - notchLen, -width / 2, height / 2);
      gfx.lineBetween(-width / 2, height / 2, -width / 2 + notchLen, height / 2);
      // Bottom-right notch
      gfx.lineBetween(width / 2 - notchLen, height / 2, width / 2, height / 2);
      gfx.lineBetween(width / 2, height / 2, width / 2, height / 2 - notchLen);
    }

    container.add(gfx);
    container.panelWidth = width;
    container.panelHeight = height;
    container.gfx = gfx;

    return container;
  }

  /**
   * Creates an interactive cybernetic button with hover, focus, and click animations
   */
  static createButton(scene, x, y, width, height, label, options = {}) {
    const container = scene.add.container(x, y);
    const isPrimary = options.isPrimary || false;
    const baseColor = isPrimary ? UIComponents.COLORS.PRIMARY_CYAN : 0x1e293b;
    const textColor = isPrimary ? '#050814' : UIComponents.COLORS.TEXT_LIGHT;

    const bgGfx = scene.add.graphics();
    const borderGfx = scene.add.graphics();

    const redraw = (state) => {
      bgGfx.clear();
      borderGfx.clear();

      if (state === 'hover' || state === 'focus') {
        bgGfx.fillStyle(isPrimary ? 0x38bdf8 : 0x334155, 0.95);
        bgGfx.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
        borderGfx.lineStyle(2, UIComponents.COLORS.PRIMARY_CYAN, 1);
        borderGfx.strokeRoundedRect(-width / 2, -height / 2, width, height, 4);
      } else if (state === 'pressed') {
        bgGfx.fillStyle(0x0284c7, 1);
        bgGfx.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
      } else {
        // Normal
        bgGfx.fillStyle(baseColor, isPrimary ? 0.9 : 0.85);
        bgGfx.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
        borderGfx.lineStyle(1.5, isPrimary ? UIComponents.COLORS.PRIMARY_CYAN : 0x38bdf8, 0.65);
        borderGfx.strokeRoundedRect(-width / 2, -height / 2, width, height, 4);
      }
    };

    redraw('normal');

    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: options.fontSize || '13px',
      fontStyle: 'bold',
      color: textColor,
      letterSpacing: 2
    }).setOrigin(0.5);

    container.add([bgGfx, borderGfx, text]);
    container.setSize(width, height);
    container.setScrollFactor(options.scrollFactor !== undefined ? options.scrollFactor : 0);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    container.on('pointerover', () => {
      redraw('hover');
      container.setScale(1.03);
    });

    container.on('pointerout', () => {
      redraw('normal');
      container.setScale(1.0);
    });

    container.on('pointerdown', (pointer) => {
      redraw('pressed');
      if (options.onClick) options.onClick(pointer);
    });

    container.on('pointerup', () => {
      redraw('hover');
    });

    container.redraw = redraw;
    container.text = text;

    return container;
  }

  /**
   * Creates a stylized metallic keycap tag (e.g., [W], [SPACE], [Q])
   */
  static createKeycap(scene, x, y, keyText, width = 36, height = 26) {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 3);
    bg.lineStyle(1.2, UIComponents.COLORS.PRIMARY_CYAN, 0.8);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 3);

    const txt = scene.add.text(0, 0, keyText, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    container.add([bg, txt]);
    return container;
  }

  /**
   * Creates a floating holographic notification banner for checkpoints & section transitions
   */
  static createNotificationBanner(scene, title, subtitle, options = {}) {
    const { width } = scene.scale;
    const bannerWidth = options.width ?? 480;
    const bannerHeight = options.height ?? 62;
    const bannerY = options.y ?? 100;
    const accentColor = options.accentColor ?? UIComponents.COLORS.PRIMARY_CYAN;

    const container = scene.add.container(width / 2, bannerY).setDepth(options.depth ?? 70);
    container.setScrollFactor(0);

    const bg = scene.add.graphics();
    bg.fillStyle(0x060b1c, 0.94);
    bg.fillRoundedRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 6);
    bg.lineStyle(1.5, accentColor, 0.85);
    bg.strokeRoundedRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 6);

    // Tech notches
    bg.lineStyle(2, accentColor, 1);
    const nLen = 8;
    bg.lineBetween(-bannerWidth / 2, -bannerHeight / 2 + nLen, -bannerWidth / 2, -bannerHeight / 2);
    bg.lineBetween(-bannerWidth / 2, -bannerHeight / 2, -bannerWidth / 2 + nLen, -bannerHeight / 2);
    bg.lineBetween(bannerWidth / 2 - nLen, -bannerHeight / 2, bannerWidth / 2, -bannerHeight / 2);
    bg.lineBetween(bannerWidth / 2, -bannerHeight / 2, bannerWidth / 2, -bannerHeight / 2 + nLen);

    const tText = scene.add.text(0, -11, title, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: options.titleColor ?? '#00f0ff',
      letterSpacing: 3
    }).setOrigin(0.5);

    const sText = scene.add.text(0, 12, subtitle, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#cbd5e1',
      letterSpacing: 2
    }).setOrigin(0.5);

    container.add([bg, tText, sText]);
    container.setAlpha(0);
    container.setScale(0.92);

    // Entrance animation
    scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1.0,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Exit animation after display duration
        scene.time.delayedCall(options.duration ?? 2200, () => {
          scene.tweens.add({
            targets: container,
            alpha: 0,
            y: bannerY - 15,
            duration: 260,
            ease: 'Quad.easeIn',
            onComplete: () => container.destroy()
          });
        });
      }
    });

    return container;
  }
}

