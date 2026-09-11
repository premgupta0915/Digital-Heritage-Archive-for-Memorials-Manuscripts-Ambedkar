import React, { useState, useEffect, useCallback } from "react";
import { Search, BookOpen, Landmark, Mic, Shield, RefreshCw, Clock, ChevronRight, MessageCircle, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const CATEGORY_ICONS = {
  speeches: Mic,
  manuscripts: BookOpen,
  memorials: Landmark,
};

function CategoryIcon({ category, className = "w-4 h-4" }) {
  const Icon = CATEGORY_ICONS[category] || BookOpen;
  return <Icon className={className} />;
}

function useArchives() {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [error, setError] = useState(null);

  const fetchArchives = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/archives?category=${category}`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setArchives(data);
      setBackendOnline(true);
    } catch (err) {
      console.error("Backend unreachable, using fallback data:", err);
      setBackendOnline(false);
      setError(err.message);
      setArchives(FALLBACK_ARCHIVES);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query, category) => {
    if (!query.trim()) return fetchArchives(category);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setArchives(data.results);
      setBackendOnline(true);
    } catch (err) {
      console.error("Search failed:", err);
      setBackendOnline(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchArchives]);

  return { archives, loading, backendOnline, error, fetchArchives, search };
}

const FALLBACK_ARCHIVES = [
  { id: "fallback-1", title: "Annihilation of Caste", category: "speeches", author: "Dr. B.R. Ambedkar", description: "The seminal 1936 speech and essay targeting the Hindu caste system.", date: "1936" },
  { id: "fallback-2", title: "Drafting the Indian Constitution", category: "manuscripts", author: "Dr. B.R. Ambedkar", description: "Original handwritten notes and drafts showcasing fundamental rights.", date: "1948" },
  { id: "fallback-3", title: "Chaityabhoomi Memorial", category: "memorials", author: "National Heritage Site", description: "The final resting place of Babasaheb Ambedkar in Mumbai.", date: "Permanent" },
];

function RagChatPanel({ open, onClose }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/rag/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.answer, citations: data.citations }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `Sorry, the archive assistant is unavailable right now (${err.message}).` }]);
    } finally {
      setAsking(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-bold text-lg">Ask the Archive</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm">
              Ask a question grounded in Dr. Ambedkar's writings and speeches — answers cite volume and page.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-indigo-300" : "text-slate-200"}>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{m.role === "user" ? "You" : "Archive Assistant"}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
            </div>
          ))}
          {asking && <p className="text-slate-500 text-sm animate-pulse">Thinking...</p>}
        </div>
        <form onSubmit={ask} className="flex gap-2 px-5 py-4 border-t border-slate-800">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What did Ambedkar say about the caste system?"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" disabled={asking} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold">
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const { archives, loading, backendOnline, fetchArchives, search } = useArchives();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchArchives(activeCategory);
  }, [activeCategory, fetchArchives]);

  const handleSearch = (e) => {
    e.preventDefault();
    search(searchQuery, activeCategory);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                <Shield className="w-4 h-4 text-indigo-400" />
                Smart India Hackathon 2026 • Project ID: SIH26096
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Digital Heritage Archive
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Memorials, Manuscripts & the vision of Dr. B.R. Ambedkar — searchable, grounded, cited.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendOnline ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${backendOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
                </span>
                <span className="text-sm font-medium">{backendOnline ? "Backend Connected" : "Offline Mode"}</span>
              </div>
              <span className="text-xs text-slate-500">API: {API_BASE}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg py-5 -my-5 border-b border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearch} className="w-full md:w-2/5 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search the archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-12 pr-6 py-3 text-base placeholder:text-slate-600 focus:outline-none"
              />
            </form>
            <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
              {["all", "speeches", "manuscripts", "memorials"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700"
                  }`}
                >
                  <CategoryIcon category={cat} className="w-4 h-4" />
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                <MessageCircle className="w-4 h-4" />
                Ask
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4 text-indigo-500">
            <RefreshCw className="w-10 h-10 animate-spin" />
            <p className="text-slate-500">Loading archive records...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/30">
            <Search className="w-14 h-14 text-slate-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-300">No archive records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archives.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-900/50 transition">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/50">
                    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide font-bold px-3 py-1 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-900">
                      <CategoryIcon category={item.category} className="w-3.5 h-3.5" />
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-50 mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="text-slate-500">By {item.author}</span>
                  <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold">
                    View <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Digital Heritage Archive • SIH26096</p>
        </footer>
      </div>

      <RagChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}
