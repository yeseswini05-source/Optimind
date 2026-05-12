# Optimind (AI Diary App)

AI-powered journaling and productivity analytics platform built with a React frontend and Express/PostgreSQL backend.

## Overview

Optimind helps users capture daily journal entries, then analyzes them for mood, stress, productivity, sleep, and focus. The app provides:

- Secure user authentication (register/login)
- Personal profile management
- AI-powered diary analysis with NLP extraction
- Productivity and behavioral analytics dashboard
- Journal history with entry-level insights
- AI-generated coaching recommendations using OpenAI/Gemini with a local fallback

## Repository Structure

- `backend/` — Express API server, PostgreSQL integration, JWT authentication, AI analytics, diary routes
- `frontend/` — React app with Tailwind CSS, routing, authentication UI, dashboard and history pages
- `database.sql` — PostgreSQL schema for users, profiles, and diary entries

## Key Features

- **Authentication:** email/password registration and login
- **Diary writing:** save journal entries with automatic NLP extraction
- **Analytics:** average sleep, study, productivity, mood distribution, streak tracking
- **AI insights:** generate personalized recommendations from OpenAI or Gemini
- **History:** review past journal entries and derived metrics
- **Profile:** save name, age, gender, height, and weight

## Tech Stack

- Backend: Node.js, Express, PostgreSQL, `pg`, `bcrypt`, `jsonwebtoken`
- AI: `openai`, `@google/generative-ai`, local fallback insight logic
- Frontend: React, React Router, Tailwind CSS, Recharts, Framer Motion
- NLP/analytics: `vader-sentiment`, custom extraction/metric calculation

## Setup Instructions

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with at least:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

> Note: `GEMINI_API_KEY` is optional if you only want OpenAI support, but the backend can also fall back to local insight logic.

### 2. Database

Initialize the database schema using `database.sql` or your own migration workflow.

```sql
-- database.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password TEXT
);

CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  study_goal TEXT,
  sleep_goal INT
);

CREATE TABLE diary_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The `profile` route also creates the `profiles` table automatically on startup if it does not exist.

### 3. Frontend

```bash
cd frontend
npm install
```

### 4. Run the App

Open two terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm start
```

The frontend expects the backend at `http://localhost:5000`.

## API Endpoints

### Auth

- `POST /auth/register` — register a new user
- `POST /auth/login` — login and receive JWT token

### Diary

- `POST /diary` — save a new diary entry (requires `token` header)
- `GET /diary` — get all diary entries for the logged-in user

### Analytics

- `GET /api/analytics` — compute averages, chart data, mood counts, streak, and recent entries

### AI Insights

- `POST /api/ai-insight` — request an AI coaching insight from OpenAI/Gemini/local fallback

### Profile

- `GET /profile` — fetch the current user profile
- `POST /profile` — create or update the user profile

## Frontend Behavior

- `Home` — marketing landing page with feature overview
- `Signup` / `Login` — register/login user
- `Profile` — save user metadata
- `Diary` — write entries and submit content for AI analysis
- `Dashboard` — view aggregated behavioral analytics and AI insights
- `History` — browse saved journal entries and related metrics

## Notes

- JWT tokens are stored in `localStorage` and sent using the `token` header from the frontend.
- Backend database connection uses `DATABASE_URL` and SSL is enabled by default in `backend/db.js`.
- If OpenAI fails, the AI insight endpoint attempts Gemini, then local fallback text.
- The backend uses PostgreSQL; you may adapt the database config to your environment.

## Troubleshooting

- Ensure the backend is running on port `5000`
- Verify environment variables are set correctly
- Confirm the database schema exists before saving diary entries
- Check browser console/network logs for API errors

## Optional Improvements

- Add migrations or seed scripts
- Persist `study_goal` and `sleep_goal` in the profile schema
- Add logout redirects for expired tokens
- Add frontend environment configuration for production URLs
