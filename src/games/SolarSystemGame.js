import { LalelaGame } from '../utils/LalelaGame.js';

export class SolarSystemGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'SolarSystemGame',
            title: 'Solar System',
            description: 'Learn about the planets in our solar system.',
            category: 'discovery'
        });
    }

    preload() {
        super.preload();
        this.load.svg('solar-bg', 'assets/solar_system/background.svg');
        this.load.image('solar-sun', 'assets/solar_system/sun.webp');
        this.load.image('solar-mercury', 'assets/solar_system/mercury.webp');
        this.load.image('solar-venus', 'assets/solar_system/venus.webp');
        this.load.image('solar-earth', 'assets/solar_system/earth.webp');
        this.load.image('solar-mars', 'assets/solar_system/mars.webp');
        this.load.image('solar-jupiter', 'assets/solar_system/jupiter.webp');
        this.load.image('solar-saturn', 'assets/solar_system/saturn.webp');
        this.load.image('solar-uranus', 'assets/solar_system/uranus.webp');
        this.load.image('solar-neptune', 'assets/solar_system/neptune.webp');
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.image(width/2, height/2, 'solar-bg')
            .setDisplaySize(width, height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.infoText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, 'Click on a planet', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        const width = this.cameras.main.width;
        const centerY = this.cameras.main.height / 2;
        
        const planets = [
            { id: 'sun', name: 'Sun', scale: 1.5 },
            { id: 'mercury', name: 'Mercury', scale: 0.4 },
            { id: 'venus', name: 'Venus', scale: 0.6 },
            { id: 'earth', name: 'Earth', scale: 0.6 },
            { id: 'mars', name: 'Mars', scale: 0.5 },
            { id: 'jupiter', name: 'Jupiter', scale: 1.2 },
            { id: 'saturn', name: 'Saturn', scale: 1.0 },
            { id: 'uranus', name: 'Uranus', scale: 0.8 },
            { id: 'neptune', name: 'Neptune', scale: 0.8 }
        ];
        
        const totalWidth = width * 0.9;
        const startX = width * 0.05;
        const spacing = totalWidth / planets.length;
        
        planets.forEach((p, i) => {
            const x = startX + i * spacing + spacing/2;
            const sprite = this.add.image(x, centerY, `solar-${p.id}`);
            
            // Scale relative to base size (e.g. 100px)
            sprite.setDisplaySize(60 * p.scale, 60 * p.scale);
            
            sprite.setInteractive();
            sprite.on('pointerdown', () => {
                this.showInfo(p);
                this.tweens.add({
                    targets: sprite,
                    scale: sprite.scale * 1.2,
                    duration: 200,
                    yoyo: true
                });
            });
            
            // Label
            this.add.text(x, centerY + 60, p.name, {
                fontSize: '14px',
                color: '#FFF'
            }).setOrigin(0.5);
        });
    }
    
    showInfo(planet) {
        this.infoText.setText(planet.name);
        this.audioManager.playSound('click');
        // Could add more info here
    }
}
