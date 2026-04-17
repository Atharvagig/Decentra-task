import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Wallet, Loader2, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function Login() {
  const { login, isConnecting } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-panel p-8 md:p-12 text-center relative"
      >
        <div className="mb-8 inline-flex p-4 rounded-3xl bg-neon-cyan/10 border border-neon-cyan/20">
          <Shield className="w-12 h-12 text-neon-cyan" />
        </div>

        <h1 className="text-3xl font-bold mb-4 tracking-tight">
          Welcome to <span className="text-neon-cyan">DecentraTask</span>
        </h1>
        
        <p className="text-white/60 mb-10 leading-relaxed">
          The next generation of decentralized task management. Connect your wallet to access the secure protocol.
        </p>

        <div className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 mb-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogin}
            disabled={isConnecting}
            className={cn(
              "w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 group",
              isConnecting 
                ? "bg-white/5 text-white/40 border border-white/10" 
                : "bg-neon-cyan text-cyber-black hover:neon-glow hover:scale-[1.02]"
            )}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect with MetaMask</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            Secure Cryptographic Login
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
          {[
            { label: "Immutable", icon: "🔗" },
            { label: "Secure", icon: "🛡️" },
            { label: "Global", icon: "🌐" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-[10px] font-mono text-white/40 uppercase">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
