import os
import discord
from discord.ext import commands
from spurwing import Client as sp
import dateparser

client = discord.Client()
PID = 'PID'
KEY = 'KEY'
appointTypes = sp.get_appointment_types(PID)
appointment_type_id = appointTypes[0]['id']

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.lower().startswith('!help'):
        await message.channel.send('Commands:')
        await message.channel.send('To book an appointment: !Appointment MM/DD/YYYY')
        await message.channel.send('To see booked appointments type in !booked')

    if message.content.lower().startswith('!adays'):
        await message.channel.send('Available Days for scheduling')
        days = sp.get_days_available(PID, appointment_type_id)
        for x in range(5):
            if x > len(days['days_available']):
                break
            await message.channel.send(days['days_available'][x])

    if message.content.lower().startswith('!aslots'):
        cmd = message.content.split()
        if(len(cmd) != 3):
            await message.channel.send('Invalid command format')
            await message.channel.send('Please enter !aslots followed by start date and end date in form MM/DD/YYYY')
            return
        date1 = cmd[1]
        date2 = cmd[2]
        parsed = dateparser.parse(date1)
        if parsed == None:
            await message.channel.send('Unable to parse start date.')
        parsed2 = dateparser.parse(date2)
        if parsed2 == None:
            await message.channel.send('Unable to parse end date.')
        start = str(parsed.year) + '-' + str(parsed.month) + '-' + str(parsed.day)
        end = str(parsed2.year) + '-' + str(parsed2.month) + '-' + str(parsed2.day)
        slots = sp.get_slots_available(PID, appointment_type_id, start, end)
        if(len(slots['slots_available']) == 0):
            return
        for x in range(5):
            if x > len(slots['slots_available']):
                return
            await message.channel.send(slots['slots_available'][x]['date'])

    if message.content.lower().startswith('!booked'):
        booked = sp.list_appointments(KEY, 1000, 0)
        if(booked['data']['appointmentsCount'] == 0):
            await message.channel.send('No Appointments.')
        else:
            for i in range(booked['data']['appointmentsCount']):
                await message.channel.send(booked['data']['appointments'][i])
    
    if message.content.lower().startswith('!appointment'):
        cmd = message.content.split(" ", 1)
        if(len(cmd) != 2):
            await message.channel.send('Invalid command format')
            return
        parsed = dateparser.parse(cmd[1])
        if parsed == None:
            await message.channel.send('Invalid Date format')
            return
        date =  str(parsed.year) + '-' + str(parsed.month) + '-' + str(parsed.day)
        slots = sp.get_slots_available(PID, appointment_type_id, date, date)
        for x in range(len(slots['slots_available'])):
            slotObj = slots['slots_available'][x]['date']
            time = slotObj.split()
            if(time[1] == parsed.strftime('%H:%M:%S')):
                slot = slots['slots_available'][x]['date']
                apt = sp.complete_booking(PID, appointment_type_id, 'test@spurwing.io', 'appt', 'book', date=slot, contact_type='My Contact Type')
                await message.channel.send('appointment booked successfully')
                return
        await message.channel.send('Unable to book appointment.')
        
            
              
        
            

            
        
client.run('TOKEN')

