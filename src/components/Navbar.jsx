import React from 'react';
import { Landmark, Globe, FileText, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, activeLang, onLangChange }) {
  return (
    <header className="bg-[#121822] border-b border-[#232c3d] px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* National / Ministry Emblems */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-[#1c2433] border border-[#2b374d] flex items-center justify-center text-[#d4a359]">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide text-white uppercase">
                Digital Heritage Archive & Research Kiosk
              </span>
              <span className="text-[11px] font-mono text-[#8b9bb4] bg-[#1a2230] px-2 py-0.5 rounded border border-[#28354a]">
                MoSJE / DAIC
              </span>
            </div>
            <p className="text-[11px] text-[#7d8ca1]">
              Dr. Ambedkar International Centre • 15 Janpath, New Delhi
            </p>
          </div>
        </div>

        {/* Tab & Language Switchers */}
        <div className="flex items-center gap-3 text-xs">
          {/* View Toggles */}
          <div className="flex bg-[#0d121a] p-1 rounded-lg border border-[#232d3e]">
            <button
              onClick={() => onTabChange('archive')}
              className={`px-3 py-1.5 rounded font-medium transition flex items-center gap-1.5 ${
                activeTab === 'archive'
                  ? 'bg-[#232f42] text-white shadow-sm'
                  : 'text-[#8595ad] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Manuscript Inspector
            </button>
            <button
              onClick={() => onTabChange('chronology')}
              className={`px-3 py-1.5 rounded font-medium transition flex items-center gap-1.5 ${
                activeTab === 'chronology'
                  ? 'bg-[#232f42] text-white shadow-sm'
                  : 'text-[#8595ad] hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Chronological Index
            </button>
          </div>

          {/* Regional Localization */}
          <div className="flex items-center gap-1 bg-[#0d121a] p-1 rounded-lg border border-[#232d3e]">
            <Globe className="w-3.5 h-3.5 text-[#8595ad] ml-1.5 mr-0.5" />
            {['en', 'mr', 'hi'].map((lang) => (
              <button
                key={lang}
                onClick={() => onLangChange(lang)}
                className={`px-2 py-1 rounded uppercase font-mono text-[11px] transition ${
                  activeLang === lang
                    ? 'bg-[#c99347] text-[#0d121a] font-bold'
                    : 'text-[#8595ad] hover:text-white'
                }`}
              >
                {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'EN'}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#242f40] text-[11px] text-[#78889e] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            STATION-01 • ONLINE
          </div>
        </div>

      </div>
    </header>
  );
}
