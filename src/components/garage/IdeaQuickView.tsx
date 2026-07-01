"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, Clock, Tag, Flame, Star, ExternalLink } from "lucide-react";
import { CarSvg } from "./CarSvg";
import { formatRelativeTime, STATUS_CONFIG } from "@/lib/utils";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  isFavorite: boolean;
  emoji: string | null;
  coverColor: string | null;
  createdAt: string;
  category: { id: string; name: string; color: string } | null;
  tags: { tag: { id: string; name: string; color: string } }[];
}

interface IdeaQuickViewProps {
  idea: Idea | null;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export function IdeaQuickView({ idea, anchorRect, onClose }: IdeaQuickViewProps) {
  const router = useRouter();

  if (!idea || !anchorRect) return null;

  const carColor = idea.coverColor || idea.category?.color || "#4f8ef7";

  // Position to the right of the card, or left if near right edge
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const panelWidth = 320;
  const rightSpace = viewportWidth - anchorRect.right;
  const left = rightSpace >= panelWidth + 16
    ? anchorRect.right + 8
    : anchorRect.left - panelWidth - 8;
  const top = Math.min(anchorRect.top, (typeof window !== "undefined" ? window.innerHeight : 800) - 300);

  return (
    <AnimatePresence>
      {idea && (
        <motion.div
          initial={{ opacity: 0, x: rightSpace >= panelWidth + 16 ? -10 : 10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed z-[60] w-80 pointer-events-auto"
          style={{ left, top }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(11, 11, 20, 0.97)",
              border: `1px solid ${carColor}30`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${carColor}10`,
            }}
          >
            {/* Header with car */}
            <div
              className="p-4 flex items-start gap-3"
              style={{ background: `linear-gradient(135deg, ${carColor}12 0%, transparent 100%)` }}
            >
              <div className="shrink-0">
                <CarSvg color={carColor} size={90} isActive={idea.status === "ACTIVE"} isCompleted={idea.status === "COMPLETED"} emoji={idea.emoji || undefined} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      color: STATUS_CONFIG[idea.status as keyof typeof STATUS_CONFIG]?.color,
                      background: STATUS_CONFIG[idea.status as keyof typeof STATUS_CONFIG]?.bgColor,
                    }}
                  >
                    {STATUS_CONFIG[idea.status as keyof typeof STATUS_CONFIG]?.label}
                  </span>
                  {idea.priority === "URGENT" && <Flame className="w-3 h-3 text-red-400" />}
                  {idea.priority === "HIGH" && <Star className="w-3 h-3 text-orange-400" />}
                  {idea.isFavorite && <Heart className="w-3 h-3 fill-red-400 text-red-400" />}
                </div>
                <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{idea.title}</h3>
                {idea.category && (
                  <span className="text-[11px] mt-1 block" style={{ color: carColor }}>
                    {idea.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 space-y-3">
              {/* Description */}
              {idea.description && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{idea.description}</p>
              )}

              {/* Tags */}
              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {idea.tags.slice(0, 5).map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="text-[10px] px-1.5 py-0.5 rounded-md"
                      style={{ background: `${carColor}15`, color: carColor }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(idea.createdAt)}
                </div>
                <button
                  onClick={() => { router.push(`/idea/${idea.id}`); onClose(); }}
                  className="flex items-center gap-1 text-[11px] text-neon-blue hover:text-blue-400 transition-colors font-medium"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
