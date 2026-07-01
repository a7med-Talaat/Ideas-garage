"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";
import { Heart, Flame, Star, MessageSquare, Clock, CheckCircle2, Archive } from "lucide-react";
import { CarSvg } from "./CarSvg";
import { formatRelativeTime, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/utils";

interface IdeaWithRelations {
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

interface CarCardProps {
  idea: IdeaWithRelations;
  onClick: () => void;
  onFavoriteToggle: (id: string, value: boolean) => void;
  onHover?: (idea: IdeaWithRelations, rect: DOMRect) => void;
  onLeave?: () => void;
}

export function CarCard({ idea, onClick, onFavoriteToggle, onHover, onLeave }: CarCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: idea.id,
    data: { type: "idea", idea },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 999 : "auto" as any,
  };

  const carColor = idea.coverColor || idea.category?.color || "#4f8ef7";
  const priorityConfig = PRIORITY_CONFIG[idea.priority as keyof typeof PRIORITY_CONFIG];
  const statusConfig = STATUS_CONFIG[idea.status as keyof typeof STATUS_CONFIG];

  const handleMouseEnter = () => {
    if (onHover && cardRef.current && !isDragging) {
      onHover(idea, cardRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    if (onLeave) onLeave();
  };

  const isCompleted = idea.status === "COMPLETED";
  const isArchived = idea.status === "ARCHIVED";

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (cardRef as any).current = node;
      }}
      style={style}
      className={`car-card glass-card rounded-xl overflow-hidden group transition-all duration-200 ${isDragging ? "is-dragging" : ""} ${isCompleted ? "opacity-75" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Priority accent line at top */}
      <div
        className="h-0.5 w-full"
        style={{
          background: idea.priority === "URGENT"
            ? "linear-gradient(90deg, #f75959, #ff8c42)"
            : idea.priority === "HIGH"
            ? "linear-gradient(90deg, #ff8c42, #f7c948)"
            : idea.priority === "MEDIUM"
            ? `linear-gradient(90deg, ${carColor}, ${carColor}80)`
            : "transparent",
        }}
      />

      {/* Drag handle - car area */}
      <div
        {...attributes}
        {...listeners}
        className="p-2.5 cursor-grab active:cursor-grabbing select-none"
        style={{
          background: `linear-gradient(135deg, ${carColor}12 0%, transparent 100%)`,
          borderBottom: `1px solid ${carColor}18`,
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          {/* Status */}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{ color: statusConfig.color, background: statusConfig.bgColor }}
          >
            {statusConfig.label}
          </span>

          {/* Priority + status icons */}
          <div className="flex items-center gap-1">
            {idea.priority === "URGENT" && <Flame className="w-3 h-3 text-red-400 animate-pulse" />}
            {idea.priority === "HIGH" && <Star className="w-3 h-3 text-orange-400" />}
            {isCompleted && <CheckCircle2 className="w-3 h-3 text-neon-green" />}
            {isArchived && <Archive className="w-3 h-3 text-slate-500" />}
          </div>
        </div>

        {/* Car SVG */}
        <div className="flex justify-center">
          <CarSvg
            color={carColor}
            size={108}
            isActive={idea.status === "ACTIVE"}
            isCompleted={isCompleted}
            emoji={idea.emoji || undefined}
          />
        </div>
      </div>

      {/* Info area — click to open */}
      <div className="p-2.5 cursor-pointer" onClick={onClick}>
        <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1 group-hover:text-neon-blue/90 transition-colors">
          {idea.title}
        </h3>

        {/* Summary / description */}
        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
          {idea.description || "No description yet."}
        </p>

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {idea.tags.slice(0, 2).map(({ tag }) => (
              <span
                key={tag.id}
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: `${carColor}18`, color: `${carColor}cc` }}
              >
                #{tag.name}
              </span>
            ))}
            {idea.tags.length > 2 && (
              <span className="text-[9px] text-slate-600">+{idea.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-[9px]">{formatRelativeTime(idea.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1">
            {idea._count.comments > 0 && (
              <div className="flex items-center gap-0.5 text-slate-600">
                <MessageSquare className="w-2.5 h-2.5" />
                <span className="text-[9px]">{idea._count.comments}</span>
              </div>
            )}

            {/* Favorite */}
            <button
              onClick={e => { e.stopPropagation(); onFavoriteToggle(idea.id, !idea.isFavorite); }}
              className="ml-0.5 transition-all hover:scale-125 active:scale-90"
            >
              <Heart
                className={`w-3 h-3 transition-all ${
                  idea.isFavorite ? "fill-red-400 text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.6)]" : "text-slate-700 hover:text-red-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
