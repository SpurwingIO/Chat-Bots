import { sendEmbed } from "./sendMessage.js";

export default function help(message, args) {
    let slackEmbed = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `
!opentimes <days from current time> -> shows the open time slots, default 1 day
\`\`\`
Example:
!opentimes 2 -> message should contain all open time slots in the next 2 days
\`\`\`

!book <slot> <firstname> <lastname> <email> -> books an appointment from firstname lastname email on slot
                    `
                }
            }
        ]
    }

    sendEmbed(message.channel, slackEmbed.blocks);
    return;
}