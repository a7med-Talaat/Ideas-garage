import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AITaggingResult {
  tags: string[];
  category: string;
  categoryColor: string;
  keywords: string[];
  summary: string;
  complexity: number;
  emoji: string;
}

export interface AIExpansionResult {
  relatedConcepts: string[];
  opportunities: string[];
  risks: string[];
  businessModels: string[];
  monetizationStrategies: string[];
  competitors: string[];
  technicalImplementation: string[];
  marketingIdeas: string[];
  nextSteps: string[];
  futureImprovements: string[];
  alternativeDirections: string[];
  estimatedComplexity: number;
  whyItMatters: string;
}

export interface AIConnectionResult {
  ideaId: string;
  targetIdeaId: string;
  relationshipType: "RELATED" | "MERGES" | "SPAWNS" | "CONFLICTS";
  explanation: string;
  strength: number;
}

export interface AIRoadmapResult {
  phases: {
    name: string;
    duration: string;
    tasks: string[];
    milestone: string;
  }[];
  totalEstimate: string;
  keyRisks: string[];
  successMetrics: string[];
}

// ─── Category colors mapping ─────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  AI: "#4f8ef7",
  "Artificial Intelligence": "#4f8ef7",
  "Machine Learning": "#4f8ef7",
  Business: "#39d98a",
  Startup: "#ff8c42",
  Content: "#f759ab",
  Personal: "#9b59f7",
  Research: "#38bdf8",
  Design: "#f7c948",
  Technology: "#4f8ef7",
  Marketing: "#f759ab",
  Finance: "#39d98a",
  Health: "#39d98a",
  Education: "#38bdf8",
  Entertainment: "#f7c948",
  Social: "#f759ab",
  Environment: "#39d98a",
  Other: "#94a3b8",
};

export function getCategoryColor(category: string): string {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  // Generate a deterministic color from the category name
  const hues = [200, 260, 160, 30, 310, 180, 50, 0];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue}, 70%, 60%)`;
}

// ─── Mock fallbacks (when no API key) ────────────────────────────────────────

function mockTagging(title: string, description: string): AITaggingResult {
  const text = `${title} ${description}`.toLowerCase();
  
  let category = "Other";
  let categoryColor = "#94a3b8";
  let emoji = "💡";
  
  if (text.match(/\b(ai|ml|machine learning|neural|gpt|llm|model)\b/)) {
    category = "AI"; categoryColor = "#4f8ef7"; emoji = "🤖";
  } else if (text.match(/\b(business|revenue|profit|market|sales|b2b)\b/)) {
    category = "Business"; categoryColor = "#39d98a"; emoji = "💼";
  } else if (text.match(/\b(startup|launch|mvp|product|founder)\b/)) {
    category = "Startup"; categoryColor = "#ff8c42"; emoji = "🚀";
  } else if (text.match(/\b(content|blog|video|social|post|creator)\b/)) {
    category = "Content"; categoryColor = "#f759ab"; emoji = "✍️";
  } else if (text.match(/\b(personal|habit|health|life|goal|self)\b/)) {
    category = "Personal"; categoryColor = "#9b59f7"; emoji = "🌟";
  } else if (text.match(/\b(research|study|analysis|data|science)\b/)) {
    category = "Research"; categoryColor = "#38bdf8"; emoji = "🔬";
  } else if (text.match(/\b(design|ui|ux|visual|brand|creative)\b/)) {
    category = "Design"; categoryColor = "#f7c948"; emoji = "🎨";
  }

  const words = text.split(/\s+/).filter(w => w.length > 4);
  const tags = Array.from(new Set(words.slice(0, 5))).map(w => w.replace(/[^a-z]/g, "")).filter(Boolean);

  return {
    tags: tags.slice(0, 5),
    category,
    categoryColor,
    keywords: tags,
    summary: description.slice(0, 120) + (description.length > 120 ? "..." : ""),
    complexity: Math.floor(Math.random() * 5) + 3,
    emoji,
  };
}

// ─── Core AI Functions ────────────────────────────────────────────────────────

export async function analyzeAndTagIdea(
  title: string,
  description: string
): Promise<AITaggingResult> {
  if (!genAI) {
    return mockTagging(title, description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this idea and return a JSON object with the following fields:
- tags: array of 3-7 relevant lowercase tags (single words or short phrases)
- category: a single category name (e.g., "AI", "Business", "Startup", "Content", "Personal", "Research", "Design", "Technology", "Marketing", "Health", "Education", or create a new fitting one)
- categoryColor: a hex color that fits the category theme
- keywords: array of 5-10 important keywords from the idea
- summary: a 1-2 sentence summary of the idea (max 150 chars)
- complexity: implementation complexity score from 1-10 (integer)
- emoji: single most relevant emoji for this idea

Idea Title: "${title}"
Idea Description: "${description}"

Return ONLY valid JSON, no markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(json);
  } catch (error) {
    console.error("AI tagging failed, using fallback:", error);
    return mockTagging(title, description);
  }
}

export async function expandIdea(
  title: string,
  description: string,
  category: string
): Promise<AIExpansionResult> {
  if (!genAI) {
    return {
      relatedConcepts: ["Concept A", "Concept B", "Concept C"],
      opportunities: ["Market opportunity 1", "Growth opportunity 2"],
      risks: ["Risk 1: Execution complexity", "Risk 2: Market timing"],
      businessModels: ["SaaS subscription", "Freemium", "Marketplace"],
      monetizationStrategies: ["Premium features", "Enterprise tier"],
      competitors: ["Competitor A", "Competitor B"],
      technicalImplementation: ["Step 1: MVP", "Step 2: Beta launch"],
      marketingIdeas: ["Content marketing", "Social media campaign"],
      nextSteps: ["Research market", "Build prototype", "Test with users"],
      futureImprovements: ["Mobile app", "API integrations"],
      alternativeDirections: ["B2B focus", "Consumer focus"],
      estimatedComplexity: 6,
      whyItMatters: "This idea addresses a real market gap with strong growth potential.",
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a creative AI brainstorming partner and business strategist. Deeply analyze this idea and return a rich JSON object:

Idea Title: "${title}"
Description: "${description}"
Category: "${category}"

Return a JSON with these exact fields (all arrays should have 3-6 items):
{
  "relatedConcepts": ["..."],
  "opportunities": ["..."],
  "risks": ["..."],
  "businessModels": ["..."],
  "monetizationStrategies": ["..."],
  "competitors": ["..."],
  "technicalImplementation": ["..."],
  "marketingIdeas": ["..."],
  "nextSteps": ["..."],
  "futureImprovements": ["..."],
  "alternativeDirections": ["..."],
  "estimatedComplexity": 7,
  "whyItMatters": "one compelling paragraph"
}

Be specific, creative, and insightful. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(json);
  } catch (error) {
    console.error("AI expansion failed:", error);
    throw new Error("AI expansion failed. Please try again.");
  }
}

export async function findConnections(
  sourceIdea: { id: string; title: string; description: string },
  otherIdeas: { id: string; title: string; description: string }[]
): Promise<AIConnectionResult[]> {
  if (!genAI || otherIdeas.length === 0) return [];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const ideaList = otherIdeas.slice(0, 10).map((idea, i) => 
      `${i + 1}. ID: ${idea.id}, Title: "${idea.title}", Description: "${idea.description.slice(0, 100)}"`
    ).join("\n");

    const prompt = `Analyze semantic connections between this source idea and the list of other ideas.

