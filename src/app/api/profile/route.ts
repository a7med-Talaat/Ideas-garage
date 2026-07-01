import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password } = await req.json();

  if (!email?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
  }

  // Check if email is already taken by someone else
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      NOT: { id: session.user.id },
    },
  });

  if (existingUser) {
    return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
  }

  const updateData: Record<string, any> = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
  };

  if (password && password.trim().length >= 6) {
    updateData.password = await bcrypt.hash(password.trim(), 12);
  } else if (password && password.trim().length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}
