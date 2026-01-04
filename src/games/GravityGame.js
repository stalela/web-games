import { LalelaGame } from '../utils/LalelaGame.js';

const levels = [
    { planetFrequency: 3000, planetCount: 5 },
    { planetFrequency: 2500, planetCount: 10 },
    { planetFrequency: 2000, planetCount: 15 },
    { planetFrequency: 1800, planetCount: 20 },
    { planetFrequency: 1500, planetCount: 25 },
    { planetFrequency: 1200, planetCount: 30 }
];

export class GravityGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'GravityGame',
            title: 'Gravity',
            description: 'Move the spaceship to avoid planets and reach the station.',
            category: 'sciences'
        });
        
        this.currentLevel = 0;
        this.spaceship = null;
        this.planets = [];
        this.station = null;
        this.planetsSpawned = 0;
        this.moveDirection = 0;
        this.spaceshipSpeed = 5;
        this.gravity = 0;
        this.isGameOver = false;
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        // Starfield background
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0a0a20, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
        
        // Add stars
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.5 + 0.5;
            graphics.fillStyle(0xffffff, alpha);
            graphics.fillCircle(x, y, size);
        }
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        this.add.text(width / 2, 30, 'Gravity', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.instructionText = this.add.text(width / 2, 70, 'Use arrow keys or buttons to avoid planets!', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(width - 100, 30, `Level: 1/${levels.length}`, {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.progressText = this.add.text(100, 30, 'Planets: 0/5', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Mobile controls
        this.createMobileControls();
    }

    createMobileControls() {
        const { width, height } = this.cameras.main;
        
        const leftBtn = this.add.circle(80, height - 80, 40, 0x0062FF, 0.7);
        leftBtn.setStrokeStyle(2, 0xffffff);
        leftBtn.setInteractive({ useHandCursor: true });
        this.add.text(80, height - 80, '←', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        leftBtn.on('pointerdown', () => this.moveDirection = -1);
        leftBtn.on('pointerup', () => this.moveDirection = 0);
        leftBtn.on('pointerout', () => this.moveDirection = 0);
        
        const rightBtn = this.add.circle(width - 80, height - 80, 40, 0x0062FF, 0.7);
        rightBtn.setStrokeStyle(2, 0xffffff);
        rightBtn.setInteractive({ useHandCursor: true });
        this.add.text(width - 80, height - 80, '→', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        rightBtn.on('pointerdown', () => this.moveDirection = 1);
        rightBtn.on('pointerup', () => this.moveDirection = 0);
        rightBtn.on('pointerout', () => this.moveDirection = 0);
    }

    setupGameLogic() {
        this.setupInput();
        this.startLevel(0);
    }

    setupInput() {
        this.input.keyboard.on('keydown-LEFT', () => this.moveDirection = -1);
        this.input.keyboard.on('keyup-LEFT', () => { if (this.moveDirection === -1) this.moveDirection = 0; });
        this.input.keyboard.on('keydown-RIGHT', () => this.moveDirection = 1);
        this.input.keyboard.on('keyup-RIGHT', () => { if (this.moveDirection === 1) this.moveDirection = 0; });
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.isGameOver = false;
        this.planetsSpawned = 0;
        this.gravity = 0;
        this.moveDirection = 0;
        
        this.clearLevel();
        
        const { width, height } = this.cameras.main;
        
        this.levelText.setText(`Level: ${levelIndex + 1}/${levels.length}`);
        this.progressText.setText(`Planets: 0/${levels[levelIndex].planetCount}`);
        
        // Create spaceship
        this.spaceship = this.add.triangle(width / 2, height - 100, 0, 30, 15, 0, 30, 30, 0x00ff00);
        this.spaceship.setStrokeStyle(2, 0xffffff);
        
        // Create station at top (hidden initially)
        this.station = this.add.rectangle(width / 2, -50, 100, 30, 0x888888);
        this.station.setStrokeStyle(2, 0xffffff);
        this.add.text(width / 2, -50, '🛰️ STATION', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Start spawning planets
        this.planetTimer = this.time.addEvent({
            delay: levels[levelIndex].planetFrequency,
            callback: this.spawnPlanet,
            callbackScope: this,
            loop: true
        });
        
        // Gravity arrow indicator
        this.gravityArrow = this.add.triangle(width / 2, height - 150, 0, 10, 10, 0, 20, 10, 0xff0000);
        this.gravityArrow.setVisible(false);
    }

    spawnPlanet() {
        if (this.isGameOver) return;
        
        const levelData = levels[this.currentLevel];
        if (this.planetsSpawned >= levelData.planetCount) {
            this.planetTimer.remove();
            this.bringStation();
            return;
        }
        
        const { width } = this.cameras.main;
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const size = Phaser.Math.Between(40, 80);
        const x = side === 'left' ? size : width - size;
        
        const planet = this.add.circle(x, -size, size / 2, Phaser.Display.Color.RandomRGB().color);
        planet.setStrokeStyle(2, 0xffffff);
        planet.side = side;
        planet.planetSize = size;
        
        this.planets.push(planet);
        this.planetsSpawned++;
        this.progressText.setText(`Planets: ${this.planetsSpawned}/${levelData.planetCount}`);
        
        // Animate planet falling
        this.tweens.add({
            targets: planet,
            y: this.cameras.main.height + size,
            duration: levelData.planetFrequency * 4,
            onComplete: () => {
                this.removePlanet(planet);
            }
        });
    }

    bringStation() {
        const { height } = this.cameras.main;
        
        this.tweens.add({
            targets: this.station,
            y: 100,
            duration: 2000,
            onComplete: () => {
                // Station is now reachable
            }
        });
    }

    removePlanet(planet) {
        const index = this.planets.indexOf(planet);
        if (index > -1) {
            this.planets.splice(index, 1);
        }
        planet.destroy();
    }

    update(time, delta) {
        if (this.isGameOver || !this.spaceship) return;
        
        const { width, height } = this.cameras.main;
        
        // Calculate gravity from nearby planets
        this.gravity = 0;
        this.planets.forEach(planet => {
            if (planet.y > 100 && planet.y < height - 100) {
                const gravityForce = planet.planetSize / 100;
                this.gravity += planet.side === 'left' ? -gravityForce : gravityForce;
            }
        });
        
        // Update gravity arrow
        if (this.gravity !== 0) {
            this.gravityArrow.setVisible(true);
            this.gravityArrow.x = this.spaceship.x;
            this.gravityArrow.y = this.spaceship.y - 30;
            this.gravityArrow.setScale(Math.abs(this.gravity), 1);
            this.gravityArrow.setAngle(this.gravity > 0 ? 0 : 180);
        } else {
            this.gravityArrow.setVisible(false);
        }
        
        // Move spaceship
        const movement = this.moveDirection * this.spaceshipSpeed + this.gravity * 2;
        this.spaceship.x += movement;
        
        // Clamp to screen
        this.spaceship.x = Phaser.Math.Clamp(this.spaceship.x, 30, width - 30);
        
        // Check collision with planets
        this.planets.forEach(planet => {
            const dist = Phaser.Math.Distance.Between(this.spaceship.x, this.spaceship.y, planet.x, planet.y);
            if (dist < planet.planetSize / 2 + 15) {
                this.gameOver(false);
            }
        });
        
        // Check if reached station
        if (this.station.y > 50) {
            const distToStation = Phaser.Math.Distance.Between(this.spaceship.x, this.spaceship.y, this.station.x, this.station.y);
            if (distToStation < 60) {
                // Move spaceship up to dock
                this.tweens.add({
                    targets: this.spaceship,
                    y: this.station.y,
                    duration: 500,
                    onComplete: () => this.gameOver(true)
                });
                this.isGameOver = true;
            }
        }
    }

    gameOver(won) {
        this.isGameOver = true;
        if (this.planetTimer) this.planetTimer.remove();
        
        const { width, height } = this.cameras.main;
        
        if (won) {
            if (this.audioManager) this.audioManager.playSound('win');
            
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
            overlay.setDepth(100);
            
            this.add.text(width / 2, height / 2 - 30, '🚀 Docked Successfully! 🎉', {
                fontFamily: 'Nunito, Arial',
                fontSize: '36px',
                color: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(101);
            
            const nextBtn = this.add.text(width / 2, height / 2 + 50, 'Next Level →', {
                fontFamily: 'Nunito, Arial',
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#0062FF',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
            
            nextBtn.on('pointerdown', () => {
                if (this.currentLevel < levels.length - 1) {
                    this.scene.restart();
                    this.currentLevel++;
                } else {
                    this.scene.start('GameMenu');
                }
            });
        } else {
            if (this.audioManager) this.audioManager.playSound('error');
            
            // Explosion effect
            this.spaceship.setFillStyle(0xff0000);
            
            this.time.delayedCall(1000, () => {
                const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
                overlay.setDepth(100);
                
                this.add.text(width / 2, height / 2 - 30, '💥 Crashed!', {
                    fontFamily: 'Nunito, Arial',
                    fontSize: '36px',
                    color: '#ff0000',
                    fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(101);
                
                const retryBtn = this.add.text(width / 2, height / 2 + 50, 'Try Again', {
                    fontFamily: 'Nunito, Arial',
                    fontSize: '28px',
                    color: '#ffffff',
                    backgroundColor: '#E65B48',
                    padding: { x: 20, y: 10 }
                }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
                
                retryBtn.on('pointerdown', () => {
                    this.scene.restart();
                });
            });
        }
    }

    clearLevel() {
        this.planets.forEach(p => p.destroy());
        this.planets = [];
        if (this.spaceship) this.spaceship.destroy();
        if (this.station) this.station.destroy();
        if (this.planetTimer) this.planetTimer.remove();
    }
}
