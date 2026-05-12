import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  BarChart3, 
  Search,
  AlertTriangle,
  History,
  Target,
  Globe,
  Calendar,
  Layers,
  TrendingUp,
  Zap,
  Eye,
  Lock,
  Wifi
} from 'lucide-react';
import { analyzeFixture, PredictionResult, FixedStatus } from './services/predictionService';

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);

  // Initial greeting
  useEffect(() => {
    console.log("EdgePlay ready. Send a fixture.");
  }, []);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeFixture(input);
      setResult(data);
      setHistory(prev => [data, ...prev].slice(0, 5));
    } catch (err) {
      setError('Analysis failed. The forensic engine encountered an error.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: FixedStatus) => {
    switch (status) {
      case FixedStatus.FIXED: return 'text-red-500 border-red-500/50 bg-red-500/10';
      case FixedStatus.SUSPICIOUS: return 'text-[#F7B733] border-[#F7B733]/50 bg-[#F7B733]/10';
      case FixedStatus.CLEAN: return 'text-[#66FCF1] border-[#66FCF1]/50 bg-[#66FCF1]/10';
      default: return 'text-[#C5C6C7] border-[#1F2833] bg-[#1F2833]';
    }
  };

  const statusIcon = (status: FixedStatus) => {
    switch (status) {
      case FixedStatus.FIXED: return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case FixedStatus.SUSPICIOUS: return <ShieldAlert className="w-5 h-5 text-[#F7B733]" />;
      case FixedStatus.CLEAN: return <ShieldCheck className="w-5 h-5 text-[#66FCF1]" />;
      default: return <ShieldAlert className="w-5 h-5 text-[#C5C6C7]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-mono selection:bg-[#66FCF1]/30 p-2 md:p-6 border-[12px] border-[#1F2833]">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#45A29E_1px,transparent_1px)] [background-size:15px_15px]" />
      
      {/* Header */}
      <header className="relative border-b border-[#45A29E] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 bg-[#66FCF1] rounded-full shadow-[0_0_15px_#66FCF1] animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-[#66FCF1]">EDGEPLAY <span className="text-xs opacity-50 ml-1 font-normal tracking-normal">// FORENSIC ENGINE v4.5</span></h1>
          </div>
        </div>
        
          <div className="text-right flex flex-col items-end gap-1">
            <p className="text-[10px] tracking-widest text-[#45A29E] flex items-center gap-2 uppercase">
              ENGINE STATUS: <span className="text-[#66FCF1] flex items-center gap-1 font-bold"><Zap className="w-3 h-3 fill-[#66FCF1]" /> HIGH_OPTIMIZED</span>
            </p>
            <p className="text-[10px] tracking-widest text-[#45A29E] uppercase flex items-center gap-2">
              MARKET_FEED: <span className="text-[#66FCF1]">PARALLEL_STREAMS</span>
            </p>
            <p className="text-[10px] tracking-widest text-[#45A29E] uppercase">UI_LATENCY: 0.1ms</p>
          </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative">
        {/* Input Area */}
        <section className="relative group max-w-2xl mx-auto mb-12">
          <div className="absolute -inset-0.5 bg-[#66FCF1] opacity-20 blur shadow-[0_0_20px_rgba(102,252,241,0.1)] group-focus-within:opacity-40 transition duration-500" />
          <form onSubmit={handleAnalyze} className="relative bg-[#0B0C10] border border-[#45A29E] p-1 flex items-center">
            <div className="pl-4 pr-2">
              <Search className="w-5 h-5 text-[#45A29E]" />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER FIXTURE FOR FAST EXTRACTION..."
              className="bg-transparent border-none outline-none w-full py-4 px-2 text-white placeholder:text-[#45A29E]/50 uppercase text-sm tracking-widest"
              autoFocus
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#66FCF1] hover:bg-[#45A29E] text-black px-8 py-4 transition-all font-black uppercase text-xs disabled:opacity-30 disabled:hover:bg-[#66FCF1]"
            >
              {loading ? <Scan className="w-5 h-5 animate-spin" /> : 'EXTRACT'}
            </button>
          </form>
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.03 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="h-[2px] w-full bg-[#1F2833] relative overflow-hidden">
                <motion.div 
                   initial={{ x: "-100%" }}
                   animate={{ x: "100%" }}
                   transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 bg-[#66FCF1]"
                />
              </div>
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="text-[10px] text-[#66FCF1] tracking-[0.5em] font-bold uppercase">PARALLEL_MODULES_ACTIVE</div>
                <div className="text-xs text-[#45A29E] animate-pulse">BATCHING FACTOR PULLS...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Primary Column - Prediction First */}
              <motion.div 
                variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                className="lg:col-span-4 space-y-4"
              >
                <div className="bg-[#1F2833] p-6 border-l-4 border-[#45A29E]">
                  <p className="text-[10px] text-[#45A29E] uppercase mb-2 tracking-widest">Match Data</p>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 leading-tight">
                    {result.detected_fixture.home_team} <br/><span className="text-[#66FCF1] text-xs">VS</span><br/> {result.detected_fixture.away_team}
                  </h2>
                </div>

                <div className="bg-[#1F2833] p-6 border-l-4 border-[#66FCF1]">
                  <p className="text-[10px] text-[#66FCF1] uppercase tracking-widest mb-1">Neural Forecast</p>
                  <div className="text-8xl font-black text-white tracking-widest leading-none drop-shadow-[0_0_10px_rgba(102,252,241,0.2)]">
                    {result.investor_controlled_score}
                  </div>
                </div>

                <div className="bg-[#1F2833] p-6 border-l-4 border-purple-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-4">
                     <Lock className="w-20 h-20 text-purple-500" />
                  </div>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-1">Insider Signal</p>
                  <div className="text-6xl font-black text-white tracking-widest relative z-10">
                    {result.insider_correct_score}
                  </div>
                </div>

                <div className={`bg-[#1F2833] p-6 border-l-4 ${statusColor(result.fixed_status).split(' ')[1]}`}>
                  <p className="text-[10px] uppercase mb-2 tracking-widest opacity-70">Integrity Check</p>
                  <div className="text-3xl font-black tracking-tighter uppercase text-white">
                    {result.fixed_status}
                  </div>
                </div>
              </motion.div>

              {/* Forensic Details Column - Staggered */}
              <motion.div 
                variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                className="lg:col-span-8 flex flex-col gap-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <IndicatorCard label="1X2" value={result.one_x_two} />
                  <IndicatorCard label="O/U 2.5" value={result['over_under_2.5']} />
                  <IndicatorCard label="BTTS" value={result.btts} />
                  <IndicatorCard label="CONF" value={`${(result.confidence * 100).toFixed(0)}%`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                  <div className="bg-[#0B0C10] border-2 border-[#45A29E]/30 p-6 relative">
                    <p className="text-[9px] font-black text-[#45A29E] uppercase tracking-widest mb-4 border-b border-[#45A29E]/20 pb-2">FORENSIC_LOG</p>
                    <p className="text-xs leading-loose text-[#C5C6C7]">{result.reasoning_summary}</p>
                  </div>

                  <div className="bg-[#0B0C10] border-2 border-purple-500/30 p-6 relative">
                    <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-4 border-b border-purple-500/20 pb-2">INSIDER_LOG</p>
                    <p className="text-xs leading-loose text-[#C5C6C7]">{result.influence_details}</p>
                  </div>
                </div>

                <div className="bg-[#1F2833] p-4 flex justify-between items-center border border-[#45A29E]/10">
                   <div className="flex gap-4">
                      <div className="px-3 py-1 bg-[#66FCF1]/10 text-[#66FCF1] text-[8px] font-bold border border-[#66FCF1]/20 uppercase">HT/FT: {result.ht_ft}</div>
                      <div className="px-3 py-1 bg-white/5 text-white/50 text-[8px] font-bold border border-white/10 uppercase">{result.soccer_pools_type}</div>
                   </div>
                   <div className="flex items-center gap-2 text-[9px] text-[#45A29E] opacity-50 uppercase">
                      <Wifi className="w-3 h-3" />
                      SYNC_COMPLETE
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-4">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <p>SYSTEM ERROR // EXECUTION HALTED</p>
              <p className="opacity-70 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Neural Archive */}
        {history.length > 0 && (
          <section className="space-y-4 pt-12 border-t border-[#1F2833]">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-[#45A29E]" />
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-[#45A29E]">Neural Archive</h2>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
               {history.map((item, idx) => (
                 <button 
                  key={idx}
                  onClick={() => setResult(item)}
                  className="bg-[#1F2833]/50 border border-[#45A29E]/10 p-4 hover:border-[#66FCF1]/30 transition-all text-left group"
                 >
                   <p className="text-[9px] text-[#45A29E] uppercase mb-1 truncate opacity-70">{item.detected_fixture.competition}</p>
                   <p className="text-[11px] font-black text-white group-hover:text-[#66FCF1] uppercase truncate">
                     {item.detected_fixture.home_team.split(' ')[0]} v {item.detected_fixture.away_team.split(' ')[0]}
                   </p>
                 </button>
               ))}
             </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#45A29E]/10 flex flex-col md:flex-row justify-between items-end text-[10px] opacity-40 uppercase tracking-[0.3em] font-bold">
        <div className="text-left">
          <p>© 2026 EDGEPLAY INTELLIGENCE SYSTEMS</p>
          <p className="mt-1 text-[#45A29E] font-normal">NEURAL CORE: v9.42-STABLE // PURE_MEMORY_FLOW</p>
        </div>
        <div className="text-right flex gap-8">
           <span className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> NO LOGS RETAINED</span>
           <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#66FCF1] rounded-full" /> ENCRYPTED_TUNNEL_ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}

function IndicatorCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#1F2833] p-6 flex flex-col justify-center items-center border border-[#45A29E]/30 hover:border-[#66FCF1]/50 transition-colors group">
      <p className="text-[9px] text-[#45A29E] mb-2 font-black uppercase tracking-[0.2em] group-hover:text-[#66FCF1] transition-colors">{label}</p>
      <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform">{value}</p>
    </div>
  );
}
