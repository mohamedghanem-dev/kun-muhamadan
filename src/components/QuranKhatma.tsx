import React, { useState, useEffect, useRef } from 'react';
import { Khatma } from '../types';
import { 
  Calendar, 
  Check, 
  Plus, 
  Trash2, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  Users, 
  Share2, 
  RefreshCw, 
  Copy,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiUrl } from '../lib/apiBase';

// Exact page mapping for each Juz of the Quran (standard 604-page Madinah Mushaf)
const JUZ_PAGES = [
  { juz: 1, start: 1, end: 21 },
  { juz: 2, start: 22, end: 41 },
  { juz: 3, start: 42, end: 61 },
  { juz: 4, start: 62, end: 81 },
  { juz: 5, start: 82, end: 101 },
  { juz: 6, start: 102, end: 121 },
  { juz: 7, start: 122, end: 141 },
  { juz: 8, start: 142, end: 161 },
  { juz: 9, start: 162, end: 181 },
  { juz: 10, start: 182, end: 201 },
  { juz: 11, start: 202, end: 221 },
  { juz: 12, start: 222, end: 241 },
  { juz: 13, start: 242, end: 261 },
  { juz: 14, start: 262, end: 281 },
  { juz: 15, start: 282, end: 301 },
  { juz: 16, start: 302, end: 321 },
  { juz: 17, start: 322, end: 341 },
  { juz: 18, start: 342, end: 361 },
  { juz: 19, start: 362, end: 381 },
  { juz: 20, start: 382, end: 401 },
  { juz: 21, start: 402, end: 421 },
  { juz: 22, start: 422, end: 441 },
  { juz: 23, start: 442, end: 461 },
  { juz: 24, start: 462, end: 481 },
  { juz: 25, start: 482, end: 501 },
  { juz: 26, start: 502, end: 521 },
  { juz: 27, start: 522, end: 541 },
  { juz: 28, start: 542, end: 561 },
  { juz: 29, start: 562, end: 581 },
  { juz: 30, start: 582, end: 604 }
];

interface SharedKhatma {
  code: string;
  name: string;
  durationDays: number;
  createdAt: string;
  readPages: { [pageNumber: string]: { readBy: string; readAt: string } };
  friends: string[];
}

