import { LalelaGame } from '../utils/LalelaGame.js';

export class WaterCycleGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'WaterCycleGame',
            title: 'Water Cycle',
            description: 'Learn about the water cycle by clicking the elements.',
            category: 'discovery'
        });
    }

    preload() {
        super.preload();
        // Load all watercycle assets
        this.load.svg('wc-sky', 'assets/watercycle/sky.svg');
        this.load.svg('wc-sea', 'assets/watercycle/sea.svg');
        this.load.svg('wc-landscape', 'assets/watercycle/landscape.svg');
        this.load.svg('wc-sun', 'assets/watercycle/sun.svg');
        this.load.svg('wc-cloud', 'assets/watercycle/cloud.svg');
        this.load.svg('wc-rain', 'assets/watercycle/rain.svg');
        this.load.svg('wc-vapor', 'assets/watercycle/vapor.svg');
        this.load.svg('wc-river', 'assets/watercycle/river.svg');
        this.load.svg('wc-motor', 'assets/watercycle/motor.svg');
        this.load.svg('wc-fillwater', 'assets/watercycle/fillwater.svg');
        this.load.svg('wc-watertower', 'assets/watercycle/watertower.svg');
        this.load.svg('wc-watertowerfill', 'assets/watercycle/watertowerfill.svg');
        this.load.svg('wc-city', 'assets/watercycle/city.svg');
        this.load.svg('wc-waste', 'assets/watercycle/waste.svg');
        this.load.svg('wc-wastewater', 'assets/watercycle/wastewater.svg');
        this.load.svg('wc-shower', 'assets/watercycle/shower.svg');
        this.load.svg('wc-tuxbath', 'assets/watercycle/tuxbath.svg');
        this.load.svg('wc-tuxhouse', 'assets/watercycle/tuxHouse.svg');
        this.load.svg('wc-boat', 'assets/watercycle/boat.svg');
        this.load.svg('wc-boatparked', 'assets/watercycle/boat_parked.svg');
        this.load.svg('wc-reservoir1', 'assets/watercycle/reservoir1.svg');
        this.load.svg('wc-reservoir2', 'assets/watercycle/reservoir2.svg');
        this.load.svg('wc-reservoir3', 'assets/watercycle/reservoir3.svg');
        
        // Load wood background
        this.load.svg('wood-bg', 'assets/details/resource/backgroundW01.svg');
        
        // Load sounds
        this.load.audio('wc-harbor1', 'assets/watercycle/harbor1.wav');
        this.load.audio('wc-harbor2', 'assets/watercycle/harbor2.wav');
        this.load.audio('wc-bubble', 'assets/watercycle/bubble.wav');
        this.load.audio('wc-apert', 'assets/watercycle/apert.wav');
        
        // Load navigation icons
        this.load.svg('home', 'assets/game-icons/bar_home.svg');
        this.load.svg('help', 'assets/game-icons/bar_help.svg');
        this.load.svg('reload', 'assets/game-icons/bar_reload.svg');
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // Wood background for the panel area
        this.add.image(width / 2, height / 2, 'wood-bg')
            .setDisplaySize(width, height)
            .setDepth(-2);
    }

    createUI() {
        super.createUI();
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const barY = height - 55;
        const buttonSize = 72;
        const spacing = 95;
        const buttonRadius = 10;

        const controls = [
            { icon: 'help', action: 'help', color: 0x00B378 },
            { icon: 'home', action: 'home', color: 0x00B378 },
            { icon: 'reload', action: 'reload', color: 0x00B378 }
        ];

        let startX = 120;
        controls.forEach((control, index) => {
            const x = startX + index * spacing;
            this.createNavButton(x, barY, buttonSize, buttonRadius, control);
        });
    }

    createNavButton(x, y, buttonSize, buttonRadius, control) {
        const button = this.add.graphics();
        button.fillStyle(control.color);
        button.fillRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.lineStyle(2, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize, buttonRadius);
        button.setInteractive(
            new Phaser.Geom.Rectangle(x - buttonSize / 2, y - buttonSize / 2, buttonSize, buttonSize),
            Phaser.Geom.Rectangle.Contains
        );
        button.setDepth(100);

        const icon = this.add.sprite(x, y, control.icon);
        icon.setScale((buttonSize * 0.6) / Math.max(icon.width, icon.height));
        icon.setTint(0xFFFFFF);
        icon.setDepth(101);

        button.on('pointerdown', () => {
            icon.y += 2;
            this.handleNavAction(control.action);
            this.time.delayedCall(100, () => { icon.y -= 2; });
        });
    }

    handleNavAction(action) {
        switch (action) {
            case 'home':
                this.scene.start('GameMenu');
                break;
            case 'help':
                this.showHelpModal();
                break;
            case 'reload':
                this.initLevel();
                break;
        }
    }

    showHelpModal() {
        if (this.helpModal) return;

        const { width, height } = this.scale;
        this.helpModal = this.add.container(width / 2, height / 2).setDepth(200);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        overlay.setInteractive();

        const panel = this.add.rectangle(0, 0, 550, 380, 0xffffff, 1);
        panel.setStrokeStyle(3, 0x00B378);

        const title = this.add.text(0, -155, 'How to Play', {
            fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(0, 20,
            'Complete the water cycle!\n\n' +
            '1. Click the SUN to start evaporation\n' +
            '2. Click the CLOUD when it forms to make rain\n' +
            '3. Click the MOTOR PUMP to pump water to the tower\n' +
            '4. Click the SEWAGE PLANT to treat the water\n' +
            '5. Click the SHOWER to complete the cycle\n\n' +
            'Do this before Tux reaches home!',
            { fontSize: '18px', color: '#333333', align: 'center', lineSpacing: 6 }
        ).setOrigin(0.5);

        const closeBtn = this.add.text(0, 160, 'Got it!', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#00B378', padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.helpModal.destroy();
            this.helpModal = null;
        });

        this.helpModal.add([overlay, panel, title, instructions, closeBtn]);
    }

    setupGameLogic() {
        const { width, height } = this.scale;
        
        // Layout area (square, left side)
        this.layoutWidth = Math.min(height - 110, width * 0.6);
        this.layoutHeight = this.layoutWidth;
        this.layoutX = 0;
        this.layoutY = 0;
        
        // Create info panel area (right side)
        this.createInfoPanel();
        
        // Create all game elements
        this.createGameElements();
        
        // Initialize level
        this.initLevel();
    }

    createInfoPanel() {
        const { width, height } = this.scale;
        const panelX = this.layoutWidth + 20;
        const panelWidth = width - panelX - 20;
        
        // Info panel background
        this.infoPanelBg = this.add.rectangle(
            panelX + panelWidth / 2,
            this.layoutHeight / 2,
            panelWidth - 20,
            this.layoutHeight - 40,
            0xd2d2d2, 0.7
        ).setDepth(50);
        this.infoPanelBg.setStrokeStyle(2, 0x8B4513);
        
        // Info text
        this.infoText = this.add.text(panelX + panelWidth / 2, this.layoutHeight / 2, '', {
            fontSize: '22px',
            color: '#333333',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: panelWidth - 60 },
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(51);
    }

    createGameElements() {
        const lw = this.layoutWidth;
        const lh = this.layoutHeight;
        
        // Sky (top portion)
        this.sky = this.add.image(lw / 2, lh * 0.15, 'wc-sky');
        this.sky.setDisplaySize(lw, lh * 0.305);
        this.sky.setDepth(1);
        
        // Sea (bottom portion)
        this.sea = this.add.image(lw / 2, lh * 0.65, 'wc-sea');
        this.sea.setDisplaySize(lw, lh * 0.7);
        this.sea.setDepth(3);
        
        // Landscape (main layer)
        this.landscape = this.add.image(lw / 2, lh / 2, 'wc-landscape');
        this.landscape.setDisplaySize(lw, lh);
        this.landscape.setDepth(6);
        
        // Sun (clickable)
        this.sun = this.add.image(lw * 0.1, lh * 0.1, 'wc-sun');
        this.sun.setDisplaySize(lw * 0.1, lw * 0.1);
        this.sun.setDepth(2);
        this.sun.setInteractive({ useHandCursor: true });
        this.sun.on('pointerdown', () => this.onSunClick());
        this.sunDownY = lh * 0.30;
        this.sunUpY = lh * 0.1;
        
        // Vapor
        this.vapor = this.add.image(lw * 0.1, lh * 0.28, 'wc-vapor');
        this.vapor.setDisplaySize(lw * 0.1, lw * 0.1);
        this.vapor.setDepth(10);
        this.vapor.setAlpha(0);
        
        // Cloud (clickable)
        this.cloud = this.add.image(lw * 0.45, lh * 0.1, 'wc-cloud');
        this.cloud.setDisplaySize(0, 0);
        this.cloud.setDepth(11);
        this.cloud.setAlpha(0);
        this.cloud.setInteractive({ useHandCursor: true });
        this.cloud.on('pointerdown', () => this.onCloudClick());
        
        // Rain
        this.rain = this.add.image(lw * 0.5, lh * 0.15, 'wc-rain');
        this.rain.setDisplaySize(lw * 0.15, lw * 0.15);
        this.rain.setDepth(12);
        this.rain.setAlpha(0);
        
        // River
        this.river = this.add.image(lw * 0.5, lh * 0.45, 'wc-river');
        this.river.setDisplaySize(lw * 0.43, lw * 0.25);
        this.river.setDepth(10);
        this.river.setAlpha(0);
        
        // Reservoir layers
        this.reservoir1 = this.add.image(lw * 0.35, lh * 0.40, 'wc-reservoir1');
        this.reservoir1.setDisplaySize(lw * 0.11, lw * 0.08);
        this.reservoir1.setDepth(10);
        this.reservoir1.setAlpha(0);
        
        this.reservoir2 = this.add.image(lw * 0.34, lh * 0.40, 'wc-reservoir2');
        this.reservoir2.setDisplaySize(lw * 0.16, lw * 0.1);
        this.reservoir2.setDepth(10);
        this.reservoir2.setAlpha(0);
        
        this.reservoir3 = this.add.image(lw * 0.33, lh * 0.40, 'wc-reservoir3');
        this.reservoir3.setDisplaySize(lw * 0.2, lw * 0.12);
        this.reservoir3.setDepth(10);
        this.reservoir3.setAlpha(0);
        
        // Motor pump (clickable)
        this.motor = this.add.image(lw * 0.41, lh * 0.42, 'wc-motor');
        this.motor.setDisplaySize(lw * 0.08, lw * 0.08);
        this.motor.setDepth(20);
        this.motor.setInteractive({ useHandCursor: true });
        this.motor.on('pointerdown', () => this.onMotorClick());
        
        // Fill water pipe
        this.fillpipe = this.add.image(lw * 0.6, lh * 0.48, 'wc-fillwater');
        this.fillpipe.setDisplaySize(lw * 0.35, lw * 0.2);
        this.fillpipe.setDepth(9);
        this.fillpipe.setAlpha(0.2);
        
        // Water tower
        this.tower = this.add.image(lw * 0.75, lh * 0.32, 'wc-watertower');
        this.tower.setDisplaySize(lw * 0.14, lw * 0.2);
        this.tower.setDepth(10);
        
        // Tower fill
        this.towerfill = this.add.image(lw * 0.75, lh * 0.27, 'wc-watertowerfill');
        this.towerfill.setDisplaySize(lw * 0.07, 0);
        this.towerfill.setDepth(9);
        
        // City
        this.city = this.add.image(lw * 0.54, lh * 0.54, 'wc-city');
        this.city.setDisplaySize(lw * 0.2, lw * 0.18);
        this.city.setDepth(10);
        
        // Sewage plant (clickable)
        this.sewage = this.add.image(lw * 0.73, lh * 0.85, 'wc-waste');
        this.sewage.setDisplaySize(lw * 0.1, lw * 0.1);
        this.sewage.setDepth(11);
        this.sewage.setInteractive({ useHandCursor: true });
        this.sewage.on('pointerdown', () => this.onSewageClick());
        
        // Waste water pipe
        this.wastepipe = this.add.image(lw * 0.65, lh * 0.68, 'wc-wastewater');
        this.wastepipe.setDisplaySize(lw * 0.28, lw * 0.2);
        this.wastepipe.setDepth(10);
        this.wastepipe.setAlpha(0.2);
        
        // Tux house
        this.tuxhouse = this.add.image(lw * 0.78, lh * 0.68, 'wc-tuxhouse');
        this.tuxhouse.setDisplaySize(lw * 0.04, lw * 0.04);
        this.tuxhouse.setDepth(10);
        
        // Shower (clickable)
        this.shower = this.add.image(lw * 0.88, lh * 0.65, 'wc-shower');
        this.shower.setDisplaySize(lw * 0.18, lw * 0.18);
        this.shower.setDepth(10);
        this.shower.setAlpha(0);
        this.shower.setInteractive({ useHandCursor: true });
        this.shower.on('pointerdown', () => this.onShowerClick());
        
        // Tux in bath
        this.tuxbath = this.add.image(lw * 0.88, lh * 0.65, 'wc-tuxbath');
        this.tuxbath.setDisplaySize(lw * 0.18, lw * 0.18);
        this.tuxbath.setDepth(11);
        this.tuxbath.setAlpha(0);
        
        // Boat
        this.boat = this.add.image(0, lh * 0.94, 'wc-boat');
        this.boat.setDisplaySize(lw * 0.12, lw * 0.08);
        this.boat.setDepth(30);
        
        // Boat parked
        this.boatparked = this.add.image(lw * 0.9, lh * 0.94, 'wc-boatparked');
        this.boatparked.setDisplaySize(lw * 0.12, lw * 0.08);
        this.boatparked.setDepth(29);
        this.boatparked.setAlpha(0);
    }

    initLevel() {
        // Reset state
        this.riverLevel = 0;
        this.towerLevel = 0;
        this.cycleDone = false;
        this.currentStep = 'start';
        this.motorRunning = false;
        this.sewageRunning = false;
        this.showerOn = false;
        
        // Reset visuals
        this.sun.y = this.sunDownY;
        this.vapor.setAlpha(0);
        this.cloud.setAlpha(0);
        this.cloud.setDisplaySize(0, 0);
        this.rain.setAlpha(0);
        this.river.setAlpha(0);
        this.reservoir1.setAlpha(0);
        this.reservoir2.setAlpha(0);
        this.reservoir3.setAlpha(0);
        this.fillpipe.setAlpha(0.2);
        this.towerfill.setDisplaySize(this.layoutWidth * 0.07, 0);
        this.wastepipe.setAlpha(0.2);
        this.shower.setAlpha(0);
        this.tuxbath.setAlpha(0);
        this.boatparked.setAlpha(0);
        
        // Reset boat
        this.boat.x = 0;
        this.boat.setAlpha(1);
        
        // Start boat journey
        this.startBoatJourney();
        
        // Show start info
        this.setInfo('start');
        
        // Start timer for level updates
        if (this.levelTimer) this.levelTimer.destroy();
        this.levelTimer = this.time.addEvent({
            delay: 100,
            callback: this.updateLevel,
            callbackScope: this,
            loop: true
        });
    }

    setInfo(key) {
        const messages = {
            start: "The sun is the main component of the water cycle. Click on the sun to start the water cycle.",
            sun: "As the sun rises, the water of the sea starts heating and evaporates.",
            cloud: "Water vapor condenses to form clouds and when clouds become heavy, it rains. Click on the cloud.",
            rain: "The rain causes rivers to swell up and this water is transported via motor pumps through water-towers. Click on the motor pump.",
            tower: "See the tower filled with water. Activate the sewage treatment station by clicking on it.",
            shower: "Great, click on the shower, as Tux arrives home.",
            done: "Fantastic, you have completed the water cycle. You can continue playing."
        };
        
        this.currentStep = key;
        this.infoText.setText(messages[key] || '');
    }

    startBoatJourney() {
        const lw = this.layoutWidth;
        
        // Play harbor sound
        this.playSound('wc-harbor1');
        
        // Animate boat from left to right
        this.tweens.add({
            targets: this.boat,
            x: lw - this.boat.displayWidth,
            duration: 15000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.playSound('wc-harbor2');
                // Hide boat, show parked boat
                this.tweens.add({
                    targets: this.boat,
                    alpha: 0,
                    duration: 200
                });
                this.tweens.add({
                    targets: this.boatparked,
                    alpha: 1,
                    duration: 200
                });
            }
        });
    }

    playSound(key) {
        if (this.audioManager) {
            this.audioManager.playSound(key);
        } else {
            try { this.sound.play(key); } catch (e) {}
        }
    }

    onSunClick() {
        if (this.currentStep !== 'start' || this.cloud.alpha > 0) return;
        
        this.playSound('wc-bubble');
        this.setInfo('sun');
        
        // Sun rises
        this.tweens.add({
            targets: this.sun,
            y: this.sunUpY,
            duration: 5000,
            ease: 'Quad.easeInOut'
        });
        
        // Vapor animation
        this.vapor.setAlpha(1);
        this.vapor.y = this.layoutHeight * 0.28;
        
        this.tweens.add({
            targets: this.vapor,
            y: this.layoutHeight * 0.1,
            alpha: 0,
            duration: 5000,
            onComplete: () => {
                // Cloud forms
                this.tweens.add({
                    targets: this.cloud,
                    alpha: 1,
                    displayWidth: this.layoutWidth * 0.25,
                    displayHeight: this.layoutWidth * 0.15,
                    x: this.layoutWidth * 0.55,
                    duration: 5000,
                    ease: 'Quad.easeInOut',
                    onComplete: () => {
                        this.setInfo('cloud');
                    }
                });
            }
        });
    }

    onCloudClick() {
        if (this.currentStep !== 'cloud') return;
        
        this.playSound('wc-bubble');
        this.setInfo('rain');
        
        // Sun goes down
        this.tweens.add({
            targets: this.sun,
            y: this.sunDownY,
            duration: 3000
        });
        
        // Rain starts
        this.rain.setAlpha(1);
        this.rain.setScale(1);
        
        // Rain animation (pulsing)
        this.rainTween = this.tweens.add({
            targets: this.rain,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 500,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                // Rain stops, cloud fades
                this.rain.setAlpha(0);
                this.tweens.add({
                    targets: this.cloud,
                    alpha: 0,
                    displayWidth: 0,
                    displayHeight: 0,
                    duration: 2000
                });
            }
        });
    }

    onMotorClick() {
        if (this.riverLevel < 0.2 || this.motorRunning) return;
        
        this.playSound('wc-bubble');
        this.setInfo('tower');
        this.motorRunning = true;
        
        // Activate fill pipe
        this.tweens.add({
            targets: this.fillpipe,
            alpha: 1,
            duration: 300
        });
    }

    onSewageClick() {
        if (!this.motorRunning || this.sewageRunning) return;
        
        this.playSound('wc-bubble');
        this.setInfo('shower');
        this.sewageRunning = true;
        
        // Activate waste pipe
        this.tweens.add({
            targets: this.wastepipe,
            alpha: 1,
            duration: 300
        });
        
        // Show shower
        this.tweens.add({
            targets: this.shower,
            alpha: 1,
            duration: 500
        });
    }

    onShowerClick() {
        if (!this.sewageRunning || this.towerLevel < 0.5 || this.showerOn) return;
        
        this.playSound('wc-apert');
        this.showerOn = true;
        
        // Show Tux in bath
        this.tweens.add({
            targets: this.tuxbath,
            alpha: 1,
            duration: 500
        });
        
        if (!this.cycleDone) {
            this.setInfo('done');
            this.cycleDone = true;
            if (this.audioManager) this.audioManager.playSound('success');
        }
    }

    updateLevel() {
        // River fills during rain
        if (this.rain.alpha > 0.9 && this.riverLevel < 1) {
            this.riverLevel += 0.01;
            this.river.setAlpha(Math.min(1, this.riverLevel));
            
            // Update reservoirs
            if (this.riverLevel > 0.2) this.reservoir1.setAlpha(1);
            if (this.riverLevel > 0.5) this.reservoir2.setAlpha(1);
            if (this.riverLevel > 0.8) this.reservoir3.setAlpha(1);
        }
        
        // Tower fills when motor is running
        if (this.riverLevel > 0 && this.motorRunning && this.towerLevel < 1 && !this.showerOn) {
            this.riverLevel -= 0.02;
            this.towerLevel += 0.05;
            
            // Update tower fill visual
            const maxFillHeight = this.layoutWidth * 0.1;
            this.towerfill.setDisplaySize(this.layoutWidth * 0.07, maxFillHeight * this.towerLevel);
        }
        
        // Tower drains when shower is on
        if (this.towerLevel > 0 && this.showerOn) {
            this.towerLevel -= 0.02;
            const maxFillHeight = this.layoutWidth * 0.1;
            this.towerfill.setDisplaySize(this.layoutWidth * 0.07, maxFillHeight * Math.max(0, this.towerLevel));
            
            if (this.towerLevel <= 0) {
                // Shower stops
                this.showerOn = false;
                this.tuxbath.setAlpha(0);
            }
        }
    }
}
