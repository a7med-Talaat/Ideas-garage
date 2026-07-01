"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Heart, Trash2, Edit3, Save, X,
  Tag, Folder, Clock, CheckCircle2, Archive, MessageSquare, History,
  Loader2
} from "lucide-react";
import { CarSvg } from "@/components/garage/CarSvg";
import { formatDate, formatRelativeTime, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import toast from "react-hot-toast";

interface IdeaDetailClientProps {
  ideaId: string;
}

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"] as const;

export function IdeaDetailClient({ ideaId }: IdeaDetailClientProps) {
  const router = useRouter();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  const fetchIdea = useCallback(async () => {
    try {
      const res = await fetch(`/api/ideas/${ideaId}`);
      const data = await res.json();
      if (res.ok) {
        setIdea(data.idea);
        setEditTitle(data.idea.title);
        setEditDescription(data.idea.description);
        setEditPriority(data.idea.priority);
        setEditStatus(data.idea.status);
      } else {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }, [ideaId, router]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          status: editStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIdea(data.idea);
        setEditing(false);
        toast.success("Idea updated!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFavorite = async () => {
    const res = await fetch(`/api/ideas/${ideaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !idea.isFavorite }),
    });
    if (res.ok) {
      const data = await res.json();
      setIdea(data.idea);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this idea permanently?")) return;
    const res = await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Idea removed from garage");
      router.push("/");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        setComment("");
        fetchIdea();
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen garage-floor flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  if (!idea) return null;

  const carColor = idea.coverColor || idea.category?.color || "#4f8ef7";
  const priorityConfig = PRIORITY_CONFIG[idea.priority as keyof typeof PRIORITY_CONFIG];
  const statusConfig = STATUS_CONFIG[idea.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="min-h-screen garage-floor">
      {/* Header */}
      <div className="glass border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Garage</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Favorite */}
            <button
              onClick={handleFavorite}
              className="p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <Heart
                className={`w-4 h-4 ${idea.isFavorite ? "fill-red-400 text-red-400" : "text-slate-500"}`}
              />
            </button>

            {/* Edit / Save */}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-blue text-white text-sm font-medium hover:bg-blue-500 transition-all"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white text-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Idea header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Color banner with car */}
              <div
                className="relative p-8 flex items-center justify-between"
                style={{
                  background: `linear-gradient(135deg, ${carColor}15 0%, ${carColor}05 100%)`,
                  borderBottom: `1px solid ${carColor}20`,
                }}
              >
                <div className="flex-1">
                  {editing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-2xl font-bold bg-transparent text-white border-b border-white/20 focus:outline-none focus:border-neon-blue/50 pb-1"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-white">{idea.title}</h1>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {/* Status badge */}
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ color: statusConfig.color, background: statusConfig.bgColor }}
                    >
                      {statusConfig.label}
                    </span>

                    {/* Priority */}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <span style={{ color: priorityConfig.color }}>●</span>
                      {priorityConfig.label} Priority
                    </span>

                    {/* Category */}
                    {idea.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: `${idea.category.color}20`, color: idea.category.color }}
                      >
                        <Folder className="w-3 h-3" />
                        {idea.category.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 ml-4 hidden sm:block">
                  <CarSvg
                    color={carColor}
                    size={140}
                    isActive={idea.status === "ACTIVE"}
                    isCompleted={idea.status === "COMPLETED"}
                    emoji={idea.emoji || undefined}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="p-6">
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue/50 resize-none text-sm leading-relaxed"
                    placeholder="Describe your idea..."
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {idea.description ? (
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                    ) : (
                      <p className="text-slate-600 italic">No description yet. Click Edit to add one.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Comments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-white text-sm">Notes & Comments</h3>
                {idea.comments?.length > 0 && (
                  <span className="text-xs text-slate-600">({idea.comments.length})</span>
                )}
              </div>

              {/* Comment list */}
              <div className="space-y-3 mb-4">
                {idea.comments?.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-bold text-neon-blue shrink-0">
                      {c.user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">{c.user.name}</span>
                        <span className="text-[10px] text-slate-600">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* New comment form */}
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={!comment.trim() || submittingComment}
                  className="px-4 py-2 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue hover:bg-neon-blue/20 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
                </button>
              </form>
            </motion.div>

            {/* Version History */}
            {idea.versions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-white text-sm">Version History</h3>
                </div>
                <div className="space-y-2">
                  {idea.versions.slice(0, 5).map((v: any, i: number) => (
                    <div key={v.id} className="flex items-start gap-3 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-slate-400">v{idea.versions.length - i}</span>
                        <span className="mx-2">·</span>
                        <span>{formatRelativeTime(v.createdAt)}</span>
                        <span className="mx-2">·</span>
                        <span className="text-slate-600 line-clamp-1">{v.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Edit controls (sidebar) */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-2xl p-4 space-y-4"
              >
                <h3 className="text-sm font-semibold text-white">Edit Properties</h3>

                <div>
                  <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Status</label>
                  <div className="grid grid-cols-2 gap-1">
                    {STATUS_OPTIONS.map(s => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setEditStatus(s)}
                          className="py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={
                            editStatus === s
                              ? { background: cfg.bgColor, color: cfg.color, border: `1px solid ${cfg.color}40` }
                              : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }
                          }
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Priority</label>
                  <div className="grid grid-cols-2 gap-1">
                    {PRIORITY_OPTIONS.map(p => {
                      const cfg = PRIORITY_CONFIG[p];
                      return (
                        <button
                          key={p}
                          onClick={() => setEditPriority(p)}
                          className="py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={
                            editPriority === p
                              ? { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }
                              : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.07)" }
                          }
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card rounded-2xl p-4 space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Details</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Created</span>
                  <span className="text-slate-400">{formatDate(idea.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Updated</span>
                  <span className="text-slate-400">{formatRelativeTime(idea.updatedAt)}</span>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            {idea.tags?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.map(({ tag }: any) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: `${carColor}15`, color: carColor, border: `1px solid ${carColor}25` }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-4 space-y-2"
            >
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>

              {idea.status !== "COMPLETED" && (
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/ideas/${ideaId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "COMPLETED" }),
                    });
                    if (res.ok) { fetchIdea(); toast.success("🎉 Idea completed!"); }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neon-green/8 border border-neon-green/15 text-neon-green hover:bg-neon-green/15 transition-all text-xs font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Completed
                </button>
              )}

              {idea.status !== "ARCHIVED" && (
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/ideas/${ideaId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "ARCHIVED" }),
                    });
                    if (res.ok) { fetchIdea(); toast.success("Idea archived"); }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all text-xs font-medium border border-transparent hover:border-white/10"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archive Idea
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
