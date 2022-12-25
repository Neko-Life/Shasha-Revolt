"use strict";

require("dotenv").config();
const { setDebugMode } = require("./src/debug/debug");
const { printHelp, getParam, CLI_ARGS } = require("./src/cli");

if (typeof getParam(CLI_ARGS.HELP) === "string") {
  printHelp();
  process.exit(0);
}

if (typeof getParam(CLI_ARGS.DEBUG) === "string") {
  setDebugMode(true);
}

const { getLoginToken } = require("./src/util");
const { getClient } = require("./src/client");
const { addSubscriber, removeSubscriber } = require("./src/yandere");

const LOGIN_TOKEN = getLoginToken();
if (!LOGIN_TOKEN) {
  throw new Error("No bot token provided. Please provide bot token using `--token <token>` arg or export a BOT_TOKEN env variable");
}

const client = getClient();

client.on("ready", async () =>
    console.info(`Logged in as ${client.user.username} (${client.user._id})`),
);

client.on("message", async (message) => {
  if (message.content === `<@${client.user._id}> start yandere`) {
    message.channel.sendMessage("Subscribed!");
    addSubscriber(message.channel_id);
  }
  if (message.content === `<@${client.user._id}> stop yandere`) {
    message.channel.sendMessage("Unsubscribed!");
    removeSubscriber(message.channel_id);
  }
});

client.loginBot(LOGIN_TOKEN);
