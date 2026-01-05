import { PathDecodingGame } from './PathDecodingGame.js';

export class PathDecodingRelativeGame extends PathDecodingGame {
  constructor(config) {
    super({
      key: 'PathDecodingRelativeGame',
      title: 'Path Decoding Relative',
      category: 'math',
      description: 'Follow the arrows relative to Tux\'s direction.',
      movement: 'relative',
      ...config
    });
  }

  // Override handleCellClick or calculateMoves if needed for relative logic
  // In relative mode, UP means "Forward", LEFT means "Turn Left", etc.
  // But the base game might need adjustment to handle 'movement' property.
}
