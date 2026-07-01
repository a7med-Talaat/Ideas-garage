import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "demo@ideasgarage.com" },
    update: {},
    create: {
      email: "demo@ideasgarage.com",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log("✅ Created demo user:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name_userId: { name: "AI", userId: user.id } },
      update: {},
      create: { name: "AI", color: "#4f8ef7", icon: "Brain", userId: user.id, aiGenerated: true },
    }),
    prisma.category.upsert({
      where: { name_userId: { name: "Startup", userId: user.id } },
      update: {},
      create: { name: "Startup", color: "#ff8c42", icon: "Rocket", userId: user.id, aiGenerated: true },
    }),
    prisma.category.upsert({
      where: { name_userId: { name: "Personal", userId: user.id } },
      update: {},
      create: { name: "Personal", color: "#9b59f7", icon: "User", userId: user.id, aiGenerated: true },
    }),
  ]);

  const [aiCat, startupCat, personalCat] = categories;

  // Create sample ideas
  const ideas = [
    {
      title: "AI-Powered Code Review Tool",
      description: "Build a tool that uses LLMs to automatically review pull requests, suggest improvements, detect bugs, and enforce coding standards.",
      status: "ACTIVE",
      priority: "HIGH",
      emoji: "🤖",
      coverColor: "#4f8ef7",
      categoryId: aiCat.id,
      aiSummary: "An AI tool for automated PR reviews using LLMs to catch bugs and enforce standards.",
      complexity: 7,
    },
    {
      title: "Micro-SaaS: Invoice Generator",
      description: "Simple one-page invoice generator with PDF export, no sign-up required. Monetize with premium templates.",
      status: "ACTIVE",
      priority: "MEDIUM",
      emoji: "💰",
      coverColor: "#ff8c42",
      categoryId: startupCat.id,
      aiSummary: "A simple no-auth invoice generator with PDF export and premium template monetization.",
      complexity: 3,
    },
    {
      title: "Personal Knowledge Garden",
      description: "A Zettelkasten-inspired note system where notes are linked by concepts, not folders. Use AI to suggest connections.",
      status: "DRAFT",
      priority: "LOW",
      emoji: "🌱",
      coverColor: "#9b59f7",
      categoryId: personalCat.id,
      aiSummary: "An AI-enhanced Zettelkasten note system with automatic connection suggestions.",
      complexity: 6,
    },
  ];

  for (const ideaData of ideas) {
    const existing = await prisma.idea.findFirst({
      where: { title: ideaData.title, userId: user.id },
    });
    if (!existing) {
      await prisma.idea.create({
        data: { ...ideaData, userId: user.id },
      });
    }
  }

  console.log("✅ Created sample ideas");
  console.log("\n🚗 Database seeded successfully!");
  console.log("   Demo login: demo@ideasgarage.com / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
