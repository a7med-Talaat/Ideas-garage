import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "#94a3b8", icon: "ArrowDown" },
  MEDIUM: { label: "Medium", color: "#f7c948", icon: "Minus" },
  HIGH: { label: "High", color: "#ff8c42", icon: "ArrowUp" },
  URGENT: { label: "Urgent", color: "#f75959", icon: "Flame" },
} as const;

export const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "#94a3b8", bgColor: "rgba(148,163,184,0.15)" },
  ACTIVE: { label: "Active", color: "#4f8ef7", bgColor: "rgba(79,142,247,0.15)" },
  COMPLETED: { label: "Completed", color: "#39d98a", bgColor: "rgba(57,217,138,0.15)" },
  ARCHIVED: { label: "Archived", color: "#6b7280", bgColor: "rgba(107,114,128,0.15)" },
} as const;

export type Status = keyof typeof STATUS_CONFIG;
export type Priority = keyof typeof PRIORITY_CONFIG;
