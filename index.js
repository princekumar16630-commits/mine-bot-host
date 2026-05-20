const mineflayer = require('mineflayer')
const express = require('express')

const app = express()

// ===== WEB SERVER =====
app.get('/', (req, res) => {
  res.send('Bot Alive')
})

app.listen(3000, () => {
  console.log('Web server running')
})

// ===== BOT =====
const bot = mineflayer.createBot({
  host: 'YOUR_SERVER_IP',
  port: 25565,
  username: 'Prince'
})

let attacking = false

// ===== SPAWN =====
bot.on('spawn', () => {
  console.log('Bot joined')

  // anti afk
  setInterval(() => {
    bot.setControlState('jump', true)

    setTimeout(() => {
      bot.setControlState('jump', false)
    }, 500)

  }, 10000)
})

// ===== CHAT COMMAND =====
bot.on('chat', (username, message) => {

  if (username === bot.username) return

  if (message === 'attack') {
    attacking = true
    bot.chat('attack on')
  }

  if (message === 'stop') {
    attacking = false
    bot.chat('attack off')
  }
})

// ===== ATTACK LOOP =====
setInterval(() => {

  if (!attacking) return

  const players = Object.values(bot.entities).filter(e =>
    e.type === 'player' &&
    e.username !== bot.username
  )

  if (players.length === 0) return

  const target = players[0]

  bot.lookAt(target.position.offset(0, 1.5, 0))

  bot.setControlState('forward', true)

  bot.attack(target)

}, 1000)

// ===== ERRORS =====
bot.on('error', err => {
  console.log(err)
})

bot.on('kicked', reason => {
  console.log(reason)
})
