#!/usr/bin/env python
# coding: utf-8

# In[ ]:


from spurwing import Client as sp
from flask import Flask, request
import requests
from twilio.twiml.messaging_response import MessagingResponse
from datetime import date
from datetime import timedelta
from dateparser import parse

app = Flask(__name__)

PID = 'b969d2e9-a2e4-42dd-88aa-d3384adaf1fa';
KEY = 'e7dc4e2b222d55a0ae352d4de56ba5c137e78b77e4a31ee90007c4acfd02462c';

appointTypes = sp.get_appointment_types(PID)
appointment_type_id = appointTypes[0]['id']

def dateTomorrow():
    dt = date.today() + timedelta(days=1) 
    return dt.strftime("%Y/%m/%d")

def printDate(days, msg):
    msg.body("Available Days for schedualing: ")
    msg.body(str(days['days_available']))
    responded = True
    return

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
        
    if '!days' in incoming_msg:
        cmd_days = incoming_msg.split()
        length = len(cmd_days)
        if length == 1:
            days = sp.get_days_available(PID, appointment_type_id)
            printDate(days, msg)
            responded = True
        elif length > 1:
            date_cmd = cmd_days[1::]
            date_string = " ".join(date_cmd)
            date_input = parse(date_string)
            if date_input is None:
                msg.body('Unable to interpret date from: ' + incoming_msg)
                responded = True
            else:
                date_input = date_input.strftime("%Y/%m/%d")
                days_input1 = sp.get_days_available(PID, appointment_type_id, date_from_month = date_input)
                printDate(days_input1,msg)
                responded = True
    
    if '!slots' in incoming_msg:
        #start = date.today().strftime("%Y/%m/%d")
        cmd = incoming_msg.split()
#         start = (date.today() + timedelta(days=1)).strftime("%Y/%m/%d")
#         end = (date.today() + timedelta(days=2)).strftime("%Y/%m/%d")
#         C = sp.get_slots_available(PID, appointment_type_id, start, end)
#         msg.body(C['slots_available'][5]['date']) 

        msg.body(" ".join(cmd))
        responded = True
    
    if not responded:
        msg.body('Avaliable Commands:\n!days[date]:get available days in month of [date]\n!slots [date]: get bookable slots on [date]\n!book [slot] [@]: book appointment with [@] on [slot]')
    return str(resp)


if __name__ == '__main__':
    app.run()

