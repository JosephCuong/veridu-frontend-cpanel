'use client';

import React, { useState } from 'react';
import { Course, Lesson } from '@/lib/api';
import { 
  CheckCircle2, Circle, Eye, EyeOff, ChevronRight, ChevronLeft, 
  Copy, BookOpen, MessageSquare, Edit3, Award, Share2, PlayCircle, Sparkles 
} from 'lucide-react';

interface LmsLessonPlayerProps {
  course: Course;
  currentLesson: Lesson;
}

export default function LmsLessonPlayer({ course, currentLesson }: LmsLessonPlayerProps) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion' | 'quiz'>('content');
  const [noteText, setNoteText] = useState('');
  const [isCompleted, setIsCompleted] = useState(currentLesson.isCompleted);
  const [copied, setCopied] = useState(false);

  const toggleCompleted = () => {
    setIsCompleted(!isCompleted);
  };

  const copyScripture = () => {
    navigator.clipboard.writeText(`${currentLesson.title}\n(${currentLesson.scriptureReference || ''})\n\n${(currentLesson.contentHtml || '').replace(/<[^>]*>?/gm, '')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* LMS Player Top Header Bar (HowKteam style) */}
      <div className={`border-b border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 flex items-center justify-between gap-4 transition-all duration-300 ${isFocusMode ? 'opacity-30 hover:opacity-100' : ''}`}>
        
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
            {course.category}
          </span>
          <h1 className="font-semibold text-sm sm:text-base text-[var(--text-main)] truncate max-w-md">
            {course.title}
          </h1>
        </div>

        {/* Progress Bar & Focus Mode Switch */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">Tiến trình: <strong>33%</strong> (4/12 bài)</span>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
              isFocusMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20' 
                : 'bg-slate-800 text-[var(--text-muted)] border-slate-700 hover:border-amber-500/50'
            }`}
          >
            {isFocusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isFocusMode ? 'Tắt Chế Độ Tập Trung' : 'Chế Độ Tập Trung (Focus)'}</span>
          </button>
        </div>
      </div>

      {/* Main LMS Layout Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR: Course Lesson Index (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="w-80 border-r border-[var(--border-card)] bg-[var(--bg-card)] overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-4 border-b border-[var(--border-card)]">
              <h2 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" /> Nội Dung Khóa Học
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">12 bài giảng • 6 giờ 30 phút</p>
            </div>

            {/* Chapter Accordion */}
            <div className="p-2 space-y-4">
              <div>
                <div className="px-3 py-2 text-xs font-bold text-amber-400 uppercase tracking-wider bg-[var(--bg-main)] rounded border border-[var(--border-card)] mb-2">
                  Chương I: Sáng Tạo & Lịch Sử Đầu Tiên
                </div>
                
                <div className="space-y-1">
                  {(course.lessons || []).map((les) => {
                    const isSelected = les.id === currentLesson.id;
                    return (
                      <button
                        key={les.id}
                        className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                          isSelected 
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-md' 
                            : 'hover:bg-slate-800/50 text-[var(--text-muted)] border border-transparent'
                        }`}
                      >
                        {les.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-snug line-clamp-2">{les.title}</p>
                          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">{les.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* CENTER MAIN VIEWPORT: Lesson Content & Scripture Viewer */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-8 transition-all ${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Lesson Title & Scripture Header */}
            <div className="space-y-3 pb-6 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <span>{currentLesson.chapterTitle}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[var(--text-muted)]">
                  {currentLesson.scriptureReference}
                </span>
              </div>

              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)] leading-tight">
                {currentLesson.title}
              </h1>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyScripture}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-muted)] text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép Trích Đoạn'}</span>
                  </button>

                  <button className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-muted)] text-xs font-medium flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Chia Sẻ</span>
                  </button>
                </div>

                <button 
                  onClick={toggleCompleted}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-amber-500 text-slate-950 border-amber-400 hover:scale-105'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleted ? 'Đã Hoàn Thành' : 'Đánh Dấu Hoàn Thành'}</span>
                </button>
              </div>
            </div>

            {/* Video / Audio Player Placeholder */}
            <div className="relative aspect-video rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden flex items-center justify-center group shadow-2xl">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
              <div className="relative z-10 text-center p-6 space-y-3">
                <PlayCircle className="w-16 h-16 text-amber-400 mx-auto group-hover:scale-110 transition-transform cursor-pointer" />
                <p className="text-sm font-semibold text-[var(--text-main)]">Video Giảng Giải: {currentLesson.title}</p>
                <span className="text-xs text-[var(--text-muted)]">Thời lượng: {currentLesson.duration}</span>
              </div>
            </div>

            {/* Lesson Body HTML Content */}
            <div 
              className="prose prose-invert max-w-none prose-amber prose-headings:font-serif prose-headings:text-[var(--text-main)] prose-p:text-[var(--text-muted)] prose-p:leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: currentLesson.contentHtml || '' }}
            />

            {/* Bottom Tabs: Personal Notes & Discussion & Quiz */}
            <div className="pt-8 border-t border-[var(--border-card)] space-y-4">
              <div className="flex gap-2 border-b border-[var(--border-card)] pb-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'content' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <BookOpen className="w-4 h-4" /> Suy Niệm Bài Học
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'notes' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <Edit3 className="w-4 h-4" /> Sổ Tay Ghi Chú
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'discussion' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Thảo Luận & Hỏi Đáp
                </button>
              </div>

              {/* Tab Content: Notebook */}
              {activeTab === 'notes' && (
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" /> Sổ Tay Suy Niệm Cá Nhân
                  </h3>
                  <textarea 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Viết cảm nhận, ý nghĩa Lời Chúa hoặc câu hỏi tâm đắc của bạn tại đây..."
                    className="w-full h-32 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  />
                  <button className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors">
                    Lưu Ghi Chú
                  </button>
                </div>
              )}

              {/* Tab Content: Discussion */}
              {activeTab === 'discussion' && (
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" /> Thảo Luận & Chia Sẻ Ý Kiến
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Tham gia trao đổi cùng cộng đồng học viên VERIDU.</p>
                  <input 
                    type="text"
                    placeholder="Gửi câu hỏi hoặc ý kiến của bạn..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-lg p-3 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Navigation Footer Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border-card)]">
              <button className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] text-xs font-bold flex items-center gap-2 hover:border-amber-500/50">
                <ChevronLeft className="w-4 h-4" /> Bài Trước
              </button>

              <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 hover:bg-amber-400 shadow-lg shadow-amber-500/20">
                Bài Tiếp Theo <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
