import { LalelaGame } from '../utils/LalelaGame.js';

export class LandSafeGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'LandSafeGame',
            title: 'Land Safe',
            description: 'Land the rocket safely on the platform. Use Arrow Keys.',
            category: 'discovery'
        });
    }
    
    preload() {
        super.preload();
        this.load.svg('landsafe-rocket', 'assets/land_safe/rocket.svg');
        this.load.svg('landsafe-ground', 'assets/land_safe/ground.svg');
        this.load.svg('landsafe-bg', 'assets/land_safe/background.svg');
        this.load.svg('landsafe-pad', 'assets/land_safe/landing-g.svg');
        this.load.svg('landsafe-engine', 'assets/land_safe/engine.svg');
    }
    
    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.image(width/2, height/2, 'landsafe-bg')
            .setDisplaySize(width, height)
            .setDepth(-1);
    }
    
    createUI() {
        super.createUI();
        
        this.fuelText = this.add.text(20, 80, 'Fuel: 100%', { 
            fontSize: '24px', 
            fill: '#fff',
            fontFamily: 'Arial'
        });
        
        this.velocityText = this.add.text(20, 110, 'Velocity: 0', { 
            fontSize: '24px', 
            fill: '#fff',
            fontFamily: 'Arial'
        });
        
        // Add on-screen controls for mobile
        this.createMobileControls();
    }
    
    createMobileControls() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Left
        this.leftBtn = this.add.circle(80, height - 80, 40, 0x0062FF, 0.5).setInteractive();
        this.add.text(80, height - 80, '←', { fontSize: '32px' }).setOrigin(0.5);
        
        // Right
        this.rightBtn = this.add.circle(200, height - 80, 40, 0x0062FF, 0.5).setInteractive();
        this.add.text(200, height - 80, '→', { fontSize: '32px' }).setOrigin(0.5);
        
        // Thrust
        this.thrustBtn = this.add.circle(width - 80, height - 80, 50, 0xF08A00, 0.5).setInteractive();
        this.add.text(width - 80, height - 80, '↑', { fontSize: '40px' }).setOrigin(0.5);
        
        // Events
        this.leftBtn.on('pointerdown', () => this.leftPressed = true);
        this.leftBtn.on('pointerup', () => this.leftPressed = false);
        this.leftBtn.on('pointerout', () => this.leftPressed = false);
        
        this.rightBtn.on('pointerdown', () => this.rightPressed = true);
        this.rightBtn.on('pointerup', () => this.rightPressed = false);
        this.rightBtn.on('pointerout', () => this.rightPressed = false);
        
        this.thrustBtn.on('pointerdown', () => this.thrustPressed = true);
        this.thrustBtn.on('pointerup', () => this.thrustPressed = false);
        this.thrustBtn.on('pointerout', () => this.thrustPressed = false);
    }
    
    setupGameLogic() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create ground
        this.ground = this.physics.add.staticGroup();
        const groundY = height - 20;
        
        // Create a floor
        const ground = this.add.tileSprite(width/2, groundY, width, 40, 'landsafe-ground');
        this.physics.add.existing(ground, true); // true = static
        this.ground.add(ground);
        
        // Landing pad
        this.pad = this.physics.add.staticSprite(width/2, groundY - 30, 'landsafe-pad');
        this.pad.setDisplaySize(120, 20);
        this.pad.refreshBody();
        
        // Rocket
        this.rocket = this.physics.add.sprite(100, 100, 'landsafe-rocket');
        this.rocket.setDisplaySize(40, 60);
        this.rocket.setCollideWorldBounds(true);
        this.rocket.setBounce(0.1);
        this.rocket.setDrag(50);
        this.rocket.setAngularDrag(50);
        this.rocket.setGravityY(150);
        
        // Engine flame
        this.flame = this.add.image(0, 40, 'landsafe-engine');
        this.flame.setDisplaySize(20, 30);
        this.flame.setVisible(false);
        // Attach flame to rocket (manually in update)
        
        // Collisions
        this.physics.add.collider(this.rocket, this.ground, this.handleCrash, null, this);
        this.physics.add.collider(this.rocket, this.pad, this.handleLanding, null, this);
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.fuel = 100;
        this.landed = false;
        this.crashed = false;
        
        // Reset state
        this.leftPressed = false;
        this.rightPressed = false;
        this.thrustPressed = false;
    }
    
    update(time, delta) {
        if (this.landed || this.crashed) return;
        
        // Update flame position
        this.flame.setPosition(this.rocket.x, this.rocket.y + 35);
        this.flame.setRotation(this.rocket.rotation);
        
        let thrusting = false;
        
        if ((this.cursors.up.isDown || this.thrustPressed) && this.fuel > 0) {
            // Apply thrust in the direction of the rocket
            const thrust = 300;
            const angle = this.rocket.rotation - Math.PI/2; // -90 degrees is up
            
            // Simplified: just up thrust relative to world for now, or relative to rocket?
            // Lunar lander usually rotates.
            // Let's allow rotation with left/right.
            
            // Actually, GCompris LandSafe seems to have left/right thrusters that move it laterally, 
            // and main thruster moves it up (relative to rocket?).
            // Let's stick to simple Arcade Physics style: Up = Thrust Up, Left/Right = Rotate?
            // Or Left/Right = Move Left/Right?
            // The description says "Use Arrow Keys".
            // Usually Left/Right rotates, Up thrusts.
            
            // Let's try rotation based control.
            // this.rocket.setAngularVelocity(0);
            
            // If I use setAccelerationY, it's world aligned.
            // If I use velocityFromRotation, it's rocket aligned.
            
            this.physics.velocityFromRotation(this.rocket.rotation - Math.PI/2, 300, this.rocket.body.acceleration);
            this.fuel -= 0.2;
            thrusting = true;
        } else {
            this.rocket.setAcceleration(0);
        }
        
        if (this.cursors.left.isDown || this.leftPressed) {
            this.rocket.setAngularVelocity(-100);
        } else if (this.cursors.right.isDown || this.rightPressed) {
            this.rocket.setAngularVelocity(100);
        } else {
            this.rocket.setAngularVelocity(0);
        }
        
        this.flame.setVisible(thrusting);
        
        this.fuelText.setText(`Fuel: ${Math.floor(this.fuel)}%`);
        
        // Velocity check color
        const vy = this.rocket.body.velocity.y;
        this.velocityText.setText(`Velocity: ${Math.floor(vy)}`);
        if (vy > 100) this.velocityText.setColor('#ff0000');
        else this.velocityText.setColor('#00ff00');
    }
    
    handleCrash() {
        if (this.crashed || this.landed) return;
        this.crashed = true;
        this.rocket.setTint(0xff0000);
        this.flame.setVisible(false);
        this.audioManager.playSound('error');
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'CRASHED!', { fontSize: '64px', color: '#ff0000' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.scene.restart());
    }
    
    handleLanding() {
        if (this.crashed || this.landed) return;
        
        // Check velocity
        const vy = this.rocket.body.velocity.y;
        // Check angle (must be upright)
        const angle = Math.abs(this.rocket.angle);
        
        if (vy > 100 || angle > 20) {
            this.handleCrash();
        } else {
            this.landed = true;
            this.audioManager.playSound('success');
            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'SAFE LANDING!', { fontSize: '64px', color: '#00ff00' }).setOrigin(0.5);
            this.time.delayedCall(2000, () => this.scene.restart());
        }
    }
}
