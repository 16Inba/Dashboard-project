# Dashboard Project

A full-stack dashboard application with a **Node.js/Express backend** and a **React + Vite frontend**.

## 🚀 Overview

- **Backend**: Express server with REST API routes for orders and dashboard configuration.
- **Frontend**: React app built with Vite that consumes the backend API.

## 📦 Repository Structure

```
backend/          # Express backend
  database.js
  index.js
  controllers/
  models/
  routes/
frontend/         # React + Vite frontend
  src/
  public/
  package.json
```

## ✅ Prerequisites

- Node.js 18+ (recommended)
- npm (comes with Node.js)

## 🧩 Setup & Run

### 1) Backend

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:3000` (or the port shown in the terminal).

### 2) Frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` (default Vite port).

> 🔌 The frontend expects the backend API at `http://localhost:3000`. If you change the backend port, update the base URL in `frontend/src/services/api.js`.

## 📌 GitHub Setup (what you already ran)

If you already created the Git repo and pushed to GitHub, you can confirm with:

```bash
git status
git remote -v
```

If you still need to push, run:

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/16Inba/Dashboard-project.git
git push -u origin main
```

> ⚠️ If `git remote add origin` fails because the remote already exists, use:
> ```bash
git remote set-url origin https://github.com/16Inba/Dashboard-project.git
``` 

## 🧪 Notes & Next Steps

- Add environment variables if you want to connect to a real database (MongoDB, PostgreSQL, etc.).
- Add authentication/authorization if this will be used by multiple users.
- Add tests for backend routes and frontend components.

---

Made with ❤️ by 16Inba.
