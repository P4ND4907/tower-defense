const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const imageAssets = {};
const spriteList = [
  'tower_arrow','tower_cannon','tower_ice','tower_lightning','tower_flame','tower_poison',
  'tower_stun','tower_wind','tower_gold','enemy_goblin','enemy_orc','enemy_bat','enemy_wolf',
  'bullet_default','bullet_fire','bullet_poison','bullet_stun','bullet_lightning'
];

spriteList.forEach(name => {
  const img = new Image();
  img.src = 'assets/' + name + '.png';
  imageAssets[name] = img;
});

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Example: draw one tower
  const tower = imageAssets['tower_arrow'];
  if (tower.complete) {
    ctx.drawImage(tower, 100, 100, 32, 32);
  }
  requestAnimationFrame(drawGame);
}

drawGame();
