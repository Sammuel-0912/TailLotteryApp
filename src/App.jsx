import './App.css'
import React, { useState, useRef, useEffect } from "react";
import { Modal } from 'bootstrap'; 
import axios from 'axios';
// console.log(import.meta.env.VITE_APP_PATH);
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client';

const { VITE_APP_PATH } = import.meta.env;
const root = createRoot(document.getElementById('root'));

const list = [<ul className="list-group">
  <li className="list-group-item active" aria-current="true">An active item</li>
  <li className="list-group-item">A second item</li>
  <li className="list-group-item">A third item</li>
  <li className="list-group-item">A fourth item</li>
  <li className="list-group-item">And a fifth one</li>
</ul> ] ; 

const htmlTemplate = {
  __html: '<div>這裡有一段文字</div>'
}

const data = {
  imageUrl: "https://images.unsplash.com/photo-1505968409348-bd000797c92e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZyZWUlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D",
  title: '卡斯柏',
  content: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  link: 'https://bootstrap5.hexschool.com/docs/5.0/components/card/',
}
root.render(<App />);

// 模擬 10 人員工名單
const initialEmployees = [
  { id: 1, name: "王小明", dept: "工程部" },
  { id: 2, name: "李小美", dept: "設計部" },
  { id: 3, name: "陳大同", dept: "業務部" },
  { id: 4, name: "林雅玲", dept: "人資部" },
  { id: 5, name: "張書豪", dept: "財務部" },
  { id: 6, name: "趙子健", dept: "營運部" },
  { id: 7, name: "黃筱婷", dept: "行銷部" },
  { id: 8, name: "許國強", dept: "客服部" },
  { id: 9, name: "周品妤", dept: "法務部" },
  { id: 10, name: "吳承恩", dept: "資訊部" },
];

// 模擬獎品清單
// total: 總名額, remaining: 剩餘可抽名額
const initialPrizes = [
  { id: 1, name: "頭獎：iPad Air", total: 1, remaining: 1 },
  { id: 2, name: "貳獎：AirPods", total: 2, remaining: 2 },
  { id: 3, name: "參獎：超商禮券 500 元", total: 3, remaining: 3 },
  { id: 4, name: "安慰獎：飲料券", total: 4, remaining: 4 },
];

// 得獎紀錄資料型態: { id, employee, prizeName, time }

