var socket = io();

const User = {
  name: "",
}
let recoverCond = false;
const PISA = document.getElementsByClassName("coins");
let game_pisa = 50; //644
class Upgrades {
  constructor(sym, upd) {
    this.cost = 50;
    this.color = 0;
    this.upd = sym+upd;
    this.upte = upd;
  }
}
const upgd = {
  speed: new Upgrades("+", 0.1),
  reload: new Upgrades("-", 0.5),
  health: new Upgrades("+", 10),
  bps: new Upgrades("+", 5),
  ammo: new Upgrades("+", 1),
  range: new Upgrades("+", 5),
  damage: new Upgrades("+", 5),
  amount: new Upgrades("+", 2)
}
//User.name = prompt("name", "dd");

const GameBox = document.getElementById("game");
const c = document.getElementById("canvas1");
const ctx = c.getContext('2d');
c.width = 2000, c.height = 2000;
class JoyStick {
  constructor(id, radius, stick_size, color) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.stickX = radius/2;
    this.stickY = radius/2;
    this.JOYSTICK = document.createElement("canvas");
    this.context = this.JOYSTICK.getContext("2d");
    this.JOYSTICK.width = radius;
    this.JOYSTICK.height = radius;
    this.JOYSTICK.style.border = "2px solid "+color;
    this.JOYSTICK.id = this.id;
    this.JOYSTICK.style.position = 'absolute';
    this.JOYSTICK.style.borderRadius = '100%';
    document.body.appendChild(this.JOYSTICK);
    this.stickPos = this.JOYSTICK.getBoundingClientRect();
    this.tan = 0,
    this.cos = 0,
    this.sin = 0;
    this.centerBox = radius/2;
    this.tou = 0;
    this.JOYSTICK.addEventListener('touchmove', (e) => {
      this.context.clearRect(0, 0, radius, radius);
      this.dx = this.centerBox-this.stickX
      this.dy = this.centerBox-this.stickY
      this.tan = Math.atan2(this.dy, this.dx);
      this.cos = Math.cos(this.tan);
      this.sin = Math.sin(this.tan);
      this.stickX = e.touches[this.tou].clientX-this.stickPos.left;
      this.stickY = e.touches[this.tou].clientY-this.stickPos.top;
      this.x = -this.cos
      this.y =-this.sin
      this.stick(this.x*(radius/2- stick_size)+this.centerBox, this.y*(radius/2- stick_size)+this.centerBox, color, stick_size);
    });
    this.stick(this.centerBox, this.centerBox, color, stick_size);
    this.JOYSTICK.addEventListener('touchend', ()=> {
      this.context.clearRect(0, 0, radius, radius);
      this.tou = 0
      this.stick(this.centerBox, this.centerBox, color, stick_size);
    })
  }
  stick(x, y, color, size) {
    this.context.beginPath();
    this.context.fillStyle = color
    this.context.arc(x, y, size, 0, Math.PI*2);
    this.context.fill();
    this.context.closePath();
  }
}
//consta
const Joy = {
  cond: false,
  moveCond: false,
  stick: {
    move: new JoyStick("ctrl1", 100, 20, "orange"),
    shoot: new JoyStick("ctrl2", 100, 20, "red")
  }
}
const Scrolls = {
  x: 5,
  y: 5,
  cond: {
    x: 1,
    y: 1
  }
}
const Arry = {
  myBullet: [],
  blocks: [],
  players: [],
  imgs: [],
  bullet: [],
  bulletXY: [],
  flyMsg: [],
}
const Imgs = {
  player: {
    noob: document.getElementById('playerI'),
    pro: document.getElementById('proplayer'),
    ground: document.getElementById('lowerpart'),
  },
  block: document.getElementById("blocks")
}

Arry.imgs = [Imgs.player.noob, Imgs.player.pro];
Joy.stick.move.JOYSTICK.addEventListener('touchmove', (e)=> {
  if (Joy.stick.move.tou === 0) {
    Joy.stick.shoot.tou = 1;
  }
});
Joy.stick.move.JOYSTICK.addEventListener('touchend',
  ()=> {
    Joy.stick.shoot.tou = 0;
    Joy.moveCond = false;
  });
Joy.stick.move.JOYSTICK.addEventListener('touchstart',
  ()=> {
    Joy.moveCond = true;
  });
