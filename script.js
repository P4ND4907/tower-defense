/* ===== Tower-Defense  –  script.js ===== */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

/* ---------- ASSET PRELOAD ---------- */
const SPRITES = [
  // towers
  'tower_arrow', 'tower_cannon', 'tower_lightning', 'tower_flame',
  'tower_poison', 'tower_stun', 'tower_wind', 'tower_gold',
  // enemies
  'enemy_goblin', 'enemy_orc', 'enemy_bat', 'enemy_wolf',
  // bullets
  'bullet_default', 'bullet_fire', 'bullet_poison',
  'bullet_stun', 'bullet_lightning'
];
const IMAGES = Object.fromEntries(SPRITES.map(n => [n, new Image()]));
let loaded = 0;

SPRITES.forEach(n => {
  IMAGES[n].src = `assets/${n}.png`;
  IMAGES[n].onload  = () => (++loaded === SPRITES.length) && startGame();
  IMAGES[n].onerror = ()  => console.error('Image failed:', n);
});

/* ---------- GAME STATE ---------- */
let towers  = [];
let enemies = [];
let bullets = [];

const GRID = 40;              // snap size
const TOWER_RANGE = 140;      // px
let   money = 200;
let   wave  = 0;

/* ---------- HELPERS ---------- */
function rand(a, b) { return Math.random() * (b - a) + a; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

/* ---------- CLASSES ---------- */
class Enemy {
  constructor(type, y) {
    this.type  = type;
    this.size  = 32;
    this.x     = -this.size;        // start just off-screen
    this.y     = y;
    this.speed = rand(0.5, 1.2);
    this.maxHp = 5 + wave * 2;
    this.hp    = this.maxHp;
  }
  update() { this.x += this.speed; }
  draw()   {
    ctx.drawImage(IMAGES[this.type], this.x, this.y, this.size, this.size);
    // HP bar
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - 4, this.size, 3);
    ctx.fillStyle = 'lime';
    ctx.fillRect(this.x, this.y - 4, this.size * (this.hp / this.maxHp), 3);
  }
}

class Tower {
  constructor(x, y, sprite='tower_arrow', bullet='bullet_default') {
    this.x = x;  this.y = y;
    this.sprite = sprite;
    this.bullet = bullet;
    this.cool   = 0;
  }
  update() {
    if (this.cool > 0) { this.cool--; return; }
    const target = enemies.find(e => dist(this, e) < TOWER_RANGE);
    if (target) {
      bullets.push(new Bullet(this.x + 16, this.y + 16, target, this.bullet));
      this.cool = 45;                 // fire every 45 frames
    }
  }
  draw() { ctx.drawImage(IMAGES[this.sprite], this.x, this.y, 32, 32); }
}

class Bullet {
  constructor(x, y, target, sprite) {
    this.x = x;  this.y = y;
    this.target = target;
    this.sprite = sprite;
    this.speed  = 6;
    this.radius = 4;
    this.damage = 2;
  }
  update() {
    if (!enemies.includes(this.target)) return this.expire = true;
    const d = dist(this, this.target);
    if (d < this.radius + 16) {            // hit
      this.target.hp -= this.damage;
      this.expire = true;
      return;
    }
    this.x += ((this.target.x - this.x) / d) * this.speed;
    this.y += ((this.target.y - this.y) / d) * this.speed;
  }
  draw() { ctx.drawImage(IMAGES[this.sprite], this.x - 8, this.y - 8, 16, 16); }
}

/* ---------- INPUT (place tower) ---------- */
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / GRID) * GRID;
  const y = Math.floor((e.clientY - rect.top ) / GRID) * GRID;
  if (money >= 50) {                       // simple cost
    towers.push(new Tower(x, y));
    money -= 50;
  }
});

/* ---------- WAVE SPAWNER ---------- */
function spawnWave() {
  wave++;
  for (let i = 0; i < 6 + wave; i++) {
    const type = ['enemy_goblin','enemy_orc','enemy_bat','enemy_wolf'][i % 4];
    enemies.push(new Enemy(type, rand(80, canvas.height - 80)));
  }
}

/* ---------- MAIN GAME LOOP ---------- */
function gameLoop() {
  ctx.fillStyle = '#222'; ctx.fillRect(0,0,canvas.width,canvas.height);

  // UI text
  ctx.fillStyle = 'white';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Money: ${money}`, 10, 20);
  ctx.fillText(`Wave: ${wave}`,   10, 40);
  ctx.fillText('Click grid to place tower (50g)', 10, 60);

  // Update & draw entities
  towers.forEach(t => { t.update(); t.draw(); });

  enemies.forEach(e => e.update());
  enemies = enemies.filter(e => e.hp > 0 && e.x < canvas.width + 50);
  enemies.forEach(e => e.draw());

  bullets.forEach(b => b.update());
  bullets = bullets.filter(b => !b.expire && b.x>-20 && b.x<canvas.width+20 && b.y>-20 && b.y<canvas.height+20);
  bullets.forEach(b => b.draw());

  requestAnimationFrame(gameLoop);
}

/* ---------- START ---------- */
function startGame() {
  spawnWave();
  // Spawn new waves every 10 s
  setInterval(spawnWave, 10000);
  gameLoop();
}

