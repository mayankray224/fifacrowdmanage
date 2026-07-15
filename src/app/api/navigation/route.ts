import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
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

function computeRoute(start: string, end: string, accessible: boolean, sections: any[]) {
  const steps = [start];
  
  if (accessible) {
    steps.push("Gate C (East Entry - Step-Free)");
    steps.push("Access Elevator 2");
  } else {
    steps.push("Concourse Level 1");
  }

  const isWestConcessionBlocked = sections.some(s => s.name === "Concession Hub West" && s.status === "BLOCKED");
  if (isWestConcessionBlocked && end === "Concession Hub West") {
    steps.push("Concession Hub East (Rerouted)");
  } else {
    steps.push(end);
  }

  return {
    path: steps,
    estimatedMinutes: accessible ? steps.length * 2.5 : steps.length * 1.8,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start") || "Gate B (South Entrance)";
    const end = searchParams.get("end") || "Section 104 (Access Seating)";
    const accessible = searchParams.get("accessible") === "true";
    const language = searchParams.get("language") || "English";

    const { path, estimatedMinutes } = computeRoute(start, end, accessible, defaultSections);

    let descriptiveGuide = "";
    const isApiKeyConfigured = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_anthropic_api_key_here";

    if (isApiKeyConfigured) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 400,
          temperature: 0.2,
          system: `You are an expert FIFA World Cup 2026 Stadium Operations Assistant. 
Generate clear, friendly, step-by-step navigation instructions in the requested language: ${language}.
Focus strictly on accessibility constraints if 'accessible' is true. Warn if parts of the route are congested.`,
          messages: [
            {
              role: "user",
              content: `Create navigation steps from ${start} to ${end}. 
Route path: ${path.join(" -> ")}.
Accessible route required: ${accessible}.
Current Section Statuses: ${JSON.stringify(defaultSections)}.
Estimated Time: ${estimatedMinutes} minutes.`,
            },
          ],
        });

        if (response.content[0].type === "text") {
          descriptiveGuide = response.content[0].text;
        }
      } catch (e) {
        console.error("Claude routing prompt failed. Falling back to static generator.", e);
      }
    }

    if (!descriptiveGuide) {
      const isCongested = defaultSections.some(s => path.includes(s.name) && s.status === "CONGESTED");
      
      if (language === "Spanish") {
        descriptiveGuide = `Paso a paso de ${start} a ${end}: \n1. Salga de ${start}. \n2. Siga la ruta: ${path.slice(1).join(" -> ")}. \nEstimado: ${estimatedMinutes} min. ${
          accessible ? "Esta ruta es accesible para personas con movilidad reducida." : ""
        } ${isCongested ? "Advertencia: Se detectó congestión alta." : ""}`;
      } else if (language === "Hinglish") {
        descriptiveGuide = `Navigating from ${start} to ${end}: \n1. Pehle ${start} se start karein. \n2. Fir follow karein path: ${path.slice(1).join(" -> ")}. \nApprox time: ${estimatedMinutes} mins. ${
          accessible ? "Ramp aur Elevators available hain." : ""
        } ${isCongested ? "Caution: Raaste mein thodi bheed (crowd) hai." : ""}`;
      } else {
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
    });
  } catch (error) {
    console.error("Critical navigation route failure:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Navigation API." },
      { status: 500 }
    );
  }
}
