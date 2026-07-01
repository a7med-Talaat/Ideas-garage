import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";

  const ideas = await prisma.idea.findMany({
    where: { userId: session.user.id },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (format === "markdown") {
    const lines: string[] = [
      "# Idea Garage Export",
      `*Exported on ${new Date().toLocaleDateString()}*`,
      "",
    ];

    // Group by category
    const byCategory: Record<string, typeof ideas> = {};
    for (const idea of ideas) {
      const key = idea.category?.name || "Uncategorized";
      if (!byCategory[key]) byCategory[key] = [];
      byCategory[key].push(idea);
    }

    for (const [cat, catIdeas] of Object.entries(byCategory)) {
      lines.push(`## 🏎️ ${cat}`, "");
      for (const idea of catIdeas) {
        lines.push(
          `### ${idea.emoji || "💡"} ${idea.title}`,
          "",
          `**Status:** ${idea.status} | **Priority:** ${idea.priority}`,
          idea.tags.length > 0 ? `**Tags:** ${idea.tags.map(t => `#${t.tag.name}`).join(", ")}` : "",
          "",
          idea.description || "*No description*",
          "",
          idea.aiSummary ? `> **AI Summary:** ${idea.aiSummary}` : "",
          "",
          `*Created: ${new Date(idea.createdAt).toLocaleDateString()}*`,
          "",
          "---",
          "",
        );
      }
    }

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="ideas-garage-${Date.now()}.md"`,
      },
    });
  }

  // JSON export
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalIdeas: ideas.length,
    ideas: ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      status: idea.status,
      priority: idea.priority,
      isFavorite: idea.isFavorite,
      emoji: idea.emoji,
      category: idea.category?.name,
      tags: idea.tags.map(t => t.tag.name),
      aiSummary: idea.aiSummary,
      complexity: idea.complexity,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ideas-garage-${Date.now()}.json"`,
    },
  });
}
