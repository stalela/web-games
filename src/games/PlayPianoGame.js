import { LalelaGame } from '../utils/LalelaGame.js';

export class PlayPianoGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'PlayPianoGame',
      title: 'Play Piano',
      category: 'discovery',
      description: 'Play music on the piano.',
      ...config
    });
  }

  preload() {
    super.preload();
    this.load.audio('piano_note', 'assets/piano_composition/piano.ogg');
  }

  create() {
    super.create();
    this.createPiano();
  }

  createPiano() {
    const startX = 100;
    const startY = this.cameras.main.centerY;
    const whiteKeyWidth = 60;
    const whiteKeyHeight = 200;
    const blackKeyWidth = 40;
    const blackKeyHeight = 120;

    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const octaves = 2; // C4, C5

    let x = startX;

    // White keys
    for (let o = 0; o < octaves; o++) {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const key = this.add.rectangle(x, startY, whiteKeyWidth, whiteKeyHeight, 0xffffff)
          .setStrokeStyle(2, 0x000000)
          .setInteractive();
        
        const pitch = this.getPitch(note, o + 4);
        key.note = note; // Store note
        key.pitch = pitch;
        key.on('pointerdown', () => this.playNote(pitch, key, 0xcccccc));
        key.on('pointerup', () => key.setFillStyle(0xffffff));
        key.on('pointerout', () => key.setFillStyle(0xffffff));

        x += whiteKeyWidth;
      }
    }

    // Black keys
    // C# D# F# G# A#
    // Positions relative to white keys
    // C is 0, D is 1...
    // C# is between 0 and 1
    const blackKeyIndices = [0, 1, 3, 4, 5]; // Indices of white keys that have a black key after them
    
    x = startX;
    for (let o = 0; o < octaves; o++) {
      for (let i = 0; i < notes.length; i++) {
        if (blackKeyIndices.includes(i)) {
          const bx = x + whiteKeyWidth - blackKeyWidth / 2;
          const key = this.add.rectangle(bx, startY - (whiteKeyHeight - blackKeyHeight)/2, blackKeyWidth, blackKeyHeight, 0x000000)
            .setStrokeStyle(1, 0x444444)
            .setInteractive();
          
          const note = notes[i] + '#';
          const pitch = this.getPitch(note, o + 4);
          key.note = note; // Store note
          key.pitch = pitch;
          key.on('pointerdown', () => this.playNote(pitch, key, 0x333333));
          key.on('pointerup', () => key.setFillStyle(0x000000));
          key.on('pointerout', () => key.setFillStyle(0x000000));
        }
        x += whiteKeyWidth;
      }
    }
  }

  getPitch(note, octave) {
    // Base C4 is 1.0 (assuming sample is C4)
    // Semitones from C4
    const semitonesMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const baseOctave = 4;
    const semitone = semitonesMap[note];
    const octaveDiff = octave - baseOctave;
    const totalSemitones = octaveDiff * 12 + semitone;
    
    // Frequency ratio = 2^(n/12)
    return Math.pow(2, totalSemitones / 12);
  }

  playNote(detune, key, highlightColor) {
    key.setFillStyle(highlightColor);
    // Phaser 3 sound detune is in cents. 100 cents = 1 semitone.
    // But rate is easier.
    // rate = 2^(semitones/12)
    // I calculated rate in getPitch.
    
    this.sound.play('piano_note', { rate: detune });
  }
}
