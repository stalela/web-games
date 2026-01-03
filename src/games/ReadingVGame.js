/**
 * ReadingVGame - Vertical reading practice
 * 
 * Converted from GCompris readingv activity.
 * Original authors: Bruno Coudoin, Johnny Jazeix, Timothée Giet
 * 
 * Game description:
 * - A target word is shown on a board
 * - Words appear vertically (stacked), one after another
 * - Player must decide if the target word appeared in the list
 * 
 * Extends ReadingHGame with vertical layout mode.
 */

import { ReadingHGame } from './ReadingHGame.js';

export class ReadingVGame extends ReadingHGame {
    constructor(config = { key: 'ReadingVGame' }) {
        super(config);
        this.mode = 'vertical';
    }
    
    createUI() {
        super.createUI();
        
        // Update title for vertical mode
        this.titleText.setText('Vertical Reading Practice');
    }
    
    createWordDisplayArea() {
        const { width, height } = this.scale;
        
        // Taller area for vertical display
        const areaY = height * 0.48;
        const areaHeight = 200;
        
        const areaBg = this.add.graphics();
        areaBg.fillStyle(0xFFFFFF, 0.8);
        areaBg.fillRoundedRect(width / 2 - 120, areaY - areaHeight / 2, 240, areaHeight, 10);
        areaBg.lineStyle(3, 0xBDBDBD, 1);
        areaBg.strokeRoundedRect(width / 2 - 120, areaY - areaHeight / 2, 240, areaHeight, 10);
        areaBg.setDepth(3);
        
        this.wordDisplayY = areaY - areaHeight / 2 + 30;
        this.wordDisplayHeight = areaHeight;
        
        // Container for words
        this.wordsContainer = this.add.container(0, 0);
        this.wordsContainer.setDepth(5);
    }
    
    displayNextWord() {
        const { width, height } = this.scale;
        
        if (this.currentWordIndex >= this.wordList.length) {
            // All words displayed, wait a moment then show buttons
            this.wordDisplayTimer.remove();
            this.time.delayedCall(500, () => {
                this.showAnswerButtons();
            });
            return;
        }
        
        const word = this.wordList[this.currentWordIndex];
        
        // Create word text
        const wordText = this.add.text(0, 0, word.toUpperCase(), {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333'
        }).setOrigin(0.5);
        
        // Vertical: words stack from top to bottom
        const yPos = this.wordDisplayY + (this.currentWordIndex * 32);
        wordText.setPosition(width / 2, yPos);
        this.wordsContainer.add(wordText);
        
        // Scale in animation
        wordText.setScale(0);
        this.tweens.add({
            targets: wordText,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        this.displayedWords.push(wordText);
        this.currentWordIndex++;
    }
    
    showAnswerButtons() {
        // Don't clear words in vertical mode - they stay visible
        // Show answer buttons
        this.yesButton.setVisible(true);
        this.noButton.setVisible(true);
        this.buttonsBlocked = false;
    }
    
    showCorrectFeedback() {
        const { width, height } = this.scale;
        
        // Green flash
        const flash = this.add.graphics();
        flash.fillStyle(0x4CAF50, 0.3);
        flash.fillRect(0, 0, width, height);
        flash.setDepth(40);
        
        this.time.delayedCall(800, () => {
            flash.destroy();
            // Clear vertical words
            this.wordsContainer.removeAll(true);
            this.currentSubLevel++;
            this.initSubLevel();
        });
    }
    
    showWrongFeedback() {
        const { width, height } = this.scale;
        
        // Highlight the target word if it was in the list
        if (this.targetInList) {
            this.displayedWords.forEach(wordObj => {
                if (wordObj.text === this.targetWord.toUpperCase()) {
                    wordObj.setColor('#D32F2F');
                    wordObj.setStyle({ fontFamily: 'Arial Black, sans-serif' });
                }
            });
        }
        
        // Red flash
        const flash = this.add.graphics();
        flash.fillStyle(0xF44336, 0.3);
        flash.fillRect(0, 0, width, height);
        flash.setDepth(40);
        
        // Show correct answer
        const correctText = this.targetInList ? 'The word WAS in the list!' : 'The word was NOT in the list.';
        const feedback = this.add.text(width / 2, height * 0.8, correctText, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#D32F2F',
            backgroundColor: '#FFFFFF',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(41);
        
        this.time.delayedCall(2000, () => {
            flash.destroy();
            feedback.destroy();
            // Clear vertical words
            this.wordsContainer.removeAll(true);
            // Retry same question
            this.initSubLevel();
        });
    }
}
