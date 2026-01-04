import { LalelaGame } from '../utils/LalelaGame.js';

export class CraneGame extends LalelaGame {
    constructor() {
        super();
        this.key = 'CraneGame';
        this.lvl = 1;
        this.subLevel = 0;
        this.maxSubLevels = 5;
        
        // Word lists from GCompris
        this.words3Letters = "cat;dog;win;red;yes;big;box;air;arm;car;bus;fun;day;eat;hat;leg;ice;old;egg".split(';');
        this.words4Letters = "blue;best;good;area;bell;coat;easy;farm;food;else;girl;give;hero;help;hour;sand;song".split(';');
        this.words5Letters = "happy;child;white;apple;brown;truth;fresh;green;horse;hotel;house;paper;shape;shirt;study".split(';');
    }

    preload() {
        super.preload();
        this.load.svg('crane-bg', 'assets/crane/background.svg');
        this.load.svg('crane-arrow-up', 'assets/crane/arrow_up.svg');
        this.load.svg('crane-arrow-down', 'assets/crane/arrow_down.svg');
        this.load.svg('crane-arrow-left', 'assets/crane/arrow_left.svg');
        this.load.svg('crane-arrow-right', 'assets/crane/arrow_right.svg');
        this.load.svg('crane-selected', 'assets/crane/selected.svg');
        
        // Load letter assets
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        for (let char of alphabet) {
            this.load.svg(`crane-letter-${char}`, `assets/crane/letters/${char}.svg`);
        }
    }

