"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Brain, Link2, Map, RefreshCw, Loader2, ChevronRight,
  Lightbulb, AlertTriangle, DollarSign, Code, Megaphone,
  ArrowRight, Clock, Zap, Target, Shield, TrendingUp, Star
} from "lucide-react";
import toast from "react-hot-toast";

interface AIInsightsPanelProps {
  ideaId: string;
  ideaTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ExpansionData {
  relatedConcepts: string[];
  opportunities: string[];
  risks: string[];
  businessModels: string[];
  monetizationStrategies: string[];
  competitors: string[];
  technicalImplementation: string[];
  marketingIdeas: string[];
  nextSteps: string[];
  futureImprovements: string[];
  alternativeDirections: string[];
  estimatedComplexity: number;
  whyItMatters: string;
}

interface ConnectionData {
  ideaId: string;
  targetIdeaId: string;
  relationshipType: string;
  explanation: string;
  strength: number;
}

interface RoadmapData {
  phases: { name: string; duration: string; tasks: string[]; milestone: string }[];
  totalEstimate: string;
  keyRisks: string[];
  successMetrics: string[];
}

type InsightType = "EXPAND" | "CONNECTIONS" | "ROADMAP";

const INSIGHT_SECTIONS = {
  EXPAND: [
    { key: "whyItMatters", label: "Why It Matters", icon: Star, color: "#f7c948", single: true },
    { key: "relatedConcepts", label: "Related Concepts", icon: Lightbulb, color: "#4f8ef7" },
    { key: "opportunities", label: "Opportunities", icon: TrendingUp, color: "#39d98a" },
    { key: "risks", label: "Risks", icon: AlertTriangle, color: "#f75959" },
    { key: "businessModels", label: "Business Models", icon: DollarSign, color: "#f7c948" },
    { key: "monetizationStrategies", label: "Monetization", icon: DollarSign, color: "#39d98a" },
    { key: "competitors", label: "Competitors", icon: Shield, color: "#9b59f7" },
    { key: "technicalImplementation", label: "Technical Steps", icon: Code, color: "#38bdf8" },
    { key: "marketingIdeas", label: "Marketing Ideas", icon: Megaphone, color: "#f759ab" },
    { key: "nextSteps", label: "Next Steps", icon: ArrowRight, color: "#39d98a" },
    { key: "futureImprovements", label: "Future Features", icon: Zap, color: "#4f8ef7" },
    { key: "alternativeDirections", label: "Alternative Directions", icon: RefreshCw, color: "#ff8c42" },
  ],
};

export function AIInsightsPanel({ ideaId, ideaTitle, isOpen, onClose }: AIInsightsPanelProps) {
  const [activeType, setActiveType] = useState<InsightType>("EXPAND");
  const [loading, setLoading] = useState(false);
  const [expansion, setExpansion] = useState<ExpansionData | null>(null);
  const [connections, setConnections] = useState<ConnectionData[] | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);

