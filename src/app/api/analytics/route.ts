import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    totalIdeas,
    activeIdeas,
    completedIdeas,
    archivedIdeas,
    draftIdeas,
    favoriteIdeas,
    totalAIInsights,
    totalLinks,
    categoriesWithCounts,
    recentIdeas,
    ideasByWeek,
  ] = await Promise.all([
    prisma.idea.count({ where: { userId } }),
    prisma.idea.count({ where: { userId, status: "ACTIVE" } }),
    prisma.idea.count({ where: { userId, status: "COMPLETED" } }),
    prisma.idea.count({ where: { userId, status: "ARCHIVED" } }),
    prisma.idea.count({ where: { userId, status: "DRAFT" } }),
    prisma.idea.count({ where: { userId, isFavorite: true } }),
    prisma.aIInsight.count({ where: { idea: { userId } } }),
    prisma.ideaLink.count({ where: { source: { userId } } }),
    prisma.category.findMany({
      where: { userId },
      include: { _count: { select: { ideas: true } } },
      orderBy: { ideas: { _count: "desc" } },
      take: 10,
    }),
    prisma.idea.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    // Ideas created per day for last 30 days
    prisma.idea.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true, status: true },
    }),
  ]);

  // Group ideas by day
  const dayMap: Record<string, number> = {};
  for (const idea of ideasByWeek) {
    const day = idea.createdAt.toISOString().split("T")[0];
    dayMap[day] = (dayMap[day] || 0) + 1;
  }

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    return { date: key, count: dayMap[key] || 0 };
  });

  return NextResponse.json({
    stats: {
      totalIdeas,
      activeIdeas,
      completedIdeas,
      archivedIdeas,
      draftIdeas,
      favoriteIdeas,
      totalAIInsights,
      totalLinks,
      completionRate: totalIdeas > 0 ? Math.round((completedIdeas / totalIdeas) * 100) : 0,
    },
    categoriesWithCounts: categoriesWithCounts.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      count: c._count.ideas,
    })),
    recentIdeas,
    last30Days,
  });
}