Joy.stick.shoot.JOYSTICK.addEventListener('touchend',
  ()=> {
    Joy.cond = false;
    Joy.stick.move.tou = 0;
  });
Joy.stick.shoot.JOYSTICK.addEventListener('touchstart',
  ()=> {
    Joy.cond = true;
  });
Joy.stick.shoot.JOYSTICK.addEventListener('touchmove',
  (e)=> {
    if (Joy.stick.shoot.tou === 0) {
      Joy.stick.move.tou = 1;
    }
    Joy.cond = true;
  });
//extra functions
function Modless(num) {
  return Math.sqrt(num*num);
}
//Main Player Build
class Gamers {
  constructor() {
    this.x = undefined;
    this.y = undefined;
    this.health = 0;
    this.MaxHealth = 100;
    this.bulletPower = 5;
    this.width = 70;
    this.range = 150+this.width;
    this.height = 70;
    this.speed = 0.5;
    this.reload = 10000;
    this.delay = 50;
    this.maxBullet = 3;
    this.amount = 1;
    //  this.sight = this.width+100;
    this.level = 0;
    this.angle = 0;
    this.imgNo = 0;
    this.img = Arry.imgs[this.imgNo];
    this.shootCond = false;
    this.OldTime = new Date().getTime();
    this.NewTime = 0;
    this.minBullet = this.maxBullet;

    this.TimeCond = false;
    this.color = "green";
  }
  reloader() {
    this.NewTime = new Date().getTime();
    if (this.minBullet === 0) {
      if (this.TimeCond) {
        CreateFlyMsg("Reloading", 255, 255, 255, 50);
        this.OldTime = new Date().getTime();
        this.TimeCond = false;
      }
      if (this.NewTime-this.OldTime >= this.reload) {
        this.minBullet = this.maxBullet;
        CreateFlyMsg("Loaded", 255, 255, 255, 50);
      }
      if ((this.NewTime-this.OldTime)/this.reload < 1) {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 10;
        ctx.arc(this.x+this.width/2, this.y+this.height/2, 5, 0, (this.NewTime-this.OldTime)/this.reload*(Math.PI*2), true);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.closePath();
      }
    } else {
      this.TimeCond = true
    }

  }
  move() {
    this.y = Scrolls.y+window.innerHeight/2-this.height/2;
    this.x = Scrolls.x+window.innerWidth/2-this.width/2;
    if (this.x < 0) {
      this.x = 1;
    } else if (this.x > -this.width+c.width) {
      this.x = -this.width+c.width-1;
    }
    if (this.y < 0) {
      this.y = 1;
    } else if (this.y > c.height-this.height) {
      this.y = c.height-this.height-1;
    }
  }
  rotate() {
    this.angle = (Joy.moveCond&&!Joy.cond)?Joy.stick.move.tan: Joy.stick.shoot.tan;
  }
  draw() {
    this.img = Arry.imgs[this.imgNo];
    ctx.beginPath();
    ctx.drawImage(Imgs.player.ground, this.x, this.y, this.width, this.height);
    ctx.closePath();
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x+this.width/2, this.y+this.height/2);
    ctx.rotate(this.angle-(90*Math.PI/180));
    ctx.drawImage(this.img, this.width/-2, this.height/-2, this.width, this.height);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}
