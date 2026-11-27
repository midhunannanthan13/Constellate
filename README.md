# Constellate

> **Your habits, written in stars.**

Constellate is an astronomy-inspired habit tracker where every active habit is a star in your personal night sky. Each daily check-in illuminates a new star in that habit's celestial region and draws a glowing line to the previous consecutive day. Seven days in a row completes that habit's constellation with an aurora shimmer.

---

## ✨ Features

- **JWT Authentication & Friend Codes:** Sign up and sign in using username or email with persistent sessions, token refresh, and an auto-generated unique `STAR-XXXXXX` friend code.
- **Habits & Daily Check-Ins:** Create, edit, archive, and delete habits with custom Aurora colours and weekly frequency goals (`1–7` days/week). Check in once per day per habit with optional reflection notes and server-calculated current/best streaks.
- **My Sky (Interactive Night Sky):** Each habit owns a deterministic region of the sky. Bright "home stars" grow with streaks, consecutive check-ins link via softly luminous beams, and 7-day streaks shimmer with celebratory sparkles. Includes a "Today" quick check-in panel.
- **Weekly Sky Report:** Bento-grid analytics powered by a MySQL view (`weekly_habit_summary_view`) comparing this week vs. last week, showing best current streak, most consistent habit, quietest weekday over 4 weeks, a glowing 7-day bar chart, and per-habit goal progress.
- **Friends' Sky:** Add friends via friend code, accept or decline requests, and visit accepted friends' skies read-only using an explicit SQL `INNER JOIN` between `friendships` and `habits`.
- **Milestone Badges:** Automatically awards **First Star**, **Seven Nights**, **Twenty-One Nights**, and **Full Week** on the server, displayed on a glowing Profile Badge Shelf with one-time celebrations.

---

## 📄 Pages Overview

- **Welcome (`/welcome`):** Aurora Night hero banner introducing Constellate, feature overview cards, and quick links to sign in or sign up.
- **Sign Up (`/signup`) & Sign In (`/signin`):** Frosted glass authentication forms with show/hide password toggles, inline validation errors, and loading states.
- **My Sky (`/sky`):** The signed-in home page featuring the interactive SVG night sky, star inspection popovers, the "Today" quick check-in panel, and your Friend Code card.
- **Habits (`/habits`):** Management dashboard to add, edit, archive/restore, delete, and quick-toggle habits.
- **Habit Detail (`/habits/:id`):** Individual habit view showing current streak, best streak, 30-day completion percentage, and an interactive 30-day calendar strip.
- **Weekly Sky Report (`/report`):** Bento-style summary cards, 7-day glowing bar chart (with a screen-reader table alternative), and goal progress bars.
- **Friends (`/friends`):** Manage your Friend Code, send friend requests by code, accept/decline incoming requests, cancel outgoing requests, and open friends' skies.
- **Friend's Sky (`/friends/:friendId/sky`):** Read-only view of an accepted friend's constellations with a clear viewing banner and no check-in controls.
- **Profile (`/profile`):** Account summary, Friend Code copy card, and the 4-badge **Badge Shelf** showing earned glowing badges and locked hints.
- **Design System Preview (`/preview`):** Live showcase of the Aurora Night colour palette, Sora/Inter typography, buttons, forms, and glass cards.

---

## 🛠️ Tech Stack

- **React 18 & React Router v6:** Powers the single-page UI, protected routes, and `AuthContext` session state (`frontend/src/`).
- **JavaScript (ES6+):** Handles deterministic star coordinate hashing, local date formatting, API requests, and interactive UI state.
- **Plain CSS (`frontend/src/index.css`):** Implements the Aurora Night design system (glass panels, glows, responsive grids, focus rings, and `prefers-reduced-motion`).
- **Django & Django REST Framework (`backend/`):** Provides REST API endpoints, validation, serializers, and strict per-user data isolation.
- **SimpleJWT:** Issues and refreshes JSON Web Tokens for stateless authentication.
- **MySQL (`constellate_db`):** Stores relational data with foreign keys, `UNIQUE` and `CHECK` constraints, indexes, and the `weekly_habit_summary_view` SQL view.
- **Git:** Tracks stage-by-stage development history and release tags.

---

## 🗄️ Database Schema & MySQL View

All tables live in MySQL database `constellate_db`:

- **`auth_user`:** Built-in Django user table (`id`, `username`, `email`, `password`, `first_name`, `date_joined`).
- **`profiles`:** One-to-one with `auth_user` (`user_id` unique FK), holding unique `friend_code` (`UNIQUE`, indexed).
- **`habits`:** Linked to `auth_user` (`user_id` FK), with `name`, `colour`, `days_per_week_goal` (`1–7`), `archived`, `created_at`, and composite indexes `(user_id, archived)` and `(user_id, created_at)`.
- **`check_ins`:** Linked to `habits` (`habit_id` FK), with `date` and optional `note`. Enforces `UNIQUE (habit_id, date)` so a habit has at most one check-in per day, plus indexes on `(habit_id, date)` and `date`.
- **`friendships`:** Links `requester_id` and `receiver_id` (`auth_user` FKs) with `status` (`pending` or `accepted`). Enforces `UNIQUE (requester_id, receiver_id)`, `CHECK (requester_id <> receiver_id)`, and composite indexes on `(requester_id, status)` and `(receiver_id, status)`.
- **`badges`:** Linked to `auth_user` (`user_id` FK), with `badge_type`, `earned_at`, and `seen`. Enforces `UNIQUE (user_id, badge_type)`.
- **MySQL View — `weekly_habit_summary_view`:** Joins `habits` and `check_ins` to compute `this_week_checkins` (last 7 days including today), `last_week_checkins` (previous 7 days), and `days_per_week_goal` per habit.

