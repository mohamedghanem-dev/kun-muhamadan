import React, { useState, useEffect } from 'react';
import { TasbihItem } from '../types';
import { Trash2, RotateCcw, Volume2, VolumeX, Sparkles, Award, Star, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TasbihSebha: React.FC = () => {
  const [items, setItems] = useState<TasbihItem[]>([
    { id: '1', text: 'سُبْحَانَ اللَّهِ', count: 0, target: 33 },
    { id: '2', text: 'الْحَمْدُ لِلَّهِ', count: 0, target: 33 },
    { id: '3', text: 'اللَّهُ أَكْبَرُ', count: 0, target: 33 },
    { id: '4', text: 'لَا إِلَهَ إِلَّا اللَّهُ', count: 0, target: 100 },
    { id: '5', text: 'أَسْتَغْفِرُ اللَّهَ العَظِيمَ', count: 0, target: 100 },
    { id: '6', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', count: 0, target: 100 }
  ]);
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  const [soundType, setSoundType] = useState<'click' | 'beep' | 'bell' | 'none'>(() => {
    return (localStorage.getItem('km_sebha_sound_type') as any) || 'click';
  });
  const [customText, setCustomText] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<number>(33);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [totalTasbihCount, setTotalTasbihCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('km_sebha_items');
    const savedTotal = localStorage.getItem('km_sebha_total');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedTotal) {
      setTotalTasbihCount(Number(savedTotal));
    }
  }, []);

  const saveState = (newItems: TasbihItem[], newTotal: number) => {
    setItems(newItems);
    setTotalTasbihCount(newTotal);
    localStorage.setItem('km_sebha_items', JSON.stringify(newItems));
    localStorage.setItem('km_sebha_total', String(newTotal));
  };

  // Synthesizes a high-quality interactive sound based on selected type
  const playClickSound = () => {
    if (soundType === 'none') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (soundType === 'click') {
        // Wooden/plastic rosary bead impact sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (soundType === 'beep') {
        // Crisp digital tally-counter beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (soundType === 'bell') {
        // Cozy bell/chime ring
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1108.73, ctx.currentTime); // C#6
        
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.log("Audio play failed: ", e);
    }
  };

  // Synthesizes a beautiful bell tone upon reaching target count
  const playTargetSound = () => {
    if (soundType === 'none') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 note
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); // Long decay
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.0);
      osc2.stop(ctx.currentTime + 1.0);
    } catch (e) {
      console.log("Audio play failed: ", e);
    }
  };

  const handleIncrement = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    const updatedItems = items.map(item => {
      if (item.id === selectedItemId) {
        const nextCount = item.count + 1;
        playClickSound();
        
        // Play special bell sound if we just reached the target
        if (item.target && nextCount === item.target) {
          setTimeout(playTargetSound, 100);
        }
        
        return { ...item, count: nextCount };
      }
      return item;
    });

    const newTotal = totalTasbihCount + 1;
    saveState(updatedItems, newTotal);
  };

  const handleReset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل تريد إعادة هذا العداد إلى الصفر؟')) return;

    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, count: 0 };
      }
      return item;
    });
    saveState(updatedItems, totalTasbihCount);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newItem: TasbihItem = {
      id: Date.now().toString(),
      text: customText.trim(),
      count: 0,
      target: customTarget > 0 ? customTarget : undefined,
      isCustom: true
    };

    const newItems = [...items, newItem];
    saveState(newItems, totalTasbihCount);
    setSelectedItemId(newItem.id);
    setCustomText('');
    setShowAddCustom(false);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل تريد حذف هذه التسبيحة المخصصة؟')) return;

    const newItems = items.filter(item => item.id !== id);
    let nextSelected = selectedItemId;
    if (selectedItemId === id) {
      nextSelected = newItems[0]?.id || '';
    }
    setItems(newItems);
    setSelectedItemId(nextSelected);
    localStorage.setItem('km_sebha_items', JSON.stringify(newItems));
  };

  const selectedItem = items.find(item => item.id === selectedItemId) || items[0];
  const progressPercent = selectedItem.target ? Math.min(100, Math.round((selectedItem.count / selectedItem.target) * 100)) : 0;
  const isTargetMet = selectedItem.target ? selectedItem.count >= selectedItem.target : false;

  return (
    <div className="space-y-8" id="tasbih-sebha-root">
      {/* Top statistics bar */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-right">
          <div className="flex items-center gap-2">
            <Award className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
            <h2 className="text-lg font-bold text-stone-800">ركن التسبيح والأذكار القلبية</h2>
          </div>
          <p className="text-xs text-stone-500">
            أكثر من ذكر الله رطباً بلسانك، اختر الذكر المناسب واستخدم المسبحة الإلكترونية التفاعلية ذات المؤثرات اللمسية والصوتية.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 self-start md:self-auto">
          <div className="text-right">
            <div className="text-xs text-stone-500">مجموع تسبيحاتك الكلي</div>
            <div className="text-2xl font-black text-emerald-800">{totalTasbihCount}</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Star className="h-5 w-5 fill-emerald-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Phrase selector & Add custom */}
        <div className="lg:col-span-5 space-y-4" id="sebha-options-sidebar">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-500 pr-1 flex items-center gap-1.5">
              <ListPlus className="h-4 w-4 text-emerald-600" />
              <span>صيغ وأوراد التسبيح</span>
            </h3>
            
            <button
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              {showAddCustom ? 'إغلاق النموذج' : '+ إضافة ذكر مخصص'}
            </button>
          </div>

          {/* Add custom form */}
          <AnimatePresence>
            {showAddCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleAddCustomItem} className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3.5">
                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-semibold text-stone-600">نص الذكر الجديد</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سبحان الله وبحمده..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-right"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-semibold text-stone-600">العدد المستهدف للدورة (مثلاً 33 أو 100)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="33"
                      value={customTarget}
                      onChange={(e) => setCustomTarget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-right"
                      dir="rtl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    أضف هذا الورد للمسبحة
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phrases items list */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-white border-stone-100 hover:border-emerald-100 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-right space-y-1 flex-1">
                    <div className="font-semibold text-sm leading-relaxed">{item.text}</div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      العدد الحالي: {item.count} {item.target ? `• المستهدف: ${item.target}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleReset(item.id, e)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-emerald-700 transition-colors"
                      title="تصفير العداد"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    {item.isCustom && (
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-rose-500 transition-colors"
                        title="حذف الذكر"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Tactile Clicker */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm w-full max-w-md text-center space-y-6 relative overflow-hidden" id="interactive-sebha-container">
            {/* Audio Toggle & Quick actions */}
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <button
                onClick={() => {
                  const types: ('click' | 'beep' | 'bell' | 'none')[] = ['click', 'beep', 'bell', 'none'];
                  const nextIndex = (types.indexOf(soundType) + 1) % types.length;
                  const nextType = types[nextIndex];
                  setSoundType(nextType);
                  localStorage.setItem('km_sebha_sound_type', nextType);
                  // Play a quick sound preview
                  setTimeout(() => {
                    if (nextType !== 'none') {
                      try {
                        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                        if (!AudioCtx) return;
                        const ctx = new AudioCtx();
                        if (ctx.state === 'suspended') ctx.resume();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(nextType === 'bell' ? 880 : (nextType === 'beep' ? 1000 : 380), ctx.currentTime);
                        gain.gain.setValueAtTime(0.06, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.1);
                      } catch (e) {}
                    }
                  }, 50);
                }}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  soundType !== 'none' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                }`}
                title="تغيير نوع صوت السبحة (اضغط للتبديل: نقرة، رنين، جرس، صامت)"
              >
                {soundType === 'none' ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="text-[10px] font-bold">
                  صوت: {soundType === 'click' && 'نقرة خشبية'}
                  {soundType === 'beep' && 'رنين رقمي'}
                  {soundType === 'bell' && 'جرس هادئ'}
                  {soundType === 'none' && 'صامت'}
                </span>
              </button>

              <span className="text-xs font-bold text-stone-400 dark:text-stone-500">مسبحة &quot;كن محمداً&quot; التفاعلية</span>

              <button
                onClick={(e) => handleReset(selectedItem.id, e)}
                className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-250 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-xl transition-all"
                title="تصفير العداد الحالي"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Current phrase view */}
            <div className="py-2 px-4 bg-emerald-50/50 rounded-2xl inline-block max-w-[90%]">
              <span className="font-serif text-lg font-bold text-emerald-800 leading-relaxed">
                {selectedItem.text}
              </span>
            </div>

            {/* Big Tapping Circle widget */}
            <div className="relative py-4 flex items-center justify-center">
              <motion.button
                id="sebha-clicker-button"
                onClick={handleIncrement}
                animate={{ scale: isAnimating ? 0.93 : 1 }}
                transition={{ duration: 0.1 }}
                className={`h-56 w-56 rounded-full border-8 ${
                  isTargetMet 
                    ? 'border-amber-400 shadow-amber-200' 
                    : 'border-emerald-700 shadow-emerald-100'
                } bg-gradient-to-br from-stone-50 to-stone-100/90 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-all outline-none focus:outline-none`}
              >
                {/* Visual ripple pulse inside */}
                {isTargetMet && (
                  <div className="absolute inset-4 rounded-full bg-amber-400/5 animate-ping" />
                )}

                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">اضغط هنا للتسبيح</span>
                <span className="text-5xl font-black text-stone-800 font-mono mt-1 select-none">
                  {selectedItem.count}
                </span>
                {selectedItem.target && (
                  <span className="text-xs text-stone-500 font-mono mt-2">
                    الهدف: {selectedItem.target}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Current item stats / progress */}
            {selectedItem.target && (
              <div className="space-y-1.5 text-right">
                <div className="flex justify-between items-center text-xs text-stone-500 font-semibold px-1">
                  <span>نسبة إنجاز الورد</span>
                  <span>{progressPercent}%</span>
                </div>
                
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isTargetMet ? 'bg-amber-400' : 'bg-emerald-600'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <AnimatePresence>
                  {isTargetMet && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="bg-amber-50 text-amber-950 p-3 rounded-xl border border-amber-200 text-center text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>تقبل الله منك! لقد أتممت العدد المستهدف ({selectedItem.target}) لهذا الورد.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
