import React from 'react';
import { Landmark, Compass, BookMarked, Globe, Shield } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, activeLang, onLangChange }) {
  return (
    <header className="bg-[#10151f] border-b-2 border-[#2b2217] px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* National Archive Emblem & Curatorial Header */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded border-2 border-[#cba358]/60 bg-[#161209] flex items-center justify-center text-[#cba358] shadow-inner">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-cinzel font-bold text-base md:text-lg tracking-wider text-[#ede5d0] uppercase">
                Ambedkar Historical Archives & Research Portal
              </h1>
              <span className="text-[10px] font-vintage-mono px-2 py-0.5 rounded border border-[#cba358]/30 bg-[#251e13] text-[#d6b26d]">
                DOC-SERIES 1927–1956
              </span>
            </div>
            <p className="text-[11px] text-[#938776] tracking-wide font-newsreader italic">
              Dr. Ambedkar International Centre (DAIC) • Ministry of Social Justice & Empowerment, New Delhi
            </p>
          </div>
        </div>

        {/* Vintage Styled Navigation & Script Switchers */}
        <div className="flex items-center gap-4 text-xs font-newsreader">
          
          {/* Folio View Switchers */}
          <div className="flex bg-[#0a0d14] p-1 rounded border border-[#2a2217]">
            <button
              onClick={() => onTabChange('archive')}
              className={`px-3.5 py-1.5 rounded transition font-cinzel text-[11px] tracking-wider uppercase flex items-center gap-1.5 ${
                activeTab === 'archive'
                  ? 'bg-[#292015] text-[#d6b26d] border border-[#cba358]/40 shadow'
                  : 'text-[#877c6d] hover:text-[#e4decb]'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              Folio & Codex Inspector
            </button>
            <button
              onClick={() => onTabChange('chronology')}
              className={`px-3.5 py-1.5 rounded transition font-cinzel text-[11px] tracking-wider uppercase flex items-center gap-1.5 ${
                activeTab === 'chronology'
                  ? 'bg-[#292015] text-[#d6b26d] border border-[#cba358]/40 shadow'
                  : 'text-[#877c6d] hover:text-[#e4decb]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Historical Annals
            </button>
          </div>

          {/* Vernacular Language Registry */}
          <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded border border-[#2a2217]">
            <span className="text-[11px] text-[#7d7162] font-vintage-mono px-1">SCRIPT:</span>
            {[
              { id: 'en', label: 'ENG' },
              { id: 'mr', label: 'मराठी' },
              { id: 'hi', label: 'हिन्दी' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => onLangChange(lang.id)}
                className={`px-2 py-0.5 rounded font-vintage-mono text-[11px] transition ${
                  activeLang === lang.id
                    ? 'bg-[#cba358] text-[#141009] font-bold shadow'
                    : 'text-[#8e8170] hover:text-[#e4decb]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Curatorial Depository Status */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#2e251b] font-vintage-mono text-[10px] text-[#827666]">
            <span className="w-2 h-2 rounded-full bg-[#cba358] opacity-75" />
            RECORD ROOM NO. 4
          </div>

        </div>

      </div>
    </header>
  );
}
