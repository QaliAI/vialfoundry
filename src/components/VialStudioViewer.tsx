import React, { useState } from 'react';
import { Sparkles, Sun, Moon, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface VialStudioViewerProps {
  onVerifyClick?: () => void;
}

export const VialStudioViewer: React.FC<VialStudioViewerProps> = ({ onVerifyClick }) => {
  const [lightingMode, setLightingMode] = useState<'dark' | 'light'>('dark');

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center p-4">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute inset-0 rounded-full filter blur-3xl transition-all duration-700 pointer-events-none opacity-40 ${
          lightingMode === 'dark'
            ? 'bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-transparent'
            : 'bg-gradient-to-tr from-amber-400/20 via-slate-300/20 to-transparent'
        }`}
      />

      {/* Lighting Control Switch */}
      <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 p-1 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl">
        <button
          onClick={() => setLightingMode('dark')}
          className={`p-1.5 rounded-full transition-all ${
            lightingMode === 'dark'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Dark Studio Lighting"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setLightingMode('light')}
          className={`p-1.5 rounded-full transition-all ${
            lightingMode === 'light'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Light Studio Lighting"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Lot Code Tag Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-6 left-2 z-20 p-2.5 rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-2xl space-y-1 hidden sm:block"
      >
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="mono-tag text-[10px] text-slate-300 tracking-wider">LOT: LOT-VF-8842</span>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3" />
          <span>99.64% HPLC VERIFIED</span>
        </div>
      </motion.div>

      {/* Interactive Floating Vial Graphic */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 w-full h-full flex items-center justify-center p-6 cursor-pointer group"
      >
        {/* Vial Shadow */}
        <div
          className={`absolute bottom-8 w-40 h-6 rounded-full filter blur-md transition-opacity duration-500 ${
            lightingMode === 'dark' ? 'bg-black/80' : 'bg-slate-900/30'
          }`}
        />

        {/* Vial Image with Studio Lighting Swap */}
        <img
          src={
            lightingMode === 'dark'
              ? '/assets/vials/single-vial-dark.webp'
              : '/assets/vials/single-vial-light.webp'
          }
          alt="Vial Foundry Precision Vial Asset"
          className="max-h-full max-w-full object-contain filter drop-shadow-2xl transition-all duration-700 group-hover:scale-105"
        />

        {/* Laser Grid Inspection Overlay Line */}
        <div className="absolute inset-x-8 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>

      {/* Interactive Bottom Floating Callout */}
      <div className="absolute bottom-2 inset-x-4 z-20 flex justify-center">
        <button
          onClick={onVerifyClick}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md text-slate-200 text-xs hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-xl"
        >
          <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="mono-tag text-[11px]">INSPECT BATCH HPLC DATA</span>
        </button>
      </div>
    </div>
  );
};