    createBackground() {
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'crane-bg')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-1);
    }

    createUI() {
        super.createUI();
        
        this.add.text(20, 20, 'Rebuild the model', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        // On-screen controls
        this.createControls();
    }

    setupGameLogic() {
        this.startLevel();
    }

    startLevel() {
        // Determine word length based on level
        let wordList;
        let cols, rows;
        
        if (this.lvl <= 2) {
            wordList = this.words3Letters;
            cols = 3; rows = 3;
        } else if (this.lvl <= 4) {
            wordList = this.words4Letters;
            cols = 4; rows = 3;
        } else {
            wordList = this.words5Letters;
            cols = 5; rows = 3;
        }

        // Pick a random word
        const word = Phaser.Utils.Array.GetRandom(wordList);
        this.currentWord = word;
        this.gridCols = cols;
        this.gridRows = rows;

        this.createGrids(word);
    }

    createGrids(word) {
        if (this.gridContainer) this.gridContainer.destroy();
        this.gridContainer = this.add.container(0, 0);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const cellSize = 80;
        const spacing = 10;

        // Model Grid (Top)
        const modelY = centerY - 150;
        this.createGrid(centerX, modelY, word, true, cellSize, spacing);

        // Player Grid (Bottom)
        const playerY = centerY + 150;
        this.playerItems = this.createGrid(centerX, playerY, word, false, cellSize, spacing);
        
        // Selection
        this.selectedIndex = 0;
        // Find first non-empty item
        while (this.selectedIndex < this.playerItems.length && !this.playerItems[this.selectedIndex].hasItem) {
            this.selectedIndex++;
        }
        this.updateSelection();

        // Input
        this.input.keyboard.on('keydown-LEFT', () => this.move('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.move('right'));
        this.input.keyboard.on('keydown-UP', () => this.move('up'));
        this.input.keyboard.on('keydown-DOWN', () => this.move('down'));
        this.input.keyboard.on('keydown-SPACE', () => this.selectNext());
        this.input.keyboard.on('keydown-TAB', () => this.selectNext());
    }

    createGrid(centerX, centerY, word, isModel, cellSize, spacing) {
        const totalWidth = this.gridCols * (cellSize + spacing) - spacing;
        const startX = centerX - totalWidth / 2 + cellSize / 2;
        const startY = centerY - (this.gridRows * (cellSize + spacing)) / 2 + cellSize / 2;

        const items = [];
        const positions = [];

        // Generate positions
        for (let r = 0; r < this.gridRows; r++) {
            for (let c = 0; c < this.gridCols; c++) {
                positions.push({
                    x: startX + c * (cellSize + spacing),
                    y: startY + r * (cellSize + spacing),
                    r: r,
                    c: c
                });
            }
        }

        // Prepare items
        const gridItems = new Array(this.gridCols * this.gridRows).fill(null);
        
        // Place word characters randomly
        const indices = Phaser.Utils.Array.NumberArray(0, this.gridCols * this.gridRows - 1);
        Phaser.Utils.Array.Shuffle(indices);

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const posIndex = isModel ? indices[i] : indices[i]; // Same positions for model? No, model should be target?
            // Wait, GCompris logic:
            // setModelWord:
            // "place the word at a random position in the grid"
            // "names[index] = url + ... char"
            // "items.answerRepeater.model = names.length"
            // "items.modelRepeater.model = names2.length"
            // names and names2 seem identical in setModelWord?
            // "names2[index] = names[index]"
            // So the model and the answer start identical?
            // Ah, but then:
            // "Core.shuffle(names)" -> shuffles the answer grid?
            // "items.answerRepeater.itemAt(i).source = names[i]"
            // "items.modelRepeater.itemAt(i).source = names2[i]"
            // So names2 (Model) is NOT shuffled (it keeps the word in order? No, it was set with randomRow/Col).
            // Wait, "names2[index] = names[index]" happens inside the loop where we place chars.
            // So names2 has the word placed at random position.
            // Then "Core.shuffle(names)" shuffles the ANSWER grid.
            // So the Model shows the word intact (but maybe offset), and the Answer shows the letters scattered.
            // And the goal is to make Answer match Model.
        }

        // Let's re-read setModelWord carefully.
        // 1. Initialize names/names2 with empty strings.
        // 2. Pick randomRow/randomCol.
        // 3. Place word chars into names/names2 at sequential indices starting from random pos.
        //    So names/names2 contain the word "cat" like ["", "", "c", "a", "t", "", ...]
        // 4. Core.shuffle(names).
        //    Now names is ["t", "", "c", "", "a", ...] (scrambled).
        //    names2 is still ["", "", "c", "a", "t", "", ...] (target).
        // 5. Set sources.
        
        // So:
        // Model Grid: Shows the word in correct order (contiguous).
        // Player Grid: Shows the letters scattered.
        // Goal: Move letters in Player Grid to match Model Grid.

        // My implementation:
        
        // 1. Create target layout (names2)
        const targetLayout = new Array(this.gridCols * this.gridRows).fill(null);
        const startRow = Math.floor(Math.random() * this.gridRows);
        let startCol = Math.floor(Math.random() * (this.gridCols - word.length + 1));
        
        for (let i = 0; i < word.length; i++) {
            const idx = startRow * this.gridCols + startCol + i;
            targetLayout[idx] = word[i];
        }

        // 2. Create player layout (names) - shuffle of target
        const playerLayout = [...targetLayout];
        if (!isModel) {
            Phaser.Utils.Array.Shuffle(playerLayout);
        }

        const layout = isModel ? targetLayout : playerLayout;

        layout.forEach((char, i) => {
            const pos = positions[i];
            
            // Background slot
            const bg = this.add.rectangle(pos.x, pos.y, cellSize, cellSize, 0xffffff, 0.3);
            bg.setStrokeStyle(2, 0xffffff);
            this.gridContainer.add(bg);

            const itemObj = {
                bg: bg,
                char: char,
                hasItem: !!char,
                sprite: null,
                index: i,
                x: pos.x,
                y: pos.y
            };

            if (char) {
                const sprite = this.add.image(pos.x, pos.y, `crane-letter-${char}`);
                sprite.setDisplaySize(cellSize - 10, cellSize - 10);
                this.gridContainer.add(sprite);
                itemObj.sprite = sprite;
            }

            items.push(itemObj);
        });

        // Store target layout for checking
        if (isModel) {
            this.targetLayout = targetLayout;
        }

        return items;
    }

    updateSelection() {
        // Clear previous selection
        this.playerItems.forEach(item => {
            if (item.bg) item.bg.setStrokeStyle(2, 0xffffff);
        });

        // Highlight new selection
        const item = this.playerItems[this.selectedIndex];
        if (item && item.hasItem) {
            item.bg.setStrokeStyle(4, 0xffff00); // Yellow highlight
            // Or use the selected.svg overlay
        }
    }

    selectNext() {
        let nextIndex = this.selectedIndex + 1;
        while (nextIndex < this.playerItems.length && !this.playerItems[nextIndex].hasItem) {
            nextIndex++;
        }
        
        if (nextIndex >= this.playerItems.length) {
            // Wrap around
            nextIndex = 0;
            while (nextIndex < this.playerItems.length && !this.playerItems[nextIndex].hasItem) {
                nextIndex++;
            }
        }
        
        this.selectedIndex = nextIndex;
        this.updateSelection();
    }

    move(direction) {
        const currentIndex = this.selectedIndex;
        const currentItem = this.playerItems[currentIndex];
        
        if (!currentItem.hasItem) return; // Should not happen if selection logic is correct

        let targetIndex = -1;
        const col = currentIndex % this.gridCols;
        const row = Math.floor(currentIndex / this.gridCols);

        if (direction === 'left' && col > 0) targetIndex = currentIndex - 1;
        if (direction === 'right' && col < this.gridCols - 1) targetIndex = currentIndex + 1;
        if (direction === 'up' && row > 0) targetIndex = currentIndex - this.gridCols;
        if (direction === 'down' && row < this.gridRows - 1) targetIndex = currentIndex + this.gridCols;

        if (targetIndex !== -1) {
            const targetItem = this.playerItems[targetIndex];
            if (!targetItem.hasItem) {
                // Move!
                this.swapItems(currentIndex, targetIndex);
                this.selectedIndex = targetIndex; // Follow the item
                this.updateSelection();
                this.checkWin();
            } else {
                // Blocked sound?
            }
        }
    }

    swapItems(idx1, idx2) {
        const item1 = this.playerItems[idx1];
        const item2 = this.playerItems[idx2];

        // Swap data
        const tempChar = item1.char;
        item1.char = item2.char;
        item2.char = tempChar;

        const tempHasItem = item1.hasItem;
        item1.hasItem = item2.hasItem;
        item2.hasItem = tempHasItem;

        // Move sprite
        if (item1.sprite) {
            this.tweens.add({
                targets: item1.sprite,
                x: item2.x,
                y: item2.y,
                duration: 200
            });
            item1.sprite = null; // It moved away
        }
        
        // If item2 had a sprite (it shouldn't if we only move to empty), move it to item1
        // But logic says we only move to empty. So item2.sprite is null.
        // So we just assign item1's sprite to item2
        
        // Wait, I need to keep track of the sprite object
        // item1.sprite is the Phaser object.
        // We are moving it to item2's position.
        // And we need to update the reference in the array objects.
        
        // Actually, let's just swap the sprite references and animate position
        const sprite = this.playerItems[idx1].sprite; // The one moving
        this.playerItems[idx2].sprite = sprite;
        this.playerItems[idx1].sprite = null;
        
        if (sprite) {
             this.tweens.add({
                targets: sprite,
                x: this.playerItems[idx2].x,
                y: this.playerItems[idx2].y,
                duration: 200
            });
        }
    }

    checkWin() {
        let match = true;
        for (let i = 0; i < this.playerItems.length; i++) {
            const playerChar = this.playerItems[i].char || null;
            const targetChar = this.targetLayout[i] || null;
            if (playerChar !== targetChar) {
                match = false;
                break;
            }
        }

        if (match) {
            this.audioManager.playSound('success');
            this.time.delayedCall(1000, () => {
                this.lvl++;
                this.startLevel();
            });
        }
    }

    createControls() {
        // Add on-screen arrows for touch
        const size = 60;
        const x = this.cameras.main.width - 150;
        const y = this.cameras.main.height - 150;
        
        this.addBtn(x, y - size, 'crane-arrow-up', () => this.move('up'));
        this.addBtn(x, y + size, 'crane-arrow-down', () => this.move('down'));
        this.addBtn(x - size, y, 'crane-arrow-left', () => this.move('left'));
        this.addBtn(x + size, y, 'crane-arrow-right', () => this.move('right'));
        
        // Select button
        this.addBtn(x - 150, y, 'crane-selected', () => this.selectNext());
    }

    addBtn(x, y, texture, callback) {
        const btn = this.add.image(x, y, texture)
            .setInteractive()
            .setDisplaySize(50, 50);
        btn.on('pointerdown', callback);
        return btn;
    }
}
