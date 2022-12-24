"use strict";

const { getParam, CLI_ARGS } = require("../cli");
const { BOT_TOKEN } = process.env;

const getLoginToken = () => {
  return getParam(CLI_ARGS.TOKEN) || BOT_TOKEN;
}

module.exports = {
  getLoginToken,
}
