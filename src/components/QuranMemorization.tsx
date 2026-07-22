import React, { useState, useEffect, useRef } from 'react';
import { QURAN_DATA } from '../data/quran';
import { Surah, MemorizationProgress } from '../types';
import { Pause, CheckCircle, RotateCcw, Award, BookOpen, Volume2, Sparkles, HelpCircle, Eye, EyeOff, Search, Loader2, Mic, Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getAudioUrl = (surahId: number, ayahNumberInSurah: number): string => {
  const paddedSurah = String(surahId).padStart(3, '0');
  const paddedAyah = String(ayahNumberInSurah).padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;
};

// Arabic Text Normalization Helper
const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    // Remove Quranic diacritics, signs, pause marks, and stop marks
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g, '')
    // Replace wasla & alef variants with standard alef 'ا'
    .replace(/[ٱأإآ]/g, 'ا')
    // Replace hamzas (ؤ, ئ, ء) with standard alef or blank
    .replace(/[ؤئ]/g, 'ي')
    .replace(/ء/g, '')
    // Normalize alef maqsura to yaa
    .replace(/ى/g, 'ي')
    // Normalize taa marbuta to haa
    .replace(/ة/g, 'ه')
    // Remove digits (Arabic & Western)
    .replace(/[0-9\u0660-\u0669]/g, '')
    // Remove non-Arabic characters & punctuation
    .replace(/[^\u0600-\u06FF\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const stringSimilarity = (s1: string, s2: string): number => {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
};

const checkRecitationAccuracy = (spoken: string, target: string): { isCorrect: boolean; score: number } => {
  const normSpoken = normalizeArabic(spoken);
  const normTarget = normalizeArabic(target);

  if (!normSpoken || !normTarget) return { isCorrect: false, score: 0 };

  // Strip Bismillah prefix if present in one but not the other
  const cleanSpoken = normSpoken.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
  const cleanTarget = normTarget.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();

  const str1 = cleanSpoken || normSpoken;
  const str2 = cleanTarget || normTarget;

  // Exact match or substring inclusion
  if (str1 === str2) return { isCorrect: true, score: 1.0 };
  if ((str2.includes(str1) || str1.includes(str2)) && Math.min(str1.length, str2.length) >= Math.max(str1.length, str2.length) * 0.3) {
    return { isCorrect: true, score: 0.9 };
  }

  // Levenshtein similarity
  const sim = stringSimilarity(str1, str2);
  if (sim >= 0.35) {
    return { isCorrect: true, score: sim };
  }

  // Word-level match ratio
  const spokenWords = str1.split(' ').filter(w => w.length > 0);
  const targetWords = str2.split(' ').filter(w => w.length > 0);

  let matchedWords = 0;
  for (const tWord of targetWords) {
    const isMatched = spokenWords.some(sWord => {
      if (sWord === tWord) return true;
      if (tWord.length >= 2 && sWord.length >= 2) {
        if (sWord.includes(tWord) || tWord.includes(sWord)) return true;
        if (stringSimilarity(sWord, tWord) >= 0.5) return true;
      }
      return false;
    });
    if (isMatched) matchedWords++;
  }

  const wordScore = targetWords.length > 0 ? matchedWords / targetWords.length : 0;
  const isCorrect = wordScore >= 0.35;

  return { isCorrect, score: Math.max(sim, wordScore) };
};

export const QuranMemorization: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>(QURAN_DATA);
  const [selectedSurah, setSelectedSurah] = useState<Surah>(QURAN_DATA[0]);
  const [progress, setProgress] = useState<MemorizationProgress[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Audio state
  const [playingAyah, setPlayingAyah] = useState<{ surahId: number, ayahNum: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Self-Test States
  const [testMode, setTestMode] = useState<boolean>(false);
  const [hideType, setHideType] = useState<'all' | 'partial'>('all'); // all = hide entire ayah text, partial = blur alternate words
  const [revealedAyahs, setRevealedAyahs] = useState<number[]>([]); // ayah numbers currently revealed in 'all' mode

  // Speech Recognition States
  const [listeningAyahNum, setListeningAyahNum] = useState<number | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<{ ayahNum: number; status: 'success' | 'error'; transcript: string; message: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('km_memorize_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch 114 surah list on mount
  useEffect(() => {
    const fetchAllSurahs = async () => {
      try {
        setLoadingList(true);
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.data) {
          const mapped: Surah[] = data.data.map((s: any) => {
            const existing = QURAN_DATA.find(q => q.id === s.number);
            return {
              id: s.number,
              name: s.name.replace("سُورَةُ ", "").replace("سورة ", ""),
              englishName: s.englishName,
              type: s.revelationType.toLowerCase() as 'meccan' | 'medinan',
              typeAr: s.revelationType === 'Meccan' ? 'مكية' : 'مدنية',
              totalAyahs: s.numberOfAyahs,
              ayahs: existing ? existing.ayahs : []
            };
          });
          setSurahs(mapped);
          
          // Set initial selection to Al-Fatihah from the loaded list
          const firstSurah = mapped[0];
          const existingFirst = QURAN_DATA.find(q => q.id === firstSurah.id);
          if (existingFirst) {
            setSelectedSurah(existingFirst);
          } else {
            setSelectedSurah(firstSurah);
          }
        }
      } catch (err) {
        console.error('Failed to load full surah list, using offline fallback', err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchAllSurahs();
  }, []);

  // Dynamically load selected surah details on demand
  useEffect(() => {
    if (!selectedSurah) return;
    if (selectedSurah.ayahs && selectedSurah.ayahs.length > 0) {
      return; // Already loaded or pre-populated
    }

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.data && data.data.ayahs) {
          const loadedAyahs = data.data.ayahs.map((a: any) => ({
            number: a.numberInSurah,
            text: a.text,
            audioUrl: getAudioUrl(selectedSurah.id, a.numberInSurah)
          }));

          // Update both lists
          setSurahs(prev => prev.map(s => {
            if (s.id === selectedSurah.id) {
              return { ...s, ayahs: loadedAyahs };
            }
            return s;
          }));
          setSelectedSurah(prev => ({
            ...prev,
            ayahs: loadedAyahs
          }));
        }
      } catch (err) {
        console.error('Failed to load surah details dynamically', err);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedSurah.id]);

  const saveProgress = (updated: MemorizationProgress[]) => {
    setProgress(updated);
    localStorage.setItem('km_memorize_progress', JSON.stringify(updated));
  };

  const getSurahProgress = (surahId: number): MemorizationProgress => {
    return progress.find(p => p.surahId === surahId) || { surahId, memorizedAyahs: [] };
  };

  const toggleAyahMemorized = (surahId: number, ayahNum: number) => {
    const currentProg = getSurahProgress(surahId);
    let updatedAyahs = [...currentProg.memorizedAyahs];
    
    if (updatedAyahs.includes(ayahNum)) {
      updatedAyahs = updatedAyahs.filter(n => n !== ayahNum);
    } else {
      updatedAyahs.push(ayahNum);
    }

    const updatedProg: MemorizationProgress = {
      ...currentProg,
      memorizedAyahs: updatedAyahs,
      lastPracticed: new Date().toISOString()
    };

    const newProgress = progress.some(p => p.surahId === surahId)
      ? progress.map(p => p.surahId === surahId ? updatedProg : p)
      : [...progress, updatedProg];

    saveProgress(newProgress);
  };

  const markAllSurah = (surahId: number, memorized: boolean) => {
    const surah = surahs.find(s => s.id === surahId);
    if (!surah) return;

    const updatedProg: MemorizationProgress = {
      surahId,
      memorizedAyahs: memorized ? surah.ayahs.map(a => a.number) : [],
      lastPracticed: new Date().toISOString()
    };

    const newProgress = progress.some(p => p.surahId === surahId)
      ? progress.map(p => p.surahId === surahId ? updatedProg : p)
      : [...progress, updatedProg];

    saveProgress(newProgress);
  };

  // Audio Playback
  const playAudio = (surahId: number, ayahNum: number, url: string) => {
    // If same ayah is playing, toggle pause
    if (playingAyah?.surahId === surahId && playingAyah?.ayahNum === ayahNum) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(err => console.log("Audio play blocked", err));
        } else {
          audioRef.current.pause();
          setPlayingAyah(null);
        }
      }
      return;
    }

    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPlayingAyah({ surahId, ayahNum });
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.play().catch(err => {
      console.log("Audio play error", err);
      setPlayingAyah(null);
    });

    audio.onended = () => {
      setPlayingAyah(null);
    };
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const startVoiceRecitation = (ayahNum: number, targetText: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechFeedback({
        ayahNum,
        status: 'error',
        transcript: '',
        message: 'متصفحك الحالي لا يدعم تقنية التسميع الصوتي المباشر. يرجى استخدام متصفح Chrome أو Edge.'
      });
      return;
    }

    if (listeningAyahNum === ayahNum) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setListeningAyahNum(null);
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      setListeningAyahNum(ayahNum);
      setSpeechFeedback(null);
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const { isCorrect } = checkRecitationAccuracy(transcript, targetText);

        if (isCorrect) {
          if (!revealedAyahs.includes(ayahNum)) {
            setRevealedAyahs(prev => [...prev, ayahNum]);
          }
          setSpeechFeedback({
            ayahNum,
            status: 'success',
            transcript,
            message: 'ما شاء الله! قراءتك صحيحة ومطابقة للآية الكريمة، تم كشف الآية ✨'
          });
        } else {
          setSpeechFeedback({
            ayahNum,
            status: 'error',
            transcript,
            message: `لم تقرأ بشكل صحيح (الكلمات المسموعة: "${transcript}"). يرجى إعادة المحاولة والتسميع مرة أخرى.`
          });
        }
        setListeningAyahNum(null);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        let errMsg = 'لم نتمكن من التقاط الصوت بوضوح، يرجى إعادة التسميع مجدداً.';
        if (event.error === 'not-allowed') {
          errMsg = 'يرجى إعطاء صلاحية المايكروفون للمتصفح لتسميع الآية.';
        }
        setSpeechFeedback({
          ayahNum,
          status: 'error',
          transcript: '',
          message: errMsg
        });
        setListeningAyahNum(null);
      };

      recognition.onend = () => {
        setListeningAyahNum(null);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start error', err);
      setListeningAyahNum(null);
    }
  };

  const currentSurahProg = getSurahProgress(selectedSurah.id);
  const memorizedCount = currentSurahProg.memorizedAyahs.length;
  const isCompleted = memorizedCount === selectedSurah.totalAyahs;
  const progressPercent = Math.round((memorizedCount / selectedSurah.totalAyahs) * 100);

  // Helper to partial mask words in text
  const renderMaskedText = (text: string, ayahNum: number) => {
    if (!testMode) return text;
    
    if (hideType === 'all') {
      const isRevealed = revealedAyahs.includes(ayahNum);
      if (isRevealed) {
        return (
          <span className="text-emerald-800 transition-colors duration-300">
            {text}
          </span>
        );
      } else {
        const isListening = listeningAyahNum === ayahNum;
        const feedback = speechFeedback?.ayahNum === ayahNum ? speechFeedback : null;

        return (
          <div className="inline-flex flex-col items-end gap-2 my-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100/90 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 w-full">
              <span 
                className="bg-stone-300/80 dark:bg-stone-700/80 text-transparent select-none px-4 py-1.5 rounded blur-[5px] font-mono text-sm cursor-pointer hover:blur-[3px] transition-all"
                onClick={() => toggleRevealAyah(ayahNum)}
                title="انقر لكشف الآية يدوياً"
              >
                {text}
              </span>

              <button
                type="button"
                onClick={() => startVoiceRecitation(ayahNum, text)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-bounce' : ''}`} />
                <span>{isListening ? 'جاري الاستماع لقراءتك...' : 'اقرأ بالمايك للتسميع'}</span>
              </button>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border ${
                  feedback.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedback.status === 'success' ? (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
                <button 
                  onClick={() => setSpeechFeedback(null)} 
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </div>
        );
      }
    }

    // Partial hide: blur every odd index word
    const words = text.split(' ');
    return words.map((word, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} className="blur-[3px] hover:blur-none transition-all cursor-pointer bg-stone-100 px-1 rounded text-stone-700 font-medium" title="انقر لإظهار الكلمة">
            {word}{' '}
          </span>
        );
      }
      return <span key={i}>{word} </span>;
    });
  };

  const toggleRevealAyah = (ayahNum: number) => {
    if (revealedAyahs.includes(ayahNum)) {
      setRevealedAyahs(revealedAyahs.filter(n => n !== ayahNum));
    } else {
      setRevealedAyahs([...revealedAyahs, ayahNum]);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchQuery) || 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.id) === searchQuery
  );

  return (
    <div className="space-y-8" id="quran-memorize-root">
      {/* Top Banner stats */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-right">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-stone-800">ركن تحفيظ القرآن الكريم</h2>
          </div>
          <p className="text-xs text-stone-500">
            اختر السورة، استمع للآيات بصوت الشيخ العفاسي، واحفظ آية تلو الأخرى مع اختبار حفظك الذاتي.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 self-start md:self-auto">
          <div className="text-right">
            <div className="text-xs text-stone-500">السور التي تحفظها بالكامل</div>
            <div className="text-lg font-bold text-emerald-800">
              {surahs.filter(s => getSurahProgress(s.id).memorizedAyahs.length === s.totalAyahs).length} من {surahs.length} سور
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Surah selection */}
        <div className="lg:col-span-4 space-y-4" id="surah-list-sidebar">
          <h3 className="text-sm font-semibold text-stone-500 flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>السور المتاحة للتحفيظ</span>
          </h3>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن السورة (اسم أو رقم)..."
              className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl text-xs font-bold text-stone-700 dark:text-stone-200 outline-none focus:border-emerald-500 text-right pr-9"
            />
            <Search className="h-4 w-4 text-stone-400 absolute right-3 top-3.5" />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {loadingList ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-stone-400">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                <span className="text-[11px] font-bold">جاري تحميل قائمة السور...</span>
              </div>
            ) : filteredSurahs.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs font-bold">
                لا توجد سور مطابقة لخيارات البحث
              </div>
            ) : (
              filteredSurahs.map((surah) => {
              const prog = getSurahProgress(surah.id);
              const count = prog.memorizedAyahs.length;
              const isDone = count === surah.totalAyahs;
              const percent = Math.round((count / surah.totalAyahs) * 100);

              return (
                <button
                  key={surah.id}
                  onClick={() => {
                    setSelectedSurah(surah);
                    setRevealedAyahs([]);
                    setSpeechFeedback(null);
                    setTimeout(() => {
                      const targetEl = document.getElementById('surah-header-card') || document.getElementById('verses-board');
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 60);
                  }}
                  className={`w-full text-right p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    selectedSurah.id === surah.id
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                      : 'bg-white border-stone-100 hover:border-emerald-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedSurah.id === surah.id ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {surah.id}
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{surah.name}</div>
                      <div className={`text-[10px] ${selectedSurah.id === surah.id ? 'text-emerald-100' : 'text-stone-400'}`}>
                        {surah.typeAr} • {surah.totalAyahs} آيات
                      </div>
                    </div>
                  </div>

                  <div className="text-left flex flex-col items-end gap-1">
                    {isDone ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedSurah.id === surah.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>تم الحفظ</span>
                    ) : count > 0 ? (
                      <span className={`text-[10px] font-semibold ${selectedSurah.id === surah.id ? 'text-emerald-100' : 'text-emerald-800'}`}>
                        {count}/{surah.totalAyahs} آيات ({percent}%)
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">لم يبدأ بعد</span>
                    )}

                    {count > 0 && (
                      <div className="w-16 h-1 bg-stone-200 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${selectedSurah.id === surah.id ? 'bg-white' : 'bg-emerald-600'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
            )}
          </div>
        </div>

        {/* Right column: Surah recitation + memorization board */}
        <div className="lg:col-span-8 space-y-6">
          {/* Surah Header Card */}
          <div id="surah-header-card" className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 -ml-8 -mt-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
            
            <div className="flex justify-between items-center relative z-10">
              <div className="text-right">
                <span className="px-2 py-0.5 bg-white/20 text-[10px] font-bold rounded-md uppercase">سورة {selectedSurah.typeAr}</span>
                <h3 className="text-2xl font-bold font-serif mt-1.5">{selectedSurah.name}</h3>
                <p className="text-xs text-emerald-100/80 font-mono mt-0.5">{selectedSurah.englishName} ({selectedSurah.totalAyahs} آيات)</p>
              </div>

              <div className="text-left">
                <div className="text-xs text-emerald-100/80">نسبة الحفظ</div>
                <div className="text-3xl font-extrabold text-amber-300">{progressPercent}%</div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="mt-6 flex flex-wrap gap-2.5 items-center justify-between border-t border-white/10 pt-4 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => markAllSurah(selectedSurah.id, !isCompleted)}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors font-medium text-white"
                >
                  <CheckCircle className={`h-3.5 w-3.5 ${isCompleted ? 'text-amber-300 fill-amber-300/10' : ''}`} />
                  <span>{isCompleted ? 'إلغاء حفظ السورة' : 'تحديد السورة ككاملة الحفظ'}</span>
                </button>
                <button
                  onClick={() => {
                    markAllSurah(selectedSurah.id, false);
                    setRevealedAyahs([]);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors text-white"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>إعادة ضبط</span>
                </button>
              </div>

              {/* Toggle Self-Test */}
              <button
                onClick={() => {
                  setTestMode(!testMode);
                  setRevealedAyahs([]);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-4.5 rounded-xl transition-all font-semibold ${
                  testMode 
                    ? 'bg-amber-400 text-emerald-950 shadow-md scale-105'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>{testMode ? 'إيقاف وضع اختبار الحفظ' : 'تشغيل وضع اختبار الحفظ'}</span>
              </button>
            </div>
          </div>

          {/* Self-Test Configuration (Visible only when testMode is true) */}
          <AnimatePresence>
            {testMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-950">
                  <div className="text-right space-y-1">
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>أنت الآن في وضع اختبار الحفظ الذاتي</span>
                    </h4>
                    <p className="text-[11px] text-emerald-900">
                      يساعدك هذا الوضع على مراجعة الآيات وتأكيد حفظك عن طريق إخفاء أجزاء من النص أو الآية كاملة.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setHideType('all'); setRevealedAyahs([]); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        hideType === 'all'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      إخفاء الآية كاملة
                    </button>
                    <button
                      onClick={() => setHideType('partial')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        hideType === 'partial'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      تضليل كلمات متناوبة
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verses Board */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-6" id="verses-board">
            {loadingDetail ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
                <p className="text-xs text-stone-400 font-bold">جاري تحميل آيات السورة الكريمة من المصحف...</p>
              </div>
            ) : selectedSurah.ayahs && selectedSurah.ayahs.length > 0 ? (
              <>
                {/* Basmala (Hide for Surah Fatihah since it's verse 1, and only show for other surahs) */}
                {selectedSurah.id !== 1 && (
                  <div className="text-center py-2 text-stone-400 font-serif text-lg border-b border-stone-50">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}

                <div className="divide-y divide-stone-100">
                  {selectedSurah.ayahs.map((ayah) => {
                const isMemorized = currentSurahProg.memorizedAyahs.includes(ayah.number);
                const isAyahAudioPlaying = playingAyah?.surahId === selectedSurah.id && playingAyah?.ayahNum === ayah.number;

                return (
                  <div
                    key={ayah.number}
                    className={`py-5 flex flex-col md:flex-row items-start justify-between gap-4 transition-all ${
                      isMemorized ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Verse actions / Play / Memo status */}
                    <div className="flex items-center gap-2 order-2 md:order-1 self-start md:self-auto shrink-0">
                      {/* Play audio */}
                      <button
                        onClick={() => playAudio(selectedSurah.id, ayah.number, ayah.audioUrl)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                          isAyahAudioPlaying
                            ? 'bg-amber-500 text-white scale-105'
                            : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="استمع لتلاوة الآية الكريمة"
                      >
                        {isAyahAudioPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>

                      {/* Memorized toggle */}
                      <button
                        onClick={() => toggleAyahMemorized(selectedSurah.id, ayah.number)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          isMemorized
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-emerald-200 hover:bg-stone-50'
                        }`}
                      >
                        <CheckCircle className={`h-3.5 w-3.5 ${isMemorized ? 'fill-emerald-800 text-white' : ''}`} />
                        <span>{isMemorized ? 'تم الحفظ' : 'احفظ'}</span>
                      </button>

                      {/* Reveal helper for hidden 'all' test mode */}
                      {testMode && hideType === 'all' && (
                        <button
                          onClick={() => toggleRevealAyah(ayah.number)}
                          className={`h-8 px-2.5 rounded-xl border flex items-center justify-center text-xs font-medium transition-all ${
                            revealedAyahs.includes(ayah.number)
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {revealedAyahs.includes(ayah.number) ? <EyeOff className="h-3.5 w-3.5 ml-1" /> : <Eye className="h-3.5 w-3.5 ml-1" />}
                          <span>{revealedAyahs.includes(ayah.number) ? 'إخفاء' : 'كشف'}</span>
                        </button>
                      )}
                    </div>

                    {/* Verse content */}
                    <div className="flex-1 text-right order-1 md:order-2 space-y-1.5 w-full">
                      <div className="flex items-center justify-end gap-2 text-[10px] text-stone-400 font-mono">
                        <span>الآية {ayah.number}</span>
                      </div>
                      <div className="font-serif text-xl md:text-2xl text-stone-800 leading-relaxed font-semibold pr-2">
                        {renderMaskedText(ayah.text, ayah.number)}
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-600/30 text-emerald-800 text-xs font-serif font-bold mr-2 select-none">
                          {ayah.number}
                        </span>
                      </div>
                    </div>
                  </div>
                );
                  })}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-stone-400 font-bold text-xs">
                لا توجد آيات متوفرة لهذه السورة الكريمة حالياً. يرجى التحقق من الاتصال بالإنترنت.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
