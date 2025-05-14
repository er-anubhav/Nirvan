from flask import Flask, request
import requests
import logging
import json
import os
import traceback
from datetime import datetime
from flask_cors import CORS
from supabase import create_client
import base64
import uuid

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

ACCESS_TOKEN = 'EAAYpHCpnVsIBO0PcxsbIS3w5diwMAMxvzJYbex8DDGATui1xjfUFm2tX2xZCpsfZAeUA6uFNBLi6JNOqD1ZByPIVPnB2sSBDc6IgQZCCronhBdv7idRqSWMgZBWZBE6ZCWWFPwZCpcXhu7ZCWybiXmi6ZAwR1ZBNaBpprwnL8ph08HbMvbZC6IyTrdv9qnPnUbeq8AXWuQIQzkBI0vGqLIWiuk0JzZBMhP6ZAT'
PHONE_NUMBER_ID = '655554070968830'
VERIFY_TOKEN = 'anubhav'  # This should match what you enter in Meta portal

# Supabase configuration
SUPABASE_URL = "https://hewopkgelimedbbcrdfg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhld29wa2dlbGltZWRiYmNyZGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODAyMTUsImV4cCI6MjA2MjY1NjIxNX0.DHclJzmwyaNAzev4Il-DfWhgJXtUfTb94emoFPv5AGU"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Verify Supabase connection at startup
try:
    response = supabase.table('profiles').select('count', count='exact').execute()
    logger.info(f"Supabase connection successful. Profiles table has {response.count} rows.")
except Exception as e:
    logger.error(f"Failed to connect to Supabase at startup: {e}")
    logger.error(traceback.format_exc())

# Memory store for user states
user_states = {}
DATA_DIR = 'complaints'
os.makedirs(DATA_DIR, exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def webhook():
    if request.method == 'GET':
        # Webhook verification
        token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')
        mode = request.args.get('hub.mode')
        if mode == 'subscribe' and token == VERIFY_TOKEN:
            return challenge, 200
        return 'Verification failed', 403

    if request.method == 'POST':
        data = request.json
        logger.info(f"Incoming data: {json.dumps(data, indent=2)}")

        try:
            value = data['entry'][0]['changes'][0]['value']
            messages = value.get('messages')
            if messages:
                msg = messages[0]
                from_number = msg['from']
                msg_type = msg['type']
                profile_name = value.get('contacts', [{}])[0].get('profile', {}).get('name', 'unknown')

                user_state = user_states.get(from_number, {'step': 'greet', 'data': {}})
                step = user_state['step']

                if step == 'greet':
                    send_reply(from_number, "Hi! Welcome to Nirvana. What is your complaint?")
                    user_state['step'] = 'ask_complaint'

                elif step == 'ask_complaint' and msg_type == 'text':
                    complaint = msg['text']['body']
                    user_state['data']['complaint'] = complaint
                    send_reply(from_number, "Please share your location.")
                    user_state['step'] = 'ask_location'

                elif step == 'ask_location' and msg_type == 'location':
                    location = msg['location']
                    user_state['data']['location'] = location
                    send_reply(from_number, "Thanks! Now please send an image of the issue.")
                    user_state['step'] = 'ask_image'

                elif step == 'ask_image' and msg_type == 'image':
                    media_id = msg['image']['id']
                    image_url = get_media_url(media_id)
                    
                    if not image_url:
                        send_reply(from_number, "Sorry, we couldn't process your image. Please try sending it again.")
                        return 'Failed to fetch image URL', 200
                    
                    image_data = download_media(image_url)
                    
                    if not image_data:
                        send_reply(from_number, "Sorry, we couldn't download your image. Please try sending it again.")
                        return 'Failed to download image', 200
                    
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    folder = os.path.join(DATA_DIR, f"{from_number}_{timestamp}")
                    os.makedirs(folder, exist_ok=True)

                    # Save text + location
                    with open(os.path.join(folder, 'data.json'), 'w') as f:
                        json.dump(user_state['data'], f, indent=2)

                    # Save image
                    with open(os.path.join(folder, 'image.jpg'), 'wb') as img_file:
                        img_file.write(image_data)
                    
                    # Ensure user profile and store complaint in Supabase
                    ensure_user_profile(from_number, profile_name)
                    complaint_id = store_complaint_in_supabase(from_number, user_state['data'], image_data)

                    if complaint_id:
                        send_reply(from_number, f"Got it! Your complaint has been registered with ID: {complaint_id}. Thank you.")
                        trigger_ai_categorization(complaint_id, user_state['data']['complaint'])
                    else:
                        send_reply(from_number, "Sorry, we couldn't register your complaint at this time. Please try again later.")
                        
                    user_states.pop(from_number, None)  # Reset state

                user_states[from_number] = user_state

        except Exception as e:
            logger.error(f"Error processing webhook: {e}")
            logger.error(traceback.format_exc())

        return 'OK', 200

def send_reply(to, message):
    url = f'https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages'
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message}
    }
    response = requests.post(url, headers=headers, json=payload)
    logger.info(f"Sent message, response: {response.status_code}")
    if response.status_code != 200:
        logger.error(f"Failed to send message: {response.text}")

