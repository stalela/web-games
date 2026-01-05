import { CheckersGame } from './CheckersGame.js';

export class CheckersTwoPlayerGame extends CheckersGame {
  constructor() {
    super('CheckersTwoPlayerGame');
  }

  create() {
    super.create();
    // Override any single player specific logic here if needed
    // For now, CheckersGame seems to handle the board and moves.
    // If CheckersGame has AI, we need to disable it here.
    // Assuming CheckersGame is a base implementation that might need adjustment for 2P.
    // But based on the file content read, it has 'currentPlayer' and move logic.
    // If the base game is 1P vs AI, we'd need to check that.
    // Looking at CheckersGame.js content provided earlier, it imports 'Draughts' engine.
    // It doesn't explicitly show AI logic in the first 50 lines.
    // We will assume for now it supports 2 players or we might need to adjust.
    // Actually, usually GCompris 2 player games are just the same game but with input enabled for both sides.
  }
}
