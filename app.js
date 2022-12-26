const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const {
  Server
} = require("socket.io");

const io = new Server(server);
const Color = {
  red: "#ff0000",
  blue: "#0000ff"
}
const Arry = {
  player: [],
  details: []
}
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  
  socket.on('disconnect', () => {
    for (let i = 0; i < Arry.player.length; i++) {
      const Player = Arry.player[i];
      if (Player.id === socket.id) {
        io.emit("playeroff", Player.name);
        Arry.player.splice(i, 1);
        i--;
      }
    }
  });
});
class UserDetail {
  constructor(name, password) {
    this.name = name;
    this.gmail = "soon will be asked";
    this.password = password;
    this.gold = 0;
    this.speed = 0
    this.damage = 0
    this.ammo = 0
    this.bps = 0
    this.range = 0
    this.reload = 0;
    this.health = 0;
    this.amount = 0;
    this.cost = [];
  }
}
Arry.details.push(new UserDetail("Game", "1234568"));
class Players {
  constructor (x, y, width, height, angle, speed, health, color, img, name, id) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.speed = speed;
    this.img = img;
    this.color = color;
    this.health = health;
    this.name = name;
    this.id = id;
  }
}

io.on("connection", (socket) => {
  
  socket.on("newPlayers",
    (x, y, width, height, angle, speed, health, color, img, name)=> {
      for (let i = 0; i < Arry.player.length; i++) {
        const Player = Arry.player[i];
        if (Player.name === name) {
          Arry.player.splice(i, 1);
          i--;
        }
      }
      color = (Arry.player.length%2 === 0)?Color.red: Color.blue;
      Arry.player.push(new Players(x, y, width, height, angle, speed, health, color, img, name, socket.id));
      for (let i = 0; i < Arry.player.length; i++) {
        const Player = Arry.player[i];
        io.emit("newPlayers", Player.x, Player.y, Player.width, Player.height, Player.angle, Player.speed, Player.health, Player.color, Player.img, Player.name);
      }
      console.log(Arry.player)
    })
  socket.on("playerup",
    (x, y, angle, speed, health, name)=> {
      io.emit("playerup", x, y, angle, speed, health, name);
      for (let i = 0; i < Arry.player.length; i++) {
        const Player = Arry.player[i];
        if (Player.name === name) {
          Player.x = x;
          Player.y = y
          Player.angle = angle;
          Player.speed = speed;
          Player.health = health;
        }
      }
    });
  socket.on("bullets",
    (x, y, dx, dy, name, power)=> {
      io.emit("bullets", x, y, dx, dy, name, power);
    })
  socket.on("NewLogin",
    (name, password, cond)=> {
      for (let i = 0; i < Arry.details.length; i++) {
        if (Arry.details[i].name.toUpperCase() !== name.toUpperCase()) {
          cond = true;
        } else {
          cond = false;
          break;
        }
      }
      if (cond) {
        Arry.details.push(new UserDetail(name,password));
      }
      
      io.emit("NewLogin", name, password, cond);
    });
  socket.on("OldLogin",
    (name, password, cond)=> {
      for (let i = 0; i < Arry.details.length; i++) {
        const Details=Arry.details[i];
        if (Arry.details[i].name === name) {
          if (Arry.details[i].password === password) {
            cond = true;
            io.emit("updatePlayer",name,Details.cost,Details.speed ,Details.reload ,Details.damage,Details.ammo,Details.bps,Details.health ,Details.range,Details.amount,Details.gold);
          
            break;
          }
        } else {
          cond = false;
        }
      }
      io.emit("OldLogin", name, password, cond);
    });
  socket.on("chatMsg",
    (text, name, color)=> {
      io.emit("chatMsg", text, name, color);
    });
  socket.on("updatePlayer",
    (name, cost, speed, reload,damage,ammo,bps, health,range,  amount, coin)=> {
      for (let i = 0; i < Arry.details.length; i++) {
        const Details = Arry.details[i];
        if (Arry.details[i].name === name) {
          Details.cost = cost;
          Details.speed = speed;
          Details.reload = reload;
          Details.health = health;
          Details.bps= bps;
          Details.ammo= ammo;
          Details.range = range;
          Details.damage = damage;
          Details.amount = amount;
          Details.gold=coin;
        }
      }
    });
})
app.get('/adminSMJunaith2006', (req, res) => {
  let myMsgs = []
  for (let i = 0; i < Arry.details.length; i++) {
    const Details= Arry.details[i];
    myMsgs.push(Details.name+": "+Details.password);
  }
  res.send(myMsgs.join("<br>"));
})
const PORT = process.env.PORT||2000;
server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});