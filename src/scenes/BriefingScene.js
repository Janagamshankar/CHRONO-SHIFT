import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager.js';

/**
 * BriefingScene — Cinematic Story Introduction & Mission Directive
 * Meets Stage C Requirements:
 * 1. Aethelon before the catastrophe (2189 metropolis above the clouds).
 * 2. The Chrono Core fracturing across timelines.
 * 3. Temporal anomalies spreading across city districts.
 * 4. Kael Veyron activating the Chrono Gauntlet.
 * 5. The mission objective: "Recover the Chrono Core fragments. Survive the temporal collapse. Restore Aethelon."
 * Features: Auto-advancing slides (10-15s total), skippable via ESC, navigable via ENTER/SPACE/Click.
 */
export default class BriefingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BriefingScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Start background audio if not yet playing
    audioManager.startMusic();

    this.currentSlide = 0;
    this.slideTimer = null;
    this.isTransitioning = false;

    // 1. Ambient Cinematic Background Layers
    this.bgSky = this.add.image(width / 2, height / 2, 'bg_sky_gradient')
      .setDisplaySize(width, height)
      .setDepth(0);

    if (this.textures.exists('bg_aethelon_city')) {
      this.bgMatte = this.add.image(width / 2, height / 2, 'bg_aethelon_city')
        .setDisplaySize(width, height)
        .setAlpha(0.65)
        .setDepth(1);
    }

    if (this.textures.exists('cloud_bank_layer')) {
      this.bgClouds = this.add.tileSprite(width / 2, height * 0.75, width, 280, 'cloud_bank_layer')
        .setAlpha(0.6)
        .setDepth(2);
    }

    // 2. Translucent Backdrop Overlay
    this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x050c1e, 0.78)
      .setDepth(5);

    // 3. Cinematic Slide Deck Data
    this.slides = [
      {
        tag: 'YEAR 2189 // SECTOR AETHELON',
        title: 'THE FLOATING METROPOLIS',
        subtitle: 'Aethelon City — Suspended high above the clouds.',
        accentColor: '#00f0ff',
        tintColor: 0x00f0ff,
        iconKey: 'pylon_glyph_alpha',
        text: [
          'Humanity constructed Aethelon as the pinnacle of temporal engineering.',
          'Its anti-gravity architecture, automated security matrices, and perpetual stability were sustained by the radiant energy of the central Chrono Core.',
          'For decades, past, present, and future flowed in harmonious equilibrium.'
        ]
      },
      {
        tag: 'TEMPORAL ANOMALY // ZERO EVENT',
        title: 'THE CORE FRACTURE',
        subtitle: 'A catastrophic singularity rupture.',
        accentColor: '#ef4444',
        tintColor: 0xef4444,
        iconKey: 'hazard_triangle',
        text: [
          'Without warning, a runaway chronal pulse shattered the Chrono Core.',
          'Three vital Core Fragments tore through spacetime, scattering across the city sectors.',
          'Unstable geometric rifts, rotating temporal barriers, and rogue automated defenses have plunged Aethelon into a cascading timeline collapse.'
        ]
      },
      {
        tag: 'OPERATIVE DEPLOYMENT // KAEL VEYRON',
        title: 'THE CHRONO GAUNTLET',
        subtitle: 'Equipped to bend time and defy fate.',
        accentColor: '#c084fc',
        tintColor: 0xa855f7,
        iconKey: 'vfx_shockwave_ring',
        text: [
          'Runner Kael Veyron activates the MK-IV Chrono Gauntlet.',
          'Channeling chronal energy, Kael can freeze temporal hazards in mid-air [Q] and execute high-velocity directional Chrono Dashes [E].',
          'Only an operative attuned to the timeline can navigate the fractured ruins of Aethelon.'
        ]
      },
      {
        tag: 'TACTICAL DIRECTIVE // ALL SECTORS',
        title: 'MISSION OBJECTIVE',
        subtitle: '“Recover the Chrono Core fragments. Survive the temporal collapse. Restore Aethelon.”',
        accentColor: '#10b981',
        tintColor: 0x10b981,
        iconKey: 'core_fragment',
        text: [
          '1. RECOVER all 3 Chrono Core Fragments scattered across Outskirts, Rupture, and Zero Zone.',
          '2. DEPLOY Chrono Freeze [Q] to halt rotating blades, collapsing floors & deadly lasers.',
          '3. HARMONIZE Flux Pylons Alpha & Beta and restore the Core reactor before zero second!'
        ]
      }
    ];

    // 4. Main Slide Presentation Card
    const cardW = 860;
    const cardH = 460;
    this.cardX = width / 2;
    this.cardY = height / 2;

    this.cardContainer = this.add.container(this.cardX, this.cardY).setDepth(20);

    // Card background
    this.cardBg = this.add.graphics();
    this.cardBorder = this.add.graphics();

    // Icon / Graphic Emblem
    this.slideIcon = this.add.image(0, -cardH / 2 + 55, 'core_fragment').setScale(1.4);

    // Header Tag
    this.slideTag = this.add.text(0, -cardH / 2 + 105, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      fontWeight: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Main Title
    this.slideTitle = this.add.text(0, -cardH / 2 + 138, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '26px',
      fontStyle: '900',
      color: '#ffffff',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Subtitle / Mission Quote
    this.slideSubtitle = this.add.text(0, -cardH / 2 + 172, '', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      fontStyle: 'italic',
      fontWeight: '700',
      color: '#38bdf8',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Divider Line
    this.divider = this.add.graphics();

    // Narrative Body Text
    this.slideBody = this.add.text(0, -cardH / 2 + 250, '', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      color: '#e2e8f0',
      lineSpacing: 10,
      align: 'center',
      wordWrap: { width: cardW - 120 }
    }).setOrigin(0.5);

    // Slide Pagination Dots (4 Dots)
    this.dots = [];
    for (let i = 0; i < 4; i++) {
      const dot = this.add.circle(-45 + i * 30, cardH / 2 - 80, 5, 0x1e3a8a)
        .setInteractive({ useHandCursor: true });
      dot.on('pointerdown', () => this.goToSlide(i));
      this.dots.push(dot);
    }

    // Action Buttons Container
    this.btnDeploy = this.createActionButton(160, cardH / 2 - 38, 'DEPLOY TO AETHELON [ENTER]', 0x00f0ff, '#050814', () => {
      this.startGameplay();
    });

    this.btnSkip = this.createActionButton(-160, cardH / 2 - 38, 'SKIP CINEMATIC [ESC]', 0x1e293b, '#e2e8f0', () => {
      this.startGameplay();
    });

    this.cardContainer.add([
      this.cardBg,
      this.cardBorder,
      this.slideIcon,
      this.slideTag,
      this.slideTitle,
      this.slideSubtitle,
      this.divider,
      this.slideBody,
      ...this.dots,
      this.btnDeploy,
      this.btnSkip
    ]);

    // Top-right audio badge
    this.audioBadge = this.createAudioBadge(width - 80, 36);

    // 5. Render First Slide
    this.renderSlide(0);

    // 6. Setup Keyboard Listeners
    this.setupKeyboard();

    // 7. Auto-progress timer (4.0s per slide)
    this.scheduleAutoAdvance();

    // Responsive resize handler
    this.scale.on('resize', this.handleResize, this);
    this.events.on('shutdown', this.cleanup, this);
  }

  update(time, delta) {
    if (this.bgClouds) {
      this.bgClouds.tilePositionX += 0.2;
    }
  }

  renderSlide(index) {
    this.currentSlide = index;
    const slide = this.slides[index];
    const cardW = 860;
    const cardH = 460;

    // Card frame drawing
    this.cardBg.clear();
    this.cardBg.fillStyle(0x071126, 0.95);
    this.cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);

    this.cardBorder.clear();
    this.cardBorder.lineStyle(2, slide.tintColor, 0.85);
    this.cardBorder.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);

    // Icon update
    if (this.textures.exists(slide.iconKey)) {
      this.slideIcon.setTexture(slide.iconKey);
      this.slideIcon.setTint(slide.tintColor);
    }

    // Texts update
    this.slideTag.setText(slide.tag);
    this.slideTag.setColor(slide.accentColor);

    this.slideTitle.setText(slide.title);
    this.slideSubtitle.setText(slide.subtitle);
    this.slideSubtitle.setColor(slide.accentColor);

    this.divider.clear();
    this.divider.lineStyle(1.5, slide.tintColor, 0.6);
    this.divider.lineBetween(-cardW / 2 + 50, -cardH / 2 + 195, cardW / 2 - 50, -cardH / 2 + 195);

    this.slideBody.setText(slide.text.join('\n'));

    // Update pagination dots
    this.dots.forEach((dot, idx) => {
      dot.setFillStyle(idx === index ? slide.tintColor : 0x1e3a8a, idx === index ? 1 : 0.6);
      dot.setScale(idx === index ? 1.4 : 1.0);
    });

    // Update deploy button label on final slide
    if (index === 3) {
      this.btnDeploy.buttonText.setText('COMMENCE MISSION [ENTER] ►');
    } else {
      this.btnDeploy.buttonText.setText('NEXT DIRECTIVE [ENTER] ►');
    }

    // Small slide fade animation
    this.slideBody.setAlpha(0);
    this.slideTitle.setAlpha(0);
    this.tweens.add({
      targets: [this.slideTitle, this.slideBody],
      alpha: 1,
      duration: 250,
      ease: 'Quad.easeOut'
    });
  }

  goToSlide(index) {
    if (this.isTransitioning || index === this.currentSlide) return;
    audioManager.play('uiClick');
    this.renderSlide(index);
    this.scheduleAutoAdvance();
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      audioManager.play('uiClick');
      this.renderSlide(this.currentSlide + 1);
      this.scheduleAutoAdvance();
    } else {
      this.startGameplay();
    }
  }

  scheduleAutoAdvance() {
    if (this.slideTimer) {
      this.slideTimer.remove();
    }
    this.slideTimer = this.time.delayedCall(4200, () => {
      if (this.currentSlide < this.slides.length - 1) {
        this.nextSlide();
      }
    });
  }

  startGameplay() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    audioManager.play('uiClick');

    if (this.slideTimer) {
      this.slideTimer.remove();
      this.slideTimer = null;
    }

    this.cameras.main.fadeOut(350, 0, 240, 255);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('FoundationTestScene');
    });
  }

  createActionButton(x, y, label, bgColor, textColor, callback) {
    const btnWidth = 270;
    const btnHeight = 42;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(1.5, 0x00f0ff, 0.8);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: textColor,
      letterSpacing: 1
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.buttonText = text;
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      container.setScale(1.03);
      audioManager.play('uiHover');
    });
    container.on('pointerout', () => container.setScale(1.0));
    container.on('pointerdown', callback);

    return container;
  }

  createAudioBadge(x, y) {
    const container = this.add.container(x, y).setDepth(30);
    const bg = this.add.graphics();

    const updateGfx = (isMuted) => {
      bg.clear();
      bg.fillStyle(0x071126, 0.85);
      bg.fillRoundedRect(-55, -14, 110, 28, 4);
      bg.lineStyle(1.2, isMuted ? 0xef4444 : 0x00f0ff, 0.8);
      bg.strokeRoundedRect(-55, -14, 110, 28, 4);
    };
    updateGfx(audioManager.isMuted);

    const text = this.add.text(0, 0, audioManager.isMuted ? '[M] MUTED' : '[M] AUDIO ON', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: audioManager.isMuted ? '#ef4444' : '#00f0ff',
      letterSpacing: 1
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(110, 28);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      const isMuted = audioManager.toggleMute();
      updateGfx(isMuted);
      text.setText(isMuted ? '[M] MUTED' : '[M] AUDIO ON');
      text.setColor(isMuted ? '#ef4444' : '#00f0ff');
      audioManager.play('uiClick');
    });

    return container;
  }

  setupKeyboard() {
    this.input.keyboard.on('keydown-ENTER', () => {
      this.nextSlide();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.nextSlide();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.startGameplay();
    });

    this.input.keyboard.on('keydown-M', () => {
      audioManager.toggleMute();
      audioManager.play('uiClick');
    });
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;
    if (this.bgSky) this.bgSky.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    if (this.bgMatte) this.bgMatte.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    if (this.bgClouds) this.bgClouds.setPosition(width / 2, height * 0.75).setSize(width, 280);
    if (this.overlay) this.overlay.setPosition(width / 2, height / 2).setSize(width, height);
    if (this.cardContainer) this.cardContainer.setPosition(width / 2, height / 2);
    if (this.audioBadge) this.audioBadge.setPosition(width - 80, 36);
  }

  cleanup() {
    this.scale.off('resize', this.handleResize, this);
    if (this.slideTimer) this.slideTimer.remove();
    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown-ENTER');
      this.input.keyboard.off('keydown-SPACE');
      this.input.keyboard.off('keydown-ESC');
      this.input.keyboard.off('keydown-M');
    }
  }
}
