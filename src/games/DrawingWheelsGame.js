import { LalelaGame } from '../utils/LalelaGame.js';

export class DrawingWheelsGame extends LalelaGame {
    constructor() {
        super();
        this.rings = [96, 84, 80, 72, 70, 55, 50];
        this.gears = [30, 40, 45, 52, 60, 80];
        this.currentRingIndex = 0;
        this.currentGearIndex = 0;
        this.penOffset = 0.8; // 0 to 1 (relative to gear radius)
        this.isDrawing = false;
        this.t = 0;
        this.speed = 0.1;
        this.color = 0x000000;
        this.colors = [0x000000, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFA500, 0x800080];
        this.currentColorIndex = 0;
    }

    preload() {
        super.preload();
        this.load.image('gear_icon', 'assets/drawing_wheels/gear.svg');
        this.load.image('wheel_icon', 'assets/drawing_wheels/wheel.svg');
        this.load.image('play_icon', 'assets/drawing_wheels/play.svg');
        this.load.image('stop_icon', 'assets/drawing_wheels/stop.svg');
    }

    create() {
        super.create();
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xFFFFFF)
            .setOrigin(0, 0)
            .setDepth(-1);
            
        // Drawing canvas (RenderTexture)
        this.canvas = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.canvas.setDepth(0);
    }

    createUI() {
        super.createUI();
        
        // Controls Panel
        const panelX = this.cameras.main.width - 250;
        this.add.rectangle(panelX, 0, 250, this.cameras.main.height, 0xEEEEEE).setOrigin(0, 0).setDepth(10);
        
        let y = 50;
        
        // Ring Selection
        this.add.text(panelX + 20, y, "Ring Size:", { fontFamily: "Arial", fontSize: "20px", color: "#000" }).setDepth(11);
        y += 40;
        this.ringText = this.add.text(panelX + 125, y, this.rings[this.currentRingIndex].toString(), { fontFamily: "Arial", fontSize: "24px", color: "#000" }).setOrigin(0.5).setDepth(11);
        this.createButton(panelX + 50, y, "<", () => this.changeRing(-1));
        this.createButton(panelX + 200, y, ">", () => this.changeRing(1));
        
        y += 60;
        
        // Gear Selection
        this.add.text(panelX + 20, y, "Gear Size:", { fontFamily: "Arial", fontSize: "20px", color: "#000" }).setDepth(11);
        y += 40;
        this.gearText = this.add.text(panelX + 125, y, this.gears[this.currentGearIndex].toString(), { fontFamily: "Arial", fontSize: "24px", color: "#000" }).setOrigin(0.5).setDepth(11);
        this.createButton(panelX + 50, y, "<", () => this.changeGear(-1));
        this.createButton(panelX + 200, y, ">", () => this.changeGear(1));
        
        y += 60;
        
        // Pen Offset
        this.add.text(panelX + 20, y, "Pen Position:", { fontFamily: "Arial", fontSize: "20px", color: "#000" }).setDepth(11);
        y += 40;
        this.penText = this.add.text(panelX + 125, y, Math.round(this.penOffset * 100) + "%", { fontFamily: "Arial", fontSize: "24px", color: "#000" }).setOrigin(0.5).setDepth(11);
        this.createButton(panelX + 50, y, "-", () => this.changePen(-0.1));
        this.createButton(panelX + 200, y, "+", () => this.changePen(0.1));
        
        y += 60;
        
        // Color Selection
        this.add.text(panelX + 20, y, "Color:", { fontFamily: "Arial", fontSize: "20px", color: "#000" }).setDepth(11);
        y += 40;
        this.colorPreview = this.add.circle(panelX + 125, y, 20, this.colors[this.currentColorIndex]).setDepth(11);
        this.createButton(panelX + 50, y, "<", () => this.changeColor(-1));
        this.createButton(panelX + 200, y, ">", () => this.changeColor(1));
        
        y += 80;
        
        // Play/Stop
        this.playBtn = this.add.image(panelX + 80, y, 'play_icon').setInteractive({ useHandCursor: true }).setScale(0.5).setDepth(11);
        this.playBtn.on('pointerdown', () => this.toggleDrawing());
        
        this.clearBtn = this.add.text(panelX + 170, y, "Clear", { fontFamily: "Arial", fontSize: "20px", color: "#000", backgroundColor: "#DDD", padding: { x: 10, y: 5 } })
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
        this.clearBtn.on('pointerdown', () => this.clearCanvas());
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#000",
            backgroundColor: "#DDD",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
        btn.on('pointerdown', callback);
        return btn;
    }

    changeRing(delta) {
        this.currentRingIndex = (this.currentRingIndex + delta + this.rings.length) % this.rings.length;
        this.ringText.setText(this.rings[this.currentRingIndex].toString());
        this.resetDrawing();
    }

    changeGear(delta) {
        this.currentGearIndex = (this.currentGearIndex + delta + this.gears.length) % this.gears.length;
        this.gearText.setText(this.gears[this.currentGearIndex].toString());
        this.resetDrawing();
    }

    changePen(delta) {
        this.penOffset = Phaser.Math.Clamp(this.penOffset + delta, 0.1, 1.0);
        this.penText.setText(Math.round(this.penOffset * 100) + "%");
        this.resetDrawing();
    }

    changeColor(delta) {
        this.currentColorIndex = (this.currentColorIndex + delta + this.colors.length) % this.colors.length;
        this.color = this.colors[this.currentColorIndex];
        this.colorPreview.setFillStyle(this.color);
    }

    toggleDrawing() {
        this.isDrawing = !this.isDrawing;
        this.playBtn.setTexture(this.isDrawing ? 'stop_icon' : 'play_icon');
    }

    clearCanvas() {
        this.canvas.clear();
        this.resetDrawing();
    }

    resetDrawing() {
        this.t = 0;
        this.lastX = null;
        this.lastY = null;
    }

    setupGameLogic() {
        this.resetDrawing();
    }

    update() {
        if (this.isDrawing) {
            for (let i = 0; i < 10; i++) { // Draw multiple steps per frame for speed
                this.drawStep();
            }
        }
    }

    drawStep() {
        const R = this.rings[this.currentRingIndex] * 3; // Scale up for visibility
        const r = this.gears[this.currentGearIndex] * 3;
        const rho = r * this.penOffset;
        
        const k = r / R;
        const l = rho / r;
        
        // Spirograph formula (Hypotrochoid)
        // x(t) = (R - r) * cos(t) + rho * cos(((R - r) / r) * t)
        // y(t) = (R - r) * sin(t) - rho * sin(((R - r) / r) * t)
        
        const centerX = (this.cameras.main.width - 250) / 2;
        const centerY = this.cameras.main.height / 2;
        
        const x = centerX + (R - r) * Math.cos(this.t) + rho * Math.cos(((R - r) / r) * this.t);
        const y = centerY + (R - r) * Math.sin(this.t) - rho * Math.sin(((R - r) / r) * this.t);
        
        if (this.lastX !== null) {
            this.canvas.line(this.lastX, this.lastY, x, y, this.color, 2);
        }
        
        this.lastX = x;
        this.lastY = y;
        this.t += 0.05;
    }
}
