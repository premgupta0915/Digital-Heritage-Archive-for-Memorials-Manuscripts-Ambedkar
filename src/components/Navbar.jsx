import React from 'react';
import { Landmark, Compass, BookMarked, Radio, Sparkles, Cpu, Activity } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, activeLang, onLangChange }) {
  return (
    <header className="bg-[#090d15]/90 backdrop-blur-md border-b border-amber-500/20 px-6 py-3 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Emblem & AI Engine Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-cinzel font-bold text-sm md:text-base tracking-wider text-slate-100 uppercase flex items-center gap-2">
                Ambedkar Digital Heritage Archive
                <span className="flex items-center gap-1 font-vintage-mono text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> AI PLATFORM v2.6
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-sans">
              MoSJE • Dr. Ambedkar International Centre (DAIC) • Neural Knowledge Base
            </p>
          </div>
        </div>

        {/* HUD Switchers & AI Status Pill */}
        <div className="flex items-center gap-3 text-xs">
          
          {/* Active AI Telemetry Tag */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0d1422] border border-slate-800 text-[10px] font-vintage-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LLM: QDRANT HYBRID RAG</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">TrOCR ViT-B</span>
          </div>

          {/* View Switchers */}
          <div className="flex bg-[#0b1019] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onTabChange('archive')}
              className={`px-3 py-1.5 rounded transition font-sans text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === 'archive'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              Manuscripts
            </button>
            <button
              onClick={() => onTabChange('audiovisual')}
              className={`px-3 py-1.5 rounded transition font-sans text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === 'audiovisual'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Audio-Visual Vault
            </button>
            <button
              onClick={() => onTabChange('chronology')}
              className={`px-3 py-1.5 rounded transition font-sans text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === 'chronology'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Chronology
            </button>
          </div>

          {/* Multilingual Bhashini Toggle */}
          <div className="flex items-center gap-1 bg-[#0b1019] p-1 rounded-lg border border-slate-800 font-vintage-mono text-[11px]">
            {['en', 'mr', 'hi'].map((lang) => (
              <button
                key={lang}
                onClick={() => onLangChange(lang)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition ${
                  activeLang === lang
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'EN'}
              </button>
            ))}
          </div>

        </div>

      </div>
    </header>
  );
}
