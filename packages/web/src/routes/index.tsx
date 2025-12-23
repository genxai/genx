import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "@/components/layout/AppLayout"
import { TransformerExplainer } from "@/components/landing/TransformerExplainer"

export const Route = createFileRoute("/")({
  component: LearnPage,
})

function LearnPage() {
  return (
    <AppLayout>
      <TransformerExplainer />
    </AppLayout>
  )
}
