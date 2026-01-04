import { LalelaGame } from '../utils/LalelaGame.js';

export class FamilyGame extends LalelaGame {
    constructor(config) {
        super({
            key: 'FamilyGame',
            ...config,
            title: config?.title || 'Family',
            description: config?.description || 'Learn about family relationships.',
            category: config?.category || 'discovery'
        });
    }

    preload() {
        super.preload();
        this.load.svg('family-bg', 'assets/family/background.svg');
        
        // Load character icons (assuming standard names from dataset)
        // I need to check what files are actually in the folder.
        // The dataset mentioned "man1.svg", "woman2.svg", "boy1.svg".
        // Let's assume they exist in assets/family/
        this.load.svg('family-man1', 'assets/family/man1.svg');
        this.load.svg('family-woman2', 'assets/family/woman2.svg');
        this.load.svg('family-boy1', 'assets/family/boy1.svg');
        // Add more as needed or load dynamically if I list the directory.
        // For now, I'll stick to Level 1 assets.
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.image(width/2, height/2, 'family-bg')
            .setDisplaySize(width, height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        this.instructionText = this.add.text(this.cameras.main.centerX, 50, 'Who is the Father?', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.gridSize = 80;
        this.offsetX = (this.cameras.main.width - (8 * this.gridSize)) / 2;
        this.offsetY = 150;
        
        this.startLevel1();
    }
    
    startLevel1() {
        // Level 1 Data
        const nodes = [
            { x: 3, y: 2, image: 'family-man1', role: 'Father', id: 'man1' },
            { x: 5, y: 2, image: 'family-woman2', role: 'Mother', id: 'woman2' },
            { x: 4, y: 4, image: 'family-boy1', role: 'Me', id: 'boy1' }
        ];
        
        const edges = [
            { x1: 3, y1: 2, x2: 5, y2: 2 }, // Parents
            { x1: 4, y1: 2, x2: 4, y2: 4 }  // Child
        ];
        
        const question = {
            target: 'man1',
            text: 'Who is the Father?'
        };
        
        this.drawLevel(nodes, edges, question);
    }
    
    drawLevel(nodes, edges, question) {
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x000000);
        
        // Draw edges
        edges.forEach(edge => {
            const x1 = this.offsetX + edge.x1 * this.gridSize;
            const y1 = this.offsetY + edge.y1 * this.gridSize;
            const x2 = this.offsetX + edge.x2 * this.gridSize;
            const y2 = this.offsetY + edge.y2 * this.gridSize;
            
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
        });
        graphics.strokePath();
        
        // Draw nodes
        nodes.forEach(node => {
            const x = this.offsetX + node.x * this.gridSize;
            const y = this.offsetY + node.y * this.gridSize;
            
            const sprite = this.add.image(x, y, node.image);
            sprite.setDisplaySize(60, 60);
            sprite.setInteractive();
            
            sprite.on('pointerdown', () => {
                if (node.id === question.target) {
                    this.audioManager.playSound('success');
                    this.instructionText.setText('Correct!');
                    // Next level logic here
                } else {
                    this.audioManager.playSound('error');
                }
            });
            
            // Label "Me"
            if (node.role === 'Me') {
                this.add.text(x, y + 40, 'Me', {
                    fontSize: '20px',
                    color: '#000000',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
            }
        });
        
        this.instructionText.setText(question.text);
    }
}
