import Phaser from 'phaser';
import { settingsManager } from '../systems/SettingsManager.js';
import { audioManager } from '../systems/AudioManager.js';

/**
 * CHRONO SHIFT — AAA Cinematic Opening Interface
 * Visual Direction: Bright futuristic floating metropolis (Aethelon City, 2189)
 * Balanced 2-Column Composition:
 * - Left: Futuristic typography title, tagline, interactive sci-fi buttons, nav controls
 * - Right: Floating white/silver platform with 2.2x reference-matched runner Kael Veyron,
 *          idle breathing animation, Chrono Gauntlet energy vortex, and tactical status HUD.
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Start background audio upon initial user gesture (compliant with Web Audio autoplay)
    this.input.once('pointerdown', () => audioManager.startMusic());
    this.input.keyboard.once('keydown', () => audioManager.startMusic());

    this.activeModal = null;
    this.selectedIndex = 0;
    this.buttons = [];
    this.isActionLocked = false;
    this.introComplete = false;
    this.introTweens = [];
    this.trafficCruisers = [];
    this.shards = [];
    this.dustParticles = [];

    // ==========================================
    // 1. BRIGHT FUTURISTIC CITY PARALLAX LAYERS
    // ==========================================

    // Layer 0: Fullscreen daylight azure-to-white sky gradient
    this.bgSky = this.add.image(width / 2, height / 2, 'bg_sky_gradient')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Layer 1: High-res Aethelon City matte painting (soft ambient blend)
    if (this.textures.exists('bg_aethelon_city')) {
      this.bgMatte = this.add.image(width / 2, height / 2, 'bg_aethelon_city')
        .setDisplaySize(width, height)
        .setAlpha(0.62)
        .setDepth(1);
    }

    // Layer 2: Distant white spires & skyline
    this.bgSkyline = this.add.tileSprite(width / 2, height * 0.58, width, 400, 'bg_distant_skyline')
      .setAlpha(0.65)
      .setDepth(2);

    // Layer 3: Skyway transit traffic cruisers
    this.createSkywayTraffic(width, height);

    // Layer 4: Midground floating white architecture & overpass
    this.bgCity = this.add.tileSprite(width / 2, height * 0.65, width, 450, 'bg_midground_city')
      .setAlpha(0.85)
      .setDepth(4);

    // Layer 5: Distant cumulus cloud deck
    this.bgCloudsBack = this.add.tileSprite(width / 2, height * 0.76, width, 280, 'cloud_bank_layer')
      .setAlpha(0.7)
      .setDepth(5);

    // Layer 6: Floating temporal crystal shards
    this.createFloatingShards(width, height);

    // Layer 7: Subtle environmental temporal motes
    this.createTemporalMotes(width, height);

    // ==========================================
    // 2. RIGHT COLUMN — HERO PRESENTATION (KAEL VEYRON)
    // ==========================================
    this.createHeroPresentation(width, height);

    // ==========================================
    // 3. LEFT COLUMN — TITLE & BRAND IDENTITY
    // ==========================================
    this.createTitleComposition(width, height);

    // ==========================================
    // 4. LEFT COLUMN — INTERACTIVE SCI-FI MENU BUTTONS
    // ==========================================
    this.createMenuButtons(width, height);

    // ==========================================
    // 5. HUD BADGES & NAVIGATION HINTS
    // ==========================================
    this.createHudElements(width, height);

    // ==========================================
    // 6. CINEMATIC INTRO SEQUENCE & SKIP LISTENER
    // ==========================================
    this.setupCinematicIntro(width, height);

    // ==========================================
    // 7. INPUT & LIFECYCLE MANAGEMENT
    // ==========================================
    this.setupKeyboardInput();

    // Responsive resize handler
    this.scale.on('resize', this.handleResize, this);

    // Cleanup on scene shutdown
    this.events.on('shutdown', this.cleanup, this);
  }

  update(time, delta) {
    const isReduced = settingsManager.get('reducedMotion');
    if (!isReduced) {
      // Parallax drifting
      if (this.bgSkyline) this.bgSkyline.tilePositionX += 0.12;
      if (this.bgCity) this.bgCity.tilePositionX += 0.32;
      if (this.bgCloudsBack) this.bgCloudsBack.tilePositionX += 0.22;

      // Update cruising skyway traffic
      this.trafficCruisers.forEach(cruiser => {
        cruiser.x += cruiser.speed;
        if (cruiser.x > this.scale.width + 100) {
          cruiser.x = -100;
          cruiser.y = this.scale.height * (0.35 + Math.random() * 0.25);
        }
      });

      // Gauntlet energy pulse bob
      if (this.gauntletAura) {
        this.gauntletAura.rotation += 0.025;
      }
    }
  }

  // ==========================================
  // BACKGROUND UTILITIES
  // ==========================================

  createSkywayTraffic(width, height) {
    if (!this.textures.exists('bg_skyway_traffic')) return;

    for (let i = 0; i < 4; i++) {
      const startX = (width / 4) * i + Math.random() * 120;
      const startY = height * (0.42 + (i % 3) * 0.08);
      const cruiser = this.add.image(startX, startY, 'bg_skyway_traffic')
        .setAlpha(0.65)
        .setScale(0.9 + Math.random() * 0.3)
        .setDepth(3);
      cruiser.speed = 0.8 + Math.random() * 0.9;
      this.trafficCruisers.push(cruiser);
    }
  }

  createFloatingShards(width, height) {
    if (!this.textures.exists('geometric_shard')) return;

    for (let i = 0; i < 4; i++) {
      const shard = this.add.image(width * 0.15 + i * (width * 0.22), height * 0.25 + (i % 2) * 90, 'geometric_shard')
        .setScale(0.85 + (i % 3) * 0.25)
        .setAlpha(0.7)
        .setDepth(6);
      this.shards.push(shard);

      if (!settingsManager.get('reducedMotion')) {
        this.tweens.add({
          targets: shard,
          y: shard.y - 16,
          angle: 360,
          duration: 3800 + i * 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  createTemporalMotes(width, height) {
    if (!this.textures.exists('particle_cyan')) return;

    for (let i = 0; i < 14; i++) {
      const p = this.add.image(
        Math.random() * width,
        height * 0.3 + Math.random() * (height * 0.6),
        'particle_cyan'
      )
        .setScale(0.25 + Math.random() * 0.35)
        .setAlpha(0.2 + Math.random() * 0.4)
        .setDepth(7);

      this.dustParticles.push(p);

      if (!settingsManager.get('reducedMotion')) {
        this.tweens.add({
          targets: p,
          y: p.y - 40 - Math.random() * 30,
          x: p.x + (Math.random() * 20 - 10),
          alpha: { from: p.alpha, to: 0.1 },
          duration: 2500 + Math.random() * 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  // ==========================================
  // RIGHT COLUMN: HERO PRESENTATION
  // ==========================================

  createHeroPresentation(width, height) {
    const heroX = width > 900 ? width * 0.72 : width * 0.68;
    const heroY = height * 0.54;

    this.heroContainer = this.add.container(heroX, heroY).setDepth(20);

    // 1. Floating white/silver island platform
    if (this.textures.exists('platform_floating_small')) {
      this.heroPlatform = this.add.image(0, 85, 'platform_floating_small')
        .setScale(1.75);
      this.heroContainer.add(this.heroPlatform);
    }

    // 2. Anti-gravity downward cyan glow flare
    if (this.textures.exists('anti_grav_glow')) {
      this.heroAntiGrav = this.add.image(0, 136, 'anti_grav_glow')
        .setScale(3.2, 1.8)
        .setAlpha(0.65);
      this.heroContainer.add(this.heroAntiGrav);
    }

    // 3. Platform ground contact shadow
    const contactShadow = this.add.ellipse(0, 58, 86, 20, 0x0a192f, 0.45);
    this.heroContainer.add(contactShadow);

    // 4. Hero Runner Sprite (Kael Veyron)
    // Scale 2.2x prominent hero presence
    this.heroSprite = this.add.sprite(0, 0, 'player_idle_0')
      .setScale(2.2);

    if (this.anims.exists('player_idle')) {
      this.heroSprite.play('player_idle');
    }
    this.heroContainer.add(this.heroSprite);

    // 5. Chrono Gauntlet Radial Energy Rings (flowing on left wrist at ~ x: -16, y: -4)
    if (this.textures.exists('vfx_shockwave_ring')) {
      this.gauntletAura = this.add.image(-16, -6, 'vfx_shockwave_ring')
        .setScale(0.24)
        .setAlpha(0.7)
        .setTint(0x00f0ff);
      this.heroContainer.add(this.gauntletAura);

      this.tweens.add({
        targets: this.gauntletAura,
        scale: { from: 0.18, to: 0.32 },
        alpha: { from: 0.8, to: 0.25 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 6. Chronal Afterimage Pulse (subtle dash wake ghost)
    if (!settingsManager.get('reducedMotion')) {
      this.time.addEvent({
        delay: 2400,
        loop: true,
        callback: () => {
          if (!this.heroSprite || !this.scene.isActive()) return;
          const ghost = this.add.sprite(this.heroContainer.x, this.heroContainer.y, this.heroSprite.texture.key)
            .setScale(2.2)
            .setAlpha(0.4)
            .setTint(0x00f0ff)
            .setDepth(19);

          this.tweens.add({
            targets: ghost,
            x: ghost.x - 28,
            alpha: 0,
            duration: 650,
            ease: 'Quad.easeOut',
            onComplete: () => ghost.destroy()
          });
        }
      });
    }

    // 7. Tactical Operative HUD Bracket
    const hudFrame = this.add.graphics();
    hudFrame.lineStyle(1.5, 0x00f0ff, 0.7);
    hudFrame.strokeRoundedRect(-140, 108, 280, 52, 4);
    hudFrame.fillStyle(0x071126, 0.75);
    hudFrame.fillRoundedRect(-140, 108, 280, 52, 4);

    const hudText1 = this.add.text(0, 122, 'OPERATIVE: KAEL VEYRON // PROTOCOL 2189', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#00f0ff',
      letterSpacing: 2
    }).setOrigin(0.5);

    const hudText2 = this.add.text(0, 142, 'SUIT: MK-IV AETHELON  •  CHRONO MATRIX: SYNCHRONIZED', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '11px',
      color: '#94a3b8',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.heroContainer.add([hudFrame, hudText1, hudText2]);

    // Floating breathing bob for platform & hero
    if (!settingsManager.get('reducedMotion')) {
      this.tweens.add({
        targets: this.heroContainer,
        y: heroY - 10,
        duration: 2800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  // ==========================================
  // LEFT COLUMN: TITLE & IDENTITY
  // ==========================================

  createTitleComposition(width, height) {
    const titleX = width > 900 ? width * 0.28 : width / 2;
    const titleY = height * 0.22;

    this.titleContainer = this.add.container(titleX, titleY).setDepth(25);

    // Sector & Event Meta Badge
    this.badgeText = this.add.text(0, -68, '// PROTOCOL 2189 // SECTOR AETHELON // PIXELFORGE', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '13px',
      fontWeight: '700',
      color: '#00f0ff',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Decorative hairline technical bracket top
    const topBracket = this.add.graphics();
    topBracket.lineStyle(1.5, 0x00f0ff, 0.7);
    topBracket.lineBetween(-220, -50, 220, -50);
    topBracket.fillStyle(0x00f0ff, 1);
    topBracket.fillCircle(-220, -50, 3);
    topBracket.fillCircle(220, -50, 3);

    // Primary Title: CHRONO SHIFT
    this.titleMain = this.add.text(0, -5, 'CHRONO', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '56px',
      fontStyle: '900',
      color: '#ffffff',
      letterSpacing: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#00f0ff', blur: 18, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.titleSub = this.add.text(0, 48, 'SHIFT', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '56px',
      fontStyle: '900',
      color: '#00f0ff',
      letterSpacing: 14,
      shadow: { offsetX: 0, offsetY: 0, color: '#38bdf8', blur: 20, stroke: true, fill: true }
    }).setOrigin(0.5);

    // Cyan glowing horizontal accent line
    const dividerLine = this.add.graphics();
    dividerLine.lineStyle(2, 0x00f0ff, 0.9);
    dividerLine.lineBetween(-220, 88, 220, 88);
    dividerLine.fillStyle(0xa855f7, 1);
    dividerLine.fillCircle(0, 88, 4.5);

    // Tagline: BEND TIME. DEFY FATE.
    this.taglineText = this.add.text(0, 114, 'BEND TIME. DEFY FATE.', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '22px',
      fontStyle: 'italic',
      fontWeight: '700',
      color: '#e0f2fe',
      letterSpacing: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#00f0ff', blur: 10, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.titleContainer.add([topBracket, this.badgeText, this.titleMain, this.titleSub, dividerLine, this.taglineText]);
  }

  // ==========================================
  // LEFT COLUMN: MENU BUTTONS
  // ==========================================

  createMenuButtons(width, height) {
    const btnX = width > 900 ? width * 0.28 : width / 2;
    const startY = height * 0.52;
    const spacing = 58;

    this.buttonContainer = this.add.container(btnX, startY).setDepth(30);

    const menuItems = [
      { id: 'start', label: 'START GAME', isPrimary: true, action: () => this.handleStartGame() },
      { id: 'howto', label: 'HOW TO PLAY', isPrimary: false, action: () => this.openHowToPlayModal() },
      { id: 'settings', label: 'SETTINGS', isPrimary: false, action: () => this.openSettingsModal() },
      { id: 'credits', label: 'CREDITS', isPrimary: false, action: () => this.openCreditsModal() }
    ];

    menuItems.forEach((item, index) => {
      const btn = this.createMenuButton(0, index * spacing, item, index);
      this.buttonContainer.add(btn.container);
      this.buttons.push(btn);
    });

    // Default focus on primary button
    this.updateButtonFocus();
  }

  createMenuButton(x, y, item, index) {
    const btnWidth = item.isPrimary ? 350 : 320;
    const btnHeight = 46;

    const container = this.add.container(x, y);

    const bgGfx = this.add.graphics();
    const borderGfx = this.add.graphics();

    const indicator = this.add.text(-btnWidth / 2 + 24, 0, item.isPrimary ? '►' : '•', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: item.isPrimary ? '#00f0ff' : '#64748b'
    }).setOrigin(0.5);

    const labelText = this.add.text(item.isPrimary ? 12 : 0, 0, item.label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: item.isPrimary ? '16px' : '14px',
      fontStyle: 'bold',
      color: item.isPrimary ? '#ffffff' : '#cbd5e1',
      letterSpacing: 3
    }).setOrigin(0.5);

    container.add([bgGfx, borderGfx, indicator, labelText]);
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    const redraw = (state) => {
      bgGfx.clear();
      borderGfx.clear();

      if (state === 'focused') {
        // High-contrast frosted glass cyan focus
        bgGfx.fillStyle(item.isPrimary ? 0x00f0ff : 0x0f2347, item.isPrimary ? 0.35 : 0.85);
        bgGfx.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        borderGfx.lineStyle(2, 0x00f0ff, 1);
        borderGfx.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        labelText.setColor('#ffffff');
        indicator.setColor('#00f0ff');
        indicator.setText('►');
      } else if (state === 'pressed') {
        bgGfx.fillStyle(0x00f0ff, 0.5);
        bgGfx.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      } else {
        // Normal light sci-fi translucent surface
        bgGfx.fillStyle(item.isPrimary ? 0x071126 : 0x050c1e, 0.82);
        bgGfx.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        borderGfx.lineStyle(1.5, item.isPrimary ? 0x00f0ff : 0x1e3a8a, item.isPrimary ? 0.8 : 0.6);
        borderGfx.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

        labelText.setColor(item.isPrimary ? '#00f0ff' : '#94a3b8');
        indicator.setColor(item.isPrimary ? '#00f0ff' : '#475569');
        indicator.setText(item.isPrimary ? '►' : '•');
      }
    };

    redraw('normal');

    container.on('pointerover', () => {
      if (this.activeModal || !this.introComplete) return;
      if (this.selectedIndex !== index) {
        this.selectedIndex = index;
        this.updateButtonFocus();
        audioManager.play('uiHover');
      }
    });

    container.on('pointerdown', () => {
      if (this.activeModal || this.isActionLocked || !this.introComplete) return;
      redraw('pressed');
      this.triggerButtonAction(index);
    });

    return { container, item, redraw, btnWidth, btnHeight };
  }

  updateButtonFocus() {
    this.buttons.forEach((btn, idx) => {
      const isFocused = idx === this.selectedIndex;
      btn.redraw(isFocused ? 'focused' : 'normal');
      btn.container.setScale(isFocused ? 1.03 : 1.0);
    });
  }

  // ==========================================
  // HUD ELEMENTS & AUDIO BADGE
  // ==========================================

  createHudElements(width, height) {
    // Bottom-center navigation hint bar
    this.navHint = this.add.text(width / 2, height - 32, '[ ↑ / ↓ or W / S ] Navigate   •   [ ENTER / Space ] Select   •   [ ESC ] Back   •   [ M ] Audio Mute', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(25);

    // Top-right persistent audio badge
    this.audioBadge = this.createAudioBadge(width - 80, 36);

    // Skip intro notification badge (active during intro)
    this.skipHint = this.add.text(width - 150, height - 32, '[ CLICK OR ANY KEY TO SKIP ]', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '13px',
      color: '#00f0ff',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(35);

    this.tweens.add({
      targets: this.skipHint,
      alpha: { from: 0.9, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
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
      this.updateAudioBadge(isMuted);
      audioManager.play('uiClick');
    });

    this.audioBadgeGfx = bg;
    this.audioBadgeText = text;
    this.updateAudioBadgeGfx = updateGfx;
    return container;
  }

  updateAudioBadge(isMuted) {
    if (!this.audioBadgeText) return;
    this.updateAudioBadgeGfx(isMuted);
    this.audioBadgeText.setText(isMuted ? '[M] MUTED' : '[M] AUDIO ON');
    this.audioBadgeText.setColor(isMuted ? '#ef4444' : '#00f0ff');
  }

  // ==========================================
  // CINEMATIC INTRO SEQUENCE & SKIP
  // ==========================================

  setupCinematicIntro(width, height) {
    // If reduced motion is requested, immediately present complete interface
    if (settingsManager.get('reducedMotion')) {
      this.skipIntro();
      return;
    }

    // Set initial intro alpha states
    this.titleContainer.setAlpha(0);
    this.titleContainer.x -= 40;

    this.heroContainer.setAlpha(0);
    this.heroContainer.y += 40;

    this.buttonContainer.setAlpha(0);
    this.buttons.forEach(b => {
      b.container.setAlpha(0);
      b.container.x -= 30;
    });

    // 1. Title fade and slide into position
    const tTween = this.tweens.add({
      targets: this.titleContainer,
      alpha: 1,
      x: width > 900 ? width * 0.28 : width / 2,
      duration: 650,
      ease: 'Cubic.easeOut',
      delay: 200
    });
    this.introTweens.push(tTween);

    // 2. Hero Runner materialization
    const hTween = this.tweens.add({
      targets: this.heroContainer,
      alpha: 1,
      y: height * 0.54,
      duration: 700,
      ease: 'Back.easeOut',
      delay: 450
    });
    this.introTweens.push(hTween);

    // 3. Staggered button cascade
    this.buttonContainer.setAlpha(1);
    this.buttons.forEach((btn, idx) => {
      const bTween = this.tweens.add({
        targets: btn.container,
        alpha: 1,
        x: 0,
        duration: 450,
        ease: 'Back.easeOut',
        delay: 650 + idx * 100
      });
      this.introTweens.push(bTween);
    });

    // Complete intro event
    this.introTimer = this.time.delayedCall(1250, () => {
      this.completeIntro();
    });

    // Skip handler: click or keypress during intro skips to complete interface
    this.skipHandlerPointer = () => {
      if (!this.introComplete) this.skipIntro();
    };
    this.skipHandlerKey = () => {
      if (!this.introComplete) this.skipIntro();
    };

    this.input.once('pointerdown', this.skipHandlerPointer);
    this.input.keyboard.once('keydown', this.skipHandlerKey);
  }

  skipIntro() {
    if (this.introComplete) return;

    // Kill active intro tweens
    this.introTweens.forEach(t => {
      if (t && t.isPlaying()) t.stop();
    });
    this.introTweens = [];

    if (this.introTimer) {
      this.introTimer.remove();
      this.introTimer = null;
    }

    const { width, height } = this.scale;
    // Set final resting states
    this.titleContainer.setAlpha(1);
    this.titleContainer.x = width > 900 ? width * 0.28 : width / 2;

    this.heroContainer.setAlpha(1);
    this.heroContainer.y = height * 0.54;

    this.buttonContainer.setAlpha(1);
    this.buttons.forEach(btn => {
      btn.container.setAlpha(1);
      btn.container.x = 0;
    });

    this.completeIntro();
  }

  completeIntro() {
    this.introComplete = true;
    if (this.skipHint) {
      this.skipHint.destroy();
      this.skipHint = null;
    }
    this.updateButtonFocus();
  }

  // ==========================================
  // KEYBOARD NAVIGATION
  // ==========================================

  setupKeyboardInput() {
    this.input.keyboard.on('keydown-UP', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-W', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.navigateMenu(1));
    this.input.keyboard.on('keydown-S', () => this.navigateMenu(1));

    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.activeModal) return;
      if (!this.introComplete) {
        this.skipIntro();
        return;
      }
      this.triggerButtonAction(this.selectedIndex);
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.activeModal) return;
      if (!this.introComplete) {
        this.skipIntro();
        return;
      }
      this.triggerButtonAction(this.selectedIndex);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.activeModal) {
        audioManager.play('uiClick');
        this.closeModal();
      }
    });

    this.input.keyboard.on('keydown-M', () => {
      const isMuted = audioManager.toggleMute();
      this.updateAudioBadge(isMuted);
      audioManager.play('uiClick');
    });
  }

  navigateMenu(delta) {
    if (this.activeModal || !this.introComplete) return;
    this.selectedIndex = (this.selectedIndex + delta + this.buttons.length) % this.buttons.length;
    this.updateButtonFocus();
    audioManager.play('uiHover');
  }

  triggerButtonAction(index) {
    if (this.isActionLocked) return;
    this.isActionLocked = true;
    audioManager.play('uiClick');
    this.time.delayedCall(200, () => {
      this.isActionLocked = false;
    });

    const target = this.buttons[index];
    if (target && target.item && target.item.action) {
      target.item.action();
    }
  }

  handleStartGame() {
    // Smooth cinematic transition to BriefingScene
    this.cameras.main.fadeOut(300, 0, 240, 255);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BriefingScene');
    });
  }

  // ==========================================
  // MODAL DIALOG OVERLAYS
  // ==========================================

  createModalBase(titleText, modalWidth = 840, modalHeight = 490) {
    if (this.activeModal) {
      this.closeModal();
    }

    const { width, height } = this.scale;
    const modalContainer = this.add.container(0, 0).setDepth(60);

    // Translucent dark backdrop
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.88);
    overlay.setInteractive(); // Block click-through to underlying menu

    // Modal frame
    const boxX = width / 2;
    const boxY = height / 2;
    const boxGfx = this.add.graphics();
    boxGfx.fillStyle(0x071126, 0.96);
    boxGfx.fillRoundedRect(boxX - modalWidth / 2, boxY - modalHeight / 2, modalWidth, modalHeight, 8);
    boxGfx.lineStyle(2, 0x00f0ff, 0.85);
    boxGfx.strokeRoundedRect(boxX - modalWidth / 2, boxY - modalHeight / 2, modalWidth, modalHeight, 8);

    // Header Title
    const header = this.add.text(boxX, boxY - modalHeight / 2 + 36, titleText, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Accent line divider
    const divider = this.add.graphics();
    divider.lineStyle(1.5, 0x1e3a8a, 0.9);
    divider.lineBetween(boxX - modalWidth / 2 + 30, boxY - modalHeight / 2 + 64, boxX + modalWidth / 2 - 30, boxY - modalHeight / 2 + 64);

    // Close Button [ESC]
    const closeBtn = this.add.container(boxX, boxY + modalHeight / 2 - 38);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x1e293b, 0.9);
    closeBg.fillRoundedRect(-120, -18, 240, 36, 4);
    closeBg.lineStyle(1.5, 0x38bdf8, 0.8);
    closeBg.strokeRoundedRect(-120, -18, 240, 36, 4);

    const closeText = this.add.text(0, 0, 'CLOSE [ESC]', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#e2e8f0',
      letterSpacing: 2
    }).setOrigin(0.5);

    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(240, 36);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      audioManager.play('uiClick');
      this.closeModal();
    });
    closeBtn.on('pointerover', () => {
      closeBtn.setScale(1.04);
      audioManager.play('uiHover');
    });
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

  // --- 1. HOW TO PLAY MODAL ---
  openHowToPlayModal() {
    const { container, boxX, boxY, modalWidth, modalHeight } = this.createModalBase('HOW TO PLAY // OPERATIVE CONTROLS', 880, 500);

    const sections = [
      {
        title: 'TACTICAL LOCOMOTION',
        color: '#38bdf8',
        y: boxY - modalHeight / 2 + 82,
        items: [
          '• [ A / D ] or [ ← / → ] : Sprint laterally across elevated platforms',
          '• [ SPACE ] or [ W ] or [ ↑ ] : Altitude jump across hazardous voids & pits',
          '• [ S ] or [ ↓ ] : Low-profile crouch slide beneath overhead laser emitters'
        ]
      },
      {
        title: 'CHRONO GAUNTLET SIGNATURE ABILITIES',
        color: '#c084fc',
        y: boxY - modalHeight / 2 + 184,
        items: [
          '• [ Q ] Chrono Freeze (Cost: 35 NRG) — Pauses rotating blades, lasers & plasma projectiles for 2.0s',
          '• [ E / SHIFT ] Chrono Dash (Cost: 25 NRG) — High-velocity burst with invulnerability frames'
        ]
      },
      {
        title: 'MISSION OPERATIONS & DIRECTIVES',
        color: '#f59e0b',
        y: boxY - modalHeight / 2 + 286,
        items: [
          '• [ P / ESC ] Pause & Live Settings  •  [ R ] Quick Checkpoint Respawn  •  [ M ] Audio Mute',
          '• Recover the 3 Chrono Core Fragments (α, β, γ) to stabilize the temporal matrix',
          '• Reach Sector D, calibrate Pylons α & β, and Press [F] or Dash [E] to restore the Chrono Core!'
        ]
      }
    ];

    sections.forEach(s => {
      const title = this.add.text(boxX - modalWidth / 2 + 40, s.y, s.title, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: s.color,
        letterSpacing: 2
      });
      container.add(title);

      s.items.forEach((txt, idx) => {
        const line = this.add.text(boxX - modalWidth / 2 + 45, s.y + 24 + idx * 21, txt, {
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          color: '#e2e8f0',
          letterSpacing: 0.5
        });
        container.add(line);
      });
    });
  }

  // --- 2. SETTINGS MODAL ---
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
          fontWeight: '700',
          color: '#00f0ff'
        }).setOrigin(0.5);
        container.add(valText);

        // Minus button
        const minusBtn = this.createSettingIconButton(boxX + 70, rowY, '−', () => {
          const current = settingsManager.get(item.key);
          const next = Math.max(item.min, current - item.step);
          settingsManager.set(item.key, next);
          valText.setText(`${next}%`);
          audioManager.play('uiClick');
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
          audioManager.play('uiClick');
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
          audioManager.play('uiClick');
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
          fontWeight: 'bold',
          color: '#38bdf8'
        }).setOrigin(0.5);

        actBtn.add([actBg, actText]);
        actBtn.setSize(180, 32);
        actBtn.setInteractive({ useHandCursor: true });
        actBtn.on('pointerdown', () => {
          audioManager.play('uiClick');
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
    bg.fillStyle(0x1e293b, 0.85);
    bg.fillRoundedRect(-16, -14, 32, 28, 4);
    bg.lineStyle(1.5, 0x00f0ff, 0.6);
    bg.strokeRoundedRect(-16, -14, 32, 28, 4);

    const txt = this.add.text(0, 0, char, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setSize(32, 28);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', callback);
    btn.on('pointerover', () => {
      btn.setScale(1.1);
      audioManager.play('uiHover');
    });
    btn.on('pointerout', () => btn.setScale(1.0));
    return btn;
  }

  // --- 3. CREDITS MODAL ---
  openCreditsModal() {
    const { container, boxX, boxY, modalWidth, modalHeight } = this.createModalBase('TRANSMISSION ARCHIVE // CREDITS', 820, 510);

    const creditLines = [
      { header: 'DEVELOPMENT TEAM & INSTITUTION', content: 'PixelForge  •  Holy Mary Institute of Technology and Science, Hyderabad' },
      { header: 'TEAM MEMBERS', content: 'Kavali Arun (Lead)  •  Gottipamula Karthik  •  Hemanth Kumar Kuppannagari  •  Paltyavath Renuka' },
      { header: 'GAME JAM EVENT & THEME', content: 'RESPAWN — 2D Game Jam, Pravrutti 2.0  •  Theme: SCI-FI' },
      { header: 'PROTAGONIST & TIMELINE', content: 'Operative Kael Veyron (MK-IV Suit & Chrono Gauntlet)  •  Aethelon City, Year 2189' },
      { header: 'CORE ENGINE & RUNTIME', content: 'Phaser 3 (v3.88.2) — Photon Storm Ltd. [MIT License]' },
      { header: 'BUILD SYSTEM & COMPILER', content: 'Vite (v6.2.0) & JavaScript ES Modules [MIT License]' },
      { header: 'TYPOGRAPHY & AESTHETICS', content: 'Orbitron & Rajdhani — Google Fonts [SIL Open Font License]' },
      { header: 'GRAPHICS & AUDIO SYSTEMS', content: '100% Procedural Vector Synthesis & Web Audio API Engine' }
    ];

    const startY = boxY - modalHeight / 2 + 78;
    creditLines.forEach((c, idx) => {
      const curY = startY + idx * 49;

      const hdr = this.add.text(boxX, curY, c.header, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#38bdf8',
        letterSpacing: 2
      }).setOrigin(0.5);

      const cnt = this.add.text(boxX, curY + 17, c.content, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        color: '#e2e8f0',
        letterSpacing: 0.5
      }).setOrigin(0.5);

      container.add([hdr, cnt]);
    });
  }

  // ==========================================
  // RESPONSIVE RESIZE HANDLING
  // ==========================================

  handleResize(gameSize) {
    const { width, height } = gameSize;

    // Background coverage
    if (this.bgSky) this.bgSky.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    if (this.bgMatte) this.bgMatte.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    if (this.bgSkyline) this.bgSkyline.setPosition(width / 2, height * 0.58).setSize(width, 400);
    if (this.bgCity) this.bgCity.setPosition(width / 2, height * 0.65).setSize(width, 450);
    if (this.bgCloudsBack) this.bgCloudsBack.setPosition(width / 2, height * 0.76).setSize(width, 280);

    // 2-Column Responsive Layout
    const titleX = width > 900 ? width * 0.28 : width / 2;
    const heroX = width > 900 ? width * 0.72 : width * 0.68;

    if (this.titleContainer) {
      this.titleContainer.setPosition(titleX, height * 0.22);
    }

    if (this.buttonContainer) {
      this.buttonContainer.setPosition(titleX, height * 0.52);
    }

    if (this.heroContainer) {
      this.heroContainer.setPosition(heroX, height * 0.54);
    }

    if (this.audioBadge) {
      this.audioBadge.setPosition(width - 80, 36);
    }

    if (this.navHint) {
      this.navHint.setPosition(width / 2, height - 32);
    }

    if (this.skipHint) {
      this.skipHint.setPosition(width - 150, height - 32);
    }

    // Reposition active modal if open
    if (this.activeModal) {
      this.closeModal();
    }
  }

  // ==========================================
  // CLEANUP & LIFECYCLE
  // ==========================================

  cleanup() {
    this.scale.off('resize', this.handleResize, this);

    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown-UP');
      this.input.keyboard.off('keydown-W');
      this.input.keyboard.off('keydown-DOWN');
      this.input.keyboard.off('keydown-S');
      this.input.keyboard.off('keydown-ENTER');
      this.input.keyboard.off('keydown-SPACE');
      this.input.keyboard.off('keydown-ESC');
      this.input.keyboard.off('keydown-M');
    }

    this.introTweens.forEach(t => {
      if (t) t.stop();
    });
    this.introTweens = [];
  }
}
