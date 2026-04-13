// server.js
// Express backend — receives requests from React frontend,
// runs the agent, and streams the response back.
// Run with: node server.js
// ─────────────────────────────────────────────────────────────────────────────

import express from "express"
import cors    from "cors"
import "dotenv/config"
import { runAgent } from "./agent.js"

const app  = express()
const PORT = process.env.PORT || 3001
const allowedOrigins = [
  "http://localhost:5173",
  "https://travel-agent-xxxx.vercel.app" // ← replace with your real Vercel URL
]

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like Postman)
    if (!origin) return cb(null, true)

    if (allowedOrigins.includes(origin)) {
      return cb(null, true)
    } else {
      return cb(new Error("Not allowed by CORS"))
    }
  }
}))
app.use(express.json())


// ─── POST /api/agent ──────────────────────────────────────────────────────────
// Receives: { task: string, email: string }
// Returns:  { answer, turns, totalTokens, steps }
app.post("/api/agent", async (req, res) => {
  const { task, email } = req.body

  if (!task || task.trim().length === 0) {
    return res.status(400).json({ error: "Task cannot be empty" })
  }

  console.log(`\n[API] New task: "${task}"`)

  try {
    const result = await runAgent(task, {
      verbose:   true,
      userEmail: email || null,
    })

    res.json({
      success:     result.success,
      answer:      result.answer,
      turns:       result.turns,
      totalTokens: result.totalTokens,
      steps:       extractSteps(result.messages),
    })

  } catch (err) {
    console.error("[API] Error:", err.message)
    res.status(500).json({ error: err.message })
  }
})


// ─── Extract readable steps from message history ──────────────────────────────
// Turns the raw messages array into a clean list of steps for the frontend
function extractSteps(messages) {
  const steps = []

  for (const msg of messages) {
    if (msg.role === "assistant") {
      // Tool call step
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tc of msg.tool_calls) {
          let args = {}
          try { args = JSON.parse(tc.function.arguments) } catch {}
          steps.push({
            type:    "tool_call",
            tool:    tc.function.name,
            args,
            id:      tc.id,
          })
        }
      }
      // Thinking text (sometimes AI writes before tool calls)
      if (msg.content && msg.content.trim()) {
        steps.push({ type: "thinking", content: msg.content })
      }
    }

    if (msg.role === "tool") {
      let result = {}
      try { result = JSON.parse(msg.content) } catch { result = { raw: msg.content } }
      steps.push({
        type:        "tool_result",
        tool_call_id: msg.tool_call_id,
        result,
      })
    }
  }

  return steps
}


app.listen(PORT, () => {
  console.log(`\n🚀 Travel Agent API running at http://localhost:${PORT}`)
  console.log(`   Frontend should run at http://localhost:5173\n`)
})