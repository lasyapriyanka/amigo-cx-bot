import uuid
from google.cloud.dialogflowcx_v3beta1.services.agents import AgentsClient
from google.cloud.dialogflowcx_v3beta1.services.sessions import SessionsClient
from google.cloud.dialogflowcx_v3beta1.types import session
import json
from flask import Flask,  request, jsonify
from flask_cors import CORS
import os
import config

app = Flask(__name__)

@app.route('/')
def index():
    print("check here")
    return 'Home Page'

@app.route('/webhook', methods=['POST'])
def run_sample():
   
    project_id = config.project_id
    location_id = config.location_id
    agent_id = config.agent_id
    agent = f"projects/{project_id}/locations/{location_id}/agents/{agent_id}"
    
    request_json = request.get_json()
    print("Intent",request_json)
    if 'text' in request_json:
        text =  request_json['text']
    
    texts = [character for character in text if character.isalnum()]
    texts = [''.join(texts)]
    print(texts,type(texts[0]))

    if "lang" in request_json:
        lang = request_json['lang']
    language_code = lang
    if request_json['id'].strip() =='0':
        session_id = uuid.uuid4()
    else:
        if request_json['id'].strip() == '':
             session_id = uuid.uuid4()
        else:
            session_id = request_json['id'].strip()

    response = detect_intent_texts(agent, session_id, texts, language_code)
    print('Agent', response)
    data = {}
    data['message'] = ''.join(response)
    json_data = json.dumps(data)
    
    print({'msg' : data['message'],
            'id':session_id})
    
    return {'msg' : data['message'],
            'id':session_id}

def detect_intent_texts(agent, session_id, texts, language_code):
    """Returns the result of detect intent with texts as inputs.

    Using the same `session_id` between requests allows continuation
    of the conversation."""
    session_path = f"{agent}/sessions/{session_id}"
    print(f"Session path: {session_path}\n")
    client_options = None
    agent_components = AgentsClient.parse_agent_path(agent)
    location_id = agent_components["location"]
    if location_id != "global":
        api_endpoint = f"{location_id}-dialogflow.googleapis.com:443"
        print(f"API Endpoint: {api_endpoint}\n")
        client_options = {"api_endpoint": api_endpoint}
    session_client = SessionsClient(client_options=client_options)

    for text in texts:
        text_input = session.TextInput(text=text)
        query_input = session.QueryInput(text=text_input, language_code=language_code)
        request = session.DetectIntentRequest(
            session=session_path, query_input=query_input
        )
        response = session_client.detect_intent(request=request)
        
        print("=" * 20)
        print(f"Query text: {response.query_result.text}")
        response_messages = [
            " ".join(msg.text.text) for msg in response.query_result.response_messages
        ]
        print(f"Response text: {' '.join(response_messages)}\n")
    return response_messages



if __name__ == '__main__':
    app.run()
