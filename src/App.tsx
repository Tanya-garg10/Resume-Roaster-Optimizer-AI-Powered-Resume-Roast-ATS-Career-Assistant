import React, { useState, useEffect } from "react";
import {
  Flame,
  Briefcase,
  FileText,
  Upload,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Trash2,
  Copy,
  ChevronRight,
  Sparkle,
  FileCheck,
  History,
  CornerDownRight,
  ExternalLink,
  ShieldCheck,
  Lock,
  Mail,
  User,
  LogOut,
  Sliders,
  CheckSquare,
  HelpCircle,
  Building,
  Target,
  ArrowRight,
  RotateCcw,
  Printer,
  Sun,
  Moon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Mode, IndustryType, AnalysisResponse } from "./types";
import { downloadReportPDF } from "./utils/pdf";

const INDUSTRIES: { name: IndustryType; icon: string; desc: string }[] = [
  { name: "General", icon: "🌐", desc: "All professions & sectors" },
  { name: "Software Engineering", icon: "💻", desc: "Full Stack, Frontend, Backend, Infra" },
  { name: "Data Science", icon: "📊", desc: "ML, Analytics, Big Data, AI" },
  { name: "Finance", icon: "💵", desc: "Investment, Accounting, Banking" },
  { name: "Marketing", icon: "📈", desc: "Growth, Copywriting, SEO, Analytics" },
  { name: "Product Management", icon: "🎯", desc: "Strategy, Agile, Metrics, UX" },
];

const ROASTER_LOADING_PHASES = [
  "Ripping page margins apart... 📄",
  "Crying over unquantified bullet points... 😭",
  "Running ATS screening with pre-populated rejection templates... 🤖",
  "Removing 'passionate team player' from your keywords... 🗑️",
  "Critiquing lack of metrics with immense disdain... 🤐",
  "Drafting a savage custom recruiter review... ✍️",
  "Reviewing your spacing with severe judgment... 📏",
  "Preparing the ultimate constructive roasting... 🔥",
];

const OPTIMIZER_LOADING_PHASES = [
  "Aligning content with high-converting sector standards... 🚀",
  "Replacing weak passive verbs with Fortune 500 action verbs... ⚡",
  "Calculating metrics and quantifying unmeasured outcomes... 📊",
  "Optimizing layout density for Applicant Tracking Systems... 🖥️",
  "Injecting tailored keywords to bypass corporate filters... 🔑",
  "Drafting pristine suggested professional translations... 📝",
  "Perfecting document aesthetics and read-rate... ✨",
];

const OPTIMIZER_QUOTES = [
  {
    tag: "Pro Tip",
    text: "Recruiters scan resumes in just 6 seconds. Place your most impressive, metric-driven achievements in the top third of the page.",
    icon: "💡"
  },
  {
    tag: "ATS Screening secret",
    text: "Up to 75% of applications are filtered by algorithm matches. Always prioritize specialized industry terms over visual fluff.",
    icon: "🔑"
  },
  {
    tag: "Quantification Rules",
    text: "Replacing simple task lists with structured outcomes (e.g., 'scaled throughput by 30%') instantly triggers a positive review cycle.",
    icon: "📈"
  },
  {
    tag: "Action Verbs override",
    text: "Kickoff bullets with strong direct outcomes ('Orchestrated', 'Refactored', 'Acquired') rather than passive setup statements.",
    icon: "⚡"
  }
];

const ROASTER_QUOTES = [
  {
    tag: "Savage Warning",
    text: "Your resume represents what you want recruiters to believe. Our savage roasting mode represents what they say behind closed doors.",
    icon: "💀"
  },
  {
    tag: "Buzzword alert",
    text: "If your profile describes you as a 'self-motivated synergistic leader', brace yourself. Sarcasm rates are extremely elevated.",
    icon: "🔥"
  },
  {
    tag: "Hard Truth",
    text: "CS students and software developers tend to use the absolute dryest templates imaginable. Let's melt those margins a little.",
    icon: "😈"
  },
  {
    tag: "Emotional Prep",
    text: "Sit back and grab some coffee. We are processing your achievements with a high dose of reality and passive-aggressive humor.",
    icon: "🕶️"
  }
];