SOURCE IDEA:
Title: "${sourceIdea.title}"
Description: "${sourceIdea.description}"

OTHER IDEAS:
${ideaList}

For each idea that has a meaningful connection to the source, return a JSON array of connection objects:
[{
  "ideaId": "${sourceIdea.id}",
  "targetIdeaId": "<id from list>",
  "relationshipType": "RELATED" | "MERGES" | "SPAWNS" | "CONFLICTS",
  "explanation": "clear 1-sentence explanation of the connection",
  "strength": 0.8
}]

Only include connections with strength > 0.4. Return ONLY valid JSON array (can be empty []).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(json);
  } catch (error) {
    console.error("AI connection finding failed:", error);
    return [];
  }
}

export async function generateRoadmap(
  title: string,
  description: string,
  complexity: number
): Promise<AIRoadmapResult> {
  if (!genAI) {
    return {
      phases: [
        { name: "Discovery & Planning", duration: "2 weeks", tasks: ["Market research", "Define MVP scope", "Tech stack selection"], milestone: "Clear product spec" },
        { name: "Development", duration: "6 weeks", tasks: ["Build core features", "Internal testing", "Bug fixes"], milestone: "Working prototype" },
        { name: "Launch", duration: "2 weeks", tasks: ["Beta testing", "Marketing prep", "Launch"], milestone: "Public launch" },
      ],
      totalEstimate: "10 weeks",
      keyRisks: ["Technical complexity", "Market fit"],
      successMetrics: ["100 users in month 1", "Positive user feedback"],
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Create a detailed project roadmap for this idea:
Title: "${title}"
Description: "${description}"
Complexity: ${complexity}/10

Return JSON:
{
  "phases": [
    {
      "name": "Phase name",
      "duration": "X weeks",
      "tasks": ["task1", "task2", "task3"],
      "milestone": "key deliverable"
    }
  ],
  "totalEstimate": "X weeks/months",
  "keyRisks": ["risk1", "risk2"],
  "successMetrics": ["metric1", "metric2"]
}

Include 3-5 phases. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(json);
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    throw new Error("Roadmap generation failed.");
  }
}

export async function rewriteForClarity(text: string): Promise<string> {
  if (!genAI) return text;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `Rewrite this idea description to be clearer, more compelling, and better structured. Keep the same meaning but improve clarity and flow. Return ONLY the rewritten text, no explanation:\n\n"${text}"`
    );
    return result.response.text().trim();
  } catch {
    return text;
  }
}
