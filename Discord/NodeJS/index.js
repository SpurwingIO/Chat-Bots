const Discord   = require('discord.js');
const config    = require('./config.js');
const chrono    = require('chrono-node');
const Spurwing  = require('spurwing');
const moment    = require('moment-timezone');

const sp = new Spurwing();
let APTID = config.APTID; // appointment type id
if (!APTID) {
  // load random aptid if none provided
  sp.get_appointment_types(config.PID).then(arr => {
    APTID=arr[0].id; // dynamically select some appointment type
    console.log(arr[0]);
  });
}

const prefix = '!';
const client = new Discord.Client();
client.login(config.token);
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

// regular expressions for commands
const rHelp = /^help$/;
const rBook = /^book (.+)$/;        // arg: datetime + email
const rDaysAvail = /^days( .+)?$/;   // arg: month (of date)
const rSlotsAvail = /^slots( .+)?$/; // arg: day (of date)
const rEmail = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

client.on('message', async function(msg) {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  const cmd = msg.content.slice(prefix.length);
  let reply;
  switch(true) {
    case rHelp.test(cmd):
      reply = fHelp()
      break;
    case rDaysAvail.test(cmd):
      reply = await fDaysAvail(cmd)
      break;
    case rSlotsAvail.test(cmd):
      reply = await fSlotsAvail(cmd)
      break;
    case rBook.test(cmd):
      reply = await fBook(cmd, msg.author.username)
      break;
    default:
      reply = ('Invalid command, unable to process.')
      break;
  }
  msg.channel.send(reply)
});

function fHelp() {
  return new Discord.MessageEmbed()
    .setColor('#40ff00')
    .setTitle('Available commands:')
    .addField('!days [date]', 'get available days in month of [date]', true)
    .addField('!slots [date]', 'get bookable slots on [date]', true)
    .addField('!book [slot] [@]', 'book appointment with [@] on [slot]', true)
    .setFooter('spurwing.io');
}
async function fBook(cmd, name) {
  cmd = cmd.match(rBook)[1];
  if (!rEmail.test(cmd)) return ('Missing or invalid email address');
  let args = cmd.match(/^(.+) (.+?@.+)$/);
  if (!args) return ('Missing date');
  let dt = chrono.parseDate(args[1])
  if (!dt) return ('Unable to interpret date from: ' + args[1]);
  let email = args[2].trim().toLowerCase();
  let out;
  try {
    out = await sp.complete_booking(config.PID, APTID, email, name, '-', dt, 'Discord Appointment')
    return new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Success!')
      .setDescription(`Slot: ${moment(dt.getTime()).format('YYYY-MM-DD HH:mm')}`+ '\n' + 'Timezone offset: ' + moment(dt.getTime()).format('Z'))
      .setFooter('spurwing.io');
  } catch (err) {
    if (err && err.response && err.response.data) {
      return new Discord.MessageEmbed()
        .setColor('#ff0033')
        .setDescription(`${err.response.data.message} \nSlot: ${moment(dt.getTime()).format('YYYY-MM-DD HH:mm')}`+ '\n' + 'Timezone offset: ' + moment(dt.getTime()).format('Z'))
        .setFooter('spurwing.io');
    } else {
      return new Discord.MessageEmbed()
        .setColor('#ff0033')
        .setDescription(`Error: ${err} \nSlot: ${moment(dt.getTime()).format('YYYY-MM-DD HH:mm')}`+ '\n' + 'Timezone offset: ' + moment(dt.getTime()).format('Z'))
        .setFooter('spurwing.io');
    }
  }
}
async function fDaysAvail(cmd) {
  cmd = cmd.match(rDaysAvail)[1];
  if (!cmd) cmd = (new Date()).toISOString(); // use 'now' if no date provided
  let dt = chrono.parseDate(cmd);
  if (!dt) return ('Unable to interpret date from: ' + cmd);
  const days = await sp.get_days_available(config.PID, APTID, dt);
  if (days.days_available && days.days_available.length) {
    const resp = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Days Available in '+dt.toLocaleString('en', {month:'long'})+':')
        .setFooter('spurwing.io');

    let L = days.days_available.length;
    resp.addField('\u200B', days.days_available.slice(0, Math.floor(L/3)).join('\n'), true)
    resp.addField('\u200B', days.days_available.slice(Math.floor(L/3), Math.floor(L/3*2)).join('\n'), true)
    resp.addField('\u200B', days.days_available.slice(Math.floor(L/3*2)).join('\n'), true)
    
    return resp;
  } else {
    const resp = new Discord.MessageEmbed()
        .setColor('#ffb300')
        .setDescription('No Days Available in '+dt.toLocaleString('en', {month:'long'}))
        .setFooter('spurwing.io');
    return resp;
  }
}
async function fSlotsAvail(cmd) {
  cmd = cmd.match(rSlotsAvail)[1];
  if (!cmd) cmd = (new Date()).toISOString(); // use 'now' if no date provided
  let dt = chrono.parseDate(cmd);
  if (!dt) return ('Unable to interpret date from: ' + cmd);

  // if timezone provided try extracting it
  let dtx = chrono.parse(cmd);
  let tz = null; // timezone used for returning relative time slots
  if (dtx[0].start && dtx[0].start.knownValues && dtx[0].start.knownValues.timezoneOffset) {
    let offset = -dtx[0].start.knownValues.timezoneOffset;
    tz = tzMap.get(offset)
    tz = tz.values().next().value
  }
  const slots = await sp.get_slots_available(config.PID, APTID, dt, dt, false, tz);
  if (slots.slots_available && slots.slots_available.length) {
    const resp = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Slots Available on '+moment(dt.getTime()).format('YYYY-MM-DD')+':')
        .setDescription('Timezone offset: ' + moment(dt.getTime()).format('Z'))
        .setFooter('spurwing.io');

        console.log(slots.slots_available)
    slots.slots_available = slots.slots_available.map(i=>i.date.split(' ')[1].slice(0,5));

    let L = slots.slots_available.length;
    resp.addField('\u200B', slots.slots_available.slice(0, Math.floor(L/3)).join('\n'), true)
    resp.addField('\u200B', slots.slots_available.slice(Math.floor(L/3), Math.floor(L/3*2)).join('\n'), true)
    resp.addField('\u200B', slots.slots_available.slice(Math.floor(L/3*2)).join('\n'), true)
    
    return resp;
  } else {
    const resp = new Discord.MessageEmbed()
        .setColor('#ffb300')
        .setDescription('No Slots Available on '+moment(dt.getTime()).format('YYYY-MM-DD') + '\n' + 'Timezone offset: ' + moment(dt.getTime()).format('Z'))
        .setFooter('spurwing.io');
    return resp;
  }
}

// mapping offsets to timezones:
const tzMap = new Map();
for (const name of moment.tz.names()) {
  const offsets = moment.tz.zone(name).offsets;
  
  for (const offset of offsets) {
      if (!tzMap.has(offset)) {
          tzMap.set(offset, new Set());
      }
      tzMap.get(offset).add(name);
  }
}

// testing stuff
// fDaysAvail('days april 22').then(console.log);
// fSlotsAvail('slots tomorrow 10am edt').then(console.log);
// fBook('book 2021-04-23 03:00:00 -0400 ilya@nevolin.be').then(console.log)

