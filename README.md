# Nirvana: AI-Powered Civic Issue Resolution Platform

![Nirvana Logo](frontend/public/favicon.ico)

Nirvana is a cutting-edge AI-powered civic issue resolution platform designed to restore citizen trust and modernize governance. By harnessing the power of machine learning, real-time data analysis, and multilingual interfaces, Nirvana transforms complaint reporting into a transparent, efficient, and scalable process across cities and agencies.

## 🌟 Why Nirvana Stands Above the Rest

Nirvana represents the pinnacle of civic tech innovation, offering an unparalleled solution for modern governance challenges:

- **Most Advanced AI Integration**: Our proprietary ML models automatically categorize and prioritize complaints with industry-leading accuracy
- **Unmatched Real-Time Performance**: Live dashboards and instant notifications keep all stakeholders informed with zero delay
- **Superior User Experience**: Intuitive, accessible interfaces designed for citizens of all technical abilities
- **Enterprise-Grade Security**: Bank-level encryption and comprehensive audit trails ensure data integrity
- **Ultimate Scalability**: Cloud-native architecture handles millions of complaints without performance degradation

## 🚀 Key Features

- 🤖 **AI/ML Complaint Management**  
  Automatically categorizes and prioritizes issues using text and image recognition with sentiment analysis.

- 🗺️ **Geo-tagged Reporting**  
  Citizens can report issues with precise location data, images, and view them on a live heatmap.

- 📊 **Real-time Dashboards**  
  Role-based dashboards for officials and citizens with complaint statistics, trends, and resolution progress.

- 🗣️ **Multilingual & Inclusive**  
  Interface supports multiple languages to ensure accessibility for all citizens.

- 🔐 **Transparent & Auditable**  
  All official actions are logged with full audit trails for accountability.

- 🌐 **Modular Architecture**  
  Built with React, Python, Supabase, and microservices to support scalable, secure deployments.

## 📋 Installation Guide

### Prerequisites

- Node.js v18+ and npm/bun
- Python 3.10+
- Git
- Supabase account (for database and authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nirvan.git
cd nirvana
```

### 2. Frontend Setup

The frontend is built with React, TypeScript, and Vite for lightning-fast performance.

```bash
cd frontend

# Install dependencies using npm
npm install
# OR using Bun for faster installation
bun install

# Create environment file
cp .env.example .env

# Add your Supabase credentials to .env file
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_KEY=your_supabase_anon_key

# Start development server
npm run dev
# OR
bun run dev
```

The frontend will be available at http://localhost:5173

### 3. Backend Setup

The backend uses Python with Flask and ML models for intelligent complaint processing.

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (Windows PowerShell)
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_KEY="your_supabase_key"
$env:ACCESS_TOKEN="your_whatsapp_access_token"
$env:PHONE_NUMBER_ID="your_whatsapp_phone_number_id"
$env:VERIFY_TOKEN="your_verify_token"

# Start the backend server
python send_message.py
```

The backend API will be available at http://localhost:5000

### 4. ML Model Setup

Nirvan uses machine learning models for complaint categorization and prioritization.

```bash
cd backend/models

# Train and save the priority model (if needed)
python priority_model.py

# Ensure model files are present:
# - category_encoder.pkl
# - priority_model.pkl
```

### 5. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Set up the necessary tables for complaints, users, and notifications
3. Update the Supabase URL and anon key in both frontend and backend environment variables

## 🧩 System Architecture

- **Frontend:** React with TypeScript, Vite, Tailwind CSS, and shadcn/ui components
- **Backend:** Python with Flask for API endpoints
- **Database & Auth:** Supabase for PostgreSQL database and authentication
- **ML Services:** Scikit-learn models for categorization, priority determination, and sentiment analysis
- **Data Sync:** Real-time updates via Supabase live queries
- **Maps:** Leaflet.js for interactive geospatial visualizations

## 🏛️ Use Cases

- **Municipalities:** Modernize public grievance redressal systems
- **Government Agencies:** Deploy scalable civic engagement tools
- **NGOs:** Promote transparent governance and citizen participation
- **Smart City Initiatives:** Integrate with existing urban infrastructure
- **Disaster Response:** Coordinate rapid response during emergencies

## 💼 Revenue Model

- SaaS subscriptions for local governments with tiered pricing
- White-label solutions for private/civic organizations
- Premium analytics dashboards with predictive insights
- API access for civic tech developers and third-party integrations
- Sponsored public awareness campaigns and educational modules

## 🌍 Future Roadmap

- Voice-based complaint registration with dialect recognition
- AI-powered predictive maintenance alerts
- AR visualization of complaint locations and status
- Blockchain integration for immutable complaint records
- API marketplace for third-party civic applications

## 🤝 Contributing

We welcome contributors who are passionate about civic technology and transparency. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Team - team@nirvan

Project Link: [https://github.com/er-anubhav/nirvana](https://github.com/er-anubhav/nirvan)

---

Built by **Team Vercel** to create real change, one complaint at a time.
