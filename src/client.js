"use strict";

const { Client } = require("revolt.js");
const client = new Client();

const getClient = () => client;

module.exports = {
  getClient,
}
