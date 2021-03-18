import json
import discord
from discord.ext import commands

# JSON load
def load_db():
    with open('db.json') as db:
        return json.load(db)
    
# Load database
db = load_db()

# Bot declaration
client = discord.Client()
bot = commands.Bot(commands_prefix='$')

@bot.command()
async def test(ctx, arg):
    await ctx.send(arg) 

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('!help'):
        await message.channel.send('Commands:')
        
#client.run(db['token'])
bot.run(db["token"])
