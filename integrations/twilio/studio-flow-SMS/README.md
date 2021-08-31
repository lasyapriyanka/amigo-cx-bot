Integration of Twilio Messaging (Studio Flow) and Dialogflow CX Agent

It's a good starting point to develop your own application logic.

## App sever setup

### Installation

Run `pip install -r requirements.txt`

### Dialogflow CX Agent Config

Update the projectId, location, agentId in the config.py file from the agent URL.

https://dialogflow.cloud.google.com/cx/projects/---------/locations/-----------/agents/---------/flows/
 
### Running the server (ngrok)

Start with `python main.py`
Run the server on ngrok (listening on port 5000)



## Twilio Setup

### Basic


### Studio flow import JSON

### Update the URL in widget


### Whatsapp test 


### SMS test


### Mutliple languages

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

