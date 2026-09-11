import React from 'react';
import { CHRONOLOGY } from '../data';

export default function ChronologyView() {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Historical Chronology & Milestone Records</h2>
        <p className="text-xs text-[#8292a8]">
          Curated timeline of legal, constitutional, and social movements documented in the institutional archive.
        </p>
      </div>

      <div className="relative border-l border-[#273447] ml-4 space-y-6">
        {CHRONOLOGY.map((item, index) => (
          <div key={index} className="relative pl-6">
            <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#c99347] border-2 border-[#0f141c]" />
            <div className="bg-[#161d27] archival-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#c99347]">{item.year}</span>
                <span className="text-[11px] font-mono text-[#718299]">{item.source}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-1">{item.title}</h3>
              <p className="text-xs text-[#cad5e3] mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
