import { LalelaGame } from '../utils/LalelaGame.js';

export class ExploreWorldMusicGame extends LalelaGame {
    constructor() {
        super({
            key: 'ExploreWorldMusicGame',
            name: 'Explore World Music',
            category: 'discovery',
            difficulty: 2,
            description: 'Discover music from around the world.'
        });
    }

    preload() {
        super.preload();
        // Reuse world map from explore-monuments
        this.load.svg('world-map', 'assets/explore-monuments/wonders/world-map.svg');
        
        // Load suitcase icon
        this.load.svg('music-suitcase', 'assets/explore-world-music/suitcase.svg', { width: 64, height: 64 });
        
        // Load level data images and audio
        this.loadLevelAssets();
    }

    loadLevelAssets() {
        const musicItems = this.getLevelData();
        musicItems.forEach(item => {
            // Load image
            this.load.image(item.id, `assets/explore-world-music/${item.image}`);
            // Load audio
            this.load.audio(item.id + '-audio', `assets/explore-world-music/${item.audio}`);
        });
    }

    create() {
        super.create();
        this.createBackground();
        this.createUI();
        this.setupGameLogic();
    }

    createBackground() {
        const { width, height } = this.scale;
        
        // World Map
        const map = this.add.image(width / 2, height / 2, 'world-map');
        
        // Logic from ExploreMonumentsGame to handle the map scaling
        // The map SVG has a large padding around the content, so we need to zoom in
        const availableHeight = height - 100;
        const playAreaSize = Math.min(width, availableHeight);
        
        // Scale background to be 3x the play area size
        const scale = (3 * playAreaSize) / map.width;
        
        map.setScale(scale);
        map.setDepth(-1);
        
        // Store map bounds for positioning markers
        // Markers are relative to the play area (central part of the map)
        this.mapBounds = {
            x: (width - playAreaSize) / 2,
            y: (height - playAreaSize) / 2,
            width: playAreaSize,
            height: playAreaSize
        };
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Title
        this.add.text(width / 2, 30, 'Explore World Music', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
        
        // Instruction Text
        this.instructionText = this.add.text(width / 2, height - 40, 'Click on a suitcase to discover music!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(10);

        // Navigation Dock
        this.createNavigationDock();
    }

    createNavigationDock() {
        const { width, height } = this.scale;
        const dockHeight = 60;
        const buttonSize = 40;
        const padding = 20;
        
        let x = width - padding - buttonSize/2;
        let y = height - padding - buttonSize/2;
        
        // Exit
        this.createNavButton(x, y, 0xff5252, '✕', () => {
            this.scene.start('GameMenu');
        });
        x -= buttonSize + padding;
        
        // Restart
        this.createNavButton(x, y, 0x26c6da, '↻', () => {
            this.restartLevel();
        });
    }
    
    createNavButton(x, y, color, icon, callback, textColor = '#ffffff') {
        const button = this.add.circle(x, y, 20, color)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        this.add.circle(x, y + 2, 20, 0x000000, 0.3).setDepth(9);
        
        const text = this.add.text(x, y, icon, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: textColor
        }).setOrigin(0.5).setDepth(11);

        button.on('pointerover', () => {
            button.setScale(1.1);
            text.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            text.setScale(1);
        });
        button.on('pointerdown', callback);
        
        return { button, text };
    }

    setupGameLogic() {
        this.musicItems = this.getLevelData();
        this.createMarkers();
        this.updateInstructions();
    }

    updateInstructions() {
        // In this game, we just explore, so instructions are static or simple
        this.instructionText.setText('Click on a suitcase to listen to music from that region.');
    }

    createMarkers() {
        const { width, height } = this.scale;
        
        const markerSize = Math.min(width, height) * 0.06;
        const mapBounds = this.mapBounds || { x: 0, y: 0, width, height };
        
        this.musicItems.forEach((item, index) => {
            const x = mapBounds.x + mapBounds.width * item.x;
            const y = mapBounds.y + mapBounds.height * item.y;
            
            // Create marker (suitcase icon)
            const marker = this.add.image(x, y, 'music-suitcase');
            const scale = markerSize / Math.max(marker.width, marker.height);
            marker.setScale(scale);
            marker.setDepth(5);
            marker.setInteractive({ useHandCursor: true });
            
            marker.setData('item', item);
            
            marker.on('pointerdown', () => {
                this.showMusicInfo(item);
            });
            
            // Hover effect
            marker.on('pointerover', () => {
                marker.setScale(scale * 1.2);
            });
            marker.on('pointerout', () => {
                marker.setScale(scale);
            });
        });
    }

    showMusicInfo(item) {
        const { width, height } = this.scale;
        
        // Stop any currently playing music
        if (this.currentAudio) {
            this.currentAudio.stop();
        }

        // Play new music
        if (this.audioManager) {
            // Use AudioManager if available (preferred)
             // But here we loaded audio via Phaser loader in preload()
             // So we can use this.sound.play()
             // Or if we want to use AudioManager, we should have loaded it via AudioManager
             // Let's stick to Phaser sound for these specific assets as they are part of the scene
             this.currentAudio = this.sound.add(item.id + '-audio');
             this.currentAudio.play();
        } else {
             this.currentAudio = this.sound.add(item.id + '-audio');
             this.currentAudio.play();
        }
        
        // Create modal
        const modal = this.add.container(width/2, height/2).setDepth(20);
        this.currentModal = modal;
        
        // Background
        const bg = this.add.rectangle(0, 0, 600, 450, 0xffffff).setStrokeStyle(4, 0x3d5a5a);
        modal.add(bg);
        
        // Image
        if (this.textures.exists(item.id)) {
            const img = this.add.image(0, -80, item.id);
            const scale = Math.min(500 / img.width, 250 / img.height);
            img.setScale(scale);
            modal.add(img);
        }
        
        // Title
        const title = this.add.text(0, 80, item.title, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(title);
        
        // Description
        const desc = this.add.text(0, 140, item.text, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#333333',
            align: 'center',
            wordWrap: { width: 550 }
        }).setOrigin(0.5, 0);
        modal.add(desc);
        
        // Close button
        const closeBtn = this.add.text(0, 190, 'Close', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#3d5a5a',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            if (this.currentAudio) {
                this.currentAudio.stop();
            }
            modal.destroy();
            this.currentModal = null;
        });
        modal.add(closeBtn);
    }

    restartLevel() {
        if (this.currentAudio) {
            this.currentAudio.stop();
        }
        this.scene.restart({ 
            assetManager: this.assetManager,
            uiManager: this.uiManager,
            gameManager: this.gameManager,
            audioManager: this.audioManager,
            dataManager: this.dataManager,
            inputManager: this.inputManager
        });
    }

    getLevelData() {
        return [
            {
                id: 'australia',
                image: 'australia.webp',
                audio: 'australia.ogg',
                title: 'Australia',
                text: 'Aboriginals were the first people to live in Australia. They sing and play instruments, like the didgeridoo. It is made from a log and can be up to five meters long!',
                x: 0.840,
                y: 0.63
            },
            {
                id: 'africa',
                image: 'africa.webp',
                audio: 'africa.ogg',
                title: 'Africa',
                text: 'Music is a part of everyday life in Africa. African music features a great variety of drums, and they believe it is a sacred and magical instrument.',
                x: 0.53,
                y: 0.54
            },
            {
                id: 'middleeast',
                image: 'middleeast.webp',
                audio: 'middleeast.ogg',
                title: 'Middle East',
                text: 'Music is a very important part of middle eastern culture. Specific songs are played to call worshipers to prayer. The lute is an instrument invented thousands of years ago and still in use today.',
                x: 0.59,
                y: 0.46
            },
            {
                id: 'japan',
                image: 'japan.webp',
                audio: 'japan.ogg',
                title: 'Japan',
                text: 'Taiko drumming comes from Japan. This type of drumming was originally used to scare enemies in battle. It is very loud, and performances are very exciting with crowds cheering and performers yelling!',
                x: 0.855,
                y: 0.445
            },
            {
                id: 'ireland',
                image: 'ireland.webp',
                audio: 'ireland.ogg',
                title: 'Scotland and Ireland',
                text: 'Folk music of this region is called celtic music. It often incorporates a narrative poem or story. Typical instruments include bagpipes, fiddles, flutes, harps, and accordions.',
                x: 0.44,
                y: 0.36
            },
            {
                id: 'italy',
                image: 'italy.webp',
                audio: 'italy.ogg',
                title: 'Italy',
                text: 'Italy is famous for its Opera. Opera is a musical theater where actors tell a story by acting and singing. Opera singers, both male and female, learn special techniques to sing operas.',
                x: 0.52,
                y: 0.44
            },
            {
                id: 'beethoven',
                image: 'orchestra.webp',
                audio: 'beethoven.ogg',
                title: 'European Classical Music',
                text: 'Europe is the home of classical music. Famous composers like Bach, Beethoven, and Mozart forever changed music history.',
                x: 0.50,
                y: 0.38
            },
            {
                id: 'mexico',
                image: 'mexico.webp',
                audio: 'mexico.ogg',
                title: 'Mexico',
                text: 'Mariachi is a famous style of music from Mexico. It is played with violins, trumpets, and guitars. The musicians wear big hats called sombreros and special suits.',
                x: 0.18,
                y: 0.48
            },
            {
                id: 'america',
                image: 'america.webp',
                audio: 'america.ogg',
                title: 'America',
                text: 'Jazz is a style of music that was invented in America. It is a mixture of African and European music. Jazz musicians often improvise, which means they make up the music as they play.',
                x: 0.22,
                y: 0.38
            }
        ];
    }
}
