import { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  ClipboardList, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRightCircle,
  PlusCircle,
  X,
  Trash2,
  Sparkles
} from 'lucide-react';

const API = '/api';

function InventoryPage() {
  const [items, setItems] = useState([]);

  // =========================
  // ADD PRODUCT
  // =========================
  const [productName, setProductName] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [minQty, setMinQty] = useState('');
  const [unit, setUnit] = useState('');

  // =========================
  // WITHDRAW MULTIPLE
  // =========================
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawItems, setWithdrawItems] = useState([{ inventory_id: '', qty: '' }]);
  const [withdrawNote, setWithdrawNote] = useState('');
  
  // =========================
  // RESTOCK
  // =========================
  const [showRestock, setShowRestock] = useState(false);
  const [restockId, setRestockId] = useState('');
  const [restockQty, setRestockQty] = useState('');
  const [restockNote, setRestockNote] = useState('');

  // =========================
  // HISTORY
  // =========================
  const [history, setHistory] = useState([]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API}/inventory`);
      const data = await res.json();
      setItems(data);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/inventory/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchInventory();
    fetchHistory();
  }, []);

  const saveProduct = async () => {
    if (!productName) return alert('กรอกชื่อสินค้า');
    try {
      await fetch(`${API}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          stock_qty: Number(stockQty),
          min_qty: Number(minQty),
          unit
        })
      });
      setProductName(''); setStockQty(''); setMinQty(''); setUnit('');
      fetchInventory();
    } catch (err) { console.error(err); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('คุณต้องการลบสินค้านี้ออกจากระบบใช่หรือไม่?')) {
      return;
    }
    try {
      const res = await fetch(`${API}/inventory/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'ลบไม่สำเร็จ');
        return;
      }
      alert('ลบสินค้าเรียบร้อย');
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const saveWithdraw = async () => {
    try {
      const cleanItems = withdrawItems.filter(i => i.inventory_id && i.qty);
      if (cleanItems.length === 0) return alert('กรุณากรอกข้อมูลรายการเบิก');
      await fetch(`${API}/inventory/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cleanItems.map(i => ({
            inventory_id: Number(i.inventory_id),
            qty: Number(i.qty)
          })),
          note: withdrawNote
        })
      });
      alert('บันทึกการเบิกสินค้าเรียบร้อยแล้ว');
      setShowWithdraw(false);
      setWithdrawItems([{ inventory_id: '', qty: '' }]);
      setWithdrawNote('');
      fetchInventory(); fetchHistory();
    } catch (err) { console.error(err); }
  };

  const saveRestock = async () => {
    if (!restockId || !restockQty) {
      return alert('กรอกข้อมูลไม่ครบ');
    }
    try {
      await fetch(`${API}/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_id: Number(restockId),
          qty: Number(restockQty),
          note: restockNote
        })
      });
      alert('เติมสินค้าเรียบร้อย');
      setShowRestock(false);
      setRestockId('');
      setRestockQty('');
      setRestockNote('');
      fetchInventory();
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatus = (item) => {
    if (Number(item.stock_qty) === 0) {
      return {
        text: 'สินค้าหมด',
        className: 'bg-rose-50 text-rose-700 border border-rose-200',
        icon: <XCircle className="w-4 h-4" />
      };
    }
    if (Number(item.stock_qty) < Number(item.min_qty)) {
      return {
        text: 'ควรเติมทันที',
        className: 'bg-amber-50 text-amber-700 border border-amber-300',
        icon: <AlertCircle className="w-4 h-4" />
      };
    }
    return {
      text: 'ปกติ',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4" />
    };
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-10 p-6 pb-20">
        
        {/* --- TOP SECTION (ADD FORM) --- */}
        <div className="bg-white border-2 border-gray-300 p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-[#C55C6F] to-[#771126]"></div>
          
          <div className="flex items-center gap-4 mb-8 pl-4">
            <div className="p-3 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-200 shadow-sm">
              <Package className="w-6 h-6 text-[#C55C6F]" />
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#771126] to-[#C55C6F]">
              ระบบคลังสินค้า
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pl-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">ชื่อสินค้า</label>
              <input 
                placeholder="ระบุชื่อสินค้า..." 
                value={productName} 
                onChange={(e)=>setProductName(e.target.value)} 
                className="w-full border-2 border-gray-300 p-3.5 rounded-xl focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all outline-none bg-white font-semibold text-gray-900 text-base" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">คงเหลือ</label>
              <input 
                type="number" 
                placeholder="0" 
                value={stockQty} 
                onChange={(e)=>setStockQty(e.target.value)} 
                className="w-full border-2 border-gray-300 p-3.5 rounded-xl focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all outline-none bg-white font-semibold text-gray-900 text-base" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">ขั้นต่ำ (แจ้งเตือน)</label>
              <input 
                type="number" 
                placeholder="แจ้งเตือนเมื่อต่ำกว่า..." 
                value={minQty} 
                onChange={(e)=>setMinQty(e.target.value)} 
                className="w-full border-2 border-gray-300 p-3.5 rounded-xl focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all outline-none bg-white font-semibold text-gray-900 text-base" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">หน่วยนับ</label>
              <input 
                placeholder="CC / ชิ้น / ขวด" 
                value={unit} 
                onChange={(e)=>setUnit(e.target.value)} 
                className="w-full border-2 border-gray-300 p-3.5 rounded-xl focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all outline-none bg-white font-semibold text-gray-900 text-base" 
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t-2 border-gray-200 pl-4"> 
            <button onClick={saveProduct} className="flex items-center gap-2 bg-gradient-to-r from-[#C55C6F] to-[#d66a7e] hover:from-[#a64d5d] hover:to-[#C55C6F] text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-md active:scale-95 border-0">
              <Plus className="w-5 h-5" /> เพิ่มสินค้าใหม่
            </button>
            <button onClick={()=>setShowWithdraw(true)} className="flex items-center gap-2 bg-[#1C202B] hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-md active:scale-95 border-0">
              <ClipboardList className="w-5 h-5" /> เบิกรายการหลายรายการ
            </button>
            <button onClick={()=>setShowRestock(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#4A79C3] to-[#6092DF] hover:from-[#3760a0] hover:to-[#4A79C3] text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-md active:scale-95 border-0">
              <PlusCircle className="w-5 h-5" /> เติมสินค้าเข้าสต๊อก
            </button>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white border-2 border-gray-300 rounded-[2rem] shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#D47A8C]"></div>
          
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 pl-2">
               <Sparkles className="w-6 h-6 text-[#E5A84D]" />
               <h2 className="text-2xl font-extrabold text-gray-800">รายการสินค้าคงคลัง</h2>
            </div>

            <div className="overflow-hidden border-2 border-gray-300 rounded-[1.5rem] bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead className="bg-slate-100 border-b-2 border-gray-300">
                  <tr className="text-gray-700 text-sm">
                    <th className="p-5 text-left font-extrabold w-1/4">ชื่อสินค้า</th>
                    <th className="p-5 text-center font-extrabold w-1/5">คงเหลือ</th>
                    <th className="p-5 text-center font-extrabold w-1/5">ขั้นต่ำ</th>
                    <th className="p-5 text-center font-extrabold w-1/5">สถานะ</th>
                    <th className="p-5 text-center font-extrabold w-1/6">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const status = getStatus(item);
                    // เพิ่มเส้นระหว่างรายการ (border-b)
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group border-b border-gray-200 last:border-b-0">
                        {/* ลดช่องว่าง padding จาก p-6 เป็น py-3 px-5 */}
                        <td className="py-3 px-5 align-middle">
                          <div className="font-extrabold text-gray-800 text-lg group-hover:text-[#C55C6F] transition-colors">{item.product_name}</div>
                        </td>
                        <td className="py-3 px-5 text-center align-middle">
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className={`text-2xl font-extrabold ${Number(item.stock_qty) < Number(item.min_qty) ? 'text-[#C55C6F]' : 'text-gray-800'}`}>
                              {item.stock_qty}
                            </span>
                            <span className="text-sm text-gray-500 font-bold">{item.unit}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-center align-middle">
                           <div className="flex items-baseline justify-center gap-1 text-gray-500 font-medium">
                              <span className="text-lg font-bold">{item.min_qty}</span>
                              <span className="text-xs">{item.unit}</span>
                           </div>
                        </td>
                        <td className="py-3 px-5 text-center align-middle">
                          <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-sm ${status.className}`}>
                            {status.icon} {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center align-middle">
                          <button 
                            onClick={() => deleteProduct(item.id)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-white text-rose-500 border-2 border-rose-200 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm text-xs font-bold active:scale-95 w-full"
                            title="ลบรายการสินค้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- HISTORY SECTION --- */}
        <div className="bg-white border-2 border-gray-300 rounded-[2rem] shadow-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-[#4A79C3] to-[#78A5CE]"></div>
          
          <div className="flex items-center gap-4 mb-8 pl-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
              <History className="w-6 h-6 text-[#4A79C3]" />
            </div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4A79C3] to-[#6092DF]">
              ประวัติการทำรายการ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-4">
            {history.map(log => (
              <div key={log.id} className="bg-white border-2 border-gray-200 shadow-sm rounded-[1.5rem] p-6 hover:shadow-md hover:border-[#78A5CE] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F4F8FD] to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-center mb-5">
                  <div className="text-xs font-bold text-[#4A79C3] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    {new Date(log.created_at).toLocaleDateString('th-TH')}
                  </div>
                  <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                    {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </div>
                </div>
                
                <p className="text-sm font-bold text-gray-700 mb-5 flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-gray-200">
                  <ArrowRightCircle className="w-4 h-4 text-[#78A5CE] mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed">{log.note || 'ไม่มีหมายเหตุ'}</span>
                </p>
                
                <div className="space-y-2 border-t-2 border-gray-100 pt-5">
                  {log.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-bold text-gray-800">{item.product_name}</span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${item.qty > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {item.qty > 0 ? `+${item.qty}` : item.qty} 
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500 font-bold text-base border-2 border-dashed border-gray-300 rounded-[2rem] bg-slate-50">
                ยังไม่มีประวัติการทำรายการ
              </div>
            )}
          </div>
        </div>

        {/* --- WITHDRAW MODAL --- */}
        {showWithdraw && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 transform animate-in fade-in zoom-in duration-200 border-2 border-gray-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#1C202B] rounded-2xl shadow-sm">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-800">เบิกสินค้าจากสต๊อก</h2>
                </div>
                <button onClick={()=>setShowWithdraw(false)} className="p-2 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-gray-500 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {withdrawItems.map((row, index) => (
                  <div key={index} className="flex gap-3">
                    <select
                      value={row.inventory_id}
                      onChange={(e)=>{
                        const arr = [...withdrawItems];
                        arr[index].inventory_id = e.target.value;
                        setWithdrawItems(arr);
                      }}
                      className="border-2 border-gray-300 p-4 rounded-xl flex-1 bg-white outline-none focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all font-bold text-gray-800 text-sm shadow-sm"
                    >
                      <option value="">เลือกสินค้าที่ต้องการเบิก...</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>{item.product_name} (คงเหลือ: {item.stock_qty} {item.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="จำนวน"
                      value={row.qty}
                      onChange={(e)=>{
                        const arr = [...withdrawItems];
                        arr[index].qty = e.target.value;
                        setWithdrawItems(arr);
                      }}
                      className="border-2 border-gray-300 p-4 rounded-xl w-32 bg-white text-center font-extrabold text-base outline-none focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all text-gray-800 shadow-sm"
                    />
                  </div>
                ))}
              </div>

              <button onClick={()=>{ setWithdrawItems([...withdrawItems, { inventory_id: '', qty: '' }]); }} className="mt-5 flex items-center gap-2 text-[#C55C6F] font-bold text-sm bg-rose-50 hover:bg-rose-100 px-4 py-3 rounded-xl transition-all border-2 border-dashed border-[#C55C6F]/50 w-full justify-center">
                <PlusCircle className="w-5 h-5" /> เพิ่มรายการเบิก
              </button>

              <textarea
                placeholder="ระบุเหตุผลการเบิก (เช่น ใช้ในห้องผ่าตัด, เติมของห้อง A...)"
                value={withdrawNote}
                onChange={(e)=>setWithdrawNote(e.target.value)}
                className="border-2 border-gray-300 p-4 rounded-xl w-full min-h-[120px] bg-white mt-6 outline-none focus:border-[#C55C6F] focus:ring-4 focus:ring-[#C55C6F]/20 transition-all text-sm font-bold text-gray-800 shadow-sm"
              />

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                <button onClick={()=>setShowWithdraw(false)} className="px-8 py-3.5 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-100 transition-all text-base shadow-sm">ยกเลิก</button>
                <button onClick={saveWithdraw} className="bg-[#1C202B] hover:bg-black text-white px-10 py-3.5 rounded-xl font-bold text-base shadow-md transition-all">ยืนยันการเบิก</button>
              </div>
            </div>
          </div>
        )}

        {/* --- RESTOCK MODAL --- */}
        {showRestock && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 transform animate-in fade-in zoom-in duration-200 border-2 border-gray-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl shadow-sm border border-blue-200">
                    <Package className="w-6 h-6 text-[#4A79C3]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#4A79C3]">เติมสินค้าเข้า Stock</h2>
                </div>
                <button onClick={() => setShowRestock(false)} className="p-2 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-gray-500 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <select
                  value={restockId}
                  onChange={(e) => setRestockId(e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-xl font-bold text-gray-800 text-sm outline-none focus:border-[#78A5CE] focus:ring-4 focus:ring-[#78A5CE]/20 bg-white shadow-sm transition-all"
                >
                  <option value="">-- เลือกสินค้าที่ต้องการเติม --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} (คงเหลือปัจจุบัน {item.stock_qty} {item.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="ระบุจำนวนที่เติม..."
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-xl font-extrabold text-base outline-none focus:border-[#78A5CE] focus:ring-4 focus:ring-[#78A5CE]/20 bg-white shadow-sm transition-all text-gray-800"
                />

                <textarea
                  placeholder="หมายเหตุ (เช่น รับเข้าจากใบเสร็จเลขที่...)"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full border-2 border-gray-300 p-4 rounded-xl min-h-[120px] font-bold text-sm outline-none focus:border-[#78A5CE] focus:ring-4 focus:ring-[#78A5CE]/20 bg-white shadow-sm transition-all text-gray-800"
                />
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                <button onClick={() => setShowRestock(false)} className="px-8 py-3.5 rounded-xl text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-100 font-bold text-base transition-all shadow-sm">
                  ยกเลิก
                </button>
                <button onClick={saveRestock} className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#4A79C3] to-[#6092DF] hover:from-[#3760a0] hover:to-[#4A79C3] text-white font-bold text-base shadow-md transition-all">
                  ยืนยันการเติมสินค้า
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryPage;