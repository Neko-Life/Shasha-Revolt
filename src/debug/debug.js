"use strict";

let debug = false;

const setDebugMode = (mode) => {
    debug = mode;
}

const getDebugMode = () => debug;

module.exports = {
    setDebugMode,
    getDebugMode,
}

// vim: et sw=4 ts=8
