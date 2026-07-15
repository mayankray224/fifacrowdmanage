"use client";

import React, { useState, useEffect } from "react";
import { useStadiumStore, FifaStadiumSection } from "@/store/useStadiumStore";
import { ShieldAlert, Users, Landmark, PlusCircle, CheckCircle, RefreshCw, Send, Compass, AlertTriangle, Eye, Shield, Activity } from "lucide-react";
import AnnounceBox from "@/components/shared/AnnounceBox";
import Link from "next/link";

export default function FifaOperationsDashboard() {
  const { 
    stadiumSections, 
    dispatches, 
    setDispatches, 
    addDispatch,
    setStadiumSections
  } = useStadiumStore();

  const [incidents, setIncidents] = useState<any[]>([
    { id: "inc_1", type: "CROWD_BOTTLENECK", location: "Gate A (Main North Entrance)", description: "Extreme load buildup at turnstile scanners.", severity: "CRITICAL" },
    { id: "inc_2", type: "ACCESSIBILITY_BARRIER", location: "Section 104 Lift", description: "Elevator 2 offline. Wheelchair transfers delayed.", severity: "HIGH" },
    { id: "inc_3", type: "MEDICAL", location: "Concourse Level 2 West", description: "Heat exhaustion reported near concession stand.", severity: "MEDIUM" },
  ]);

  const [loading, setLoading] = useState(false);
  const [taskDetails, setTaskDetails] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState("usr_v101");
  const [dispatchType, setDispatchType] = useState<"VOLUNTEER" | "MEDICAL" | "SECURITY" | "ACCESS">("VOLUNTEER");
  const [announcement, setAnnouncement] = useState("");
  const [highContrast, setHighContrast] = useState(false);

  // Simulation Controls: dynamically scale individual section loads
  const handleLoadSimulation = (sectionId: string, newLoadPercent: number) => {
    const updated = stadiumSections.map((sec) => {
      if (sec.id === sectionId) {
        const currentLoad = Math.round(sec.capacity * (newLoadPercent / 100));
        let status: FifaStadiumSection["status"] = "NORMAL";
        if (newLoadPercent > 90) status = "EMERGENCY";
        else if (newLoadPercent > 75) status = "CONGESTED";
        else if (newLoadPercent > 50) status = "NORMAL";
        return { ...sec, currentLoad, status };
      }
      return sec;
    });
    setStadiumSections(updated);
    setAnnouncement(`Simulating load on section. Load is now ${newLoadPercent}%.`);
  };

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operations/dispatch");
      const data = await res.json();
      if (data.dispatches) {
        setDispatches(data.dispatches);
      }
    } catch (e) {
      setAnnouncement("Failed to retrieve live dispatches.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDetails.trim()) return;

    const tempDispatchId = "dsp_" + Math.random().toString(36).substr(2, 9);
    const mockNewDispatch = {
      id: tempDispatchId,
      volunteerId: selectedVolunteer,
      taskDetails: `[${dispatchType}] ${taskDetails}`,
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      volunteer: {
        id: selectedVolunteer,
        name: `Responder Unit #${selectedVolunteer.split("_v")[1] || "101"}`,
        email: `${selectedVolunteer}@worldcup.com`,
        role: "VOLUNTEER" as const,
        language: "English",
      }
    };

    // Optimistically update UI
    addDispatch(mockNewDispatch);
    setTaskDetails("");
    setAnnouncement(`Task dispatched successfully to ${selectedVolunteer}.`);

    try {
      const res = await fetch("/api/operations/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: selectedVolunteer,
          taskDetails: `[${dispatchType}] ${taskDetails}`,
        }),
      });

      if (res.ok) {
        const serverDispatch = await res.json();
        setDispatches(
          useStadiumStore.getState().dispatches.map((d) =>
            d.id === tempDispatchId ? serverDispatch : d
          )
        );
      }
    } catch (error) {
      console.warn("API sync failed. Keeping optimistic dispatch in store.", error);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const bgClass = highContrast ? "bg-black text-white" : "bg-slate-950 text-white";
  const cardClass = highContrast ? "border-4 border-white bg-black" : "border border-slate-800 bg-slate-900/90";
  const innerBgClass = highContrast ? "bg-black border-2 border-white" : "bg-slate-950 border border-slate-850";
  const textAlertClass = highContrast ? "text-yellow-400 font-extrabold" : "text-emerald-400";
  const btnClass = highContrast 
    ? "bg-white text-black font-extrabold border-4 border-black hover:bg-yellow-400" 
    : "bg-emerald-500 text-slate-950 hover:bg-transparent border border-emerald-500 hover:text-emerald-400";

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-6 font-inter no-scrollbar relative select-none transition-colors duration-300`}>
      <AnnounceBox message={announcement} />

      {/* Header */}
      <header className={`max-w-6xl mx-auto flex justify-between items-center pb-4 border-b ${highContrast ? "border-white" : "border-slate-800"} mb-6`}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-emerald-400 animate-pulse" size={20} />
          <span className="font-semibold text-lg tracking-wider">
            FIFA <span className="text-emerald-400">CONTROL CENTER</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
            Command Dashboard • Host Cities: LA | Dallas | Toronto | CDMX
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setHighContrast(!highContrast)}
            aria-label="Toggle High Contrast Mode"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              highContrast ? "bg-white text-black border-white" : "border-slate-850 bg-slate-900 hover:border-slate-700"
            }`}
          >
            <Eye size={14} />
            <span>Contrast</span>
          </button>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
            🇺🇸 🇨🇦 🇲🇽 WC 26
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            OPERATOR SECURE SESSION
          </span>
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            Exit Hub
          </Link>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Density Telemetry & Alert Centers */}
        <section className="lg:col-span-1 space-y-6">
          <div className={`${cardClass} rounded-2xl p-5 shadow-lg space-y-4`}>
            <h2 className={`text-md font-bold tracking-wider flex items-center gap-2 uppercase font-mono ${textAlertClass}`}>
              <Users size={16} /> Stadium Section Density
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {stadiumSections.map((sec) => {
                const loadPercent = Math.round((sec.currentLoad / sec.capacity) * 100);
                let barColor = "bg-emerald-500";
                if (sec.status === "CONGESTED") barColor = "bg-amber-500";
                if (sec.status === "EMERGENCY" || sec.status === "BLOCKED") barColor = "bg-red-500";

                return (
                  <div key={sec.id} className={`${innerBgClass} p-3 rounded-xl space-y-1.5`}>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white font-bold">{sec.name.split(" (")[0]}</span>
                      <span className={sec.status !== "NORMAL" ? "text-amber-400 font-bold" : "text-slate-400"}>
                        {sec.status}
                      </span>
                    </div>

                    {/* Simulation Slider Control */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${loadPercent}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
                        <label htmlFor={`slider-${sec.id}`} className="sr-only">Simulate load for {sec.name}</label>
                        <input
                          id={`slider-${sec.id}`}
                          type="range"
                          min="10"
                          max="100"
                          value={loadPercent}
                          onChange={(e) => handleLoadSimulation(sec.id, Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-450"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>Load: {sec.currentLoad.toLocaleString()}</span>
                      <span>Cap: {sec.capacity.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Incidents Alerts */}
          <div className={`${cardClass} rounded-2xl p-5 shadow-lg space-y-4`}>
            <h2 className="text-md font-bold tracking-wider text-red-400 flex items-center gap-2 uppercase font-mono">
              <AlertTriangle size={16} /> Active Alerts
            </h2>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-3 border border-red-500/20 bg-red-500/5 rounded-xl space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-red-400 font-bold">{inc.type}</span>
                    <span className="px-2 py-0.5 bg-red-500/10 rounded text-red-500 font-bold">{inc.severity}</span>
                  </div>
                  <p className="text-xs font-bold text-white">{inc.location}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{inc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Center/Right Column: Dispatcher Terminal */}
        <section className="lg:col-span-2 space-y-6">
          <div className={`${cardClass} rounded-2xl p-5 shadow-lg space-y-4 min-h-[400px] flex flex-col justify-between`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-md font-bold tracking-wider flex items-center gap-2 uppercase font-mono ${textAlertClass}`}>
                  <Send size={16} /> Operations Dispatch Desk
                </h2>
                <button
                  onClick={fetchDispatches}
                  className="p-2 border border-slate-800 hover:border-emerald-400 hover:text-emerald-400 rounded-full transition-colors duration-300 cursor-pointer"
                  title="Refresh status logs"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleCreateDispatch} className={`${innerBgClass} p-4 rounded-xl space-y-4 mb-6`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Select Volunteer Unit */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="vol-select" className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                      Select Unit
                    </label>
                    <select
                      id="vol-select"
                      value={selectedVolunteer}
                      onChange={(e) => setSelectedVolunteer(e.target.value)}
                      className={`w-full ${innerBgClass} focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer`}
                    >
                      <option value="usr_v101">Volunteer Unit #101 (North)</option>
                      <option value="usr_v102">Volunteer Unit #102 (South)</option>
                      <option value="usr_v103">Volunteer Unit #103 (East)</option>
                    </select>
                  </div>

                  {/* Select Dispatch Type */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="type-select" className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                      Dispatch Category
                    </label>
                    <select
                      id="type-select"
                      value={dispatchType}
                      onChange={(e) => setDispatchType(e.target.value as any)}
                      className={`w-full ${innerBgClass} focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer`}
                    >
                      <option value="VOLUNTEER">Crowd Flow / Directing</option>
                      <option value="MEDICAL">Medical Emergency (First Aid)</option>
                      <option value="SECURITY">Security / Alert Resolution</option>
                      <option value="ACCESS">Accessibility Barrier Support</option>
                    </select>
                  </div>

                  {/* Task Instructions */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-input" className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                      Task Assignment Details
                    </label>
                    <input
                      id="task-input"
                      type="text"
                      value={taskDetails}
                      onChange={(e) => setTaskDetails(e.target.value)}
                      placeholder="e.g. Assist wheelchair transfer at Lift 2"
                      className={`w-full ${innerBgClass} focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white`}
                    />
                  </div>

                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-md ${btnClass}`}
                  >
                    <Send size={12} /> Dispatch Unit
                  </button>
                </div>
              </form>
            </div>

            {/* List of active tasks */}
            <div className="flex-1 space-y-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block border-b border-slate-800 pb-1">
                Active Volunteer Dispatch Tasks
              </span>
              
              {loading && dispatches.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  Loading dispatches...
                </div>
              ) : dispatches.length > 0 ? (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {dispatches.map((d) => {
                    const isMedical = d.taskDetails.startsWith("[MEDICAL]");
                    const isSecurity = d.taskDetails.startsWith("[SECURITY]");
                    const isAccess = d.taskDetails.startsWith("[ACCESS]");
                    
                    let icon = <Compass size={12} />;
                    if (isMedical) icon = <Activity size={12} className="text-red-400" />;
                    if (isSecurity) icon = <Shield size={12} className="text-amber-400" />;
                    if (isAccess) icon = <Landmark size={12} className="text-sky-400" />;

                    return (
                      <div key={d.id} className={`flex justify-between items-center p-3.5 border rounded-xl ${innerBgClass}`}>
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold">
                            {icon}
                            <span>Task ID: {d.id.substring(0, 8)} • Assigned to: {d.volunteer?.name || d.volunteerId}</span>
                          </div>
                          <p className="text-xs text-white font-bold leading-snug">{d.taskDetails}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono font-bold text-emerald-400 uppercase">
                          {d.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-slate-800 rounded-xl flex flex-col justify-center items-center text-slate-500">
                  <Compass size={24} className="animate-spin text-slate-700 mb-2" style={{ animationDuration: "20s" }} />
                  <p className="text-xs italic">No active dispatches. Assign tasks above to dispatch volunteer units.</p>
                </div>
              )}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
