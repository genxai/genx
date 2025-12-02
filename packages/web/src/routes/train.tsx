import * as React from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/train")({
  component: TrainPage,
  validateSearch: (search: Record<string, unknown>) => ({
    model: (search.model as string) || "Qwen/Qwen3-8B-Base",
  }),
})

type TrainingMethod = "supervised" | "rl"
type LossFunction = "cross_entropy" | "ppo" | "dro" | "importance_sampling"

const lossFunctions: Record<LossFunction, { name: string; description: string; formula?: string; useCase: string }> = {
  cross_entropy: {
    name: "Cross Entropy",
    description: "Standard supervised learning loss. Minimizes negative log-likelihood of target tokens.",
    formula: "L(θ) = -E[log pθ(x)]",
    useCase: "Instruction tuning, prompt distillation, improving specific capabilities",
  },
  importance_sampling: {
    name: "Importance Sampling",
    description: "Policy gradient with off-policy corrections for when samples come from a different distribution.",
    formula: "L_IS(θ) = E[pθ(x)/q(x) × A(x)]",
    useCase: "Off-policy RL when you have pre-collected samples",
  },
  ppo: {
    name: "PPO (Proximal Policy Optimization)",
    description: "Clips the policy ratio to prevent large updates. Most stable RL algorithm.",
    formula: "L_PPO = min(r(θ)A, clip(r(θ), 1-ε, 1+ε)A)",
    useCase: "Most RL tasks - RLHF, RLVR, reward optimization",
  },
  dro: {
    name: "DRO (Direct Reward Optimization)",
    description: "Off-policy RL with quadratic penalty. Balances exploration and exploitation.",
    formula: "L_DRO = E[log pθ(x)A - 0.5β(log pθ(x)/q(x))²]",
    useCase: "When you want smoother updates than PPO",
  },
}

