import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  PhoneCall, 
  Search, 
  CalendarPlus, 
  ClipboardList, 
  Trash2,
  Users
} from 'lucide-react';

const API = 'http://localhost:3001';

function CalendarPage() {

  const [events, setEvents] = useState([]);
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState('');

  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');

  const [selectedEvent, setSelectedEvent] = useState(null);

  // -----------------------
  // โหลดข้อมูล
  // -----------------------
  const fetchData = useCallback(async () => {

    const patientRes = await fetch(`${API}/patients`);
    const patientData = await patientRes.json();
    setPatients(patientData);

    const res = await fetch(`${API}/appointments`);
    const data = await res.json();

    const formatted = data.map(item => ({
      id: item.id,
      title: `${item.name || ''} - ${item.note || ''}`,
      start: item.appointment_date,
      end: item.end_date || item.appointment_date,
      // สี Event ในปฏิทิน: ชมพูตุ่น(#C55C6F) นัดปกติ, แดงมารูน(#771126) ติดตามผล
      backgroundColor: item.type === 'followup' ? '#771126' : '#C55C6F',
      borderColor: item.type === 'followup' ? '#501012' : '#C55C6F',
      extendedProps: {
        patient_id: item.patient_id,
        type: item.type,
        note: item.note
      }
    }));

    setEvents(formatted);

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -----------------------
  // 🔥 วันนี้ต้อง followup กี่คน
  // -----------------------
  const todayFollowups = events.filter(e => {
    const d1 = new Date(e.start).toDateString();
    const d2 = new Date().toDateString();
    return d1 === d2 && e.extendedProps.type === 'followup';
  }).length;

  // -----------------------
  // 🔍 filter event
  // -----------------------
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  // -----------------------
  // กันเวลาซ้อน (เฉพาะ normal)
  // -----------------------
  const isOverlapping = (newStart, newEnd) => {
    return events.some(event => {
      if (event.extendedProps.type === 'followup') return false;
      const existStart = new Date(event.start);
      const existEnd = new Date(event.end);
      return newStart < existEnd && newEnd > existStart;
    });
  };

  // -----------------------
  // เพิ่มนัด
  // -----------------------
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!selectedPatient) return alert("เลือกคนไข้");

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (isOverlapping(start, end)) {
      return alert("❌ เวลาซ้อน");
    }

    try {
      const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient,
          aappointment_date: start,
          end_date: end,
          note: service,
          type: 'normal'
        }),
      });

      const data = await res.json();

      if (data.error) {
        return alert(data.error);
      }

      alert("✅ เพิ่มนัดแล้ว");

      setSelectedPatient('');
      setPatientSearch('');
      setService('');
      setDate('');
      setStartTime('11:00');
      setEndTime('12:00');

      fetchData();

    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // ลบ
  // -----------------------
  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (!window.confirm("ลบจริง?")) return;

    await fetch(`${API}/appointments/${selectedEvent.id}`, {
      method: 'DELETE'
    });

    setSelectedEvent(null);
    fetchData();
  };

  // -----------------------
  // 🔥 FOLLOWUP
  // -----------------------
  const createFollowup = async () => {

  try {

    const res = await fetch(`${API}/appointments/followup-auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: selectedEvent.extendedProps.patient_id,
        base_date: selectedEvent.start
      })
    });

    const data = await res.json();

    if (data.error) {
      return alert(data.error);
    }

    alert('✅ สร้างนัดติดตามแล้ว');

    setSelectedEvent(null);

    fetchData();

  } catch (err) {

    console.error(err);

    alert('❌ สร้างนัดไม่สำเร็จ');

  }
};

  // -----------------------
  // 🔍 FILTER คนไข้
  // -----------------------
  const filteredPatients = patients.filter(p =>
  `${p.name || ''} ${p.lastname || ''}`
    .toLowerCase()
    .includes(patientSearch.toLowerCase())
);

  return (
    <div className="space-y-6">

      {/* HEADER: โทนสว่าง คลีนๆ สไตล์คลินิก */}
      <div className="bg-[#F5EDEC] text-[#771126] border-2 border-[#771126]/20 p-5 rounded-2xl font-bold text-lg flex items-center gap-4">
        <div className="bg-[#C55C6F] p-2.5 rounded-xl text-white shadow-sm">
          <PhoneCall className="w-6 h-6" />
        </div>
        วันนี้ต้องติดตามผลทั้งหมด {todayFollowups} คน
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#C55C6F] transition-colors" />
        </div>
        <input
          placeholder="ค้นหานัดหมายในระบบ..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-400 focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all text-[#303030] font-medium placeholder-slate-400"
        />
      </div>

      {/* RESULT SEARCH */}
      {search && (
        <div className="bg-white border border-slate-300 rounded-xl p-2 shadow-lg max-h-60 overflow-y-auto">
          {filteredEvents.length > 0 ? filteredEvents.map(e => (
            <div key={e.id} className="text-sm border-b border-slate-100 p-3 font-medium text-[#303030] hover:bg-[#F5EDEC] hover:text-[#771126] rounded-lg cursor-pointer transition-colors last:border-0">
              {e.title}
            </div>
          )) : <div className="text-sm text-slate-400 py-4 text-center">ไม่พบผลลัพธ์ที่ค้นหา</div>}
        </div>
      )}

      {/* FORM: ดีไซน์ขอบชัด Label แดงมารูนเหมือนรูป UI */}
      <form onSubmit={handleAddEvent} className="bg-white p-7 rounded-2xl border-2 border-[#303030] space-y-6">
        
        <h2 className="font-extrabold text-xl pb-2 border-b-2 border-slate-100 mb-6 flex items-center gap-2 text-[#771126]">
          <CalendarPlus className="w-6 h-6" strokeWidth={2.5} />
          เพิ่มนัดหมายใหม่
        </h2>

        {/* dropdown */}
        <div className="relative">
          <label className="block text-sm font-bold text-[#771126] mb-2">ชื่อ - นามสกุลลูกค้า</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <input
              placeholder="ระบุชื่อเพื่อค้นหา"
              value={patientSearch}
              onChange={(e)=>{
                setPatientSearch(e.target.value);
                setShowDropdown(true);
              }}
              className="border border-slate-400 bg-white p-3 pl-11 w-full rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030] placeholder-slate-400"
            />
          </div>

          {showDropdown && (
            <div className="absolute top-[80px] left-0 bg-white border border-slate-300 w-full max-h-48 overflow-y-auto rounded-xl shadow-xl z-50 p-2">
              {filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={()=>{
                    setSelectedPatient(p.id);
                    setPatientSearch(`${p.name} ${p.lastname || ''}`);
                    setShowDropdown(false);
                  }}
                  className="p-3 hover:bg-[#F5EDEC] hover:text-[#771126] rounded-lg cursor-pointer font-bold text-[#303030] transition-colors"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#771126] mb-2">หัตถการ / บริการ</label>
          <input
            placeholder="เช่น โบท็อกซ์, เลเซอร์, ทรีตเมนต์"
            value={service}
            onChange={(e)=>setService(e.target.value)}
            className="border border-slate-400 bg-white p-3 w-full rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030] placeholder-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-[#771126] mb-2">วันที่นัดหมาย</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e)=>setDate(e.target.value)} 
              className="border border-slate-400 bg-white p-3 w-full rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#771126] mb-2">ช่วงเวลา</label>
            <div className="flex gap-2 items-center">
              <input 
                type="time" 
                value={startTime} 
                onChange={(e)=>setStartTime(e.target.value)} 
                className="border border-slate-400 bg-white p-3 w-full rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030]"
              />
              <span className="font-bold text-slate-400">-</span>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e)=>setEndTime(e.target.value)} 
                className="border border-slate-400 bg-white p-3 w-full rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030]"
              />
            </div>
          </div>
        </div>

        <button className="bg-[#C55C6F] hover:bg-[#771126] text-white font-bold w-full py-4 rounded-xl transition-all mt-2 text-lg shadow-sm">
          บันทึกนัดหมาย
        </button>
      </form>

      {/* CALENDAR */}
      <div className="bg-white p-6 rounded-2xl border-2 border-[#303030] h-[600px] relative z-0">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          eventClick={(info)=>setSelectedEvent(info.event)}
          locale="th"
          slotMinTime="10:00:00"
          slotMaxTime="22:00:00"
          height="100%"
        />
      </div>

      {/* MODAL */}
      {selectedEvent && (
          <div 
            className="fixed inset-0 bg-[#303030]/60 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={() => setSelectedEvent(null)}
          >
            <div 
              className="bg-white p-8 rounded-2xl border-2 border-[#303030] w-full max-w-md space-y-6 relative z-50 shadow-2xl transform transition-all"
              onClick={(e)=>e.stopPropagation()}
            >

            <h3 className="font-extrabold text-xl text-[#771126] border-b-2 border-slate-100 pb-4 flex items-center gap-2">
              <ClipboardList className="w-6 h-6" strokeWidth={2.5} />
              รายละเอียดนัดหมาย
            </h3>

            <div className="bg-[#F5EDEC] p-5 rounded-xl border border-[#C55C6F]/30">
              <p className="font-bold text-lg text-[#303030]">{selectedEvent.title}</p>
              <p className="text-sm font-medium text-[#771126] mt-2">
                ประเภท: {selectedEvent.extendedProps.type === 'followup' ? 'ติดตามผล' : 'นัดหมายปกติ'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={createFollowup} className="flex items-center justify-center gap-2 bg-[#771126] hover:bg-[#501012] text-white font-bold w-full py-3.5 rounded-xl transition-all">
                <PhoneCall className="w-5 h-5" /> สร้างนัดติดตาม
              </button>

              <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-white border border-slate-400 hover:bg-[#303030] hover:text-white text-[#303030] font-bold w-full py-3.5 rounded-xl transition-all group">
                <Trash2 className="w-5 h-5 group-hover:text-white text-slate-500" /> ลบ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CalendarPage;