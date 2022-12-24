"use strict";

const { argv } = process;

const CLI_ARGS = {
  HELP: "help",
  TOKEN: "token",
  DEBUG: "debug",
}

const COMMANDS = {
  [CLI_ARGS.HELP]: { args: "", desc: "Show this message" },
  [CLI_ARGS.TOKEN]: { args: "<token>", desc: "Token for bot login. If not specified the env variable BOT_TOKEN will be used" },
  [CLI_ARGS.DEBUG]: { args: "", desc: "Enable debug mode" },
}

const printHelp = () => {
  console.log("Usage: node main.js [ARGS]");
  console.log("ARGS:");
  for (const key in COMMANDS) {
    const data = COMMANDS[key];

    console.log(`\t--${key}\t${data.args || ""}\t-- ${data.desc || ""}`);
  }
}

const getParam = (name) => {
  const index = argv.findIndex(arg => arg === `--${name}`);
  if (index === -1) return;

  const arg = argv[index+1] || "";
  return arg;
}

module.exports = {
  getParam,
  printHelp,
  CLI_ARGS,
}
