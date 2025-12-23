import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/research/")({
  component: ResearchPage,
})

const RESEARCH_TOPICS = [
  {
    id: "computer-use",
    title: "Computer Use",
    subtitle: "Vision-Language-Action Models",
    description: "Train an AI agent that can see your screen and control your computer. Full pipeline from data collection to training to inference.",
    icon: "🖥️",
    color: "purple",
    tags: ["VLM", "Agent", "RL"],
  },
  {
    id: "next-action",
    title: "Next Action Prediction",
    subtitle: "Decision Transformers",
    description: "Predict what action a user will take next based on their workflow history. Uses sequence modeling for behavior prediction.",
    icon: "🎯",
    color: "emerald",
    tags: ["Transformer", "Prediction", "JAX"],
    comingSoon: true,
  },
  {
    id: "voice-agent",
    title: "Voice Agent",
    subtitle: "Speech-to-Action Models",
    description: "Build a voice-controlled assistant that can execute commands and navigate your system through speech.",
    icon: "🎙️",
    color: "cyan",
    tags: ["ASR", "TTS", "Agent"],
    comingSoon: true,
  },
  {
    id: "code-agent",
    title: "Code Agent",
    subtitle: "Autonomous Coding Assistant",
    description: "Train an agent that can write, test, and debug code autonomously in a sandboxed environment.",
    icon: "💻",
    color: "yellow",
    tags: ["Code", "Sandbox", "RL"],
    comingSoon: true,
  },
]

function ResearchPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Research"
        subtitle="Deep dives into training AI agents for real-world tasks"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {RESEARCH_TOPICS.map((topic) => (
            <ResearchCard key={topic.id} {...topic} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/40 mb-4">
            Want to train these models? Use GenX infrastructure.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/infra/deploy"
              className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20"
            >
              Provision GPUs
            </Link>
            <Link
              to="/infra/train"
              className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20"
            >
              Start Training
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function ResearchCard({
  id,
  title,
  subtitle,
  description,
  icon,
  color,
  tags,
  comingSoon,
}: {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  tags: string[]
  comingSoon?: boolean
}) {
  const colorClasses: Record<string, string> = {
    purple: "border-purple-500/50 hover:border-purple-500",
    emerald: "border-emerald-500/50 hover:border-emerald-500",
    cyan: "border-cyan-500/50 hover:border-cyan-500",
    yellow: "border-yellow-500/50 hover:border-yellow-500",
  }

  const bgClasses: Record<string, string> = {
    purple: "bg-purple-500/20",
    emerald: "bg-emerald-500/20",
    cyan: "bg-cyan-500/20",
    yellow: "bg-yellow-500/20",
  }

  const tagClasses: Record<string, string> = {
    purple: "bg-purple-500/20 text-purple-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
  }

  const content = (
    <Card className={`p-6 h-full transition-all ${colorClasses[color]} ${comingSoon ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {comingSoon && (
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/50">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-sm text-white/50 mb-3">{subtitle}</p>
      <p className="text-sm text-white/60 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className={`px-2 py-1 rounded text-xs ${tagClasses[color]}`}>
            {tag}
          </span>
        ))}
      </div>
    </Card>
  )

  if (comingSoon) {
    return <div className="cursor-not-allowed">{content}</div>
  }

  return (
    <Link to={`/research/${id}`} className="block">
      {content}
    </Link>
  )
}
