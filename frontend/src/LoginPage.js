import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3001';

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

        // 🔥 สำคัญมาก (กันค้าง route)
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
    <div className="h-screen flex items-center justify-center bg-[#f4f1ef]">

      <form 
        onSubmit={handleLogin} 
        className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-sm space-y-4"
      >

        <h2 className="text-xl font-bold text-center text-[#9c8680]">
          🔐 NP PRIME LOGIN
        </h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#c1acab]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#c1acab]"
        />

        <button 
          disabled={loading}
          className="w-full bg-[#9c8680] hover:bg-[#8a756f] text-white py-2 rounded transition"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

      </form>
    </div>
  );
}

export default LoginPage;