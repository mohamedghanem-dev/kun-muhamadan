import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, Heart, BookOpen, Clock, Star, ArrowLeftRight, Calendar, Book, User, Phone, Sun, Moon, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeDashboardProps {
  onNavigate: (tab: string) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, darkMode, toggleDarkMode }) => {
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');

  const [userName, setUserName] = useState<string>('');
  const [tempName, setTempName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');

  useEffect(() => {
    // Load Name
    const savedName = localStorage.getItem('km_user_name');
    if (savedName) {
      setUserName(savedName);
      setTempName(savedName);
    }

    // Current Gregorian Date
    const gregorian = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDateString(gregorian.toLocaleDateString('ar-EG', options));

    // Approximate Hijri Calculation for display
    setHijriDate('5 صفر 1448 هـ');

    // Calculate current prayer period
    const updatePrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Fajr: 04:35 (275) to Shorouk: 06:05 (365)
      // Shorouk: 06:05 to Dhuhr: 12:40 (760)
      // Dhuhr: 12:40 to Asr: 16:15 (975)
      // Asr: 16:15 to Maghrib: 19:15 (1155)
      // Maghrib: 19:15 to Isha: 20:45 (1245)
      if (currentMinutes >= 275 && currentMinutes < 365) {
        setCurrentPrayer("الفجر");
      } else if (currentMinutes >= 365 && currentMinutes < 760) {
        setCurrentPrayer("الضحى (سنة مباركة)");
      } else if (currentMinutes >= 760 && currentMinutes < 975) {
        setCurrentPrayer("الظهر");
      } else if (currentMinutes >= 975 && currentMinutes < 1155) {
        setCurrentPrayer("العصر");
      } else if (currentMinutes >= 1155 && currentMinutes < 1245) {
        setCurrentPrayer("المغرب");
      } else {
        setCurrentPrayer("العشاء");
      }
    };
    
    updatePrayer();
    const timer = setInterval(updatePrayer, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    setUserName(trimmed);
    localStorage.setItem('km_user_name', trimmed);
    setIsEditingName(false);
  };

  const sunnanTips = [
    "التبسم في وجه أخيك المسلم صدقة وخلق رفيع.",
    "قراءة سورة الكهف يوم الجمعة تضيء لك ما بين الجمعتين.",
    "المداومة على صلوات السنن الرواتب تبني لك بيتاً في الجنة.",
    "الابتداء باليمين في المأكل والملبس والتنعل من هديه ﷺ.",
    "نوم المسلم على طهارة وجانب أيمن مع قراءة أذكار النوم.",
    "كثرة الاستغفار والصلاة على النبي ﷺ تطهر القلوب وتفرج الهموم."
  ];

  const propheticMorals = [
    { title: "الرحمة بالغير", text: "ما أرسلناك إلا رحمة للعالمين؛ كان ﷺ أرحم الناس بالصغير والكبير والطير والبهيمة." },
    { title: "الصدق والأمانة", text: "عُرف بالصادق الأمين قبل بعثته؛ وكان ملجأ الأمانات للأصدقاء والخصوم على حد سواء." },
    { title: "التواضع الرفيع", text: "كان ﷺ يخصف نعله، ويرقع ثوبه، ويخدم أهله في مهنتهم، ولا يترفّع على أحد." }
  ];

  // Daily Sunnah Tip Index deterministically based on date
  const dayIndex = new Date().getDate() % sunnanTips.length;
  const todaySunnah = sunnanTips[dayIndex];

  return (
    <div className="space-y-6 text-right animate-fade-in" id="home-dashboard-root">
      
      {/* Name Customization Row */}
      {(!userName || isEditingName) ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 text-right"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center gap-2 justify-start">
              <User className="h-4.5 w-4.5 text-amber-700" />
              <span>أهلاً بك في تطبيق كُنْ مُحَمَّداً! 🌿</span>
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-bold">
              أدخل اسمك الكريم ليرحب بك التطبيق عند فتحه في كل مرة ويذكرك بالصلوات المكتوبة:
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="اكتب اسمك هنا..."
              className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-amber-500 flex-1 md:w-48 text-right font-serif"
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors shrink-0 shadow-sm"
            >
              حفظ الاسم
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsEditingName(true)}
            className="text-[10px] text-stone-400 dark:text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold underline cursor-pointer"
          >
            تغيير اسم الترحيب ({userName})
          </button>
        </div>
      )}

      {/* Devotional Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 p-8 text-white shadow-lg text-right"
      >
        <div className="absolute top-0 left-0 -ml-10 -mt-10 h-44 w-44 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 right-1/3 -mb-10 h-36 w-36 rounded-full bg-emerald-700/20 blur-xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-start">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  {userName ? `مرحباً بك يا ${userName} 🌸` : "الداعي إلى سنته ﷺ"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif leading-tight">تطبيق كُنْ مُحَمَّداً</h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all text-xs font-bold text-white cursor-pointer shadow-sm"
                  title="تغيير المظهر (فاتح / داكن)"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-300" />
                      <span>تفعيل الوضع الفاتح ☀️</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-amber-100" />
                      <span>تفعيل الوضع الليلي 🌙</span>
                    </>
                  )}
                </button>
              )}

              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-bold">
                <Calendar className="h-4.5 w-4.5 text-amber-300" />
                <div className="text-right">
                  <div className="text-white">{currentDateString}</div>
                  <div className="text-emerald-200 text-[10px]">{hijriDate}</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm md:text-base text-emerald-100 leading-relaxed max-w-3xl font-medium">
            &quot;وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ&quot; • صُمِّم هذا التطبيق ليكون رفيقك اليومي لإحياء سنّة النبي ﷺ في أقوالك وأفعالك، وتلاوة القرآن الكريم وحفظه، وعمارة أوقاتك بالاستغفار والتسبيح، لتكون محمدي الأخلاق والمنهج.
          </p>
        </div>
      </motion.div>

      {/* Live Prayer Reminder Card */}
      {currentPrayer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-right shadow-sm"
        >
          <div className="flex items-center gap-3 justify-start">
            <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300">تذكير بصلاة الوقت الحالية 🕋</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-bold mt-0.5">
                لا تنسَ صلاة <span className="text-emerald-700 dark:text-emerald-400 font-black">{currentPrayer}</span> التي حان وقتها الآن يا {userName || 'أخي الكريم'}! أقم صلاتك يرحمك الله.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('prayer-tracker')}
            className="px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            عرض مواقيت الأذان والقبلة
          </button>
        </motion.div>
      )}

      {/* Grid: Shortcut cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-500 pr-1 flex items-center gap-1.5 justify-start">
          <Star className="h-4 w-4 text-emerald-600" />
          <span>أركان التطبيق الإسلامية الشاملة</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" id="home-shortcuts-grid">
          {[
            { id: 'full-quran', title: 'المصحف كاملاً', desc: 'تلاوة واستماع لكافة السور', icon: Book, color: 'border-emerald-100 bg-emerald-50/20 dark:border-emerald-950/20 dark:hover:border-emerald-900 text-emerald-800 dark:text-emerald-300' },
            { id: 'quran-tafsir', title: 'تفسير القرآن الكريم', desc: 'تفسير السور وتدبّر معانيها', icon: BookOpen, color: 'border-amber-100 bg-amber-50/20 dark:border-amber-950/20 dark:hover:border-amber-900 text-amber-800 dark:text-amber-300' },
            { id: 'hadiths', title: 'الأحاديث النبوية', desc: 'تصفح وقراءة وسماع السنن الشريفة', icon: Heart, color: 'border-rose-100 bg-rose-50/20 dark:border-rose-950/20 dark:hover:border-rose-900 text-rose-800 dark:text-rose-300' },
            { id: 'prophet-stories', title: 'قصص الأنبياء والرسل', desc: 'سير ومواقف صفوة الخلق الكرام', icon: Star, color: 'border-blue-100 bg-blue-50/20 dark:border-blue-950/20 dark:hover:border-blue-900 text-blue-800 dark:text-blue-300' },
            { id: 'memorize', title: 'ركن التحفيظ والمراجعة', desc: 'حفظ وتثبيت سور من القرآن', icon: Star, color: 'border-amber-100 bg-amber-50/20 dark:border-amber-950/20 dark:hover:border-amber-900 text-amber-800 dark:text-amber-300' },
            { id: 'khatma', title: 'ختم القرآن وتشاركه', desc: 'متابعة وتشارك ختمة مباركة', icon: BookOpen, color: 'border-blue-100 bg-blue-50/20 dark:border-blue-950/20 dark:hover:border-blue-900 text-blue-800 dark:text-blue-300' },
            { id: 'tasbih', title: 'ركن التسبيح', desc: 'مسبحة إلكترونية تفاعلية بالأذكار', icon: Compass, color: 'border-emerald-100 bg-emerald-50/20 dark:border-emerald-950/20 dark:hover:border-emerald-900 text-emerald-800 dark:text-emerald-300' },
            { id: 'religious-ask', title: 'اسأل الذكاء الاصطناعي', desc: 'اسأله عن شتى المسائل الشرعية', icon: Sparkles, color: 'border-amber-100 bg-amber-50/20 dark:border-amber-950/20 dark:hover:border-amber-900 text-amber-800 dark:text-amber-300' }
          ].map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => onNavigate(sc.id)}
                className={`p-4 rounded-2xl border ${sc.color} text-right transition-all hover:scale-[1.02] hover:shadow-sm cursor-pointer flex flex-col justify-between h-32`}
              >
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center border border-stone-100 dark:border-stone-700 shadow-sm shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 mt-2">
                  <div className="font-bold text-sm leading-tight text-stone-850 dark:text-stone-100">{sc.title}</div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 line-clamp-1">{sc.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Sunnah tip & Developer Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sunnah Tip */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-5 shadow-sm space-y-4 text-right">
            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider pr-1 flex items-center gap-1.5 justify-start">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>سنّة اليوم المهجورة</span>
            </h3>

            <div className="bg-amber-50/40 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100/50 dark:border-amber-900/10 text-right space-y-2.5">
              <p className="font-serif text-base text-stone-850 dark:text-stone-200 leading-relaxed font-semibold">
                &quot;{todaySunnah}&quot;
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">
                حاول تطبيق هذه السنة المباركة اليوم ليكون يومك مليئاً بالبركة ومتابعة لخطى نبيك الحبيب ﷺ.
              </p>
            </div>

            <button
              onClick={() => onNavigate('hadiths')}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>تصفح المزيد من الأحاديث والسّنن</span>
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Developer Card (محمود سفين & يوسف مرموش) */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-5 shadow-sm space-y-4 text-right">
            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider pr-1 flex items-center gap-1.5 justify-start">
              <User className="h-4.5 w-4.5 text-amber-600" />
              <span>ركن مطوري التطبيق</span>
            </h3>

            <div className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">مهندس التطوير</span>
                <span className="font-serif text-sm font-extrabold text-stone-850 dark:text-stone-100">محمود سفين</span>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/60 pt-2">
                <span className="text-[11px] font-black text-sky-700 dark:text-sky-400">المطور المساعد</span>
                <span className="font-serif text-sm font-extrabold text-stone-850 dark:text-stone-100">يوسف مرموش</span>
              </div>
              
              <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/60 pt-2.5">
                <span className="text-[11px] font-bold text-stone-450 dark:text-stone-500">تواصل سريع مع المطور</span>
                <div className="flex items-center gap-1.5">
                  <a 
                    href="tel:01211542025" 
                    className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300 hover:underline flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg"
                    title="اتصال تلفوني"
                  >
                    <Phone className="h-3 w-3 text-emerald-600" />
                    <span>01211542025</span>
                  </a>

                  <a 
                    href="https://wa.me/201211542025" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    title="مراسلة واتساب"
                  >
                    <MessageCircle className="h-3 w-3 fill-current text-white" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-bold border-t border-stone-100 dark:border-stone-800/60 pt-2.5">
                🌸 <span className="text-amber-800 dark:text-amber-400 font-extrabold">دعوة مباركة بظهر الغيب:</span> لا تنسوا الدعاء لمطوري التطبيق (محمود سفين ويوسف مرموش) بالخير والبركة والقبول في الدنيا والآخرة.
              </div>
            </div>
          </div>


        </div>

        {/* Right Column: Prophetic character & inspiration */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-5 shadow-sm space-y-4 text-right">
            <div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5 justify-start">
                <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500/10" />
                <span>كيف نكون محمديي الأخلاق؟</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">ثلاثة مواقف من سيرة المعلم الأول والأب الرحيم ﷺ نقتدي بها اليوم.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="morals-grid">
              {propheticMorals.map((m, i) => (
                <div key={i} className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800/60 text-right space-y-2 hover:border-emerald-100 transition-colors">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md">
                    {m.title}
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