  const fetchInsight = useCallback(async (type: InsightType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const content = data.insight.content;

      if (type === "EXPAND") setExpansion(content);
      else if (type === "CONNECTIONS") setConnections(content);
      else if (type === "ROADMAP") setRoadmap(content);

      toast.success("AI analysis complete! ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  const handleTabChange = (type: InsightType) => {
    setActiveType(type);
    if (type === "EXPAND" && !expansion) fetchInsight("EXPAND");
    else if (type === "CONNECTIONS" && !connections) fetchInsight("CONNECTIONS");
    else if (type === "ROADMAP" && !roadmap) fetchInsight("ROADMAP");
  };

  useEffect(() => {
    if (isOpen && !expansion) {
      fetchInsight("EXPAND");
    }
  }, [isOpen, expansion, fetchInsight]);

  const tabs = [
    { type: "EXPAND" as InsightType, label: "Expand", icon: Brain, color: "#9b59f7" },
    { type: "CONNECTIONS" as InsightType, label: "Connections", icon: Link2, color: "#4f8ef7" },
    { type: "ROADMAP" as InsightType, label: "Roadmap", icon: Map, color: "#39d98a" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl glass-card rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-neon-purple" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">AI Brainstorm</h2>
                    <p className="text-xs text-slate-500 line-clamp-1">{ideaTitle}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.type}
                    onClick={() => handleTabChange(tab.type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeType === tab.type ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                    style={
                      activeType === tab.type
                        ? { background: `${tab.color}20`, color: tab.color }
                        : {}
                    }
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-neon-purple/20 border-t-neon-purple animate-spin" />
                  <div className="text-center">
                    <p className="text-slate-300 font-medium">AI is analyzing your idea...</p>
                    <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* EXPAND content */}
                  {activeType === "EXPAND" && expansion && (
                    <div className="space-y-4">
                      {/* Complexity meter */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Implementation Complexity</span>
                          <span className="text-sm font-bold text-white">{expansion.estimatedComplexity}/10</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${expansion.estimatedComplexity * 10}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{
                              background: expansion.estimatedComplexity > 7
                                ? "linear-gradient(90deg, #f7c948, #f75959)"
                                : expansion.estimatedComplexity > 4
                                ? "linear-gradient(90deg, #39d98a, #f7c948)"
                                : "linear-gradient(90deg, #4f8ef7, #39d98a)",
                            }}
                          />
                        </div>
                      </div>

                      {INSIGHT_SECTIONS.EXPAND.map((section) => {
                        const value = expansion[section.key as keyof ExpansionData];
                        if (!value) return null;

                        return (
                          <motion.div
                            key={section.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl"
                            style={{
                              background: `${section.color}08`,
                              border: `1px solid ${section.color}18`,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <section.icon className="w-4 h-4" style={{ color: section.color }} />
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: section.color }}>
                                {section.label}
                              </span>
                            </div>
                            {section.single ? (
                              <p className="text-sm text-slate-300 leading-relaxed">{String(value)}</p>
                            ) : (
                              <ul className="space-y-1.5">
                                {(value as string[]).map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: section.color }} />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* CONNECTIONS content */}
                  {activeType === "CONNECTIONS" && connections !== null && (
                    <div className="space-y-3">
                      {connections.length === 0 ? (
                        <div className="text-center py-12">
                          <Link2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 font-medium">No connections found</p>
                          <p className="text-slate-600 text-sm mt-1">Add more ideas to discover connections</p>
                        </div>
                      ) : (
                        connections.map((conn, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-neon-blue/5 border border-neon-blue/15"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-neon-blue uppercase tracking-wider">
                                {conn.relationshipType}
                              </span>
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-neon-blue rounded-full"
                                    style={{ width: `${conn.strength * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500">{Math.round(conn.strength * 100)}%</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300">{conn.explanation}</p>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ROADMAP content */}
                  {activeType === "ROADMAP" && roadmap && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-neon-green/5 border border-neon-green/15">
                        <span className="text-sm text-slate-400">Total Estimate</span>
                        <span className="font-bold text-neon-green">{roadmap.totalEstimate}</span>
                      </div>

                      {/* Phases */}
                      <div className="space-y-3">
                        {roadmap.phases.map((phase, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-bold text-neon-blue">
                                  {i + 1}
                                </div>
                                <span className="font-semibold text-white text-sm">{phase.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">{phase.duration}</span>
                              </div>
                            </div>
                            <ul className="space-y-1 mb-3">
                              {phase.tasks.map((task, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-slate-400">
                                  <div className="w-1 h-1 rounded-full bg-neon-blue/60 mt-1.5 shrink-0" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                              <Target className="w-3 h-3 text-neon-green" />
                              <span className="text-xs text-neon-green">{phase.milestone}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Key risks */}
                      {roadmap.keyRisks.length > 0 && (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Key Risks</span>
                          </div>
                          <ul className="space-y-1">
                            {roadmap.keyRisks.map((risk, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-red-400/50">•</span> {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Refresh button */}
                  <button
                    onClick={() => fetchInsight(activeType)}
                    className="w-full mt-4 py-2 rounded-xl border border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Analysis
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
