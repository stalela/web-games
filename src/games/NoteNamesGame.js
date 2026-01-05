import { LalelaGame } from '../utils/LalelaGame.js';

export class NoteNamesGame extends LalelaGame {
    constructor() {
        super();
        this.currentLevelIndex = 0;
        this.currentNoteIndex = 0;
        this.score = 0;
    }

    preload() {
        super.preload();
        this.load.image('trebleClef', 'assets/note_names/trebleClef.svg');
        this.load.image('bassClef', 'assets/note_names/bassClef.svg');
        this.load.image('noteQuarter', 'assets/note_names/noteQuarter.svg');
        this.load.audio('piano_note', 'assets/piano_composition/piano.ogg');
    }

    create() {
        super.create();
        this.createLevels();
        this.createUI();
        this.createPiano();
        this.startLevel();
    }

    createLevels() {
        this.levels = [
            { clef: "Treble", sequence: ["C4", "G4"] },
            { clef: "Bass", sequence: ["C3", "F3"] },
            { clef: "Treble", sequence: ["B3", "D4", "F4", "A4"] },
            { clef: "Bass", sequence: ["B2", "D3", "E3", "G3"] },
            { clef: "Treble", sequence: ["C5", "G5"] },
            { clef: "Bass", sequence: ["C2", "F2"] },
            { clef: "Treble", sequence: ["B4", "D5", "F5", "A5"] },
            { clef: "Bass", sequence: ["B1", "D2", "E2", "G2"] },
            { clef: "Treble", sequence: ["E4", "E5"] }
        ];
    }

    createUI() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // Staff Container
        this.staffContainer = this.add.container(cx, cy - 150);
        
        // Draw 5 lines
        const lineWidth = 600;
        const lineSpacing = 20;
        this.staffY = 0; // Top line Y relative to container
        
        for (let i = 0; i < 5; i++) {
            const line = this.add.rectangle(0, i * lineSpacing, lineWidth, 2, 0x000000);
            this.staffContainer.add(line);
        }
        
        // Clef
        this.clefImage = this.add.image(-250, 40, 'trebleClef').setDisplaySize(60, 100);
        this.staffContainer.add(this.clefImage);
        
        // Note
        this.noteImage = this.add.image(0, 0, 'noteQuarter').setDisplaySize(30, 30);
        this.staffContainer.add(this.noteImage);
        
