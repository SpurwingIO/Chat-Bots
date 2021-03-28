# Facebook Messenger Chat Bot with Spurwing API


## Intro
This is a demo project show casing the integration of Spurwing with Facebook Messenger API for chat bot programming.

## Requirements
- A web server with a public URL (domain name or ip address)
- NodeJS v12 or higher
- Facebook App with Messenger API enabled
- Facebook Page that's connected to your Facebook App
- Facebook credentials: App Secret Key, Access Token, Callback user token
- Spurwing API credentials: Provider Id, (appointment type id)

## Usage
- Rename `config.sample.js` to `config.js` and provide the required credentials.
- Adjust the Express Router Endpoints if necessary in `index.js`
- Start the chat bot service: `node index.js`

![Simple Appointment Scheduling Demo for Facebook Messenger Chat Bots](NodeJS/assets/fbchat.png)

## Development
- All date and times are relative to the hosting server, and not relative to the user's timezone. Facebook has advanced messaging features which you can request access for to receive the user's actual timezone.
- Alternatively you can ask the user's timezone in the chat yourself.
- The number of quick reply buttons is limited. But the number of available days and/or time slots can exceed this limit. Custom logic should be implemented to provide more flexibile scheduling options.

