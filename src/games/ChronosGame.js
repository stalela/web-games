import { DragDropGame } from './DragDropGame.js';

// Story sequences for different levels
const stories = [
    {
        title: 'Morning Routine',
        images: [
            { id: 1, description: 'Wake up', emoji: '🌅' },
            { id: 2, description: 'Brush teeth', emoji: '🪥' },
            { id: 3, description: 'Eat breakfast', emoji: '🍳' },
            { id: 4, description: 'Go to school', emoji: '🏫' }
        ]
    },
    {
        title: 'Growing a Plant',
        images: [
            { id: 1, description: 'Plant seed', emoji: '🌱' },
            { id: 2, description: 'Water it', emoji: '💧' },
            { id: 3, description: 'Sunlight', emoji: '☀️' },
            { id: 4, description: 'Flower blooms', emoji: '🌸' }
        ]
    },
    {
        title: 'Making a Cake',
        images: [
            { id: 1, description: 'Gather ingredients', emoji: '🥚' },
            { id: 2, description: 'Mix batter', emoji: '🥣' },
            { id: 3, description: 'Bake in oven', emoji: '🔥' },
            { id: 4, description: 'Decorate cake', emoji: '🎂' }
        ]
    },
    {
        title: 'Life of a Butterfly',
        images: [
            { id: 1, description: 'Egg', emoji: '🥚' },
            { id: 2, description: 'Caterpillar', emoji: '🐛' },
            { id: 3, description: 'Cocoon', emoji: '🧵' },
            { id: 4, description: 'Butterfly', emoji: '🦋' }
        ]
    },
    {
        title: 'Building a Snowman',
        images: [
            { id: 1, description: 'Snow falls', emoji: '❄️' },
            { id: 2, description: 'Roll snowball', emoji: '⚪' },
            { id: 3, description: 'Stack balls', emoji: '☃️' },
            { id: 4, description: 'Add face', emoji: '⛄' }
        ]
    },
    {
        title: 'Evolution of Transport',
        images: [
            { id: 1, description: 'Walking', emoji: '🚶' },
            { id: 2, description: 'Horse', emoji: '🐴' },
            { id: 3, description: 'Car', emoji: '🚗' },
            { id: 4, description: 'Airplane', emoji: '✈️' },
            { id: 5, description: 'Rocket', emoji: '🚀' }
        ]
    }
];

export class ChronosGame extends DragDropGame {
    constructor(config) {
        super({
            ...config,
            key: 'ChronosGame',
            title: 'Chronos',
            description: 'Arrange the pictures to tell a story in order.',
            category: 'sciences'
        });
        
        this.currentLevel = 0;
        this.slots = [];
        this.draggables = [];
        this.userOrder = [];
    }

