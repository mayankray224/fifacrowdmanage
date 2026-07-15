"use client";

import React, { useState, useEffect } from "react";
import { useStadiumStore } from "@/store/useStadiumStore";
import { Navigation, Volume2, Landmark, Globe, Leaf, Eye, RotateCw, AlertTriangle, ZoomIn, ZoomOut, CheckCircle } from "lucide-react";
import AnnounceBox from "@/components/shared/AnnounceBox";
import Link from "next/link";

export default function FifaNavigation() {
  const { user, currentLocation, accessibleRequired, stadiumSections, setUser } = useStadiumStore();

  const [destination, setDestination] = useState("Section 104 (Access Seating)");
  const [routeInfo, setRouteInfo] = useState<{
    path: string[];
    estimatedMinutes: number;
    descriptiveGuide: string;
    facilitiesOnRoute: Array<{ name: string; type: string; location: string }>;
    transitInfo: Array<{ mode: string; name: string; carbonRateKgPerKm: number; estDistanceKm: number }>;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [speakSupported, setSpeakSupported] = useState(false);

  // Accessibility States (WCAG 2.2 AA)
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1.0); // 0.9 to 1.3 range

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeakSupported(true);
    }
  }, []);

  const handleSpeak = () => {
    if (!routeInfo || !speakSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(routeInfo.descriptiveGuide);
    
    // Auto detect language codes
    const lang = user?.language || "English";
    let code = "en-US";
    if (lang === "Spanish") code = "es-ES";
    if (lang === "French") code = "fr-FR";
    if (lang === "German") code = "de-DE";
    if (lang === "Portuguese") code = "pt-PT";
    if (lang === "Arabic") code = "ar-AE";
    if (lang === "Japanese") code = "ja-JP";
    if (lang === "Hindi" || lang === "Hinglish") code = "hi-IN";

    utterance.lang = code;
    window.speechSynthesis.speak(utterance);
    setAnnouncement("Playing audio navigation guide.");
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
        setAnnouncement(`Route updated. Estimated time is ${data.estimatedMinutes} minutes.`);
      }
    } catch (e) {
      setAnnouncement("Failed to communicate with navigation server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRoute();
  }, [currentLocation, destination, accessibleRequired, user?.language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user) {
      setUser({ ...user, language: e.target.value });
    }
  };

  // Adjust theme variables based on highContrast mode
  const bgClass = highContrast ? "bg-black text-white" : "bg-slate-950 text-white";
  const cardClass = highContrast ? "border-4 border-white bg-black" : "border border-slate-800 bg-slate-900/90";
  const innerBgClass = highContrast ? "bg-black border-2 border-white" : "bg-slate-950 border border-slate-850";
  const primaryTextClass = highContrast ? "text-yellow-400 font-extrabold" : "text-emerald-400 font-semibold";
  const accentTextClass = highContrast ? "text-cyan-300 font-bold" : "text-sky-400";
  const btnClass = highContrast 
    ? "bg-white text-black font-extrabold border-4 border-black hover:bg-yellow-400" 
    : "bg-emerald-500 text-slate-950 hover:text-emerald-400 hover:bg-transparent border border-emerald-500";

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-6 font-inter transition-colors duration-300 select-none relative`} style={{ fontSize: `${fontScale}rem` }}>
      <AnnounceBox message={announcement} />

      {/* Main Header */}
      <header className={`max-w-6xl mx-auto flex flex-wrap justify-between items-center pb-4 border-b ${highContrast ? "border-white" : "border-slate-800"} mb-6 gap-4`}>
        <div className="flex items-center gap-3">
          <Navigation className={primaryTextClass} size={24} />
          <span className="font-bold text-xl tracking-wider">
            FIFA <span className={primaryTextClass}>CROWDFLOW</span>
          </span>
          <span className={`hidden md:inline-block text-xs font-mono ${highContrast ? "text-white" : "text-slate-500"}`}>
            Host Cities: Seattle | Vancouver | Guadalajara | Miami
          </span>
        </div>

        {/* Accessibility & Language Bar */}
        <div className="flex items-center flex-wrap gap-3 text-xs font-mono">
          {/* Contrast Mode Toggle */}
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

          {/* Font Scaling Buttons */}
          <div className={`flex items-center border rounded-lg overflow-hidden ${highContrast ? "border-white" : "border-slate-850"}`}>
            <button
              onClick={() => setFontScale(prev => Math.max(0.9, prev - 0.1))}
              aria-label="Decrease Font Size"
              className={`p-1.5 cursor-pointer ${highContrast ? "bg-black text-white hover:bg-white hover:text-black" : "bg-slate-900 hover:bg-slate-800"}`}
            >
              <ZoomOut size={13} />
            </button>
            <span className={`px-2 text-[10px] font-bold ${highContrast ? "bg-black" : "bg-slate-950"}`}>
              {Math.round(fontScale * 100)}%
            </span>
            <button
              onClick={() => setFontScale(prev => Math.min(1.3, prev + 0.1))}
              aria-label="Increase Font Size"
              className={`p-1.5 cursor-pointer ${highContrast ? "bg-black text-white hover:bg-white hover:text-black" : "bg-slate-900 hover:bg-slate-800"}`}
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1">
            <Globe size={13} className={accentTextClass} />
            <select
              value={user?.language || "English"}
              onChange={handleLanguageChange}
              aria-label="Change translation language"
              className={`bg-slate-900 border rounded px-2 py-1 text-xs cursor-pointer ${highContrast ? "border-white text-white bg-black" : "border-slate-800 text-slate-300"}`}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="Arabic">Arabic (العربية)</option>
              <option value="Portuguese">Portuguese (Português)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Japanese">Japanese (日本語)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>

          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
            🇺🇸 🇨🇦 🇲🇽 WC 26
          </span>
          <Link
            href="/"
            className={`text-slate-400 hover:text-white transition-colors duration-200 ${highContrast && "underline text-white"}`}
          >
            Reset
          </Link>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Control Panel */}
        <section className="lg:col-span-1 space-y-6">
          <div className={`${cardClass} rounded-2xl p-5 shadow-lg space-y-4`}>
            <h2 className={`text-md font-bold tracking-wider uppercase font-mono ${primaryTextClass}`}>
              Navigation Setup
            </h2>

            {/* Start Location Input */}
            <div className="flex flex-col gap-1.5">
              <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${highContrast ? "text-white" : "text-slate-500"}`}>
                Your Current Location
              </span>
              <div className={`${innerBgClass} px-3.5 py-2.5 rounded-xl text-xs text-slate-300 font-mono`}>
                {currentLocation}
              </div>
            </div>

            {/* Destination Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dest-select" className={`text-[9px] font-mono uppercase tracking-widest font-bold ${highContrast ? "text-white" : "text-slate-500"}`}>
                Destination Zone
              </label>
              <select
                id="dest-select"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={`w-full ${innerBgClass} focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white cursor-pointer transition-colors duration-200`}
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
              <div className={`flex items-center gap-2 p-3 rounded-xl ${highContrast ? "border-2 border-white bg-black" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                <Landmark size={14} className={primaryTextClass} />
                <span className={`text-[10px] font-bold ${primaryTextClass}`}>
                  Step-free pathing active. Elevator transfers selected.
                </span>
              </div>
            )}
          </div>

          {/* Guide steps */}
          <div className={`${cardClass} rounded-2xl p-5 shadow-lg space-y-4`}>
            <div className="flex justify-between items-center">
              <h2 className="text-md font-bold tracking-wider uppercase font-mono text-white">
                AI Routing Agent
              </h2>
              {speakSupported && routeInfo && (
                <button
                  onClick={handleSpeak}
                  aria-label="Listen to directions"
                  className={`p-2 border rounded-full transition-colors duration-300 cursor-pointer ${
                    highContrast ? "border-white hover:bg-white hover:text-black text-white" : "border-slate-800 hover:border-emerald-400 hover:text-emerald-400"
                  }`}
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center gap-2">
                <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${highContrast ? "border-white" : "border-emerald-400"}`} />
                <span className="text-[10px] text-slate-500 font-mono">Routing...</span>
              </div>
            ) : routeInfo ? (
              <div className="space-y-4 text-left">
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                    highContrast ? "border-white text-white" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    Est. Time: {routeInfo.estimatedMinutes} Mins
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono border ${
                    highContrast ? "border-white text-white" : "bg-slate-950 text-slate-300 border-slate-800"
                  }`}>
                    Distance: {routeInfo.path.length * 90}m
                  </span>
                </div>

                <p className={`text-xs leading-relaxed p-3.5 rounded-xl whitespace-pre-line ${innerBgClass} ${highContrast ? "text-white" : "text-slate-300"}`}>
                  {routeInfo.descriptiveGuide}
                </p>

                {/* Eco-Facilities on route */}
                {routeInfo.facilitiesOnRoute.length > 0 && (
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Leaf size={10} /> Eco Facilities On Path
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {routeInfo.facilitiesOnRoute.map((f, i) => (
                        <span key={i} className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-mono">
                          ♻️ {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Path checkpoints */}
                <div className="space-y-2">
                  <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${highContrast ? "text-white" : "text-slate-500"}`}>
                    Target Path Checkpoints
                  </span>
                  <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                    {routeInfo.path.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] border ${
                          highContrast ? "border-white text-white bg-black" : "bg-slate-850 text-slate-400 border-slate-800"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={idx === routeInfo.path.length - 1 ? primaryTextClass : "text-slate-300"}>
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
          <div className={`${cardClass} rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[400px]`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-bold tracking-wider uppercase font-mono text-white">
                Stadium Floor Layout
              </h2>
              <span className={`flex items-center gap-1.5 text-[9px] font-mono font-bold border px-2.5 py-1 rounded-full ${
                highContrast ? "border-white text-white" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${!highContrast && "animate-ping"}`} />
                Live Telemetry
              </span>
            </div>

            {/* Stadium Grid Layout */}
            <div className={`flex-1 rounded-xl relative p-4 flex items-center justify-center overflow-hidden min-h-[300px] ${innerBgClass}`}>
              <div className={`absolute inset-4 border border-dashed rounded-lg pointer-events-none ${
                highContrast ? "border-white/50" : "border-slate-800/60"
              }`} />
              
              <div className="grid grid-cols-3 gap-6 w-full max-w-md relative z-10">
                {stadiumSections.map((sec) => {
                  const isCurrent = sec.name === currentLocation;
                  const isDest = sec.name === destination;
                  const isCongested = sec.status === "CONGESTED";
                  const isBlocked = sec.status === "BLOCKED";
                  
                  let borderStyle = highContrast ? "border-2 border-slate-750 bg-black" : "border-slate-800 bg-slate-900/40";
                  if (isCurrent) borderStyle = highContrast ? "border-4 border-yellow-400 text-yellow-400 bg-black shadow-md" : "border-emerald-400 bg-emerald-500/5 text-emerald-400 shadow-md";
                  if (isDest) borderStyle = highContrast ? "border-4 border-cyan-300 text-cyan-300 bg-black shadow-md" : "border-sky-400 bg-sky-500/5 text-sky-400 shadow-md";
                  if (isCongested) borderStyle = highContrast ? "border-4 border-orange-500 text-orange-500 bg-black" : "border-amber-500 bg-amber-500/5 text-amber-500";
                  if (isBlocked) borderStyle = highContrast ? "border-4 border-red-500 text-red-500 bg-black" : "border-red-500 bg-red-500/5 text-red-500";

                  return (
                    <div
                      key={sec.id}
                      className={`p-3 border rounded-xl flex flex-col justify-between text-center transition-all duration-300 min-h-[85px] ${borderStyle}`}
                    >
                      <div className={`text-[8px] font-mono uppercase tracking-widest font-bold ${
                        isCurrent ? "text-emerald-400" : isDest ? "text-sky-450" : "text-slate-500"
                      }`}>
                        {isCurrent ? "CURRENT" : isDest ? "TARGET" : sec.status}
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-white truncate px-1">
                        {sec.name.split(" (")[0]}
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
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> Congested</span>
              </div>
            </div>

            {/* Sustainability Metrics (Eco Offset Panel) */}
            {routeInfo && routeInfo.transitInfo.length > 0 && (
              <div className={`mt-4 p-4 rounded-xl border ${
                highContrast ? "border-white bg-black" : "border-slate-800 bg-emerald-500/5"
              } text-left`}>
                <h3 className="text-xs font-bold tracking-wider font-mono text-emerald-400 flex items-center gap-1.5 uppercase mb-2">
                  <Leaf size={14} /> Transit Carbon Offset Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {routeInfo.transitInfo.map((tr, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border ${
                      highContrast ? "border-white" : "border-slate-850 bg-slate-950/60"
                    } text-[10px] space-y-1`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-white">{tr.mode}</span>
                        <span className={tr.carbonRateKgPerKm === 0 ? "text-emerald-400" : "text-slate-400"}>
                          {tr.carbonRateKgPerKm === 0 ? "Zero Carbon" : `${tr.carbonRateKgPerKm} kg/km`}
                        </span>
                      </div>
                      <p className="text-slate-400 truncate">{tr.name}</p>
                      <div className="flex justify-between items-center text-[9px] font-mono pt-1 text-slate-500">
                        <span>Est: {tr.estDistanceKm} km</span>
                        <span className={tr.carbonRateKgPerKm === 0 ? "text-emerald-400 font-bold" : "text-white"}>
                          Offset: {Math.max(0, 1.25 - (tr.carbonRateKgPerKm * tr.estDistanceKm)).toFixed(2)} kg CO2
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
