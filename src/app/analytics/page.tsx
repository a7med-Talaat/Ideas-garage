"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Lightbulb, CheckCircle2, Archive, Star,
  Brain, Link2, TrendingUp, Loader2, Car, Zap
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/analytics")
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); });
    }
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen garage-floor flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  const { stats, categoriesWithCounts, last30Days } = data;

  const STAT_CARDS = [
    { label: "Total Ideas", value: stats.totalIdeas, icon: Lightbulb, color: "#4f8ef7", bg: "#4f8ef715" },
    { label: "Active", value: stats.activeIdeas, icon: Car, color: "#4f8ef7", bg: "#4f8ef712" },
    { label: "Completed", value: stats.completedIdeas, icon: CheckCircle2, color: "#39d98a", bg: "#39d98a12" },
    { label: "Archived", value: stats.archivedIdeas, icon: Archive, color: "#6b7280", bg: "#6b728012" },
    { label: "Favorites", value: stats.favoriteIdeas, icon: Star, color: "#f75959", bg: "#f7595912" },
    { label: "AI Analyses", value: stats.totalAIInsights, icon: Brain, color: "#9b59f7", bg: "#9b59f712" },
    { label: "Connections", value: stats.totalLinks, icon: Link2, color: "#38bdf8", bg: "#38bdf812" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "#39d98a", bg: "#39d98a12" },
  ];

  const PIE_COLORS = ["#4f8ef7", "#39d98a", "#ff8c42", "#f759ab", "#9b59f7", "#38bdf8", "#f7c948", "#f75959"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-xl p-3 text-xs">
          <p className="text-slate-400 mb-1">{label}</p>
          <p className="text-white font-bold">{payload[0].value} ideas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen garage-floor">
      {/* Header */}
      <div className="glass border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Garage</span>
          </button>
          <h1 className="font-display font-bold text-white tracking-wider text-sm">
            GARAGE ANALYTICS
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg, border: `1px solid ${card.color}25` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
              <div className="text-xs text-slate-500">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line chart - ideas over time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold text-white mb-1 text-sm">Ideas Over Time</h3>
            <p className="text-xs text-slate-500 mb-4">Last 30 days</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last30Days}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.slice(5)}
                  interval={6}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f8ef7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#4f8ef7" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie chart - categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold text-white mb-1 text-sm">Ideas by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution</p>
            {categoriesWithCounts.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={categoriesWithCounts}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {categoriesWithCounts.map((entry: any, index: number) => (
                        <Cell key={entry.id} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [v, n]}
                      contentStyle={{ background: "#13131f", border: "1px solid #1e1e35", borderRadius: 8 }}
                      labelStyle={{ color: "#94a3b8" }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoriesWithCounts.slice(0, 6).map((cat: any, i: number) => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color || PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-slate-400 line-clamp-1">{cat.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
                No categories yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Bar chart - top categories */}
        {categoriesWithCounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold text-white mb-1 text-sm">Ideas per Category</h3>
            <p className="text-xs text-slate-500 mb-4">All categories ranked</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoriesWithCounts.slice(0, 8)} barSize={28}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: "#13131f", border: "1px solid #1e1e35", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" name="Ideas" radius={[4, 4, 0, 0]}>
                  {categoriesWithCounts.slice(0, 8).map((entry: any, index: number) => (
                    <Cell key={entry.id} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Completion rate card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-semibold text-white mb-4 text-sm">Garage Progress</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Draft", value: stats.draftIdeas, color: "#6b7280", total: stats.totalIdeas },
              { label: "Active", value: stats.activeIdeas, color: "#4f8ef7", total: stats.totalIdeas },
              { label: "Completed", value: stats.completedIdeas, color: "#39d98a", total: stats.totalIdeas },
              { label: "Archived", value: stats.archivedIdeas, color: "#94a3b8", total: stats.totalIdeas },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                <div className="h-1.5 rounded-full bg-white/10 mb-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
