// 井字棋 - 游戏逻辑

class TicTacToe {
    constructor() {
        // 游戏状态
        this.board = Array(9).fill(null); // 棋盘状态
        this.moveHistory = []; // 移动历史，用于追踪棋子顺序
        this.maxPieces = 6; // 棋盘最多显示的棋子数
        this.currentPlayer = 'X'; // X 是玩家，O 是 AI
        this.gameActive = true;
        this.turnCount = 0;
        this.difficulty = 'easy'; // easy, medium, hard

        // 统计
        this.stats = {
            playerWins: 0,
            aiWins: 0,
            draws: 0
        };

        // 加载保存的统计
        this.loadStats();

        // DOM 元素
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerDisplay = document.getElementById('currentPlayer');
        this.pieceCountDisplay = document.getElementById('pieceCount');
        this.turnCountDisplay = document.getElementById('turnCount');
        this.gameStatus = document.getElementById('gameStatus');
        this.restartBtn = document.getElementById('restartBtn');
        this.difficultyBtn = document.getElementById('difficultyBtn');

        // 获胜组合
        this.winPatterns = [
            [0, 1, 2], // 第一行
            [3, 4, 5], // 第二行
            [6, 7, 8], // 第三行
            [0, 3, 6], // 第一列
            [1, 4, 7], // 第二列
            [2, 5, 8], // 第三列
            [0, 4, 8], // 主对角线
            [2, 4, 6]  // 副对角线
        ];

        // 初始化
        this.init();
    }

    // 初始化游戏
    init() {
        // 绑定事件
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.difficultyBtn.addEventListener('click', () => this.toggleDifficulty());

        // 更新显示
        this.updateDisplay();
    }

