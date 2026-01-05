import { LalelaGame } from '../utils/LalelaGame.js';

export class PathDecodingGame extends LalelaGame {
  constructor(config) {
    super({
      key: 'PathDecodingGame',
      title: 'Path Decoding',
      category: 'math',
      description: 'Follow the arrows to guide Tux to the exit.',
      ...config
    });

    this.levels = [
      {
        path: [
          ['B', 'T', '*', '*', '*', 'T'],
          ['.', '*', '*', 'R', '*', '*'],
          ['.', '*', 'G', '.', '.', '*'],
          ['S', '*', '.', 'W', 'B', '*'],
          ['.', 'R', '.', '.', 'T', '*'],
          ['.', '.', 'W', '.', '.', 'E'],
        ]
      },
      {
        path: [
          ['.', 'R', '*', '*', '*', 'E'],
          ['.', '*', '*', 'G', '.', '.'],
          ['R', '*', '.', '.', '*', 'S'],
          ['T', '*', 'B', '*', '*', '.'],
          ['.', '*', '*', '*', 'W', '.'],
          ['W', '.', '.', '.', 'G', '.'],
        ]
      }
    ];
    this.currentLevelIndex = 0;
    this.gridSize = 60;
    this.gridOffsetX = 100;
    this.gridOffsetY = 100;
    this.movement = config.movement || 'absolute';
    this.tuxFacing = 'UP'; // Default facing
  }

  preload() {
    super.preload();
    // Load icons for obstacles if needed, or use shapes/text
    this.load.image('tux', 'assets/common/tux.png'); // Assuming tux exists or use placeholder
  }

  create() {
    super.create();
    this.createUI();
    this.startLevel();
  }

  startLevel() {
    const level = this.levels[this.currentLevelIndex];
    this.grid = level.path;
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.tuxFacing = 'UP'; // Reset facing
    
    this.createGrid();
    this.calculateMoves();
    this.createMoveBar();
    
    this.currentMoveIndex = 0;
    this.highlightCurrentMove();
  }

