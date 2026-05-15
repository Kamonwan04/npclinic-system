import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bell,
  Flame,
  Clock,
  CheckCircle,
  CalendarDays,
  PhoneCall,
  Inbox,
  FileText,
  Check
} from 'lucide-react';

//const API = 'https://npclinic-system-production.up.railway.app'; // เปลี่ยนเป็น URL ของ backend ที่ deploy แล้ว
const API = 'http://localhost:3001'; // สำหรับการพัฒนาในเครื่อง

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
        list = list.filter(a =>
          String(a.patient_id) === String(id)
        );
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
  // Helper
  // -----------------------
  const isToday = (date) => {
    if (!date) return false;

    const today = new Date().toISOString().slice(0, 10);

    return new Date(date)
      .toISOString()
      .slice(0, 10) === today;
  };

  const isUpcoming = (date) => {

    if (!date) return false;

    const now = new Date();
    const target = new Date(date);

    const diff =
      (target - now) / (1000 * 60 * 60 * 24);

    return diff > 0 && diff <= 3;
  };

  // -----------------------
  // Mark Done
  // -----------------------
  const markDone = async (followId) => {

    try {

      const res = await fetch(
        `${API}/appointments/${followId}/followup`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'done'
          })
        }
      );

      const data = await res.json();

      console.log('UPDATED:', data);

      fetchFollowups();

    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // Filter
  // -----------------------
  const filtered = followups.filter((f) => {

    if (filter === 'today') {
      return (
        isToday(f.appointment_date) &&
        f.followup_status !== 'done'
      );
    }

    if (filter === 'upcoming') {
      return (
        isUpcoming(f.appointment_date) &&
        f.followup_status !== 'done'
      );
    }

    if (filter === 'done') {
      return f.followup_status === 'done';
    }

    return true;
  });

  // -----------------------
  // Count Today
  // -----------------------
  const todayCount = followups.filter(f =>
    isToday(f.appointment_date) &&
    f.followup_status !== 'done'
  ).length;

  return (

    <div className="space-y-6 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-slate-200 pb-5">

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#771126] flex items-center gap-3">

          <div className="bg-[#F5EDEC] p-2 rounded-xl text-[#C55C6F]">
            <Bell className="w-6 h-6 md:w-7 md:h-7" />
          </div>

          ติดตามผลลูกค้า

        </h2>

        {/* FILTER */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto">

          <button
            onClick={() => setFilter('today')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
            ${filter === 'today'
                ? 'bg-[#C55C6F] text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#771126]'
              }`}
          >
            <Flame className="w-4 h-4" />
            วันนี้
          </button>

          <button
            onClick={() => setFilter('upcoming')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
            ${filter === 'upcoming'
                ? 'bg-[#303030] text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#303030]'
              }`}
          >
            <Clock className="w-4 h-4" />
            ใกล้ถึง
          </button>

          <button
            onClick={() => setFilter('done')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
            ${filter === 'done'
                ? 'bg-slate-200 text-[#303030] shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#303030]'
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            เสร็จแล้ว
          </button>

        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-white border border-[#303030] rounded-xl p-5 shadow-sm">

        <p className="text-[#C55C6F] font-bold text-sm mb-1 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          เคสที่ต้องติดตามวันนี้
        </p>

        <h2 className="text-4xl md:text-5xl font-black text-[#771126] mt-2">
          {todayCount}
          <span className="text-lg md:text-xl font-bold text-[#303030]">
            {' '}คน
          </span>
        </h2>

      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

        {filtered.length === 0 && (

          <div className="md:col-span-2 xl:col-span-3 text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">

            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />

            <p className="text-slate-500 font-bold text-lg">
              ไม่มีรายการติดตามในหมวดหมู่นี้
            </p>

          </div>
        )}

        {filtered.map((f) => (

          <div
            key={f.id}
            className="flex flex-col p-5 rounded-xl border border-[#303030] bg-white shadow-sm hover:shadow-md transition-all group"
          >

            {/* HEADER */}
            <div className="flex justify-between items-start mb-4 gap-2">

              <h3 className="font-extrabold text-xl text-[#771126] line-clamp-1">
                {f.name || 'ไม่ระบุชื่อ'}
              </h3>

              {/* STATUS */}
              {f.followup_status === 'done' ? (

                <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg whitespace-nowrap">
                  <CheckCircle className="w-3.5 h-3.5" />
                  เสร็จสิ้น
                </span>

              ) : isToday(f.appointment_date) ? (

                <span className="flex items-center gap-1.5 text-xs font-bold bg-[#F5EDEC] text-[#C55C6F] px-3 py-1 rounded-lg whitespace-nowrap">
                  <Flame className="w-3 h-3" />
                  วันนี้
                </span>

              ) : (

                <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 text-[#303030] border border-slate-200 px-3 py-1 rounded-lg whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  {
                    f.appointment_date
                      ? new Date(f.appointment_date)
                        .toLocaleDateString(
                          'th-TH',
                          {
                            day: 'numeric',
                            month: 'short'
                          }
                        )
                      : ''
                  }
                </span>

              )}

            </div>

            {/* DETAIL BOX */}
            <div className="bg-[#f8f9fa] border border-slate-200 rounded-lg p-4 mb-5 flex-1">

              {/* PHONE */}
              {f.phone && (

                <div className="mb-4 pb-4 border-b border-slate-200">

                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    เบอร์โทรติดต่อ:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">

                    <span className="font-bold text-[#303030] text-sm">
                      {f.phone}
                    </span>

                  </div>

                </div>
              )}

              {/* NOTE */}
              <div className="mb-4">

                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  หมายเหตุ / หัตถการ:
                </span>

                <p className="font-bold text-[#303030] text-sm">
                  {f.note || '-'}
                </p>

              </div>

              {/* DATE */}
              <div>

                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  วันที่นัดติดตาม:
                </span>

                <p className="font-medium text-slate-600 text-sm">

                  {
                    f.appointment_date
                      ? new Date(f.appointment_date)
                        .toLocaleDateString(
                          'th-TH',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }
                        )
                      : '-'
                  }

                </p>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-auto flex-wrap">

              {/* ประวัติ */}
              <Link
                to={`/patient/${f.patient_id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-300 text-[#303030] hover:bg-slate-50 rounded-lg text-sm font-bold transition-all"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                ประวัติ
              </Link>

              {/* โทร */}
              {f.phone && (
                <a
                  href={`tel:${f.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  โทร
                </a>
              )}

              {/* ติดตามแล้ว */}
              {f.followup_status !== 'done' && (
                <button
                  onClick={() => markDone(f.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#b24f61] hover:bg-[#771126] text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  ติดตามแล้ว
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