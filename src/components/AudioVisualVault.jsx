import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Radio, Disc, Volume2, Mic2, FileText } from 'lucide-react';
import { AUDIO_VISUAL_VAULT } from '../data';

export default function AudioVisualVault() {
  const [selectedRecord, setSelectedRecord] = useState(AUDIO_VISUAL_VAULT[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlaybackSec, setActivePlaybackSec] = useState(0);
  const timerRef = useRef(null);

  // Playback timer simulation
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActivePlaybackSec(prev => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const handleSeek = (sec) => {
    setActivePlaybackSec(sec);
  };

  // Find active transcript line based on current second
  const activeLine = [...selectedRecord.transcripts]
    .reverse()
    .find(item => activePlaybackSec >= item.time) || selectedRecord.transcripts[0];

  return (
    <div className="vintage-card rounded-xl p-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2d2417]">
        <div>
          <div className="flex items-center gap-2 font-vintage-mono text-xs text-[#cba358]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#cba358]" />
            <span>SOUND & ORAL HISTORY ARCHIVE</span>
            <span className="text-[#594d3c]">•</span>
            <span>AIR & BBC HISTORICAL DISCS</span>
          </div>
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-[#f7f1e1] tracking-wide mt-1">
            Historic Oral Records & Debates
          </h2>
          <p className="text-xs text-[#958876] font-newsreader italic text-[14px]">
            Restored acoustic recordings synchronized with authentic stenographic transcripts.
          </p>
        </div>

        {/* Recording Selector Tabs */}
        <div className="flex gap-2">
          {AUDIO_VISUAL_VAULT.map(rec => (
            <button
              key={rec.id}
              onClick={() => {
                setSelectedRecord(rec);
                setIsPlaying(false);
                setActivePlaybackSec(0);
              }}
              className={`px-3 py-1.5 rounded font-vintage-mono text-xs border transition ${
                selectedRecord.id === rec.id
                  ? 'bg-[#2a2014] border-[#cba358] text-[#cba358]'
                  : 'bg-[#12161f] border-[#292218] text-[#8c7f6e] hover:text-white'
              }`}
            >
              {rec.year} • {rec.speaker.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Media Player Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Gramophone / Acoustic Deck */}
        <div className="lg:col-span-5 bg-[#0f141d] border border-[#2b2216] rounded-xl p-5 flex flex-col items-center text-center gap-4">
          <div className="w-36 h-36 rounded-full border-4 border-[#2d2317] bg-[#141009] flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className={`w-28 h-28 rounded-full border-2 border-dashed border-[#54432c] flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
              <Disc className="w-12 h-12 text-[#cba358] opacity-80" />
            </div>
            <div className="absolute w-6 h-6 rounded-full bg-[#0f141d] border border-[#cba358]" />
          </div>

          <div className="space-y-1">
            <div className="font-cinzel font-bold text-sm text-[#ede4d1]">{selectedRecord.title}</div>
            <div className="font-newsreader italic text-xs text-[#8f826f]">{selectedRecord.speaker}</div>
            <div className="font-vintage-mono text-[10px] text-[#cba358] pt-1">
              REF: {selectedRecord.archiveReference}
            </div>
          </div>

          {/* Sound wave simulation */}
          <div className="w-full flex items-center justify-center gap-1 h-8 px-4 bg-[#090c12] rounded border border-[#221c13]">
            {[14, 28, 45, 20, 60, 80, 40, 95, 60, 35, 75, 40, 20, 50, 70, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#cba358] rounded-full transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * ((activePlaybackSec % 4) + 1)) / 4)}%` : '20%',
                  opacity: isPlaying ? 0.9 : 0.3
                }}
              />
            ))}
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => handleSeek(0)}
              className="p-2 rounded bg-[#1c160e] border border-[#3b2e1c] text-[#8f826f] hover:text-[#cba358]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2.5 rounded-full bg-[#cba358] hover:bg-[#b58e45] text-[#0d1017] font-cinzel font-bold text-xs flex items-center gap-2 shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'PAUSE MASTER' : 'PLAY MASTER'}
            </button>
            <span className="font-vintage-mono text-xs text-[#8f826f]">
              00:{activePlaybackSec < 10 ? `0${activePlaybackSec}` : activePlaybackSec} / {selectedRecord.duration}
            </span>
          </div>
        </div>

        {/* Right: Live Stenographic Transcript Synchronizer */}
        <div className="lg:col-span-7 bg-[#0f141d] border border-[#2b2216] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#241c12] font-vintage-mono text-xs text-[#8c7f6e]">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#cba358]" /> SYNCHRONIZED ARCHIVAL TRANSCRIPT
            </span>
            <span className="text-[#cba358]">LINE AUDIO TRACKING</span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
            {selectedRecord.transcripts.map((item, idx) => {
              const isCurrent = activeLine.time === item.time;
              return (
                <div
                  key={idx}
                  onClick={() => handleSeek(item.time)}
                  className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                    isCurrent
                      ? 'bg-[#221a11] border-[#cba358] shadow'
                      : 'bg-[#12161f] border-[#221c13] hover:border-[#382b1c]'
                  }`}
                >
                  <div className="flex items-center justify-between font-vintage-mono text-[10px] text-[#7a6d5c]">
                    <span className="font-bold text-[#cba358]">{item.speaker}</span>
                    <span>00:{item.time < 10 ? `0${item.time}` : item.time}</span>
                  </div>
                  <p className={`mt-1 font-newsreader text-[15px] leading-relaxed ${isCurrent ? 'text-[#fbf7ee] font-medium' : 'text-[#a69a88]'}`}>
                    "{item.text}"
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#241c12] font-vintage-mono text-[10px] text-[#6d6150] flex items-center justify-between">
            <span>AUDIOTAPE FIDELITY: 96 KHZ / 24-BIT ARCHIVAL DIGITIZATION</span>
            <span className="text-emerald-500">AUTHENTICATED RECORD</span>
          </div>
        </div>

      </div>

    </div>
  );
}
