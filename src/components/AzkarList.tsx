import React, { useState, useEffect } from 'react';
import { AZKAR_DATA, MORNING_EVENING_BENEFITS } from '../data/azkar';
import { Zikr } from '../types';
import { 
  Clock, 
  Check, 
  Award, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  HelpingHand,
  ShieldCheck,
  Search,
  BookOpen,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AzkarList: React.FC = () => {
  const [azkar, setAzkar] = useState<Zikr[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'morning' | 'evening' | 'sleep' | 'prayers'>('morning');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // New States for Hisn al-Muslim
  const [viewMode, setViewMode] = useState<'hisn' | 'counters'>('hisn');
  const [hisnCategory, setHisnCategory] = useState<'morning' | 'evening' | 'sleep'>('morning');
  const [completedHisnIds, setCompletedHisnIds] = useState<string[]>([]);
  const [hisnSearchQuery, setHisnSearchQuery] = useState<string>('');

  // Initialize and clone count to state
  useEffect(() => {
    // Clone AZKAR_DATA and set individual count state
    const cloned = AZKAR_DATA.map(item => ({
      ...item,
      count: item.repeat // reset current count to target repeat count
    }));
    setAzkar(cloned);

    // Load completed Hisn IDs from localStorage
    const saved = localStorage.getItem('completedHisnIds');
    if (saved) {
      try {
        setCompletedHisnIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse completed Hisn IDs:', e);
      }
    }
  }, []);

  const playTapSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.log("Audio play failed: ", e);
    }
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high note (A5)
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio play failed: ", e);
    }
  };

  // 1. Logic for Counters View Mode
  const handleZikrClick = (id: string) => {
    setAzkar(prev => prev.map(item => {
      if (item.id === id) {
        if (item.count > 0) {
          const nextCount = item.count - 1;
          playTapSound();
          if (nextCount === 0) {
            setTimeout(playSuccessSound, 100);
          }
          return { ...item, count: nextCount };
        }
      }
      return item;
    }));
  };

  const handleResetCategory = () => {
    if (!confirm('هل تريد إعادة تصفير أذكار هذا القسم للبدء من جديد؟')) return;
    setAzkar(prev => prev.map(item => {
      if (item.category === selectedCategory) {
        return { ...item, count: item.repeat };
      }
      return item;
    }));
  };

  const currentCategoryAzkar = azkar.filter(z => z.category === selectedCategory);
  const completedCount = currentCategoryAzkar.filter(z => z.count === 0).length;
  const totalCount = currentCategoryAzkar.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = [
    { value: 'morning', label: 'أذكار الصباح', icon: Sun, color: 'text-amber-500 bg-amber-50' },
    { value: 'evening', label: 'أذكار المساء', icon: Moon, color: 'text-teal-600 bg-teal-50' },
    { value: 'sleep', label: 'أذكار النوم', icon: Clock, color: 'text-stone-700 bg-stone-100' },
    { value: 'prayers', label: 'أذكار بعد الصلاة', icon: HelpingHand, color: 'text-emerald-700 bg-emerald-50' }
  ];

  // 2. Logic for Hisn al-Muslim Checklist View Mode
  const handleToggleHisnZikr = (id: string) => {
    setCompletedHisnIds(prev => {
      const isCompleted = prev.includes(id);
      let next: string[];
      if (isCompleted) {
        next = prev.filter(x => x !== id);
        playTapSound();
      } else {
        next = [...prev, id];
        playSuccessSound();
      }
      localStorage.setItem('completedHisnIds', JSON.stringify(next));
      return next;
    });
  };

  const handleResetHisnCategory = () => {
    if (!confirm('هل تريد مسح علامات القراءة عن أذكار هذا القسم للبدء من جديد اليوم؟')) return;
    const categoryIds = AZKAR_DATA.filter(z => z.category === hisnCategory).map(z => z.id);
    setCompletedHisnIds(prev => {
      const next = prev.filter(id => !categoryIds.includes(id));
      localStorage.setItem('completedHisnIds', JSON.stringify(next));
      return next;
    });
  };

  // Filter Hisn items based on active sub-category and search query
  const filteredHisnAzkar = AZKAR_DATA.filter(z => {
    const matchesCategory = z.category === hisnCategory;
    const matchesSearch = hisnSearchQuery.trim() === '' || 
      z.text.includes(hisnSearchQuery) || 
      (z.benefit && z.benefit.includes(hisnSearchQuery));
    return matchesCategory && matchesSearch;
  });

  const hisnCategoryAzkar = AZKAR_DATA.filter(z => z.category === hisnCategory);
  const completedHisnCategoryCount = hisnCategoryAzkar.filter(z => completedHisnIds.includes(z.id)).length;
  const totalHisnCategoryCount = hisnCategoryAzkar.length;
  const hisnProgressPercent = totalHisnCategoryCount > 0 
    ? Math.round((completedHisnCategoryCount / totalHisnCategoryCount) * 100) 
    : 0;

  const hisnCategories = [
    { value: 'morning', label: 'أذكار الصباح', icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { value: 'evening', label: 'أذكار المساء', icon: Moon, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { value: 'sleep', label: 'أذكار النوم', icon: Clock, color: 'text-stone-700 bg-stone-100 border-stone-200' }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="azkar-root">
      {/* Top statistics card */}
      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-right">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/50">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-800 font-serif">حصن المسلم والأذكار اليومية</h2>
              <p className="text-[11px] text-stone-400 font-bold mt-0.5">زاد المسلم اليومي وملاذه الآمن من كل مكروه</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            {MORNING_EVENING_BENEFITS} اختر طريقة العرض المناسبة لك لتلاوة أذكارك اليومية وحفظ نفسك بذكر الله سبحانه.
          </p>
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="bg-stone-50 p-1.5 rounded-2xl border border-stone-100 flex items-center gap-1 self-start md:self-auto" id="azkar-view-switcher">
          <button
            onClick={() => setViewMode('hisn')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'hisn'
                ? 'bg-emerald-800 text-white shadow'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>حصن المسلم (قائمة مرجعية)</span>
          </button>
          
          <button
            onClick={() => setViewMode('counters')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'counters'
                ? 'bg-emerald-800 text-white shadow'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>عداد الأذكار التفاعلي</span>
          </button>
        </div>
      </div>

      {/* Global Sound controller and Reset Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-100/60 p-4 rounded-2xl shadow-sm text-right">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl transition-all border cursor-pointer ${
              soundEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-stone-50 text-stone-400 border-stone-200'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <span className="text-xs text-stone-500 font-bold">المؤثرات الصوتية عند إتمام الذكر</span>
        </div>

        <div>
          {viewMode === 'hisn' ? (
            <button
              onClick={handleResetHisnCategory}
              className="flex items-center gap-1.5 py-2 px-4 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-800 rounded-xl text-xs font-bold border border-stone-200 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة تعيين أذكار {hisnCategories.find(c => c.value === hisnCategory)?.label} للغد</span>
            </button>
          ) : (
            <button
              onClick={handleResetCategory}
              className="flex items-center gap-1.5 py-2 px-4 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-800 rounded-xl text-xs font-bold border border-stone-200 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة تشغيل عدادات قسم {categories.find(c => c.value === selectedCategory)?.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* --- RENDER VIEW MODE: HISN AL-MUSLIM CHECKLIST --- */}
      {viewMode === 'hisn' && (
        <div className="space-y-6" id="hisn-muslim-workspace">
          {/* Section banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white text-right relative overflow-hidden shadow">
            <div className="absolute top-0 left-0 -ml-8 -mt-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
            <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-300" />
                <span>ركن حصن المسلم اليومي</span>
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl font-medium">
                تصفح واقرأ أذكارك مقسمة بوضوح بين الصباح والمساء والمنام. يمكنك ببساطة وضع علامة صح (✓) على كل ذكر تتم قراءته لمتابعة تقدمك اليومي والبدء بصفحة نقية كل صباح.
              </p>
            </div>
          </div>

          {/* Search and Category Filters in one row */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="ابحث في نص الذكر أو الفضل والبركة..."
                value={hisnSearchQuery}
                onChange={(e) => setHisnSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all text-right"
              />
            </div>

            {/* Hisn categories list */}
            <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 lg:pb-0" id="hisn-subcategories">
              {hisnCategories.map((cat) => {
                const isSelected = hisnCategory === cat.value;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setHisnCategory(cat.value as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : ''}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hisn Progress bar */}
          <div className="space-y-2 text-right bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold px-1">
              <span className="text-emerald-800 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>إنجازك في {hisnCategories.find(c => c.value === hisnCategory)?.label}</span>
              </span>
              <span className="text-stone-500 font-mono">{completedHisnCategoryCount} من {totalHisnCategoryCount} ({hisnProgressPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${hisnProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Supplications List */}
          <div className="space-y-4" id="hisn-azkar-list">
            <AnimatePresence mode="popLayout">
              {filteredHisnAzkar.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredHisnAzkar.map((zikr, idx) => {
                    const isChecked = completedHisnIds.includes(zikr.id);
                    return (
                      <motion.div
                        key={zikr.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        onClick={() => handleToggleHisnZikr(zikr.id)}
                        className={`p-5 rounded-3xl border text-right transition-all cursor-pointer select-none relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 active:scale-[0.99] group ${
                          isChecked
                            ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                            : 'bg-white border-stone-150 hover:border-emerald-200 hover:shadow-sm'
                        }`}
                      >
                        {/* Checkbox state design on right side for direct focus */}
                        <div className="flex items-start gap-4 flex-1">
                          {/* Beautiful Custom Checkbox */}
                          <div className={`h-6.5 w-6.5 rounded-full border flex items-center justify-center transition-all shrink-0 mt-1 cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 bg-white group-hover:border-emerald-600'
                          }`}>
                            <Check className={`h-4.5 w-4.5 stroke-[3px] transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} />
                          </div>

                          <div className="space-y-3.5 flex-1">
                            <p className={`font-serif text-[17px] md:text-lg leading-loose text-stone-800 font-medium ${
                              isChecked ? 'text-stone-400 line-through decoration-emerald-600/30 font-normal' : ''
                            }`}>
                              {zikr.text}
                            </p>
                            
                            {/* Virtues & Benefits */}
                            {zikr.benefit && (
                              <div className="text-xs text-stone-500 border-r-2 border-stone-200 pr-2.5 bg-stone-50/60 py-2 px-3 rounded-l flex items-start gap-2 max-w-4xl">
                                <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-stone-700 font-bold">فضل الذكر:</strong> {zikr.benefit}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Repeat counter badge */}
                        <div className="shrink-0 flex md:flex-col items-center justify-between md:justify-center border-t md:border-t-0 md:border-r border-stone-100 pt-3 md:pt-0 md:pr-5 gap-2 text-xs text-stone-500">
                          <span className="text-stone-400 font-semibold md:text-[11px]">التكرار المطلوب:</span>
                          <span className={`px-3 py-1.5 rounded-xl font-bold font-mono text-sm ${
                            isChecked 
                              ? 'bg-stone-100 text-stone-500' 
                              : 'bg-amber-50 text-amber-950 border border-amber-100'
                          }`}>
                            {zikr.repeat} {zikr.repeat === 1 ? 'مرة واحدة' : 'مرات'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-stone-50/50 rounded-2xl border border-stone-150 p-12 text-center text-stone-400 space-y-2">
                  <BookOpen className="h-10 w-10 mx-auto text-stone-300" />
                  <p className="text-sm font-bold">لا توجد أذكار تطابق بحثك حالياً.</p>
                  <p className="text-xs">جرب البحث بكلمات أخرى أو تغيير الفئة.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* --- RENDER VIEW MODE: ORIGINAL COUNTER --- */}
      {viewMode === 'counters' && (
        <div className="space-y-6" id="counters-view-workspace">
          {/* Tabs navigation */}
          <div className="flex flex-wrap gap-2 border-b border-stone-200/60 pb-3 justify-between items-center">
            <div className="flex flex-wrap gap-1.5" id="azkar-categories-tabs">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : ''}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="space-y-1.5 text-right bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex justify-between items-center text-xs text-stone-500 font-bold px-1">
              <span>تقدمك في تلاوة {categories.find(c => c.value === selectedCategory)?.label}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Azkar Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="azkar-cards-grid">
            <AnimatePresence mode="popLayout">
              {currentCategoryAzkar.map((zikr) => {
                const isDone = zikr.count === 0;

                return (
                  <motion.div
                    key={zikr.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleZikrClick(zikr.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden flex flex-col justify-between gap-4 text-right active:scale-[0.98] ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                        : 'bg-white border-stone-100 hover:border-emerald-100 hover:shadow-sm'
                    }`}
                  >
                    {/* Checkmark overlay for completed items */}
                    {isDone && (
                      <div className="absolute left-4 top-4 h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-bounce">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    <div className="space-y-3.5">
                      <p className="font-serif text-lg leading-relaxed text-stone-800 font-medium pl-6">
                        {zikr.text}
                      </p>
                      
                      {zikr.benefit && (
                        <div className="text-[11px] text-stone-500 border-r-2 border-stone-200 pr-2 bg-stone-50/50 py-1.5 px-2 rounded-l">
                          <strong>الفائدة:</strong> {zikr.benefit}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                      <span className="text-stone-400 font-medium">العدد الكلي المكرر: {zikr.repeat} مرات</span>
                      
                      <div className={`px-4 py-1.5 rounded-xl font-bold font-mono text-sm transition-all ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-700 text-white animate-pulse'
                      }`}>
                        {isDone ? 'تم التلاوة' : `المتبقي: ${zikr.count}`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

