# Nirvana Backend

The backend for Nirvana is built with Python, Flask, and machine learning models, providing intelligent processing of civic complaints and seamless integration with the frontend and Supabase.

## 🌟 What Sets Our Backend Apart

- **Advanced ML Integration**: Proprietary models for automatic complaint categorization and prioritization
- **Real-Time Processing**: Instant analysis of text and images for immediate response
- **Scalable Architecture**: Optimized for handling millions of complaints without performance degradation
- **Secure API Design**: Best-in-class security practices for handling sensitive civic data
- **Seamless Whatsapp Integration**: Direct complaint registration through WhatsApp messaging

## ⚙️ Technologies Used

- Python 3.10+
- Flask web framework
- Scikit-learn for machine learning models
- Supabase for database and authentication
- WhatsApp Business API for messaging integration
- Flask-CORS for cross-origin resource sharing

## 📋 Installation

### Prerequisites

- Python 3.10+
- Git
- Supabase account
- WhatsApp Business API credentials (optional)

### Setup Steps

1. **Create and activate a virtual environment**

```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure environment variables**

For Windows PowerShell:
```powershell
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_KEY="your_supabase_key"
$env:ACCESS_TOKEN="your_whatsapp_access_token"
$env:PHONE_NUMBER_ID="your_whatsapp_phone_number_id"
$env:VERIFY_TOKEN="your_verify_token"
```

For macOS/Linux:
```bash
export SUPABASE_URL="your_supabase_url"
export SUPABASE_KEY="your_supabase_key"
export ACCESS_TOKEN="your_whatsapp_access_token"
export PHONE_NUMBER_ID="your_whatsapp_phone_number_id"
export VERIFY_TOKEN="your_verify_token"
```

4. **Start the backend server**

```bash
python send_message.py
```

The API will be available at http://localhost:5000

## 📂 Project Structure

- `backend/` - Main backend directory
  - `send_message.py` - Main application entry point with Flask server
  - `models/` - Machine learning models
    - `priority_model.py` - ML model for prioritizing complaints
    - `priority_model.pkl` - Trained model file
    - `category_encoder.pkl` - Encoder for complaint categories
  - `complaints/` - Storage for complaint data and images
    - Each complaint stored in a folder with unique identifier
    - Contains data.json for complaint information
    - Contains image.jpg for complaint visual evidence

## 🤖 Machine Learning Models

Nirvan uses two main ML models:

1. **Category Classification Model**
   - Automatically assigns complaints to the appropriate department/category
   - Uses TF-IDF vectorization with logistic regression
   - High accuracy rate of categorization

2. **Priority Determination Model**
   - Assigns urgency level (High, Medium, Low) to incoming complaints
   - Considers multiple factors including:
     - Text severity assessment
     - Historical response patterns
     - Category-based urgency rules

## 🔄 API Endpoints

### WhatsApp Integration
- `POST /webhook` - Receives and processes WhatsApp messages
- `GET /webhook` - Verification endpoint for WhatsApp API

### Complaint Management
- `POST /complaint` - Register a new complaint
- `GET /complaints` - Retrieve all complaints (with filtering options)
- `GET /complaint/<id>` - Get specific complaint details
- `PUT /complaint/<id>` - Update complaint status

### ML Services
- `POST /categorize` - Get AI-suggested category for a complaint
- `POST /prioritize` - Get AI-suggested priority for a complaint

## 🤝 Contributing

Please refer to the main project README for contribution guidelines.

---

Built by **Team Vercel** to create real change, one complaint at a time.
