// src/App.jsx
import { useState, useRef, useEffect } from "react"
import "./App.css"

const API = import.meta.env.VITE_API_URL || "http://localhost:3001"

const SUGGESTED_TASKS = [
  "What's the weather in Cairo? Should I pack an umbrella?",
  "Find flights from London to Cairo on 2025-08-10 and hotels under $150/night for 3 nights.",
  "Book the cheapest hotel in Cairo for Ahmed Hassan, checkin 2025-08-10, checkout 2025-08-13. I confirm the booking.",
  "Plan a 4-day trip to Dubai — check weather, find hotels under $200/night.",
]

const TOOL_ICONS = {
  get_weather:             "◎",
  search_flights:          "◈",
  search_hotels:           "⬡",
  book_hotel:              "◆",
  send_confirmation_email: "◉",
}

const TOOL_LABELS = {
  get_weather:             "Weather check",
  search_flights:          "Flight search",
  search_hotels:           "Hotel search",
  book_hotel:              "Booking",
  send_confirmation_email: "Email sent",
}

function StepBadge({ step }) {
  const [open, setOpen] = useState(false)
  if (step.type === "thinking") {
    return (
      <div className="step step--think">
        <span className="step__icon">◐</span>
        <span className="step__label">Thinking</span>
        <span className="step__text">{step.content}</span>
      </div>
    )
  }
  if (step.type === "tool_call") {
    const icon  = TOOL_ICONS[step.tool]  || "◇"
    const label = TOOL_LABELS[step.tool] || step.tool
    return (
      <div className="step step--tool" onClick={() => setOpen(o => !o)}>
        <span className="step__icon">{icon}</span>
        <span className="step__label">{label}</span>
        <span className="step__args">
          {Object.entries(step.args).map(([k, v]) =>
            <span key={k} className="step__arg"><em>{k}:</em> {String(v)}</span>
          )}
        </span>
        <span className="step__toggle">{open ? "▲" : "▼"}</span>
        {open && <pre className="step__json">{JSON.stringify(step.args, null, 2)}</pre>}
      </div>
    )
  }
  if (step.type === "tool_result") {
    return (
      <div className="step step--result" onClick={() => setOpen(o => !o)}>
        <span className="step__icon">✓</span>
        <span className="step__label">Result received</span>
        <span className="step__toggle">{open ? "▲" : "▼"}</span>
        {open && <pre className="step__json">{JSON.stringify(step.result, null, 2)}</pre>}
      </div>
    )
  }
  return null
}

function StatPill({ label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill__val">{value}</span>
      <span className="stat-pill__label">{label}</span>
    </div>
  )
}

export default function App() {
  const [task,    setTask]    = useState("")
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState(null)
  const [dots,    setDots]    = useState("")
  const textareaRef = useRef(null)
  const resultRef   = useRef(null)

  useEffect(() => {
    if (!loading) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400)
    return () => clearInterval(id)
  }, [loading])

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [result])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!task.trim() || loading) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res  = await fetch(`${API}/api/agent`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ task: task.trim(), email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Server error")
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function useSuggestion(s) {
    setTask(s)
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          <span className="header__icon">◈</span>
          <span className="header__wordmark">ORBIS</span>
        </div>
        <p className="header__sub">AI Travel Agent · Module 4</p>
      </header>

      <section className="hero">
        <h1 className="hero__title">Your trip,<br /><span className="hero__accent">handled.</span></h1>
        <p className="hero__desc">Tell the agent what you need. It searches, plans, books, and confirms — autonomously.</p>
      </section>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form__field">
          <label className="form__label">What do you need?</label>
          <textarea ref={textareaRef} className="form__textarea" value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="e.g. Find me a hotel in Cairo under $150/night for next weekend…"
            rows={3} disabled={loading}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
          />
        </div>
        <div className="form__field">
          <label className="form__label">Your email <span className="form__optional">(optional — for booking confirmations)</span></label>
          <input className="form__input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={loading} />
        </div>
        <button className="form__btn" type="submit" disabled={loading || !task.trim()}>
          {loading ? <><span className="btn__spinner" />Running agent{dots}</> : <><span>Run agent</span><span className="btn__arrow">→</span></>}
        </button>
        <p className="form__hint">Ctrl + Enter to submit</p>
      </form>

      <section className="suggestions">
        <p className="suggestions__label">Try an example</p>
        <div className="suggestions__grid">
          {SUGGESTED_TASKS.map((s, i) => (
            <button key={i} className="suggestion" onClick={() => useSuggestion(s)} disabled={loading}>{s}</button>
          ))}
        </div>
      </section>

      {error && (
        <div className="error-box">
          <span className="error-box__icon">⚠</span>
          <div>
            <p className="error-box__title">Agent error</p>
            <p className="error-box__msg">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <section className="result" ref={resultRef}>
          <div className="result__stats">
            <StatPill label="turns"  value={result.turns} />
            <StatPill label="tokens" value={result.totalTokens.toLocaleString()} />
            <StatPill label="tools"  value={result.steps.filter(s => s.type === "tool_call").length} />
          </div>
          {result.steps.length > 0 && (
            <div className="steps">
              <p className="steps__label">Agent trace</p>
              {result.steps.map((step, i) => <StepBadge key={i} step={step} />)}
            </div>
          )}
          <div className="answer">
            <p className="answer__label">Final answer</p>
            <div className="answer__body">
              {result.answer.split("\n").map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : <br key={i} />
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        Built with Groq · LLaMA 3.3 70B · React + Vite · Module 4 of Scrimba AI Engineer Path
      </footer>
    </div>
  )
}