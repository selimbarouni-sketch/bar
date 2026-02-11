import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, Trash2, Sparkles, TrendingUp, History as HistoryIcon, 
  ChevronRight, Award, ListChecks, MessageSquare, Sun, Moon, Palette, X, Copy, Check
} from 'lucide-react';
import CalculatorButton from './components/CalculatorButton';
import { analyzeGrades } from './services/geminiService';
import { HistoryItem } from './types';

type Theme = 'emerald' | 'indigo' | 'rose' | 'slate' | 'dark';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [gradeParts, setGradeParts] = useState<number[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('profcalc-theme') as Theme) || 'emerald');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const GRADE_BUTTONS = [
    0.25, 0.5, 0.75, 1.0, 
    1.25, 1.5, 1.75, 2.0, 
    2.25, 2.5, 2.75, 3.0,
    3.25, 3.5, 4.0, 5.0
  ];

  const currentTotal = Number(gradeParts.reduce((a, b) => a + b, 0).toFixed(2));

  useEffect(() => {
    localStorage.setItem('profcalc-theme', theme);
  }, [theme]);

  const handleClear = () => {
    if (gradeParts.length > 0) {
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression: gradeParts.join(' + '),
        result: currentTotal,
        timestamp: new Date(),
      };
      setHistory([newHistoryItem, ...history].slice(0, 50));
      
      navigator.clipboard.writeText(currentTotal.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setGradeParts([]);
    setAiAnalysis(null);
  };

  const addGradePart = (val: number) => {
    setGradeParts(prev => [...prev, val]);
  };

  const removeGradePart = (index: number) => {
    setGradeParts(prev => prev.filter((_, i) => i !== index));
  };

  const triggerAIAnalysis = async () => {
    if (gradeParts.length < 3) {
      alert("Ajoutez au moins 3 segments de notes pour une analyse pertinente.");
      return;
    }
    setIsAnalyzing(true);
    const result = await analyzeGrades(gradeParts);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gradeParts]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'indigo': return { bg: 'bg-indigo-50', primary: 'emerald-600', accent: 'indigo-600', text: 'text-indigo-900', glass: 'border-indigo-100', footer: 'text-indigo-400' };
      case 'rose': return { bg: 'bg-rose-50', primary: 'rose-600', accent: 'rose-500', text: 'text-rose-900', glass: 'border-rose-100', footer: 'text-rose-400' };
      case 'slate': return { bg: 'bg-slate-100', primary: 'slate-800', accent: 'slate-600', text: 'text-slate-900', glass: 'border-slate-200', footer: 'text-slate-400' };
      case 'dark': return { bg: 'bg-slate-900', primary: 'emerald-500', accent: 'slate-700', text: 'text-white', glass: 'border-slate-700 bg-slate-800/50', footer: 'text-slate-500' };
      default: return { bg: 'bg-emerald-50/30', primary: 'emerald-600', accent: 'emerald-500', text: 'text-slate-900', glass: 'border-emerald-100', footer: 'text-emerald-400' };
    }
  };

  const t = getThemeClasses();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-12 ${t.bg} ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 safe-pt">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-lg bg-white ${isDark ? 'bg-slate-800 border border-slate-700' : ''}`}>
              <Award className={`text-${t.primary}`} size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                ProfCalc <span className={`text-${t.primary}`}>Barème</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm self-start">
            {(['emerald', 'indigo', 'rose', 'slate', 'dark'] as Theme[]).map((thm) => (
              <button
                key={thm}
                onClick={() => setTheme(thm)}
                aria-label={`Thème ${thm}`}
                className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${theme === thm ? 'scale-110 shadow-lg border-2 border-white' : 'opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: thm === 'dark' ? '#0f172a' : thm === 'emerald' ? '#10b981' : thm === 'indigo' ? '#6366f1' : thm === 'rose' ? '#f43f5e' : '#64748b' }}
              >
                {theme === thm && (thm === 'dark' ? <Moon size={14} className="text-white" /> : <Palette size={14} className="text-white" />)}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <div className={`glass rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-2 transition-all ${t.glass}`}>
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-${t.primary} animate-pulse`}></span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Écran de Correction</span>
              </div>
              
              <div className="flex flex-col items-end justify-center py-4 min-h-[140px]">
                <div className={`text-right font-mono-calc text-lg md:text-xl mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full flex flex-row-reverse items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {gradeParts.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      {gradeParts.map((p, idx) => (
                        <span key={idx} className="flex items-center">
                          {p}{idx < gradeParts.length - 1 && <span className="mx-1 text-emerald-500 font-bold">+</span>}
                        </span>
                      ))}
                    </div>
                  ) : <span className="opacity-50 italic">Saisissez les points...</span>}
                </div>
                <div className="text-7xl md:text-8xl font-black font-mono-calc tracking-tighter leading-none">
                  {currentTotal}
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleClear}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
                    copied 
                    ? 'bg-emerald-500 text-white' 
                    : (isDark ? 'bg-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white' : 'bg-slate-900 text-white hover:bg-emerald-600')
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copié !' : 'Valider'}
                </button>
              </div>
            </div>

            <div className={`rounded-[2.5rem] p-6 shadow-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {GRADE_BUTTONS.map(val => (
                  <CalculatorButton 
                    key={val} 
                    label={`+${val}`} 
                    onClick={() => addGradePart(val)} 
                    variant="grade"
                    className={`!h-14 md:!h-16 !text-lg md:!text-xl shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transform transition-all ${isDark ? 'bg-slate-700/50 border-slate-900 text-emerald-400 hover:bg-slate-600' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className={`rounded-[2.5rem] p-6 shadow-xl border flex flex-col h-full max-h-[400px] transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <ListChecks className="text-blue-500" size={20} />
                  Correction / Liste
                </h2>
               </div>
              <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {gradeParts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 italic gap-2 opacity-60">
                     <ChevronRight size={24} />
                     <p className="text-xs">Aucun point</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {gradeParts.map((p, i) => (
                      <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400">#{i+1}</span>
                          <span className={`font-mono-calc font-bold text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>+{p}</span>
                        </div>
                        <button 
                          onClick={() => removeGradePart(i)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`rounded-[2.5rem] p-6 shadow-xl text-white relative overflow-hidden transition-all ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gradient-to-br from-indigo-600 to-blue-700'}`}>
              <Sparkles className="absolute -right-4 -bottom-4 text-white/10" size={120} />
              <div className="relative z-10">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <MessageSquare size={18} />
                  Analyse IA
                </h2>
                <div className={`rounded-xl p-3 min-h-[80px] mb-4 text-xs leading-relaxed italic ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-white/10 backdrop-blur-md text-indigo-50'}`}>
                  {aiAnalysis ? (
                    <div className="prose prose-invert prose-xs" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>') }} />
                  ) : (
                    "Besoin d'un retour pédagogique sur ces points ?"
                  )}
                </div>
                <button 
                  onClick={triggerAIAnalysis}
                  disabled={isAnalyzing || gradeParts.length < 3}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isAnalyzing || gradeParts.length < 3 
                    ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md active:scale-95'
                  }`}
                >
                  {isAnalyzing ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : 'Générer l\'Analyse'}
                </button>
              </div>
            </div>

            {history.length > 0 && (
              <div className={`rounded-[2rem] p-6 shadow-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <h2 className={`text-sm font-bold flex items-center gap-2 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <HistoryIcon size={16} /> Historique récent
                </h2>
                <div className="space-y-2">
                  {history.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-400/5">
                       <span className="text-[10px] opacity-50 font-mono-calc truncate max-w-[120px]">{item.expression}</span>
                       <span className="font-black text-emerald-500">{item.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className={`text-center text-xs mt-4 safe-pb ${t.footer}`}>
          ProfCalc Pro &copy; {new Date().getFullYear()} - PWA Grade Calculator
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        ${isDark ? '.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }' : ''}
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;