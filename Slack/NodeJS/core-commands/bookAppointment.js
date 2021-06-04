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
    let firstName, lastName = "not_specified";

    for(let i = 0; i < argsString.length; i++) {
        if(argsString[i].startsWith("n")) {
            let name = argsString[i].split(" ");
            name.shift();
            if(name[0]) firstName = name[0];
            if(name[1]) lastName = name[1];
            else {
                sendMessage(message.channel, "Your input is invalid! Please check !help for usage instructions.");
            }
            console.log(firstName, lastName);
        }

        if(argsString[i].startsWith("d")) {
            date = argsString[i].split(" ");
            date.shift();
            date = date.join(" ");
            console.log(date);
        }
    }
    
    let dateFormatted = chrono.parseDate(date);
    let aptTypes = await sp.get_appointment_types(process.env.PID).catch(err => console.error(err));
    let appointmentTypeId = aptTypes[0].id;


    // if you want to add emails, please just add a regex for it in that loop above.
    if(date) {
       let book =  await sp.complete_booking(process.env.PID, appointmentTypeId, "email@email.email", firstName, lastName, dateFormatted, "Discord Appointment")
       .catch(err => console.error(err));
       sendMessage(message.user, `Booked! Your appointment ID is ${book.appointment.id}`);
       sendMessage(message.channel, `Booked! You should have an appointment ID in your private messages.`);
    }
    else if(!date) {
        sendMessage(message.channel, "You must specify at least a date!");
    }

    return;
}