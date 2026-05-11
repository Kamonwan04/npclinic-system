import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  AlertCircle, 
  HelpCircle, 
  MessageSquare, 
  Syringe, 
  FileText, 
  Camera, 
  CalendarPlus, 
  CalendarDays, 
  Trash2 
} from 'lucide-react';

const API = 'http://localhost:3001';

function PatientProfilePage() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);

  const [treatment, setTreatment] = useState('');
  const [description, setDescription] = useState('');
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);
  const [nextDate, setNextDate] = useState('');
  const [nextNote, setNextNote] = useState('');

  // -----------------------
  // โหลดข้อมูล
  // -----------------------
  const fetchPatientDetail = useCallback(async () => {
    try {
      const res = await fetch(`${API}/patients/${id}`);

      if (!res.ok) {
        console.error("❌ ไม่มี API /patients/:id");
        return;
      }

      const data = await res.json();

      setPatient({
        ...data,
        appointments: data.appointments || [],
        history: data.history || []
      });

    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchPatientDetail();
  }, [fetchPatientDetail]);

  // -----------------------
  // รองรับรูป + วิดีโอ (max 20)
  // -----------------------
  const handleFiles = (files, type) => {
    if (!files) return;

    const list = Array.from(files);

    if (list.length > 20) {
      alert('❌ ได้ไม่เกิน 20 ไฟล์');
      return;
    }

    const readers = list.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            url: reader.result,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((result) => {
      if (type === 'before') setBeforeFiles(result);
      else setAfterFiles(result);
    });
  };

  // -----------------------
  // บันทึกประวัติ
  // -----------------------
  const addHistory = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: id,
          treatment,
          description,
          media: {
            before: beforeFiles,
            after: afterFiles
          }
        })
      });

      setTreatment('');
      setDescription('');
      setBeforeFiles([]);
      setAfterFiles([]);

      fetchPatientDetail();

    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // สร้างนัด
  // -----------------------
  const createAppointment = async () => {
    if (!nextDate) return alert('เลือกวัน');

    const start = new Date(nextDate);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    try {
      const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: id,
          appointment_date: start,
          end_date: end,
          note: nextNote
        })
      });

      const data = await res.json();

      if (data.error) {
        return alert(data.error);
      }

      setNextDate('');
      setNextNote('');

      fetchPatientDetail();

    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // ลบนัด
  // -----------------------
  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm("ต้องการลบนัดหมายนี้หรือไม่?")) return;

    try {
      await fetch(`${API}/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      fetchPatientDetail();

    } catch (err) {
      console.error(err);
    }
  };

  if (!patient) return <div className="p-10 text-center text-[#771126] font-bold">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">

      {/* BACK BUTTON */}
      <Link to="/patients" className="inline-flex items-center gap-2 text-[#771126] font-bold hover:text-[#C55C6F] transition-colors">
        <ArrowLeft className="w-5 h-5" /> ย้อนกลับ
      </Link>

      {/* ข้อมูลคนไข้ */}
      <div className="bg-white p-7 rounded-2xl border-2 border-[#303030] shadow-sm">
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4 mb-5">
          <div className="bg-[#F5EDEC] p-3 rounded-xl">
            <User className="w-6 h-6 text-[#771126]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#771126]">ข้อมูลลูกค้า</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#303030] font-medium">
          <div className="space-y-3">
            <p className="flex items-center gap-2"><User className="w-4 h-4 text-[#C55C6F]" /> <span className="text-slate-500">ชื่อ-นามสกุล:</span> {patient.name} {patient.lastname}</p>
            <p className="flex items-center gap-2"><User className="w-4 h-4 text-[#C55C6F]" /> <span className="text-slate-500">ชื่อเล่น:</span> {patient.nickname || '-'}</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#C55C6F]" /> <span className="text-slate-500">เบอร์โทรศัพท์:</span> {patient.phone}</p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-[#771126] bg-[#F5EDEC] p-2 rounded-lg"><AlertCircle className="w-4 h-4" /> ติดต่อฉุกเฉิน: {patient.emergency_name} ({patient.emergency_phone})</p>
            <p className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-[#C55C6F]" /> <span className="text-slate-500">รู้จักจาก:</span> {patient.source}</p>
            <p className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#C55C6F]" /> <span className="text-slate-500">ความรู้สึก:</span> {patient.feeling}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* คอลัมน์ซ้าย: เพิ่มประวัติ & นัดหมาย */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* สร้างนัด */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#303030] shadow-sm">
            <h3 className="font-extrabold mb-4 text-xl text-[#771126] flex items-center gap-2">
              <CalendarPlus className="w-6 h-6" /> สร้างนัดครั้งถัดไป
            </h3>

            <input
              type="datetime-local"
              value={nextDate}
              onChange={e=>setNextDate(e.target.value)}
              className="border border-slate-300 p-3 w-full rounded-xl mb-3 focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030]"
            />

            <input
              placeholder="หมายเหตุการนัดหมาย"
              value={nextNote}
              onChange={e=>setNextNote(e.target.value)}
              className="border border-slate-300 p-3 w-full rounded-xl mb-4 focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] transition-all font-medium text-[#303030]"
            />

            <button
              onClick={createAppointment}
              className="bg-[#771126] hover:bg-[#501012] text-white font-bold px-4 py-3 rounded-xl w-full transition-all shadow-sm"
            >
              บันทึกนัดหมาย
            </button>
          </div>

          {/* นัดทั้งหมด */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h3 className="font-extrabold mb-4 text-lg text-[#303030] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#C55C6F]" /> นัดหมายทั้งหมด
            </h3>

            {patient.appointments.length === 0 && <p className="text-slate-400 text-sm text-center py-4 bg-slate-50 rounded-xl">ไม่มีนัดหมายในระบบ</p>}

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {patient.appointments.map(a => {

                  console.log('APPOINTMENT = ', a);

                  return (
                <div key={a.id} className="border-2 border-slate-100 p-3 rounded-xl bg-white flex justify-between items-start hover:border-[#C55C6F]/50 transition-all group">
                  <div>
                    <p className="font-bold text-[#771126]">
                      {a.appointment_date
                        ? new Date(a.appointment_date).toLocaleString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'ไม่มีวันที่'}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">{a.note || 'ไม่มีหมายเหตุ'}</p>
                  </div>
                  <button onClick={()=>deleteAppointment(a.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                );
            })}
            </div>
          </div>

        </div>

        {/* คอลัมน์ขวา: ประวัติการรักษา */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* ฟอร์มเพิ่มประวัติ */}
          <form onSubmit={addHistory} className="bg-[#F5EDEC] p-6 rounded-2xl border border-[#C55C6F]/30 shadow-sm space-y-4">
            <h3 className="font-extrabold text-[#771126] text-xl flex items-center gap-2 mb-2">
              <Syringe className="w-6 h-6" /> เพิ่มประวัติการรักษา
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={treatment}
                onChange={e=>setTreatment(e.target.value)}
                placeholder="ชื่อหัตถการ / บริการ"
                className="w-full p-3 border border-white rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] bg-white font-medium text-[#303030]"
                required
              />
              <input
                value={description}
                onChange={e=>setDescription(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                className="w-full p-3 border border-white rounded-xl focus:outline-none focus:border-[#C55C6F] focus:ring-1 focus:ring-[#C55C6F] bg-white font-medium text-[#303030]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* BEFORE */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-sm font-bold text-[#771126] mb-2 flex items-center gap-2"><Camera className="w-4 h-4"/> รูป/วิดีโอ ก่อนทำ</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e)=>handleFiles(e.target.files, 'before')}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#F5EDEC] file:text-[#771126] hover:file:bg-[#C55C6F] hover:file:text-white transition-all w-full"
                />
              </div>

              {/* AFTER */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-sm font-bold text-[#771126] mb-2 flex items-center gap-2"><Camera className="w-4 h-4"/> รูป/วิดีโอ หลังทำ</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e)=>handleFiles(e.target.files, 'after')}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#F5EDEC] file:text-[#771126] hover:file:bg-[#C55C6F] hover:file:text-white transition-all w-full"
                />
              </div>
            </div>

            {/* PREVIEW */}
            {(beforeFiles.length > 0 || afterFiles.length > 0) && (
              <div className="grid grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  {beforeFiles.map((m, i) => (
                    m.type.includes('video') ? (
                      <video key={i} src={m.url} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    ) : (
                      <img key={i} src={m.url} alt="before" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    )
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {afterFiles.map((m, i) => (
                    m.type.includes('video') ? (
                      <video key={i} src={m.url} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    ) : (
                      <img key={i} src={m.url} alt="after" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    )
                  ))}
                </div>
              </div>
            )}

            <button className="bg-[#C55C6F] hover:bg-[#771126] text-white font-bold px-4 py-3.5 rounded-xl w-full transition-all shadow-sm mt-2">
              บันทึกประวัติการรักษา
            </button>
          </form>

          {/* รายการประวัติ */}
          <div>
            <h3 className="font-extrabold mb-4 text-xl text-[#303030] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#C55C6F]" /> ประวัติการรักษาที่ผ่านมา
            </h3>

            {patient.history.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border-2 border-slate-200 border-dashed">
                <p className="text-slate-400 font-medium">ยังไม่มีประวัติการรักษา</p>
              </div>
            )}

            <div className="space-y-4">
              {patient.history.map((r) => (
                <div key={r.id} className="border-2 border-slate-100 p-6 rounded-2xl bg-white shadow-sm hover:border-[#C55C6F]/50 transition-all">

                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#F5EDEC] p-2 rounded-lg">
                      <Syringe className="w-5 h-5 text-[#771126]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-[#303030]">{r.treatment}</p>
                      {r.description && <p className="text-sm text-slate-500 font-medium">{r.description}</p>}
                    </div>
                  </div>

                  {r.media?.before?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-[#771126] mb-2 bg-[#F5EDEC] inline-block px-3 py-1 rounded-full">ก่อนทำ</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {r.media.before.map((m, i) => (
                          m.type?.includes('video')
                            ? <video key={i} src={m.url} controls className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                            : <img key={i} src={m.url} alt={`before-${i}`} className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {r.media?.after?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-[#C55C6F] mb-2 bg-pink-50 inline-block px-3 py-1 rounded-full">หลังทำ</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {r.media.after.map((m, i) => (
                          m.type?.includes('video')
                            ? <video key={i} src={m.url} controls className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                            : <img key={i} src={m.url} alt={`after-${i}`} className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PatientProfilePage;