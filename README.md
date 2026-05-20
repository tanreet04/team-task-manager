# Team Task Manager — Full Stack SaaS Platform

A production-ready full-stack task and project management SaaS application styled like Asana and Notion. Designed for high-velocity development teams, it supports projects, kanbans, charts, team collaborations, and logs.

---

## 🚀 Key Feature Highlights

- **🔒 Proper Authentication**: Secure login, signup, JWT token-based requests, password strength analysis, and route guards.
- **🎨 Glassmorphic Dark UI**: Tailored color palettes, Outfit Display fonts, hover animations, responsive menus, and custom scrollbars built on Tailwind CSS v4.
- **📊 Analytics Dashboard**: Renders interactive charts (Task Status ratios, weekly productivity speeds, member workloads) using Recharts.
- **📋 HTML5 Drag & Drop Kanban**: Drag task cards across column boundaries with instant client-side updates.
- **🔄 Database Self-Healing**: Automatically connects to local MongoDB instance. If not available, it self-heals by starting a RAM-cached Mock Database, allowing immediate offline testing.

---

## 📂 Repository Layout

```
├── backend/
│   ├── config/          # DB connections
│   ├── controllers/     # Express REST router handlers & Mock database
│   ├── middleware/      # JWT guards & authorization checks
│   ├── models/          # Mongoose data schemas
│   ├── server.js        # Server entry
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/  # Collapsible Sidebar & Notification Navbar
│   │   ├── context/     # Auth and Theme provider states
│   │   ├── pages/       # Dashboard, Kanban, Projects, Settings, Landing pages
│   │   ├── services/    # Network Axios client
│   │   ├── App.jsx      # Navigation routing & toast settings
│   │   ├── main.jsx     # App entry
│   │   └── index.css    # Tailwind v4 directives & glass panels
│   ├── vite.config.js   # Vite config & proxy rules
│   └── package.json
```

---

## 🛠️ Setup & Local Launch

### 1. Requirements
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Startup Server & Client

You can run both elements simultaneously:

#### Run REST API Server:
```bash
cd backend
npm install
npm start
```
*Port: `http://localhost:5000`*

#### Run Vite Frontend Server:
```bash
cd client
npm install
npm run dev
```
*Port: `http://localhost:3000`*

---

## 🔐 Credentials for Demo Evaluators

You can log in instantly on the Login screen by clicking the quick-access demo buttons, or input the credentials manually:

| Email | Password | Role |
| :--- | :--- | :--- |
| `tanreet@company.com` | `password123` | **Admin** (Full workspace configuration) |
| `rahul@company.com` | `password123` | **Member** (Resolve cards & leave comments) |

---

## ☁️ Deploying to Railway (Single Monorepo App)

Since we have created a unified root `package.json` file, you can deploy the entire application on Railway in just 3 steps:

### 1. Push to GitHub
Create a GitHub repository and push this codebase to it:
```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2. Connect to Railway
1. Go to [Railway.app](https://railway.app) and log in.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.

### 3. Configure Variables
Under your Railway service settings, navigate to **Variables** and add:
- `PORT` = `8080` (or leave it blank; Railway configures this automatically)
- `NODE_ENV` = `production`
- `JWT_SECRET` = `anyRandomSecureString123`
- `MONGO_URI` = `mongodb://...` *(If you spawn a MongoDB database service on Railway, click `Reference Variable` to link its connection string).*

Railway will automatically run `npm run build` (which installs all packages and bundles the frontend) and then trigger `npm start` to host the platform!