    preload() {
        super.preload();
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x4a6fa5, 0x4a6fa5, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        const { width } = this.cameras.main;
        
        this.add.text(width / 2, 30, 'Chronos - Story Order', {
            fontFamily: 'Nunito, Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.storyTitle = this.add.text(width / 2, 70, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#FACA2A',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.instructionText = this.add.text(width / 2, 100, 'Drag the events into the correct order!', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.levelText = this.add.text(width - 100, 30, '', {
            fontFamily: 'Nunito, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    setupGameLogic() {
        this.startLevel(0);
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.clearLevel();
        
        const story = stories[levelIndex];
        this.storyTitle.setText(story.title);
        this.levelText.setText(`Level: ${levelIndex + 1}/${stories.length}`);
        
        this.createSlots(story.images.length);
        this.createDraggables(story.images);
        this.createCheckButton();
    }

    createSlots(count) {
        const { width, height } = this.cameras.main;
        const slotWidth = 100;
        const spacing = 20;
        const totalWidth = count * slotWidth + (count - 1) * spacing;
        const startX = (width - totalWidth) / 2 + slotWidth / 2;
        const slotY = height / 2 + 80;
        
        this.slots = [];
        
        for (let i = 0; i < count; i++) {
            const x = startX + i * (slotWidth + spacing);
            
            // Slot background
            const slot = this.add.rectangle(x, slotY, slotWidth, slotWidth, 0x444444, 0.5);
            slot.setStrokeStyle(3, 0xffffff);
            slot.slotIndex = i;
            slot.occupied = null;
            
            // Number label
            const num = this.add.text(x, slotY + slotWidth / 2 + 20, `${i + 1}`, {
                fontFamily: 'Nunito, Arial',
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            this.slots.push({ rect: slot, label: num, x, y: slotY });
        }
    }

    createDraggables(images) {
        const { width, height } = this.cameras.main;
        const cardWidth = 100;
        const spacing = 20;
        
        // Shuffle images
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        
        const totalWidth = shuffled.length * cardWidth + (shuffled.length - 1) * spacing;
        const startX = (width - totalWidth) / 2 + cardWidth / 2;
        const cardY = height / 2 - 80;
        
        this.draggables = [];
        
        shuffled.forEach((img, i) => {
            const x = startX + i * (cardWidth + spacing);
            
            // Card background
            const card = this.add.rectangle(x, cardY, cardWidth, cardWidth, 0x0062FF);
            card.setStrokeStyle(2, 0xffffff);
            card.setInteractive({ draggable: true, useHandCursor: true });
            card.correctOrder = img.id;
            card.originalX = x;
            card.originalY = cardY;
            card.currentSlot = null;
            
            // Emoji
            const emoji = this.add.text(x, cardY - 10, img.emoji, {
                fontSize: '40px'
            }).setOrigin(0.5);
            
            // Description
            const desc = this.add.text(x, cardY + 35, img.description, {
                fontFamily: 'Nunito, Arial',
                fontSize: '12px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: cardWidth - 10 }
            }).setOrigin(0.5);
            
            this.input.setDraggable(card);
            
            card.on('drag', (pointer, dragX, dragY) => {
                card.x = dragX;
                card.y = dragY;
                emoji.x = dragX;
                emoji.y = dragY - 10;
                desc.x = dragX;
                desc.y = dragY + 35;
            });
            
            card.on('dragend', () => {
                this.handleDrop(card, emoji, desc);
            });
            
            this.draggables.push({ card, emoji, desc });
        });
    }

    handleDrop(card, emoji, desc) {
        let placed = false;
        
        this.slots.forEach(slot => {
            const bounds = slot.rect.getBounds();
            
            if (Phaser.Geom.Rectangle.Contains(bounds, card.x, card.y)) {
                // Check if slot is already occupied
                if (slot.occupied && slot.occupied !== card) {
                    // Swap with existing card
                    const existingCard = slot.occupied;
                    const existingData = this.draggables.find(d => d.card === existingCard);
                    
                    // Move existing card back to source card's previous slot or original position
                    if (card.currentSlot) {
                        existingCard.x = card.currentSlot.x;
                        existingCard.y = card.currentSlot.y;
                        existingData.emoji.x = card.currentSlot.x;
                        existingData.emoji.y = card.currentSlot.y - 10;
                        existingData.desc.x = card.currentSlot.x;
                        existingData.desc.y = card.currentSlot.y + 35;
                        card.currentSlot.occupied = existingCard;
                        existingCard.currentSlot = card.currentSlot;
                    } else {
                        existingCard.x = existingCard.originalX;
                        existingCard.y = existingCard.originalY;
                        existingData.emoji.x = existingCard.originalX;
                        existingData.emoji.y = existingCard.originalY - 10;
                        existingData.desc.x = existingCard.originalX;
                        existingData.desc.y = existingCard.originalY + 35;
                        existingCard.currentSlot = null;
                    }
                }
                
                // Place card in slot
                card.x = slot.x;
                card.y = slot.y;
                emoji.x = slot.x;
                emoji.y = slot.y - 10;
                desc.x = slot.x;
                desc.y = slot.y + 35;
                
                slot.occupied = card;
                card.currentSlot = slot;
                placed = true;
                
                if (this.audioManager) this.audioManager.playSound('click');
            }
        });
        
        if (!placed) {
            // Return to original position if not on a slot
            if (card.currentSlot) {
                card.currentSlot.occupied = null;
            }
            card.x = card.originalX;
            card.y = card.originalY;
            emoji.x = card.originalX;
            emoji.y = card.originalY - 10;
            desc.x = card.originalX;
            desc.y = card.originalY + 35;
            card.currentSlot = null;
        }
    }

    createCheckButton() {
        const { width, height } = this.cameras.main;
        
        this.checkBtn = this.add.text(width / 2, height - 80, 'Check Order ✓', {
            fontFamily: 'Nunito, Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#00B378',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.checkBtn.on('pointerdown', () => this.checkAnswer());
    }

    checkAnswer() {
        // Check if all slots are filled
        const allFilled = this.slots.every(s => s.occupied !== null);
        if (!allFilled) {
            this.instructionText.setText('Fill all slots first!');
            return;
        }
        
        // Check order
        let correct = true;
        this.slots.forEach((slot, i) => {
            const expectedOrder = i + 1;
            const cardOrder = slot.occupied.correctOrder;
            
            if (cardOrder === expectedOrder) {
                slot.rect.setStrokeStyle(4, 0x00ff00);
            } else {
                slot.rect.setStrokeStyle(4, 0xff0000);
                correct = false;
            }
        });
        
        if (correct) {
            if (this.audioManager) this.audioManager.playSound('win');
            this.time.delayedCall(1500, () => this.nextLevel());
        } else {
            if (this.audioManager) this.audioManager.playSound('error');
            this.instructionText.setText('Not quite right! Try again.');
        }
    }

    nextLevel() {
        if (this.currentLevel < stories.length - 1) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.scene.start('GameMenu');
        }
    }

    clearLevel() {
        this.slots.forEach(s => {
            s.rect.destroy();
            s.label.destroy();
        });
        this.draggables.forEach(d => {
            d.card.destroy();
            d.emoji.destroy();
            d.desc.destroy();
        });
        if (this.checkBtn) this.checkBtn.destroy();
        this.slots = [];
        this.draggables = [];
    }
}
