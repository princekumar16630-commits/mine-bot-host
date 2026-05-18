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
      hour12: true
    }
  );

}

function mcColor(text){

  return text

  .replace(/\x1B\[[0-9;]*m/g, "")

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
  .replace(/§f/g,'<span style="color:white">')

  + "</span>";

}

function addLog(bot,msg){

  if(!msg) return;

  msg = msg.trim();

  if(msg.length < 1) return;

  const line = `
  <div class="line">
    <span class="time">[${timeNow()}]</span>
    <span class="botname">[${bot}]</span>
    <span class="msg">${mcColor(msg)}</span>
  </div>
  `;

  if(bot === "Deadmau5"){

    deadLogs.push(line);

    if(deadLogs.length > 250){
      deadLogs.shift();
    }

  }

  if(bot === "Prince"){

    princeLogs.push(line);

    if(princeLogs.length > 250){
      princeLogs.shift();
    }

  }

}

function createBot(name){

  addLog(
    name,
    "§eConnecting to karmasmp.ddns.net:25565 ..."
  );

  const bot = mineflayer.createBot({

    host:"karmasmp.ddns.net",

    port:25565,

    username:name

  });

  bot.online = false;

  bot.on("login",()=>{

    bot.online = true;

    addLog(
      name,
      "§aConnected to server"
    );

    setTimeout(()=>{

      bot.chat("/login 676769");

      addLog(
        name,
        "§eExecuted /login"
      );

    },3000);

    bot.jumpLoop = setInterval(()=>{

      if(bot.entity){

        bot.setControlState(
          "jump",
          true
        );

        setTimeout(()=>{

          bot.setControlState(
            "jump",
            false
          );

        },400);

      }

    },30000);

  });

  bot.on("messagestr",(msg)=>{

    addLog(name,msg);

  });

  bot.on("chat",(username,message)=>{

    addLog(
      name,
      "§b<" + username + "> §f" + message
    );

  });

  bot.on("playerJoined",(player)=>{

    addLog(
      name,
      "§a" + player.username + " joined the game"
    );

  });

  bot.on("playerLeft",(player)=>{

    addLog(
      name,
      "§c" + player.username + " left the game"
    );

  });

  bot.on("kicked",(reason)=>{

    addLog(
      name,
      "§cKicked: " + reason
    );

  });

  bot.on("end",()=>{

    bot.online = false;

    clearInterval(bot.jumpLoop);

    addLog(
      name,
      "§cDisconnected from server"
    );

    setTimeout(()=>{

      addLog(
        name,
        "§6Reconnecting in 15s ..."
      );

      if(name === "Deadmau5" && deadBot){

        deadBot = createBot(
          "Deadmau5"
        );

      }

      if(name === "Prince" && princeBot){

        princeBot = createBot(
          "Prince"
        );

      }

    },15000);

  });

  bot.on("error",(err)=>{

    addLog(
      name,
      "§4ERROR: " + err.message
    );

  });

  return bot;

}

function getInfo(bot){

  if(!bot || !bot.entity){

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

app.get("/",(req,res)=>{

res.send(`

<!DOCTYPE html>

<html>

<head>

<title>MC Bot Manager</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Consolas;
}

body{
background:#0b0f17;
color:white;
overflow:hidden;
}

.topbar{
height:55px;
background:#111827;
border-bottom:1px solid #263041;
display:flex;
align-items:center;
justify-content:space-between;
padding:0 20px;
}

.logo{
font-size:18px;
font-weight:bold;
color:#60a5fa;
}

.server{
color:#9ca3af;
font-size:14px;
}

.cards{
display:flex;
gap:14px;
padding:14px;
}

.card{
flex:1;
background:#111827;
border:1px solid #263041;
border-radius:12px;
padding:18px;
}

.cardtop{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:10px;
}

.botnamebig{
font-size:28px;
font-weight:bold;
}

.status{
padding:6px 12px;
border-radius:999px;
font-size:12px;
font-weight:bold;
margin-right:10px;
}

.online{
background:#063d2e;
color:#34d399;
}

.offline{
background:#3f1111;
color:#f87171;
}

.smallbtn{
border:none;
padding:8px 14px;
border-radius:8px;
font-weight:bold;
cursor:pointer;
}

.start{
background:#16a34a;
color:white;
}

.stop{
background:#dc2626;
color:white;
}

.stats{
display:flex;
gap:14px;
font-size:14px;
color:#d1d5db;
}

.consolewrap{
padding:0 14px 14px 14px;
height:calc(100vh - 190px);
display:flex;
flex-direction:column;
}

.tabs{
display:flex;
gap:8px;
margin-bottom:12px;
}

.tab{
background:#111827;
border:1px solid #263041;
padding:10px 16px;
border-radius:8px;
cursor:pointer;
}

.active{
background:#2563eb;
}

.console{
flex:1;
background:black;
border:1px solid #263041;
border-radius:12px;
padding:10px 14px;
overflow:auto;
font-size:14px;
line-height:1.25;
white-space:pre-wrap;
font-family:Consolas;
}

.line{
margin-bottom:1px;
}

.time{
color:#64748b;
margin-right:8px;
}

.botname{
color:#38bdf8;
font-weight:bold;
margin-right:8px;
}

.msg{
display:inline;
}

.inputbar{
display:flex;
gap:10px;
margin-top:12px;
}

.cmd{
flex:1;
background:#111827;
border:1px solid #263041;
border-radius:10px;
padding:14px;
color:white;
outline:none;
font-size:14px;
}

.send{
width:100px;
background:#2563eb;
border:none;
border-radius:10px;
color:white;
font-weight:bold;
cursor:pointer;
}

</style>

</head>

<body>

<div class="topbar">

<div class="logo">
⬢ MC Bot Manager
</div>

<div class="server">
karmasmp.ddns.net:25565 — 1.21.1 Offline Mode
</div>

</div>

<div class="cards">

<div class="card">

<div class="cardtop">

<div class="botnamebig">
Deadmau5
</div>

<div>

<span
id="deadStatus"
class="status offline">
OFFLINE
</span>

<button
id="deadBtn"
class="smallbtn stop"
onclick="toggleBot('Deadmau5')">
STOP
</button>

</div>

</div>

<div
class="stats"
id="deadStats">
Loading...
</div>

</div>

<div class="card">

<div class="cardtop">

<div class="botnamebig">
Prince
</div>

<div>

<span
id="princeStatus"
class="status offline">
OFFLINE
</span>

<button
id="princeBtn"
class="smallbtn stop"
onclick="toggleBot('Prince')">
STOP
</button>

</div>

</div>

<div
class="stats"
id="princeStats">
Loading...
</div>

</div>

</div>

<div class="consolewrap">

<div class="tabs">

<div
class="tab active"
onclick="setTab('all',event)">
All
</div>

<div
class="tab"
onclick="setTab('Deadmau5',event)">
Deadmau5
</div>

<div
class="tab"
onclick="setTab('Prince',event)">
Prince
</div>

</div>

<div
class="console"
id="console">
Loading...
</div>

<div class="inputbar">

<input
id="cmd"
class="cmd"
placeholder="Type Minecraft command..."
autocomplete="off">

<button
class="send"
onclick="sendCmd()">
SEND
</button>

</div>

</div>

<script>

let currentTab = "all";

function setTab(tab,e){

currentTab = tab;

document
.querySelectorAll('.tab')
.forEach(t=>t.classList.remove('active'));

e.target.classList.add('active');

}

async function refresh(){

const res =
await fetch('/data');

const data =
await res.json();

updateBotUI(
'dead',
data.dead.info
);

updateBotUI(
'prince',
data.prince.info
);

let logs = [];

if(currentTab === "all"){

logs = [
...data.dead.logs,
...data.prince.logs
];

}else if(currentTab === "Deadmau5"){

logs = data.dead.logs;

}else{

logs = data.prince.logs;

}

document
.getElementById('console')
.innerHTML = logs.join("");

const consoleDiv =
document.getElementById('console');

consoleDiv.scrollTop =
consoleDiv.scrollHeight;

}

function updateBotUI(id,info){

const status =
document.getElementById(
id+'Status'
);

const btn =
document.getElementById(
id+'Btn'
);

if(info.online){

status.innerText = "ONLINE";

status.className =
"status online";

btn.innerText = "STOP";

btn.className =
"smallbtn stop";

}else{

status.innerText = "OFFLINE";

status.className =
"status offline";

btn.innerText = "START";

btn.className =
"smallbtn start";

}

document
.getElementById(id+'Stats')
.innerHTML =

"❤️ " + info.health +

" | 🍗 " + info.food +

" | 🌍 " + info.dimension +

" | 👥 " + info.players.length;

}

async function sendCmd(){

const input =
document.getElementById('cmd');

const msg =
input.value;

if(!msg) return;

await fetch('/send',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({

bot:
currentTab==="all"
? "Deadmau5"
: currentTab,

msg:msg

})

});

input.value = "";

}

document
.getElementById('cmd')
.addEventListener(
'keypress',
e=>{

if(e.key === 'Enter'){

sendCmd();

}

});

async function toggleBot(bot){

const res =
await fetch('/data');

const data =
await res.json();

const online =
bot==="Deadmau5"
? data.dead.info.online
: data.prince.info.online;

await fetch(

online
? '/stop'
: '/start',

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

refresh();

</script>

</body>

</html>

`);

});

app.get("/data",(req,res)=>{

  res.json({

    dead:{
      logs:deadLogs,
      info:getInfo(deadBot)
    },

    prince:{
      logs:princeLogs,
      info:getInfo(princeBot)
    }

  });

});

app.post("/send",(req,res)=>{

  const bot = req.body.bot;

  const msg = req.body.msg;

  if(
    bot==="Deadmau5"
    && deadBot
  ){

    deadBot.chat(msg);

    addLog(
      bot,
      "§bYOU: " + msg
    );

  }

  if(
    bot==="Prince"
    && princeBot
  ){

    princeBot.chat(msg);

    addLog(
      bot,
      "§bYOU: " + msg
    );

  }

  res.sendStatus(200);

});

app.post("/start",(req,res)=>{

  const bot=req.body.bot;

  if(
    bot==="Deadmau5"
    && !deadBot
  ){

    deadBot =
    createBot("Deadmau5");

  }

  if(
    bot==="Prince"
    && !princeBot
  ){

    princeBot =
    createBot("Prince");

  }

  res.sendStatus(200);

});

app.post("/stop",(req,res)=>{

  const bot=req.body.bot;

  if(
    bot==="Deadmau5"
    && deadBot
  ){

    deadBot.quit();

    deadBot=null;

  }

  if(
    bot==="Prince"
    && princeBot
  ){

    princeBot.quit();

    princeBot=null;

  }

  res.sendStatus(200);

});

deadBot =
createBot("Deadmau5");

princeBot =
createBot("Prince");

app.listen(
3000,
"0.0.0.0",
()=>{

console.log(
"Dashboard running"
);

});
