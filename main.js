import { UI } from "./ui.js";
import {
    StorageManager,
    ProfileStorage,
    SettingsStorage,
    AchievementStorage,
    StatsStorage
} from "./storage.js";

import { AudioSystem } from "./audio.js";

class ArcadeNexus {
    constructor() {
        this.data = null;

        this.playtimeStart = Date.now();

        this.particleCanvas = null;
        this.particleCtx = null;

        this.particles = [];

        this.activeGame = null;
    }

    async init() {
        this.loadData();

        this.initializeAudio();

        this.initializeUI();

        this.initializeParticles();

        this.initializeProfile();

        this.initializeSettings();

        this.initializeAchievements();

        this.startPlaytimeTracker();

        this.startParticleLoop();

        UI.hideLoading();

        console.log(
            "Arcade Nexus Initialized"
        );
    }

    loadData() {
        this.data =
            StorageManager.load();

        StatsStorage.updateLastPlayed();
    }

    initializeAudio() {
        document.addEventListener(
            "click",
            () => {
                AudioSystem.init();

                AudioSystem.refreshMusicState();
            },
            {
                once: true
            }
        );
    }

    initializeUI() {
        UI.init();

        UI.updateDashboard(
            this.data
        );

        UI.updateProfile(
            this.data
        );

        UI.updateScorePreviews(
            this.data
        );

        UI.applySettings(
            this.data.settings
        );

        this.registerUIEvents();
    }

    registerUIEvents() {
        UI.setupGameButtons(
            game => {
                this.launchGame(
                    game
                );
            }
        );

        UI.setupUsernameSave(
            username => {
                ProfileStorage.setUsername(
                    username
                );

                this.reloadData();
            }
        );

        UI.setupResetButton(
            () => {
                StorageManager.reset();

                location.reload();
            }
        );

        UI.setupSettingsEvents(
            () => {
                this.saveSettings();
            }
        );
    }

    initializeProfile() {
        const username =
            ProfileStorage.getUsername();

        const input =
            document.getElementById(
                "usernameInput"
            );

        if (
            input
        ) {
            input.value =
                username;
        }
    }

    initializeSettings() {
        const settings =
            SettingsStorage.getSettings();

        document.body.classList.toggle(
            "light-theme",
            settings.theme ===
                "light"
        );
    }

    initializeAchievements() {
        UI.refreshAchievementUI(
            AchievementStorage.getUnlocked()
        );
    }

    reloadData() {
        this.data =
            StorageManager.load();

        UI.updateDashboard(
            this.data
        );

        UI.updateProfile(
            this.data
        );

        UI.updateScorePreviews(
            this.data
        );

        UI.refreshAchievementUI(
            this.data.achievements
                .unlocked
        );
    }

    saveSettings() {
        const sound =
            document.getElementById(
                "soundToggle"
            );

        const music =
            document.getElementById(
                "musicToggle"
            );

        const difficulty =
            document.getElementById(
                "difficultySelect"
            );

        SettingsStorage.setSound(
            sound?.checked ??
                true
        );

        SettingsStorage.setMusic(
            music?.checked ??
                true
        );

        SettingsStorage.setDifficulty(
            difficulty?.value ??
                "normal"
        );

        AudioSystem.refreshMusicState();
    }

    startPlaytimeTracker() {
        setInterval(
            () => {
                ProfileStorage.addPlaytime(
                    1
                );

                this.reloadData();
            },
            1000
        );
    }

    initializeParticles() {
        this.particleCanvas =
            document.getElementById(
                "particleCanvas"
            );

        if (
            !this.particleCanvas
        ) {
            return;
        }

        this.particleCtx =
            this.particleCanvas.getContext(
                "2d"
            );

        this.resizeCanvas();

        window.addEventListener(
            "resize",
            () => {
                this.resizeCanvas();
            }
        );

        for (
            let i = 0;
            i < 80;
            i++
        ) {
            this.particles.push(
                this.createParticle()
            );
        }
    }

