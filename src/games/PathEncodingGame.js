import { LalelaGame } from '../utils/LalelaGame.js';

export class PathEncodingGame extends LalelaGame {
    constructor(config) {
        super({
            key: 'PathEncodingGame',
            title: 'Path Encoding',
            category: 'math',
            description: 'Guide Tux to the target by defining the path.',
            ...config
        });
        this.gridSize = 5;
        this.cellSize = 60;
        this.tuxPos = { x: 0, y: 0 };
        this.targetPos = { x: 4, y: 4 };
        this.movement = config.movement || 'absolute';
        this.tuxFacing = 'UP';
    }

    preload() {
        super.preload();
        this.load.image('tux', 'assets/common/tux.png');
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xC5CAE9)
            .setOrigin(0, 0)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Guide Tux to the Target", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000"
        }).setOrigin(0.5);

        // Create controls
        this.createControls();
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        this.tuxPos = { x: 0, y: 0 };
        this.tuxFacing = 'UP';
        this.targetPos = { 
            x: Phaser.Math.Between(2, 4), 
            y: Phaser.Math.Between(2, 4) 
        };
        this.drawGrid();
        this.createControls(); // Re-create controls to reset state if needed
    }

    drawGrid() {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(this.cameras.main.centerX - 150, this.cameras.main.centerY - 100);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.add.rectangle(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize - 2,
                    this.cellSize - 2,
                    0xffffff
                ).setOrigin(0).addToContainer(this.gridContainer);
            }
        }

        // Draw Tux
        this.tux = this.add.image(
            this.tuxPos.x * this.cellSize + this.cellSize/2,
            this.tuxPos.y * this.cellSize + this.cellSize/2,
            'tux'
        ).setDisplaySize(40, 40);
        
        // Set initial rotation
        this.updateTuxRotation();
        
        this.gridContainer.add(this.tux);

        // Draw Target
        this.target = this.add.star(
            this.targetPos.x * this.cellSize + this.cellSize/2,
            this.targetPos.y * this.cellSize + this.cellSize/2,
            5, 10, 20, 0xffd700
        );
        this.gridContainer.add(this.target);
    }

    updateTuxRotation() {
        let angle = 0;
        if (this.tuxFacing === 'RIGHT') angle = 90;
        if (this.tuxFacing === 'DOWN') angle = 180;
        if (this.tuxFacing === 'LEFT') angle = 270;
        this.tux.setAngle(angle);
    }

    createControls() {
        if (this.controlsContainer) this.controlsContainer.destroy();
        this.controlsContainer = this.add.container(0, 0);

        const startX = this.cameras.main.centerX;
        const startY = this.cameras.main.height - 100;
        const size = 60;
        const gap = 10;

        if (this.movement === 'absolute') {
            // Up
            this.createButton(startX, startY - size - gap, '↑', () => this.moveTux(0, -1, 'UP'));
            // Down
            this.createButton(startX, startY + size + gap, '↓', () => this.moveTux(0, 1, 'DOWN'));
            // Left
            this.createButton(startX - size - gap, startY, '←', () => this.moveTux(-1, 0, 'LEFT'));
            // Right
            this.createButton(startX + size + gap, startY, '→', () => this.moveTux(1, 0, 'RIGHT'));
        } else {
            // Relative Controls
            // Forward
            this.createButton(startX, startY - size - gap, '↑', () => this.moveRelative('FORWARD'));
            // Backward
            this.createButton(startX, startY + size + gap, '↓', () => this.moveRelative('BACKWARD')); // Or Turn Around? Usually just move back or turn.
            // Turn Left
            this.createButton(startX - size - gap, startY, '↰', () => this.moveRelative('LEFT'));
            // Turn Right
            this.createButton(startX + size + gap, startY, '↱', () => this.moveRelative('RIGHT'));
        }
    }

    createButton(x, y, label, callback) {
        let btn = this.add.container(x, y);
        let bg = this.add.circle(0, 0, 30, 0x3f51b5).setInteractive();
        let text = this.add.text(0, 0, label, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
        
        btn.add([bg, text]);
        this.controlsContainer.add(btn);
        
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x303f9f);
            callback();
        });
        bg.on('pointerup', () => bg.setFillStyle(0x3f51b5));
        bg.on('pointerout', () => bg.setFillStyle(0x3f51b5));
    }

    moveRelative(action) {
        const dirs = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        let currentIdx = dirs.indexOf(this.tuxFacing);
        
        if (action === 'LEFT') {
            currentIdx = (currentIdx + 3) % 4;
            this.tuxFacing = dirs[currentIdx];
            this.updateTuxRotation();
            // In some relative games, turning doesn't move. In others it does.
            // GCompris PathEncodingRelative: "Move Forward", "Turn Left", "Turn Right".
            // Usually turning is just turning.
            // But wait, if I turn left, do I move left?
            // Let's assume turn = rotate only.
            // But the game is about reaching the target.
            // If I only rotate, I need a "Forward" button.
            // I added Forward/Backward/Left/Right buttons.
            // If Left/Right are turns, then I need to move forward after turning?
            // Or does Left mean "Move Left relative to me"?
            // GCompris PathEncodingRelative usually means "Move in that relative direction".
            // So "Left" means "Move to the cell on my left".
            
            // Let's implement "Move in relative direction"
            this.moveInRelativeDir('LEFT');
        } else if (action === 'RIGHT') {
            this.moveInRelativeDir('RIGHT');
        } else if (action === 'FORWARD') {
            this.moveInRelativeDir('FORWARD');
        } else if (action === 'BACKWARD') {
            this.moveInRelativeDir('BACKWARD');
        }
    }

    moveInRelativeDir(relDir) {
        const dirs = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        let currentIdx = dirs.indexOf(this.tuxFacing);
        
        let targetIdx = currentIdx;
        if (relDir === 'RIGHT') targetIdx = (currentIdx + 1) % 4;
        if (relDir === 'BACKWARD') targetIdx = (currentIdx + 2) % 4;
        if (relDir === 'LEFT') targetIdx = (currentIdx + 3) % 4;
        
        const targetDir = dirs[targetIdx];
        
        let dx = 0, dy = 0;
        if (targetDir === 'UP') dy = -1;
        if (targetDir === 'DOWN') dy = 1;
        if (targetDir === 'LEFT') dx = -1;
        if (targetDir === 'RIGHT') dx = 1;
        
        // Update facing to the direction we moved?
        // In "Move Relative", usually you face where you move.
        this.tuxFacing = targetDir;
        this.updateTuxRotation();
        
        this.moveTux(dx, dy, targetDir);
    }

    moveTux(dx, dy, newFacing) {
        let newX = this.tuxPos.x + dx;
        let newY = this.tuxPos.y + dy;

        if (newFacing) {
            this.tuxFacing = newFacing;
            this.updateTuxRotation();
        }

        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
            this.tuxPos.x = newX;
            this.tuxPos.y = newY;
            
            this.tweens.add({
                targets: this.tux,
                x: newX * this.cellSize + this.cellSize/2,
                y: newY * this.cellSize + this.cellSize/2,
                duration: 200
            });
            
            this.audioManager.play('click');

            if (newX === this.targetPos.x && newY === this.targetPos.y) {
                this.audioManager.play('success');
                this.time.delayedCall(1000, () => this.startLevel());
            }
        } else {
             this.audioManager.play('error'); // Bump sound
        }
    }
}
