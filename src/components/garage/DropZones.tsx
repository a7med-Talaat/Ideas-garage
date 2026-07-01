"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { CheckCircle2, Archive } from "lucide-react";

export function ExitDoor() {
  const { setNodeRef, isOver } = useDroppable({
    id: "exit-door",
    data: { type: "exit" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone-exit relative rounded-2xl p-6 text-center transition-all duration-300 ${isOver ? "drag-over" : ""}`}
    >
      {/* Neon door frame */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: isOver
            ? "linear-gradient(135deg, rgba(57, 217, 138, 0.12) 0%, rgba(57, 217, 138, 0.06) 100%)"
            : "linear-gradient(135deg, rgba(57, 217, 138, 0.04) 0%, transparent 100%)",
          transition: "all 0.3s ease",
        }}
      />

      <motion.div
        animate={isOver ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div
          className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
            isOver ? "glow-green" : ""
          }`}
          style={{
            background: isOver ? "rgba(57, 217, 138, 0.2)" : "rgba(57, 217, 138, 0.08)",
            border: isOver ? "2px solid rgba(57, 217, 138, 0.6)" : "1px solid rgba(57, 217, 138, 0.2)",
          }}
        >
          <CheckCircle2
            className={`w-7 h-7 transition-colors ${isOver ? "text-neon-green" : "text-neon-green/40"}`}
          />
        </div>

        <div className="font-display text-sm font-bold tracking-widest uppercase text-neon-green/70">
          EXIT DOOR
        </div>
        <p className="text-xs text-slate-600 mt-1">
          {isOver ? "🎉 Drop to complete!" : "Drop to complete idea"}
        </p>
      </motion.div>

      {/* Animated door lines */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-2 opacity-30">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="w-6 h-1 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(57, 217, 138, 0.6), transparent)",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ArchiveLot() {
  const { setNodeRef, isOver } = useDroppable({
    id: "archive-lot",
    data: { type: "archive" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone-archive relative rounded-2xl p-6 text-center transition-all duration-300 ${isOver ? "drag-over" : ""}`}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: isOver
            ? "linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, transparent 100%)"
            : "transparent",
          transition: "all 0.3s ease",
        }}
      />

      <motion.div
        animate={isOver ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all duration-300"
          style={{
            background: isOver ? "rgba(107, 114, 128, 0.15)" : "rgba(107, 114, 128, 0.06)",
            border: isOver ? "2px solid rgba(107, 114, 128, 0.5)" : "1px solid rgba(107, 114, 128, 0.2)",
          }}
        >
          <Archive
            className={`w-7 h-7 transition-colors ${isOver ? "text-slate-400" : "text-slate-600"}`}
          />
        </div>

        <div className="font-display text-sm font-bold tracking-widest uppercase text-slate-600">
          ARCHIVE LOT
        </div>
        <p className="text-xs text-slate-700 mt-1">
          {isOver ? "Drop to archive" : "Drop to store away"}
        </p>
      </motion.div>
    </div>
  );
}
