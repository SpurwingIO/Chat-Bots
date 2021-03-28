const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const crypto = require('crypto');
const request = require('request');
const app = express();
const port = 1525;

const config = require('./config.js')
const APP_SECRET = config.APP_SECRET;
const ACCESS_TOKEN = config.ACCESS_TOKEN;
const CALLBACK_USER_TOKEN = config.CALLBACK_USER_TOKEN;
const PID = config.PID; // Spurwing provider id
const APTID = config.APTID; // Spurwing appointment type id from: sp.get_appointment_types(PID)

if (!APP_SECRET.length || !ACCESS_TOKEN.length || !CALLBACK_USER_TOKEN.length || !PID.length || !APTID.length)
  throw 'invalid config values';

app.use(cors())
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))
app.use(express.urlencoded({ extended: true }));
const router = express.Router();

router.get('/spurwing-fbbot/', (req, res) => {
    const chal = req.query['hub.challenge'];
    const tok  = req.query['hub.verify_token'];
    if (tok === CALLBACK_USER_TOKEN) {
      res.send(chal)
    } else {
      res.send('error')
    }
});

router.post('/spurwing-fbbot/', async (req, res) => {
  verifyRequestSignature(req, res)
  // console.log(JSON.stringify(req.body))
  for (const e of req.body.entry) {
    if (e.messaging)
      for (const m of e.messaging) {
        await fb_msg_process(m.sender.id, m.message)
      }
  }
  res.send({success:1})
});

app.use(router);
app.listen(port, () => console.log(`Spurwing-fbbots listening on port ${port}!`))


function verifyRequestSignature(req, res) {
  const expectedSignature = "sha1=" +
    crypto.createHmac("sha1", APP_SECRET)
      .update(req.rawBody)
      .digest("hex");
  if (req.headers["x-hub-signature"] !== expectedSignature)
    throw new Error("Invalid signature.");
}

const Spurwing = require('spurwing');
const moment = require('moment');
let sp = new Spurwing();

async function fb_msg_process(senderId, msg) {
  // console.log(msg) // text, quick_reply.payload
  
  let resp = {text: "I don't know what you mean :("}

  if (msg && msg.text) {
    let text = msg.text.toLowerCase();
    if (msg.quick_reply && msg.quick_reply.payload)
      text = msg.quick_reply.payload;

    switch(true) {
      case /^book$/.test(text):
        resp = await fb_msg_process_funcs.book(text);
        break;
      case /^book_day:.+$/.test(text):
        resp = await fb_msg_process_funcs.book_day(text);
        break;
      case /^book_slot:.+$/.test(text):
        resp = await fb_msg_process_funcs.book_slot(text);
        break;
    }  
  }

  fb_msg_reply(senderId, resp)
}
const fb_msg_process_funcs = {

  // all dates are relative to server's timezone
  // the user may be in a different timezone
  // facebook can provide user timezone: under advanced messaging features

  book: async function(text) {
    const days = [];
    let B = await sp.get_days_available(PID, APTID, moment().format('YYYY-MM-DD'));
    days.push(...B.days_available.slice(0, 3));
    if (days.length < 3) {
      B = await sp.get_days_available(PID, APTID, moment().add(1, 'months').format('YYYY-MM-DD'));
      days.push(...B.days_available.slice(0, 3-days.length ));
    }
    const quick_replies = [];
    for (const day of days) {
      quick_replies.push({
        content_type: "text",
        title: day,
        payload: "book_day:" + day,
      })
    }
    return {
      text: "When would you like to book?",
      quick_replies: quick_replies,
    }
  },

  book_day: async function(text) {
    const answer = text.split('book_day:')[1];
    let C = await sp.get_slots_available(PID, APTID, answer, answer)
    if (! C.slots_available.length) {
      return {text: 'There are no time slots available on that day :/'};
    }
    const quick_replies = [];
    for (const slot of C.slots_available.slice(0,5)) {
      quick_replies.push({
        content_type: "text",
        title: moment(slot.date.replace(' +', '+').replace(' -', '-')).format('hh:mm A'),
        payload: "book_slot:" + slot.date,
      })
    }
    return {
      text: "Select your preferred time slot:",
      quick_replies: quick_replies,
    }
  },

  book_slot: async function(text) {
    const answer = text.split('book_slot:')[1];    
    try {
      await sp.complete_booking(PID, APTID,
          'ilya_test@nevolin.be', 'Ilya', 'Nevo',
          answer,
          'Test Facecbook booking'
        );
      return { text: "Success!" }
    } catch (err) {
      console.log(err)
      return { text: "Error :( " }
    }
  },
}

function fb_msg_reply(senderId, response) {
  request({
    url: 'https://graph.facebook.com/v10.0/me/messages',
    qs: { access_token: ACCESS_TOKEN },
    method: "POST",
    json: { recipient: { id: senderId }, message: response }
  }, function(error, response, body) {
    if (error)
      console.log("sending error", error);
    else if (response.body.error)
      console.log("response body error", response.body);
  });
}
