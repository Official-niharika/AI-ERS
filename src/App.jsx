import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Flame,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Mic,
  Moon,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  Building2,
  Siren,
  Cross,
} from "lucide-react";

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState("");
  const [user, setUser] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [severity, setSeverity] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");
  const [aiReasoning, setAiReasoning] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [firstAidLoading, setFirstAidLoading] = useState(false);
  const [firstAidSteps, setFirstAidSteps] = useState([]);
  const [firstAidCategory, setFirstAidCategory] = useState("");

  const categoryAccentMap = {
    Medical: "#0A84FF",
    Fire: "#FF9F0A",
    "Women Safety": "#AF52DE",
    Accident: "#FFD60A",
    CrimeSecurity: "#52d9de"
  };

  const theme = themeMode === "dark"
    ? {
        page: "#0A0A0A",
        panel: "rgba(255,255,255,0.03)",
        text: "#F8FAFC",
        muted: "rgba(255,255,255,0.6)",
        border: "rgba(255,255,255,0.08)",
      }
    : {
        page: "linear-gradient(180deg, #F5F7FB 0%, #EEF2FF 100%)",
        panel: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        text: "#111827",
        muted: "#64748B",
        border: "rgba(15,23,42,0.08)",
      };

  const categoryTagOptions = {
    Medical: ["Bleeding", "Unconscious", "Chest Pain", "Breathing Difficulty", "Allergic Reaction"],
    Fire: ["Smoke", "Rapid Spread", "Trapped Inside", "Toxic Fumes", "Gas Leak"],
    "Women Safety": ["Stalking", "Harassment", "Unsafe Area", "Following Me", "Need Escort"],
    Accident: ["Vehicle Collision", "Injury", "Trapped", "Multiple Victims", "Road Blocked"],
    CrimeSecurity:["Theft", "robbery", "burglary", "fighting", "vandalism", "suspicious activity", "kidnapping"],
  };

  const visibleTags = selectedEmergency ? categoryTagOptions[selectedEmergency] || [] : Object.values(categoryTagOptions).flat();
  const emergencyButtons = [
    { label: "Medical", icon: <Ambulance size={22} /> },
    { label: "Fire", icon: <Flame size={22} /> },
    { label: "Women Safety", icon: <ShieldAlert size={22} /> },
    { label: "Accident", icon: <TriangleAlert size={22} /> },
    { label: "CrimesSecurity", icon: <ShieldAlert size={22} /> },
  ];
  const activeAccent = categoryAccentMap[selectedEmergency || "Medical"] || "#0A84FF";

  const makeSummary = (category, severityValue, tags) => {
    const tagList = tags && tags.length ? tags.join(", ") : "standard response tags";
    return `${category} incident flagged with ${severityValue.toLowerCase()} priority. ${tagList} were attached for responder triage.`;
  };

  const applyAiResults = (results) => {
    if (results.category) setSelectedEmergency(results.category);
    if (results.severity) setSeverity(results.severity);
    if (results.reasoning) setAiReasoning(results.reasoning);
    if (results.summary) setAiSummary(results.summary);
    else if (results.reasoning) setAiSummary(`AI detected a ${results.severity || "High"} priority incident with supporting reasoning.`);

    if (results.tags && Array.isArray(results.tags)) {
      const allowedTags = results.category ? categoryTagOptions[results.category] || [] : visibleTags;
      const matchedTags = results.tags.filter((tag) => allowedTags.includes(tag));
      setSelectedTags(matchedTags.length ? matchedTags : results.tags.slice(0, 3));
    }
  };

  const performHeuristicAnalysis = (description) => {
    const desc = (description || "").toLowerCase();
    let category = "Medical";
    let severityVal = "High";
    let tags = [];
    let reasoning = "Detected likely emergency type from the text and mapped standard response priorities.";

    if (desc.includes("fire") || desc.includes("smoke") || desc.includes("burn") || desc.includes("explosion") || desc.includes("blast")) {
      category = "Fire";
      severityVal = "High";
      reasoning = "The description points to fire, smoke, or heat exposure, which requires urgent containment and evacuation support.";
      if (desc.includes("smoke")) tags.push("Smoke");
      if (desc.includes("rapid") || desc.includes("spread")) tags.push("Rapid Spread");
      if (desc.includes("trapped") || desc.includes("stuck")) tags.push("Trapped Inside");
      if (desc.includes("gas") || desc.includes("leak")) tags.push("Gas Leak");
    } else if (desc.includes("accident") || desc.includes("crash") || desc.includes("collision") || desc.includes("hit") || desc.includes("wreck")) {
      category = "Accident";
      severityVal = "High";
      reasoning = "The report describes a collision or physical impact, so responders should prioritize injury assessment and traffic safety.";
      tags.push("Injury");
      if (desc.includes("vehicle") || desc.includes("car") || desc.includes("road")) tags.push("Vehicle Collision");
      if (desc.includes("bleed") || desc.includes("blood")) tags.push("Bleeding");
      if (desc.includes("trapped") || desc.includes("stuck")) tags.push("Trapped");
    } else if (desc.includes("women") || desc.includes("safety") || desc.includes("stalk") || desc.includes("harass") || desc.includes("threat") || desc.includes("abuse") || desc.includes("follow")) {
      category = "Women Safety";
      severityVal = "High";
      reasoning = "The text indicates a safety or harassment threat, so immediate protective support and witness coordination are needed.";
      if (desc.includes("stalk") || desc.includes("follow")) tags.push("Stalking");
      if (desc.includes("harass")) tags.push("Harassment");
      if (desc.includes("unsafe") || desc.includes("area")) tags.push("Unsafe Area");
    } else if (desc.includes("medical") || desc.includes("heart") || desc.includes("breath") || desc.includes("pain") || desc.includes("bleed") || desc.includes("injury") || desc.includes("sick") || desc.includes("allergic")) {
      category = "Medical";
      reasoning = "The report appears to describe a medical or injury condition, so urgent triage and first-aid assistance are appropriate.";
      severityVal = desc.includes("heart") || desc.includes("breath") || desc.includes("unconscious") || desc.includes("stroke") ? "High" : "Medium";
      if (desc.includes("bleed") || desc.includes("blood")) tags.push("Bleeding");
      if (desc.includes("unconscious") || desc.includes("faint") || desc.includes("passed out")) tags.push("Unconscious");
      if (desc.includes("chest") || desc.includes("pain")) tags.push("Chest Pain");
      if (desc.includes("breath") || desc.includes("difficulty")) tags.push("Breathing Difficulty");
      if (desc.includes("allergic")) tags.push("Allergic Reaction");
    }else if (
     desc.includes("theft") ||desc.includes("stolen") ||desc.includes("robbery") ||desc.includes("burglary") ||desc.includes("fight") ||desc.includes("violence") ||desc.includes("assault") ||desc.includes("attack") || desc.includes("crime") || desc.includes("vandalism") || desc.includes("suspicious") || desc.includes("kidnap") ||desc.includes("abduction") ||desc.includes("security") ||desc.includes("weapon") ||desc.includes("gun") ||desc.includes("knife") ||desc.includes("harassment") ||desc.includes("threat") ||desc.includes("intruder") ||desc.includes("break in")) {
     category = "Crime & Security";
     reasoning ="The report appears to describe a criminal, violent, or public security incident that may require law enforcement intervention.";
     severityVal =
    desc.includes("assault") ||
    desc.includes("attack") ||
    desc.includes("violence") ||
    desc.includes("kidnap") ||
    desc.includes("abduction") ||
    desc.includes("weapon") ||
    desc.includes("gun") ||
    desc.includes("knife")
      ? "High"
      : "Medium";

  if (
    desc.includes("theft") ||
    desc.includes("stolen") ||
    desc.includes("robbery") ||
    desc.includes("burglary")
  ) {
    tags.push("Theft/Robbery");
  }

  if (
    desc.includes("fight") ||
    desc.includes("violence") ||
    desc.includes("assault") ||
    desc.includes("attack")
  ) {
    tags.push("Physical Violence");
  }

  if (
    desc.includes("suspicious") ||
    desc.includes("intruder") ||
    desc.includes("break in")
  ) {
    tags.push("Suspicious Activity");
  }

  if (
    desc.includes("vandalism") ||
    desc.includes("damage")
  ) {
    tags.push("Property Damage");
  }

  if (
    desc.includes("kidnap") ||
    desc.includes("abduction")
  ) {
    tags.push("Kidnapping");
  }

  if (
    desc.includes("weapon") ||
    desc.includes("gun") ||
    desc.includes("knife")
  ) {
    tags.push("Weapon Involved");
  }

  if (
    desc.includes("harassment") ||
    desc.includes("threat")
  ) {
    tags.push("Harassment/Threat");
  }
}

    if (tags.length === 0) {
      if (category === "Medical") tags = ["Bleeding"];
      else if (category === "Fire") tags = ["Smoke"];
      else if (category === "Accident") tags = ["Injury"];
      else if (category === "CrimeSecurity") tags = ["Violence"];
      else tags = ["Harassment"];
    }

    applyAiResults({ category, severity: severityVal, tags, reasoning, summary: makeSummary(category, severityVal, tags) });
  };

  const analyzeEmergencyWithGemini = async (description) => {
    if (!description.trim()) return;
    setAiLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      performHeuristicAnalysis(description);
      setAiLoading(false);
      return;
    }

    try {
      const promptText = `Analyze this emergency description: "${description}"\nReturn JSON with keys: category, severity, reasoning, summary, tags.\nCategory must be one of Medical, Fire, Women Safety, Accident.\nSeverity one of Low, Medium, High.\nTags must come from the matching category table.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseMimeType: "application/json" } }),
      });
      if (!response.ok) throw new Error("Gemini API request failed");
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        const allowedTags = parsed.category ? categoryTagOptions[parsed.category] || [] : [];
        const filteredTags = (parsed.tags || []).filter((tag) => allowedTags.includes(tag));
        applyAiResults({ ...parsed, tags: filteredTags.length ? filteredTags : (parsed.tags || []).slice(0, 3) });
      } else {
        performHeuristicAnalysis(description);
      }
    } catch (error) {
      console.warn("Gemini API failed or timed out:", error);
      performHeuristicAnalysis(description);
    } finally {
      setAiLoading(false);
    }
  };

  const performHeuristicFirstAid = (category, tags) => {
    const tagSet = new Set(tags || []);
    let steps = [];

    if (category === "Medical") {
      steps = [
        "Stay calm and keep the person still; do not move them unless they are in immediate danger.",
        "Check if they are responsive and breathing. If unresponsive and not breathing, begin CPR if trained.",
      ];
      if (tagSet.has("Bleeding")) steps.push("Apply firm, direct pressure on the wound with a clean cloth to control bleeding.");
      if (tagSet.has("Unconscious")) steps.push("Place the person in the recovery position on their side to keep the airway clear.");
      if (tagSet.has("Chest Pain")) steps.push("Help them sit in a comfortable, upright position and loosen tight clothing.");
      if (tagSet.has("Breathing Difficulty")) steps.push("Keep the area well-ventilated and help them sit upright to ease breathing.");
      if (tagSet.has("Allergic Reaction")) steps.push("If they carry an epinephrine auto-injector, help them use it, and watch for swelling of the face or throat.");
      steps.push("Do not give food or water if the person is unconscious or has difficulty swallowing.");
    } else if (category === "Fire") {
      steps = [
        "Move everyone away from the fire to a safe distance and a clear exit route.",
        "If safe to do so, close doors behind you to slow the spread of fire and smoke.",
      ];
      if (tagSet.has("Smoke") || tagSet.has("Toxic Fumes")) steps.push("Stay low to the ground and cover your nose and mouth with a damp cloth to avoid smoke inhalation.");
      if (tagSet.has("Trapped Inside")) steps.push("If trapped, signal for help from a window and seal gaps under doors with cloth to block smoke.");
      if (tagSet.has("Gas Leak")) steps.push("Do not switch on any electrical devices or create sparks; evacuate and ventilate the area if possible.");
      if (tagSet.has("Rapid Spread")) steps.push("Do not attempt to fight a fast-spreading fire yourself; prioritize evacuation over property.");
      steps.push("Never use elevators during a fire emergency.");
    } else if (category === "Women Safety") {
      steps = [
        "Move to a well-lit, populated area or a nearby shop, police station, or public space if possible.",
        "Stay on the phone or in contact with a trusted person and share your live location with them.",
      ];
      if (tagSet.has("Stalking") || tagSet.has("Following Me")) steps.push("Avoid isolated routes, vary your path, and head toward visible public spaces or security personnel.");
      if (tagSet.has("Harassment")) steps.push("Try to create distance, draw attention by speaking loudly, and avoid direct confrontation if possible.");
      if (tagSet.has("Unsafe Area")) steps.push("If possible, move toward CCTV-covered areas, shops, or groups of people until help arrives.");
      if (tagSet.has("Need Escort")) steps.push("Wait in a safe, visible location until an escort or responder arrives; avoid accepting rides from strangers.");
      steps.push("Keep your phone charged and accessible, and avoid revealing your exact location publicly.");
    } else if (category === "Accident") {
      steps = [
        "Ensure your own safety first; move to the roadside away from traffic if it is safe to do so.",
        "Do not move injured people unless they are at risk of further harm (e.g. fire, oncoming traffic).",
      ];
      if (tagSet.has("Bleeding")) steps.push("Apply firm pressure to any bleeding wounds using a clean cloth.");
      if (tagSet.has("Injury") || tagSet.has("Multiple Victims")) steps.push("Check each person for responsiveness and prioritize those who are unconscious or bleeding heavily.");
      if (tagSet.has("Trapped")) steps.push("Do not attempt to forcibly remove trapped individuals; wait for trained responders with proper equipment.");
      if (tagSet.has("Vehicle Collision")) steps.push("Turn on hazard lights and place a warning marker if available to alert oncoming traffic.");
      if (tagSet.has("Road Blocked")) steps.push("Help direct traffic safely around the area if it can be done without putting yourself at risk.");
      steps.push("Avoid crowding around the victims; give responders space to work once they arrive.");
    } else {
      steps = [
        "Stay calm and ensure your immediate surroundings are safe.",
        "Stay on the line with emergency services and follow their instructions.",
        "Keep bystanders calm and avoid crowding around the affected person or area.",
        "Call the nearest police station "
      ];
    }

    return steps;
  };

  const generateFirstAidWithGemini = async (category, tags, description) => {
    setFirstAidLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    setFirstAidCategory(category || "General");

    if (!apiKey) {
      setFirstAidSteps(performHeuristicFirstAid(category, tags));
      setFirstAidLoading(false);
      return;
    }

    try {
      const promptText = `An emergency report was just submitted.\nCategory: ${category}\nTags: ${(tags || []).join(", ")}\nDescription: "${description}"\n\nGenerate 3-5 short, safe first-aid or immediate-action steps that an untrained bystander or common person can follow while waiting for professional responders to arrive. Do not suggest anything that requires medical training or certification beyond basic first aid. Return JSON with a single key "steps" containing an array of short strings.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseMimeType: "application/json" } }),
      });
      if (!response.ok) throw new Error("Gemini API request failed");
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length) {
          setFirstAidSteps(parsed.steps);
        } else {
          setFirstAidSteps(performHeuristicFirstAid(category, tags));
        }
      } else {
        setFirstAidSteps(performHeuristicFirstAid(category, tags));
      }
    } catch (error) {
      console.warn("Gemini first-aid generation failed or timed out:", error);
      setFirstAidSteps(performHeuristicFirstAid(category, tags));
    } finally {
      setFirstAidLoading(false);
    }
  };

  useEffect(() => {
    if (!text.trim()) {
      setSeverity("");
      setSelectedTags([]);
      setAiReasoning("");
      setAiSummary("");
      setShowReasoning(false);
      return;
    }
    const timer = setTimeout(() => analyzeEmergencyWithGemini(text), 800);
    return () => clearTimeout(timer);
  }, [text]);

  const handleEmergencySelect = (type) => {
    const fallbackPrompt = `${type} emergency reported. Please prioritize immediate response and identify the likely incident tags.`;
    setSelectedEmergency(type);
    setText(fallbackPrompt);
    analyzeEmergencyWithGemini(fallbackPrompt);
  };

  const handleGPS = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setGpsLoading(false);
      alert("GPS enabled successfully");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setUser({ displayName: "Demo User", email: "demo@aiers.com" });
    alert("Demo login successful!");
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      const reportPayload = {
        category: selectedEmergency || "Unspecified",
        severity: severity || "Medium",
        tags: selectedTags,
        summary: aiSummary || "AI summary unavailable. Please review the incident details.",
        description: text,
        user: user?.displayName || "Citizen",
      };
      setLoading(false);
      console.log("Emergency payload:", reportPayload);
      alert(`Emergency sent successfully.\nAI Summary: ${reportPayload.summary}`);
      generateFirstAidWithGemini(reportPayload.category, reportPayload.tags, reportPayload.description);
      setText("");
      setSelectedEmergency("");
      setSelectedTags([]);
      setSeverity("");
      setAiReasoning("");
      setAiSummary("");
      setShowReasoning(false);
    }, 1200);
  };

  const dark = themeMode === "dark";

  const cardClass = `rounded-2xl border backdrop-blur-xl ${dark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white/90"}`;
  const subtleText = dark ? "text-white/50" : "text-slate-500";
  const headingText = dark ? "text-white" : "text-slate-900";

  // Nearby emergency services data
  const nearbyServices = [
    { name: "City General Hospital", type: "Hospital", distance: "0.8 km", eta: "3 min", icon: Cross, color: "#0A84FF", accent: "#0A84FF1A" },
    { name: "Central Fire Station", type: "Fire Station", distance: "1.2 km", eta: "5 min", icon: Siren, color: "#FF9F0A", accent: "#FF9F0A1A" },
    { name: "District Police HQ", type: "Police Station", distance: "1.6 km", eta: "6 min", icon: Building2, color: "#AF52DE", accent: "#AF52DE1A" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: theme.page }}>
        <div className={`w-full max-w-md rounded-[28px] border p-8 text-center shadow-2xl backdrop-blur-xl ${dark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"}`}>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/90">CITIZEN AI-ERS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]" style={{ color: theme.text }}>Emergency Response System</h1>
          <p className="mt-3 text-sm italic font-medium" style={{ color: "#0A84FF" }}>"Help Is Closer Than You Think."</p>
          <p className="mt-3 text-sm" style={{ color: theme.muted }}>Secure triage and premium dispatch console for live incidents.</p>
          <button onClick={handleGoogleLogin} className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">Continue with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: theme.page, fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className={`hidden w-60 flex-col justify-between border-r p-5 lg:flex ${dark ? "border-white/10" : "border-slate-200 bg-white"}`}
        >
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-700 p-2 text-white shadow-lg shadow-red-500/30">
                  <ShieldCheck size={20} />
                </div>
                <span className={`text-lg font-black tracking-[-0.04em] ${headingText}`}>CITIZEN AI-ERS</span>
              </div>
              <p className="mt-2 ml-1 text-xs italic font-medium text-cyan-400/80">"Help Is Closer Than You Think."</p>
            </div>

            <nav className="space-y-1">
              {[
                { label: "Dashboard", icon: LayoutDashboard },
                { label: "Analytics", icon: Activity },
                { label: "Settings", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? dark
                          ? "border-l-2 border-red-500 bg-white/5 text-white"
                          : "border-l-2 border-red-500 bg-red-50 text-slate-900"
                        : dark
                        ? "border-l-2 border-transparent text-white/50 hover:bg-white/5 hover:text-white"
                        : "border-l-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white">
                  {(user.displayName || "U").charAt(0)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A] bg-emerald-400" />
              </div>
              <div>
                <div className={`text-sm font-semibold leading-tight ${headingText}`}>{user.displayName}</div>
                <div className={`text-xs leading-tight ${subtleText}`}>Citizen</div>
              </div>
            </div>
            <button onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))} className={`rounded-full border p-2 transition hover:-translate-y-0.5 ${dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-700"}`} aria-label="Toggle theme">
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </motion.aside>

        {/* CENTER PANEL */}
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold tracking-tight ${headingText}`}>
              {activeTab === "Dashboard" ? "Emergency Reporting Interface" : activeTab}
            </h1>
          </div>

          {activeTab === "Dashboard" && (
            <>
          

          {/* REPORT AN EMERGENCY */}
          <div className={`${cardClass} p-5`}>
            <h2 className={`mb-4 text-lg font-semibold ${headingText}`}>Report an Emergency</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {emergencyButtons.map((item) => {
                const isActive = selectedEmergency === item.label;
                const accent = categoryAccentMap[item.label] || "#0A84FF";
                return (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={item.label}
                    onClick={() => handleEmergencySelect(item.label)}
                    className="rounded-2xl border p-4 text-center transition"
                    style={{
                      background: isActive ? `${accent}14` : dark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                      borderColor: isActive ? accent : dark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
                      boxShadow: isActive ? `0 0 0 1px ${accent}55, 0 8px 24px ${accent}22` : "none",
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-xl p-2.5" style={{ color: accent, background: `${accent}1A` }}>
                        {item.icon}
                      </div>
                      <span className={`text-sm font-semibold ${headingText}`}>{item.label}</span>
                      {isActive && <Check size={14} color={accent} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ADDITIONAL DETAILS */}
          <div className={`${cardClass} p-5`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className={`text-lg font-semibold ${headingText}`}>Additional Details</h2>
              {aiLoading && (
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">AI analyzing…</span>
              )}
            </div>

            <div className={`relative rounded-xl border p-4 ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Additional Details"
                className={`w-full resize-none border-0 bg-transparent pr-12 text-sm outline-none ${dark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"}`}
              />
              <motion.button
                aria-label="Voice input"
                whileTap={{ scale: 0.92 }}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", boxShadow: "0 0 0 0 rgba(239,68,68,0.5)" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(239,68,68,0.45)", "0 0 0 10px rgba(239,68,68,0)"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              >
                <Mic size={16} />
              </motion.button>
            </div>

            {/* QUICK CONTEXT TAGS */}
            <p className={`mb-2 mt-4 text-xs font-semibold uppercase tracking-wider ${subtleText}`}>Quick Context Tags</p>
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    key={tag}
                    onClick={() => {
                      if (isSelected) setSelectedTags((prev) => prev.filter((t) => t !== tag));
                      else {
                        setSelectedTags((prev) => [...prev, tag]);
                        if (!text.includes(tag)) setText((prev) => `${prev}${prev ? " " : ""}${tag}`);
                      }
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: isSelected ? `${activeAccent}1F` : dark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                      borderColor: isSelected ? activeAccent : dark ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                      color: isSelected ? activeAccent : dark ? "#F8FAFC" : "#111827",
                      boxShadow: isSelected ? `0 0 12px ${activeAccent}33` : "none",
                    }}
                  >
                    {isSelected && <Check size={12} className="mr-1 inline" />}
                    {tag}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {aiReasoning && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`mt-4 rounded-xl border p-4 ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}
                >
                  <button onClick={() => setShowReasoning((prev) => !prev)} className={`flex items-center gap-2 text-sm font-semibold ${headingText}`}>
                    AI Analysis
                    {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showReasoning && <p className={`mt-2 text-sm ${subtleText}`}>{aiReasoning}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LOCATION + CTA */}
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <div className={`${cardClass} flex flex-col gap-3 p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs ${subtleText}`}>GPS: 66.87251, 28.33847</p>
                  <p className={`mt-1 text-xs ${subtleText}`}>Address: L...ongin, 934 80 ...</p>
                </div>
                <MapPin size={16} className="text-cyan-300" />
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold text-emerald-400">Location locked</span>
              </div>
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                className={`mt-1 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${dark ? "border-white/10 bg-white/5 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-800"}`}
              >
                {gpsLoading ? "Enabling GPS…" : "Enable live GPS"}
              </button>
            </div>

            <div className={`${cardClass} flex flex-col p-5`}>
              <h3 className={`mb-3 text-base font-semibold ${headingText}`}>Call to Action</h3>
              <motion.button
                whileHover={{ y: -2, boxShadow: "0 16px 40px rgba(239,68,68,0.45)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-4 text-base font-bold text-white shadow-xl shadow-red-500/30 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Circle size={16} className="animate-spin" />
                    Dispatching…
                  </>
                ) : (
                  <>
                    Send Emergency Alert
                    <Send size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
            </>
          )}

          {activeTab === "Analytics" && (
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <h2 className={`text-lg font-semibold ${headingText}`}>Analytics</h2>
              </div>
              <p className={`mt-2 text-sm ${subtleText}`}>
                Response time trends, incident category breakdowns, and responder performance metrics will appear here.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Est. response time", value: "7 min" },
                  { label: "Resolved this week", value: "62" },
                  { label: "Medical incidents", value: "38%" },
                  { label: "Repeat callers", value: "4%" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl border p-4 ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`text-2xl font-bold ${headingText}`}>{stat.value}</div>
                    <div className={`mt-1 text-xs ${subtleText}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-slate-300" />
                <h2 className={`text-lg font-semibold ${headingText}`}>Settings</h2>
              </div>
              <p className={`mt-2 text-sm ${subtleText}`}>
                Account, notification, and AI preference settings will appear here.
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Display name", value: user?.displayName || "Demo User" },
                  { label: "Email", value: user?.email || "demo@aiers.com" },
                  { label: "Theme", value: dark ? "Dark" : "Light" },
                ].map((row) => (
                  <div key={row.label} className={`flex items-center justify-between rounded-xl border p-3 ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`text-sm ${subtleText}`}>{row.label}</div>
                    <div className={`text-sm font-semibold ${headingText}`}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.main>

        {/* RIGHT PANEL */}
        <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="hidden w-80 space-y-6 border-l p-5 xl:flex xl:flex-col" style={{ borderColor: theme.border }}>
          {/* AI ANALYSIS */}
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-cyan-400/10 p-1.5 text-cyan-300">
                  <BrainCircuit size={16} />
                </div>
                <h3 className={`text-sm font-semibold ${headingText}`}>AI Analysis</h3>
              </div>
              <Sparkles size={16} className="text-cyan-300" />
            </div>
            <p className={`mt-3 text-xs leading-relaxed ${subtleText}`}>
              {aiSummary || "Real-time AI-generated incident summary and confidence score will appear here once analyzed."}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className={subtleText}>Confidence score</span>
                <span className={`font-semibold ${headingText}`}>{aiSummary ? "92%" : "50%"}</span>
              </div>
              <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: aiSummary ? "92%" : "50%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
            </div>
            {severity && (
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{
                    background:
                      severity === "High"
                        ? "linear-gradient(135deg, #EF4444, #DC2626)"
                        : severity === "Medium"
                        ? "linear-gradient(135deg, #F59E0B, #D97706)"
                        : "linear-gradient(135deg, #10B981, #059669)",
                  }}
                >
                  {severity} priority
                </span>
              </div>
            )}
          </div>

          {/* AI FIRST AID */}
          <AnimatePresence initial={false}>
            {(firstAidLoading || firstAidSteps.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`${cardClass} p-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-400/10 p-1.5 text-emerald-300">
                      <HeartPulse size={16} />
                    </div>
                    <h3 className={`text-sm font-semibold ${headingText}`}>AI First Aid</h3>
                  </div>
                  <ListChecks size={16} className="text-emerald-300" />
                </div>
                <p className={`mt-2 text-xs ${subtleText}`}>
                  {firstAidCategory ? `Guidance for ${firstAidCategory.toLowerCase()} incident` : "Guidance for this incident"} — what a bystander can do right now.
                </p>

                {firstAidLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
                    <Circle size={14} className="animate-spin" />
                    Generating first-aid steps…
                  </div>
                ) : (
                  <ol className="mt-3 space-y-2">
                    {firstAidSteps.map((step, idx) => (
                      <li key={idx} className={`flex gap-2 rounded-xl border p-2.5 text-xs leading-relaxed ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-[11px] font-bold text-emerald-300">
                          {idx + 1}
                        </span>
                        <span className={dark ? "text-slate-200" : "text-slate-700"}>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}

                <p className={`mt-3 text-[11px] ${subtleText}`}>
                  This guidance is for immediate bystander support only and does not replace professional medical or emergency response.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NEARBY EMERGENCY SERVICES */}
          <div className={`${cardClass} p-4`}>
            <h3 className={`mb-3 text-sm font-semibold ${headingText}`}>Nearby Emergency Services</h3>
            <div className="space-y-3">
              {nearbyServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.name} className={`flex items-center gap-3 rounded-xl border p-3 ${dark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: service.accent, color: service.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold leading-tight truncate ${headingText}`}>{service.name}</div>
                      <div className={`text-xs mt-0.5 ${subtleText}`}>{service.type} · {service.distance}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold" style={{ color: service.color }}>{service.eta}</div>
                      <div className={`text-[10px] ${subtleText}`}>ETA</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={`mt-3 text-[11px] ${subtleText}`}>
              Distances and ETAs are estimates based on your current GPS location.
            </p>
          </div>

          {/* SYSTEM STATUS */}
          <div className={`${cardClass} p-4`}>
            <h3 className={`mb-3 text-sm font-semibold ${headingText}`}>System Status</h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                { label: "API", value: "OPERATIONAL", color: "#34D399" },
                { label: "GPS", value: "AMBER", color: "#FBBF24" },
                { label: "SMS Fallback", value: "ACTIVE", color: "#34D399" },
                { label: "Database", value: "STABLE", color: "#34D399" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: row.color, boxShadow: `0 0 6px ${row.color}` }} />
                    <span className={dark ? "text-slate-300" : "text-slate-600"}>{row.label}</span>
                  </div>
                  <span style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

export default App;