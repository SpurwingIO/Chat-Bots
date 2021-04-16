import { RTMClient } from '@slack/rtm-api';
require('dotenv').config();
import sendMessage from './core-commands/sendMessage.js';

const PREFIX = '!';

const rtm = new RTMClient(process.env.TOKEN);

// commands
rtm.on('slack_event', async (eType, e) => {
    console.log(e); // debug
    console.log(eType); // debug

    // commands list on message
    if(e && e.type === 'message') {
        switch(e.text) {
            case `${PREFIX}hi`:
                return sendMessage(e.channel, `Hello <@${e.user}>`);
        }
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