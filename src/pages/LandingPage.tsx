import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, Zap, Activity, Stethoscope, ChevronRight } from "lucide-react";
import { SearchInterface } from "@/components/SearchInterface";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm shadow-blue-600/20">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Clinicode</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/analyze" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Analyzer</Link>
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/analyze">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all">
              Analyze Report
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
              <Activity size={14} />
              <span>Clinical Grade Precision</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
              Instant ICD-10 Search & <br />
              <span className="text-blue-600">Intelligent Analysis</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Access the complete ICD-10 database instantly or analyze medical reports with AI-powered precision. Privacy-first, no data stored.
            </p>

            {/* Search Interface as Default */}
            <div className="mb-12">
              <SearchInterface />
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} /> No Login Required
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={14} /> Real-time Results
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <span className="text-sm text-slate-400">Or try the full report analyzer</span>
               <Link to="/analyze" className="group">
                 <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto gap-1">
                   Go to Analyzer <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                 </Button>
               </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Designed for Clinical Efficiency</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Streamline your coding workflow with tools built for speed, accuracy, and absolute privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart ICD Search</h3>
                <p className="text-slate-500 leading-relaxed">
                  Fuzzy search logic handles typos and medical synonyms, helping you find the right code instantly without exact matches.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 text-teal-500 group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Report Analyzer</h3>
                <p className="text-slate-500 leading-relaxed">
                  Paste clinical notes to automatically detect conditions. Our system highlights terms and suggests codes with confidence scores.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Data Retention</h3>
                <p className="text-slate-500 leading-relaxed">
                  Your patient data never leaves the active session. We process everything in real-time and store absolutely nothing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 opacity-80">
            <div className="bg-slate-100 p-1 rounded">
              <ShieldCheck size={16} className="text-slate-500" />
            </div>
            <span className="font-semibold text-slate-600">Clinicode</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right max-w-md">
            <strong>Disclaimer:</strong> This tool is for coding assistance only. Not for clinical diagnosis. Always verify codes with official documentation.
          </p>
        </div>
      </footer>
    </div>
  );
}
