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

// Game entities
let enemies = [];
let towers = [];
let bullets = [];

class Enemy {
  constructor(x, y, speed, sprite) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = sprite;
  }

  update() {
    this.x += this.speed;
  }

  draw() {
    ctx.drawImage(imageAssets[this.sprite], this.x, this.y, 32, 32);
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
    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    }

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
  }

  update() {
    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }

  draw() {
    ctx.drawImage(imageAssets[this.sprite], this.x, this.y, 16, 16);
  }
}

// Initial setup
function initGame() {
  towers.push(new Tower(150, 150, 'tower_arrow', 'bullet_default'));
  enemies.push(new Enemy(0, 100, 1, 'enemy_goblin'));
  enemies.push(new Enemy(-100, 200, 1.2, 'enemy_orc'));
  enemies.push(new Enemy(-200, 300, 0.8, 'enemy_bat'));

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  towers.forEach(t => {
    t.update();
    t.draw();
  });

  enemies.forEach(e => {
    e.update();
    e.draw();
  });

  bullets.forEach(b => {
    b.update();
    b.draw();
  });

  requestAnimationFrame(gameLoop);
}

initGame();
