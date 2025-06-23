// Enhanced Tower Defense Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load all assets
const imageAssets = {};
const spriteList = [
  'tower_arrow', 'tower_cannon', 'tower_lightning', 'tower_flame', 'tower_poison',
  'tower_stun', 'tower_wind', 'tower_gold',
  'enemy_goblin', 'enemy_orc', 'enemy_bat', 'enemy_wolf',
  'bullet_default', 'bullet_fire', 'bullet_poison', 'bullet_stun', 'bullet_lightning'
];

spriteList.forEach(name => {
  const img = new Image();
  img.src = `assets/${name}.png`;
  imageAssets[name] = img;
});

let enemies = [], towers = [], bullets = [], selectedTower = 'tower_arrow';

class Enemy {
  constructor(x, y, speed, sprite, hp) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = sprite;
    this.hp = hp;
    this.maxHp = hp;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.drawImage(imageAssets[this.sprite], this.x, this.y, 32, 32);
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - 5, 32, 3);
    ctx.fillStyle = 'lime';
    ctx.fillRect(this.x, this.y - 5, 32 * (this.hp / this.maxHp), 3);
  }
}

class Tower {
  constructor(x, y, sprite, bulletType) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.bulletType = bulletType;
    this.fireRate = 60;
    this.cooldown = 0;
  }
  update() {
    if (this.cooldown > 0) return this.cooldown--;
    let target = enemies.find(e => Math.abs(e.x - this.x) < 100 && Math.abs(e.y - this.y) < 100);
    if (target) {
      bullets.push(new Bullet(this.x + 16, this.y + 16, target, this.bulletType));
      this.cooldown = this.fireRate;
    }
  }
  draw() {
    ctx.drawImage(imageAssets[this.sprite], this.x, this.y, 32, 32);
  }
}

class Bullet {
  constructor(x, y, target, sprite) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.sprite = sprite;
    this.speed = 4;
    this.damage = 10;
  }
  update() {
    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    if (dist < 10) {
      this.target.hp -= this.damage;
      bullets.splice(bullets.indexOf(this), 1);
    }
  }
  draw() {
    ctx.drawImage(imageAssets[this.sprite], this.x, this.y, 16, 16);
  }
}

function spawnWave() {
  for (let i = 0; i < 5; i++) {
    let type = ['enemy_goblin', 'enemy_orc', 'enemy_bat'][Math.floor(Math.random() * 3)];
    enemies.push(new Enemy(-50 * i, 100 + Math.random() * 200, 1 + Math.random(), type, 30));
  }
}

function drawUI() {
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Click to place tower: ${selectedTower}`, 10, 20);
}

canvas.addEventListener('click', e => {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  towers.push(new Tower(x - 16, y - 16, selectedTower, 'bullet_default'));
});

function initGame() {
  spawnWave();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawUI();

  towers.forEach(t => { t.update(); t.draw(); });
  enemies = enemies.filter(e => e.hp > 0);
  enemies.forEach(e => { e.update(); e.draw(); });
  bullets.forEach(b => { b.update(); b.draw(); });

  requestAnimationFrame(gameLoop);
}

initGame();

