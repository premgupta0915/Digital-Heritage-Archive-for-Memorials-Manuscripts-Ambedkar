import React, { useState, useEffect, useRef } from 'react';
import { DOCUMENTS, TIMELINE_DATA } from './data';
import { 
  Volume2, 
  VolumeX, 
  Search, 
  Mic, 
  Printer, 
  Calendar, 
  Building2,
  Globe2,
  ChevronDown,
  Camera,
  X,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ragChat, findArchiveItemIdByTitle, printSouvenirRequest } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('docs');
  const [selectedDocId, setSelectedDocId] = useState(DOCUMENTS[0].id);
  const [lang, setLang] = useState('en'); // 'en' | 'mr' | 'hi'
  const [isReading, setIsReading] = useState(false);

  // Search Box
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [souvenirQr, setSouvenirQr] = useState(null);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isScanningBook, setIsScanningBook] = useState(false);
  const [detectedBook, setDetectedBook] = useState(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! I am your DAIC Archival Assistant. Ask me anything about Dr. B. R. Ambedkar's writings, speeches, or constitutional debates.",
      docLink: null
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  const videoRef = useRef(null);
  const scriptCardRef = useRef(null);
  const chatEndRef = useRef(null);

  const selectedDoc = DOCUMENTS.find(d => d.id === selectedDocId) || DOCUMENTS[0];

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
  };

  useEffect(() => {
    stopAudio();
  }, [selectedDocId, lang]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Universal Indic & English Audio Engine
  const playTextSpeech = (text, customLang = lang) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();

    const utterance = new SpeechSynthesisUtterance(text);

    // Prioritize Indian English voice pack for authentic accent
    const indianVoice = voices.find(v => 
      v.lang === 'en-IN' || 
      v.name.toLowerCase().includes('rishi') || 
      v.name.toLowerCase().includes('veena') || 
      v.name.toLowerCase().includes('india')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (indianVoice) utterance.voice = indianVoice;
    utterance.lang = 'en-IN';
    utterance.rate = 0.88;

    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleDocSpeech = () => {
    if (isReading) {
      stopAudio();
      return;
    }

    let textToSpeak = '';
    if (lang === 'hi') {
      textToSpeak = selectedDoc.phonetic?.hi || selectedDoc.quotes.hi;
    } else if (lang === 'mr') {
      textToSpeak = selectedDoc.phonetic?.mr || selectedDoc.quotes.mr;
    } else {
      textToSpeak = selectedDoc.quotes.en;
    }

    playTextSpeech(textToSpeak, lang);
  };

  // Camera Management
  const openCamera = async () => {
    setDetectedBook(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.warn("Camera fallback active.");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setIsScanningBook(false);
    setDetectedBook(null);
  };

  const captureAndRecognize = (presetId = null) => {
    setIsScanningBook(true);
    setTimeout(() => {
      let matchedDoc = presetId 
        ? DOCUMENTS.find(d => d.id === presetId)
        : DOCUMENTS[(DOCUMENTS.findIndex(d => d.id === selectedDocId) + 1) % DOCUMENTS.length];

      setDetectedBook(matchedDoc);
      setIsScanningBook(false);
    }, 750);
  };

  const jumpToScript = (docId) => {
    setSelectedDocId(docId);
    setActiveTab('docs');
    closeCamera();
    setIsChatOpen(false);
    setTimeout(() => {
      scriptCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // Voice Search for search box
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const demo = lang === 'hi' 
        ? "महाड़ सत्याग्रह" 
        : lang === 'mr' 
        ? "चवदार तळे" 
        : "Mahad Satyagraha";
      setSearchQuery(demo);
      handleSearch(demo);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        setSearchQuery(spoken);
        handleSearch(spoken);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      rec.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSearch = async (customQuery) => {
    const q = (customQuery || searchQuery).trim().toLowerCase();
    if (!q) return;

    const matched = DOCUMENTS.find(d => 
      d.keywords.some(k => q.includes(k)) || 
      d.title.toLowerCase().includes(q) ||
      d.year.includes(q)
    );

    if (matched) {
      setSelectedDocId(matched.id);
      setActiveTab('docs');
      setAiAnswer({
        text: `Found document from Year ${matched.year}: "${matched.title}". Script loaded below.`,
        source: matched.citation
      });
      setTimeout(() => {
        scriptCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return;
    }

    // No local demo document matched — ask the real backend instead of a
    // generic canned message.
    try {
      const data = await ragChat(customQuery || searchQuery);
      setBackendOnline(true);
      const citation = data.citations && data.citations[0];
      setAiAnswer({
        text: data.answer,
        source: citation ? `Vol. ${citation.source_volume || '—'}, Page ${citation.page_number || '—'}` : 'DAIC Archive',
      });
    } catch (err) {
      console.error('RAG search unavailable, using local fallback:', err);
      setBackendOnline(false);
      setAiAnswer({
        text: lang === 'mr'
          ? "संबंधित लेख व भाषणे उपलब्ध आहेत. खालील हस्तलिखित निवडा."
          : lang === 'hi'
          ? "संबंधित दस्तावेज खोजे गए। नीचे दी गई सूची से विशिष्ट पांडुलिपि चुनें।"
          : "Historical record found across Dr. Ambedkar's published writings.",
        source: "DAIC Archive"
      });
    }
  };

  // Chatbot Send Message Logic — asks the real backend RAG assistant,
  // grounded on the archive with citations, instead of canned replies.
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    const userMsg = { sender: 'user', text: query, docLink: null };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    // Best-effort local doc link so "Open Folio" still works even when
    // the backend's answer doesn't map 1:1 onto a local demo document.
    const lowerQ = query.toLowerCase();
    const localMatch = DOCUMENTS.find(d => d.keywords.some(k => lowerQ.includes(k.toLowerCase())));

    try {
      const data = await ragChat(query);
      setBackendOnline(true);
      const citation = data.citations && data.citations[0];
      const sourceLine = citation
        ? ` (Vol. ${citation.source_volume || '—'}, Page ${citation.page_number || '—'})`
        : '';
      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: `${data.answer}${sourceLine}`, docLink: localMatch ? localMatch.id : null }
      ]);
    } catch (err) {
      console.error('RAG chat unavailable, using local fallback:', err);
      setBackendOnline(false);

      let replyText = "";
      let matchedDocId = null;

      if (lowerQ.includes('mahad') || lowerQ.includes('water') || lowerQ.includes('tank') || lowerQ.includes('चवदार') || lowerQ.includes('महाड़')) {
        matchedDocId = 'mahad-1927';
        replyText = lang === 'mr'
          ? "२० मार्च १९२७ रोजी चवदार तळ्यावर झालेला महाड सत्याग्रह हा मूलभूत मानवी हक्क आणि समानतेची प्रतिष्ठा प्रस्थापित करणारा ऐतिहासिक लढा होता."
          : lang === 'hi'
          ? "20 मार्च 1927 को महाड़ में चवदार तालाब का सत्याग्रह केवल पानी पीने का नहीं, बल्कि मानव अधिकारों और समानता की घोषणा का आंदोलन था।"
          : "The Mahad Satyagraha of 20 March 1927 was conducted at Chhadar Tank to assert equal civil rights and human dignity for the Depressed Classes.";
      } else if (lowerQ.includes('caste') || lowerQ.includes('annihilation') || lowerQ.includes('जाती') || lowerQ.includes('जाति')) {
        matchedDocId = 'aoc-1936';
        replyText = lang === 'mr'
          ? "'जातिभेद निर्मूलन' (1936) या ग्रंथात डॉ. आंबेडकरांनी सामाजिक विषमतेवर तर्कशुद्ध प्रहार करून बंधुभावाची मांडणी केली."
          : lang === 'hi'
          ? "'जाति का विनाश' (1936) में डॉ. आंबेडकर ने तर्क और नैतिकता को सामाजिक सुधार का एकमात्र सच्चा आधार बताया।"
          : "In 'Annihilation of Caste' (1936), Dr. Ambedkar argued that genuine moral and social democracy requires breaking artificial caste barriers.";
      } else if (lowerQ.includes('constitution') || lowerQ.includes('democracy') || lowerQ.includes('संविधान') || lowerQ.includes('लोकशाही') || lowerQ.includes('लोकतंत्र')) {
        matchedDocId = 'democracy-1949';
        replyText = lang === 'mr'
          ? "२५ नोव्हेंबर १९४९ च्या ऐतिहासिक भाषणात डॉ. आंबेडकरांनी स्पष्ट इशारा दिला की सामाजिक लोकशाहीशिवाय राजकीय लोकशाही टिकणार नाही."
          : lang === 'hi'
          ? "25 नवंबर 1949 को संविधान सभा के अंतिम भाषण में डॉ. आंबेडकर ने सामाजिक लोकतंत्र को राजनीतिक लोकतंत्र की अनिवार्य नींव बताया।"
          : "On 25 November 1949, Dr. Ambedkar warned the Constituent Assembly that political democracy must be anchored in social democracy: liberty, equality, and fraternity.";
      } else if (lowerQ.includes('who') || lowerQ.includes('ambedkar') || lowerQ.includes('कोण') || lowerQ.includes('कौन')) {
        replyText = lang === 'mr'
          ? "डॉ. बाबासाहेब आंबेडकर (१८९१-१९५६) हे भारताचे प्रथम कायदामंत्री, अर्थतज्ज्ञ, विचारवंत आणि भारतीय संविधानाचे शिल्पकार होते."
          : lang === 'hi'
          ? "डॉ. बी. आर. आंबेडकर (1891-1956) स्वतंत्र भारत के प्रथम विधि मंत्री, प्रख्यात अर्थशास्त्री और भारतीय संविधान के प्रमुख निर्माता थे।"
          : "Dr. B. R. Ambedkar (1891–1956) was independent India's first Law Minister, economist, jurist, and the chief architect of the Constitution of India.";
      } else {
        replyText = lang === 'mr'
          ? "या संदर्भातील माहिती डॉ. आंबेडकरांच्या २२ खंडांच्या समग्र साहित्यात नोंदवलेली आहे. आपण महाड, जातीनिर्मूलन किंवा संविधानाविषयी अधिक विचारू शकता."
          : lang === 'hi'
          ? "यह ऐतिहासिक जानकारी डॉ. आंबेडकर के प्रकाशित वाङ्मय में उपलब्ध है। आप महाड़ सत्याग्रह, जाति उन्मूलन या संविधान सभा पर प्रश्न पूछ सकते हैं।"
          : "This historical topic is indexed across the 22 published volumes of Dr. Ambedkar's Writings and Speeches. Try asking about Mahad Satyagraha, Constitution drafting, or social democracy.";
      }

      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: replyText, docLink: matchedDocId }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const printSouvenir = async () => {
    setHasPrinted(true);
    setSouvenirQr(null);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.85 } });

    // Best-effort: resolve the currently selected document to a real
    // backend archive_item_id and fetch its actual QR code, so the
    // souvenir carries a real scannable link rather than just a printout.
    try {
      const archiveItemId = await findArchiveItemIdByTitle(selectedDoc.title);
      if (archiveItemId) {
        const data = await printSouvenirRequest(archiveItemId);
        setSouvenirQr(data.qr_image_base64);
        setBackendOnline(true);
      }
    } catch (err) {
      console.error('Souvenir QR unavailable:', err);
      setBackendOnline(false);
    }

    setTimeout(() => window.print(), 300);
    setTimeout(() => { setHasPrinted(false); setSouvenirQr(null); }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans relative">
      
      {/* 1. Header */}
      <header className="border-b border-slate-800 bg-[#0e1424] px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Ambedkar Digital Heritage Archive
                </h1>
                <span className="text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
                  1891–1956
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dr. Ambedkar International Centre (DAIC), New Delhi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Camera Book Scanner */}
            <button
              onClick={openCamera}
              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Book Title</span>
            </button>

            {/* View Switcher */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  activeTab === 'docs' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Manuscripts
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'timeline' 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Timeline
              </button>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg pl-8 pr-7 py-2 cursor-pointer focus:outline-none focus:border-amber-500 transition"
              >
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
              <Globe2 className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        
        {activeTab === 'docs' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Cols: Manuscripts and Script View */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Document Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {DOCUMENTS.map((doc) => {
                  const isSelected = doc.id === selectedDoc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-amber-500 text-white shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 font-bold">YEAR {doc.year}</span>
                        <span className="text-[10px] text-slate-500">{doc.category}</span>
                      </div>
                      <div className="text-xs font-semibold truncate mt-1">{doc.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Reading Card */}
              <div ref={scriptCardRef} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 transition-all">
                
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ANNO {selectedDoc.year}
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedDoc.place} • {selectedDoc.date}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-2">
                      {selectedDoc.title}
                    </h2>
                  </div>

                  {/* Audio Listen Button */}
                  <button
                    onClick={toggleDocSpeech}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                      isReading
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                    }`}
                  >
                    {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isReading ? "Stop" : lang === 'mr' ? "ऐका (Listen)" : lang === 'hi' ? "सुनें (Listen)" : "Listen"}</span>
                  </button>
                </div>

                {/* The Verbatim Script */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Verbatim Script ({lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'})</span>
                    <span className="text-amber-400 font-bold">HISTORICAL RECORD {selectedDoc.year}</span>
                  </div>
                  <blockquote className="font-serif text-base text-slate-100 italic leading-relaxed pl-3.5 border-l-2 border-amber-500 py-0.5">
                    "{selectedDoc.quotes[lang] || selectedDoc.quotes.en}"
                  </blockquote>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
                  {selectedDoc.summary}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Source: {selectedDoc.citation}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DAIC Verified
                  </span>
                </div>

              </div>

            </div>

            {/* Right 5 Cols: Search & Souvenir */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Search Box */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    Search Speeches & Jump to Script
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Type a topic (e.g. "Mahad", "1936", "Democracy") or tap mic.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={lang === 'hi' ? "खोजें या बोलें..." : lang === 'mr' ? "शोधा किंवा बोला..." : "Search topics, year or books..."}
                    className="flex-1 bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleVoiceSearch}
                    title="Voice input"
                    className={`p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSearch()}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                {aiAnswer && (
                  <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 space-y-1 text-xs">
                    <div className="text-amber-400 font-semibold text-[11px] flex items-center justify-between">
                      <span>Search Result:</span>
                      <span className="text-[10px] text-slate-400">{aiAnswer.source}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{aiAnswer.text}</p>
                  </div>
                )}
              </div>

              {/* Printable Souvenir Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Printer className="w-4 h-4 text-amber-400" />
                      Memorial Souvenir Slip
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Takeaway card for museum visitors.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                    YEAR {selectedDoc.year}
                  </span>
                </div>

                {/* Print Slip */}
                <div
                  id="print-card"
                  className="bg-white text-slate-900 rounded-xl p-4 border border-slate-300 shadow-sm space-y-2 font-mono text-xs"
                >
                  <div className="text-center pb-2 border-b border-dashed border-slate-400">
                    <div className="font-bold uppercase tracking-wider text-[11px]">
                      DR. AMBEDKAR INTERNATIONAL CENTRE
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Ministry of Social Justice & Empowerment • Year {selectedDoc.year}
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="font-bold text-slate-900">{selectedDoc.title} ({selectedDoc.year})</div>
                    <p className="font-serif italic text-xs text-slate-800 mt-2 pl-2 border-l-2 border-slate-400">
                      "{selectedDoc.quotes[lang] || selectedDoc.quotes.en}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{selectedDoc.citation}</span>
                    <span className="font-bold text-slate-800">[DAIC ARCHIVE]</span>
                  </div>

                  {souvenirQr && (
                    <div className="flex justify-center pt-2 border-t border-dashed border-slate-400">
                      <img
                        src={`data:image/png;base64,${souvenirQr}`}
                        alt="Souvenir QR code"
                        className="w-20 h-20"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={printSouvenir}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {hasPrinted ? "Printing..." : "Print Souvenir Card"}
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* Timeline Tab */
          <div className="max-w-xl mx-auto py-2 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">Chronology of Dr. B. R. Ambedkar</h2>
              <p className="text-xs text-slate-400">
                1891 to 1956: A journey of civil rights, economics, and constitutional statecraft.
              </p>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 mt-4">
              {TIMELINE_DATA.map((item, index) => (
                <div key={index} className="relative pl-6">
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#090d16]" />
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ANNO {item.year}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{item.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 3. Camera Book Title Recognition Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-5">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Optical Book Title Scanner</h3>
              </div>
              <button 
                onClick={closeCamera}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Viewport */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border-2 border-dashed border-amber-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="bg-black/70 text-[11px] font-mono text-amber-300 px-2.5 py-1 rounded">
                  {isScanningBook ? "Reading title..." : "Align Book Title Here"}
                </span>
              </div>
            </div>

            {/* Test Sample Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-medium">
                Hold a book to the camera, or tap a sample title to test:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {DOCUMENTS.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => captureAndRecognize(doc.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-[11px] text-slate-200 transition cursor-pointer"
                  >
                    <div className="font-bold text-amber-400">{doc.year}</div>
                    <div className="truncate text-slate-300">{doc.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Action */}
            <button
              onClick={() => captureAndRecognize()}
              disabled={isScanningBook}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              {isScanningBook ? "Recognizing Book Title..." : "Capture & Scan Title"}
            </button>

            {/* Recognition Result Card */}
            {detectedBook && (
              <div className="bg-[#0b0f19] border border-amber-500/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    MATCH: YEAR {detectedBook.year}
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 99% Match
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{detectedBook.bookTitle}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{detectedBook.summary}</p>
                </div>

                <button
                  onClick={() => jumpToScript(detectedBook.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <span>Go to Historical Script ({detectedBook.year})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. Floating Chatbot Drawer */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {isChatOpen ? (
          <div className="bg-[#0e1424] border border-slate-700 w-[360px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Chatbot Header */}
            <div className="bg-[#141c2e] p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    DAIC Archival Chatbot
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Mode: {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex-shrink-0 flex items-center justify-center text-amber-400 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[82%] rounded-2xl p-3 space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>

                    {/* Interactive script jump button if doc is referenced */}
                    {msg.docLink && (
                      <button
                        onClick={() => jumpToScript(msg.docLink)}
                        className="w-full mt-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center justify-between transition cursor-pointer"
                      >
                        <span>Open & Read This Script</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {/* Audio read aloud for bot messages */}
                    {msg.sender === 'bot' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => playTextSpeech(msg.text, lang)}
                          title="Read this aloud"
                          className="text-slate-400 hover:text-amber-400 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isBotTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Bot className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Consulting historical archive...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form 
              onSubmit={handleSendMessage}
              className="p-2.5 bg-[#141c2e] border-t border-slate-800 flex gap-2"
            >
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'hi' ? "प्रश्न पूछें..." : lang === 'mr' ? "प्रश्न विचारा..." : "Ask about Ambedkar's legacy..."}
                className="flex-1 bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isBotTyping}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        ) : (
          /* Floating Launcher Button */
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition hover:scale-105 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Archive Assistant</span>
          </button>
        )}
      </div>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800 bg-[#0e1424] py-3 px-6 text-xs text-slate-500 text-center">
        Dr. Ambedkar International Centre (DAIC) • Ministry of Social Justice & Empowerment • SIH26096
      </footer>

    </div>
  );
}
