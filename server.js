// server.js
import express from "express"
import cors    from "cors"
import "dotenv/config"
import { runAgent } from "./agent.js"

const app  = express()
const PORT = process.env.PORT || 3001

// Allow both local dev and Vercel production frontend
// After you get your Vercel URL, add it here and push again
const allowedOrigins = [
  "http://localhost:5173",
  "https://travel-agent-gh7bnj0se-mkhaleifas-projects.vercel.app",   // ← replace xxxx with your real Vercel subdomain
]

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman) or matching origins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.replace("xxxx", "")))) {
      cb(null, true)
    } else {
      cb(new Error(`CORS blocked: ${origin}`))
    }
  }
}))

app.use(express.json())

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

function extractSteps(messages) {
  const steps = []
  for (const msg of messages) {
    if (msg.role === "assistant") {
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tc of msg.tool_calls) {
          let args = {}
          try { args = JSON.parse(tc.function.arguments) } catch {}
          steps.push({ type: "tool_call", tool: tc.function.name, args, id: tc.id })
        }
      }
      if (msg.content && msg.content.trim()) {
        steps.push({ type: "thinking", content: msg.content })
      }
    }
    if (msg.role === "tool") {
      let result = {}
      try { result = JSON.parse(msg.content) } catch { result = { raw: msg.content } }
      steps.push({ type: "tool_result", tool_call_id: msg.tool_call_id, result })
    }
  }
  return steps
}

app.listen(PORT, () => {
  console.log(`\n🚀 Travel Agent API running on port ${PORT}`)
})