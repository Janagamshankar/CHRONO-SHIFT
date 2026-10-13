/**
 * CHRONO SHIFT — Procedural High-Fidelity Character Sprite Generator
 * Operative: Kael Veyron (Reference-Matched Sci-Fi Runner)
 * 
 * Generates an authoritative multi-frame animated sprite suite:
 * - 'player_run_0' through 'player_run_5' (6-frame athletic sprint cycle)
 * - 'player_idle_0', 'player_idle_1' (2-frame ready stance with breathing bob)
 * - 'player_jump' (airborne ascent with tucked legs and thruster plumes)
 * - 'player_fall' (airborne descent with outstretched stabilizing limbs)
 * - 'player_slide' (low-profile crouch slide with spark trail)
 * - 'player_dash' (hyper-aerodynamic torpedo lunge with chronal cone)
 * 
 * Anchors & Hitboxes:
 * - Canvas size: 64x64 (slide: 64x48)
 * - Ground contact: y = 58
 * - Physical hitbox: 24x46, offset (20, 12) -> spans y: 12..58
 */

export class PlayerSpriteGenerator {
  static generateAll(scene) {
    // 1. Generate 6 Running Frames
    for (let f = 0; f < 6; f++) {
      this.generateRunFrame(scene, `player_run_${f}`, f);
    }

    // 2. Generate 2 Idle Frames
    this.generateIdleFrame(scene, 'player_idle_0', 0);
    this.generateIdleFrame(scene, 'player_idle_1', 1);

    // 3. Generate Jump & Fall Frames
    this.generateJumpFrame(scene, 'player_jump');
    this.generateFallFrame(scene, 'player_fall');

    // 4. Generate Slide Frame
    this.generateSlideFrame(scene, 'player_slide');

    // 5. Generate Dash Frame
    this.generateDashFrame(scene, 'player_dash');

    // 6. Aliases for legacy code backwards compatibility
    if (scene.textures.exists('player_run_0')) {
      scene.textures.addCanvas('player_avatar', scene.textures.get('player_run_0').getSourceImage());
    }
    if (scene.textures.exists('player_jump')) {
      scene.textures.addCanvas('player_avatar_jump', scene.textures.get('player_jump').getSourceImage());
    }
    if (scene.textures.exists('player_slide')) {
      scene.textures.addCanvas('player_avatar_slide', scene.textures.get('player_slide').getSourceImage());
    }

    // 7. Register Phaser Animations
    if (!scene.anims.exists('player_run')) {
      scene.anims.create({
        key: 'player_run',
        frames: [
          { key: 'player_run_0' },
          { key: 'player_run_1' },
          { key: 'player_run_2' },
          { key: 'player_run_3' },
          { key: 'player_run_4' },
          { key: 'player_run_5' }
        ],
        frameRate: 12,
        repeat: -1
      });
    }

    if (!scene.anims.exists('player_idle')) {
      scene.anims.create({
        key: 'player_idle',
        frames: [
          { key: 'player_idle_0' },
          { key: 'player_idle_1' }
        ],
        frameRate: 3,
        repeat: -1
      });
    }

    if (!scene.anims.exists('player_jump')) {
      scene.anims.create({
        key: 'player_jump',
        frames: [{ key: 'player_jump' }],
        frameRate: 1
      });
    }

    if (!scene.anims.exists('player_fall')) {
      scene.anims.create({
        key: 'player_fall',
        frames: [{ key: 'player_fall' }],
        frameRate: 1
      });
    }

    if (!scene.anims.exists('player_slide')) {
      scene.anims.create({
        key: 'player_slide',
        frames: [{ key: 'player_slide' }],
        frameRate: 1
      });
    }

    if (!scene.anims.exists('player_dash')) {
      scene.anims.create({
        key: 'player_dash',
        frames: [{ key: 'player_dash' }],
        frameRate: 1
      });
    }
  }

  // ==========================================
  // HELPER DRAWING PRIMITIVES
  // ==========================================

  /**
   * Draws aerodynamic white/silver sci-fi helmet with glowing cyan visor
   */
  static drawHelmet(ctx, x, y, angle = 0, isJumping = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Subtle cyan rim-glow / chronal aura
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 4;

    // Outer helmet shell (swept aerodynamic form)
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.quadraticCurveTo(5, -10, 8, -4);
    ctx.lineTo(8, 2);
    ctx.quadraticCurveTo(6, 6, 2, 7);
    ctx.lineTo(-4, 7);
    ctx.quadraticCurveTo(-8, 5, -8, 0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(-6, -10, 8, 7);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.6, '#f1f5f9');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fill();

    // Dark graphite neck base
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, 6, 6, 3);

