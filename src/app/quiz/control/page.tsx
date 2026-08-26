'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getStoredUser, UserProfile } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';
import { 
  QuizQuestion, 
  QuizRoom, 
  ParticipantState, 
  fetchQuizQuestions, 
  createQuizRoom, 
  updateQuizRoom, 
  BIBLICAL_AVATARS,
  shuffleArray 
} from '@/lib/quiz';
import * as XLSX from 'xlsx';
import { 
  Play, 
  Pause, 
  Lock, 
  Unlock, 
  ArrowRight, 
  UserX, 
  Users, 
  ShieldAlert, 
  Trophy, 
  RotateCcw, 
  Key, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Database,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';

export default function GLVRoomControlPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Setup Wizard State
  const [roomTitle, setRoomTitle] = useState('Đấu Trường Giáo Lý & Kinh Thánh VERIDU');
  const [progressionMode, setProgressionMode] = useState<'host_manual' | 'auto_timer'>('host_manual');
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [setupTab, setSetupTab] = useState<'bank' | 'upload'>('bank');
  const [bankCategory, setBankCategory] = useState('Tất cả');
  const [bankQuantity, setBankQuantity] = useState(10);
  const [uploadedQuestions, setUploadedQuestions] = useState<QuizQuestion[]>([]);
  const [uploadError, setUploadError] = useState('');

  // Active Room State
  const [roomPin, setRoomPin] = useState('');
  const [roomStatus, setRoomStatus] = useState<'setup' | 'waiting' | 'question_active' | 'showing_answer' | 'leaderboard' | 'ended'>('setup');
  const [isLocked, setIsLocked] = useState(false);
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roomChannelRef = useRef<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // ── Setup & Creation ──
  const generateRandomPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateRoom = async () => {
    let finalQuestions: QuizQuestion[] = [];

    if (setupTab === 'bank') {
      const data = await fetchQuizQuestions(bankCategory === 'Tất cả' ? undefined : bankCategory, 50);
      if (data.length === 0) {
        alert('Không tìm thấy câu hỏi trong ngân hàng với chủ đề đã chọn!');
        return;
      }
      finalQuestions = shuffleArray(data).slice(0, bankQuantity);
    } else {
      if (uploadedQuestions.length === 0) {
        alert('Vui lòng tải lên tệp Excel/CSV chứa danh sách câu hỏi hợp lệ!');
        return;
      }
      finalQuestions = uploadedQuestions;
    }

    const pin = generateRandomPin();
    const created = await createQuizRoom({
      roomPin: pin,
      title: roomTitle,
      hostId: user?.id,
      hostName: user?.displayName || user?.christianName || user?.username || 'Quản Trò GLV',
      progressionMode: progressionMode,
      timePerQuestionSeconds: timePerQuestion,
      maxParticipants: maxParticipants,
      questions: finalQuestions
    });

    if (created) {
      setRoomPin(pin);
      setQuestions(finalQuestions);
      setRoomStatus('waiting');
    } else {
      alert('Không thể tạo phòng thi. Vui lòng thử lại.');
    }
  };

  // ── Excel / CSV File Upload Handler ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

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

        if (data.length === 0) {
          setUploadError('Tệp rỗng hoặc không đúng định dạng mẫu.');
          return;
        }

        const parsed: QuizQuestion[] = data.map((row: any, idx: number) => {
          const correctLetter = (row.DapAnDung || row['Đáp án đúng'] || row.Correct || 'A').toString().toUpperCase().trim();
          let cIdx = 0;
          if (correctLetter === 'B' || correctLetter === '2') cIdx = 1;
          if (correctLetter === 'C' || correctLetter === '3') cIdx = 2;
          if (correctLetter === 'D' || correctLetter === '4') cIdx = 3;

          return {
            id: `upload-${idx + 1}`,
            category: row.ChuDe || row['Chủ đề'] || 'Tự Tạo',
            questionText: row.CauHoi || row['Câu hỏi'] || row.Title || `Câu hỏi ${idx + 1}`,
            options: [
              row.DapAnA || row['Đáp án A'] || row.A || 'Lựa chọn A',
              row.DapAnB || row['Đáp án B'] || row.B || 'Lựa chọn B',
              row.DapAnC || row['Đáp án C'] || row.C || 'Lựa chọn C',
              row.DapAnD || row['Đáp án D'] || row.D || 'Lựa chọn D'
            ],
            correctAnswerIndex: cIdx,
            explanation: row.GiaiThich || row['Giải thích'] || '',
            scriptureRef: row.TrichDan || row['Trích dẫn'] || ''
          };
        });

        setUploadedQuestions(parsed);
      } catch (err: any) {
        setUploadError('Lỗi đọc tệp Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Sample Excel Template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Chủ đề': 'Kinh Thánh',
        'Câu hỏi': 'Thiên Chúa đã ban Mười Điều Răn cho ai và tại ngọn núi nào?',
        'Đáp án A': 'Môsê tại Núi Sinai',
        'Đáp án B': 'Áp-ra-ham tại Núi Mô-ri-gia',
        'Đáp án C': 'Vua Đavít tại Núi Si-on',
        'Đáp án D': 'Tiên tri Ê-li-a tại Núi Cát-minh',
        'Đáp án đúng': 'A',
        'Giải thích': 'Môsê đón nhận Thập Giới trong hành trình Xuất Hành.',
        'Trích dẫn': 'Xh 20:1-17'
      },
      {
        'Chủ đề': 'Giáo Lý',
        'Câu hỏi': 'Bí tích nào là Nguồn gốc và Đỉnh cao của đời sống Kitô giáo?',
        'Đáp án A': 'Bí tích Thánh Thể',
        'Đáp án B': 'Bí tích Rửa Tội',
        'Đáp án C': 'Bí tích Thêm Sức',
        'Đáp án D': 'Bí tích Hòa Giải',
        'Đáp án đúng': 'A',
        'Giải thích': 'Hiến chế Lumen Gentium số 11 khẳng định Thánh Thể là tột đỉnh.',
        'Trích dẫn': 'LG 11'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Cau_Hoi_Quiz');
    XLSX.writeFile(wb, 'Mau_Cau_Hoi_Quiz_VERIDU.xlsx');
  };

  // ── Realtime WebSocket Broadcast Sync ──
  useEffect(() => {
    if (!roomPin || roomStatus === 'setup') return;

    const channel = supabase.channel(`room:${roomPin}`, {
      config: {
        broadcast: { ack: true },
        presence: { key: `host_${user?.id || 'admin'}` }
      }
    });

    roomChannelRef.current = channel;

    // Presence sync for connected participants
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const playerList: ParticipantState[] = [];

        Object.keys(state).forEach((key) => {
          if (!key.startsWith('host_')) {
            const presences: any = state[key];
            if (presences && presences[0]) {
              playerList.push({
                id: key,
                userId: presences[0].userId,
                name: presences[0].name || 'Thí sinh',
                avatarUrl: presences[0].avatarUrl,
                characterSlug: presences[0].characterSlug,
                characterName: presences[0].characterName,
                score: presences[0].score || 0,
                streak: presences[0].streak || 0,
                isFlagged: presences[0].isFlagged || false
              });
            }
          }
        });

        setParticipants(playerList);
      })
      .on('broadcast', { event: 'submit_answer' }, (payload) => {
        const { playerId, answerIndex, timeRemaining, isCorrect, scoreAdded } = payload.payload;
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.id === playerId || p.userId === playerId || p.name === playerId) {
              const newScore = p.score + (isCorrect ? scoreAdded : 0);
              const newStreak = isCorrect ? p.streak + 1 : 0;
              return {
                ...p,
                score: newScore,
                streak: newStreak,
                lastAnswerIndex: answerIndex,
                isCorrect: isCorrect
              };
            }
            return p;
          })
        );
      })
      .subscribe();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [roomPin, roomStatus, user?.id]);

  // Broadcast state helper
  const broadcastRoomState = (status: string, extraData: any = {}) => {
    if (!roomChannelRef.current || !roomPin) return;

    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'sync_state',
      payload: {
        status,
        questionIndex: currentQIndex,
        questionData: questions[currentQIndex] || null,
        totalQuestions: questions.length,
        time: timeLeft,
        isLocked,
        ...extraData
      }
    });

    updateQuizRoom(roomPin, {
      status: status as any,
      current_question_index: currentQIndex,
      leaderboard: participants
    });
  };

  // ── Match Control Flows ──
  const handleStartMatch = () => {
    if (participants.length === 0) {
      if (!confirm('Chưa có thí sinh nào vào phòng. Bạn có chắc chắn muốn bắt đầu thi đấu không?')) {
        return;
      }
    }
    setCurrentQIndex(0);
    startQuestion(0);
  };

  const startQuestion = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setCurrentQIndex(index);
    setRoomStatus('question_active');
    setTimeLeft(timePerQuestion);

    broadcastRoomState('question_active', {
      questionIndex: index,
      questionData: questions[index],
      time: timePerQuestion,
      isShowingAnswer: false
    });

    let currentSec = timePerQuestion;
    timerRef.current = setInterval(() => {
      currentSec -= 1;
      setTimeLeft(currentSec);

      if (currentSec <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimeUp();
      }
    }, 1000);
  };

  const handleTimeUp = () => {
    if (progressionMode === 'auto_timer') {
      handleRevealAnswer();
      // Auto advance to Leaderboard after 5s
      setTimeout(() => {
        handleShowLeaderboard();
        // Auto advance to Next Question after 5s
        setTimeout(() => {
          if (currentQIndex + 1 < questions.length) {
            startQuestion(currentQIndex + 1);
          } else {
            handleEndMatch();
          }
        }, 5000);
      }, 5000);
    } else {
      handleRevealAnswer();
    }
  };

  const handleRevealAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRoomStatus('showing_answer');

    broadcastRoomState('showing_answer', {
      questionIndex: currentQIndex,
      questionData: questions[currentQIndex],
      isShowingAnswer: true,
      time: 0
    });
  };

  const handleShowLeaderboard = () => {
    setRoomStatus('leaderboard');
    broadcastRoomState('leaderboard', {
      questionIndex: currentQIndex,
      leaderboard: participants.sort((a, b) => b.score - a.score)
    });
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      startQuestion(currentQIndex + 1);
    } else {
      handleEndMatch();
    }
  };

  const handleEndMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRoomStatus('ended');
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    broadcastRoomState('ended', { leaderboard: sorted });
  };

  // Kick Participant
  const handleKickParticipant = (playerId: string) => {
    if (confirm('Bạn có chắc chắn muốn mời thí sinh này rời phòng thi?')) {
      roomChannelRef.current?.send({
        type: 'broadcast',
        event: 'kick_player',
        payload: { playerId }
      });
      setParticipants((prev) => prev.filter((p) => p.id !== playerId));
    }
  };

  // Sort participants by score
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans transition-colors duration-300 pt-24 sm:pt-28 md:pt-32 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1 w-full">
        
        {/* ── Top Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-3">
            <Link
              href="/quiz"
              className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
            >
              &larr; Về Đấu Trường Quiz
            </Link>
            <span className="text-slate-400">|</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Bảng Điều Khiển Quản Trò (Host Console)
            </div>
          </div>

          {roomPin && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-2xl bg-amber-500 text-slate-950 font-mono font-black text-sm tracking-widest shadow-md">
                PIN: {roomPin}
              </div>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-2 rounded-xl border transition ${
                  isLocked
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                }`}
                title={isLocked ? 'Phòng đang khóa' : 'Phòng đang mở'}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* ── STEP 1: SETUP WIZARD ── */}
        {roomStatus === 'setup' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            
            <div className="text-center space-y-2">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
                Thiết Lập Phòng Thi Đấu Trực Tiếp
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] italic">
                Cấu hình câu hỏi, thời gian và số lượng người tham gia cho lớp Giáo Lý hoặc Giáo Xứ.
              </p>
            </div>

            <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/20 shadow-2xl space-y-8">
              
              {/* Room Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                  1. Tên Phòng Thi / Đấu Trường:
                </label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="Ví dụ: Rung Chuông Vàng Giáo Lý Xứ Đoàn Đức Mẹ..."
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-serif font-bold transition"
                />
              </div>

              {/* Source Questions Tabs */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                  2. Nguồn Ngân Hàng Câu Hỏi:
                </label>

                <div className="flex rounded-2xl bg-[var(--bg-main)] p-1.5 border border-[var(--border-card)] max-w-md">
                  <button
                    type="button"
                    onClick={() => setSetupTab('bank')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      setupTab === 'bank'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" /> Ngân Hàng Supabase
                  </button>

                  <button
                    type="button"
                    onClick={() => setSetupTab('upload')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      setupTab === 'upload'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Tải Lên Excel / CSV
                  </button>
                </div>

                {/* Sub Tab: Bank */}
                {setupTab === 'bank' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)]">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)] block">Chủ đề câu hỏi:</span>
                      <select
                        value={bankCategory}
                        onChange={(e) => setBankCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                      >
                        <option value="Tất cả">Tất Cả Chủ Đề (30 Câu)</option>
                        <option value="Cựu Ước">Cựu Ước (10 Câu)</option>
                        <option value="Tân Ước">Tân Ước (10 Câu)</option>
                        <option value="Giáo Lý">Giáo Lý &amp; Bí Tích (5 Câu)</option>
                        <option value="Phụng Vụ">Phụng Vụ &amp; Lịch (5 Câu)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)] block">Số lượng câu hỏi thi đấu:</span>
                      <select
                        value={bankQuantity}
                        onChange={(e) => setBankQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                      >
                        <option value={5}>5 Câu hỏi</option>
                        <option value={10}>10 Câu hỏi (Khuyên dùng)</option>
                        <option value={15}>15 Câu hỏi</option>
                        <option value={20}>20 Câu hỏi</option>
                        <option value={30}>30 Câu hỏi (Toàn bộ)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Sub Tab: Upload */
                  <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <span className="text-xs font-bold text-[var(--text-main)]">Tải lên file câu hỏi tự soạn (.xlsx / .csv)</span>
                        <p className="text-[11px] text-[var(--text-muted)]">Hỗ trợ định dạng Excel chuẩn với các cột Chủ đề, Câu hỏi, Đáp án A, B, C, D, Đáp án đúng.</p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadSampleTemplate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold border border-amber-500/30 transition whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải File Mẫu
                      </button>
                    </div>

                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 file:cursor-pointer cursor-pointer"
                    />

                    {uploadError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                        {uploadError}
                      </div>
                    )}

                    {uploadedQuestions.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Đã nạp thành công {uploadedQuestions.length} câu hỏi từ tệp.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Match Rules: Mode & Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Progression Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    3. Cơ Chế Chuyển Câu:
                  </label>
                  <select
                    value={progressionMode}
                    onChange={(e) => setProgressionMode(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  >
                    <option value="host_manual">🎯 Quản trò điều khiển</option>
                    <option value="auto_timer">⏱️ Tự động đếm giờ &amp; chuyển</option>
                  </select>
                </div>

                {/* Time per question */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    4. Thời Gian Trả Lời:
                  </label>
                  <select
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  >
                    <option value={10}>10 Giây (Rất nhanh)</option>
                    <option value={15}>15 Giây (Nhanh)</option>
                    <option value={20}>20 Giây (Tiêu chuẩn)</option>
                    <option value={30}>30 Giây (Suy ngẫm)</option>
                    <option value={60}>60 Giây (Chuyên sâu)</option>
                  </select>
                </div>

                {/* Max participants */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    5. Giới Hạn Thí Sinh:
                  </label>
                  <select
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  >
                    <option value={20}>20 Thí sinh (Lớp nhỏ)</option>
                    <option value={50}>50 Thí sinh (Tiêu chuẩn)</option>
                    <option value={100}>100 Thí sinh (Giáo xứ)</option>
                    <option value={200}>200 Thí sinh (Đại hội)</option>
                  </select>
                </div>

              </div>

              {/* Submit Create Button */}
              <button
                type="button"
                onClick={handleCreateRoom}
                className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>KHỞI TẠO PHÒNG THI &amp; TẠO MÃ PIN &rarr;</span>
              </button>

            </div>

          </div>
        )}

        {/* ── STEP 2: LIVE HOST LOBBY (WAITING ROOM) ── */}
        {roomStatus === 'waiting' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Huge PIN Banner for Projection / Classroom Screen */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 via-[var(--bg-card)] to-amber-500/10 border-2 border-amber-500/50 shadow-2xl text-center space-y-4 relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500">
                  Mời Thí Sinh Truy Cập <strong className="underline font-mono">thapgia.com/quiz</strong> &amp; Nhập Mã PIN:
                </span>
                <h1 className="font-mono font-black text-6xl sm:text-8xl lg:text-9xl text-[var(--text-main)] tracking-widest drop-shadow-lg text-amber-500">
                  {roomPin}
                </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-muted)] font-semibold pt-2">
                <span>📚 Tổng số câu: <strong className="text-[var(--text-main)]">{questions.length}</strong></span>
                <span>&bull;</span>
                <span>⏱️ Thời gian mỗi câu: <strong className="text-[var(--text-main)]">{timePerQuestion}s</strong></span>
                <span>&bull;</span>
                <span>🎯 Chế độ: <strong className="text-[var(--text-main)]">{progressionMode === 'host_manual' ? 'Quản trò bấm chuyển' : 'Tự động'}</strong></span>
              </div>
            </div>

            {/* Participants Grid in Lobby */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-black text-xl text-[var(--text-main)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span>Danh Sách Thí Sinh Trong Phòng ({participants.length} / {maxParticipants})</span>
                </h2>

                <button
                  type="button"
                  onClick={handleStartMatch}
                  className="px-8 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-sm sm:text-base flex items-center gap-2 hover:bg-amber-400 transition shadow-xl shadow-amber-500/30 hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>BẮT ĐẦU THI ĐẤU &rarr;</span>
                </button>
              </div>

              {participants.length === 0 ? (
                <div className="py-16 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
                  <Clock className="w-10 h-10 text-amber-500 animate-spin mx-auto opacity-70" />
                  <p className="font-serif text-sm font-bold text-[var(--text-muted)]">
                    Đang đợi các thí sinh đăng nhập và tham gia phòng đấu...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/60 shadow-md text-center space-y-2 group relative transition-all"
                    >
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full mx-auto overflow-hidden border-2 border-amber-500/40 relative shadow-sm">
                        {p.avatarUrl ? (
                          <Image src={p.avatarUrl} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-amber-500/20 text-amber-500 font-black text-lg flex items-center justify-center">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-[var(--text-main)] block truncate">
                          {p.name}
                        </span>
                        {p.characterName && (
                          <span className="text-[10px] text-amber-500 font-semibold block truncate">
                            🛡️ {p.characterName}
                          </span>
                        )}
                      </div>

                      {/* Kick Button */}
                      <button
                        type="button"
                        onClick={() => handleKickParticipant(p.id)}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition"
                        title="Mời ra khỏi phòng"
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── STEP 3: LIVE MATCH RUNNER (QUESTION ACTIVE / SHOWING ANSWER) ── */}
        {(roomStatus === 'question_active' || roomStatus === 'showing_answer') && questions[currentQIndex] && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Status & Timer Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Câu {currentQIndex + 1} / {questions.length}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-bold">
                  {questions[currentQIndex].category}
                </span>
              </div>

              {/* Huge Timer */}
              <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-mono font-black text-xl shadow-inner ${
                timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-main)] text-amber-500 border border-amber-500/30'
              }`}>
                <Clock className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>

              {/* Action Controls for Host */}
              <div className="flex items-center gap-2">
                {roomStatus === 'question_active' ? (
                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Công Bố Đáp Án
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleShowLeaderboard}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-500 transition shadow-md"
                    >
                      <Trophy className="w-4 h-4" /> Bảng Phong Thần Top 5 &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition shadow-md"
                    >
                      <span>Câu Tiếp Theo</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Question Text Box */}
            <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500/40 shadow-2xl text-center space-y-4">
              <h2 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[var(--text-main)] leading-relaxed">
                {questions[currentQIndex].questionText}
              </h2>
            </div>

            {/* 4 Options Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[currentQIndex].options.map((opt, idx) => {
                const isCorrect = idx === questions[currentQIndex].correctAnswerIndex;
                const isRevealed = roomStatus === 'showing_answer';

                let btnStyle = 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-main)]';
                if (isRevealed) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-600/30 scale-[1.02] font-black';
                  } else {
                    btnStyle = 'bg-[var(--bg-card)] border-[var(--border-card)] opacity-40';
                  }
                }

                const letter = String.fromCharCode(65 + idx);

                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${btnStyle}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl font-black text-base flex items-center justify-center ${
                      isRevealed && isCorrect ? 'bg-white text-emerald-700' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {letter}
                    </div>
                    <span className="font-serif font-bold text-base sm:text-lg flex-1">
                      {opt}
                    </span>
                    {isRevealed && isCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation & Scripture Box (When revealed) */}
            {roomStatus === 'showing_answer' && (
              <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Giải Thích &amp; Trích Dẫn Kinh Thánh</span>
                </div>
                {questions[currentQIndex].scriptureRef && (
                  <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono text-xs font-bold">
                    📖 {questions[currentQIndex].scriptureRef}
                  </span>
                )}
                <p className="font-serif italic text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
                  &ldquo;{questions[currentQIndex].explanation}&rdquo;
                </p>
              </div>
            )}

          </div>
        )}

        {/* ── STEP 4: LIVE LEADERBOARD (BẢNG PHONG THẦN TOP 5) ── */}
        {roomStatus === 'leaderboard' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" /> Bảng Phong Thần
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-main)]">
                Bảng Xếp Hạng Sau Câu {currentQIndex + 1}
              </h2>
            </div>

            {/* Leaderboard Top List */}
            <div className="space-y-3">
              {sortedParticipants.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition shadow-md ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-500/20 via-[var(--bg-card)] to-amber-500/10 border-amber-500/60 shadow-amber-500/10'
                      : 'bg-[var(--bg-card)] border-[var(--border-card)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-card)]'
                    }`}>
                      #{idx + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500/30 relative shrink-0">
                      {p.avatarUrl ? (
                        <Image src={p.avatarUrl} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center">
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-serif font-bold text-base text-[var(--text-main)] block">
                        {p.name}
                      </span>
                      {p.characterName && (
                        <span className="text-xs text-amber-500 font-semibold">
                          🛡️ {p.characterName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score & Streak */}
                  <div className="text-right space-y-0.5">
                    <span className="font-mono font-black text-lg sm:text-xl text-amber-500">
                      {p.score.toLocaleString()} đ
                    </span>
                    {p.streak > 1 && (
                      <span className="text-[10px] font-bold text-orange-400 flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3 fill-current" /> {p.streak} Chuỗi Đúng
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Next Action Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-8 py-4 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-base flex items-center gap-2 hover:bg-amber-400 transition shadow-xl shadow-amber-500/20"
              >
                <span>{currentQIndex + 1 < questions.length ? 'Sang Câu Kế Tiếp' : 'Xem Bục Vinh Quang Tổng Kết'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}

        {/* ── STEP 5: FINAL PODIUM & GAME OVER ── */}
        {roomStatus === 'ended' && (
          <div className="max-w-4xl mx-auto space-y-12 text-center animate-fadeIn py-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-widest">
                <Trophy className="w-4 h-4" /> Bục Vinh Quang Chung Cuộc
              </div>
              <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)]">
                Chúc Mừng Các Chiến Binh Tri Thức!
              </h1>
            </div>

            {/* Podium Top 3 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6">
              
              {/* 2nd Place */}
              {sortedParticipants[1] && (
                <div className="space-y-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto overflow-hidden border-2 border-slate-300 relative shadow-lg">
                    {sortedParticipants[1].avatarUrl ? (
                      <Image src={sortedParticipants[1].avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center">🥈</div>
                    )}
                  </div>
                  <div className="p-4 rounded-t-3xl bg-slate-400/20 border border-slate-400/30 h-36 flex flex-col justify-between">
                    <span className="text-xs font-bold truncate block">{sortedParticipants[1].name}</span>
                    <span className="font-mono font-black text-sm text-slate-300">{sortedParticipants[1].score} đ</span>
                    <span className="text-xl font-black">🥈 Á Quân</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {sortedParticipants[0] && (
                <div className="space-y-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto overflow-hidden border-4 border-amber-500 relative shadow-2xl scale-110">
                    {sortedParticipants[0].avatarUrl ? (
                      <Image src={sortedParticipants[0].avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center">🥇</div>
                    )}
                  </div>
                  <div className="p-5 rounded-t-3xl bg-amber-500/20 border-2 border-amber-500/60 h-48 flex flex-col justify-between shadow-xl">
                    <span className="text-sm font-black truncate block text-amber-500">{sortedParticipants[0].name}</span>
                    <span className="font-mono font-black text-base text-amber-500">{sortedParticipants[0].score} đ</span>
                    <span className="text-2xl font-black">🥇 Quán Quân</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {sortedParticipants[2] && (
                <div className="space-y-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto overflow-hidden border-2 border-amber-700 relative shadow-lg">
                    {sortedParticipants[2].avatarUrl ? (
                      <Image src={sortedParticipants[2].avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-800 text-amber-100 font-bold flex items-center justify-center">🥉</div>
                    )}
                  </div>
                  <div className="p-4 rounded-t-3xl bg-amber-700/20 border border-amber-700/30 h-32 flex flex-col justify-between">
                    <span className="text-xs font-bold truncate block">{sortedParticipants[2].name}</span>
                    <span className="font-mono font-black text-sm text-amber-400">{sortedParticipants[2].score} đ</span>
                    <span className="text-lg font-black">🥉 Quý Quân</span>
                  </div>
                </div>
              )}

            </div>

            {/* Restart Actions */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setRoomStatus('setup');
                  setParticipants([]);
                  setQuestions([]);
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tạo Phòng Thi Mới</span>
              </button>

              <Link
                href="/quiz"
                className="px-6 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-sm font-bold hover:border-amber-500 transition"
              >
                Về Trang Chủ Quiz
              </Link>
            </div>

          </div>
        )}

      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setUser(getStoredUser());
          }}
        />
      )}
    </div>
  );
}