export default function App() {

const customModal = useRef(null)

  useEffect(() => {
  (async () => {
    const res = await axios.get(VITE_APP_PATH);
    console.log(res);

    openModal();

    setTimeout(() => {
      closeModal();
    }, 2000);
  })();  // ← IIFE 必須被呼叫
}, []);

  const openModal = () => {
    customModal.current.show()
  }
  const closeModal = () => {
    customModal.current.hide()
  }

  const modalRef = useRef(null)
  const [employees, setEmployees] = useState(initialEmployees);
  const [remainingIds, setRemainingIds] = useState(initialEmployees.map((e) => e.id));
  const [prizes, setPrizes] = useState(initialPrizes);
  const [currentPrizeId, setCurrentPrizeId] = useState(initialPrizes[0]?.id ?? null);
  const [winners, setWinners] = useState([]); // { id, employeeId, employeeName, dept, prizeName, time }
  const [displayText, setDisplayText] = useState("準備開始 🎊");
  const [statusText, setStatusText] = useState("請選擇獎項後按下抽獎按鈕。");
  const [isRolling, setIsRolling] = useState(false);

  const timerRef = useRef(null);

  const currentPrize = prizes.find((p) => p.id === currentPrizeId) ?? null;

  const getRemainingEmployees = () => {
    return remainingIds
      .map((id) => employees.find((e) => e.id === id))
      .filter(Boolean);
  };

  const startDraw = () => {
    if (!currentPrize) {
      setStatusText("請先選擇一個獎項。");
      return;
    }
    if (currentPrize.remaining <= 0) {
      setStatusText(`${currentPrize.name} 已抽完，請選擇其他獎項。`);
      return;
    }
    const remainingEmployees = getRemainingEmployees();
    if (remainingEmployees.length === 0) {
      setStatusText("所有員工都已中獎，無剩餘可抽對象。");
      return;
    }

    // 開始跑馬燈動畫
    setIsRolling(true);
    const startTime = Date.now();
    const duration = 2000; // 2 秒
    const interval = 60;

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const stillRemaining = getRemainingEmployees();
      if (stillRemaining.length === 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsRolling(false);
        setStatusText("所有員工都已中獎，無剩餘可抽對象。");
        return;
      }
      // 動畫中的隨機顯示
      const randomIndex = Math.floor(Math.random() * stillRemaining.length);
      setDisplayText(stillRemaining[randomIndex].name);

      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        finalizeDraw();
      }
    }, interval);
  };

  const finalizeDraw = () => {
    const remainingEmployees = getRemainingEmployees();
    if (!currentPrize || remainingEmployees.length === 0) {
      setIsRolling(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * remainingEmployees.length);
    const winner = remainingEmployees[randomIndex];

    // 更新剩餘可抽員工
    setRemainingIds((prev) => prev.filter((id) => id !== winner.id));

    // 更新獎品剩餘名額
    setPrizes((prev) =>
      prev.map((p) =>
        p.id === currentPrize.id
          ? { ...p, remaining: Math.max(0, p.remaining - 1) }
          : p
      )
    );

    // 新增得獎紀錄
    const now = new Date();
    const record = {
      id: `${winner.id}-${now.getTime()}`,
      employeeId: winner.id,
      employeeName: winner.name,
      dept: winner.dept,
      prizeName: currentPrize.name,
      time: now.toLocaleTimeString(),
    };
    setWinners((prev) => [...prev, record]);

    setDisplayText(winner.name);
    setStatusText(
      `恭喜「${winner.name}」（${winner.dept}）獲得 ${currentPrize.name}！剩餘可抽人數：${
        remainingEmployees.length - 1
      }`
    );
    setIsRolling(false);
  };

  const resetAll = () => {
    if (!window.confirm("確認要重置抽獎機？將清空得獎紀錄並重置名單。")) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setEmployees(initialEmployees);
    setRemainingIds(initialEmployees.map((e) => e.id));
    setPrizes(initialPrizes);
    setCurrentPrizeId(initialPrizes[0]?.id ?? null);
    setWinners([]);
    setDisplayText("準備開始 🎊");
    setStatusText("請選擇獎項後按下抽獎按鈕。");
    setIsRolling(false);
  };

  const exportWinnersCsv = () => {
    if (!winners.length) return;
    let csv = "姓名,部門,獎項,時間\n";
    winners.forEach((w) => {
      csv += `${w.employeeName},${w.dept},${w.prizeName},${w.time}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "尾牙得獎紀錄.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-stretch justify-center p-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
        {/* 左側：抽獎顯示區 */}
        <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col">
          <div className="flex flex-col gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-rose-600">
              公司尾牙抽獎機 🎉
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <select
                className="px-3 py-2 rounded-full border border-gray-300 text-sm min-w-[200px]"
                value={currentPrizeId ?? ""}
                onChange={(e) => setCurrentPrizeId(Number(e.target.value))}
              >
                {prizes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}（剩餘 {p.remaining}/{p.total}）
                  </option>
                ))}
              </select>

              <button
                onClick={startDraw}
                disabled={isRolling || !currentPrize}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md transition disabled:opacity-50 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
              >
                {isRolling ? "抽獎中…" : "抽出得獎者"}
              </button>

              <button
                onClick={resetAll}
                className="px-3 py-2 rounded-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                重置抽獎機
              </button>
            </div>

            <div className="text-center text-xs md:text-sm text-gray-600">
              {statusText}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-48 md:h-64 bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl border border-dashed border-rose-200 flex items-center justify-center">
              <span className="text-3xl md:text-5xl font-extrabold text-rose-500 drop-shadow-sm text-center px-4">
                {displayText}
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs text-center text-gray-500">
            共 {employees.length} 人 | 尚未中獎：{getRemainingEmployees().length} 人 |
            已中獎：{winners.length} 人
          </div>
        </div>

        {/* 右側：名單與得獎紀錄 */}
        <div className="w-full md:w-[320px] bg-white/90 rounded-2xl shadow-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-800">得獎紀錄</h2>
            <button
              onClick={exportWinnersCsv}
              disabled={!winners.length}
              className="px-3 py-1 rounded-full text-xs font-medium border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-40"
            >
              下載 CSV
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-amber-50/40">
            {winners.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-4">
                尚未有得獎紀錄，抽出第一位幸運兒吧！
              </div>
            )}
            {winners.map((w, idx) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-2 mb-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {idx + 1}. {w.employeeName}
                  </span>
                  <span className="text-[10px] text-gray-600">{w.dept}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-rose-700 font-medium">
                    {w.prizeName}
                  </span>
                  <span className="text-[10px] text-gray-500">{w.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">員工名單（模擬）</h3>
            <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-white text-xs space-y-1">
              {employees.map((e) => {
                const isRemaining = remainingIds.includes(e.id);
                return (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
                      isRemaining
                        ? "bg-gray-50 text-gray-700"
                        : "bg-gray-100 text-gray-400 line-through"
                    }`}
                  >
                    <span>
                      {e.id}. {e.name}
                    </span>
                    <span className="text-[10px]">{e.dept}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  <button type="button" className="btn btn-primary" onClick={() => openModal()} data-bs-toggle="modal" data-bs-target="#exampleModal">
  Launch demo modal
</button>
<div className="modal fade" ref={modalRef} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        ...
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>

<div id="card" className="card">
    <img src={ data.imageUrl } className="card-img-top" alt="..." />
    <div className="card-body">
      <h5 className="card-title">{ data.title }</h5>
      <p className="card-text">{data.content}</p>
      <a href={data.link} className="btn btn-primary">Go somewhere</a>
    </div>
  </div>
            {list}
            <div dangerouslySetInnerHTML={htmlTemplate} />
  </div>
  );

  </*on change*/></>

}



