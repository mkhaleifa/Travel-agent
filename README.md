# 🌍 AI Travel Agent (Full Stack)

An intelligent **AI-powered travel assistant** that helps users plan trips, check weather, search options, and simulate bookings using a **ReAct-based AI agent**.

---

## ✨ Features

* 🤖 AI Agent using **ReAct pattern (Reason + Act)**
* 🌦️ Weather tool integration
* 💬 ChatGPT-style UI
* ✈️ Travel planning (flights & hotels simulation)
* 📩 Email confirmation flow (optional)
* 🔁 Multi-step reasoning with tool usage

---

## 🧠 How It Works

This project follows the **ReAct (Reasoning + Acting)** pattern:

1. User sends a request (e.g., *"Plan a trip to Cairo"*)
2. AI reasons about the task
3. Calls tools (weather, search, etc.)
4. Observes results
5. Generates a final response

```
User → AI Agent → Tool Calls → Results → Final Answer
```

---

## 🏗️ Project Structure

```
travel-agent/
│
├── backend/
│   ├── agent.js        # AI agent (ReAct loop)
│   ├── tools.js        # Tools (weather, booking)
│   ├── server.js       # Express API
│   └── .env            # API keys
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Chat UI
│   │   ├── components/ # UI components
│   │   └── api/        # API calls
│
└── README.md
```

---

## ⚙️ Tech Stack

### 🧠 AI

* Groq API (Llama 3)
* ReAct Agent Architecture

### 🔧 Backend

* Node.js
* Express.js
* CORS
* dotenv

### 🎨 Frontend

* React (Vite)
* Axios
* CSS

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mkhaleifa/TravelAgent.git
cd TravelAgent
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
GROQ_API_KEY=xxxxxxx
```

Run server:

```bash
node server.js
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoint

**POST** `/api/agent`

### Request

```json
{
  "task": "Plan a trip to Cairo",
  "email": "optional@email.com"
}
```

---

## 🚀 Deployment

* Frontend → vercel
* Backend → railway

---

## 🧠 Key Concepts

* ReAct (Reason + Act)
* Tool Calling
* AI Agents
* Prompt Engineering
* Full Stack Integration

---


## 🔮 Future Improvements

* 🧠 Add conversation memory
* 🌐 Integrate real APIs (flights, hotels)
* 📊 Show tool usage in UI
* 🔐 Authentication system

---
## Demo 
** travel-agent-sepia.vercel.app

## 👨‍💻 Author

**Mohamed**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
