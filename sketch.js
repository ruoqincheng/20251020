// --- 全域變數設定 ---
let circles = [];
let particles = [];
let popSound; // 新增音效變數
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#e9ecef'];
const NUM_CIRCLES = 50;
let score = 0; // 得分

// 預載入音效
function preload() {
  // 請將音效檔案放在正確的路徑下
  soundFormats('mp3', 'wav');
  popSound = loadSound('assets/debris-break-253779.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化圓
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    let hex = random(COLORS);
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      hex: hex,
      col: color(hex),
      alpha: random(80, 255),
      speed: random(1, 5),
      exploded: false // 新增爆炸狀態
    });
  }
}

function draw() {
  background('#fcf6bd');

  // 左上角文字 "414730761" 與右上角分數，顏色 #f8f9fa，大小 32px
  noStroke();
  fill('#f8f9fa');
  textSize(32);
  textAlign(LEFT, TOP);
  text('414730761', 10, 10);
  textAlign(RIGHT, TOP);
  text(score, width - 10, 10);

  noStroke();
  
  // 更新和繪製粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }

  for (let c of circles) {
    if (!c.exploded) {
      c.y -= c.speed;
      
      if (c.y + c.r / 2 < 0) { // 如果圓完全移出畫面頂端
        resetCircle(c);
      }
      
      c.col.setAlpha(c.alpha);
      fill(c.col);
      circle(c.x, c.y, c.r);

      // 在圓的右上方1/4圓的中間產生方形
      let squareSize = c.r / 6;
      let angle = -PI / 4;
      let distance = c.r / 2 * 0.65;
      let squareCenterX = c.x + cos(angle) * distance;
      let squareCenterY = c.y + sin(angle) * distance;
      fill(255, 255, 255, 120);
      noStroke();
      rectMode(CENTER);
      rect(squareCenterX, squareCenterY, squareSize, squareSize);
    }
  }
}

// 偵測滑鼠點擊：點到該氣球才爆破並計分
function mousePressed() {
  // 由上到下檢查，先找到被點擊到且未爆炸的氣球
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];
    if (!c.exploded) {
      let d = dist(mouseX, mouseY, c.x, c.y);
      if (d <= c.r / 2) {
        // 按到氣球，依顏色計分
        if (c.hex && c.hex.toLowerCase() === '#e9ecef') {
          score++;
        } else {
          score--;
        }
        explode(c);
        c.exploded = true;
        break; // 一次只處理一個氣球
      }
    }
  }
}

// 重置圓形
function resetCircle(c) {
  c.y = height + c.r / 2;
  c.x = random(width);
  c.r = random(50, 200);
  c.hex = random(COLORS);
  c.col = color(c.hex);
  c.alpha = random(80, 255);
  c.speed = random(1, 5);
  c.exploded = false;
}

// 爆炸效果
function explode(circle) {
  // 播放爆破音效
  if (popSound && popSound.isLoaded()) {
    popSound.play();
  }
  
  let numParticles = 50;
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let speed = random(2, 8);
    let r = random(5, 15);
    // 傳入新的 color 物件，避免修改原氣球顏色
    particles.push(new Particle(
      circle.x,
      circle.y,
      speed * cos(angle),
      speed * sin(angle),
      r,
      color(circle.hex)
    ));
  }
}

// 粒子類別
class Particle {
  constructor(x, y, vx, vy, r, colorObj) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = r;
    this.color = colorObj;
    this.life = 255;
    this.decay = random(2, 4);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // 重力效果
    this.life -= this.decay;
  }

  display() {
    noStroke();
    this.color.setAlpha(this.life);
    fill(this.color);
    circle(this.x, this.y, this.r);
  }

  isDead() {
    return this.life < 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let c of circles) {
    c.x = random(width);
    c.y = random(height);
  }
}