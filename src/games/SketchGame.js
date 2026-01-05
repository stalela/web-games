import { LalelaGame } from '../utils/LalelaGame.js';

export class SketchGame extends LalelaGame {
    constructor() {
        super();
        this.brushColor = 0x000000;
        this.brushSize = 5;
        this.isDrawing = false;
    }

    preload() {
        super.preload();
        this.load.image('brush', 'assets/sketch/brushTools.svg');
        this.load.image('eraser', 'assets/sketch/eraserTools.svg');
        this.load.image('undo', 'assets/sketch/undo.svg');
    }

    create() {
        super.create();
        this.createCanvas();
        this.createUI();
    }

    createCanvas() {
        this.rt = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.rt.fill(0xFFFFFF);
        
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > 100) { // Avoid toolbar
                this.isDrawing = true;
                this.lastX = pointer.x;
                this.lastY = pointer.y;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.isDrawing) {
                this.draw(pointer.x, pointer.y);
                this.lastX = pointer.x;
                this.lastY = pointer.y;
            }
        });
        
        this.input.on('pointerup', () => {
            this.isDrawing = false;
        });
    }

    draw(x, y) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.lineStyle(this.brushSize, this.brushColor);
        graphics.beginPath();
        graphics.moveTo(this.lastX, this.lastY);
        graphics.lineTo(x, y);
        graphics.strokePath();
        this.rt.draw(graphics);
        graphics.destroy();
    }

    createUI() {
        // Toolbar
        const toolbar = this.add.container(50, this.cameras.main.centerY);
        
        const brushBtn = this.add.image(0, -50, 'brush').setDisplaySize(50, 50).setInteractive();
        brushBtn.on('pointerdown', () => {
            this.brushColor = 0x000000;
            this.brushSize = 5;
        });
        
        const eraserBtn = this.add.image(0, 50, 'eraser').setDisplaySize(50, 50).setInteractive();
        eraserBtn.on('pointerdown', () => {
            this.brushColor = 0xFFFFFF;
            this.brushSize = 20;
        });
        
        const undoBtn = this.add.image(0, 150, 'undo').setDisplaySize(50, 50).setInteractive();
        undoBtn.on('pointerdown', () => {
            this.rt.fill(0xFFFFFF); // Clear for now
        });
        
        toolbar.add([brushBtn, eraserBtn, undoBtn]);
    }
}
