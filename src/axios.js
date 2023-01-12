"use strict";

const axios = require("axios");
const FormData = require("form-data");
const { readFileSync } = require("fs");
const { getFileExtension } = require("./util");

const postAttachment = async (filePath, contentType = "image/*", filename = "Beautiful Art") => {
    const uri = "https://autumn.revolt.chat/attachments";

    const optionsRes = await axios(uri, {
        method: "OPTIONS",
        headers: {
            "access-control-request-method": "POST",
            origin: "https://app.revolt.chat",
        },
    });

    if (optionsRes.status === 200) {
        const file = readFileSync(filePath);
        const form = new FormData();

        const extensionInfo = getFileExtension(filePath);
        let filenameWithExtension = filename;

        if (extensionInfo.valid) {
            filenameWithExtension += extensionInfo.ext;
        }

        form.append("file", file, { contentType, filename: filenameWithExtension, });

        return axios(uri, {
            method: 'POST',
            headers: {
                "accept": "application/json, text/plain, */*",
                "origin": "https://app.revolt.chat",
                ...form.getHeaders(),
                'content-length': form.getLengthSync().toString(),
                "content-type": `multipart/form-data; boundary=${form.getBoundary()}`,
            },
            data: form,
        });
    }
}

module.exports = {
    postAttachment,
}

// vim: et sw=4 ts=8