function TrainPage() {
  const { model } = Route.useSearch()
  const navigate = useNavigate()

  const [method, setMethod] = React.useState<TrainingMethod>("supervised")
  const [lossFunction, setLossFunction] = React.useState<LossFunction>("cross_entropy")
  const [config, setConfig] = React.useState({
    loraRank: 32,
    learningRate: 1e-4,
    batchSize: 4,
    numSteps: 100,
    warmupSteps: 10,
  })

  const modelName = model.split("/").pop() || model

  React.useEffect(() => {
    if (method === "supervised") {
      setLossFunction("cross_entropy")
    } else {
      setLossFunction("ppo")
    }
  }, [method])

  const handleStartTraining = () => {
    // Navigate to dashboard with training config
    navigate({
      to: "/dashboard",
      search: {
        model,
        method,
        lossFunction,
        ...config,
      },
    })
  }

  return (
    <AppLayout>
      <PageHeader
        title="Configure Training"
        subtitle={`Fine-tuning ${modelName} with LoRA`}
        step={3}
        totalSteps={4}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Training Method */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Training Method</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card
                  onClick={() => setMethod("supervised")}
                  selected={method === "supervised"}
                  className="p-6"
                >
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="text-lg font-medium">Supervised Learning</h3>
                  <p className="text-sm text-white/60 mt-2">
                    Learn from input-output pairs. Model learns to produce the target output given the input.
                  </p>
                  <div className="mt-4 text-xs text-cyan-400">
                    Best for: Instruction tuning, distillation, specific tasks
                  </div>
                </Card>
                <Card
                  onClick={() => setMethod("rl")}
                  selected={method === "rl"}
                  className="p-6"
                >
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-lg font-medium">Reinforcement Learning</h3>
                  <p className="text-sm text-white/60 mt-2">
                    Learn from rewards. Model generates outputs and improves based on reward signals.
                  </p>
                  <div className="mt-4 text-xs text-purple-400">
                    Best for: RLHF, reasoning, code generation, verifiable tasks
                  </div>
                </Card>
              </div>
            </div>

            {/* Loss Function */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Loss Function</h2>
              <div className="space-y-3">
                {Object.entries(lossFunctions)
                  .filter(([key]) => {
                    if (method === "supervised") return key === "cross_entropy"
                    return key !== "cross_entropy"
                  })
                  .map(([key, info]) => (
                    <Card
                      key={key}
                      onClick={() => setLossFunction(key as LossFunction)}
                      selected={lossFunction === key}
                      className="p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{info.name}</h3>
                          <p className="text-sm text-white/60 mt-1">{info.description}</p>
                        </div>
                        {lossFunction === key && (
                          <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {info.formula && (
                        <div className="mt-3 bg-black/30 rounded p-2 font-mono text-xs text-cyan-400">
                          {info.formula}
                        </div>
                      )}
                      <p className="text-xs text-white/40 mt-2">{info.useCase}</p>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Hyperparameters */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Hyperparameters</h2>
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-6">
                {/* LoRA Rank */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">LoRA Rank</label>
                    <span className="text-sm text-white/50 font-mono">{config.loraRank}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="128"
                    step="8"
                    value={config.loraRank}
                    onChange={(e) => setConfig({ ...config, loraRank: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Higher rank = more capacity, but more memory. Rule: LoRA params ≥ completion tokens in dataset.
                  </p>
                </div>

                {/* Learning Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Learning Rate</label>
                    <span className="text-sm text-white/50 font-mono">{config.learningRate.toExponential(0)}</span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="-2"
                    step="0.5"
                    value={Math.log10(config.learningRate)}
                    onChange={(e) => setConfig({ ...config, learningRate: Math.pow(10, Number(e.target.value)) })}
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    LoRA needs 20-100x higher LR than full fine-tuning. Start with 1e-4.
                  </p>
                </div>

                {/* Batch Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Batch Size</label>
                    <span className="text-sm text-white/50 font-mono">{config.batchSize}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="32"
                    step="1"
                    value={config.batchSize}
                    onChange={(e) => setConfig({ ...config, batchSize: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Samples per training step. LoRA is sensitive to large batches.
                  </p>
                </div>

                {/* Training Steps */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Training Steps</label>
                    <span className="text-sm text-white/50 font-mono">{config.numSteps}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={config.numSteps}
                    onChange={(e) => setConfig({ ...config, numSteps: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Total optimizer steps. More steps = more learning, but watch for overfitting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary & Actions */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Training Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Model</span>
                  <span className="font-mono">{modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Method</span>
                  <span>{method === "supervised" ? "Supervised Learning" : "Reinforcement Learning"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Loss Function</span>
                  <span>{lossFunctions[lossFunction].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">LoRA Rank</span>
                  <span className="font-mono">{config.loraRank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Learning Rate</span>
                  <span className="font-mono">{config.learningRate.toExponential(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Batch Size</span>
                  <span className="font-mono">{config.batchSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Steps</span>
                  <span className="font-mono">{config.numSteps}</span>
                </div>
              </div>
            </div>

            <InfoBox
              title={method === "supervised" ? "Supervised Learning Flow" : "RL Training Flow"}
              variant="info"
            >
              {method === "supervised" ? (
                <ol className="space-y-2 text-sm">
                  <li>1. Load training examples (input → output pairs)</li>
                  <li>2. Tokenize and create Datum objects</li>
                  <li>3. Forward pass: compute logprobs</li>
                  <li>4. Backward pass: compute gradients</li>
                  <li>5. Optimizer step: update LoRA weights</li>
                  <li>6. Repeat until convergence</li>
                </ol>
              ) : (
                <ol className="space-y-2 text-sm">
                  <li>1. Sample completions from current policy</li>
                  <li>2. Compute rewards for each completion</li>
                  <li>3. Calculate advantages (reward - baseline)</li>
                  <li>4. Forward-backward with policy gradient</li>
                  <li>5. Optimizer step: update LoRA weights</li>
                  <li>6. Repeat, sampling from updated policy</li>
                </ol>
              )}
            </InfoBox>

            <button
              onClick={handleStartTraining}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Training →
            </button>

            <p className="text-xs text-white/40 text-center">
              Training will run on Tinker's distributed GPU infrastructure
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
