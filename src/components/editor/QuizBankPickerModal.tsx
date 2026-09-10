'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Check, 
  Plus, 
  HelpCircle, 
  Filter, 
  Sparkles,
  Award,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';

interface QuizBankQuestion {
  id: number;
  title: string;
  options: string[];
  correct_answer?: string;
  answer_index?: number;
  explanation?: string;
  subject?: string;
  difficulty?: string;
  bible_book?: string;
  bible_topic?: string;
}

interface QuizBankPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertQuestions: (questions: Array<{
    id: number;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }>) => void;
}

export default function QuizBankPickerModal({
  isOpen,
  onClose,
  onInsertQuestions,
}: QuizBankPickerModalProps) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [questions, setQuestions] = useState<QuizBankQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadQuestions() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (subject && subject !== 'all') params.append('subject', subject);
        if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
        params.append('limit', '50');

        const res = await fetch(`/api/quiz-bank/list?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error('Error fetching quiz bank:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadQuestions();
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, search, subject, difficulty]);

  if (!isOpen) return null;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q.id));
    }
  };

  const handleConfirmInsert = () => {
    const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));
    const formatted = selectedQuestions.map((q, idx) => {
      // Find correct index
      let correctIdx = 0;
      if (typeof q.answer_index === 'number') {
        correctIdx = q.answer_index;
      } else if (q.correct_answer && Array.isArray(q.options)) {
        const found = q.options.findIndex(opt => opt.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase());
        if (found !== -1) correctIdx = found;
      }

      return {
        id: Date.now() + idx,
        question: q.title,
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
        correct_index: correctIdx,
        explanation: q.explanation || (q.bible_book ? `Tham chiếu Kinh Thánh: ${q.bible_book}` : '')
      };
    });

    onInsertQuestions(formatted);
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-stone-900 border border-amber-500/30 shadow-2xl overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
                Ngân Hàng 230 Câu Hỏi Giáo Lý & Kinh Thánh
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                  {questions.length} câu
                </span>
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                Tra cứu, lọc theo chủ đề và nạp trực tiếp vào phần trắc nghiệm bài học.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-900/80 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo nội dung câu hỏi, từ khóa, sách Kinh Thánh..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950/60 border border-stone-700/80 focus:border-amber-500 focus:outline-hidden text-sm text-stone-200 placeholder:text-stone-500"
            />
          </div>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950/60 border border-stone-700/80 text-sm text-stone-300 focus:border-amber-500 focus:outline-hidden"
          >
            <option value="all">Tất cả môn học</option>
            <option value="kinh-thanh">Kinh Thánh</option>
            <option value="giao-ly">Giáo Lý Căn Bản</option>
            <option value="phung-vu">Phụng Vụ & Bí Tích</option>
            <option value="lich-su-giao-hoi">Lịch Sử Giáo Hội</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950/60 border border-stone-700/80 text-sm text-stone-300 focus:border-amber-500 focus:outline-hidden"
          >
            <option value="all">Mọi độ khó</option>
            <option value="easy">Cơ Bản (Easy)</option>
            <option value="medium">Trung Cấp (Medium)</option>
            <option value="hard">Nâng Cao (Hard)</option>
          </select>

          {questions.length > 0 && (
            <button
              onClick={selectAll}
              className="px-3 py-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-xs text-stone-300 flex items-center gap-1.5 transition-colors"
            >
              {selectedIds.length === questions.length ? (
                <>
                  <CheckSquare className="w-4 h-4 text-amber-400" /> Bỏ chọn tất cả
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-stone-400" /> Chọn tất cả ({questions.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
          {loading ? (
            <div className="py-16 text-center text-stone-400">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Đang tải ngân hàng câu hỏi...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <HelpCircle className="w-10 h-10 text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Không tìm thấy câu hỏi phù hợp bộ lọc.</p>
              <p className="text-xs text-stone-500 mt-1">Hãy thử tìm từ khóa khác hoặc bỏ chọn môn học.</p>
            </div>
          ) : (
            questions.map((q) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5'
                      : 'bg-stone-950/40 border-stone-800/80 hover:border-stone-700 hover:bg-stone-950/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="pt-0.5">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-md bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border border-stone-600 bg-stone-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {q.subject && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-800 text-stone-300 border border-stone-700/60">
                            {q.subject}
                          </span>
                        )}
                        {q.bible_book && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {q.bible_book}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            q.difficulty === 'hard' 
                              ? 'bg-red-500/15 text-red-300 border border-red-500/30' 
                              : q.difficulty === 'medium'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-stone-100 leading-snug">
                        {q.title}
                      </h4>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = (typeof q.answer_index === 'number' && q.answer_index === oIdx) ||
                              (q.correct_answer && opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase());
                            return (
                              <div
                                key={oIdx}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                                    : 'bg-stone-900/60 border-stone-800/80 text-stone-400'
                                }`}
                              >
                                <span className="font-mono font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                                <span className="truncate">{opt}</span>
                                {isCorrect && <Check className="w-3 h-3 text-emerald-400 ml-auto shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-stone-400 italic mt-2 line-clamp-2">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/80">
          <div className="text-xs text-stone-400">
            Đã chọn <strong className="text-amber-400 font-mono text-sm">{selectedIds.length}</strong> câu hỏi
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmInsert}
              disabled={selectedIds.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nạp {selectedIds.length > 0 ? `${selectedIds.length} câu đã chọn` : 'vào bài học'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
