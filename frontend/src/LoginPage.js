import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = window.location.origin + '/api';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        navigate('/', { replace: true });
      } else {
        alert('❌ Username หรือ Password ผิด');
      }
    } catch (err) {
      console.error(err);
      alert('❌ เชื่อมต่อ server ไม่ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCECF0] p-4">
      <form 
        onSubmit={handleLogin} 
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-2 border-slate-700 w-full max-w-md space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-[#C55C6F]"></div>

        {/* Header Section */}
        <div className="text-center flex flex-col items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="NP Clinic Logo" 
            className="w-40 h-40 object-contain drop-shadow-xl"
          />
          <h2 className="text-4xl font-black text-[#771126] tracking-tighter uppercase">
            NP PRIME CLINIC
          </h2>
          <div className="h-1.5 w-24 bg-[#C55C6F] mx-auto rounded-full"></div>
        </div>

        {/* Inputs Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-bold text-slate-700 ml-2">Username</label>
            <input
              placeholder="กรอกชื่อผู้ใช้..."
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              className="w-full p-5 border-2 border-slate-400 bg-slate-50 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-800 transition-all text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-bold text-slate-700 ml-2">Password</label>
            <input
              type="password"
              placeholder="กรอกรหัสผ่าน..."
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full p-5 border-2 border-slate-400 bg-slate-50 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-800 transition-all text-lg"
            />
          </div>
        </div>

        {/* ปุ่ม Login - ปรับให้ใหญ่และปกติขึ้น */}
        <button 
          disabled={loading}
          className="w-full bg-[#C55C6F] hover:bg-[#771126] text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-2xl disabled:opacity-70 disabled:cursor-not-allowed mt-4 border-b-8 border-black/20"
        >
          {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
        </button>

        <p className="text-center text-slate-400 text-sm font-medium pt-4">
          &copy; {new Date().getFullYear()} NP PRIME CLINIC
        </p>
      </form>
    </div>
  );
}

export default LoginPage;