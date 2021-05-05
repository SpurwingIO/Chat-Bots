import { RTMClient } from '@slack/rtm-api';
require('dotenv').config();

// command function imports
import sendMessage from './core-commands/sendMessage.js';
import bookAppointment from './core-commands/bookAppointment.js';
import openTimes from './core-commands/openTimes.js';

const PREFIX = process.env.PREFIX;

const rtm = new RTMClient(process.env.TOKEN);

// commands
rtm.on('message', async message => {
    console.log(message); // debug

    // pull the prefix, command names and args
    if(!message.text.startsWith(`${PREFIX}`)) return;
    let args = message.text.slice(PREFIX.length).trim().split(/ +/);
    let commandName = args.shift().toLowerCase();

    // commands list on message
    switch(commandName) {
        case `ping`:
            return sendMessage(message.channel, 'pong');

        // below commands are not made yet but will be implemented soon.
        case `book`:
            return bookAppointment(message, args);
        case `cancel`:
            return cancelAppointment(message, args);
        case `opentimes`:
            return openTimes(message, args);
        // above commands are not made yet but will be implemented soon.
    }
});

// start the rtm connection
rtm.start()
    .catch(console.error);

// notify when the bot is started in the botspam channel, mainly for debug
rtm.on('ready', async () => {
    console.log('Bot is online!');
    sendMessage('chat-bot', 'Bot is now online.');
});