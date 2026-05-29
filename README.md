# 📰 NewsLens

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/node.js-%236DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript" />
</p>

---

**NewsLens** is a modern, full-stack MERN (MongoDB, Express, React, Node.js) web application designed to promote media literacy and transparency in news consumption. It aggregates articles across various categories, runs them through a custom lexicon-based Natural Language Processing (NLP) pipeline to evaluate political bias, and presents a customized reading experience. 

By tracking user interactions and preferences, NewsLens constructs personalized feeds, maps media bias trends visually, and balances the news landscape for its users.

---

## 🚀 Key Features

*   **📡 Smart News Aggregation & Ingestion:** Connects to the external **NewsAPI** and ingests top-headlines dynamically. Implements server-side caching using MongoDB to guarantee optimal loading times and adhere to API rate limits.
*   **🧠 Custom Bias Detection Engine (NLP):**
    *   Calculates political leaning on a spectrum from **Left** to **Right** utilizing a weighted lexicon.
    *   Normalizes and processes text by tokenizing and stemming using `Natural.js` (**PorterStemmer**).
    *   Generates a final normalized score (-1 to +1), confidence levels (0% to 100%), and maps keywords that influenced the rating.
    *   Supports a **Neutral Override** to filter purely factual, non-political reporting.
*   **🔐 Enterprise-Grade Session Security:** Built-in signup and login with secure **JWT (JSON Web Tokens)** session tracking and secure salt-hashed passwords utilizing **bcrypt.js**.
*   **⚙️ Advanced User Personalization:**
    *   **Public Preview:** Guests can view a curated preview showing the top 3 stories in each news category.
    *   **Personalized Feed:** Logged-in users receive customized streams filtered according to their topic preferences and bias thresholds.
    *   **Custom Interactivity:** Easily **Like** (❤️) and **Save** (🔖) articles for future reading.
*   **📊 Insights & Statistics:** User profile analytics displaying dynamic stats on articles read, liked, and saved, paired with complete preference management.
*   **🔄 Automated Ingestion Scheduler:** Background runner that automatically triggers every hour to keep the database up-to-date. Control endpoints allow admins to check status, start, stop, or force manual fetch.
*   **🎨 Responsive Premium Design:** Implemented cleanly in modern **React** using pure **CSS** layouts, dynamic micro-interactions, responsive grids, and SVGs.

---

## 🏗️ Technical Stack

| Layer | Technologies | Primary Purpose / Libraries |
| :--- | :--- | :--- |
| **Frontend** | React (v18), React Router Dom (v6) | Component-based UI, client-side routing, responsive styles |
| **State Management** | Context API | Global authentication, modal control, and optimistic UI updates |
| **Backend API** | Node.js, Express.js | REST API routing, custom controllers, error-handling middleware |
| **Database** | MongoDB, Mongoose (v7) | Document store, advanced index optimization, data modeling |
| **Text Processing** | Natural.js | Tokenization, Porter stemming, stop-word filtering |
| **Security & Auth** | JSON Web Tokens (jsonwebtoken), bcryptjs | Salt-hashing password encryption, stateless JWT auth |
| **HTTP Clients** | Axios | Frontend-to-Backend and Backend-to-NewsAPI communication |

---

## 📂 Project Directory Structure

