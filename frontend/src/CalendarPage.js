import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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
      backgroundColor: item.type === 'followup' ? '#9c8680' : '#E91E63',
      borderColor: item.type === 'followup' ? '#9c8680' : '#E91E63',
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
        appointment_date: start.toISOString(),
        end_date: end.toISOString(),
        note: service,
        type: 'normal'
      }),
    });

    const data = await res.json();

    if (data.error) {
      return alert(data.error);
    }

    // ✅ แจ้งเตือน
    alert("✅ เพิ่มนัดแล้ว");

    // ✅ เคลียร์ฟอร์ม
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

    await fetch(`${API}/appointments/followup-auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: selectedEvent.extendedProps.patient_id,
        base_date: selectedEvent.start
      })
    });

    setSelectedEvent(null);
    fetchData();
  };

  // -----------------------
  // 🔍 FILTER คนไข้
  // -----------------------
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-[#c1acab] text-white p-4 rounded-xl font-bold text-lg shadow">
        📞 วันนี้ต้องติดตาม {todayFollowups} คน
      </div>

      {/* SEARCH */}
      <input
        placeholder="🔍 ค้นหานัด"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="w-full p-3 rounded-xl bg-gray-100 border"
      />

      {/* RESULT SEARCH */}
      {search && (
        <div className="bg-white border rounded-xl p-3">
          {filteredEvents.map(e => (
            <div key={e.id} className="text-sm border-b py-2">
              {e.title}
            </div>
          ))}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleAddEvent} className="bg-white p-4 rounded-xl border shadow space-y-2">

        {/* dropdown */}
        <div className="relative">
          <input
            placeholder="ค้นหาลูกค้า"
            value={patientSearch}
            onChange={(e)=>{
              setPatientSearch(e.target.value);
              setShowDropdown(true);
            }}
            className="border p-2 w-full"
          />

          {showDropdown && (
            <div className="absolute bg-white border w-full max-h-40 overflow-y-auto rounded shadow z-50">
              {filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={()=>{
                    setSelectedPatient(p.id);
                    setPatientSearch(p.name);
                    setShowDropdown(false);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          placeholder="หัตถการ"
          value={service}
          onChange={(e)=>setService(e.target.value)}
          className="border p-2 w-full"
        />

        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border p-2 w-full"/>

        <div className="flex gap-2">
          <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="border p-2 w-full"/>
          <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="border p-2 w-full"/>
        </div>

        <button className="bg-[#9c8680] text-white w-full py-2 rounded">
          ➕ เพิ่มนัด
        </button>
      </form>

      {/* CALENDAR */}
      <div className="bg-white p-4 rounded-xl border h-[600px] shadow relative z-0">
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <div 
              className="bg-white p-6 rounded-xl w-full max-w-md space-y-2 relative z-50"
              onClick={(e)=>e.stopPropagation()}
            >

            <h3 className="font-bold text-lg">📋 รายละเอียด</h3>

            <p>{selectedEvent.title}</p>

            <button onClick={createFollowup} className="bg-blue-500 text-white w-full py-2 rounded">
              📞 ติดตามผล
            </button>

            <button onClick={handleDelete} className="bg-red-500 text-white w-full py-2 rounded">
              🗑 ลบ
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default CalendarPage;