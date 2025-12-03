import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox, RequireAuth } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/infra/train")(({
  component: TrainPage,
}))

const TRAINING_METHODS = [
  {
    id: "sft",
    name: "Supervised Fine-tuning",
    description: "Fine-tune on instruction-response pairs",
    icon: "📚",
  },
  {
    id: "rl-ppo",
    name: "RL with PPO",
    description: "Reinforce with Proximal Policy Optimization",
    icon: "🎮",
  },
  {
    id: "rl-dro",
    name: "RL with DRO",
    description: "Direct Reward Optimization",
    icon: "🎯",
  },
]

const BASE_MODELS = [
  { id: "meta-llama/Llama-3.1-8B", name: "Llama 3.1 8B", params: "8B" },
  { id: "meta-llama/Llama-3.1-70B", name: "Llama 3.1 70B", params: "70B" },
  { id: "mistralai/Mistral-7B-v0.3", name: "Mistral 7B", params: "7B" },
  { id: "Qwen/Qwen2.5-7B", name: "Qwen 2.5 7B", params: "7B" },
]

function TrainPage() {
  return (
    <AppLayout>
      <RequireAuth>
        <PageHeader
          title="Train Model"
          subtitle="Fine-tune models with Tinker's distributed training"
          action={
            <Link
              to="/infra"
              className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
            >
              Back to Infra
            </Link>
          }
        />
        <TrainContent />
      </RequireAuth>
    </AppLayout>
  )
}

function TrainContent() {
  const [method, setMethod] = React.useState<string | null>(null)
  const [baseModel, setBaseModel] = React.useState("")
  const [datasetUrl, setDatasetUrl] = React.useState("")
  const [config, setConfig] = React.useState({
    learningRate: "2e-5",
    epochs: 3,
    batchSize: 4,
    loraRank: 16,
    loraAlpha: 32,
  })

  const handleStartTraining = async () => {
    if (!method || !baseModel || !datasetUrl) {
      alert("Please fill in all required fields")
      return
    }
    // TODO: Integrate with Tinker API
    alert("Training would be triggered here - Tinker API integration coming soon!")
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Step 1: Training Method */}
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Training Method</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TRAINING_METHODS.map((m) => (
              <Card
                key={m.id}
                onClick={() => setMethod(m.id)}
                selected={method === m.id}
                className="p-4 cursor-pointer"
              >
                <div className="text-2xl mb-2">{m.icon}</div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-white/50 mt-1">{m.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 2: Base Model */}
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Base Model</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                HuggingFace Model ID
              </label>
              <input
                type="text"
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                placeholder="e.g., meta-llama/Llama-3.1-8B"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {BASE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setBaseModel(model.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    baseModel === model.id
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  {model.name}
                  <span className="text-white/40 ml-2">{model.params}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Dataset */}
        <div>
          <h2 className="text-xl font-semibold mb-4">3. Dataset</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Dataset URL (HuggingFace or S3)
            </label>
            <input
              type="text"
              value={datasetUrl}
              onChange={(e) => setDatasetUrl(e.target.value)}
              placeholder="e.g., hf://tatsu-lab/alpaca or s3://bucket/dataset.jsonl"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <p className="text-xs text-white/40 mt-2">
              Supports HuggingFace datasets (hf://), S3 buckets, or direct URLs to JSONL files
            </p>
          </div>
        </div>

        {/* Step 4: Configuration */}
        <div>
          <h2 className="text-xl font-semibold mb-4">4. Training Configuration</h2>
          <Card className="p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Learning Rate</label>
                <input
                  type="text"
                  value={config.learningRate}
                  onChange={(e) => setConfig({ ...config, learningRate: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Epochs</label>
                <input
                  type="number"
                  value={config.epochs}
                  onChange={(e) => setConfig({ ...config, epochs: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Batch Size</label>
                <input
                  type="number"
                  value={config.batchSize}
                  onChange={(e) => setConfig({ ...config, batchSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LoRA Rank</label>
                <input
                  type="number"
                  value={config.loraRank}
                  onChange={(e) => setConfig({ ...config, loraRank: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleStartTraining}
                disabled={!method || !baseModel || !datasetUrl}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Training Run
              </button>
            </div>
          </Card>
        </div>

        {/* Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <InfoBox title="About Tinker" variant="info">
            <p className="text-sm">
              Tinker is a distributed training API by Prime Intellect that supports:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Supervised Fine-tuning (SFT) with LoRA</li>
              <li>• Reinforcement Learning with PPO</li>
              <li>• Direct Reward Optimization (DRO)</li>
              <li>• Importance sampling for efficient RL</li>
            </ul>
          </InfoBox>

          <InfoBox title="LoRA Explained" variant="info">
            <p className="text-sm">
              Low-Rank Adaptation (LoRA) enables efficient fine-tuning by training small adapter
              weights instead of the full model.
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• <strong>Rank</strong>: Higher = more capacity, more compute</li>
              <li>• <strong>Alpha</strong>: Scaling factor (often 2x rank)</li>
              <li>• Typical: rank=16, alpha=32</li>
            </ul>
          </InfoBox>
        </div>
      </div>
    </div>
  )
}
