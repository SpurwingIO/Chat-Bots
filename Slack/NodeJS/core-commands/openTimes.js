const Spurwing = require("spurwing");
let sp = new Spurwing();
const chrono = require("chrono-node");
import { sendEmbed, sendMessage } from "./sendMessage.js";

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
    var slots;
    if(!isNaN(args[0])) {
        slots = await sp.get_slots_available(PID, APTID, dateNow(), dateLater(args[0]));
    } else if(isNaN(args[0])) {
        // chrono needs to parse a string not an array so we have to join
        let argsString = args.join(" ");
        let date = chrono.parseDate(argsString);
        slots = await sp.get_slots_available(PID, APTID, date, date);
    } else {
        sendMessage(message.channel, "I didn't quite understand what you meant there, please try again or use !help for more information.");
    }
    let dates = [];

    // This is an awful way to do this.
    for(let i = 0; i < slots.slots_available.length; i++) {
        let date = slots.slots_available[i].date.split(" ");
        //date.splice(2,1); // commented out to add in timezone stamp
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