def get_media_url(media_id):
    url = f"https://graph.facebook.com/v18.0/{media_id}"
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    try:
        res = requests.get(url, headers=headers)
        if res.status_code != 200:
            logger.error(f"Failed to get media URL: {res.status_code}, {res.text}")
            return None
        return res.json().get('url')
    except Exception as e:
        logger.error(f"Error getting media URL: {e}")
        return None

def download_media(media_url):
    if not media_url:
        return None
        
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    try:
        res = requests.get(media_url, headers=headers)
        if res.status_code != 200:
            logger.error(f"Failed to download media: {res.status_code}")
            return None
        return res.content
    except Exception as e:
        logger.error(f"Error downloading media: {e}")
        return None

def ensure_user_profile(phone_number, profile_name):
    """
    Check if a user profile exists for this phone number, if not create one
    Returns the user's UUID
    """
    try:
        # Check if user exists by phone number
        response = supabase.table('profiles').select('*').eq('phone', phone_number).execute()
        
        # If user doesn't exist, create one with a new UUID
        if len(response.data) == 0:
            user_id = str(uuid.uuid4())  # Generate a new UUID
            new_user = {
                'id': user_id,
                'full_name': profile_name if profile_name != 'unknown' else 'WhatsApp User',
                'phone': phone_number,
                'role': 'citizen',
                'preferred_language': 'english'
            }
            result = supabase.table('profiles').insert(new_user).execute()
            logger.info(f"Created new user profile with UUID {user_id} for {phone_number}, result: {result}")
            
            # Verify creation
            check = supabase.table('profiles').select('*').eq('phone', phone_number).execute()
            if len(check.data) == 0:
                logger.error(f"Failed to create user profile for {phone_number}")
                return str(uuid.uuid4())  # Return a new UUID anyway to continue the flow
            return user_id  # Return the newly created UUID
        else:
            # User exists, return their UUID
            user_id = response.data[0]['id']
            logger.info(f"User profile already exists for {phone_number} with UUID {user_id}")
            return user_id
    except Exception as e:
        logger.error(f"Error ensuring user profile: {e}")
        logger.error(traceback.format_exc())
        return str(uuid.uuid4())  # Return a new UUID to continue the flow

