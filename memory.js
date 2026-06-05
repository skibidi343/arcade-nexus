import { AudioSystem } from "./audio.js";
import { MemoryStorage } from "./storage.js";

export class MemoryGame {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.startTime = Date.now();
        this.gameActive = true;
    }

    init() {
        this.createBoard();
        this.setupCards();
    }

    createBoard() {
        this.container.innerHTML = '';
        const board = document.createElement('div');
        board.className = 'memory-board';
        this.container.appendChild(board);
        this.boardEl = board;
    }

    setupCards() {
        const cardPairs = [
            '🎮', '🎯', '🏆', '⭐',
            '🎮', '🎯', '🏆', '⭐'
        ];
        
        const shuffled = this.shuffle(cardPairs);
        
        shuffled.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            card.textContent = '?';
            
            card.addEventListener('click', () => this.flipCard(card));
            this.boardEl.appendChild(card);
            this.cards.push(card);
        });
    }

    flipCard(card) {
        if (!this.gameActive || card.classList.contains('flipped') || this.flipped.length >= 2) return;
        
        card.classList.add('flipped');
        card.textContent = card.dataset.symbol;
        this.flipped.push(card);
        AudioSystem.playMemoryFlip();

        if (this.flipped.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        this.moves++;
        const [card1, card2] = this.flipped;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            AudioSystem.playMemoryMatch();
            this.matched.push(card1, card2);
            this.flipped = [];
            
            if (this.matched.length === this.cards.length) {
                this.gameOver();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '?';
                card2.textContent = '?';
                this.flipped = [];
            }, 600);
        }
    }

    gameOver() {
        this.gameActive = false;
        const time = (Date.now() - this.startTime) / 1000;
        MemoryStorage.saveResult(time, this.moves);
        AudioSystem.playSuccess();
        console.log(`Memory game completed in ${time}s with ${this.moves} moves`);
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
