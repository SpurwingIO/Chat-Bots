#!/usr/bin/env python
# coding: utf-8

# In[ ]:


from flask import Flask, request
import requests
from twilio.twiml.messaging_response import MessagingResponse

app = Flask(__name__)


@app.route('/bot', methods=['POST'])
def bot():
    incoming_msg = request.values.get('Body', '').lower()
    resp = MessagingResponse()
    msg = resp.message()
    responded = False
    if 'help' in incoming_msg:
        helpCommand = "Commands:\n!days[date]:get available days in month of [date]\n!slots [date]: get bookable slots on [date]\n!book [slot] [@]: book appointment with [@] on [slot]"
        msg.body(helpCommand)
        responded = True
    if not responded:
        msg.body('Avaliable Commands:\n!days[date]:get available days in month of [date]\n!slots [date]: get bookable slots on [date]\n!book [slot] [@]: book appointment with [@] on [slot]')
    return str(resp)


if __name__ == '__main__':
    app.run()

