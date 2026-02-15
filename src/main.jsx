import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  Navigation, 
  Utensils, 
  Camera, 
  Hotel,
  Save,
  Edit3,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Info
} from 'lucide-react';

/**
 * 智慧旅遊行程規劃器 (Smart Itinerary Planner)
 * 修復說明：
 * 1. 將所有組件與邏輯整合至單一檔案中，解決 "Could not resolve ./App.jsx" 的模組解析錯誤。
 * 2. 遵循環境規範，將 App 作為預設匯出 (default export)，系統會自動處理掛載。
 */

const App = () => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef(null);

  // 初始化行程資料
  const [itinerary, setItinerary] = useState({
    title: '我的東京櫻花祭之旅',
    description: '期待已久的春季賞櫻行程，包含築地市場與新宿御苑。',
    startDate: '2024-03-25',
    endDate: '2024-03-29',
    days: [
      {
        id: 1,
        activities: [
          { id: 1, time: '09:00', location: '桃園國際機場', type: 'transport', note: '搭乘 BR198 航班', cost: 12000 },
          { id: 2, time: '14:30', location: '成田機場', type: 'transport', note: '購買 Skyliner 套票', cost: 800 },
          { id: 3, time: '16:00', location: '上野 Candeo Hotel', type: 'stay', note: '辦理入住', cost: '' }
        ]
      }
    ]
  });

  const [activeDay, setActiveDay] = useState(0);

  // 動態載入 html2canvas
  useEffect(() => {
    if (window.html2canvas) return;
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const downloadAsImage = async () => {
    if (!printRef.current || !window.html2canvas) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await window.html2canvas(printRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = `${itinerary.title || '我的行程'}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("下載失敗", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const addDay = () => {
    const newDay = { id: Date.now(), activities: [] };
    setItinerary(prev => ({ ...prev, days: [...prev.days, newDay] }));
    setActiveDay(itinerary.days.length);
  };

  const deleteDay = (index) => {
    if (itinerary.days.length <= 1) return;
    const newDays = itinerary.days.filter((_, i) => i !== index);
    setItinerary(prev => ({ ...prev, days: newDays }));
    setActiveDay(0);
  };

  const addActivity = (dayIndex) => {
    const newAct = { id: Date.now(), time: '12:00', location: '', type: 'spot', note: '', cost: '' };
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities.push(newAct);
    setItinerary(prev => ({ ...prev, days: newDays }));
  };

  const updateActivity = (dayIndex, actId, field, val) => {
    const newDays = [...itinerary.days];
    const idx = newDays[dayIndex].activities.findIndex(a => a.id === actId);
    if (idx !== -1) {
      newDays[dayIndex].activities[idx][field] = val;
      setItinerary(prev => ({ ...prev, days: newDays }));
    }
  };

  const deleteActivity = (dayIndex, actId) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(a => a.id !== actId);
    setItinerary(prev => ({ ...prev, days: newDays }));
  };

  const totalCost = itinerary.days.reduce((s, d) => 
    s + d.activities.reduce((ds, a) => ds + (Number(a.cost) || 0), 0), 0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* 工具列與導覽 */}
        <div className="flex justify-between items-center mb-10 sticky top-4 z-40 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Navigation size={22} />
            </div>
            <div>
              <span className="block font-black text-slate-900 text-sm tracking-tighter uppercase">Travel Planner</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Smart Itinerary</span>
            </div>
          </div>
          <div className="flex gap-3">
            {!isViewMode ? (
              <button 
                onClick={() => setIsViewMode(true)} 
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                <Save size={18} /> 儲存預覽
              </button>
            ) : (
              <>
                <button 
                  onClick={downloadAsImage} 
                  disabled={isDownloading} 
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                >
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />} 下載圖片
                </button>
                <button 
                  onClick={() => setIsViewMode(false)} 
                  className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Edit3 size={18} /> 繼續編輯
                </button>
              </>
            )}
          </div>
        </div>

        {/* 編輯介面 */}
        {!isViewMode ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <header className="space-y-4">
              <input 
                className="text-4xl md:text-6xl font-black w-full bg-transparent border-none focus:ring-0 p-0 placeholder-slate-200 tracking-tighter"
                value={itinerary.title}
                onChange={e => setItinerary({...itinerary, title: e.target.value})}
                placeholder="輸入旅程標題..."
              />
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl text-slate-400 italic resize-none h-16 placeholder-slate-200"
                value={itinerary.description}
                onChange={e => setItinerary({...itinerary, description: e.target.value})}
                placeholder="簡單描述一下這趟旅程吧..."
              />
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* 天數控制 */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">行程天數</h3>
                <div className="flex flex-col gap-3">
                  {itinerary.days.map((_, i) => (
                    <div key={i} className="flex gap-2 group">
                      <button 
                        onClick={() => setActiveDay(i)}
                        className={`flex-1 p-5 rounded-2xl font-bold text-left transition-all flex justify-between items-center ${
                          activeDay === i 
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' 
                          : 'bg-white text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm'
                        }`}
                      >
                        <span>第 {i + 1} 天</span>
                        {activeDay === i && <ChevronRight size={16} />}
                      </button>
                      <button 
                        onClick={() => deleteDay(i)} 
                        className="text-slate-200 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100 p-2"
                      >
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addDay} 
                    className="w-full p-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 font-bold hover:border-indigo-300 hover:text-indigo-400 transition-all bg-white/50"
                  >
                    + 新增天數
                  </button>
                </div>

                <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign size={80} />
                  </div>
                  <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1 block relative z-10">預算總計</span>
                  <div className="text-3xl font-black text-indigo-400 relative z-10">${totalCost.toLocaleString()}</div>
                </div>
              </div>

              {/* 活動列表 */}
              <div className="md:col-span-3 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-base">Day {activeDay + 1}</span>
                    詳細行程
                  </h2>
                </div>

                <div className="space-y-4">
                  {itinerary.days[activeDay].activities.map((act) => (
                    <div key={act.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6 group transition-all hover:shadow-xl hover:border-indigo-100">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="shrink-0 w-32">
                          <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest">時間點</label>
                          <input 
                            type="time" 
                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-4 focus:ring-indigo-500/5"
                            value={act.time}
                            onChange={e => updateActivity(activeDay, act.id, 'time', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest">地點與名稱</label>
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none text-2xl font-bold focus:ring-0 p-0 placeholder-slate-200"
                            placeholder="要去哪裡呢？"
                            value={act.location}
                            onChange={e => updateActivity(activeDay, act.id, 'location', e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={() => deleteActivity(activeDay, act.id)} 
                          className="text-slate-200 hover:text-red-500 transition-colors pt-6"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                        <div>
                          <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest">類別</label>
                          <select 
                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-600"
                            value={act.type}
                            onChange={e => updateActivity(activeDay, act.id, 'type', e.target.value)}
                          >
                            <option value="spot">景點賞玩</option>
                            <option value="food">美食饗宴</option>
                            <option value="transport">交通移動</option>
                            <option value="stay">飯店住宿</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest">預估費用</label>
                          <div className="flex items-center gap-2 bg-slate-50 px-4 rounded-xl">
                            <DollarSign size={14} className="text-slate-400" />
                            <input 
                              type="number" 
                              className="w-full bg-transparent border-none p-3 text-sm font-black focus:ring-0"
                              placeholder="0"
                              value={act.cost}
                              onChange={e => updateActivity(activeDay, act.id, 'cost', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addActivity(activeDay)} 
                    className="w-full py-8 border-2 border-dashed border-indigo-100 text-indigo-500 rounded-[2rem] font-black hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-3 bg-white"
                  >
                    <Plus size={24} />
                    <span className="text-lg">加入行程規劃</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 預覽與匯出介面 */
          <div ref={printRef} className="bg-white p-12 rounded-[3rem] shadow-sm animate-in fade-in duration-700 overflow-hidden">
            <header className="mb-12">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">{itinerary.title || '未命名的旅程'}</h1>
              <p className="text-xl text-slate-400 italic leading-relaxed max-w-2xl">{itinerary.description}</p>
              <div className="flex gap-4 mt-8">
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold text-sm">
                  <Calendar size={16} /> {itinerary.startDate || '未定日期'} ~ {itinerary.endDate || '未定日期'}
                </div>
                {totalCost > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-bold text-sm">
                    <DollarSign size={16} /> 預估總花費: ${totalCost.toLocaleString()}
                  </div>
                )}
              </div>
            </header>

            <div className="space-y-16">
              {itinerary.days.map((day, dayIdx) => (
                <div key={day.id} className="relative">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="bg-indigo-600 text-white px-8 py-2 rounded-full font-black text-lg shadow-xl shadow-indigo-100">
                      第 {dayIdx + 1} 天
                    </div>
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </div>

                  <div className="space-y-8 ml-6 border-l-4 border-slate-50 pl-12 pb-4">
                    {day.activities.map((act) => (
                      <div key={act.id} className="relative bg-slate-50/40 p-6 rounded-3xl border border-transparent hover:border-indigo-50 transition-all group">
                        <div className="absolute -left-[66px] top-8 w-4 h-4 bg-white border-4 border-indigo-500 rounded-full z-10"></div>
                        <div className="flex justify-between items-start gap-8">
                          <div>
                            <span className="text-sm font-black text-indigo-500 font-mono tracking-tighter block mb-1 uppercase">
                              <Clock className="inline mr-1" size={14} /> {act.time}
                            </span>
                            <h3 className="text-2xl font-black text-slate-800">{act.location || '前往下一個地點'}</h3>
                            <p className="text-slate-400 mt-2 text-sm italic">{act.note}</p>
                          </div>
                          {act.cost > 0 && (
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest block mb-1">預算</span>
                              <span className="text-xl font-black text-slate-600">${Number(act.cost).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {day.activities.length === 0 && <p className="text-slate-300 italic py-4">這一天暫時沒有安排行程。</p>}
                  </div>
                </div>
              ))}
            </div>

            <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-200 tracking-[0.4em] font-black uppercase">Generated by Smart Travel Planner AI</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
