import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DocumentInspector from './components/DocumentInspector';
import ResearchAndSouvenir from './components/ResearchAndSouvenir';
import AudioVisualVault from './components/AudioVisualVault';
import ChronologyView from './components/ChronologyView';
import { ARCHIVE_DATA } from './data';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('archive'); // 'archive' | 'audiovisual' | 'chronology'
  const [activeLang, setActiveLang] = useState('en');
  const [selectedDocId, setSelectedDocId] = useState(ARCHIVE_DATA[0].id);

  const selectedDoc = ARCHIVE_DATA.find((d) => d.id === selectedDocId) || ARCHIVE_DATA[0];

  return (
    <div className="min-h-screen bg-[#0d1017] text-[#e4decb] flex flex-col font-sans">
      
      {/* 1. Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeLang={activeLang}
        onLangChange={setActiveLang}
      />

      {/* 2. Main Stage */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-5 md:p-6">
        {activeTab === 'archive' && (
          <div className="flex flex-col gap-6">
            
            {/* Catalog Folios */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-vintage-mono text-xs font-bold text-[#cba358] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> Archival Catalog Register
                </span>
                <span className="font-vintage-mono text-[11px] text-[#7d705e]">
                  COLLECTION: 22 PUBLISHED TOMES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {ARCHIVE_DATA.map((doc) => {
                  const isCurrent = doc.id === selectedDoc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 rounded-lg text-left transition border ${
                        isCurrent
                          ? 'bg-[#1c160e] border-[#cba358] shadow-lg shadow-[#000000]/60'
                          : 'bg-[#12161f] border-[#292218] hover:bg-[#161c27] hover:border-[#3d3121]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-vintage-mono text-[#8a7b68]">
                        <span className="text-[#cba358] font-bold">{doc.accessionNo}</span>
                        <span>{doc.date.split(' ').pop()}</span>
                      </div>
                      <div className="font-cinzel text-sm font-bold text-[#ede5d2] mt-2 line-clamp-1">
                        {doc.title}
                      </div>
                      <div className="mt-3 text-[11px] text-[#786c5a] flex items-center justify-between font-newsreader italic text-[13px] border-t border-[#261f15] pt-2">
                        <span>{doc.collection}</span>
                        <span className="text-[#cba358] font-vintage-mono text-[10px] uppercase font-bold flex items-center not-italic">
                          Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Stage */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8">
                <DocumentInspector doc={selectedDoc} activeLang={activeLang} />
              </div>
              <div className="xl:col-span-4">
                <ResearchAndSouvenir activeDoc={selectedDoc} />
              </div>
            </div>

          </div>
        )}

        {activeTab === 'audiovisual' && (
          <AudioVisualVault />
        )}

        {activeTab === 'chronology' && (
          <ChronologyView />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-[#261f15] bg-[#090c12] py-3.5 px-6 text-xs text-[#706453]">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4 font-vintage-mono text-[10px]">
          <div>
            DAIC HISTORICAL DOCUMENTATION WING • NATIONAL HERITAGE PROTOCOL SIH26096
          </div>
          <div className="flex items-center gap-3">
            <span>PRINT REGISTER: VERIFIED</span>
            <span>•</span>
            <span>RESTORATION LEVEL: ARCHIVAL 1A</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
