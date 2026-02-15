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
  Share2,
  Edit3,
  ChevronRight,
  Image as ImageIcon,
  Download,
  Loader2,
  Info
} from 'lucide-react';

/**
 * 智慧旅遊行程規劃器 - 完整整合發佈版
 * 注意：在 Canvas 環境中，請勿手動呼叫 ReactDOM.createRoot，系統會自動處理掛載。
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
      },
      {
        id: 2,
        activities: [
          { id: 4, time: '10:00', location: '新宿御苑', type: 'spot', note: '野餐賞櫻', cost: 500 },
          { id: 5, time: '13:00', location: '一蘭拉麵', type: 'food', note: '午餐', cost: '' }
        ]
      }
    ]
  });

  const [activeDay, setActiveDay] = useState(0);

  // 動態載入 html2canvas 工具庫以支援圖片匯出
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 下載行程圖片功能
  const downloadAsImage = async () => {
    if (!printRef.current || typeof html2canvas === 'undefined') return;
    
    setIsDownloading(true);
    try {
      // 等待 DOM 渲染穩定
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const canvas = await html2canvas(printRef.current, {
        useCORS: true,
        scale: 2, 
        backgroundColor: '#f8fafc',
        logging: false,
      });
      
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `${itinerary.title || '我的行程'}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("圖片產生失敗", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // --- 邏輯操作函數 ---
  const addDay = () => {
    const newDay = { id: Date.now(), activities: [] };
    setItinerary(prev => ({ ...prev, days: [...prev.days, newDay] }));
    setActiveDay(itinerary.days.length);
  };

  const deleteDay = (index) => {
    if (itinerary.days.length === 1) return;
    const newDays = itinerary.days.filter((_, i) => i !== index);
    setItinerary(prev => ({ ...prev, days: newDays }));
    setActiveDay(Math.max(0, index - 1));
  };

  const addActivity = (dayIndex) => {
    const newActivity = { id: Date.now(), time: '12:00', location: '', type: 'spot', note: '', cost: '' };
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities.push(newActivity);
    setItinerary(prev => ({ ...prev, days: newDays }));
  };

  const updateActivity = (dayIndex, activityId, field, value) => {
    const newDays = [...itinerary.days];
    const activityIndex = newDays[dayIndex].activities.findIndex(a => a.id === activityId);
    if (activityIndex !== -1) {
      newDays[dayIndex].activities[activityIndex][field] = value;
      setItinerary(prev => ({ ...prev, days: newDays }));
    }
  };

  const deleteActivity = (dayIndex, activityId) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(a => a.id !== activityId);
    setItinerary(prev => ({ ...prev, days: newDays }));
  };

  const totalCost = itinerary.days.reduce((sum, day) => 
    sum + day.activities.reduce((dSum, act) => dSum + (Number(act.cost) || 0), 0), 0
  );

  const getTypeConfig = (type) => {
    const configs = {
      spot: { label: '景點', icon: <Camera size={16} />, color: 'bg-purple-100 text-purple-600' },
      food: { label: '飲食', icon: <Utensils size={16} />, color: 'bg-orange-100 text-orange-600' },
      transport: { label: '交通', icon: <Navigation size={16} />, color: 'bg-blue-100 text-blue-600' },
      stay: { label: '住宿', icon: <Hotel size={16} />, color: 'bg-green-100 text-green-600' },
    };
    return configs[type] || configs.spot;
  };

  // --- 預覽模式介面組件 ---
  const SummaryView = () => (
    <div ref={printRef} className="space-y-12 pb-20 p-8 rounded-3xl bg-slate-50">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 leading-tight">{itinerary.title || '我的旅程'}</h1>
        <p className="text-slate-500 mt-3 text-lg leading-relaxed">{itinerary.description}</p>
        <div className="flex flex-wrap gap-4 mt-8 text-sm font-bold">
           <span className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full ring-1 ring-blue-100">
             <Calendar size={14} /> {itinerary.startDate || '未定日期'} ~ {itinerary.endDate || '未定日期'}
           </span>
           {totalCost > 0 && (
             <span className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-1.5 rounded-full ring-1 ring-green-100">
               <DollarSign size={14} /> 預估總花費: ${totalCost.toLocaleString()}
             </span>
           )}
        </div>
      </div>

      {itinerary.days.map((day, dayIdx) => (
        <div key={day.id} className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-xl shadow-blue-100">
              Day {dayIdx + 1}
            </div>
            <div className="h-[2px] flex-1 bg-slate-200"></div>
          </div>
          
          <div className="space-y-8 ml-4 border-l-2 border-slate-100 pl-10 pb-6">
            {day.activities.map((act) => {
              const config = getTypeConfig(act.type);
              const hasCost = act.cost !== '' && Number(act.cost) > 0;
              return (
                <div key={act.id} className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-50 transition-all hover:shadow-md">
                  <div className="absolute -left-[49px] top-8 w-4 h-4 rounded-full bg-white border-4 border-blue-500 z-10"></div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-blue-500 font-mono flex items-center gap-1">
                          <Clock size={14} /> {act.time}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${config.color} font-black uppercase flex items-center gap-1 shadow-sm`}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{act.location || '未命名地點'}</h3>
                      <p className="text-slate-500 mt-2 text-sm italic leading-relaxed">{act.note}</p>
                    </div>
                    {hasCost && (
                      <div className="text-right shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[120px]">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest mb-1">費用預算</span>
                        <span className="text-xl font-black text-slate-700">${Number(act.cost).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {day.activities.length === 0 && <p className="text-slate-400 italic py-4">本日尚無行程規劃</p>}
          </div>
        </div>
      ))}
      <div className="text-center pt-12 border-t border-slate-100">
        <p className="text-slate-300 text-[10px] tracking-[0.3em] font-bold uppercase">Travel Planner AI</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 selection:bg-blue-100">
      <div className="max-w-4xl mx-auto">
        
        {/* 功能導覽列 */}
        <div className="flex justify-between items-center mb-10 bg-white/90 backdrop-blur-md sticky top-6 z-50 p-4 rounded-3xl border border-white shadow-sm">
          <div className="flex items-center gap-3 px-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Navigation size={20} fill="currentColor" />
            </div>
            <span className="text-sm font-black tracking-widest text-slate-400 uppercase">Planner</span>
          </div>
          <div className="flex gap-3">
            {!isViewMode ? (
              <button 
                onClick={() => setIsViewMode(true)}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                <Save size={18} />
                <span>儲存預覽</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={downloadAsImage}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                  <span>下載圖片</span>
                </button>
                <button 
                  onClick={() => setIsViewMode(false)}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <Edit3 size={18} />
                  <span>回到編輯</span>
                </button>
              </>
            )}
          </div>
        </div>

        {!isViewMode ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            {/* 標題與日期 */}
            <div className="mb-12">
              <input
                type="text"
                className="text-4xl md:text-6xl font-black block w-full border-none bg-transparent focus:ring-0 p-0 hover:bg-white/40 rounded-xl px-2 -ml-2 transition-all placeholder-slate-200 tracking-tighter"
                value={itinerary.title}
                onChange={(e) => setItinerary(prev => ({ ...prev, title: e.target.value }))}
                placeholder="我的旅行標題"
              />
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 ml-1 tracking-widest">開始日期</span>
                  <input 
                    type="date" 
                    className="bg-white border-none rounded-xl px-5 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={itinerary.startDate} 
                    onChange={(e) => setItinerary(prev => ({...prev, startDate: e.target.value}))}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 ml-1 tracking-widest">結束日期</span>
                  <input 
                    type="date" 
                    className="bg-white border-none rounded-xl px-5 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={itinerary.endDate} 
                    onChange={(e) => setItinerary(prev => ({...prev, endDate: e.target.value}))}
                  />
                </div>
              </div>
              <textarea
                className="mt-8 text-slate-500 w-full border-none bg-transparent focus:ring-0 p-0 resize-none h-16 hover:bg-white/40 rounded-xl px-2 -ml-2 transition-all text-xl italic leading-relaxed placeholder-slate-200"
                value={itinerary.description}
                onChange={(e) => setItinerary(prev => ({ ...prev, description: e.target.value }))}
                placeholder="寫下關於旅程的一些期待..."
              />
            </div>

            {/* 天數導覽與編輯區 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">行程天數</h3>
                <div className="flex flex-col gap-3">
                  {itinerary.days.map((day, idx) => (
                    <div key={day.id} className="flex gap-2 group">
                      <button
                        onClick={() => setActiveDay(idx)}
                        className={`flex-1 p-4 rounded-2xl font-bold transition-all text-left flex items-center justify-between ${
                          activeDay === idx ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <span>Day {idx + 1}</span>
                        {activeDay === idx && <ChevronRight size={16} />}
                      </button>
                      {itinerary.days.length > 1 && (
                        <button 
                          onClick={() => deleteDay(idx)}
                          className="px-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={addDay} 
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all font-bold text-sm bg-white/40"
                  >
                    + 新增天數
                  </button>
                </div>
                
                <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign size={80} />
                  </div>
                  <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest relative z-10 mb-2 block">預算總金額</span>
                  <div className="text-4xl font-black text-blue-400 relative z-10">${totalCost.toLocaleString()}</div>
                </div>
              </div>

              {/* 活動編輯區 */}
              <div className="md:col-span-3 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-slate-700 flex items-center gap-3">
                    <span className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl shadow-inner">Day {activeDay + 1}</span> 
                    詳細規劃
                  </h2>
                </div>
                
                {itinerary.days[activeDay].activities.map((act) => (
                  <div key={act.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6 hover:border-blue-200 hover:shadow-xl transition-all group">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-32 shrink-0">
                        <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest tracking-tighter">時間點</label>
                        <input 
                          type="time" 
                          className="w-full text-sm border-none bg-slate-50 rounded-xl p-3 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                          value={act.time} 
                          onChange={(e) => updateActivity(activeDay, act.id, 'time', e.target.value)} 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest tracking-tighter">活動或地點</label>
                        <input 
                          type="text" 
                          className="w-full text-2xl font-bold border-none bg-transparent p-0 focus:ring-0 placeholder-slate-200" 
                          placeholder="地點、名稱或交通工具..." 
                          value={act.location} 
                          onChange={(e) => updateActivity(activeDay, act.id, 'location', e.target.value)} 
                        />
                      </div>
                      <button 
                        onClick={() => deleteActivity(activeDay, act.id)} 
                        className="text-slate-200 hover:text-red-500 transition-colors pt-6 shrink-0"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                      <div>
                        <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest tracking-tighter">行程類別</label>
                        <select 
                          className="w-full text-xs bg-slate-100 border-none rounded-xl px-4 py-3 font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                          value={act.type} 
                          onChange={(e) => updateActivity(activeDay, act.id, 'type', e.target.value)}
                        >
                          <option value="spot">景點賞玩</option>
                          <option value="food">美食饗宴</option>
                          <option value="transport">交通移動</option>
                          <option value="stay">飯店住宿</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-300 mb-2 block uppercase tracking-widest tracking-tighter">費用預算 (選填)</label>
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-transparent focus-within:border-green-200 focus-within:ring-4 focus-within:ring-green-500/10 transition-all">
                          <DollarSign size={16} className="text-green-500" />
                          <input 
                            type="number" 
                            className="bg-transparent border-none p-0 text-base w-full focus:ring-0 font-black text-slate-700 placeholder-slate-300" 
                            placeholder="0" 
                            value={act.cost} 
                            onChange={(e) => updateActivity(activeDay, act.id, 'cost', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                    <textarea 
                      className="w-full text-sm text-slate-400 bg-transparent border-none p-0 focus:ring-0 h-10 resize-none italic placeholder-slate-200" 
                      placeholder="這裡可以添加一些小提醒..." 
                      value={act.note} 
                      onChange={(e) => updateActivity(activeDay, act.id, 'note', e.target.value)} 
                    />
                  </div>
                ))}
                
                <button 
                  onClick={() => addActivity(activeDay)} 
                  className="w-full py-6 border-2 border-dashed border-blue-100 text-blue-500 rounded-[2rem] font-black hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-3 bg-white shadow-sm"
                >
                  <Plus size={24} />
                  <span className="text-lg">新增行程內容</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <SummaryView />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
