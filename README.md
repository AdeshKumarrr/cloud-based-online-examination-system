# ExamDesk — Cloud-Based Online Examination System

A learning project for a Cloud Computing internship. ExamDesk is a responsive web application with student registration/login, admin exam management, timed MCQ attempts, server-side automatic scoring, and result history.

## Features

- Separate student and admin login choices with server-side role validation
- Student registration and login with bcrypt password hashing
- Separate student and admin roles
- Admin can create MCQ exams and delete exams that have no submitted attempts
- One-time exam attempts per student, server-side scoring, and saved result history
- Countdown timer, question palette, answer navigation, and automatic submission when time expires
- Responsive interface for desktop and mobile
- Health endpoint at `/api/health`

## Requirements

- Node.js 20 or newer
- npm
- Git (for GitHub upload)

## Run locally on Windows

1. Install Node.js LTS from https://nodejs.org/ and Git from https://git-scm.com/downloads if not already installed.
2. Extract the project ZIP and open the `cloud-exam-system` folder in VS Code.
3. Open Terminal in VS Code (`Terminal > New Terminal`).
4. Run:

   ```bash
   npm install
   npm start
   ```

5. Open http://localhost:3000 in your browser.

If PowerShell blocks `npm.ps1`, use Command Prompt as the VS Code terminal or run `npm.cmd install` and `npm.cmd start`. Avoid changing the machine-wide execution policy just to run this project.

## Demo accounts

- Admin: `admin@example.com` / `Admin@123`
- Student: `student@example.com` / `Student@1234`

The login screen offers separate Student Login and Admin Login choices. The credentials above are for local demonstration only. Before public deployment, set a strong `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as environment variables before the first start. Seed accounts are created only when `data/db.json` does not already exist.

## Quick test checklist

1. Sign in as the demo student and open **Examinations**.
2. Start **Cloud Computing Fundamentals**, choose some answers, navigate between questions, and submit.
3. Open **My Results** and confirm the score is recorded.
4. Sign out and sign in as the demo admin.
5. Open **Manage Exams**, create a test exam with at least one question, and confirm it appears for the student.
6. Open `/api/health` and confirm it returns `{"status":"ok", ...}`.

## Project structure

```text
cloud-exam-system/
├── data/
│   └── .gitkeep
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Important implementation note

This learning version stores users, exams, and results in `data/db.json`. It is suitable for local testing or a temporary single-instance demo, but it is **not production storage**: cloud hosts may erase local files during redeploys, and multiple instances cannot safely share this JSON file. For a reliable public deployment, move records to a managed database such as PostgreSQL and use a persistent session store. The app reads the host-provided `PORT` and requires `SESSION_SECRET` in production.

## GitHub upload

Create an empty repository on GitHub, for example `cloud-based-online-examination-system`. In the project terminal run:

```bash
git init
git add .
git commit -m "Build online examination system MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cloud-based-online-examination-system.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Never commit real passwords, `.env` files, private keys, or student personal data.

## Suggested future improvements

- PostgreSQL persistence and database migrations
- Persistent session store
- Exam scheduling and availability windows
- CSV result export
- Unit/integration tests and deployment pipeline
- Cloud deployment with environment variables and a managed database

## Internship report outline

1. Introduction and problem statement
2. Objectives and scope
3. System architecture
4. Tools and technologies
5. Database/storage design
6. Modules and implementation
7. Testing and screenshots from your actual run
8. Cloud deployment setup and limitations
9. Conclusion and future scope

Only describe cloud services that you actually configure and test.