// ===== Enhanced Tower-Defense script.js =====
//  features: tower selector UI, gold economy, start-wave button, grid placement

/* ---------- CANVAS ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width = 800;
canvas.height= 600;

/* ---------- UI ELEMENTS ---------- */
// A simple toolbar injected above the canvas
const toolbar = document.createElement('div');
toolbar.style.padding = '8px';
toolbar.style.background = '#222';
toolbar.style.display = 'flex';
toolbar.style.gap = '8px';
toolbar.style.alignItems = 'center';

document.body.insertBefore(toolbar, canvas);

toolbar.innerHTML = `
  <span style="color:white">Gold: <span id="goldText">300</span></span>
  <button id="startBtn">Start Wave</button>
  <span style="color:white">Select Tower:</span>
  <button data-tower="arrow">Arrow (50)</button>
  <button data-tower="cannon">Cannon (80)</button>
  <button data-tower="ice">Ice (70)</button>
`;

const goldText = document.getElementById('goldText');
const startBtn = document.getElementById('startBtn');

let selectedTowerKey = 'arrow';

document.querySelectorAll('button[data-tower]').forEach(btn=>{
  btn.onclick = ()=>{
    selectedTowerKey = btn.dataset.tower;
    document.querySelectorAll('[data-tower]').forEach(b=>b.style.background='');
    btn.style.background = '#555';
  };
});

/* ---------- GAME DATA ---------- */
let gold  = 300;
let wave  = 0;
const GRID = 40;

const towerDefs = {
  arrow : { cost:50, sprite:'tower_arrow',  cooldown:45, range:140, bullet:'bullet_default', dmg:2 },
  cannon: { cost:80, sprite:'tower_cannon', cooldown:60, range:160, bullet:'bullet_fire',   dmg:3 },
  ice   : { cost:70, sprite:'tower_ice',    cooldown:55, range:130, bullet:'bullet_poison', dmg:2 }
};

const enemySprites = ['enemy_goblin','enemy_orc','enemy_bat','enemy_wolf'];

/* ---------- ASSET LOAD ---------- */
const SPRITES = [...new Set([
  ...Object.values(towerDefs).flatMap(d=>[d.sprite,d.bullet]),
  ...enemySprites
])];
const IMAGES = Object.fromEntries(SPRITES.map(n=>[n,new Image()]));
let loaded=0;
SPRITES.forEach(n=>{ IMAGES[n].src=`assets/${n}.png`; IMAGES[n].onload=()=>{if(++loaded===SPRITES.length) init();}; });

/* ---------- ENTITIES ---------- */
class Enemy{
  constructor(sprite,y){
    this.sprite=sprite; this.x=-32; this.y=y; this.speed=1+0.1*wave; this.size=32;
    this.maxHp=6+wave*2; this.hp=this.maxHp;
  }
  update(){ this.x+=this.speed; }
  draw(){ ctx.drawImage(IMAGES[this.sprite],this.x,this.y,this.size,this.size);
    ctx.fillStyle='red'; ctx.fillRect(this.x,this.y-4,this.size,3);
    ctx.fillStyle='lime';ctx.fillRect(this.x,this.y-4,this.size*(this.hp/this.maxHp),3);
  }
}
class Tower{
  constructor(x,y,key){
    Object.assign(this,towerDefs[key]);
    this.x=x; this.y=y; this.cool=0;
  }
  update(){ if(this.cool>0){this.cool--;return;} const tgt=enemies.find(e=>dist(this,e)<this.range);
    if(tgt){ bullets.push(new Bullet(this.x+16,this.y+16,tgt,this.bullet,this.dmg)); this.cool=this.cooldown; }
  }
  draw(){ ctx.drawImage(IMAGES[this.sprite],this.x,this.y,32,32); }
}
class Bullet{
  constructor(x,y,target,sprite,dmg){ this.x=x; this.y=y; this.t=target; this.sprite=sprite; this.dmg=dmg; this.speed=5; }
  update(){ if(!enemies.includes(this.t)){ this.dead=true; return; }
    const d=dist(this,this.t); if(d<4+16){ this.t.hp-=this.dmg; this.dead=true; return; }
    this.x+=(this.t.x-this.x)/d*this.speed; this.y+=(this.t.y-this.y)/d*this.speed;
  }
  draw(){ ctx.drawImage(IMAGES[this.sprite],this.x-8,this.y-8,16,16); }
}

/* ---------- ARRAYS ---------- */
let towers=[],enemies=[],bullets=[];

/* ---------- HELPER ---------- */
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

/* ---------- GAME INIT ---------- */
function init(){
  startBtn.onclick=spawnWave;
  canvas.addEventListener('click',placeTower);
  requestAnimationFrame(gameLoop);
}

function placeTower(e){
  const rect=canvas.getBoundingClientRect();
  const x=Math.floor((e.clientX-rect.left)/GRID)*GRID;
  const y=Math.floor((e.clientY-rect.top )/GRID)*GRID;
  const def=towerDefs[selectedTowerKey];
  if(gold<def.cost) return; // not enough money
  gold-=def.cost; goldText.textContent=gold;
  towers.push(new Tower(x,y,selectedTowerKey));
}

function spawnWave(){
  wave++; for(let i=0;i<6+wave;i++){
    const sprite=enemySprites[i%enemySprites.length];
    enemies.push(new Enemy(sprite,80+Math.random()*(canvas.height-160)));
  }
}

/* ---------- MAIN LOOP ---------- */
function gameLoop(){
  ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // update
  towers.forEach(t=>t.update());
  bullets.forEach(b=>b.update()); bullets=bullets.filter(b=>!b.dead);
  enemies.forEach(e=>e.update());
  // remove dead enemies & reward
  for(let i=enemies.length-1;i>=0;i--) if(enemies[i].hp<=0){ gold+=10; goldText.textContent=gold; enemies.splice(i,1);}  
  // draw
  towers.forEach(t=>t.draw());
  bullets.forEach(b=>b.draw());
  enemies.forEach(e=>e.draw());
  requestAnimationFrame(gameLoop);
}

