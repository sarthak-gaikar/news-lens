# 📰 NewsLens

**NewsLens** is a MERN-stack web application that provides unbiased, categorized, and reliable news aggregation — inspired by the clean and informative design of **GroundNews**.  
It enables users to view news articles from multiple sources, analyze media bias, and personalize content preferences for a balanced perspective.

---

## 🚀 Features

- 🧭 **Bias Detection Engine:** Analyzes and labels news articles based on political or ideological bias using a custom logic module.  
- 📰 **News Aggregation:** Fetches live news from multiple trusted APIs.  
- 🎯 **User Preferences:** Users can save favorite categories like business, sports, technology, etc.  
- 🔐 **Authentication:** Secure user registration and login using JWT and bcrypt.  
- ⚙️ **Responsive UI:** Built with React for a smooth, modern experience.  
- 🌗 **Dark/Light Mode Support (planned).**  
- 🧠 **AI-powered Article Insights (future scope).**

---

## 🏗️ Tech Stack

| Layer | Technology Used |
|-------|------------------|
| **Frontend** | React.js, Context API, CSS Modules |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT + bcrypt |
| **News API** | NewsAPI / Custom Scraper |
| **Hosting (optional)** | Render / Vercel / Netlify |

---

## 📂 Project Structure
news-lens/
│
├── client/ # React Frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # App pages (Home, Login, Register, Preferences)
│ │ ├── services/ # API interaction logic
│ │ ├── context/ # Auth and App contexts
│ │ └── App.js
│ └── package.json
│
├── server/ # Express Backend
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API endpoints (auth, news, preferences)
│ ├── controllers/ # Route handlers and logic
│ ├── middleware/ # Auth middleware
│ ├── config/ # Database connection and constants
│ └── index.js # Main server file
│
├── .env # Environment variables
├── package.json
└── README.md

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory with the following values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NEWS_API_KEY=your_news_api_key
```

---

## 🧭 Installation & Setup
# 1️⃣ Clone the repository
```bash
git clone https://github.com/sarthak-gaikar/news-lens.git
cd news-lens
```

# 2️⃣ Install dependencies
For Backend
```bash
cd server
npm install
```

For Frontend
```bash
cd ../client
npm install
```

# 3️⃣ Run the development servers
Start the backend
```bash
cd server
npm start
```

Start the frontend (in a new terminal)
```bash
cd client
npm start
```

Frontend will run on http://localhost:3000
Backend API will run on http://localhost:5000

---

## 🔐 API Endpoints Overview
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	User login
GET	/api/news	Fetch news articles
POST	/api/preferences	Save user preferences
GET	/api/preferences	Retrieve user preferences

---

## 🧠 Bias Detection Logic
The Bias Detection Module analyzes each article's:
Source reliability
Political leaning of the publication
Linguistic sentiment of the headline
Keyword framing

It classifies articles into bias categories like:
Left, Center, Right, or Neutral

Future plans: integrate with ML-based bias classifiers and fact-check APIs for improved accuracy.

## 💡 Future Enhancements
🗞️ Advanced AI bias detection model
📊 Personalized analytics dashboard
🌐 Global news filtering by region
📱 Progressive Web App (PWA) version
💬 Comment & discussion feature for articles
