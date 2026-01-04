import { LalelaGame } from '../utils/LalelaGame.js';

export class FindTheDayGame extends LalelaGame {
    constructor(config) {
        super({
            key: 'FindTheDayGame',
            ...config,
            title: 'Find the Day',
            description: 'Find dates and days using a calendar.',
            category: 'math'
        });
    }

    preload() {
        super.preload();

        // Reuse the wooden background used by GCompris calendar activity
        this.load.svg('find-the-day-wood-bg', 'assets/fifteen/background.svg');
        this.load.svg('find-the-day-scroll', 'assets/game-icons/scroll_down.svg');
        this.load.svg('find-the-day-ok', 'assets/game-icons/bar_ok.svg');
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        if (this.textures.exists('find-the-day-wood-bg')) {
            const bg = this.add.image(width / 2, height / 2, 'find-the-day-wood-bg');
            bg.setDepth(-1);

            const source = this.textures.get('find-the-day-wood-bg').getSourceImage();
            if (source && source.width && source.height) {
                const scale = Math.max(width / source.width, height / source.height);
                bg.setScale(scale);
            }
            return;
        }

        super.createBackground();
    }

    createUI() {
        // Use default controls (home/help/etc) but hide base score/progress
        if (this.uiManager) {
            this.uiElements = this.uiManager.createGameUI(this, {
                showScore: false,
                showTimer: false,
                showProgress: false
            });
        }

        this.buildFindTheDayUI();
    }

    setupGameLogic() {
        // Dataset adapted from GCompris find_the_day_dataset.js
        this.datasetLevels = [
            {
                config: {
                    navigationBarVisible: true,
                    minimumDate: '2018-01-01',
                    maximumDate: '2018-12-31',
                    visibleMonth: 7,
                    visibleYear: 2018,
                    mode: 'findYearMonthDay'
                },
                questions: [
                    { question: 'Find the date 13 days after May 3rd.', answer: { year: 2018, month: 4, day: 16 } },
                    { question: 'Find the date 7 days after October 1st.', answer: { year: 2018, month: 9, day: 8 } },
                    { question: 'Find the date 31 days after July 12th.', answer: { year: 2018, month: 7, day: 12 } },
                    { question: 'Find the date two weeks after November 27th.', answer: { year: 2018, month: 11, day: 11 } },
                    { question: 'Find the date 19 days before September 1st.', answer: { year: 2018, month: 7, day: 13 } },
                    { question: 'Find the date 5 days before December 8th.', answer: { year: 2018, month: 11, day: 3 } }
                ]
            },
            {
                config: {
                    navigationBarVisible: true,
                    minimumDate: '2018-01-01',
                    maximumDate: '2018-12-31',
                    visibleMonth: 7,
                    visibleYear: 2018,
                    mode: 'findDayOfWeek'
                },
                questions: [
                    { question: 'Find the day of the week 3 days after December 5th.', answer: { dayOfWeek: 6 } },
                    { question: 'Find the day of the week 12 days before November 12th.', answer: { dayOfWeek: 3 } },
                    { question: 'Find the day of the week 32 days after January 5th.', answer: { dayOfWeek: 2 } },
                    { question: 'Find the day of the week 5 days after February 23rd.', answer: { dayOfWeek: 3 } },
                    { question: 'Find the day of the week 17 days before August 16th.', answer: { dayOfWeek: 1 } }
                ]
            },
            {
                config: {
                    navigationBarVisible: true,
                    minimumDate: '2018-01-01',
                    maximumDate: '2018-12-31',
                    visibleMonth: 7,
                    visibleYear: 2018,
                    mode: 'findYearMonthDay'
                },
                questions: [
                    { question: 'Find the date 2 weeks and 3 days after January 12th.', answer: { year: 2018, month: 0, day: 29 } },
                    { question: 'Find the date 3 weeks and 2 days after March 22nd.', answer: { year: 2018, month: 3, day: 14 } },
                    { question: 'Find the date 5 weeks and 6 days after October 5th.', answer: { year: 2018, month: 10, day: 15 } },
                    { question: 'Find the date 1 week and 1 day before August 8th.', answer: { year: 2018, month: 6, day: 31 } },
                    { question: 'Find the date 2 weeks and 5 days before July 2nd.', answer: { year: 2018, month: 5, day: 13 } }
                ]
            },
            {
                config: {
                    navigationBarVisible: true,
                    minimumDate: '2018-01-01',
                    maximumDate: '2018-12-31',
                    visibleMonth: 7,
                    visibleYear: 2018,
                    mode: 'findDayOfWeek'
                },
                questions: [
                    { question: 'Find the day of the week 5 months and 2 days after July 3rd.', answer: { dayOfWeek: 3 } },
                    { question: 'Find the day of the week 2 months and 4 days after October 8th.', answer: { dayOfWeek: 3 } },
                    { question: 'Find the day of the week 1 month and 3 days before December 28th.', answer: { dayOfWeek: 0 } },
                    { question: 'Find the day of the week 8 months and 7 days after February 28th.', answer: { dayOfWeek: 0 } },
                    { question: 'Find the day of the week 3 months and 3 days before September 15th.', answer: { dayOfWeek: 2 } }
                ]
            },
            {
                config: {
                    navigationBarVisible: true,
                    minimumDate: '2018-01-01',
                    maximumDate: '2018-12-31',
                    visibleMonth: 7,
                    visibleYear: 2018,
                    mode: 'findYearMonthDay'
                },
                questions: [
                    { question: 'Find the date 2 months, 1 week and 5 days after January 12th.', answer: { year: 2018, month: 2, day: 24 } },
                    { question: 'Find the date 3 months, 2 weeks and 1 day after August 23rd.', answer: { year: 2018, month: 11, day: 8 } },
                    { question: 'Find the date 5 months, 3 weeks and 2 days after March 20th.', answer: { year: 2018, month: 8, day: 12 } },
                    { question: 'Find the date 1 month 1 week and 1 day before September 10th.', answer: { year: 2018, month: 7, day: 2 } },
                    { question: 'Find the date 2 months, 1 week and 8 days before April 7th.', answer: { year: 2018, month: 0, day: 23 } }
                ]
            }
        ];
    }

