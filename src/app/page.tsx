"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStadiumStore } from "@/store/useStadiumStore";
import { Shield, Navigation, User, Users, Landmark, Accessibility, Globe } from "lucide-react";
import AnnounceBox from "@/components/shared/AnnounceBox";

export default function FifaOnboarding() {
  const router = useRouter();
  const { setUser, setAccessibility } = useStadiumStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"FAN" | "VOLUNTEER" | "ORGANIZER">("FAN");
  const [language, setLanguage] = useState("English");
  const [isWheelchair, setIsWheelchair] = useState(false);
  const [isSensory, setIsSensory] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateForm()) {
        setAnnouncement("Form validation failed. Please check errors.");
        return;
      }
    }
    setStep((prev) => prev + 1);
    setAnnouncement(`Moved to step ${step + 1}`);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
    setAnnouncement(`Returned to step ${step - 1}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !validateForm()) return;

    const userId = "usr_" + Math.random().toString(36).substr(2, 9);
    setUser({
      id: userId,
      name,
      email,
      role,
      language,
    });

    setAccessibility(isWheelchair || isSensory);
    setAnnouncement("Setup completed. Redirecting to dashboard.");

    if (role === "ORGANIZER") {
      router.push("/dashboard");
    } else {
      router.push("/navigation");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white p-6 relative overflow-hidden select-none font-inter">
      {/* Pitch Green Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <AnnounceBox message={announcement} />

      {/* Main Header */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Navigation className="text-emerald-400 animate-pulse" size={24} />
          <span className="font-semibold text-lg tracking-wider text-white">
            FIFA <span className="text-emerald-400">CROWDFLOW</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <span className="text-xs" title="USA | Canada | Mexico">🇺🇸 🇨🇦 🇲🇽</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
            WC 2026™
          </span>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-slate-800 bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl"
        >
          {/* Step Indicators */}
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <span className="font-mono text-[10px] tracking-widest text-emerald-400 uppercase font-bold">
              Setup Wizard — Step {step} of 2
            </span>
            <div className="flex gap-1">
              <span className={`h-1.5 w-8 rounded-full ${step >= 1 ? "bg-emerald-400" : "bg-slate-800"}`} />
              <span className={`h-1.5 w-8 rounded-full ${step >= 2 ? "bg-emerald-400" : "bg-slate-800"}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <h1 className="text-xl md:text-2xl text-white font-bold tracking-wide">
                      Welcome to CrowdFlow
                    </h1>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Configure your guest persona to access dynamic crowd telemetry and stadium voice assistance.
                    </p>
                  </div>

                  {/* Input Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name-input" className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                      Full Name
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mayank Ray"
                      className={`w-full bg-slate-950 border ${errors.name ? "border-red-500" : "border-slate-800 hover:border-emerald-500/45"} focus:border-emerald-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-all duration-200`}
                    />
                    {errors.name && (
                      <span className="text-[10px] text-red-400 font-mono">{errors.name}</span>
                    )}
                  </div>

                  {/* Input Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email-input" className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                      Email Address
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. developer@worldcup.com"
                      className={`w-full bg-slate-950 border ${errors.email ? "border-red-500" : "border-slate-800 hover:border-emerald-500/45"} focus:border-emerald-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-all duration-200`}
                    />
                    {errors.email && (
                      <span className="text-[10px] text-red-400 font-mono">{errors.email}</span>
                    )}
                  </div>

                  {/* Persona Select */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                      Your Tournament Role
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "FAN", label: "Fan / Guest", icon: Users },
                        { id: "VOLUNTEER", label: "Volunteer", icon: User },
                        { id: "ORGANIZER", label: "Organizer", icon: Shield },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = role === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setRole(item.id as any)}
                            className={`flex flex-col items-center justify-center p-3 border rounded-xl gap-2 transition-all duration-300 cursor-pointer ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                : "border-slate-800 bg-slate-950 hover:border-emerald-500/30 text-slate-400"
                            }`}
                          >
                            <Icon size={18} />
                            <span className="text-[9px] uppercase tracking-wider font-bold">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl md:text-2xl text-white font-bold tracking-wide">
                      Accessibility & Language
                    </h2>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Tailor the maps and AI guide instructions to meet your physical or language support needs.
                    </p>
                  </div>

                  {/* Language Option */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lang-select" className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                      Preferred Language
                    </label>
                    <select
                      id="lang-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/45 focus:border-emerald-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white cursor-pointer transition-all duration-200"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="Hinglish">Hinglish (Hindi/English)</option>
                      <option value="French">French (Français)</option>
                      <option value="Arabic">Arabic (العربية)</option>
                    </select>
                  </div>

                  {/* Accessibility Options */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold block mb-1">
                      Accessibility Requirements (WCAG 2.2)
                    </span>

                    {/* Wheelchair Accessible Toggle */}
                    <div
                      onClick={() => setIsWheelchair(!isWheelchair)}
                      className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-300 ${
                        isWheelchair ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Landmark className="text-emerald-400" size={18} />
                        <div className="text-left">
                          <span className="text-xs font-bold block text-white">Wheelchair & Step-Free</span>
                          <span className="text-[9px] text-slate-400 leading-relaxed">
                            Prioritize elevators, ramps, and wide paths on mapping screens.
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isWheelchair}
                        readOnly
                        aria-label="Toggle Wheelchair and Step-Free Routing"
                        className="h-4 w-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                      />
                    </div>

                    {/* Sensory Sensitive Toggle */}
                    <div
                      onClick={() => setIsSensory(!isSensory)}
                      className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-300 ${
                        isSensory ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800 bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Accessibility className="text-emerald-400" size={18} />
                        <div className="text-left">
                          <span className="text-xs font-bold block text-white">Sensory-Sensitive Routing</span>
                          <span className="text-[9px] text-slate-400 leading-relaxed">
                            Avoid loudest cheering concourses and stadium flash zones.
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSensory}
                        readOnly
                        aria-label="Toggle Sensory Sensitive Routing"
                        className="h-4 w-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Wizard Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-800">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-3 border border-slate-800 hover:border-emerald-500 bg-transparent text-slate-400 hover:text-white rounded-xl text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
                >
                  Back
                </button>
              )}
              {step < 2 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-transparent border border-emerald-500 text-slate-950 hover:text-emerald-400 rounded-xl text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-transparent border border-emerald-500 text-slate-950 hover:text-emerald-400 rounded-xl text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Enter Stadium Hub
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </main>

      {/* Accessible Footer */}
      <footer className="w-full max-w-xl mx-auto py-4 text-center border-t border-slate-850">
        <p className="text-[9px] tracking-wider text-slate-500 uppercase">
          WCAG 2.2 AA Certified • Secure In-Memory Session Storage
        </p>
      </footer>
    </div>
  );
}
