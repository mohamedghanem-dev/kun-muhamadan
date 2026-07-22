import { Surah } from '../types';

export const getAudioUrl = (surahId: number, ayahNumberInSurah: number): string => {
  const paddedSurah = String(surahId).padStart(3, '0');
  const paddedAyah = String(ayahNumberInSurah).padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${paddedSurah}${paddedAyah}.mp3`;
};

export const QURAN_DATA: Surah[] = [
  {
    id: 1,
    name: "الفاتحة",
    englishName: "Al-Fatihah",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 7,
    ayahs: [
      { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", audioUrl: getAudioUrl(1, 1) },
      { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", audioUrl: getAudioUrl(1, 2) },
      { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", audioUrl: getAudioUrl(1, 3) },
      { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", audioUrl: getAudioUrl(1, 4) },
      { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", audioUrl: getAudioUrl(1, 5) },
      { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", audioUrl: getAudioUrl(1, 6) },
      { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", audioUrl: getAudioUrl(1, 7) }
    ]
  },
  {
    id: 97,
    name: "القدر",
    englishName: "Al-Qadr",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 5,
    ayahs: [
      { number: 1, text: "إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", audioUrl: getAudioUrl(97, 1) },
      { number: 2, text: "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ", audioUrl: getAudioUrl(97, 2) },
      { number: 3, text: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ", audioUrl: getAudioUrl(97, 3) },
      { number: 4, text: "تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ", audioUrl: getAudioUrl(97, 4) },
      { number: 5, text: "سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ", audioUrl: getAudioUrl(97, 5) }
    ]
  },
  {
    id: 103,
    name: "العصر",
    englishName: "Al-Asr",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 3,
    ayahs: [
      { number: 1, text: "وَالْعَصْرِ", audioUrl: getAudioUrl(103, 1) },
      { number: 2, text: "إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ", audioUrl: getAudioUrl(103, 2) },
      { number: 3, text: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", audioUrl: getAudioUrl(103, 3) }
    ]
  },
  {
    id: 108,
    name: "الكوثر",
    englishName: "Al-Kawthar",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 3,
    ayahs: [
      { number: 1, text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", audioUrl: getAudioUrl(108, 1) },
      { number: 2, text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", audioUrl: getAudioUrl(108, 2) },
      { number: 3, text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", audioUrl: getAudioUrl(108, 3) }
    ]
  },
  {
    id: 110,
    name: "النصر",
    englishName: "An-Nasr",
    type: "medinan",
    typeAr: "مدنية",
    totalAyahs: 3,
    ayahs: [
      { number: 1, text: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", audioUrl: getAudioUrl(110, 1) },
      { number: 2, text: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", audioUrl: getAudioUrl(110, 2) },
      { number: 3, text: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا", audioUrl: getAudioUrl(110, 3) }
    ]
  },
  {
    id: 112,
    name: "الإخلاص",
    englishName: "Al-Ikhlas",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 4,
    ayahs: [
      { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", audioUrl: getAudioUrl(112, 1) },
      { number: 2, text: "اللَّهُ الصَّمَدُ", audioUrl: getAudioUrl(112, 2) },
      { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", audioUrl: getAudioUrl(112, 3) },
      { number: 4, text: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", audioUrl: getAudioUrl(112, 4) }
    ]
  },
  {
    id: 113,
    name: "الفلق",
    englishName: "Al-Falaq",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 5,
    ayahs: [
      { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", audioUrl: getAudioUrl(113, 1) },
      { number: 2, text: "مِنْ شَرِّ مَا خَلَقَ", audioUrl: getAudioUrl(113, 2) },
      { number: 3, text: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ", audioUrl: getAudioUrl(113, 3) },
      { number: 4, text: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", audioUrl: getAudioUrl(113, 4) },
      { number: 5, text: "مِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", audioUrl: getAudioUrl(113, 5) }
    ]
  },
  {
    id: 114,
    name: "الناس",
    englishName: "An-Nas",
    type: "meccan",
    typeAr: "مكية",
    totalAyahs: 6,
    ayahs: [
      { number: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", audioUrl: getAudioUrl(114, 1) },
      { number: 2, text: "مَلِكِ النَّاسِ", audioUrl: getAudioUrl(114, 2) },
      { number: 3, text: "إِلَٰهِ النَّاسِ", audioUrl: getAudioUrl(114, 3) },
      { number: 4, text: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", audioUrl: getAudioUrl(114, 4) },
      { number: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", audioUrl: getAudioUrl(114, 5) },
      { number: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", audioUrl: getAudioUrl(114, 6) }
    ]
  }
];
