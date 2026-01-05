import { LalelaGame } from '../utils/LalelaGame.js';

export class LangGame extends LalelaGame {
    constructor() {
        super({ key: 'LangGame' });
        this.wordsData = null;
        this.currentChapter = null;
        this.currentLesson = null;
        this.currentWordIndex = 0;
    }

    preload() {
        super.preload();
        this.load.json('lang_words', 'assets/lang/words.json');
        this.load.json('lang_content_en', 'assets/lang/content-en.json');
        // We don't have the actual images/sounds, so we'll use placeholders
        this.load.image('lang_placeholder', 'assets/game-icons/lang.svg');
    }

    create() {
        super.create();
        this.wordsData = this.cache.json.get('lang_words');
        this.createUI();
        this.showChapters();
    }

    createUI() {
        this.add.text(this.cameras.main.centerX, 50, 'Enrich your vocabulary', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.contentContainer = this.add.container(0, 100);
    }

    showChapters() {
        this.contentContainer.removeAll(true);
        this.currentChapter = null;
        this.currentLesson = null;

        let y = 0;
        this.wordsData.forEach((chapter, index) => {
            const btn = this.createButton(this.cameras.main.centerX, y + 50, chapter.name, () => {
                this.showLessons(chapter);
            });
            this.contentContainer.add(btn);
            y += 60;
        });
    }

    showLessons(chapter) {
        this.contentContainer.removeAll(true);
        this.currentChapter = chapter;

        const backBtn = this.createButton(100, 0, 'Back', () => this.showChapters());
        this.contentContainer.add(backBtn);

        let y = 50;
        chapter.content.forEach((lesson, index) => {
            const btn = this.createButton(this.cameras.main.centerX, y + 50, lesson.name, () => {
                this.showWords(lesson);
            });
            this.contentContainer.add(btn);
            y += 60;
        });
    }

    showWords(lesson) {
        this.contentContainer.removeAll(true);
        this.currentLesson = lesson;
        this.currentWordIndex = 0;

        const backBtn = this.createButton(100, 0, 'Back', () => this.showLessons(this.currentChapter));
        this.contentContainer.add(backBtn);

        this.showCurrentWord();
    }

    showCurrentWord() {
        // Clear previous word display (except back button)
        this.contentContainer.list.slice(1).forEach(child => child.destroy());

        const word = this.currentLesson.content[this.currentWordIndex];
        
        // Display Word Text
        const text = this.add.text(this.cameras.main.centerX, 150, word.description, {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(text);

        // Display Placeholder Image
        const img = this.add.image(this.cameras.main.centerX, 300, 'lang_placeholder');
        img.setDisplaySize(200, 200);
        this.contentContainer.add(img);

        // Navigation Buttons
        if (this.currentWordIndex > 0) {
            const prevBtn = this.createButton(this.cameras.main.centerX - 150, 450, 'Previous', () => {
                this.currentWordIndex--;
                this.showCurrentWord();
            });
            this.contentContainer.add(prevBtn);
        }

        if (this.currentWordIndex < this.currentLesson.content.length - 1) {
            const nextBtn = this.createButton(this.cameras.main.centerX + 150, 450, 'Next', () => {
                this.currentWordIndex++;
                this.showCurrentWord();
            });
            this.contentContainer.add(nextBtn);
        }
    }

    createButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 300, 50, 0x0062FF)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);
        
        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, label]);
        return container;
    }
}
