import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/models")({
  component: ModelsPage,
})

interface HFModel {
  id: string
  author: string
  downloads: number
  likes: number
  tags: string[]
  pipeline_tag?: string
  lastModified: string
}

const MODEL_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "text-generation", label: "Text Generation" },
  { id: "text2text-generation", label: "Text2Text" },
  { id: "image-text-to-text", label: "Vision" },
  { id: "feature-extraction", label: "Embeddings" },
]

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function ModelsPage() {
  const [models, setModels] = React.useState<HFModel[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [category, setCategory] = React.useState("text-generation")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    fetchModels()
  }, [category])

  const fetchModels = async () => {
    setLoading(true)
    setError(null)

    try {
      // HuggingFace API for trending models
      const params = new URLSearchParams({
        sort: "downloads",
        direction: "-1",
        limit: "50",
      })

      if (category !== "all") {
        params.set("pipeline_tag", category)
      }

      const response = await fetch(`https://huggingface.co/api/models?${params}`)
      if (!response.ok) throw new Error("Failed to fetch models")

      const data = await response.json()
      setModels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const filteredModels = models.filter((m) =>
    search ? m.id.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <AppLayout>
      <PageHeader
        title="Trending Models"
        subtitle="Popular open-source models from HuggingFace"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex gap-1">
            {MODEL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Models Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchModels}
              className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}

        {!loading && filteredModels.length === 0 && (
          <div className="text-center py-16 text-white/50">
            No models found matching "{search}"
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function ModelCard({ model }: { model: HFModel }) {
  const [author, name] = model.id.split("/")

  return (
    <Card className="p-4 hover:border-white/30">
      <a
        href={`https://huggingface.co/${model.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/50 truncate">{author}</p>
            <h3 className="font-medium truncate">{name || model.id}</h3>
          </div>
          <svg
            className="w-4 h-4 text-white/30 flex-shrink-0 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/50">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {formatNumber(model.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {formatNumber(model.likes)}
          </span>
        </div>

        {model.pipeline_tag && (
          <div className="mt-3">
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
              {model.pipeline_tag}
            </span>
          </div>
        )}
      </a>
    </Card>
  )
}
