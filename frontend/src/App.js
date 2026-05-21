import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import CalendarPage from './CalendarPage';
import DashboardPage from './DashboardPage';
import FollowUpPage from './FollowUpPage'; 
import PatientProfilePage from './PatientProfilePage'; 
import LoginPage from './LoginPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import InventoryPage from './pages/InventoryPage';

// Import ไอคอนจาก lucide-react
import { 
  UserPlus, 
  Edit3, 
  Save, 
  Search, 
  FileText, 
  Calendar, 
  Pencil, 
  Trash2, 
  Frown 
} from 'lucide-react';

const API = '/api';

// -----------------------
const isLogin = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('role') === 'manager'
  );
};

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

function NavLink({ to, children, className = "" }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2.5 rounded-2xl font-bold transition-all duration-300 ${
        isActive 
          ? 'bg-[#C55C6F] text-white shadow-md' 
          : 'text-[#771126] hover:text-[#501012] hover:bg-[#FCECF0]'
      } ${className}`}
    >
      {children}
    </Link>
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

  const savePatient = async () => {
    if (!name || !phone) return alert('[แจ้งเตือน] กรุณากรอกชื่อและเบอร์โทรศัพท์');
    const payload = { name, lastname, nickname, phone, emergency_name: emergencyName, emergency_phone: emergencyPhone, source, feeling, allergies, concerns };
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
      alert('[สำเร็จ] บันทึกข้อมูลเรียบร้อยแล้ว');
      resetForm();
      fetchPatients();
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setName(''); setLastname(''); setNickname(''); setPhone('');
    setEmergencyName(''); setEmergencyPhone(''); setSource('');
    setFeeling(''); setAllergies(''); setConcerns(''); setEditingId(null);
  };

  const deletePatient = async (id) => {
    if (!window.confirm('[คำเตือน] ยืนยันการลบลูกค้าท่านนี้?')) return;
    try {
      await fetch(`${API}/patients/${id}`, { method: 'DELETE' });
      fetchPatients();
    } catch (err) { console.error(err); }
  };

  const editPatient = (p) => {
    setEditingId(p.id); setName(p.name); setLastname(p.lastname || '');
    setNickname(p.nickname || ''); setPhone(p.phone); setEmergencyName(p.emergency_name || '');
    setEmergencyPhone(p.emergency_phone || ''); setSource(p.source || '');
    setFeeling(p.feeling || ''); setAllergies(p.allergies || ''); setConcerns(p.concerns || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // แก้ไขพื้นหลังเป็น #efc3c2 ตรงนี้
  return (
    <div className="min-h-screen bg-[#efc3c2] py-8 px-4 md:px-8 text-[#303030] font-sans selection:bg-[#e9b9c5] selection:text-[#501012]">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-lg border-2 border-slate-700 p-6 md:p-10 mb-10">
              
              {/* NAV BAR */}
              <div className="flex flex-col items-center mb-10 border-b-2 border-[#f5e0df] pb-10 gap-8">
                
                {/* LOGO AREA - ขยายใหญ่พิเศษ */}
                <div className="flex flex-col items-center gap-4 group">
                  <img 
                    src="/logo.png" 
                    alt="NP Clinic Logo" 
                    className="w-42 h-32 md:w-50 md:h-50 object-contain drop-shadow-xl transition-all duration-500 group-hover:scale-110" 
                  />
                  <h1 className="text-2xl md:text-3xl font-black text-[#771126] tracking-tight">
                    NP PRIME CLINIC SYSTEM
                  </h1>
                </div>  

                {/* LINKS AREA */}
                <div className="flex flex-wrap justify-center gap-2 items-center bg-[#FFF0D9]/30 p-3 rounded-[2rem] border-2 border-slate-700 shadow-md">
                  <NavLink to="/">Dashboard</NavLink>
                  <NavLink to="/patients">ลูกค้า</NavLink>
                  <NavLink to="/calendar">นัดหมาย</NavLink>
                  <NavLink to="/followup">ติดตามผล</NavLink>
                  <NavLink to="/inventory">คลังสินค้า</NavLink>
                  {localStorage.getItem('role') === 'manager' && (
                    <NavLink to="/manager" className="!text-[#78A5CE] hover:!bg-[#F5EDEC]">ค่ามือหมอ</NavLink>
                  )}
                  <div className="w-px h-8 bg-slate-400 mx-2"></div>
                  <button onClick={logout} className="px-6 py-2.5 rounded-2xl font-bold text-white bg-[#771126] hover:bg-[#501012] transition-all shadow-sm">
                    Logout
                  </button>
                </div>
              </div>

              {/* PAGE CONTENT */}
              <div className="mt-4">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/patients" element={
                    <div className="space-y-8">
                      {/* FORM CARD */}
                      <div className="bg-white p-8 rounded-3xl shadow-md border-2 border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#C55C6F]"></div>
                        <h2 className="text-2xl font-extrabold mb-6 text-[#771126] flex items-center gap-2">
                          {editingId ? <><Edit3 className="w-6 h-6" /> แก้ไขข้อมูลลูกค้า</> : <><UserPlus className="w-6 h-6" /> ลงทะเบียนลูกค้าใหม่</>}
                        </h2>
                        <form onSubmit={(e)=>{e.preventDefault(); savePatient();}} className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">ชื่อ</label>
                            <input placeholder="ระบุชื่อ" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all placeholder-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">นามสกุล</label>
                            <input placeholder="ระบุนามสกุล" value={lastname} onChange={e => setLastname(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all placeholder-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">ชื่อเล่น</label>
                            <input placeholder="ระบุชื่อเล่น" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all placeholder-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">เบอร์โทรศัพท์</label>
                            <input placeholder="08X-XXX-XXXX" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all placeholder-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">บุคคลติดต่อฉุกเฉิน</label>
                            <input placeholder="ชื่อ-นามสกุล (ฉุกเฉิน)" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all placeholder-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">เบอร์โทรฉุกเฉิน</label>
                            <input placeholder="เบอร์ฉุกเฉิน" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all placeholder-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">รู้จักคลินิกผ่านช่องทางใด</label>
                            <select value={source} onChange={e => setSource(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all appearance-none">
                              <option value="">เลือกช่องทาง</option>
                              <option value="facebook">Facebook</option>
                              <option value="instagram">Instagram</option>
                              <option value="tiktok">TikTok</option>
                              <option value="friend">เพื่อนแนะนำ</option>
                              <option value="other">อื่นๆ</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-[#771126] ml-2">ความกังวล / ปัญหาที่ต้องการแก้</label>
                            <select value={concerns} onChange={e => setConcerns(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all appearance-none">
                              <option value="">เลือกปัญหา</option>
                              <option>สิว</option>
                              <option>ฝ้า / กระ</option>
                              <option>ปรับรูปหน้า / โบท็อกซ์ / ฟิลเลอร์</option>
                              <option>ทรีทเม้นท์ผิวหน้า</option>
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-bold text-[#771126] ml-2">ประวัติการแพ้ยา</label>
                            <input placeholder="ระบุประวัติแพ้ยา (ถ้าไม่มีให้เว้นว่าง)" value={allergies} onChange={e => setAllergies(e.target.value)} className="w-full bg-white border-2 border-rose-500 text-[#771126] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-700 transition-all placeholder-rose-300" />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-bold text-[#771126] ml-2">หมายเหตุเพิ่มเติม</label>
                            <textarea placeholder="ความรู้สึก หรือ รายละเอียดอื่นๆ..." value={feeling} onChange={e => setFeeling(e.target.value)} className="w-full bg-white border-2 border-slate-500 text-[#501012] p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-700 transition-all min-h-[100px]" />
                          </div>
                          <div className="md:col-span-2 flex gap-3 mt-4">
                            {editingId && (
                              <button type="button" onClick={resetForm} className="w-1/3 flex items-center justify-center gap-2 bg-[#f5e0df] text-[#771126] border border-[#e9b9c5] py-4 rounded-2xl font-bold hover:bg-[#e9b9c5] transition-all shadow-sm">ยกเลิก</button>
                            )}
                            <button className={`flex items-center justify-center gap-2 bg-[#C55C6F] hover:bg-[#771126] text-white py-4 rounded-2xl font-extrabold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${editingId ? 'w-2/3' : 'w-full'}`}>
                              <Save className="w-5 h-5" /> {editingId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูลลูกค้า'}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* SEARCH BARS */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="w-5 h-5 text-[#C55C6F]" />
                        </div>
                        <input
                          placeholder="ค้นหาชื่อ หรือ เบอร์โทรศัพท์..."
                          value={search}
                          onChange={(e)=>setSearch(e.target.value)}
                          className="w-full bg-white border-2 border-slate-700 text-[#501012] p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-800 transition-all shadow-sm font-medium placeholder-slate-400"
                        />
                      </div>

                      {/* PATIENT TABLE */}
                      <div className="bg-white rounded-3xl shadow-md border-2 border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-slate-50 border-b-2 border-slate-500">
                              <tr>
                                <th className="p-4 text-slate-800 font-bold">ชื่อลูกค้า</th>
                                <th className="p-4 text-slate-800 font-bold">เบอร์โทรศัพท์</th>
                                <th className="p-4 text-slate-800 font-bold text-center">จัดการ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.length > 0 ? filtered.map(p => (
                                <tr key={p.id} className="border-b border-slate-300 last:border-0 hover:bg-slate-100 transition-colors">
                                  <td className="p-4 font-bold text-[#501012]">
                                    {p.name} {p.lastname}
                                    {p.nickname && <span className="ml-2 text-sm text-[#C55C6F] font-normal">({p.nickname})</span>}
                                  </td>
                                  <td className="p-4 text-slate-700 font-medium">{p.phone}</td>
                                  <td className="p-4 text-center flex items-center justify-center gap-2">
                                    <Link to={`/patient/${p.id}`} className="flex items-center gap-1.5 bg-[#78A5CE] text-white hover:bg-[#628eb5] px-3 py-2 rounded-xl transition-all shadow-sm font-medium"><FileText className="w-4 h-4" /> ประวัติ</Link>
                                    <Link to={`/calendar?patient=${p.id}`} className="flex items-center gap-1.5 bg-[#DDA4B4] text-white hover:bg-[#C55C6F] px-3 py-2 rounded-xl transition-all shadow-sm font-medium"><Calendar className="w-4 h-4" /> นัดหมาย</Link>
                                    <button onClick={()=>editPatient(p)} className="flex items-center gap-1.5 bg-[#FFF0D9] text-[#7C5549] hover:bg-[#ebd8bd] px-3 py-2 rounded-xl transition-all shadow-sm font-medium"><Pencil className="w-4 h-4" /> แก้ไข</button>
                                    <button onClick={()=>deletePatient(p.id)} className="flex items-center gap-1.5 bg-[#771126] text-white hover:bg-[#501012] px-3 py-2 rounded-xl transition-all shadow-sm font-medium"><Trash2 className="w-4 h-4" /> ลบ</button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan="3" className="p-8 text-center text-[#771126] font-medium">
                                    <div className="flex flex-col items-center justify-center"><Frown className="w-8 h-8 mb-2 text-[#C55C6F]" />ไม่พบข้อมูลลูกค้า</div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  } />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/patient/:id" element={<PatientProfilePage />} />
                  <Route path="/followup" element={<FollowUpPage />} />
                  <Route path="/followup/:id" element={<FollowUpPage />} />
                  <Route path="/manager" element={localStorage.getItem('role') === 'manager' ? <ManagerDashboardPage /> : <Navigate to="/" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default AppWrapper;