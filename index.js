const express = require("express");
const mineflayer = require("mineflayer");

const app = express();

app.use(express.urlencoded({ extended: true }));

let deadBot = null;
let princeBot = null;

function createBot(name) {

  const bot = mineflayer.createBot({
    host: "karmasmp.ddns.net",
    port: 25565,
    username: name
  });

  bot.on("login", () => {
    console.log(name + " joined!");

    setTimeout(() => {
      bot.chat("/login 676769");
    }, 3000);

    bot.jumpInterval = setInterval(() => {
      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState("jump", false);
      }, 500);
    }, 30000);
  });

  bot.on("end", () => {
    console.log(name + " disconnected!");

    clearInterval(bot.jumpInterval);

    setTimeout(() => {

      if (name === "Deadmau5" && deadBot) {
        deadBot = createBot("Deadmau5");
      }

      if (name === "Prince" && princeBot) {
        princeBot = createBot("Prince");
      }

    }, 60000);

  });

  bot.on("error", (err) => {
    console.log(err);
  });

  return bot;
}

app.get("/", (req, res) => {

  res.send(`
<!DOCTYPE html>
<html>

<head>
<title>Minecraft Bot Panel</title>

<style>

body{
background:#0f0f0f;
color:white;
font-family:Arial;
padding:20px;
}

h1{
text-align:center;
font-size:40px;
color:#00ff99;
text-shadow:0 0 15px #00ff99;
}

.panel{
background:#1b1b1b;
padding:20px;
border-radius:20px;
margin-bottom:25px;
box-shadow:0 0 20px rgba(0,255,150,0.2);
}

h2{
color:#00ffaa;
}

input{
width:250px;
padding:12px;
margin:8px;
border:none;
border-radius:10px;
background:#2a2a2a;
color:white;
}

button{
padding:12px 20px;
border:none;
border-radius:10px;
background:#00ff99;
color:black;
font-weight:bold;
cursor:pointer;
transition:0.3s;
}

button:hover{
background:#00cc77;
transform:scale(1.05);
}

.console{
background:black;
color:#00ff66;
padding:15px;
height:250px;
overflow:auto;
border-radius:15px;
font-family:monospace;
margin-top:10px;
box-shadow:0 0 15px rgba(0,255,100,0.3);
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:20px;
}

</style>
</head>

<body>

<h1>⚡ Minecraft Bot Control Panel ⚡</h1>

<div class="panel">

<h2>🚀 Start Bot</h2>

<form action="/start" method="POST">
<input name="bot" placeholder="Deadmau5 or Prince">
<button type="submit">Start Bot</button>
</form>

<h2>🛑 Stop Bot</h2>

<form action="/stop" method="POST">
<input name="bot" placeholder="Deadmau5 or Prince">
<button type="submit">Stop Bot</button>
</form>

<h2>💬 Send Chat / Command</h2>

<form action="/send" method="POST">
<input name="bot" placeholder="Deadmau5 or Prince">
<input name="msg" placeholder="/home farm">
<button type="submit">Send</button>
</form>

</div>

<div class="grid">

<div class="panel">
<h2>🖥 Deadmau5 Console</h2>
<div class="console">
${deadBot ? "Deadmau5 Online" : "Deadmau5 Offline"}
</div>
</div>

<div class="panel">
<h2>🖥 Prince Console</h2>
<div class="console">
${princeBot ? "Prince Online" : "Prince Offline"}
</div>
</div>

</div>

</body>
</html>
`);
});

app.post("/start", (req, res) => {

  const botName = req.body.bot;

  if (botName === "Deadmau5" && !deadBot) {
    deadBot = createBot("Deadmau5");
  }

  if (botName === "Prince" && !princeBot) {
    princeBot = createBot("Prince");
  }

  res.redirect("/");
});

app.post("/stop", (req, res) => {

  const botName = req.body.bot;

  if (botName === "Deadmau5" && deadBot) {
    deadBot.quit();
    deadBot = null;
  }

  if (botName === "Prince" && princeBot) {
    princeBot.quit();
    princeBot = null;
  }

  res.redirect("/");
});

app.post("/send", (req, res) => {

  const botName = req.body.bot;
  const msg = req.body.msg;

  if (botName === "Deadmau5" && deadBot) {
    deadBot.chat(msg);
  }

  if (botName === "Prince" && princeBot) {
    princeBot.chat(msg);
  }

  res.redirect("/");
});

// AUTO START BOTS
deadBot = createBot("Deadmau5");
princeBot = createBot("Prince");

app.listen(3000, "0.0.0.0", () => {
  console.log("Control panel running");
});
