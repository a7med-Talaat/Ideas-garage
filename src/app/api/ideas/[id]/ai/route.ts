import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expandIdea, findConnections, generateRoadmap, rewriteForClarity } from "@/lib/gemini";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idea = await prisma.idea.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { category: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const { type } = await req.json();

  try {
    let content: unknown;
    let insightType = type;

    switch (type) {
      case "EXPAND": {
        const expansion = await expandIdea(
          idea.title,
          idea.description,
          idea.category?.name || "General"
        );
        content = expansion;
        break;
      }

      case "CONNECTIONS": {
        const otherIdeas = await prisma.idea.findMany({
          where: {
            userId: session.user.id,
            id: { not: idea.id },
            status: { not: "ARCHIVED" },
          },
          select: { id: true, title: true, description: true },
          take: 20,
        });

        const connections = await findConnections(
          { id: idea.id, title: idea.title, description: idea.description },
          otherIdeas
        );

        // Store connection links
        for (const conn of connections) {
          try {
            await prisma.ideaLink.upsert({
              where: { sourceId_targetId: { sourceId: conn.ideaId, targetId: conn.targetIdeaId } },
              create: {
                sourceId: conn.ideaId,
                targetId: conn.targetIdeaId,
                relationshipType: conn.relationshipType,
                aiExplained: conn.explanation,
                strength: conn.strength,
              },
              update: {
                aiExplained: conn.explanation,
                strength: conn.strength,
              },
            });
          } catch {
            // skip duplicate errors
          }
        }

        content = connections;
        break;
      }

      case "ROADMAP": {
        const roadmap = await generateRoadmap(
          idea.title,
          idea.description,
          idea.complexity || 5
        );
        content = roadmap;
        break;
      }

      case "REWRITE": {
        const rewritten = await rewriteForClarity(idea.description);
        content = { rewritten };
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown insight type" }, { status: 400 });
    }

    // Store insight in DB
    const insight = await prisma.aIInsight.create({
      data: {
        ideaId: idea.id,
        type: insightType,
        content: JSON.stringify(content),
      },
    });

    return NextResponse.json({ insight: { ...insight, content } });
  } catch (error) {
    console.error("AI insight error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI analysis failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insights = await prisma.aIInsight.findMany({
    where: { ideaId: params.id, idea: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
  });

  const parsed = insights.map(i => ({
    ...i,
    content: JSON.parse(i.content),
  }));

  return NextResponse.json({ insights: parsed });
}