  createGrid() {
    this.gridGroup = this.add.group();
    this.cells = [];

    const totalWidth = this.cols * this.gridSize;
    const totalHeight = this.rows * this.gridSize;
    this.gridOffsetX = (this.cameras.main.width - totalWidth) / 2;
    this.gridOffsetY = (this.cameras.main.height - totalHeight) / 2 - 50;

    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = this.gridOffsetX + c * this.gridSize + this.gridSize / 2;
        const y = this.gridOffsetY + r * this.gridSize + this.gridSize / 2;
        
        const cell = this.add.rectangle(x, y, this.gridSize - 2, this.gridSize - 2, 0xcccccc);
        cell.setInteractive();
        cell.row = r;
        cell.col = c;
        
        cell.on('pointerdown', () => this.handleCellClick(r, c));
        
        this.cells[r][c] = cell;
        this.gridGroup.add(cell);

        // Render content
        const type = this.grid[r][c];
        this.renderCellContent(x, y, type);

        if (type === 'S') {
          this.tuxPos = { r, c };
          this.tux = this.add.image(x, y, 'tux').setDisplaySize(this.gridSize * 0.8, this.gridSize * 0.8);
          // If tux image missing, use circle
          if (!this.textures.exists('tux')) {
             this.tux = this.add.circle(x, y, this.gridSize * 0.4, 0x000000);
          }
          this.tux.setDepth(10);
        }
      }
    }
  }

  renderCellContent(x, y, type) {
    let color = null;
    let text = null;

    switch (type) {
      case 'R': color = 0x888888; text = 'Rock'; break;
      case 'T': color = 0x008800; text = 'Tree'; break;
      case 'B': color = 0x00AA00; text = 'Bush'; break;
      case 'W': color = 0x0000FF; text = 'Water'; break;
      case 'G': color = 0x00FF00; text = 'Grass'; break;
      case 'E': color = 0xFF0000; text = 'Exit'; break;
      case 'S': color = 0xFFFF00; text = 'Start'; break;
      case '*': color = 0xFFFFFF; break; // Path (hidden usually?)
      default: color = 0xFFFFFF; break;
    }

    if (color !== null) {
      // this.add.rectangle(x, y, this.gridSize - 10, this.gridSize - 10, color);
      // Use text for now
      if (text) {
        this.add.text(x, y, type, { color: '#000000', fontSize: '20px' }).setOrigin(0.5);
      }
    }
  }

  calculateMoves() {
    this.moves = [];
    let curr = { ...this.tuxPos };
    let prev = { r: -1, c: -1 };
    
    // Simple path finding (follow '*')
    // Or rather, the grid defines the path.
    // We need to trace from S to E following '*'
    
    // Actually, the GCompris logic traces the path.
    // Let's simulate that.
    
    let found = true;
    while (found) {
      found = false;
      const neighbors = [
        { r: curr.r - 1, c: curr.c, dir: 'UP' },
        { r: curr.r + 1, c: curr.c, dir: 'DOWN' },
        { r: curr.r, c: curr.c - 1, dir: 'LEFT' },
        { r: curr.r, c: curr.c + 1, dir: 'RIGHT' }
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < this.rows && n.c >= 0 && n.c < this.cols) {
          if (n.r === prev.r && n.c === prev.c) continue; // Don't go back

          const type = this.grid[n.r][n.c];
          if (type === '*' || type === 'E') {
            this.moves.push(n.dir);
            prev = { ...curr };
            curr = { r: n.r, c: n.c };
            found = true;
            if (type === 'E') found = false; // Stop at end
            break;
          }
        }
      }
    }
  }

  createMoveBar() {
    this.moveIcons = [];
    const startX = 100;
    const y = this.cameras.main.height - 80;
    const gap = 60;

    let currentFacing = 'UP'; // Simulation facing for move bar generation

    this.moves.forEach((move, index) => {
      const x = startX + index * gap;
      const bg = this.add.rectangle(x, y, 50, 50, 0xeeeeee).setStrokeStyle(2, 0x000000);
      
      let angle = 0;
      let displayMove = move;

      if (this.movement === 'relative') {
        // Calculate relative move
        // Absolute: UP, DOWN, LEFT, RIGHT
        // Relative: FORWARD (UP), BACKWARD (DOWN), LEFT, RIGHT (relative to facing)
        
        const dirs = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        const currentIdx = dirs.indexOf(currentFacing);
        const targetIdx = dirs.indexOf(move);
        
        // diff: 0=Forward, 1=Right, 2=Back, 3=Left
        let diff = (targetIdx - currentIdx + 4) % 4;
        
        if (diff === 0) displayMove = 'UP'; // Forward
        if (diff === 1) displayMove = 'RIGHT';
        if (diff === 2) displayMove = 'DOWN'; // Backward
        if (diff === 3) displayMove = 'LEFT';
        
        currentFacing = move; // Update facing for next move
      }

      if (displayMove === 'DOWN') angle = 90;
      if (displayMove === 'LEFT') angle = 180;
      if (displayMove === 'UP') angle = 270;
      
      const arrow = this.add.text(x, y, '➜', { fontSize: '32px', color: '#000000' }).setOrigin(0.5);
      arrow.setRotation(Phaser.Math.DegToRad(angle));
      
      this.moveIcons.push({ bg, arrow });
    });
  }

  highlightCurrentMove() {
    this.moveIcons.forEach((icon, index) => {
      if (index === this.currentMoveIndex) {
        icon.bg.setFillStyle(0xFFA500); // Active
      } else if (index < this.currentMoveIndex) {
        icon.bg.setFillStyle(0x888888); // Done
        icon.bg.setAlpha(0.5);
        icon.arrow.setAlpha(0.5);
      } else {
        icon.bg.setFillStyle(0xeeeeee); // Future
      }
    });
  }

  handleCellClick(r, c) {
    if (this.currentMoveIndex >= this.moves.length) return;

    const expectedDir = this.moves[this.currentMoveIndex];
    let expectedR = this.tuxPos.r;
    let expectedC = this.tuxPos.c;

    if (expectedDir === 'UP') expectedR--;
    if (expectedDir === 'DOWN') expectedR++;
    if (expectedDir === 'LEFT') expectedC--;
    if (expectedDir === 'RIGHT') expectedC++;

    if (r === expectedR && c === expectedC) {
      // Correct
      this.tuxPos = { r, c };
      this.tuxFacing = expectedDir; // Update actual facing
      
      // Rotate Tux
      let angle = 0;
      if (this.tuxFacing === 'RIGHT') angle = 90;
      if (this.tuxFacing === 'DOWN') angle = 180;
      if (this.tuxFacing === 'LEFT') angle = 270;
      this.tux.setAngle(angle);

      this.tweens.add({
        targets: this.tux,
        x: this.cells[r][c].x,
        y: this.cells[r][c].y,
        duration: 200
      });
      
      this.currentMoveIndex++;
      this.highlightCurrentMove();
      
      if (this.currentMoveIndex >= this.moves.length) {
        this.audioManager.play('success');
        this.time.delayedCall(1000, () => {
          this.currentLevelIndex++;
          if (this.currentLevelIndex < this.levels.length) {
            this.scene.restart();
          } else {
            this.scene.start('GameMenu');
          }
        });
      }
    } else {
      // Incorrect
      this.cameras.main.shake(200, 0.01);
    }
  }
}
