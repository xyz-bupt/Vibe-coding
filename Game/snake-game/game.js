// 获取Canvas和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 游戏状态
let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = 100;
let isGameRunning = false;
let isPaused = false;

// 初始化高分显示
highScoreElement.textContent = highScore;

// 初始化游戏
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100;
    spawnFood();
}

// 生成食物
function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // 确保食物不会生成在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
            return;
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身
            ctx.fillStyle = '#8BC34A';
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    // 绘制食物
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(
        food.x * gridSize + 1,
        food.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
    );
}

// 更新游戏状态
function update() {
    if (!isGameRunning || isPaused) return;

    // 更新方向
    direction = { ...nextDirection };

    // 计算新的蛇头位置
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // 检查碰撞
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
        return;
    }

    // 添加新蛇头
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        spawnFood();

        // 加速游戏
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        // 移除蛇尾
        snake.pop();
    }
}

// 游戏步骤
function gameStep() {
    update();
    draw();
}

// 开始游戏
function startGame() {
    if (isGameRunning) {
        stopGame();
    }

    initGame();
    isGameRunning = true;
    isPaused = false;
    startBtn.textContent = '重新开始';
    pauseBtn.textContent = '暂停';
    pauseBtn.disabled = false;

    gameLoop = setInterval(gameStep, gameSpeed);
}

// 停止游戏
function stopGame() {
    isGameRunning = false;
    isPaused = false;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    pauseBtn.disabled = true;
}

// 暂停/继续游戏
function togglePause() {
    if (!isGameRunning) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 游戏结束
function gameOver() {
    stopGame();

    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    startBtn.textContent = '重新开始';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            e.preventDefault();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
    }
});

// 按钮事件
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// 初始绘制
initGame();
draw();
pauseBtn.disabled = true;
