import React, { useState, useEffect } from 'react';

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
    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-[#9c8680]">
        📊 Dashboard คลินิก
      </h1>

      {/* 💰 SALES */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#9c8680] text-white p-6 rounded-2xl shadow">
          <p>💰 วันนี้</p>
          <h2 className="text-3xl font-bold">
            ฿{Number(sales.daily).toLocaleString()}
          </h2>
        </div>

        <div className="bg-[#c1acab] text-white p-6 rounded-2xl shadow">
          <p>📅 เดือนนี้</p>
          <h2 className="text-3xl font-bold">
            ฿{Number(sales.monthly).toLocaleString()}
          </h2>
        </div>

        <div className="bg-gray-800 text-white p-6 rounded-2xl shadow">
          <p>📈 ปีนี้</p>
          <h2 className="text-3xl font-bold">
            ฿{Number(sales.yearly).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border shadow">
          <p className="text-gray-500">👥 ลูกค้าทั้งหมด</p>
          <h2 className="text-2xl font-bold">{patientsCount}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow">
          <p className="text-gray-500">📅 นัดวันนี้</p>
          <h2 className="text-2xl font-bold text-[#9c8680]">
            {todayAppointments}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow">
          <p className="text-gray-500">🔔 ติดตามวันนี้</p>
          <h2 className="text-2xl font-bold text-red-500">
            {todayFollowups}
          </h2>
        </div>
      </div>

      {/* 🔥 คิววันนี้ */}
      <div className="bg-white p-6 rounded-2xl border shadow">
        <h2 className="text-xl font-bold mb-4 text-[#9c8680]">
          📅 คิววันนี้
        </h2>

        {todayQueue.length === 0 && (
          <p className="text-gray-400">ไม่มีคิววันนี้</p>
        )}

        <div className="space-y-3">
          {todayQueue.map(a => (
            <div key={a.id} className="border p-4 rounded-xl flex flex-col md:flex-row justify-between gap-3">

              <div>
                <p className="font-bold">{a.name}</p>
                <p className="text-sm text-gray-500">{a.note || '-'}</p>
                <p className="text-xs">
                  {new Date(a.appointment_date).toLocaleTimeString('th-TH')}
                </p>

                {/* 🔥 แสดงยอดรวม */}
                <p className="text-green-600 font-bold mt-1">
                  💰 รวม: ฿{(savedAmounts[a.id] || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <input
                    type="number"
                    placeholder="จำนวนเงิน"
                    value={amounts[a.id] || ''}
                    onChange={(e) =>
                      setAmounts({
                        ...amounts,
                        [a.id]: e.target.value
                      })
                    }
                    className="border p-2 rounded w-32"
                  />

                <button
                  onClick={() => savePayment(a.id, a.patient_id, amounts[a.id])}
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  💰 บันทึก
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