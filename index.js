const express = require("express");
const mineflayer = require("mineflayer");

const app = express();

app.use(express.urlencoded({ extended: true }));

let deadBot;
let princeBot;

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
      if (name === "Deadmau5") {
        deadBot = createBot(name);
      }

      if (name === "Prince") {
        princeBot = createBot(name);
      }
    }, 30000);
  });

  bot.on("error", (err) => {
    console.log(err);
  });

  return bot;
}

deadBot = createBot("Deadmau5");
princeBot = createBot("Prince");

app.get("/", (req, res) => {
  res.send(`
    <h1>Minecraft Bot Control</h1>

    <form action="/send" method="POST">
      <input name="bot" placeholder="Deadmau5 or Prince">
      <input name="msg" placeholder="Minecraft command">
      <button type="submit">Send</button>
    </form>

    <p>Examples:</p>
    <p>/home farm</p>
    <p>/msg player hi</p>
    <p>/tp x y z</p>
  `);
});

app.post("/send", (req, res) => {
  const botName = req.body.bot;
  const msg = req.body.msg;

  if (botName === "Deadmau5") {
    deadBot.chat(msg);
  }

  if (botName === "Prince") {
    princeBot.chat(msg);
  }

  res.redirect("/");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Control panel running");
});
