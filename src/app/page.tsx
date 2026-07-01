"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  useSensor, useSensors, MouseSensor, TouchSensor
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Car, Heart, BarChart3, LogOut,
  SlidersHorizontal, X, Loader2, Command, FolderOpen,
  Download, Keyboard, User
} from "lucide-react";
import confetti from "canvas-confetti";

import { ParkingSection } from "@/components/garage/ParkingSection";
import { ExitDoor, ArchiveLot } from "@/components/garage/DropZones";
import { IdeaModal } from "@/components/garage/IdeaModal";
import { CarSvg } from "@/components/garage/CarSvg";
import { CommandPalette } from "@/components/garage/CommandPalette";
import { CategoryManager } from "@/components/garage/CategoryManager";
import { IdeaQuickView } from "@/components/garage/IdeaQuickView";
import { ProfileModal } from "@/components/garage/ProfileModal";
import toast from "react-hot-toast";

type SortOption = "createdAt_desc" | "createdAt_asc" | "priority_desc" | "title_asc";
type StatusFilter = "ALL" | "ACTIVE" | "DRAFT" | "COMPLETED" | "ARCHIVED";

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

export default function GaragePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt_desc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredIdea, setHoveredIdea] = useState<Idea | null>(null);
  const [hoveredAnchor, setHoveredAnchor] = useState<DOMRect | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcuts: Ctrl+K for command palette, N for new idea
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === "n" && !e.target || (e.key === "n" && (e.target as HTMLElement)?.tagName === "BODY")) {
        if (!modalOpen && !commandOpen) setModalOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, commandOpen]);

  // Fetch ideas
  const { data: ideasData, isLoading } = useQuery({
    queryKey: ["ideas", statusFilter, sortBy, showFavoritesOnly, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (sortBy) params.set("sort", sortBy);
      if (showFavoritesOnly) params.set("favorite", "true");
      if (search) params.set("search", search);
      const res = await fetch(`/api/ideas?${params}`);
      return res.json();
    },
    enabled: authStatus === "authenticated",
  });

  // Fetch categories for manager
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
    enabled: authStatus === "authenticated",
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  // Update mutation
  const updateIdea = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });

  // Drag handlers
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIdea(null);
    if (!over || !active.data.current?.idea) return;
    const idea: Idea = active.data.current.idea;
    const overId = over.id as string;

    if (overId === "exit-door") {
      await updateIdea.mutateAsync({ id: idea.id, data: { status: "COMPLETED" } });
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ["#39d98a", "#4f8ef7", "#9b59f7", "#f7c948", "#f759ab"] });
      toast.success("🎉 Idea completed! Amazing work!", { duration: 4000 });
      return;
    }
    if (overId === "archive-lot") {
      await updateIdea.mutateAsync({ id: idea.id, data: { status: "ARCHIVED" } });
      toast("Idea archived 📦", { icon: "📦" });
      return;
    }
    if (overId.startsWith("category-")) {
      const categoryId = overId.replace("category-", "");
      if (categoryId === idea.category?.id) return;
      await updateIdea.mutateAsync({
        id: idea.id,
        data: { categoryId: categoryId === "uncategorized" ? null : categoryId },
      });
      toast.success("🚗 Car moved to new section!");
    }
  }, [updateIdea]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveIdea(event.active.data.current?.idea as Idea);
    setHoveredIdea(null); // clear quick view when dragging
  };

  const handleFavoriteToggle = async (id: string, value: boolean) => {
    await updateIdea.mutateAsync({ id, data: { isFavorite: value } });
  };

  // Hover quick view
  const handleCardHover = (idea: Idea, rect: DOMRect) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredIdea(idea);
      setHoveredAnchor(rect);
    }, 600);
  };

  const handleCardLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredIdea(null), 200);
  };

  // Redirect
  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  // Export
  const handleExport = async (format: "json" | "markdown") => {
    setShowExportMenu(false);
    const a = document.createElement("a");
    a.href = `/api/export?format=${format}`;
    a.download = `ideas-garage.${format === "markdown" ? "md" : "json"}`;
    a.click();
    toast.success(`Exported as ${format.toUpperCase()}!`);
  };

  const ideas: Idea[] = ideasData?.ideas || [];
  const categories = categoriesData?.categories || [];

  // Group by category
  const categorized = ideas.reduce((acc, idea) => {
    const key = idea.category?.id || "uncategorized";
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: idea.category?.name || "Uncategorized",
        color: idea.category?.color || "#94a3b8",
        ideas: [],
      };
    }
    acc[key].ideas.push(idea);
    return acc;
  }, {} as Record<string, { id: string; name: string; color: string; ideas: Idea[] }>);

  const sections = Object.values(categorized);

  const STATUS_FILTERS: { value: StatusFilter; label: string; color: string }[] = [
    { value: "ALL", label: "All", color: "#94a3b8" },
    { value: "ACTIVE", label: "Active", color: "#4f8ef7" },
    { value: "DRAFT", label: "Draft", color: "#64748b" },
    { value: "COMPLETED", label: "Done", color: "#39d98a" },
    { value: "ARCHIVED", label: "Archived", color: "#6b7280" },
  ];

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen garage-floor flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen garage-floor" onClick={() => setShowExportMenu(false)}>

        {/* ── Navbar ────────────────────────────────────── */}
        <nav className="glass border-b border-white/5 sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center glow-blue">
                <Car className="w-4 h-4 text-neon-blue" />
              </div>
              <span className="font-display font-bold text-white hidden sm:block tracking-widest text-sm">
                IDEA GARAGE
              </span>
            </div>

            {/* Search + Ctrl K hint */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ideas, tags, categories..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-20 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue/30 focus:bg-neon-blue/5 transition-all"
              />
              {search ? (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ) : (
                <button
                  onClick={() => setCommandOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 py-0.5 hover:bg-white/8 transition-all"
                >
                  <span className="text-[10px] text-slate-500 font-medium">Ctrl</span>
                  <span className="text-[10px] text-slate-500 font-medium">+</span>
                  <span className="text-[10px] text-slate-500 font-medium">K</span>
                </button>
              )}
            </div>

            {/* Right nav */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Analytics */}
              <button
                onClick={() => router.push("/analytics")}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all"
                title="Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              {/* Categories */}
              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all"
                title="Manage Categories"
              >
                <FolderOpen className="w-4 h-4" />
              </button>

              {/* Export */}
              <div className="relative">
                <button
                  onClick={e => { e.stopPropagation(); setShowExportMenu(p => !p); }}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all"
                  title="Export Ideas"
                >
                  <Download className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-40 glass-card rounded-xl overflow-hidden z-50 shadow-2xl"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleExport("json")}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        Export as JSON
                      </button>
                      <div className="border-t border-white/5" />
                      <button
                        onClick={() => handleExport("markdown")}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        Export as Markdown
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Favorites */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-2 rounded-xl transition-all ${showFavoritesOnly ? "bg-red-500/10 text-red-400" : "hover:bg-white/5 text-slate-500 hover:text-slate-300"}`}
                title="Favorites"
              >
                <Heart className="w-4 h-4" />
              </button>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-all ${showFilters ? "bg-neon-blue/10 text-neon-blue" : "hover:bg-white/5 text-slate-500 hover:text-slate-300"}`}
                title="Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* User avatar - Click to edit profile */}
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
                title={`Edit Profile (${session?.user?.name})`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 border border-neon-blue/30 flex items-center justify-center text-xs font-bold text-white">
                  {session?.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-200 hidden sm:block transition-colors">{session?.user?.name}</span>
              </button>

              {/* Log out */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-slate-600 hover:text-slate-400 transition-colors" />
              </button>

              {/* New Idea */}
              <button
                onClick={() => setModalOpen(true)}
                id="new-idea-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-blue hover:bg-blue-500 text-white font-semibold text-sm transition-all glow-blue active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:block">New Idea</span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── Filter bar ─────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glass border-b border-white/5 overflow-hidden"
            >
              <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
                {/* Status pills */}
                <div className="flex items-center gap-1.5">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setStatusFilter(f.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={
                        statusFilter === f.value
                          ? { background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40` }
                          : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid transparent" }
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-white/10" />

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortOption)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-neon-blue/30 cursor-pointer"
                  >
                    <option value="createdAt_desc">Newest first</option>
                    <option value="createdAt_asc">Oldest first</option>
                    <option value="priority_desc">Priority</option>
                    <option value="title_asc">A–Z</option>
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-3 text-xs text-slate-600">
                  <span>{ideas.length} ideas shown</span>
                  <span>·</span>
                  <span>{sections.length} sections</span>
                  <span>·</span>
                  <button
                    onClick={() => setCommandOpen(true)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Keyboard className="w-3 h-3" />
                    Shortcuts
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content ───────────────────────────────── */}
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
                <Car className="w-6 h-6 text-neon-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-slate-500 text-sm">Loading your garage...</p>
            </div>
          ) : ideas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="mb-8"
              >
                <CarSvg color="#4f8ef7" size={180} isActive={false} />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Your garage awaits
              </h2>
              <p className="text-slate-500 mb-8 max-w-sm text-lg">
                {search
                  ? `No ideas match "${search}"`
                  : "Park your first idea. Keep track and organize your thoughts."}
              </p>
              {!search && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-blue text-white font-semibold hover:bg-blue-500 transition-all glow-blue text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Park Your First Idea
                  </button>
                  <button
                    onClick={() => setCommandOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm"
                  >
                    <Command className="w-4 h-4" />
                    Open Command Palette
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Sections grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {sections.map((section, i) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ParkingSection
                      categoryId={section.id}
                      categoryName={section.name}
                      categoryColor={section.color}
                      ideas={section.ideas}
                      onIdeaClick={idea => router.push(`/idea/${idea.id}`)}
                      onFavoriteToggle={handleFavoriteToggle}
                      onEditCategory={() => setCategoryManagerOpen(true)}
                      onCardHover={handleCardHover}
                      onCardLeave={handleCardLeave}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Drop zones */}
              <div className="grid grid-cols-2 gap-4">
                <ExitDoor />
                <ArchiveLot />
              </div>

              {/* Keyboard hint */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-700">
                <kbd className="bg-white/5 border border-white/8 rounded px-1.5 py-0.5">Ctrl+K</kbd>
                <span>Command palette</span>
                <span className="mx-1">·</span>
                <kbd className="bg-white/5 border border-white/8 rounded px-1.5 py-0.5">N</kbd>
                <span>New idea</span>
                <span className="mx-1">·</span>
                <span>Drag cars to Exit or Archive</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeIdea && (
          <div
            className="car-card glass-card rounded-xl overflow-hidden w-44 shadow-2xl"
            style={{ transform: "rotate(-3deg) scale(1.08)", opacity: 0.95 }}
          >
            <div className="p-3 flex justify-center" style={{ background: `${activeIdea.coverColor || "#4f8ef7"}15` }}>
              <CarSvg
                color={activeIdea.coverColor || activeIdea.category?.color || "#4f8ef7"}
                size={100}
                isActive={activeIdea.status === "ACTIVE"}
                emoji={activeIdea.emoji || undefined}
              />
            </div>
            <div className="px-3 pb-3">
              <p className="text-xs font-semibold text-white line-clamp-1">{activeIdea.title}</p>
            </div>
          </div>
        )}
      </DragOverlay>

      {/* Idea Quick View */}
      <IdeaQuickView
        idea={hoveredIdea}
        anchorRect={hoveredAnchor}
        onClose={() => setHoveredIdea(null)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNewIdea={() => setModalOpen(true)}
        ideas={ideas}
      />

      {/* Category Manager */}
      <CategoryManager
        isOpen={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={categories}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
      />

      {/* New Idea Modal */}
      <IdeaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["ideas"] });
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </DndContext>
  );
}
