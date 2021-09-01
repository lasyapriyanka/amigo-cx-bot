# Google Dialogflow Integration

An Express app that responds with TwiML to `<Connect>` to a MediaStream and connect it with a Dialogflow CX agent

## Prerequisites - Dialogflow

* Make note of the Google Project ID, Agent ID
* Replace 8, 10 lines in dialogflow-utils.js


## Prerequisites - Twilio

* Twilio SID and Auth token
* Replace 11, 12 lines in server.js

## Installation

```
npm install
```

Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart)

Optional: Purchase a Twilio number (or use an existing one)

Optional: Search for available numbers in the **650** area code in the US

```bash
twilio api:core:available-phone-numbers:local:list  --area-code="650" --country-code=US --voice-enabled
```

Optional: Buy a number

```bash
twilio api:core:incoming-phone-numbers:create --phone-number="+16505551234"
```

### Develop locally

Start the server locally

```bash
npm start
```

Wire up your Twilio number with your endpoint on incoming calls. This will automatically start an [ngrok](https://ngrok.com) tunnel to your machine.

```bash
twilio phone-numbers:update +15552223333 --voice-url=http://localhost:3000/twiml
```

### Deploy to AppEngine

```bash
gcloud app deploy
```

Point your Incoming Webhook to your AppEngine instance.

```bash
twilio phone-numbers:update +15552223333 --voice-url=https://YOUR-APPENGINE-INSTANCE.appspot.com/twiml
```

## Credits 

Starter code from 
https://github.com/twilio/media-streams
