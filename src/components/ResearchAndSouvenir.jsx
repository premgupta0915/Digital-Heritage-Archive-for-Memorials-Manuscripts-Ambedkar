import React, { useState } from 'react';
import { Search, Mic, BookMarked, Printer, Check, Feather } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResearchAndSouvenir({ activeDoc }) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [researchResult, setResearchResult] = useState({
    summary: "Dr. B. R. Ambedkar formulated democracy not merely as a government structure, but as a mode of associated living and conjoint communicated experience founded upon Liberty, Equality, and Fraternity.",
    source: "Constituent Assembly Debates, Official Report Vol. IX, 25 Nov 1949",
    referenceId: "CAD/1949/OFF-REP-V9-P297"
  });

  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensedAlert, setDispensedAlert] = useState(false);

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
    }, 700);
  };

  const handleVoiceInput = () => {
    setIsRecording(true);
    setQuery("Transcribing oral inquiry...");
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
        spread: 55,
        origin: { y: 0.85 },
        colors: ['#cba358', '#8f2f2f', '#362a1a']
      });
      setTimeout(() => setDispensedAlert(false), 5000);
    }, 1300);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Scholarly Corpus Inquiry Box */}
      <div className="vintage-card rounded-xl p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#2d2417]">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#cba358]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0e8d5]">
              Corpus Exegesis & Cross-Inquiry
            </h3>
          </div>
          <span className="font-vintage-mono text-[9px] text-[#cba358] bg-[#241c12] border border-[#4a3a22] px-2 py-0.5 rounded">
            VOLS. 1–22 INDEXED
          </span>
        </div>

        {/* Vintage Styled Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search speeches, constituent debates, memoranda..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-[#0c1017] border border-[#382d1c] rounded px-3 py-2 text-xs text-[#ede5d2] font-newsreader text-[14px] placeholder:text-[#6a5e4d] focus:outline-none focus:border-[#cba358]"
          />
          <button
            onClick={handleVoiceInput}
            title="Oral Speech Ingestion"
            className={`p-2 rounded border text-xs transition flex items-center justify-center ${
              isRecording 
                ? 'bg-[#3b1919] border-[#8a3333] text-[#e89e9e]' 
                : 'bg-[#1a140d] border-[#382d1c] text-[#cba358] hover:bg-[#261e13]'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSearch()}
            disabled={isProcessing || !query.trim()}
            className="px-3.5 py-2 bg-[#cba358] hover:bg-[#b58e45] disabled:opacity-50 text-[#141009] font-cinzel font-bold text-[11px] uppercase tracking-wider rounded transition"
          >
            {isProcessing ? 'Consulting...' : 'Query'}
          </button>
        </div>

        {/* Canonical Grounded Record Citation */}
        <div className="bg-[#0e121a] border border-[#292015] rounded p-4 space-y-2 mt-0.5">
          <div className="flex items-center justify-between text-[11px] font-vintage-mono text-[#a1917b]">
            <span className="text-[#cba358] font-bold flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" /> CANONICAL PRIMARY EXCERPT
            </span>
            <span>{researchResult.referenceId}</span>
          </div>

          <p className="font-newsreader italic text-[14px] text-[#e6ded0] leading-relaxed">
            "{researchResult.summary}"
          </p>

          <div className="pt-2 border-t border-[#241c12] font-vintage-mono text-[10px] text-[#7d705d]">
            Provenance: <span className="text-[#cfc2a9] font-serif italic text-[12px]">{researchResult.source}</span>
          </div>
        </div>
      </div>

      {/* 2. Physical Souvenir Station: Perforated Vintage Library Docket */}
      <div className="vintage-card rounded-xl p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#2d2417]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#cba358]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0e8d5]">
              Commemorative Accession Docket
            </h3>
          </div>
          <span className="font-vintage-mono text-[9px] text-[#8a7b67]">EST. 1927 FORMAT</span>
        </div>

        <p className="text-xs text-[#8c7f6d] font-newsreader italic text-[13px]">
          Dispenses an authentic archival index slip for researcher portfolios and museum visitors.
        </p>

        {/* Perforated Vintage Paper Ticket */}
        <div className="vintage-parchment-receipt rounded p-4 font-vintage-mono text-[11px] text-[#241e15] border border-[#b8ab8e] space-y-2 relative">
          
          <div className="text-center pb-2 border-b border-dashed border-[#786b54]">
            <div className="font-cinzel font-bold tracking-widest text-[11px] uppercase text-[#141009]">
              DR. AMBEDKAR MEMORIAL ARCHIVE
            </div>
            <div className="text-[9px] text-[#5e5443] font-newsreader italic">
              Government of India • Ministry of Social Justice & Empowerment
            </div>
          </div>

          <div className="space-y-0.5 py-1 text-[10px]">
            <div className="text-[#695e4b] uppercase font-bold text-[8px] tracking-wider">Indexed Folio:</div>
            <div className="font-bold text-[#141009] font-cinzel text-[11px]">{activeDoc.title}</div>
            <div className="text-[#52493a]">{activeDoc.date} • {activeDoc.location}</div>
          </div>

          <blockquote className="font-newsreader italic text-[13px] text-[#1f1911] leading-snug bg-[#ede5cf]/70 p-2 rounded border-l-2 border-[#826938] my-1">
            "{activeDoc.transcription.slice(0, 110)}..."
          </blockquote>

          <div className="pt-2 border-t border-dashed border-[#786b54] flex items-center justify-between text-[9px] text-[#5e5240]">
            <div>
              <div className="font-bold font-vintage-mono text-[#1a140d]">{activeDoc.accessionNo}</div>
              <div>{activeDoc.volume}, PAGE {activeDoc.page}</div>
            </div>
            <div className="border border-[#70624b] px-1.5 py-0.5 font-vintage-mono font-bold text-[8px] text-[#802b2b] uppercase tracking-wider">
              AUTHENTICATED
            </div>
          </div>

        </div>

        {/* Action Trigger */}
        <div className="space-y-2">
          <button
            onClick={handlePrintSouvenir}
            disabled={isDispensing}
            className="w-full py-2.5 rounded bg-[#211a12] hover:bg-[#2b2116] border border-[#423421] text-[#e8dcbf] font-cinzel text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <Printer className="w-3.5 h-3.5 text-[#cba358]" />
            {isDispensing ? 'Transmitting to Platen...' : 'Dispense Historical Chit (प्रिंट करा)'}
          </button>

          {dispensedAlert && (
            <div className="text-center font-vintage-mono text-xs text-[#43965b] bg-[#102116] border border-[#21472c] py-2 rounded flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Archival slip dispensed into platen tray.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
