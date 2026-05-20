const express = require("express");
const mineflayer = require("mineflayer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let deadBot = null;
let princeBot = null;

let deadLogs = [];
let princeLogs = [];

function timeNow() {

  return new Date().toLocaleTimeString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      hour12: false
    }
  );

}

function pushLog(arr, html) {

  arr.push(html);

  if (arr.length > 400) {
    arr.shift();
  }

}

function mcColor(text) {

  if (!text) return "";

  text = text.replace(/\x1B\[[0-9;]*m/g, "");

  const colors = {

    "0":"#000000",
    "1":"#0000AA",
    "2":"#00AA00",
    "3":"#00AAAA",
    "4":"#AA0000",
    "5":"#AA00AA",
    "6":"#FFAA00",
    "7":"#AAAAAA",
    "8":"#555555",
    "9":"#5555FF",
    "a":"#55FF55",
    "b":"#55FFFF",
    "c":"#FF5555",
    "d":"#FF55FF",
    "e":"#FFFF55",
    "f":"#FFFFFF"

  };

  text = text.replace(
    /§([0-9a-f])/gi,
    (_, code) => {

      return `
      <span style="color:${
        colors[
          code.toLowerCase()
        ] || "#fff"
      }">
      `;

    }
  );

  return text + "</span>";

}

function addLog(botName, msg) {

  if (!msg) return;

  msg = msg.trim();

  if (!msg.length) return;

  let sender = "SERVER";

  let finalMsg = msg;

  const normal =
  msg.match(/^<([^>]+)>\s(.+)/);

  if (normal) {

    sender = normal[1];

    finalMsg = normal[2];

  }

  finalMsg = mcColor(finalMsg);

  const html = `

  <div class="line">

    <span class="time">
      [${timeNow()}]
    </span>

    <span class="sender">
      [${sender}]
    </span>

    <span class="msg">
      ${finalMsg}
    </span>

  </div>

  `;

  if (botName === "Deadmau5") {
    pushLog(deadLogs, html);
  }

  if (botName === "Prince") {
    pushLog(princeLogs, html);
  }

}

function createBot(name, password) {

  addLog(
    name,
    "§eConnecting..."
  );

  const bot = mineflayer.createBot({

    host: "karmasmp.ddns.net",

    port: 25565,

    username: name

  });

  bot.online = false;

  bot.once("spawn", () => {

    bot.online = true;

    addLog(
      name,
      "§aConnected"
    );

    setTimeout(() => {

      bot.chat("/login " + password);

      addLog(
        name,
        "§eExecuted /login"
      );

    }, 3000);

  });

  bot.on("messagestr", (msg) => {

    addLog(name, msg);

  });

  bot.on("chat", (username, message) => {

    addLog(
      name,
      "<" + username + "> " + message
    );

  });

  bot.on("playerJoined", (player) => {

    addLog(
      name,
      "§a" +
      player.username +
      " joined the game"
    );

  });

  bot.on("playerLeft", (player) => {

    addLog(
      name,
      "§c" +
      player.username +
      " left the game"
    );

  });

  bot.on("end", () => {

    bot.online = false;

    addLog(
      name,
      "§cDisconnected"
    );

    setTimeout(() => {

      addLog(
        name,
        "§6Reconnecting..."
      );

      if (
        name === "Deadmau5"
        && deadBot
      ) {

        deadBot =
        createBot(
          "Deadmau5",
          "676769"
        );

      }

      if (
        name === "Prince"
        && princeBot
      ) {

        princeBot =
        createBot(
          "Prince",
          "676769"
        );

      }

    }, 60000);

  });

  bot.on("error", (err) => {

    addLog(
      name,
      "§4ERROR: " + err.message
    );

  });

  return bot;

}

function botInfo(bot) {

  if (!bot || !bot.entity) {

    return {

      online:false,

      health:0,

      food:0,

      dimension:"Unknown",

      players:[]

    };

  }

  return {

    online:bot.online,

    health:Math.floor(
      bot.health || 0
    ),

    food:Math.floor(
      bot.food || 0
    ),

    dimension:
    bot.game.dimension || "Unknown",

    players:Object.keys(
      bot.players || {}
    )

  };

}

app.get("/", (req, res) => {

res.send(`

<!DOCTYPE html>

<html>

<head>

<title>MC Bot Console</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Consolas;
}

body{
background:#0a0a0a;
color:white;
height:100vh;
overflow:hidden;
}

.top{
height:70px;
background:#111111;
border-bottom:1px solid #202020;
display:flex;
align-items:center;
justify-content:space-between;
padding:0 25px;
}

.logo{
font-size:32px;
font-weight:bold;
}

.main{
display:flex;
height:calc(100vh - 70px);
}

.consoleArea{
flex:1;
display:flex;
flex-direction:column;
padding:14px;
gap:12px;
}

.switcher{
display:flex;
gap:10px;
}

.botBtn{
background:#171717;
border:1px solid #333;
padding:10px 18px;
border-radius:10px;
cursor:pointer;
color:white;
}

.activeBtn{
background:#2563eb;
}

.console{
flex:1;
background:#050505;
border:1px solid #222;
border-radius:14px;
padding:14px;
overflow:auto;
font-size:14px;
line-height:1.3;
display:flex;
flex-direction:column;
gap:4px;
}

.line{
display:flex;
gap:10px;
white-space:pre-wrap;
word-break:break-word;
}

.time{
color:#666;
min-width:90px;
}

.sender{
color:#38bdf8;
font-weight:bold;
min-width:150px;
}

.msg{
flex:1;
}

.inputBar{
display:flex;
gap:10px;
}

.input{
flex:1;
background:#111;
border:1px solid #333;
padding:14px;
border-radius:10px;
color:white;
outline:none;
}

.send{
width:120px;
border:none;
background:#2563eb;
color:white;
font-weight:bold;
border-radius:10px;
cursor:pointer;
}

.side{
width:320px;
background:#111;
border-left:1px solid #222;
padding:14px;
display:flex;
flex-direction:column;
gap:14px;
overflow:auto;
}

.panel{
background:#171717;
border:1px solid #292929;
border-radius:12px;
padding:14px;
}

.playerList{
display:flex;
flex-wrap:wrap;
gap:8px;
}

.player{
background:#0d1117;
border:1px solid #333;
padding:6px 10px;
border-radius:999px;
font-size:12px;
}

.ctrls{
display:flex;
gap:10px;
margin-top:10px;
}

.small{
flex:1;
padding:10px;
border:none;
border-radius:10px;
font-weight:bold;
cursor:pointer;
color:white;
}

.start{
background:#16a34a;
}

.stop{
background:#dc2626;
}

</style>

</head>

<body>

<div class="top">

<div class="logo">
KarmaSmp Bot Manager
</div>

</div>

<div class="main">

<div class="consoleArea">

<div class="switcher">

<button
id="Deadmau5Tab"
class="botBtn activeBtn"
onclick="switchBot('Deadmau5')">
Deadmau5
</button>

<button
id="PrinceTab"
class="botBtn"
onclick="switchBot('Prince')">
Prince
</button>

</div>

<div
class="console"
id="console">
Loading...
</div>

<div class="inputBar">

<input
id="cmd"
class="input"
placeholder="Send message or command">

<button
class="send"
onclick="sendMsg()">
SEND
</button>

</div>

</div>

<div class="side">

<div class="panel">

<h2 id="activeName">
Deadmau5
</h2>

<div id="stats">
Loading...
</div>

<div class="ctrls">

<button
class="small start"
onclick="startBot()">
START
</button>

<button
class="small stop"
onclick="stopBot()">
STOP
</button>

</div>

</div>

<div class="panel">

<h3>
Mob Farm Attack
</h3>

<div class="ctrls">

<button
class="small start"
onclick="startAttack()">
ATTACK
</button>

<button
class="small stop"
onclick="stopAttack()">
STOP
</button>

</div>

</div>

<div class="panel">

<h3>
Online Players
</h3>

<div
class="playerList"
id="players">
Loading...
</div>

</div>

</div>

</div>

<script>

let currentBot = "Deadmau5";

function switchBot(name){

currentBot = name;

document
.getElementById("Deadmau5Tab")
.classList.remove("activeBtn");

document
.getElementById("PrinceTab")
.classList.remove("activeBtn");

document
.getElementById(name + "Tab")
.classList.add("activeBtn");

refresh();

}

async function refresh(){

const res =
await fetch('/data');

const data =
await res.json();

const bot =

currentBot === "Deadmau5"

? data.dead

: data.prince;

document
.getElementById("console")
.innerHTML =
bot.logs.join("");

const info = bot.info;

document
.getElementById("activeName")
.innerText =
currentBot;

document
.getElementById("stats")
.innerHTML =

"💖 Health: " + info.health +
"<br>🍖 Hunger: " + info.food +
"<br>🌎 Dimension: " + info.dimension +
"<br>🟢 Status: " +
(info.online ? "Online" : "Offline");

document
.getElementById("players")
.innerHTML =

info.players.map(p=>
'<div class="player">'+p+'</div>'
).join('');

const consoleDiv =
document.getElementById("console");

consoleDiv.scrollTop =
consoleDiv.scrollHeight;

}

async function sendMsg(){

const input =
document.getElementById("cmd");

const msg =
input.value;

if(!msg) return;

await fetch('/send',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
bot:currentBot,
msg:msg
})

});

input.value = "";

}

async function startAttack(){

await fetch('/attack',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
bot:currentBot
})

});

}

async function stopAttack(){

await fetch('/stopattack',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
bot:currentBot
})

});

}

document
.getElementById("cmd")
.addEventListener(
'keypress',
e=>{

if(e.key === 'Enter'){

sendMsg();

}

});

async function startBot(){

await fetch('/start',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
bot:currentBot
})

});

}

async function stopBot(){

await fetch('/stop',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
bot:currentBot
})

});

}

setInterval(refresh,1000);

refresh();

</script>

</body>

</html>

`);

});

app.get("/data", (req, res) => {

  res.json({

    dead:{
      logs:deadLogs,
      info:botInfo(deadBot)
    },

    prince:{
      logs:princeLogs,
      info:botInfo(princeBot)
    }

  });

});

app.post("/send", (req, res) => {

  const botName = req.body.bot;

  const msg = req.body.msg;

  let bot = null;

  if (botName === "Deadmau5") {
    bot = deadBot;
  }

  if (botName === "Prince") {
    bot = princeBot;
  }

  if (!bot) {
    return res.sendStatus(404);
  }

  if (!bot.entity) {
    return res.sendStatus(400);
  }

  try {

    bot.chat(msg.toString());

    addLog(
      botName,
      "§b[YOU] " + msg
    );

    res.sendStatus(200);

  } catch {

    res.sendStatus(500);

  }

});

app.post("/attack", (req, res) => {

  const botName = req.body.bot;

  let bot = null;

  if (botName === "Deadmau5") {
    bot = deadBot;
  }

  if (botName === "Prince") {
    bot = princeBot;
  }

  if (!bot) {
    return res.sendStatus(404);
  }

  if (bot.mobLoop) {
    clearInterval(bot.mobLoop);
  }

  addLog(
    botName,
    "§cMob attack enabled"
  );

  bot.mobLoop = setInterval(() => {

    try {

      const entity = Object.values(bot.entities)

      .filter(e => {

        return (

          e.type === "mob"

          && e.position.distanceTo(
            bot.entity.position
          ) < 4

        );

      })

      .sort((a,b)=>{

        return

        bot.entity.position.distanceTo(a.position)

        -

        bot.entity.position.distanceTo(b.position);

      })[0];

      if(entity){

        bot.attack(entity);

      }

    } catch {}

  }, 600);

  res.sendStatus(200);

});

app.post("/stopattack", (req, res) => {

  const botName = req.body.bot;

  let bot = null;

  if (botName === "Deadmau5") {
    bot = deadBot;
  }

  if (botName === "Prince") {
    bot = princeBot;
  }

  if (!bot) {
    return res.sendStatus(404);
  }

  if (bot.mobLoop) {

    clearInterval(bot.mobLoop);

    bot.mobLoop = null;

  }

  addLog(
    botName,
    "§eMob attack disabled"
  );

  res.sendStatus(200);

});

app.post("/start", (req, res) => {

  const bot = req.body.bot;

  if (
    bot === "Deadmau5"
    && !deadBot
  ) {

    deadBot =
    createBot(
      "Deadmau5",
      "676769"
    );

  }

  if (
    bot === "Prince"
    && !princeBot
  ) {

    princeBot =
    createBot(
      "Prince",
      "676769"
    );

  }

  res.sendStatus(200);

});

app.post("/stop", (req, res) => {

  const bot = req.body.bot;

  if (
    bot === "Deadmau5"
    && deadBot
  ) {

    deadBot.quit();

    deadBot = null;

  }

  if (
    bot === "Prince"
    && princeBot
  ) {

    princeBot.quit();

    princeBot = null;

  }

  res.sendStatus(200);

});

deadBot =
createBot(
  "Deadmau5",
  "676769"
);

princeBot =
createBot(
  "Prince",
  "676769"
);

app.listen(
3000,
"0.0.0.0",
()=>{

console.log(
"Dashboard running"
);

});
