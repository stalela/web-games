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
        this.load.svg('wc-landscape', 'assets/watercycle/landscape.svg');
        this.load.svg('wc-sun', 'assets/watercycle/sun.svg');
        this.load.svg('wc-cloud', 'assets/watercycle/cloud.svg');
        this.load.svg('wc-rain', 'assets/watercycle/rain.svg');
        this.load.svg('wc-vapor', 'assets/watercycle/vapor.svg');
        this.load.svg('wc-river', 'assets/watercycle/river.svg');
        this.load.svg('wc-sea', 'assets/watercycle/sea.svg');
        
        this.load.audio('wc-water', 'assets/watercycle/harbor1.wav'); // Placeholder
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.image(width/2, height/2, 'wc-landscape')
            .setDisplaySize(width, height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Click the Sun to start', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Elements
        this.sun = this.add.image(100, 100, 'wc-sun').setDisplaySize(100, 100).setInteractive();
        this.cloud = this.add.image(width/2, 100, 'wc-cloud').setDisplaySize(150, 100).setAlpha(0.5).setInteractive();
        this.vapor = this.add.image(width - 100, height - 100, 'wc-vapor').setDisplaySize(50, 50).setAlpha(0);
        this.rain = this.add.image(width/2, 200, 'wc-rain').setDisplaySize(100, 100).setAlpha(0);
        
        // State
        this.step = 0; // 0: Start, 1: Evaporation, 2: Cloud, 3: Rain
        
        this.sun.on('pointerdown', () => {
            if (this.step === 0) {
                this.startEvaporation();
            }
        });
        
        this.cloud.on('pointerdown', () => {
            if (this.step === 2) {
                this.startRain();
            }
        });
    }
    
    startEvaporation() {
        this.step = 1;
        this.instructionText.setText('Evaporation: Water turns into vapor');
        this.audioManager.playSound('wc-water');
        
        this.vapor.setAlpha(1);
        this.vapor.setPosition(this.cameras.main.width - 100, this.cameras.main.height - 100);
        
        this.tweens.add({
            targets: this.vapor,
            y: 100,
            x: this.cameras.main.width/2,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                this.step = 2;
                this.cloud.setAlpha(1);
                this.instructionText.setText('Condensation: Vapor forms clouds. Click the Cloud.');
            }
        });
    }
    
    startRain() {
        this.step = 3;
        this.instructionText.setText('Precipitation: Rain falls down');
        this.audioManager.playSound('wc-water');
        
        this.rain.setAlpha(1);
        this.rain.y = 200;
        
        this.tweens.add({
            targets: this.rain,
            y: this.cameras.main.height - 100,
            duration: 1500,
            onComplete: () => {
                this.rain.setAlpha(0);
                this.step = 0;
                this.instructionText.setText('Collection: Water flows back to sea. Click Sun to restart.');
                this.audioManager.playSound('success');
            }
        });
    }
}
