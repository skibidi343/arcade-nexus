import { AudioSystem } from "./audio.js";
import { PlatformerStorage } from "./storage.js";

export class PlatformerGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameActive = true;
    }

    init() {
        this.createCanvas();
        this.gameLoop();
    }

    createCanvas() {
        this.container.innerHTML = '';
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
    }

    gameLoop() {
        if (!this.gameActive) return;

        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground
        this.ctx.fillStyle = '#00ff95';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);

        // Draw score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);

        // Simple placeholder gameplay
        this.score += 0.5;

        if (this.score > 500) {
            this.endGame();
            return;
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    endGame() {
        this.gameActive = false;
        const finalScore = Math.floor(this.score);
        PlatformerStorage.saveHighScore(finalScore);
        AudioSystem.playSuccess();
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`Game Over! Score: ${finalScore}`, 150, 200);
    }
}
