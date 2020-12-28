#!/usr/bin/env node
if (process.argv.length < 5 || process.argv.length > 7) {
  console.log('Usage : rbot <host> <port> <name> [<password>] [<master>]');
  process.exit(1);
}
const mineflayer = require('mineflayer');
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
const navigate2Plugin = require('./avoidBedrock.js')(mineflayer);
const async = require('async');
const bot = mineflayer.createBot({
  username: process.argv[4],
  verbose: true,
  port: parseInt(process.argv[3]),
  host: process.argv[2],
  password: process.argv[5],
  auth: 'microsoft',
});

navigatePlugin(bot);
navigate2Plugin(bot);
bot.loadPlugin(blockFinderPlugin);
const task = require('./task');
const achieve = require('./achieve');

bot.loadPlugin(() => {
  task.init(
    bot,
    achieve.achieve,
    achieve.achieveList,
    achieve.processMessage,
    async
  );
  achieve.init(
    task.all_task.tasks,
    task.all_task.giveUser,
    task.all_task.parameterized_alias,
    task.all_task.alias,
    task.all_task.stringTo,
    bot,
    process.argv[6]
  );
});

bot.on('error', (err) => {
  console.log(err);
});

bot.on('login', function () {
  console.log('I logged in.');
  console.log('settings', bot.settings);
});

bot.on('spawn', function () {
  console.log('game', bot.game);
});
bot.on('death', function () {
  bot.chat('I died x.x');
});

bot.on('chat', function (username, message) {
  achieve.processMessage(message, username, function (err) {
    if (!err)
      bot.chat('I ' + (!err ? 'achieved' : 'failed') + ' task ' + message);
  });
});

bot.navigate.on('pathFound', function (path) {
  console.log('found path. I can get there in ' + path.length + ' moves.');
});
bot.navigate.on('cannotFind', function () {
  console.log('unable to find path');
});

bot.on('health', function () {
  console.log('I have ' + bot.health + ' health and ' + bot.food + ' food');
});

bot.on('playerJoined', function (player) {
  console.log('hello, ' + player.username + '! welcome to the server.');
});
bot.on('playerLeft', function (player) {
  console.log('bye ' + player.username);
});
bot.on('kicked', function (reason) {
  console.log('I got kicked for', reason, 'lol');
});

bot.on('nonSpokenChat', function (message) {
  console.log('non spoken chat', message);
});