```text
news-lens/
├── client/                     # React Frontend Application
│   ├── public/                 # Static assets and entry HTML
│   └── src/
│       ├── components/         # Reusable UI Components
│       │   ├── ArticleCard.jsx # Card rendering bias labels, keywords, and interaction toggles
│       │   ├── ArticleCard.css # Styles for interaction indicators, hover cards, bias badges
│       │   ├── AuthModal.css   # Layout styles for unified modal windows
│       │   ├── Header.jsx      # Navigation bar and active profile hooks
│       │   ├── Header.css      # Sticky nav design, links, and user dropdowns
│       │   ├── LoginModal.jsx  # Interactive overlay for user login
│       │   ├── NewsFilters.jsx # Filtering controls (Category, Bias, Source)
│       │   ├── NewsFilters.css # Horizontal dropdown selectors and toggles
│       │   └── RegisterModal.jsx# Interactive overlay for user signup
│       ├── context/
│       │   └── AuthContext.js  # Global session state, modals, and optimistic UI handlers
│       ├── pages/              # Primary Page Views
│       │   ├── Home.jsx        # Curated public index and landing overview
│       │   ├── Home.css        # Hero section styles, stats visualizers
│       │   ├── NewsFeed.jsx    # Personalized news matrix with infinite/paginated control
│       │   ├── NewsFeed.css    # Grid controls, category splits, public warnings
│       │   ├── Profile.jsx     # User statistics, topic checkboxes, and account termination
│       │   └── Profile.css     # Stats cards, form controls, hazard actions
│       ├── services/           # Backend Interface API Services
│       │   ├── api.js          # Axios client interceptors for JWT injection & auto-logout
│       │   ├── auth.js         # API bindings for registration, login, profile, and user stats
│       │   └── news.js         # API bindings for feed querying, categories, sources, and likes
│       ├── utils/
│       │   ├── constants.js    # Global application settings and category mapping
│       │   └── helpers.js      # Date parsing, text summaries, and bias color calculators
│       ├── App.js              # Routing wrapper and Modal anchors
│       ├── App.css             # Main wrapper, general global rules
│       ├── index.js            # Virtual DOM entry point
│       └── index.css           # Global theme variables, reset rules, typography
│
├── server/                     # Node.js Express Backend API
│   ├── controllers/            # Route Logic Handlers
│   │   ├── authController.js   # Logic for JWT creation, user validation, and sanitization
│   │   ├── newsController.js   # Handles feeds, categories, sources, and metadata stats
│   │   ├── schedulerController.js# Provides management commands for the background worker
│   │   └── userController.js   # Tracks interactions, likes, bookmarks, and preferences
│   ├── middleware/             # Express Interceptors
│   │   ├── auth.js             # JWT extraction, signature verify, and request decoration
│   │   └── errorHandler.js     # Unified JSON error response system for Mongoose/server faults
│   ├── models/                 # Mongoose Database Models
│   │   ├── Article.js          # Ingested article schema with embedded bias subdocuments
│   │   ├── User.js             # User credentials, preferences, history, and bookmarks
│   │   └── UserPreferences.js  # Dedicated preferences cache (unused in main user document)
│   ├── routes/                 # Express Router Definitions
│   │   ├── auth.js             # Routes for registration, login, and profile fetching
│   │   ├── news.js             # Routes for public feeds, personalized streams, categories
│   │   ├── scheduler.js        # Controller routes for background services
│   │   └── users.js            # User statistics, history tracking, interactions
│   ├── services/               # Core Backend Subservices
│   │   ├── biasService.js      # Stemmer-based weighted NLP analyzer
│   │   ├── newsScheduler.js    # Background scheduler instance (setInterval)
│   │   └── newsService.js      # NewsAPI fetchers, backup mock feed, and categorization
│   ├── utils/
│   │   └── database.js         # Mongoose connection wrappers with reconnect fallback
│   ├── .env                    # Local environment variables
│   ├── app.js                  # App middleware setup and route aggregation
│   └── server.js               # DB connection & server initialization
│
├── package.json                # Project description
└── README.md                   # System Documentation
```

---

## 🗄️ Database Schemas & Models

### 1. `Article` Schema (`server/models/Article.js`)
Stores imported articles, mapped categories, and their calculated bias properties.
```javascript
{
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  content: { type: String, trim: true },
  source: { type: String, required: true, trim: true },
  url: { type: String, required: true, unique: true, trim: true },
  imageUrl: { type: String, trim: true },
  publishedAt: { type: Date, default: Date.now },
  category: { 
    type: String, 
    default: 'general',
    enum: ['general', 'technology', 'politics', 'business', 'entertainment', 'sports', 'health', 'science']
  },
  bias: {
    score: { type: Number, min: -1, max: 1, default: 0 }, // -1 (Left) to +1 (Right)
    label: { type: String, enum: ['left', 'center', 'right', 'neutral'], default: 'neutral' },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    keywords: [String] // Keywords matching bias lexicons
  }
}
// Optimized Indexes:
// - { category: 1, publishedAt: -1 }
// - { 'bias.label': 1 }
// - { source: 1 }
// - { publishedAt: -1 }
```

