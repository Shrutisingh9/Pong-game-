const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 18;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 5;
const AI_SPEED = 3;

let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5 * (Math.random() > 0.5 ? 1 : -1),
  vy: 4 * (Math.random() * 2 - 1),
  radius: BALL_RADIUS,
};

let playerScore = 0;
let aiScore = 0;
let maxScore = 5;

const startGameBtn = document.getElementById('startGameBtn');
const maxScoreInput = document.getElementById('maxScore');
const overlay = document.getElementById('overlay');
const pongContainer = document.getElementById('pong-container');

startGameBtn.addEventListener('click', () => {
  maxScore = parseInt(maxScoreInput.value);
  overlay.style.display = 'none';
  pongContainer.style.display = 'block';
  gameLoop();
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#888";
  ctx.setLineDash([8, 20]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`You: ${playerScore}`, 40, 30);
  ctx.fillText(`AI: ${aiScore}`, canvas.width - 100, 30);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 5 * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = 4 * (Math.random() * 2 - 1);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

canvas.addEventListener('mousemove', function (e) {
  let rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = clamp(mouseY - PADDLE_HEIGHT / 2, 0, canvas.height - PADDLE_HEIGHT);
});

function showGameOver(winner) {
  overlay.innerHTML = `
    <div id="start-box">
      <h2>${winner} Wins!</h2>
      <button onclick="location.reload()">Play Again</button>
    </div>
  `;
  overlay.style.display = 'flex';
  pongContainer.style.display = 'none';
}

function checkGameOver() {
  if (playerScore >= maxScore) {
    showGameOver("You");
    return true;
  } else if (aiScore >= maxScore) {
    showGameOver("AI");
    return true;
  }
  return false;
}

function update() {
  if (checkGameOver()) return;

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = -ball.vy;
  }
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.vy = -ball.vy;
  }

  // Paddle collision - Player
  if (
    ball.x - ball.radius < PADDLE_MARGIN + PADDLE_WIDTH &&
    ball.y > playerY &&
    ball.y < playerY + PADDLE_HEIGHT
  ) {
    ball.x = PADDLE_MARGIN + PADDLE_WIDTH + ball.radius;
    ball.vx = -ball.vx;
    let hitPos = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.vy += hitPos * 2;
  }

  // Paddle collision - AI
  if (
    ball.x + ball.radius > canvas.width - PADDLE_MARGIN - PADDLE_WIDTH &&
    ball.y > aiY &&
    ball.y < aiY + PADDLE_HEIGHT
  ) {
    ball.x = canvas.width - PADDLE_MARGIN - PADDLE_WIDTH - ball.radius;
    ball.vx = -ball.vx;
    let hitPos = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.vy += hitPos * 2;
  }

  // Score update
  if (ball.x - ball.radius < 0) {
    aiScore++;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    playerScore++;
    resetBall();
  }

  // AI movement
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ball.y - 14) {
    aiY += AI_SPEED;
  } else if (aiCenter > ball.y + 14) {
    aiY -= AI_SPEED;
  }
  aiY = clamp(aiY, 0, canvas.height - PADDLE_HEIGHT);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#3af0e8');
  drawRect(canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#f0a53a');
  drawCircle(ball.x, ball.y, ball.radius, '#fff');
  drawScore();
}

function gameLoop() {
  update();
  render();
  if (!checkGameOver()) {
    requestAnimationFrame(gameLoop);
  }
}
