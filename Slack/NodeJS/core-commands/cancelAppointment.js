import { sendMessage } from "./sendMessage";

const Spurwing = require("spurwing");
let sp = new Spurwing();

export default async function cancelAppointment(message, args) {
    // function to cancel an already made appointment
    console.log(message)
    await sp.delete_appointment(process.env.APIKEY, args[0]).catch(err => console.error(err));
    sendMessage(message.channel, "Your appointment has been cancelled.");
    return;
}