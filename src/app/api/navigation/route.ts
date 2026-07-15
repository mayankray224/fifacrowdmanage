import { NextResponse } from "next/server";
import { findShortestPath, stadiumFacilities, transitOptions } from "@/lib/ai/stadiumData";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const NavigationQuerySchema = z.object({
  start: z.string().min(3).max(100).transform(val => val.replace(/<[^>]*>/g, "").trim()),
  end: z.string().min(3).max(100).transform(val => val.replace(/<[^>]*>/g, "").trim()),
  accessible: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ),
  language: z.enum([
    "English", "Spanish", "French", "Arabic", 
    "Portuguese", "German", "Japanese", "Hindi", "Hinglish"
  ]).default("English"),
});

const defaultSections = [
  { name: "Gate A (Main North Entrance)", capacity: 15000, currentLoad: 12400, status: "CONGESTED" },
  { name: "Gate B (South Entrance)", capacity: 15000, currentLoad: 3100, status: "NORMAL" },
  { name: "Gate C (East Entry - Step-Free)", capacity: 8000, currentLoad: 1200, status: "NORMAL" },
  { name: "Concourse Level 1", capacity: 25000, currentLoad: 18000, status: "NORMAL" },
  { name: "Concourse Level 2", capacity: 20000, currentLoad: 19500, status: "CONGESTED" },
  { name: "Section 104 (Access Seating)", capacity: 2000, currentLoad: 1900, status: "CONGESTED" },
  { name: "Concession Hub West", capacity: 5000, currentLoad: 4800, status: "BLOCKED" },
  { name: "Concession Hub East", capacity: 5000, currentLoad: 1500, status: "NORMAL" },
  { name: "Main Emergency Route North", capacity: 10000, currentLoad: 0, status: "NORMAL" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate inputs via Zod (OWASP A03:2021 validation)
    const result = NavigationQuerySchema.safeParse({
      start: searchParams.get("start"),
      end: searchParams.get("end"),
      accessible: searchParams.get("accessible"),
      language: searchParams.get("language") || "English",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid query parameters.", details: result.error.format() },
        { status: 400 }
      );
    }

    const { start, end, accessible, language } = result.data;

    // Compute route path using Dijkstra
    const path = findShortestPath(start, end, accessible);
    const estimatedMinutes = accessible ? path.length * 2.2 : path.length * 1.5;

    // Retrieve active facilities and transit rates
    const facilitiesOnRoute = stadiumFacilities.filter(f => path.includes(f.location));
    const transitInfo = transitOptions[start] || [];

    let descriptiveGuide = "";
    const isApiKeyConfigured = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_anthropic_api_key_here";

    if (isApiKeyConfigured) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 500,
          temperature: 0.2,
          system: `You are an expert FIFA World Cup 2026 Stadium Operations Assistant.
Generate clear, step-by-step navigation instructions in the requested language: ${language}.
Always reference:
1. Carbon footprint offsets for transit options (encourage walking/metro).
2. Green recycling/water refilling stations available along the route.
3. Access warnings if 'accessible' is true.`,
          messages: [
            {
              role: "user",
              content: `Create navigation guide from ${start} to ${end}.
Route Path Checkpoints: ${path.join(" -> ")}.
Accessibility Mode: ${accessible ? "ON" : "OFF"}.
Available Facilities along route: ${JSON.stringify(facilitiesOnRoute)}.
Transit Options at origin: ${JSON.stringify(transitInfo)}.
Estimated walking time: ${estimatedMinutes} minutes.`,
            },
          ],
        });

        if (response.content[0].type === "text") {
          descriptiveGuide = response.content[0].text;
        }
      } catch (e) {
        console.error("Claude routing prompt failed. Falling back to local dictionary.", e);
      }
    }

    // Fallback translations dictionary
    if (!descriptiveGuide) {
      const isCongested = defaultSections.some(s => path.includes(s.name) && s.status === "CONGESTED");
      const waterRefill = facilitiesOnRoute.find(f => f.type === "WATER")?.name || "";
      const recycleBin = facilitiesOnRoute.find(f => f.type === "RECYCLING")?.name || "";

      switch (language) {
        case "Spanish":
          descriptiveGuide = `Guía de Navegación de ${start} a ${end}: \n1. Salga de ${start}. \n2. Siga la ruta: ${path.slice(1).join(" -> ")}. \nTiempo estimado: ${estimatedMinutes} min. ${
            accessible ? "Esta ruta es accesible para personas con discapacidad." : ""
          } ${waterRefill ? `\nRecarga agua en: ${waterRefill}` : ""} ${recycleBin ? `\nRecicla en: ${recycleBin}` : ""}`;
          break;
        case "French":
          descriptiveGuide = `Guide de navigation de ${start} à ${end}: \n1. Quitter ${start}. \n2. Suivre: ${path.slice(1).join(" -> ")}. \nTemps estimé: ${estimatedMinutes} min. ${
            accessible ? "Cette route est accessible aux fauteuils roulants." : ""
          } ${waterRefill ? `\nRecharge d'eau: ${waterRefill}` : ""}`;
          break;
        case "Arabic":
          descriptiveGuide = `دليل الملاحة من ${start} إلى ${end}: \n1. الخروج من ${start}. \n2. اتبع المسار: ${path.slice(1).join(" -> ")}. \nالوقت المقدر: ${estimatedMinutes} دقائق. ${
            accessible ? "هذا المسار متاح للكراسي المتحركة." : ""
          }`;
          break;
        case "Portuguese":
          descriptiveGuide = `Guia de navegação de ${start} para ${end}: \n1. Saia de ${start}. \n2. Siga a rota: ${path.slice(1).join(" -> ")}. \nEstimativa: ${estimatedMinutes} min.`;
          break;
        case "German":
          descriptiveGuide = `Wegweiser von ${start} nach ${end}: \n1. Start bei ${start}. \n2. Route folgen: ${path.slice(1).join(" -> ")}. \nZeit: ${estimatedMinutes} Min.`;
          break;
        case "Japanese":
          descriptiveGuide = `${start}から${end}への経路案内: \n1. ${start}を出発します。 \n2. 経路: ${path.slice(1).join(" -> ")}を進みます。 \n所要時間: 約${estimatedMinutes}分。`;
          break;
        case "Hindi":
          descriptiveGuide = `${start} से ${end} का मार्ग दर्शन: \n1. ${start} से प्रस्थान करें। \n2. मार्ग का पालन करें: ${path.slice(1).join(" -> ")}। \nअनुमानित समय: ${estimatedMinutes} मिनट।`;
          break;
        case "Hinglish":
          descriptiveGuide = `Navigating from ${start} to ${end}: \n1. Pehle ${start} se start karein. \n2. Fir follow karein path: ${path.slice(1).join(" -> ")}. \nApprox time: ${estimatedMinutes} mins. ${
            accessible ? "Ramp aur Elevators available hain." : ""
          } ${waterRefill ? `\nWater refill milenge ${waterRefill} par.` : ""}`;
          break;
        default:
          descriptiveGuide = `Navigation guide from ${start} to ${end}: \n1. Exit ${start}. \n2. Follow the path: ${path.slice(1).join(" -> ")}. \nEstimate: ${estimatedMinutes} minutes. ${
            accessible ? "This is a step-free accessible route." : ""
          } ${isCongested ? "Warning: High crowd density detected along the route." : ""}`;
      }
    }

    return NextResponse.json({
      start,
      end,
      accessible,
      path,
      estimatedMinutes,
      descriptiveGuide,
      facilitiesOnRoute,
      transitInfo,
    });
  } catch (error) {
    console.error("Critical navigation route failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Navigation API." },
      { status: 500 }
    );
  }
}
