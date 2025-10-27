# 📰 NewsLens

**NewsLens** is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed to provide a more transparent and balanced news reading experience. It aggregates news articles, analyzes them for political bias using a custom engine, and allows users to personalize their feed.

Inspired by platforms focusing on media literacy, NewsLens aims to help users understand the perspectives presented in the news they consume.

---

## 🚀 Features

* 📰 **News Aggregation & Caching:** Fetches news articles via the **NewsAPI** and caches them locally in MongoDB for performance and rate-limit mitigation.
* 🧭 **Custom Bias Detection Engine:** Analyzes article titles and descriptions using a **weighted lexicon-based model** to score and label political bias (e.g., `Left Leaning`, `Center`, `Right Leaning`, `Neutral`). Also provides a **confidence score** and the **keywords** that influenced the rating.
* 🔐 **Secure User Authentication:** Robust user registration and login using **JWT** (JSON Web Tokens) for session management and **bcrypt** for password hashing.
* ⚙️ **Personalized & Public Feeds:**
    * Logged-in users get a custom news feed based on their saved **topic preferences**.
    * Logged-out users see a **public preview** feed (top 3 articles per category) on the main news page.
    * Homepage features a curated **public feed** (latest 3 articles).
* 👍 **User Interactions:** Logged-in users can **Like** (❤️) and **Save** (🔖) articles. Read interactions are also tracked.
* 📊 **Dynamic Profile & Stats:** A user profile page displays dynamic stats (**Articles Read, Liked, Saved**) and allows users to manage their favorite news topics and delete their account.
* 🔄 **Automatic & Manual Refresh:** A background scheduler automatically fetches new articles hourly. Logged-in users can also trigger a manual refresh.
* 🎨 **Responsive UI:** Built with **React** and **Context API** for a smooth, modern, and state-managed user experience. Features subtle SVG icons for interactions.

---

## 🏗️ Tech Stack

| Layer            | Technology Used                                       |
| ---------------- | ----------------------------------------------------- |
| **Frontend** | React.js, React Router, Context API, Axios, CSS       |
| **Backend** | Node.js, Express.js                                   |
| **Database** | MongoDB (with Mongoose ODM)                           |
| **Authentication** | JWT (jsonwebtoken), bcrypt.js                         |
| **NLP (Bias)** | Natural.js (for tokenizing & stemming)                |
| **News Source** | NewsAPI                                               |
| **Hosting (Optional)** | Render / Vercel / Netlify / Heroku                |

---

## 📂 Project Structure

```

news-lens/
│
├── client/           \# React Frontend
│   ├── public/
│   └── src/
│       ├── components/ \# Reusable UI (Header, ArticleCard, Modals, etc.)
│       ├── context/    \# AuthContext (Global User State)
│       ├── pages/      \# App Views (Home, NewsFeed, Profile)
│       ├── services/   \# API call helpers (api.js, auth.js, news.js)
│       ├── App.js      \# Main router setup
│       ├── index.js    \# Entry point
│       └── ... (CSS files)
│   ├── .env
│   └── package.json
│
├── server/           \# Node.js/Express Backend
│   ├── controllers/  \# Route logic (authController, newsController, userController)
│   ├── middleware/   \# Request interceptors (auth.js for JWT verification)
│   ├── models/       \# Mongoose schemas (Article.js, User.js)
│   ├── routes/       \# API endpoint definitions (auth.js, news.js, users.js)
│   ├── services/     \# Core logic (biasService, newsService, newsScheduler)
│   ├── .env
│   ├── app.js        \# Express app configuration & middleware setup
│   ├── server.js     \# Server entry point & DB connection
│   └── package.json
│
├── .gitignore        \# Files/folders ignored by Git
├── package.json      \# Root package file (optional, for scripts)
└── README.md

````

---

## ⚙️ Environment Variables

Create a `.env` file in the **`server/`** directory with the following values:

```env
# MongoDB connection string (replace with your actual URI)
MONGO_URI=mongodb://127.0.0.1:27017/newslens

# Secret key for signing JWTs (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here_12345

# Port for the backend server
PORT=5000

# Your API key from newsapi.org (required for fetching news)
NEWS_API_KEY=your_news_api_key_from_newsapi_org
````

Create a `.env` file in the **`client/`** directory:

```env
# URL of your running backend server's API
REACT_APP_API_URL=http://localhost:5000/api
```

