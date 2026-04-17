import React from 'react';
import { CheckCircle2, Circle, Clock, User, ArrowBigUp, Tag } from 'lucide-react';
import { Task, Priority } from '../lib/blockchain';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void | Promise<void>;
  onVote: (id: number) => void | Promise<void>;
}

const priorityColors = {
  [Priority.Low]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [Priority.Medium]: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [Priority.High]: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  [Priority.Critical]: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onVote }) => {
  const date = new Date(task.timestamp).toLocaleDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "glass-panel p-5 transition-all duration-300 group",
        task.completed ? "opacity-60 grayscale-[0.5]" : "hover:neon-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border", priorityColors[task.priority])}>
              {Priority[task.priority].toUpperCase()}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              <Tag className="w-2.5 h-2.5" />
              {task.category}
            </div>
          </div>

          <h3 className={cn(
            "text-lg font-medium transition-all duration-300",
            task.completed ? "line-through text-white/40" : "text-white"
          )}>
            {task.content}
          </h3>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono text-white/40">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span className="hover:text-neon-cyan transition-colors cursor-help" title={task.owner}>
                {task.owner.slice(0, 6)}...{task.owner.slice(-4)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{date}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "p-2 rounded-xl transition-all duration-300",
              task.completed 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-white/5 text-white/40 hover:bg-neon-cyan/20 hover:text-neon-cyan"
            )}
          >
            {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>

          <button
            onClick={() => onVote(task.id)}
            className="flex flex-col items-center group/vote"
          >
            <ArrowBigUp className="w-6 h-6 text-white/20 group-hover/vote:text-neon-purple transition-colors" />
            <span className="text-[10px] font-mono text-white/40 group-hover/vote:text-neon-purple">{task.votes}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
