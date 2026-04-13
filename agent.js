// agent.js
// The core agent loop — Reasoning + Acting (ReAct pattern).
// This file has ONE job: run the while loop until the task is done.
// ─────────────────────────────────────────────────────────────────────────────

import Groq from "groq-sdk"
import "dotenv/config"
import { toolDefinitions, toolFunctions } from "./tools.js"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Use the 70B model for agents — it reasons through multi-step tasks
// much better than the 8B model. Still free on Groq's free tier.
const MODEL = "llama-3.3-70b-versatile"

// ─── The agent system prompt ──────────────────────────────────────────────────
// This shapes how the agent behaves. Good system prompts for agents should:
//   1. Define the role clearly
//   2. Tell it the order to do things (search → present → confirm → book)
//   3. Add safety rules (never book without confirmation)
const SYSTEM_PROMPT = `You are a helpful and efficient travel agent assistant.

Your job is to help users plan and book travel using the tools available to you.

Follow this order for bookings:
1. First check the weather at the destination
2. Search for available options (flights, hotels)
3. Present the options clearly to the user
4. Only book after the user explicitly confirms
5. Send a confirmation email after every successful booking

Rules:
- Always be friendly and professional
- Never book anything without user confirmation
- If a tool call fails, explain what happened and suggest alternatives
- Present prices clearly in USD
- Always mention the total price (not just per-night price) for hotels`


// ─── Tool executor ────────────────────────────────────────────────────────────
// Routes a tool call from the AI to the matching JavaScript function.
// The AI gives us: { name: "get_weather", arguments: '{"city":"Cairo"}' }
// We parse the arguments and call the real function.
async function executeTool(toolCall) {
  const name = toolCall.function.name
  const args = JSON.parse(toolCall.function.arguments)

  // Check if this tool exists
  if (!toolFunctions[name]) {
    return { error: `Unknown tool: ${name}` }
  }

  try {
    const result = await toolFunctions[name](args)
    return result
  } catch (err) {
    return { error: `Tool ${name} failed: ${err.message}` }
  }
}


// ─── The main agent loop ──────────────────────────────────────────────────────
// This is the ReAct loop:
//   Think → (if tool needed) Act → Observe → Think → ... → Done
export async function runAgent(userTask, options = {}) {
  const {
    maxTurns    = 15,       // safety: stop after this many LLM calls
    verbose     = true,     // print thinking steps to terminal
    userEmail   = null,     // pass this so agent can send confirmation emails
  } = options

  if (verbose) {
    console.log("\n" + "═".repeat(60))
    console.log("🤖 Travel Agent starting...")
    console.log(`📋 Task: "${userTask}"`)
    console.log("═".repeat(60))
  }

  // Build initial message history
  // The agent will keep appending to this as it thinks and acts
  const messages = [
    { role: "system",  content: SYSTEM_PROMPT },
    {
      role:    "user",
      content: userEmail
        ? `${userTask}\n\nMy email for confirmation: ${userEmail}`
        : userTask
    },
  ]

  let turns      = 0
  let totalTokens = 0

  // ── The loop ────────────────────────────────────────────────────────────────
  while (turns < maxTurns) {
    turns++

    if (verbose) console.log(`\n--- Turn ${turns} ---`)

    // Call the LLM — pass all tools and the full message history
    const response = await groq.chat.completions.create({
      model:       MODEL,
      messages,
      tools:       toolDefinitions,
      tool_choice: "auto",       // AI decides when to use tools
      temperature: 0.3,          // lower = more consistent decisions
    })

    const choice  = response.choices[0]
    const message = choice.message

    // Track token usage
    totalTokens += response.usage?.total_tokens || 0

    // ALWAYS add the assistant's message to history
    // (even if it's just a tool call with no visible text)
    messages.push(message)

    // ── Case 1: STOP — the AI is done ────────────────────────────────────────
    if (choice.finish_reason === "stop") {
      if (verbose) {
        console.log("\n✅ Agent finished!")
        console.log(`📊 Total turns: ${turns} | Tokens used: ${totalTokens}`)
      }
      return {
        success: true,
        answer:  message.content,
        turns,
        totalTokens,
        messages,
      }
    }

    // ── Case 2: TOOL CALLS — run each tool the AI requested ──────────────────
    if (choice.finish_reason === "tool_calls" && message.tool_calls) {

      if (verbose && message.content) {
        // Sometimes the AI writes a thought before calling tools
        console.log(`💭 Agent thinking: ${message.content}`)
      }

      // The AI can request multiple tool calls in one turn
      // Run all of them and add all results to history
      for (const toolCall of message.tool_calls) {
        if (verbose) {
          const args = JSON.parse(toolCall.function.arguments)
          console.log(`🔧 Calling: ${toolCall.function.name}(${JSON.stringify(args)})`)
        }

        // Run the real function
        const result = await executeTool(toolCall)

        if (verbose) {
          console.log(`   Result: ${JSON.stringify(result).slice(0, 120)}...`)
        }

        // Add tool result to message history
        // The AI will see this result on the next turn
        messages.push({
          role:         "tool",
          tool_call_id: toolCall.id,       // links result to the specific tool call
          content:      JSON.stringify(result),
        })
      }

      // Continue the loop — AI will now process the tool results
      continue
    }

    // ── Case 3: Unexpected finish reason ─────────────────────────────────────
    if (verbose) console.log(`⚠️  Unexpected finish_reason: ${choice.finish_reason}`)
    break
  }

  // Max turns reached
  return {
    success: false,
    answer:  "I reached the maximum number of steps. The task may be incomplete.",
    turns,
    totalTokens,
    messages,
  }
}