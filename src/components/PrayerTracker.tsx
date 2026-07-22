import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Check, 
  Sparkles, 
  Award, 
  RotateCcw, 
  MapPin, 
  Compass, 
  CheckCircle,
  Bell,
  Volume2,
  AlertTriangle,
  Sliders,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string; // 24h format
  adjust: number; // minutes adjustment
}

export const PrayerTracker: React.FC = () => {
  // Static robust local prayer times with adjustable offset
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([
    { name: 'Fajr', nameAr: 'الفجر', time: '04:35', adjust: 0 },
    { name: 'Shorouk', nameAr: 'الشروق', time: '06:05', adjust: 0 },
    { name: 'Dhuhr', nameAr: 'الظهر', time: '12:40', adjust: 0 },
    { name: 'Asr', nameAr: 'العصر', time: '16:15', adjust: 0 },
    { name: 'Maghrib', nameAr: 'المغرب', time: '19:15', adjust: 0 },
    { name: 'Isha', nameAr: 'العشاء', time: '20:45', adjust: 0 }
  ]);

  const [prayedToday, setPrayedToday] = useState<{ [key: string]: boolean }>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
    Sunnah: false,
    Witr: false
  });

  const [nextPrayer, setNextPrayer] = useState<{ nameAr: string; countdown: string } | null>(null);
  const [compassAngle, setCompassAngle] = useState<number>(0);
  const [city, setCity] = useState<string>('القاهرة، مصر');
  const [streak, setStreak] = useState<number>(3); 

  // --- Notification & Alarm Settings States ---
  const [enableAlarmSounds, setEnableAlarmSounds] = useState<boolean>(true);
  const [enableBrowserNotifications, setEnableBrowserNotifications] = useState<boolean>(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState<boolean>(false);
  
  // Track triggered alarms to prevent multiple triggers in the same minute
  const triggeredAlarmsRef = useRef<{ [key: string]: string }>({}); // e.g., { 'Dhuhr': '2026-07-20' }

  // In-app alert banner
  const [activeAlert, setActiveAlert] = useState<{ title: string; body: string } | null>(null);

  // Load state on mount
  useEffect(() => {
    const savedTracker = localStorage.getItem('km_prayer_tracker');
    const savedStreak = localStorage.getItem('km_prayer_streak');
    const savedCity = localStorage.getItem('km_prayer_city');
    const savedAlarms = localStorage.getItem('km_prayer_alarms_sound');
    const savedNotifications = localStorage.getItem('km_prayer_alarms_notify');
    const savedAdjustments = localStorage.getItem('km_prayer_times_adjust');
    
    if (savedTracker) {
      try {
        setPrayedToday(JSON.parse(savedTracker));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedStreak) setStreak(Number(savedStreak));
    if (savedCity) setCity(savedCity);
    if (savedAlarms) setEnableAlarmSounds(savedAlarms === 'true');
    if (savedNotifications) setEnableBrowserNotifications(savedNotifications === 'true');
    
    if (savedAdjustments) {
      try {
        setPrayerTimes(JSON.parse(savedAdjustments));
      } catch (e) {
        console.error(e);
      }
    }

    // Check current browser permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted' && savedNotifications === 'true') {
        setEnableBrowserNotifications(true);
      }
    }
  }, []);

  // Save state helpers
  const saveTracker = (updated: typeof prayedToday) => {
    setPrayedToday(updated);
    localStorage.setItem('km_prayer_tracker', JSON.stringify(updated));
    
    const obligatories = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const allDone = obligatories.every(p => updated[p]);
    if (allDone) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('km_prayer_streak', String(newStreak));
    }
  };

  const togglePrayer = (name: string) => {
    const updated = {
      ...prayedToday,
      [name]: !prayedToday[name]
    };
    saveTracker(updated);
  };

  const handleResetDaily = () => {
    if (!confirm('هل تريد إعادة تصفير صلوات اليوم؟')) return;
    const cleared = {
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
      Sunnah: false,
      Witr: false
    };
    setPrayedToday(cleared);
    localStorage.setItem('km_prayer_tracker', JSON.stringify(cleared));
  };

