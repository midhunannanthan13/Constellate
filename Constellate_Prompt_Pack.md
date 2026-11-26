# Constellate: Prompt Pack
### Build a full-stack app with an AI agent, using prompts only. No code written. No code pasted.

**The app:** Constellate turns your daily habits into stars. Every check-in lights a star. A steady week connects your stars with glowing lines until they form a constellation in your own night sky. Friends can visit your sky, and a weekly sky report shows how you did.

**Your five subjects, all used:** JavaScript (app logic, dates, animation), React (the interface), Django (the REST API), MySQL (the data), Git (version history).

**No deployment.** The app runs on your own computer with your local MySQL in Workbench.

> **The rule you are following:** you give the agent prompts (plain instructions). The agent writes every line of code and puts it in your project. You never type code and never paste code from a chatbot. This pack contains only prompts, no code.

---

## Part 1: Before you start (10 min)

**Pick your agent tool.** You already have **Antigravity** open in your editor, and it has a free plan. Codex has a limited free allowance. Free allowances can run out within days of heavy use, so if one tool runs out, continue in another one with the same prompts. Check each tool's pricing page for today's limits.

**Make a new empty folder** called `constellate` and open it in your agent tool. Then check three things:
1. Your **MySQL** is running and you can open **Local instance MySQL80** in Workbench.
2. **Python** (3.10 or newer) and **Node.js** (18 or newer) are installed.
3. You know your Workbench root password. You will type it only into the `.env` file the agent creates, never into a prompt.

**Keep your evidence from the first minute:**
- Save every prompt you send in a note called `prompt-log` (copy the prompt text and the date).
- Take a screenshot after each stage.
- The agent makes Git commits, so your Git history is proof too.

**How to work:** send one prompt at a time, wait until the agent finishes, run the app, then move on. Small prompts work better than one giant request, and they use less of your free allowance.

---

## Part 2: Product brief (the idea in plain words)

**Name:** Constellate. **Tagline:** Your habits, written in stars.

**Who it is for:** students and young professionals who want a beautiful, calm way to keep habits.

**Must-have features**
1. Sign up and sign in with email or username and password. Each person sees only their own data.
2. Create habits with a name, a colour, and a goal of days per week. Edit, archive and delete habits.
3. Check in once per day per habit. Un-check if it was a mistake. Add an optional short note.
4. **The Sky:** the home page is a night sky. Every habit is a star. Brightness grows with the current streak. Check-ins draw glowing lines between a habit's stars. Seven days in a row completes that habit's constellation with a small celebration.
5. **Weekly Sky Report:** a page showing the week's check-ins, best streak, the most consistent habit, and the quietest day, using database summaries.
6. **Friends' Sky:** add a friend with a friend code, and view their sky read-only.
7. Badges for milestones (first star, 7-day streak, 21-day streak, full week).

**Nice-to-have (only if time allows)**
- Sign in with Google.
- A shareable image card of your sky.
- Light and dark sky themes.

**Pages:** Welcome, Sign up, Sign in, My Sky (home), Habits, Habit Detail (a calendar strip and its constellation), Weekly Report, Friends, Friend's Sky, Profile.

**Data (tables, in plain words)**
- **users:** name, email, friend code (unique).
- **habits:** belongs to a user; name, colour, days-per-week goal, archived flag, created date.
- **check_ins:** belongs to a habit; the date, optional note. One check-in per habit per day (must be unique).
- **friendships:** two users and a status (pending, accepted). A pair can exist only once.
- **badges:** belongs to a user; badge type and the date it was earned.

---

## Part 3: Design system (the aesthetic: "Aurora Night")

Give this to the agent as the single source of truth for how everything looks.

**Mood:** calm, dreamy, premium. Deep night sky, soft glow, glass panels, gentle motion. Never cluttered.

**Colours**
- Sky background: deep navy `#070B1A`, with a very soft gradient to `#101A3A` near the top.
- Glass panels: white at 6 percent opacity, a 1px border of white at 12 percent, a soft blur behind.
- Star gold (primary): `#FFD76A`
- Aurora teal: `#3EE6C3`
- Aurora violet: `#8B7CFF`
- Aurora pink: `#FF7AC6`
- Text: `#EAF0FF`. Muted text: `#9AA6C7`.
- Success `#4ADE80`, warning `#FFB84D`, error `#FF6B81`.

**Type:** headings in **Sora**, body in **Inter** (both from Google Fonts). Generous spacing. Big, calm headings.

**Shape and depth:** rounded corners (16 to 24 px), soft glows instead of hard shadows, thin borders.

**Motion:** stars twinkle slowly. A check-in makes the star pulse and a line draw itself to the previous star. Page changes fade gently. Completing a constellation shows a short shimmer. Respect the "reduce motion" setting by turning animations off.

