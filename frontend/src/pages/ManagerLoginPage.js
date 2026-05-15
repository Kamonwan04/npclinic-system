import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import ไอคอนจาก lucide-react
import { Crown, Lock, Loader2 } from 'lucide-react';

//const API = 'https://npclinic-system-production.up.railway.app';
const API = 'http://localhost:3001'; 

function ManagerLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 

    if (!username || !password) {
      alert('⚠️ กรุณากรอกข้อมูลให้ครบถ้วน');
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

      if (data.success && data.role === 'manager') {
        localStorage.setItem('token', 'manager-token');
        localStorage.setItem('role', 'manager');
        navigate('/manager');
      } else {
        alert('❌ ไม่ใช่บัญชี Manager หรือ ข้อมูลไม่ถูกต้อง');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server Error ไม่สามารถเชื่อมต่อได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900 p-4 selection:bg-slate-300 selection:text-slate-900">
      
      <form 
        onSubmit={handleLogin}
        className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-2 border-slate-700 w-full max-w-md space-y-8 relative overflow-hidden"
      >
        {/* แถบสีตกแต่งด้านบน */}
        <div className="absolute top-0 left-0 w-full h-3 bg-slate-800"></div>

        {/* Header ส่วนหัวพร้อมโลโก้ */}
        <div className="text-center space-y-3 pt-4">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="NP Clinic Logo" className="h-20 object-contain" />
          </div>
          
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-3 mx-auto mb-5 border-2 border-slate-900">
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            MANAGER PORTAL
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
            ระบบจัดการสำหรับผู้บริหาร
          </p>
        </div>

        <div className="space-y-5">
          {/* Input Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-2">Username</label>
            <input
              placeholder="กรอกชื่อผู้ใช้..."
              value={username}
              onChange={e => setUsername(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-slate-400 bg-slate-50 rounded-2xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-300 transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* ปุ่ม Login */}
        <button
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4 border-b-4 border-black/50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" /> Secure Login
            </>
          )}
        </button>

      </form>
    </div>
  );
}

export default ManagerLoginPage;