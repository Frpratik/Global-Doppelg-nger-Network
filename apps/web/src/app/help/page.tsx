"use client";

import { useState } from "react";
import { ApiClient } from "@/lib/api";
import { Send, Bot, User, RefreshCw, HelpCircle, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function HelpAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **Doppel AI**, your technical assistant. I can answer questions regarding our 512-D ArcFace embedding pipeline, cosine similarity calculations, biometric deletion guarantees, or our zero-scraping privacy policy. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "How is visual similarity mathematically calculated?",
    "What happens when I purge my biometric profile?",
    "How does Doppel protect against unconsented facial scraping?",
    "What face quality checks are enforced on selfie uploads?"
  ];

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await ApiClient.chatAI(messageText);
      const aiMsg: Message = { role: "assistant", content: res.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        role: "assistant",
        content: "Unable to reach the Doppel AI service at this moment. Please verify backend availability."
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Technical Support & Knowledge Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Ask Doppel AI
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Instant answers on biometric privacy, vector manifolds, and matching science.
        </p>
      </div>

      {/* Chat Container */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 border border-surface-border flex flex-col h-[520px] shadow-panel">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-cyan flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-brand-cyan text-black font-medium rounded-tr-none shadow-sm"
                    : "bg-surface-elevated border border-surface-border text-content-primary rounded-tl-none"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-content-secondary flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-cyan flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-muted font-mono">
                Querying Doppel technical knowledge base...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="pt-3 border-t border-surface-border flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-border border border-surface-border text-content-secondary hover:text-content-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about facial embeddings, privacy guarantees, or cosine distance..."
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:border-brand-cyan focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-lg font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover disabled:opacity-50 transition-colors flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