export default function App() {
  // Login Gate State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [userProfile, setUserProfile] = useState<{ email: string; name: string } | null>(null);

  // Input form state
  const [resumeText, setResumeText] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>("General");
  const [selectedMode, setSelectedMode] = useState<Mode>("optimize");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>("");

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>( "" );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [history, setHistory] = useState<(AnalysisResponse & { id: string; time: string; industry: IndustryType; mode: Mode })[]>([]);
  const [activeTab, setActiveTab] = useState<"analyzer" | "history">("analyzer");
  const [outputTab, setOutputTab] = useState<"ats" | "bullets" | "roast">("ats");
  const [copiedIndex, setCopiedIndex] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Global Dark Mode Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Customized strategies configurations
  const [roastLevel, setRoastLevel] = useState<string>("brutal");
  const [roastPersona, setRoastPersona] = useState<string>("sarcastic");
  const [optimizationDirective, setOptimizationDirective] = useState<string>("general");

  // Switch quote randomly on mode change
  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * 4));
  }, [selectedMode]);

  // Check login states & load history from LocalStorage
  useEffect(() => {
    try {
      // Restore user session if preserved
      const storedUser = localStorage.getItem("resume_user_profile");
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }

      const storedHistory = localStorage.getItem("resume_roaster_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to restore initial session info", e);
    }
  }, []);

  // Update output tab auto-selection depending on mode response
  useEffect(() => {
    if (analysisResult) {
      if (selectedMode === "roast") {
        setOutputTab("roast");
      } else {
        setOutputTab("ats");
      }
    }
  }, [analysisResult, selectedMode]);

  // Set up dynamic loading phase interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const phases = selectedMode === "roast" ? ROASTER_LOADING_PHASES : OPTIMIZER_LOADING_PHASES;
    if (isLoading) {
      setLoadingPhase(phases[0]);
      let phaseIdx = 1;
      timer = setInterval(() => {
        setLoadingPhase(phases[phaseIdx % phases.length]);
        phaseIdx++;
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isLoading, selectedMode]);

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError("Please enter a valid business email address.");
      return;
    }
    if (loginPassword.length < 4) {
      setLoginError("Password must be at least 4 characters.");
      return;
    }

    // Capture user details for customization
    const generatedName = loginEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);
    
    const profile = {
      email: loginEmail,
      name: formattedName || "Premium Recruiter",
    };

    setUserProfile(profile);
    setIsLoggedIn(true);
    setLoginError("");
    localStorage.setItem("resume_user_profile", JSON.stringify(profile));
  };

  // Quick Guest Login Bypass function
  const handleQuickBypass = () => {
    const defaultProfile = {
      email: "recruiter.demo@resumeroaster.io",
      name: "Alex Sterling",
    };
    setUserProfile(defaultProfile);
    setIsLoggedIn(true);
    setLoginError("");
    localStorage.setItem("resume_user_profile", JSON.stringify(defaultProfile));
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("resume_user_profile");
    setUserProfile(null);
    setIsLoggedIn(false);
    setAnalysisResult(null);
  };

  // Handle traditional file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // PDF base64 encoding to send directly for Gemini multimodal analysis
      reader.onload = () => {
        const resultString = reader.result as string;
        // Trim standard data URL prefix (e.g. data:application/pdf;base64,)
        const base64Content = resultString.split(",")[1];
        setUploadedFileBase64(base64Content);
        setResumeText(""); // Prefer loaded file binary
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text files
      reader.onload = () => {
        setResumeText(reader.result as string);
        setUploadedFileBase64("");
      };
      reader.readAsText(file);
    }
  };

  // Submit action
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() && !uploadedFileBase64) {
      setErrorMsg("Please paste some resume text or upload an original document first!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: selectedMode,
          resumeText: resumeText,
          fileBase64: uploadedFileBase64 || null,
          fileName: uploadedFileName || null,
          industry: selectedIndustry,
          roastLevel,
          roastPersona,
          optimizationDirective,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status code ${response.status}`);
      }

      const rawResult: AnalysisResponse = await response.json();
      setAnalysisResult(rawResult);

      // Save to local persistence list
      const newItem = {
        ...rawResult,
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        industry: selectedIndustry,
        mode: selectedMode,
      };

      const updatedHistory = [newItem, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem("resume_roaster_history", JSON.stringify(updatedHistory));

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize dynamic analysis. Check backend or key configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFileName("");
    setUploadedFileBase64("");
    setResumeText("");
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("resume_roaster_history", JSON.stringify(updated));
  };

  // Status color mappings
  const getReactionStyle = (category: string) => {
    switch (category) {
      case "CRITICAL":
        return {
          bg: "bg-red-50/70 border-red-200 text-red-950",
          badge: "bg-red-600 text-white",
          label: "💀 ROASTER BURNS ONLY",
          border: "border-red-200",
        };
      case "MILD_ANNOYANCE":
        return {
          bg: "bg-amber-50/70 border-amber-200 text-amber-950",
          badge: "bg-amber-500 text-amber-950",
          label: "🥱 FLUFF WARNING",
          border: "border-amber-200",
        };
      case "IMPRESSED":
        return {
          bg: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
          badge: "bg-emerald-600 text-white",
          label: "👀 HIGHLY COMPETITIVE",
          border: "border-emerald-200",
        };
      case "READY_TO_OFFER":
        return {
          bg: "bg-blue-50/70 border-blue-200 text-blue-950",
          badge: "bg-blue-600 text-white",
          label: "🏆 PREPARING OFFER",
          border: "border-blue-200",
        };
      default:
        return {
          bg: "bg-slate-50/70 border-slate-200 text-slate-900",
          badge: "bg-slate-600 text-white",
          label: "RECRUITER RATING",
          border: "border-slate-200",
        };
    }
  };

  // ----------------- RENDER LOGIN PAGE GATING -----------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F4F1EC] to-[#EAE6DF] font-sans antialiased text-stone-900 flex flex-col justify-between">
        {/* Banner */}
        <header className="px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-xl bg-orange-500 font-bold text-white flex items-center justify-center text-lg shadow-sm">🔥</span>
            <span className="font-display font-bold text-lg tracking-tight">Resume Roaster & Optimizer</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
              title={theme === "light" ? "Toggle Dark Mode" : "Toggle Light Mode"}
              id="login-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <span className="text-xs text-stone-500 font-mono hidden sm:inline-block">v1.4 Enterprise Gateway</span>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/80 shadow-xl overflow-hidden p-8 space-y-6 relative">
            {/* Visual Indicator Light */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600"></div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100/80 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-inner text-orange-600">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-2xl text-stone-900">Sign in to Sandbox</h2>
              <p className="text-xs text-stone-500 font-medium max-w-xs mx-auto">
                Secure access to the professional ATS optimizer portal, custom dashboards, and recruiter comedy suites.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Business Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. john.doe@venturecapital.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-800 bg-[#FCFAF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Developer / Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-800 bg-[#FCFAF7]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center space-x-1"
              >
                <span>Authorize Terminal Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest">Or test sandbox mode</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <button
              onClick={handleQuickBypass}
              type="button"
              className="w-full py-3 rounded-xl border border-stone-300 text-stone-700 bg-stone-50 hover:bg-white hover:border-orange-500 hover:text-orange-600 text-xs font-bold transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>⚡ Fast Demo Access (No Password Required)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-[11px] text-stone-400 font-medium">
          Sandbox provided free for HR evaluation and candidate testing. All data remains encrypted on standard node pools.
        </footer>
      </div>
    );
  }

  // ----------------- RENDER MAIN APP WORKSPACE -----------------
  return (
    <div className="min-h-screen bg-[#FCFAF6] text-stone-900 font-sans tracking-tight antialiased">
      {/* Navigation Suite */}
      <header className="border-b border-stone-200/80 bg-white sticky top-0 z-50 shadow-[0_1px_10px_rgba(0,0,0,0.02)] print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">🔥</span>
            <div>
              <h1 className="font-display font-bold text-base leading-tight tracking-tight text-stone-900">
                Resume Roaster & Optimizer
              </h1>
              <p className="text-[10px] text-stone-500 font-medium">
                Savage feedback. Decisive optimization. Professional yields.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("analyzer")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "analyzer"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                  activeTab === "history"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Snapshot History</span>
                  {history.length > 0 && (
                    <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full absolute -top-1 -right-1 font-mono">
                      {history.length}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Profile badge / Logout */}
            <div className="flex items-center pl-2 border-l border-stone-200 space-x-2 text-xs">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-stone-800 line-clamp-1">{userProfile?.name}</p>
                <p className="text-[9px] text-[#22C55E] font-medium flex items-center justify-end">
                  <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full mr-1 animate-pulse"></span>
                  Online Sandbox
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
                title={theme === "light" ? "Toggle Dark Mode" : "Toggle Light Mode"}
                id="theme-toggle"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-red-600 transition-colors"
                title="Sign out of portal"
                id="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "history" ? (
          /* Snapshots Log */
          <div className="space-y-6">
            <div className="border border-stone-200 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-display font-bold text-xl mb-1.5 flex items-center space-x-2">
                <History className="w-5.5 h-5.5 text-stone-700" />
                <span>Your Local Analytical Vault</span>
              </h2>
              <p className="text-stone-500 text-xs max-w-xl">
                We persist your recent evaluation records directly on your local device for reference. Click any snapshot to run again or share.
              </p>

              {history.length === 0 ? (
                <div className="mt-8 py-14 border border-dashed border-stone-250 rounded-xl text-center">
                  <FileText className="w-11 h-11 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-600 text-xs font-semibold">No recent evaluations recorded</p>
                  <p className="text-[10px] text-stone-405 mt-1">Upload files on the Workspace tab to populate statistics instantly.</p>
                  <button
                    onClick={() => setActiveTab("analyzer")}
                    className="mt-4 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-transform"
                  >
                    Return to Workspace
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => {
                    const reactionMeta = getReactionStyle(item.reactionCategory);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setAnalysisResult(item);
                          setSelectedIndustry(item.industry);
                          setSelectedMode(item.mode);
                          setActiveTab("analyzer");
                        }}
                        className="group border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-orange-500 hover:shadow-md transition-all rounded-xl p-5 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded ${reactionMeta.badge}`}>
                              {item.mode.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {item.time}
                            </span>
                          </div>

                          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">Sector Focus: {item.industry}</span>
                          <h3 className="font-display font-bold text-stone-800 text-sm mt-0.5 leading-snug">
                            Detailed Recruitment Feedback Log
                          </h3>
                          <p className="text-xs text-stone-500 italic mt-2 line-clamp-2 bg-stone-100/50 p-2 rounded-lg border border-stone-200/40">
                            "{item.reaction}"
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-700 flex items-center">
                            ATS Score: <span className="ml-1 text-orange-600 font-bold font-mono">{item.atsScore}%</span>
                          </span>
                          <button
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="text-stone-400 hover:text-red-500 p-1 rounded transition-colors"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Analyzer Workbench */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block">
            
            {/* INPUT SIDE (5 Columns) */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
              <form onSubmit={handleAnalyze} className="border border-stone-200 bg-white rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      1. Upload Document / Paste Text
                    </label>
                    {uploadedFileName && (
                      <button
                        type="button"
                        onClick={clearUploadedFile}
                        className="text-[11px] text-red-600 hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <span>Replace File</span>
                      </button>
                    )}
                  </div>

                  {/* Drag & Drop File Upload Area */}
                  <div className="group border-2 border-dashed border-stone-200 hover:border-orange-500 rounded-xl p-4 bg-stone-50/50 hover:bg-stone-50/20 transition-all text-center relative">
                    <input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center mx-auto text-stone-600 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
                        <Upload className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-stone-700">
                        {uploadedFileName ? (
                          <span className="text-orange-600">📄 {uploadedFileName}</span>
                        ) : (
                          "Upload PDF Resume or Text Document"
                        )}
                      </p>
                      <p className="text-[10px] text-stone-400">Gemini compiles PDFs server-side instantly</p>
                    </div>
                  </div>

                  {!uploadedFileName && (
                    <div className="mt-3">
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Or, paste the raw text of your resume here... e.g.
John Doe - Software Engineer intern 
• Crafted synergistic strategies with stakeholders...
• Did some basic Excel stuff..."
                        className="w-full h-44 rounded-xl border border-stone-200 p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-stone-400 transition-all bg-[#FCFAF7] text-stone-800 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Industry / Profession Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2.5">
                    2. Choose Industry Alignment
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.name}
                        type="button"
                        onClick={() => setSelectedIndustry(ind.name)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedIndustry === ind.name
                            ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-100"
                            : "border-stone-200 bg-white hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{ind.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-stone-800 leading-tight truncate">{ind.name}</p>
                            <p className="text-[9px] text-stone-400 truncate">
                              {ind.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Treatment / Mode Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2.5">
                    3. Select Evaluation Strategy
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMode("optimize")}
                      className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center space-x-1.5 transition-all text-xs font-bold ${
                        selectedMode === "optimize"
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                          : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>OFFER OPTIMIZER</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMode("roast")}
                      className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center space-x-1.5 transition-all text-xs font-bold ${
                        selectedMode === "roast"
                          ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                          : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>SAVAGE ROAST</span>
                    </button>
                  </div>
                </div>

                {/* Customized Option Configurations depending on Mode state */}
                {selectedMode === "optimize" ? (
                  <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 space-y-3">
                    <label className="block text-[11px] font-extrabold text-emerald-850 uppercase tracking-wider">
                      🎯 Optimization Focus Area
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "general", label: "General Revamp", icon: "🛠️", desc: "Balanced polish" },
                        { id: "metrics", label: "Quantify Impact", icon: "📊", desc: "Highlight numbers" },
                        { id: "verbs", label: "Power Verbs", icon: "⚡", desc: "Active achievements" },
                        { id: "keywords", label: "ATS Keywords", icon: "🔑", desc: "Bypass filters" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setOptimizationDirective(opt.id)}
                          className={`p-2 rounded-lg border text-left transition-all text-xs ${
                            optimizationDirective === opt.id
                              ? "border-emerald-600 bg-white ring-2 ring-emerald-50 font-bold"
                              : "border-stone-200/80 bg-stone-50/40 text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm">{opt.icon}</span>
                            <div className="min-w-0">
                              <p className="font-extrabold text-stone-800 text-[11px] leading-tight">{opt.label}</p>
                              <p className="text-[9px] text-stone-400 leading-tight truncate">{opt.desc}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-4 space-y-3">
                    {/* Roast Level Option */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-orange-950 uppercase tracking-wider mb-2">
                        🔥 Roast Severity Gauge
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "mild", label: "Mild Tease", icon: "🥱" },
                          { id: "brutal", label: "Brutal Honesty", icon: "🌶️" },
                          { id: "nuclear", label: "Nuclear Ashes", icon: "💀" },
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setRoastLevel(level.id)}
                            className={`py-1.5 px-2 rounded-lg border text-center transition-all text-[10px] font-extrabold ${
                              roastLevel === level.id
                                ? "border-orange-500 bg-white shadow-sm ring-2 ring-orange-50 text-orange-900"
                                : "border-stone-200/80 bg-stone-50/40 text-stone-650 hover:bg-stone-50"
                            }`}
                          >
                            <span>{level.icon} {level.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recruiter Persona Option */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-orange-950 uppercase tracking-wider mb-2">
                        🕵️‍♂️ Recruiter Persona
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "sarcastic", label: "Sarcastic Dev", icon: "🤠" },
                          { id: "hr", label: "Salty HR", icon: "👵" },
                          { id: "vc", label: "Silicon VC", icon: "🕶️" },
                        ].map((persona) => (
                          <button
                            key={persona.id}
                            type="button"
                            onClick={() => setRoastPersona(persona.id)}
                            className={`py-1.5 px-1 rounded-lg border text-center transition-all text-[10px] font-extrabold ${
                              roastPersona === persona.id
                                ? "border-orange-500 bg-white shadow-sm ring-2 ring-orange-50 text-orange-900"
                                : "border-stone-200/80 bg-stone-50/50 text-stone-650 hover:bg-stone-50"
                            }`}
                          >
                            <span>{persona.icon} {persona.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Submit CTA */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${
                      isLoading
                        ? "bg-stone-400 cursor-not-allowed"
                        : selectedMode === "roast"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini compiling parameters...</span>
                      </>
                    ) : (
                      <>
                        <span>Execute Professional Analysis</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </form>
            </div>


            {/* OUTPUT LOGS (7 Columns) */}
            <div className="lg:col-span-7 space-y-6 print:w-full">
              
              {/* Suspense / Loading Screen */}
              {isLoading && (
                <div className={`border rounded-2xl p-12 shadow-sm text-center space-y-6 transition-colors ${
                  selectedMode === "roast" 
                    ? "border-orange-200 bg-orange-50/10" 
                    : "border-emerald-200 bg-emerald-50/10"
                }`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce ${
                    selectedMode === "roast" ? "bg-orange-100" : "bg-emerald-100"
                  }`}>
                    {selectedMode === "roast" ? "🔥" : "🎯"}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-base text-stone-800">
                      {selectedMode === "roast" ? "Savage Recruiter Roasting..." : "Elite Optimizer Restructuring..."}
                    </h3>
                    <p className={`text-xs max-w-sm mx-auto font-extrabold p-3 rounded-xl italic ${
                      selectedMode === "roast" 
                        ? "bg-orange-50 text-orange-850 border border-orange-100" 
                        : "bg-emerald-50 text-emerald-850 border border-emerald-100"
                    }`}>
                      "{loadingPhase}"
                    </p>
                  </div>
                  <div className="w-1/2 h-1 bg-stone-100 rounded-full mx-auto overflow-hidden">
                    <div className={`h-full rounded-full animate-bar-slide w-1/3 ${
                      selectedMode === "roast" ? "bg-orange-500" : "bg-emerald-600"
                    }`}></div>
                  </div>
                </div>
              )}

              {/* Initial / Unloaded Overview */}
              {!isLoading && !analysisResult && (
                <div className="border border-stone-200 bg-white rounded-2xl p-12 shadow-sm text-center space-y-6">
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto border border-stone-200/80">
                    <Building className="w-6 h-6 text-stone-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-base text-stone-800">
                      Corporate Sandbox Analyzer Ready
                    </h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                      Select target industrial segments, paste weak elements or load PDF assets, and trigger critical analysis logs with full-stack Gemini engines.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setResumeText(`Emily Smith\nJunior Marketing Specialist\n\n- Handled social media operations\n- Handled team synergy & communications\n- Wrote several interesting articles to drive performance metrics`);
                        setSelectedIndustry("Marketing");
                      }}
                      className="px-4 py-2 border border-stone-200 hover:border-orange-500 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 transition-all inline-flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>Prepopulate Sandbox Marketing template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STUNNING PROFESSIONAL RESULT VISUALIZER */}
              {!isLoading && analysisResult && (
                <div className="space-y-6">
                  
                  {/* Recruiter Reaction Panel (Professional Layout) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Score Wheel */}
                    <div className="md:col-span-5 border border-stone-200 bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-extrabold text-stone-400 tracking-widest uppercase">ATS Audit Rank</span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className={`text-5xl font-display font-extrabold ${
                            analysisResult.atsScore > 75 
                              ? "text-emerald-600" 
                              : analysisResult.atsScore > 45 
                              ? "text-orange-500" 
                              : "text-red-500"
                          }`}>
                            {analysisResult.atsScore}
                          </span>
                          <span className="text-stone-400 font-bold text-sm">/ 100</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="h-2 w-full bg-stone-105 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              analysisResult.atsScore > 75
                                ? "bg-emerald-500"
                                : analysisResult.atsScore > 45
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${analysisResult.atsScore}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-2 font-medium">
                          {analysisResult.atsScore > 75
                            ? "Highly compatible parsing structure!"
                            : analysisResult.atsScore > 45
                            ? "Partially formatted. Lacks keyword depth."
                            : "Vulnerable to automated rejection algorithms."}
                        </p>
                      </div>
                    </div>

                    {/* Recruiter Live Evaluation Thought */}
                    <div className={`md:col-span-7 border rounded-2xl p-5 shadow-sm flex flex-col justify-between ${
                      getReactionStyle(analysisResult.reactionCategory).bg
                    } ${getReactionStyle(analysisResult.reactionCategory).border}`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-extrabold tracking-widest uppercase text-stone-500">
                            Recruiter Verification Index
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                            getReactionStyle(analysisResult.reactionCategory).badge
                          }`}>
                            {getReactionStyle(analysisResult.reactionCategory).label}
                          </span>
                        </div>
                        <p className="font-display font-bold text-xs text-stone-800 leading-relaxed italic">
                          "{analysisResult.reaction}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/40 text-[9px] text-stone-500 flex items-center justify-between">
                        <span>Status: Logged off sandbox desk</span>
                        <span className="font-bold">Evaluation Sandbox 📋</span>
                      </div>
                    </div>

                  </div>

                  {/* HIGHLY PROFESSIONAL FILTER TABS FOR RESULTS OUTPUT */}
                  <div className="border border-stone-200 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row border-b border-stone-100 bg-stone-50/50 sm:items-center sm:justify-between print:hidden">
                      <div className="flex flex-1 overflow-x-auto min-w-0">
                        {/* ATS Scorecard & Flags Tab */}
                        <button
                          type="button"
                          onClick={() => setOutputTab("ats")}
                          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-r border-stone-100 flex items-center justify-center space-x-1.5 min-w-[140px] ${
                            outputTab === "ats"
                              ? "bg-white text-stone-900 border-t-2 border-t-stone-900"
                              : "text-stone-500 hover:text-stone-850"
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 text-stone-600" />
                          <span>ATS Compliance Card</span>
                        </button>

                        {/* Bullet Refactoring Tab */}
                        <button
                          type="button"
                          onClick={() => setOutputTab("bullets")}
                          className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-r border-[#EFEFEF] flex items-center justify-center space-x-1.5 min-w-[140px] ${
                            outputTab === "bullets"
                              ? "bg-white text-stone-900 border-t-2 border-t-stone-900"
                              : "text-stone-500 hover:text-stone-850"
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>Bullet refactoring Desk</span>
                        </button>

                        {/* Recruiter Narrative Analysis */}
                        <button
                          type="button"
                          onClick={() => setOutputTab("roast")}
                          className={`flex-1 py-3 px-4 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 min-w-[140px] ${
                            outputTab === "roast"
                              ? "bg-white text-stone-900 border-t-2 border-t-stone-900"
                              : "text-stone-500 hover:text-stone-850"
                          }`}
                        >
                          <FileText className="w-4 h-4 text-orange-500" />
                          <span>Recruiter Assessment</span>
                        </button>
                      </div>

                      {/* Download PDF Trigger Button */}
                      <div className="p-2 sm:py-0 sm:px-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (analysisResult) {
                              downloadReportPDF(analysisResult);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-stone-950 hover:bg-stone-850 text-white flex items-center space-x-1.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-stone-950/10 active:scale-95"
                          title="Save report to high-quality PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* RENDERING DYNAMIC INNER TABS */}
                    <div className="p-6">
                      
                      {/* 1. ATS COMPLIANCE TAB */}
                      {outputTab === "ats" && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-widest flex items-center space-x-1.5">
                              <Target className="w-4 h-4 text-stone-600" />
                              <span>Corporate Buzzwords Detected to Avoid</span>
                            </h4>

                            {analysisResult.buzzwords && analysisResult.buzzwords.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-xs text-stone-500 leading-relaxed">
                                  Standard corporate clichés decrease your search density. These empty descriptions should be replaced with action nouns:
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {analysisResult.buzzwords.map((bullet, i) => (
                                    <span
                                      key={i}
                                      className="text-[11px] font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/65 rounded-lg flex items-center space-x-1"
                                    >
                                      <span>🚨</span>
                                      <span>{bullet}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex items-center space-x-1.5 font-semibold">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>Ideal keyword structure. No major visual clutter or buzzwords found.</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-5 border-t border-stone-100 space-y-4">
                            <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-widest flex items-center space-x-1.5">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span>Missing Metrics & Empirical proof</span>
                            </h4>
                            <p className="text-xs text-stone-500 leading-relaxed">
                              Recruiters filter resume blocks by quantifiable deliverables (e.g. revenue%, efficiency, count). These bullets require hard empirical proof:
                            </p>

                            {/* Missing Metrics Render */}
                            {analysisResult.missingMetrics && analysisResult.missingMetrics.length > 0 ? (
                              <ul className="space-y-2 pl-0">
                                {analysisResult.missingMetrics.map((bullet, idx) => (
                                  <li key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-205 flex items-start space-x-3 text-xs text-stone-700 font-medium">
                                    <span className="text-orange-500 text-sm mt-0.5">•</span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-stone-400 italic">No missing critical metrics spotted by parser.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. BULLET REFACTOR SHEET - PROFESSIONAL WAY */}
                      {outputTab === "bullets" && (
                        <div className="space-y-5">
                          <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                            Transform weak descriptions into impact-oriented statements focusing on action, challenge, and quantifiable results:
                          </p>

                          {analysisResult.suggestedFormatAfter ? (
                            <div className="border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm">
                              <div className="bg-stone-50 p-3 border-b border-stone-200/60 font-mono text-[10px] text-stone-500 font-extrabold uppercase tracking-widest flex items-center justify-between">
                                <span>Refactoring hub template</span>
                                <span className="bg-stone-200 text-stone-700 px-1.5 rounded text-[9px] lowercase">Before & after</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                                {/* Before Segment */}
                                <div className="p-4 bg-red-50/20 text-xs">
                                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest block mb-2 w-max">
                                    ❌ Original Statement
                                  </span>
                                  <p className="text-stone-700 italic font-medium">
                                    "{analysisResult.suggestedFormatBefore}"
                                  </p>
                                </div>

                                {/* After Segment */}
                                <div className="p-4 bg-emerald-50/20 text-xs">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                      ✨ Refactored Output
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(analysisResult.suggestedFormatAfter)}
                                      className="text-stone-500 hover:text-stone-900 p-0.5 print:hidden"
                                      title="Copy template"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-stone-700" />
                                    </button>
                                  </div>
                                  <p className="text-stone-900 font-bold leading-relaxed">
                                    "{analysisResult.suggestedFormatAfter}"
                                  </p>
                                </div>
                              </div>

                              {analysisResult.suggestedFormatWhy && (
                                <div className="bg-stone-50/80 p-4 border-t border-stone-200/60 text-xs text-stone-600 flex items-start space-x-2">
                                  <span className="text-lg">💡</span>
                                  <div>
                                    <p className="font-extrabold text-stone-850">Strategy of optimization:</p>
                                    <p className="mt-0.5 text-stone-500">{analysisResult.suggestedFormatWhy}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-8 border-2 border-dashed border-stone-200 rounded-xl text-center">
                              <p className="text-xs text-stone-400">Generate analysis in Optimizer mode to display interactive side-by-side statements.</p>
                            </div>
                          )}

                          <div className="pt-2 flex justify-end print:hidden">
                            <button
                              onClick={() => copyToClipboard(analysisResult.suggestedFormatAfter)}
                              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5"
                            >
                              {copiedIndex ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  <span>Copied Refactored Bullet!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy to Clipboard</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. ROASTER CRITIQUE BREAKDOWN TAB (MARKDOWN RENDER) */}
                      {outputTab === "roast" && (
                        <div className="space-y-5">
                          {/* Rich Report Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-stone-200 bg-stone-50 rounded-2xl p-4 gap-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                selectedMode === "roast" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                              }`}>
                                {selectedMode === "roast" ? "🔥" : "📊"}
                              </div>
                              <div>
                                <h4 className="text-xs font-extrabold text-stone-850 uppercase tracking-widest">
                                  {selectedMode === "roast" ? "Executive Roast Audit" : "ATS Optimization Report"}
                                </h4>
                                <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                                  {selectedMode === "roast" 
                                    ? `Persona: ${roastPersona.toUpperCase()} • Severity: ${roastLevel.toUpperCase()}`
                                    : `Focus Area: ${optimizationDirective.toUpperCase()}`
                                  } • Tailored for {selectedIndustry}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                copyToClipboard(analysisResult.contentMarkdown);
                              }}
                              className="px-3 py-1.5 border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 rounded-lg text-[10px] font-bold text-stone-700 transition-all flex items-center space-x-1.5 self-start sm:self-auto print:hidden"
                            >
                              {copiedIndex ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Copied Report!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Entire Report</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Beautiful Report Body */}
                          <div className={`relative border rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden bg-white ${
                            selectedMode === "roast" 
                              ? "border-orange-100/80 bg-orange-50/5" 
                              : "border-emerald-100/80 bg-emerald-50/5"
                          }`}>
                            {/* Decorative badge / watermark */}
                            <div className="absolute right-4 top-4 select-none opacity-[0.03] font-display font-black text-6xl pointer-events-none uppercase tracking-wider">
                              {selectedMode === "roast" ? "ROAST" : "OPTIMIZE"}
                            </div>

                            <div className="prose max-w-none text-xs leading-relaxed select-text font-normal text-stone-800">
                              <ReactMarkdown
                                components={{
                                  h1: ({ ...props }) => <h1 className="font-display text-base font-extrabold text-stone-900 border-b border-stone-200/60 pb-1.5 mb-4 mt-6 leading-tight first:mt-0" {...props} />,
                                  h2: ({ ...props }) => <h2 className="font-display text-sm font-extrabold text-stone-850 uppercase tracking-widest mt-5 mb-2.5 flex items-center gap-2 text-stone-950" {...props} />,
                                  h3: ({ ...props }) => <h3 className="font-display text-xs font-bold text-stone-800 mt-4 mb-2 tracking-wide" {...props} />,
                                  p: ({ ...props }) => <p className="text-stone-700 text-xs leading-relaxed mb-3" {...props} />,
                                  ul: ({ ...props }) => <ul className="space-y-1.5 mb-4 pl-0 text-stone-700 list-none" {...props} />,
                                  ol: ({ ...props }) => <ol className="list-decimal space-y-1.5 mb-4 pl-4 text-stone-700" {...props} />,
                                  li: ({ ...props }) => (
                                    <li className="flex items-start gap-2 text-xs text-stone-700 font-medium">
                                      <span className={`text-base leading-none select-none font-black ${
                                        selectedMode === "roast" ? "text-orange-500" : "text-emerald-500"
                                      }`}>•</span>
                                      <span className="flex-1">{props.children}</span>
                                    </li>
                                  ),
                                  strong: ({ ...props }) => <strong className="font-extrabold text-stone-950 bg-stone-100/60 px-1 py-0.5 rounded border border-stone-200/30" {...props} />,
                                  blockquote: ({ ...props }) => (
                                    <blockquote className={`border-l-4 px-4 py-3 rounded-r-xl my-4 text-xs italic font-semibold ${
                                      selectedMode === "roast"
                                        ? "border-orange-400 bg-orange-50/50 text-orange-950"
                                        : "border-emerald-500 bg-emerald-50/50 text-emerald-950"
                                    }`} {...props} />
                                  ),
                                  code: ({ ...props }) => <code className="font-mono text-[10.5px] bg-stone-100/80 text-stone-850 px-1.5 py-0.5 rounded border border-stone-200/40 font-semibold" {...props} />
                                }}
                              >
                                {analysisResult.contentMarkdown}
                              </ReactMarkdown>
                            </div>
                            
                            {/* Verified Footnote */}
                            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium font-mono uppercase tracking-wider">
                              <span>Report ID: {analysisResult.atsScore > 60 ? "PASS-AUTO_AUDIT" : "FLAG-AUTO_REV_01"}</span>
                              <span>Verified by {selectedMode === "roast" ? "Roast AI" : "Optimize AI"}</span>
                            </div>
                          </div>

                          {/* Dedicated Strategic Advice Block */}
                          <div className={`border rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all ${
                            selectedMode === "roast"
                              ? "bg-amber-50/20 border-orange-100/70 hover:border-orange-200 text-stone-800"
                              : "bg-emerald-50/15 border-emerald-100/70 hover:border-emerald-200 text-stone-800"
                          }`}>
                            <div className="flex items-start gap-3.5">
                              <span className="text-2xl select-none leading-none mt-0.5">
                                {selectedMode === "optimize" ? OPTIMIZER_QUOTES[quoteIndex % 4].icon : ROASTER_QUOTES[quoteIndex % 4].icon}
                              </span>
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    selectedMode === "optimize"
                                      ? "bg-emerald-100/80 text-emerald-800"
                                      : "bg-orange-100/80 text-orange-900 border border-orange-200/20"
                                  }`}>
                                    Strategic Insight • {selectedMode === "optimize" ? OPTIMIZER_QUOTES[quoteIndex % 4].tag : ROASTER_QUOTES[quoteIndex % 4].tag}
                                  </span>
                                  
                                  <button
                                    type="button"
                                    onClick={() => setQuoteIndex((prev) => (prev + 1) % 4)}
                                    className={`text-[9px] font-black uppercase tracking-widest flex items-center space-x-1 hover:opacity-85 transition-all ${
                                      selectedMode === "optimize" ? "text-emerald-700" : "text-orange-700"
                                    }`}
                                  >
                                    <span>Cycle Advice 🔄</span>
                                  </button>
                                </div>
                                <p className="font-semibold text-stone-700 leading-relaxed text-xs">
                                  "{selectedMode === "optimize" ? OPTIMIZER_QUOTES[quoteIndex % 4].text : ROASTER_QUOTES[quoteIndex % 4].text}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
