import { LalelaGame } from '../utils/LalelaGame.js';

// Graph definitions from GCompris
const graphs = [
    {
        minColor: 3,
        edgeList: [[0, 1], [0, 4], [1, 4], [1, 2], [1, 3], [2, 3]],
        nodePositions: [[0, 0], [0.5, 0.5], [1, 0], [1, 1], [0, 1]]
    },
    {
        minColor: 3,
        edgeList: [[0, 1], [0, 3], [1, 2], [1, 3], [2, 3]],
        nodePositions: [[0, 0.5], [0.5, 0], [1, 0.5], [0.5, 1]]
    },
    {
        minColor: 4,
        edgeList: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]],
        nodePositions: [[0.628, 0.5], [0, 0.5], [1, 0], [1, 1]]
    },
    {
        minColor: 3,
        edgeList: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [5, 7],
            [7, 9], [9, 6], [6, 8], [8, 5], [0, 5], [1, 6],
            [2, 7], [3, 8], [4, 9]
        ],
        nodePositions: [
            [0.5, 0], [0.90, 0.44], [0.80, 1],
            [0.20, 1], [0.10, 0.44], [0.5, 0.25],
            [0.75, 0.5], [0.65, 0.8], [0.35, 0.8], [0.25, 0.5]
        ]
    },
    {
        minColor: 5,
        edgeList: [
            [5, 1], [5, 0], [0, 3], [0, 1], [0, 2],
            [2, 4], [2, 1], [3, 4], [3, 2], [4, 1],
            [5, 4], [5, 3]
        ],
        nodePositions: [
            [0.75, 0.00], [0.75, 1.00], [1.00, 0.50],
            [0.25, 0.00], [0.25, 1.00], [0.00, 0.50]
        ]
    },
    {
        minColor: 3,
        edgeList: [
            [5, 4], [2, 0], [0, 1], [1, 5], [4, 3],
            [3, 2], [0, 11], [1, 6], [7, 5], [3, 9],
            [8, 4], [2, 10], [11, 9], [7, 9], [11, 7],
            [6, 8], [10, 8], [6, 10]
        ],
        nodePositions: [
            [0.2, 0.00], [0.8, 0.00], [0.0, 0.50],
            [0.2, 1.00], [0.8, 1.00], [1.0, 0.50],
            [0.6, 0.25], [0.8, 0.50], [0.6, 0.75],
            [0.4, 0.75], [0.2, 0.50], [0.4, 0.25]
        ]
    },
    {
        minColor: 4,
        edgeList: [
            [0, 8], [0, 4], [3, 6], [10, 3], [2, 11],
            [7, 2], [9, 1], [5, 1], [0, 1], [1, 2],
            [4, 6], [8, 9], [10, 11], [0, 3], [3, 2],
            [8, 11], [10, 9], [4, 7], [5, 7], [6, 5],
            [6, 9], [10, 5], [4, 11], [8, 7]
        ],
        nodePositions: [
            [0.00, 0.00], [1.00, 0.00], [1.00, 1.00],
            [0.00, 1.00], [0.20, 0.40], [0.80, 0.40],
            [0.20, 0.60], [0.80, 0.60], [0.40, 0.20],
            [0.60, 0.20], [0.40, 0.80], [0.60, 0.80]
        ]
    }
];

const levels = [
    { extraColor: 1, graphIndex: 0 },
    { extraColor: 0, graphIndex: 0 },
    { extraColor: 1, graphIndex: 1 },
    { extraColor: 0, graphIndex: 1 },
    { extraColor: 1, graphIndex: 2 },
    { extraColor: 0, graphIndex: 2 },
    { extraColor: 1, graphIndex: 3 },
    { extraColor: 0, graphIndex: 3 },
    { extraColor: 1, graphIndex: 4 },
    { extraColor: 0, graphIndex: 4 },
    { extraColor: 1, graphIndex: 5 },
    { extraColor: 0, graphIndex: 5 },
    { extraColor: 1, graphIndex: 6 },
    { extraColor: 0, graphIndex: 6 }
];