const Gamer = new Gamers();
function main_player() {
  Gamer.draw();
  Gamer.move();
  Gamer.rotate();
  Gamer.reloader();
}
function BuyTempTank() {
  if (game_pisa >= 1000) {
    let BTTcond = confirm("Are you sure to buy the Pro tank for 1000$?\n\nNOTE:If you refresh the browser,you have to buy again.");
    if (BTTcond) {
      Gamer.imgNo = 1;
      game_pisa -= 1000;
      alert("You have bought the tank for 1000$.");
    }
  }
}
function Hacks(){
  Gamer.imgNo = 1;
}
//Bullet
let shootsAud = document.getElementById("shootAud");
let engineAud = document.getElementById("engineAud");
let bkAud = document.getElementById("bkAud");
class Bullets {
  constructor(x, y, dx, dy, power) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = power;
    this.speed = 5;
    this.dx = dx;
    this.dy = dy;
    this.MaxPower = power;

  }
  shoot() {
    this.x += this.dx*this.speed;
    this.y += this.dy*this.speed;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(this.x-this.width/2, this.y-this.height/2, this.width, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
  }
}
class BulletXY {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = Gamer.range;
  }
}
let TempTime = 0;
function createMyBullet() {
  TempTime++;

  if (Joy.cond && TempTime%Gamer.delay === 0) {
    if (Gamer.minBullet > 0) {
      if (shootsAud.currentTime > 0.2)
        shootsAud.currentTime = 0;
      shootsAud.play();
      Arry.myBullet.push(new Bullets(Gamer.x+Gamer.width/2, Gamer.y+Gamer.height/2, Joy.stick.shoot.x, Joy.stick.shoot.y, Gamer.bulletPower))
      socket.emit("bullets", (Gamer.x+Gamer.width/2), (Gamer.y+Gamer.height/2), Joy.stick.shoot.x, Joy.stick.shoot.y, User.name, Gamer.bulletPower);
      Gamer.minBullet--;
    }
  }
}
function handleMyBullet() {
  for (let i = 0; i < Arry.myBullet.length; i++) {
    const MyBullet = Arry.myBullet[i];
    MyBullet.draw();
    MyBullet.shoot();
    let dx = MyBullet.x - Gamer.x,
    dy = MyBullet.y - Gamer.y;
    let range = Math.sqrt(dx*dx+dy*dy)
    MyBullet.power = MyBullet.MaxPower-range/Gamer.range*MyBullet.MaxPower
    if (MyBullet && Gamer.range < range) {
      Arry.myBullet.splice(i, 1);
      i--;
    }
  }
}
//blocks for protection
class Blocks {
  constructor(x, y, h, w) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.img = Imgs.block;
  }
  draw() {
    ctx.beginPath();
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();
  }
}

function createBlocks() {
  let x = [1121,
    367,
    784,
    1666,
    1807,
    868,
    1972,
    29,
    1383,
    658],
  y = [78,
    1226,
    172,
    717,
    478,
    1715,
    1650,
    1809,
    1561,
    1028],
  w = [21,
    168,
    196,
    50,
    98,
    206,
    111,
    100,
    100,
    149],
  h = [161,
    169,
    137,
    107,
    158,
    191,
    148,
    162,
    174,
    128]
  for (let i = 0; i < 10; i++) {
    Arry.blocks.push(new Blocks(x[i], y[i], w[i], h[i]));
  }
}
createBlocks();

function handleBlocks() {
  for (let i = 0; i < Arry.blocks.length; i++) {
    const Block = Arry.blocks[i];
    Block.draw();
    //Gamer hits the block
    if (collusion(Block, Gamer)) {

      Scrolls.cond.x = !(collusionX(Block, Gamer));
      if (Block.x >= Gamer.x) {
        Scrolls.x -= Gamer.speed;
      } else {
        Scrolls.x += Gamer.speed;
      }
      Scrolls.cond.y = !(collusionY(Block, Gamer));
      if (Block.y >= Gamer.y) {
        Scrolls.y -= Gamer.speed;
      } else {
        Scrolls.y += Gamer.speed;
      }
    } else {
      Scrolls.cond.x = 1,
      Scrolls.cond.y = 1;
    }
    //bullets hit the block;
    for (let j = 0; j < Arry.myBullet.length; j++) {
      const MyBullet = Arry.myBullet[j];
      if (collusion(Block, MyBullet)) {
        Arry.myBullet.splice(j, 1);
        j--;
        break;
      }
    }
  }
}
//Other players Player
class Players {
  constructor (x, y, width, height, angle, speed, health, color, img, name) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.speed = speed;
    this.img = Arry.imgs[0];
    this.color = color;
    this.health = health;
    this.name = name;
    this.textColor = (color === Gamer.color)?"#0000ff": "#ff0000";
  }
  draw() {
    this.textColor = (this.color === Gamer.color)?"#0000ff": "#ff0000";
    ctx.beginPath();
    ctx.drawImage(Imgs.player.ground, this.x, this.y, this.width, this.height);
    ctx.closePath();
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x+this.width/2, this.y+this.height/2);
    ctx.rotate(this.angle-(90*Math.PI/180));
    ctx.drawImage(this.img, this.width/-2, this.height/-2, this.width, this.height);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = this.textColor;
    ctx.font = "20px 'Teko'";
    ctx.textAlign = "center"
    ctx.strokeText(this.name, this.x+this.width/2, this.y+this.height/2);
    ctx.fillText(this.name, this.x+this.width/2, this.y+this.height/2)
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

