import { LalelaGame } from '../utils/LalelaGame.js';

export class PianoCompositionGame extends LalelaGame {
    constructor() {
        super();
        this.notes = []; // Array of { note: 'C4', duration: 'quarter', x: 0, y: 0 }
        this.selectedDuration = 'quarter';
        this.isPlaying = false;
    }

    preload() {
        super.preload();
        this.load.image('trebleClef', 'assets/note_names/trebleClef.svg');
        this.load.image('noteQuarter', 'assets/note_names/noteQuarter.svg');
        this.load.image('noteHalf', 'assets/note_names/noteHalf.svg');
        this.load.image('noteEighth', 'assets/note_names/noteEighth.svg');
        this.load.image('restQuarter', 'assets/note_names/restquarter.svg');
        this.load.image('btnPlay', 'assets/note_names/play.svg');
        this.load.image('btnStop', 'assets/note_names/stop.svg');
        this.load.image('btnErase', 'assets/note_names/erase.svg');
        this.load.audio('piano_note', 'assets/piano_composition/piano.ogg');
    }

    create() {
        super.create();
        this.createUI();
        this.createStaff();
    }

    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // Toolbar
        const toolbarY = cy + 200;
        
        this.createButton(cx - 150, toolbarY, 'noteQuarter', () => this.selectedDuration = 'quarter');
        this.createButton(cx - 80, toolbarY, 'noteHalf', () => this.selectedDuration = 'half');
        this.createButton(cx - 10, toolbarY, 'noteEighth', () => this.selectedDuration = 'eighth');
        this.createButton(cx + 60, toolbarY, 'restQuarter', () => this.selectedDuration = 'rest');
        
        this.createButton(cx + 150, toolbarY, 'btnErase', () => this.clearStaff());
        this.createButton(cx + 220, toolbarY, 'btnPlay', () => this.playComposition());
        this.createButton(cx + 290, toolbarY, 'btnStop', () => this.stopComposition());
    }

    createButton(x, y, key, callback) {
        const btn = this.add.image(x, y, key).setDisplaySize(40, 40).setInteractive();
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.9, duration: 100, yoyo: true });
            callback();
        });
        return btn;
    }

    createStaff() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        this.staffContainer = this.add.container(cx, cy - 50);
        
        // Draw 5 lines
        const lineWidth = 800;
        const lineSpacing = 20;
        this.staffTopY = -2 * lineSpacing; // Center is 0
        
        for (let i = 0; i < 5; i++) {
            const line = this.add.rectangle(0, (i - 2) * lineSpacing, lineWidth, 2, 0x000000);
            this.staffContainer.add(line);
        }
        
        // Clef
        this.clefImage = this.add.image(-350, 0, 'trebleClef').setDisplaySize(60, 100);
        this.staffContainer.add(this.clefImage);
        
        // Click area
        const clickArea = this.add.rectangle(0, 0, lineWidth, 200, 0x000000, 0).setInteractive();
        clickArea.on('pointerdown', (pointer) => this.onStaffClick(pointer));
        this.staffContainer.add(clickArea);
        
        this.notesContainer = this.add.container(0, 0);
        this.staffContainer.add(this.notesContainer);
    }

    onStaffClick(pointer) {
        // Calculate note based on Y
        // Staff center (0) is B4 (Treble Clef middle line)
        // Wait, Treble Clef lines: E4, G4, B4, D5, F5.
        // Middle line is B4.
        // Line spacing is 20.
        // Each step (semitone/line/space) is 10px.
        
        const localY = pointer.y - this.staffContainer.y;
        const localX = pointer.x - this.staffContainer.x;
        
        // Snap Y to nearest 10
        const snappedY = Math.round(localY / 10) * 10;
        
        // Calculate note
        // y=0 is B4.
        // y=10 is A4.
        // y=-10 is C5.
        // y=20 is G4.
        // y=-20 is D5.
        
        // Map Y to Note Name
        const noteMap = {
            '0': 'B4', '10': 'A4', '20': 'G4', '30': 'F4', '40': 'E4', '50': 'D4', '60': 'C4',
            '-10': 'C5', '-20': 'D5', '-30': 'E5', '-40': 'F5', '-50': 'G5', '-60': 'A5'
        };
        
        const noteName = noteMap[snappedY];
        if (!noteName && this.selectedDuration !== 'rest') return; // Out of range
        
        // Add note
        this.addNote(noteName, this.selectedDuration, localX, snappedY);
    }

    addNote(noteName, duration, x, y) {
        // Find insertion index based on x
        // Or just append? GCompris allows placing anywhere.
        // I'll just append for now and sort by X for playback.
        
        const noteObj = {
            note: noteName,
            duration: duration,
            x: x,
            y: y,
            sprite: null
        };
        
        let texture = 'noteQuarter';
        if (duration === 'half') texture = 'noteHalf';
        if (duration === 'eighth') texture = 'noteEighth';
        if (duration === 'rest') texture = 'restQuarter';
        
        const sprite = this.add.image(x, y, texture).setDisplaySize(30, 30);
        this.notesContainer.add(sprite);
        noteObj.sprite = sprite;
        
        this.notes.push(noteObj);
        this.notes.sort((a, b) => a.x - b.x);
    }

    clearStaff() {
        this.notes.forEach(n => n.sprite.destroy());
        this.notes = [];
    }

    playComposition() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        let delay = 0;
        this.notes.forEach(note => {
            if (note.duration !== 'rest') {
                this.time.delayedCall(delay, () => {
                    this.playNote(note.note);
                    note.sprite.setTint(0x00FF00);
                    this.time.delayedCall(200, () => note.sprite.clearTint());
                });
            }
            
            // Duration in ms
            let dur = 500; // Quarter
            if (note.duration === 'half') dur = 1000;
            if (note.duration === 'eighth') dur = 250;
            
            delay += dur;
        });
        
        this.time.delayedCall(delay, () => {
            this.isPlaying = false;
        });
    }

    stopComposition() {
        this.isPlaying = false;
        // Stop all sounds/timeouts (simplified)
    }

    playNote(noteName) {
        const note = noteName.slice(0, -1);
        const octave = parseInt(noteName.slice(-1));
        const pitch = this.getPitch(note, octave);
        this.sound.play('piano_note', { detune: this.pitchToDetune(pitch) });
    }

    getPitch(note, octave) {
        const semitonesMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const baseOctave = 4;
        const semitone = semitonesMap[note];
        const octaveDiff = octave - baseOctave;
        const totalSemitones = octaveDiff * 12 + semitone;
        return Math.pow(2, totalSemitones / 12);
    }

    pitchToDetune(pitch) {
        return 1200 * Math.log2(pitch);
    }
}
