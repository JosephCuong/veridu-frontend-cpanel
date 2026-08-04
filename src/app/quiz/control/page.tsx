'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { QuizQuestion, fetchQuizQuestions } from '@/lib/quiz';
import * as XLSX from 'xlsx';
import { 
  Play, Pause, Lock, Unlock, ArrowRight, UserX, 
  Users, ShieldAlert, Sparkles, Trophy, RotateCcw, Key, Upload, FileSpreadsheet, Download, Database
} from 'lucide-react';

interface StudentParticipant {
  id: string;
  name: string;
  score: number;
  streak: number;
  isFlagged?: boolean;
}

export default function GLVRoomControlPage() {
  const [roomPin, setRoomPin] = useState('');
  const [roomStatus, setRoomStatus] = useState<'setup' | 'waiting' | 'live' | 'paused' | 'gameover'>('setup');
  const [isLocked, setIsLocked] = useState(false);
  const [participants, setParticipants] = useState<StudentParticipant[]>([]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  
  // Setup Wizard State
  const [setupTab, setSetupTab] = useState<'bank' | 'upload'>('bank');
  const [bankCategory, setBankCategory] = useState('Tất cả');
  const [bankQuantity, setBankQuantity] = useState(20);
  const [uploadError, setUploadError] = useState('');

  // Setup functions
  const handleBankSubmit = async () => {
    const data = await fetchQuizQuestions();
    let filtered = bankCategory === 'Tất cả' ? data : data.filter(q => q.category === bankCategory);
    
    // Shuffle and slice
    filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, bankQuantity);
    
    if (filtered.length === 0) {
      return alert('Ngân hàng không có đủ câu hỏi cho chủ đề này!');
    }
    
    setQuestions(filtered);
    finalizeSetup();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Tệp tải lên vượt quá giới hạn 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length > 100) {
          setUploadError('Tệp chứa quá 100 câu hỏi. Vui lòng giảm bớt.');
          return;
        }

        const parsedQuestions: QuizQuestion[] = data.map((row: any, idx: number) => {
          // Normalize answer index
          const correctLetter = (row.DapAnDung || row['Đáp án đúng'] || row.Correct || 'A').toString().toUpperCase().trim();
          let cIdx = 0;
          if (correctLetter === 'B') cIdx = 1;
          if (correctLetter === 'C') cIdx = 2;
          if (correctLetter === 'D') cIdx = 3;

          return {
            id: `temp-${idx}`,
            category: row.ChuDe || row['Chủ đề'] || 'Tự Tạo',
            questionText: row.TieuDe || row['Tiêu đề'] || row.Title || `Câu hỏi ${idx+1}`,
            options: [
              row.DapAnA || row['Đáp án A'] || 'Option A',
              row.DapAnB || row['Đáp án B'] || 'Option B',
              row.DapAnC || row['Đáp án C'] || 'Option C',
              row.DapAnD || row['Đáp án D'] || 'Option D'
            ],
            correctAnswerIndex: cIdx,
            explanation: row.GiaiThich || row['Giải thích'] || ''
          };
        });

        if (parsedQuestions.length === 0) {
          setUploadError('Không tìm thấy dữ liệu câu hỏi hợp lệ trong tệp.');
          return;
        }

        setQuestions(parsedQuestions);
        finalizeSetup();
      } catch (err) {
        setUploadError('Lỗi đọc tệp Excel. Định dạng không hợp lệ.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const finalizeSetup = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomPin(pin);
    setRoomStatus('waiting');
  };

  const downloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "Tiêu đề": "Thiên Chúa đã ban Mười Điều Răn ở núi nào?",
        "Đáp án A": "Núi Si-nai",
        "Đáp án B": "Núi Ga-ri-dim",
        "Đáp án C": "Núi Ca-mê-lô",
        "Đáp án D": "Núi Ô-liu",
        "Đáp án đúng": "A",
        "Giải thích": "Thiên Chúa ban Mười Điều Răn cho Mô-sê trên núi Si-nai.",
        "Chủ đề": "Cựu Ước"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CauHoi");
    XLSX.writeFile(wb, "Sample_Quiz_Veridu.xlsx");
  };

  // Supabase Channel (Host)
  useEffect(() => {
    if (!roomPin || roomStatus === 'setup') return;

    const channel = supabase.channel(`room:${roomPin}`, {
      config: {
        presence: { key: 'host' },
        broadcast: { ack: true }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const players: StudentParticipant[] = [];
        for (const [key, presences] of Object.entries(state)) {
          if (key === 'host') continue; // skip host
          const p = presences[0] as any;
          players.push({
             id: key,
             name: p.name || key,
             score: p.score || 0,
             streak: p.streak || 0
          });
        }
        players.sort((a, b) => b.score - a.score);
        setParticipants(players);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomPin, roomStatus]);

  // Broadcast State to Players
  const broadcastState = (status: string, index: number, time: number) => {
    if (!roomPin) return;
    const channel = supabase.channel(`room:${roomPin}`);
    channel.send({
      type: 'broadcast',
      event: 'sync_state',
      payload: {
        status,
        questionIndex: index,
        questionData: questions[index] || null,
        time,
        isShowingAnswer: time === 0
      }
    });
  };

  // Timer logic for live game
  useEffect(() => {
    if (roomStatus === 'live' && timeLeft > 0) {
      const t = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        broadcastState('playing', currentQIndex, timeLeft - 1);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [roomStatus, timeLeft, currentQIndex, roomPin]);

  const handleStartRoom = () => {
    setRoomStatus('live');
    setIsLocked(true);
    setCurrentQIndex(0);
    setTimeLeft(20);
    broadcastState('playing', 0, 20);
  };

  const handlePauseRoom = () => {
    if (roomStatus === 'paused') {
      setRoomStatus('live');
    } else {
      setRoomStatus('paused');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setTimeLeft(20);
      setRoomStatus('live');
      broadcastState('playing', currentQIndex + 1, 20);
    } else {
      setRoomStatus('gameover');
      broadcastState('gameover', currentQIndex, 0);
    }
  };

  // Render Setup Wizard
  if (roomStatus === 'setup') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl text-center space-y-8">
            <h1 className="font-serif font-black text-3xl">Thiết Lập Phòng Thi Live</h1>
            <p className="text-[var(--text-muted)] text-sm">Chọn nguồn dữ liệu câu hỏi cho trận đấu. Dữ liệu tải lên sẽ tự động hủy khi phòng đóng để tiết kiệm tài nguyên hệ thống.</p>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setSetupTab('bank')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${setupTab === 'bank' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-[var(--bg-main)] border border-[var(--border-card)]'}`}><Database className="w-5 h-5"/> Ngân Hàng Câu Hỏi</button>
              <button onClick={() => setSetupTab('upload')} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${setupTab === 'upload' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-[var(--bg-main)] border border-[var(--border-card)]'}`}><Upload className="w-5 h-5"/> Tải Lên Excel</button>
            </div>

            {setupTab === 'bank' && (
              <div className="space-y-6 text-left max-w-md mx-auto p-6 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)]">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">Chủ Đề Kiến Thức</label>
                  <select value={bankCategory} onChange={(e) => setBankCategory(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-sm font-bold">
                    <option>Tất cả</option><option>Cựu Ước</option><option>Tân Ước</option><option>Giáo Lý</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">Số lượng câu hỏi (Max 50)</label>
                  <input type="number" min="1" max="50" value={bankQuantity} onChange={(e) => setBankQuantity(parseInt(e.target.value) || 1)} className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-sm font-bold" />
                </div>
                <button onClick={handleBankSubmit} className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400"><Play className="w-5 h-5"/> Tạo Phòng Với {bankQuantity} Câu Hỏi</button>
              </div>
            )}

            {setupTab === 'upload' && (
              <div className="space-y-6 text-left max-w-md mx-auto p-6 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)]">
                <div className="text-center">
                  <button onClick={downloadSampleExcel} className="text-xs text-amber-500 font-bold underline hover:text-amber-400 flex items-center justify-center gap-1 mx-auto"><Download className="w-3 h-3"/> Tải File Excel Mẫu</button>
                </div>
                <div className="border-2 border-dashed border-[var(--border-card)] rounded-2xl p-8 text-center bg-[var(--bg-card)] relative hover:border-amber-500/50 transition-colors">
                  <input type="file" accept=".xlsx,.csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <FileSpreadsheet className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-sm font-bold">Kéo thả hoặc nhấn để chọn file</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Hỗ trợ .xlsx, .csv (Tối đa 100 câu, Max 2MB)</p>
                </div>
                {uploadError && <div className="text-xs text-red-500 font-bold text-center bg-red-500/10 p-2 rounded-lg">{uploadError}</div>}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Render Host Console
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-card)]">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> GLV Host Live Controller
            </span>
            <h1 className="font-serif font-black text-3xl text-[var(--text-main)] mt-2">Bảng Điều Khiển Phòng Thi</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">Dữ liệu câu hỏi sẽ tự động bị xóa khỏi máy chủ khi bạn đóng trang này.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Mã PIN:</span>
              <span className="font-mono font-black text-xl text-amber-400">{roomPin || '...'}</span>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold text-xs border uppercase tracking-wider ${
              roomStatus === 'live' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
              : roomStatus === 'paused' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-[var(--text-muted)]'
            }`}>
              {roomStatus === 'live' ? '● Đang Thi Đấu' : roomStatus === 'paused' ? '⏸️ Tạm Dừng' : '⏳ Phòng Chờ'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleStartRoom}
            disabled={roomStatus !== 'waiting'}
            className="p-5 rounded-2xl border text-left font-bold bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4"><Play className="w-5 h-5" /></div>
            Bắt Đầu Trận Đấu ({questions.length} câu)
          </button>

          <button
            onClick={handlePauseRoom}
            disabled={roomStatus === 'waiting' || roomStatus === 'gameover'}
            className="p-5 rounded-2xl border text-left font-bold bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-card)] hover:border-amber-500 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4"><Pause className="w-5 h-5 text-amber-500" /></div>
            {roomStatus === 'paused' ? 'Tiếp Tục' : 'Tạm Dừng'}
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={roomStatus === 'waiting' || roomStatus === 'gameover' || timeLeft > 0}
            className="p-5 rounded-2xl border text-left font-bold bg-amber-500 text-slate-950 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4"><ArrowRight className="w-5 h-5" /></div>
            Câu Hỏi Tiếp Theo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl relative">
                {roomStatus === 'live' ? (
                  <>
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-amber-500 uppercase">Câu {currentQIndex + 1}/{questions.length}</span>
                        <span className={`font-mono text-xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>{timeLeft}s</span>
                     </div>
                     <h3 className="font-serif font-black text-2xl mb-6">{questions[currentQIndex]?.questionText}</h3>
                     <div className="grid grid-cols-2 gap-4">
                       {questions[currentQIndex]?.options.map((opt, i) => (
                         <div key={i} className={`p-4 rounded-xl border ${timeLeft === 0 && i === questions[currentQIndex].correctAnswerIndex ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-[var(--border-card)]'}`}>{opt}</div>
                       ))}
                     </div>
                  </>
                ) : (
                  <div className="py-20 text-center text-slate-500">Chưa bắt đầu. Xin vui lòng mời học viên nhập PIN <strong>{roomPin}</strong> để vào phòng.</div>
                )}
              </div>
           </div>

           <div className="space-y-4">
             <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5 text-amber-500" /> Bảng Xếp Hạng ({participants.length})</h3>
             <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] p-4 max-h-[500px] overflow-y-auto space-y-3">
               {participants.map((p, idx) => (
                 <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl animate-fadeIn">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{idx + 1}</div>
                     <div>
                       <div className="font-bold text-sm truncate max-w-[150px]">{p.name}</div>
                       <div className="text-xs text-amber-500 flex items-center gap-1"><Trophy className="w-3 h-3"/> {p.score}</div>
                     </div>
                   </div>
                 </div>
               ))}
               {participants.length === 0 && <div className="text-center text-xs text-slate-500 p-4">Chưa có ai tham gia.</div>}
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}


