"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, Trash2, Check, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  "#4f8ef7", "#39d98a", "#ff8c42", "#f759ab",
  "#9b59f7", "#38bdf8", "#f7c948", "#f75959",
  "#06b6d4", "#10b981", "#8b5cf6", "#ec4899",
  "#f97316", "#84cc16", "#a78bfa", "#94a3b8",
];

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { ideas: number };
}

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onRefresh: () => void;
}

export function CategoryManager({ isOpen, onClose, categories, onRefresh }: CategoryManagerProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#4f8ef7");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (res.ok) {
        toast.success(`Category "${newName}" created!`);
        setNewName("");
        setNewColor("#4f8ef7");
        setCreating(false);
        onRefresh();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to create category");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, color: editColor }),
      });
      if (res.ok) {
        toast.success("Category updated!");
        setEditingId(null);
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Ideas in it will become uncategorized.`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${name}" deleted`);
      onRefresh();
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg glass-card rounded-2xl overflow-hidden"
          >
            <div className="px-6 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">Manage Categories</h2>
                <p className="text-xs text-slate-500 mt-0.5">Organize your garage sections</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Existing categories */}
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {editingId === cat.id ? (
                    <>
                      {/* Color swatch */}
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg cursor-pointer" style={{ background: editColor }} />
                        <input
                          type="color"
                          value={editColor}
                          onChange={e => setEditColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neon-blue/40"
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        disabled={saving}
                        className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green hover:bg-neon-green/20 transition-all"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: cat.color, boxShadow: `0 0 12px ${cat.color}40` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{cat.name}</p>
                        <p className="text-xs text-slate-600">{cat._count?.ideas || 0} ideas</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Create new */}
              {creating ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.15)" }}
                >
                  <p className="text-xs font-bold text-neon-blue uppercase tracking-wider">New Category</p>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Category name..."
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/40"
                  />
                  {/* Color picker */}
                  <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewColor(color)}
                        className="w-7 h-7 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: color,
                          boxShadow: newColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : "none",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCreating(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-500 text-sm hover:text-white transition-all">
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim() || saving}
                      className="flex-1 py-2 rounded-xl bg-neon-blue text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-all"
                    >
                      {saving ? "Creating..." : "Create"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Category
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
