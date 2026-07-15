// Spatial layout and facility data for the FIFA World Cup 2026 stadium

export interface StadiumFacility {
  name: string;
  type: "WATER" | "RECYCLING" | "FIRST_AID" | "ELEVATOR" | "TRANSIT";
  location: string;
}

export interface TransitOption {
  mode: string; // Metro, Bus, Rideshare, Walking
  name: string;
  carbonRateKgPerKm: number;
  estDistanceKm: number;
}

export const stadiumFacilities: StadiumFacility[] = [
  { name: "Eco Water Refill North", type: "WATER", location: "Concourse Level 1" },
  { name: "Eco Water Refill South", type: "WATER", location: "Concourse Level 2" },
  { name: "Green Recycling Station A", type: "RECYCLING", location: "Gate A (Main North Entrance)" },
  { name: "Green Recycling Station B", type: "RECYCLING", location: "Gate B (South Entrance)" },
  { name: "Emergency Medical Bay 1", type: "FIRST_AID", location: "Concourse Level 1" },
  { name: "Accessibility Elevator 1", type: "ELEVATOR", location: "Gate C (East Entry - Step-Free)" },
  { name: "Accessibility Elevator 2", type: "ELEVATOR", location: "Section 104 (Access Seating)" },
  { name: "Metro Line 1 Terminal", type: "TRANSIT", location: "Gate B (South Entrance)" },
  { name: "Shuttle Bus Hub North", type: "TRANSIT", location: "Gate A (Main North Entrance)" },
];

export const transitOptions: Record<string, TransitOption[]> = {
  "Gate A (Main North Entrance)": [
    { mode: "Shuttle Bus", name: "Shuttle Zone North", carbonRateKgPerKm: 0.08, estDistanceKm: 4.5 },
    { mode: "Rideshare", name: "Rideshare Zone North", carbonRateKgPerKm: 0.15, estDistanceKm: 6.0 },
    { mode: "Walking", name: "Walking Pathway North", carbonRateKgPerKm: 0.0, estDistanceKm: 1.5 },
  ],
  "Gate B (South Entrance)": [
    { mode: "Metro", name: "World Cup Stadium Metro Station", carbonRateKgPerKm: 0.04, estDistanceKm: 8.2 },
    { mode: "Rideshare", name: "Rideshare Zone South", carbonRateKgPerKm: 0.15, estDistanceKm: 6.0 },
    { mode: "Walking", name: "Walking Pathway South", carbonRateKgPerKm: 0.0, estDistanceKm: 2.0 },
  ],
  "Gate C (East Entry - Step-Free)": [
    { mode: "Metro", name: "World Cup Stadium Metro Station (Accessible Route)", carbonRateKgPerKm: 0.04, estDistanceKm: 8.4 },
    { mode: "Walking", name: "Wheelchair-Accessible Flat Path", carbonRateKgPerKm: 0.0, estDistanceKm: 1.2 },
  ],
};

// Graph adjacency list representing connections in the stadium
export const stadiumGraph: Record<string, string[]> = {
  "Gate A (Main North Entrance)": ["Concourse Level 1", "Concourse Level 2"],
  "Gate B (South Entrance)": ["Concourse Level 1", "Concession Hub East"],
  "Gate C (East Entry - Step-Free)": ["Accessibility Elevator 1", "Concourse Level 1"],
  "Accessibility Elevator 1": ["Gate C (East Entry - Step-Free)", "Section 104 (Access Seating)", "Accessibility Elevator 2"],
  "Concourse Level 1": ["Gate A (Main North Entrance)", "Gate B (South Entrance)", "Gate C (East Entry - Step-Free)", "Concession Hub West", "Concession Hub East"],
  "Concourse Level 2": ["Gate A (Main North Entrance)", "Section 104 (Access Seating)", "Concession Hub West"],
  "Section 104 (Access Seating)": ["Concourse Level 2", "Accessibility Elevator 2"],
  "Accessibility Elevator 2": ["Section 104 (Access Seating)", "Accessibility Elevator 1"],
  "Concession Hub West": ["Concourse Level 1", "Concourse Level 2"],
  "Concession Hub East": ["Concourse Level 1", "Gate B (South Entrance)"],
  "Main Emergency Route North": ["Gate A (Main North Entrance)", "Concourse Level 1"],
};

// Simple BFS pathfinder to ensure shortest route under constraints
export function findShortestPath(start: string, end: string, accessibleOnly = false): string[] {
  if (start === end) return [start];
  
  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === end) return path;

    const neighbors = stadiumGraph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // Accessibility filter: force step-free paths if accessibleOnly is true
        if (accessibleOnly) {
          const isStairRoute = (node.includes("Level 2") || neighbor.includes("Level 2")) && 
                              !(node.includes("Elevator") || neighbor.includes("Elevator"));
          if (isStairRoute) continue;
        }

        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [start, end]; // Fallback
}
