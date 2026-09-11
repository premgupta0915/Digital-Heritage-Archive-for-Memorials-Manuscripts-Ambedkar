import React from 'react';
import { CHRONOLOGY } from '../data';
import { BookmarkCheck } from 'lucide-react';

export default function ChronologyView() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8 text-center space-y-1">
        <span className="font-vintage-mono text-[10px] text-[#cba358] uppercase tracking-widest block">
          Historical Annals & Milestone Chronicle
        </span>
        <h2 className="font-cinzel text-2xl font-bold text-[#f7f0df] tracking-wide">
          Life & Movements of Dr. Bhimrao Ramji Ambedkar
        </h2>
        <p className="text-xs text-[#8c7e6b] font-newsreader italic text-[14px]">
          Official archival registry maintained by the Dr. Ambedkar International Centre
        </p>
      </div>

      <div className="relative border-l-2 border-[#3b2e1d] ml-6 md:ml-12 space-y-8">
        {CHRONOLOGY.map((item, index) => (
          <div key={index} className="relative pl-8 group">
            {/* Antique Seal Node */}
            <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#1b150e] border-2 border-[#cba358] shadow flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cba358]" />
            </span>

            <div className="vintage-card rounded-lg p-5 hover:border-[#cba358]/50 transition">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#292014]">
                <span className="font-cinzel text-sm font-bold text-[#cba358] tracking-wider">
                  ANNO DOMINI {item.year}
                </span>
                <span className="font-vintage-mono text-[10px] text-[#857764]">
                  PROVENANCE: {item.source}
                </span>
              </div>

              <h3 className="font-cinzel text-base font-semibold text-[#ede4d1] mt-2">
                {item.title}
              </h3>

              <p className="font-newsreader text-[15px] text-[#cfc4af] mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