    loadLevelData(levelNumber) {
        const maxLevel = this.datasetLevels?.length || 1;
        const safeIndex = Math.max(0, Math.min(maxLevel - 1, levelNumber - 1));

        this.levelData = {
            number: levelNumber,
            ...this.datasetLevels[safeIndex]
        };
    }

    resetLevel() {
        super.resetLevel();

        this.questionIndex = 0;
        this.correctCount = 0;
        this.selectedDay = null;
        this.selectedDayOfWeek = null;
        this.lastSelectedCell = null;

        const cfg = this.levelData?.config;
        this.visibleYear = cfg?.visibleYear ?? 2018;
        this.visibleMonth = cfg?.visibleMonth ?? 7;
        this.navigationBarVisible = cfg?.navigationBarVisible !== false;

        this.minDate = cfg?.minimumDate ? new Date(cfg.minimumDate) : null;
        this.maxDate = cfg?.maximumDate ? new Date(cfg.maximumDate) : null;

        this.mode = cfg?.mode || 'findYearMonthDay';

        // Sync UI to level state if UI already exists
        if (this.uiBuilt) {
            this.updateCalendarHeader();
            this.renderCalendarGrid();
            this.updateQuestionText();
            this.updateScoreText();
            this.updateModeVisibility();
        }
    }

    onLevelStart() {
        // Prevent auto-advancing into undefined levels
        const maxLevel = this.datasetLevels?.length || 1;
        if (this.level > maxLevel) {
            if (this.uiManager) {
                this.uiManager.showSuccess('All levels completed!');
            }
            this.time.delayedCall(1500, () => this.scene.start('GameMenu'));
            return;
        }

        // Initialize first question
        this.updateModeVisibility();
        this.updateCalendarHeader();
        this.renderCalendarGrid();
        this.updateQuestionText();
        this.updateScoreText();
    }

