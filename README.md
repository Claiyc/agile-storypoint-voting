# 🚀 Agile Story Point Voting App

> **Fully vibe coded – blame the AI, not me.**

Welcome to the next-gen Agile Planning Poker app! Real-time, collaborative, and powered by Nuxt 3, Node.js, Redis, and (optionally) Ollama AI for instant agile insights. Built for teams who want to move fast, vote smart, and look good doing it.

---

## ✨ Features
- **Real-time story point voting** (WebSocket magic)
- **Session creation & sharing** (invite your crew)
- **Configurable voting timer** (no more endless debates)
- **Live member status** (see who’s in, who’s voted)
- **AI-powered agile analysis** (Ollama + deepseek-r1)
- **Dark, modern UI** (your eyes will thank you)
- **Jira integration** (jump straight to your ticket)
- **One-click share/copy** (spread the session love)

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the backend (Node.js + WebSocket + Redis)
cd backend
npm install
npm start

# 3. Start the frontend (Nuxt 3)
cd ..
npm run dev

# 4. Open http://localhost:3000
```

---

## 🐳 Production (Docker)

- **Frontend:** See `Dockerfile` in project root (multi-stage, Nginx static serving)
- **Backend:** See `backend/Dockerfile`
- **Redis:** Use official image (`redis:7-alpine`)
- **Ollama (optional):** [Ollama docs](https://ollama.com/)

---

## ⚡ Tech Stack
- **Frontend:** Nuxt 3, Vue, Vite, modern CSS
- **Backend:** Node.js, Express, WebSocket, Redis
- **AI:** Ollama + deepseek-r1 (optional, for explanations)
- **Infra:** Docker, Kubernetes-ready (Helm chart available)

---

## 🧑‍💻 Dev Tips
- All config via `.env` or environment variables
- Hot reload for both frontend & backend
- Customizable voting timer, session title, and more
- AI explanations require a running Ollama instance (see backend logs for debug)

---

## 🤝 Contributing
PRs welcome! Open an issue, suggest a feature, or just vibe with us.

---

## 🦄 License
MIT — Use, remix, and share. Just don’t blame me if your team votes 100 story points for a 1-hour task.

---

> **Fully vibe coded – blame the AI, not me.**
