export interface Hadith {
  id: number;
  text: string;
  explanation: string;
  narrator: string;
  source: string;
  category: 'morals' | 'faith' | 'worship' | 'nawawi';
  categoryAr: string;
}

export interface Ayah {
  number: number;
  text: string;
  audioUrl: string;
}

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  type: 'meccan' | 'medinan';
  typeAr: string;
  ayahs: Ayah[];
  totalAyahs: number;
}

export interface MemorizationProgress {
  surahId: number;
  memorizedAyahs: number[]; // array of ayah numbers
  notes?: string;
  lastPracticed?: string; // ISO date
}

export interface Khatma {
  id: string;
  name: string;
  startDate: string;
  durationDays: number;
  targetPagesPerDay: number;
  readPages: number[]; // array of page numbers 1-604
  createdAt: string;
  status: 'active' | 'completed';
}

export interface TasbihItem {
  id: string;
  text: string;
  count: number;
  target?: number;
  isCustom?: boolean;
}

export interface Zikr {
  id: string;
  text: string;
  count: number;
  repeat: number; // target repeats
  benefit: string;
  category: 'morning' | 'evening' | 'sleep' | 'prayers';
}

export interface DailyTracker {
  date: string;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    sunnah: boolean;
  };
  quranPagesRead: number;
  tasbihCount: number;
}
