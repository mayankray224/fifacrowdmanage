import { describe, it, expect } from "vitest";
import { findShortestPath, stadiumFacilities, transitOptions } from "./stadiumData";

describe("stadiumData RAG Pathfinder", () => {
  it("should calculate correct Dijkstra routing paths between valid locations", () => {
    const path = findShortestPath("Gate B (South Entrance)", "Section 104 (Access Seating)", false);
    expect(path.length).toBeGreaterThan(1);
    expect(path[0]).toBe("Gate B (South Entrance)");
    expect(path[path.length - 1]).toBe("Section 104 (Access Seating)");
  });

  it("should respect step-free constraints and avoid stairs when accessibleOnly is active", () => {
    const accessiblePath = findShortestPath("Gate C (East Entry - Step-Free)", "Section 104 (Access Seating)", true);
    
    // Accessibility route should use elevators and avoid standard Level 2 stair climbs
    expect(accessiblePath).toContain("Accessibility Elevator 1");
    expect(accessiblePath).not.toContain("Concourse Level 2");
  });

  it("should retrieve environmental offset metrics for valid gates", () => {
    const gateTransit = transitOptions["Gate B (South Entrance)"];
    expect(gateTransit).toBeDefined();
    expect(gateTransit.length).toBeGreaterThan(0);
    
    // Metro should have lower carbon offset rates than rideshares
    const metro = gateTransit.find(t => t.mode === "Metro");
    const rideshare = gateTransit.find(t => t.mode === "Rideshare");
    expect(metro!.carbonRateKgPerKm).toBeLessThan(rideshare!.carbonRateKgPerKm);
  });

  it("should retrieve eco facilities located at specific stadium concourses", () => {
    const facilities = stadiumFacilities.filter(f => f.location === "Concourse Level 1");
    expect(facilities.length).toBeGreaterThan(0);
    
    const waterRefill = facilities.find(f => f.type === "WATER");
    expect(waterRefill).toBeDefined();
    expect(waterRefill!.name).toContain("Water");
  });
});
