import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Card, InfoBox } from "../layout/AppLayout"

const stages = [
  {
    id: "token-embeddings",
    title: "Token Embeddings",
    subtitle: "Text → Numbers",
    description:
      "Language models don't understand text directly. First, we split text into tokens and convert each to a unique ID from a vocabulary.",
    visual: <TokenEmbeddingsVisual />,
  },
  {
    id: "attention",
    title: "Attention",
    subtitle: "The Core Mechanism",
    description:
      "Each token creates a Query (what am I looking for?), Key (what do I contain?), and Value (what information do I have?). Attention scores determine how much each token should attend to every other token.",
    visual: <AttentionVisual />,
  },
  {
    id: "kv-caching",
    title: "KV Caching",
    subtitle: "Efficient Generation",
    description:
      "During autoregressive generation, we cache K and V vectors from previous tokens. This avoids recomputing them, making generation O(n) instead of O(n²) per token.",
    visual: <KVCachingVisual />,
  },
  {
    id: "gqa",
    title: "GQA",
    subtitle: "Grouped-Query Attention",
    description:
      "Multiple Query heads share fewer Key-Value heads. This reduces memory from ~4MB to ~31KB per token in the KV cache while maintaining quality.",
    visual: <GQAVisual />,
  },
  {
    id: "mla",
    title: "MLA",
    subtitle: "Multi-head Latent Attention",
    description:
      "DeepSeek's innovation: compress K and V into a low-rank latent representation. The KV cache stores compressed vectors, decompressing on-the-fly during attention.",
    visual: <MLAVisual />,
  },
  {
    id: "dsa",
    title: "DSA",
    subtitle: "DeepSeek Sparse Attention",
    description:
      "Not all tokens are equally important. DSA uses a Top-K selector to identify the most relevant tokens, dramatically reducing computation for long contexts.",
    visual: <DSAVisual />,
  },
]

export function TransformerExplainer() {
  const [activeStage, setActiveStage] = React.useState(0)

  return (
    <>
      {/* Hero Section */}
      <div className="border-b border-white/10 px-6 py-12 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Learn LLMs by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Building</span>
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Understand transformers from first principles, then train your own models with Tinker's distributed infrastructure.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/infra/train"
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Start Training
            </Link>
            <button
              onClick={() => document.getElementById('learn-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Learn First
            </button>
          </div>
        </div>
      </div>

      {/* Stage Navigation */}
      <nav id="learn-section" className="border-b border-white/10 px-6 py-3 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          {stages.map((stage, i) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeStage === i
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {i + 1}. {stage.title}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Explanation */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-cyan-400 font-mono mb-2">
                Stage {activeStage + 1} of {stages.length}
              </p>
              <h2 className="text-4xl font-bold mb-2">
                {stages[activeStage].title}
              </h2>
              <p className="text-xl text-white/60">
                {stages[activeStage].subtitle}
              </p>
            </div>
            <p className="text-lg text-white/80 leading-relaxed">
              {stages[activeStage].description}
            </p>

            {/* Stage-specific details */}
            <StageDetails stage={stages[activeStage].id} />

            {/* Navigation */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                disabled={activeStage === 0}
                className="px-6 py-3 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setActiveStage(Math.min(stages.length - 1, activeStage + 1))
                }
                disabled={activeStage === stages.length - 1}
                className="px-6 py-3 bg-white rounded-lg text-black font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next Stage
              </button>
            </div>
          </div>

          {/* Visual */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 min-h-[500px] flex items-center justify-center">
            {stages[activeStage].visual}
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="border-t border-white/10 px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Train Your Own Model?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Upload your dataset, pick a base model, and let Tinker handle the distributed training infrastructure.
          </p>
          <Link
            to="/infra/train"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  )
}

function StageDetails({ stage }: { stage: string }) {
  switch (stage) {
    case "token-embeddings":
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Key Concepts
          </h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                <strong className="text-white">Tokenization:</strong> Split text
                into subwords (BPE, WordPiece, SentencePiece)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                <strong className="text-white">Vocabulary:</strong> Typically
                32K-128K unique tokens
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                <strong className="text-white">Embedding:</strong> Each token ID
                maps to a learned d-dimensional vector
              </span>
            </li>
          </ul>
        </div>
      )
    case "attention":
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            The Math
          </h3>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-cyan-400">
              Attention(Q, K, V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>) V
            </p>
          </div>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">Q</span>
              <span>Query: What information am I looking for?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">K</span>
              <span>Key: What information do I contain?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">V</span>
              <span>Value: What information should I pass along?</span>
            </li>
          </ul>
        </div>
      )
    case "kv-caching":
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Why It Matters
          </h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                Without caching: Generate token n requires computing K,V for
                tokens 1...n-1 again
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                With caching: Only compute K,V for the new token, reuse cached
                values
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>
                Trade-off: Memory usage grows linearly with sequence length
              </span>
            </li>
          </ul>
        </div>
      )
    case "gqa":
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Memory Comparison
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-1">MHA (Multi-Head)</p>
              <p className="text-2xl font-bold text-red-400">~4 MB</p>
              <p className="text-xs text-white/50">per token KV cache</p>
            </div>
            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-1">GQA (Grouped)</p>
              <p className="text-2xl font-bold text-green-400">~31 KB</p>
              <p className="text-xs text-white/50">per token KV cache</p>
            </div>
          </div>
          <p className="text-sm text-white/50">
            128× memory reduction with minimal quality loss
          </p>
        </div>
      )
    case "mla":
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            DeepSeek's Approach
          </h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>
                Compress K,V into low-dimensional latent: C<sup>KV</sup> = XW
                <sub>c</sub>
                <sup>KV</sup>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Cache only the compressed representation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Decompress during attention computation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>RoPE applied separately to maintain position info</span>
            </li>
          </ul>
        </div>
      )
    case "dsa":
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Sparse Attention Components
          </h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>
                <strong className="text-white">Top-K Selector:</strong> Choose
                most relevant tokens based on attention scores
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>
                <strong className="text-white">Lightning Indexer:</strong>{" "}
                Efficient retrieval of selected K,V pairs
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>
                <strong className="text-white">Result:</strong> Sub-quadratic
                attention for long sequences
              </span>
            </li>
          </ul>
        </div>
      )
    default:
      return null
  }
}