export const QuranKhatma: React.FC = () => {
  // Navigation tabs: 'individual' or 'collaborative'
  const [currentTab, setCurrentTab] = useState<'individual' | 'collaborative'>('individual');

  // --- Individual Khatma State ---
  const [khatmas, setKhatmas] = useState<Khatma[]>([]);
  const [activeKhatma, setActiveKhatma] = useState<Khatma | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [sliderProgress, setSliderProgress] = useState(0);

  // Manual page selection state variables
  const [selectedJuzForManual, setSelectedJuzForManual] = useState<number>(1);
  const [customRangeStart, setCustomRangeStart] = useState<number>(1);
  const [customRangeEnd, setCustomRangeEnd] = useState<number>(20);

  // --- Collaborative Khatma State ---
  const [userName, setUserName] = useState<string>('');
  const [collabKhatmaName, setCollabKhatmaName] = useState<string>('');
  const [collabDurationDays, setCollabDurationDays] = useState<number>(30);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [sharedKhatma, setSharedKhatma] = useState<SharedKhatma | null>(null);
  const [isCollabLoading, setIsCollabLoading] = useState<boolean>(false);
  const [collabError, setCollabError] = useState<string>('');
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Ref for auto-sync polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load individual khatmas and userName/sharedKhatma code from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('km_khatmas');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        setKhatmas(list);
        if (list.length > 0) {
          const active = list.find((k: Khatma) => k.status === 'active') || list[0];
          setActiveKhatma(active);
          setSliderProgress(active.readPages.length);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedUserName = localStorage.getItem('km_collab_user_name');
    if (savedUserName) {
      setUserName(savedUserName);
    }

    const savedSharedCode = localStorage.getItem('km_collab_active_code');
    if (savedSharedCode) {
      syncSharedKhatma(savedSharedCode);
    }
  }, []);

  // Poll for collaborative khatma sync every 15 seconds if active
  useEffect(() => {
    if (currentTab === 'collaborative' && sharedKhatma?.code) {
      pollingRef.current = setInterval(() => {
        syncSharedKhatma(sharedKhatma.code, true); // silent sync
      }, 15000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [currentTab, sharedKhatma?.code]);

  // Save individual khatmas list
  const saveKhatmas = (updatedList: Khatma[]) => {
    setKhatmas(updatedList);
    localStorage.setItem('km_khatmas', JSON.stringify(updatedList));
  };

  // Create Individual Khatma
  const createKhatma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const pagesPerDay = Math.ceil(604 / durationDays);
    const newKhatma: Khatma = {
      id: Date.now().toString(),
      name: name.trim(),
      startDate: new Date().toISOString().split('T')[0],
      durationDays,
      targetPagesPerDay: pagesPerDay,
      readPages: [],
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const newList = [...khatmas, newKhatma];
    saveKhatmas(newList);
    setActiveKhatma(newKhatma);
    setSliderProgress(0);
    setName('');
    setShowCreateForm(false);
  };

  // Delete Individual Khatma
  const deleteKhatma = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه الختمة؟ سيتم مسح كل التقدم المرتبط بها.')) return;

    const newList = khatmas.filter(k => k.id !== id);
    saveKhatmas(newList);
    if (activeKhatma?.id === id) {
      const nextActive = newList.find(k => k.status === 'active') || newList[0] || null;
      setActiveKhatma(nextActive);
      if (nextActive) {
        setSliderProgress(nextActive.readPages.length);
      } else {
        setSliderProgress(0);
      }
    }
  };

  // Bulk update progress up to a certain page (individual)
  const updateProgressUpToPage = (targetPage: number) => {
    if (!activeKhatma) return;

    let read: number[] = [];
    for (let i = 1; i <= targetPage; i++) {
      read.push(i);
    }

    const updated: Khatma = {
      ...activeKhatma,
      readPages: read,
      status: targetPage >= 604 ? 'completed' : 'active'
    };

    const newList = khatmas.map(k => k.id === activeKhatma.id ? updated : k);
    saveKhatmas(newList);
    setActiveKhatma(updated);
    setSliderProgress(targetPage);
  };

  // Toggle single Juz (individual)
  const toggleJuzRead = (juzNum: number) => {
    if (!activeKhatma) return;

    const juzInfo = JUZ_PAGES.find(j => j.juz === juzNum);
    if (!juzInfo) return;

    const pagesInJuz = Array.from({ length: juzInfo.end - juzInfo.start + 1 }, (_, i) => juzInfo.start + i);
    const allPagesRead = pagesInJuz.every(p => activeKhatma.readPages.includes(p));

    let updatedPages = [...activeKhatma.readPages];
    if (allPagesRead) {
      updatedPages = updatedPages.filter(p => !pagesInJuz.includes(p));
    } else {
      pagesInJuz.forEach(p => {
        if (!updatedPages.includes(p)) {
          updatedPages.push(p);
        }
      });
    }

    updatedPages.sort((a, b) => a - b);

    const updated: Khatma = {
      ...activeKhatma,
      readPages: updatedPages,
      status: updatedPages.length >= 604 ? 'completed' : 'active'
    };

    const newList = khatmas.map(k => k.id === activeKhatma.id ? updated : k);
    saveKhatmas(newList);
    setActiveKhatma(updated);
    setSliderProgress(updatedPages.length);
  };

  // Toggle single page read status (individual manual)
  const togglePageRead = (pageNum: number) => {
    if (!activeKhatma) return;

    let updatedPages = [...activeKhatma.readPages];
    if (updatedPages.includes(pageNum)) {
      updatedPages = updatedPages.filter(p => p !== pageNum);
    } else {
      updatedPages.push(pageNum);
    }
    updatedPages.sort((a, b) => a - b);

    const updated: Khatma = {
      ...activeKhatma,
      readPages: updatedPages,
      status: updatedPages.length >= 604 ? 'completed' : 'active'
    };

    const newList = khatmas.map(k => k.id === activeKhatma.id ? updated : k);
    saveKhatmas(newList);
    setActiveKhatma(updated);
    setSliderProgress(updatedPages.length);
  };

  // Mark/unmark a custom page range (individual manual)
  const applyCustomPageRange = (markAsRead: boolean) => {
    if (!activeKhatma) return;
    const start = Math.min(customRangeStart, customRangeEnd);
    const end = Math.max(customRangeStart, customRangeEnd);
    if (start < 1 || end > 604) return;

    let updatedPages = [...activeKhatma.readPages];
    for (let p = start; p <= end; p++) {
      if (markAsRead) {
        if (!updatedPages.includes(p)) {
          updatedPages.push(p);
        }
      } else {
        updatedPages = updatedPages.filter(x => x !== p);
      }
    }
    updatedPages.sort((a, b) => a - b);

    const updated: Khatma = {
      ...activeKhatma,
      readPages: updatedPages,
      status: updatedPages.length >= 604 ? 'completed' : 'active'
    };

    const newList = khatmas.map(k => k.id === activeKhatma.id ? updated : k);
    saveKhatmas(newList);
    setActiveKhatma(updated);
    setSliderProgress(updatedPages.length);
  };

  const getTodayStats = (khatma: Khatma) => {
    const today = new Date();
    const created = new Date(khatma.createdAt);
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const totalPages = 604;
    const pagesRead = khatma.readPages.length;
    const pagesRemaining = totalPages - pagesRead;
    const daysRemaining = Math.max(0, khatma.durationDays - diffDays + 1);
    const todayTarget = daysRemaining > 0 ? Math.ceil(pagesRemaining / daysRemaining) : pagesRemaining;

    return {
      elapsedDays: diffDays,
      daysRemaining,
      pagesRemaining,
      todayTarget,
      isBehind: pagesRead < (diffDays - 1) * khatma.targetPagesPerDay
    };
  };


  // ============================================
  // --- COLLABORATIVE KHATMA API ACTIONS ---
  // ============================================

  const handleSaveUserName = (nameStr: string) => {
    const trimmed = nameStr.trim();
    setUserName(trimmed);
    localStorage.setItem('km_collab_user_name', trimmed);
  };

  // Create shared khatma
  const handleCreateSharedKhatma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabKhatmaName.trim() || !userName.trim()) {
      setCollabError('يرجى تعبئة اسمك الكريم واسم الختمة أولاً.');
      return;
    }

    try {
      setIsCollabLoading(true);
      setCollabError('');
      const res = await fetch(apiUrl('/api/khatma/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: collabKhatmaName.trim(),
          durationDays: collabDurationDays,
          creatorName: userName.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'تعذر إنشاء الختمة.');
      }

      const data: SharedKhatma = await res.json();
      setSharedKhatma(data);
      localStorage.setItem('km_collab_active_code', data.code);
      setCollabKhatmaName('');
    } catch (err: any) {
      setCollabError(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.');
    } finally {
      setIsCollabLoading(false);
    }
  };

  // Join shared khatma
  const handleJoinSharedKhatma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !userName.trim()) {
      setCollabError('يرجى كتابة اسمك وإدخال رمز الدعوة المكون من 8 خانات.');
      return;
    }

    try {
      setIsCollabLoading(true);
      setCollabError('');
      const res = await fetch(apiUrl('/api/khatma/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteCode.trim().toUpperCase(),
          friendName: userName.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'رمز الدعوة خاطئ أو غير موجود.');
      }

      const data: SharedKhatma = await res.json();
      setSharedKhatma(data);
      localStorage.setItem('km_collab_active_code', data.code);
      setInviteCode('');
    } catch (err: any) {
      setCollabError(err.message || 'فشل الانضمام للختمة التشاركية.');
    } finally {
      setIsCollabLoading(false);
    }
  };

  // Sync Shared Khatma state
  const syncSharedKhatma = async (codeStr: string, silent: boolean = false) => {
    if (!codeStr) return;
    try {
      if (!silent) setSyncing(true);
      const res = await fetch(apiUrl(`/api/khatma/sync/${codeStr.toUpperCase().trim()}`));
      if (!res.ok) throw new Error('فشل التحديث من الخادم.');
      const data: SharedKhatma = await res.json();
      setSharedKhatma(data);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      if (!silent) setSyncing(false);
    }
  };

  // Toggle Page Completion on Shared Khatma
  const handleToggleCollabPage = async (pageNumber: number, isReadNow: boolean) => {
    if (!sharedKhatma || !userName) return;

    // Optimistic update
    const updatedReadPages = { ...sharedKhatma.readPages };
    if (isReadNow) {
      updatedReadPages[String(pageNumber)] = {
        readBy: userName,
        readAt: new Date().toISOString()
      };
    } else {
      delete updatedReadPages[String(pageNumber)];
    }

    setSharedKhatma({
      ...sharedKhatma,
      readPages: updatedReadPages
    });

    try {
      const res = await fetch(apiUrl('/api/khatma/toggle-page'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sharedKhatma.code,
          pageNumber,
          read: isReadNow,
          userName: userName
        })
      });

      if (!res.ok) {
        // Rollback on failure
        syncSharedKhatma(sharedKhatma.code, true);
      } else {
        const data: SharedKhatma = await res.json();
        setSharedKhatma(data);
      }
    } catch (err) {
      syncSharedKhatma(sharedKhatma.code, true);
    }
  };

  // Copy shared code
  const handleCopyCode = () => {
    if (!sharedKhatma) return;
    navigator.clipboard.writeText(sharedKhatma.code);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Leave / Quit shared khatma locally
  const handleLeaveSharedKhatma = () => {
    if (confirm('هل ترغب في الخروج من هذه الختمة التشاركية على هذا الجهاز؟ يمكنك الانضمام مجدداً بالرمز لاحقاً.')) {
      setSharedKhatma(null);
      localStorage.removeItem('km_collab_active_code');
    }
  };

  // Calculations for shared progress
  const sharedReadPagesCount = sharedKhatma ? Object.keys(sharedKhatma.readPages).length : 0;
  const sharedPercent = sharedKhatma ? Math.round((sharedReadPagesCount / 604) * 100) : 0;

  return (
    <div className="space-y-6" id="quran-khatma-root">
      {/* Visual Tab Selection */}
      <div className="flex bg-white p-1 rounded-2xl border border-stone-100 shadow-sm w-full max-w-md mx-auto">
        <button
          onClick={() => setCurrentTab('individual')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            currentTab === 'individual'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>ختمتي الفردية</span>
        </button>
        <button
          onClick={() => setCurrentTab('collaborative')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            currentTab === 'collaborative'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>الختمة التشاركية مع صديق</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentTab === 'individual' ? (
          // --- INDIVIDUAL KHATMA COMPONENT VIEW ---
          <motion.div
            key="individual"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <BookOpen className="h-5.5 w-5.5 text-emerald-700" />
                  <span>ركن ختم القرآن الكريم (الفردي)</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">خطط لختم كتاب الله بمفردك، وتتبع قراءتك اليومية جزءاً تلو الجزء أو صفحة بصفحة.</p>
              </div>

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-1.5 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>{showCreateForm ? 'إغلاق النموذج' : 'إنشاء خطة ختمة جديدة'}</span>
              </button>
            </div>

            {/* Creation Form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={createKhatma} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4 max-w-xl">
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-50 pb-2">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span>إعداد خطة الختمة الفردية</span>
                    </h3>
                    
                    <div className="space-y-1 text-right">
                      <label className="text-xs font-semibold text-stone-600">اسم الختمة (مثلاً: ختمة رمضان، الختمة الأسبوعية)</label>
                      <input
                        type="text"
                        required
                        placeholder="اكتب اسماً للختمة..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-4 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-right">
                        <label className="text-xs font-semibold text-stone-600">المدة الزمنية (بالأيام)</label>
                        <select
                          value={durationDays}
                          onChange={(e) => setDurationDays(Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm text-right"
                          dir="rtl"
                        >
                          <option value={7}>7 أيام (حوالي 86 صفحة يومياً)</option>
                          <option value={10}>10 أيام (حوالي 60 صفحة يومياً)</option>
                          <option value={15}>15 يوماً (حوالي 40 صفحة يومياً)</option>
                          <option value={30}>30 يوماً (جزء واحد - 20 صفحة يومياً)</option>
                          <option value={60}>60 يوماً (نصف جزء - 10 صفحات يومياً)</option>
                        </select>
                      </div>

                      <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50 flex flex-col justify-center text-right text-xs">
                        <span className="font-semibold text-emerald-950">المعدل التقريبي المطلّوب:</span>
                        <span className="text-emerald-800 font-bold text-sm mt-0.5">
                          قراءة {Math.ceil(604 / durationDays)} صفحة يومياً
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      ابدأ الختمة الآن وتوكل على الله
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selector tabs */}
            {khatmas.length > 0 && (
              <div className="flex flex-wrap gap-2 border-b border-stone-200/60 pb-3">
                {khatmas.map((kh) => {
                  const isSelected = activeKhatma?.id === kh.id;
                  const progressPercent = Math.round((kh.readPages.length / 604) * 100);

                  return (
                    <div
                      key={kh.id}
                      onClick={() => {
                        setActiveKhatma(kh);
                        setSliderProgress(kh.readPages.length);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>{kh.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                        {progressPercent}%
                      </span>
                      <button
                        onClick={(e) => deleteKhatma(kh.id, e)}
                        className="p-1 hover:bg-white/20 rounded-lg text-current opacity-70 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                        title="حذف الختمة"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Workspace */}
            {activeKhatma ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4 text-right">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider pr-1 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      <span>إحصائيات التقدم</span>
                    </h3>

                    <div className="flex flex-col items-center py-4 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="relative h-28 w-28 rounded-full border-4 border-stone-200 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent border-l-transparent" style={{ transform: `rotate(${Math.min(360, (activeKhatma.readPages.length / 604) * 360)}deg)` }} />
                        <div className="text-center">
                          <span className="text-2xl font-extrabold text-stone-800">
                            {Math.round((activeKhatma.readPages.length / 604) * 100)}%
                          </span>
                          <div className="text-[10px] text-stone-400">التقدم الكلي</div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-semibold text-stone-600 text-center">
                        أنهيت {activeKhatma.readPages.length} صفحة من أصل 604 صفحة
                      </div>
                    </div>

                    {(() => {
                      const stats = getTodayStats(activeKhatma);
                      return (
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs py-1.5 border-b border-stone-100">
                            <span className="text-stone-500 font-medium">الهدف اليومي المتبقي</span>
                            <span className="font-bold text-emerald-800">{stats.todayTarget} صفحة</span>
                          </div>
                          <div className="flex justify-between text-xs py-1.5 border-b border-stone-100">
                            <span className="text-stone-500 font-medium">الأيام المتبقية للختم</span>
                            <span className="font-bold text-stone-700">{stats.daysRemaining} يوماً</span>
                          </div>
                          <div className="flex justify-between text-xs py-1.5 border-b border-stone-100">
                            <span className="text-stone-500 font-medium">الصفحات المتبقية لقراءتها</span>
                            <span className="font-bold text-stone-700">{stats.pagesRemaining} صفحة</span>
                          </div>
                          <div className="flex justify-between text-xs py-1.5">
                            <span className="text-stone-500 font-medium">تاريخ البداية</span>
                            <span className="font-mono text-stone-600 text-xs">{activeKhatma.startDate}</span>
                          </div>

                          {stats.isBehind && (
                            <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] mt-2">
                              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                              <p className="leading-relaxed">
                                أنت متأخر قليلاً عن خطتك الأساسية للختم. يمكنك زيادة وردك اليومي للتعويض وإنهاء الختمة في موعدها.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Slider update */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4 text-right">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider pr-1 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>تحديث التقدم السريع</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="text-xs text-stone-500 leading-relaxed">
                        اسحب المؤشر لتسجيل آخر صفحة قمت بقراءتها وسيقوم التطبيق بوضع علامة قراءة على جميع الصفحات السابقة تلقائياً:
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-stone-700">
                          <span>صفحة {sliderProgress}</span>
                          <span>صفحة 604</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="604"
                          value={sliderProgress}
                          onChange={(e) => setSliderProgress(Number(e.target.value))}
                          className="w-full accent-emerald-700 cursor-pointer h-2 bg-stone-100 rounded-full"
                        />
                      </div>

                      <button
                        onClick={() => updateProgressUpToPage(sliderProgress)}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-100 cursor-pointer"
                      >
                        تأكيد وحفظ تقدمي إلى الصفحة {sliderProgress}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Juz list */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4 text-right">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span>تتبع قراءتك بالأجزاء</span>
                      </h3>
                      <span className="text-[10px] text-stone-400 font-medium">انقر على الجزء لتحديد قراءته كاملاً</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="juz-grid">
                      {JUZ_PAGES.map((jp) => {
                        const pagesInJuz = Array.from({ length: jp.end - jp.start + 1 }, (_, i) => jp.start + i);
                        const readInJuz = pagesInJuz.filter(p => activeKhatma.readPages.includes(p));
                        const percentRead = Math.round((readInJuz.length / pagesInJuz.length) * 100);
                        const isDone = percentRead === 100;

                        return (
                          <button
                            key={jp.juz}
                            onClick={() => toggleJuzRead(jp.juz)}
                            className={`text-right p-3 rounded-xl border text-xs transition-all relative overflow-hidden group cursor-pointer ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                : readInJuz.length > 0
                                  ? 'bg-amber-50/50 border-amber-200/50 text-amber-950'
                                  : 'bg-white border-stone-100 hover:border-emerald-100 text-stone-700'
                            }`}
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDone ? 'bg-emerald-600' : readInJuz.length > 0 ? 'bg-amber-500' : 'bg-transparent'}`} />

                            <div className="flex items-center justify-between font-bold">
                              <span>الجزء {jp.juz}</span>
                              {isDone && <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />}
                            </div>

                            <div className="text-[10px] text-stone-400 mt-1 font-mono">
                              الصفحات: {jp.start} - {jp.end}
                            </div>

                            <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                              <span>أنجزت:</span>
                              <span>{percentRead}%</span>
                            </div>
                            
                            <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full transition-all duration-300 ${isDone ? 'bg-emerald-600' : 'bg-amber-500'}`}
                                style={{ width: `${percentRead}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual selection section */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-5 text-right">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        <span>مصحف المتابعة التفصيلي واليدوي (صفحة بصفحة) 📖</span>
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">سهولة الختم يدويّاً</span>
                    </div>

                    <div className="space-y-4">
                      {/* Range registration */}
                      <div className="bg-stone-50 p-4 rounded-xl space-y-3 border border-stone-100 text-right">
                        <div className="text-xs font-bold text-stone-700">تسجيل قراءة نطاق صفحات مخصص:</div>
                        <div className="flex items-center gap-3 justify-start flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">من صفحة:</span>
                            <input
                              type="number"
                              min="1"
                              max="604"
                              value={customRangeStart}
                              onChange={(e) => setCustomRangeStart(Math.max(1, Math.min(604, Number(e.target.value))))}
                              className="w-16 px-2 py-1 text-center text-xs font-bold bg-white border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">إلى صفحة:</span>
                            <input
                              type="number"
                              min="1"
                              max="604"
                              value={customRangeEnd}
                              onChange={(e) => setCustomRangeEnd(Math.max(1, Math.min(604, Number(e.target.value))))}
                              className="w-16 px-2 py-1 text-center text-xs font-bold bg-white border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => applyCustomPageRange(true)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              تعليم كمقروء
                            </button>
                            <button
                              onClick={() => applyCustomPageRange(false)}
                              className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              إلغاء القراءة
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Selector for Juz */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-stone-700">اختر الجزء لعرض صفحاته بالتفصيل:</label>
                          <select
                            value={selectedJuzForManual}
                            onChange={(e) => setSelectedJuzForManual(Number(e.target.value))}
                            className="bg-stone-50 border border-stone-200 text-xs font-bold text-stone-850 px-3 py-1.5 rounded-xl focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          >
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                              const jp = JUZ_PAGES.find(x => x.juz === j)!;
                              return (
                                <option key={j} value={j}>
                                  الجزء {j} (الصفحات {jp.start} - {jp.end})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Page circle buttons for selected Juz */}
                        {(() => {
                          const jp = JUZ_PAGES.find(x => x.juz === selectedJuzForManual)!;
                          const pagesInJuz = Array.from({ length: jp.end - jp.start + 1 }, (_, i) => jp.start + i);
                          return (
                            <div className="space-y-3">
                              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                                {pagesInJuz.map((p) => {
                                  const isRead = activeKhatma.readPages.includes(p);
                                  return (
                                    <button
                                      key={p}
                                      onClick={() => togglePageRead(p)}
                                      className={`h-9 w-9 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer hover:scale-105 shadow-sm relative ${
                                        isRead
                                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-100'
                                          : 'bg-white border-stone-150 text-stone-700 hover:border-emerald-300'
                                      }`}
                                      title={isRead ? `صفحة ${p} - تم قراءتها (انقر لإلغاء)` : `صفحة ${p} - لم تُقرأ بعد (انقر للتعليم)`}
                                    >
                                      <span>{p}</span>
                                      {isRead && (
                                        <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 bg-amber-300 rounded-full" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="flex gap-2 justify-start flex-wrap">
                                <button
                                  onClick={() => {
                                    let updatedPages = [...activeKhatma.readPages];
                                    pagesInJuz.forEach(p => {
                                      if (!updatedPages.includes(p)) updatedPages.push(p);
                                    });
                                    updatedPages.sort((a, b) => a - b);
                                    const updated: Khatma = {
                                      ...activeKhatma,
                                      readPages: updatedPages,
                                      status: updatedPages.length >= 604 ? 'completed' : 'active'
                                    };
                                    saveKhatmas(khatmas.map(k => k.id === activeKhatma.id ? updated : k));
                                    setActiveKhatma(updated);
                                    setSliderProgress(updatedPages.length);
                                  }}
                                  className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  تحديد كامل الجزء {selectedJuzForManual} كمقروء
                                </button>
                                <button
                                  onClick={() => {
                                    let updatedPages = activeKhatma.readPages.filter(p => !pagesInJuz.includes(p));
                                    const updated: Khatma = {
                                      ...activeKhatma,
                                      readPages: updatedPages,
                                      status: updatedPages.length >= 604 ? 'completed' : 'active'
                                    };
                                    saveKhatmas(khatmas.map(k => k.id === activeKhatma.id ? updated : k));
                                    setActiveKhatma(updated);
                                    setSliderProgress(updatedPages.length);
                                  }}
                                  className="text-[10px] font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  إلغاء تحديد كامل الجزء {selectedJuzForManual}
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-100 text-stone-400 shadow-sm" id="empty-khatma-state">
                <BookOpen className="h-14 w-14 mx-auto text-stone-300 mb-3" />
                <p className="text-base font-bold text-stone-700">لم تقم بإعداد أي خطة ختمة فردية حالياً</p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  البدء في جدول لتلاوة القرآن الكريم بانتظام يساعدك على الالتزام اليومي وبناء علاقة وطيدة مع المصحف الشريف.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>أنشئ أول ختمة لك الآن</span>
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          // --- COLLABORATIVE KHATMA COMPONENT VIEW ---
          <motion.div
            key="collaborative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6 text-right"
          >
            {/* Header with quick guide */}
            <div>
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 justify-start">
                <Users className="h-5.5 w-5.5 text-emerald-700" />
                <span>الختمة التشاركية مع الأصدقاء والأحباب</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                تشارك مع صديق أو مجموعة أصدقاء في ختم المصحف معاً! أنشئ ختمة تشاركية وشاركهم رمز الدعوة، أو انضم لختمتهم لتتعاونوا على الطاعة والختم سوياً، ليرى كل منكم تقدم الآخر لحظة بلحظة.
              </p>
            </div>

            {/* Error notifications */}
            {collabError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>{collabError}</span>
              </div>
            )}

            {/* Setup view if no active user name or active shared khatma */}
            {!userName ? (
              // Name input form
              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm max-w-md mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <UserCheck className="h-10 w-10 text-emerald-700 mx-auto" />
                  <h3 className="text-base font-bold text-stone-800">الرجاء تسجيل اسمك الكريم أولاً</h3>
                  <p className="text-xs text-stone-400">حتى يعلم أصدقاؤك من قام بقراءة الصفحات في الختمة التشاركية.</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="اكتب اسمك هنا (مثلاً: أحمد، فاطمة)..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-right font-semibold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUserName((e.target as HTMLInputElement).value);
                      }
                    }}
                    onBlur={(e) => handleSaveUserName(e.target.value)}
                  />
                  <p className="text-[10px] text-stone-400 text-center font-bold">اضغط خارج الحقل أو Enter للحفظ والمتابعة</p>
                </div>
              </div>
            ) : !sharedKhatma ? (
              // Actions to create or join a shared khatma
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Create Section */}
                <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-50 pb-2">
                      <Plus className="h-4 w-4 text-emerald-600" />
                      <span>تأسيس ختمة تشاركية جديدة</span>
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed font-medium">
                      أنشئ غرفة ختمة مخصصة، وحدد مدتها بالأيام، ثم شارك الرمز الخاص بها مع صديقك أو عائلتك لتبدأوا القراءة معاً.
                    </p>
                  </div>

                  <form onSubmit={handleCreateSharedKhatma} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-500">اسم الختمة التشاركية</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: ختمتي مع عائلتي، ختمة الصحبة الصالحة..."
                        value={collabKhatmaName}
                        onChange={(e) => setCollabKhatmaName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-right font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-500">المدة المستهدفة (أيام)</label>
                      <select
                        value={collabDurationDays}
                        onChange={(e) => setCollabDurationDays(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-right font-bold"
                      >
                        <option value={7}>7 أيام (ختمة سريعة)</option>
                        <option value={15}>15 يوماً (متوسطة)</option>
                        <option value={30}>30 يوماً (جزء يومياً لكل المشتركين)</option>
                        <option value={60}>60 يوماً (سهلة ومريحة)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isCollabLoading}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isCollabLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>ابدأ الختمة التشاركية</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Join Section */}
                <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-50 pb-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span>الانضمام لختمة صديق</span>
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed font-medium">
                      هل أرسل لك صديقك رمز ختمة تشاركية؟ أدخل الرمز هنا لتنضم إليه فوراً وتتعاونا على ختم كتاب الله تعالى.
                    </p>
                  </div>

                  <form onSubmit={handleJoinSharedKhatma} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-500">اسمك الكريم المسجل: <span className="text-emerald-800 font-extrabold">{userName}</span></label>
                      <button 
                        type="button"
                        onClick={() => handleSaveUserName('')} 
                        className="text-[9px] text-amber-600 hover:underline block font-bold cursor-pointer"
                      >
                        (تغيير الاسم المسجل)
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-500">رمز الختمة التشاركية (مثال: KH-123456)</label>
                      <input
                        type="text"
                        required
                        placeholder="ألصق الرمز هنا..."
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-center font-mono font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCollabLoading}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 disabled:bg-stone-100 text-emerald-800 rounded-xl text-xs font-black transition-all border border-emerald-100 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isCollabLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>تأكيد الانضمام للغرفة</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              // --- ACTIVE COLLABORATIVE KHATMA WORKSPACE VIEW ---
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stats & Invite Info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Share Card */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-3.5">
                    <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                      <h3 className="text-xs font-black text-stone-500 uppercase flex items-center gap-1">
                        <Share2 className="h-4 w-4 text-emerald-600" />
                        <span>مشاركة الختمة مع أصدقائك</span>
                      </h3>
                      <button
                        onClick={() => syncSharedKhatma(sharedKhatma.code)}
                        disabled={syncing}
                        className="p-1 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-emerald-700 cursor-pointer transition-colors"
                        title="مزامنة الآن"
                      >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-emerald-700' : ''}`} />
                      </button>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/30 text-center space-y-2">
                      <div className="text-[10px] text-emerald-800 font-extrabold uppercase">رمز دعوة صديق للختمة</div>
                      <div className="text-xl font-mono font-black text-stone-800 tracking-wider">
                        {sharedKhatma.code}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="mx-auto py-1.5 px-3.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600 flex items-center gap-1 shadow-sm cursor-pointer transition-all"
                      >
                        {copyFeedback ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">تم نسخ الرمز!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-stone-400" />
                            <span>نسخ رمز الدعوة</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 space-y-1.5 leading-relaxed font-semibold">
                      <div className="flex justify-between">
                        <span>اسم الغرفة:</span>
                        <span className="font-bold text-stone-800">{sharedKhatma.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المدة:</span>
                        <span className="font-bold text-stone-800">{sharedKhatma.durationDays} يوم</span>
                      </div>
                      <div className="flex justify-between">
                        <span>اسمك بالختمة:</span>
                        <span className="font-bold text-emerald-800">{userName}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span>الأصدقاء المشاركون:</span>
                        <span className="font-bold text-stone-800 text-left max-w-[150px] line-clamp-2">
                          {sharedKhatma.friends.join('، ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleLeaveSharedKhatma}
                      className="w-full mt-3 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      الخروج من هذه الختمة التشاركية
                    </button>
                  </div>

                  {/* Progressive Stats */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-stone-500 uppercase flex items-center gap-1">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      <span>إحصائيات تقدم الفريق</span>
                    </h3>

                    <div className="flex flex-col items-center py-4 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="relative h-28 w-28 rounded-full border-4 border-stone-200 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent border-l-transparent" style={{ transform: `rotate(${Math.min(360, (sharedReadPagesCount / 604) * 360)}deg)` }} />
                        <div className="text-center">
                          <span className="text-2xl font-extrabold text-stone-800">
                            {sharedPercent}%
                          </span>
                          <div className="text-[10px] text-stone-400">إنجاز الفريق</div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-semibold text-stone-600 text-center px-3 leading-relaxed">
                        أنجز فريقكم قراءة {sharedReadPagesCount} صفحة من أصل 604 صفحة من المصحف الشريف!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Juz & Page interactive checker */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span>تتبع وإنجاز أجزاء القرآن معاً</span>
                      </h3>
                      <button 
                        onClick={() => syncSharedKhatma(sharedKhatma.code)}
                        className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>تحديث القراءة</span>
                      </button>
                    </div>

                    <div className="text-xs text-stone-500 leading-relaxed">
                      انقر على أي جزء أدناه لعرض صفحاته بالتفصيل ووضع علامة القراءة على الصفحات التي تنجزها ليراها أصدقاؤك فوراً:
                    </div>

                    {/* Collaborative Juz Accordion */}
                    <div className="space-y-3">
                      {JUZ_PAGES.map((jp) => {
                        const pagesInJuz = Array.from({ length: jp.end - jp.start + 1 }, (_, i) => jp.start + i);
                        const readInJuz = pagesInJuz.filter(p => !!sharedKhatma.readPages[String(p)]);
                        const percentRead = Math.round((readInJuz.length / pagesInJuz.length) * 100);
                        const isDone = percentRead === 100;
                        const isOpen = expandedJuz === jp.juz;

                        return (
                          <div
                            key={jp.juz}
                            className={`border rounded-2xl overflow-hidden transition-all ${
                              isOpen ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-stone-100'
                            }`}
                          >
                            {/* Accordion Header Trigger */}
                            <button
                              onClick={() => setExpandedJuz(isOpen ? null : jp.juz)}
                              className={`w-full text-right p-4 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                                isOpen ? 'bg-emerald-50/50' : 'bg-white hover:bg-stone-50/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-extrabold text-stone-800 text-sm">الجزء {jp.juz}</span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  (الصفحات {jp.start} - {jp.end})
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                                  أنجز {percentRead}%
                                </span>
                                {isOpen ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                              </div>
                            </button>

                            {/* Accordion Body Pages Content */}
                            {isOpen && (
                              <div className="p-4 bg-[#FCFBF7]/50 border-t border-stone-50 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {pagesInJuz.map((page) => {
                                  const pageStr = String(page);
                                  const readerInfo = sharedKhatma.readPages[pageStr];
                                  const isRead = !!readerInfo;
                                  const isReadByMe = isRead && readerInfo.readBy === userName;

                                  return (
                                    <button
                                      key={page}
                                      onClick={() => handleToggleCollabPage(page, !isRead)}
                                      className={`p-2.5 rounded-xl border text-[11px] text-right transition-all flex flex-col justify-between h-14 relative cursor-pointer ${
                                        isReadByMe
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                          : isRead
                                            ? 'bg-amber-50/40 border-amber-200 text-amber-900 font-bold opacity-85'
                                            : 'bg-white border-stone-100 hover:border-emerald-200 text-stone-600'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-extrabold">صفحة {page}</span>
                                        <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                                          isRead ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
                                        }`}>
                                          {isRead && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                                        </div>
                                      </div>

                                      <div className="text-[9px] text-stone-400 truncate mt-1 w-full text-right font-medium">
                                        {isReadByMe ? (
                                          <span className="text-emerald-700 font-extrabold">✓ قرأتها أنت</span>
                                        ) : isRead ? (
                                          <span className="text-amber-700 font-black">✓ قرأها {readerInfo.readBy}</span>
                                        ) : (
                                          <span>انقر لتسجيل قراءتها</span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
