import { sendMessage } from "./sendMessage";

const Spurwing = require("spurwing");
let sp = new Spurwing();
const chrono = require("chrono-node");

export default async function bookAppointment(message, args) {
    // command to book a new appointment
    let argsString = args.join(" ").split("-");
    argsString.shift();
    console.log(argsString);

    let date;
    if(argsString[0].startsWith("d")) {
        date = argsString[0].split(" ");
        date.shift();
        date.pop();
        date = date.join(" ");
        console.log(date);
    }
    
    let aptTypes = await sp.get_appointment_types(process.env.PID).catch(err => console.error(err));
    let appointmentTypeId = aptTypes[0].id;

    let dateFormatted = chrono.parseDate(date);
    // let email = args[3] || "no_email_specified";
    // let firstName = args[1] || "no_firstname_specified";
    // let lastName = args[2] || "no_lastname_specified";

    if(date) {
        await sp.complete_booking(process.env.PID, appointmentTypeId, "email@gmail.com", "firstName", "-", dateFormatted, "Discord Appointment")
        .catch(err => console.error(err));
    }
    else if(!date) {
        sendMessage(message.channel, "You must specify at least a date!");
    }

    return;
}