const colors = [
    0x2760B5,  // dark blue
    0x8EEB76,  // light green
    0xE65B48,  // red
    0xECA06F,  // orange
    0xE31BE3,  // magenta
    0xE8EF48,  // yellow
    0xBBB082,  // brown
    0x42B324,  // dark green
    0x881744   // dark magenta
];

export class GraphColoringGame extends LalelaGame {
    constructor(config) {
        super({
            ...config,
            key: 'GraphColoringGame',
            title: 'Graph Coloring',
            description: 'Color the graph so that no two adjacent nodes have the same color.',
            category: 'strategy'
        });
        
        this.currentLevel = 0;
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        this.colorPalette = [];
        this.nodeRadius = 30;
    }

    preload() {
        super.preload();
        // Load shape SVGs for visual variety
        const shapes = ['star', 'triangle', 'heart', 'hexagon', 'diamond', 'star_simple', 'cross', 'ring', 'circle'];
        shapes.forEach(shape => {
            this.load.svg(`shape_${shape}`, `assets/graph-coloring/shapes/${shape}.svg`);
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        // Gradient background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a2a6c, 0x1a2a6c, 0xb21f1f, 0xfdbb2d, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        // Title
        this.add.text(width / 2, 30, 'Graph Coloring', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Instructions
        this.instructionText = this.add.text(width / 2, 70, 'Color nodes so adjacent ones are different!', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Level indicator
        this.levelText = this.add.text(width - 100, 30, `Level: 1/${levels.length}`, {
            fontFamily: 'Nunito, Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(this.currentLevel);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.clearLevel();
        
        const levelData = levels[levelIndex];
        const graph = graphs[levelData.graphIndex];
        const numColors = graph.minColor + levelData.extraColor;
        
        this.levelText.setText(`Level: ${levelIndex + 1}/${levels.length}`);
        
        this.createColorPalette(numColors);
        this.createGraph(graph);
    }

    createColorPalette(numColors) {
        const { width, height } = this.cameras.main;
        const paletteY = height - 80;
        const paletteWidth = numColors * 70;
        const startX = (width - paletteWidth) / 2 + 35;
        
        this.colorPalette = [];
        
        for (let i = 0; i < numColors; i++) {
            const x = startX + i * 70;
            const colorCircle = this.add.circle(x, paletteY, 25, colors[i]);
            colorCircle.setStrokeStyle(3, 0xffffff);
            colorCircle.setInteractive({ useHandCursor: true });
            colorCircle.colorIndex = i;
            
            colorCircle.on('pointerdown', () => {
                this.selectColor(i);
            });
            
            colorCircle.on('pointerover', () => {
                colorCircle.setScale(1.2);
            });
            
            colorCircle.on('pointerout', () => {
                colorCircle.setScale(1);
            });
            
            this.colorPalette.push(colorCircle);
        }
        
        // Highlight first color by default
        this.selectedColorIndex = 0;
        this.updateColorSelection();
    }

    selectColor(index) {
        this.selectedColorIndex = index;
        this.updateColorSelection();
        if (this.audioManager) this.audioManager.playSound('click');
    }

    updateColorSelection() {
        this.colorPalette.forEach((circle, i) => {
            if (i === this.selectedColorIndex) {
                circle.setStrokeStyle(4, 0x000000);
                circle.setScale(1.1);
            } else {
                circle.setStrokeStyle(3, 0xffffff);
                circle.setScale(1);
            }
        });
    }

    createGraph(graph) {
        const { width, height } = this.cameras.main;
        
        // Calculate graph bounds
        const graphWidth = width * 0.6;
        const graphHeight = height * 0.5;
        const offsetX = (width - graphWidth) / 2;
        const offsetY = 120;
        
        // Create edges first (so they appear behind nodes)
        this.edges = [];
        graph.edgeList.forEach(([n1, n2]) => {
            const pos1 = graph.nodePositions[n1];
            const pos2 = graph.nodePositions[n2];
            
            const x1 = offsetX + pos1[0] * graphWidth;
            const y1 = offsetY + pos1[1] * graphHeight;
            const x2 = offsetX + pos2[0] * graphWidth;
            const y2 = offsetY + pos2[1] * graphHeight;
            
            const line = this.add.line(0, 0, x1, y1, x2, y2, 0xffffff, 0.8);
            line.setOrigin(0, 0);
            line.setLineWidth(3);
            line.node1 = n1;
            line.node2 = n2;
            this.edges.push(line);
        });
        
        // Create nodes
        this.nodes = [];
        graph.nodePositions.forEach((pos, index) => {
            const x = offsetX + pos[0] * graphWidth;
            const y = offsetY + pos[1] * graphHeight;
            
            // Node container
            const node = this.add.circle(x, y, this.nodeRadius, 0x888888);
            node.setStrokeStyle(3, 0xffffff);
            node.setInteractive({ useHandCursor: true });
            node.nodeIndex = index;
            node.colorIndex = -1; // Uncolored
            
            node.on('pointerdown', () => {
                this.colorNode(node);
            });
            
            node.on('pointerover', () => {
                node.setScale(1.15);
            });
            
            node.on('pointerout', () => {
                node.setScale(1);
            });
            
            this.nodes.push(node);
        });
        
        this.graphData = graph;
    }

    colorNode(node) {
        if (this.selectedColorIndex === undefined) return;
        
        node.colorIndex = this.selectedColorIndex;
        node.setFillStyle(colors[this.selectedColorIndex]);
        
        if (this.audioManager) this.audioManager.playSound('click');
        
        this.checkAdjacent();
        this.checkWin();
    }

    checkAdjacent() {
        // Reset all error states
        this.nodes.forEach(node => {
            node.setStrokeStyle(3, 0xffffff);
        });
        this.edges.forEach(edge => {
            edge.setStrokeStyle(3, 0xffffff);
        });
        
        // Check for conflicts
        this.edges.forEach(edge => {
            const node1 = this.nodes[edge.node1];
            const node2 = this.nodes[edge.node2];
            
            if (node1.colorIndex !== -1 && node2.colorIndex !== -1 &&
                node1.colorIndex === node2.colorIndex) {
                // Conflict! Highlight in red
                node1.setStrokeStyle(4, 0xff0000);
                node2.setStrokeStyle(4, 0xff0000);
                edge.setStrokeStyle(5, 0xff0000);
            }
        });
    }

    checkWin() {
        // Check if all nodes are colored
        const allColored = this.nodes.every(node => node.colorIndex !== -1);
        if (!allColored) return;
        
        // Check for conflicts
        const hasConflict = this.edges.some(edge => {
            const node1 = this.nodes[edge.node1];
            const node2 = this.nodes[edge.node2];
            return node1.colorIndex === node2.colorIndex;
        });
        
        if (!hasConflict) {
            this.time.delayedCall(500, () => {
                if (this.audioManager) this.audioManager.playSound('win');
                this.showWinMessage();
            });
        }
    }

    showWinMessage() {
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(100);
        
        const winText = this.add.text(width / 2, height / 2 - 50, '🎉 Level Complete! 🎉', {
            fontFamily: 'Nunito, Arial',
            fontSize: '48px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);
        
        const nextBtn = this.add.text(width / 2, height / 2 + 50, 'Next Level →', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#0062FF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
        
        nextBtn.on('pointerdown', () => {
            overlay.destroy();
            winText.destroy();
            nextBtn.destroy();
            
            if (this.currentLevel < levels.length - 1) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.scene.start('GameMenu');
            }
        });
    }

    clearLevel() {
        this.nodes.forEach(node => node.destroy());
        this.edges.forEach(edge => edge.destroy());
        this.colorPalette.forEach(color => color.destroy());
        this.nodes = [];
        this.edges = [];
        this.colorPalette = [];
    }
}