    resizeCanvas() {
        if (
            !this.particleCanvas
        ) {
            return;
        }

        this.particleCanvas.width =
            window.innerWidth;

        this.particleCanvas.height =
            window.innerHeight;
    }

    createParticle() {
        return {
            x:
                Math.random() *
                window.innerWidth,

            y:
                Math.random() *
                window.innerHeight,

            size:
                Math.random() * 3 + 1,

            speed:
                Math.random() * 0.5 +
                0.2,

            alpha:
                Math.random() * 0.6 +
                0.2
        };
    }

    startParticleLoop() {
        const animate = () => {
            if (
                !this.particleCanvas ||
                !this.particleCtx
            ) {
                requestAnimationFrame(
                    animate
                );

                return;
            }

            this.particleCtx.clearRect(
                0,
                0,
                this.particleCanvas.width,
                this.particleCanvas.height
            );

            this.particles.forEach(
                particle => {
                    particle.y -=
                        particle.speed;

                    if (
                        particle.y < -10
                    ) {
                        particle.y =
                            window.innerHeight +
                            10;

                        particle.x =
                            Math.random() *
                            window.innerWidth;
                    }

                    this.particleCtx.beginPath();

                    this.particleCtx.arc(
                        particle.x,
                        particle.y,
                        particle.size,
                        0,
                        Math.PI * 2
                    );

                    this.particleCtx.fillStyle =
                        `rgba(0,255,255,${particle.alpha})`;

                    this.particleCtx.fill();
                }
            );

            requestAnimationFrame(
                animate
            );
        };

        animate();
    }

    launchGame(gameName) {
        this.activeGame =
            gameName;

        console.log(
            `Launching: ${gameName}`
        );

        const title =
            gameName
                .charAt(0)
                .toUpperCase() +
            gameName.slice(1);

        UI.openModal(title);

        const container =
            document.getElementById(
                "gameContainer"
            );

        if (
            !container
        ) {
            return;
        }

        container.innerHTML =
            `
            <div class="game-loading">
                Loading ${title}...
            </div>
        `;

        switch (
            gameName
        ) {
            case "snake":
                this.loadSnake();
                break;

            case "tictactoe":
                this.loadTicTacToe();
                break;

            case "reaction":
                this.loadReaction();
                break;

            case "memory":
                this.loadMemory();
                break;

            case "platformer":
                this.loadPlatformer();
                break;
        }
    }

    loadSnake() {
        console.log(
            "Snake Loaded"
        );
    }

    loadTicTacToe() {
        console.log(
            "TicTacToe Loaded"
        );
    }

    loadReaction() {
        console.log(
            "Reaction Loaded"
        );
    }

    loadMemory() {
        console.log(
            "Memory Loaded"
        );
    }

    loadPlatformer() {
        console.log(
            "Platformer Loaded"
        );
    }

    unlockAchievement(
        name
    ) {
        if (
            AchievementStorage.isUnlocked(
                name
            )
        ) {
            return;
        }

        AchievementStorage.unlock(
            name
        );

        UI.showAchievement(
            name
        );

        this.reloadData();
    }

    checkGlobalAchievements() {
        const data =
            StorageManager.load();

        if (
            data.scores.snake
                .highScore >= 50
        ) {
            this.unlockAchievement(
                "Snake Score 50+"
            );
        }

        if (
            data.scores.reaction
                .bestTime &&
            data.scores.reaction
                .bestTime < 200
        ) {
            this.unlockAchievement(
                "Reaction Time < 200ms"
            );
        }
    }

    destroy() {
        console.log(
            "Arcade Nexus Shutdown"
        );
    }
}

const app =
    new ArcadeNexus();

window.addEventListener(
    "DOMContentLoaded",
    () => {
        app.init();
    }
);

window.ArcadeNexus =
    app;

export default app;