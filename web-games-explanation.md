# Lalela Web Games: A Technical Overview

This document provides a high-level overview of the `web-games` project, intended for new developers.

## 1. Project Overview

The `web-games` project is a collection of educational games for children, built for the Lalela platform. The games are developed using modern web technologies and are designed to run in a web browser.

The core of the project is built using the **Phaser 3** framework, a popular and powerful 2D game engine for making HTML5 games.

## 2. Core Technologies & Libraries

- **Game Engine**: [Phaser 3](https://phaser.io/phaser3) is used for all game logic, rendering, and physics.
- **Audio**: [Howler.js](https://howlerjs.com/) is used for robust and reliable audio management (sound effects and music).
- **Bundling**: [Webpack](https://webpack.js.org/) is used to bundle all the JavaScript code, styles, and assets into a single package for the browser.
- **Transpiling**: [Babel](https://babeljs.io/) transpiles modern JavaScript (ES6+) into a format that is compatible with a wider range of browsers.
- **Testing**:
  - [Jest](https://jestjs.io/) is used for unit and integration testing of the game logic.
  - [Puppeteer](https://pptr.dev/) is used for automated cross-browser testing to ensure the games work consistently across different web browsers.

## 3. Project Structure

The project has the following key directories and files:

- **/src/**: The main source code directory.
  - `index.js`: The main entry point of the application. It initializes the Phaser game and all the manager modules.
  - `index.html`: The main HTML file that hosts the game canvas.
  - **/src/games/**: Contains the source code for each individual game. Each game is typically its own Phaser Scene.
  - **/src/scenes/**: Contains non-game scenes, such as the `LoadingScene` and `GameMenuScene`.
  - **/src/utils/**: Contains various manager modules that handle different aspects of the game (e.g., `AssetManager`, `AudioManager`, `UIManager`).
  - **/src/assets/**: Contains all static assets like images, fonts, and sound files.
- **/dist/**: The output directory where the final bundled game files are placed after running the build script.
- `package.json`: Defines the project's dependencies, scripts, and metadata.
- `webpack.config.js`: The configuration file for Webpack, which defines how the project is bundled.
- `jest.config.js`: The configuration file for the Jest testing framework.

## 4. Application Flow & Architecture

The application is architected around a central `LalelaGamesApp` class (`src/index.js`), which manages the lifecycle of the game.

1.  **Initialization**:
    - When the page loads, `LalelaGamesApp` is instantiated.
    - It initializes several manager classes to handle specific responsibilities:
      - `AssetManager`: For loading and managing assets.
      - `AudioManager`: For controlling sounds and music.
      - `UIManager`: For creating and managing user interface elements.
      - `DataManager`: For handling game-related data.
      - `InputManager`: For managing player input.
      - `PerformanceMonitor`: For tracking the game's performance.
    - A new Phaser game instance (`new Phaser.Game(...)`) is created.

2.  **Scene Loading**:
    - All game scenes (from `/src/games/`) and system scenes (like the main menu from `/src/scenes/`) are added to the Phaser Scene Manager.
    - The application starts by launching the `GameMenuScene`.

3.  **Game Loop**:
    - The `GameMenuScene` displays a menu of available games.
    - When the user selects a game, the `startGame()` method in `LalelaGamesApp` is called.
    - This method stops the menu scene and starts the selected game scene (e.g., `AdjacentNumbers`).
    - The game scene is provided with instances of all the manager classes, giving it access to all necessary game systems.

This modular, scene-based architecture makes it easy to manage and extend the project. New games can be created as new `Phaser.Scene` classes and added to the main application in `src/index.js`.

## 5. Getting Started

Here are the most important commands defined in `package.json`:

- **To run the games in a local development server**:
  ```bash
  npm start
  ```
- **To create a production build of the games**:
  ```bash
  npm run build
  ```
- **To run the unit tests**:
  ```bash
  npm test
  ```
