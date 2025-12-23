import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AppLayout, PageHeader, Card, RequireAuth } from "@/components/layout/AppLayout"

export const Route = createFileRoute("/infra/")({
  component: InfraPage,
})

function InfraPage() {
  return (
    <AppLayout>
      <RequireAuth>
        <PageHeader
          title="Infrastructure"
          subtitle="Deploy and manage GPU resources for model hosting"
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link to="/infra/playground">
              <Card className="p-6 h-full hover:border-cyan-500/50">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Playground</h3>
                <p className="text-sm text-white/60">
                  Test inference with Prime Intellect's hosted models or your own GPU.
                </p>
              </Card>
            </Link>

            <Link to="/infra/deploy">
              <Card className="p-6 h-full hover:border-purple-500/50">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Deploy Model</h3>
                <p className="text-sm text-white/60">
                  Provision GPU instances and deploy your own models with vLLM.
                </p>
              </Card>
            </Link>

            <Link to="/infra/train">
              <Card className="p-6 h-full hover:border-green-500/50">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Train Model</h3>
                <p className="text-sm text-white/60">
                  Fine-tune models with Tinker's distributed training infrastructure.
                </p>
              </Card>
            </Link>
          </div>

          {/* Status Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Active Resources */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Resources</h2>
              <Card className="p-6">
                <div className="text-center py-8 text-white/40">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                  <p>No active GPU instances</p>
                  <Link
                    to="/infra/deploy"
                    className="inline-block mt-4 px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                  >
                    Deploy your first model
                  </Link>
                </div>
              </Card>
            </div>

            {/* Usage Stats */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Usage This Month</h2>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Inference Requests</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">GPU Hours</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Tokens Generated</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Training Runs</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </RequireAuth>
    </AppLayout>
  )
}
