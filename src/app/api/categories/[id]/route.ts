import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, color, icon, description } = await req.json();

  const category = await prisma.category.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: { name, color, icon, description },
    include: { _count: { select: { ideas: true } } },
  });

  return NextResponse.json({ category: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await prisma.category.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Unlink ideas from category before deleting
  await prisma.idea.updateMany({
    where: { categoryId: params.id },
    data: { categoryId: null },
  });

  await prisma.category.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
