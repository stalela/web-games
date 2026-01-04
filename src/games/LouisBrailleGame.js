import { LalelaGame } from '../utils/LalelaGame.js';
import { BrailleCell } from '../components/BrailleCell.js';

export class LouisBrailleGame extends LalelaGame {
    constructor() {
        super();
        this.isStoryMode = true;
        this.currentStoryIndex = 0;
        this.storyItems = [];
    }

    preload() {
        super.preload();
        
        // Load assets based on louis_braille_data.js
        // Note: We map .webp to .svg if that's what we have in the assets folder
        this.load.svg('louis-louis', 'assets/louis-braille/louis.svg'); // Was webp in data
        this.load.svg('louis-stitching_awl', 'assets/louis-braille/stitching_awl.svg');
        this.load.svg('louis-blind', 'assets/louis-braille/blind.svg');
        this.load.svg('louis-paris', 'assets/louis-braille/paris.svg');
        this.load.svg('louis-piano', 'assets/louis-braille/piano.svg');
        this.load.svg('louis-night_writing', 'assets/louis-braille/night_writing.svg');
        this.load.svg('louis-braille', 'assets/louis-braille/braille.svg');
        this.load.svg('louis-teach', 'assets/louis-braille/teach.svg');
        this.load.svg('louis-maths', 'assets/louis-braille/maths.svg');
        this.load.svg('louis-statue', 'assets/louis-braille/statue.svg');
        this.load.svg('louis-world', 'assets/louis-braille/world.svg');

        // UI Assets
        this.load.svg('arrow_left', 'assets/game-icons/arrow_left.svg');
        this.load.svg('arrow_right', 'assets/game-icons/arrow_right.svg');
    }

