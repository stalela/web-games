import { DragDropGame } from './DragDropGame.js';

export class Railroad extends DragDropGame {
    constructor() {
        super();
        this.trainCars = [];
        this.slots = [];
        this.modelTrain = [];
        this.carTypes = ['locomotive', 'wagon_red', 'wagon_blue', 'wagon_green', 'caboose'];
    }

    preload() {
        super.preload();
    }

    init(data) {
        super.init(data);
    }

    createBackground() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x81C784)
            .setOrigin(0, 0)
            .setDepth(-1);
        
        // Tracks
        this.add.rectangle(this.cameras.main.centerX, 200, 600, 10, 0x5D4037);
        this.add.rectangle(this.cameras.main.centerX, 400, 600, 10, 0x5D4037);
    }

    createUI() {
        super.createUI();
        this.add.text(this.cameras.main.centerX, 50, "Rebuild the Train", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        // Clear previous
        this.trainCars.forEach(c => c.destroy());
        this.slots.forEach(s => s.destroy());
        this.trainCars = [];
        this.slots = [];

        // Generate Model Train (Top)
        this.modelTrain = [];
        const trainLength = Phaser.Math.Between(3, 5);
        for (let i = 0; i < trainLength; i++) {
            this.modelTrain.push(Phaser.Math.RND.pick(this.carTypes));
        }

        // Display Model (Top Track)
        const startX = this.cameras.main.centerX - (trainLength * 100) / 2 + 50;
        const modelY = 170;

        this.modelTrain.forEach((type, index) => {
            this.drawCar(startX + index * 100, modelY, type, false);
        });

        // Create Slots (Bottom Track)
        const slotY = 370;
        for (let i = 0; i < trainLength; i++) {
            let zone = this.add.zone(startX + i * 100, slotY, 90, 60).setRectangleDropZone(90, 60);
            zone.expectedType = this.modelTrain[i];
            this.slots.push(zone);
            
            // Visual slot
            this.add.rectangle(startX + i * 100, slotY, 90, 60, 0xffffff, 0.3).setStrokeStyle(2, 0xffffff);
        }

        // Create Draggable Cars (Bottom Area)
        const supplyY = 550;
        const supplyX = this.cameras.main.centerX - (this.carTypes.length * 100) / 2 + 50;
        
        this.carTypes.forEach((type, index) => {
            // Create a spawner/source
            this.drawCar(supplyX + index * 100, supplyY, type, false);
            
            // Create draggable instance
            let car = this.drawCar(supplyX + index * 100, supplyY, type, true);
            car.carType = type;
            car.originalX = car.x;
            car.originalY = car.y;
            this.makeDraggable(car);
            this.trainCars.push(car);
        });
    }

    drawCar(x, y, type, isContainer) {
        let color = 0xcccccc;
        if (type === 'locomotive') color = 0x000000;
        if (type === 'wagon_red') color = 0xff0000;
        if (type === 'wagon_blue') color = 0x0000ff;
        if (type === 'wagon_green') color = 0x00ff00;
        if (type === 'caboose') color = 0xffa500;

        if (isContainer) {
            let container = this.add.container(x, y);
            let body = this.add.rectangle(0, 0, 80, 50, color);
            let wheels1 = this.add.circle(-25, 25, 10, 0x333333);
            let wheels2 = this.add.circle(25, 25, 10, 0x333333);
            container.add([body, wheels1, wheels2]);
            container.setSize(80, 60);
            return container;
        } else {
            this.add.rectangle(x, y, 80, 50, color);
            this.add.circle(x - 25, y + 25, 10, 0x333333);
            this.add.circle(x + 25, y + 25, 10, 0x333333);
        }
    }

    onDrop(pointer, gameObject, dropZone) {
        if (gameObject.carType === dropZone.expectedType) {
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.input.enabled = false;
            this.audioManager.play('success');
            
            // Spawn replacement in supply
            let newCar = this.drawCar(gameObject.originalX, gameObject.originalY, gameObject.carType, true);
            newCar.carType = gameObject.carType;
            newCar.originalX = gameObject.originalX;
            newCar.originalY = gameObject.originalY;
            this.makeDraggable(newCar);
            this.trainCars.push(newCar);

            // Check win (count locked cars)
            let lockedCars = this.trainCars.filter(c => !c.input.enabled).length;
            if (lockedCars === this.modelTrain.length) {
                this.time.delayedCall(1000, () => this.startLevel());
            }
        } else {
            this.audioManager.play('error');
            this.tweens.add({
                targets: gameObject,
                x: gameObject.originalX,
                y: gameObject.originalY,
                duration: 300,
                ease: 'Back.out'
            });
        }
    }
}