**Layout:** a floating glass navigation bar, content in glass cards, a bento-style grid on the dashboard. Fully responsive from phone to wide desktop.

**Accessibility (required):** text contrast of at least 4.5 to 1, a visible keyboard focus ring in aurora teal, every button reachable by keyboard, labels on every form field, meaningful text alternatives for the sky (for example "Reading habit, 5 day streak"), and nothing that relies on colour alone.

---

## Part 4: The Master Prompt (send this FIRST)

Copy everything inside the box and send it as your first message.

```
You are my senior full-stack engineer. I will build an app using only prompts, so you must write ALL the code, run ALL the commands, and create ALL the files yourself. Never ask me to write or paste code. If you need something only I can do (for example type my MySQL password into a settings file), tell me the exact steps in plain words.

APP: "Constellate" - a habit tracker where every habit is a star in a personal night sky. Each daily check-in lights the star and draws a glowing line to the previous one. Seven days in a row completes that habit's constellation. Tagline: Your habits, written in stars.

STACK (required):
- Backend: Django with Django REST Framework, JWT authentication (SimpleJWT), CORS enabled for the React dev server.
- Database: MySQL, running locally on my computer. Database name: constellate_db. Connect as the root user on localhost port 3306. Read the database name, user, password, host and port from a backend/.env file. Create that .env file with a placeholder password and tell me where to type my real password. Never put the password in source code. Create a .env.example and a .gitignore that keeps .env, virtual environments and node_modules out of Git.
- Frontend: React 18 with React Router and hooks, plus Context for auth state. Plain CSS in one organised stylesheet (no heavy UI framework).
- Version control: Git. Initialise a repository now and make a clear commit after every finished stage, using short messages in the form "feat: ..." or "fix: ...".

FOLDERS: constellate/backend (Django project) and constellate/frontend (React app). Add a README at the root that explains what the app is, how to set it up and run it, and a short note that it was built entirely by prompting an AI agent.

DATABASE DESIGN (use real MySQL features):
- users (with a unique friend code), habits, check_ins, friendships, badges.
- Use primary keys, foreign keys, a UNIQUE rule so a habit has only one check-in per day, a UNIQUE rule so a friendship pair cannot repeat, sensible defaults, and indexes on the columns used for lookups by user and date.
- Create one SQL view or stored procedure that powers the weekly report (summaries per habit for the last 7 days), and use it from Django.
- The friend's-sky feature must use a JOIN between friendships and habits.

SECURITY: every API route except sign up and sign in requires login. A user can only read or change their own habits and check-ins. A friend can read another user's sky only after the friendship is accepted. Validate all input and return clear error messages.

DESIGN: follow the design system I give you in the next message exactly. Build every screen to be beautiful, responsive and accessible.

HOW TO WORK:
1. Work in stages. Do ONLY stage 1 now: project setup, the database connection, the empty Django and React apps running together, the .env files, the first commit. Do not build features yet.
2. Run everything yourself: create the Python virtual environment, install packages, create the database if it does not exist, run migrations, and start both servers.
3. When the stage works, tell me the two web addresses to open, what I should see, and exactly what you committed.
4. Stop and wait for my next prompt.
```

When it finishes, open the addresses it gives you. If something fails, use the **Fix-it prompt** in Part 6.

---

## Part 5: Prompts to send next, one at a time

After each stage: run the app, check the result, save your prompt and a screenshot, then send the next prompt.

**Stage 2: Design system** (send the Part 3 text, then add this line)
```
Here is the design system for Constellate (paste Part 3 above this line). Create the global styles, colour variables, fonts, a glass card style, a floating navigation bar, buttons, form fields, and a twinkling starfield background that works on every page. Respect the reduce-motion setting. Show me a simple style preview page so I can see the look, then commit with a clear message. Stop and wait.
```

**Stage 3: Accounts**
```
Build accounts. Backend: sign up, sign in, token refresh, and a profile endpoint. Each user gets a unique friend code when created. Frontend: beautiful Welcome, Sign up and Sign in pages in the Aurora Night style, with friendly error messages, a logged-in navigation bar, sign out, and protected pages that send visitors to Sign in. Keep the user signed in after a refresh. Test it yourself end to end, then commit. Stop and wait.
```

**Stage 4: Habits and check-ins**
```
Build habits and check-ins. Backend: create, list, edit, archive and delete habits; check in and un-check for a given day; one check-in per habit per day; calculate each habit's current streak and best streak on the server. Frontend: a Habits page to manage habits (name, colour, days-per-week goal) and a Habit Detail page with a calendar strip of the last 30 days. Add loading and empty states that feel designed, not plain. Test everything yourself, then commit. Stop and wait.
```

