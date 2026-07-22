import React, { useState } from 'react';
import { PROPHETS_DATA, ProphetStory } from '../data/prophets';
import { BookOpen, Search, Sparkles, ChevronLeft, Award, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProphetStories: React.FC = () => {
  const [stories] = useState<ProphetStory[]>(PROPHETS_DATA);
  const [selectedStory, setSelectedStory] = useState<ProphetStory>(PROPHETS_DATA[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredStories = stories.filter(
    story =>
      story.name.includes(searchTerm) ||
      story.title.includes(searchTerm) ||
      story.story.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-right" id="prophet-stories-root">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 justify-start">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/30">
              <BookOpen className="h-5.5 w-5.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 font-serif">قصص الأنبياء والرسل الكرام</h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 font-bold mt-0.5">خذ العبرة والدروس من حياة صفوة الخلق وسيرتهم العطرة</p>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
            تصفح قصص الأنبياء والرسل من آدم عليه السلام وصولاً إلى خاتم المرسلين محمد ﷺ بالاعتماد الموثوق على آيات القرآن الكريم وما ورد في السيرة النبوية الشريفة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Prophet Picker & Search */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="ابحث عن نبي أو عبرة أو كلمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-11 pl-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 transition-all font-medium text-right"
              dir="rtl"
            />
          </div>

          {/* List of prophets */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm space-y-2">
            <h3 className="text-xs font-extrabold text-stone-400 dark:text-stone-500 pb-2 border-b border-stone-100 dark:border-stone-800/80">قائمة الأنبياء</h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
              {filteredStories.map((s) => {
                const isSelected = selectedStory.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStory(s)}
                    className={`whitespace-nowrap flex-shrink-0 w-full text-right flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-md'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronLeft className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-stone-300 dark:text-stone-600'}`} />
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-stone-400 dark:text-stone-500'}`}>{s.title}</span>
                    </div>
                    <span className="font-serif text-sm">{s.name}</span>
                  </button>
                );
              })}

              {filteredStories.length === 0 && (
                <div className="text-center py-6 text-stone-400 text-xs">لا يوجد نتائج تطابق بحثك</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Story content */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 p-6 shadow-sm space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-right"
            >
              {/* Header block */}
              <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black font-serif text-emerald-800 dark:text-emerald-400">{selectedStory.name}</h1>
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-bold mt-1">{selectedStory.title}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold font-serif text-lg">
                  {selectedStory.id}
                </div>
              </div>

              {/* Story Narratve block */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                  <span>القصة والتفاصيل</span>
                </h3>
                <p className="font-serif text-stone-700 dark:text-stone-200 text-base leading-loose text-justify font-medium">
                  {selectedStory.story}
                </p>
              </div>

              {/* Quranic Verses related */}
              {selectedStory.verses && selectedStory.verses.length > 0 && (
                <div className="space-y-3 bg-amber-50/40 dark:bg-amber-950/10 p-5 rounded-2xl border border-amber-100/50 dark:border-amber-900/10">
                  <h3 className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Quote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>آيات قرآنية ذات صلة</span>
                  </h3>
                  <div className="space-y-3">
                    {selectedStory.verses.map((v, i) => (
                      <p key={i} className="font-serif text-[16px] text-amber-950 dark:text-amber-200 font-bold leading-relaxed pr-3 border-r-2 border-amber-400">
                        &ldquo;{v}&rdquo;
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons Learned */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span>الدروس والعبر المستفادة</span>
                </h3>
                <ul className="space-y-2.5">
                  {selectedStory.lessons.map((lesson, idx) => (
                    <li key={idx} className="flex gap-2 text-xs font-bold text-stone-600 dark:text-stone-300 leading-relaxed justify-start items-start">
                      <span className="h-5 w-5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-right">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
