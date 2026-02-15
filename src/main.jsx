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
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

/**
 * 旅遊行程規劃器主要組件
 * 整合了編輯模式與預覽模式，並支援匯出為圖片功能
 */
const App = () => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef(null);

  // 初始行程資料
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

  // 下載行程圖片邏輯
  const downloadAsImage = async () => {
    if (!printRef.current || typeof html2canvas === 'undefined') return;
    
    setIsDownloading(true);
    try {
      // 等待 DOM 渲染穩定
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

  // --- 資料管理邏輯 ---
  const addDay = () => {
    const newDay = { id: Date.now(), activities: [] };
    setItinerary({ ...itinerary, days: [...itinerary.days, newDay] });
    setActiveDay(itinerary.days.length);
  };

  const deleteDay = (index) => {
    if (itinerary.days.length === 1) return;
    const newDays = itinerary.days.filter((_, i) => i !== index);
    setItinerary({ ...itinerary, days: newDays });
    setActiveDay(Math.max(0, index - 1));
  };

  const addActivity = (dayIndex) => {
    const newActivity = { id: Date.now(), time: '12:00', location: '', type: 'spot', note: '', cost: '' };
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities.push(newActivity);
    setItinerary({ ...itinerary, days: newDays });
  };

  const updateActivity = (dayIndex, activityId, field, value) => {
    const newDays = [...itinerary.days];
    const activityIndex = newDays[dayIndex].activities.findIndex(a => a.id === activityId);
    newDays[dayIndex].activities[activityIndex][field] = value;
    setItinerary({ ...itinerary, days: newDays });
  };

  const deleteActivity = (dayIndex, activityId) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(a => a.id !== activityId);
    setItinerary({ ...itinerary, days: newDays });
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

  // --- 子組件：摘要預覽視圖 ---
  const SummaryView = () => (
    <div ref={printRef} className="space-y-12 pb-20 p-8 rounded-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900">{itinerary.title}</h1>
        <p className="text-slate-500 mt-2">{itinerary.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-blue-600">
           <span className="flex items-center gap-1"><Calendar size={14} /> {itinerary.startDate || '未定日期'} ~ {itinerary.endDate || '未定日期'}</span>
           {totalCost > 0 && (
             <span className="flex items-center gap-1"><DollarSign size={14} /> 預估總花費: ${totalCost.toLocaleString()}</span>
           )}
        </div>
      </div>

      {itinerary.days.map((day, dayIdx) => (
        <div key={day.id} className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold shadow-lg">
              Day {dayIdx + 1}
            </div>
            <div className="h-[2px] flex-1 bg-slate-200"></div>
          </div>
          
          <div className="space-y-6 ml-4 border-l-2 border-slate-100 pl-8">
            {day.activities.map((act) => {
              const config = getTypeConfig(act.type);
              const hasCost = act.cost !== '' && Number(act.cost) > 0;
              return (
                <div key={act.id} className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
                  <div className="absolute -left-[41px] top-7 w-4 h-4 rounded-full bg-white border-4 border-blue-500"></div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-blue-500 font-mono">{act.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${config.color} font-medium`}>
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{act.location || '未命名地點'}</h3>
                      <p className="text-slate-500 text-sm italic">{act.note}</p>
                    </div>
                    {hasCost && (
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block uppercase tracking-wider">預算</span>
                        <span className="text-lg font-bold text-slate-700">${Number(act.cost).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {day.activities.length === 0 && <p className="text-slate-400 italic">本日尚無行程</p>}
          </div>
        </div>
      ))}
      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-slate-300 text-xs tracking-widest uppercase">Generated by Travel Planner</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* 工具列導航 */}
        <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md sticky top-4 z-50 p-4 rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Calendar size={16} />
            <span>{itinerary.startDate || '未定日期'} ~ {itinerary.endDate || '未定日期'}</span>
          </div>
          <div className="flex gap-3">
            {!isViewMode ? (
              <button 
                onClick={() => setIsViewMode(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                <Save size={18} />
                <span>儲存並預覽</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={downloadAsImage}
                  disabled={isDownloading}
                  title="匯出為圖片"
                  className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                >
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                  <span>下載圖片</span>
                </button>
                <button 
                  onClick={() => setIsViewMode(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-slate-600 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-all"
                >
                  <Edit3 size={18} />
                  <span>回到編輯</span>
                </button>
              </>
            )}
          </div>
        </div>

        {!isViewMode ? (
          /* 編輯模式 */
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-12">
              <input
                type="text"
                className="text-4xl md:text-5xl font-black block w-full border-none bg-transparent focus:ring-0 p-0 hover:bg-slate-100 rounded px-2 -ml-2 transition-colors"
                value={itinerary.title}
                onChange={(e) => setItinerary({ ...itinerary, title: e.target.value })}
                placeholder="旅程標題"
              />
              <div className="flex gap-4 mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">出發日期</span>
                  <input 
                    type="date" 
                    className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" 
                    value={itinerary.startDate} 
                    onChange={(e) => setItinerary({...itinerary, startDate: e.target.value})}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">結束日期</span>
                  <input 
                    type="date" 
                    className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" 
                    value={itinerary.endDate} 
                    onChange={(e) => setItinerary({...itinerary, endDate: e.target.value})}
                  />
                </div>
              </div>
              <textarea
                className="mt-6 text-slate-500 w-full border-none bg-transparent focus:ring-0 p-0 resize-none h-12 hover:bg-slate-100 rounded px-2 -ml-2 transition-colors"
                value={itinerary.description}
                onChange={(e) => setItinerary({ ...itinerary, description: e.target.value })}
                placeholder="添加關於行程的敘述..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">天數</h3>
                <div className="flex flex-col gap-2">
                  {itinerary.days.map((day, idx) => (
                    <button
                      key={day.id}
                      onClick={() => setActiveDay(idx)}
                      className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeDay === idx ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-bold">Day {idx + 1}</span>
                      {itinerary.days.length > 1 && (
                        <Trash2 
                          size={14} 
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeDay === idx ? 'text-blue-200' : 'text-slate-300 hover:text-red-500'}`}
                          onClick={(e) => { e.stopPropagation(); deleteDay(idx); }}
                        />
                      )}
                    </button>
                  ))}
                  <button onClick={addDay} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center gap-2">
                    <Plus size={18} />
                    <span className="text-sm font-bold">新增天數</span>
                  </button>
                </div>
                
                <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <span className="text-slate-400 text-xs uppercase font-bold tracking-widest">總預算估計</span>
                  <div className="text-3xl font-black mt-1 text-blue-400">${totalCost.toLocaleString()}</div>
                </div>
              </div>

              <div className="md:col-span-3 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-700">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg">Day {activeDay + 1}</span> 行程規劃
                </h2>
                {itinerary.days[activeDay].activities.map((act) => (
                  <div key={act.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 hover:border-blue-200 transition-all">
                    <div className="flex gap-4">
                      <div className="w-24 shrink-0">
                        <input type="time" className="w-full text-sm border-none bg-slate-50 rounded p-2 focus:ring-1 focus:ring-blue-500" value={act.time} onChange={(e) => updateActivity(activeDay, act.id, 'time', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <input type="text" className="w-full text-lg font-bold border-none p-0 focus:ring-0 placeholder-slate-200" placeholder="地點名稱..." value={act.location} onChange={(e) => updateActivity(activeDay, act.id, 'location', e.target.value)} />
                      </div>
                      <button onClick={() => deleteActivity(activeDay, act.id)} className="text-slate-300 hover:text-red-500 self-start"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex gap-4 items-center pt-2">
                      <select className="text-xs bg-slate-100 border-none rounded-lg px-2 py-1.5 font-bold" value={act.type} onChange={(e) => updateActivity(activeDay, act.id, 'type', e.target.value)}>
                        <option value="spot">景點</option>
                        <option value="food">飲食</option>
                        <option value="transport">交通</option>
                        <option value="stay">住宿</option>
                      </select>
                      <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <DollarSign size={14} className="text-green-500" />
                        <input type="number" className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 font-bold" placeholder="預算 (選填)" value={act.cost} onChange={(e) => updateActivity(activeDay, act.id, 'cost', e.target.value)} />
                      </div>
                    </div>
                    <textarea className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0 h-10 resize-none italic" placeholder="備註..." value={act.note} onChange={(e) => updateActivity(activeDay, act.id, 'note', e.target.value)} />
                  </div>
                ))}
                <button onClick={() => addActivity(activeDay)} className="w-full py-4 border-2 border-dashed border-blue-100 text-blue-500 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                  <Plus size={20} />
                  <span>新增行程點</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 預覽模式 */
          <div className="animate-in fade-in duration-500">
            <SummaryView />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;