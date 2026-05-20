const mineflayer = require('mineflayer')
const express = require('express')

const app = express()

// ===== WEB SERVER FOR RENDER =====
app.get('/', (req, res) => {
  res.send('Bot is alive')
})

app.listen(3000, () => {
  console.log('Web server running')
})

// ===== CREATE BOT =====
const bot = mineflayer.createBot({
  host: process.env.HOST || 'YOUR_SERVER_IP',
  port: parseInt(process.env.PORT) || 25565,
  username: process.env.USERNAME || 'Prince'
})

// ===== VARIABLES =====
let attacking = false
let lookYaw = 0

// ===== BOT SPAWN =====
bot.on('spawn', () => {
  console.log('Bot joined server')

  // anti afk random look
  setInterval(() => {
    lookYaw += Math.random() * 0.8 - 0.4

    bot.look(lookYaw, 0, true)

    // small movement
    bot.setControlState('jump', true)

    setTimeout(() => {
      bot.setControlState('jump', false)
    }, 500)

  }, 10000)
})

// ===== CHAT COMMANDS =====
bot.on('chat', (username, message) => {
  if (username === bot.username) return

  // START ATTACK
  if (message === 'attack') {
    attacking = true
    bot.chat('Attack enabled')
  }

  // STOP ATTACK
  if (message === 'stop') {
    attacking = false
    bot.chat('Attack disabled')
  }
})

// ===== ATTACK LOOP =====
setInterval(() => {

  if (!attacking) return

  const entity = bot.nearestEntity(entity =>
    entity.type === 'player' &&
    entity.username !== bot.username
  )

  if (!entity) return

  // LOOK DIRECTLY AT PLAYER
  bot.lookAt(entity.position.offset(0, 1.5, 0), true)

  // MOVE FORWARD
  bot.setControlState('forward', true)

  // SPRINT
  bot.setControlState('sprint', true)

  // REAL ATTACK
  bot.attack(entity)

}, 600)

// ===== STOP MOVEMENT WHEN NO TARGET =====
setInterval(() => {

  const entity = bot.nearestEntity(entity =>
    entity.type === 'player' &&
    entity.username !== bot.username
  )

  if (!entity) {
    bot.setControlState('forward', false)
    bot.setControlState('sprint', false)
  }

}, 1000)

// ===== AUTO RECONNECT =====
bot.on('end', () => {
  console.log('Disconnected, reconnecting...')
  setTimeout(() => {
    process.exit()
  }, 5000)
})

bot.on('kicked', console.log)
bot.on('error', console.log)
