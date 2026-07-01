"use client";

import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2, Star, Brain, Car } from "lucide-react";

interface GarageStatsBarProps {
  total: number;
  active: number;
  completed: number;
  favorites: number;
  aiInsights: number;
}

export function GarageStatsBar({ total, active, completed, favorites, aiInsights }: GarageStatsBarProps) {
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Parked", value: total, icon: Car, color: "#94a3b8" },
    { label: "Active", value: active, icon: Lightbulb, color: "#4f8ef7" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "#39d98a" },
    { label: "Favorites", value: favorites, icon: Star, color: "#f75959" },
    { label: "AI Insights", value: aiInsights, icon: Brain, color: "#9b59f7" },
  ];

  return (
    <div
      className="border-b border-white/4"
      style={{ background: "rgba(7,7,16,0.6)" }}
    >
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 shrink-0"
            >
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[10px] text-slate-600 hidden sm:block">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Completion progress */}
        {total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden hidden sm:block">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #4f8ef7, #39d98a)" }}
              />
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:block">{completionPct}% done</span>
          </div>
        )}
      </div>
    </div>
  );
}
