// ===== Tower-Defense script.js =====
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

/* ---------- SPRITE PRELOAD ---------- */
const spriteNames = [
  // Towers
  'tower_arrow','tower_cannon','tower_ice','tower_lightning','tower_flame',
  'tower_poison','tower_stun','tower_wind','tower_gold',
  // Enemies
  'enemy_goblin','enemy_orc','enemy_bat','enemy_wolf',
  // Bullets
  'bullet_default','bullet_fire','bullet_poison','bullet_stun','bullet_lightning'
];

const images   = {};          // name → Image()
let   loaded   = 0;           // how many have finished loading

spriteNames.forEach(name => {
  const img = new Image();
  img.src   = `assets/${name}.png`;
  img.onload = () => {
    loaded++;
    if (loaded === spriteNames.length) startGame();   // ← start only when ALL are ready
  };
  images[name] = img;
});

/* ---------- VERY SMALL DEMO GAME LOOP ---------- */
function startGame () {

  // Demo state (replace with your full tower/enemy logic later)
  const towers  = [{ x: 120, y: 120, type: 'tower_arrow' }];
  const enemies = [{ x: 260, y: 240, type: 'enemy_goblin' }];

  function loop () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw towers
    for (const t of towers) {
      ctx.drawImage(images[t.type], t.x - 16, t.y - 16, 32, 32);
    }

    // draw enemies
    for (const e of enemies) {
      ctx.drawImage(images[e.type], e.x - 16, e.y - 16, 32, 32);
    }

    requestAnimationFrame(loop);
  }

  loop();   // kick things off
}
