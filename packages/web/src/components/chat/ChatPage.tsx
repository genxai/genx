import { useEffect, useMemo, useState, useRef } from "react"
import { useLiveQuery, eq } from "@tanstack/react-db"
import { authClient } from "@/lib/auth-client"
import {
  chatThreadsCollection,
  chatMessagesCollection,
} from "@/lib/collections"

async function createThread(title = "New chat") {
  const res = await fetch("/api/chat/mutations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "createThread", title }),
  })
  if (!res.ok) throw new Error("Failed to create chat")
  const json = (await res.json()) as {
    thread: { id: number; title: string; created_at?: string }
  }
  // Electric will sync automatically via the shape subscription
  return {
    ...json.thread,
    created_at: json.thread.created_at
      ? new Date(json.thread.created_at)
      : new Date(),
  }
}

async function addMessage({
  threadId,
  role,
  content,
}: {
  threadId: number
  role: "user" | "assistant"
  content: string
}) {
  const res = await fetch("/api/chat/mutations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "addMessage",
      threadId,
      role,
      content,
    }),
  })
  if (!res.ok) throw new Error("Failed to add message")
  const json = (await res.json()) as { message: { id: number } & Message }
  // Electric will sync automatically via the shape subscription
  return {
    ...json.message,
    created_at: json.message.created_at
      ? new Date(json.message.created_at)
      : new Date(),
  }
}

async function deleteAllThreads() {
  const res = await fetch("/api/chat/mutations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "deleteAllThreads" }),
  })
  if (!res.ok) throw new Error("Failed to delete chats")
}

type Message = {
  id: number
  thread_id: number
  role: string
  content: string
  created_at: Date
}

const FREE_REQUEST_KEY = "gen_chat_free_requests"
const FREE_REQUEST_LIMIT = 1
const MODEL_STORAGE_KEY = "gen_chat_model"

const AVAILABLE_MODELS = [
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
] as const

type ModelId = typeof AVAILABLE_MODELS[number]["id"]

function getStoredModel(): ModelId {
  if (typeof window === "undefined") return AVAILABLE_MODELS[0].id
  const stored = localStorage.getItem(MODEL_STORAGE_KEY)
  if (stored && AVAILABLE_MODELS.some(m => m.id === stored)) {
    return stored as ModelId
  }
  return AVAILABLE_MODELS[0].id
}

function setStoredModel(model: ModelId) {
  localStorage.setItem(MODEL_STORAGE_KEY, model)
}

function getFreeRequestCount(): number {
  if (typeof window === "undefined") return 0
  return parseInt(localStorage.getItem(FREE_REQUEST_KEY) || "0", 10)
}

function incrementFreeRequestCount(): number {
  const count = getFreeRequestCount() + 1
  localStorage.setItem(FREE_REQUEST_KEY, count.toString())
  return count
}

type GuestMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

