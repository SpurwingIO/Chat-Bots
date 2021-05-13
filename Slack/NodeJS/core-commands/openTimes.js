const Spurwing = require("spurwing");
let sp = new Spurwing();
import { sendEmbed } from "./sendMessage.js";

const PID = process.env.PID;
//const APIKEY = config.APIKEY;
var APTID = sp.get_appointment_types(PID).then(arr => {
    APTID=arr[0].id;
    console.log(arr[0]);
});

function dateNow() {
    let d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}
  
function dateLater(days) {
    let d = new Date();
    // if the amount of days is not specified return tomorrow's slots
    if(!days || isNaN(days)) {
        d.setDate(d.getDate() + 1);
    }
    else {
        d.setDate(d.getDate() + Number(days));
    }
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

export default async function openTimes(message, args) {
    // command to show available times.
    const slots = await sp.get_slots_available(PID, APTID, dateNow(), dateLater(args[0]));
    let dates = [];

    // This is an awful way to do this.
    for(let i = 0; i < slots.slots_available.length; i++) {
        let date = slots.slots_available[i].date.split(" ");
        date.splice(2,1);
        dates.push(date);
    }
    
    for(let i = 0; i < dates.length; i++) {
        dates[i].push("\n");
        dates[i] = dates[i].join(" ");
    }

    let dateString = dates.join("");

    let slackEmbed = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${dateString}`
                }
            }
        ]
    }

    sendEmbed(message.channel, slackEmbed.blocks);
    console.log(dates);
    return;
}