import { createFileRoute } from "@tanstack/react-router"

// Prime Intellect endpoints
const PRIME_INFERENCE_URL = "https://api.pinference.ai/api/v1"

// Custom GPU server (if running your own vLLM)
const GPU_SERVER_URL = process.env.GPU_SERVER_URL

// Prime Intellect API key
const PRIME_API_KEY = process.env.PRIME_API_KEY

// Which backend to use: "prime" | "custom"
const INFERENCE_BACKEND = process.env.INFERENCE_BACKEND || "prime"

const handleGet = async ({ request }: { request: Request }) => {
  // Health check and list available models
  const status: {
    prime?: { status: string; models?: string[]; error?: string }
    custom?: { status: string; server?: string; models?: string[]; error?: string }
    activeBackend: string
  } = {
    activeBackend: INFERENCE_BACKEND,
  }

  // Check Prime Intellect
  if (PRIME_API_KEY) {
    try {
      const response = await fetch(`${PRIME_INFERENCE_URL}/models`, {
        headers: { Authorization: `Bearer ${PRIME_API_KEY}` },
      })
      if (response.ok) {
        const data = await response.json()
        status.prime = {
          status: "connected",
          models: data.data?.map((m: { id: string }) => m.id) || [],
        }
      } else {
        status.prime = { status: "error", error: `HTTP ${response.status}` }
      }
    } catch (error) {
      status.prime = {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  } else {
    status.prime = { status: "not_configured", error: "PRIME_API_KEY not set" }
  }

  // Check custom GPU server
  if (GPU_SERVER_URL) {
    try {
      const response = await fetch(`${GPU_SERVER_URL}/v1/models`)
      if (response.ok) {
        const data = await response.json()
        status.custom = {
          status: "connected",
          server: GPU_SERVER_URL,
          models: data.data?.map((m: { id: string }) => m.id) || [],
        }
      } else {
        status.custom = { status: "error", server: GPU_SERVER_URL, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      status.custom = {
        status: "disconnected",
        server: GPU_SERVER_URL,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  return new Response(JSON.stringify(status), {
    headers: { "Content-Type": "application/json" },
  })
}

const handlePost = async ({ request }: { request: Request }) => {
  const body = await request.json()
  const {
    prompt,
    model = "meta-llama/llama-3.1-8b-instruct",
    maxTokens = 512,
    temperature = 0.7,
    stream = false,
    systemPrompt,
  } = body

  // Build messages array
  const messages: { role: string; content: string }[] = []
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt })
  }
  messages.push({ role: "user", content: prompt })

  try {
    if (INFERENCE_BACKEND === "prime" && PRIME_API_KEY) {
      // Use Prime Intellect Inference API
      const response = await fetch(`${PRIME_INFERENCE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PRIME_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return new Response(
          JSON.stringify({ error: `Prime Intellect error: ${error}` }),
          { status: response.status, headers: { "Content-Type": "application/json" } }
        )
      }

      const data = await response.json()
      return new Response(
        JSON.stringify({
          content: data.choices[0].message.content,
          model: data.model,
          usage: data.usage,
          backend: "prime",
        }),
        { headers: { "Content-Type": "application/json" } }
      )
    } else if (GPU_SERVER_URL) {
      // Use custom vLLM server
      const response = await fetch(`${GPU_SERVER_URL}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return new Response(
          JSON.stringify({ error: `GPU server error: ${error}` }),
          { status: response.status, headers: { "Content-Type": "application/json" } }
        )
      }

      const data = await response.json()
      return new Response(
        JSON.stringify({
          content: data.choices[0].message.content,
          model: data.model,
          usage: data.usage,
          backend: "custom",
        }),
        { headers: { "Content-Type": "application/json" } }
      )
    } else {
      return new Response(
        JSON.stringify({
          error: "No inference backend configured",
          hint: "Set PRIME_API_KEY for Prime Intellect or GPU_SERVER_URL for custom vLLM",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Inference failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }
}

export const Route = createFileRoute("/api/inference")({
  server: {
    handlers: {
      GET: handleGet,
      POST: handlePost,
    },
  },
})
