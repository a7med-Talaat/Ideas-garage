import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET single idea ──────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idea = await prisma.idea.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
      aiInsights: { orderBy: { createdAt: "desc" } },
      versions: { orderBy: { createdAt: "desc" }, take: 10 },
      linksFrom: {
        include: {
          target: {
            include: { category: true, tags: { include: { tag: true } } },
          },
        },
      },
      linksTo: {
        include: {
          source: {
            include: { category: true, tags: { include: { tag: true } } },
          },
        },
      },
    },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  return NextResponse.json({ idea });
}

// ─── PUT: Update idea ─────────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idea = await prisma.idea.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  // Save version history before updating
  await prisma.versionHistory.create({
    data: {
      ideaId: idea.id,
      title: idea.title,
      description: idea.description,
      richContent: idea.richContent,
    },
  });

  const body = await req.json();
  const {
    title, description, richContent, priority, status,
    isFavorite, categoryId, emoji, coverColor, tagIds,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (richContent !== undefined) updateData.richContent = richContent;
  if (priority !== undefined) updateData.priority = priority;
  if (status !== undefined) {
    updateData.status = status;
    if (status === "COMPLETED") updateData.completedAt = new Date();
    if (status === "ARCHIVED") updateData.archivedAt = new Date();
  }
  if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (emoji !== undefined) updateData.emoji = emoji;
  if (coverColor !== undefined) updateData.coverColor = coverColor;

  // Update tags if provided
  if (tagIds !== undefined) {
    await prisma.ideaTag.deleteMany({ where: { ideaId: idea.id } });
    if (tagIds.length > 0) {
      await prisma.ideaTag.createMany({
        data: tagIds.map((tagId: string) => ({ ideaId: idea.id, tagId })),
      });
    }
  }

  const updated = await prisma.idea.update({
    where: { id: params.id },
    data: updateData,
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { comments: true, aiInsights: true } },
    },
  });

  return NextResponse.json({ idea: updated });
}

// ─── DELETE idea ──────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idea = await prisma.idea.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  await prisma.idea.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
