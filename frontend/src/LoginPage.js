import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'https://npclinic-system-production.up.railway.app'; // เปลี่ยนเป็น URL ของ backend ที่ deploy แล้ว

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 🔥 เพิ่ม
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

      // ✅ เพิ่มตรงนี้
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
    // เปลี่ยนพื้นหลังให้เข้ากับโทนของแอพ (#FCECF0)
    <div className="min-h-screen flex items-center justify-center bg-[#FCECF0] p-4 selection:bg-[#e9b9c5] selection:text-[#501012]">

      <form 
        onSubmit={handleLogin} 
        // เน้นกรอบให้ชัดเจน (border-slate-700) และเพิ่มเงาหนักๆ (shadow-2xl)
        className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-2 border-slate-700 w-full max-w-md space-y-8 relative overflow-hidden"
      >
        {/* แถบสีตกแต่งด้านบน */}
        <div className="absolute top-0 left-0 w-full h-3 bg-[#C55C6F]"></div>

        {/* ส่วนหัว Logo */}
        <div className="text-center space-y-3 pt-4">
          <div className="w-16 h-16 bg-[#C55C6F] rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-lg transform rotate-3 mx-auto mb-5 border-2 border-[#9a4555]">
            NP
          </div>
          <h2 className="text-3xl font-black text-[#771126] tracking-tight">
            PRIME CLINIC
          </h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
            เข้าสู่ระบบเพื่อจัดการข้อมูล
          </p>
        </div>

        <div className="space-y-5">
          {/* Input Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-2">Username</label>
            <input
              placeholder="กรอกชื่อผู้ใช้..."
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              className="w-full p-4 border-2 border-slate-400 bg-slate-50 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-300 transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-2">Password</label>
            <input
              type="password"
              placeholder="กรอกรหัสผ่าน..."
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full p-4 border-2 border-slate-400 bg-slate-50 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-300 transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* ปุ่ม Login */}
        <button 
          disabled={loading}
          className="w-full bg-[#C55C6F] hover:bg-[#771126] text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4 border-b-4 border-black/20"
        >
          {loading ? 'กำลังเข้าสู่ระบบ ⏳...' : 'เข้าสู่ระบบ'}
        </button>

      </form>
    </div>
  );
}

export default LoginPage;