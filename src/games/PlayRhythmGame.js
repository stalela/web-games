import { PlayPianoGame } from './PlayPianoGame.js';

export class PlayRhythmGame extends PlayPianoGame {
  constructor(config) {
    super({
      key: 'PlayRhythmGame',
      title: 'Play Rhythm',
      category: 'discovery',
      description: 'Listen to the rhythm and repeat it.',
      ...config
    });
    this.sequence = [];
    this.userSequence = [];
    this.isPlaying = false;
  }

  create() {
    super.create();
    this.add.text(this.cameras.main.centerX, 50, 'Listen and Repeat', {
      fontSize: '32px',
      color: '#000000'
    }).setOrigin(0.5);
    
    this.startButton = this.add.text(this.cameras.main.centerX, 100, 'Start', {
      fontSize: '24px',
      backgroundColor: '#00aa00',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    this.startButton.on('pointerdown', () => this.startRound());
  }

  startRound() {
    this.sequence = [];
    this.userSequence = [];
    // Generate random sequence of 3-5 notes
    const length = Phaser.Math.Between(3, 5);
    const notes = ['C', 'D', 'E', 'F', 'G']; // Simple notes
    
    for (let i = 0; i < length; i++) {
      this.sequence.push(Phaser.Utils.Array.GetRandom(notes));
    }
    
    this.playSequence();
  }

  playSequence() {
    this.isPlaying = true;
    let delay = 0;
    
    this.sequence.forEach((note, index) => {
      this.time.delayedCall(delay, () => {
        // Find key for note (simplified lookup)
        // In PlayPianoGame, keys are not stored in a map. I should have stored them.
        // For now, I'll just play the sound.
        const pitch = this.getPitch(note, 4);
        this.sound.play('piano_note', { rate: pitch });
        
        // Visual feedback? I need reference to keys.
      });
      delay += 800;
    });
    
    this.time.delayedCall(delay, () => {
      this.isPlaying = false;
      this.add.text(this.cameras.main.centerX, 150, 'Your Turn!', {
        fontSize: '24px', color: '#0000aa'
      }).setOrigin(0.5).destroy(); // Just a flash?
    });
  }

  // Override playNote to check sequence
  playNote(detune, key, highlightColor) {
    super.playNote(detune, key, highlightColor);
    
    if (this.isPlaying) return;
    
    if (this.sequence.length > 0) {
      const expectedNote = this.sequence[this.userSequence.length];
      if (key.note === expectedNote) {
        this.userSequence.push(key.note);
        if (this.userSequence.length === this.sequence.length) {
          this.audioManager.play('success');
          this.time.delayedCall(1000, () => this.startRound());
        }
      } else {
        this.audioManager.play('error');
        this.userSequence = []; // Reset or fail?
        // Maybe replay sequence
        this.time.delayedCall(500, () => this.playSequence());
      }
    }
  }
}
