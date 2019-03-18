# Slack bot for KPT retrospect

## What's this?

Slack bot to memo by emoji. Inspired by and forked from https://github.com/ohbarye/kpt-bot.

## Usage

- Post any messages starting with :emoji: as like...
  - ":kpt: K: something good"
  - ":todo: buy milk"
- Call your bot when you want to remember.

### Format

`@bot-name summary $interval`

- interval: Required. Start of time range of messages.

### Sample

`@bot-name :kpt: 7 days`

The bot gathers :kpt:s you posted since 7 days ago from history of a channel you called the bot.

## Develop

```sh
$ git clone git@github.com:yamitzky/memoji-bot.git
$ npm install -g yarn && yarn
$ SLACK_BOT_TOKEN=your-slack-bot-token node index.js
```

### Run with Docker

First build the image.

```
docker build -t memoji-bot .
```

Run the bot image by specifying your slack bot token.

```
docker run -e SLACK_BOT_TOKEN=your-slack-bot-token kpt-bot
```

## Environment Variables

### SLACK_BOT_TOKEN (required)

Slack bot API token.

If you do not have it yet, visit https://my.slack.com/services/new/bot and get the token.
