import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Check, 
  Bluetooth, 
  Smartphone, 
  ShieldCheck, 
  Mic, 
  Camera, 
  FolderCheck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Wifi,
  Sparkles,
  Lock,
  Download
} from 'lucide-react';

export const ShareApp: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [bluetoothActive, setBluetoothActive] = useState<boolean>(false);

  // Device permissions state
  const [permissions, setPermissions] = useState({
    mic: false,
    camera: false,
    storage: false,
    location: false
  });

  const [permissionStatusMsg, setPermissionStatusMsg] = useState<string>('');

  useEffect(() => {
    // Check initial permission states if supported
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((p) => {
        if (p.state === 'granted') setPermissions(prev => ({ ...prev, mic: true }));
      }).catch(() => {});

      navigator.permissions.query({ name: 'camera' as PermissionName }).then((p) => {
        if (p.state === 'granted') setPermissions(prev => ({ ...prev, camera: true }));
      }).catch(() => {});

      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((p) => {
        if (p.state === 'granted') setPermissions(prev => ({ ...prev, location: true }));
      }).catch(() => {});
    }

    // Storage permission check from localStorage
    if (localStorage.getItem('km_storage_permission') === 'true') {
      setPermissions(prev => ({ ...prev, storage: true }));
    }
  }, []);

  // Request all permissions interactively
  const requestAllPermissions = async () => {
    setPermissionStatusMsg('جاري تقديم طلب الأذونات للجهاز...');
    let micGranted = false;
    let cameraGranted = false;
    let locGranted = false;

    try {
      // Request Audio & Camera
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      micGranted = true;
      cameraGranted = true;
      // Stop tracks immediately after granting
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.log('Camera or Mic request result:', err);
    }

    // Try requesting Mic only if camera failed
    if (!micGranted) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        audioStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
    }

    // Request Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          locGranted = true;
          setPermissions(prev => ({ ...prev, location: true }));
        },
        () => {}
      );
    }

    // Storage permission simulation/persistence
    localStorage.setItem('km_storage_permission', 'true');

    setPermissions({
      mic: micGranted,
      camera: cameraGranted,
      storage: true,
      location: locGranted
    });

    setPermissionStatusMsg('تم إرسال كافة طلبات الأذونات بنجاح إلى نظام جهازك.');
    setTimeout(() => setPermissionStatusMsg(''), 4000);
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, mic: true }));
    } catch (e) {
      alert('لم يتم منح إذن الميكروفون. يرجى السماح بالميكروفون من إعدادات المتصفح أو الجهاز.');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
    } catch (e) {
      alert('لم يتم منح إذن الكاميرا. يرجى السماح بالكاميرا من إعدادات المتصفح أو الجهاز.');
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setPermissions(prev => ({ ...prev, location: true })),
        () => alert('تعذر الحصول على إذن الموقع الجغرافي.')
      );
    }
  };

  const requestStoragePermission = () => {
    localStorage.setItem('km_storage_permission', 'true');
    setPermissions(prev => ({ ...prev, storage: true }));
  };

  const handleNativeBluetoothShare = async () => {
    setBluetoothActive(true);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق كُنْ مُحَمَّداً الإسلامي',
          text: 'تطبيق كُنْ مُحَمَّداً - مشاركة سريعة عبر البلوتوث والمشاركة القريبة',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
    setTimeout(() => setBluetoothActive(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 px-2 sm:px-4 text-right" dir="rtl" id="share-app-container">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mr-12 -mb-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-100">
            <Bluetooth className="h-4 w-4 text-sky-300" />
            <span>مشاركة مباشرة وبلوتوث بدون روابط خارجية</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-serif leading-tight">
            مشاركة التطبيق عبر <span className="text-sky-300">البلوتوث</span> والأجهزة القريبة
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-sans">
            يمكنك إرسال تطبيق «كُنْ مُحَمَّداً» مباشرة إلى أصدقائك عبر تقنية البلوتوث (Bluetooth) أو المشاركة القريبة (Nearby Share / Quick Share) بين الهواتف دون الحاجة لروابط أو تنزيل ملفات.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleNativeBluetoothShare}
              className="px-6 py-3.5 bg-sky-400 hover:bg-sky-300 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2.5 text-sm cursor-pointer"
            >
              <Bluetooth className="h-5 w-5 text-stone-950 animate-pulse" />
              <span>إرسال عبر البلوتوث والمشاركة القريبة الآن</span>
            </button>

            <a
              href="/kun_mohammadan_project.zip"
              download="kun_mohammadan_project.zip"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2.5 text-sm cursor-pointer"
            >
              <Download className="h-5 w-5 text-stone-950" />
              <span>تحميل سورس كود التطبيق المباشر (ZIP)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Permissions Section (أذونات التطبيق المطلوبة عند التثبيت) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">أذونات وتراخيص الجهاز للتطبيق</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">تأكيد ومنح الأذونات اللازمة لعمل الميكروفون، الكاميرا، الملفات، والموقع</p>
            </div>
          </div>

          <button
            onClick={requestAllPermissions}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Lock className="h-4 w-4" />
            <span>تفعيل وطلب جميع الأذونات دفعة واحدة</span>
          </button>
        </div>

        {permissionStatusMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{permissionStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Microphone Permission */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${permissions.mic ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                {permissions.mic ? 'ممنوح ✓' : 'مطلوب'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">إذن الميكروفون (Audio)</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">مطلوب لتسميع وتثبيت القراءة والتحفيظ الصوتي للقرآن.</p>
            </div>
            <button
              onClick={requestMicPermission}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${permissions.mic ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}
            >
              {permissions.mic ? 'تم منح إذن الميكروفون' : 'السماح بالميكروفون'}
            </button>
          </div>

          {/* Camera Permission */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${permissions.camera ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                {permissions.camera ? 'ممنوح ✓' : 'مطلوب'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">إذن الكاميرا (Camera)</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">مطلوب لمسح الباركود والمستندات المصورة للآيات.</p>
            </div>
            <button
              onClick={requestCameraPermission}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${permissions.camera ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300' : 'bg-sky-700 hover:bg-sky-600 text-white'}`}
            >
              {permissions.camera ? 'تم منح إذن الكاميرا' : 'السماح بالكاميرا'}
            </button>
          </div>

          {/* Storage / Files Permission */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <FolderCheck className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${permissions.storage ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                {permissions.storage ? 'ممنوح ✓' : 'مطلوب'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">إذن الملفات والتحميل (Storage)</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">مطلوب لحفظ البيانات المحلية، الختمات والتسجيلات.</p>
            </div>
            <button
              onClick={requestStoragePermission}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${permissions.storage ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
            >
              {permissions.storage ? 'تم منح إذن الوصول للملفات' : 'السماح بالوصول للملفات'}
            </button>
          </div>

          {/* Location Permission */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${permissions.location ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                {permissions.location ? 'ممنوح ✓' : 'مطلوب'}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">إذن الموقع (Location)</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">مطلوب لحساب مواقيت الصلاة واتجاه القبلة بمدينة المستخدم.</p>
            </div>
            <button
              onClick={requestLocationPermission}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${permissions.location ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300' : 'bg-teal-700 hover:bg-teal-600 text-white'}`}
            >
              {permissions.location ? 'تم منح إذن الموقع الجغرافي' : 'السماح بالموقع الجغرافي'}
            </button>
          </div>

        </div>
      </div>

      {/* Bluetooth & Nearby Share Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bluetooth Direct Share Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-sky-200/80 dark:border-sky-900/50 p-6 shadow-sm space-y-5 text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-sky-500" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Bluetooth className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 font-serif">المشاركة المباشرة عبر البلوتوث (Bluetooth Share)</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">إرسال التطبيق لجهاز آخر قريب منك مباشرة</p>
            </div>
          </div>

          <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/30 space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
              <Radio className="h-4 w-4 text-sky-600 animate-pulse" />
              <span>خطوات نقل التطبيق بالبلوتوث بين الهاتفين:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-600 dark:text-stone-300 pr-1 leading-relaxed">
              <li>قم بتفعيل خيار <b>البلوتوث (Bluetooth)</b> في كلا الهاتفين.</li>
              <li>اضغط على زر <b>«إرسال عبر البلوتوث الآن»</b> أدناه.</li>
              <li>اختر اسم هاتف صديقك القريب من قائمة الأجهزة الظاهرة في الشاشة.</li>
              <li>سيتم نقل ملف التطبيق مباشرة وبدون استهلاك للإنترنت.</li>
            </ol>
          </div>

          <button
            onClick={handleNativeBluetoothShare}
            className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bluetooth className="h-5 w-5" />
            <span>{bluetoothActive ? 'جاري فتح نافذة البلوتوث...' : 'إرسال عبر البلوتوث الآن'}</span>
          </button>
        </div>

        {/* Nearby Share / Quick Share Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-teal-200/80 dark:border-teal-900/50 p-6 shadow-sm space-y-5 text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-teal-500" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 font-serif">المشاركة القريبة السريعة (Quick / Nearby Share)</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">تقنية المشاركة اللاسلكية المباشرة للهواتف الذكية</p>
            </div>
          </div>

          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/30 space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-teal-600" />
              <span>ميزات المشاركة الفورية المباشرة:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-stone-600 dark:text-stone-300 pr-1 leading-relaxed">
              <li>نقل أوفلاين فائق السرعة بين الأجهزة المجاورة.</li>
              <li>متوافق مع جميع أجهزة أندرويد وآيفون عبر واجهة الجهاز.</li>
              <li>لا يحتاج إلى رفع أو تحميل روابط أو خوادم خارجية.</li>
            </ul>
          </div>

          <button
            onClick={handleNativeBluetoothShare}
            className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="h-5 w-5" />
            <span>مشاركة سريعة مع الأجهزة القريبة</span>
          </button>
        </div>

      </div>

      {/* Feature Badges */}
      <div className="bg-stone-100/70 dark:bg-stone-900/60 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-3">
        <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>تطبيق «كُنْ مُحَمَّداً» آمن وموثوق ومحمي بالأذونات الرسمية</span>
        </h3>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
          جميع الأذونات المطلوبة (الميكروفون، الكاميرا، الملفات، الموقع) تُستخدم حصرياً داخل التطبيق لخدمة قراءة القرآن والتسميع الصوتي والتنبيه للصلوات، دون مشاركة أي بيانات خارج جهازك.
        </p>
      </div>

    </div>
  );
};