### 2. `User` Schema (`server/models/User.js`)
Controls identities, hashed passwords, dynamic likes, saves, preference settings, and reading history.
```javascript
{
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  preferences: {
    topics: { type: [String], default: ['technology', 'politics', 'business', 'entertainment'] },
    sources: { type: [String], default: [] },
    biasFilter: {
      left: { type: Boolean, default: true },
      center: { type: Boolean, default: true },
      right: { type: Boolean, default: true },
      neutral: { type: Boolean, default: true }
    }
  },
  readingHistory: [{
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    readAt: { type: Date, default: Date.now },
    interaction: { type: String, enum: ['read', 'liked', 'saved'], default: 'read' }
  }],
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
}
```

---

## 🔌 API Endpoints Reference

### 🔐 Authentication Endpoints (`/api/auth`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Sign up a new user; returns a session JWT. | None |
| `POST` | `/login` | Authorize a user; returns a session JWT. | None |
| `GET` | `/profile` | Retrieve the authenticated user's details. | JWT |

### 🧭 User Interactions (`/api/users`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `PUT` | `/preferences` | Modify topic interests, sources, and bias filtering criteria. | JWT |
| `GET` | `/history` | Fetch the user's recent reading history list (max 50 entries). | JWT |
| `POST` | `/interaction` | Log a reading event when a user opens an article. | JWT |
| `POST` | `/toggle-interaction` | Like or Bookmark an article dynamically (adds/removes ID). | JWT |
| `GET` | `/stats` | Returns counts for Total Read, Total Liked, and Total Saved. | JWT |

### 📰 News Stream Endpoints (`/api/news`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/public-feed` | Fetches a default global feed (default: 3 articles) for guests. | None |
| `GET` | `/public-preview` | Aggregates the 3 most recent articles across *every* category. | None |
| `GET` | `/bias-stats` | Calculates cumulative counts of articles stored per bias label. | None |
| `GET` | `/categories` | Fetches the full enum of active news topics. | None |
| `GET` | `/sources` | Returns a list of unique publishing sources cached in the DB. | None |
| `GET` | `/feed` | Fetches a user's customized feed based on their chosen filters. | JWT |
| `GET` | `/refresh` | Manually triggers the ingestion engine and returns the updated feed. | JWT |
| `GET` | `/article/:id` | Returns the detailed entry for a single article by MongoDB ID. | JWT |

### 🔄 Ingestion Scheduler Endpoints (`/api/scheduler`)
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/status` | Fetches whether the scheduler background interval is active. | None |
| `POST` | `/start` | Starts the automatic background hourly ingest worker. | JWT |
| `POST` | `/stop` | Shuts down/clears the hourly background ingestion timer. | JWT |
| `POST` | `/fetch-now` | Instantly runs the parallel category ingestion cycle manually. | JWT |

---

## 🧠 Core Processing Engines & Mechanics

### 1. Custom Lexicon Bias Detection (`server/services/biasService.js`)
The engine measures political bias using a **Weighted Lexicon-based Model** coupled with natural language preprocessing:
1.  **Keyword Database:** Dictionaries mapping root political, economic, or social terms to dynamic weight values:
    *   **Left (Examples):** `progressive` (2), `social justice` (3), `wealth tax` (3), `corporate greed` (3), `lgbtq+` (2).
    *   **Right (Examples):** `conservative` (2), `free market` (2), `border security` (3), `woke` (3), `constitutional` (1).
    *   **Neutral (Examples):** `report`, `study`, `data`, `according to`, `analysis`, `statistics`.
2.  **Tokenization and Stemming:** Concatenates an article's title, description, and contents, stripping common stop words. Tokens are processed using `PorterStemmer` so terms like "progressives", "progressing", or "progressive" normalize to `"progressiv"` for unified lookups.
3.  **Weighted Aggregation:** Computes separate `leftScore` and `rightScore` based on matched stems multiplied by keyword weights.
4.  **Spectrum Calculation:**
    $$\text{biasScore} = \frac{\text{rightScore} - \text{leftScore}}{\text{rightScore} + \text{leftScore}}$$
    *   Result values fall perfectly between `-1.0` (Absolute Left) and `+1.0` (Absolute Right).
5.  **Label Mapping & Neutral Override:**
    *   Maps spectrum values to buckets: `left` ($< -0.6$), `leaning-left` ($-0.6$ to $-0.15$), `leaning-right` ($0.15$ to $0.6$), and `right` ($> 0.6$).
    *   If the bias matches are less than 3, the label defaults to `center`.
    *   **Neutral Override:** If bias scores sit close to center, but neutral keywords outweigh the political ones, the article is labeled `neutral` to represent purely objective, scientific, or factual reporting.

### 2. Category Fallback Resolver (`server/services/newsService.js`)
When articles are aggregated from NewsAPI, the engine accurately filters and maps them:
1.  **Context-First Mapping:** Trust-validates the query category context returned directly from the API endpoint during parallel fetching.
2.  **General Fallback Lexicon:** If articles are imported from a generic overview feed, it scans both `title` and `description` for categorical keywords to accurately map them to one of the 8 core categories:
    *   **technology:** `tech`, `ai`, `software`, `apple`, `google`, `crypto`
    *   **politics:** `politic`, `election`, `congress`, `democrat`, `republican`
    *   **business:** `business`, `economy`, `stocks`, `finance`, `corporate`
    *   **health:** `health`, `medical`, `fda`, `covid`, `hospital`
    *   **sports:** `sport`, `nfl`, `nba`, `soccer`, `league`
    *   **entertainment:** `movie`, `music`, `hollywood`, `celebrity`, `film`
    *   **science:** `science`, `nasa`, `space`, `climate`, `planet`
    *   If no keyword rules are hit, it defaults to the `general` category.

### 3. Background Hourly Scheduler (`server/services/newsScheduler.js`)
*   Automatically initializes during server startup if `ENABLE_SCHEDULER` is set to `true` (default).
*   Registers a robust `setInterval` timer executing every **1 hour (3,600,000 milliseconds)**.
*   Spawns asynchronous, concurrent requests across all 7 news categories, fetching up to **70 articles** in parallel to update the news cache.
*   Integrates graceful shutdown handlers (`SIGTERM` and `SIGINT`) to systematically clear internal intervals before the server stops, avoiding dangling memory references.

---

## ⚙️ Environment Configuration

Set up local credentials by establishing `.env` configuration files in both parent directories:

### 1. Server Environment (`server/.env`)
```env
# Server Port
PORT=5000