def store_complaint_in_supabase(phone_number, complaint_data, image_data):
    """
    Store complaint data in Supabase
    """
    try:
        # 1. Get the user's UUID from the profiles table
        user_response = supabase.table('profiles').select('id').eq('phone', phone_number).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            # If user profile doesn't exist yet, create it
            citizen_id = str(uuid.uuid4())  # Generate a new UUID
            new_user = {
                'id': citizen_id,
                'full_name': 'WhatsApp User',  # Default name
                'phone': phone_number,
                'role': 'citizen',
                'preferred_language': 'english'
            }
            supabase.table('profiles').insert(new_user).execute()
            logger.info(f"Created new user profile with UUID {citizen_id} for {phone_number}")
        else:
            # Use the existing user's UUID
            citizen_id = user_response.data[0]['id']
            logger.info(f"Found existing user profile with UUID {citizen_id} for {phone_number}")
        
        # Get location data with fallbacks
        lat = complaint_data.get('location', {}).get('latitude', 0)
        lng = complaint_data.get('location', {}).get('longitude', 0)
        location_str = f"{lat}, {lng}"
        
        complaint_text = complaint_data.get('complaint', '')
        if not complaint_text:
            complaint_text = "No description provided"
          # 2. Create the complaint
        complaint = {
            'title': f"WhatsApp complaint",
            'description': complaint_text,
            'category': 'Other',  # Default category, can be updated later by AI
            'location': location_str,
            'latitude': lat,
            'longitude': lng,
            'citizen_id': citizen_id,  # Now using the proper UUID
            'status': 'pending',
            'priority': 'medium'
        }
        
        # Insert complaint and get the ID
        logger.info(f"Inserting complaint: {json.dumps(complaint)}")
        response = supabase.table('complaints').insert(complaint).execute()
        
        if not response.data:
            logger.error(f"Failed to insert complaint: {response}")
            return None
            
        complaint_id = response.data[0].get('id')
        if not complaint_id:
            logger.error(f"No ID returned after complaint insertion: {response.data}")
            return None
            
        logger.info(f"Created complaint with ID: {complaint_id}")
        
        # 3. Upload the image to Supabase storage
        if image_data:
            try:
                image_filename = f"{complaint_id}/{uuid.uuid4()}.jpg"
                logger.info(f"Uploading image to storage: {image_filename}")
                
                # Upload the image
                upload_response = supabase.storage.from_('complaint_images').upload(
                    image_filename, 
                    image_data
                )
                logger.info(f"Image upload response: {upload_response}")
                
                # Get public URL for the image
                image_url = supabase.storage.from_('complaint_images').get_public_url(image_filename)
                logger.info(f"Image public URL: {image_url}")
                
                # 4. Create complaint image record
                image_record = {
                    'complaint_id': complaint_id,
                    'image_url': image_url
                }
                
                image_response = supabase.table('complaint_images').insert(image_record).execute()
                logger.info(f"Added image for complaint {complaint_id}: {image_response}")
            except Exception as img_err:
                logger.error(f"Error handling image for complaint {complaint_id}: {img_err}")
                logger.error(traceback.format_exc())
                # Continue even if image upload fails
        
        # Try to trigger AI categorization, but don't fail if it doesn't work
        try:
            trigger_ai_categorization(complaint_id, complaint_text)
        except Exception as ai_err:
            logger.error(f"AI categorization failed but complaint was created: {ai_err}")
        
        return complaint_id
    except Exception as e:
        logger.error(f"Error storing complaint in Supabase: {e}")
        logger.error(traceback.format_exc())
        return None

def trigger_ai_categorization(complaint_id, complaint_text):
    """
    Call the AI categorization function to analyze the complaint
    This is done asynchronously so it doesn't block the response to the user
    """
    try:
        # Call the Supabase Edge Function for categorizing complaints
        logger.info(f"Triggering AI categorization for complaint {complaint_id}")
        
        payload = {
            'id': complaint_id,
            'title': f"WhatsApp complaint",
            'description': complaint_text
        }
        
        logger.info(f"AI categorization payload: {json.dumps(payload)}")
        
        response = supabase.functions.invoke(
            'categorize-complaint',
            invoke_options={
                'body': payload
            }
        )
        
        if hasattr(response, 'error') and response.error:
            logger.error(f"Error calling AI categorization: {response.error}")
            return False
        else:
            logger.info(f"AI categorization response: {response}")
            logger.info(f"AI categorization successful for complaint {complaint_id}")
            return True
    except Exception as e:
        logger.error(f"Error triggering AI categorization: {e}")
        logger.error(traceback.format_exc())
    
    return False

if __name__ == '__main__':
    # For development only - use a proper WSGI server for production
    logger.info("Starting webhook server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)