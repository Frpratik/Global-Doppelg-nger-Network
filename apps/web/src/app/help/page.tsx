"use client";

import { useState } from "react";
import { ApiClient } from "@/lib/api";
import { HelpCircle, Send, Sparkles, Bot, User, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function HelpAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **Doppel AI**, your guide to our visual twin network. I can answer questions about our 512-D ArcFace embedding pipeline, how cosine similarity ranking works, or how our zero-scraping privacy guarantee protects your facial data. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "How is visual similarity calculated?",
    "What happens when I delete my biometric profile?",
    "How does Doppel protect against web scraping?",
    "What facial landmarks are evaluated?"
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
    } catch (err: any) {
      const errMsg: Message = {
        role: "assistant",
        content: "I am having trouble communicating with the AI service. Please make sure the backend is reachable."
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Doppel AI Assistant • Technical Knowledge & RAG</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Ask Doppel AI</h1>
        <p className="text-xs text-slate-400 mt-1">
          Instant answers on biometric privacy, vector manifolds, and matching science.
        </p>
      </div>

      {/* Chat Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/20 flex flex-col h-[550px] shadow-2xl">
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
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[#00F0FF] flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-medium rounded-tr-none shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[#00F0FF] flex-shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 font-mono">
                Consulting Doppel Knowledge Manifold...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
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
            placeholder="Ask about facial embeddings, privacy, or cosine distance..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl font-bold bg-[#00F0FF] text-black shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
