import { NextResponse } from "next/server";

// Module level state holding active dispatches and incidents
const activeDispatches: any[] = [];
const activeIncidents = [
  { id: "inc_1", type: "CROWD_BOTTLENECK", location: "Gate A (Main North Entrance)", description: "Extreme load buildup at turnstile scanners.", severity: "CRITICAL" },
  { id: "inc_2", type: "ACCESSIBILITY_BARRIER", location: "Section 104 Lift", description: "Elevator 2 offline. Wheelchair transfers delayed.", severity: "HIGH" },
  { id: "inc_3", type: "MEDICAL", location: "Concourse Level 2 West", description: "Heat exhaustion reported near concession stand.", severity: "MEDIUM" },
];

export async function GET() {
  try {
    return NextResponse.json({
      dispatches: activeDispatches,
      incidents: activeIncidents,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read dispatches and incidents." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { volunteerId, taskDetails } = body;

    if (!volunteerId || !taskDetails) {
      return NextResponse.json(
        { error: "volunteerId and taskDetails are required" },
        { status: 400 }
      );
    }

    const newDispatch = {
      id: "dsp_" + Math.random().toString(36).substr(2, 9),
      volunteerId,
      taskDetails,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      volunteer: {
        id: volunteerId,
        name: `Volunteer Unit ${volunteerId.split("_")[1] || volunteerId}`,
        email: `${volunteerId}@worldcup.com`,
        role: "VOLUNTEER",
      },
    };

    activeDispatches.unshift(newDispatch);

    return NextResponse.json(newDispatch, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create dispatch task." },
      { status: 500 }
    );
  }
}
