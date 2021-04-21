# This will be updated when the bot is further in development.

## How to host this bot:

### Make sure you have NPM and Node installed on your PC!

1. Git pull or save the Slack folder.

2. Go to [the slack api site](https://api.slack.com/apps/)

3. Create new app (make sure it is a classic bot, or else the bot will fail to start!!).

4. Go to the NodeJS folder and run `npm i`. This will install all dependencies.

5. Create a new file named `.env`.

6. Add this to the file: 

```js
TOKEN="replace this"
PREFIX="replace this"
```

1. On the slack site, click on your bot and on the left tab, click on "App Home".

2.  Add the bot on the second box.

3.  Go to "OAuth & Permissions" on the left tab.

4.   Add the bot with those scopes (classic doesn't allow for fancy customization).

5.   Copy the "Bot User Oauth Token".

6.   Replace the `replace this` with your token, and prefix respectively.

7.   Type `npm run server`.

Your bot should be online. If it throws an error immediately, feel free to remove the line `sendMessage('chat-bot', 'Bot is now online.');` in app.js. This will probably break something if you do not already have a channel in your Slack with the name chat-bot.