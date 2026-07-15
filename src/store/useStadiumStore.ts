import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FifaUser {
  id: string;
  role: "FAN" | "VOLUNTEER" | "ORGANIZER";
  email: string;
  name: string;
  language: string;
}

export interface FifaStadiumSection {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  status: "NORMAL" | "CONGESTED" | "BLOCKED" | "EMERGENCY";
}

export interface FifaDispatch {
  id: string;
  volunteerId: string;
  taskDetails: string;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  volunteer?: FifaUser;
}

export interface FifaIncident {
  id: string;
  reporterId: string;
  type: "CROWD_BOTTLENECK" | "MEDICAL" | "ACCESSIBILITY_BARRIER" | "SECURITY_ALERT";
  location: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
}

interface StadiumStoreState {
  user: FifaUser | null;
  isAuthenticated: boolean;
  currentLocation: string; // e.g. "Gate B (South Entrance)"
  accessibleRequired: boolean;
  stadiumSections: FifaStadiumSection[];
  dispatches: FifaDispatch[];
  incidents: FifaIncident[];
  
  // Actions
  setUser: (user: FifaUser | null) => void;
  setAuthenticated: (auth: boolean) => void;
  updateLocation: (loc: string) => void;
  setAccessibility: (req: boolean) => void;
  setStadiumSections: (sections: FifaStadiumSection[]) => void;
  setDispatches: (dispatches: FifaDispatch[]) => void;
  setIncidents: (incidents: FifaIncident[]) => void;
  addIncident: (incident: FifaIncident) => void;
  addDispatch: (dispatch: FifaDispatch) => void;
  updateDispatchStatus: (id: string, status: FifaDispatch["status"]) => void;
  resetAll: () => void;
}

const mockSections: FifaStadiumSection[] = [
  { id: "sec_1", name: "Gate A (Main North Entrance)", capacity: 15000, currentLoad: 12400, status: "CONGESTED" },
  { id: "sec_2", name: "Gate B (South Entrance)", capacity: 15000, currentLoad: 3100, status: "NORMAL" },
  { id: "sec_3", name: "Gate C (East Entry - Step-Free)", capacity: 8000, currentLoad: 1200, status: "NORMAL" },
  { id: "sec_4", name: "Concourse Level 1", capacity: 25000, currentLoad: 18000, status: "NORMAL" },
  { id: "sec_5", name: "Concourse Level 2", capacity: 20000, currentLoad: 19500, status: "CONGESTED" },
  { id: "sec_6", name: "Section 104 (Access Seating)", capacity: 2000, currentLoad: 1900, status: "CONGESTED" },
  { id: "sec_7", name: "Concession Hub West", capacity: 5000, currentLoad: 4800, status: "BLOCKED" },
  { id: "sec_8", name: "Concession Hub East", capacity: 5000, currentLoad: 1500, status: "NORMAL" },
  { id: "sec_9", name: "Main Emergency Route North", capacity: 10000, currentLoad: 0, status: "NORMAL" },
];

export const useStadiumStore = create<StadiumStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentLocation: "Gate B (South Entrance)",
      accessibleRequired: false,
      stadiumSections: mockSections,
      dispatches: [],
      incidents: [],

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      updateLocation: (currentLocation) => set({ currentLocation }),
      setAccessibility: (accessibleRequired) => set({ accessibleRequired }),
      setStadiumSections: (stadiumSections) => set({ stadiumSections }),
      setDispatches: (dispatches) => set({ dispatches }),
      setIncidents: (incidents) => set({ incidents }),
      addIncident: (incident) =>
        set((state) => ({ incidents: [incident, ...state.incidents] })),
      addDispatch: (dispatch) =>
        set((state) => ({ dispatches: [dispatch, ...state.dispatches] })),
      updateDispatchStatus: (id, status) =>
        set((state) => ({
          dispatches: state.dispatches.map((d) =>
            d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d
          ),
        })),
      resetAll: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentLocation: "Gate B (South Entrance)",
          accessibleRequired: false,
          stadiumSections: mockSections,
          dispatches: [],
          incidents: [],
        }),
    }),
    {
      name: "fifa-stadium-store",
    }
  )
);
