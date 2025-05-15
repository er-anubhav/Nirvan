# Nirvana: AI-Powered Civic Issue Resolution Platform

Nirvana is a cutting-edge AI-powered civic issue resolution platform designed to restore citizen trust and modernize governance. By harnessing the power of machine learning, real-time data analysis, and multilingual interfaces, Nirvana transforms complaint reporting into a transparent, efficient, and scalable process across cities and agencies.

---

## 📱 Revolutionary WhatsApp Chat Integration

One of Nirvana's most impactful innovations is its **seamless WhatsApp chatbot integration**, enabling citizens to report civic issues in **the most accessible and familiar way possible**—through a simple conversation on their phone.

### 🔍 **Why WhatsApp?**

* **Ubiquitous Access**: With over 2 billion active users globally, WhatsApp is the de facto communication tool for millions of citizens—including those with limited technical skills or low digital literacy.
* **No App Downloads**: Citizens don’t need to download or learn a new app—just use WhatsApp to engage with local governance.
* **Real-Time Interaction**: Two-way communication allows instant feedback, live status updates, and quicker resolution acknowledgment.

### 🚀 **What the WhatsApp Bot Can Do**

1. **Instant Greeting and Onboarding**
   Citizens are welcomed with:
   *“Hi! Welcome to Nirvana. How can we help you today?”*

2. **Structured Complaint Collection**
   Through a guided chat, users are prompted to:

   * Describe the complaint
   * Share their location (geo-tagging enabled)
   * Upload an image as evidence

3. **AI-Driven Classification**
   Once submitted, the chatbot triggers backend services that:

   * Automatically **categorize** the issue (e.g., pothole, streetlight, garbage)
   * **Prioritize** based on urgency and sentiment
   * Geotag and log the complaint in Supabase with complete metadata

4. **Live Transparency for Citizens**
   After submission:

   * Users receive a **ticket ID** and can **track status**
   * They get notified on **updates, resolution progress, and feedback collection**

5. **Multilingual Support** (coming soon)
   Designed to support multiple languages to reach citizens in their native tongues.

### 🌟 How It Improves Governance

| 🔧 Aspect          | ⚡ With WhatsApp Integration                            |
| ------------------ | ------------------------------------------------------ |
| **Transparency**   | Citizens receive real-time updates and resolution logs |
| **Efficiency**     | Complaints are captured, classified & routed instantly |
| **Inclusion**      | No digital divide—works for anyone with a phone        |
| **Verification**   | Images and geolocation validate complaints             |
| **Accountability** | Audit trails and timestamps for every interaction      |

---

## 🌐 System Architecture Overview

```
Citizen (via WhatsApp)
     ↓
WhatsApp Business API (Webhook → Flask)
     ↓
Nirvana Bot (Flask + Python + ML models)
     ↓
Supabase (Database + Auth + Real-time Sync)
     ↓
Admin Dashboard (React + Vite + Tailwind)
```

* **Frontend:** Admin dashboard for officials to view, filter, and act on complaints
* **Backend:** Python Flask app with real-time webhook handling for WhatsApp messages
* **ML Models:** Categorization, prioritization, sentiment analysis
* **Storage & Sync:** Supabase for structured complaint logs and real-time updates
* **Location & Media:** Image + GPS capture directly via WhatsApp
* **Deployment:** Modular microservices for scalability

---

## 🔧 How to Set Up WhatsApp Integration

1. **Meta Developer Account**
   Set up your app and phone number via [Meta for Developers](https://developers.facebook.com/)

2. **Environment Variables in Backend**

```bash
# Backend environment (PowerShell or .env file)
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_KEY="your_supabase_key"
$env:ACCESS_TOKEN="your_whatsapp_access_token"
$env:PHONE_NUMBER_ID="your_whatsapp_phone_number_id"
$env:VERIFY_TOKEN="your_verify_token"
```

3. **Webhook Route in Flask**

   * Handles incoming messages
   * Parses text, location, image
   * Responds with structured messages or status updates

4. **Message Processor**

   * Invokes ML models for classification and sentiment analysis
   * Pushes data to Supabase
   * Sends acknowledgment and follow-up messages

---

## 💬 Future Enhancements for Chatbot

* **Voice-based complaint filing via WhatsApp voice notes**
* **Integration with city CRMs and response teams**
* **Real-time escalations and feedback loops**
* **Chat analytics and mood detection for issue sentiment**
* **WhatsApp groups for community-level issue aggregation**

---

## 🧹 Key Features Summary

* 🤖 **AI/ML Complaint Management**
* 🗺️ **Geo-tagged Reporting**
* 📊 **Real-time Dashboards**
* 🗣️ **Multilingual & Inclusive**
* 🔐 **Transparent & Auditable**
* 📱 **WhatsApp-Based Citizen Interface** ✅
* 🌐 **Modular Architecture**

---

The WhatsApp chatbot isn’t just a feature—**it’s a foundational pillar of Nirvana’s mission** to democratize access to responsive governance, remove barriers to participation, and ensure every voice is heard and logged in real-time.
