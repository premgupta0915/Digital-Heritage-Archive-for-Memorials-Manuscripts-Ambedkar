import React, { useState } from 'react';
import { Volume2, VolumeX, Layers, Scan, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DocumentInspector({ doc, activeLang }) {
  const [activeCoords, setActiveCoords] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isSplitMode, setIsSplitMode] = useState(false);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const textToRead = activeLang === 'mr' 
      ? doc.translationMarathi 
      : activeLang === 'hi' 
      ? doc.translationHindi 
      : doc.transcription;

    const utter = new SpeechSynthesisUtterance(textToRead);
    utter.rate = 0.88;
    if (activeLang === 'mr') utter.lang = 'mr-IN';
    else if (activeLang === 'hi') utter.lang = 'hi-IN';
    else utter.lang = 'en-IN';

    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const currentTranscription = activeLang === 'mr' 
    ? doc.translationMarathi 
    : activeLang === 'hi' 
    ? doc.translationHindi 
    : doc.transcription;

  return (
    <div className="vintage-card rounded-2xl p-6 flex flex-col gap-5">
      
      {/* Editorial Metabar with Neural Metadata */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-vintage-mono text-xs text-amber-400">
            <span className="font-bold">CALL NO: {doc.accessionNo}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> TrOCR VISION INGESTION
            </span>
          </div>
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-white tracking-wide mt-1">
            {doc.title}
          </h2>
          <p className="text-xs text-slate-400 font-newsreader italic text-[14px]">
            {doc.date} — {doc.location} ({doc.format})
          </p>
        </div>

        {/* High-Tech Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-vintage-mono border flex items-center gap-1.5 transition ${
              isSplitMode
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-[#111724] border-slate-700 text-slate-300 hover:border-amber-500/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            {isSplitMode ? 'Exit Comparison' : 'AI Inpaint Compare'}
          </button>

          <button
            onClick={toggleSpeech}
            className={`px-3 py-1.5 rounded-lg text-xs font-vintage-mono border flex items-center gap-1.5 transition ${
              isSpeaking
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-[#111724] border-slate-700 text-slate-300 hover:border-amber-500/40'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            {isSpeaking ? 'Cease' : 'Neural TTS'}
          </button>
        </div>
      </div>

      {/* Optical Canvas with Animated Laser Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Photostat Plate + Laser Sweep */}
        <div className="lg:col-span-6 relative rounded-xl border border-amber-500/30 overflow-hidden bg-black min-h-[370px] flex items-center justify-center select-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
          {isSplitMode ? (
            <div className="relative w-full h-full min-h-[370px]">
              <img
                src={doc.sourceFile}
                alt="Raw scan"
                className="absolute inset-0 w-full h-full object-cover sepia-[0.7] brightness-75 contrast-125"
              />
              <span className="absolute bottom-3 left-3 font-vintage-mono text-[9px] text-amber-400 bg-black/80 px-2 py-0.5 rounded border border-amber-500/30 z-10">
                RAW PLATE
              </span>

              <div 
                className="absolute inset-0 overflow-hidden border-r-2 border-cyan-400 shadow-[0_0_15px_#06b6d4]"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={doc.restoredFile}
                  alt="Restored scan"
                  className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110"
                  style={{ width: '100%', minWidth: '380px' }}
                />
                <span className="absolute bottom-3 left-3 font-vintage-mono text-[9px] text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30 z-10 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI RESTORED
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="95"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={doc.sourceFile}
                alt={doc.title}
                className="w-full h-full object-cover sepia-[0.4] brightness-90 contrast-125"
              />

              {/* Optical Laser Sweeper */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-laser pointer-events-none z-10" />

              <div className="absolute top-3 right-3 archival-stamp px-2.5 py-0.5 text-[9px] font-vintage-mono flex items-center gap-1 select-none pointer-events-none">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> TR-OCR VERIFIED
              </div>

              {/* Bounding Target Coordinate Box */}
              {activeCoords && (
                <div
                  className="absolute border-2 border-cyan-400 bg-cyan-400/25 transition-all duration-150 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.6)] z-20"
                  style={{
                    left: `${activeCoords.x}%`,
                    top: `${activeCoords.y}%`,
                    width: `${activeCoords.w}%`,
                    height: `${activeCoords.h}%`
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-cyan-400 text-slate-950 font-vintage-mono text-[9px] font-bold px-1.5 py-0.5 rounded-t">
                    TOKEN_LOC [{activeCoords.x},{activeCoords.y}]
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 font-vintage-mono text-[9px] text-slate-400 bg-black/80 px-2 py-0.5 rounded border border-slate-800 z-10">
            600 DPI • MULTI-HEAD ATTENTION
          </div>
        </div>

        {/* Verbatim Inscription & AI Keyphrase Extraction */}
        <div className="lg:col-span-6 bg-[#080c14] rounded-xl border border-slate-800 p-5 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-[11px] font-vintage-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Scan className="w-3.5 h-3.5" /> TRANSFORMER INFERENCE
              </span>
              <span className="text-emerald-400 font-bold">99.2% CONFIDENCE</span>
            </div>

            <div className="mt-4">
              <span className="font-vintage-mono text-[10px] uppercase text-slate-500 tracking-widest block mb-2">
                Verbatim Inscription ({activeLang.toUpperCase()}):
              </span>
              <blockquote className="font-newsreader italic text-[17px] text-slate-200 leading-relaxed pl-4 border-l-2 border-amber-500 my-3">
                "{currentTranscription}"
              </blockquote>
            </div>

            {/* Keyword Entity Tokens */}
            <div className="mt-5">
              <span className="font-vintage-mono text-[10px] uppercase text-slate-400 block mb-2">
                Named Entity Coordinates (Hover to pinpoint on optical plate):
              </span>
              <div className="flex flex-wrap gap-2">
                {doc.regions.map((region, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveCoords(region.coords)}
                    onMouseLeave={() => setActiveCoords(null)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-[#101726] hover:bg-cyan-400 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-cyan-300 transition font-vintage-mono"
                  >
                    ⚡ {region.term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between font-vintage-mono text-[11px] text-slate-500">
            <span>{doc.volume} • FOLIO {doc.page}</span>
            <span className="text-amber-400 font-bold">SHA-256 PROVENANCE AUDIT</span>
          </div>
        </div>

      </div>

    </div>
  );
}
