import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend connection

# Gemini API key
gemini_api_key = "AIzaSyDDAq7VNYQCuQqGJYLVdiHaq60EGZjte3Y"

# Configure Gemini
genai.configure(api_key=gemini_api_key)

# Load Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/extract-tasks', methods=['POST'])
def extract_tasks():
    data = request.get_json()
    transcript = data.get('transcript', '').strip()

    if not transcript:
        return jsonify({'error': 'Meeting transcript is required in the request body.'}), 400

    try:
        # Prompt to Gemini
        prompt = f"""From the following meeting transcript, perform two tasks:
1. Summarize the meeting concisely, highlighting key discussion points, decisions made, and important outcomes.
2. Extract all action items. For each action item, identify the 'task', 'owner', 'deadline' (or mark as 'N/A'), and 'context' (why this task exists).

Provide your response strictly in the following JSON format. Ensure all fields are present:

{{
  "summary": "Your concise meeting summary here.",
  "actionItems": [
    {{
      "task": "Task description 1",
      "owner": "Owner Name 1",
      "deadline": "Date or N/A",
      "context": "Brief context for task 1"
    }},
    {{
      "task": "Task description 2",
      "owner": "Owner Name 2",
      "deadline": "Date or N/A",
      "context": "Brief context for task 2"
    }}
  ]
}}

Transcript:
{transcript}
"""

        # Generate response from Gemini
        response = model.generate_content(prompt)
        output_text = response.text.strip()

        # Extract only the JSON portion
        json_start = output_text.find('{')
        json_end = output_text.rfind('}') + 1
        json_part = output_text[json_start:json_end]

        # Parse JSON
        parsed = json.loads(json_part)

        return jsonify({
            'summary': parsed.get('summary', ''),
            'actionItems': parsed.get('actionItems', [])
        })

    except json.JSONDecodeError:
        print("❌ JSON decode error from Gemini:\n", output_text)
        return jsonify({'error': 'Gemini returned invalid JSON.', 'raw': output_text}), 500

    except Exception as e:
        print("❌ Gemini error:", str(e))
        return jsonify({'error': 'Failed to extract from Gemini.', 'details': str(e)}), 500

# Run server
if __name__ == '__main__':
    app.run(debug=True, port=3000)