// Visual Components

function TokenEmbeddingsVisual() {
  const tokens = [
    { text: "How", id: 5299, color: "bg-blue-500" },
    { text: "do", id: 621, color: "bg-purple-500" },
    { text: "you", id: 481, color: "bg-cyan-500" },
    { text: "breathe", id: 54359, color: "bg-green-500" },
    { text: "underwater", id: 82900, color: "bg-yellow-500" },
    { text: "?", id: 30, color: "bg-orange-500" },
  ]

  return (
    <div className="w-full space-y-8">
      <div className="text-center text-white/50 text-sm">Input text</div>
      <div className="flex flex-wrap justify-center gap-2">
        {tokens.map((t, i) => (
          <div
            key={i}
            className={`${t.color} px-3 py-2 rounded text-black font-medium`}
          >
            {t.text}
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <svg
          className="w-6 h-12 text-white/30"
          fill="none"
          viewBox="0 0 24 48"
        >
          <path
            d="M12 0v40M6 34l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="text-center text-white/50 text-sm">Token IDs</div>
      <div className="flex flex-wrap justify-center gap-2">
        {tokens.map((t, i) => (
          <div
            key={i}
            className="border border-white/20 px-3 py-2 rounded font-mono text-sm"
          >
            {t.id}
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <svg
          className="w-6 h-12 text-white/30"
          fill="none"
          viewBox="0 0 24 48"
        >
          <path
            d="M12 0v40M6 34l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="text-center text-white/50 text-sm">
        Embedding vectors (d=4096)
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {tokens.map((t, i) => (
          <div
            key={i}
            className="border border-white/20 px-2 py-2 rounded text-xs font-mono"
          >
            <span className="text-white/30">[</span>
            <span className="text-cyan-400">0.23</span>
            <span className="text-white/30">, </span>
            <span className="text-cyan-400">-0.8</span>
            <span className="text-white/30">, ...</span>
            <span className="text-white/30">]</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttentionVisual() {
  const size = 6
  const labels = ["x₁", "x₂", "x₃", "x₄", "x₅", "x₆"]

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-center gap-12">
        {/* Q, K, V matrices */}
        {[
          { label: "Q", color: "border-yellow-500", bg: "bg-yellow-500/20" },
          { label: "K", color: "border-orange-500", bg: "bg-orange-500/20" },
          { label: "V", color: "border-green-500", bg: "bg-green-500/20" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div
              className={`w-16 h-20 ${m.bg} border ${m.color} rounded flex items-center justify-center`}
            >
              <span className="text-2xl font-bold">{m.label}</span>
            </div>
            <p className="text-xs text-white/50 mt-2">W{m.label} × X</p>
          </div>
        ))}
      </div>

      <div className="text-center text-white/50 text-sm">
        QK<sup>T</sup> → Attention Matrix
      </div>

      {/* Attention matrix */}
      <div className="flex justify-center">
        <div className="inline-block">
          <div className="flex">
            <div className="w-8" />
            {labels.map((l, i) => (
              <div
                key={i}
                className="w-8 h-6 flex items-center justify-center text-xs text-orange-400"
              >
                k{i + 1}
              </div>
            ))}
          </div>
          {labels.map((_, qi) => (
            <div key={qi} className="flex">
              <div className="w-8 h-8 flex items-center justify-center text-xs text-yellow-400">
                q{qi + 1}
              </div>
              {labels.map((_, ki) => {
                const intensity = ki <= qi ? 0.3 + Math.random() * 0.5 : 0.1
                return (
                  <div
                    key={ki}
                    className="w-8 h-8 border border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: `rgba(255,255,255,${intensity})` }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-white/50 text-sm">
        softmax → weighted sum of V
      </div>
    </div>
  )
}

function KVCachingVisual() {
  return (
    <div className="w-full space-y-6">
      <div className="text-center text-white/50 text-sm mb-4">
        Generating token 7...
      </div>

      <div className="space-y-4">
        {/* Cached K values */}
        <div className="flex items-center gap-4">
          <span className="w-16 text-right text-sm text-orange-400">
            K cache
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-10 h-10 bg-orange-500/30 border border-orange-500 rounded flex items-center justify-center text-xs"
              >
                k{i}
              </div>
            ))}
            <div className="w-10 h-10 bg-orange-500 border border-orange-400 rounded flex items-center justify-center text-xs text-black font-bold animate-pulse">
              k7
            </div>
          </div>
        </div>

        {/* Cached V values */}
        <div className="flex items-center gap-4">
          <span className="w-16 text-right text-sm text-green-400">
            V cache
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-10 h-10 bg-green-500/30 border border-green-500 rounded flex items-center justify-center text-xs"
              >
                v{i}
              </div>
            ))}
            <div className="w-10 h-10 bg-green-500 border border-green-400 rounded flex items-center justify-center text-xs text-black font-bold animate-pulse">
              v7
            </div>
          </div>
        </div>

        {/* New query */}
        <div className="flex items-center gap-4">
          <span className="w-16 text-right text-sm text-yellow-400">
            New Q
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-10 h-10 border border-white/10 rounded flex items-center justify-center text-xs text-white/20"
              >
                -
              </div>
            ))}
            <div className="w-10 h-10 bg-yellow-500 border border-yellow-400 rounded flex items-center justify-center text-xs text-black font-bold">
              q7
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-white/50 text-sm mt-6">
        Only compute attention for the new token
        <br />
        <span className="text-green-400">Reuse cached K, V</span>
      </div>
    </div>
  )
}

function GQAVisual() {
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 gap-8">
        {/* MHA */}
        <div className="space-y-4">
          <div className="text-center text-sm text-white/50">
            Multi-Head Attention
          </div>
          <div className="space-y-2">
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-yellow-500/30 border border-yellow-500 rounded text-xs flex items-center justify-center"
                >
                  Q{i}
                </div>
              ))}
            </div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-orange-500/30 border border-orange-500 rounded text-xs flex items-center justify-center"
                >
                  K{i}
                </div>
              ))}
            </div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-green-500/30 border border-green-500 rounded text-xs flex items-center justify-center"
                >
                  V{i}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-red-400">
            4 KV heads = 4× memory
          </div>
        </div>

        {/* GQA */}
        <div className="space-y-4">
          <div className="text-center text-sm text-white/50">
            Grouped-Query Attention
          </div>
          <div className="space-y-2">
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-yellow-500/30 border border-yellow-500 rounded text-xs flex items-center justify-center"
                >
                  Q{i}
                </div>
              ))}
            </div>
            <div className="flex gap-1 justify-center items-center">
              <div className="w-16 h-8 bg-orange-500/30 border border-orange-500 rounded text-xs flex items-center justify-center">
                K₁
              </div>
              <div className="w-16 h-8 bg-orange-500/30 border border-orange-500 rounded text-xs flex items-center justify-center">
                K₂
              </div>
            </div>
            <div className="flex gap-1 justify-center items-center">
              <div className="w-16 h-8 bg-green-500/30 border border-green-500 rounded text-xs flex items-center justify-center">
                V₁
              </div>
              <div className="w-16 h-8 bg-green-500/30 border border-green-500 rounded text-xs flex items-center justify-center">
                V₂
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-green-400">
            2 KV heads = 2× memory
          </div>
        </div>
      </div>

      <div className="text-center text-white/50 text-sm">
        Q₁, Q₂ share K₁, V₁ | Q₃, Q₄ share K₂, V₂
      </div>
    </div>
  )
}

