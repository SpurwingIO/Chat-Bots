const Spurwing = require("spurwing");
let sp = new Spurwing();

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
  
function  dateTomorrow() {
    let d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

export default async function openTimes(message, args) {
    // command to show available times.
    const slots = await sp.get_slots_available(PID, APTID, dateNow(), dateTomorrow());
    console.log(slots);
    return;
}