"use client";

import React, { useState, useEffect } from "react";
import { useStadiumStore } from "@/store/useStadiumStore";
import { Navigation, Volume2, Landmark, ArrowRight, AlertTriangle } from "lucide-react";
import AnnounceBox from "@/components/shared/AnnounceBox";
import Link from "next/link";

export default function FifaNavigation() {
  const { user, currentLocation, accessibleRequired, stadiumSections } = useStadiumStore();

  const [destination, setDestination] = useState("Section 104 (Access Seating)");
  const [routeInfo, setRouteInfo] = useState<{
    path: string[];
    estimatedMinutes: number;
    descriptiveGuide: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [speakSupported, setSpeakSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeakSupported(true);
    }
  }, []);

  const handleSpeak = () => {
    if (!routeInfo || !speakSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(routeInfo.descriptiveGuide);
    utterance.lang = user?.language === "Spanish" ? "es-ES" : "en-US";
    window.speechSynthesis.speak(utterance);
    setAnnouncement("Playing audio guidance.");
  };

  const handleFetchRoute = async () => {
    setLoading(true);
    setAnnouncement("Calculating route...");
    try {
      const res = await fetch(
        `/api/navigation?start=${encodeURIComponent(
          currentLocation
        )}&end=${encodeURIComponent(destination)}&accessible=${accessibleRequired}&language=${
          user?.language || "English"
        }`
      );
      const data = await res.json();
      if (data.error) {
        setAnnouncement("Failed to fetch route.");
      } else {
        setRouteInfo(data);
        setAnnouncement(`Route calculated. Estimated time is ${data.estimatedMinutes} minutes.`);
      }
    } catch (e) {
      setAnnouncement("Failed to communicate with navigation server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRoute();
  }, [currentLocation, destination, accessibleRequired]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 font-inter select-none relative">
      <AnnounceBox message={announcement} />

      {/* Main Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="text-emerald-400" size={20} />
          <span className="font-semibold text-lg tracking-wider">
            FIFA <span className="text-emerald-400">CROWDFLOW</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
            Host Cities: Seattle | Vancouver | Guadalajara | Miami
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
            🇺🇸 🇨🇦 🇲🇽 WC 26
          </span>
          <span>Role: <strong className="text-emerald-400">{user?.role || "FAN"}</strong></span>
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            Reset
          </Link>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Control Panel */}
        <section className="lg:col-span-1 space-y-6">
          <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-md font-bold tracking-wider text-emerald-400 font-mono uppercase">
              Navigation Setup
            </h2>

            {/* Start Location Input */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                Your Current Location
              </span>
              <div className="bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-300">
                {currentLocation}
              </div>
            </div>

            {/* Destination Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dest-select" className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                Destination Zone
              </label>
              <select
                id="dest-select"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/45 focus:border-emerald-400 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white cursor-pointer transition-colors duration-200"
              >
                {stadiumSections
                  .filter((s) => s.name !== currentLocation)
                  .map((sec) => (
                    <option key={sec.id} value={sec.name}>
                      {sec.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Accessibility Tag Alert */}
            {accessibleRequired && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Landmark size={14} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold">
                  Step-free pathing active. Elevator transfers selected.
                </span>
              </div>
            )}
          </div>

          {/* Guide steps */}
          <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-md font-bold tracking-wider uppercase font-mono text-white">
                AI Routing Agent
              </h2>
              {speakSupported && routeInfo && (
                <button
                  onClick={handleSpeak}
                  aria-label="Listen to directions"
                  className="p-2 border border-slate-800 hover:border-emerald-400 hover:text-emerald-400 rounded-full transition-colors duration-300 cursor-pointer"
                >
                  <Volume2 size={14} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-500 font-mono">Routing...</span>
              </div>
            ) : routeInfo ? (
              <div className="space-y-4 text-left">
                <div className="flex gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-emerald-500/20">
                    Est. Time: {routeInfo.estimatedMinutes} Mins
                  </span>
                  <span className="bg-slate-950 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-800">
                    Distance: {routeInfo.path.length * 90}m
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 border border-slate-850 rounded-xl whitespace-pre-line">
                  {routeInfo.descriptiveGuide}
                </p>

                {/* Path blocks */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                    Target Path Checkpoints
                  </span>
                  <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                    {routeInfo.path.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-slate-850 text-slate-400 rounded-full flex items-center justify-center text-[8px] border border-slate-800">
                          {idx + 1}
                        </span>
                        <span className={idx === routeInfo.path.length - 1 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                          {p}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No route configured.</p>
            )}
          </div>
        </section>

        {/* Right Dynamic Map View */}
        <section className="lg:col-span-2 space-y-6">
          <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-bold tracking-wider uppercase font-mono text-white">
                Stadium Floor Layout
              </h2>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry
              </span>
            </div>

            {/* Stadium Grid Mock */}
            <div className="flex-1 border border-slate-800 bg-slate-950 rounded-xl relative p-4 flex items-center justify-center overflow-hidden min-h-[300px]">
              <div className="absolute inset-4 border border-dashed border-slate-800/60 rounded-lg pointer-events-none" />
              
              {/* Layout Nodes */}
              <div className="grid grid-cols-3 gap-6 w-full max-w-md relative z-10">
                {stadiumSections.map((sec) => {
                  const isCurrent = sec.name === currentLocation;
                  const isDest = sec.name === destination;
                  const isCongested = sec.status === "CONGESTED";
                  const isBlocked = sec.status === "BLOCKED";
                  
                  let borderStyle = "border-slate-800 bg-slate-900/40";
                  if (isCurrent) borderStyle = "border-emerald-400 bg-emerald-500/5 text-emerald-400 shadow-md";
                  if (isDest) borderStyle = "border-sky-400 bg-sky-500/5 text-sky-400 shadow-md";
                  if (isCongested) borderStyle = "border-amber-500 bg-amber-500/5 text-amber-500";
                  if (isBlocked) borderStyle = "border-red-500 bg-red-500/5 text-red-500";

                  return (
                    <div
                      key={sec.id}
                      className={`p-3 border rounded-xl flex flex-col justify-between text-center transition-all duration-300 min-h-[75px] ${borderStyle}`}
                    >
                      <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                        {isCurrent ? "CURRENT" : isDest ? "TARGET" : sec.status}
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-white truncate px-1">
                        {sec.name.split(" ")[0]} {sec.name.split(" ")[1] || ""}
                      </span>
                      <div className="text-[8px] font-mono text-slate-400 mt-1">
                        {(sec.currentLoad / sec.capacity * 100).toFixed(0)}% Load
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map instructions overlay */}
              <div className="absolute bottom-3 left-4 flex gap-3 text-[9px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-400" /> Target</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> Congested / Blocked</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
