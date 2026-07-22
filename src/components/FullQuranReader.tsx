import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Volume2, 
  Pause, 
  Bookmark, 
  ZoomIn, 
  ZoomOut, 
  Loader2, 
  ChevronRight, 
  AlertCircle,
  BookmarkCheck,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

interface AyahDetail {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

interface SurahDetail {
  number: number;
  name: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: AyahDetail[];
}

export const FullQuranReader: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');

  // Selected Surah View
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string>('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  // Reading Options
  const [fontSize, setFontSize] = useState<number>(22); // default font size in pixels
  const [themeMode, setThemeMode] = useState<'paper' | 'dark' | 'beige'>('paper');

  // Bookmarking
  const [bookmark, setBookmark] = useState<{ surahId: number; surahName: string; ayahNum: number } | null>(null);

  // Audio Playback
  const [playingAyah, setPlayingAyah] = useState<number | null>(null); // numberInSurah
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load 114 Surahs List & Bookmarks
  useEffect(() => {
    // Load bookmark
    const savedBookmark = localStorage.getItem('km_quran_bookmark');
    if (savedBookmark) {
      try {
        setBookmark(JSON.parse(savedBookmark));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch surah metadata list
    const fetchSurahs = async () => {
      try {
        setLoadingList(true);
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        if (!res.ok) throw new Error('فشل تحميل قائمة السور.');
        const data = await res.json();
        setSurahs(data.data || []);
      } catch (err: any) {
        setListError('تعذر الاتصال بخادم المصحف. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } finally {
        setLoadingList(false);
      }
    };

    fetchSurahs();
  }, []);

  // Fetch Surah Details when selectedSurahId changes
  useEffect(() => {
    if (!selectedSurahId) {
      setSurahDetail(null);
      return;
    }

    const fetchSurahDetail = async () => {
      try {
        setLoadingDetail(true);
        setDetailError('');
        // Stop any running audio
        if (audioRef.current) {
          audioRef.current.pause();
          setPlayingAyah(null);
        }

        const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahId}`);
        if (!res.ok) throw new Error('فشل تحميل نص السورة الكريمة.');
        const data = await res.json();
        setSurahDetail(data.data || null);
      } catch (err: any) {
        setDetailError('تعذر تحميل آيات السورة الكريمة. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchSurahDetail();
  }, [selectedSurahId]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Audio Playback Handler
  const playAyahAudio = (ayahNumInSurah: number) => {
    if (!selectedSurahId) return;

    // Check if currently playing this exact ayah
    if (playingAyah === ayahNumInSurah) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(err => console.log(err));
        } else {
          audioRef.current.pause();
          setPlayingAyah(null);
        }
      }
      return;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPlayingAyah(ayahNumInSurah);

    // Build standard verse audio url
    const paddedSurah = String(selectedSurahId).padStart(3, '0');
    const paddedAyah = String(ayahNumInSurah).padStart(3, '0');
    const url = `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => {
      console.log('Audio playback blocked/failed', err);
      setPlayingAyah(null);
    });

    audio.onended = () => {
      // Auto advance to next ayah if available
      if (surahDetail && ayahNumInSurah < surahDetail.numberOfAyahs) {
        playAyahAudio(ayahNumInSurah + 1);
      } else {
        setPlayingAyah(null);
      }
    };
  };

  const handleSaveBookmark = (surahId: number, surahName: string, ayahNum: number) => {
    const newBookmark = { surahId, surahName, ayahNum };
    setBookmark(newBookmark);
    localStorage.setItem('km_quran_bookmark', JSON.stringify(newBookmark));
  };

  const handleGoToBookmark = () => {
    if (!bookmark) return;
    setSelectedSurahId(bookmark.surahId);
    // Detail loader will trigger and fetch that surah.
  };

  // Filter surahs
  const filteredSurahs = surahs.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || 
                          s.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || s.revelationType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Theme styling mapping
  const themeClasses = {
    paper: 'bg-[#FCFBF7] text-stone-900 border-stone-200/60',
    dark: 'bg-[#151515] text-stone-100 border-stone-800',
    beige: 'bg-[#F4EFE6] text-amber-950 border-amber-900/10'
  };

  return (
    <div className="space-y-6" id="full-quran-reader">
      {/* Top Welcome Header */}
      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-right">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 justify-start">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/50">
              <BookOpen className="h-5.5 w-5.5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-800 font-serif">المصحف الشريف كاملاً</h2>
              <p className="text-[11px] text-stone-400 font-bold mt-0.5">اقرأ واستمع لكلام الله عز وجل برسم المصحف العثماني</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            تصفح جميع سور القرآن الـ 114 مع إمكانية البحث الفوري، وتكبير الخط لراحة العين، والاستماع لتلاوة مباركة بصوت الشيخ مشاري العفاسي مع ميزة حفظ العلامة للرجوع إليها لاحقاً.
          </p>
        </div>

        {/* Quick bookmark restore */}
        {bookmark && (
          <button
            onClick={handleGoToBookmark}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-4 py-3 rounded-2xl text-amber-900 text-xs font-bold transition-all cursor-pointer shrink-0 align-middle"
          >
            <BookmarkCheck className="h-4.5 w-4.5 text-amber-600 animate-bounce" />
            <div className="text-right">
              <div className="text-[10px] text-amber-700 font-semibold">استكمال القراءة من العلامة:</div>
              <div className="text-xs font-black">سورة {bookmark.surahName} - آية {bookmark.ayahNum}</div>
            </div>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedSurahId ? (
          // Surah Grid Listing
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-5"
          >
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="ابحث عن السورة (مثلاً: البقرة، الكهف)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-right focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 font-medium"
                  dir="rtl"
                />
              </div>

              {/* Filtering tabs */}
              <div className="flex bg-stone-50 p-1 rounded-2xl border border-stone-100 shrink-0 w-full md:w-auto justify-around">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'Meccan', label: 'مكية' },
                  { id: 'Medinan', label: 'مدنية' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id as any)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === tab.id 
                        ? 'bg-emerald-700 text-white shadow'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {listError && (
              <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-red-800 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-xs font-semibold">{listError}</p>
              </div>
            )}

            {/* Loader */}
            {loadingList ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mx-auto" />
                <p className="text-stone-500 text-xs font-bold">جاري تحميل قائمة السور الكريمة من الخادم الرئيسي...</p>
              </div>
            ) : (
              // Grid list of surahs
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => setSelectedSurahId(surah.number)}
                    className="p-4 bg-white border border-stone-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer text-right flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Chevron left */}
                      <ChevronLeft className="h-4 w-4 text-stone-300 group-hover:text-emerald-700 transition-colors" />
                      
                      {/* Meta stats */}
                      <div className="text-left font-sans">
                        <div className="text-[10px] font-bold text-stone-400 uppercase">{surah.englishName}</div>
                        <div className="text-[9px] text-stone-400 mt-0.5 font-bold">
                          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {/* Surah Name and Num */}
                      <div className="text-right">
                        <div className="text-sm font-black text-stone-800 font-serif group-hover:text-emerald-800 transition-colors">
                          سورة {surah.name.replace('سُورَةُ ', '')}
                        </div>
                        <div className="text-[9px] text-stone-400 font-bold mt-0.5">سورة رقم {surah.number}</div>
                      </div>

                      {/* Number badge */}
                      <div className="h-8.5 w-8.5 rounded-xl bg-stone-50 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors font-mono text-xs font-black flex items-center justify-center border border-stone-100">
                        {surah.number}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // Active Reading View
          <motion.div
            key="reader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Top Reader Actions bar */}
            <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setSelectedSurahId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 cursor-pointer bg-stone-50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-stone-100 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
                <span>العودة لجميع السور</span>
              </button>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Font zoom controls */}
                <div className="flex items-center border border-stone-100 bg-stone-50 rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="تصغير الخط"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-black px-2.5 text-stone-600 font-mono">حجم الخط ({fontSize}px)</span>
                  <button 
                    onClick={() => setFontSize(prev => Math.min(36, prev + 2))}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="تكبير الخط"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Theme selectors */}
                <div className="flex items-center border border-stone-100 bg-stone-50 rounded-xl p-1 shrink-0">
                  {[
                    { id: 'paper', label: 'افتراضي', color: 'bg-[#FCFBF7] border-stone-200' },
                    { id: 'beige', label: 'ورقي', color: 'bg-[#F4EFE6] border-amber-900/10' },
                    { id: 'dark', label: 'ليلي', color: 'bg-stone-900 border-stone-950' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeMode(t.id as any)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer border transition-all ${
                        themeMode === t.id 
                          ? 'bg-emerald-700 text-white shadow border-emerald-700' 
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error State */}
            {detailError && (
              <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-red-800 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-xs font-semibold">{detailError}</p>
              </div>
            )}

            {/* Reader Content Card */}
            {loadingDetail ? (
              <div className="bg-white rounded-3xl border border-stone-100 p-24 text-center space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-700 animate-spin mx-auto" />
                <p className="text-stone-500 text-xs font-bold animate-pulse">جاري تحميل آيات السورة الكريمة بالرسم العثماني...</p>
              </div>
            ) : surahDetail ? (
              <div className={`rounded-3xl border p-6 md:p-10 shadow-sm transition-all ${themeClasses[themeMode]}`}>
                
                {/* Quranic Header Decorator */}
                <div className="text-center space-y-2 border-b border-stone-200/50 pb-6 mb-8 max-w-xl mx-auto">
                  <div className="text-emerald-700 font-bold text-xs uppercase tracking-wider">سُورَةُ الكَرِيمَةِ</div>
                  <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-center">
                    {surahDetail.name}
                  </h1>
                  <p className="text-[11px] opacity-70 font-bold">
                    {surahDetail.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • آياتها {surahDetail.numberOfAyahs} • نزلت بعد سورة البروج تقريباً
                  </p>
                </div>

                {/* Basmallah (unless Al-Tawbah) */}
                {surahDetail.number !== 9 && (
                  <div className="text-center text-2xl font-serif text-stone-800 font-extrabold py-4 mb-6 leading-relaxed select-all">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}

                {/* Interactive Verses Layout */}
                <div 
                  className="leading-[2.2] text-right font-serif antialiased select-all space-y-6"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="flex flex-wrap gap-x-2.5 gap-y-4 justify-start items-center">
                    {surahDetail.ayahs.map((ayah) => {
                      const isPlaying = playingAyah === ayah.numberInSurah;
                      const isBookmarked = bookmark?.surahId === selectedSurahId && bookmark?.ayahNum === ayah.numberInSurah;

                      // Strip leading "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" from Fatihah's first ayah, and other surahs' if returned by API
                      let textToShow = ayah.text;
                      if (surahDetail.number !== 1 && ayah.numberInSurah === 1 && textToShow.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
                        textToShow = textToShow.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
                      }

                      return (
                        <span 
                          key={ayah.number}
                          className={`inline-block py-1 px-2.5 rounded-xl border border-transparent transition-all cursor-pointer ${
                            isPlaying 
                              ? 'bg-emerald-100/75 text-emerald-950 border-emerald-300 font-extrabold scale-[1.01]' 
                              : isBookmarked
                                ? 'bg-amber-100/60 text-amber-950 border-amber-300'
                                : 'hover:bg-stone-500/5'
                          }`}
                        >
                          {/* Text content */}
                          <span 
                            onClick={() => playAyahAudio(ayah.numberInSurah)}
                            className="font-medium tracking-normal select-all inline-block"
                          >
                            {textToShow}
                          </span>

                          {/* Verse End decoration Badge */}
                          <span className="inline-flex items-center gap-1.5 mr-2 font-sans font-black select-none text-xs align-middle">
                            {/* Verse Number Frame */}
                            <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                              {ayah.numberInSurah}
                            </span>

                            {/* Verse action tools popup trigger on click */}
                            <span className="flex items-center gap-1 shrink-0 opacity-40 hover:opacity-100 transition-opacity p-0.5">
                              {/* Audio Trigger */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playAyahAudio(ayah.numberInSurah);
                                }}
                                className="hover:text-emerald-800 transition-colors"
                                title="استماع للآية"
                              >
                                {isPlaying ? <Pause className="h-3 w-3 animate-pulse" /> : <Volume2 className="h-3 w-3" />}
                              </button>

                              {/* Bookmark Trigger */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveBookmark(surahDetail.number, surahDetail.name, ayah.numberInSurah);
                                }}
                                className={`transition-colors ${isBookmarked ? 'text-amber-600' : 'hover:text-amber-500'}`}
                                title="حفظ علامة القراءة هنا"
                              >
                                <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
                              </button>
                            </span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Suffix / Tasdeeq */}
                <div className="text-center font-serif text-lg font-bold text-stone-500 mt-12 pt-6 border-t border-stone-200/50">
                  صَدَقَ اللهُ العَظِيم
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
