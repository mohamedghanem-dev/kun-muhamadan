import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Play, 
  User, 
  Phone, 
  Cpu, 
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Endpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  category: 'core' | 'ai' | 'khatma' | 'resources';
  categoryAr: string;
  description: string;
  requestBody?: string;
  queryParams?: { name: string; description: string; example: string }[];
  pathParams?: { name: string; description: string; example: string }[];
}

export const DeveloperApi: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [apiResults, setApiResults] = useState<Record<string, any>>({});
  const [customBodies, setCustomBodies] = useState<Record<string, string>>({});
  const [customParams, setCustomParams] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'core' | 'ai' | 'khatma' | 'resources'>('all');

  const baseUrl = window.location.origin;

  const endpoints: Endpoint[] = [
    // General
    {
      id: 'health',
      name: 'فحص حالة الخادم',
      method: 'GET',
      path: '/api/health',
      category: 'core',
      categoryAr: 'التشغيل والمعلومات العامة',
      description: 'يقوم بالتحقق من أن خادم الباك أند يعمل بصورة طبيعية دون مشاكل.'
    },
    // AI Endpoints
    {
      id: 'ask',
      name: 'سؤال المستشار الشرعي الذكي (Gemini Q&A)',
      method: 'POST',
      path: '/api/ask',
      category: 'ai',
      categoryAr: 'الذكاء الاصطناعي الشرعي',
      description: 'إرسال سؤال ديني أو فقهي للحصول على إجابة معتدلة ميسرة من الكتاب والسنّة مع إرجاع إجابات ذكية محلية فورية في حال عدم توفر مفتاح جيميناي.',
      requestBody: JSON.stringify({ question: 'ما فضل صلاة الضحى ووقتها بالتفصيل؟' }, null, 2)
    },
    {
      id: 'hadith_search',
      name: 'البحث الذكي في الأحاديث النبوية',
      method: 'POST',
      path: '/api/hadith/search',
      category: 'ai',
      categoryAr: 'الذكاء الاصطناعي الشرعي',
      description: 'البحث المتقدم بالذكاء الاصطناعي في كتب السنة الشريفة وإرجاع 3 أحاديث صحيحة مشكولة بالكامل مع شرحها ومصادرها بصيغة JSON مهيأة.',
      requestBody: JSON.stringify({ query: 'حسن الخلق والرحمة بالناس' }, null, 2)
    },
    {
      id: 'hadith_by_number',
      name: 'استدعاء حديث محدد بالترقيم',
      method: 'POST',
      path: '/api/hadith/by-number',
      category: 'ai',
      categoryAr: 'الذكاء الاصطناعي الشرعي',
      description: 'استدعاء حديث نبوي من الكتب الستة ورياض الصالحين برقم ترتيبه المحدد (1 - 2000) مع الشرح والراوي والمصدر.',
      requestBody: JSON.stringify({ number: 1, book: 'bukhari' }, null, 2)
    },
    // Khatma Endpoints
    {
      id: 'khatma_create',
      name: 'إنشاء ختمة تشاركية جديدة',
      method: 'POST',
      path: '/api/khatma/create',
      category: 'khatma',
      categoryAr: 'الختمات التشاركية الجماعية',
      description: 'إنشاء ختمة جماعية وحفظها في قاعدة بيانات الخادم، مع إرجاع رمز مميز فريد لمشاركته مع العائلة والأصدقاء.',
      requestBody: JSON.stringify({ name: 'ختمتنا العائلية المباركة', durationDays: 30, creatorName: 'محمود سفين' }, null, 2)
    },
    {
      id: 'khatma_join',
      name: 'الانضمام إلى ختمة تشاركية قائمة',
      method: 'POST',
      path: '/api/khatma/join',
      category: 'khatma',
      categoryAr: 'الختمات التشاركية الجماعية',
      description: 'الانضمام إلى ختمة تشاركية عبر إدخال رمزها الخاص واسمك الكريم لتسجيل اسمك في قائمة القراء الفاعلين.',
      requestBody: JSON.stringify({ code: 'KH-102501', friendName: 'أحمد عمر' }, null, 2)
    },
    {
      id: 'khatma_toggle',
      name: 'تحديد / إلغاء تحديد قراءة صفحة قرآنية',
      method: 'POST',
      path: '/api/khatma/toggle-page',
      category: 'khatma',
      categoryAr: 'الختمات التشاركية الجماعية',
      description: 'تسجيل قراءة أو إلغاء قراءة صفحة معينة في الختمة التشاركية بشكل لحظي، حيث يتم توثيق اسم القارئ والوقت وتحديث مستوى الإنجاز الإجمالي للجميع.',
      requestBody: JSON.stringify({ code: 'KH-102501', pageNumber: 42, read: true, userName: 'أحمد عمر' }, null, 2)
    },
    {
      id: 'khatma_sync',
      name: 'مزامنة وتحديث حالة الختمة التشاركية',
      method: 'GET',
      path: '/api/khatma/sync/:code',
      category: 'khatma',
      categoryAr: 'الختمات التشاركية الجماعية',
      description: 'جلب الحالة اللحظية والكاملة للختمة التشاركية عبر كودها لتحديث واجهة المستخدم لدى جميع الهواتف المشتركة.',
      pathParams: [{ name: 'code', description: 'كود الختمة التشاركية الفريد', example: 'KH-102501' }]
    },
    // Resource Endpoints
    {
      id: 'azkar',
      name: 'جلب قائمة الأذكار والتحصينات',
      method: 'GET',
      path: '/api/azkar',
      category: 'resources',
      categoryAr: 'قاعدة البيانات الإسلامية المدمجة',
      description: 'استرجاع الأذكار والتحصينات الشرعية مع فضل القراءة وعدد التكرارات اللازمة.',
      queryParams: [{ name: 'category', description: 'التصنيف المتاح (morning, evening, sleep, prayers)', example: 'morning' }]
    },
    {
      id: 'prophets',
      name: 'جلب قصص الأنبياء والرسل كاملة',
      method: 'GET',
      path: '/api/prophets',
      category: 'resources',
      categoryAr: 'قاعدة البيانات الإسلامية المدمجة',
      description: 'استرجاع قصص الأنبياء والرسل بأسلوب ميسر وشرح للآيات القرآنية الشريفة والدروس المستفادة.',
      queryParams: [{ name: 'id', description: 'معرف القصة (1 لآدم، 2 لنوح، إلخ)', example: '1' }]
    },
    {
      id: 'quran_surahs',
      name: 'جلب فهرس سور القرآن الكريم المتاحة',
      method: 'GET',
      path: '/api/quran/surahs',
      category: 'resources',
      categoryAr: 'قاعدة البيانات الإسلامية المدمجة',
      description: 'جلب فهرس خفيف لأسماء السور القرآنية، ترتيبها، عدد آياتها، ومكان نزولها (مكية / مدنية).'
    },
    {
      id: 'quran_surah_detail',
      name: 'جلب آيات وتفاصيل سورة قرآنية معينة',
      method: 'GET',
      path: '/api/quran/surah/:id',
      category: 'resources',
      categoryAr: 'قاعدة البيانات الإسلامية المدمجة',
      description: 'جلب السورة بالكامل شاملة نصوص الآيات بالتشكيل الدقيق وروابط التلاوة الصوتية (Audio URL) بصوت الشيخ مشاري العفاسي لكل آية.',
      pathParams: [{ name: 'id', description: 'رقم السورة في المصحف الشريف (مثال: 1 للفاتحة، 97 للقدر)', example: '1' }]
    },
    {
      id: 'faq',
      name: 'بنك الأسئلة والأجوبة الفقهية المجهزة',
      method: 'GET',
      path: '/api/faq',
      category: 'resources',
      categoryAr: 'قاعدة البيانات الإسلامية المدمجة',
      description: 'استرجاع الأسئلة الفقهية الأكثر شيوعاً وإجاباتها الموثقة والمصنفة موضوعياً.',
      queryParams: [{ name: 'category', description: 'التصنيف (prayer, purity, fasting, morals, sunnah)', example: 'prayer' }]
    },
    {
      id: 'hadiths_local',
      name: 'جلب الأحاديث النبوية المدمجة',
      method: 'GET',
      path: '/api/hadiths/local',
      category: 'resources',
      categoryAr: 'قاعدة البيانات الإسلامية المدمجة',
      description: 'استرجاع الأحاديث النبوية الشريفة المدمجة محلياً (مثل الأربعين النووية ومكارم الأخلاق) مع شرحها ومصادرها.'
    }
  ];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCurlCommand = (endpoint: Endpoint) => {
    let url = `${baseUrl}${endpoint.path}`;
    
    // Replace path variables
    if (endpoint.pathParams) {
      endpoint.pathParams.forEach(p => {
        const customVal = customParams[`${endpoint.id}_path_${p.name}`] || p.example;
        url = url.replace(`:${p.name}`, customVal);
      });
    }

    // Add query params
    if (endpoint.queryParams) {
      const qParts: string[] = [];
      endpoint.queryParams.forEach(q => {
        const customVal = customParams[`${endpoint.id}_query_${q.name}`];
        if (customVal !== undefined && customVal !== '') {
          qParts.push(`${q.name}=${encodeURIComponent(customVal)}`);
        } else if (customVal === undefined) {
          qParts.push(`${q.name}=${encodeURIComponent(q.example)}`);
        }
      });
      if (qParts.length > 0) {
        url += `?${qParts.join('&')}`;
      }
    }

    if (endpoint.method === 'GET') {
      return `curl -X GET "${url}"`;
    } else {
      const body = customBodies[endpoint.id] || endpoint.requestBody || '{}';
      const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '');
      return `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d "${escapedBody}"`;
    }
  };

  const executeApiTest = async (endpoint: Endpoint) => {
    setTestingId(endpoint.id);
    setApiResults(prev => ({ ...prev, [endpoint.id]: null }));

    let url = endpoint.path;
    
    // Replace path variables
    if (endpoint.pathParams) {
      endpoint.pathParams.forEach(p => {
        const customVal = customParams[`${endpoint.id}_path_${p.name}`] || p.example;
        url = url.replace(`:${p.name}`, customVal);
      });
    }

    // Add query params
    if (endpoint.queryParams) {
      const qParts: string[] = [];
      endpoint.queryParams.forEach(q => {
        const customVal = customParams[`${endpoint.id}_query_${q.name}`];
        if (customVal !== undefined && customVal !== '') {
          qParts.push(`${q.name}=${encodeURIComponent(customVal)}`);
        } else if (customVal === undefined) {
          qParts.push(`${q.name}=${encodeURIComponent(q.example)}`);
        }
      });
      if (qParts.length > 0) {
        url += `?${qParts.join('&')}`;
      }
    }

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (endpoint.method === 'POST') {
        options.body = customBodies[endpoint.id] || endpoint.requestBody || '{}';
      }

      const res = await fetch(url, options);
      const data = await res.json();
      
      setApiResults(prev => ({
        ...prev,
        [endpoint.id]: {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          timestamp: new Date().toLocaleTimeString(),
          data: data
        }
      }));
    } catch (err: any) {
      setApiResults(prev => ({
        ...prev,
        [endpoint.id]: {
          status: 'ERROR',
          statusText: err.message || 'Network Error',
          ok: false,
          timestamp: new Date().toLocaleTimeString(),
          data: { error: 'تعذر الاتصال بالخادم. يرجى التحقق من تشغيل الباك أند.' }
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const filteredEndpoints = endpoints.filter(ep => 
    activeFilter === 'all' ? true : ep.category === activeFilter
  );

  return (
    <div className="space-y-8" id="developer-portal">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-emerald-900 to-stone-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-emerald-800/20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800/10 via-transparent to-transparent opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/40 border border-emerald-700/30 rounded-full text-xs font-black text-emerald-300">
              <Cpu className="h-3.5 w-3.5" />
              <span>بوابة مطور الهواتف الذكية (API & Postman Collection)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight leading-tight">بوابة المطورين والاتصال بالخادم</h1>
            <p className="text-xs md:text-sm text-stone-200/90 font-bold leading-relaxed">
              هذه البوابة مهيأة بالكامل لمساعدة مطور تطبيقات فلاتر (Flutter Developer) في فهم واجهات الاتصال (REST APIs)، وتجربة الطلبات بشكل تفاعلي مباشر، وتنزيل ملف تجميعة Postman الجاهز لبدء العمل فوراً وتوفير الوقت والمجهود.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a 
              href="/kun_mohammadan_project.zip" 
              download="kun_mohammadan_project.zip"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-900/10 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>تحميل المشروع كاملاً (ZIP)</span>
            </a>

            <a 
              href="/islamic_app_postman_collection.json" 
              download="kun_mohammadan_postman_collection.json"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-900/10 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>تحميل ملف Postman Collection</span>
            </a>
            
            <button 
              onClick={() => {
                const healthEp = endpoints.find(e => e.id === 'health');
                if (healthEp) executeApiTest(healthEp);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-950/10 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span>اختبار اتصال الخادم الحالي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer Credits Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100/30">
            <User className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-stone-400 dark:text-stone-500 font-bold">مهندسو البرمجة والتطوير (Development Team)</div>
            <h3 className="text-sm font-black text-stone-850 dark:text-stone-100 font-serif">محمود سفين &amp; يوسف مرموش (المطور المساعد)</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">متاحون للإجابة على تساؤلات المطورين وتعديل هيكل الردود (API Responses) لتناسب الفلاتر.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <a 
            href="tel:01211542025"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold border border-stone-150/40 dark:border-stone-700/60 transition-all"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
            <span>اتصال: 01211542025</span>
          </a>

          <a 
            href="https://wa.me/201211542025"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-current text-white" />
            <span>شات واتساب المطور</span>
          </a>
          
          <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-black border border-emerald-100/20">
            الحالة: نشط ومتاح للخدمة
          </div>
        </div>
      </div>

      {/* Technical Configuration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-2">
          <div className="text-xs text-stone-400 dark:text-stone-500 font-bold">رابط الخادم الأساسي (Base URL)</div>
          <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold break-all p-2 bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-stone-100/40 dark:border-stone-800/50">
            {baseUrl}
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">استخدم هذا الرابط كـ Base URL في كود Dart داخل تطبيق Flutter.</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-2">
          <div className="text-xs text-stone-400 dark:text-stone-500 font-bold">رأس الطلب الافتراضي (Headers)</div>
          <div className="font-mono text-xs text-stone-700 dark:text-stone-300 font-bold p-2 bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-stone-100/40 dark:border-stone-800/50 space-y-1">
            <div>Accept: <span className="text-amber-700 dark:text-amber-400">application/json</span></div>
            <div>Content-Type: <span className="text-amber-700 dark:text-amber-400">application/json</span></div>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">كافة طلبات الـ POST والـ GET تتواصل وتستقبل بصيغة JSON الموحدة.</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm space-y-2">
          <div className="text-xs text-stone-400 dark:text-stone-500 font-bold">مستوى توفر جيميناي (AI Status)</div>
          <div className="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-stone-100/40 dark:border-stone-800/50">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">مفتاح الذكاء الاصطناعي مفعّل بالخادم</span>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">يدعم الخادم التبديل التلقائي (Automatic Fallback) للخدمة المحلية عند انشغال السحاب.</p>
        </div>
      </div>

      {/* Categories Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-stone-150 dark:border-stone-800 pb-1" id="endpoint-tabs">
        {[
          { id: 'all', label: 'كل الواجهات (All API)', count: endpoints.length },
          { id: 'core', label: 'العامة والتشغيل', count: endpoints.filter(e => e.category === 'core').length },
          { id: 'ai', label: 'الذكاء الاصطناعي', count: endpoints.filter(e => e.category === 'ai').length },
          { id: 'khatma', label: 'الختمات الجماعية', count: endpoints.filter(e => e.category === 'khatma').length },
          { id: 'resources', label: 'البيانات الإسلامية المدمجة', count: endpoints.filter(e => e.category === 'resources').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'border-b-2 border-emerald-700 text-emerald-800 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="mr-1.5 px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500 dark:text-stone-400 rounded-full font-sans">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {filteredEndpoints.map((endpoint) => {
          const isPost = endpoint.method === 'POST';
          const result = apiResults[endpoint.id];
          const curl = getCurlCommand(endpoint);

          return (
            <div 
              key={endpoint.id} 
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden"
              id={`endpoint-card-${endpoint.id}`}
            >
              {/* Card Title Bar */}
              <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/30 dark:bg-stone-950/10">
                <div className="space-y-1.5 text-right">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black font-sans uppercase tracking-wider ${
                      isPost 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/20' 
                        : 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400 border border-sky-200/20'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-750 dark:text-stone-250 select-text">
                      {endpoint.path}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-stone-850 dark:text-stone-100 font-serif flex items-center gap-1.5">
                    <span>{endpoint.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-full font-bold">
                      {endpoint.categoryAr}
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleCopyText(`${baseUrl}${endpoint.path}`, `url_${endpoint.id}`)}
                    className="p-2 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-150/40 dark:border-stone-700/60 rounded-xl text-stone-500 dark:text-stone-300 transition-all cursor-pointer text-xs flex items-center gap-1 font-bold"
                    title="نسخ الرابط بالكامل"
                  >
                    {copiedId === `url_${endpoint.id}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">نسخ الرابط</span>
                  </button>

                  <button
                    onClick={() => executeApiTest(endpoint)}
                    disabled={testingId === endpoint.id}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-900/10 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {testingId === endpoint.id ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري الاتصال...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>تجربة الطلب (Try)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card Body Information */}
              <div className="p-5 space-y-5">
                <p className="text-xs text-stone-600 dark:text-stone-300 font-bold leading-relaxed">
                  {endpoint.description}
                </p>

                {/* Path Variables & Query Params info */}
                {(endpoint.pathParams || endpoint.queryParams) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-stone-800 dark:text-stone-250 font-serif">معاملات الطلب (Parameters):</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 dark:border-stone-850 text-[10px] text-stone-400 dark:text-stone-500 font-black">
                            <th className="py-2 px-3 text-right">النوع</th>
                            <th className="py-2 px-3 text-right">الاسم</th>
                            <th className="py-2 px-3 text-right">القيمة الافتراضية</th>
                            <th className="py-2 px-3 text-right">الوصف الشرحي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.pathParams?.map(p => (
                            <tr key={p.name} className="border-b border-stone-50 dark:border-stone-850/40 text-stone-700 dark:text-stone-300">
                              <td className="py-2.5 px-3 font-mono text-[10px] text-sky-600 dark:text-sky-400 font-black">PATH VARIABLE</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] font-black text-amber-700 dark:text-amber-400">:{p.name}</td>
                              <td className="py-2.5 px-3 font-mono">
                                <input
                                  type="text"
                                  defaultValue={p.example}
                                  onChange={(e) => setCustomParams(prev => ({ ...prev, [`${endpoint.id}_path_${p.name}`]: e.target.value }))}
                                  className="px-2 py-1 bg-stone-50 dark:bg-stone-950 border border-stone-150/50 dark:border-stone-800/80 rounded-lg text-xs font-mono font-bold text-stone-800 dark:text-stone-200 w-24 focus:outline-emerald-700"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-bold text-stone-500 dark:text-stone-400 text-[11px]">{p.description}</td>
                            </tr>
                          ))}
                          {endpoint.queryParams?.map(q => (
                            <tr key={q.name} className="border-b border-stone-50 dark:border-stone-850/40 text-stone-700 dark:text-stone-300">
                              <td className="py-2.5 px-3 font-mono text-[10px] text-teal-600 dark:text-teal-400 font-black">QUERY PARAM</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] font-black text-amber-700 dark:text-amber-400">{q.name}</td>
                              <td className="py-2.5 px-3 font-mono">
                                <input
                                  type="text"
                                  defaultValue={q.example}
                                  placeholder="اختياري"
                                  onChange={(e) => setCustomParams(prev => ({ ...prev, [`${endpoint.id}_query_${q.name}`]: e.target.value }))}
                                  className="px-2 py-1 bg-stone-50 dark:bg-stone-950 border border-stone-150/50 dark:border-stone-800/80 rounded-lg text-xs font-mono font-bold text-stone-800 dark:text-stone-200 w-24 focus:outline-emerald-700"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-bold text-stone-500 dark:text-stone-400 text-[11px]">{q.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Body and Curl side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* JSON Request Body */}
                  {isPost && (
                    <div className="space-y-1.5 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-800 dark:text-stone-200 font-serif">جسم الطلب (JSON Request Body):</span>
                        <span className="text-[10px] text-emerald-700 font-bold">يمكنك تعديله للتجربة</span>
                      </div>
                      <div className="relative">
                        <textarea
                          value={customBodies[endpoint.id] !== undefined ? customBodies[endpoint.id] : endpoint.requestBody}
                          onChange={(e) => setCustomBodies(prev => ({ ...prev, [endpoint.id]: e.target.value }))}
                          rows={4}
                          className="w-full font-mono text-xs p-3 bg-stone-950 text-emerald-400 rounded-2xl border border-stone-850 focus:outline-none focus:border-emerald-700/60 leading-relaxed font-semibold block"
                          dir="ltr"
                        />
                        <button
                          onClick={() => handleCopyText(customBodies[endpoint.id] || endpoint.requestBody || '', `body_${endpoint.id}`)}
                          className="absolute bottom-2.5 right-2.5 p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 rounded-lg transition-all"
                          title="نسخ جسم الطلب"
                        >
                          {copiedId === `body_${endpoint.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Curl Command */}
                  <div className={`space-y-1.5 text-right ${isPost ? '' : 'md:col-span-2'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-800 dark:text-stone-200 font-serif">طلب كيرل (CURL Command Command):</span>
                      <span className="text-[10px] text-stone-400 font-bold">جاهز للتشغيل بالترمينال</span>
                    </div>
                    <div className="relative">
                      <pre className="w-full font-mono text-xs p-3 bg-stone-950 text-stone-350 rounded-2xl border border-stone-850 overflow-x-auto leading-relaxed select-all h-[95px] max-h-[95px]" dir="ltr">
                        {curl}
                      </pre>
                      <button
                        onClick={() => handleCopyText(curl, `curl_${endpoint.id}`)}
                        className="absolute bottom-2.5 right-2.5 p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 rounded-lg transition-all"
                        title="نسخ أمر CURL"
                      >
                        {copiedId === `curl_${endpoint.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Result Panel (Try Live Response) */}
                <AnimatePresence>
                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-2 text-right"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${result.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`text-xs font-black font-mono ${result.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {result.status} {result.statusText}
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                            | {result.timestamp}
                          </span>
                        </div>
                        <span className="text-xs font-serif font-black text-stone-800 dark:text-stone-250">نتيجة الاستدعاء المباشر (Live Response):</span>
                      </div>

                      <div className="relative">
                        <pre className="w-full font-mono text-xs p-4 bg-stone-950 text-emerald-300 rounded-2xl border border-stone-850 overflow-auto max-h-[350px] leading-relaxed" dir="ltr">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                        <button
                          onClick={() => handleCopyText(JSON.stringify(result.data, null, 2), `res_${endpoint.id}`)}
                          className="absolute bottom-3 right-3 p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 rounded-lg transition-all"
                          title="نسخ الاستجابة"
                        >
                          {copiedId === `res_${endpoint.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful advice for Flutter developer */}
      <div className="bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100/40 dark:border-amber-900/10 rounded-3xl p-6 space-y-3">
        <h4 className="text-sm font-black text-amber-850 dark:text-amber-400 font-serif flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>توصيات تقنية هامة لمطور الفلاتر (Flutter Integration Tips):</span>
        </h4>
        
        <ul className="list-decimal list-inside text-xs text-stone-600 dark:text-stone-300 space-y-2.5 font-bold leading-relaxed">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">هيكل البيانات الموحد:</strong> كافة الواجهات ترجع النتائج داخل كائنات JSON قياسية، ننصح باستخدام مكتبة <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">dio</code> أو <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">http</code> مع إعداد مولدات النماذج التلقائية مثل <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">freezed</code> أو <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">json_serializable</code>.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">مزامنة الختمات التشاركية:</strong> عند تحديث صفحة الختمة في الخلفية عبر <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">/api/khatma/toggle-page</code>، يفضل تفعيل عملية سحب البيانات دورياً (Polling) كل 15-30 ثانية لتحديث حالة المصحف لدى بقية الأصدقاء تلقائياً.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">التخزين المؤقت المحلي (Caching):</strong> البيانات الكبيرة المدمجة بالباك أند (مثل فهرس السور وقصص الأنبياء والأذكار) لا تتغير بكثرة. ننصح بحفظ الاستجابات محلياً على الهاتف باستخدام <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">hive</code> أو <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">shared_preferences</code> لتوفير استهلاك شبكة الإنترنت للمستخدمين وتسريع تجربة التصفح.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">الصوت والملفات الصوتية للتلاوة:</strong> ترجع تفاصيل السورة لكل آية رابط صوتي مباشر (مثال: Alafasy mp3). يمكنك استخدام حزمة <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">just_audio</code> أو <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px] text-amber-700 dark:text-amber-400">audioplayers</code> في فلاتر لبث التلاوة وحفظها للاستماع أوفلاين.
          </li>
        </ul>
      </div>
    </div>
  );
};
