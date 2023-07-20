let enemies = [];
let towers = [];
let bullets = [];
let currentWave = 1;
let maxTowers = 5;
let score = 0;
let health = 100;
let towerReady = false;

// Define enemy class
class Enemy {
  constructor(health, speed, y) {
    this.health = health;
    this.speed = speed;
    this.pos = createVector(0, y);
  }

  update() {
    this.pos.x += this.speed;
  }

  show() {
    fill(255, 0, 0);
    ellipse(this.pos.x, this.pos.y, 20, 20);
  }
}

// Define bullet class
class Bullet {
  constructor(pos, target, damage) {
    this.pos = pos.copy();
    this.speed = 5;
    this.damage = damage;
    this.target = target;
    this.vel = p5.Vector.sub(this.target.pos, this.pos).normalize().mult(this.speed);
  }

  update() {
    this.pos.add(this.vel);
  }

  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 5, 5);
  }

  hits(enemy) {
    let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
    return (d < 10);
  }
}

// Define tower class
class DefenseTower {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.range = 100;
    this.damage = 10;
    this.fireRate = 60;
    this.readyToFire = true;
  }

  show() {
    fill(0, 0, 255);
    rect(this.pos.x, this.pos.y, 40, 40);
  }

  update() {
    if (!this.readyToFire) {
      this.fireRate--;
      if (this.fireRate === 0) {
        this.readyToFire = true;
        this.fireRate = 60;
      }
    } else {
      for (let enemy of enemies) {
        let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
        if (d < this.range) {
          bullets.push(new Bullet(this.pos, enemy, this.damage));
          this.readyToFire = false;
          break;
        }
      }
    }
  }

  canPlace() {
    for (let tower of towers) {
      let d = dist(this.pos.x, this.pos.y, tower.pos.x, tower.pos.y);
      if (d < 80) {
        return false;
      }
    }
    return true;
  }
}

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(0);

  fill(255);
  textSize(32);
  text('Score: ' + score, 10, 50);
  text('Health: ' + health + '%', 10, 100);
  rect(10, 120, health * 3, 20);
  
  if(towerReady){
    fill(0, 255, 0);
    text('A new tower can be placed!', 10, 150);
  }

  if (frameCount % (60 * (10 - currentWave)) == 0) {
    for(let i = 0; i < currentWave; i++){
      enemies.push(new Enemy(10, 1 + currentWave / 10, random(height)));
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();
    if (enemies[i].health <= 0) {
      enemies.splice(i, 1);
      score++;
      if (score % 10 == 0) {
        maxTowers++;
        currentWave++;
        towerReady = true;
      }
    } else if (enemies[i].pos.x > width) {
      enemies.splice(i, 1);
      health -= 20;
      if (health <= 0) {
        textSize(64);
        fill(255, 0, 0);
        text('GAME OVER', width / 2 - 100, height / 2);
        noLoop();
      }
    }
  }

  for (let tower of towers) {
    tower.show();
    tower.update();
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i].hits(enemies[j])) {
        enemies[j].health -= bullets[i].damage;
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function mousePressed() {
  if (towers.length < maxTowers) {
    let potentialTower = new DefenseTower(mouseX, mouseY);
    if (potentialTower.canPlace()) {
      towers.push(potentialTower);
      towerReady = false;
    }
  }
}
