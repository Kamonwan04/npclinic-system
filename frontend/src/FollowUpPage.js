import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

const API = 'http://localhost:3001';

function FollowUpPage() {

  const { id } = useParams();

  const [followups, setFollowups] = useState([]);
  const [filter, setFilter] = useState('today');

  // -----------------------
  // โหลดข้อมูล
  // -----------------------
  const fetchFollowups = useCallback(async () => {
    try {
      const res = await fetch(`${API}/appointments`);
      const data = await res.json();

      let list = data.filter(a => a.type === 'followup');

      if (id) {
        list = list.filter(a => String(a.patient_id) === String(id));
      }

      setFollowups(list);

    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  // -----------------------
  // 📅 Helper
  // -----------------------
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date().toISOString().slice(0, 10);
    return new Date(date).toISOString().slice(0, 10) === today;
  };

  const isUpcoming = (date) => {
    if (!date) return false;
    const now = new Date();
    const target = new Date(date);
    const diff = (target - now) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 3;
  };

  // -----------------------
  // ✅ Mark Done (FIX: ไม่มี API → ใช้ PUT appointments ตรงๆ)
  // -----------------------
  const markDone = async (followId) => {
  try {
    const res = await fetch(`${API}/appointments/${followId}/followup`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'done'
      })
    });

    const data = await res.json();
    console.log('UPDATED:', data);

    fetchFollowups();

  } catch (err) {
    console.error(err);
  }
};

  // -----------------------
  // 🎯 Filter
  // -----------------------
  const filtered = followups.filter((f) => {
    if (filter === 'today') {
      return isToday(f.appointment_date) && f.followup_status !== 'done';
    }
    if (filter === 'upcoming') {
      return isUpcoming(f.appointment_date) && f.followup_status !== 'done';
    }
    if (filter === 'done') {
      return f.followup_status === 'done';
    }
    return true;
  });

  // -----------------------
  // 📊 นับจำนวนต่อวัน (ข้อ 7)
  // -----------------------
  const todayCount = followups.filter(f =>
    isToday(f.appointment_date) && f.followup_status !== 'done'
  ).length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-[#9c8680]">
          🔔 ติดตามผลลูกค้า
        </h2>

        <div className="flex bg-[#c1acab]/40 p-1 rounded-xl">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold 
              ${filter === 'today' ? 'bg-white text-[#9c8680] shadow' : 'text-gray-600'}`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold 
              ${filter === 'upcoming' ? 'bg-white text-[#9c8680] shadow' : 'text-gray-600'}`}
          >
            ใกล้ถึง
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold 
              ${filter === 'done' ? 'bg-white text-green-600 shadow' : 'text-gray-600'}`}
          >
            เสร็จแล้ว
          </button>
        </div>
      </div>

      {/* 📊 SUMMARY วันนี้ */}
      <div className="bg-white border rounded-2xl p-4 shadow">
        <p className="text-gray-500">📅 วันนี้ต้องติดตาม</p>
        <h2 className="text-3xl font-bold text-[#9c8680]">
          {todayCount} คน
        </h2>
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-4">

        {filtered.length === 0 && (
          <p className="text-gray-400">ไม่มีรายการ</p>
        )}

        {filtered.map((f) => (
          <div
            key={f.id}
            className="p-5 rounded-2xl border shadow-sm bg-white hover:shadow-md transition"
          >

            {/* 👤 */}
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-[#9c8680]">
                  {f.name || '-'}
                </h3>
              </div>

              <span className="text-xs bg-[#c1acab]/30 px-3 py-1 rounded">
                {f.appointment_date
                  ? new Date(f.appointment_date).toLocaleDateString('th-TH')
                  : '-'}
              </span>
            </div>

            {/* NOTE */}
            <div className="mb-2">
              <span className="text-xs text-gray-500">หมายเหตุ:</span>
              <p className="font-semibold text-[#9c8680]">
                {f.note || '-'}
              </p>
            </div>

            {/* STATUS */}
            <div className="mb-3 text-sm">
              {f.followup_status === 'done'
                ? '✔ ติดตามแล้ว'
                : isToday(f.appointment_date)
                ? '🔥 ต้องติดตามวันนี้'
                : '⏳ ใกล้ถึง'}
            </div>

            {/* ACTION */}
            <div className="flex flex-wrap gap-2">

              <Link
                to={`/patient/${f.patient_id}`}
                className="px-3 py-2 bg-[#c1acab]/40 text-[#9c8680] rounded-xl text-sm font-bold"
              >
                📄 โปรไฟล์
              </Link>

              {f.followup_status !== 'done' && (
                <button
                  onClick={() => markDone(f.id)}
                  className="px-3 py-2 bg-[#9c8680] text-white rounded-xl text-sm font-bold"
                >
                  ✅ ติดตามแล้ว
                </button>
              )}

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default FollowUpPage;