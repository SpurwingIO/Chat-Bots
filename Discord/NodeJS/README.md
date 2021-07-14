# Discord Scheduling Bot for Business
A NodeJS implementation of an appointment scheduling and calendar management bot using the Spurwing API.

Discord has for many years been popular in the gaming community. But due to the explosion of **Remote Work** and **Work From Home** opportunities, it's strongly competing in the **business** world with tools like Slack, Google and Zoom.

[![discord scheduling bot for business](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7lu7t408wmm6swpw5sw4.png)](https://www.youtube.com/watch?v=e5SpHXVMlKw)

YouTube Demo: https://www.youtube.com/watch?v=e5SpHXVMlKw

You can join our Discord server and try this bot yourself: https://discord.gg/j3gd5Qk5uW

## Intro
We love Discord at Spurwing, it provides all features we need for free: text and voice channels, video calls, video conferencing, screen sharing and recently the addition of stage channels. You can emulate an **office experience** with these channels, an ideal solution for a conservative managers.

On top of that it provides a superb API, developer community and resources for building bots and automation solutions. The business of **scheduling appointments** and **managing calendars** is a complex one, fortunately Spurwing helps simplify and streamline just that.

## Bot summary
A discord bot is a piece of code that listens to text (or voice) data and can then respond however you program it. The easiest way to call/use a bot is to use a prefix character like `!` or `*`. To see all available commands we can enter `!help`:

![appointment scheduling discord bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f9c1utu8bkcavh07d669.png)

The first command we encounter is `!days [date]` which will give all available days in the month of `[date]`. Omitting this parameter will use the current month. You can also use keywords like `today`, `next month`, `March 2021`, etc. We use a great NLP Library [chrono](https://github.com/wanasit/chrono) which is capable of interpreting casual text into JavaScript DateTime objects:

![appointment scheduling discord bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/x81awgg4dccoo2uwzaap.png)

The second command we can use is `!slots [date]`. This returns a list of bookable slots on our calendar:
 
![appointment scheduling discord bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hsopy0jak4y3dycsy1eh.png)

Do note that these slots contain a timezone offset `+0200` which means GMT+2. This timezone depends the local time of the machine hosting your bot. But we can also provide a custom timezone or offset to see the times relative to your own location:

![appointment scheduling discord bot timezone](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0l0skt41jl1quhk3rohy.png)

If there are no bookable slots available for a certain date then you'll receive an error message:

![appointment scheduling discord bot time zones](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g3b05f6yt197950d731y.png)

Now that we are able to find bookable slots, we can start scheduling appointments using our third command `!book [slot] [@email]`. You can use one of the slots as `[slot]` argument or provide a custom Date and Time, as long as it will evaluate to valid and bookable slot:

![appointment booking discord bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dnzqjvdti0s3vm4v5fbc.png)

Once again if booking fails you will be given an error:

![appointment booking discord bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ii7xjsaj329vuqgg1daw.png)

These three simple commands allows Discord users to schedule simple 1-on-1 appointments with you. In the next sections we'll explain how to install and configure this bot, but also how to customize it for 1-to-many appointments and incorporate multiple calendars.

### Requirements
- NodeJS v12.x or v14.x is highly recommended
- If you don't have a Discord Bot yet, follow step 1 of this [tutorial](https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js) to obtain your bot's token and adding the bot to your Discord server.

### Installation
1. Clone, fork or download our repository: https://github.com/Spurwingio/Chat-Bot-Integrations/
2. Navigate to `/Discord/NodeJS/` and execute `npm install`
3. Copy the file `config.sample.js` to `config.js` and edit it
 - Provide your Discord Bot Token
 - Provide your Spurwing Provider Id
 - Optionally provide a Spurwing Appointment Type Id
7. Run the bot: `node index.js`
 - Optionally use PM2 or nodemon to keep the bot running 24/7

Upon successful connection you should see a message like:

![discord bot scheduling appointments](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uabgd1p8t90uvsly45pp.png)

If you didn't provide an Appointment Type Id, the code will fetch a random one from your Spurwing account. Each appointment type has an associated duration (15min, 30min, 45min, ...). Our API uses it to generate bookable slots.

### Developers
This bot is merely a basic implementation for **demo purposes**. We can extend it with more advanced features to facilitate Calendar Management, Group Bookings, Reminders, Sending Emails, Voice Commands and more.

![discord bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1b3mvnblg88didivsjnr.png)

## State Management
The Spurwing Provider ID (**PID**) represents an individual calendar. You can extend the bot to keep a mapping of Discord Members and their PIDs. If your Spurwing account has Organizational privileges then you can create multiple accounts (and thus PIDs) for all your members. Each calendar can also be two-way synced with any third-party email provided (Gmail, Outlook, Apple).

![team scheduling api](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5n7jddhenj24kybwxnje.png)

## Group Bookings
Our demo bot only allows for 1-on-1 bookings, hence the single `[@email]` argument for the `!book` command. You can extend that command to allow a list of email addresses.

Alternatively you can create a mapping of Discord Members and their email addresses. Now instead of providing their emails explicitly to the command you can use the `@username` notation by Discord.

## Reminders
To incorporate automated reminders, either as public announcements or private messages, you make the bot poll for all calendar events (every minute or so). And based on your preferences make it send reminders to all participants.

![discord bot reminder](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yl7zyrpoe2d3ogaxvv5g.png)

## Sending Emails
We already have a Spurwing Library for sending emails using the SMTP protocol. Our [iCalendar Library Repository](https://github.com/Spurwingio/iCalendar-Integrations/) contains all the logic you need inside `index.js`, in particular the `sendMail` function which you can re-use here.

## Voice Commands
The thing I love about Discord the most are its voice channels. It's just a virtual place you can join and talk to everyone inside the channel. No annoying meeting links needed to instantly hop on a call with someone.

A Discord Bot can also join a voice channel and listen to all speakers individually (but can also send audio data). One of my personal open-source projects [DiscordEarsBot](https://github.com/inevolin/DiscordEarsBot) uses NLP and Machine Learning to transcribe and interpret what is being said. This solution is pretty accurate and supports 32 of languages. You can use that solution for adding Voice Commands or generated suggestions based on what is being said during a conversation:
```
You: maybe we should meet again next week?

Bot: Would you like to schedule for next week this time?
```

## Support

- For public issues and bugs please use the GitHub Issues Page.
- For enquiries and private issues reach out to us at support@spurwing.io
- Join our Discord Community Server: https://discord.gg/j3gd5Qk5uW
- Learn more about the [Spurwing Scheduling API](https://github.com/Spurwingio/Appointment-Scheduling-API).


# Conclusion
Another cool UX improvement to the `!book [slot] ...` command is to make return a few bookable slots if it fails to schedule for the `[slot]` you provided.

Discord Bots are amazing tools that can help us **automate tasks** and be **more productive** at our daily business. If you enjoy our content, make sure to give us a star on GitHub and follow us for more. Visit [Spurwing](https://www.spurwing.io/) and schedule a free demo today. Have a great day!

## Updates
Thanks to our team member [Nabil Omi](https://www.linkedin.com/in/nabil-omi/) for suggesting Discord Embeds, we have updated the code for a better UI/UX experience:

![discord bot scheduling update 1](https://user-images.githubusercontent.com/9488406/115861930-bf9da880-a433-11eb-8652-23631f294ac7.png)