    createBackground() {
        // Light blue background matching screenshots
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xB4D7F0).setOrigin(0).setDepth(-1);
    }

    createUI() {
        super.createUI();
        // Navigation dock is handled by base class
    }

    setupGameLogic() {
        // Data from louis_braille_data.js
        this.dataset = [
            {
                text: "Born on January 4th 1809 in Coupvray near Paris in France.",
                year: "1809",
                img: "louis-louis"
            },
            {
                text: "Louis Braille injured his right eye with a stitching awl from his father's workshop.",
                year: "1812",
                img: "louis-stitching_awl"
            },
            {
                text: "At the age of three, Louis became blind due to a severe infection that spread to his left eye.",
                year: "1812",
                img: "louis-blind"
            },
            {
                text: "At the age of 10, he was sent to Paris to study at the Royal Institute for Blind Youth.",
                year: "1819",
                img: "louis-paris"
            },
            {
                text: "He impressed his classmates and began to play the piano and the organ.",
                year: "1820",
                img: "louis-piano"
            },
            {
                text: "Charles Barbier, a French soldier, visited his school and shared his invention of night writing, a code of 12 raised dots to share information on battlefields.",
                year: "1821",
                img: "louis-night_writing"
            },
            {
                text: "Louis trimmed Barbier's 12 dots into 6 and invented the braille system.",
                year: "1824",
                img: "louis-braille"
            },
            {
                text: "He became a teacher after graduating and promoted his method while secretly teaching it at the Institute.",
                year: "1828",
                img: "louis-teach"
            },
            {
                text: "He revised and extended braille to include mathematics, symbols, punctuation and music notations.",
                year: "1837",
                img: "louis-maths"
            },
            {
                text: "He died of tuberculosis. He is buried in the Pantheon in Paris. A monument is erected to honor him.",
                year: "1852",
                img: "louis-statue"
            },
            {
                text: "Braille got accepted as a world wide standard. Louis Braille proved that if you have motivation you can do incredible things.",
                year: "After his Death",
                img: "louis-world"
            }
        ];

        // Add sequence index for checking later
        this.dataset.forEach((item, index) => item.sequence = index);

        this.startStoryMode();
    }

    // ==========================================
    // STORY MODE
    // ==========================================

    startStoryMode() {
        this.isStoryMode = true;
        this.currentStoryIndex = 0;
        this.createStoryUI();
        this.showStoryItem(0);
    }

    createStoryUI() {
        if (this.storyContainer) this.storyContainer.destroy();
        this.storyContainer = this.add.container(0, 0);

        const { width, height } = this.cameras.main;
        const safeArea = this.getSafeArea();

        // 1. Braille Header "LOUIS BRAILLE"
        const titleText = "LOUIS BRAILLE";
        const startX = width / 2 - (titleText.length * 40) / 2;
        const brailleY = safeArea.top + 40;

        titleText.split('').forEach((char, i) => {
            if (char !== ' ') {
                const cell = new BrailleCell(this, startX + i * 40, brailleY, 30, 50, false);
                cell.setBraille(char);
                this.storyContainer.add(cell);
                
                const letter = this.add.text(startX + i * 40, brailleY + 40, char, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#000000',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                this.storyContainer.add(letter);
            }
        });

        // 2. Description Box
        const boxWidth = Math.min(800, width - 40);
        const boxHeight = 120;
        const boxY = brailleY + 100;

        const boxBg = this.add.rectangle(width / 2, boxY, boxWidth, boxHeight, 0xF0F0F0);
        boxBg.setStrokeStyle(2, 0x000000);
        this.storyContainer.add(boxBg);

        this.storyText = this.add.text(width / 2, boxY, "", {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: boxWidth - 40 }
        }).setOrigin(0.5);
        this.storyContainer.add(this.storyText);

        // 3. Central Image
        this.storyImage = this.add.image(width / 2, boxY + boxHeight / 2 + 150, 'louis-louis');
        this.storyImage.setMaxPreferredHeight(250);
        this.storyContainer.add(this.storyImage);

        // 4. Year Box
        const yearY = this.storyImage.y + 160;
        const yearBg = this.add.rectangle(width / 2, yearY, 150, 50, 0xFFFFFF);
        yearBg.setStrokeStyle(2, 0x000000);
        this.storyContainer.add(yearBg);

        this.storyYear = this.add.text(width / 2, yearY, "", {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);
        this.storyContainer.add(this.storyYear);

        // 5. Navigation Arrows
        const arrowY = this.storyImage.y;
        
        // Previous
        this.prevBtn = this.add.image(width / 2 - 250, arrowY, 'arrow_left')
            .setInteractive({ useHandCursor: true })
            .setScale(1.5);
        this.prevBtn.on('pointerdown', () => this.prevStoryItem());
        this.storyContainer.add(this.prevBtn);

        // Next
        this.nextBtn = this.add.image(width / 2 + 250, arrowY, 'arrow_right')
            .setInteractive({ useHandCursor: true })
            .setScale(1.5);
        this.nextBtn.on('pointerdown', () => this.nextStoryItem());
        this.storyContainer.add(this.nextBtn);
    }

    showStoryItem(index) {
        const item = this.dataset[index];
        
        this.storyText.setText(item.text);
        this.storyYear.setText(item.year);
        this.storyImage.setTexture(item.img);
        
        // Scale image to fit
        const maxDim = 250;
        if (this.storyImage.width > maxDim || this.storyImage.height > maxDim) {
            const scale = maxDim / Math.max(this.storyImage.width, this.storyImage.height);
            this.storyImage.setScale(scale);
        } else {
            this.storyImage.setScale(1);
        }

        // Update button visibility
        this.prevBtn.setVisible(index > 0);
        // Next button is always visible, but changes function on last item
    }

    prevStoryItem() {
        if (this.currentStoryIndex > 0) {
            this.currentStoryIndex--;
            this.showStoryItem(this.currentStoryIndex);
        }
    }

    nextStoryItem() {
        if (this.currentStoryIndex < this.dataset.length - 1) {
            this.currentStoryIndex++;
            this.showStoryItem(this.currentStoryIndex);
        } else {
            // End of story, switch to reorder mode
            this.startReorderMode();
        }
    }

    // ==========================================
    // REORDER MODE
    // ==========================================

    startReorderMode() {
        this.isStoryMode = false;
        this.storyContainer.destroy();
        
        // Title
        this.add.text(this.cameras.main.width / 2, 50, 'The Story of Louis Braille', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Shuffle items for the game
        this.gameItems = this.shuffleArray([...this.dataset]);
        this.createReorderList();
    }

    createReorderList() {
        const { width, height } = this.cameras.main;
        const safeArea = this.getSafeArea();
        
        if (this.listContainer) this.listContainer.destroy();
        this.listContainer = this.add.container(0, 0);

        const itemHeight = 60; // Compact height to fit all items
        const itemWidth = Math.min(800, width - 40);
        const startY = 100;
        const spacing = 10;

        this.dragItems = [];

        this.gameItems.forEach((data, index) => {
            const y = startY + index * (itemHeight + spacing);
            const item = this.createDraggableItem(data, index, width / 2, y, itemWidth, itemHeight);
            this.listContainer.add(item);
            this.dragItems.push(item);
        });

        // OK Button
        const okBtn = this.add.container(width - 80, height - 80);
        const okBg = this.add.circle(0, 0, 40, 0x00B378);
        const okText = this.add.text(0, 0, 'OK', { 
            fontSize: '24px', 
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        okBtn.add([okBg, okText]);
        okBtn.setSize(80, 80);
        okBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.checkOrder());
            
        this.listContainer.add(okBtn);
    }

    createDraggableItem(data, index, x, y, w, h) {
        const container = this.add.container(x, y);
        container.setSize(w, h);
        
        // Background
        const bg = this.add.rectangle(0, 0, w, h, 0xFFFFFF);
        bg.setStrokeStyle(1, 0xAAAAAA);
        container.add(bg);
        container.bg = bg; // Reference for highlighting

        // Image (Left)
        const img = this.add.image(-w/2 + h/2 + 10, 0, data.img);
        const scale = (h - 10) / Math.max(img.width, img.height);
        img.setScale(scale);
        container.add(img);

        // Text (Right)
        const text = this.add.text(-w/2 + h + 20, 0, data.text, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#000000',
            wordWrap: { width: w - h - 30 }
        }).setOrigin(0, 0.5);
        container.add(text);

        // Drag Logic
        container.setInteractive({ draggable: true });
        container.dataItem = data;
        container.currentIndex = index;

        this.input.setDraggable(container);

        container.on('dragstart', () => {
            this.children.bringToTop(this.listContainer); // Ensure list is on top
            this.listContainer.bringToTop(container);
            bg.setFillStyle(0xE6F3FF); // Highlight
            container.setScale(1.02);
        });

        container.on('drag', (pointer, dragX, dragY) => {
            container.y = dragY;
            // Constrain Y to list area
            // Simple visual feedback for reordering could be added here
        });

        container.on('dragend', () => {
            bg.setFillStyle(0xFFFFFF);
            container.setScale(1);
            this.reorderList(container);
        });

        return container;
    }

    reorderList(droppedItem) {
        // Find new index based on Y position
        const startY = 100;
        const itemHeight = 60;
        const spacing = 10;
        const totalHeight = itemHeight + spacing;

        let newIndex = Math.floor((droppedItem.y - startY + itemHeight/2) / totalHeight);
        newIndex = Math.max(0, Math.min(newIndex, this.dragItems.length - 1));

        // Remove from old position
        const oldIndex = this.dragItems.indexOf(droppedItem);
        this.dragItems.splice(oldIndex, 1);
        
        // Insert at new position
        this.dragItems.splice(newIndex, 0, droppedItem);

        // Animate all items to new positions
        this.dragItems.forEach((item, index) => {
            this.tweens.add({
                targets: item,
                y: startY + index * totalHeight,
                duration: 200,
                ease: 'Power2'
            });
            item.currentIndex = index;
        });
    }

    checkOrder() {
        let correct = true;
        this.dragItems.forEach((item, index) => {
            if (item.dataItem.sequence !== index) {
                correct = false;
                // Visual feedback for wrong items
                item.bg.setStrokeStyle(2, 0xFF0000);
            } else {
                item.bg.setStrokeStyle(2, 0x00B378);
            }
        });

        if (correct) {
            this.audioManager.playSound('success');
            this.uiManager.showWinModal(() => {
                this.scene.start('GameMenu');
            });
        } else {
            this.audioManager.playSound('error');
            this.uiManager.showFeedback("Try again! The events are not in the correct order.");
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
