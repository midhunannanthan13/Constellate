# Constellate

> **Your habits, written in stars.**

Constellate is a serene, astronomy-inspired habit tracking web application. Every habit you create is a star in your personal night sky. Daily check-ins illuminate your stars and chart glowing celestial lines between them. Completing a 7-day streak brings that habit's constellation to life.

---

## 🛠️ Stack

- **Backend**: Python 3.11, Django, Django REST Framework, SimpleJWT (JWT Auth), `django-cors-headers`
- **Database**: MySQL (`constellate_db`), running locally on port 3306
- **Frontend**: React 18, React Router v6, Context API, Vanilla CSS (Aurora Night design system)
- **Version Control**: Git

---

## 🚀 Setup & Running Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- MySQL Server (e.g., MySQL 8.0 or WampServer MySQL) running on `localhost:3306`

### 2. Backend Setup
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configure `.env`:
   - Copy `.env.example` to `.env` in `backend/`:
     ```bash
     cp .env.example .env
     ```
   - Update `DB_PASSWORD` with your local MySQL `root` user password.
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start Django API server (runs at `http://127.0.0.1:8000`):
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup
1. Open a terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the React development server (runs at `http://localhost:3000`):
   ```bash
   npm start
   ```

---

## 🤖 Note on Development
This application was built entirely by prompting an AI agent (Google Antigravity), writing zero code by hand, following strict incremental stages with Git version control.
