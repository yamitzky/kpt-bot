'use strict'

const Botkit = require('botkit')
const moment = require('moment')
const { promisify } = require('util')

const slackBotToken = process.env.SLACK_BOT_TOKEN

if (!slackBotToken) {
  console.log('Error: Specify token in environment')
  process.exit(1)
}

const commonParams = {
  token: slackBotToken
}

const controller = Botkit.slackbot({
  debug: !!process.env.DEBUG
})

const bot = controller.spawn({
  token: slackBotToken
})

bot.startRTM((err) => {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

/*
   This KPI bot waits for you to call him. Here is sample usage.

   Format:
     @bot-name :emoji: $interval
     - interval: Required. Start of time range of messages.

   Sample:
     @bot-name :kpt: 7 days

     The bot gathers KPTs you posted from 7 days ago to now in your timezone
     from history of a channel you called the bot.

   ```
   :kpt:
   - Started daily meeting
   - Find a release blocker earlier
   ```
 */
controller.hears(
  ['(:[^:]+:)\\s*(\\d+)\\s*([^.]*)'],
  'direct_mention,mention',
  async (bot, message) => {
    const [_, emoji, interval, unit] = message.match
    const oldest = moment(
      moment() - moment.duration(parseInt(interval), unit)
    ).unix()

    const { members } = await promisify(bot.api.users.list)({})
    const { messages } = await promisify(bot.api.channels.history)({
      channel: message.channel,
      count: 1000,
      oldest
    })

    const result = [`${emoji} since ${interval} ${unit} ago`]
    for (const msg of messages) {
      if (msg.text && msg.text.startsWith(emoji) && !msg.bot_id) {
        const text = msg.text.substring(emoji.length).trim()
        const user = members.find(({ id }) => id === msg.user) || {}
        const reactions = msg.reactions
          ? msg.reactions.map(({ name }) => `:${name}:`)
          : ''
        result.push(`- ${text} by ${user.name} ${reactions}`)
      }
    }

    bot.reply(message, result.join('\n'))
  }
)

/*
   If no command matched, show usage.
 */
controller.hears(
  '^help$',
  ['direct_message', 'direct_mention', 'mention'],
  (bot, message) => {
    const reply = `
Sorry, I can't understand the order. :cry: Can you try again?

Format:
  @bot-name :some emoji: $interval
  -interval: Required. Start of time range of messages.

Sample:
  @bot-name :kpt: 7 days
`
    bot.reply(message, reply)
  }
)
