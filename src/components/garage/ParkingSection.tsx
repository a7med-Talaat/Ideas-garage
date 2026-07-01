"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Folder } from "lucide-react";
import { CarCard } from "./CarCard";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  isFavorite: boolean;
  emoji: string | null;
  coverColor: string | null;
  complexity: number | null;
  aiSummary: string | null;
  createdAt: string;
  category: { id: string; name: string; color: string } | null;
  tags: { tag: { id: string; name: string; color: string } }[];
  _count: { comments: number; aiInsights: number };
}

interface ParkingSectionProps {
  categoryId: string | "uncategorized";
  categoryName: string;
  categoryColor: string;
  ideas: Idea[];
  onIdeaClick: (idea: Idea) => void;
  onFavoriteToggle: (id: string, value: boolean) => void;
  onEditCategory?: () => void;
  onCardHover?: (idea: Idea, rect: DOMRect) => void;
  onCardLeave?: () => void;
}

export function ParkingSection({
  categoryId,
  categoryName,
  categoryColor,
  ideas,
  onIdeaClick,
  onFavoriteToggle,
  onEditCategory,
  onCardHover,
  onCardLeave,
}: ParkingSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `category-${categoryId}`,
    data: { type: "category", categoryId },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      ref={setNodeRef}
      className={`parking-section transition-all duration-300 relative ${isOver ? "drag-over" : ""}`}
      style={{
        background: isOver
          ? `linear-gradient(135deg, ${categoryColor}10 0%, ${categoryColor}05 100%)`
          : `linear-gradient(135deg, rgba(19, 19, 31, 0.8) 0%, rgba(13, 13, 22, 0.9) 100%)`,
        border: `1px solid ${isOver ? categoryColor + "40" : categoryColor + "18"}`,
        boxShadow: isOver ? `0 0 30px ${categoryColor}15` : "none",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          {/* Color dot / category indicator */}
          <div
            className="w-3 h-3 rounded-full animate-pulse-glow"
            style={{
              background: categoryColor,
              boxShadow: `0 0 8px ${categoryColor}60`,
            }}
          />
          <div
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: categoryColor }}
          >
            {categoryName}
          </div>
          <span className="text-[10px] text-slate-600 font-medium">
            {ideas.length} {ideas.length === 1 ? "car" : "cars"}
          </span>
        </div>

        {onEditCategory && (
          <button
            onClick={onEditCategory}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-600 hover:text-slate-400 transition-all"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Parking stripes (decorative) */}
      <div
        className="absolute inset-x-2 bottom-2 top-10 rounded-lg opacity-30 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent calc(${100 / Math.max(ideas.length + 1, 3)}% - 1px),
            ${categoryColor}10 calc(${100 / Math.max(ideas.length + 1, 3)}% - 1px),
            ${categoryColor}10 calc(${100 / Math.max(ideas.length + 1, 3)}%)
          )`,
        }}
      />

      {/* Cars Grid */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        <AnimatePresence>
          {ideas.map((idea) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <CarCard
                idea={idea}
                onClick={() => onIdeaClick(idea)}
                onFavoriteToggle={onFavoriteToggle}
                onHover={onCardHover}
                onLeave={onCardLeave}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty slot placeholder */}
        {ideas.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center mb-2"
              style={{ borderColor: `${categoryColor}30` }}
            >
              <Folder className="w-5 h-5" style={{ color: `${categoryColor}50` }} />
            </div>
            <p className="text-xs text-slate-600">Drop ideas here</p>
          </div>
        )}
      </div>

      {/* Drop indicator overlay */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl pointer-events-none flex items-center justify-center z-20"
          style={{ border: `2px dashed ${categoryColor}60` }}
        >
          <div
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: `${categoryColor}20`, color: categoryColor }}
          >
            Park here →
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
