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

    }, 60000); // reconnect after 1 minute
  });

  bot.on("error", (err) => {
    console.log(err);
  });

  return bot;
}

app.get("/", (req, res) => {

  res.send(`
    <h1>Minecraft Bot Control</h1>

    <h2>Start Bot</h2>

    <form action="/start" method="POST">
      <input name="bot" placeholder="Deadmau5 or Prince">
      <button type="submit">Start Bot</button>
    </form>

    <h2>Stop Bot</h2>

    <form action="/stop" method="POST">
      <input name="bot" placeholder="Deadmau5 or Prince">
      <button type="submit">Stop Bot</button>
    </form>

    <h2>Send Chat / Command</h2>

    <form action="/send" method="POST">
      <input name="bot" placeholder="Deadmau5 or Prince">
      <input name="msg" placeholder="message or command">
      <button type="submit">Send</button>
    </form>

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