# MongoDB Connection String (Local or MongoDB Atlas Cloud URI)
MONGODB_URI=mongodb://127.0.0.1:27017/newslens

# Secret Key for JWT Token Signatures
JWT_SECRET=your_jwt_secret_secure_key_string

# External NewsAPI.org Access Key (Leave empty to use built-in Mock fallback data)
NEWS_API_KEY=your_news_api_key_from_newsapi_org

# Node Deployment Mode (development / production)
NODE_ENV=development

# Background Ingest Scheduler Control (true / false)
ENABLE_SCHEDULER=true
```

### 2. Client Environment (`client/.env`)
```env
# Address of the backend API Gateway
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧭 Installation & Setup Guide

### Prerequisites
*   **Node.js** (v16.x or newer)
*   **MongoDB** (Community Server running locally or Atlas Cloud Cluster instance)

### Step-by-Step Execution

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/sarthak-gaikar/news-lens.git
    cd news-lens
    ```

2.  **Configure Server Dependencies & Env:**
    ```bash
    cd server
    npm install
    ```
    *   Create `server/.env` and paste the parameters from the **Server Environment** template.

3.  **Configure Client Dependencies & Env:**
    ```bash
    cd ../client
    npm install
    ```
    *   Create `client/.env` and insert `REACT_APP_API_URL=http://localhost:5000/api`.

4.  **Run Development Servers:**
    *   **Backend Server:** Run inside the `/server` directory:
        ```bash
        npm run dev
        ```
    *   **Frontend Server:** In a **new terminal tab**, navigate to `/client` and run:
        ```bash
        npm start
        ```

*   The frontend interface will open automatically in your browser at `http://localhost:3000`.
*   The API service is accessible directly at `http://localhost:5000`.

---

## 💡 Future Scope & Roadmap

*   **📈 Media Bias Visual Analytics:** Interactive charts tracking a user's reading spectrum over time.
*   **🤖 Advanced NLP Pipelines:** Upgrade the current lexicon model to machine learning architectures (e.g., fine-tuned BERT models) for semantic context evaluation.
*   **📰 Source Integrity Indexes:** Ingest source reputation metrics to provide insight into overall publisher reliability alongside bias checks.
*   **🛡️ Fact-Checking Linkers:** Integrate real-time hooks into third-party verification resources (like Snopes or PolitiFact) to highlight false or disputed reports automatically.
