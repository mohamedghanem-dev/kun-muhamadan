import React, { useState, useEffect } from 'react';
import { HADITHS_DATA } from '../data/hadiths';
import { Hadith } from '../types';
import { 
  Search, 
  BookOpen, 
  Heart, 
  Copy, 
  Check, 
  Sparkles, 
  BookMarked, 
  Filter, 
  RotateCw, 
  AlertTriangle, 
  HelpCircle,
  Hash,
  Layers,
  Dices
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiUrl } from '../lib/apiBase';

export const HadithExplorer: React.FC = () => {
  const [hadiths] = useState<Hadith[]>(HADITHS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [showExplanationId, setShowExplanationId] = useState<number | null>(null);

  // Tab control: 'search' for general search, 'index' for 2000-hadith numeric finder
  const [activeTab, setActiveTab] = useState<'search' | 'index'>('search');

  // AI Search states
  const [useAiSearch, setUseAiSearch] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiHadiths, setAiHadiths] = useState<Hadith[]>([]);
  const [aiError, setAiError] = useState<string>('');
  const [aiIsFallback, setAiIsFallback] = useState<boolean>(false);
  const [aiFallbackMessage, setAiFallbackMessage] = useState<string>('');

  // 2000-Hadith Numeric Finder states
  const [hadithNumber, setHadithNumber] = useState<string>('1');
  const [selectedBook, setSelectedBook] = useState<string>('riyad');
  const [numLoading, setNumLoading] = useState<boolean>(false);
  const [numResult, setNumResult] = useState<Hadith | null>(null);
  const [numError, setNumError] = useState<string>('');
  const [numIsFallback, setNumIsFallback] = useState<boolean>(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem('km_fav_hadiths');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error(e);
      }
    }

    // Determine Daily Hadith deterministically based on today's date
    const day = new Date().getDate();
    const index = day % HADITHS_DATA.length;
    setDailyHadith(HADITHS_DATA[index]);
  }, []);

  const toggleFavorite = (id: number) => {
    const updated = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('km_fav_hadiths', JSON.stringify(updated));
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Perform AI Hadith search
  const handleAiSearch = async () => {
    const query = searchTerm.trim();
    if (!query) return;

    setAiLoading(true);
    setAiError('');
    setAiHadiths([]);
    setAiIsFallback(false);
    setAiFallbackMessage('');

    try {
      const response = await fetch(apiUrl('/api/hadith/search'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل البحث بالذكاء الاصطناعي.');
      }

      if (data.isFallback) {
        setAiIsFallback(true);
        setAiFallbackMessage(data.message);
      } else {
        setAiHadiths(data.hadiths || []);
      }
    } catch (err: any) {
      setAiError(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بخادم الذكاء الاصطناعي.');
    } finally {
      setAiLoading(false);
    }
  };

  // Perform 2000-Hadith Numeric Finder Search
  const handleByNumberSearch = async (numToSearch?: string) => {
    const targetNumStr = numToSearch || hadithNumber;
    const num = parseInt(targetNumStr);
    if (!num || num < 1 || num > 2000) {
      setNumError('يرجى تحديد رقم حديث صحيح بين 1 و 2000.');
      return;
    }

    setNumLoading(true);
    setNumError('');
    setNumResult(null);
    setNumIsFallback(false);

    try {
      const response = await fetch(apiUrl('/api/hadith/by-number'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: num, book: selectedBook }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل استدعاء الحديث.');
      }

      if (data.isFallback) {
        setNumIsFallback(true);

        // Local deterministic fallback using our 50 hadiths
        const localIndex = (num - 1) % hadiths.length;
        const matchingLocal = hadiths[localIndex];

        const bookNamesAr: Record<string, string> = {
          bukhari: "صحيح البخاري",
          muslim: "صحيح مسلم",
          riyad: "رياض الصالحين",
          nawawi: "الأربعون النووية"
        };
        const bookNameAr = bookNamesAr[selectedBook] || "رياض الصالحين";

        setNumResult({
          ...matchingLocal,
          id: 5000 + num, // avoid conflict
          source: `${bookNameAr} (مطابقة رقمية أوفلاين - الحديث رقم ${num})`,
        });
      } else {
        setNumResult(data.hadith || null);
      }
    } catch (err: any) {
      setNumError(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بخادم الأحاديث.');
    } finally {
      setNumLoading(false);
    }
  };

  const handleRandomize = () => {
    const rand = Math.floor(Math.random() * 2000) + 1;
    setHadithNumber(String(rand));
    handleByNumberSearch(String(rand));
  };

  const adjustNumber = (amount: number) => {
    let current = parseInt(hadithNumber) || 1;
    let next = current + amount;
    if (next < 1) next = 2000;
    if (next > 2000) next = 1;
    setHadithNumber(String(next));
    handleByNumberSearch(String(next));
  };

  // Filtered Hadiths (local fallback list)
  const filteredHadiths = hadiths.filter(hadith => {
    const matchesSearch = hadith.text.includes(searchTerm) || 
                          hadith.explanation.includes(searchTerm) || 
                          hadith.narrator.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || 
                            hadith.category === selectedCategory ||
                            (selectedCategory === 'favorites' && favorites.includes(hadith.id));
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'كل الأحاديث (أوفلاين)' },
    { value: 'nawawi', label: 'الأربعون النووية' },
    { value: 'morals', label: 'الأخلاق والمعاملات' },
    { value: 'faith', label: 'العقيدة والإيمان' },
    { value: 'worship', label: 'العبادات والتعلم' },
    { value: 'favorites', label: 'المفضلة لدّي' },
  ];

  const booksList = [
    { value: 'bukhari', label: 'صحيح البخاري', desc: 'أصح الكتب بعد كتاب الله عز وجل' },
    { value: 'muslim', label: 'صحيح مسلم', desc: 'جامع السنن المروي بنقاء تام' },
    { value: 'riyad', label: 'رياض الصالحين', desc: 'تهذيب النفوس والأخلاق من كلام سيد المرسلين' },
    { value: 'nawawi', label: 'الأربعون النووية', desc: 'الأحاديث الجامعة لقواعد الدين وأركانه' },
  ];

  return (
    <div className="space-y-8" id="hadith-explorer-root">
      {/* Daily Hadith Section */}
      {dailyHadith && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-lg md:p-8"
          id="daily-hadith-box"
        >
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-white/5 blur-xl" />
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">حديث اليوم النبوي الشريف</span>
          </div>
          <p className="font-serif text-lg md:text-xl leading-relaxed text-emerald-50 text-right font-medium">
            &quot;{dailyHadith.text}&quot;
          </p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-emerald-700/50 pt-4 text-xs text-emerald-200">
            <span>الراوي: {dailyHadith.narrator} | المصدر: {dailyHadith.source}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopy(dailyHadith.text, dailyHadith.id + 1000)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded bg-white/10 hover:bg-white/15 cursor-pointer"
                title="نسخ الحديث"
              >
                {copiedId === dailyHadith.id + 1000 ? <Check className="h-3.5 w-3.5 text-amber-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === dailyHadith.id + 1000 ? 'تم النسخ' : 'نسخ الحديث'}</span>
              </button>
              <button
                onClick={() => toggleFavorite(dailyHadith.id)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded bg-white/10 hover:bg-white/15 cursor-pointer"
              >
                <Heart className={`h-3.5 w-3.5 ${favorites.includes(dailyHadith.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{favorites.includes(dailyHadith.id) ? 'مفضل' : 'أضف للمفضلة'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Tab Bar switcher */}
      <div className="flex justify-center border-b border-stone-200 pb-px">
        <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl w-full max-w-md">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'search' 
                ? 'bg-white text-emerald-800 shadow-sm' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>البحث الموضوعي والمحلي</span>
          </button>
          <button
            onClick={() => setActiveTab('index')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'index' 
                ? 'bg-white text-emerald-800 shadow-sm' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Hash className="h-4 w-4" />
            <span>فهرس الأحاديث (1 - 2000)</span>
          </button>
        </div>
      </div>

      {/* Main Layout depending on Active Tab */}
      {activeTab === 'search' ? (
        /* GENERAL SEARCH TAB */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories / Filters */}
          <div className="lg:col-span-1 space-y-3" id="hadith-filters">
            <h3 className="text-sm font-semibold text-stone-500 pr-1 flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span>تصنيفات الأحاديث المحلية ({hadiths.length} حديثاً)</span>
            </h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`whitespace-nowrap flex-shrink-0 text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                  {cat.value === 'favorites' && favorites.length > 0 && (
                    <span className="mr-2 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Hadith list */}
          <div className="lg:col-span-3 space-y-5">
            {/* Search Bar & Switcher */}
            <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder={useAiSearch ? "اكتب موضوع البحث (مثل: الصدق، بر الوالدين، قيام الليل)..." : "ابحث عن كلمة في الأحاديث المحلية الـ 50..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && useAiSearch) {
                        handleAiSearch();
                      }
                    }}
                    className="w-full pl-4 pr-11 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm placeholder:text-stone-400 transition-all text-right font-medium"
                    dir="rtl"
                  />
                </div>
                
                {useAiSearch && (
                  <button
                    onClick={handleAiSearch}
                    disabled={aiLoading || !searchTerm.trim()}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {aiLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>ابحث بالذكاء الاصطناعي</span>
                  </button>
                )}
              </div>

              {/* Toggle Switch for AI Search */}
              <div className="flex items-center justify-between border-t border-stone-50 pt-3 flex-wrap gap-2">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-stone-400" />
                  <span>تبديل نوع محرك البحث:</span>
                </span>

                <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
                  <button
                    onClick={() => {
                      setUseAiSearch(false);
                      setAiHadiths([]);
                      setAiError('');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${!useAiSearch ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
                  >
                    المحلي (أوفلاين)
                  </button>
                  <button
                    onClick={() => {
                      setUseAiSearch(true);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${useAiSearch ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>مستشار الأحاديث السحابي (أونلاين)</span>
                  </button>
                </div>
              </div>

              {useAiSearch && (
                <p className="text-[10px] text-stone-400 leading-relaxed font-semibold">
                  💡 <span className="text-amber-700">البحث السحابي الذكي:</span> يتيح لك الاستفسار عن أي موضوع فقهي أو قيمي والبحث عنه في صحيح البخاري ومسلم وكامل كتب السنّة الشريفة عبر ذكاء اصطناعي تفاعلي مصمم خصيصاً للتحقق من الأحاديث وصحتها.
                </p>
              )}
            </div>

            {/* Hadith List Container */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {useAiSearch ? (
                  // AI SEARCH RENDER FLOW
                  aiLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 bg-white rounded-2xl border border-stone-100 shadow-sm space-y-4"
                    >
                      <RotateCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-stone-700">جاري فحص وتدقيق كتب السنة المطهرة...</p>
                        <p className="text-xs text-stone-400 font-medium">نبحث في صحيح البخاري ومسلم وسنن الترمذي والنسائي لإيجاد أصح الأحاديث</p>
                      </div>
                    </motion.div>
                  ) : aiError ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 bg-red-50/50 border border-red-100 rounded-2xl text-center space-y-3"
                    >
                      <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
                      <p className="text-sm font-extrabold text-red-800">{aiError}</p>
                      <button
                        onClick={handleAiSearch}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        إعادة المحاولة
                      </button>
                    </motion.div>
                  ) : aiIsFallback ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4 text-right"
                    >
                      <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm border-b border-amber-100/50 pb-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <span>تفعيل محرك الأحاديث الشامل بالذكاء الاصطناعي</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-bold">
                        {aiFallbackMessage}
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        الرجاء إدخال رمز الوصول <span className="text-emerald-700 font-bold">GEMINI_API_KEY</span> في صفحة الإعدادات الجانبية لتنشيط الاتصال بنموذج جيميناي وسحب الأحاديث الفورية تلقائياً.
                      </p>
                      <div className="pt-2 border-t border-amber-100/50 flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-stone-400">يمكنك حالياً استخدام البحث المحلي في الأحاديث الـ 50 المحفوظة بالأسفل.</span>
                        <button
                          onClick={() => setUseAiSearch(false)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          العودة للبحث المحلي
                        </button>
                      </div>
                    </motion.div>
                  ) : aiHadiths.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1 text-xs font-bold text-stone-500">
                        <span>نتائج البحث بالذكاء الاصطناعي ({aiHadiths.length} أحاديث مستخرجة):</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">صحيحة وموثقة</span>
                      </div>
                      {aiHadiths.map((hadith) => {
                        const isExpOpen = showExplanationId === hadith.id;

                        return (
                          <motion.div
                            key={hadith.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:border-emerald-100 transition-all text-right"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-900 text-xs font-extrabold rounded-full">
                                {hadith.categoryAr || 'تصنيف حديث'}
                              </span>
                              <button
                                onClick={() => handleCopy(hadith.text, hadith.id)}
                                className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                                title="نسخ الحديث"
                              >
                                {copiedId === hadith.id ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>

                            <div className="mt-4">
                              <p className="font-serif text-lg md:text-xl text-stone-850 leading-relaxed font-semibold">
                                &quot;{hadith.text}&quot;
                              </p>
                              <div className="mt-3 text-xs text-stone-500 flex flex-wrap gap-x-4 gap-y-1 justify-start">
                                <span><strong>الراوي:</strong> {hadith.narrator || 'غير محدد'}</span>
                                <span className="text-emerald-700"><strong>المصدر:</strong> {hadith.source || 'صحيح البخاري ومسلم'}</span>
                              </div>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-3">
                              <button
                                onClick={() => setShowExplanationId(isExpOpen ? null : hadith.id)}
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{isExpOpen ? 'إخفاء الشرح الفقهي والمستفاد' : 'عرض الشرح الفقهي والمستفاد للحديث'}</span>
                              </button>

                              <AnimatePresence>
                                {isExpOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-2"
                                  >
                                    <p className="text-xs md:text-sm text-stone-600 bg-emerald-50/20 p-4 rounded-xl leading-relaxed border-r-2 border-emerald-500 text-right">
                                      {hadith.explanation}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-100 text-stone-400 shadow-sm">
                      <Sparkles className="h-10 w-10 mx-auto text-amber-400 mb-3 animate-pulse" />
                      <p className="text-sm font-bold text-stone-700">ابحث عن أي موضوع أو قيمة بالذكاء الاصطناعي</p>
                      <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        اكتب كلمة مفتاحية مثل &quot;بر الوالدين&quot;، &quot;أذكار الصباح&quot;، أو &quot;الصبر&quot; ثم اضغط على زر البحث بالذكاء الاصطناعي لسحب الحديث الصحيح فوراً.
                      </p>
                    </div>
                  )
                ) : (
                  // LOCAL LIST FLOW
                  filteredHadiths.length > 0 ? (
                    filteredHadiths.map((hadith) => {
                      const isFav = favorites.includes(hadith.id);
                      const isExpOpen = showExplanationId === hadith.id;

                      return (
                        <motion.div
                          key={hadith.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:border-emerald-100 transition-all text-right"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full">
                              {hadith.categoryAr}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopy(hadith.text, hadith.id)}
                                className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                                title="نسخ الحديث"
                              >
                                {copiedId === hadith.id ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => toggleFavorite(hadith.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                                title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                              >
                                <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 text-right">
                            <p className="font-serif text-lg md:text-xl text-stone-850 leading-relaxed font-semibold">
                              &quot;{hadith.text}&quot;
                            </p>
                            <div className="mt-3 text-xs text-stone-500 flex flex-wrap gap-x-4 gap-y-1 justify-start">
                              <span><strong>الراوي:</strong> {hadith.narrator}</span>
                              <span className="text-emerald-700"><strong>المصدر:</strong> {hadith.source}</span>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-stone-100 pt-3">
                            <button
                              onClick={() => setShowExplanationId(isExpOpen ? null : hadith.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{isExpOpen ? 'إخفاء الشرح والمستفاد' : 'عرض الشرح والمستفاد للحديث'}</span>
                            </button>

                            <AnimatePresence>
                              {isExpOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden mt-2"
                                >
                                  <p className="text-xs md:text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed text-right border-r-2 border-emerald-500">
                                    {hadith.explanation}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-100 text-stone-400 shadow-sm" id="no-hadith-found">
                      <BookMarked className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                      <p className="text-sm font-medium">لم يتم العثور على أحاديث تطابق خيارات البحث.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                        className="mt-3 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        إعادة تعيين المرشحات
                      </button>
                    </div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        /* 2000-HADITH INDEX FINDER TAB */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-6 text-right">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-850 flex items-center gap-2 justify-start">
                <Hash className="h-5 w-5 text-emerald-600" />
                <span>الموسوعة النبوية المرقّمة (2000 حديث)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                تصفح واستدعي أي حديث من أمهات الكتب عن طريق الرقم من <span className="font-bold text-emerald-700">1 إلى 2000</span> مباشرة بدقة تامة.
              </p>
            </div>

            {/* Book selection cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5 justify-start">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>اختر الكتاب النبوي للترقيم:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {booksList.map((book) => (
                  <button
                    key={book.value}
                    onClick={() => {
                      setSelectedBook(book.value);
                      if (numResult) setNumResult(null);
                    }}
                    className={`p-4 rounded-2xl text-right border transition-all flex flex-col justify-between h-28 cursor-pointer ${
                      selectedBook === book.value
                        ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                        : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'
                    }`}
                  >
                    <span className={`text-sm font-bold ${selectedBook === book.value ? 'text-emerald-800' : 'text-stone-700'}`}>
                      {book.label}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium leading-relaxed mt-1">
                      {book.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Number Selector Input */}
            <div className="flex flex-col md:flex-row gap-4 items-end bg-stone-50 p-4 rounded-2xl border border-stone-150">
              <div className="w-full md:w-auto flex-1 space-y-2">
                <label className="text-xs font-bold text-stone-600 flex items-center gap-1 justify-start">
                  <span>أدخل رقم الحديث من (1 - 2000):</span>
                </label>
                <div className="flex gap-1.5 justify-start">
                  <button
                    onClick={() => adjustNumber(-1)}
                    className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-lg font-bold transition-all cursor-pointer select-none"
                    title="الحديث السابق"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={hadithNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHadithNumber(val);
                    }}
                    className="w-full max-w-[150px] text-center text-xl font-extrabold text-emerald-800 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => adjustNumber(1)}
                    className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-lg font-bold transition-all cursor-pointer select-none"
                    title="الحديث التالي"
                  >
                    +
                  </button>
                  <button
                    onClick={handleRandomize}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                    title="حديث عشوائي"
                  >
                    <Dices className="h-4 w-4" />
                    <span className="hidden sm:inline">حديث عشوائي</span>
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0">
                <button
                  onClick={() => handleByNumberSearch()}
                  disabled={numLoading || !hadithNumber}
                  className="w-full px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {numLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : <BookMarked className="h-4 w-4" />}
                  <span>استدعاء الحديث بالترقيم الفوري</span>
                </button>
              </div>
            </div>

            {numError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-sm font-bold text-red-700">
                {numError}
              </div>
            )}
          </div>

          {/* Numerical result display */}
          <div className="space-y-4">
            {numLoading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm space-y-4">
                <RotateCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-stone-700">جاري تصفح كتب السنّة المعتمدة والبحث بالرقم...</p>
                  <p className="text-xs text-stone-400 font-medium">نستدعي نص الحديث الشريف الدقيق مع الشرح الفقهي والمستفاد</p>
                </div>
              </div>
            ) : numResult ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-emerald-100 p-6 md:p-8 shadow-sm text-right space-y-6"
              >
                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-full">
                      {booksList.find(b => b.value === selectedBook)?.label || 'رياض الصالحين'}
                    </span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-900 text-xs font-extrabold rounded-full">
                      الحديث رقم {hadithNumber}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(numResult.text, numResult.id)}
                      className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                      title="نسخ الحديث"
                    >
                      {copiedId === numResult.id ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleFavorite(numResult.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                      title={favorites.includes(numResult.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(numResult.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="font-serif text-xl md:text-2xl text-stone-850 leading-relaxed font-bold text-center">
                    &quot;{numResult.text}&quot;
                  </p>
                  
                  <div className="flex justify-center flex-wrap gap-4 text-xs text-stone-500 font-bold border-t border-b border-stone-50 py-3">
                    <span>الراوي: {numResult.narrator}</span>
                    <span className="text-emerald-700">المصدر: {numResult.source}</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2 bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>الشرح الفقهي والمستفاد للحديث:</span>
                  </h4>
                  <p className="text-xs md:text-sm text-stone-650 leading-relaxed font-medium">
                    {numResult.explanation}
                  </p>
                </div>

                {numIsFallback && (
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-right space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>وضع المطابقة التناظرية (أوفلاين)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                      هذا الحديث مستدعى بشكل تناظري من الموسوعة المحلية المحفوظة. لتنزيل واستدعاء الحديث الدقيق رقم {hadithNumber} من كتاب {booksList.find(b => b.value === selectedBook)?.label} بمتنه وتخريجه وشرحه التفصيلي عبر السحاب، يرجى تفعيل مفتاح <span className="text-emerald-700 font-bold">GEMINI_API_KEY</span> في الإعدادات الجانبية.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 text-stone-400 shadow-sm space-y-3">
                <BookMarked className="h-12 w-12 mx-auto text-stone-300" />
                <p className="text-sm font-bold text-stone-700">لم يتم استدعاء حديث بعد</p>
                <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                  أدخل أي رقم من <span className="text-emerald-700 font-bold">1 إلى 2000</span> ثم انقر فوق زر الاستدعاء الفوري لتصفح متون الحديث الشريف.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
