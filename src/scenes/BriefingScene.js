import Phaser from 'phaser';

export default class BriefingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BriefingScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background styling
    this.add.rectangle(width / 2, height / 2, width, height, 0x050814);
    this.add.grid(width / 2, height / 2, width, height, 64, 64, 0x000000, 0, 0x00f0ff, 0.06);

    // Briefing Box Container
    const boxWidth = 840;
    const boxHeight = 480;
    const boxX = width / 2;
    const boxY = height / 2;

    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x0b1329, 0.88);
    boxBg.fillRoundedRect(boxX - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight, 8);
    boxBg.lineStyle(1.5, 0x00f0ff, 0.7);
    boxBg.strokeRoundedRect(boxX - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight, 8);

    // Top Header
    this.add.text(boxX, boxY - boxHeight / 2 + 38, 'MISSION BRIEFING // SECTOR AETHELON', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#00f0ff',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Sub-header operative ID
    this.add.text(boxX, boxY - boxHeight / 2 + 75, 'OPERATIVE: KAEL VEYRON  |  CLEARANCE: PROTOCOL CHRONO', {
      fontFamily: 'Rajdhani, monospace',
      fontSize: '15px',
      color: '#c084fc',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Divider line
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x1e3a8a, 0.8);
    divider.lineBetween(boxX - boxWidth / 2 + 40, boxY - boxHeight / 2 + 95, boxX + boxWidth / 2 - 40, boxY - boxHeight / 2 + 95);

    // Narrative Transmission Content (from PRD Section 15.3 & Section 4)
    const missionText = [
      'PRIORITY TRANSMISSION:',
      'Aethelon City is facing catastrophic temporal collapse.',
      'The Chrono Core reactor has ruptured, fracturing local spacetime into unstable geometric anomalies, suspended projectiles, and rotating temporal barriers.',
      '',
      'PRIMARY DIRECTIVE:',
      '1. Traverse the fractured sectors using your Chrono Gauntlet.',
      '2. Deploy Chrono Freeze [Q] to suspend rotating hazards and collapsing pathways.',
      '3. Execute directional Chrono Dash [E] to clear hazard zones.',
      '4. Collect Chrono Cells to replenish Gauntlet energy reserves.',
      '5. Reach the central Chrono Core before the Zero Second countdown expires.'
    ].join('\n');

    this.add.text(boxX - boxWidth / 2 + 50, boxY - 110, missionText, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      color: '#e2e8f0',
      lineSpacing: 8,
      wordWrap: { width: boxWidth - 100 }
    });

    // Action Buttons
    const btnY = boxY + boxHeight / 2 - 45;

    // Deploy Button (Primary)
    const deployBtn = this.createButton(boxX + 160, btnY, 'DEPLOY TO AETHELON [ENTER]', 0x00f0ff, 0x050814, () => {
      this.scene.start('FoundationTestScene');
    });

    // Return to Menu Button
    const backBtn = this.createButton(boxX - 160, btnY, 'ABORT / RETURN [ESC]', 0x1e293b, 0xe2e8f0, () => {
      this.scene.start('MenuScene');
    });

    // Keyboard controls for briefing
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('FoundationTestScene');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  createButton(x, y, label, bgColor, textColor, callback) {
    const btnWidth = 280;
    const btnHeight = 44;

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(1.5, 0x00f0ff, 0.8);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: textColor === 0x050814 ? '#050814' : '#e2e8f0'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      container.setScale(1.04);
    });

    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    container.on('pointerdown', callback);

    return container;
  }
}
