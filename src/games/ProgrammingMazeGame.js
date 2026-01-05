import { LalelaGame } from '../utils/LalelaGame.js';

export class ProgrammingMazeGame extends LalelaGame {
    constructor() {
        super();
        this.gridSize = 60;
        this.gridOffsetX = 400;
        this.gridOffsetY = 100;
        this.program = [];
        this.currentInstructionIndex = 0;
        this.isExecuting = false;
        this.tux = null;
        this.tuxState = { x: 0, y: 0, direction: 0 }; // 0: North, 1: East, 2: South, 3: West
    }

    preload() {
        super.preload();
        this.load.image('pm_bg', 'assets/programmingMaze/background-pm.svg');
        this.load.image('pm_forward', 'assets/programmingMaze/move-forward.svg');
        this.load.image('pm_left', 'assets/programmingMaze/turn-left.svg');
        this.load.image('pm_right', 'assets/programmingMaze/turn-right.svg');
        this.load.image('pm_procedure', 'assets/programmingMaze/call-procedure.svg');
        this.load.image('pm_loop', 'assets/programmingMaze/execute-loop.svg');
        // Use a generic tux or create a shape
        // this.load.image('tux', 'assets/game-icons/tux.svg'); 
    }

    create() {
        super.create();
        this.createBackground();
        this.createLevels();
        this.createUI();
        this.startLevel();
    }

    createBackground() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'pm_bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    createLevels() {
        this.levels = [
            {
                map: [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
                fish: {x: 3, y: 2},
                start: {x: 1, y: 2, direction: 1}, // East
                instructions: ['move-forward', 'turn-left', 'turn-right'],
                maxInstructions: 4
            },
            {
                map: [{x: 1, y: 3}, {x: 2, y: 3}, {x: 2, y: 2}, {x: 2, y: 1}, {x: 3, y: 1}],
                fish: {x: 3, y: 1},
                start: {x: 1, y: 3, direction: 1},
                instructions: ['move-forward', 'turn-left', 'turn-right'],
                maxInstructions: 8
            }
        ];
        this.currentLevelIndex = 0;
    }