**Stage 5: The Sky (the star feature)**
```
Build My Sky as the home page. Draw an animated night sky (use an HTML canvas or SVG) where every active habit is a star placed in its own area of the sky. Brightness and size grow with the current streak. Each check-in draws a glowing line from that habit's previous star point to the new one. At 7 days in a row, complete that habit's constellation with a short shimmer and a toast message. Clicking a star opens a small glass card with the habit name, streak and a check-in button. Add a "Check in" quick panel for today. Keep it smooth and readable on phones. Add text alternatives for screen readers. Test it, then commit. Stop and wait.
```

**Stage 6: Weekly Sky Report**
```
Build the Weekly Sky Report page. It must read from the SQL view or stored procedure you created. Show: total check-ins this week, best streak, the most consistent habit, the quietest day of the week, and a small glowing bar chart of check-ins per day. Add a gentle written summary at the top, such as how this week compares with last week. Make it a bento-style grid of glass cards. Test it, then commit. Stop and wait.
```

**Stage 7: Friends' Sky**
```
Build Friends. A user can add a friend using that friend's friend code, accept or decline requests, and see a list of friends. Opening a friend shows their sky read-only (no check-in buttons). Use the JOIN between friendships and habits on the server, and make sure nobody can see another person's sky without an accepted friendship. Add a "copy my friend code" button. Test it with two accounts yourself, then commit. Stop and wait.
```

**Stage 8: Badges**
```
Build badges: first star, 7-day streak, 21-day streak and a full week (all goals met). Award them automatically on the server when a check-in is saved. Show them on the Profile page as a glowing shelf, with a celebration the first time one is earned. Test it, then commit. Stop and wait.
```

**Stage 9: Polish and accessibility**
```
Do a polish and accessibility pass across the whole app. Check colour contrast, keyboard navigation, visible focus rings, form labels, mobile layouts, empty states, error states, and page titles. Make the animations smooth, and fully off when reduce-motion is on. Fix everything you find, tell me a short list of what you fixed, then commit. Stop and wait.
```

**Stage 10: Demo data, README and tags**
```
Prepare the app for my demo. Create a command that fills the database with a demo user, a few habits and several weeks of realistic check-ins so the sky already looks beautiful, plus one friend account. Update the README with setup steps, how to run the demo, a short feature list, and a "built entirely by prompting an AI agent" note. Run a final full check of every page, then make a final commit and add a Git tag called v1.0. Show me the Git log. Stop and wait.
```

**Optional: Sign in with Google** (only after Stage 10 works)
```
Add "Continue with Google" to the Sign in and Sign up pages. Read the Google client ID and client secret from backend/.env (never print them). The redirect address is http://127.0.0.1:8000/api/auth/google/callback/ . Match users by verified email, create a new user if needed, and sign them in with the same JWT as normal. Tell me which two values I must paste into .env. Test the flow as far as you can, then commit. Stop and wait.
```

---

## Part 6: Prompts for when things go wrong

**Fix-it prompt** (copy the error text from the screen into the brackets)
```
Something is broken. Here is exactly what I see: [paste the error message or describe what is wrong]. Find the cause yourself, fix it, run the app again to confirm, and commit the fix with a clear message. Explain in two sentences what was wrong.
```

**It looks plain prompt**
```
This screen does not match the Aurora Night design system. Compare it with the design rules, list what is off, and fix it: spacing, colours, glass panels, glow, fonts and motion. Then show me the result and commit.
```

**It is slow prompt**
```
The sky feels slow on my computer. Find the cause, reduce the work done on each frame, and keep the same look. Test it and commit.
```

**If your free allowance runs out:** stop, switch to another agent tool, open the same folder, and send this first:
```
You are continuing a project that another agent started. Read the README, the Git log and the code. Tell me in five lines what is finished and what is next. Do not change anything yet.
```
Then continue with the next stage prompt.

---

## Part 7: Your evidence for the professor

- [ ] The `prompt-log` note with every prompt you sent, in order.
- [ ] A screenshot after each stage.
- [ ] The Git log showing the commits (ask the agent: "show me the Git log").
- [ ] The README with the "built entirely by prompting an AI agent" note.
- [ ] The tag `v1.0`.
- [ ] A 2-minute demo (script below).

**Demo script**
1. "This is Constellate. I built it using only prompts to an AI agent." Show the prompt log.
2. Sign in as the demo user. Show My Sky: the stars and constellations.
3. Check in a habit. Watch the star pulse and the line draw.
4. Open the Weekly Sky Report.
5. Open a friend's sky.
6. Show the database tables in Workbench and the Git history.
7. "Stack: React, Django, MySQL, JavaScript, Git."

---

## Good to know
- **Results vary.** Agents make mistakes. That is normal. The Fix-it prompt handles most of them.
- **Never paste your password or secret keys into a prompt.** They go only into the `.env` file.
- **One stage at a time** keeps the agent focused and saves your free allowance.
- **This pack is untested with a live agent.** Each tool behaves a little differently, so tell me what the agent does and I will help you adjust the next prompt.
