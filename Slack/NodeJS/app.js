import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
require('dotenv').config();

const rtm = new RTMClient(process.env.TOKEN);
const web = new WebClient(process.env.TOKEN);

async function sendMessage(channel, message) {
    await web.chat.postMessage({
        channel,
        text: message,
    })
}

rtm.start()
    .catch(console.error);

rtm.on('ready', async () => {
    console.log('Bot is online!');
    sendMessage('chat-bot', 'Bot is now online.');
});