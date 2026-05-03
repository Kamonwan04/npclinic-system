import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import CalendarPage from './CalendarPage';
import DashboardPage from './DashboardPage';
import FollowUpPage from './FollowUpPage'; 
import PatientProfilePage from './PatientProfilePage'; 
import LoginPage from './LoginPage';

const API = 'http://localhost:3001';

// -----------------------
const isLogin = () => !!localStorage.getItem('token');

// -----------------------
function PrivateRoute({ children }) {
  return isLogin() ? children : <Navigate to="/login" />;
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [source, setSource] = useState('');
  const [feeling, setFeeling] = useState('');

  const [allergies, setAllergies] = useState('');
  const [concerns, setConcerns] = useState('');

  const [search, setSearch] = useState('');

  // -----------------------
  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API}/patients`);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLogin()) fetchPatients();
  }, []);

  // -----------------------
  const savePatient = async () => {

    if (!name || !phone) {
      return alert('กรอกชื่อและเบอร์');
    }

    const payload = {
      name,
      lastname,
      nickname,
      phone,
      emergency_name: emergencyName,
      emergency_phone: emergencyPhone,
      source,
      feeling,
      allergies,
      concerns
    };

    try {
      if (editingId) {
        await fetch(`${API}/patients/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API}/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      alert('✅ บันทึกแล้ว');

      resetForm();
      fetchPatients();

    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setName('');
    setLastname('');
    setNickname('');
    setPhone('');
    setEmergencyName('');
    setEmergencyPhone('');
    setSource('');
    setFeeling('');
    setAllergies('');
    setConcerns('');
    setEditingId(null);
  };

  // -----------------------
  const deletePatient = async (id) => {
    if (!window.confirm('ยืนยันลบลูกค้า?')) return;

    try {
      await fetch(`${API}/patients/${id}`, {
        method: 'DELETE'
      });
      fetchPatients();
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  const editPatient = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setLastname(p.lastname || '');
    setNickname(p.nickname || '');
    setPhone(p.phone);
    setEmergencyName(p.emergency_name || '');
    setEmergencyPhone(p.emergency_phone || '');
    setSource(p.source || '');
    setFeeling(p.feeling || '');
    setAllergies(p.allergies || '');
    setConcerns(p.concerns || '');
  };

  // -----------------------
  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  // -----------------------
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 md:px-8 text-gray-800">

      <Routes>

        <Route path="/login" element={<LoginPage />} />

        <Route path="/*" element={
          <PrivateRoute>

            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow border p-6">

              {/* NAV */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                <h1 className="text-2xl font-bold text-[#9c8680]">
                  NP PRIME CLINIC
                </h1>

                <div className="flex gap-2 items-center">
                  <Link to="/" className="px-3 py-2 hover:text-[#9c8680]">📊 Dashboard</Link>
                  <Link to="/patients" className="px-3 py-2 hover:text-[#9c8680]">👥 ลูกค้า</Link>
                  <Link to="/calendar" className="px-3 py-2 hover:text-[#9c8680]">📅 นัดหมาย</Link>
                  <Link to="/followup" className="px-3 py-2 hover:text-[#9c8680]">🔔 ติดตามผล</Link>

                  <button onClick={logout} className="text-red-500 ml-2">
                    🚪 ออก
                  </button>
                </div>
              </div>

              <Routes>

                <Route path="/" element={<DashboardPage />} />

                {/* 👥 PATIENT PAGE */}
                <Route path="/patients" element={
                  <div className="space-y-6">

                    {/* FORM */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                      <h2 className="text-lg font-bold mb-4">
                        {editingId ? '✏️ แก้ไขลูกค้า' : '➕ เพิ่มลูกค้า'}
                      </h2>

                      <form onSubmit={(e)=>{e.preventDefault(); savePatient();}} className="grid md:grid-cols-2 gap-3">

                        <input placeholder="ชื่อ" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" />
                        <input placeholder="นามสกุล" value={lastname} onChange={e => setLastname(e.target.value)} className="p-2 border rounded" />

                        <input placeholder="ชื่อเล่น" value={nickname} onChange={e => setNickname(e.target.value)} className="p-2 border rounded" />
                        <input placeholder="เบอร์" value={phone} onChange={e => setPhone(e.target.value)} className="p-2 border rounded" />

                        <input placeholder="ชื่อ-นามสกุล (ฉุกเฉิน)" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="p-2 border rounded" />
                        <input placeholder="เบอร์ฉุกเฉิน" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="p-2 border rounded" />

                        <select value={source} onChange={e => setSource(e.target.value)} className="p-2 border rounded">
                          <option value="">เลือกช่องทาง</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                          <option value="friend">เพื่อนแนะนำ</option>
                          <option value="other">อื่นๆ</option>
                        </select>

                        <textarea placeholder="ความรู้สึก" value={feeling} onChange={e => setFeeling(e.target.value)} className="p-2 border rounded" />

                        <input placeholder="แพ้ยา" value={allergies} onChange={e => setAllergies(e.target.value)} className="p-2 border rounded" />

                        <select value={concerns} onChange={e => setConcerns(e.target.value)} className="p-2 border rounded">
                          <option value="">เลือกปัญหา</option>
                          <option>สิว</option>
                          <option>ฝ้า</option>
                          <option>ปรับรูปหน้า</option>
                        </select>

                        <button className="md:col-span-2 bg-[#9c8680] text-white py-2 rounded">
                          {editingId ? 'อัปเดต' : 'บันทึก'}
                        </button>

                      </form>
                    </div>

                    {/* SEARCH */}
                    <input
                      placeholder="🔍 ค้นหา"
                      value={search}
                      onChange={(e)=>setSearch(e.target.value)}
                      className="w-full p-2 border rounded"
                    />

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {filtered.map(p => (
                            <tr key={p.id} className="border-t">
                              <td className="p-2">{p.name}</td>
                              <td className="p-2">{p.phone}</td>

                              <td className="p-2 text-right space-x-2">
                                <button onClick={()=>editPatient(p)} className="bg-yellow-400 px-2 py-1 rounded">✏️</button>
                                <button onClick={()=>deletePatient(p.id)} className="bg-red-500 text-white px-2 py-1 rounded">🗑</button>
                                <Link to={`/patient/${p.id}`} className="bg-blue-500 text-white px-2 py-1 rounded">📄</Link>
                                <Link to={`/calendar?patient=${p.id}`} className="bg-[#9c8680] text-white px-2 py-1 rounded">📅</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                } />

                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/patient/:id" element={<PatientProfilePage />} />
                <Route path="/followup" element={<FollowUpPage />} />
                <Route path="/followup/:id" element={<FollowUpPage />} />

                <Route path="*" element={<Navigate to="/" />} />

              </Routes>

            </div>

          </PrivateRoute>
        } />

      </Routes>

    </div>
  );
}

export default AppWrapper;