-----

## 🧭 Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/sarthak-gaikar/news-lens.git](https://github.com/sarthak-gaikar/news-lens.git)
    cd news-lens
    ```

2.  **Install Backend Dependencies:**

    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**

    ```bash
    cd ../client
    npm install
    ```

4.  **Configure Environment Variables:** Create the `.env` files in `/server` and `/client` as described above.

5.  **Run the Development Servers:**

      * **Start the Backend** (from the `/server` directory):
        ```bash
        npm run dev
        ```
      * **Start the Frontend** (in a *new terminal*, from the `/client` directory):
        ```bash
        npm start
        ```

The Frontend will be accessible at `http://localhost:3000`.
The Backend API will be running at `http://localhost:5000`.

-----

## 🔐 API Endpoints Overview

  * **Authentication (`/api/auth`)**
      * `POST /register`: Register a new user.
      * `POST /login`: Log in a user, returns JWT.
      * `GET /profile`: [Protected] Get the logged-in user's profile data.
  * **User Actions (`/api/users`)**
      * `PUT /preferences`: [Protected] Update user's topic preferences.
      * `POST /interaction`: [Protected] Track a 'read' event for an article.
      * `POST /toggle-interaction`: [Protected] Toggle 'like' or 'save' status for an article.
      * `GET /stats`: [Protected] Get user's read, liked, saved counts.
      * `DELETE /delete-account`: [Protected] Delete the logged-in user's account.
  * **News (`/api/news`)**
      * `GET /public-feed`: [Public] Get 3 latest articles for the homepage.
      * `GET /public-preview`: [Public] Get top 3 articles per category for logged-out news feed.
      * `GET /bias-stats`: [Public] Get counts of articles per bias label.
      * `GET /categories`: [Public] Get list of all available news categories.
      * `GET /sources`: [Public] Get list of unique news sources in the DB.
      * `GET /feed`: [Protected] Get personalized, paginated news feed.
      * `GET /refresh`: [Protected] Manually trigger server to fetch new articles.
      * `GET /article/:id`: [Protected] Get details of a single article by ID.

*(**[Protected]** endpoints require a valid JWT in the `Authorization: Bearer <token>` header).*

-----

## 🧠 Bias Detection Logic

The custom Bias Detection engine (`server/services/biasService.js`) works as follows:

1.  **Weighted Lexicon:** It uses dictionaries of keywords associated with 'left' and 'right' political leanings. Each keyword has a **weight** (1-3) indicating its strength as a bias indicator. A separate list tracks 'neutral' reporting terms.
2.  **Text Processing:** Article `title` and `description` are combined, converted to lowercase, **tokenized** (split into words), and **stemmed** (reduced to root form, e.g., "politics" -\> "politic") using the `Natural.js` library.
3.  **Scoring:** The engine iterates through the article's stemmed tokens. For each token matching a keyword, its corresponding weight is added to the `leftScore` or `rightScore`. Neutral words increment a `neutralScore`.
4.  **Calculation:** A raw `biasScore` between -1 (Left) and +1 (Right) is calculated:
    `biasScore = (rightScore - leftScore) / (rightScore + leftScore)`
      * *(Note: `neutralScore` is excluded from the denominator to avoid diluting the political score).*
5.  **Labeling & Confidence:**
      * The `biasScore` is mapped to labels: `left`, `leaning-left`, `center`, `leaning-right`, `right`.
      * A **Neutral Override** changes the label to `neutral` if the score is near center but the `neutralScore` is high.
      * A **Confidence Score** (0-100%) is calculated based on the score's magnitude and the number of keywords found.
      * The final simplified label (`left`, `center`, `right`, `neutral`) and the list of **matched keywords** are returned.

**Limitation:** This model is **lexicon-based** and does **not understand context, nuance, or sarcasm**. It relies solely on the presence and weight of predefined keywords.

-----

## 💡 Future Enhancements

  * **Saved/Liked Articles Page:** Display lists of saved/liked articles on the user profile.
  * **Advanced Bias Model:** Integrate a machine learning (NLP) model for more context-aware bias detection.
  * **Source Reliability Scores:** Add ratings for the credibility of news sources.
  * **Social Sharing:** Allow sharing articles with their bias rating attached.
  * **Fact-Checking Integration:** Link articles to fact-checking resources.
  * **Dark/Light Mode:** Implement theme switching.

<!-- end list -->
