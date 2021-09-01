Integration of Twilio Messaging (Studio Flow) and Dialogflow CX Agent

It's a good starting point to develop your own application logic.

## App sever setup

### Installation

Run `pip install -r requirements.txt`

### Dialogflow CX Agent Config

Update the projectId, location, agentId in the config.py file from the agent URL.

https://dialogflow.cloud.google.com/cx/projects/---------/locations/-----------/agents/---------/flows/
 
### Running the server locally (ngrok)

Start with `python main.py`

Run the server on ngrok (listening on port 5000)

Use ngrok to make your server publicly available: `ngrok http 5000`

### Deploy to AppEngine

```bash
gcloud app deploy
```

https://YOUR-APPENGINE-INSTANCE.appspot.com/


## Twilio Setup

### Configure using the Console
Access the Twilio console to get a `<TWILIO-PHONE-NUMBER>`.

### Basic

### Studio flow import JSON
1. Create a new flow in Twilio Studio by importing the `studio-flow.json`

### Update the URL in widget

2. Update the ngrok URL with `/webhook` route in the `get_dialogflow_response` widget 

Example: https://7c17-103-217-212-100.ngrok.io/webhook


Note: Point your webhook to your AppEngine instance if you have deployed in app engine.

3. Publish the flow to update the new changes.

### Whatsapp test 

Follow the instructions to setup a whastapp sandbox integration and you should be able to test the integration on Whatsapp

### SMS test

Access the twilio console, under the `Phone Numbers > Manage > Active numbers` update the `A MESSAGE COMES IN` to point out to the studio flow that you have just created. 


### Mutliple languages

User: Hi

Agent: Enter 1 for English
       Enter 2 for Spanish

User: 1 / 2

Agent: Welcome to amigo bot / Hola
