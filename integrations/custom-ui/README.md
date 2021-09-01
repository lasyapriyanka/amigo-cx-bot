# Basic Demo

This is a custom UI for Dialogflow CX agent.

It's a good starting point to develop your own application logic.

## App sever setup

### Installation

**Requires Node >= v12.1.0**

Run `npm install`

npm dependencies (contained in the `package.json`):

### Dialogflow CX Agent Config

Update the projectId, location, agentId in the config.js file from the agent URL.

`Ex: https://dialogflow.cloud.google.com/cx/projects/--------/locations/----------/agents/--------/flows/`
 
### Running the server

Start with `node app.js`

Run the server (listening on port 8080)

http://localhost:8080/

### Login Page 

Username and Password can be anything.

Example: 

`Username: John

Password: password`

It passes the session parameters which is the username that we got from the login page to the dialogflow CX and prefills it in the welcome agent.