export function ChatPage() {
  const { data: session, isPending } = authClient.useSession()
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [guestMessages, setGuestMessages] = useState<GuestMessage[]>([])
  const [freeRequestsUsed, setFreeRequestsUsed] = useState(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelId>(AVAILABLE_MODELS[0].id)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Initialize free request count and model from localStorage
  useEffect(() => {
    setFreeRequestsUsed(getFreeRequestCount())
    setSelectedModel(getStoredModel())
  }, [])

  const handleModelChange = (model: ModelId) => {
    setSelectedModel(model)
    setStoredModel(model)
  }

  const { data: threads = [] } = useLiveQuery((q) =>
    q
      .from({ chatThreads: chatThreadsCollection })
      .orderBy(({ chatThreads }) => chatThreads.created_at),
  )

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => b.id - a.id),
    [threads],
  )

  useEffect(() => {
    if (activeThreadId === null && sortedThreads.length > 0) {
      setActiveThreadId(sortedThreads[0].id)
    }
  }, [sortedThreads, activeThreadId])

  const { data: dbMessages = [] } = useLiveQuery(
    (q) => {
      const base = q
        .from({ chatMessages: chatMessagesCollection })
        .orderBy(({ chatMessages }) => chatMessages.created_at)
      if (activeThreadId) {
        return base.where(({ chatMessages }) =>
          eq(chatMessages.thread_id, activeThreadId),
        )
      }
      return base
    },
    [activeThreadId],
  )

  const isAuthenticated = !!session?.session

  // Combine DB messages (for auth users) or guest messages with streaming content
  const allMessages = useMemo(() => {
    if (isAuthenticated) {
      const msgs = [...dbMessages]
      if (streamingContent) {
        msgs.push({
          id: -1,
          thread_id: activeThreadId ?? 0,
          role: "assistant",
          content: streamingContent,
          created_at: new Date(),
        })
      }
      return msgs
    } else {
      // Guest mode - use local messages
      const msgs = guestMessages.map((m) => ({
        id: m.id,
        thread_id: 0,
        role: m.role,
        content: m.content,
        created_at: new Date(),
      }))
      if (streamingContent) {
        msgs.push({
          id: -1,
          thread_id: 0,
          role: "assistant",
          content: streamingContent,
          created_at: new Date(),
        })
      }
      return msgs
    }
  }, [
    isAuthenticated,
    dbMessages,
    guestMessages,
    streamingContent,
    activeThreadId,
  ])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages, guestMessages])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Clear streaming content when switching threads
  useEffect(() => {
    setStreamingContent("")
  }, [activeThreadId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)
    setStreamingContent("")

    const isAuthenticated = !!session?.session

    // Check if guest has used their free request
    if (!isAuthenticated && freeRequestsUsed >= FREE_REQUEST_LIMIT) {
      setShowAuthPrompt(true)
      setIsLoading(false)
      return
    }

    try {
      if (isAuthenticated) {
        // Authenticated user flow - save to DB
        let threadId = activeThreadId
        if (!threadId) {
          const thread = await createThread(
            userMessage.slice(0, 40) || "New chat",
          )
          threadId = thread.id
          setActiveThreadId(thread.id)
        }

        // Save user message to DB
        await addMessage({ threadId, role: "user", content: userMessage })

        // Get all messages for this thread to send to AI
        const messages = [
          ...dbMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: userMessage },
        ]

        // Call AI endpoint with streaming
        const res = await fetch("/api/chat/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ threadId, messages, model: selectedModel }),
        })

        if (!res.ok) {
          throw new Error(`AI request failed: ${res.status}`)
        }

        // Handle streaming response
        const reader = res.body?.getReader()
        if (!reader) {
          throw new Error("No response body")
        }

        const decoder = new TextDecoder()
        let accumulated = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setStreamingContent(accumulated)
        }

        // Clear streaming content - Electric will sync new messages automatically
        setStreamingContent("")
      } else {
        // Guest user flow - local only, no DB
        const newUserMsg: GuestMessage = {
          id: Date.now(),
          role: "user",
          content: userMessage,
        }
        setGuestMessages((prev) => [...prev, newUserMsg])

        // Call guest AI endpoint
        const messages = [
          ...guestMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: userMessage },
        ]

        const res = await fetch("/api/chat/guest", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages, model: selectedModel }),
        })

        if (!res.ok) {
          throw new Error(`AI request failed: ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) {
          throw new Error("No response body")
        }

        const decoder = new TextDecoder()
        let accumulated = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setStreamingContent(accumulated)
        }

        // Add assistant message to guest messages
        const newAssistantMsg: GuestMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: accumulated,
        }
        setGuestMessages((prev) => [...prev, newAssistantMsg])
        setStreamingContent("")

        // Increment free request counter and show auth prompt
        const newCount = incrementFreeRequestCount()
        setFreeRequestsUsed(newCount)
        if (newCount >= FREE_REQUEST_LIMIT) {
          setShowAuthPrompt(true)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setStreamingContent("")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (isPending) {
    return null
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="border-r border-slate-200 bg-white flex flex-col h-screen">
        <div className="p-4 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Chats</h2>
          {isAuthenticated && (
            <button
              className="text-sm px-2 py-1 rounded bg-slate-900 text-white"
              onClick={async () => {
                const thread = await createThread()
                setActiveThreadId(thread.id)
              }}
            >
              New
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-200 flex-1 overflow-y-auto">
          {isAuthenticated ? (
            <>
              {sortedThreads.map((thread) => (
                <button
                  key={thread.id}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-100 ${
                    activeThreadId === thread.id ? "bg-slate-100" : ""
                  }`}
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <div className="text-sm font-medium text-slate-800">
                    {thread.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(thread.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
              {sortedThreads.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-500">
                  No chats yet. Create one to start talking to the AI.
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              {freeRequestsUsed < FREE_REQUEST_LIMIT
                ? `Try 1 free message! (${FREE_REQUEST_LIMIT - freeRequestsUsed} remaining)`
                : "Sign in to continue chatting."}
            </div>
          )}
        </div>
        {isAuthenticated && sortedThreads.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <button
              className="w-full text-sm px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
              onClick={async () => {
                if (confirm("Delete all chats? This cannot be undone.")) {
                  await deleteAllThreads()
                  setActiveThreadId(null)
                }
              }}
            >
              Delete all chats
            </button>
          </div>
        )}
        {/* Profile section at bottom */}
        <div className="p-4 border-t border-slate-200" ref={profileMenuRef}>
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 w-full hover:bg-slate-100 rounded p-2 -m-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
                  {session.user?.name?.[0]?.toUpperCase() ||
                    session.user?.email?.[0]?.toUpperCase() ||
                    "?"}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {session.user?.name || session.user?.email}
                  </div>
                </div>
              </button>
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={async () => {
                      await authClient.signOut()
                      setShowProfileMenu(false)
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="block w-full text-center text-sm px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800"
            >
              Login
            </a>
          )}
        </div>
      </aside>
      <main className="flex flex-col bg-slate-50 h-screen">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-2xl rounded-lg px-4 py-3 ${
                msg.role === "assistant"
                  ? "bg-white border border-slate-200"
                  : "bg-slate-900 text-white ml-auto"
              }`}
            >
              <div className="text-xs uppercase tracking-wide mb-1 text-slate-500">
                {msg.role}
              </div>
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
            </div>
          ))}
          {allMessages.length === 0 && (
            <div className="text-slate-500 text-sm">
              {isAuthenticated
                ? "No messages yet."
                : "Try a free message! Ask the AI anything."}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value as ModelId)}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <textarea
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isAuthenticated
                  ? "Ask the AI anything..."
                  : "Try a free message..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <button
              type="submit"
              className="self-end px-4 py-2 bg-slate-900 text-white rounded-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </main>

      {/* Auth prompt modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Sign in to continue
            </h2>
            <p className="text-slate-600 mb-4">
              You've used your free message. Sign in to get unlimited access and
              save your chat history.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                onClick={() => setShowAuthPrompt(false)}
              >
                Maybe later
              </button>
              <a
                href="/login"
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-center"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
