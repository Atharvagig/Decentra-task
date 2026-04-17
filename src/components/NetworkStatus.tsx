import React from 'react';
import { Activity, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function NetworkStatus() {
  return (
    <div className="glass-panel p-4 flex items-center justify-between gap-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Globe className="w-5 h-5 text-neon-cyan" />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-neon-cyan rounded-full -z-10"
          />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">Network</div>
          <div className="text-xs font-bold">Mainnet Beta</div>
        </div>
      </div>

      <div className="h-8 w-px bg-white/10" />

      <div className="flex items-center gap-4">
        <Activity className="w-5 h-5 text-emerald-400" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">TPS</div>
          <div className="text-xs font-bold">2,482</div>
        </div>
      </div>

      <div className="h-8 w-px bg-white/10" />

      <div className="flex items-center gap-4">
        <Zap className="w-5 h-5 text-neon-purple" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">Gas</div>
          <div className="text-xs font-bold">12 Gwei</div>
        </div>
      </div>
    </div>
  );
}
