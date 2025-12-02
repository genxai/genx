import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/models")({
  component: ModelsPage,
})

type ModelType = "base" | "instruction" | "reasoning" | "hybrid"
type ArchType = "dense" | "moe"

interface Model {
  id: string
  name: string
  provider: string
  size: string
  type: ModelType
  arch: ArchType
  description: string
  kvCachePerToken?: string
  recommended?: boolean
}

const models: Model[] = [
  // Qwen Models
  {
    id: "Qwen/Qwen3-235B-A22B-Instruct",
    name: "Qwen3-235B-A22B-Instruct",
    provider: "Qwen",
    size: "235B (22B active)",
    type: "instruction",
    arch: "moe",
    description: "Largest Qwen MoE model, excellent for complex instruction following",
    kvCachePerToken: "~2MB",
  },
  {
    id: "Qwen/Qwen3-30B-A3B-Base",
    name: "Qwen3-30B-A3B-Base",
    provider: "Qwen",
    size: "30B (3B active)",
    type: "base",
    arch: "moe",
    description: "Foundation model for research and custom post-training",
    kvCachePerToken: "~200KB",
    recommended: true,
  },
  {
    id: "Qwen/Qwen3-30B-A3B-Instruct",
    name: "Qwen3-30B-A3B-Instruct",
    provider: "Qwen",
    size: "30B (3B active)",
    type: "instruction",
    arch: "moe",
    description: "Optimized for fast inference, no chain-of-thought",
    kvCachePerToken: "~200KB",
  },
  {
    id: "Qwen/Qwen3-8B",
    name: "Qwen3-8B",
    provider: "Qwen",
    size: "8B",
    type: "hybrid",
    arch: "dense",
    description: "Can operate in both thinking and non-thinking modes",
    kvCachePerToken: "~50KB",
  },
  {
    id: "Qwen/Qwen3-8B-Base",
    name: "Qwen3-8B-Base",
    provider: "Qwen",
    size: "8B",
    type: "base",
    arch: "dense",
    description: "Smaller base model for experimentation",
    kvCachePerToken: "~50KB",
    recommended: true,
  },
  // Llama Models
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama-3.3-70B-Instruct",
    provider: "Meta",
    size: "70B",
    type: "instruction",
    arch: "dense",
    description: "Latest Llama instruction-tuned model",
    kvCachePerToken: "~4MB",
  },
  {
    id: "meta-llama/Llama-3.1-8B",
    name: "Llama-3.1-8B",
    provider: "Meta",
    size: "8B",
    type: "hybrid",
    arch: "dense",
    description: "Versatile smaller Llama model",
    kvCachePerToken: "~50KB",
    recommended: true,
  },
  {
    id: "meta-llama/Llama-3.2-3B",
    name: "Llama-3.2-3B",
    provider: "Meta",
    size: "3B",
    type: "hybrid",
    arch: "dense",
    description: "Compact model for quick experiments",
    kvCachePerToken: "~20KB",
  },
  // DeepSeek Models
  {
    id: "deepseek-ai/DeepSeek-V3.1",
    name: "DeepSeek-V3.1",
    provider: "DeepSeek",
    size: "671B MoE",
    type: "hybrid",
    arch: "moe",
    description: "Uses MLA for efficient KV cache compression",
    kvCachePerToken: "~70KB",
  },
  // GPT-OSS
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS-120B",
    provider: "OpenAI (OSS)",
    size: "120B MoE",
    type: "reasoning",
    arch: "moe",
    description: "Open-source reasoning model with chain-of-thought",
    kvCachePerToken: "~1MB",
  },
]

const typeInfo: Record<ModelType, { label: string; emoji: string; description: string; color: string }> = {
  base: {
    label: "Base",
    emoji: "🐙",
    description: "Foundation model for research and custom post-training",
    color: "bg-blue-500",
  },
  instruction: {
    label: "Instruction",
    emoji: "⚡",
    description: "Optimized for fast inference, no chain-of-thought",
    color: "bg-yellow-500",
  },
  reasoning: {
    label: "Reasoning",
    emoji: "💭",
    description: "Always uses chain-of-thought reasoning",
    color: "bg-purple-500",
  },
  hybrid: {
    label: "Hybrid",
    emoji: "🤔",
    description: "Can operate in both thinking and non-thinking modes",
    color: "bg-green-500",
  },
}

