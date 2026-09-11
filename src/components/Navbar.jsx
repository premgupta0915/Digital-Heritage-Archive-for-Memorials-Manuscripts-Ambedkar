import React from 'react';
import { Landmark, Compass, BookMarked, Radio, Globe } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, activeLang, onLangChange }) {
  return (
    <header className="bg-[#10151f] border-b-2 border-[#2b2217] px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* National Archive Emblem */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded border-2 border-[#cba358]/60 bg-[#161209] flex items-center justify-center text-[#cba358] shadow-inner">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-cinzel font-bold text-base md:text-lg tracking-wider text-[#ede5d0] uppercase">
                Ambedkar Digital Heritage Archive & Memorial Kiosk
              </h1>
              <span className="text-[10px] font-vintage-mono px-2 py-0.5 rounded border border-[#cba358]/30 bg-[#251e13] text-[#d6b26d]">
                MoSJE // DAIC-26096
              </span>
            </div>
            <p className="text-[11px] text-[#938776] tracking-wide font-newsreader italic">
              Dr. Ambedkar International Centre • Ministry of Social Justice & Empowerment
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-4 text-xs font-newsreader">
          
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
              Manuscripts
            </button>
            <button
              onClick={() => onTabChange('audiovisual')}
              className={`px-3.5 py-1.5 rounded transition font-cinzel text-[11px] tracking-wider uppercase flex items-center gap-1.5 ${
                activeTab === 'audiovisual'
                  ? 'bg-[#292015] text-[#d6b26d] border border-[#cba358]/40 shadow'
                  : 'text-[#877c6d] hover:text-[#e4decb]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#cba358]" />
              Audio-Visual Vault
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
              Chronology
            </button>
          </div>

          {/* Regional Dialects */}
          <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded border border-[#2a2217]">
            <span className="text-[11px] text-[#7d7162] font-vintage-mono px-1">LANG:</span>
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

        </div>

      </div>
    </header>
  );
}
