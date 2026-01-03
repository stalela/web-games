import { LalelaGame } from '../utils/LalelaGame.js';

export class HanoiGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'HanoiGame',
            title: 'Tower of Hanoi',
            description: 'Move the tower to the rightmost peg.',
            category: 'strategy'
        });
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Move the tower to the last peg', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.numDisks = 3 + (this.level - 1); // Increase disks with level
        this.pegs = [[], [], []];
        this.disks = [];
        
        const pegWidth = 20;
        const pegHeight = 200;
        const baseWidth = 600;
        const baseHeight = 20;
        const startX = this.cameras.main.centerX - 200;
        const startY = this.cameras.main.centerY + 100;
        
        // Draw base
        this.add.rectangle(this.cameras.main.centerX, startY + pegHeight/2 + 10, baseWidth, baseHeight, 0x8B4513);
        
        // Draw pegs
        this.pegZones = [];
        for (let i = 0; i < 3; i++) {
            const x = startX + i * 200;
            const y = startY;
            this.add.rectangle(x, y, pegWidth, pegHeight, 0xDEB887);
            
            // Drop zone for peg
            const zone = this.add.zone(x, y, 100, 300).setRectangleDropZone(100, 300);
            zone.pegIndex = i;
            this.pegZones.push(zone);
        }
        
        // Create disks
        for (let i = this.numDisks; i > 0; i--) {
            const width = 40 + i * 30;
            const height = 30;
            const color = 0xFF0000 + (i * 50); // Varying colors
            
            const disk = this.add.rectangle(0, 0, width, height, color);
            disk.setStrokeStyle(2, 0x000000);
            disk.setInteractive({ draggable: true });
            disk.diskSize = i;
            
            this.disks.push(disk);
            this.pegs[0].push(disk); // All start on peg 0
        }
        
        this.updateDiskPositions();
        
        this.input.on('dragstart', (pointer, gameObject) => {
            // Only allow dragging the top disk of a peg
            const pegIndex = this.getPegIndexOfDisk(gameObject);
            const peg = this.pegs[pegIndex];
            if (peg[peg.length - 1] !== gameObject) {
                gameObject.disableInteractive(); // Temp disable? No, just stop drag
                // Actually, better to check in dragstart and return if invalid
                // But Phaser dragstart doesn't easily cancel.
                // We can just reset position immediately in drag end if invalid start.
                this.validDrag = false;
            } else {
                this.validDrag = true;
                this.children.bringToTop(gameObject);
                gameObject.startPos = { x: gameObject.x, y: gameObject.y };
            }
        });
        
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.validDrag) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        });
        
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (!this.validDrag) return;
            
            const fromPegIndex = this.getPegIndexOfDisk(gameObject);
            const toPegIndex = dropZone.pegIndex;
            
            if (this.isValidMove(fromPegIndex, toPegIndex)) {
                // Move disk
                this.pegs[fromPegIndex].pop();
                this.pegs[toPegIndex].push(gameObject);
                this.updateDiskPositions();
                this.checkWinCondition();
            } else {
                // Return to start
                gameObject.x = gameObject.startPos.x;
                gameObject.y = gameObject.startPos.y;
            }
        });
        
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (!dropped || !this.validDrag) {
                gameObject.x = gameObject.startPos.x;
                gameObject.y = gameObject.startPos.y;
            }
        });
    }
    
    getPegIndexOfDisk(disk) {
        for (let i = 0; i < 3; i++) {
            if (this.pegs[i].includes(disk)) return i;
        }
        return -1;
    }
    
    isValidMove(from, to) {
        if (from === to) return false;
        const toPeg = this.pegs[to];
        if (toPeg.length === 0) return true;
        const topDisk = toPeg[toPeg.length - 1];
        const movingDisk = this.pegs[from][this.pegs[from].length - 1];
        return movingDisk.diskSize < topDisk.diskSize;
    }
    
    updateDiskPositions() {
        const startX = this.cameras.main.centerX - 200;
        const startY = this.cameras.main.centerY + 100;
        const pegHeight = 200;
        
        for (let i = 0; i < 3; i++) {
            const peg = this.pegs[i];
            const x = startX + i * 200;
            for (let j = 0; j < peg.length; j++) {
                const disk = peg[j];
                const y = startY + pegHeight/2 - (j * 30) - 15; // Stack from bottom
                disk.x = x;
                disk.y = y;
            }
        }
    }
    
    checkWinCondition() {
        // Win if all disks are on the last peg (index 2)
        if (this.pegs[2].length === this.numDisks) {
            this.time.delayedCall(500, () => {
                this.completeLevel();
            });
        }
    }
}
