// const projectId = 'reed-group-va-poc'; //https://dialogflow.com/docs/agents#settings
// const agentId = '9e4820f3-3431-44e6-9892-7a8722188bbc';
// const location = 'global';
const CONFIG = require('./config');
const projectId = CONFIG.projectId;
const agentId = CONFIG.agentId;
const location = CONFIG.location;

//const query = 'Hi';
const languageCode = 'en';
const {SessionsClient} = require('@google-cloud/dialogflow-cx');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
const client = new SessionsClient({apiEndpoint: 'global-dialogflow.googleapis.com'})
var express = require("express");
var cors = require('cors')
var app = express();
var bodyParser = require('body-parser');
app.use(cors())
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('website/angular/'));
app.use(bodyParser.json());
app.use('/authenticate', express.static('login.html'));

app.use('/', express.static('website/angular/index.html'))


app.post('/action', (request, response) => {
    console.log("------")
    let query = request.body.input_string
    let username = request.body.username
    let sessionId = request.body.sessionId
    console.log("request sessionId:",sessionId)
    console.log("request object:", request.body.input_string);
    console.log("request username:", request.body.username);
    async function detectIntentText() {
        const sessionPath = client.projectLocationAgentSessionPath(
          projectId,
          location,
          agentId,
          sessionId
        );
        console.info(sessionPath);
      
        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: query,
            },
            languageCode,
          },
          queryParams:{
            parameters: {
              fields:{
                username:{
                  stringValue: username
                }
              }
            }
          }
        };
        const [responses] = await client.detectIntent(request);
        console.log(`User Query: ${query}`);
        for (const message of responses.queryResult.responseMessages) {
          if (message.text) {
            console.log(`Agent Response: ${message.text.text}`);
          }
        }
        if (responses.queryResult.match.intent) {
          console.log(
            `Matched Intent: ${responses.queryResult.match.intent.displayName}`
          );
        }
        console.log(
          `Current Page: ${responses.queryResult.currentPage.displayName}`
        );
        for (const message of responses.queryResult.responseMessages) {
            return response.send({response:message.text.text[0]});
          }
      }
      
      detectIntentText();
});
console.log("listening to port 8080")
app.listen(8080)