const CITY_PRAYER_TIMES: { [key: string]: { fajr: string; shorouk: string; dhuhr: string; asr: string; maghrib: string; isha: string } } = {
  'القاهرة': { fajr: '04:35', shorouk: '06:05', dhuhr: '12:40', asr: '16:15', maghrib: '19:15', isha: '20:45' },
  'الجيزة': { fajr: '04:36', shorouk: '06:06', dhuhr: '12:41', asr: '16:16', maghrib: '19:16', isha: '20:46' },
  'الإسكندرية': { fajr: '04:39', shorouk: '06:09', dhuhr: '12:45', asr: '16:20', maghrib: '19:20', isha: '20:50' },
  'القليوبية': { fajr: '04:35', shorouk: '06:05', dhuhr: '12:41', asr: '16:16', maghrib: '19:16', isha: '20:46' },
  'الدقهلية': { fajr: '04:33', shorouk: '06:03', dhuhr: '12:39', asr: '16:14', maghrib: '19:14', isha: '20:44' },
  'الغربية': { fajr: '04:36', shorouk: '06:06', dhuhr: '12:42', asr: '16:17', maghrib: '19:17', isha: '20:47' },
  'المنوفية': { fajr: '04:36', shorouk: '06:06', dhuhr: '12:42', asr: '16:17', maghrib: '19:17', isha: '20:47' },
  'الشرقية': { fajr: '04:33', shorouk: '06:03', dhuhr: '12:39', asr: '16:14', maghrib: '19:14', isha: '20:44' },
  'البحيرة': { fajr: '04:38', shorouk: '06:08', dhuhr: '12:43', asr: '16:18', maghrib: '19:18', isha: '20:48' },
  'كفر الشيخ': { fajr: '04:36', shorouk: '06:06', dhuhr: '12:42', asr: '16:17', maghrib: '19:17', isha: '20:47' },
  'دمياط': { fajr: '04:32', shorouk: '06:02', dhuhr: '12:38', asr: '16:13', maghrib: '19:13', isha: '20:43' },
  'بورسعيد': { fajr: '04:30', shorouk: '06:00', dhuhr: '12:36', asr: '16:11', maghrib: '19:11', isha: '20:41' },
  'الإسماعيلية': { fajr: '04:31', shorouk: '06:01', dhuhr: '12:37', asr: '16:12', maghrib: '19:12', isha: '20:42' },
  'السويس': { fajr: '04:32', shorouk: '06:02', dhuhr: '12:38', asr: '16:13', maghrib: '19:13', isha: '20:43' },
  'شمال سيناء': { fajr: '04:25', shorouk: '05:55', dhuhr: '12:30', asr: '16:05', maghrib: '19:05', isha: '20:35' },
  'جنوب سيناء': { fajr: '04:27', shorouk: '05:57', dhuhr: '12:32', asr: '16:07', maghrib: '19:07', isha: '20:37' },
  'بني سويف': { fajr: '04:37', shorouk: '06:07', dhuhr: '12:42', asr: '16:17', maghrib: '19:17', isha: '20:47' },
  'الفيوم': { fajr: '04:38', shorouk: '06:08', dhuhr: '12:43', asr: '16:18', maghrib: '19:18', isha: '20:48' },
  'المنيا': { fajr: '04:39', shorouk: '06:09', dhuhr: '12:44', asr: '16:19', maghrib: '19:19', isha: '20:49' },
  'أسيوط': { fajr: '04:39', shorouk: '06:09', dhuhr: '12:44', asr: '16:19', maghrib: '19:19', isha: '20:49' },
  'سوهاج': { fajr: '04:37', shorouk: '06:07', dhuhr: '12:42', asr: '16:17', maghrib: '19:17', isha: '20:47' },
  'قنا': { fajr: '04:33', shorouk: '06:03', dhuhr: '12:38', asr: '16:13', maghrib: '19:13', isha: '20:43' },
  'الأقصر': { fajr: '04:32', shorouk: '06:02', dhuhr: '12:37', asr: '16:12', maghrib: '19:12', isha: '20:42' },
  'أسوان': { fajr: '04:30', shorouk: '06:00', dhuhr: '12:35', asr: '16:10', maghrib: '19:10', isha: '20:40' },
  'البحر الأحمر': { fajr: '04:27', shorouk: '05:57', dhuhr: '12:32', asr: '16:07', maghrib: '19:07', isha: '20:37' },
  'الوادي الجديد': { fajr: '04:47', shorouk: '06:17', dhuhr: '12:52', asr: '16:27', maghrib: '19:27', isha: '20:57' },
  'مطروح': { fajr: '04:50', shorouk: '06:20', dhuhr: '12:55', asr: '16:30', maghrib: '19:30', isha: '21:00' },
  'مكة المكرمة': { fajr: '04:15', shorouk: '05:45', dhuhr: '12:25', asr: '15:45', maghrib: '19:05', isha: '20:35' },
  'الرياض': { fajr: '03:55', shorouk: '05:25', dhuhr: '12:05', asr: '15:25', maghrib: '18:45', isha: '20:15' },
  'القدس الشريف': { fajr: '04:05', shorouk: '05:45', dhuhr: '12:30', asr: '16:05', maghrib: '19:10', isha: '20:40' },
  'دبي': { fajr: '04:00', shorouk: '05:30', dhuhr: '12:20', asr: '15:40', maghrib: '18:55', isha: '20:25' },
  'الدار البيضاء': { fajr: '04:40', shorouk: '06:20', dhuhr: '13:30', asr: '17:10', maghrib: '20:35', isha: '22:05' }
};

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem('km_prayer_city', newCity);
    
    const baseCity = newCity.split('،')[0].trim();
    const times = CITY_PRAYER_TIMES[baseCity];
    if (times) {
      const updated = prayerTimes.map(pt => {
        let newTime = pt.time;
        if (pt.name === 'Fajr') newTime = times.fajr;
        else if (pt.name === 'Shorouk') newTime = times.shorouk;
        else if (pt.name === 'Dhuhr') newTime = times.dhuhr;
        else if (pt.name === 'Asr') newTime = times.asr;
        else if (pt.name === 'Maghrib') newTime = times.maghrib;
        else if (pt.name === 'Isha') newTime = times.isha;
        return { ...pt, time: newTime };
      });
      setPrayerTimes(updated);
      localStorage.setItem('km_prayer_times_adjust', JSON.stringify(updated));
    }
  };

  const saveAdjustments = (updatedTimes: PrayerTime[]) => {
    setPrayerTimes(updatedTimes);
    localStorage.setItem('km_prayer_times_adjust', JSON.stringify(updatedTimes));
  };

  // Adjust prayer offset
  const handleAdjustTime = (index: number, minutes: number) => {
    const updated = [...prayerTimes];
    updated[index].adjust = minutes;
    saveAdjustments(updated);
  };

  // Get Adjusted Time (string) for checking/rendering
  const getAdjustedTime = (pt: PrayerTime): string => {
    if (pt.adjust === 0) return pt.time;
    
    const [hStr, mStr] = pt.time.split(':');
    let totalMinutes = Number(hStr) * 60 + Number(mStr) + pt.adjust;
    
    // Keep in 24h bounds
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
    
    const finalH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const finalM = String(totalMinutes % 60).padStart(2, '0');
    return `${finalH}:${finalM}`;
  };

  // --- SOUND SYNTHESIS USING WEB AUDIO API (Gentle, beautiful offline notification chime) ---
  const playAlarmSound = (frequency: number = 659.25, duration: number = 1.2) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      // First Tone (Tranquil bell sound)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);

      // Sweet harmony tone 300ms later
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(frequency * 1.25, ctx.currentTime); // Major third interval
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration * 0.8));
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + (duration * 0.8));
      }, 250);

    } catch (err) {
      console.log('Error synthesizing alarm chime', err);
    }
  };

  // --- NATIVE BROWSER PUSH NOTIFICATIONS ---
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('متصفحك الحالي لا يدعم الإشعارات الفورية للمتصفح.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setEnableBrowserNotifications(true);
        localStorage.setItem('km_prayer_alarms_notify', 'true');
        // Test notification
        new Notification("تم تفعيل إشعارات الصلاة 🕋", {
          body: "ستتلقى إشعاراً فورياً عند حلول موعد الأذان والصلوات الخمس بتوقيتك المحلي.",
          icon: "/favicon.ico"
        });
      } else {
        setEnableBrowserNotifications(false);
        localStorage.setItem('km_prayer_alarms_notify', 'false');
        alert('تم رفض إذن الإشعارات. يرجى تفعيله يدوياً من إعدادات المتصفح.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBrowserNotifications = () => {
    if (!enableBrowserNotifications) {
      requestNotificationPermission();
    } else {
      setEnableBrowserNotifications(false);
      localStorage.setItem('km_prayer_alarms_notify', 'false');
    }
  };

  const handleToggleAlarmSounds = () => {
    const nextVal = !enableAlarmSounds;
    setEnableAlarmSounds(nextVal);
    localStorage.setItem('km_prayer_alarms_sound', String(nextVal));
    if (nextVal) {
      playAlarmSound(523.25, 0.8); // play C5 tone for confirmation
    }
  };

  // --- LIVE ENGINE FOR TIME CHECKS AND COUNTDOWNS ---
  useEffect(() => {
    const calculateAndCheckAlarms = () => {
      const now = new Date();
      const hStr = String(now.getHours()).padStart(2, '0');
      const mStr = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hStr}:${mStr}`;
      const dateString = now.toISOString().split('T')[0];

      // 1. Core Countdown Logic
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      let targetPrayer = prayerTimes[2]; // Dhuhr default
      let minDiff = 24 * 60;

      const items = prayerTimes.filter(p => p.name !== 'Shorouk');
      for (const p of items) {
        const adjustedTime = getAdjustedTime(p);
        const [ph, pm] = adjustedTime.split(':').map(Number);
        const prayerMinutes = ph * 60 + pm;
        let diff = prayerMinutes - currentMinutes;

        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          targetPrayer = p;
        }
      }

      if (minDiff === 24 * 60) {
        const fajr = prayerTimes[0];
        const adjustedTime = getAdjustedTime(fajr);
        const [ph, pm] = adjustedTime.split(':').map(Number);
        const fajrMinutes = ph * 60 + pm;
        minDiff = (24 * 60 - currentMinutes) + fajrMinutes;
        targetPrayer = fajr;
      }

      const hDiff = Math.floor(minDiff / 60);
      const mDiff = minDiff % 60;
      let countdownStr = '';
      if (hDiff > 0) countdownStr += `${hDiff} ساعة و `;
      countdownStr += `${mDiff} دقيقة`;

      setNextPrayer({
        nameAr: targetPrayer.nameAr,
        countdown: countdownStr
      });

      // 2. Alarm Triggering logic (Run every minute)
      prayerTimes.forEach((pt) => {
        const adjustedTime = getAdjustedTime(pt);
        if (adjustedTime === timeStr) {
          // Ensure it triggers only once per day per prayer
          if (!triggeredAlarmsRef.current[pt.name] || triggeredAlarmsRef.current[pt.name] !== dateString) {
            triggeredAlarmsRef.current[pt.name] = dateString;

            // Display in-app sweet notification card
            setActiveAlert({
              title: `حان الآن موعد صلاة ${pt.nameAr} 🕋`,
              body: `بنداء الأذان المبارك، حان وقت تلبية طاعة الله والوقوف بين يديه. نسألكم الدعاء.`
            });

            // Play alarm sound if enabled
            if (enableAlarmSounds) {
              playAlarmSound(659.25, 2.5); // high quality bell chime
            }

            // Trigger system push notification if enabled
            if (enableBrowserNotifications && Notification.permission === 'granted') {
              new Notification(`حان الآن موعد صلاة ${pt.nameAr} 🕋`, {
                body: `أقم صلاتك يرحمك الله. حان الآن وقت فريضة ${pt.nameAr} بتوقيتك المحلي.`,
                icon: "/favicon.ico",
                requireInteraction: true
              });
            }
          }
        }
      });
    };

    calculateAndCheckAlarms();
    // Check every 10 seconds for lightning fast accuracy
    const interval = setInterval(calculateAndCheckAlarms, 10000);
    return () => clearInterval(interval);
  }, [prayerTimes, enableAlarmSounds, enableBrowserNotifications]);

  // Simulating Compass rotation
  const rotateCompass = () => {
    const nextAngle = (compassAngle + 45) % 360;
    setCompassAngle(nextAngle);
  };

  const obligatories = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const checkedObligCount = obligatories.filter(p => prayedToday[p]).length;

  return (
    <div className="space-y-6 text-right" id="prayer-tracker-root">
      
      {/* Active alarm alert banner */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-6 right-6 md:left-auto md:max-w-md bg-emerald-800 text-white p-5 rounded-3xl shadow-2xl border border-emerald-700/50 z-50 space-y-3"
            dir="rtl"
          >
            <div className="flex items-start gap-3 justify-start">
              <div className="h-9 w-9 bg-white/10 rounded-full flex items-center justify-center text-amber-300 animate-bounce">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1 flex-1 text-right">
                <h4 className="font-extrabold text-sm text-amber-300">{activeAlert.title}</h4>
                <p className="text-[11px] text-emerald-100 leading-relaxed font-semibold">{activeAlert.body}</p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveAlert(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black cursor-pointer transition-all"
              >
                تأكيد وتقبل الله
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2 justify-start">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Clock className="h-5 w-5 text-emerald-700 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">أوقات الصلاة والورد اليومي والتنبيهات</h2>
              <p className="text-xs text-stone-400 font-bold mt-0.5">أوقات الصلوات مع أذان التنبيه الصوتي وإشعارات الأنظمة الفورية</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed font-semibold">
            متابعة الصلاة في وقتها ركن أساسي في حياة المسلم. حافظ على صلواتك الخمس، عدّل الدقائق لتوافق بلدتك، وفعل التنبيه الصوتي الحصري وإشعارات المتصفح حتى لا تفوتك صلاة أبداً.
          </p>
        </div>

        <div className="flex items-center gap-3.5 bg-emerald-50 p-4 rounded-xl border border-emerald-100 self-start md:self-auto shrink-0 font-medium">
          <div className="text-right">
            <div className="text-xs text-stone-500">حفظ الصلوات المتتالية</div>
            <div className="text-lg font-bold text-emerald-800">
              {streak} أيام متواصلة 🔥
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Prayer times card & Adjustable Alarm Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prayer times schedule */}
          <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="text-right">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>جدول مواقيت الصلاة اليوم</span>
                </h3>
                <span className="text-[10px] text-stone-400 font-bold mt-0.5">تقويم محلي دقيق قابل للتعديل والمزامنة</span>
              </div>

              {/* City selector & Adjustment panel trigger */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAdjustPanel(!showAdjustPanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border cursor-pointer transition-all ${
                    showAdjustPanel 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>تعديل الأوقات (دقيقة)</span>
                </button>

                <div className="flex items-center gap-1 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-xl">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-stone-700 text-right outline-none cursor-pointer max-w-[150px] overflow-hidden truncate"
                    dir="rtl"
                  >
                    <option value="القاهرة، مصر">محافظة القاهرة</option>
                    <option value="الجيزة، مصر">محافظة الجيزة</option>
                    <option value="الإسكندرية، مصر">محافظة الإسكندرية</option>
                    <option value="القليوبية، مصر">محافظة القليوبية</option>
                    <option value="الدقهلية، مصر">محافظة الدقهلية</option>
                    <option value="الغربية، مصر">محافظة الغربية</option>
                    <option value="المنوفية، مصر">محافظة المنوفية</option>
                    <option value="الشرقية، مصر">محافظة الشرقية</option>
                    <option value="البحيرة، مصر">محافظة البحيرة</option>
                    <option value="كفر الشيخ، مصر">محافظة كفر الشيخ</option>
                    <option value="دمياط، مصر">محافظة دمياط</option>
                    <option value="بورسعيد، مصر">محافظة بورسعيد</option>
                    <option value="الإسماعيلية، مصر">محافظة الإسماعيلية</option>
                    <option value="السويس، مصر">محافظة السويس</option>
                    <option value="شمال سيناء، مصر">محافظة شمال سيناء</option>
                    <option value="جنوب سيناء، مصر">محافظة جنوب سيناء</option>
                    <option value="بني سويف، مصر">محافظة بني سويف</option>
                    <option value="الفيوم، مصر">محافظة الفيوم</option>
                    <option value="المنيا، مصر">محافظة المنيا</option>
                    <option value="أسيوط، مصر">محافظة أسيوط</option>
                    <option value="سوهاج، مصر">محافظة سوهاج</option>
                    <option value="قنا، مصر">محافظة قنا</option>
                    <option value="الأقصر، مصر">محافظة الأقصر</option>
                    <option value="أسوان، مصر">محافظة أسوان</option>
                    <option value="البحر الأحمر، مصر">محافظة البحر الأحمر</option>
                    <option value="الوادي الجديد، مصر">محافظة الوادي الجديد</option>
                    <option value="مطروح، مصر">محافظة مطروح</option>
                    <option value="مكة المكرمة، السعودية">مكة المكرمة</option>
                    <option value="الرياض، السعودية">الرياض، السعودية</option>
                    <option value="القدس، فلسطين">القدس الشريف</option>
                    <option value="دبي، الإمارات">دبي، الإمارات</option>
                    <option value="الدار البيضاء، المغرب">الدار البيضاء</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Micro adjustment panel */}
            <AnimatePresence>
              {showAdjustPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#FCFBF7] p-4 rounded-2xl border border-stone-100 overflow-hidden text-right space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>تعديل فروق مواقيت الصلاة (لتوافق مدينتك تماماً):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {prayerTimes.map((pt, index) => (
                      <div key={pt.name} className="bg-white p-2.5 rounded-xl border border-stone-200/50 space-y-2">
                        <div className="text-[11px] font-black text-stone-700 flex justify-between">
                          <span>{pt.nameAr}</span>
                          <span className="text-stone-400 font-mono font-bold">({pt.time})</span>
                        </div>
                        <div className="flex items-center justify-between border border-stone-100 rounded-lg bg-stone-50 p-0.5">
                          <button
                            onClick={() => handleAdjustTime(index, pt.adjust - 1)}
                            className="w-7 py-1 text-xs font-black text-stone-500 hover:text-stone-800 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-black font-mono text-stone-600">
                            {pt.adjust > 0 ? `+${pt.adjust}` : pt.adjust} د
                          </span>
                          <button
                            onClick={() => handleAdjustTime(index, pt.adjust + 1)}
                            className="w-7 py-1 text-xs font-black text-stone-500 hover:text-stone-800 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 text-center font-bold">
                    سيقوم التطبيق تلقائياً بمراعاة هذه التعديلات في أوقات العد التنازلي ونظام أذان التنبيه!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Countdown Banner */}
            {nextPrayer && (
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4.5 rounded-2xl text-white text-center shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
                <div className="flex items-center gap-2 justify-start">
                  <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-xs font-extrabold text-emerald-100">الصلاة القادمة: {nextPrayer.nameAr}</span>
                </div>
                <span className="text-sm font-extrabold text-amber-300">متبقي {nextPrayer.countdown}</span>
              </div>
            )}

            {/* Prayer times list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {prayerTimes.map((pt) => {
                const isObligatory = pt.name !== 'Shorouk';
                const isChecked = isObligatory && prayedToday[pt.name];
                const displayTime = getAdjustedTime(pt);

                return (
                  <div
                    key={pt.name}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-1.5 transition-all ${
                      isChecked 
                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 shadow-sm'
                        : pt.name === 'Shorouk'
                          ? 'bg-stone-50/50 border-stone-100 text-stone-500'
                          : 'bg-white border-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-xs">{pt.nameAr}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />}
                    </div>
                    <span className="text-xl font-black font-mono tracking-wide mt-1">{displayTime}</span>
                    <div className="flex justify-between items-center text-[9px] text-stone-400 font-bold mt-0.5">
                      <span>{pt.name === 'Shorouk' ? 'سنة الضحى' : 'مكتوبة'}</span>
                      {pt.adjust !== 0 && (
                        <span className="text-emerald-700">({pt.adjust > 0 ? `+${pt.adjust}` : pt.adjust} د)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alarm Notifications Settings Box */}
          <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-100 pb-2 justify-start">
              <Bell className="h-4.5 w-4.5 text-emerald-600" />
              <span>إعدادات منبهات الأذان والصلوات</span>
            </h3>

            <p className="text-xs text-stone-400 leading-relaxed font-bold">
              اختر نوع التنبيهات التي ترغب بها عند حلول مواقيت الصلاة لتكون على صلة دائمة بالله:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Alarms audio toggle */}
              <button
                onClick={handleToggleAlarmSounds}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-24 cursor-pointer ${
                  enableAlarmSounds 
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' 
                    : 'bg-stone-50 border-stone-100 text-stone-500'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${enableAlarmSounds ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase">{enableAlarmSounds ? 'نشط' : 'معطل'}</span>
                </div>
                <div className="space-y-0.5 text-right mt-2">
                  <div className="font-extrabold text-xs">صوت تنبيه الأذان (الداخلي)</div>
                  <div className="text-[9px] opacity-75">رنين جرس إسلامي عذب يطلق مع حلول الفريضة</div>
                </div>
              </button>

              {/* System Push notifications toggle */}
              <button
                onClick={handleToggleBrowserNotifications}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-24 cursor-pointer ${
                  enableBrowserNotifications 
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' 
                    : 'bg-stone-50 border-stone-100 text-stone-500'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${enableBrowserNotifications ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase">
                    {enableBrowserNotifications ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <div className="space-y-0.5 text-right mt-2">
                  <div className="font-extrabold text-xs">إشعارات النظام/المتصفح الفورية</div>
                  <div className="text-[9px] opacity-75">عرض نافذة إشعار منبثقة على الشاشة مع حلول الصلاة</div>
                </div>
              </button>

            </div>

            {/* Audio Test Trigger */}
            <div className="flex justify-start items-center gap-2 bg-[#FCFBF7] p-3 rounded-2xl border border-stone-100">
              <button
                onClick={() => playAlarmSound(659.25, 1.5)}
                className="py-1.5 px-3.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-[10px] font-black text-stone-700 flex items-center gap-1 shadow-sm cursor-pointer transition-all shrink-0"
              >
                <Play className="h-3 w-3 text-emerald-700 fill-current" />
                <span>تجربة رنين التنبيه</span>
              </button>
              <p className="text-[9px] text-stone-400 font-semibold leading-relaxed">
                انقر لتجربة جودة ونبرة الصوت التي ستسمعها في هذا المتصفح فور حلول أوقات الصلاة المكتوبة.
              </p>
            </div>

          </div>

        </div>

        {/* Right column: Interactive Prayer tracker checklist & Qibla Compass */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Tracker checklist */}
          <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 justify-start">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>جدول صلواتك اليوم</span>
              </h3>
              
              <button
                onClick={handleResetDaily}
                className="text-[10px] text-stone-400 hover:text-rose-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>إعادة تصفير اليوم</span>
              </button>
            </div>

            <div className="text-xs text-stone-500 leading-relaxed">
              ضع علامة صح أمام كل صلاة تؤديها لتتبع التزامك اليومي والحفاظ على النوافل:
            </div>

            <div className="space-y-2">
              {[
                { key: 'Fajr', label: 'صلاة الفجر' },
                { key: 'Dhuhr', label: 'صلاة الظهر' },
                { key: 'Asr', label: 'صلاة العصر' },
                { key: 'Maghrib', label: 'صلاة المغرب' },
                { key: 'Isha', label: 'صلاة العشاء' },
                { key: 'Sunnah', label: 'السنن والرواتب اليومية' },
                { key: 'Witr', label: 'صلاة الشفع والوتر' }
              ].map((p) => {
                const isChecked = prayedToday[p.key];
                return (
                  <button
                    key={p.key}
                    onClick={() => togglePrayer(p.key)}
                    className={`w-full text-right p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold'
                        : 'bg-stone-50/50 border-stone-100 hover:border-emerald-100 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs">{p.label}</span>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                      isChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-stone-300'
                    }`}>
                      {isChecked && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Completion summary feedback */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-1">
              <div className="text-[11px] text-stone-500 font-extrabold">
                صلواتك المكتوبة المؤداة اليوم: {checkedObligCount} من 5 صلوات
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(checkedObligCount / 5) * 100}%` }}
                />
              </div>
              {checkedObligCount === 5 && (
                <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1.5 mt-2 animate-bounce justify-start">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>الحمد لله! لقد أتممت صلواتك الخمس المفروضة اليوم بنجاح!</span>
                </div>
              )}
            </div>
          </div>

          {/* Qibla compass simulator */}
          <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5 border-b border-stone-100 pb-2 justify-start">
              <Compass className="h-4 w-4 text-emerald-600" />
              <span>مؤشر اتجاه القبلة (الكعبة المشرفة)</span>
            </h3>

            <p className="text-xs text-stone-500 leading-relaxed">
              انقر على البوصلة لتدويرها ومحاذاة الهاتف أو المتصفح. اتجاه القبلة من المشرق العربي مائل للغرب والشمال الغربي تقريباً.
            </p>

            <div className="flex flex-col items-center justify-center py-4">
              <motion.div
                onClick={rotateCompass}
                animate={{ rotate: compassAngle }}
                transition={{ type: 'spring', stiffness: 80 }}
                className="h-40 w-40 rounded-full bg-stone-50 border-4 border-stone-200 relative flex items-center justify-center cursor-pointer shadow-inner"
                id="qibla-compass"
              >
                <span className="absolute top-2 text-[10px] font-black text-stone-400">N (شمال)</span>
                <span className="absolute bottom-2 text-[10px] font-black text-stone-400">S (جنوب)</span>
                <span className="absolute right-2 text-[10px] font-black text-stone-400">E (شرق)</span>
                <span className="absolute left-2 text-[10px] font-black text-stone-400">W (غرب)</span>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-1 bg-stone-300 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-1 bg-rose-500 rounded-full origin-bottom -translate-y-14" />

                <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1 h-6 w-6 bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center shadow-md border border-amber-300">
                  🕋
                </div>
              </motion.div>

              <span className="text-[10px] text-stone-400 font-bold mt-3 text-center">
                اضغط لتدوير البوصلة • الكعبة المشرفة في اتجاه المؤشر الأخضر 🕋
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
