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
  Loader2
} from 'lucide-react';

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
      link.download = `${itinerary.title}.png`;
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

  const totalCost = itinerary.days.reduce((s, d) => 
    s + d.activities.reduce((ds, a) => ds + (Number(a.cost) || 0), 0), 0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* 工具列 */}
        <div className="flex justify-between items-center mb-8 sticky top-4 z-40 bg-white/80 backdrop-blur px-6 py-4 rounded-2xl shadow-sm border border-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Navigation size={18} />
            </div>
            <span className="font-black text-slate-400 text-sm tracking-tighter uppercase">Travel Planner</span>
          </div>
          <div className="flex gap-2">
            {!isViewMode ? (
              <button onClick={() => setIsViewMode(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                <Save size={18} /> 儲存預覽
              </button>
            ) : (
              <>
                <button onClick={downloadAsImage} disabled={isDownloading} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2">
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />} 下載圖片
                </button>
                <button onClick={() => setIsViewMode(false)} className="bg-white border px-6 py-2 rounded-full font-bold flex items-center gap-2">
                  <Edit3 size={18} /> 編輯
                </button>
              </>
            )}
          </div>
        </div>

        {/* 編輯區 */}
        {!isViewMode ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
            <input 
              className="text-4xl md:text-5xl font-black w-full bg-transparent border-none focus:ring-0 p-0 placeholder-slate-200"
              value={itinerary.title}
              onChange={e => setItinerary({...itinerary, title: e.target.value})}
              placeholder="輸入行程標題..."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* 天數選單 */}
              <div className="space-y-3">
                {itinerary.days.map((_, i) => (
                  <div key={i} className="flex gap-1 group">
                    <button 
                      onClick={() => setActiveDay(i)}
                      className={`flex-1 p-4 rounded-xl font-bold text-left transition ${activeDay === i ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:bg-blue-50'}`}
                    >
                      Day {i + 1}
                    </button>
                    <button onClick={() => deleteDay(i)} className="text-slate-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button onClick={addDay} className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-300 font-bold">+ 新增天數</button>
              </div>

              {/* 活動編輯 */}
              <div className="md:col-span-3 space-y-4">
                {itinerary.days[activeDay].activities.map(act => (
                  <div key={act.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 group transition hover:shadow-md">
                    <div className="flex gap-4">
                      <input type="time" className="bg-slate-50 border-none rounded-lg p-2 text-sm" value={act.time} onChange={e => updateActivity(activeDay, act.id, 'time', e.target.value)} />
                      <input type="text" className="flex-1 bg-transparent border-none text-xl font-bold focus:ring-0" placeholder="地點名稱" value={act.location} onChange={e => updateActivity(activeDay, act.id, 'location', e.target.value)} />
                    </div>
                    <div className="flex gap-4">
                      <select className="bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-500" value={act.type} onChange={e => updateActivity(activeDay, act.id, 'type', e.target.value)}>
                        <option value="spot">景點</option>
                        <option value="food">美食</option>
                        <option value="transport">交通</option>
                        <option value="stay">住宿</option>
                      </select>
                      <input type="number" className="bg-slate-50 border-none rounded-lg p-2 text-sm w-32" placeholder="費用" value={act.cost} onChange={e => updateActivity(activeDay, act.id, 'cost', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button onClick={() => addActivity(activeDay)} className="w-full py-6 border-2 border-dashed border-blue-100 text-blue-500 rounded-2xl font-bold hover:bg-blue-50 transition">+ 新增行程內容</button>
              </div>
            </div>
          </div>
        ) : (
          <div ref={printRef} className="bg-white p-12 rounded-[2.5rem] shadow-sm animate-in fade-in">
            <h1 className="text-4xl font-black mb-2">{itinerary.title}</h1>
            <p className="text-slate-400 mb-10">{itinerary.description}</p>
            {itinerary.days.map((day, i) => (
              <div key={i} className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black">DAY {i+1}</div>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="space-y-6 ml-4 border-l-2 border-slate-50 pl-8">
                  {day.activities.map(act => (
                    <div key={act.id} className="relative bg-slate-50/50 p-4 rounded-xl">
                      <div className="absolute -left-[41px] top-6 w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-blue-500">{act.time}</span>
                          <h3 className="text-lg font-bold text-slate-800">{act.location || '未命名地點'}</h3>
                          <p className="text-xs text-slate-400 mt-1">{act.note}</p>
                        </div>
                        {act.cost > 0 && <div className="text-sm font-black text-slate-500">${Number(act.cost).toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-10 pt-10 border-t text-center text-[10px] text-slate-200 tracking-widest font-bold uppercase">Generated by AI Travel Planner</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
