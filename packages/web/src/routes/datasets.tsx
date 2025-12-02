import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, InfoBox } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/datasets")({
  component: DatasetsPage,
})

// Mock tokenizer for demonstration
function mockTokenize(text: string): { token: string; id: number }[] {
  // Simple word-level tokenization with mock IDs for demo
  const words = text.split(/(\s+|[.,!?;:'"()\[\]{}])/g).filter(Boolean)
  return words.map((word, i) => ({
    token: word,
    id: Math.abs(hashCode(word)) % 100000,
  }))
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

const sampleDatasets = [
  {
    name: "Math Word Problems",
    description: "Simple arithmetic questions with step-by-step solutions",
    samples: [
      {
        input: "What is 25 + 37?",
        output: "Let me solve this step by step.\n25 + 37 = 62\nThe answer is 62.",
      },
      {
        input: "If you have 12 apples and give away 5, how many do you have left?",
        output: "Starting with 12 apples.\nGiving away 5 apples.\n12 - 5 = 7\nYou have 7 apples left.",
      },
    ],
  },
  {
    name: "Code Explanation",
    description: "Python code snippets with explanations",
    samples: [
      {
        input: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)",
        output: "This is a recursive function that calculates the factorial of n.\n- Base case: if n <= 1, return 1\n- Recursive case: multiply n by factorial(n-1)\n- Example: factorial(5) = 5 * 4 * 3 * 2 * 1 = 120",
      },
    ],
  },
  {
    name: "Instruction Following",
    description: "Simple instructions with appropriate responses",
    samples: [
      {
        input: "Translate 'hello' to Spanish",
        output: "The Spanish translation of 'hello' is 'hola'.",
      },
      {
        input: "List 3 primary colors",
        output: "The three primary colors are:\n1. Red\n2. Blue\n3. Yellow",
      },
    ],
  },
]

const tokenColors = [
  "bg-blue-500/80",
  "bg-purple-500/80",
  "bg-cyan-500/80",
  "bg-green-500/80",
  "bg-yellow-500/80",
  "bg-orange-500/80",
  "bg-pink-500/80",
  "bg-indigo-500/80",
]

function DatasetsPage() {
  const [selectedDataset, setSelectedDataset] = React.useState<number | null>(null)
  const [customText, setCustomText] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"samples" | "custom">("samples")
  const [selectedSample, setSelectedSample] = React.useState(0)

  const currentDataset = selectedDataset !== null ? sampleDatasets[selectedDataset] : null
  const textToTokenize = activeTab === "custom"
    ? customText
    : currentDataset?.samples[selectedSample]?.input + "\n\n" + currentDataset?.samples[selectedSample]?.output || ""

  const tokens = textToTokenize ? mockTokenize(textToTokenize) : []

  return (
    <AppLayout>
      <PageHeader
        title="Datasets"
        subtitle="Upload training data and visualize how it gets tokenized"
        step={1}
        totalSteps={4}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Dataset Selection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Choose a Dataset</h2>
              <div className="space-y-3">
                {sampleDatasets.map((dataset, i) => (
                  <Card
                    key={i}
                    onClick={() => {
                      setSelectedDataset(i)
                      setActiveTab("samples")
                      setSelectedSample(0)
                    }}
                    selected={selectedDataset === i}
                    className="p-4"
                  >
                    <h3 className="font-medium">{dataset.name}</h3>
                    <p className="text-sm text-white/60 mt-1">{dataset.description}</p>
                    <p className="text-xs text-white/40 mt-2">
                      {dataset.samples.length} samples
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Or Enter Custom Text</h2>
              <textarea
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value)
                  setActiveTab("custom")
                }}
                placeholder="Type or paste text here to see how it gets tokenized..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 resize-none font-mono text-sm"
              />
            </div>

            <InfoBox title="How Tokenization Works" variant="info">
              <p>
                Language models don't see text - they see numbers. A tokenizer splits text into
                "tokens" (usually subwords) and maps each to a unique ID. Common words might be
                single tokens, while rare words get split into pieces.
              </p>
              <p className="mt-2">
                <strong>BPE (Byte Pair Encoding)</strong> is the most common algorithm, used by
                GPT and Llama models.
              </p>
            </InfoBox>
          </div>

          {/* Right: Tokenization Visualization */}
          <div className="space-y-6">
            {currentDataset && activeTab === "samples" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Sample Data</h2>
                <div className="flex gap-2 mb-4">
                  {currentDataset.samples.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSample(i)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedSample === i
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      Sample {i + 1}
                    </button>
                  ))}
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-mono">INPUT</span>
                    <pre className="mt-1 text-sm whitespace-pre-wrap font-mono text-white/80">
                      {currentDataset.samples[selectedSample].input}
                    </pre>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <span className="text-xs text-green-400 font-mono">OUTPUT</span>
                    <pre className="mt-1 text-sm whitespace-pre-wrap font-mono text-white/80">
                      {currentDataset.samples[selectedSample].output}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Tokenized View
                <span className="text-sm font-normal text-white/50 ml-2">
                  ({tokens.length} tokens)
                </span>
              </h2>

              {tokens.length > 0 ? (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex flex-wrap gap-1">
                    {tokens.map((t, i) => (
                      <div
                        key={i}
                        className={`group relative ${tokenColors[i % tokenColors.length]} px-2 py-1 rounded text-xs font-mono text-black cursor-default`}
                      >
                        {t.token === "\n" ? "\\n" : t.token === " " ? "·" : t.token}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          ID: {t.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center text-white/40">
                  Select a dataset or enter text to see tokenization
                </div>
              )}
            </div>

            {tokens.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Token IDs</h2>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <span className="text-white/50">[</span>
                  {tokens.map((t, i) => (
                    <span key={i}>
                      <span className="text-cyan-400">{t.id}</span>
                      {i < tokens.length - 1 && <span className="text-white/30">, </span>}
                    </span>
                  ))}
                  <span className="text-white/50">]</span>
                </div>
              </div>
            )}

            <InfoBox title="Training Data Format" variant="info">
              <p>
                Tinker expects data as <code className="text-cyan-400">Datum</code> objects with:
              </p>
              <ul className="mt-2 space-y-1">
                <li>• <code className="text-cyan-400">model_input</code>: Token sequence for the prompt</li>
                <li>• <code className="text-cyan-400">target_tokens</code>: Tokens the model should predict</li>
                <li>• <code className="text-cyan-400">weights</code>: Which tokens count toward loss (0 for prompt, 1 for completion)</li>
              </ul>
            </InfoBox>

            <div className="flex justify-end">
              <a
                href="/models"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Next: Choose Model →
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