    // 处理格子点击
    handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.dataset.index);

        // 检查是否可以落子
        if (!this.gameActive || this.board[index] !== null || this.currentPlayer !== 'X') {
            return;
        }

        // 玩家落子
        this.makeMove(index, 'X');

        // 检查游戏是否结束
        if (this.gameActive) {
            // AI 回合
            setTimeout(() => this.aiMove(), 500);
        }
    }

    // 落子
    makeMove(index, player) {
        // 记录移动
        this.moveHistory.push({
            index: index,
            player: player,
            turn: this.turnCount
        });

        // 更新棋盘
        this.board[index] = player;
        this.turnCount++;

        // 检查是否需要移除旧棋子
        if (this.moveHistory.length > this.maxPieces) {
            this.removeOldestPiece();
        }

        // 更新显示
        this.updateBoard();
        this.updateFadingPieces();
        this.updateDisplay();

        // 检查胜负
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else if (this.turnCount >= 20) {
            // 防止无限循环
            this.endGame('draw');
        } else {
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateDisplay();
        }
    }

    // 移除最早的棋子
    removeOldestPiece() {
        const oldestMove = this.moveHistory.shift();
        this.board[oldestMove.index] = null;

        // 移除闪烁效果
        const cell = this.cells[oldestMove.index];
        cell.classList.remove('fading');
    }

    // 更新即将消失的棋子效果
    updateFadingPieces() {
        // 清除所有闪烁效果
        this.cells.forEach(cell => {
            cell.classList.remove('fading');
        });

        // 如果棋盘已满（6枚），显示最早棋子的闪烁效果
        if (this.moveHistory.length >= this.maxPieces) {
            const oldestMove = this.moveHistory[0];
            this.cells[oldestMove.index].classList.add('fading');
        }
    }

    // AI 落子
    aiMove() {
        if (!this.gameActive) return;

        let move;

        switch (this.difficulty) {
            case 'easy':
                move = this.getEasyMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            default:
                move = this.getEasyMove();
        }

        if (move !== null) {
            this.makeMove(move, 'O');
        }
    }

    // 简单 AI：随机落子
    getEasyMove() {
        const availableMoves = this.getAvailableMoves();
        if (availableMoves.length === 0) return null;
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // 中等 AI：进攻但不太聪明
    getMediumMove() {
        // 30% 概率随机，70% 概率使用聪明策略
        if (Math.random() < 0.3) {
            return this.getEasyMove();
        }

        // 尝试获胜
        const winMove = this.findWinningMove('O');
        if (winMove !== null) return winMove;

        // 阻止玩家获胜
        const blockMove = this.findWinningMove('X');
        if (blockMove !== null) return blockMove;

        // 占据中心
        if (this.board[4] === null) return 4;

        // 随机
        return this.getEasyMove();
    }

    // 困难 AI：策略性落子
    getHardMove() {
        // 尝试获胜
        const winMove = this.findWinningMove('O');
        if (winMove !== null) return winMove;

        // 阻止玩家获胜
        const blockMove = this.findWinningMove('X');
        if (blockMove !== null) return blockMove;

        // 占据中心
        if (this.board[4] === null) return 4;

        // 占据角落
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === null);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // 占据边缘
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => this.board[i] === null);
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }

        return this.getEasyMove();
    }

    // 查找可以获胜的落子位置
    findWinningMove(player) {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            const values = [this.board[a], this.board[b], this.board[c]];

            // 如果有两个相同且一个为空
            if (values.filter(v => v === player).length === 2 &&
                values.filter(v => v === null).length === 1) {
                if (this.board[a] === null) return a;
                if (this.board[b] === null) return b;
                if (this.board[c] === null) return c;
            }
        }
        return null;
    }

    // 获取可落子位置
    getAvailableMoves() {
        return this.board.map((cell, index) => cell === null ? index : null)
                          .filter(index => index !== null);
    }

    // 检查胜负
    checkWinner() {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                return {
                    winner: this.board[a],
                    pattern: pattern
                };
            }
        }
        return null;
    }

    // 更新棋盘显示
    updateBoard() {
        this.cells.forEach((cell, index) => {
            // 清除所有类
            cell.className = 'cell';
            cell.textContent = '';

            // 设置棋子
            if (this.board[index]) {
                cell.textContent = this.board[index];
                cell.classList.add('taken', this.board[index].toLowerCase());
            }
        });
    }

    // 更新游戏信息显示
    updateDisplay() {
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        this.pieceCountDisplay.textContent = `${this.moveHistory.length} / ${this.maxPieces}`;
        this.turnCountDisplay.textContent = this.turnCount;

        // 更新统计
        document.getElementById('playerWins').textContent = this.stats.playerWins;
        document.getElementById('aiWins').textContent = this.stats.aiWins;
        document.getElementById('draws').textContent = this.stats.draws;
    }

    // 结束游戏
    endGame(result) {
        this.gameActive = false;

        // 清除闪烁效果
        this.cells.forEach(cell => {
            cell.classList.remove('fading');
        });

        if (result === 'draw') {
            this.gameStatus.textContent = '平局！';
            this.gameStatus.className = 'game-status draw';
            this.stats.draws++;
        } else {
            const { winner, pattern } = result;

            // 高亮获胜线路
            pattern.forEach(index => {
                this.cells[index].classList.add('winner');
            });

            if (winner === 'X') {
                this.gameStatus.textContent = '🎉 你赢了！';
                this.gameStatus.className = 'game-status winner';
                this.stats.playerWins++;
            } else {
                this.gameStatus.textContent = '😢 电脑赢了！';
                this.gameStatus.className = 'game-status loser';
                this.stats.aiWins++;
            }
        }

        this.updateDisplay();
        this.saveStats();
    }

    // 重新开始游戏
    restartGame() {
        this.board = Array(9).fill(null);
        this.moveHistory = [];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.turnCount = 0;

        this.gameStatus.textContent = '';
        this.gameStatus.className = 'game-status';

        this.updateBoard();
        this.updateDisplay();
    }

    // 切换难度
    toggleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        this.difficulty = difficulties[(currentIndex + 1) % difficulties.length];

        const difficultyNames = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };

        this.difficultyBtn.textContent = `难度: ${difficultyNames[this.difficulty]}`;
    }

    // 保存统计
    saveStats() {
        localStorage.setItem('fadingTicTacToeStats', JSON.stringify(this.stats));
    }

    // 加载统计
    loadStats() {
        const saved = localStorage.getItem('fadingTicTacToeStats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
