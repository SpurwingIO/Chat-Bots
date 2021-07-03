#!/usr/bin/env python
# coding: utf-8
from spurwing import Client as sp
from flask import Flask, request
import requests
from twilio.twiml.messaging_response import MessagingResponse
from datetime import date
from datetime import timedelta
from dateparser import parse
from timefhuman import timefhuman

app = Flask(__name__)

PID = '';
KEY = '';

appointTypes = sp.get_appointment_types(PID)
appointment_type_id = appointTypes[0]['id']


def printDate(days, msg):
    msg.body("Available Days for schedualing:\n")
    msg.body(str(days['days_available']))
    msg.body('spurwing.io')
    responded = True
    return

@app.route('/bot', methods=['POST'])
def bot():
    incoming_msg = request.values.get('Body', '').lower()
    resp = MessagingResponse()
    msg = resp.message()
    responded = False
    if 'help' in incoming_msg:
        helpCommand = "Commands:\n.days[date]:get available days in month of [date]\n.slots [date]: get bookable slots on [date]\n.book [slot] [@]: .book appointment with [@] on [slot] spurwing.io"
        msg.body(helpCommand)
        responded = True
        
    if '.days' in incoming_msg:
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
                days_output = sp.get_days_available(PID, appointment_type_id, date_from_month = date_input)
                printDate(days_output,msg)
                responded = True
    
    if '.slots' in incoming_msg:
        cmd=incoming_msg.split()
        time_request=cmd[1:]
        nowday = date.today()
        dt=timefhuman(time_request, now=nowday).strftime("%Y/%m/%d")
        slots_available = sp.get_slots_available(PID, appointment_type_id,dt,dt)
        length=len(slots_available['slots_available'])
        if (length!= 0):
            msg.body('Days Available in '+dt+':\n')
            for x in range(length):
                string=slots_available['slots_available'][x]['date'].split()
                msg.body(string[1][0:5]+"\n")
            msg.body('spurwing.io')
        else:
            msg.body('NO days Available in '+dt)
        responded = True
        
    if '.book' in incoming_msg:
        cmd = incoming_msg.split()
        if(len(cmd) != 4):
            msg.body('Invalid command format please input like .book 2021-7-7 20:45 test@spurwing.io')
        else:
            parsed = parse(str(cmd[1:3]))
            email=str(cmd[3])
            datetime =str(parsed.year) + '-' + str(parsed.month) + '-' + str(parsed.day)
            slots = sp.get_slots_available(PID, appointment_type_id, datetime, datetime)
            slots_available=[]
            for x in range(len(slots['slots_available'])):
                slotObj = slots['slots_available'][x]['date']
                time= slotObj.split()
                slots_available.append(time[1])
            if(parsed.strftime('%H:%M:%S') in slots_available):
                slot =parsed.strftime('%Y-%m-%d %H:%M:%S')+" -0700"
                apt = sp.complete_booking(PID, appointment_type_id, email, 'appt', 'book', date=slot, contact_type='My Contact Type')
                msg.body('appointment booked successfully on '+str(parsed))
            else:
                msg.body("no time available on "+str(parsed))
        responded = True
    
    if not responded:
        msg.body('Avaliable Commands:\n!days[date]:get available days in month of [date]\n!slots [date]: get bookable slots on [date]\n!book [slot] [@]: book appointment with [@] on [slot]')
    return str(resp)


if __name__ == '__main__':
    app.run()