    // Silver crest plate along top ridge
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.lineTo(5, -9);
    ctx.lineTo(6, -6);
    ctx.lineTo(-4, -5);
    ctx.closePath();
    ctx.fill();

    // Glowing Cyan Visor Slit (Reference Signature: sharp forward-slanted visor)
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(1, -2);
    ctx.lineTo(8, -1);
    ctx.lineTo(7, 2);
    ctx.lineTo(0, 1);
    ctx.closePath();
    ctx.fill();

    // Visor specular core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, -1, 4, 1.5);

    // Cheek bevel / comm antenna accent
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6, 0, 2, 4);

    ctx.restore();
  }

  /**
   * Draws armored torso with chestplate, arc reactor, and ab segments
   */
  static drawTorso(ctx, x, y, angle = 0, breatheY = 0) {
    ctx.save();
    ctx.translate(x, y + breatheY);
    ctx.rotate(angle);

    // Dark flexible undersuit base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -8, 12, 17);

    // Front Chestplate (White & Silver sculpted plates)
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(7, -8);
    ctx.lineTo(6, 1);
    ctx.lineTo(-6, 1);
    ctx.closePath();
    const chestGrad = ctx.createLinearGradient(-7, -8, 7, 1);
    chestGrad.addColorStop(0, '#ffffff');
    chestGrad.addColorStop(0.7, '#f8fafc');
    chestGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = chestGrad;
    ctx.fill();

    // Subtle edge highlight
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Glowing Cyan Arc Reactor Core (Center of chestplate)
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(1, -3.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1, -3.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Segmented Ab Plates (Silver)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-4.5, 2, 9, 2.5);
    ctx.fillRect(-4, 5.5, 8, 2.5);

    // Utility belt with cyan chronal power cells
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-5.5, 9, 11, 2.5);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-4, 9.5, 2, 1.5);
    ctx.fillRect(2, 9.5, 2, 1.5);

    ctx.restore();
  }

  /**
   * Draws forward thrust Chrono Gauntlet (Right Arm) with cyan energy rings
   */
  static drawChronoGauntletArm(ctx, shoulderX, shoulderY, armAngle, forearmAngle, gauntletPower = 1.0) {
    ctx.save();
    ctx.translate(shoulderX, shoulderY);

    // Upper Arm
    ctx.rotate(armAngle);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-2, 0, 4, 9);
    // Dark elbow joint
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, 7, 4, 3);

    // Forearm & Heavy Chrono Gauntlet
    ctx.translate(0, 8.5);
    ctx.rotate(forearmAngle);

    // Armored Gauntlet Housing (White with silver tech ridges)
    const gauntGrad = ctx.createLinearGradient(-3, 0, 5, 11);
    gauntGrad.addColorStop(0, '#ffffff');
    gauntGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gauntGrad;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(5, 10);
    ctx.lineTo(-3, 10);
    ctx.closePath();
    ctx.fill();

    // Cyan conduit rails along the gauntlet
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-1.5, 1, 1.5, 8);
    ctx.fillRect(2, 1, 1.5, 8);

    // Heavy fist / wrist emitter
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-2.5, 10, 6, 4);

    // Blazing Cyan Energy Halo / Chronal Emitter Pulse
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8 * gauntletPower;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0.5, 13, 3.5 * gauntletPower, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0.5, 13, 1.8 * gauntletPower, 0, Math.PI * 2);
    ctx.fill();

    // Radiating energy ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0.5, 13, 5.5 * gauntletPower, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /**
   * Draws rear trailing arm (Left Arm) in athletic sprint cadence
   */
  static drawRearArm(ctx, shoulderX, shoulderY, armAngle, forearmAngle) {
    ctx.save();
    ctx.translate(shoulderX, shoulderY);

    ctx.rotate(armAngle);
    // Dark shaded upper arm
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-1.8, 0, 3.6, 8.5);

    // Elbow
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1.8, 7, 3.6, 2.5);

    // Forearm
    ctx.translate(0, 8);
    ctx.rotate(forearmAngle);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-2, 0, 4, 9);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-1.5, 9, 3, 3); // Fist

    ctx.restore();
  }

  /**
   * Draws articulated armored leg with thigh plates, knee joint, and thruster boot
   */
  static drawArmoredLeg(ctx, hipX, hipY, thighAngle, shinAngle, isRear = false, thrusterFire = 0) {
    ctx.save();
    ctx.translate(hipX, hipY);

    // 1. Thigh (Cuisses)
    ctx.rotate(thighAngle);
    // Dark undersuit core
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2.5, 0, 5, 12);
    // White armored plate
    const thighGrad = ctx.createLinearGradient(-3, 0, 3, 10);
    thighGrad.addColorStop(0, isRear ? '#94a3b8' : '#ffffff');
    thighGrad.addColorStop(1, isRear ? '#64748b' : '#e2e8f0');
    ctx.fillStyle = thighGrad;
    ctx.fillRect(-3, 1, 6, 9);

    // 2. Knee Joint
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-2.5, 10, 5, 3);
    if (!isRear) {
      // White knee-cap armor
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, 10, 4, 2.5);
    }

    // 3. Shin & Greaves
    ctx.translate(0, 12);
    ctx.rotate(shinAngle);
    const shinGrad = ctx.createLinearGradient(-3, 0, 3, 11);
    shinGrad.addColorStop(0, isRear ? '#cbd5e1' : '#ffffff');
    shinGrad.addColorStop(1, isRear ? '#94a3b8' : '#cbd5e1');
    ctx.fillStyle = shinGrad;
    ctx.fillRect(-2.5, 0, 5, 11);

    // 4. Armored Sprint Boot
    ctx.fillStyle = isRear ? '#64748b' : '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-3, 10);
    ctx.lineTo(4, 10);
    ctx.lineTo(5, 14);
    ctx.lineTo(-4, 14);
    ctx.closePath();
    ctx.fill();

    // Dark graphite sole
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4.5, 14, 10, 2);

    // Cyan Kinetic Sole Thruster
    if (thrusterFire > 0) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6 * thrusterFire;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-3, 14.5, 7, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, 15, 4, 1.5);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-2, 14.5, 4, 1);
    }

    ctx.restore();
  }

  /**
   * Draws aerodynamic chronal slipstream behind the runner
   */
  static drawSpeedAura(ctx, x, y, intensity = 0.5) {
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 * intensity})`;
    ctx.lineWidth = 1.5;

    // Trailing curved slipstreams
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 10);
    ctx.quadraticCurveTo(x - 18, y - 8, x - 26, y - 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.quadraticCurveTo(x - 22, y + 2, x - 30, y + 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 4, y + 10);
    ctx.quadraticCurveTo(x - 16, y + 14, x - 24, y + 18);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // ANIMATION FRAME GENERATORS
  // ==========================================

  /**
   * Generates one of the 6 running frames
   * Ground line is y = 58
   */
  static generateRunFrame(scene, key, frameIndex) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvasTex = scene.textures.createCanvas(key, 64, 64);
    const ctx = canvasTex.context;
    ctx.clearRect(0, 0, 64, 64);

    // Frame kinematic data:
    // [torsoDip, torsoAngle, rThigh, rShin, lThigh, lShin, rArm, rForearm, lArm, lForearm, rThrust, lThrust]
    const runKeyframes = [
      // Frame 0: Right foot forward strike, Left leg extended high back
      [0, 0.28, 0.52, -0.25, -0.65, 0.85, 0.75, 0.45, -0.65, 0.35, 0.2, 0.0],
      // Frame 1: Right leg passing underneath (compression), Left leg driving forward
      [2, 0.24, 0.12, -0.15, -0.10, 0.95, 0.55, 0.50, -0.30, 0.45, 0.1, 0.0],
      // Frame 2: Right leg powerful push-off back, Left knee driving high forward (flight phase)
      [-2, 0.32, -0.75, -0.10, 0.78, 1.10, 0.85, 0.40, -0.60, 0.20, 0.9, 0.0],
      // Frame 3: Left foot forward strike, Right leg extended high back
      [0, 0.28, -0.65, 0.85, 0.52, -0.25, 0.35, 0.65, 0.60, 0.30, 0.0, 0.2],
      // Frame 4: Left leg passing underneath (compression), Right leg driving forward
      [2, 0.24, -0.10, 0.95, 0.12, -0.15, 0.50, 0.55, 0.25, 0.45, 0.0, 0.1],
      // Frame 5: Left leg powerful push-off back, Right knee driving high forward (flight phase)
      [-2, 0.32, 0.78, 1.10, -0.75, -0.10, 0.85, 0.40, -0.55, 0.25, 0.0, 0.9]
    ];

    const kf = runKeyframes[frameIndex];
    const torsoDip = kf[0];
    const torsoAngle = kf[1];
    const rThigh = kf[2];
    const rShin = kf[3];
    const lThigh = kf[4];
    const lShin = kf[5];
    const rArm = kf[6];
    const rForearm = kf[7];
    const lArm = kf[8];
    const lForearm = kf[9];
    const rThrust = kf[10];
    const lThrust = kf[11];

    const hipX = 29;
    const hipY = 32 + torsoDip;
    const shoulderX = 33;
    const shoulderY = 19 + torsoDip;

    // 1. Aerodynamic Chronal Wake behind runner
    this.drawSpeedAura(ctx, 22, 28 + torsoDip, 0.6);

    // 2. Rear Limbs (Depth layer)
    this.drawRearArm(ctx, shoulderX - 3, shoulderY - 1, lArm, lForearm);
    this.drawArmoredLeg(ctx, hipX - 2, hipY - 1, lThigh, lShin, true, lThrust);

    // 3. Torso & Armor Chassis
    this.drawTorso(ctx, hipX + 1, hipY - 6, torsoAngle, 0);

    // 4. Head & Helmet (Forward sprint angle)
    const headX = shoulderX + 3;
    const headY = shoulderY - 7;
    this.drawHelmet(ctx, headX, headY, torsoAngle * 0.75, false);

    // 5. Front Limbs (Foreground layer)
    this.drawArmoredLeg(ctx, hipX + 2, hipY, rThigh, rShin, false, rThrust);
    this.drawChronoGauntletArm(ctx, shoulderX + 2, shoulderY, rArm, rForearm, 1.0);

    canvasTex.refresh();
  }

  /**
   * Generates idle frame (ready athletic stance)
   */
  static generateIdleFrame(scene, key, idleIndex) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvasTex = scene.textures.createCanvas(key, 64, 64);
    const ctx = canvasTex.context;
    ctx.clearRect(0, 0, 64, 64);

    const breatheY = idleIndex === 1 ? -1 : 0;
    const hipX = 30;
    const hipY = 32 + breatheY;
    const shoulderX = 32;
    const shoulderY = 19 + breatheY;

    // Rear limbs
    this.drawRearArm(ctx, shoulderX - 3, shoulderY, -0.2, 0.4);
    this.drawArmoredLeg(ctx, hipX - 4, hipY, -0.15, 0.15, true, 0);

    // Torso
    this.drawTorso(ctx, hipX, hipY - 6, 0.12, 0);

    // Helmet
    this.drawHelmet(ctx, shoulderX + 2, shoulderY - 7, 0.08, false);

    // Front limbs
    this.drawArmoredLeg(ctx, hipX + 3, hipY, 0.12, -0.08, false, 0);
    this.drawChronoGauntletArm(ctx, shoulderX + 2, shoulderY, 0.35, 0.65, 0.85);

    canvasTex.refresh();
  }

  /**
   * Generates airborne jump frame (tucked legs with dual thruster flares)
   */
  static generateJumpFrame(scene, key) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvasTex = scene.textures.createCanvas(key, 64, 64);
    const ctx = canvasTex.context;
    ctx.clearRect(0, 0, 64, 64);

    const hipX = 30;
    const hipY = 30;
    const shoulderX = 33;
    const shoulderY = 18;

    // Upward aerodynamic streamlines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(22, 46);
    ctx.lineTo(16, 56);
    ctx.moveTo(34, 48);
    ctx.lineTo(30, 58);
    ctx.stroke();
    ctx.restore();

    // Rear limbs (tucked)
    this.drawRearArm(ctx, shoulderX - 2, shoulderY, -0.6, 0.3);
    this.drawArmoredLeg(ctx, hipX - 3, hipY, -0.65, 1.25, true, 1.0);

    // Torso (forward lean)
    this.drawTorso(ctx, hipX, hipY - 6, 0.35, 0);

    // Helmet looking up/forward
    this.drawHelmet(ctx, shoulderX + 4, shoulderY - 7, 0.25, true);

    // Front limbs (tucked & reaching forward)
    this.drawArmoredLeg(ctx, hipX + 3, hipY, -0.35, 1.15, false, 1.0);
    this.drawChronoGauntletArm(ctx, shoulderX + 2, shoulderY, 0.85, 0.25, 1.2);

    canvasTex.refresh();
  }

  /**
   * Generates falling frame (descending with stabilizing limbs)
   */
  static generateFallFrame(scene, key) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvasTex = scene.textures.createCanvas(key, 64, 64);
    const ctx = canvasTex.context;
    ctx.clearRect(0, 0, 64, 64);

    const hipX = 30;
    const hipY = 28;
    const shoulderX = 32;
    const shoulderY = 17;

    // Rear limbs
    this.drawRearArm(ctx, shoulderX - 3, shoulderY, -0.7, 0.2);
    this.drawArmoredLeg(ctx, hipX - 3, hipY, -0.15, 0.45, true, 0.3);

    // Torso
    this.drawTorso(ctx, hipX, hipY - 6, 0.15, 0);

    // Helmet
    this.drawHelmet(ctx, shoulderX + 3, shoulderY - 7, 0.1, false);

    // Front limbs (reaching down for platform contact)
    this.drawArmoredLeg(ctx, hipX + 2, hipY, 0.25, 0.15, false, 0.3);
    this.drawChronoGauntletArm(ctx, shoulderX + 2, shoulderY, 0.45, 0.55, 0.9);

    canvasTex.refresh();
  }

  /**
   * Generates slide frame (low-profile crouch slide with sparks)
   */
  static generateSlideFrame(scene, key) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvasTex = scene.textures.createCanvas(key, 64, 48);
    const ctx = canvasTex.context;
    ctx.clearRect(0, 0, 64, 48);

    // Low-profile center
    const hipX = 26;
    const hipY = 28;
    const shoulderX = 36;
    const shoulderY = 22;

    // Ground sparks wake
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#00f0ff';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(8 + i * 7, 42 - (i % 3) * 2, 3, 2);
    }
    ctx.restore();

    // Rear leg folded under hips
    this.drawArmoredLeg(ctx, hipX - 4, hipY, -0.85, 1.45, true, 0.4);

    // Torso nearly horizontal (angled 65° = 1.1 rad)
    this.drawTorso(ctx, hipX + 4, hipY - 4, 1.05, 0);

    // Helmet low and forward
    this.drawHelmet(ctx, shoulderX + 6, shoulderY - 3, 0.85, false);

    // Front leg extended straight out along the ground
    this.drawArmoredLeg(ctx, hipX + 6, hipY + 2, 1.25, -0.35, false, 0.5);

    // Chrono Gauntlet trailing sparks along the ground
    this.drawChronoGauntletArm(ctx, shoulderX + 2, shoulderY, 1.15, 0.25, 1.1);

    canvasTex.refresh();
  }

  /**
   * Generates dash frame (intense forward aerodynamic torpedo lunge)
   */
  static generateDashFrame(scene, key) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvasTex = scene.textures.createCanvas(key, 64, 64);
    const ctx = canvasTex.context;
    ctx.clearRect(0, 0, 64, 64);

    const hipX = 24;
    const hipY = 32;
    const shoulderX = 34;
    const shoulderY = 24;

    // Intense supersonic cone wake
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shoulderX + 18, shoulderY + 4);
    ctx.lineTo(8, 12);
    ctx.moveTo(shoulderX + 18, shoulderY + 4);
    ctx.lineTo(6, 48);
    ctx.stroke();
    ctx.restore();

    // Rear limbs streaming backward
    this.drawArmoredLeg(ctx, hipX - 2, hipY, -0.95, 0.15, true, 1.0);
    this.drawRearArm(ctx, shoulderX - 4, shoulderY - 2, -1.1, 0.15);

    // Torso forward lunge (angled 48° = 0.84 rad)
    this.drawTorso(ctx, hipX + 3, hipY - 5, 0.84, 0);

    // Helmet thrust forward
    this.drawHelmet(ctx, shoulderX + 6, shoulderY - 4, 0.72, false);

    // Front leg driving back in supersonic thrust
    this.drawArmoredLeg(ctx, hipX + 2, hipY, -0.75, 0.35, false, 1.0);

    // Chrono Gauntlet punched straight forward
    this.drawChronoGauntletArm(ctx, shoulderX + 4, shoulderY, 1.25, 0.15, 1.5);

    canvasTex.refresh();
  }
}
