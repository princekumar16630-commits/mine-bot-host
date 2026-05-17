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
    if (deadLogs.length > 50) deadLogs.shift();
  }

  if (bot === "Prince") {
    princeLogs.push(msg);
    if (princeLogs.length > 50) princeLogs.shift();
  }

}

function createBot(name) {

  const bot = mineflayer.createBot({
    host: "karmasmp.ddns.net",
    port: 25565,
    username: name
  });

  bot.on("login", () => {

    addLog(name, "Connected to server");

    setTimeout(() => {
      bot.chat("/login 676769");
      addLog(name, "Executed /login");
    }, 3000);

    bot.jumpInterval = setInterval(() => {

      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState("jump", false);
      }, 500);

    }, 30000);

  });

  bot.on("chat", (username, message) => {
    addLog(name, username + ": " + message);
  });

  bot.on("end", () => {

    addLog(name, "Disconnected from server");

    clearInterval(bot.jumpInterval);

    setTimeout(() => {

      addLog(name, "Reconnecting...");

      if (name === "Deadmau5" && deadBot) {
        deadBot = createBot("Deadmau5");
      }

      if (name === "Prince" && princeBot) {
        princeBot = createBot("Prince");
      }

    }, 60000);

  });

  bot.on("error", (err) => {
    addLog(name, "ERROR: " + err.message);
  });

  return bot;
}

app.get("/", (req, res) => {

  res.send(`
<!DOCTYPE html>
<html>

<head>

<title>Bot Panel</title>

<style>

body{
background:#0f0f0f;
color:white;
font-family:Arial;
padding:20px;
}

h1{
text-align:center;
color:#00ff99;
font-size:45px;
text-shadow:0 0 15px #00ff99;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:20px;
}

.panel{
background:#1b1b1b;
padding:20px;
border-radius:20px;
box-shadow:0 0 20px rgba(0,255,150,0.2);
}

.console{
background:black;
color:#00ff66;
height:350px;
overflow:auto;
padding:15px;
border-radius:15px;
font-family:monospace;
margin-bottom:15px;
}

input{
width:95%;
padding:12px;
border:none;
border-radius:10px;
background:#2a2a2a;
color:white;
margin-bottom:10px;
}

button{
padding:12px;
width:100%;
border:none;
border-radius:10px;
background:#00ff99;
color:black;
font-weight:bold;
cursor:pointer;
margin-top:8px;
}

button:hover{
background:#00cc77;
}

</style>

</head>

<body>

<h1>⚡ Minecraft Bot Control ⚡</h1>

<div class="grid">

<div class="panel">

<h2>🖥 Deadmau5</h2>

<div class="console" id="deadConsole"></div>

<input id="deadMsg" placeholder="Type message or command">

<button onclick="sendMsg('Deadmau5')">Send</button>

<button onclick="startBot('Deadmau5')">Start Bot</button>

<button onclick="stopBot('Deadmau5')">Stop Bot</button>

</div>

<div class="panel">

<h2>🖥 Prince</h2>

<div class="console" id="princeConsole"></div>

<input id="princeMsg" placeholder="Type message or command">

<button onclick="sendMsg('Prince')">Send</button>

<button onclick="startBot('Prince')">Start Bot</button>

<button onclick="stopBot('Prince')">Stop Bot</button>

</div>

</div>

<script>

async function refreshLogs(){

  const res = await fetch('/logs');
  const data = await res.json();

  document.getElementById('deadConsole').innerHTML =
  data.dead.join("<br>");

  document.getElementById('princeConsole').innerHTML =
  data.prince.join("<br>");

}

async function sendMsg(bot){

  const msg =
  document.getElementById(
    bot === 'Deadmau5' ? 'deadMsg' : 'princeMsg'
  ).value;

  await fetch('/send', {
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

async function startBot(bot){

  await fetch('/start',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      bot:bot
    })
  });

}

async function stopBot(bot){

  await fetch('/stop',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      bot:bot
    })
  });

}

setInterval(refreshLogs,1000);

</script>

</body>
</html>
`);

});

app.get("/logs", (req, res) => {

  res.json({
    dead: deadLogs,
    prince: princeLogs
  });

});

app.post("/send", (req, res) => {

  const bot = req.body.bot;
  const msg = req.body.msg;

  if (bot === "Deadmau5" && deadBot) {
    deadBot.chat(msg);
    addLog(bot, "YOU: " + msg);
  }

  if (bot === "Prince" && princeBot) {
    princeBot.chat(msg);
    addLog(bot, "YOU: " + msg);
  }

  res.sendStatus(200);

});

app.post("/start", (req, res) => {

  const bot = req.body.bot;

  if (bot === "Deadmau5" && !deadBot) {
    deadBot = createBot("Deadmau5");
    addLog(bot, "Starting bot...");
  }

  if (bot === "Prince" && !princeBot) {
    princeBot = createBot("Prince");
    addLog(bot, "Starting bot...");
  }

  res.sendStatus(200);

});

app.post("/stop", (req, res) => {

  const bot = req.body.bot;

  if (bot === "Deadmau5" && deadBot) {
    deadBot.quit();
    deadBot = null;
    addLog(bot, "Bot stopped");
  }

  if (bot === "Prince" && princeBot) {
    princeBot.quit();
    princeBot = null;
    addLog(bot, "Bot stopped");
  }

  res.sendStatus(200);

});

deadBot = createBot("Deadmau5");
princeBot = createBot("Prince");

app.listen(3000, "0.0.0.0", () => {
  console.log("Panel running");
});
