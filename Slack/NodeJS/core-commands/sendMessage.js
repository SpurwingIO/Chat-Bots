import { WebClient } from '@slack/web-api';
require('dotenv').config();

const web = new WebClient(process.env.TOKEN);

async function sendMessage(channel, message) {
    await web.chat.postMessage({
        channel,
        text: message,
    })
}

async function sendEmbed(channel, embed) {
    await web.chat.postMessage({
        channel,
        blocks: embed,
    })
}

export { sendMessage, sendEmbed };