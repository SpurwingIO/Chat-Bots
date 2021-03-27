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

if (!APP_SECRET.length || !ACCESS_TOKEN.length || !CALLBACK_USER_TOKEN.length)
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

router.post('/spurwing-fbbot/', (req, res) => {
  verifyRequestSignature(req, res)
  for (const e of req.body.entry) {
    if (e.messaging)
      for (const m of e.messaging) {
        fb_msg_process(m.sender.id, m.message)
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

function fb_msg_process(senderId, msg) {
  console.log(msg) // text, quick_reply.payload
  let resp = {text: "I don't know what you mean :("}
  if (msg && msg.text && msg.text.toLowerCase() === "start") {
    resp = {
      text: "What's your choice?",
      quick_replies:[{
        content_type: "text",
        title: "Today",
        payload: "answer:0",
      },{
        content_type: "text",
        title: "Tomorrow",
        payload: "answer:1",
      }]
    }
  }
  fb_msg_reply(senderId, resp)
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
