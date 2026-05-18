const express = require("express");
const mineflayer = require("mineflayer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let deadBot = null;
let princeBot = null;

let deadLogs = [];
let princeLogs = [];

function addLog(bot, msg) {

  const time = new Date().toLocaleTimeString();

  const formatted =
  "[" + time + "] " + msg;

  if (bot === "Deadmau5") {

    deadLogs.push(formatted);

    if (deadLogs.length > 150) {
      deadLogs.shift();
    }

  }

  if (bot === "Prince") {

    princeLogs.push(formatted);

    if (princeLogs.length > 150) {
      princeLogs.shift();
    }

  }

}

function mcColor(text){

  return text
  .replace(/§0/g,'<span style="color:black">')
  .replace(/§1/g,'<span style="color:#5555ff">')
  .replace(/§2/g,'<span style="color:#55ff55">')
  .replace(/§3/g,'<span style="color:#55ffff">')
  .replace(/§4/g,'<span style="color:#ff5555">')
  .replace(/§5/g,'<span style="color:#ff55ff">')
  .replace(/§6/g,'<span style="color:#ffaa00">')
  .replace(/§7/g,'<span style="color:#aaaaaa">')
  .replace(/§8/g,'<span style="color:#555555">')
  .replace(/§9/g,'<span style="color:#5555ff">')
  .replace(/§a/g,'<span style="color:#55ff55">')
  .replace(/§b/g,'<span style="color:#55ffff">')
  .replace(/§c/g,'<span style="color:#ff5555">')
  .replace(/§d/g,'<span style="color:#ff55ff">')
  .replace(/§e/g,'<span style="color:#ffff55">')
  .replace(/§f/g,'<span style="color:white">');
}

function createBot(name) {

  const bot = mineflayer.createBot({
    host: "karmasmp.ddns.net",
    port: 25565,
    username: name
  });

  bot.on("login", () => {

    addLog(name, "§aConnected to server");

    setTimeout(() => {
      bot.chat("/login 676769");
      addLog(name, "§eExecuted /login");
    }, 3000);

    bot.jumpInterval = setInterval(() => {

      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState("jump", false);
      }, 500);

    }, 30000);

  });

  bot.on("message", (jsonMsg) => {

    const raw = jsonMsg.toAnsi();

    const clean = raw
    .replace(/\u001b\[0m/g,"")
    .replace(/\u001b\[31m/g,"§c")
    .replace(/\u001b\[32m/g,"§a")
    .replace(/\u001b\[33m/g,"§e")
    .replace(/\u001b\[34m/g,"§9")
    .replace(/\u001b\[35m/g,"§d")
    .replace(/\u001b\[36m/g,"§b");

    addLog(name, clean);

  });

  bot.on("end", () => {

    addLog(name, "§cDisconnected from server");

    clearInterval(bot.jumpInterval);

    setTimeout(() => {

      addLog(name, "§6Reconnecting...");

      if (name === "Deadmau5" && deadBot) {
        deadBot = createBot("Deadmau5");
      }

      if (name === "Prince" && princeBot) {
        princeBot = createBot("Prince");
      }

    }, 60000);

  });

  bot.on("error", (err) => {
    addLog(name, "§4ERROR: " + err.message);
  });

  return bot;
}

function getInfo(bot){

  if(!bot || !bot.entity){

    return {
      online:false,
      health:0,
      food:0,
      x:0,
      y:0,
      z:0,
      dimension:"Unknown",
      players:[]
    };

  }

  return {

    online:true,

    health:Math.floor(bot.health || 0),

    food:Math.floor(bot.food || 0),

    x:Math.floor(bot.entity.position.x),

    y:Math.floor(bot.entity.position.y),

    z:Math.floor(bot.entity.position.z),

    dimension:bot.game.dimension || "Unknown",

    players:Object.keys(bot.players || {})

  };

}

app.get("/", (req, res) => {

res.send(`
<!DOCTYPE html>
<html>

<head>

<title>Minecraft Dashboard</title>

<style>

body{
background:#0b1020;
color:white;
font-family:Arial;
padding:25px;
margin:0;
}

h1{
text-align:center;
font-size:48px;
background:linear-gradient(90deg,#2563eb,#7c3aed);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
margin-bottom:40px;
}

.grid{
display:flex;
flex-direction:column;
gap:40px;
}

.panel{
background:#121a2b;
border-radius:25px;
padding:25px;
box-shadow:0 0 25px rgba(0,0,0,0.4);
}

.top{
display:flex;
gap:30px;
}

.console{
flex:2;
background:#05070d;
height:450px;
overflow:auto;
padding:15px;
border-radius:18px;
font-family:Consolas,monospace;
font-size:14px;
border:2px solid #1e293b;
box-shadow:
inset 0 0 20px rgba(0,0,0,0.8),
0 0 15px rgba(0,191,255,0.15);
line-height:1.6;
white-space:pre-wrap;
scroll-behavior:smooth;
}

.side{
flex:1;
display:flex;
flex-direction:column;
gap:15px;
}

.box{
background:#1e293b;
padding:15px;
border-radius:15px;
}

.players{
max-height:180px;
overflow:auto;
line-height:1.8;
}

input{
width:100%;
padding:14px;
border:none;
border-radius:12px;
background:#1e293b;
color:white;
margin-top:15px;
font-size:15px;
box-sizing:border-box;
}

button{
width:100%;
padding:14px;
margin-top:12px;
border:none;
border-radius:14px;
background:linear-gradient(90deg,#2563eb,#7c3aed);
color:white;
font-size:15px;
font-weight:bold;
cursor:pointer;
transition:0.2s;
box-shadow:0 0 15px rgba(59,130,246,0.35);
}

button:hover{
transform:translateY(-2px);
box-shadow:0 0 20px rgba(124,58,237,0.55);
}

button:active{
transform:scale(0.98);
}

</style>

</head>

<body>

<h1>⚡ Minecraft Bot Dashboard ⚡</h1>

<div class="grid">

<div class="panel">

<h2>🎮 Deadmau5</h2>

<div class="top">

<div class="console" id="deadConsole"></div>

<div class="side">

<div class="box" id="deadStats"></div>

<div class="box">

<h3>👥 Players Online</h3>

<div class="players" id="deadPlayers"></div>

</div>

</div>

</div>

<input id="deadMsg" placeholder="Type command or message">

<button onclick="sendMsg('Deadmau5')">
⚡ Execute Command
</button>

<button id="deadToggle" onclick="toggleBot('Deadmau5')">
Loading...
</button>

</div>

<div class="panel">

<h2>🎮 Prince</h2>

<div class="top">

<div class="console" id="princeConsole"></div>

<div class="side">

<div class="box" id="princeStats"></div>

<div class="box">

<h3>👥 Players Online</h3>

<div class="players" id="princePlayers"></div>

</div>

</div>

</div>

<input id="princeMsg" placeholder="Type command or message">

<button onclick="sendMsg('Prince')">
⚡ Execute Command
</button>

<button id="princeToggle" onclick="toggleBot('Prince')">
Loading...
</button>

</div>

</div>

<script>

async function refresh(){

  const res = await fetch('/data');
  const data = await res.json();

  document.getElementById('deadConsole').innerHTML =
  data.dead.logs.join("<br>");

  document.getElementById('princeConsole').innerHTML =
  data.prince.logs.join("<br>");

  updateBot("dead", data.dead.info);
  updateBot("prince", data.prince.info);

}

function updateBot(id, info){

  const btn =
  document.getElementById(id + "Toggle");

  if(info.online){

    btn.innerText = "🛑 Stop Bot";

    btn.style.background =
    "linear-gradient(90deg,#ef4444,#dc2626)";

  }else{

    btn.innerText = "🚀 Start Bot";

    btn.style.background =
    "linear-gradient(90deg,#2563eb,#7c3aed)";

  }

  document.getElementById(id + "Stats").innerHTML =
  info.online
  ?
  "❤️ Health: " + info.health + "<br>" +
  "🍗 Hunger: " + info.food + "<br>" +
  "📍 Position: " + info.x + ", " + info.y + ", " + info.z + "<br>" +
  "🌍 Dimension: " + info.dimension
  :
  "🔴 Offline";

  document.getElementById(id + "Players").innerHTML =
  info.players.length > 0
  ?
  "Online: " + info.players.length + "<br><br>" +
  info.players.join("<br>")
  :
  "No players found";

}

async function sendMsg(bot){

  const msg =
  document.getElementById(
    bot === "Deadmau5"
    ? "deadMsg"
    : "princeMsg"
  ).value;

  await fetch('/send',{

    method:'POST',

    headers:{
      'Content-Type':'application/json'
    },

    body:JSON.stringify({
      bot:bot,
      msg:msg
    })

  });

}

async function toggleBot(bot){

  const res = await fetch('/data');
  const data = await res.json();

  const online =
  bot === "Deadmau5"
  ? data.dead.info.online
  : data.prince.info.online;

  await fetch(

    online ? '/stop' : '/start',

    {
      method:'POST',

      headers:{
        'Content-Type':'application/json'
      },

      body:JSON.stringify({
        bot:bot
      })
    }

  );

}

setInterval(refresh,500);

</script>

</body>
</html>
`);

});

app.get("/data",(req,res)=>{

  res.json({

    dead:{
      logs:deadLogs.map(mcColor),
      info:getInfo(deadBot)
    },

    prince:{
      logs:princeLogs.map(mcColor),
      info:getInfo(princeBot)
    }

  });

});

app.post("/send",(req,res)=>{

  const bot = req.body.bot;
  const msg = req.body.msg;

  if(bot==="Deadmau5" && deadBot){
    deadBot.chat(msg);
    addLog(bot,"§bYOU: "+msg);
  }

  if(bot==="Prince" && princeBot){
    princeBot.chat(msg);
    addLog(bot,"§bYOU: "+msg);
  }

  res.sendStatus(200);

});

app.post("/start",(req,res)=>{

  const bot = req.body.bot;

  if(bot==="Deadmau5" && !deadBot){
    deadBot=createBot("Deadmau5");
  }

  if(bot==="Prince" && !princeBot){
    princeBot=createBot("Prince");
  }

  res.sendStatus(200);

});

app.post("/stop",(req,res)=>{

  const bot=req.body.bot;

  if(bot==="Deadmau5" && deadBot){
    deadBot.quit();
    deadBot=null;
  }

  if(bot==="Prince" && princeBot){
    princeBot.quit();
    princeBot=null;
  }

  res.sendStatus(200);

});

deadBot=createBot("Deadmau5");
princeBot=createBot("Prince");

app.listen(3000,"0.0.0.0",()=>{
  console.log("Dashboard running");
});
