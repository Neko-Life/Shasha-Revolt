"use strict";

const { Client } = require("revolt.js");
const client = new Client();

const getClient = () => client;

module.exports = {
    getClient,
}

// vim: et sw=4 ts=8
