const EventEmitter = require("events");
const { Transform, PassThrough, pipeline } = require("stream");
const uuid = require("uuid");
const structjson = require("structjson");
const WaveFile = require("wavefile").WaveFile;
const {SessionsClient} = require('@google-cloud/dialogflow-cx');

const projectId = '' //replace with the projectID
const encoding = 'AUDIO_ENCODING_LINEAR_16';
const agentId = ''; //replace with the CX agent ID
const sampleRateHertz = 16000;
const languageCode = 'en'

const intentQueryAudioInput = {
  audio: {
    config: {
      audioEncoding: encoding,
      sampleRateHertz: sampleRateHertz,
      singleUtterance: true,
    },
  },
  languageCode: languageCode,
  interimResults: false
};


function createDetectStream(isFirst, sessionPath, sessionClient) {
  let queryInput = intentQueryAudioInput;
  if (isFirst) {
    queryInput = {
      intent: {
        intent: `projects/${projectId}/locations/global/agents/${agentId}/intents/00000000-0000-0000-0000-000000000000`,
      },
      languageCode: languageCode
    };
  }
  console.log("sessionPath",sessionPath)
  const initialStreamRequest = {
    queryInput: queryInput,
    session: sessionPath,
    outputAudioConfig: {
        audioEncoding: "OUTPUT_AUDIO_ENCODING_LINEAR_16",
        sampleRateHertz: 24000,
        synthesizeSpeechConfig: {
          "speakingRate": 0.8,
          "pitch": 0,
          "volumeGainDb": 3,
          "voice": {
            name: "en-US-Wavenet-F",
            ssmlGender: 'FEMALE'
          }
        }
      }
  };

  const detectStream = sessionClient.streamingDetectIntent();
  detectStream.write(initialStreamRequest);
  return detectStream;
}

function createAudioResponseStream() {

  return new Transform({
    objectMode: true,
    transform: (chunk, encoding, callback) => {
      if (!chunk.detectIntentResponse.outputAudio || chunk.detectIntentResponse.outputAudio.length == 0) {
        return callback();
      }
      // Convert the LINEAR 16 Wavefile to 8000/mulaw
      const wav = new WaveFile();
      wav.fromBuffer(chunk.detectIntentResponse.outputAudio);
      wav.toSampleRate(8000);
      wav.toMuLaw();
      return callback(null, Buffer.from(wav.data.samples));
    },
  });
}

function createAudioRequestStream() {
  return new Transform({
    objectMode: true,
    transform: (chunk, encoding, callback) => {
      const msg = JSON.parse(chunk.toString("utf8"));

      // Only process media messages
      if (msg.event !== "media") 
      {
        return callback();
      }      
      // This is mulaw/8000 base64-encoded
    let buff = Buffer.from(msg.media.payload, 'base64');
      return callback(null, {queryInput: {audio: {audio: buff}}});
    },
  });
}

class DialogflowService extends EventEmitter {
  constructor() {
    super();
    this.sessionId = Math.random().toString(36).substring(7);
    // Instantiates a session client
    this.sessionClient = new SessionsClient();
    console.log("this.sessionId", this.sessionId)
    this.sessionPath = this.sessionClient.projectLocationAgentSessionPath(
      projectId,
      "global",
      agentId,
      this.sessionId
    );
    // State management
    this.isFirst = true;
    this.isReady = false;
    this.isStopped = false;
    this.isInterrupted = false;
  }

  send(message) {
    const stream = this.startPipeline();
    stream.write(message);
  }

  getFinalQueryResult() {
    if (this.finalQueryResult) {
      const queryResult = {
        intent: {
          name: this.finalQueryResult.intent.name,
          displayName: this.finalQueryResult.intent.displayName,
        },
        parameters: structjson.structProtoToJson(
          this.finalQueryResult.parameters
        ),
      };
      return queryResult;
    }
  }

  startPipeline() {
    if (!this.isReady) {

      // Generate the streams
      this._requestStream = new PassThrough({ objectMode: true });
      const audioStream = createAudioRequestStream();
      const detectStream = createDetectStream(
        this.isFirst,
        this.sessionPath,
        this.sessionClient
      );
      const responseStream = new PassThrough({ objectMode: true });
      const audioResponseStream = createAudioResponseStream();
      if (this.isFirst) 
      {
        console.log('inside first')
        this.isFirst = false;
      }
      this.isInterrupted = false;
      // Pipeline is async....
      pipeline(
        this._requestStream,
        audioStream,
        detectStream,
        responseStream,
        audioResponseStream,
        (err) => {
          if (err) {
            this.emit("error", err);
          }
          // Update the state so as to create a new pipeline
          this.isReady = false;
        }
      );

      this._requestStream.on("data", (data) => {
        const msg = JSON.parse(data.toString("utf8"));
        if (msg.event === "start") {
          console.log(`Captured call ${msg.start.callSid}`);
          this.emit("callStarted", {
            callSid: msg.start.callSid,
            streamSid: msg.start.streamSid
          }
          );
        }
        if (msg.event === "mark") {
          console.log(`Mark received ${msg.mark.name}`);
          if (msg.mark.name === "endOfInteraction") {
            this.emit("endOfInteraction", this.getFinalQueryResult());
          }
        }
      });

      responseStream.on("data", (data) => {
        console.log("data", data)
        if (
          data.recognitionResult &&
          data.recognitionResult.transcript &&
          data.recognitionResult.transcript.length > 0
        ) {
          this.emit("interrupted", data.recognitionResult.transcript);
        }
        if (
          data.queryResult &&
          data.queryResult.intent &&
          data.queryResult.intent.endInteraction
        ) {
          console.log(
            `Ending interaction with: ${data.queryResult.fulfillmentText}`
          );
          this.finalQueryResult = data.queryResult;
          this.stop();
        }
      });
      audioResponseStream.on("data", (data) => {
        this.emit("audio", data.toString('base64'));
      });
      // Set ready
      this.isReady = true;
    }
    return this._requestStream;
  }

  stop() {
    console.log("Stopping Dialogflow");
    this.isStopped = true;
  }

  finish() {
    console.log("Disconnecting from Dialogflow");
    this._requestStream.end();
  }
}

module.exports = {
  DialogflowService,
};