function handlePlayers() {
  for (let i = 0; i < Arry.players.length; i++) {
    const Player = Arry.players[i];
    Player.draw();
    if (collusion(Player, Gamer)) {
      Scrolls.cond.x = !(collusionX(Player, Gamer));
      if (Player.x >= Gamer.x) {
        Scrolls.x--;
      } else {
        Scrolls.x++;
      }
      Scrolls.cond.y = !(collusionY(Player, Gamer));
      if (Player.y >= Gamer.y) {
        Scrolls.y--;
      } else {
        Scrolls.y++;
      }
    } else {
      Scrolls.cond.x = 1,
      Scrolls.cond.y = 1;
    }
  }
}
function handleBullets() {
  for (let i = 0; i < Arry.bullet.length; i++) {
    const Bullet = Arry.bullet[i];
    const BXY = Arry.bulletXY[i];
    Bullet.draw();
    Bullet.shoot();
    let dx = Bullet.x - BXY.x,
    dy = Bullet.y - BXY.y;
    let range = Math.sqrt(dx*dx+dy*dy)
    Bullet.power = Bullet.MaxPower-(range/BXY.range*Bullet.MaxPower);
    if (Bullet && BXY.range < range) {
      Arry.bullet.splice(i, 1);
      Arry.bulletXY.splice(i, 1);
      i--;
    }
  }
}
////////////////////////////////
//flying message
class FlyMessage {
  constructor(text, red, green, blue, size) {
    this.x = Math.random()*Gamer.width+Gamer.x;
    this.y = Gamer.y+Gamer.height;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.color = `rgba(${red},${green},${blue},1)`;
    this.text = text;
    this.opacity = 1;
  }
  draw() {
    this.y--;
    this.opacity -= 0.02;
    this.color = `rgba(${this.red},${this.green},${this.blue},${this.opacity})`;
    ctx.beginPath();
    ctx.font = `${this.size}px 'Teko'`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "black"
    ctx.fillText(this.text, this.x, this.y);
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

function CreateFlyMsg(text, red, green, blue, size) {
  //console.log("done");
  Arry.flyMsg.push(new FlyMessage(text, red, green, blue, size));
}

function handleFlyMsg() {
  for (let i = 0; i < Arry.flyMsg.length; i++) {
    const msg = Arry.flyMsg[i];
    msg.draw();
    if (msg.opacity < 0) {
      Arry.flyMsg.splice(i, 1);
      i--;
    }
  }
}
function attackOtherPlayers() {
  for (let i = 0; i < Arry.bullet.length; i++) {
    const Bullet = Arry.bullet[i];
    if (collusion(Bullet, Gamer)) {
      Gamer.health -= Bullet.power;
      CreateFlyMsg("-"+Math.floor(Bullet.power*10), 255, 0, 0, 40);
      Arry.bullet.splice(i, 1)

      i--;
    }
  }
  for (let i = 0; i < Arry.myBullet.length; i++) {
    const MyBullet = Arry.myBullet[i];
    for (let j = 0; j < Arry.players.length; j++) {
      const Player = Arry.players[j];
      if (collusion(MyBullet, Player)) {
        //pisaincre
        game_pisa += Gamer.amount;
        CreateFlyMsg("+"+Math.floor(MyBullet.power*10), 0, 0, 255, 40);
        Arry.myBullet.splice(i, 1);
        i--;
      }
    }
  }
}
//Display for user
const HEALTH_DISPLAY = document.getElementById('health');
const BULLET_DISPLAY = document.getElementById("bullets")
const POSITION_DISPLAY = document.getElementById('coordinate');
function Display() {
  for (let i = 0; i < PISA.length; i++) {
    PISA[i].innerHTML = Math.floor(game_pisa);
  }

  HEALTH_DISPLAY.innerHTML = " "+Math.floor(Gamer.health)+"/"+Gamer.MaxHealth
  HEALTH_DISPLAY.style.width = (Gamer.health/Gamer.MaxHealth*200)+"px";
  HEALTH_DISPLAY.style.backgroundColor = `hsl(${Gamer.health/Gamer.MaxHealth*120},100%,50%)`;
  BULLET_DISPLAY.style.width = (Gamer.minBullet/Gamer.maxBullet*200)+"px";
  BULLET_DISPLAY.innerHTML = Gamer.minBullet+"/"+Gamer.maxBullet;
  POSITION_DISPLAY.innerHTML = "X:" +Math.floor(Gamer.x/10)+"   Y: "+Math.floor(Gamer.y/10);

}
function ScrollTheScreen() {
  if (Joy.moveCond) {
    Scrolls.y += Joy.stick.move.y*Gamer.speed*Scrolls.cond.y
    Scrolls.x += Joy.stick.move.x*Gamer.speed*Scrolls.cond.x
  }
  GameBox.scrollTop = Scrolls.y
  GameBox.scrollLeft = Scrolls.x
}
//collusion
function collusion(first, second) {
  if (!(first.x > second.x+second.width ||
    first.x+first.width < second.x ||
    first.y > second.y+second.height ||
    first.y+first.height < second.y)) {
    return true;
  }
}
function collusionX(first, second) {
  if (!(first.x > second.x+second.width ||
    first.x+first.width < second.x)) {
    return true;
  }
}
function collusionY(first, second) {
  if (!(first.y > second.y+second.width ||
    first.y+first.width < second.y)) {
    return true;
  }
}
function playerHeal() {
  for (let i = 0; i < Arry.players.length; i++) {
    const Player = Arry.players[i];
    if (collusion(Player, Gamer) && Gamer.health < Gamer.MaxHealth && Player.color === Gamer.color) {
      Gamer.health += 0.2;
    }
  }
}
document.getElementById("ctrl1").style.display = "none";
document.getElementById("ctrl2").style.display = "none";
function PlayerIsKilled() {
  if (Gamer.health < 0) {
    document.getElementById("mainBody").style.display = "block"
    Gamer.y = undefined;
    Gamer.x = undefined;
    engineAud.pause();
    engineAud.loop = false;
    Gamer.shootCond = false;
    document.getElementById("ctrl1").style.display = "none";
    document.getElementById("ctrl2").style.display = "none";
  }
  for (let i = 0; i < Arry.players.length; i++) {
    const Player = Arry.players[i];
    if (Player.health < 0) {
      Arry.players.splice(i, 1);
      i--;
    }
  }
}
///Map of the game
const GPS = document.getElementById("map");
const gtx = GPS.getContext('2d');
GPS.width = 100,
GPS.height = 100;
function Navigate() {
  gtx.beginPath();
  gtx.fillStyle = "white";
  gtx.arc((Gamer.x/c.width*GPS.width), (Gamer.y/c.height*GPS.height), 3, 0, Math.PI*2);
  gtx.fill();
  gtx.closePath();
  for (let i = 0; i < Arry.players.length; i++) {
    const Player = Arry.players[i];
    const Color = (Player.color === Gamer.color)?"#0000ff": "#ff0000";
    gtx.beginPath();
    gtx.fillStyle = Color;
    gtx.fillRect((Player.x/c.width*GPS.width), (Player.y/c.height*GPS.height), 3, 3);
    gtx.fill();
    gtx.closePath();
  }
}
const MsgTime = {
  start: new Date().getTime(),
  end: 0,
}
const CHAT_DISPLAY = document.getElementById("chat");
function sendMessage(text, name) {
  CHAT_DISPLAY.innerHTML = `<span>${name}:</span>${text}`;
  MsgTime.end = new Date().getTime();
}
//color choosing
//gameover screen
function upText(current, amount, update, color) {
  let uptext = `<div>${current}</div><span style="color:${color};"> ${amount}$ </span><span style="color:#00ff00;"> ${update}</span>`
  return uptext;
}
let upgrade_del = [upgd.speed,
  upgd.reload,
  upgd.damage,
  upgd.ammo,
  upgd.bps,
  upgd.health,
  upgd.range,
  upgd.amount];


let update_indi = ["m/s",
  "s",
  "N",
  "B",
  "b/s",
  "hp",
  "m²",
  "$"]
const Update_Button = document.getElementsByClassName("upBtn");
for (let i = 0; i < Update_Button.length; i++) {
  Update_Button[i].addEventListener("click", ()=> {
    if (upgrade_del[i].cost <= game_pisa) {
      game_pisa -= upgrade_del[i].cost;
      upgrade_del[i].cost *= 1.5+i/100;
      let updelup = upgrade_del[i].upte
      switch (i) {
        case 0:
          Gamer.speed += updelup;
          break
        case 1:
          Gamer.reload -= updelup*1000;
          break
        case 2:
          Gamer.bulletPower += updelup;
          break;
        case 3:
          Gamer.maxBullet += updelup;
          break;
        case 4:
          Gamer.delay += updelup;
          break;
        case 5:
          Gamer.MaxHealth += updelup;
          break;
        case 6:
          Gamer.range += updelup;
          break;
        case 7:
          Gamer.amount += updelup;
          break;
      }
    }
  });
}
function MainBody() {
  //speed
  document.getElementById("userName").innerHTML = User.name;
  let gamer_update = [Math.floor(Gamer.speed*10),
    Math.floor(Gamer.reload/1000),
    Gamer.bulletPower,
    Gamer.maxBullet,
    (Gamer.delay/10),
    Gamer.MaxHealth,
    Gamer.range,
    Gamer.amount];
  for (let i = 0; i < Update_Button.length; i++) {
    Update_Button[i].innerHTML = upText(gamer_update[i]+update_indi[i], Math.floor(upgrade_del[i].cost), upgrade_del[i].upd, upgrade_del[i].color);
    upgrade_del[i].color = (upgrade_del[i].cost <= game_pisa)?"#ffff00": "#ff0000";
  }
}
//homebtn
function animate() {
  ScrollTheScreen();
  MsgTime.start = new Date().getTime();
  if (MsgTime.start-MsgTime.end > 10000) {
    CHAT_DISPLAY.style.display = "none";
  }
  ctx.clearRect(0, 0, c.width, c.height);
  gtx.clearRect(0, 0, GPS.width, GPS.height);
  Navigate();
  Display();
  createMyBullet();
  handleMyBullet();
  attackOtherPlayers();
  handleBullets();
  handleBlocks();
  main_player();
  handlePlayers();
  PlayerIsKilled();
  handleFlyMsg();
  playerHeal();
  MainBody();
  //  mainBody();
  socket.emit("playerup", Gamer.x, Gamer.y, Gamer.angle, Gamer.speed, Gamer.health, User.name);
  if (recoverCond) {
    socket.emit("updatePlayer", User.name, upgrade_del, Gamer.speed, Gamer.reload, Gamer.bulletPower, Gamer.maxBullet, Gamer.delay, Gamer.MaxHealth, Gamer.range, Gamer.amount, game_pisa)
  }

  requestAnimationFrame(animate);
}
animate();
//Main body of the game is here
const PLAY_BTN = document.getElementById("play");

PLAY_BTN.addEventListener("click", ()=> {
  Gamer.health = Gamer.MaxHealth;
  document.getElementById("mainBody").style.display = "none";
  document.getElementById("ctrl1").style.display = "block";
  document.getElementById("ctrl2").style.display = "block";
  engineAud.play();
  engineAud.loop = true;
  Gamer.y = Math.random()*1500+200;
  Gamer.x = Math.random()*1500+200;
  Gamer.shootCond = true;
  socket.emit("newPlayers", Gamer.x, Gamer.y, Gamer.width, Gamer.height, Gamer.angle, Gamer.speed, Gamer.health, "blue", Gamer.imgNo, User.name);
})


//Socket1
socket.on("newPlayers", (x, y, width, height, angle, speed, health, color, img, name)=> {
  if (name !== User.name) {
    for (let i = 0; i < Arry.players.length; i++) {
      const Player = Arry.players[i];
      if (Player.name === name) {
        Arry.players.splice(i, 1);
        i--;
      }
    }
    Arry.players.push(new Players(x, y, width, height, angle, speed, health, color, img, name));
  }
  if (name === User.name) {
    Gamer.color = color;
  }
  let ninc=0;
  while(ninc <10000){
    ninc++
  }
});

socket.on("playerup",
  (x, y, angle, speed, health, name)=> {
    for (let i = 0; i < Arry.players.length; i++) {
      const Player = Arry.players[i];
      if (Player.name === name) {
        Player.x = x;
        Player.y = y;
        Player.angle = angle;
        Player.speed = speed;
        Player.health = health;
      }
    }
  });

socket.on("playeroff",
  (name)=> {
    for (let i = 0; i < Arry.players.length; i++) {
      const Player = Arry.players[i];
      if (Player.name === name) {
        Arry.players.splice(i, 1);
        Arry.players.splice(i, 1);
        i--;
      }
    }
  });

socket.on("bullets",
  (x, y, dx, dy, name, power)=> {
    if (name !== User.name) {
      Arry.bullet.push(new Bullets(x, y, dx, dy, power));
      Arry.bulletXY.push(new BulletXY(x, y));
    }
  });
///chatMsg
const CHAT_INPUT = document.getElementById("chat_text");
const CHAT_BTN = document.getElementById("chat_btn");
CHAT_BTN.addEventListener("click",
  ()=> {
    CHAT_INPUT.style.display = "block";
  })
window.addEventListener("keypress",
  (e)=> {
    let key = e.keyCode
    if (key === 13) {
      socket.emit("chatMsg", CHAT_INPUT.value, User.name, Gamer.color);
      CHAT_INPUT.style.display = "none";
      CHAT_INPUT.value = "";
    }
  });
socket.on("chatMsg",
  (text, name, color)=> {
    if (color === Gamer.color) {
      sendMessage(text, name);
      CHAT_DISPLAY.style.display = "block";
      CHAT_DISPLAY.style.width = "0px";
      setTimeout(()=> {
        CHAT_DISPLAY.style.width = "150px";
      }, 500);
    }
  })


const USERNAME = document.getElementById("username");
const PASSWORD = document.getElementById("password");
const LOGIN_BTN = document.getElementById("login");
const LOGIN_PAGE = document.getElementById("loginbody");
const NEW_OR_OLD = document.getElementById("neworold");
const LOGIN_ERROR = document.getElementById("errorLogin");
let ShowHidecond = 1
function ShowHide() {
  if (ShowHidecond) {
    PASSWORD.type = 'text';
    document.getElementById("showhide").innerHTML = "hide";
    ShowHidecond = 0
  } else {
    PASSWORD.type = "password";
    document.getElementById("showhide").innerHTML = "show"
    ShowHidecond = 1;
  }
}

LOGIN_BTN.addEventListener("click", ()=> {
  if (USERNAME.value && NEW_OR_OLD.checked && PASSWORD.value && localStorage.getItem("fastLogin") == null) {
    socket.emit("NewLogin", USERNAME.value, PASSWORD.value, false);
    LOGIN_ERROR.innerHTML = "Username is already in use,try adding a number or change the name.";
  } else if (USERNAME.value&&!NEW_OR_OLD.checked && PASSWORD.value) {
    socket.emit("OldLogin", USERNAME.value, PASSWORD.value, false);
    LOGIN_ERROR.innerHTML = "Username or Password is incorrect.Please try again";
  }
  if (localStorage.getItem("fastLogin") == "true" && NEW_OR_OLD.checked) {
    LOGIN_ERROR.innerHTML = "You already have an account,Please login";
  }
});

socket.on("NewLogin",
  (name, password, cond)=> {
    if (cond&&USERNAME.value==name) {
      User.name = name;
      LOGIN_ERROR.innerHTML = "";
      LOGIN_PAGE.style.display = "none"
      recoverCond = true;
      localStorage.setItem("fastLogin", "true");
    }
  })
socket.on("OldLogin",
  (name, password, cond)=> {
    if (cond&&USERNAME.value==name) {
      User.name = name;
      LOGIN_ERROR.innerHTML = "";
      LOGIN_PAGE.style.display = "none";
      localStorage.setItem("fastLogin", "true");
    }
  });
socket.on("updatePlayer",
  (name, cost, speed, reload, damage, ammo, bps, health, range, amount, coin)=> {
    for (let i = 0; i < upgrade_del.length; i++) {
      upgrade_del[i].cost = cost[i].cost;
    }
    Gamer.speed = speed;
    Gamer.reload = reload;
    Gamer.MaxHealth = health;
    Gamer.delay = bps;
    Gamer.range = range;
    Gamer.amount = amount;
    Gamer.maxBullet = ammo;
    Gamer.bulletPower = damage;
    game_pisa = coin;
    recoverCond = true;
  });
