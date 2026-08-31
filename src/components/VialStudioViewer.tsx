import React, { useState } from 'react';
import { Sun, Moon, ShieldCheck, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface VialStudioViewerProps {
  onVerifyClick?: () => void;
}

export const VialStudioViewer: React.FC<VialStudioViewerProps> = ({ onVerifyClick }) => {
  const [lightingMode, setLightingMode] = useState<'dark' | 'light'>('light');

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center p-4">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute inset-0 rounded-full filter blur-3xl transition-all duration-700 pointer-events-none opacity-30 ${
          lightingMode === 'dark'
            ? 'bg-gradient-to-tr from-brand-ink/20 via-brand-graphite/10 to-transparent'
            : 'bg-gradient-to-tr from-brand-border-strong/20 via-brand-canvas/30 to-transparent'
        }`}
      />

      {/* Lighting Control Switch */}
      <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 p-1 rounded-full bg-brand-paper border border-brand-border shadow-xs">
        <button
          onClick={() => setLightingMode('dark')}
          className={`p-1.5 rounded-full transition-all ${
            lightingMode === 'dark'
              ? 'bg-brand-primary text-brand-paper'
              : 'text-brand-steel hover:text-brand-ink'
          }`}
          title="Dark Lighting"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setLightingMode('light')}
          className={`p-1.5 rounded-full transition-all ${
            lightingMode === 'light'
              ? 'bg-brand-primary text-brand-paper'
              : 'text-brand-steel hover:text-brand-ink'
          }`}
          title="Light Lighting"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Lot Code Tag Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-6 left-2 z-20 p-2.5 rounded-xl bg-brand-paper border border-brand-border shadow-md space-y-1 hidden sm:block"
      >
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-mineral" />
          <span className="text-[10px] font-mono text-brand-ink font-semibold tracking-wider">LOT: LOT-VF-8842</span>
        </div>
        <div className="text-[10px] font-sans text-brand-mineral flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-brand-accent" />
          <span>HPLC Verified</span>
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
            lightingMode === 'dark' ? 'bg-black/60' : 'bg-brand-graphite/20'
          }`}
        />

        {/* Vial Image with Studio Lighting Swap */}
        <img
          src={
            lightingMode === 'dark'
              ? '/assets/vials/single-vial-dark.webp'
              : '/assets/vials/single-vial-light.webp'
          }
          alt="Vial Foundry Physical Reference Vial"
          className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-700 group-hover:scale-105"
        />
      </motion.div>

      {/* Interactive Bottom Floating Callout */}
      <div className="absolute bottom-2 inset-x-4 z-20 flex justify-center">
        <button
          onClick={onVerifyClick}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs hover:border-brand-border-strong hover:bg-brand-surface-muted transition-all shadow-sm"
        >
          <FileCheck className="w-3.5 h-3.5 text-brand-accent" />
          <span className="text-[11px] font-sans font-medium">Inspect Batch HPLC Data</span>
        </button>
      </div>
    </div>
  );
};
