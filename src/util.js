"use strict";

const { getParam, CLI_ARGS } = require("./cli");
const { BOT_TOKEN } = process.env;

const getLoginToken = () => {
    return getParam(CLI_ARGS.TOKEN) || BOT_TOKEN;
}

/**
* @param {string} filename
* @returns {{ ext: string, valid: boolean }}
*/
const getFileExtension = (filename) => {
    let ret = {
        ext: "",
        valid: false,
    };
    const fnLen = filename.length;
    if (!fnLen) return ret;

    const startIdx = (fnLen-1);
    const endIdx = (startIdx-8);
    for (let i = startIdx; i > endIdx; i--) {
        const char = filename[i];
        ret.ext = char + ret.ext;
        if (char === '.') {
            ret.valid = true;
            break;
        }
    }

    return ret;
}

module.exports = {
    getLoginToken,
    getFileExtension,
}

// vim: et sw=4 ts=8
