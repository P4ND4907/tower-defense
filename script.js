const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const imageAssets = {};
const spriteNames = [
  'tower_arrow', 'enemy_goblin'
];

let loaded = 0;

spriteNames.forEach((name) => {
  const img = new Image();
  img.src = 'assets/' + name + '.png';
  img.onload = () => {
    loaded++;
    if (loaded === spriteNames.length) startGame();
  };
  img.onerror = () => console.error(`Failed to load: ${img.src}`);
  imageAssets[name] = img;
});

function startGame() {
  drawGame();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tower = imageAssets['tower_arrow'];
  if (tower.complete) {
    ctx.drawImage(tower, 100, 100, 32, 32);
  }

  const enemy = imageAssets['enemy_goblin'];
  if (enemy.complete) {
    ctx.drawImage(enemy, 200, 100, 32, 32);
  }

  requestAnimationFrame(drawGame);
}

drawGame();
