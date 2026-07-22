import { useState, useEffect } from 'react';
import { HomeDashboard } from './components/HomeDashboard';
import { HadithExplorer } from './components/HadithExplorer';
import { QuranMemorization } from './components/QuranMemorization';
import { QuranKhatma } from './components/QuranKhatma';
import { TasbihSebha } from './components/TasbihSebha';
import { AzkarList } from './components/AzkarList';
import { PrayerTracker } from './components/PrayerTracker';
import { ReligiousAsk } from './components/ReligiousAsk';
import { FullQuranReader } from './components/FullQuranReader';
import { ProphetStories } from './components/ProphetStories';
import { QuranTafsir } from './components/QuranTafsir';
import { 
  Home, 
  Heart, 
  Star, 
  BookOpen, 
  Clock, 
  Compass, 
  Activity, 
  Menu, 
  X,
  Sparkles,
  Book,
  Sun,
  Moon,
  Phone,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShareApp } from './components/ShareApp';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Theme Dark/Light
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('km_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem('km_dark_mode', String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'full-quran', label: 'المصحف الشريف كاملاً', icon: Book },
    { id: 'quran-tafsir', label: 'تفسير القرآن الكريم', icon: BookOpen },
    { id: 'hadiths', label: 'الأحاديث النبوية الشريفة', icon: Heart },
    { id: 'prophet-stories', label: 'قصص الأنبياء والرسل', icon: Star },
    { id: 'memorize', label: 'تحفيظ وتثبيت القرآن', icon: Star },
    { id: 'khatma', label: 'ختمة القرآن الكريم', icon: BookOpen },
    { id: 'tasbih', label: 'المسبحة الإلكترونية', icon: Compass },
    { id: 'azkar', label: 'الأذكار والتحصينات', icon: Clock },
    { id: 'prayer-tracker', label: 'مواقيت الصلاة والقبلة', icon: Activity },
    { id: 'religious-ask', label: 'الركن الشرعي الذكي', icon: Sparkles },
    { id: 'share-app', label: 'مشاركة التطبيق بالبلوتوث والأذونات', icon: Share2 },
  ];

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard onNavigate={handleNavigate} />;
      case 'full-quran':
        return <FullQuranReader />;
      case 'quran-tafsir':
        return <QuranTafsir />;
      case 'hadiths':
        return <HadithExplorer />;
      case 'prophet-stories':
        return <ProphetStories />;
      case 'memorize':
        return <QuranMemorization />;
      case 'khatma':
        return <QuranKhatma />;
      case 'tasbih':
        return <TasbihSebha />;
      case 'azkar':
        return <AzkarList />;
      case 'prayer-tracker':
        return <PrayerTracker />;
      case 'religious-ask':
        return <ReligiousAsk />;
      case 'share-app':
        return <ShareApp />;
      default:
        return <HomeDashboard onNavigate={handleNavigate} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col md:flex-row text-right islamic-pattern select-none transition-colors duration-200" dir="rtl" id="app-wrapper">
      
      {/* Sidebar Navigation - Desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-stone-900 border-l border-stone-100 dark:border-stone-800 shadow-sm shrink-0 sticky top-0 h-screen" id="desktop-sidebar">
        
        {/* Brand / Logo */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-800/10 shrink-0">
              <span className="text-lg font-black font-serif">م</span>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-extrabold text-stone-850 dark:text-stone-100 font-serif leading-tight">كُنْ مُحَمَّداً</h2>
              <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">التطبيق الإسلامي الشامل</p>
            </div>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-amber-400 transition-colors cursor-pointer"
            title="تغيير المظهر"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Menu List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full text-right flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/10'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info & Developer محمود سفين ويوسف مرموش details */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 dark:text-stone-500 font-bold space-y-1 text-center bg-stone-50/50 dark:bg-stone-950/20">
          <div>تطبيق كن محمداً لخدمة السنّة ﷺ</div>
          <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-1">تطوير المطور: محمود سفين</div>
          <div className="text-sky-700 dark:text-sky-400 font-extrabold text-[10px]">المطور المساعد: يوسف مرموش</div>
          <div className="flex items-center justify-center gap-1 font-mono text-[9px] text-stone-500">
            <Phone className="h-2.5 w-2.5 text-emerald-600" />
            <span>01211542025</span>
          </div>
          <div className="text-amber-800 dark:text-amber-500 font-black text-[9px] mt-1">نسألكم الدعاء بظهر الغيب للمطورين</div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 shadow-sm px-5 py-4 flex items-center justify-between sticky top-0 z-40" id="mobile-header">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow">
            م
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100 font-serif leading-tight">كُنْ مُحَمَّداً</h2>
            <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">رفيقك لإحياء السنّة</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Theme switch */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-amber-400 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-all"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Side Menu Slide-over Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />

            {/* Menu Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-100 dark:border-stone-800 z-50 flex flex-col"
              dir="rtl"
            >
              <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow">
                    م
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100 font-serif leading-tight">كُنْ مُحَمَّداً</h2>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-450 dark:text-stone-500 hover:text-stone-800 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Developer Info */}
              <div className="p-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 dark:text-stone-500 font-bold space-y-1 text-center bg-stone-50/50 dark:bg-stone-950/20">
                <div>تطبيق كن محمداً لخدمة السنّة ﷺ</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-1">تطوير المطور: محمود سفين</div>
                <div className="text-sky-700 dark:text-sky-400 font-extrabold text-[10px]">المطور المساعد: يوسف مرموش</div>
                <div className="flex items-center justify-center gap-1 font-mono text-[9px] text-stone-500">
                  <Phone className="h-2.5 w-2.5 text-emerald-600" />
                  <span>01211542025</span>
                </div>
                <div className="text-amber-800 dark:text-amber-500 font-black text-[9px] mt-1">نسألكم الدعاء بظهر الغيب للمطورين</div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-area">
        {/* Top bar on desktop containing motivational message */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 sticky top-0 z-30 shadow-sm" id="desktop-top-header">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-bold bg-amber-50 dark:bg-amber-950/15 border border-amber-100/50 dark:border-amber-900/10 py-1.5 px-3.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>&quot;اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ&quot;</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-black text-stone-850 dark:text-stone-100">
              {menuItems.find(i => i.id === activeTab)?.label}
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-amber-400 transition-all cursor-pointer border border-stone-150/50 dark:border-stone-800"
              title="تبديل مظهر التطبيق (فاتح / ليلي)"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </header>

        {/* Dynamic component render view */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderActiveComponent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Mobile Bottom Nav bar for lightning fast tab switching */}
        <nav className="md:hidden bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 py-2.5 px-2 flex items-center justify-around sticky bottom-0 z-30 shadow-2xl shrink-0" id="mobile-bottom-nav">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-1 cursor-pointer py-1 px-2.5 rounded-xl transition-all ${
                  isSelected ? 'text-emerald-800 dark:text-emerald-400' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isSelected ? 'stroke-[2.5px]' : ''}`} />
                <span className={`text-[9px] ${isSelected ? 'font-black' : 'font-semibold'}`}>
                  {item.label.split(' ')[0]} {/* short labels */}
                </span>
              </button>
            );
          })}
          
          {/* More button to toggle full menu drawer */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 cursor-pointer py-1 px-2.5 text-stone-400 hover:text-stone-600"
          >
            <Menu className="h-4.5 w-4.5" />
            <span className="text-[9px] font-semibold">المزيد</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;
