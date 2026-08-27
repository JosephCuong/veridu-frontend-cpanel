'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Database, 
  UploadCloud, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  FileText, 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Download, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  Layers,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { getStoredUser } from '@/lib/auth';

export default function QuizBankStudioPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'import' | 'create'>('list');
  
  // List State
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Import State
  const [importInputMode, setImportInputMode] = useState<'file' | 'url' | 'paste'>('file');
  const [sheetUrl, setSheetUrl] = useState('');
  const [pastedCsv, setPastedCsv] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Single Question Creation State
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    subject: 'Giáo Lý',
    difficulty: 'Dễ',
    grade_level: 'song-dao',
    bible_book: '',
    bible_topic: '',
    options: ['', '', '', ''],
    correct_answer: 'A',
    explanation: '',
    hint: ''
  });

  useEffect(() => {
    setUser(getStoredUser());
    loadQuestions();
  }, [page, subjectFilter, difficultyFilter, gradeFilter]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        subject: subjectFilter,
        difficulty: difficultyFilter,
        grade_level: gradeFilter,
        search: search
      });
      const res = await fetch(`/api/quiz-bank/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setTotalQuestions(data.total);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  // CSV Parser Utility
  const parseCSVText = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quotes with regex
      const row: string[] = [];
      let inQuotes = false;
      let currentVal = '';

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.trim().replace(/^["']|["']$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim().replace(/^["']|["']$/g, ''));

      if (row.length >= 8) {
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] || '';
        });

        const correctAns = (obj['DapAnDung'] || obj['correct_answer'] || 'A').toUpperCase();
        const ansMap: any = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

        result.push({
          title: obj['TieuDe'] || obj['title'] || row[0],
          subject: obj['PhanMon'] || obj['subject'] || 'Giáo Lý',
          difficulty: obj['DoKho'] || obj['difficulty'] || 'Dễ',
          grade_level: obj['KhoiLop'] || obj['grade_level'] || 'song-dao',
          bible_book: obj['SachKT'] || obj['bible_book'] || '',
          bible_topic: obj['ChuDeKT'] || obj['bible_topic'] || '',
          options: [
            obj['DapAnA'] || row[7] || '',
            obj['DapAnB'] || row[8] || '',
            obj['DapAnC'] || row[9] || '',
            obj['DapAnD'] || row[10] || ''
          ].filter(Boolean),
          correct_answer: correctAns,
          answer_index: ansMap[correctAns] !== undefined ? ansMap[correctAns] : 0,
          explanation: obj['GiaiThich'] || obj['explanation'] || '',
          hint: obj['GoiY'] || obj['hint'] || ''
        });
      }
    }
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSVText(content);
      setParsedPreview(parsed);
      setImportStatus(`Đã phân tích thành công ${parsed.length} câu hỏi từ tệp ${file.name}`);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleFetchGoogleSheet = async () => {
    if (!sheetUrl) return;
    try {
      setImportStatus('Đang tải dữ liệu từ Google Sheets...');
      let csvUrl = sheetUrl;
      if (sheetUrl.includes('/edit')) {
        csvUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
      }

      const res = await fetch(csvUrl);
      const text = await res.text();
      const parsed = parseCSVText(text);
      setParsedPreview(parsed);
      setImportStatus(`Đã trích xuất thành công ${parsed.length} câu hỏi từ Google Sheets!`);
    } catch (e: any) {
      setImportStatus(`Lỗi khi đọc Google Sheet: ${e.message}. Hãy chắc chắn bạn đã Bật chia sẻ quyền 'Bất kỳ ai có liên kết đều có thể xem'.`);
    }
  };

  const handlePasteCsvParse = () => {
    if (!pastedCsv) return;
    const parsed = parseCSVText(pastedCsv);
    setParsedPreview(parsed);
    setImportStatus(`Đã phân tích ${parsed.length} câu hỏi từ văn bản dán!`);
  };

  const executeBatchImport = async () => {
    if (parsedPreview.length === 0) return;
    setIsImporting(true);
    setImportStatus('Đang nạp vào Supabase...');

    try {
      const res = await fetch('/api/quiz-bank/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedPreview })
      });

      const data = await res.json();
      if (data.success) {
        setImportStatus(`🎉 ${data.message}`);
        setParsedPreview([]);
        setPastedCsv('');
        setSheetUrl('');
        loadQuestions();
        setTimeout(() => setActiveTab('list'), 1500);
      } else {
        setImportStatus(`❌ Lỗi: ${data.error || data.message}`);
      }
    } catch (e: any) {
      setImportStatus(`❌ Lỗi kết nối: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi Ngân hàng đề?')) return;
    try {
      const res = await fetch(`/api/quiz-bank/delete?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setTotalQuestions(prev => prev - 1);
      }
    } catch (e) {}
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/quiz-bank/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion)
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? data.question : q));
        setEditingQuestion(null);
      }
    } catch (e) {} finally {
      setSaveLoading(false);
    }
  };

  const handleCreateSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title || newQuestion.options.some(o => !o.trim())) {
      alert('Vui lòng nhập đầy đủ tiêu đề và 4 đáp án');
      return;
    }

    try {
      const res = await fetch('/api/quiz-bank/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: [newQuestion] })
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo câu hỏi mới thành công!');
        setNewQuestion({
          title: '',
          subject: 'Giáo Lý',
          difficulty: 'Dễ',
          grade_level: 'song-dao',
          bible_book: '',
          bible_topic: '',
          options: ['', '', '', ''],
          correct_answer: 'A',
          explanation: '',
          hint: ''
        });
        loadQuestions();
        setActiveTab('list');
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans select-none pb-24 pt-28 sm:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── 1. HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                ✦ SIÊU NGÂN HÀNG DỮ LIỆU GIÁO LÝ ✦
              </span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)] mt-1 flex items-center gap-2.5">
              <Database className="w-7 h-7 text-amber-500" />
              <span>Studio Ngân Hàng Câu Hỏi Giáo Lý</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif mt-1">
              Quản trị, phân loại, nhập xuất CSV / Google Sheets và tự động cấp phát câu hỏi cho Đấu Trường Quiz, Game Chinh Phục Chân Lý &amp; Ải 2D.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-card)] shadow-sm">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Danh Sách ({totalQuestions})</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Nhập CSV / Sheet</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Soạn Câu Hỏi</span>
            </button>
          </div>
        </div>

        {/* ── 2. TAB 1: LIST & SEARCH ── */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md flex flex-wrap items-center justify-between gap-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm nội dung câu hỏi..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold cursor-pointer"
                >
                  Tìm
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={gradeFilter}
                  onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] font-serif"
                >
                  <option value="all">Tất cả Khối Lớp</option>
                  <option value="song-dao">Sống Đạo (11-14 tuổi)</option>
                  <option value="them-suc">Thêm Sức</option>
                  <option value="xung-toi">Rước Lễ / Xưng Tội</option>
                  <option value="khai-tam">Khai Tâm</option>
                  <option value="vao-doi">Vào Đời</option>
                </select>

                <select
                  value={difficultyFilter}
                  onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] font-serif"
                >
                  <option value="all">Tất cả Độ Khó</option>
                  <option value="Dễ">Dễ (Hành Trình Ải 1-4)</option>
                  <option value="Trung Bình">Trung Bình (Ải 5-8)</option>
                  <option value="Khó">Khó (Ải 9-12 / Triệu Phú)</option>
                </select>

                <select
                  value={subjectFilter}
                  onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] font-serif"
                >
                  <option value="all">Tất cả Phân Môn</option>
                  <option value="Giáo Lý">Giáo Lý</option>
                  <option value="Kinh Thánh">Kinh Thánh</option>
                  <option value="Phụng Vụ">Phụng Vụ</option>
                  <option value="Hành Các Thánh">Hành Các Thánh</option>
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-serif">
                  <thead>
                    <tr className="border-b border-[var(--border-card)] bg-amber-500/5 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4 min-w-[300px]">Nội Dung Câu Hỏi</th>
                      <th className="py-3.5 px-4 w-32">Phân Môn &amp; Lớp</th>
                      <th className="py-3.5 px-4 w-28">Độ Khó</th>
                      <th className="py-3.5 px-4 min-w-[220px]">Đáp Án Đúng</th>
                      <th className="py-3.5 px-4 w-24 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card)]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                          <span>Đang tải ngân hàng câu hỏi...</span>
                        </td>
                      </tr>
                    ) : questions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                          Chưa có câu hỏi nào khớp với bộ lọc. Hãy chuyển qua tab "Nhập CSV" để nạp thêm!
                        </td>
                      </tr>
                    ) : (
                      questions.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-amber-500/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-center text-[var(--text-muted)]">
                            {(page - 1) * 25 + idx + 1}
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <strong className="text-xs sm:text-sm text-[var(--text-main)] block font-serif">
                              {q.title}
                            </strong>
                            {q.explanation && (
                              <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-1">
                                💡 {q.explanation}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <span className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-card)] text-[10px] font-bold text-amber-600 dark:text-amber-400 block w-max">
                              {q.subject || 'Giáo Lý'}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block">
                              {q.grade_level}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.difficulty === 'Dễ'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : q.difficulty === 'Trung Bình'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}>
                              {q.difficulty}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                                {q.correct_answer}
                              </span>
                              <span className="line-clamp-1">
                                {q.options?.[q.answer_index] || q.options?.[0]}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10 transition cursor-pointer"
                                title="Sửa câu hỏi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                title="Xóa câu hỏi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs font-serif">
                <span className="text-[var(--text-muted)]">
                  Hiển thị trang {page} / {Math.max(1, Math.ceil(totalQuestions / 25))} ({totalQuestions} câu hỏi)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page * 25 >= totalQuestions}
                    onClick={() => setPage(prev => prev + 1)}
                    className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── 3. TAB 2: IMPORT CSV / GOOGLE SHEETS ── */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            
            {/* Mode Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setImportInputMode('file')}
                className={`p-5 rounded-3xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  importInputMode === 'file'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                    : 'border-[var(--border-card)] bg-[var(--bg-card)]'
                }`}
              >
                <UploadCloud className="w-6 h-6 text-amber-500 mb-2" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">1. Tải Lên File CSV</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-0.5">Kéo thả tệp CSV từ máy tính</p>
                </div>
              </button>

              <button
                onClick={() => setImportInputMode('url')}
                className={`p-5 rounded-3xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  importInputMode === 'url'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                    : 'border-[var(--border-card)] bg-[var(--bg-card)]'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-500 mb-2" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">2. Nhập Google Sheets</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-0.5">Dán link Google Sheet công khai</p>
                </div>
              </button>

              <button
                onClick={() => setImportInputMode('paste')}
                className={`p-5 rounded-3xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                  importInputMode === 'paste'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                    : 'border-[var(--border-card)] bg-[var(--bg-card)]'
                }`}
              >
                <FileText className="w-6 h-6 text-indigo-500 mb-2" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">3. Dán Trực Tiếp CSV</h4>
                  <p className="text-xs text-[var(--text-muted)] font-serif mt-0.5">Copy &amp; Paste nội dung bảng</p>
                </div>
              </button>
            </div>

            {/* Input Form based on Mode */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-5">
              
              {importInputMode === 'file' && (
                <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 rounded-3xl p-8 text-center space-y-3 bg-[var(--bg-main)] transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                  <div>
                    <strong className="text-sm font-serif font-bold text-[var(--text-main)] block">
                      Kéo thả tệp .CSV vào đây hoặc bấm để chọn tệp
                    </strong>
                    <span className="text-xs text-[var(--text-muted)] font-serif">
                      Hỗ trợ định dạng: TieuDe,Loai,PhanMon,DoKho,KhoiLop,DapAnA,DapAnB,DapAnC,DapAnD,DapAnDung...
                    </span>
                  </div>
                </div>
              )}

              {importInputMode === 'url' && (
                <div className="space-y-3">
                  <label className="text-xs font-serif font-bold text-[var(--text-main)] block">
                    Đường dẫn Google Sheets (Bật chia sẻ: 'Bất kỳ ai có liên kết đều có thể xem')
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleFetchGoogleSheet}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold shadow-md cursor-pointer"
                    >
                      Đọc Dữ Liệu
                    </button>
                  </div>
                </div>
              )}

              {importInputMode === 'paste' && (
                <div className="space-y-3">
                  <label className="text-xs font-serif font-bold text-[var(--text-main)] block">
                    Dán văn bản CSV (Có dòng tiêu đề đầu tiên)
                  </label>
                  <textarea
                    rows={6}
                    value={pastedCsv}
                    onChange={(e) => setPastedCsv(e.target.value)}
                    placeholder="TieuDe,Loai,PhanMon,DoKho,KhoiLop,DapAnA,DapAnB,DapAnC,DapAnD,DapAnDung,GiaiThich\nChúa Giê-su sinh ra ở đâu?,trac_nghiem_1,Giáo Lý,Dễ,song-dao,Bê-lem,Na-da-rét,Giê-ru-sa-lem,Ai Cập,A,..."
                    className="w-full p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handlePasteCsvParse}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold cursor-pointer"
                  >
                    Phân Tích Văn Bản
                  </button>
                </div>
              )}

              {importStatus && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-serif font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

            </div>

            {/* Data Preview Grid */}
            {parsedPreview.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                      Bảng Xem Trước Dữ Liệu ({parsedPreview.length} câu hỏi)
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-serif">
                      Kiểm tra lại dữ liệu trước khi bấm nạp vào hệ thống
                    </p>
                  </div>

                  <button
                    onClick={executeBatchImport}
                    disabled={isImporting}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-serif font-black shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isImporting ? 'Đang Nạp...' : 'Nạp 1 Chạm Vào Supabase'}</span>
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-2xl border border-[var(--border-card)]">
                  <table className="w-full text-left text-xs font-serif divide-y divide-[var(--border-card)]">
                    <thead className="bg-amber-500/10 sticky top-0">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Câu Hỏi</th>
                        <th className="p-3">Độ Khó</th>
                        <th className="p-3">Đáp Án Đúng</th>
                        <th className="p-3">Giải Thích</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-card)] bg-[var(--bg-main)]">
                      {parsedPreview.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-mono text-[var(--text-muted)]">{idx + 1}</td>
                          <td className="p-3 font-bold max-w-xs truncate">{item.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold">
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-emerald-500">
                            {item.correct_answer}: {item.options?.[item.answer_index]}
                          </td>
                          <td className="p-3 text-[var(--text-muted)] max-w-xs truncate">{item.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── 4. TAB 3: CREATE SINGLE QUESTION ── */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-5">
            <h3 className="font-serif font-bold text-lg text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
              Soạn Câu Hỏi Giáo Lý Mới
            </h3>

            <form onSubmit={handleCreateSingleQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-serif font-bold text-[var(--text-main)] block mb-1">
                  Nội Dung Câu Hỏi *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="Nhập câu hỏi..."
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Phân Môn</label>
                  <select
                    value={newQuestion.subject}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                  >
                    <option value="Giáo Lý">Giáo Lý</option>
                    <option value="Kinh Thánh">Kinh Thánh</option>
                    <option value="Phụng Vụ">Phụng Vụ</option>
                    <option value="Hành Các Thánh">Hành Các Thánh</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Độ Khó</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung Bình">Trung Bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-serif font-bold text-[var(--text-muted)] block mb-1">Khối Lớp</label>
                  <select
                    value={newQuestion.grade_level}
                    onChange={(e) => setNewQuestion({ ...newQuestion, grade_level: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                  >
                    <option value="song-dao">Sống Đạo</option>
                    <option value="them-suc">Thêm Sức</option>
                    <option value="xung-toi">Xưng Tội / Rước Lễ</option>
                    <option value="khai-tam">Khai Tâm</option>
                  </select>
                </div>
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-serif font-bold text-[var(--text-main)] block">
                  Bốn Phương Án Trả Lời &amp; Đánh Dấu Đáp Án Đúng:
                </label>
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <div key={letter} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewQuestion({ ...newQuestion, correct_answer: letter })}
                      className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition ${
                        newQuestion.correct_answer === letter
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)]'
                      }`}
                      title={`Chọn ${letter} là đáp án đúng`}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      required
                      value={newQuestion.options[idx]}
                      onChange={(e) => {
                        const newOpts = [...newQuestion.options];
                        newOpts[idx] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOpts });
                      }}
                      placeholder={`Đáp án ${letter}...`}
                      className="flex-1 p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-serif font-bold text-[var(--text-main)] block mb-1">
                  Lời Giải Thích / Trích Dẫn Giáo Lý (GLHTCG)
                </label>
                <textarea
                  rows={2}
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Theo GLHTCG số 1716..."
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-black shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Lưu Câu Hỏi Vào Ngân Hàng
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── 5. EDIT MODAL ── */}
        {editingQuestion && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-amber-500 shadow-2xl text-[var(--text-main)] space-y-4 animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setEditingQuestion(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif font-bold text-lg text-amber-500">
                Hiệu Đính Câu Hỏi #{editingQuestion.id}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Tiêu Đề Câu Hỏi</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.title}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] block text-[var(--text-muted)]">Phân Môn</label>
                    <input
                      type="text"
                      value={editingQuestion.subject}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                      className="w-full p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block text-[var(--text-muted)]">Độ Khó</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                      className="w-full p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung Bình">Trung Bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] block text-[var(--text-muted)]">Khối Lớp</label>
                    <input
                      type="text"
                      value={editingQuestion.grade_level}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, grade_level: e.target.value })}
                      className="w-full p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Lời Giải Thích</label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-main)] text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md"
                >
                  {saveLoading ? 'Đang Lưu...' : 'Cập Nhật'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
