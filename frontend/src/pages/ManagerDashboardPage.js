import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import ไอคอนจาก lucide-react
import { 
  Crown, 
  Wallet, 
  CheckCircle, 
  Save, 
  History, 
  Plus, 
  Trash2 
} from 'lucide-react';

const API = 'http://localhost:3001';

function ManagerDashboardPage() {
  const navigate = useNavigate();

  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [data, setData] = useState([]);
  const [hourRate, setHourRate] = useState('');
  const [hours, setHours] = useState('');

  const [items, setItems] = useState([
    {
      procedure: '',
      sales: '',
      percent: '',
    }
  ]);

  // [Manager Only]
  useEffect(() => {
    if (localStorage.getItem('role') !== 'manager') {
      navigate('/');
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/doctor-income`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  // [เพิ่มรายการ]
  const addItem = () => {
    setItems([
      ...items,
      {
        procedure: '',
        sales: '',
        percent: '',
      }
    ]);
  };

  // [แก้ค่า]
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // [ลบรายการ]
  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // [รวมยอดขาย]
  const totalSales = items.reduce(
    (sum, item) => sum + Number(item.sales || 0),
    0
  );

  // [รวม DF]
  const totalDF = items.reduce((sum, item) => {
    const sales = Number(item.sales || 0);
    const percent = Number(item.percent || 0);
    return sum + (sales * percent / 100);
  }, 0);

  // [รวมค่าชั่วโมง]
  const totalHR = Number(hourRate || 0) * Number(hours || 0);

  // [DF + HR]
  const dfhr = totalDF + totalHR;

  // [หัก 3%]
  const wht = dfhr * 0.03;

  // [หมอได้รับ]
  const doctorReceive = dfhr - wht;

  // [SAVE]
  const saveData = async () => {
    const payload = {
      doctor_name: doctorName,
      date,
      time_start: timeStart,
      time_end: timeEnd,
      hour_rate: Number(hourRate),
      hours: Number(hours),
      total_hr: totalHR,
      total_df: totalDF,
      dfhr,
      wht,
      doctor_receive: doctorReceive,
      total_sales: totalSales,
      items
    };

    try {
      const res = await fetch(`${API}/doctor-income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert('[เกิดข้อผิดพลาด] บันทึกไม่สำเร็จ');
        return;
      }

      alert('[สำเร็จ] บันทึกสำเร็จ');
      setDoctorName('');
      setDate('');
      setTimeStart('');
      setTimeEnd('');
      setHourRate('');
      setHours('');

      setItems([
        {
          procedure: '',
          sales: '',
          percent: '',
        }
      ]);
      fetchData();

    } catch (err) {
      console.error(err);
      alert('[ระบบขัดข้อง] ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  const formatMoney = (num) => {
    return Number(num || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="min-h-screen pb-12 pt-6 px-4 md:px-10 space-y-8 bg-slate-50 text-slate-800 font-sans selection:bg-slate-300">
      
      {/* PAGE TITLE */}
      <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-300 pb-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Crown className="w-10 h-10 text-amber-500" /> Manager Portal <span className="text-slate-400 font-medium text-2xl">| Doctor DF Report</span>
        </h1>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-300 p-8 grid md:grid-cols-4 gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>
        
        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">ชื่อแพทย์</label>
          <input
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-300 text-slate-800 p-3.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-bold placeholder-slate-400"
            placeholder="ระบุชื่อแพทย์..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">วันที่เข้าเวร</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-300 text-slate-800 p-3.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">เวลาเริ่มงาน</label>
          <input
            type="time"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-300 text-slate-800 p-3.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">เวลาสิ้นสุด</label>
          <input
            type="time"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-300 text-slate-800 p-3.5 rounded-xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-bold"
          />
        </div>
      </div>
     
      {/* TABLE CARD */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-white border-b-2 border-slate-900">
              <tr>
                <th className="p-4 font-bold tracking-wider uppercase text-sm">รายการหัตถการ</th>
                <th className="p-4 font-bold tracking-wider uppercase text-sm w-40">ราคาขาย (฿)</th>
                <th className="p-4 font-bold tracking-wider uppercase text-sm w-32">DF (%)</th>
                <th className="p-4 font-bold tracking-wider uppercase text-sm text-center w-40">ค่า DF (฿)</th>
                <th className="p-4 font-bold tracking-wider uppercase text-sm text-center w-32">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const sales = Number(item.sales || 0);
                const percent = Number(item.percent || 0);
                const df = sales * percent / 100;

                return (
                  <tr key={index} className="border-b-2 border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <input
                        value={item.procedure}
                        onChange={(e) => updateItem(index, 'procedure', e.target.value)}
                        placeholder="กรอกชื่อรายการ..."
                        className="w-full bg-white border-2 border-slate-300 p-3 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium text-slate-800 placeholder-slate-400"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={item.sales}
                        onChange={(e) => updateItem(index, 'sales', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border-2 border-slate-300 p-3 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium text-slate-800 text-right placeholder-slate-400"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={item.percent}
                        onChange={(e) => updateItem(index, 'percent', e.target.value)}
                        placeholder="%"
                        className="w-full bg-white border-2 border-slate-300 p-3 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium text-slate-800 text-center placeholder-slate-400"
                      />
                    </td>
                    <td className="p-4 text-center font-black text-emerald-600 text-lg">
                      {formatMoney(df)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeItem(index)}
                        className="flex items-center justify-center gap-1.5 w-full bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 px-4 py-2.5 rounded-xl transition-all font-bold shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" /> ลบ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-slate-100 border-t-2 border-slate-300">
          <button
            onClick={addItem}
            className="text-slate-700 border-2 border-slate-300 bg-white hover:bg-slate-800 hover:text-white hover:border-slate-800 px-6 py-3 rounded-xl transition-all font-bold shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> เพิ่มรายการใหม่
          </button>
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-300 p-8 space-y-8">
        
        {/* รวมยอดขาย */}
        <div className="flex justify-between items-center text-xl border-b-2 border-slate-200 pb-5">
          <p className="font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Wallet className="w-6 h-6 text-slate-500" /> รวมยอดขายทั้งหมด
          </p>
          <p className="font-black text-slate-800 text-2xl">
            ฿{formatMoney(totalSales)}
          </p>
        </div>

        {/* ชั่วโมง */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 shadow-inner">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">ค่าชั่วโมง (เรท/ชม.)</label>
            <input
              type="number"
              value={hourRate}
              onChange={(e) => setHourRate(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 text-slate-800 p-3.5 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-bold text-lg"
              placeholder="0.00"
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 shadow-inner">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">จำนวนชั่วโมงที่ทำ</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 text-slate-800 p-3.5 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-bold text-lg"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* สรุป */}
        <div className="space-y-4 pt-4 bg-slate-50 p-8 rounded-3xl border-2 border-slate-200">
          <div className="flex justify-between items-center text-slate-600">
            <p className="font-bold text-lg">รวมค่าหัตถการ (DF)</p>
            <p className="font-black text-blue-600 text-xl">฿{formatMoney(totalDF)}</p>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <p className="font-bold text-lg">รวมค่าการันตีชั่วโมง (HR)</p>
            <p className="font-black text-amber-600 text-xl">฿{formatMoney(totalHR)}</p>
          </div>

          <div className="flex justify-between items-center text-xl border-t-2 border-dashed border-slate-300 pt-5">
            <p className="font-extrabold text-slate-800">ยอดรวมก่อนหักภาษี (DF + HR)</p>
            <p className="font-black text-indigo-600 text-2xl">฿{formatMoney(dfhr)}</p>
          </div>

          <div className="flex justify-between items-center text-slate-600 pb-2">
            <p className="font-bold text-lg text-rose-600">หักภาษี ณ ที่จ่าย 3%</p>
            <p className="font-black text-rose-600 text-xl">- ฿{formatMoney(wht)}</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 text-white p-6 rounded-2xl shadow-md border-2 border-slate-600 mt-6 gap-4">
            <p className="font-black text-xl md:text-2xl uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-7 h-7 text-emerald-400" /> ยอดสุทธิที่แพทย์ได้รับ
            </p>
            <p className="font-black text-emerald-400 text-3xl md:text-4xl drop-shadow-md">
              ฿{formatMoney(doctorReceive)}
            </p>
          </div>
        </div>

        <button
          onClick={saveData}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-b-4 border-black/50 flex justify-center items-center gap-3"
        >
          <Save className="w-6 h-6" /> บันทึกข้อมูลเข้าระบบ
        </button>
      </div>

      {/* HISTORY CARD */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-300 p-8 mt-12">
        <h2 className="text-3xl font-black mb-8 text-slate-800 flex items-center gap-3 border-b-2 border-slate-200 pb-4">
          <History className="w-8 h-8 text-slate-700" /> ประวัติรายการ (History)
        </h2>

        {data.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-slate-500 font-bold text-lg">ยังไม่มีข้อมูลประวัติในระบบ</p>
          </div>
        )}

        <div className="space-y-8">
          {data.map((d, index) => (
            <div key={index} className="bg-slate-50 border-2 border-slate-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              
              {/* แถบสีตกแต่งด้านซ้าย */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-slate-800 group-hover:bg-indigo-600 transition-colors"></div>
              
              {/* HEADER ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-4 border-b-2 border-slate-200 pl-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">ชื่อแพทย์</p>
                  <p className="font-black text-slate-800 text-xl">{d.doctor_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">วันที่</p>
                  <p className="font-bold text-slate-700 text-lg">{new Date(d.date).toLocaleDateString('th-TH')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">เวลา</p>
                  <p className="font-bold text-slate-700 text-lg">{d.time_start} - {d.time_end}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">ยอดรับสุทธิ</p>
                  <p className="font-black text-emerald-600 text-2xl">฿{formatMoney(d.doctor_receive)}</p>
                </div>
              </div>

              {/* รายการ */}
              <div className="overflow-x-auto mb-6 bg-white rounded-2xl p-5 border-2 border-slate-200 ml-4">
                <table className="w-full">
                  <thead className="text-sm text-slate-500 border-b-2 border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 text-left font-bold">รายการหัตถการ</th>
                      <th className="pb-3 text-right font-bold w-32">ราคา (฿)</th>
                      <th className="pb-3 text-center font-bold w-24">DF (%)</th>
                      <th className="pb-3 text-right font-bold w-32">ค่า DF (฿)</th>
                    </tr>
                  </thead>
                  <tbody className="text-base font-bold text-slate-700">
                    {Array.isArray(d.items) && d.items.map((item, i) => {
                      const sales = Number(item.sales || 0);
                      const percent = Number(item.percent || 0);
                      const df = sales * percent / 100;

                      return (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 text-slate-800">{item.procedure}</td>
                          <td className="py-4 text-right">฿{formatMoney(sales)}</td>
                          <td className="py-4 text-center text-slate-500">{percent}%</td>
                          <td className="py-4 text-right text-blue-600">฿{formatMoney(df)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY FOOTER */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-4">
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รวมยอดขาย</p>
                  <p className="font-black text-slate-800 text-xl">฿{formatMoney(d.total_sales)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">รวมหัตถการ (DF)</p>
                  <p className="font-black text-blue-600 text-xl">฿{formatMoney(d.total_df)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ยอดก่อนหัก (DF+HR)</p>
                  <p className="font-black text-indigo-600 text-xl">฿{formatMoney(d.dfhr)}</p>
                </div>
                <div className="bg-rose-50 p-5 rounded-2xl border-2 border-rose-200 shadow-sm">
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">หักภาษี 3%</p>
                  <p className="font-black text-rose-600 text-xl">- ฿{formatMoney(d.wht)}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboardPage;