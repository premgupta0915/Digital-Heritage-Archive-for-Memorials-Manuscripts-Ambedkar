'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Landmark, Mic, Shield, RefreshCw, Clock, ChevronRight } from 'lucide-react';

interface ArchiveItem {
  id: string;
  title: string;
  category: string;
  author: string;
  description: string;
  date: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'speeches': return <Mic className="w-4 h-4" />;
    case 'manuscripts': return <BookOpen className="w-4 h-4" />;
    case 'memorials': return <Landmark className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

export default function Home() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<boolean>(false);

  // Fetch data from FastAPI backend
  const fetchArchives = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/archives?category=${category}`);
      const data = await res.json();
      setArchives(data);
      setBackendStatus(true);
    } catch (error) {
      console.error('Backend offline, using fallback data:', error);
      setBackendStatus(false);
      // Fallback data if backend is down
      setArchives([
        { id: "fallback-1", title: "Annihilation of Caste", category: "speeches", author: "Dr. B.R. Ambedkar", description: "The seminal 1936 speech and essay targeting the Hindu caste system.", date: "1936" },
        { id: "fallback-2", title: "Drafting the Indian Constitution", category: "manuscripts", author: "Dr. B.R. Ambedkar", description: "Original handwritten notes and drafts showcasing fundamental rights.", date: "1948" },
        { id: "fallback-3", title: "Chaityabhoomi Memorial", category: "memorials", author: "National Heritage Site", description: "The final resting place of Babasaheb Ambedkar in Mumbai, mapped in 3D.", date: "Permanent" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives(activeCategory);
  }, [activeCategory]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchArchives(activeCategory);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, category: activeCategory }),
      });
      const data = await res.json();
      setArchives(data.results);
      setBackendStatus(true);
    } catch (error) {
      console.error('Search error:', error);
      setBackendStatus(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <header className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-15 bg-cover bg-center" 
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                <Shield className="w-4 h-4 text-indigo-400" /> 
                Smart India Hackathon 2026 • Project ID: SIH26096
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-400">
                Digital Heritage Archive
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                A full-stack repository preserving the Memorials, Manuscripts, and vision of Dr. B.R. Ambedkar.
              </p>
            </div>
            
            <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-700 backdrop-blur-sm">
               <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendStatus ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${backendStatus ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-200">
                      {backendStatus ? 'FastAPI Connected' : 'Running Offline Mode'}
                    </span>
               </div>
               <span className="text-xs text-slate-500">Port 8000 & 3000 Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Search and Filters */}
        <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg py-6 -my-6 border-b border-slate-800">
            <div className="flex flex-col md:flex-row gap-5 justify-between items-center">
              <form onSubmit={handleSearch} className="w-full md:w-2/5 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition" />
                <input
                  type="text"
                  placeholder="Search archives via backend API..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 group-focus-within:border-indigo-500 rounded-xl pl-12 pr-6 py-3 text-base text-slate-100 placeholder:text-slate-600 focus:outline-none transition shadow-inner"
                />
              </form>

              <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-3 md:pb-0">
                {['all', 'speeches', 'manuscripts', 'memorials'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    {cat}
                  </button>
                ))}
              </div>
            </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4 text-indigo-500">
            <RefreshCw className="w-12 h-12 animate-spin stroke-[1.5]" />
            <p className="text-slate-500 animate-pulse">Fetching records from FastAPI...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/30">
            <Search className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <p className="text-xl font-semibold text-slate-300 mb-2">No archive records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {archives.map((item) => (
              <div
                key={item.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-7 flex flex-col justify-between hover:border-indigo-900/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/30 overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800/50">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold px-3.5 py-1.5 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-900">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-50 group-hover:text-indigo-300 transition line-clamp-2 tracking-tight mb-4">
                    {item.title}
                  </h3>
                  
                  <div className="w-full h-36 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-800 border border-slate-800 mb-4 flex items-center justify-center text-indigo-400/30 font-bold text-lg tracking-widest uppercase">
                    API Record #{item.id}
                  </div>

                  <p className="text-slate-400 leading-relaxed text-[15px] line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">By {item.author}</span>
                  <button className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold group-hover:gap-2 transition-all">
                    View Document <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 pt-10 border-t border-slate-800 text-center text-slate-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Digital Heritage Archive • Full-Stack SIH26096 Implementation</p>
        </footer>

      </div>
    </main>
  );
}