const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.color = 'gray';
        this.speed = 0.5;
        this.health = 3;
    }

    update() {
        this.x += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.color = 'gold';
        this.fireRate = 90;
        this.timer = 0;
    }

    update() {
        this.timer++;
        if (this.timer >= this.fireRate) {
            this.timer = 0;
            const target = enemies.find(enemy => this.inRange(enemy));
            if (target) {
                bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size / 2, target));
            }
        }
    }

    inRange(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 150;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = 2.5;
        this.target = target;
    }

    update() {
        const dx = this.target.x + this.target.size / 2 - this.x;
        const dy = this.target.y + this.target.size / 2 - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / dist) * this.speed;
        const moveY = (dy / dist) * this.speed;

        this.x += moveX;
        this.y += moveY;

        // hit detection
        if (dist < this.radius + this.target.size / 2) {
            this.target.health -= 1;
            return true; // mark for removal
        }
        return false;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const enemies = [new Enemy(0, 200)];
const towers = []; // NEW: track placed towers
const bullets = [];

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    towers.push(new Tower(mouseX - 10, mouseY - 10)); // center tower
});

function update() {
    enemies.forEach(enemy => enemy.update());
    towers.forEach(tower => tower.update());

    bullets.forEach((bullet, index) => {
        const hit = bullet.update();
        if (hit) bullets.splice(index, 1);
    });

    // Remove dead enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].health <= 0) enemies.splice(i, 1);
    }
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    enemies.forEach(enemy => enemy.draw());
    towers.forEach(tower => tower.draw());
    bullets.forEach(bullet => bullet.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