    createUI() {
        // Instruction Palette
        this.paletteContainer = this.add.container(50, 100);
        
        // Program Area
        this.programContainer = this.add.container(50, 300);
        this.add.text(50, 270, "Main Program", { fontSize: '24px', color: '#000000' });
        
        // Controls
        this.createButton(100, 500, "RUN", () => this.runProgram());
        this.createButton(250, 500, "CLEAR", () => this.clearProgram());
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontSize: '24px', backgroundColor: '#00B378', padding: { x: 10, y: 5 }
        }).setInteractive();
        btn.on('pointerdown', callback);
        return btn;
    }

    startLevel() {
        if (this.currentLevelIndex >= this.levels.length) {
            this.scene.start('GameMenu');
            return;
        }
        
        this.currentLevelData = this.levels[this.currentLevelIndex];
        this.program = [];
        this.updateProgramDisplay();
        this.setupGrid();
        this.setupPalette();
        this.resetTux();
    }

    setupGrid() {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(this.gridOffsetX, this.gridOffsetY);
        
        // Draw grid cells
        this.currentLevelData.map.forEach(cell => {
            const rect = this.add.rectangle(cell.x * this.gridSize, cell.y * this.gridSize, this.gridSize - 2, this.gridSize - 2, 0xAAAAAA);
            this.gridContainer.add(rect);
        });
        
        // Draw Fish
        const fish = this.add.circle(
            this.currentLevelData.fish.x * this.gridSize,
            this.currentLevelData.fish.y * this.gridSize,
            this.gridSize / 3, 0xFF0000
        );
        this.gridContainer.add(fish);
        
        // Tux
        this.tux = this.add.triangle(0, 0, 0, -15, 15, 15, -15, 15, 0x000000);
        this.gridContainer.add(this.tux);
    }

    setupPalette() {
        this.paletteContainer.removeAll(true);
        let y = 0;
        this.currentLevelData.instructions.forEach(instr => {
            let key = 'pm_forward';
            if (instr === 'turn-left') key = 'pm_left';
            if (instr === 'turn-right') key = 'pm_right';
            
            const icon = this.add.image(0, y, key).setDisplaySize(40, 40).setInteractive();
            icon.on('pointerdown', () => this.addInstruction(instr));
            this.paletteContainer.add(icon);
            y += 50;
        });
    }

    addInstruction(instr) {
        if (this.program.length < this.currentLevelData.maxInstructions) {
            this.program.push(instr);
            this.updateProgramDisplay();
        }
    }

    clearProgram() {
        this.program = [];
        this.updateProgramDisplay();
    }

    updateProgramDisplay() {
        this.programContainer.removeAll(true);
        let x = 0;
        this.program.forEach((instr, index) => {
            let key = 'pm_forward';
            if (instr === 'turn-left') key = 'pm_left';
            if (instr === 'turn-right') key = 'pm_right';
            
            const icon = this.add.image(x, 0, key).setDisplaySize(40, 40);
            this.programContainer.add(icon);
            x += 50;
        });
    }

    resetTux() {
        const start = this.currentLevelData.start;
        this.tuxState = { ...start };
        this.updateTuxSprite();
    }

    updateTuxSprite() {
        this.tux.x = this.tuxState.x * this.gridSize;
        this.tux.y = this.tuxState.y * this.gridSize;
        // Direction: 0=N, 1=E, 2=S, 3=W
        // Sprite points Up (North) by default
        this.tux.angle = this.tuxState.direction * 90;
    }

    runProgram() {
        if (this.isExecuting) return;
        this.isExecuting = true;
        this.resetTux();
        this.currentInstructionIndex = 0;
        this.executeNext();
    }

    executeNext() {
        if (this.currentInstructionIndex >= this.program.length) {
            this.isExecuting = false;
            this.checkWin();
            return;
        }

        const instr = this.program[this.currentInstructionIndex];
        this.currentInstructionIndex++;

        if (instr === 'move-forward') {
            // Calculate new position
            let dx = 0, dy = 0;
            if (this.tuxState.direction === 0) dy = -1; // North (y decreases)
            if (this.tuxState.direction === 1) dx = 1;  // East
            if (this.tuxState.direction === 2) dy = 1;  // South
            if (this.tuxState.direction === 3) dx = -1; // West
            
            const newX = this.tuxState.x + dx;
            const newY = this.tuxState.y + dy;
            
            // Check if valid (on map)
            const isValid = this.currentLevelData.map.some(p => p.x === newX && p.y === newY);
            
            if (isValid) {
                this.tuxState.x = newX;
                this.tuxState.y = newY;
                this.tweens.add({
                    targets: this.tux,
                    x: newX * this.gridSize,
                    y: newY * this.gridSize,
                    duration: 500,
                    onComplete: () => this.executeNext()
                });
            } else {
                // Crash
                this.sound.play('fail');
                this.isExecuting = false;
            }
        } else if (instr === 'turn-left') {
            this.tuxState.direction = (this.tuxState.direction - 1 + 4) % 4;
            this.tweens.add({
                targets: this.tux,
                angle: this.tuxState.direction * 90,
                duration: 500,
                onComplete: () => this.executeNext()
            });
        } else if (instr === 'turn-right') {
            this.tuxState.direction = (this.tuxState.direction + 1) % 4;
            this.tweens.add({
                targets: this.tux,
                angle: this.tuxState.direction * 90,
                duration: 500,
                onComplete: () => this.executeNext()
            });
        }
    }

    checkWin() {
        if (this.tuxState.x === this.currentLevelData.fish.x && this.tuxState.y === this.currentLevelData.fish.y) {
            this.sound.play('success');
            this.time.delayedCall(1000, () => {
                this.currentLevelIndex++;
                this.startLevel();
            });
        } else {
            this.sound.play('fail');
        }
    }
}
