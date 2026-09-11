import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DocumentInspector from './components/DocumentInspector';
import ResearchAndSouvenir from './components/ResearchAndSouvenir';
import ChronologyView from './components/ChronologyView';
import { ARCHIVE_DATA } from './data';
import { ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('archive');
  const [activeLang, setActiveLang] = useState('en');
  const [selectedDocId, setSelectedDocId] = useState(ARCHIVE_DATA[0].id);

  const selectedDoc = ARCHIVE_DATA.find((d) => d.id === selectedDocId) || ARCHIVE_DATA[0];

  return (
    <div className="min-h-screen bg-[#0f141c] text-[#e6edf3] flex flex-col font-sans">
      
      {/* 1. Official Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeLang={activeLang}
        onLangChange={setActiveLang}
      />

      {/* 2. Main Content Body */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-5 md:p-6">
        {activeTab === 'archive' ? (
          <div className="flex flex-col gap-5">
            
            {/* Catalog Selector Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ARCHIVE_DATA.map((doc) => {
                const isCurrent = doc.id === selectedDoc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-lg border text-left transition ${
                      isCurrent
                        ? 'bg-[#1a2332] border-[#c99347]'
                        : 'bg-[#141b25] border-[#222d3f] hover:bg-[#18212e]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8797ad]">
                      <span>{doc.accessionNo}</span>
                      <span className="text-[#c99347] font-semibold">{doc.date.split(' ').pop()}</span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-1 line-clamp-1">
                      {doc.title}
                    </div>
                    <div className="mt-2 text-[11px] text-[#718299] flex items-center justify-between">
                      <span>{doc.collection}</span>
                      <span className="text-[#c99347] flex items-center">
                        Select <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Dual Stage */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              <div className="xl:col-span-8">
                <DocumentInspector doc={selectedDoc} activeLang={activeLang} />
              </div>
              <div className="xl:col-span-4">
                <ResearchAndSouvenir activeDoc={selectedDoc} />
              </div>
            </div>

          </div>
        ) : (
          <ChronologyView />
        )}
      </div>

      {/* 3. Official Institutional Footer */}
      <footer className="border-t border-[#1f2838] bg-[#0c1117] py-3.5 px-6 text-xs text-[#6e7f96]">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <div>
            Dr. Ambedkar International Centre (DAIC) • Smart India Hackathon 2026 Deployment
          </div>
          <div className="flex items-center gap-4">
            <span>Encoding: UTF-8</span>
            <span>•</span>
            <span>Index Status: Synchronized</span>
            <span>•</span>
            <span>Station ID: KIOSK-DEL-01</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
