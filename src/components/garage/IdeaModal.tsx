"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ListPlus, AlertCircle, FolderPlus, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "#94a3b8" },
  { value: "MEDIUM", label: "Medium", color: "#f7c948" },
  { value: "HIGH", label: "High", color: "#ff8c42" },
  { value: "URGENT", label: "Urgent 🔥", color: "#f75959" },
];

export function IdeaModal({ isOpen, onClose, onCreated }: IdeaModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) {
            setCategories(data.categories);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title for your idea");
      return;
    }

    setLoading(true);
    setError("");

    // Process tags
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          categoryId: categoryId || null,
          tags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create idea");
        return;
      }

      toast.success("🚗 Idea parked in the garage!", {
        duration: 3000,
      });

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCategoryId("");
      setTagInput("");
      onCreated();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setDescription("");
      setCategoryId("");
      setTagInput("");
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg glass-card rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                    <ListPlus className="w-4 h-4 text-neon-blue" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">New Idea</h2>
                    <p className="text-xs text-slate-500">Store and organize your thoughts manually</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="💡 What's your idea?"
                  autoFocus
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 transition-all text-lg font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your idea..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  <FolderPlus className="w-3.5 h-3.5" /> Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 transition-all text-sm cursor-pointer"
                >
                  <option value="" className="bg-[#0f0f18] text-slate-400">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0f0f18] text-slate-300">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5" /> Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="marketing, code, design (comma separated)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 transition-all"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPriority(opt.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        priority === opt.value
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      style={
                        priority === opt.value
                          ? {
                              background: `${opt.color}25`,
                              border: `1px solid ${opt.color}50`,
                              color: opt.color,
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex-1 py-3 rounded-xl bg-neon-blue hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parking...
                    </>
                  ) : (
                    "🚗 Park Idea"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
