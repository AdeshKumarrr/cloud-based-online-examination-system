# ExamDesk — Cloud-Based Online Examination System

A learning project for a Cloud Computing internship. ExamDesk is a responsive web application with student registration/login, admin exam management, timed MCQ attempts, server-side automatic scoring, and result history.

## Features

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
- Student: `student@example.com` / `Student@123`

Change demo passwords and configure a strong `SESSION_SECRET` before any public deployment. These are demonstration credentials, not production credentials.

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

This starter version stores application records in `data/db.json` so it can be run locally without setting up a database server. That makes local demonstration simple, but JSON-file storage is **not appropriate for a multi-instance production deployment** and may be ephemeral on cloud hosts. Before presenting this as a fully cloud-deployed system, configure a managed database such as PostgreSQL, set a strong session secret, use HTTPS, and test the deployment. The app is not deployed by creating this ZIP; deployment is a separate step.

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