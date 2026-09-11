import React, { useState } from 'react';
import { Search, Mic, BookOpen, Printer, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResearchAndSouvenir({ activeDoc }) {
  // AI Query Panel State
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [researchResult, setResearchResult] = useState({
    summary: "Dr. B. R. Ambedkar formulated democracy not merely as a government structure, but as a mode of associated living and conjoint communicated experience founded upon Liberty, Equality, and Fraternity.",
    source: "Constituent Assembly Debates, Official Report Vol. IX, 25 Nov 1949",
    referenceId: "CAD/1949/OFF-REP-V9-P297"
  });

  // Souvenir Station State
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensedAlert, setDispensedAlert] = useState(false);

  const handleSearch = (customText) => {
    const q = customText || query;
    if (!q.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      setResearchResult({
        summary: activeDoc.id === 'DAIC-MS-1927-04'
          ? "At Mahad (1927), Dr. Ambedkar clarified that the struggle was not over water as a resource, but an assertion of constitutional civic equality and human dignity."
          : "Dr. Ambedkar maintained that political democracy is fragile without social democracy—a social structure acknowledging liberty, equality, and fraternity.",
        source: `Writings and Speeches, ${activeDoc.volume}, Page ${activeDoc.page}`,
        referenceId: activeDoc.accessionNo
      });
      setIsProcessing(false);
    }, 700);
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    setQuery("Transcribing audio query...");
    setTimeout(() => {
      setIsRecording(false);
      const text = "What civic proclamation was declared at the 1927 Mahad Satyagraha?";
      setQuery(text);
      handleSearch(text);
    }, 1800);
  };

  const handlePrintSouvenir = () => {
    setIsDispensing(true);
    setDispensedAlert(false);

    setTimeout(() => {
      setIsDispensing(false);
      setDispensedAlert(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#c99347', '#334155', '#10b981']
      });
      setTimeout(() => setDispensedAlert(false), 4500);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Archival Corpus Cross-Examiner */}
      <div className="bg-[#161d27] archival-border rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#232d3d]">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#c99347]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Archival Query & Cross-Reference
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8b9bb4] bg-[#1a2230] px-2 py-0.5 rounded border border-[#273347]">
            RAG CORPUS: VOL 1–22
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="flex gap-2 mt-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Query speeches, CAD debates, or legal writings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full archival-input rounded-lg px-3.5 py-2 text-xs placeholder:text-[#67778d]"
            />
          </div>

          <button
            onClick={handleVoiceInput}
            title="Voice Query"
            className={`p-2 rounded-lg border text-xs transition flex items-center justify-center ${
              isRecording 
                ? 'bg-rose-950/50 border-rose-600 text-rose-300' 
                : 'bg-[#1b2330] border-[#2b384d] text-[#8e9eb5] hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSearch()}
            disabled={isProcessing || !query.trim()}
            className="px-4 py-2 bg-[#c99347] hover:bg-[#b88339] disabled:opacity-50 text-[#0d121a] font-bold text-xs rounded-lg transition"
          >
            {isProcessing ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Citational Result Container */}
        <div className="bg-[#101620] border border-[#20293a] rounded-lg p-3.5 space-y-2 mt-1">
          <div className="flex items-center justify-between text-[11px] text-[#8e9eb5] font-mono">
            <span className="text-[#c99347] font-semibold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> PRIMARY SOURCE CITATION
            </span>
            <span>REF: {researchResult.referenceId}</span>
          </div>

          <p className="text-xs text-[#cfdae8] leading-relaxed">
            {researchResult.summary}
          </p>

          <div className="pt-2 border-t border-[#1d2636] text-[11px] font-mono text-[#8292a8]">
            Source: <span className="text-white">{researchResult.source}</span>
          </div>
        </div>
      </div>

      {/* 2. Physical Souvenir Dispenser Station */}
      <div className="bg-[#161d27] archival-border rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#232d3d]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#c99347]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Visitor Commemorative Print Slip
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8b9bb4]">58MM THERMAL RECEIPT</span>
        </div>

        <p className="text-xs text-[#7e8f05] text-[#8394ab]">
          Generates a printed archival index card for museum visitors and researchers.
        </p>

        {/* Real Tactile Receipt Card */}
        <div className="receipt-paper rounded-md p-4 font-mono text-xs text-[#1a1a1a] border border-[#d6cfbe] space-y-2 mt-1">
          <div className="text-center pb-2 border-b border-dashed border-[#8c8577]">
            <div className="font-bold tracking-wider text-[11px] uppercase">
              DR. AMBEDKAR INTERNATIONAL CENTRE
            </div>
            <div className="text-[10px] text-[#555]">Archival Research & Memorial Kiosk</div>
          </div>

          <div className="space-y-1 py-1 text-[11px]">
            <div className="text-[10px] text-[#666] uppercase">Selected Document:</div>
            <div className="font-bold text-[#111]">{activeDoc.title}</div>
            <div className="text-[10px] text-[#444]">{activeDoc.date} • {activeDoc.location}</div>
          </div>

          <blockquote className="font-serif italic text-[11px] text-[#222] bg-[#f5f0e6] p-2 rounded border-l-2 border-[#8c744f]">
            "{activeDoc.transcription.slice(0, 115)}..."
          </blockquote>

          <div className="pt-2 border-t border-dashed border-[#8c8577] flex items-center justify-between text-[10px] text-[#555]">
            <div>
              <div className="font-semibold text-[#222]">{activeDoc.accessionNo}</div>
              <div>{activeDoc.volume}, Page {activeDoc.page}</div>
            </div>
            <div className="border border-[#777] p-1 font-bold text-[8px] bg-white">
              VERIFIED
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-1 space-y-2">
          <button
            onClick={handlePrintSouvenir}
            disabled={isDispensing}
            className="w-full py-2.5 rounded-lg bg-[#222e3e] hover:bg-[#2a384d] border border-[#37475e] disabled:opacity-50 text-white font-medium text-xs transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#c99347]" />
            {isDispensing ? 'Printing to Thermal Slot...' : 'Print Memorial Card (प्रिंट करा)'}
          </button>

          {dispensedAlert && (
            <div className="text-center text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/60 py-2 rounded-lg flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Printed successfully. Collect from kiosk tray.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