        this.instructionText = this.add.text(cx, 50, "Play the note shown on the staff", {
            fontFamily: 'Fredoka One', fontSize: '24px', color: '#000000'
        }).setOrigin(0.5);
    }

    createPiano() {
        const startX = 100;
        const startY = this.cameras.main.centerY + 150;
        const whiteKeyWidth = 50;
        const whiteKeyHeight = 180;
        const blackKeyWidth = 30;
        const blackKeyHeight = 100;

        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        // Range: C2 to C6 (4 octaves) to cover Bass and Treble ranges
        // Bass Clef: C2 to C4
        // Treble Clef: C4 to C6
        const startOctave = 2;
        const octaves = 4; 

        let x = startX;
        this.keys = [];

        // White keys
        for (let o = 0; o < octaves; o++) {
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                const octave = startOctave + o;
                const noteName = note + octave;
                
                const key = this.add.rectangle(x, startY, whiteKeyWidth, whiteKeyHeight, 0xffffff)
                    .setStrokeStyle(2, 0x000000)
                    .setInteractive();
                
                const pitch = this.getPitch(note, octave);
                key.noteName = noteName;
                key.pitch = pitch;
                key.isBlack = false;
                
                key.on('pointerdown', () => this.onKeyClick(key));
                key.on('pointerup', () => key.setFillStyle(0xffffff));
                key.on('pointerout', () => key.setFillStyle(0xffffff));

                this.keys.push(key);
                x += whiteKeyWidth;
            }
        }

        // Black keys
        const blackKeyIndices = [0, 1, 3, 4, 5]; // C, D, F, G, A have black keys after them
        x = startX;
        for (let o = 0; o < octaves; o++) {
            for (let i = 0; i < notes.length; i++) {
                if (blackKeyIndices.includes(i)) {
                    const bx = x + whiteKeyWidth - blackKeyWidth / 2;
                    const key = this.add.rectangle(bx, startY - (whiteKeyHeight - blackKeyHeight)/2, blackKeyWidth, blackKeyHeight, 0x000000)
                        .setStrokeStyle(1, 0x444444)
                        .setInteractive();
                    
                    const note = notes[i] + '#';
                    const octave = startOctave + o;
                    const noteName = note + octave;
                    
                    const pitch = this.getPitch(note, octave);
                    key.noteName = noteName;
                    key.pitch = pitch;
                    key.isBlack = true;
                    
                    key.on('pointerdown', () => this.onKeyClick(key));
                    key.on('pointerup', () => key.setFillStyle(0x000000));
                    key.on('pointerout', () => key.setFillStyle(0x000000));
                    
                    this.keys.push(key);
                }
                x += whiteKeyWidth;
            }
        }
    }

    getPitch(note, octave) {
        const semitonesMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        const baseOctave = 4;
        const semitone = semitonesMap[note];
        const octaveDiff = octave - baseOctave;
        const totalSemitones = octaveDiff * 12 + semitone;
        return Math.pow(2, totalSemitones / 12);
    }

    startLevel() {
        if (this.currentLevelIndex >= this.levels.length) {
            this.scene.start('GameMenu');
            return;
        }
        
        this.currentLevelData = this.levels[this.currentLevelIndex];
        this.currentSequence = [...this.currentLevelData.sequence];
        this.shuffleArray(this.currentSequence);
        this.currentNoteIndex = 0;
        
        // Update Clef
        if (this.currentLevelData.clef === "Treble") {
            this.clefImage.setTexture('trebleClef');
            this.clefImage.y = 40; // Adjust position
        } else {
            this.clefImage.setTexture('bassClef');
            this.clefImage.y = 30; // Adjust position
        }
        
        this.showNextNote();
    }

    showNextNote() {
        if (this.currentNoteIndex >= this.currentSequence.length) {
            this.currentLevelIndex++;
            this.startLevel();
            return;
        }

        this.targetNote = this.currentSequence[this.currentNoteIndex];
        this.displayNoteOnStaff(this.targetNote);
    }

    displayNoteOnStaff(noteName) {
        // Calculate Y position based on note name (e.g. "C4")
        // Line spacing is 20.
        // Treble Clef:
        // Bottom line (E4) is at y = 4 * 20 = 80.
        // F4 is at 70.
        // G4 is at 60.
        // A4 is at 50.
        // B4 is at 40.
        // C5 is at 30.
        // D4 is at 90.
        // C4 is at 100 (ledger line).
        
        // Bass Clef:
        // Bottom line (G2) is at 80.
        // A2 is at 70.
        // B2 is at 60.
        // C3 is at 50.
        // D3 is at 40.
        // E3 is at 30.
        // F3 is at 20.
        
        const note = noteName.slice(0, -1); // "C"
        const octave = parseInt(noteName.slice(-1)); // 4
        
        const semitonesMap = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
        const noteVal = semitonesMap[note];
        
        let baseNoteVal, baseOctave;
        
        if (this.currentLevelData.clef === "Treble") {
            // E4 is the bottom line (index 0 from bottom, index 4 from top)
            // Let's use top line as reference. Top line is F5.
            // Wait, standard treble clef lines: E4, G4, B4, D5, F5 (bottom to top).
            // So top line (y=0) is F5.
            baseNoteVal = semitonesMap['F'];
            baseOctave = 5;
        } else {
            // Bass clef lines: G2, B2, D3, F3, A3 (bottom to top).
            // Top line (y=0) is A3.
            baseNoteVal = semitonesMap['A'];
            baseOctave = 3;
        }
        
        // Calculate steps from base
        const steps = (baseOctave - octave) * 7 + (baseNoteVal - noteVal);
        
        // Each step is half a line spacing (10px)
        const y = steps * 10;
        
        this.noteImage.y = y;
        
        // Add ledger lines if needed
        // If y >= 100 (below staff) or y <= -20 (above staff)
        // TODO: Implement ledger lines
    }

    onKeyClick(key) {
        this.sound.play('piano_note', { detune: this.pitchToDetune(key.pitch) });
        
        key.setFillStyle(0x00FF00); // Highlight green
        
        if (key.noteName === this.targetNote) {
            this.time.delayedCall(500, () => {
                key.setFillStyle(key.isBlack ? 0x000000 : 0xffffff);
                this.currentNoteIndex++;
                this.showNextNote();
            });
        } else {
            key.setFillStyle(0xFF0000); // Highlight red
            this.time.delayedCall(500, () => {
                key.setFillStyle(key.isBlack ? 0x000000 : 0xffffff);
            });
        }
    }
    
    pitchToDetune(pitch) {
        // pitch = 2^(cents/1200)
        // log2(pitch) = cents/1200
        // cents = 1200 * log2(pitch)
        return 1200 * Math.log2(pitch);
    }
}