    buildFindTheDayUI() {
        const { width, height } = this.cameras.main;

        this.uiBuilt = true;

        // Question panel
        this.questionBg = this.add.rectangle(width / 2, 60, Math.min(width - 40, 980), 70, 0x000000, 0.5);
        this.questionBg.setStrokeStyle(2, 0xffffff, 0.5);
        this.questionText = this.add.text(width / 2, 60, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: Math.min(width - 80, 940) }
        }).setOrigin(0.5);

        // Calendar container area
        this.calendarBox = {
            x: width / 2,
            y: height / 2 + 10,
            w: Math.min(width * 0.9, 980),
            h: Math.min(height * 0.62, 560)
        };

        // Semi-transparent backing
        this.calendarBg = this.add.rectangle(
            this.calendarBox.x,
            this.calendarBox.y,
            this.calendarBox.w,
            this.calendarBox.h,
            0x000000,
            0.25
        );

        // Navigation bar (month + arrows)
        const navH = Math.max(48, Math.floor(this.calendarBox.h / 8));
        this.navBarRect = this.add.rectangle(
            this.calendarBox.x,
            this.calendarBox.y - this.calendarBox.h / 2 + navH / 2 + 6,
            this.calendarBox.w - 24,
            navH,
            0xffffff,
            0.85
        );

        this.prevMonthBtn = this.add.image(
            this.navBarRect.x - this.navBarRect.width / 2 + navH / 2 + 6,
            this.navBarRect.y,
            'find-the-day-scroll'
        ).setDisplaySize(navH * 0.8, navH * 0.8);
        this.prevMonthBtn.setRotation(Phaser.Math.DegToRad(90));
        this.prevMonthBtn.setInteractive({ useHandCursor: true });
        this.prevMonthBtn.on('pointerdown', () => this.showPreviousMonth());

        this.nextMonthBtn = this.add.image(
            this.navBarRect.x + this.navBarRect.width / 2 - navH / 2 - 6,
            this.navBarRect.y,
            'find-the-day-scroll'
        ).setDisplaySize(navH * 0.8, navH * 0.8);
        this.nextMonthBtn.setRotation(Phaser.Math.DegToRad(270));
        this.nextMonthBtn.setInteractive({ useHandCursor: true });
        this.nextMonthBtn.on('pointerdown', () => this.showNextMonth());

        this.monthTitleText = this.add.text(this.navBarRect.x, this.navBarRect.y, '', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#2c3e50'
        }).setOrigin(0.5);

        // Day of week header + grid container
        this.calendarContentTopY = this.navBarRect.y + navH / 2 + 8;
        this.calendarContentBottomY = this.calendarBox.y + this.calendarBox.h / 2 - 12;

        this.dayHeaderTexts = [];
        this.gridCells = [];

        // Day-of-week answer choices (for findDayOfWeek mode)
        this.dayChoiceContainer = this.add.container(0, 0);
        this.dayChoiceButtons = [];
        this.createDayOfWeekChoices();

        // OK button + score (bottom right)
        const okSize = Math.min(92, Math.max(64, Math.floor(Math.min(width, height) * 0.1)));
        const okY = height - 120;
        const okX = width - 60;

        this.okButton = this.add.image(okX, okY, 'find-the-day-ok').setDisplaySize(okSize, okSize);
        this.okButton.setInteractive({ useHandCursor: true });
        this.okButton.on('pointerdown', () => this.submitAnswer());

        this.scoreBox = this.add.rectangle(okX - okSize / 2 - 50, okY, 84, 52, 0xffffff, 0.8);
        this.scoreBox.setStrokeStyle(2, 0x000000, 0.2);
        this.scoreText = this.add.text(this.scoreBox.x, this.scoreBox.y, '0/0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#2c3e50'
        }).setOrigin(0.5);

        // Initial paint
        this.updateModeVisibility();
        this.updateCalendarHeader();
        this.renderCalendarGrid();
        this.updateQuestionText();
        this.updateScoreText();
    }

    createDayOfWeekChoices() {
        const { width } = this.cameras.main;
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const panelW = Math.min(240, width * 0.25);
        const panelX = this.calendarBox.x - this.calendarBox.w / 2 + panelW / 2 + 10;
        const panelTop = this.calendarContentTopY + 10;
        const panelBottom = this.calendarContentBottomY - 10;
        const availableH = Math.max(140, panelBottom - panelTop);
        const btnH = Math.floor(availableH / 7);

        this.dayChoiceContainer.x = panelX;
        this.dayChoiceContainer.y = panelTop + availableH / 2;

        for (let i = 0; i < 7; i++) {
            const y = -availableH / 2 + btnH * i + btnH / 2;
            const bg = this.add.rectangle(0, y, panelW - 12, btnH - 8, 0x3498db);
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerdown', () => this.selectDayOfWeek(i));

            const txt = this.add.text(0, y, dayNames[i], {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#FFFFFF'
            }).setOrigin(0.5);

            this.dayChoiceContainer.add([bg, txt]);
            this.dayChoiceButtons.push({ bg, txt, index: i });
        }
    }

    updateModeVisibility() {
        const isDayOfWeekMode = this.mode === 'findDayOfWeek';
        this.dayChoiceContainer.setVisible(isDayOfWeekMode);

        // Calendar is still visible in both modes, but in day-of-week mode it can be used as reference
        // (matches the GCompris activity).
    }

    updateQuestionText() {
        const questions = this.levelData?.questions || [];
        const q = questions[this.questionIndex];
        this.questionText.setText(q ? q.question : '');
    }

    updateScoreText() {
        const total = (this.levelData?.questions || []).length;
        this.scoreText.setText(`${this.correctCount}/${total}`);
    }

    updateCalendarHeader() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.monthTitleText.setText(`${monthNames[this.visibleMonth]} ${this.visibleYear}`);

        const canPrev = this.navigationBarVisible && this.canChangeMonth(-1);
        const canNext = this.navigationBarVisible && this.canChangeMonth(1);
        this.prevMonthBtn.setVisible(this.navigationBarVisible);
        this.nextMonthBtn.setVisible(this.navigationBarVisible);
        this.prevMonthBtn.setAlpha(canPrev ? 1 : 0.3);
        this.nextMonthBtn.setAlpha(canNext ? 1 : 0.3);
        this.prevMonthBtn.disableInteractive();
        this.nextMonthBtn.disableInteractive();
        if (canPrev) this.prevMonthBtn.setInteractive({ useHandCursor: true });
        if (canNext) this.nextMonthBtn.setInteractive({ useHandCursor: true });
    }

    canChangeMonth(delta) {
        const testDate = new Date(this.visibleYear, this.visibleMonth, 1);
        testDate.setMonth(testDate.getMonth() + delta);

        if (this.minDate && testDate < new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1)) return false;
        if (this.maxDate && testDate > new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1)) return false;
        return true;
    }

    showPreviousMonth() {
        if (!this.canChangeMonth(-1)) return;
        const d = new Date(this.visibleYear, this.visibleMonth, 1);
        d.setMonth(d.getMonth() - 1);
        this.visibleYear = d.getFullYear();
        this.visibleMonth = d.getMonth();
        this.selectedDay = null;
        this.lastSelectedCell = null;
        this.updateCalendarHeader();
        this.renderCalendarGrid();
    }

    showNextMonth() {
        if (!this.canChangeMonth(1)) return;
        const d = new Date(this.visibleYear, this.visibleMonth, 1);
        d.setMonth(d.getMonth() + 1);
        this.visibleYear = d.getFullYear();
        this.visibleMonth = d.getMonth();
        this.selectedDay = null;
        this.lastSelectedCell = null;
        this.updateCalendarHeader();
        this.renderCalendarGrid();
    }

    renderCalendarGrid() {
        // Destroy previous grid objects
        this.dayHeaderTexts.forEach(t => t.destroy());
        this.dayHeaderTexts = [];
        this.gridCells.forEach(cell => {
            cell.bg.destroy();
            cell.txt.destroy();
        });
        this.gridCells = [];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const innerW = this.calendarBox.w - 60;
        const innerH = this.calendarBox.h - 120;
        const gridX = this.calendarBox.x;
        const gridTopY = this.calendarContentTopY + 14;

        const headerH = 28;
        const gridH = innerH - headerH;

        const cellW = Math.floor(innerW / 7);
        const cellH = Math.floor(gridH / 6);

        const startX = gridX - (cellW * 7) / 2 + cellW / 2;
        const headerY = gridTopY + headerH / 2;
        const firstRowY = gridTopY + headerH + cellH / 2;

        // Day headers
        for (let i = 0; i < 7; i++) {
            const x = startX + i * cellW;
            this.dayHeaderTexts.push(this.add.text(x, headerY, dayNames[i], {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#2c3e50'
            }).setOrigin(0.5));
        }

        const firstDayIndex = new Date(this.visibleYear, this.visibleMonth, 1).getDay();
        const daysInMonth = new Date(this.visibleYear, this.visibleMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.visibleYear, this.visibleMonth, 0).getDate();

        for (let idx = 0; idx < 42; idx++) {
            const col = idx % 7;
            const row = Math.floor(idx / 7);
            const x = startX + col * cellW;
            const y = firstRowY + row * cellH;

            const dayNum = idx - firstDayIndex + 1;
            const inMonth = dayNum >= 1 && dayNum <= daysInMonth;

            let displayNum = dayNum;
            if (!inMonth) {
                if (dayNum < 1) {
                    displayNum = daysInPrevMonth + dayNum;
                } else {
                    displayNum = dayNum - daysInMonth;
                }
            }

            const bgColor = inMonth ? 0xffffff : 0xf2f2f2;
            const textColor = inMonth ? '#2c3e50' : '#b0b0b0';

            const bg = this.add.rectangle(x, y, cellW - 4, cellH - 4, bgColor, 0.95);
            bg.setStrokeStyle(1, 0x000000, 0.15);
            const txt = this.add.text(x, y, `${displayNum}`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: textColor
            }).setOrigin(0.5);

            const cell = { bg, txt, inMonth, day: inMonth ? displayNum : null };
            this.gridCells.push(cell);

            if (inMonth) {
                bg.setInteractive({ useHandCursor: true });
                bg.on('pointerdown', () => this.selectDay(displayNum, cell));
            }
        }
    }

    selectDay(day, cell) {
        this.selectedDay = day;

        // Clear previous selection
        if (this.lastSelectedCell?.bg) {
            this.lastSelectedCell.bg.setFillStyle(0xffffff, 0.95);
        }

        cell.bg.setFillStyle(0x3498db, 0.95);
        this.lastSelectedCell = cell;
    }

    selectDayOfWeek(dayIndex) {
        this.selectedDayOfWeek = dayIndex;
        this.dayChoiceButtons.forEach(btn => {
            btn.bg.setFillStyle(btn.index === dayIndex ? 0x2ecc71 : 0x3498db);
        });
    }

    submitAnswer() {
        const questions = this.levelData?.questions || [];
        const current = questions[this.questionIndex];
        if (!current) return;

        if (this.mode === 'findYearMonthDay') {
            if (!this.selectedDay) {
                if (this.uiManager) this.uiManager.showWarning('Select a date first.');
                return;
            }

            const selected = { year: this.visibleYear, month: this.visibleMonth, day: this.selectedDay };
            const ans = current.answer;

            const correct = selected.year === ans.year && selected.month === ans.month && selected.day === ans.day;
            this.handleAnswerResult(correct);
            return;
        }

        if (this.mode === 'findDayOfWeek') {
            if (this.selectedDayOfWeek === null || this.selectedDayOfWeek === undefined) {
                if (this.uiManager) this.uiManager.showWarning('Select a day of the week first.');
                return;
            }

            const correct = this.selectedDayOfWeek === current.answer.dayOfWeek;
            this.handleAnswerResult(correct);
        }
    }

    handleAnswerResult(correct) {
        if (correct) {
            this.correctCount += 1;
            this.updateScoreText();

            if (this.audioManager?.sounds?.has('success')) {
                this.audioManager.playSound('success');
            }

            if (this.lastSelectedCell?.bg && this.mode === 'findYearMonthDay') {
                this.lastSelectedCell.bg.setFillStyle(0x2ecc71, 0.95);
            }

            this.time.delayedCall(600, () => {
                this.questionIndex += 1;
                if (this.questionIndex >= (this.levelData?.questions || []).length) {
                    this.completeLevel();
                    return;
                }

                this.selectedDay = null;
                this.selectedDayOfWeek = null;
                this.lastSelectedCell = null;
                this.dayChoiceButtons.forEach(btn => btn.bg.setFillStyle(0x3498db));
                this.updateQuestionText();
                this.renderCalendarGrid();
            });
            return;
        }

        if (this.audioManager?.sounds?.has('fail')) {
            this.audioManager.playSound('fail');
        }

        if (this.lastSelectedCell?.bg && this.mode === 'findYearMonthDay') {
            this.lastSelectedCell.bg.setFillStyle(0xe74c3c, 0.95);
        }

        this.cameras.main.shake(200, 0.008);
    }
}
