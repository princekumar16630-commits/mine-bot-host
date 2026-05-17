const express = require("express");
const mineflayer = require("mineflayer");
const readline = require("readline");

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

  bot.on("chat", (username, message) => {
    console.log(`[CHAT] ${username}: ${message}`);
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("line", (input) => {

  if (input.startsWith("dead ")) {
    const cmd = input.replace("dead ", "");

    if (deadBot) {
      deadBot.chat(cmd);
      console.log("[Deadmau5 SENT] " + cmd);
    }
  }

  if (input.startsWith("prince ")) {
    const cmd = input.replace("prince ", "");

    if (princeBot) {
      princeBot.chat(cmd);
      console.log("[Prince SENT] " + cmd);
    }
  }

});

app.get("/", (req, res) => {
  res.send("Minecraft Bot Host Running");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Control panel running");
});