function MLAVisual() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="w-12 h-16 bg-white/10 border border-white/30 rounded flex items-center justify-center">
            X
          </div>
          <p className="text-xs text-white/50 mt-1">Input</p>
        </div>

        <svg className="w-8 h-6 text-white/30" fill="none" viewBox="0 0 32 24">
          <path d="M0 12h24M18 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
        </svg>

        <div className="text-center">
          <div className="w-8 h-12 bg-purple-500/30 border border-purple-500 rounded flex items-center justify-center text-xs">
            C<sup>KV</sup>
          </div>
          <p className="text-xs text-white/50 mt-1">Compressed</p>
        </div>

        <svg className="w-8 h-6 text-white/30" fill="none" viewBox="0 0 32 24">
          <path d="M0 12h24M18 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
        </svg>

        <div className="text-center space-y-2">
          <div className="w-12 h-8 bg-orange-500/30 border border-orange-500 rounded flex items-center justify-center text-xs">
            K
          </div>
          <div className="w-12 h-8 bg-green-500/30 border border-green-500 rounded flex items-center justify-center text-xs">
            V
          </div>
          <p className="text-xs text-white/50">Decompressed</p>
        </div>
      </div>

      <div className="bg-black/50 rounded-lg p-4 text-center">
        <p className="text-sm text-white/70">
          Cache:{" "}
          <span className="text-purple-400 font-mono">
            C<sup>KV</sup>
          </span>{" "}
          instead of{" "}
          <span className="text-orange-400 font-mono">K</span>,{" "}
          <span className="text-green-400 font-mono">V</span>
        </p>
        <p className="text-xs text-white/50 mt-2">
          d<sub>c</sub> {"<<"} d<sub>k</sub> × h
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-xs">
          RoPE
        </div>
        <span className="text-white/50 text-xs">
          applied separately for position encoding
        </span>
      </div>
    </div>
  )
}

function DSAVisual() {
  const tokens = Array.from({ length: 12 }, (_, i) => i + 1)
  const selected = [2, 5, 7, 9, 11]

  return (
    <div className="w-full space-y-6">
      <div className="text-center text-white/50 text-sm">All tokens</div>
      <div className="flex flex-wrap justify-center gap-1">
        {tokens.map((t) => (
          <div
            key={t}
            className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
              selected.includes(t)
                ? "bg-pink-500/30 border border-pink-500"
                : "bg-white/5 border border-white/10"
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="px-4 py-2 bg-pink-500/20 border border-pink-500 rounded-lg text-sm">
          Top-K Selector
        </div>
      </div>

      <div className="text-center text-white/50 text-sm">
        Selected tokens (K=5)
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {selected.map((t) => (
          <div
            key={t}
            className="w-8 h-8 bg-pink-500 rounded text-xs flex items-center justify-center text-black font-bold"
          >
            {t}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-lg text-sm">
          Lightning Indexer
        </div>
      </div>

      <div className="text-center text-white/50 text-xs">
        Efficient retrieval of sparse K, V pairs
      </div>
    </div>
  )
}
