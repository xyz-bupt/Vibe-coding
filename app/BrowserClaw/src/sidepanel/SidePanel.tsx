import { useState, useEffect, useRef } from "react";
import { Send, Bug, Cpu, Zap } from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
}

let nextId = 1;

export default function SidePanel() {
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId++,
      role: "system",
      content: "BrowserClaw initialized. Click [Scrape] to extract page headings.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate model loading
  useEffect(() => {
    const timer = setTimeout(() => setModelStatus("ready"), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for scrape results coming back from content script (via background)
  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === "SCRAPE_RESULT") {
        const headings: string[] = msg.data || [];
        if (headings.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId++,
              role: "assistant",
              content: "No <h1> or <h2> headings found on this page.",
            },
          ]);
        } else {
          const formatted = headings.map((h) => `  ${h}`).join("\n");
          setMessages((prev) => [
            ...prev,
            {
              id: nextId++,
              role: "assistant",
              content: `Extracted ${headings.length} heading(s):\n\n${formatted}`,
            },
          ]);
        }
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScrape = async () => {
    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: "user", content: "Scrape page headings" },
    ]);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        setMessages((prev) => [
          ...prev,
          { id: nextId++, role: "assistant", content: "Error: No active tab." },
        ]);
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: "SCRAPE_HEADINGS" });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: "assistant",
          content: "Error: Could not reach content script. Try refreshing the page.",
        },
      ]);
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: "user", content: text },
    ]);
    setMessages((prev) => [
      ...prev,
      {
        id: nextId++,
        role: "assistant",
        content: `[WebLLM placeholder] You said: "${text}"`,
      },
    ]);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusColor =
    modelStatus === "ready"
      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
      : modelStatus === "error"
        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
        : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse";

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 text-sm font-mono select-none">
      {/* ── Header ─────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-cyan-800/40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span className="text-base font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            BrowserClaw
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
          <span className="text-xs text-slate-500 uppercase tracking-widest">
            {modelStatus === "loading"
              ? "Loading…"
              : modelStatus === "ready"
                ? "Ready"
                : "Error"}
          </span>
        </div>
      </header>

      {/* ── Chat area ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[88%] px-3 py-2 rounded-md whitespace-pre-wrap break-words text-sm leading-relaxed ${
              msg.role === "user"
                ? "self-end bg-emerald-900/30 border-l-[3px] border-emerald-400"
                : msg.role === "system"
                  ? "self-start bg-amber-900/20 border-l-[3px] border-amber-500"
                  : "self-start bg-slate-800/60 border-l-[3px] border-cyan-400"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* ── Action row ─────────────────────────────── */}
      <div className="px-4 py-2">
        <button
          onClick={handleScrape}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-900/40 transition-colors cursor-pointer"
        >
          <Bug className="w-4 h-4" />
          Scrape
        </button>
      </div>

      {/* ── Input bar ──────────────────────────────── */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-cyan-800/30">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none bg-slate-800/70 border border-cyan-700/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/60 transition-colors font-mono"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-md text-cyan-400 border border-cyan-600/40 bg-cyan-900/20 hover:bg-cyan-900/40 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          onClick={handleScrape}
          className="p-2 rounded-md text-amber-400 border border-amber-600/40 bg-amber-900/20 hover:bg-amber-900/40 transition-colors cursor-pointer"
          title="Quick Scrape"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
