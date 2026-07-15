import { describe, it, expect, beforeEach } from "vitest";
import { useStadiumStore } from "./useStadiumStore";

describe("useStadiumStore", () => {
  beforeEach(() => {
    useStadiumStore.getState().resetAll();
  });

  it("should initialize with default sections and empty collections", () => {
    const state = useStadiumStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.stadiumSections.length).toBeGreaterThan(0);
    expect(state.dispatches.length).toBe(0);
    expect(state.incidents.length).toBe(0);
  });

  it("should successfully set user profile and authentication state", () => {
    useStadiumStore.getState().setUser({
      id: "usr_v1",
      name: "Juan Perez",
      email: "juan@worldcup.com",
      role: "VOLUNTEER",
      language: "Spanish",
    });

    const state = useStadiumStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe("Juan Perez");
    expect(state.user?.role).toBe("VOLUNTEER");
  });

  it("should update location and accessibility parameters correctly", () => {
    useStadiumStore.getState().updateLocation("Gate A (Main North Entrance)");
    useStadiumStore.getState().setAccessibility(true);

    const state = useStadiumStore.getState();
    expect(state.currentLocation).toBe("Gate A (Main North Entrance)");
    expect(state.accessibleRequired).toBe(true);
  });

  it("should add dispatches and manage status updates", () => {
    const mockDispatch = {
      id: "dsp_1",
      volunteerId: "usr_v1",
      taskDetails: "Help wheelchair user at lift 1",
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useStadiumStore.getState().addDispatch(mockDispatch);
    expect(useStadiumStore.getState().dispatches.length).toBe(1);

    useStadiumStore.getState().updateDispatchStatus("dsp_1", "COMPLETED");
    const updated = useStadiumStore.getState().dispatches.find(d => d.id === "dsp_1");
    expect(updated?.status).toBe("COMPLETED");
  });
});
