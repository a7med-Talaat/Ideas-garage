"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, Plus, BarChart3, Heart, LogOut, Sparkles,
  ArrowRight, Car, Hash, Folder, Command, X, Zap
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface Idea {
  id: string;
  title: string;
  category: { name: string; color: string } | null;
  status: string;
  coverColor: string | null;
  emoji: string | null;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewIdea: () => void;
  ideas: Idea[];
}

interface Action {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string; color?: string }>;
  color: string;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({ isOpen, onClose, onNewIdea, ideas }: CommandPaletteProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const staticActions: Action[] = [
    {
      id: "new-idea",
      label: "New Idea",
      description: "Create and park a new idea manually",
      icon: Plus,
      color: "#4f8ef7",
      action: () => { onNewIdea(); onClose(); },
      shortcut: "N",
    },
    {
      id: "analytics",
      label: "View Analytics",
      description: "See your garage stats and charts",
      icon: BarChart3,
      color: "#39d98a",
      action: () => { router.push("/analytics"); onClose(); },
    },
    {
      id: "favorites",
      label: "Show Favorites",
      description: "Filter ideas marked as favorite",
      icon: Heart,
      color: "#f75959",
      action: () => { router.push("/?favorite=true"); onClose(); },
    },
    {
      id: "sign-out",
      label: "Sign Out",
      description: `Signed in as ${session?.user?.email || ""}`,
      icon: LogOut,
      color: "#94a3b8",
      action: () => { signOut({ callbackUrl: "/login" }); onClose(); },
    },
  ];

  // Filter ideas by query
  const filteredIdeas = query.length > 0
    ? ideas.filter(idea =>
        idea.title.toLowerCase().includes(query.toLowerCase()) ||
        idea.category?.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  // Filter actions by query
  const filteredActions = query.length === 0
    ? staticActions
    : staticActions.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.description?.toLowerCase().includes(query.toLowerCase())
      );

  const allResults = [
    ...filteredIdeas.map(idea => ({ type: "idea" as const, idea })),
    ...filteredActions.map(action => ({ type: "action" as const, action })),
  ];

  const handleSelect = useCallback((index: number) => {
    const item = allResults[index];
    if (!item) return;
    if (item.type === "idea") {
      router.push(`/idea/${item.idea.id}`);
      onClose();
    } else {
      item.action.action();
    }
  }, [allResults, router, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(selectedIndex);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, selectedIndex, allResults.length, handleSelect, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-xl overflow-hidden"
            style={{
              background: "rgba(13, 13, 22, 0.97)",
              border: "1px solid rgba(79, 142, 247, 0.2)",
              borderRadius: "16px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.1), 0 0 60px rgba(79,142,247,0.05)",
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
              <Search className="w-5 h-5 text-neon-blue shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search ideas or type a command..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
              <div className="flex items-center gap-1.5">
                <kbd className="text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {/* Idea results */}
              {filteredIdeas.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Ideas</div>
                  {filteredIdeas.map((idea, i) => {
                    const isSelected = selectedIndex === i;
                    return (
                      <button
                        key={idea.id}
                        onClick={() => { router.push(`/idea/${idea.id}`); onClose(); }}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                          isSelected ? "bg-neon-blue/10" : "hover:bg-white/4"
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0"
                          style={{ background: `${idea.coverColor || idea.category?.color || "#4f8ef7"}20` }}
                        >
                          {idea.emoji || "💡"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white line-clamp-1">{idea.title}</p>
                          {idea.category && (
                            <p className="text-xs" style={{ color: idea.category.color }}>{idea.category.name}</p>
                          )}
                        </div>
                        {isSelected && <ArrowRight className="w-4 h-4 text-neon-blue shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Action results */}
              {filteredActions.length > 0 && (
                <div>
                  {filteredIdeas.length > 0 && <div className="my-1 border-t border-white/5" />}
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Actions</div>
                  {filteredActions.map((action, i) => {
                    const globalIndex = filteredIdeas.length + i;
                    const isSelected = selectedIndex === globalIndex;
                    return (
                      <button
                        key={action.id}
                        onClick={action.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                          isSelected ? "bg-white/5" : "hover:bg-white/4"
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${action.color}15`, border: `1px solid ${action.color}20` }}
                        >
                          <action.icon className="w-4 h-4" color={action.color} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{action.label}</p>
                          {action.description && (
                            <p className="text-xs text-slate-500 line-clamp-1">{action.description}</p>
                          )}
                        </div>
                        {action.shortcut && (
                          <kbd className="text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">{action.shortcut}</kbd>
                        )}
                        {isSelected && <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {query.length > 0 && allResults.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-slate-500 text-sm">No results for "{query}"</p>
                  <button
                    onClick={() => { onNewIdea(); onClose(); }}
                    className="mt-3 text-xs text-neon-blue hover:text-blue-400 flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-3 h-3" />
                    Create idea with this title
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-700">
                <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 rounded px-1">↵</kbd> select</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-700">
                <span className="bg-white/5 border border-white/10 rounded px-1">CTRL</span>
                <span>+</span>
                <span className="bg-white/5 border border-white/10 rounded px-1">K</span>
                <span className="ml-1">to open</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
