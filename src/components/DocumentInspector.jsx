import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, Sliders, Layers, Check } from 'lucide-react';

export default function DocumentInspector({ doc, activeLang }) {
  const [activeCoords, setActiveCoords] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // Split slider 0 - 100%
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
    utter.rate = 0.86;
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
    <div className="vintage-card rounded-xl p-6 flex flex-col gap-5">
      
      {/* Editorial Manuscript Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#2d2417] relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-vintage-mono text-xs text-[#cba358]">
            <span className="font-bold">CALL NO: {doc.accessionNo}</span>
            <span className="text-[#594d3c]">•</span>
            <span className="text-[#a49887] uppercase tracking-wide">{doc.collection}</span>
          </div>
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-[#f7f1e1] tracking-wide mt-1">
            {doc.title}
          </h2>
          <p className="text-xs text-[#958876] font-newsreader italic text-[14px]">
            {doc.date} — Documented at {doc.location} ({doc.format})
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={`px-3 py-1.5 rounded text-xs font-newsreader text-[13px] border flex items-center gap-1.5 transition ${
              isSplitMode
                ? 'bg-[#292015] border-[#cba358] text-[#cba358]'
                : 'bg-[#1b150d] border-[#3d301f] text-[#d6b77c] hover:bg-[#261e13]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {isSplitMode ? 'Exit Comparison' : 'Compare Restored Plate'}
          </button>

          <button
            onClick={toggleSpeech}
            className={`px-3 py-1.5 rounded text-xs font-newsreader text-[13px] border flex items-center gap-1.5 transition ${
              isSpeaking
                ? 'bg-[#3b1c1c] border-[#8f3f3f] text-[#f2baba]'
                : 'bg-[#1b150d] border-[#3d301f] text-[#d6b77c] hover:bg-[#261e13]'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isSpeaking ? 'Cease Reading' : 'Oral Recitation (वाचन)'}
          </button>
        </div>
      </div>

      {/* Dual Folio View: Split Slider / Single View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Photostat Plate with Interactive Split Swipe Slider */}
        <div className="lg:col-span-6 relative rounded border-2 border-[#332719] overflow-hidden bg-[#090b10] min-h-[360px] flex items-center justify-center select-none">
          {isSplitMode ? (
            <div className="relative w-full h-full min-h-[360px]">
              {/* Raw Underlay */}
              <img
                src={doc.sourceFile}
                alt="Raw scan"
                className="absolute inset-0 w-full h-full object-cover sepia-[0.7] brightness-75 contrast-125"
              />
              <span className="absolute bottom-2 left-2 font-vintage-mono text-[9px] text-[#cba358] bg-black/80 px-2 py-0.5 rounded z-10">
                RAW (DAMAGED)
              </span>

              {/* Restored Overlay with Clip Path */}
              <div 
                className="absolute inset-0 overflow-hidden border-r-2 border-[#cba358]"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={doc.restoredFile}
                  alt="Restored scan"
                  className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110"
                  style={{ width: '100%', minWidth: '380px' }}
                />
                <span className="absolute bottom-2 left-2 font-vintage-mono text-[9px] text-emerald-400 bg-black/80 px-2 py-0.5 rounded z-10">
                  AI RESTORED (CLEAN)
                </span>
              </div>

              {/* Slider Range Controller */}
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
                className="w-full h-full object-cover sepia-[0.6] brightness-90 contrast-125 saturate-[0.85]"
              />
              <div className="absolute top-4 right-4 archival-stamp px-2.5 py-0.5 text-[10px] font-vintage-mono select-none pointer-events-none opacity-85">
                VERIFIED • DAIC ARCHIVE
              </div>

              {/* Coordinate Target Box */}
              {activeCoords && (
                <div
                  className="absolute border-2 border-[#cba358] bg-[#cba358]/20 transition-all duration-150 pointer-events-none shadow-[0_0_15px_rgba(203,163,88,0.4)]"
                  style={{
                    left: `${activeCoords.x}%`,
                    top: `${activeCoords.y}%`,
                    width: `${activeCoords.w}%`,
                    height: `${activeCoords.h}%`
                  }}
                >
                  <span className="absolute -bottom-5 left-0 bg-[#cba358] text-[#0d1017] font-vintage-mono text-[9px] font-bold px-1 rounded-sm shadow">
                    LOC: [{activeCoords.x},{activeCoords.y}]
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-2 right-2 font-vintage-mono text-[9px] text-[#ad9e89] bg-[#0c0f16]/90 px-2 py-1 rounded border border-[#2d2417] z-10">
            600 DPI MASTER ARCHIVE
          </div>
        </div>

        {/* Right: Verbatim Inscription & Keyword Coordinates */}
        <div className="lg:col-span-6 bg-[#0f141d] rounded border border-[#2d2417] p-5 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#241c12] text-[11px] font-vintage-mono text-[#8a7c6a]">
              <span>VERBATIM TRANSCRIPTION</span>
              <span className="text-[#cba358]">SERIES FOLIO {doc.page}</span>
            </div>

            <div className="mt-4">
              <span className="font-vintage-mono text-[10px] uppercase text-[#695d4d] tracking-widest block mb-2">
                Inscription Transcript ({activeLang.toUpperCase()}):
              </span>
              <blockquote className="font-newsreader italic text-[17px] text-[#f2ebd9] leading-relaxed pl-4 border-l-2 border-[#cba358] my-3">
                "{currentTranscription}"
              </blockquote>
            </div>

            <div className="mt-5">
              <span className="font-vintage-mono text-[10px] uppercase text-[#8a7a66] block mb-2">
                Concordance Concordat (Hover to locate ink entry on plate):
              </span>
              <div className="flex flex-wrap gap-2">
                {doc.regions.map((region, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveCoords(region.coords)}
                    onMouseLeave={() => setActiveCoords(null)}
                    className="px-2.5 py-1 text-xs rounded bg-[#1c160e] hover:bg-[#cba358] hover:text-[#0d1017] text-[#ded3bd] border border-[#3b2e1c] transition font-newsreader text-[14px]"
                  >
                    § {region.term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#241c12] flex items-center justify-between font-vintage-mono text-[11px] text-[#7d705f]">
            <span>{doc.volume} • FOLIO {doc.page}</span>
            <span className="text-[#cba358] font-bold">CERTIFIED CONCORDANCE</span>
          </div>
        </div>

      </div>

    </div>
  );
}
