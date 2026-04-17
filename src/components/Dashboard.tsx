import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Shield, Database, Cpu, Loader2, AlertCircle, Info, ExternalLink, LogOut, User as UserIcon } from 'lucide-react';
import { blockchain, Task, Priority } from '../lib/blockchain';
import { TaskCard } from './TaskCard';
import { NetworkStatus } from './NetworkStatus';
import { ToastContainer, ToastType } from './Toast';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function Dashboard() {
  const { address: account, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.Medium);
  const [isAdding, setIsAdding] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (newTaskContent.trim() && account) {
      blockchain.estimateGas('create').then(setEstimatedGas);
    } else {
      setEstimatedGas(null);
    }
  }, [newTaskContent, account]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await blockchain.getTasks();
      setTasks(data);
    } catch (err) {
      addToast("Failed to sync with blockchain", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim() || !account) return;

    setIsAdding(true);
    const toastId = addToast("Broadcasting transaction to network...", "loading");
    
    try {
      const newTask = await blockchain.addTask(newTaskContent, newTaskCategory, newTaskPriority);
      setTasks(prev => [newTask, ...prev]);
      setNewTaskContent('');
      removeToast(toastId);
      addToast("Transaction confirmed! Task added to block.", "success");
    } catch (err: any) {
      removeToast(toastId);
      addToast(err.message || "Transaction failed", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    const toastId = addToast("Updating task state...", "loading");
    try {
      await blockchain.toggleTask(id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      removeToast(toastId);
      addToast("State updated successfully", "success");
    } catch (err: any) {
      removeToast(toastId);
      addToast(err.message || "Action failed", "error");
    }
  };

  const handleVoteTask = async (id: number) => {
    try {
      const newVotes = await blockchain.voteTask(id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, votes: newVotes } : t));
      addToast("Vote recorded on-chain", "success");
    } catch (err) {
      addToast("Voting failed", "error");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-neon-cyan" />
            <span className="text-xs font-mono uppercase tracking-widest text-neon-cyan/80">Decentralized Protocol v1.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Decentra<span className="text-neon-cyan">Task</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-neon-cyan" />
            </div>
            <div className="hidden md:block">
              <div className="text-[10px] font-mono text-white/40 uppercase leading-none mb-1">Connected As</div>
              <div className="text-xs font-bold font-mono">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all duration-300"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Tasks", value: tasks.length, icon: Database, color: "text-neon-cyan" },
          { label: "Completed", value: tasks.filter(t => t.completed).length, icon: Cpu, color: "text-neon-purple" },
          { label: "Active Nodes", value: "1,242", icon: LayoutGrid, color: "text-emerald-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-white/40 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="text-3xl font-bold font-mono">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Add Task */}
        <div className="lg:col-span-1">
          <div className="sticky top-12 space-y-6">
            <NetworkStatus />

            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-neon-cyan" />
                Propose New Task
              </h2>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    placeholder="Describe the task to be recorded on-chain..."
                    disabled={!account || isAdding}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition-all resize-none disabled:opacity-50"
                  />
                  {!account && (
                    <div className="absolute inset-0 flex items-center justify-center bg-cyber-black/60 backdrop-blur-[2px] rounded-2xl">
                      <p className="text-sm font-medium text-white/60">Connect wallet to interact</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      disabled={!account || isAdding}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    >
                      {["General", "Dev", "Design", "Security", "Marketing"].map(cat => (
                        <option key={cat} value={cat} className="bg-cyber-gray">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                      disabled={!account || isAdding}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    >
                      <option value={Priority.Low} className="bg-cyber-gray">Low</option>
                      <option value={Priority.Medium} className="bg-cyber-gray">Medium</option>
                      <option value={Priority.High} className="bg-cyber-gray">High</option>
                      <option value={Priority.Critical} className="bg-cyber-gray">Critical</option>
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {estimatedGas && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
                        <Info className="w-3 h-3" />
                        Est. Gas Limit
                      </div>
                      <div className="text-[10px] font-mono text-neon-purple">{estimatedGas} units</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button
                  type="submit"
                  disabled={!account || !newTaskContent.trim() || isAdding}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold hover:bg-neon-cyan hover:text-cyber-black hover:neon-glow transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white disabled:hover:shadow-none"
                >
                  {isAdding ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Mining Transaction...</span>
                    </div>
                  ) : (
                    "Broadcast to Network"
                  )}
                </button>
              </form>
            </div>

            <div className="p-6 rounded-2xl bg-neon-purple/5 border border-neon-purple/20">
              <h4 className="text-xs font-mono uppercase tracking-widest text-neon-purple mb-2">Protocol Info</h4>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                DecentraTask uses a proof-of-authority consensus for task validation. All actions are immutable once confirmed.
              </p>
              <a href="#" className="flex items-center gap-2 text-xs font-mono text-neon-cyan hover:underline">
                View Smart Contract <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Task List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <List className="w-5 h-5 text-neon-cyan" />
              On-Chain Registry
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-white/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE FEED
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-mono uppercase tracking-widest">Syncing with Blockchain...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggleTask} 
                    onVote={handleVoteTask}
                  />
                ))}
              </AnimatePresence>
            )}
            
            {!isLoading && tasks.length === 0 && (
              <div className="text-center py-20 glass-panel border-dashed">
                <p className="text-white/40">No records found on this block.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-white/20 font-mono text-[10px] uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <span>&copy; 2026 DecentraTask Protocol</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>v1.0.4-stable</span>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-neon-cyan transition-colors">Documentation</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">Explorer</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">Governance</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">Status</a>
        </div>
      </footer>
    </div>
  );
}
