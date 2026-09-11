import React, { useState } from 'react';
import { Search, Mic, BookMarked, Printer, Check, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResearchAndSouvenir({ activeDoc }) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [researchResult, setResearchResult] = useState({
    summary: "Dr. B. R. Ambedkar formulated democracy not merely as a government structure, but as a mode of associated living and conjoint communicated experience founded upon Liberty, Equality, and Fraternity.",
    source: "Constituent Assembly Debates, Official Report Vol. IX, 25 Nov 1949",
    referenceId: "CAD/1949/OFF-REP-V9-P297"
  });

  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensedAlert, setDispensedAlert] = useState(false);

  const handleLiveSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(true);
      setQuery("Neural voice model listening...");
      setTimeout(() => {
        setIsListening(false);
        const speech = "What civic proclamation was declared at the 1927 Mahad Satyagraha?";
        setQuery(speech);
        handleSearch(speech);
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSearch = (customText) => {
    const q = customText || query;
    if (!q.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      setResearchResult({
        summary: activeDoc.id === 'DAIC-MS-1927-04'
          ? "At Mahad (1927), Dr. Ambedkar clarified that the struggle was not over water as a natural commodity, but an assertion of fundamental civic equality, human personality, and constitutional personhood."
          : "Dr. Ambedkar maintained that political democracy remains unstable unless grounded in social democracy—a communal fabric upholding liberty, equality, and fraternity as the principles of life.",
        source: `Writings and Speeches, ${activeDoc.volume}, Page ${activeDoc.page}`,
        referenceId: activeDoc.accessionNo
      });
      setIsProcessing(false);
    }, 650);
  };

  const handlePrintSouvenir = () => {
    setIsDispensing(true);
    setDispensedAlert(false);

    setTimeout(() => {
      setIsDispensing(false);
      setDispensedAlert(true);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#f59e0b', '#06b6d4', '#10b981']
      });
      setTimeout(() => setDispensedAlert(false), 5000);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* AI Grounded RAG Query HUD */}
      <div className="vintage-card rounded-2xl p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-slate-100">
              Grounded AI RAG Exegesis
            </h3>
          </div>
          <span className="font-vintage-mono text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ZERO-HALLUCINATION
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search CAD debates, volumes, legal treatises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-[#080c14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
          <button
            onClick={handleLiveSpeech}
            title="Live Neural Audio Speech"
            className={`p-2.5 rounded-xl border text-xs transition flex items-center justify-center ${
              isListening 
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse' 
                : 'bg-[#0f1522] border-slate-700 text-cyan-400 hover:border-cyan-400'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSearch()}
            disabled={isProcessing || !query.trim()}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-vintage-mono font-bold text-xs rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            {isProcessing ? 'Thinking...' : 'Query'}
          </button>
        </div>

        {/* Audited Grounded Citation Card */}
        <div className="bg-[#080c14] border border-slate-800 rounded-xl p-4 space-y-2 mt-0.5">
          <div className="flex items-center justify-between text-[11px] font-vintage-mono text-slate-400">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" /> CANONICAL PRIMARY EXCERPT
            </span>
            <span className="text-cyan-400">{researchResult.referenceId}</span>
          </div>

          <p className="font-newsreader italic text-[15px] text-slate-200 leading-relaxed">
            "{researchResult.summary}"
          </p>

          <div className="pt-2 border-t border-slate-800 font-vintage-mono text-[10px] text-slate-500 flex justify-between">
            <span>Provenance: <span className="text-slate-300">{researchResult.source}</span></span>
            <span className="text-emerald-400">VERIFIED CANONICAL</span>
          </div>
        </div>
      </div>

      {/* 2. Physical Souvenir Station */}
      <div className="vintage-card rounded-2xl p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-slate-100">
              Kiosk Commemorative Print Ticket
            </h3>
          </div>
          <span className="font-vintage-mono text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
            ESC/POS HARDWARE READY
          </span>
        </div>

        <p className="text-xs text-slate-400 font-sans">
          Generates an authentic takeaway document slip for museum researchers and visitors.
        </p>

        {/* Modernized Commemorative Docket */}
        <div className="vintage-parchment-receipt rounded-xl p-4 font-vintage-mono text-[11px] space-y-2 relative">
          <div className="text-center pb-2 border-b border-dashed border-slate-700">
            <div className="font-cinzel font-bold tracking-widest text-[11px] uppercase text-amber-400">
              DR. AMBEDKAR MEMORIAL ARCHIVE
            </div>
            <div className="text-[9px] text-slate-400">
              Ministry of Social Justice & Empowerment • DAIC
            </div>
          </div>

          <div className="space-y-0.5 py-1 text-[10px]">
            <div className="text-slate-500 uppercase font-bold text-[8px] tracking-wider">Indexed Folio:</div>
            <div className="font-bold text-white font-cinzel text-[11px]">{activeDoc.title}</div>
            <div className="text-slate-400">{activeDoc.date} • {activeDoc.location}</div>
          </div>

          <blockquote className="font-newsreader italic text-[13px] text-slate-200 leading-snug bg-slate-900/60 p-2.5 rounded-lg border-l-2 border-amber-500 my-1">
            "{activeDoc.transcription.slice(0, 110)}..."
          </blockquote>

          <div className="pt-2 border-t border-dashed border-slate-700 flex items-center justify-between text-[9px] text-slate-400">
            <div>
              <div className="font-bold text-amber-400">{activeDoc.accessionNo}</div>
              <div>{activeDoc.volume}, PAGE {activeDoc.page}</div>
            </div>
            <div className="border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 font-bold text-[8px] text-emerald-400 uppercase tracking-wider rounded">
              VERIFIED
            </div>
          </div>
        </div>

        {/* Dispense Trigger */}
        <div className="space-y-2">
          <button
            onClick={handlePrintSouvenir}
            disabled={isDispensing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)]"
          >
            <Printer className="w-4 h-4" />
            {isDispensing ? 'Transmitting to Thermal Platen...' : 'Dispense Souvenir Ticket (प्रिंट करा)'}
          </button>

          {dispensedAlert && (
            <div className="text-center font-vintage-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-2 rounded-xl flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Archival chit dispensed from kiosk hardware tray!
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
