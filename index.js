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

  if (bot === "Deadmau5") {
    deadLogs.push(msg);
    if (deadLogs.length > 100) deadLogs.shift();
  }

  if (bot === "Prince") {
    princeLogs.push(msg);
    if (princeLogs.length > 100) princeLogs.shift();
  }

}

function mcColor(text){

  return text
  .replace(/§0/g,'<span style="color:black">')
  .replace(/§1/g,'<span style="color:darkblue">')
  .replace(/§2/g,'<span style="color:green">')
  .replace(/§3/g,'<span style="color:cyan">')
  .replace(/§4/g,'<span style="color:red">')
  .replace(/§5/g,'<span style="color:purple">')
  .replace(/§6/g,'<span style="color:orange">')
  .replace(/§7/g,'<span style="color:lightgray">')
  .replace(/§8/g,'<span style="color:gray">')
  .replace(/§9/g,'<span style="color:blue">')
  .replace(/§a/g,'<span style="color:lime">')
  .replace(/§b/g,'<span style="color:aqua">')
  .replace(/§c/g,'<span style="color:#ff5555">')
  .replace(/§d/g,'<span style="color:pink">')
  .replace(/§e/g,'<span style="color:yellow">')
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

  bot.on("messagestr", (msg) => {
    addLog(name, msg);
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

  if(!bot){
    return {
      online:false
    };
  }

  return {
    online:true,
    health:bot.health,
    food:bot.food,
    x:Math.floor(bot.entity.position.x),
    y:Math.floor(bot.entity.position.y),
    z:Math.floor(bot.entity.position.z),
    dimension:bot.game.dimension,
    players:Object.keys(bot.players)
  };

}

app.get("/", (req, res) => {

res.send(`
<!DOCTYPE html>
<html>

<head>

<title>Minecraft Control</title>

<style>

body{
background:#0b0f1a;
color:white;
font-family:Arial;
margin:0;
padding:20px;
}

h1{
text-align:center;
font-size:45px;
background:linear-gradient(90deg,#00bfff,#8a2be2);
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:20px;
}

.panel{
background:#111827;
border-radius:20px;
padding:20px;
box-shadow:0 0 20px rgba(0,0,0,0.5);
}

.console{
background:#05070d;
height:350px;
overflow:auto;
padding:15px;
border-radius:15px;
font-family:monospace;
margin-bottom:15px;
border:2px solid #1f2937;
}

input{
width:100%;
padding:12px;
border:none;
border-radius:12px;
background:#1f2937;
color:white;
margin-bottom:10px;
font-size:15px;
}

button{
width:100%;
padding:12px;
border:none;
border-radius:12px;
font-weight:bold;
cursor:pointer;
margin-top:10px;
font-size:15px;
background:linear-gradient(90deg,#00bfff,#8a2be2);
color:white;
}

button:hover{
opacity:0.85;
}

.stats{
background:#1f2937;
padding:12px;
border-radius:12px;
margin-top:10px;
line-height:1.8;
}

.players{
background:#0f172a;
padding:12px;
border-radius:12px;
margin-top:10px;
max-height:180px;
overflow:auto;
}

.online{
color:#00ff99;
}

.offline{
color:#ff5555;
}

</style>

</head>

<body>

<h1>⚡ Minecraft Bot Control ⚡</h1>

<div class="grid">

<div class="panel">

<h2>🎮 Deadmau5</h2>

<div class="console" id="deadConsole"></div>

<input id="deadMsg" placeholder="Type message or command">

<button onclick="sendMsg('Deadmau5')">Send Message</button>

<button id="deadToggle" onclick="toggleBot('Deadmau5')">
Loading...
</button>

<div class="stats" id="deadStats"></div>

<div class="players">
<h3>Players Online</h3>
<div id="deadPlayers"></div>
</div>

</div>

<div class="panel">

<h2>🎮 Prince</h2>

<div class="console" id="princeConsole"></div>

<input id="princeMsg" placeholder="Type message or command">

<button onclick="sendMsg('Prince')">Send Message</button>

<button id="princeToggle" onclick="toggleBot('Prince')">
Loading...
</button>

<div class="stats" id="princeStats"></div>

<div class="players">
<h3>Players Online</h3>
<div id="princePlayers"></div>
</div>

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

  updateBot('dead',data.dead.info);
  updateBot('prince',data.prince.info);

}

function updateBot(id,info){

  document.getElementById(id+'Toggle').innerText =
  info.online ? 'Stop Bot' : 'Start Bot';

  document.getElementById(id+'Stats').innerHTML = info.online ? \`
  ❤️ Health: \${info.health}<br>
  🍗 Hunger: \${info.food}<br>
  📍 Position: \${info.x}, \${info.y}, \${info.z}<br>
  🌍 Dimension: \${info.dimension}
  \` : '<span class="offline">Bot Offline</span>';

  document.getElementById(id+'Players').innerHTML =
  info.online
  ? info.players.length + " Players Online<br><br>" + info.players.join("<br>")
  : "Offline";

}

async function sendMsg(bot){

  const msg =
  document.getElementById(
    bot === 'Deadmau5'
    ? 'deadMsg'
    : 'princeMsg'
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

  const data = await fetch('/data').then(r=>r.json());

  const online =
  bot === 'Deadmau5'
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

setInterval(refresh,1000);

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
  console.log("Control panel running");
});
