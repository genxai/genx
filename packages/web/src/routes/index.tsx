import { createFileRoute } from "@tanstack/react-router"
import { TransformerExplainer } from "@/components/landing/TransformerExplainer"

export const Route = createFileRoute("/")({
  component: TransformerExplainer,
})
