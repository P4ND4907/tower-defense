// ===== Enhanced Tower‑Defense script.js with Visuals and UI Polish + Wave Countdown + Fade Animations =====

/* ---------- CANVAS ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

/* ---------- UI ELEMENTS ---------- */
const toolbar = document.createElement('div');
toolbar.style.padding = '8px';
toolbar.style.background = '#222';
toolbar.style.display = 'flex';
toolbar.style.gap = '8px';
toolbar.style.alignItems = 'center';
toolbar.style.justifyContent = 'center';
document.body.insertBefore(toolbar, canvas);

toolbar.innerHTML = `
  <span style="color:white">Gold: <span id="goldText">300</span></span>
  <span style="color:white">Lives: <span id="livesText">20</span></span>
  <button id="startBtn">▶ Start Wave</button>
  <span style="color:white">Select Tower:</span>
  <button data-tower="arrow">🏹 Arrow (50)</button>
  <button data-tower="cannon">💣 Cannon (80)</button>
  <button data-tower="ice">❄ Ice (70)</button>
`;

document.body.style.background = '#000';
document.body.style.margin = '0';
document.body.style.fontFamily = 'sans-serif';

const goldText = document.getElementById('goldText');
const livesText = document.getElementById('livesText');
const startBtn = document.getElementById('startBtn');

let selectedTowerKey = 'arrow';
document.querySelectorAll('button[data-tower]').forEach(btn => {
  btn.onclick = () => {
    selectedTowerKey = btn.dataset.tower;
    document.querySelectorAll('[data-tower]').forEach(b => b.style.background = '');
    btn.style.background = '#555';
    btn.style.color = 'white';
  };
});

/* ---------- GAME DATA ---------- */
let gold = 300;
let lives = 20;
let wave = 0;
let waveCountdown = 0;
let countdownAlpha = 1;
const GRID = 40;
const PATH = [
  { x: -40, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 300 },
  { x: 600, y: 300 },
  { x: 600, y: 500 },
  { x: 840, y: 500 }
];

const towerDefs = {
  arrow: { cost: 50, sprite: 'tower_arrow', cooldown: 45, range: 140, bullet: 'bullet_default', dmg: 2 },
  cannon: { cost: 80, sprite: 'tower_cannon', cooldown: 60, range: 160, bullet: 'bullet_fire', dmg: 3 },
  ice: { cost: 70, sprite: 'tower_ice', cooldown: 55, range: 130, bullet: 'bullet_poison', dmg: 2 }
};

const enemySprites = ['enemy_goblin', 'enemy_orc', 'enemy_bat', 'enemy_wolf'];

const SPRITES = [...new Set([
  ...Object.values(towerDefs).flatMap(d => [d.sprite, d.bullet]),
  ...enemySprites
])];
const IMAGES = Object.fromEntries(SPRITES.map(n => [n, new Image()]));
let loaded = 0;
SPRITES.forEach(n => {
  IMAGES[n].src = `assets/${n}.png`;
  IMAGES[n].onload = () => { if (++loaded === SPRITES.length) init(); };
});

/* ---------- ENTITIES ---------- */
class Enemy {
  constructor(sprite) {
    this.sprite = sprite;
    this.pathIndex = 0;
    this.x = PATH[0].x;
    this.y = PATH[0].y;
    this.speed = 1 + 0.1 * wave;
    this.maxHp = 6 + wave * 2;
    this.hp = this.maxHp;
    this.size = 32;
    this.alpha = 0;
  }
  update() {
    this.alpha = Math.min(1, this.alpha + 0.05);
    const next = PATH[this.pathIndex + 1];
    const dx = next.x - this.x;
    const dy = next.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) {
      this.pathIndex++;
      if (this.pathIndex >= PATH.length - 1) {
        lives--;
        livesText.textContent = lives;
        this.dead = true; return;
      }
    } else {
      this.x += dx / dist * this.speed;
      this.y += dy / dist * this.speed;
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(IMAGES[this.sprite], this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 4, this.size, 3);
    ctx.fillStyle = 'lime'; ctx.fillRect(this.x, this.y - 4, this.size * (this.hp / this.maxHp), 3);
    ctx.restore();
  }
}

class Tower {
  constructor(x, y, def) {
    this.x = x;
    this.y = y;
    this.def = def;
    this.cooldown = 0;
  }
  update() {
    this.cooldown--;
    if (this.cooldown <= 0) {
      const target = enemies.find(e => dist(e, this) < this.def.range);
      if (target) {
        bullets.push(new Bullet(this.x + 16, this.y + 16, target, this.def));
        this.cooldown = this.def.cooldown;
      }
    }
  }
  draw() {
    ctx.drawImage(IMAGES[this.def.sprite], this.x, this.y, GRID, GRID);
  }
}

class Bullet {
  constructor(x, y, target, def) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.def = def;
    this.speed = 5;
    this.size = 10;
  }
  update() {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distToTarget = Math.hypot(dx, dy);
    if (distToTarget < 5 || this.target.dead) {
      this.target.hp -= this.def.dmg;
      if (this.target.hp <= 0) {
        this.target.dead = true;
        gold += 10;
        goldText.textContent = gold;
      }
      this.dead = true;
    } else {
      this.x += dx / distToTarget * this.speed;
      this.y += dy / distToTarget * this.speed;
    }
  }
  draw() {
    ctx.drawImage(IMAGES[this.def.bullet], this.x, this.y, this.size, this.size);
  }
}

let towers = [], enemies = [], bullets = [];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function spawnWave() {
  for (let i = 0; i < 6 + wave; i++) {
    const sprite = enemySprites[i % enemySprites.length];
    setTimeout(() => {
      enemies.push(new Enemy(sprite));
    }, i * 500);
  }
}

function init() {
  startBtn.onclick = () => { waveCountdown = 3; };
  canvas.addEventListener('click', e => {
    const x = Math.floor(e.offsetX / GRID) * GRID;
    const y = Math.floor(e.offsetY / GRID) * GRID;
    const def = towerDefs[selectedTowerKey];
    if (gold >= def.cost) {
      towers.push(new Tower(x, y, def));
      gold -= def.cost;
      goldText.textContent = gold;
    }
  });
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#111');
  gradient.addColorStop(1, '#333');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (waveCountdown > 0) {
    ctx.save();
    ctx.globalAlpha = countdownAlpha;
    ctx.fillStyle = 'white';
    ctx.font = '60px sans-serif';
    ctx.fillText(`Wave ${wave + 1} in ${waveCountdown}`, 250, 300);
    ctx.restore();
    countdownAlpha -= 0.02;
    if (countdownAlpha <= 0) {
      waveCountdown--;
      countdownAlpha = 1;
      if (waveCountdown === 0) {
        wave++;
        spawnWave();
      }
    }
    requestAnimationFrame(gameLoop);
    return;
  }

    towers.forEach(t => t.update());
  bullets.forEach(b => b.update());
  enemies.forEach(e => e.update());
  towers.forEach(t => t.draw());
  bullets.forEach(b => b.draw());
  enemies = enemies.filter(e => !e.dead);
  bullets = bullets.filter(b => !b.dead);
  towers = towers.filter(t => !t.dead);

  requestAnimationFrame(gameLoop);
}

// other logic remains unchanged

