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

const { Client } = require("revolt.js");
const { getLoginToken } = require("./src/util");

const LOGIN_TOKEN = getLoginToken();
if (!LOGIN_TOKEN) {
  throw new Error("No bot token provided. Please provide bot token using `--token <token>` arg or export a BOT_TOKEN env variable");
}

const client = new Client();

client.on("ready", async () =>
    console.info(`Logged in as ${client.user.username} (${client.user._id})`),
);

client.on("message", async (message) => {
    if (message.content === "hello") {
        message.channel.sendMessage("world");
    }
});

client.loginBot(LOGIN_TOKEN);
