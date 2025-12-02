import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>) => ({
    model: (search.model as string) || "Qwen/Qwen3-8B-Base",
    method: (search.method as string) || "supervised",
    lossFunction: (search.lossFunction as string) || "cross_entropy",
    loraRank: Number(search.loraRank) || 32,
    learningRate: Number(search.learningRate) || 1e-4,
    batchSize: Number(search.batchSize) || 4,
    numSteps: Number(search.numSteps) || 100,
  }),
})

interface TrainingStep {
  step: number
  loss: number
  gradNorm: number
  learningRate: number
  tokensPerSecond: number
  explanation: string
}

function DashboardPage() {
  const config = Route.useSearch()
  const modelName = config.model.split("/").pop() || config.model

  const [isTraining, setIsTraining] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [history, setHistory] = React.useState<TrainingStep[]>([])
  const [activeExplanation, setActiveExplanation] = React.useState<string>(
    "Click 'Start Training' to begin. Watch as the model learns step by step."
  )
  const [sampleOutput, setSampleOutput] = React.useState<string>("")

  // Simulate training
  React.useEffect(() => {
    if (!isTraining || currentStep >= config.numSteps) {
      if (currentStep >= config.numSteps) {
        setIsTraining(false)
        setActiveExplanation(
          "Training complete! The model has been fine-tuned. You can now test it or download the LoRA weights."
        )
      }
      return
    }

    const timer = setTimeout(() => {
      const progress = currentStep / config.numSteps
      const baseLoss = 2.5 * Math.exp(-3 * progress) + 0.3 + Math.random() * 0.1
      const gradNorm = 1.0 * Math.exp(-2 * progress) + 0.1 + Math.random() * 0.05

      // Warmup learning rate
      const warmupSteps = 10
      const lr =
        currentStep < warmupSteps
          ? config.learningRate * (currentStep / warmupSteps)
          : config.learningRate

      const explanations = [
        `Step ${currentStep + 1}: Forward pass complete. Computing logprobs for ${config.batchSize} samples...`,
        `Backward pass: Gradients computed. Grad norm = ${gradNorm.toFixed(3)}. This measures how much the weights want to change.`,
        `Optimizer step: Adam updating LoRA matrices with lr=${lr.toExponential(1)}. Lower loss means better predictions.`,
        `Loss decreased to ${baseLoss.toFixed(3)}. The model is learning to predict the target tokens better.`,
      ]

      const step: TrainingStep = {
        step: currentStep + 1,
        loss: baseLoss,
        gradNorm: gradNorm,
        learningRate: lr,
        tokensPerSecond: 1000 + Math.random() * 500,
        explanation: explanations[currentStep % explanations.length],
      }

      setHistory((prev) => [...prev, step])
      setCurrentStep((prev) => prev + 1)
      setActiveExplanation(step.explanation)

      // Simulate improving sample output
      if (currentStep > 0 && currentStep % 20 === 0) {
        const quality = Math.min(progress * 1.2, 1)
        if (quality < 0.3) {
          setSampleOutput("Let me... um... the answer is probably... 42?")
        } else if (quality < 0.6) {
          setSampleOutput("Let me solve this step by step.\n25 + 37 = ... 62\nThe answer is 62.")
        } else {
          setSampleOutput(
            "Let me solve this step by step.\n\nWe need to add 25 and 37.\n25 + 37 = 62\n\nThe answer is 62."
          )
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isTraining, currentStep, config])

  const handleStartTraining = () => {
    setIsTraining(true)
    setCurrentStep(0)
    setHistory([])
    setSampleOutput("")
    setActiveExplanation("Initializing training... Creating LoRA adapters and connecting to Tinker...")
  }

  const handleStopTraining = () => {
    setIsTraining(false)
    setActiveExplanation("Training paused. You can resume or save the current checkpoint.")
  }

  const avgLoss = history.length > 0 ? history.reduce((a, b) => a + b.loss, 0) / history.length : 0
  const lastLoss = history.length > 0 ? history[history.length - 1].loss : 0

  return (
    <AppLayout>
      <PageHeader
        title="Training Dashboard"
        subtitle={`Fine-tuning ${modelName}`}
        step={4}
        totalSteps={4}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Bar */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  isTraining ? "bg-green-500 animate-pulse" : currentStep > 0 ? "bg-yellow-500" : "bg-white/30"
                }`}
              />
              <span className="font-medium">
                {isTraining ? "Training..." : currentStep >= config.numSteps ? "Complete" : currentStep > 0 ? "Paused" : "Ready"}
              </span>
              <span className="text-white/50">
                Step {currentStep} / {config.numSteps}
              </span>
            </div>
            <div className="flex gap-3">
              {!isTraining && currentStep < config.numSteps && (
                <button
                  onClick={handleStartTraining}
                  className="px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400"
                >
                  {currentStep > 0 ? "Resume" : "Start Training"}
                </button>
              )}
              {isTraining && (
                <button
                  onClick={handleStopTraining}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-400"
                >
                  Stop
                </button>
              )}
              {currentStep >= config.numSteps && (
                <button className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-medium hover:bg-cyan-400">
                  Download Weights
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-200"
              style={{ width: `${(currentStep / config.numSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Metrics & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-xs text-white/50 mb-1">Current Loss</p>
                <p className="text-2xl font-bold font-mono">{lastLoss.toFixed(3)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-white/50 mb-1">Avg Loss</p>
                <p className="text-2xl font-bold font-mono">{avgLoss.toFixed(3)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-white/50 mb-1">Learning Rate</p>
                <p className="text-2xl font-bold font-mono">
                  {history.length > 0 ? history[history.length - 1].learningRate.toExponential(0) : "-"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-white/50 mb-1">Tokens/sec</p>
                <p className="text-2xl font-bold font-mono">
                  {history.length > 0 ? Math.round(history[history.length - 1].tokensPerSecond) : "-"}
                </p>
              </Card>
            </div>

            {/* Loss Chart */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Loss Curve</h3>
              <div className="h-64 relative">
                {history.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    {/* Grid */}
                    {[0, 1, 2, 3].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 66}
                        x2="400"
                        y2={i * 66}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Loss line */}
                    <polyline
                      fill="none"
                      stroke="url(#lossGradient)"
                      strokeWidth="2"
                      points={history
                        .map((h, i) => {
                          const x = (i / Math.max(history.length - 1, 1)) * 400
                          const y = 200 - (h.loss / 3) * 200
                          return `${x},${y}`
                        })
                        .join(" ")}
                    />
                    <defs>
                      <linearGradient id="lossGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/30">
                    Start training to see the loss curve
                  </div>
                )}
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/30 -ml-8">
                  <span>3.0</span>
                  <span>2.0</span>
                  <span>1.0</span>
                  <span>0.0</span>
                </div>
              </div>
            </Card>

            {/* What's Happening */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">What's Happening</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-cyan-400">
                {activeExplanation}
              </div>
            </Card>
          </div>

          {/* Right: Config & Sample Output */}
          <div className="space-y-6">
            {/* Training Config */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Training Config</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Model</span>
                  <span className="font-mono text-xs">{modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Method</span>
                  <span>{config.method === "supervised" ? "SL" : "RL"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Loss</span>
                  <span>{config.lossFunction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">LoRA Rank</span>
                  <span className="font-mono">{config.loraRank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Batch Size</span>
                  <span className="font-mono">{config.batchSize}</span>
                </div>
              </div>
            </Card>

            {/* Sample Output */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Sample Output</h3>
              <p className="text-xs text-white/50 mb-3">
                Input: "What is 25 + 37?"
              </p>
              <div className="bg-black/30 rounded-lg p-4 min-h-[120px]">
                {sampleOutput ? (
                  <pre className="text-sm whitespace-pre-wrap font-mono text-green-400">
                    {sampleOutput}
                  </pre>
                ) : (
                  <p className="text-white/30 text-sm">
                    Sample outputs will appear as training progresses...
                  </p>
                )}
              </div>
            </Card>

            <InfoBox title="Understanding the Loss" variant="info">
              <p>
                <strong>Loss</strong> measures how wrong the model's predictions are:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• High loss (~2-3): Model is guessing randomly</li>
                <li>• Medium loss (~1): Model is learning patterns</li>
                <li>• Low loss (~0.3-0.5): Model predicts well</li>
              </ul>
              <p className="mt-2">
                Watch it decrease as training progresses!
              </p>
            </InfoBox>

            <InfoBox title="Training Pipeline" variant="info">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-xs">1</div>
                  <span>Forward: Compute predictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-xs">2</div>
                  <span>Loss: Measure error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-xs">3</div>
                  <span>Backward: Compute gradients</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-xs">4</div>
                  <span>Optimize: Update weights</span>
                </div>
              </div>
            </InfoBox>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
