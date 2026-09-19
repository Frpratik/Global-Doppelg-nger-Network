"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/services/chat.service";
import { ConnectionService } from "@/services/connection.service";
import { 
  ChatConversation, ChatMessage, ConnectionsList, ConnectionItem 
} from "@/types/domain";
import { 
  MessageSquare, Send, CheckCircle2, XCircle, Clock, 
  UserCheck, UserPlus, Sparkles, RefreshCw, AlertCircle, 
  ArrowLeft, Eye, ShieldCheck, MapPin
} from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTwinId = searchParams.get("twin");

  const [activeTab, setActiveTab] = useState<"chats" | "requests">("chats");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [connections, setConnections] = useState<ConnectionsList>({
    pending_incoming: [],
    pending_outgoing: [],
    accepted_twins: []
  });
  const [selectedTwin, setSelectedTwin] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations and connection requests
  const fetchData = async (silent: boolean = false) => {
    if (!silent) setLoadingList(true);
    try {
      const [convs, conns] = await Promise.all([
        ChatService.getConversations(),
        ConnectionService.getConnections()
      ]);
      setConversations(convs);
      setConnections(conns);

      // If initial twin passed via URL query, select them
      if (initialTwinId && !selectedTwin) {
        const matchConv = convs.find((c) => c.twin_id === initialTwinId);
        if (matchConv) {
          setSelectedTwin(matchConv);
        } else {
          // Check in accepted connections
          const matchConn = conns.accepted_twins.find((c) => c.peer.user_id === initialTwinId);
          if (matchConn) {
            setSelectedTwin({
              twin_id: matchConn.peer.user_id,
              display_name: matchConn.peer.display_name,
              username: matchConn.peer.username,
              avatar: matchConn.peer.avatar,
              similarity_score: matchConn.peer.similarity_score,
              unread_count: 0
            });
          }
        }
      }
    } catch (err: any) {
      if (!silent) setErrorNotice(err.message || "Failed to load messages.");
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  // Fetch messages for selected twin
  const fetchMessages = async (twinId: string, silent: boolean = false) => {
    if (!silent) setLoadingChat(true);
    try {
      const history = await ChatService.getMessages(twinId);
      setMessages(history);
      if (!silent) setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      if (!silent) setErrorNotice(err.message || "Failed to retrieve conversation history.");
    } finally {
      if (!silent) setLoadingChat(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // When selected twin changes, fetch messages
  useEffect(() => {
    if (selectedTwin) {
      fetchMessages(selectedTwin.twin_id);
    }
  }, [selectedTwin]);

  // Polling for live chat updates every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
      if (selectedTwin) {
        fetchMessages(selectedTwin.twin_id, true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedTwin]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTwin || !newMessage.trim() || sending) return;

    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const sentMsg = await ChatService.sendMessage(selectedTwin.twin_id, text);
      setMessages((prev) => [...prev, sentMsg]);
      setTimeout(scrollToBottom, 50);
      fetchData(true);
    } catch (err: any) {
      setErrorNotice(err.message || "Could not send message. Please ensure mutual twin request is accepted.");
    } finally {
      setSending(false);
    }
  };

  // Respond to incoming twin request
  const handleRespondRequest = async (connectionId: string, action: "accept" | "decline") => {
    try {
      const res = await ConnectionService.respondToRequest(connectionId, action);
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 3500);
      await fetchData();
      if (action === "accept") {
        setActiveTab("chats");
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to respond to request.");
    }
  };

  const incomingCount = connections.pending_incoming.length;

  return (
    <div className="min-h-[88vh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-elevated border border-surface-border text-brand-cyan text-xs font-mono font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Mutual Consent Direct Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Twin Chat & Connection Inbox
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Peer-to-peer conversations exclusively between mutually accepted Doppel visual twins.
          </p>
        </div>

        <Link
          href="/discover"
          className="px-4 py-2 rounded-lg text-xs font-bold bg-surface-elevated hover:bg-surface-border border border-surface-border text-content-secondary hover:text-content-primary transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          Discover More Twins
        </Link>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[640px]">
        {/* Left Column: Conversations & Request Tabs */}
        <div className="md:col-span-4 surface-card rounded-2xl border border-surface-border flex flex-col overflow-hidden shadow-panel">
          {/* Tab Switcher */}
          <div className="p-3 border-b border-surface-border bg-surface-elevated flex gap-2">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "chats"
                  ? "bg-brand-cyan text-black shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-border"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Active Twins</span>
              {conversations.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === "chats" ? "bg-black/20 text-black" : "bg-surface-border text-content-muted"
                }`}>
                  {conversations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === "requests"
                  ? "bg-brand-cyan text-black shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-border"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Twin Requests</span>
              {incomingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-status-danger text-white text-[10px] font-bold font-mono animate-pulse">
                  {incomingCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Active Conversations List */}
          {activeTab === "chats" && (
            <div className="flex-1 overflow-y-auto divide-y divide-surface-border/60">
              {loadingList ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-brand-cyan animate-spin mx-auto" />
                  <p className="text-xs text-content-muted font-mono">Loading twin network...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <UserCheck className="w-10 h-10 text-content-muted mx-auto opacity-30" />
                  <h4 className="text-xs font-bold text-content-primary">No Connected Twins Yet</h4>
                  <p className="text-[11px] text-content-secondary leading-relaxed">
                    Once you and another participant mutually accept a Twin Request, your direct chat channel will appear here.
                  </p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cyan hover:underline pt-2"
                  >
                    Find your visual twin &rarr;
                  </Link>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = selectedTwin?.twin_id === conv.twin_id;
                  return (
                    <div
                      key={conv.twin_id}
                      onClick={() => setSelectedTwin(conv)}
                      className={`p-4 cursor-pointer transition-colors flex items-center gap-3.5 ${
                        isSelected
                          ? "bg-brand-cyan/10 border-l-4 border-l-brand-cyan"
                          : "hover:bg-surface-elevated/70"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={conv.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + conv.username}
                          alt={conv.display_name}
                          className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border object-cover p-0.5"
                        />
                        {conv.similarity_score && (
                          <span className="absolute -bottom-1 -right-1 px-1 rounded bg-brand-cyan text-black text-[9px] font-mono font-extrabold">
                            {conv.similarity_score.toFixed(0)}%
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-content-primary truncate">
                            {conv.display_name}
                          </h4>
                          {conv.last_message_at && (
                            <span className="text-[10px] text-content-muted font-mono whitespace-nowrap ml-2">
                              {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-content-muted truncate mt-0.5">
                          {conv.last_message || "Mutual twins connected. Say hello!"}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-brand-cyan text-black text-[10px] font-bold font-mono">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Twin Requests (Incoming & Outgoing) */}
          {activeTab === "requests" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Incoming Requests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">
                    Incoming Requests ({connections.pending_incoming.length})
                  </h4>
                </div>

                {connections.pending_incoming.length === 0 ? (
                  <p className="text-xs text-content-muted italic py-2">No pending requests received.</p>
                ) : (
                  connections.pending_incoming.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.peer.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + req.peer.username}
                          alt={req.peer.display_name}
                          className="w-10 h-10 rounded-lg bg-surface-main border border-surface-border object-cover p-0.5"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-content-primary">{req.peer.display_name}</h5>
                          <span className="text-[10px] text-content-muted font-mono">@{req.peer.username}</span>
                        </div>
                      </div>

                      {req.message && (
                        <p className="text-xs text-content-secondary bg-surface-main p-2.5 rounded-lg border border-surface-border/60 leading-snug">
                          "{req.message}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleRespondRequest(req.id, "accept")}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept Twin
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, "decline")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-main hover:bg-surface-border text-content-muted hover:text-status-danger border border-surface-border transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Outgoing Requests */}
              <div className="space-y-3 pt-4 border-t border-surface-border">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">
                  Sent Requests ({connections.pending_outgoing.length})
                </h4>

                {connections.pending_outgoing.length === 0 ? (
                  <p className="text-xs text-content-muted italic py-2">No pending requests sent.</p>
                ) : (
                  connections.pending_outgoing.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.peer.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + req.peer.username}
                          alt={req.peer.display_name}
                          className="w-9 h-9 rounded-lg bg-surface-main border border-surface-border object-cover p-0.5"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-content-primary">{req.peer.display_name}</h5>
                          <span className="text-[10px] text-content-muted font-mono">@{req.peer.username}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-surface-main border border-surface-border text-[10px] font-mono text-status-warning flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat Conversation Stream */}
        <div className="md:col-span-8 surface-card rounded-2xl border border-surface-border flex flex-col overflow-hidden shadow-panel">
          {selectedTwin ? (
            <>
              {/* Twin Chat Header */}
              <div className="p-4 border-b border-surface-border bg-surface-elevated flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedTwin.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + selectedTwin.username}
                    alt={selectedTwin.display_name}
                    className="w-10 h-10 rounded-xl bg-surface-main border border-brand-cyan/60 object-cover p-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-content-primary">
                        {selectedTwin.display_name}
                      </h3>
                      {selectedTwin.similarity_score && (
                        <span className="px-1.5 py-0.2 rounded bg-brand-cyan/20 text-brand-cyan font-mono font-bold text-[10px] border border-brand-cyan/30">
                          {selectedTwin.similarity_score.toFixed(1)}% Match
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-content-muted font-mono">@{selectedTwin.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/matches/${selectedTwin.twin_id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-main hover:bg-surface-border text-content-secondary hover:text-content-primary border border-surface-border transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Match
                  </Link>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingChat ? (
                  <div className="py-20 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin mx-auto" />
                    <p className="text-xs text-content-muted font-mono">Decrypting twin messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-24 text-center space-y-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mx-auto text-brand-cyan mb-2">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-content-primary">Start Your Conversation</h4>
                    <p className="text-xs text-content-secondary">
                      You and {selectedTwin.display_name} are mutually confirmed visual twins. Send a message to compare facial features or hobbies!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.is_mine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          m.is_mine
                            ? "bg-brand-cyan text-black font-medium rounded-tr-none shadow-sm"
                            : "bg-surface-elevated border border-surface-border text-content-primary rounded-tl-none"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-content-muted font-mono mt-1 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {m.is_mine && m.is_read && " • Read"}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-surface-border bg-surface-elevated flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedTwin.display_name}...`}
                  maxLength={2000}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-main border border-surface-border text-xs sm:text-sm text-content-primary focus:border-brand-cyan focus:outline-none placeholder:text-content-muted"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold bg-brand-cyan text-black hover:bg-brand-cyanHover disabled:opacity-50 transition-colors flex items-center gap-1.5 text-xs shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-cyan">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Select a Visual Twin</h3>
              <p className="text-xs text-content-secondary max-w-sm leading-relaxed">
                Choose an accepted twin connection from the sidebar to view your message history and chat in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
