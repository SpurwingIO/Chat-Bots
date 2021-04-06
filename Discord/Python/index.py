import os
import discord
from discord.ext import commands
from spurwing import Client as sp


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
        #TO ADD: Date parse to input to get correct slots.
        slots = sp.get_slots_available(PID, appointment_type_id, '2021-04-06', '2021-04-07')
        for x in range(5):
            if x > len(slots['slots_available']):
                break
            await message.channel.send(slots['slots_available'][x]['date'])
            
    
    if message.content.lower().startswith('!booked'):
        booked = sp.list_appointments(KEY, 1000, 0)
        if(booked['data']['appointmentsCount'] == 0):
            await message.channel.send('No Appointments.')
        else:
            for i in range(booked['data']['appointmentsCount']):
                await message.channel.send(booked['data']['appointments'][i])
    
    if message.content.lower().startswith('!appointment'):
        cmd = message.content.split()
        if(len(cmd) < 2 or len(cmd) > 2):
            await message.channel.send('Invalid Appointment Schedule')
            await message.channel.send('To make an appointment, please enter as !Appointment MM/DD/YYYY')
            return
        else:
            date = cmd[1]
            MonDayYear = date.split('/')
            if(len(MonDayYear) != 3):
                await message.channel.send('Invalid Date format. Enter as MM/DD/YYYY')
                return
            try:
                Month = int(MonDayYear[0])
                if(Month < 1 or Month > 12):
                    await message.channel.send('Invalid Month. Month values can only by 1-12')
                    return
                Day = int(MonDayYear[1])
                if(Day < 1 or Day > 31):
                     await message.channel.send('Invalid Day. Day values can only by 1-31')
                     return
                Year = int(MonDayYear[2])
                if(len(str(Year)) != 4):
                    await message.channel.send('Invalid Year. Years are 4 digits long')
                    return
            except:
                await message.channel.send('Invalid Date format. Enter as MM/DD/YYYY')
                return
            await message.channel.send('Appointment to be booked for:')
            await message.channel.send(date)
            #TO DO: Add actual scheduling into Spurwing API
            
        
client.run('TOKEN')
