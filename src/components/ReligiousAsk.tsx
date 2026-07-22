import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Clock, 
  Trash2, 
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Search,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OFFLINE_QAS } from '../data/offlineQAs';
import { apiUrl } from '../lib/apiBase';

interface QAPair {
  question: string;
  answer: string;
  timestamp: string;
}

export const ReligiousAsk: React.FC = () => {
  const [askMode, setAskMode] = useState<'online' | 'offline'>('online');
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeAnswer, setActiveAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<QAPair[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Offline search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedQAId, setExpandedQAId] = useState<number | null>(null);

  // Preset suggestive questions
  const presetQuestions = [
    "ما فضل صلاة الضحى ووقتها؟",
    "كيف أحقق الخشوع والطمأنينة في صلاتي؟",
    "ما هي شروط قبول الدعاء في الإسلام؟",
    "ما فضل الاستغفار والمداومة عليه؟"
  ];

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('islamic_ai_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse Q&A history', e);
      }
    }
  }, []);

  const saveToHistory = (q: string, a: string) => {
    const newItem: QAPair = {
      question: q,
      answer: a,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newItem, ...history].slice(0, 15); // Limit to last 15 queries
    setHistory(updated);
    localStorage.setItem('islamic_ai_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (confirm('هل تريد مسح سجل الأسئلة بالكامل؟')) {
      setHistory([]);
      localStorage.removeItem('islamic_ai_history');
    }
  };

  const handleAsk = async (textToAsk: string) => {
    const query = textToAsk.trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setActiveAnswer('');

    try {
      const response = await fetch(apiUrl('/api/ask'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ ما أثناء معالجة السؤال.');
      }

      setActiveAnswer(data.answer);
      saveToHistory(query, data.answer);
    } catch (err: any) {
      // Automatic fallback to offline mode on connection failure or server error
      console.warn("Gemini API call failed, falling back to offline encyclopedia:", err);
      setError('تعذر الاتصال بالمستشار الذكي (أونلاين). تم تنشيط "موسوعة الفتاوى السريعة" أوفلاين تلقائياً لتصفح الإجابات الشرعية الموثقة فوراً دون انقطاع!');
      setAskMode('offline');
      // Pre-populate search query to match keywords of the asked question
      setSearchQuery(query);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // Helper function to format answer text elegantly with custom paragraphing and highlight citations
  const renderFormattedAnswer = (text: string) => {
    if (!text) return null;

    // Split text by double newlines to handle paragraphs
    const paragraphs = text.split('\n\n');

    return (
      <div className="space-y-4 text-stone-700 leading-loose text-right font-medium text-[15px] md:text-base">
        {paragraphs.map((para, i) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          // Check if paragraph is the final Islamic suffix
          if (trimmed.includes("والله تعالى أعلى وأعلم")) {
            return (
              <div 
                key={i} 
                className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border-r-4 border-emerald-700 rounded-l-xl text-emerald-900 dark:text-emerald-300 font-bold text-center text-sm md:text-base shadow-sm"
              >
                {trimmed}
              </div>
            );
          }

          // Check if paragraph starts with bullet points
          if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+[\.\)]/.test(trimmed) || trimmed.startsWith('١') || trimmed.startsWith('٢') || trimmed.startsWith('٣')) {
            const listItems = trimmed.split('\n').map(item => item.replace(/^[-*\s]+|^\d+[\.\)]\s*|^\D\.\s*/, '').trim());
            return (
              <ul key={i} className="list-disc list-inside space-y-2 pr-4 text-stone-800 dark:text-stone-200">
                {listItems.map((item, idx) => (
                  <li key={idx} className="marker:text-emerald-700">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          }

          // Format Quranic verses inside quotes elegantly
          let isCitation = false;
          let content = trimmed;
          if ((trimmed.startsWith('«') && trimmed.endsWith('»')) || (trimmed.startsWith('(') && trimmed.endsWith(')'))) {
            isCitation = true;
            content = trimmed.substring(1, trimmed.length - 1);
          }

          if (isCitation) {
            return (
              <blockquote key={i} className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border-r-4 border-amber-500 rounded-l-2xl font-serif text-[17px] text-amber-950 dark:text-amber-200 my-2 leading-relaxed italic shadow-sm">
                &ldquo;{content}&rdquo;
              </blockquote>
            );
          }

          return (
            <p key={i} className="text-stone-800 dark:text-stone-200 font-serif leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  // Filter offline QAs based on search query and category
  const filteredOfflineQAs = OFFLINE_QAS.filter(qa => {
    const matchesCategory = selectedCategory === 'all' || qa.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.categoryAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'prayer', label: 'الصلاة والعبادات' },
    { id: 'purity', label: 'الوضوء والطهارة' },
    { id: 'fasting', label: 'الصيام والزكاة' },
    { id: 'morals', label: 'الأخلاق والمعاملات' },
    { id: 'sunnah', label: 'السنن والمستحبات' }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="religious-ask-root">
      {/* Top Banner introducing the AI Assistant */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-right">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/30">
              <Sparkles className="h-5.5 w-5.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 font-serif">الركن الذكي للأسئلة الفقهية والشرعية</h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold mt-0.5">استفسر وتفقّه في أمور دينك (يعمل 100% بدون إنترنت)</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
            اطرح أي سؤال ديني يخص العبادات، المعاملات، الأخلاق، أو السيرة النبوية. يقوم النظام بالبحث السحابي عبر الذكاء الاصطناعي، أو يوفر لك مكتبة فقهية شاملة وسريعة تعمل بالكامل دون اتصال بالإنترنت في حال انقطاع الشبكة.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-150 dark:border-stone-700/50 self-start md:self-center">
          <button
            onClick={() => setAskMode('online')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              askMode === 'online'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-600 dark:text-stone-350 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>مستشار ذكي (أونلاين)</span>
          </button>
          <button
            onClick={() => setAskMode('offline')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              askMode === 'offline'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-600 dark:text-stone-350 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <WifiOff className="h-3.5 w-3.5" />
            <span>موسوعة أوفلاين (بلا إنترنت)</span>
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Preset suggestions & History logs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Preset suggestive questions (Only show when online mode is active) */}
          {askMode === 'online' && (
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-4 text-right animate-fade-in">
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <HelpCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>أسئلة شائعة ومقترحة للذكاء الاصطناعي</span>
              </h3>
              <div className="flex flex-col gap-2">
                {presetQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(q);
                      handleAsk(q);
                    }}
                    disabled={loading}
                    className="w-full text-right p-3 rounded-xl border border-stone-100 dark:border-stone-800/80 hover:border-emerald-200 dark:hover:border-emerald-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Offline categories checklist (Show in offline mode) */}
          {askMode === 'offline' && (
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-4 text-right animate-fade-in">
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <Filter className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>تصنيفات الفتاوى والأحكام</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => {
                  const count = cat.id === 'all' 
                    ? OFFLINE_QAS.length 
                    : OFFLINE_QAS.filter(x => x.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-350 border-r-4 border-emerald-750 font-black'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        {count}
                      </span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* History card log */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  title="مسح السجل"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>مسح</span>
                </button>
              )}
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                <span>سجل أسئلتك السابقة (محفوظ محلياً)</span>
              </h3>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setQuestion(item.question);
                      setActiveAnswer(item.answer);
                      setAskMode('online'); // Switch to online tab to display history item
                    }}
                    className="p-3 rounded-xl bg-stone-50/50 dark:bg-stone-800/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 border border-stone-100 dark:border-stone-800/50 hover:border-emerald-100 dark:hover:border-emerald-900 transition-all cursor-pointer text-right group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">{item.timestamp}</span>
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 truncate max-w-[150px]">
                        {item.question}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-450 truncate">
                      {item.answer.substring(0, 70)}...
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-xs">
                  <BookOpen className="h-8 w-8 mx-auto text-stone-200 dark:text-stone-800 mb-2" />
                  <p className="font-bold">لا يوجد أسئلة في السجل حالياً</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-550">تُحفظ أسئلتك على جهازك للوصول السريع إليها لاحقاً</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Main Interactive Screen depending on the chosen mode */}
        <div className="lg:col-span-2 space-y-6">

          {/* ONLINE ASK MODE */}
          {askMode === 'online' && (
            <div className="space-y-6 animate-fade-in">
              {/* Ask form input box */}
              <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-4 text-right">
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                  <span>اكتب سؤالك الشرعي للمستشار الذكي</span>
                </h3>
                
                <div className="space-y-3">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="مثال: ما هي السنن الرواتب لصلاة الفرض؟ وما هو وقت صلاة الليل بالتفصيل؟"
                    className="w-full h-32 p-4 bg-stone-50/50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all text-right resize-none"
                    disabled={loading}
                  />
                  
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
                      * الإجابات مبنية حصرياً على الكتاب والسنّة النبوية المطهرة.
                    </span>
                    
                    <button
                      onClick={() => handleAsk(question)}
                      disabled={loading || !question.trim()}
                      className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-6 rounded-xl text-xs font-bold shadow-md shadow-emerald-700/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          <span>جاري البحث والصياغة...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 transform rotate-180" />
                          <span>اسأل المستشار الذكي</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error presentation with friendly notice of offline fallback */}
              {error && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 rounded-2xl flex items-start gap-3 text-right">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold">تنبيه فني ونظام أوفلاين ذكي</h4>
                    <p className="text-xs font-semibold leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Active Answer display panel */}
              <AnimatePresence mode="wait">
                {(loading || activeAnswer) && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-5 text-right relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div className="flex gap-2">
                        {activeAnswer && !loading && (
                          <button
                            onClick={() => copyToClipboard(activeAnswer, 100)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
                            title="نسخ الإجابة"
                          >
                            {copiedIndex === 100 ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500 font-bold">إجابة المستشار الشرعي الذكي</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                      </div>
                    </div>

                    {loading ? (
                      <div className="py-12 space-y-4 text-center">
                        <Sparkles className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
                        <p className="text-stone-500 dark:text-stone-400 text-sm font-bold animate-pulse">
                          جاري صياغة الإجابة الفقهية من مصادرها الشريفة...
                        </p>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
                          يرجى الانتظار قليلاً ريثما يقوم الذكاء الاصطناعي باستخراج الأدلة والآيات الكريمة
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {renderFormattedAnswer(activeAnswer)}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* OFFLINE ENCYCLOPEDIA MODE */}
          {askMode === 'offline' && (
            <div className="space-y-6 animate-fade-in">
              {/* Search & Statistics Panel */}
              <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-4 text-right">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-700" />
                    <span>موسوعة الأحكام الشرعية والفتاوى الجاهزة (بلا إنترنت)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-100/30">
                    يعمل دون اتصال بالإنترنت 💚
                  </span>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  ابحث وتصفح أحكام الصلاة، الطهارة، الصيام، الأخلاق والتعاملات، والسنن النبوية المستقاة من أصح الكتب والعلماء مباشرةً دون الحاجة لشبكة الإنترنت.
                </p>

                {/* Search Input Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالكلمات المفتاحية... (مثال: صلاة، وضوء، توبة، صيام، غيبة)"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all text-right"
                  />
                  <div className="absolute left-3 top-3.5 text-stone-400 dark:text-stone-550">
                    <Search className="h-4 w-4" />
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute left-10 top-3 text-xs font-bold text-stone-400 hover:text-stone-600 px-1 py-0.5 cursor-pointer"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>

              {/* List of filtered QAs */}
              <div className="space-y-4">
                {filteredOfflineQAs.length > 0 ? (
                  filteredOfflineQAs.map((qa) => {
                    const isExpanded = expandedQAId === qa.id;
                    return (
                      <div 
                        key={qa.id}
                        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800/60 shadow-sm overflow-hidden transition-all text-right"
                      >
                        {/* Header Button */}
                        <button
                          onClick={() => setExpandedQAId(isExpanded ? null : qa.id)}
                          className="w-full flex justify-between items-center p-5 text-right hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-all cursor-pointer"
                        >
                          <div className="text-stone-400 dark:text-stone-500">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 pr-3 pl-2 space-y-1">
                            <span className="text-[9px] font-black bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full">
                              {qa.categoryAr}
                            </span>
                            <h4 className="text-sm md:text-[15px] font-bold text-stone-850 dark:text-stone-100 font-serif leading-relaxed">
                              {qa.question}
                            </h4>
                          </div>
                        </button>

                        {/* Expandable Content Panel */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-stone-100 dark:border-stone-800 bg-stone-50/20 dark:bg-stone-900/30"
                            >
                              <div className="p-6 space-y-4">
                                {/* Copy Button */}
                                <div className="flex justify-end border-b border-stone-100 dark:border-stone-800 pb-2">
                                  <button
                                    onClick={() => copyToClipboard(qa.answer, qa.id)}
                                    className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-lg cursor-pointer transition-all"
                                  >
                                    {copiedIndex === qa.id ? (
                                      <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span>تم نسخ الفتوى!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>نسخ هذه الفتوى والجواب</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Formatted Response */}
                                <div className="space-y-4">
                                  {renderFormattedAnswer(qa.answer)}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white dark:bg-stone-900 p-12 text-center rounded-3xl border border-stone-100 dark:border-stone-800 text-stone-450 dark:text-stone-500 space-y-2">
                    <HelpCircle className="h-12 w-12 mx-auto text-stone-200 dark:text-stone-800" />
                    <p className="text-sm font-bold">لم نجد فتاوى أو أحكام مطابقة لبحثك</p>
                    <p className="text-xs text-stone-400 dark:text-stone-550">يرجى تجربة كلمات بحث أخرى مثل: (صلاة، وضوء، تيمم، صيام، غيبة، والدين)</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
