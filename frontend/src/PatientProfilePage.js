import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

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
  // 🔥 โหลดข้อมูล (FIX: ต้องมี endpoint นี้ใน backend)
  // -----------------------
  const fetchPatientDetail = useCallback(async () => {
    try {
      const res = await fetch(`${API}/patients/${id}`);

      if (!res.ok) {
        console.error("❌ ไม่มี API /patients/:id");
        return;
      }

      const data = await res.json();

      // 🔥 กัน undefined
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
  // 📸 รองรับรูป + วิดีโอ (max 20)
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
  // 📚 บันทึกประวัติ
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
  // 📅 สร้างนัด (มีเวลาเลือกแล้ว)
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
          appointment_date: start.toISOString(),
          end_date: end.toISOString(),
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
  // 🗑 ลบนัด
  // -----------------------
  const deleteAppointment = async (appointmentId) => {
    if (!window.confirm("ลบ?")) return;

    try {
      await fetch(`${API}/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      fetchPatientDetail();

    } catch (err) {
      console.error(err);
    }
  };

  if (!patient) return <div className="p-10">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">

      <Link to="/patients" className="text-[#9c8680] font-bold">← กลับ</Link>

      {/* 👤 ข้อมูล */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-xl font-bold text-[#9c8680]">{patient.name}</h2>
        <p>ชื่อ-นามสกุล: {patient.name} {patient.lastname}</p>
          <p>ชื่อเล่น: {patient.nickname}</p>
          <p>เบอร์: {patient.phone}</p>

          <p>👨‍👩‍👧 ติดต่อฉุกเฉิน: {patient.emergency_name}</p>
          <p>📞 เบอร์ฉุกเฉิน: {patient.emergency_phone}</p>

          <p>📣 รู้จักจาก: {patient.source}</p>
          <p>💬 ความรู้สึก: {patient.feeling}</p>
      </div>

      {/* 📚 เพิ่มประวัติ */}
      <form onSubmit={addHistory} className="bg-[#f5f2f1] p-6 rounded-2xl space-y-4 border shadow-sm">

        <input
          value={treatment}
          onChange={e=>setTreatment(e.target.value)}
          placeholder="หัตถการ"
          className="w-full p-2 border rounded"
          required
        />

        <input
          value={description}
          onChange={e=>setDescription(e.target.value)}
          placeholder="รายละเอียด"
          className="w-full p-2 border rounded"
        />

       {/* BEFORE */}
<p className="text-sm font-bold">📸 ก่อนทำ</p>
<input
  type="file"
  multiple
  accept="image/*,video/*"
  onChange={(e)=>handleFiles(e.target.files, 'before')}
/>

{/* AFTER */}
<p className="text-sm font-bold">📸 หลังทำ</p>
<input
  type="file"
  multiple
  accept="image/*,video/*"
  onChange={(e)=>handleFiles(e.target.files, 'after')}
/>

        {/* preview */}
       {/* BEFORE */}
          <div className="grid grid-cols-3 gap-2">

              {/* BEFORE */}
              {beforeFiles.map((m, i) => (
                m.type.includes('video') ? (
                  <video key={i} src={m.url} className="w-full rounded" />
                ) : (
                
                  <img key={i} src={m.url} alt="before" className="w-full rounded" />
                )
              ))}

              {/* AFTER */}
              {afterFiles.map((m, i) => (
                m.type.includes('video') ? (
                  <video key={i} src={m.url} className="w-full rounded" />
                ) : (
                  <img key={i} src={m.url} alt="after" className="w-full rounded" />
                )
              ))}

            </div>

        <button className="bg-[#9c8680] text-white px-4 py-2 rounded w-full">
          บันทึกประวัติ
        </button>
      </form>

      {/* 📅 นัด */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold mb-2 text-[#9c8680]">📅 นัดครั้งถัดไป</h3>

        <input
          type="datetime-local"
          value={nextDate}
          onChange={e=>setNextDate(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="หมายเหตุ"
          value={nextNote}
          onChange={e=>setNextNote(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <button
          onClick={createAppointment}
          className="bg-[#9c8680] text-white px-4 py-2 rounded w-full"
        >
          บันทึกนัด
        </button>
      </div>

      {/* 📅 นัดทั้งหมด */}
      <div>
        <h3 className="font-bold mb-3 text-[#9c8680]">📅 นัดทั้งหมด</h3>

        {patient.appointments.length === 0 && <p className="text-gray-400">ไม่มีนัด</p>}

        {patient.appointments.map(a => (
          <div key={a.id} className="border p-3 mb-2 rounded bg-white flex justify-between items-center">

            <div>
              <p>{new Date(a.appointment_date).toLocaleString('th-TH')}</p>
              <p className="text-sm text-gray-500">{a.note}</p>
            </div>

            <button onClick={()=>deleteAppointment(a.id)} className="text-red-500">
              ลบ
            </button>

          </div>
        ))}
      </div>

      {/* 📚 ประวัติ */}
      <div>
        <h3 className="font-bold mb-3 text-[#9c8680]">📚 ประวัติการรักษา</h3>

        {patient.history.length === 0 && <p className="text-gray-400">ไม่มีข้อมูล</p>}

        {patient.history.map((r) => (
          <div key={r.id} className="border p-4 mb-3 rounded-2xl bg-white shadow-sm">

            <p className="font-bold">{r.treatment}</p>
            <p>{r.description}</p>

           <p className="text-sm mt-2 text-gray-500">ก่อนทำ</p>
<div className="grid grid-cols-3 gap-2">
  {r.media?.before?.map((m, i) => (
    m.type?.includes('video')
      ? (
        <video
          key={i}
          src={m.url}
          controls
          className="w-full rounded"
        />
      )
      : (
        <img
          key={i}
          src={m.url}
          alt={`before-${i}`}
          className="w-full rounded"
        />
      )
  ))}
</div>

<p className="text-sm mt-3 text-gray-500">หลังทำ</p>
<div className="grid grid-cols-3 gap-2">
  {r.media?.after?.map((m, i) => (
    m.type?.includes('video')
      ? (
        <video
          key={i}
          src={m.url}
          controls
          className="w-full rounded"
        />
      )
      : (
        <img
          key={i}
          src={m.url}
          alt={`after-${i}`}
          className="w-full rounded"
        />
      )
  ))}
</div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default PatientProfilePage;