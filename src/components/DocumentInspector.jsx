import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, Info, Check } from 'lucide-react';

export default function DocumentInspector({ doc, activeLang }) {
  const [activeCoords, setActiveCoords] = useState(null);
  const [enhancementFilter, setEnhancementFilter] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Native Speech Synthesis
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
    utter.rate = 0.9;
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
    <div className="bg-[#161d27] archival-border rounded-xl p-5 flex flex-col gap-4">
      {/* Document Metabar */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#232d3d]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#c99347]">
            <span>ACCESSION: {doc.accessionNo}</span>
            <span>•</span>
            <span className="text-[#7e8f05] text-[#8b9bb4]">{doc.collection}</span>
          </div>
          <h2 className="text-lg font-semibold text-white mt-1">{doc.title}</h2>
          <p className="text-xs text-[#8292a8]">
            {doc.date} • {doc.location} • {doc.format}
          </p>
        </div>

        {/* Real Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeech}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              isSpeaking
                ? 'bg-rose-950/40 border-rose-700 text-rose-300'
                : 'bg-[#1b2330] border-[#2d394d] text-[#c9d4e5] hover:bg-[#222d3e]'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isSpeaking ? 'Mute' : 'Audio Readout'}
          </button>

          <button
            onClick={() => setEnhancementFilter(!enhancementFilter)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1b2330] border border-[#2d394d] text-[#c9d4e5] hover:bg-[#222d3e] flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-[#c99347]" />
            {enhancementFilter ? 'Filter: Binarized' : 'Filter: Natural Scan'}
          </button>
        </div>
      </div>

      {/* Dual Pane Canvas: Archival Plate & Verbatim OCR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Scan Plate */}
        <div className="lg:col-span-6 relative rounded-lg overflow-hidden bg-[#0a0e14] border border-[#232c3d] min-h-[340px] flex items-center justify-center">
          <img
            src={doc.sourceFile}
            alt={doc.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              enhancementFilter ? 'contrast-125 grayscale brightness-105' : 'sepia-[0.25]'
            }`}
          />

          {/* Clean Non-Gimmicky Bounding Highlight */}
          {activeCoords && (
            <div
              className="absolute border-2 border-[#d4a359] bg-[#d4a359]/20 transition-all duration-150 pointer-events-none"
              style={{
                left: `${activeCoords.x}%`,
                top: `${activeCoords.y}%`,
                width: `${activeCoords.w}%`,
                height: `${activeCoords.h}%`
              }}
            >
              <span className="absolute -top-4 left-0 bg-[#d4a359] text-[#0f141c] font-mono text-[9px] font-bold px-1 rounded-t">
                X:{activeCoords.x}% Y:{activeCoords.y}%
              </span>
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-[#0d121ab3] backdrop-blur-sm px-2 py-1 rounded text-[10px] text-[#93a2b7] font-mono border border-[#252f40]">
            Plate Resolution: 600 DPI (Master Archive)
          </div>
        </div>

        {/* Right: Extracted Text & Inscription Tokens */}
        <div className="lg:col-span-6 bg-[#111722] rounded-lg border border-[#232d3e] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2838] text-[11px] font-mono text-[#78889e]">
              <span>TRANSCRIPTION PANE</span>
              <span className="text-[#c99347]">CONFIDENCE: 98.8%</span>
            </div>

            <div className="mt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#68768a] block mb-1">
                Verified Text ({activeLang.toUpperCase()}):
              </span>
              <blockquote className="font-serif italic text-[#d8e2ee] text-sm md:text-base leading-relaxed pl-3 border-l-2 border-[#c99347] my-2">
                "{currentTranscription}"
              </blockquote>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-[#8695a8] block mb-1.5 font-medium">
                Token Coordinate Inspector (hover to highlight plate):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {doc.regions.map((region, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveCoords(region.coords)}
                    onMouseLeave={() => setActiveCoords(null)}
                    className="px-2.5 py-1 text-xs rounded bg-[#18212e] hover:bg-[#c99347] hover:text-black text-[#cbd5e1] border border-[#2a364a] transition"
                  >
                    {region.term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1f2838] flex items-center justify-between text-xs text-[#718197] font-mono">
            <span>{doc.volume} • PAGE {doc.page}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Preserved by DAIC Digital Vault
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
