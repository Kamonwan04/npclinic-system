import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wallet, CalendarDays, TrendingUp, 
  Users, CalendarClock, ClipboardList, BellRing, 
  PhoneCall, ListTodo, Coffee, Clock, 
  Stethoscope, CircleDollarSign, Save
} from 'lucide-react';

const API = 'http://localhost:3001';

function DashboardPage() {
  const [sales, setSales] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [patientsCount, setPatientsCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [todayFollowups, setTodayFollowups] = useState(0);

  const [todayQueue, setTodayQueue] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [savedAmounts, setSavedAmounts] = useState({}); // 🔥 ยอดที่บันทึกแล้ว

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // 💰 SALES
      const salesRes = await fetch(`${API}/sales-summary`);
      const salesData = await salesRes.json();
      setSales(salesData);

      // 👥 PATIENTS
      const patientRes = await fetch(`${API}/patients`);
      const patientData = await patientRes.json();
      setPatientsCount(patientData.length);

      // 📅 APPOINTMENTS
      const apptRes = await fetch(`${API}/appointments`);
      const apptData = await apptRes.json();

      const today = new Date().toISOString().slice(0, 10);

      const todayAppt = apptData.filter(a =>
        a.appointment_date?.slice(0, 10) === today &&
        a.type !== 'followup'
      );

      setTodayAppointments(todayAppt.length);
      setTodayQueue(todayAppt);

      // 🔔 FOLLOWUPS
      const followRes = await fetch(`${API}/followups`);
      const followData = await followRes.json();

      const todayFollow = followData.filter(f =>
        f.appointment_date?.slice(0, 10) === today &&
        f.followup_status !== 'done'
      );

      setTodayFollowups(todayFollow.length);

      // 🔥 โหลดยอดเงินทั้งหมด
      const payRes = await fetch(`${API}/payments`);
      const payData = await payRes.json();

      // 🔥 รวมยอดต่อ patient
      const grouped = {};
        payData.forEach(p => {
          if (!grouped[p.appointment_id]) grouped[p.appointment_id] = 0;
          grouped[p.appointment_id] += Number(p.amount);
        });

      setSavedAmounts(grouped);

    } catch (err) {
      console.error(err);
    }
  };

  // 💰 บันทึกเงิน
  const savePayment = async (appointmentId, patientId, amount) => {
  if (!amount || Number(amount) <= 0) {
    return alert('❌ ใส่จำนวนเงินก่อน');
  }

  try {
    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointment_id: appointmentId,
        patient_id: patientId,
        amount: Number(amount)
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.log(text);
      return alert('❌ บันทึกไม่สำเร็จ');
    }

    alert('✅ บันทึกแล้ว');

    // 🔥 reset ช่อง
    setAmounts(prev => ({
      ...prev,
      [appointmentId]: ''
    }));

    fetchAll();

  } catch (err) {
    console.error(err);
    alert('❌ error');
  }
};

  return (
    <div className="space-y-8 pb-10">

      <h1 className="text-3xl font-extrabold text-slate-800 border-b-2 border-slate-300 pb-3 flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-slate-700" strokeWidth={2.5} />
        Dashboard คลินิก
      </h1>

      {/* 💰 SALES */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#C55C6F] text-white p-7 rounded-3xl shadow-lg border-2 border-[#9a4555] transform transition-transform hover:-translate-y-1">
          <p className="font-semibold text-white/80 text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5" /> ยอดขายวันนี้
          </p>
          <h2 className="text-4xl font-black mt-2 tracking-tight">
            ฿{Number(sales.daily).toLocaleString()}
          </h2>
        </div>

        <div className="bg-[#78A5CE] text-white p-7 rounded-3xl shadow-lg border-2 border-[#5c82a6] transform transition-transform hover:-translate-y-1">
          <p className="font-semibold text-white/80 text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> ยอดขายเดือนนี้
          </p>
          <h2 className="text-4xl font-black mt-2 tracking-tight">
            ฿{Number(sales.monthly).toLocaleString()}
          </h2>
        </div>

        <div className="bg-slate-800 text-white p-7 rounded-3xl shadow-lg border-2 border-slate-900 transform transition-transform hover:-translate-y-1">
          <p className="font-semibold text-slate-300 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> ยอดขายปีนี้
          </p>
          <h2 className="text-4xl font-black mt-2 tracking-tight">
            ฿{Number(sales.yearly).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-3xl border-2 border-slate-300 shadow-md flex justify-between items-center group hover:border-slate-400 transition-colors">
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4" /> ลูกค้าทั้งหมด
            </p>
            <h2 className="text-3xl font-black text-slate-800 mt-1">{patientsCount} <span className="text-base font-medium text-slate-500">คน</span></h2>
          </div>
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-7 rounded-3xl border-2 border-slate-300 shadow-md flex justify-between items-center group hover:border-slate-400 transition-colors">
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <CalendarClock className="w-4 h-4" /> นัดวันนี้
            </p>
            <h2 className="text-3xl font-black text-[#C55C6F] mt-1">{todayAppointments} <span className="text-base font-medium text-slate-500">คิว</span></h2>
          </div>
          <div className="w-12 h-12 bg-[#FCECF0] text-[#C55C6F] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-7 rounded-3xl border-2 border-slate-300 shadow-md flex justify-between items-center group hover:border-slate-400 transition-colors">
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <BellRing className="w-4 h-4" /> ต้องติดตามวันนี้
            </p>
            <h2 className="text-3xl font-black text-rose-600 mt-1">{todayFollowups} <span className="text-base font-medium text-slate-500">เคส</span></h2>
          </div>
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 🔥 คิววันนี้ */}
      <div className="bg-white p-8 rounded-3xl border-2 border-slate-400 shadow-lg">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-slate-600" />
            รายการคิววันนี้
          </h2>
          <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-sm">
            {todayQueue.length} คิว
          </span>
        </div>

        {todayQueue.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center">
            <Coffee className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-lg">ไม่มีคิวที่ต้องจัดการในวันนี้พักผ่อนได้ครับ</p>
          </div>
        )}

        <div className="space-y-4">
          {todayQueue.map(a => (
            <div key={a.id} className="border-2 border-slate-300 p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-5 bg-slate-50 hover:bg-white transition-colors shadow-sm">

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-bold text-lg text-slate-800">{a.name}</p>
                  <span className="flex items-center gap-1.5 bg-white border-2 border-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(a.appointment_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-slate-600 font-medium mb-3 bg-slate-200/50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
                  <Stethoscope className="w-4 h-4 text-slate-500" />
                  หัตถการ: {a.note || 'ไม่ได้ระบุ'}
                </p>

                <div className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                  <CircleDollarSign className="w-5 h-5" /> 
                  ยอดชำระแล้ว: <span className="text-lg">฿{(savedAmounts[a.id] || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* ส่วนกรอกข้อมูลชำระเงิน */}
              <div className="flex gap-3 items-stretch md:items-center bg-white p-3 border-2 border-slate-200 rounded-xl">
                <input
                    type="number"
                    placeholder="ระบุยอดเงิน (฿)"
                    value={amounts[a.id] || ''}
                    onChange={(e) =>
                      setAmounts({
                        ...amounts,
                        [a.id]: e.target.value
                      })
                    }
                    className="border-2 border-slate-400 p-3 rounded-xl w-full md:w-40 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all font-bold text-slate-700"
                  />

                <button
                  onClick={() => savePayment(a.id, a.patient_id, amounts[a.id])}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <Save className="w-5 h-5 hidden sm:inline" />
                  บันทึกยอด
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default DashboardPage;