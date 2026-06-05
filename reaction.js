import { AudioSystem } from "./audio.js";
import { ReactionStorage } from "./storage.js";

export class ReactionGame {
    constructor(container) {
        this.container = container;
        this.box = null;
        this.attempts = 0;
        this.totalTime = 0;
        this.gameActive = false;
    }

    init() {
        this.createBox();
        this.startRound();
    }

    createBox() {
        this.container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'reaction-wrapper';
        
        this.box = document.createElement('div');
        this.box.className = 'reaction-box idle';
        this.box.textContent = 'Click when box turns green!';
        
        wrapper.appendChild(this.box);
        this.container.appendChild(wrapper);
        
        this.box.addEventListener('click', () => this.handleClick());
    }

    startRound() {
        this.attempts++;
        
        if (this.attempts > 3) {
            this.endGame();
            return;
        }

        this.gameActive = false;
        this.box.className = 'reaction-box waiting';
        this.box.textContent = 'Wait for green...';
        
        const delay = Math.random() * 3000 + 1000;
        
        setTimeout(() => {
            this.startTime = Date.now();
            this.gameActive = true;
            this.box.className = 'reaction-box ready';
            this.box.textContent = 'GO!';
            AudioSystem.playReactionStart();
        }, delay);
    }

    handleClick() {
        if (!this.gameActive) {
            this.box.className = 'reaction-box too-early';
            this.box.textContent = 'Too early!';
            AudioSystem.playError();
            setTimeout(() => this.startRound(), 1500);
            return;
        }

        const reactionTime = Date.now() - this.startTime;
        this.totalTime += reactionTime;
        this.box.className = 'reaction-box idle';
        this.box.textContent = `${reactionTime}ms`;
        AudioSystem.playReactionResult();
        
        ReactionStorage.saveAttempt(reactionTime);
        
        setTimeout(() => this.startRound(), 1500);
    }

    endGame() {
        const avgTime = Math.round(this.totalTime / 3);
        this.box.className = 'reaction-box idle';
        this.box.textContent = `Average: ${avgTime}ms`;
        AudioSystem.playSuccess();
        console.log(`Reaction test completed. Average time: ${avgTime}ms`);
    }
}
