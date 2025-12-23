import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox, RequireAuth } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/infra/playground")(({
  component: PlaygroundPage,
}))

interface BackendStatus {
  prime?: {
    status: string
    models?: string[]
    error?: string
  }
  custom?: {
    status: string
    server?: string
    models?: string[]
    error?: string
  }
  activeBackend: string
}

interface InferenceResult {
  content: string
  model: string
  backend: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Prime Intellect available models (updated from API)
const PRIME_MODELS = [
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", size: "70B", speed: "fast" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", size: "70B", speed: "fast" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", size: "72B", speed: "fast" },
  { id: "qwen/qwen3-235b-a22b-instruct-2507", name: "Qwen 3 235B", size: "235B", speed: "medium" },
  { id: "deepseek/deepseek-v3.1-terminus", name: "DeepSeek V3.1", size: "671B", speed: "medium" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", size: "20B", speed: "fast" },
]

function PlaygroundPage() {
  return (
    <AppLayout>
      <RequireAuth>
        <PageHeader
          title="Playground"
          subtitle="Test inference with Prime Intellect or your own GPU"
        />
        <PlaygroundContent />
      </RequireAuth>
    </AppLayout>
  )
}

function PlaygroundContent() {
  const [prompt, setPrompt] = React.useState("What is 25 + 37? Explain step by step.")
  const [selectedModel, setSelectedModel] = React.useState(PRIME_MODELS[0].id)
  const [result, setResult] = React.useState<InferenceResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [backendStatus, setBackendStatus] = React.useState<BackendStatus | null>(null)

  const [settings, setSettings] = React.useState({
    maxTokens: 512,
    temperature: 0.7,
  })

  // Check backend status on mount
  React.useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("/api/inference")
      const data = await response.json()
      setBackendStatus(data)
    } catch {
      setBackendStatus({ activeBackend: "unknown" })
    }
  }

  const runInference = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const primeConnected = backendStatus?.prime?.status === "connected"
  const customConnected = backendStatus?.custom?.status === "connected"
  const anyConnected = primeConnected || customConnected

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Backend Status */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Prime Intellect Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  primeConnected
                    ? "bg-green-500"
                    : backendStatus?.prime?.status === "not_configured"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <div>
                <span className="font-medium">Prime Intellect</span>
                <span className="text-white/50 text-sm ml-2">
                  {primeConnected
                    ? "Connected"
                    : backendStatus?.prime?.status === "not_configured"
                    ? "Not configured"
                    : "Disconnected"}
                </span>
              </div>
            </div>
            {backendStatus?.activeBackend === "prime" && primeConnected && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                Active
              </span>
            )}
          </div>
          {primeConnected && backendStatus?.prime?.models && (
            <p className="text-xs text-white/40 mt-2">
              {backendStatus.prime.models.length} models available
            </p>
          )}
          {backendStatus?.prime?.error && !primeConnected && (
            <p className="text-xs text-red-400 mt-2">{backendStatus.prime.error}</p>
          )}
        </Card>

        {/* Custom GPU Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  customConnected ? "bg-green-500" : "bg-white/30"
                }`}
              />
              <div>
                <span className="font-medium">Custom GPU</span>
                <span className="text-white/50 text-sm ml-2">
                  {customConnected ? "Connected" : "Not configured"}
                </span>
              </div>
            </div>
            {backendStatus?.activeBackend === "custom" && customConnected && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                Active
              </span>
            )}
          </div>
          {backendStatus?.custom?.server && (
            <p className="text-xs text-white/40 mt-2 font-mono">
              {backendStatus.custom.server}
            </p>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Input & Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRIME_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedModel === model.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/50">{model.size}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        model.speed === "fast"
                          ? "bg-green-500/20 text-green-400"
                          : model.speed === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {model.speed}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 resize-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={runInference}
              disabled={loading || !anyConnected}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </span>
              ) : (
                "Run Inference"
              )}
            </button>
            <button
              onClick={() => {
                setResult(null)
                setError(null)
              }}
              className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20"
            >
              Clear
            </button>
          </div>

          {/* Output */}
          <div>
            <label className="block text-sm font-medium mb-2">Output</label>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[200px]">
              {loading ? (
                <div className="flex items-center gap-3 text-white/50">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  Running inference on {selectedModel.split("/").pop()}...
                </div>
              ) : error ? (
                <div className="text-red-400">
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              ) : result ? (
                <div>
                  <pre className="whitespace-pre-wrap font-mono text-sm text-green-400">
                    {result.content}
                  </pre>
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-white/50">
                    {result.usage && (
                      <>
                        <span>Prompt: {result.usage.prompt_tokens} tokens</span>
                        <span>Completion: {result.usage.completion_tokens} tokens</span>
                      </>
                    )}
                    <span>Model: {result.model}</span>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                      via {result.backend}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-white/30">Output will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Settings</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm">Max Tokens</label>
                  <span className="text-sm text-white/50 font-mono">{settings.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="4096"
                  step="64"
                  value={settings.maxTokens}
                  onChange={(e) =>
                    setSettings({ ...settings, maxTokens: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm">Temperature</label>
                  <span className="text-sm text-white/50 font-mono">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings({ ...settings, temperature: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-500"
                />
                <p className="text-xs text-white/40 mt-1">
                  0 = deterministic, higher = more creative
                </p>
              </div>
            </div>
          </Card>

          <InfoBox title="Quick Prompts" variant="info">
            <div className="space-y-2">
              {[
                "What is 25 + 37? Explain step by step.",
                "Write a Python function to check if a number is prime.",
                "Explain transformers in 3 sentences.",
                "Write a haiku about machine learning.",
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="block w-full text-left text-xs p-2 bg-black/30 rounded hover:bg-black/50 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </InfoBox>

          {!anyConnected && (
            <InfoBox title="Setup Required" variant="warning">
              <p>To use the playground, add your Prime Intellect API key:</p>
              <div className="mt-2 bg-black/30 rounded p-2 font-mono text-xs">
                <p className="text-cyan-400"># packages/web/.env</p>
                <p>PRIME_API_KEY=your_key_here</p>
              </div>
              <p className="mt-2 text-xs">
                Get your key at{" "}
                <a
                  href="https://app.primeintellect.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  app.primeintellect.ai
                </a>
              </p>
            </InfoBox>
          )}

          <InfoBox title="About Prime Intellect" variant="info">
            <p>
              Prime Intellect provides GPU cloud and inference APIs. Models run on their
              infrastructure - no GPU required on your end for inference.
            </p>
            <p className="mt-2">
              For custom model deployment, provision a GPU pod and run vLLM.
            </p>
          </InfoBox>
        </div>
      </div>
    </div>
  )
}
