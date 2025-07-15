"use client"

import React, { useState, useRef, useEffect } from "react"

export default function ChatAssistant({ user }: { user: any }) {
  // Message state with localStorage persistence
  const defaultMessage = { role: "assistant", content: "Hello! I am your NCC AI Assistant. How can I help you today?" }
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ncc_chat_history")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return [defaultMessage]
        }
      }
    }
    return [defaultMessage]
  })
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save chat history to localStorage on every change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ncc_chat_history", JSON.stringify(messages))
    }
  }, [messages])

  // Count user+assistant message pairs (excluding initial assistant message)
  const chatCount = Math.floor((messages.length - 1) / 2)

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Send message handler (with file upload support)
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !file) return
    setIsSending(true)
    let userMsgAdded = false
    if (input.trim()) {
      setMessages((prev) => {
        userMsgAdded = true
        return [...prev, { role: "user", content: input }]
      })
    }
    if (file) {
      setMessages((prev) => [...prev, { role: "user", content: `Sent a file: ${file.name}` }])
    }
    setInput("")
    try {
      let reply = ""
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        if (input.trim()) formData.append("message", input)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload`, {
          method: "POST",
          body: formData
        })
        const data = await res.json()
        reply = data.reply || "File received."
        setFile(null)
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input })
        })
        const data = await res.json()
        reply = data.reply
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, there was an error." }])
    }
    setIsSending(false)
  }

  // Local clear chat handler (no backend call)
  const clearChat = () => {
    setMessages([defaultMessage])
    setFile(null)
    setInput("")
    if (typeof window !== "undefined") {
      localStorage.removeItem("ncc_chat_history")
    }
  }

  // Sample questions
  const sampleQuestions = [
    "What is NCC?",
    "How do I join the NCC camp?",
    "Show me the latest training schedule.",
    "How can I contact my instructor?",
    "What are the eligibility criteria?"
  ]

  // Download transcript
  const downloadTranscript = () => {
    const text = messages.map(m => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ncc_chat_transcript.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[70vh] bg-white/90 rounded-xl shadow-lg border border-gray-100 overflow-hidden" role="region" aria-label="Chat Assistant">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" tabIndex={0} aria-live="polite">
        {/* Top bar: Clear chat, Download transcript, Chat count */}
        <div className="flex justify-between mb-2 items-center">
          <div className="flex gap-2">
            <button
              onClick={clearChat}
              className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded px-3 py-1 font-semibold border border-blue-100 shadow-sm transition"
              disabled={isSending}
              aria-label="Clear chat history"
            >
              Clear Chat
            </button>
            <button
              onClick={downloadTranscript}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 font-semibold border border-gray-200 shadow-sm transition"
              aria-label="Download chat transcript"
            >
              Download Transcript
            </button>
          </div>
          <div className="text-xs text-gray-500" aria-label="Chat count">
            Chats: {chatCount}
          </div>
        </div>
        {/* Sample questions */}
        <div className="flex flex-wrap gap-2 mb-3" aria-label="Sample questions">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full px-3 py-1 transition border border-blue-200"
              onClick={() => setInput(q)}
              disabled={isSending}
              aria-label={`Sample question: ${q}`}
            >
              {q}
            </button>
          ))}
        </div>
        {/* Chat bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-md ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
              role="status"
              aria-label={msg.role === "user" ? "User message" : "Assistant message"}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-md bg-gray-100 text-gray-500 animate-pulse" aria-live="polite" aria-label="Assistant is typing">
              Assistant is typing…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t bg-white" aria-label="Send a message">
        {/* File upload button */}
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-2 text-gray-600 flex items-center" aria-label="Attach a file">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isSending}
            aria-label="File input"
          />
          📎
        </label>
        {file && (
          <span className="text-xs text-gray-700 bg-gray-200 rounded px-2 py-1 mr-2 truncate max-w-[120px]" aria-label={`Selected file: ${file.name}`}>{file.name}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isSending}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-60"
          disabled={isSending || (!input.trim() && !file)}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  )
}
