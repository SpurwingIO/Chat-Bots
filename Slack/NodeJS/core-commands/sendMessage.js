import { WebClient } from '@slack/web-api';
require('dotenv').config();

const web = new WebClient(process.env.TOKEN);

export default async function sendMessage(channel, message) {
    await web.chat.postMessage({
        channel,
        text: message,
    })
}