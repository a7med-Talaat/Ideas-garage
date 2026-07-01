import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET: List all ideas for the current user ─────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const priority = searchParams.get("priority");
  const favorite = searchParams.get("favorite");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "createdAt_desc";

  const where: Record<string, unknown> = { userId: session.user.id };

  if (status && status !== "ALL") where.status = status;
  if (categoryId) where.categoryId = categoryId === "uncategorized" ? null : categoryId;
  if (priority) where.priority = priority;
  if (favorite === "true") where.isFavorite = true;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { tags: { some: { tag: { name: { contains: search } } } } },
    ];
  }

  const [sortField, sortDir] = sort.split("_");
  const orderBy: Record<string, string> = {};
  orderBy[sortField === "priority" ? "priority" : sortField] = sortDir || "desc";

  const ideas = await prisma.idea.findMany({
    where,
    orderBy,
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ ideas });
}

// ─── POST: Create a new idea ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, priority, status, categoryId, tags } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Find or create tags manually if provided
  let tagRecords: any[] = [];
  if (tags && Array.isArray(tags)) {
    tagRecords = await Promise.all(
      tags.map(async (tagName: string) => {
        const name = tagName.toLowerCase().trim();
        if (!name) return null;
        let tag = await prisma.tag.findFirst({
          where: { name, userId: session.user.id },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name, userId: session.user.id },
          });
        }
        return tag;
      })
    );
  }
  const validTags = tagRecords.filter(Boolean);

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description || "",
      priority: priority || "MEDIUM",
      status: status || "ACTIVE",
      userId: session.user.id,
      categoryId: categoryId || null,
      emoji: "💡",
      coverColor: "#4f8ef7",
      tags: {
        create: validTags.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ idea }, { status: 201 });
}
