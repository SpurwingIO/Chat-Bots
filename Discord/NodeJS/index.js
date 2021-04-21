const Discord = require('discord.js');
const config = require('./config.js')
const chrono = require('chrono-node');

const client = new Discord.Client(); 
const prefix = '!';

//event listeners based on client 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

const rBook = /^book (.+)$/;        // arg: date + time
const rDaysAvail = /^days (.+)$/;   // arg: month (of date)
const rSlotsAvail = /^slots (.+)$/; // arg: day (of date)

client.on('message', function(msg) {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  const cmd = msg.content.slice(prefix.length);
  switch(true) {
    case rDaysAvail.test(cmd):
      let arg = cmd.match(rDaysAvail)[1];
      let dt = chrono.parseDate(arg);
      if (!dt) return msg.reply('Unable to interpret date from: ' + arg);
      console.log(dt)
      msg.reply("dt:"+ dt)
      break;
    case rSlotsAvail.test(cmd):
      break;
    case rBook.test(cmd):
      break;
    default:
      msg.reply('Invalid command, unable to process.')
      break;
  }
  // message.reply
});

client.login(config.token);