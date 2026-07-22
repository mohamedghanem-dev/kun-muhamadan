import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface SurahBrief {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export const QuranTafsir: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahBrief[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState<boolean>(true);
  const [errorSurahs, setErrorSurahs] = useState<string>('');

  // Selected state
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);

  // Loaded Tafsir details
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);
  const [errorTafsir, setErrorTafsir] = useState<string>('');
  const [originalAyahText, setOriginalAyahText] = useState<string>('');
  const [tafsirMuyassar, setTafsirMuyassar] = useState<string>('');
  const [tafsirJalalayn, setTafsirJalalayn] = useState<string>('');

  // Fetch Surah list on mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoadingSurahs(true);
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        if (!res.ok) throw new Error('فشل تحميل السور الكريمة.');
        const data = await res.json();
        setSurahs(data.data || []);
      } catch (err: any) {
        setErrorSurahs('فشل الاتصال بالخادم لتحميل قائمة السور الكريمة. يرجى التحقق من اتصال الإنترنت.');
      } finally {
        setLoadingSurahs(false);
      }
    };

    fetchSurahs();
  }, []);

  // Fetch Tafsir whenever selectedSurah or selectedAyah changes
  const fetchTafsir = async (surahNum: number, ayahNum: number) => {
    try {
      setLoadingTafsir(true);
      setErrorTafsir('');
      setOriginalAyahText('');
      setTafsirMuyassar('');
      setTafsirJalalayn('');

      // Fetch Tafsir Al-Muyassar
      const resMuyassar = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.muyassar`);
      if (!resMuyassar.ok) throw new Error('فشل تحميل تفسير الميسر.');
      const dataMuyassar = await resMuyassar.json();

      // Fetch Tafsir Al-Jalalayn
      const resJalalayn = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.jalalayn`);
      let jalalaynText = '';
      if (resJalalayn.ok) {
        const dataJalalayn = await resJalalayn.json();
        jalalaynText = dataJalalayn.data?.text || '';
      }

      // Set states
      // Wait, Al-Quran Cloud Tafsir endpoints actually return the Tafsir text inside "text"
      // But we can clean it up or fetch standard verses separately if needed.
      // Actually, ar.muyassar returns the Tafsir text directly in `.data.text`!
      // To get the original Quran text, we can fetch `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}`!
      const resOriginal = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}`);
      let originalQuranText = '';
      if (resOriginal.ok) {
        const dataOrig = await resOriginal.json();
        originalQuranText = dataOrig.data?.text || '';
      }

      setOriginalAyahText(originalQuranText);
      setTafsirMuyassar(dataMuyassar.data?.text || '');
      setTafsirJalalayn(jalalaynText);

    } catch (err: any) {
      setErrorTafsir('عذراً، فشل تحميل التفسير لهذه الآية الكريمة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoadingTafsir(false);
    }
  };

  useEffect(() => {
    if (surahs.length > 0) {
      fetchTafsir(selectedSurah, selectedAyah);
    }
  }, [selectedSurah, selectedAyah, surahs]);

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = Number(e.target.value);
    setSelectedSurah(num);
    setSelectedAyah(1); // Reset to first Ayah of new Surah
  };

  const handleAyahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = Number(e.target.value);
    setSelectedAyah(num);
  };

  const activeSurahMeta = surahs.find((s) => s.number === selectedSurah);
  const totalAyahs = activeSurahMeta ? activeSurahMeta.numberOfAyahs : 7;

  // Build array of Ayah numbers for select dropdown
  const ayahOptions = [];
  for (let i = 1; i <= totalAyahs; i++) {
    ayahOptions.push(i);
  }

  return (
    <div className="space-y-6 text-right animate-fade-in" id="quran-tafsir-root">
      {/* Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 justify-start">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/30">
              <BookOpen className="h-5.5 w-5.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 font-serif">قسم تفسير القرآن الكريم</h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold mt-0.5">تدبّر آيات الذكر الحكيم وافهم معانيها بوضوح</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
            اختر أي سورة من سور القرآن الكريم الـ 114 ثم اختر الآية الكريمة ليتم جلب نصها وتفسيرها مباشرة ومقارنته بين أشهر تفاسير السلف: التفسير الميسر وتفسير الجلالين.
          </p>
        </div>
      </div>

      {/* Main Grid Selector & Tafsir View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dropdowns selector */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">خيارات البحث والتفسير</h3>

          {loadingSurahs ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-5 w-5 text-emerald-700 animate-spin" />
              <span className="text-xs font-bold text-stone-500">جاري تحميل قائمة السور...</span>
            </div>
          ) : errorSurahs ? (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>{errorSurahs}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Surah Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-stone-500 dark:text-stone-400">اختر السورة الكريمة</label>
                <select
                  value={selectedSurah}
                  onChange={handleSurahChange}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-100 outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500"
                  dir="rtl"
                >
                  {surahs.map((s) => (
                    <option key={s.number} value={s.number}>
                      سورة {s.name} ({s.englishName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayah Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-stone-500 dark:text-stone-400">اختر رقم الآية</label>
                <select
                  value={selectedAyah}
                  onChange={handleAyahChange}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-100 outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500"
                  dir="rtl"
                >
                  {ayahOptions.map((num) => (
                    <option key={num} value={num}>
                      الآية رقم {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Helper metadata details */}
              {activeSurahMeta && (
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-100/40 dark:border-emerald-900/10 text-[11px] text-stone-500 dark:text-stone-400 space-y-1 font-semibold">
                  <div>اسم السورة باللاتيني: {activeSurahMeta.englishName}</div>
                  <div>عدد آيات السورة الكريمة: {activeSurahMeta.numberOfAyahs} آية</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tafsir content workspace */}
        <div className="lg:col-span-8 space-y-6">
          {loadingTafsir ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-24 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-emerald-700 dark:text-emerald-400 animate-spin mx-auto" />
              <p className="text-stone-500 dark:text-stone-400 text-xs font-bold animate-pulse">جاري جلب الآية والتفسير المعتمد من الخادم الرئيسي...</p>
            </div>
          ) : errorTafsir ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-12 text-center space-y-4">
              <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
              <p className="text-red-800 text-sm font-bold">{errorTafsir}</p>
              <button
                onClick={() => fetchTafsir(selectedSurah, selectedAyah)}
                className="py-2 px-5 bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all hover:bg-emerald-800 cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Original Ayah Box */}
              {originalAyahText && (
                <div className="bg-[#FCFBF7] dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-100 dark:border-stone-800 text-center space-y-3 shadow-inner">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold uppercase tracking-widest">
                    الآية الكريمة بالرسم العثماني
                  </div>
                  <blockquote className="font-serif text-xl md:text-2xl text-stone-900 dark:text-stone-100 leading-loose font-extrabold select-all">
                    {originalAyahText}
                  </blockquote>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">
                    سورة {activeSurahMeta?.name} • الآية رقم {selectedAyah}
                  </div>
                </div>
              )}

              {/* Tafsirs Comparative block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tafsir Al-Muyassar */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 justify-start border-b border-stone-50 dark:border-stone-800 pb-2">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                    <h3 className="text-sm font-black text-stone-800 dark:text-stone-100">التفسير الميسر</h3>
                  </div>
                  <p className="font-serif text-sm md:text-base text-stone-700 dark:text-stone-200 leading-relaxed text-justify">
                    {tafsirMuyassar || 'جاري تحميل التفسير الميسر...'}
                  </p>
                </div>

                {/* Tafsir Al-Jalalayn */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 justify-start border-b border-stone-50 dark:border-stone-800 pb-2">
                    <BookOpen className="h-4.5 w-4.5 text-amber-600" />
                    <h3 className="text-sm font-black text-stone-800 dark:text-stone-100">تفسير الجلالين</h3>
                  </div>
                  <p className="font-serif text-sm md:text-base text-stone-700 dark:text-stone-200 leading-relaxed text-justify">
                    {tafsirJalalayn || 'جاري تحميل تفسير الجلالين...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