---

## 🔌 API Endpoints

All routes except `/api/health/`, `/api/auth/signup/`, `/api/auth/signin/`, and `/api/auth/token/refresh/` require a `Bearer` JWT token.

| Method & Path | Purpose |
| :--- | :--- |
| `GET /api/health/` | API health check |
| `POST /api/auth/signup/` | Register a new user and auto-generate a friend code |
| `POST /api/auth/signin/` | Sign in with username or email and receive JWT tokens |
| `POST /api/auth/token/refresh/` | Refresh an expired access token |
| `GET /api/auth/profile/` | Get signed-in user's username, email, and friend code |
| `GET /api/sky/` | Single-request payload of active habits, streaks, and 60-day check-ins |
| `GET, POST /api/habits/` | List active/archived habits or create a new habit |
| `GET, PATCH, DELETE /api/habits/<id>/` | Retrieve (with 30-day history), edit, or delete a habit |
| `POST /api/habits/<id>/archive/` | Toggle archived state |
| `POST /api/habits/<id>/checkin/` | Check in for today or a past date (rejects future & duplicates; awards badges) |
| `POST /api/habits/<id>/uncheck/` | Remove a check-in for a given date |
| `GET /api/reports/weekly/` | Weekly Sky Report powered by `weekly_habit_summary_view` |
| `GET /api/friends/` | Own friend code, accepted friends, incoming and outgoing requests |
| `POST /api/friends/request/` | Send friend request by friend code |
| `POST /api/friends/requests/<id>/accept/` | Accept an incoming friend request |
| `POST /api/friends/requests/<id>/decline/` | Decline an incoming friend request |
| `DELETE /api/friends/<id>/` | Remove a friend or cancel an outgoing request |
| `GET /api/friends/<friend_id>/sky/` | Read-only friend sky via `INNER JOIN` between `habits` and `friendships` |
| `GET /api/badges/` | List all 4 badges with earned status, date, and `is_new` flag |
| `POST /api/badges/seen/` | Mark newly earned badges as seen |

---

## 🚀 Setup & Running Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- MySQL Server running locally on `127.0.0.1:3306`

### 2. Create the MySQL Database
Open MySQL Workbench (or MySQL CLI) and run:
```sql
CREATE DATABASE IF NOT EXISTS constellate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure & Run the Backend
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Create `backend/.env` from `backend/.env.example`:
   ```bash
   cp .env.example .env
   ```
   Open `backend/.env` and set `DB_PASSWORD` to your local MySQL `root` password.
3. Run migrations and load demo data:
   ```bash
   python manage.py migrate
   python manage.py seed_demo
   ```
4. Start the Django server (`http://127.0.0.1:8000`):
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

### 4. Install & Run the Frontend
1. Open a second terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌟 Signing In with the Demo Account

After running `python manage.py seed_demo`, sign in at **[http://localhost:3000/signin](http://localhost:3000/signin)** with:
- **Username:** `stargazer_demo`
- **Password:** `constellate123`

This demo account includes 4 habits across 6 weeks of check-ins, a completed 7-day constellation, earned badges, and an accepted friend (`luna_friend`, password `constellate123`) so you can immediately explore **My Sky**, **Weekly Report**, **Friends' Sky**, and **Profile**.

---

## 📁 Folder Structure

```text
constellate/
├── backend/
│   ├── accounts/              # Profile model, friend codes, JWT auth endpoints
│   ├── badges/                # Badge model, auto-awarding service, backfill command
│   ├── constellate_backend/   # Django settings, MySQL config, root URLs
│   ├── friends/               # Friendship model, requests, SQL JOIN friend sky
│   ├── habits/                # Habit & CheckIn models, MySQL view migration, seed_demo
│   ├── .env.example           # Template environment variables
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, NightSky, Starfield, ProtectedRoute, StylePreview
│   │   ├── context/           # AuthContext (JWT persistence & offline resilience)
│   │   ├── hooks/             # usePageTitle
│   │   ├── pages/             # Welcome, SignIn, SignUp, MySky, Habits, HabitDetail, WeeklyReport, Friends, FriendSky, Profile
│   │   ├── services/          # Centralized API client
│   │   ├── App.jsx
│   │   ├── index.css          # Aurora Night design system stylesheet
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🤖 Development & Accessibility Note

This entire application was built exclusively by prompting an AI agent (zero code written or pasted by hand), progressing stage-by-stage with Git history. Accessibility features—including high-contrast text, Aurora Teal keyboard focus rings, explicit form labels, <kbd>Escape</kbd>-closable modals, screen-reader sky/chart/badge text alternatives, and `prefers-reduced-motion` support—were designed into every screen, though the app has not undergone a formal third-party accessibility audit.