const archInfo: Record<ArchType, { label: string; emoji: string; description: string }> = {
  dense: {
    label: "Dense",
    emoji: "🧱",
    description: "All parameters active - more memory but simpler",
  },
  moe: {
    label: "MoE",
    emoji: "🔀",
    description: "Mixture of Experts - sparse activation, more cost-effective",
  },
}

function ModelsPage() {
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null)
  const [filterType, setFilterType] = React.useState<ModelType | "all">("all")
  const [filterArch, setFilterArch] = React.useState<ArchType | "all">("all")

  const filteredModels = models.filter((m) => {
    if (filterType !== "all" && m.type !== filterType) return false
    if (filterArch !== "all" && m.arch !== filterArch) return false
    return true
  })

  const selected = models.find((m) => m.id === selectedModel)

  return (
    <AppLayout>
      <PageHeader
        title="Choose a Model"
        subtitle="Select a base model to fine-tune with LoRA"
        step={2}
        totalSteps={4}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Filters & Model List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs text-white/50 block mb-2">Model Type</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded text-sm ${
                      filterType === "all" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(typeInfo).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setFilterType(key as ModelType)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        filterType === key ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {info.emoji} {info.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-2">Architecture</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterArch("all")}
                    className={`px-3 py-1.5 rounded text-sm ${
                      filterArch === "all" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(archInfo).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setFilterArch(key as ArchType)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        filterArch === key ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {info.emoji} {info.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredModels.map((model) => (
                <Card
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  selected={selectedModel === model.id}
                  className="p-4 relative"
                >
                  {model.recommended && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Recommended
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${typeInfo[model.type].color}/20 flex items-center justify-center text-lg`}>
                      {typeInfo[model.type].emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{model.name}</h3>
                      <p className="text-sm text-white/50">{model.provider} • {model.size}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 mt-3">{model.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${typeInfo[model.type].color}/20 text-white/70`}>
                      {typeInfo[model.type].label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70">
                      {archInfo[model.arch].label}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Selected Model Details */}
          <div className="space-y-6">
            {selected ? (
              <>
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                  <h2 className="text-xl font-semibold mb-4">{selected.name}</h2>

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-white/50">Provider</span>
                      <p className="font-medium">{selected.provider}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/50">Parameters</span>
                      <p className="font-medium">{selected.size}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/50">Type</span>
                      <p className="font-medium">
                        {typeInfo[selected.type].emoji} {typeInfo[selected.type].label}
                      </p>
                      <p className="text-sm text-white/60">{typeInfo[selected.type].description}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/50">Architecture</span>
                      <p className="font-medium">
                        {archInfo[selected.arch].emoji} {archInfo[selected.arch].label}
                      </p>
                      <p className="text-sm text-white/60">{archInfo[selected.arch].description}</p>
                    </div>
                    {selected.kvCachePerToken && (
                      <div>
                        <span className="text-xs text-white/50">KV Cache per Token</span>
                        <p className="font-medium">{selected.kvCachePerToken}</p>
                      </div>
                    )}
                  </div>
                </div>

                <InfoBox title="LoRA Fine-tuning" variant="info">
                  <p>
                    Tinker uses <strong>LoRA (Low-Rank Adaptation)</strong> to fine-tune models efficiently.
                    Instead of updating all parameters, LoRA adds small trainable matrices to each layer.
                  </p>
                  <p className="mt-2">
                    This means:
                  </p>
                  <ul className="mt-1 space-y-1">
                    <li>• 20-100x smaller checkpoints</li>
                    <li>• Faster training</li>
                    <li>• Same quality for most tasks</li>
                  </ul>
                </InfoBox>

                <Link
                  to="/train"
                  search={{ model: selected.id }}
                  className="block w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors text-center"
                >
                  Continue with {selected.name.split("-")[0]} →
                </Link>
              </>
            ) : (
              <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
                <p className="text-white/40">Select a model to see details</p>
              </div>
            )}

            <InfoBox title="Which Model to Choose?" variant="info">
              <ul className="space-y-2">
                <li>
                  <strong className="text-white">For learning:</strong> Start with Qwen3-8B-Base or Llama-3.1-8B
                </li>
                <li>
                  <strong className="text-white">For efficiency:</strong> MoE models use less compute per token
                </li>
                <li>
                  <strong className="text-white">For custom training:</strong> Use Base models
                </li>
                <li>
                  <strong className="text-white">For RL:</strong> Hybrid or Instruction models work well
                </li>
              </ul>
            </InfoBox>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
