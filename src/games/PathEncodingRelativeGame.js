import { PathEncodingGame } from './PathEncodingGame.js';

export class PathEncodingRelativeGame extends PathEncodingGame {
  constructor(config) {
    super({
      key: 'PathEncodingRelativeGame',
      title: 'Path Encoding Relative',
      category: 'math',
      description: 'Guide Tux to the target using relative moves.',
      movement: 'relative',
      ...config
    });
  }
}
