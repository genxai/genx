import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox, RequireAuth } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/infra/deploy")(({
  component: DeployPage,
}))

interface GpuOption {
  id: string
  name: string
  vram: string
  price: string
  availability: "high" | "medium" | "low"
}

const GPU_OPTIONS: GpuOption[] = [
  { id: "a100-40gb", name: "A100 40GB", vram: "40 GB", price: "$1.89/hr", availability: "high" },
  { id: "a100-80gb", name: "A100 80GB", vram: "80 GB", price: "$2.49/hr", availability: "medium" },
  { id: "h100-80gb", name: "H100 80GB", vram: "80 GB", price: "$3.99/hr", availability: "low" },
  { id: "l40s", name: "L40S", vram: "48 GB", price: "$1.29/hr", availability: "high" },
]

const POPULAR_MODELS = [
  { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B Instruct", size: "16 GB" },
  { id: "meta-llama/Llama-3.1-70B-Instruct", name: "Llama 3.1 70B Instruct", size: "140 GB" },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B Instruct", size: "14 GB" },
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B Instruct", size: "145 GB" },
  { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", size: "671 GB" },
]

function DeployPage() {
  return (
    <AppLayout>
      <RequireAuth>
        <PageHeader
          title="Deploy Model"
          subtitle="Provision GPU instances and deploy models with vLLM"
          action={
            <Link
              to="/infra"
              className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
            >
              Back to Infra
            </Link>
          }
        />
        <DeployContent />
      </RequireAuth>
    </AppLayout>
  )
}

function DeployContent() {
  const [selectedGpu, setSelectedGpu] = React.useState<string | null>(null)
  const [modelId, setModelId] = React.useState("")
  const [deploying, setDeploying] = React.useState(false)

  const handleDeploy = async () => {
    if (!selectedGpu || !modelId) return

    setDeploying(true)
    // TODO: Integrate with Prime Intellect Compute API
    await new Promise(resolve => setTimeout(resolve, 2000))
    setDeploying(false)
    alert("Deployment would be triggered here - Prime Intellect Compute API integration coming soon!")
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Step 1: Select GPU */}
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Select GPU</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {GPU_OPTIONS.map((gpu) => (
              <Card
                key={gpu.id}
                onClick={() => setSelectedGpu(gpu.id)}
                selected={selectedGpu === gpu.id}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{gpu.name}</h3>
                    <p className="text-sm text-white/50 mt-1">{gpu.vram} VRAM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-cyan-400">{gpu.price}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          gpu.availability === "high"
                            ? "bg-green-500"
                            : gpu.availability === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs text-white/50">
                        {gpu.availability === "high"
                          ? "Available"
                          : gpu.availability === "medium"
                          ? "Limited"
                          : "Scarce"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 2: Select Model */}
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Choose Model</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                HuggingFace Model ID
              </label>
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="e.g., meta-llama/Llama-3.1-8B-Instruct"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <p className="text-sm text-white/50 mb-3">Popular models:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setModelId(model.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      modelId === model.id
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    {model.name}
                    <span className="text-white/40 ml-2">{model.size}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Deploy */}
        <div>
          <h2 className="text-xl font-semibold mb-4">3. Deploy</h2>
          <Card className="p-6">
            {selectedGpu && modelId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">GPU</span>
                  <span className="font-medium">
                    {GPU_OPTIONS.find((g) => g.id === selectedGpu)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Model</span>
                  <span className="font-mono text-sm">{modelId}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60">Estimated Cost</span>
                  <span className="font-mono text-cyan-400">
                    {GPU_OPTIONS.find((g) => g.id === selectedGpu)?.price}
                  </span>
                </div>
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {deploying ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </span>
                  ) : (
                    "Deploy with vLLM"
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                <p>Select a GPU and model to see deployment summary</p>
              </div>
            )}
          </Card>
        </div>

        {/* Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <InfoBox title="How it works" variant="info">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Select a GPU instance based on your model's VRAM requirements</li>
              <li>Choose a HuggingFace model or enter a custom model ID</li>
              <li>We'll provision the GPU and deploy vLLM with your model</li>
              <li>Get an OpenAI-compatible API endpoint for inference</li>
            </ol>
          </InfoBox>

          <InfoBox title="VRAM Requirements" variant="warning">
            <p className="text-sm mb-2">Approximate VRAM needed (fp16):</p>
            <ul className="text-sm space-y-1">
              <li>• 7B model: ~14 GB</li>
              <li>• 13B model: ~26 GB</li>
              <li>• 70B model: ~140 GB (needs multiple GPUs)</li>
              <li>• For quantized models, divide by 2-4x</li>
            </ul>
          </InfoBox>
        </div>
      </div>
    </div>
  )
}
