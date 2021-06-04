import { sendEmbed } from "./sendMessage.js";

export default function help(message, args) {
    let slackEmbed = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `
!opentimes <days from current time (must be int)> -> shows the open time slots, default 1 day
!opentimes <date> -> shows open slots on a certain date
\`\`\`
Example:
!opentimes 2 -> message should contain all open time slots in the next 2 days
!opentimes june 7 -> message should contain all open time slots on june 7th
\`\`\`

!book -d <slot> -n <firstname> <lastname> -> books an appointment from firstname lastname email on slot, sends you the appointment ID in private messages.
\`\`\`
Example:
!book -d june 1 5pm edt -n Lorem ipsum -> books an appointment from lorem ipsum on june 1 5pm edt.
(Appointment id should look something like this: d5e2cfeb-c263-4091-8a04-2358b439eeb9)
\`\`\`

!cancel <appointment ID> -> cancels an appointment made.
\`\`\`
Example:
!cancel d5e2cfeb-c263-4091-8a04-2358b439eeb9 -> should confirm a cancellation.
\`\`\`
                    `
                }
            }
        ]
    }

    sendEmbed(message.channel, slackEmbed.blocks);
    return;
}