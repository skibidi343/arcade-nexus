import { AudioSystem } from "./audio.js";

export class TicTacToe {
    constructor(container, ui, onFinish, saveWinCallback) {
        this.container = container;
        this.ui = ui;
        this.onFinish = onFinish;
        this.saveWinCallback = saveWinCallback;

        this.board = Array(9).fill(null);
        this.currentPlayer = "X";
        this.gameOver = false;

        this.mode = "pve";
        this.aiDifficulty = "hard";

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="ttt-wrapper">
                <div class="ttt-header">

                    <div class="ttt-modes">
                        <button id="pvp">PVP</button>
                        <button id="pve">AI</button>
                    </div>

                    <div class="ttt-difficulty">
                        <select id="difficulty">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard" selected>Hard</option>
                        </select>
                    </div>

                    <div id="status">Turn: X</div>
                </div>

                <div class="ttt-board" id="board"></div>

                <button id="reset">Restart</button>
            </div>
        `;

        this.boardEl = this.container.querySelector("#board");
        this.statusEl = this.container.querySelector("#status");
        this.diffEl = this.container.querySelector("#difficulty");

        this.createBoard();
        this.bindEvents();
    }

    createBoard() {
        this.boardEl.innerHTML = "";

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.className = "ttt-cell";
            cell.dataset.index = i;

            cell.addEventListener("click", () => this.handleMove(i));

            this.boardEl.appendChild(cell);
        }
    }

    bindEvents() {
        this.container.querySelector("#pvp").onclick = () => {
            this.mode = "pvp";
            this.reset();
            AudioSystem.playClick();
        };

        this.container.querySelector("#pve").onclick = () => {
            this.mode = "pve";
            this.reset();
            AudioSystem.playClick();
        };

        this.diffEl.onchange = (e) => {
            this.aiDifficulty = e.target.value;
        };

        this.container.querySelector("#reset").onclick = () => {
            this.reset();
            AudioSystem.playClick();
        };
    }

    handleMove(index) {
        if (this.board[index] || this.gameOver) return;

        this.playMove(index, this.currentPlayer);

        if (this.checkWin(this.currentPlayer)) {
            return this.endGame(this.currentPlayer);
        }

        if (this.isDraw()) {
            return this.endGame("draw");
        }

        this.switchPlayer();

        if (this.mode === "pve" && this.currentPlayer === "O") {
            setTimeout(() => this.aiMove(), 350);
        }
    }

    playMove(index, player) {
        this.board[index] = player;

        const cell = this.boardEl.querySelector(`[data-index="${index}"]`);

        cell.textContent = player;
        cell.classList.add(player.toLowerCase(), "pop");

        setTimeout(() => cell.classList.remove("pop"), 200);

        AudioSystem.playClick();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        this.statusEl.textContent = `Turn: ${this.currentPlayer}`;
    }

    aiMove() {
        if (this.gameOver) return;

        let move;

        if (this.aiDifficulty === "easy") {
            move = this.randomMove();
        } else if (this.aiDifficulty === "medium") {
            move = this.mediumMove();
        } else {
            move = this.minimax(this.board, "O").index;
        }

        this.playMove(move, "O");

        if (this.checkWin("O")) {
            return this.endGame("O");
        }

        if (this.isDraw()) {
            return this.endGame("draw");
        }

        this.switchPlayer();
    }

    randomMove() {
        const empty = this.board
            .map((v, i) => v === null ? i : null)
            .filter(v => v !== null);

        return empty[Math.floor(Math.random() * empty.length)];
    }

    mediumMove() {
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = "O";
                if (this.checkWin("O")) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }

        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = "X";
                if (this.checkWin("X")) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }

        return this.randomMove();
    }

    minimax(board, player) {
        const opponent = player === "O" ? "X" : "O";

        if (this.getWinner(board) === "O") return { score: 10 };
        if (this.getWinner(board) === "X") return { score: -10 };
        if (board.every(c => c)) return { score: 0 };

        const moves = [];

        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                const newBoard = [...board];
                newBoard[i] = player;

                const result = this.minimax(newBoard, opponent);

                moves.push({
                    index: i,
                    score: result.score
                });
            }
        }

        let bestMove;

        if (player === "O") {
            let bestScore = -Infinity;

            for (const m of moves) {
                if (m.score > bestScore) {
                    bestScore = m.score;
                    bestMove = m;
                }
            }
        } else {
            let bestScore = Infinity;

            for (const m of moves) {
                if (m.score < bestScore) {
                    bestScore = m.score;
                    bestMove = m;
                }
            }
        }

        return bestMove;
    }

    checkWin(player) {
        const winLines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];

        for (const line of winLines) {
            const [a,b,c] = line;

            if (
                this.board[a] === player &&
                this.board[b] === player &&
                this.board[c] === player
            ) {
                this.highlightWin(line);
                return true;
            }
        }

        return false;
    }

    highlightWin(line) {
        line.forEach(i => {
            const cell = this.boardEl.querySelector(`[data-index="${i}"]`);
            cell.classList.add("win");
        });
    }

    isDraw() {
        return this.board.every(c => c);
    }

    endGame(result) {
        this.gameOver = true;

        if (result === "draw") {
            this.statusEl.textContent = "Draw!";
            AudioSystem.playError();
        } else {
            this.statusEl.textContent = `${result} wins!`;
            AudioSystem.playSuccess();

            if (this.saveWinCallback) {
                this.saveWinCallback(result);
            }
        }

        if (this.onFinish) {
            this.onFinish(result);
        }
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = "X";
        this.gameOver = false;

        this.createBoard();
        this.statusEl.textContent = "Turn: X";
    }
}
