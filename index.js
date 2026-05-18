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
height:44px;
background:#111827;
border-bottom:1px solid #263041;
display:flex;
align-items:center;
justify-content:space-between;
padding:0 18px;
font-size:14px;
}

.logo{
font-size:22px;
font-weight:bold;
color:#60a5fa;
}

.server{
color:#9ca3af;
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
border-radius:10px;
padding:16px;
}

.cardtop{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:12px;
}

.botname{
font-size:28px;
font-weight:bold;
}

.status{
padding:5px 12px;
border-radius:999px;
font-size:12px;
font-weight:bold;
}

.online{
background:#064e3b;
color:#34d399;
}

.offline{
background:#3f1111;
color:#f87171;
}

.reconnecting{
background:#4a3200;
color:#fbbf24;
}

.smallbtn{
border:none;
padding:6px 12px;
border-radius:7px;
font-weight:bold;
cursor:pointer;
margin-left:8px;
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
gap:16px;
font-size:13px;
color:#cbd5e1;
margin-top:10px;
}

.consolewrap{
padding:0 14px 14px 14px;
height:calc(100vh - 180px);
display:flex;
flex-direction:column;
}

.tabs{
display:flex;
gap:8px;
margin-bottom:10px;
}

.tab{
background:#111827;
border:1px solid #263041;
padding:8px 14px;
border-radius:7px;
cursor:pointer;
font-size:13px;
}

.active{
background:#2563eb;
}

.console{
flex:1;
background:black;
border:1px solid #263041;
border-radius:10px;
padding:14px;
overflow:auto;
font-size:14px;
line-height:1.6;
white-space:pre-wrap;
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
border-radius:8px;
padding:12px;
color:white;
outline:none;
font-size:14px;
}

.send{
width:90px;
background:#2563eb;
border:none;
border-radius:8px;
color:white;
font-weight:bold;
cursor:pointer;
}

.line{
margin-bottom:3px;
}

.time{
color:#64748b;
}

.bot{
color:#38bdf8;
font-weight:bold;
}

.red{
color:#f87171;
}

.green{
color:#4ade80;
}

.yellow{
color:#facc15;
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

<div class="botname">
Deadmau5
</div>

<div>

<span id="deadStatus" class="status reconnecting">
RECONNECTING
</span>

<button
id="deadBtn"
class="smallbtn stop"
onclick="toggleBot('Deadmau5')">
STOP
</button>

</div>

</div>

<div class="stats" id="deadStats">
Loading...
</div>

</div>

<div class="card">

<div class="cardtop">

<div class="botname">
Prince
</div>

<div>

<span id="princeStatus" class="status reconnecting">
RECONNECTING
</span>

<button
id="princeBtn"
class="smallbtn stop"
onclick="toggleBot('Prince')">
STOP
</button>

</div>

</div>

<div class="stats" id="princeStats">
Loading...
</div>

</div>

</div>

<div class="consolewrap">

<div class="tabs">

<div class="tab active" onclick="setTab('all')">
All
</div>

<div class="tab" onclick="setTab('Deadmau5')">
Deadmau5
</div>

<div class="tab" onclick="setTab('Prince')">
Prince
</div>

</div>

<div class="console" id="console">
Loading...
</div>

<div class="inputbar">

<input
id="cmd"
class="cmd"
placeholder="Type Minecraft command..."
autocomplete="off">

<button class="send" onclick="sendCmd()">
SEND
</button>

</div>

</div>

<script>

let currentTab = "all";

function setTab(tab){

currentTab = tab;

document.querySelectorAll('.tab')
.forEach(t=>t.classList.remove('active'));

event.target.classList.add('active');

}

async function refresh(){

const res = await fetch('/data');
const data = await res.json();

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

document.getElementById('console')
.innerHTML = logs.join("<br>");

const consoleDiv =
document.getElementById('console');

consoleDiv.scrollTop =
consoleDiv.scrollHeight;

}

function updateBotUI(id, info){

const status =
document.getElementById(id+'Status');

const btn =
document.getElementById(id+'Btn');

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

document.getElementById(id+'Stats')
.innerHTML =

"❤️ " + info.health +
" | 🍗 " + info.food +
" | 🌍 " + info.dimension +
" | 👥 " + info.players.length;

}

async function sendCmd(){

const input =
document.getElementById('cmd');

const msg = input.value;

if(!msg) return;

await fetch('/send',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
bot:currentTab==="all"
? "Deadmau5"
: currentTab,
msg:msg
})

});

input.value = "";

}

document
.getElementById('cmd')
.addEventListener('keypress',e=>{

if(e.key === 'Enter'){

sendCmd();

}

});

async function toggleBot(bot){

const res = await fetch('/data');
const data = await res.json();

const online =
bot==="Deadmau5"
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

refresh();

</script>

</body>

</html>
`);
