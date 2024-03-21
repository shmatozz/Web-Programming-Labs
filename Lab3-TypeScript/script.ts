class TicTacToe {
    board: string[];
    currentPlayer: string;
    winner: string;
    gameMode: string;

    constructor() {
        this.board = Array(9).fill("");
        this.currentPlayer = "X";
        this.winner = "";
        this.gameMode = "playerVsPlayer";
        this.render();
    }

    setGameMode(mode: string) {
        this.gameMode = mode;
        this.restart();
    }

    onClick(index: number) {
        if (this.winner !== "" || this.board[index] !== "") return;

        this.board[index] = this.currentPlayer;
        this.checkWinner();
        this.checkDraw();
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        this.render();
        if (this.gameMode === "playerVsBot" && this.currentPlayer === "O") {
            this.makeComputerMove();
        }
    }

    makeComputerMove() {
        if (this.currentPlayer !== "O" || this.winner !== "") return;

        let availableMoves: number[] = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === "") {
                availableMoves.push(i);
            }
        }

        if (availableMoves.length > 0) {
            let randomIndex = Math.floor(Math.random() * availableMoves.length);
            this.onClick(availableMoves[randomIndex]);
        }
    }

    isBoardFull(board: string[]): boolean {
        return board.every(cell => cell !== "");
    }

    checkWinner() {
        const winLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],   // horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8],   // vertical
            [0, 4, 8], [2, 4, 6]               // diagonal
        ];

        for (const line of winLines) {
            const [a, b, c] = line;
            if (this.board[a] !== "" &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                break;
            }
        }
    }

    render() {
        const boardElement = document.getElementById("board");
        boardElement.innerHTML = "";
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.innerText = cell;
            cellElement.addEventListener("click", () => this.onClick(index));
            boardElement.appendChild(cellElement);
        });

        const messageElement = document.getElementById("message");
        if (this.winner === "Draw") {
            messageElement.innerText = "Ничья";
        } else if (this.winner !== "") {
            messageElement.innerText = `Победитель: ${this.winner}`;
        } else {
            messageElement.innerText = `Сейчас ходит: ${this.currentPlayer}`;
        }
    }

    checkDraw() {
        if (this.isBoardFull() && this.winner === "") {
            this.winner = "Draw"
        }
    }

    isBoardFull(): boolean {
        return this.board.every(cell => cell !== "");
    }

    restart() {
        this.board = Array(9).fill("");
        this.currentPlayer = "X";
        this.winner = "";
        this.render();
    }
}

const ticTacToe = new TicTacToe();

const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", () => {
    ticTacToe.restart();
});

const playerVsPlayerRadio = document.getElementById("playerVsPlayer");
const playerVsBotRadio = document.getElementById("playerVsBot");

playerVsPlayerRadio.addEventListener("change", () => {
    ticTacToe.setGameMode("playerVsPlayer");
});

playerVsBotRadio.addEventListener("change", () => {
    ticTacToe.setGameMode("playerVsBot");
});
