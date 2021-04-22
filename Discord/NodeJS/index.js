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
  msg.reply('\n```' + reply + '```')
});

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
    return 'Success!' + `\n\nSlot: ${moment(dt.getTime()).format('YYYY-MM-DD HH:mm Z')}`
  } catch (err) {
    if (err && err.response && err.response.data)
      return 'Error:\n' + err.response.data.message + `\n\nSlot: ${moment(dt.getTime()).format('YYYY-MM-DD HH:mm Z')}`
  }
}
async function fDaysAvail(cmd) {
  cmd = cmd.match(rDaysAvail)[1];
  if (!cmd) cmd = (new Date()).toISOString(); // use 'now' if no date provided
  let dt = chrono.parseDate(cmd);
  if (!dt) return ('Unable to interpret date from: ' + cmd);
  const days = await sp.get_days_available(config.PID, APTID, dt);
  if (days.days_available && days.days_available.length)
    return 'Available days in ' + dt.toLocaleString('en', {month:'long'}) + ':\n\n' + days.days_available.join('\n')
  else
    return 'no days available in ' + dt.toLocaleString('en', {month:'long'})
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
  if (slots.slots_available && slots.slots_available.length)
    return 'available slots on '+moment(dt.getTime()).format('YYYY-MM-DD HH:mm Z') +' :\n\n' + slots.slots_available.map(x=>x.date).join('\n');
  else
    return 'no slots available on ' + moment(dt.getTime()).format('YYYY-MM-DD HH:mm Z');
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

