"use strict";

const { readdirSync } = require("fs");
const { join } = require("path");
const { getClient } = require("./client");
const { postAttachment } = require("./axios");
const { getDebugMode } = require("./debug/debug");
const Models = require("../models");

const { YANDERE_FOLDER } = process.env;
const SEND_DURATION = 6*60*60*1000;

/**
 * @type {typeof import("sequelize").Model}
 */
const UploadedYandere = Models.UploadedYandere;

/**
 * @type {typeof import("sequelize").Model}
 */
const SentYandere = Models.SentYandere;

/**
 * @type {typeof import("sequelize").Model}
 */
const YandereSubscriber = Models.YandereSubscriber;

/**
 * @typedef {object} UploadedYandereSetting
 * @property {string[]} channel_ids
 * @property {string} autumn_id
 * @property {number} id
 * @property {string} filename
 */

/**
 * @typedef {object} Subscriber
 * @property {string} channel_id
 * @property {NodeJS.Timer} interval
 */

/**
 * @type {Map<string, UploadedYandereSetting>}
 */
const dbCache = new Map();

/**
 * @type {Subscriber[]}
 */
const subscriberCache = [];

let yandereFileList = readdirSync(YANDERE_FOLDER);
if (getDebugMode()) console.log("[readdirSync YANDERE_FOLDER] Found", yandereFileList.length);

const readYandereFolderInterval = setInterval(() => {
  yandereFileList = readdirSync(YANDERE_FOLDER);
  if (getDebugMode()) console.log("[readdirSync YANDERE_FOLDER interval] Found", yandereFileList.length);
}, SEND_DURATION);

const getRandomYandereFile = () => {
  return yandereFileList[Math.floor(Math.random() * yandereFileList.length)];
}

const getFilePath = (filename) => join(YANDERE_FOLDER, filename);

const uploadFile = async (filepath, filename) => {
  const res = await postAttachment(filepath);

  if (getDebugMode()) console.log("[res.data uploadFile]", filepath, res.data);

  const uploaded = await UploadedYandere.create({
    autumn_id: res.data.id,
    filename: filename,
  });

  /**
   * @type {UploadedYandereSetting}
   */
  const toCache = {
    id: uploaded.id,
    filename: uploaded.filename,
    autumn_id: uploaded.autumn_id,
    channel_ids: [],
  }

  if (getDebugMode()) console.log("[toCache uploadFile]", toCache.autumn_id, toCache);

  dbCache.set(toCache.autumn_id, toCache);

  return toCache;
}

const hasSent = (autumn_id, channel_id) => {
  return dbCache.get(autumn_id)?.channel_ids.includes(channel_id);
}

const findUpload = (filename) => {
  for (const [id, data] of dbCache) {
    if (data.filename === filename) return data;
  }
}

const sendRandomYandere = async (channel_id) => {
  const channel = getClient().channels.get(channel_id);

  if (!channel) {
    console.error("[sendRandomYandere ERROR] Can't find channel, invalid channel id:", channel_id);
    return false;
  }

  let randFile;

  let uploaded;

  do {
    randFile = getRandomYandereFile();
    if (getDebugMode()) console.log("[randFile sendRandomYandere]", randFile);
    if (randFile.match(/ loli[\. ]/)?.length) continue;

    uploaded = findUpload(randFile);
    if (getDebugMode()) console.log("[uploaded sendRandomYandere]", uploaded);

    if (!uploaded) {
      uploaded = await uploadFile(getFilePath(randFile), randFile);
      break;
    }
  } while (!uploaded?.autumn_id || hasSent(uploaded.autumn_id, channel_id));

  const message = await channel.sendMessage({
    attachments: [uploaded.autumn_id],
  });

  const dbUpdate = await SentYandere.create({
    UploadedYandereId: uploaded.id,
    channel_id: message.channel_id,
  });

  uploaded.channel_ids.push(message.channel_id);
  dbCache.set(uploaded.autumn_id, uploaded);

  return { message, dbUpdate }
}

/**
 * @param {Subscriber} subscribed
 */
const applyInterval = (subscribed) => {
  subscribed.interval = setInterval(() => {
    if (getDebugMode()) console.log("[subscriber.interval] Sending pic to channel:", subscribed.channel_id);
    sendRandomYandere(subscribed.channel_id);
  }, SEND_DURATION);
  sendRandomYandere(subscribed.channel_id);
}

let initialized = false;

const yandereInit = async () => {
  if (initialized) return;

  const savedSettings = await UploadedYandere.findAll({
    include: [SentYandere]
  });

  const savedSubscribers = await YandereSubscriber.findAll();
  subscriberCache.push(...savedSubscribers.map(ss => ({ channel_id: ss.channel_id, interval: null })));
  if (getDebugMode()) console.log("[subscriberCache]", subscriberCache);

  for (const setting of savedSettings) {
    /**
     * @type {UploadedYandereSetting}
     */
    const toCache = {
      id: setting.id,
      filename: setting.filename,
      autumn_id: setting.autumn_id,
      channel_ids: setting.SentYanderes.map(st => st.channel_id),
    }

    if (getDebugMode()) console.log("[toCache yandereInit]", toCache.autumn_id, toCache);

    dbCache.set(toCache.autumn_id, toCache);
  }

  let initialTimer = 0;

  for (const subscribed of subscriberCache) {
    setTimeout(() => {
      applyInterval(subscribed);
    },initialTimer*1000);

    initialTimer+=20;
  }

  initialized = true;

  return subscriberCache;
}

const addSubscriber = async (channel_id) => {
  const alreadyInDb = await YandereSubscriber.findOne({
    where: { channel_id, },
  });
  if (alreadyInDb) return alreadyInDb;

  const dbres = await YandereSubscriber.create({
    channel_id,
  });

  /**
   * @type {Subscriber}
   */
  const subscribed = {
    channel_id,
    interval: null,
  }

  applyInterval(subscribed);
  subscriberCache.push(subscribed);
  console.log("[SUBSCRIBED] Channel", subscribed.channel_id, "subscribed from yandere subscription");
  return dbres;
}

const removeSubscriber = async (channel_id) => {
  const subscriber = await YandereSubscriber.findOne({
    where: {channel_id,},
  });

  if (!subscriber) return false;

  const id = subscriber.channel_id;
  await subscriber.destroy();

  const index = subscriberCache.findIndex(sub => sub.channel_id === id);
  if (index >= 0) {
    clearInterval(subscriberCache[index].interval);
    console.log("[UNSUBSCRIBED] Channel", subscriberCache[index].channel_id, "UNsubscribed from yandere subscription");
    subscriberCache.splice(index, 1);
  }

  return subscriber;
}

module.exports = {
  yandereInit,
  removeSubscriber,
  addSubscriber,
}
