'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, BookOpen, ChevronRight, Sparkles, Filter, Info, 
  ChevronDown, LayoutGrid, GitCommit, X, ExternalLink, FileText, Layers, PlayCircle 
} from 'lucide-react';
import { fetchTimelineEvents, TimelineEventData, getLibraryArticleBySlug, Article } from '@/lib/api';

export default function SalvationTimeline() {
  const [selectedFilter, setSelectedFilter] = useState<'Tất cả' | 'Cựu Ước' | 'Tân Ước' | 'Lịch Sử Giáo Hội'>('Tất cả');
  const [viewMode, setViewMode] = useState<'grid' | 'vertical'>('grid');
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [activeEvent, setActiveEvent] = useState<TimelineEventData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Interactive Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState<boolean>(false);
  const [articleContent, setArticleContent] = useState<Article | null>(null);
  const [isArticleLoading, setIsArticleLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      const apiEvents = await fetchTimelineEvents();
      if (apiEvents && apiEvents.length > 0) {
        setEvents(apiEvents);
        setActiveEvent(apiEvents[0]);
      } else {
        setEvents([]);
        setActiveEvent(null);
      }
      setIsLoading(false);
    }
    loadEvents();
  }, []);

  const handleOpenArticle = async (evt: TimelineEventData) => {
    setIsArticleModalOpen(true);
    setIsArticleLoading(true);
    setArticleContent(null);

    if (evt.articleSlug) {
      const art = await getLibraryArticleBySlug(evt.articleSlug);
      if (art) {
        setArticleContent(art);
      }
    }
    setIsArticleLoading(false);
  };

  const filteredEvents = selectedFilter === 'Tất cả'
    ? events
    : events.filter((e) => e.category === selectedFilter);

  // Group events by Era for 1-2 Column Grid View
  const eraGroups = filteredEvents.reduce((acc, evt) => {
    const eraKey = evt.eraName || 'Chưa Phân Kỷ Nguyên';
    if (!acc[eraKey]) {
      acc[eraKey] = [];
    }
    acc[eraKey].push(evt);
    return acc;
  }, {} as Record<string, TimelineEventData[]>);

  if (isLoading) {
    return (
      <div className="w-full py-20 text-center space-y-4 animate-pulse">
        <Clock className="w-10 h-10 text-amber-500 mx-auto animate-spin" />
        <p className="text-sm font-bold text-[var(--text-muted)]">Đang kết nối cơ sở dữ liệu Dòng Thời Gian Lịch Sử Cứu Độ...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
        <Info className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-[var(--text-main)] font-serif">Chưa Có Sự Kiện Dòng Thời Gian</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Hiện tại chưa có sự kiện nào được tạo trong Quản trị. Quản trị viên có thể vào menu <strong>"Dòng Thời Gian"</strong> trong WordPress Admin để nạp sự kiện mới.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      
      {/* Control Bar: Filter & View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Lịch Sử Cứu Độ ({filteredEvents.length} Sự Kiện)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-[var(--border-card)]">
            {['Tất cả', 'Cựu Ước', 'Tân Ước', 'Lịch Sử Giáo Hội'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-[var(--border-card)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Lưới Kỷ Nguyên
            </button>
            <button
              onClick={() => setViewMode('vertical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'vertical'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" /> Trục Dọc
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ERA GRID LAYOUT (1-2 Columns with preview panel) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Era Groups List (1 or 2 columns on mobile/desktop) */}
          <div className="lg:col-span-6 space-y-6">
            {Object.entries(eraGroups).map(([eraName, eraEvents]) => (
              <div key={eraName} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <h3 className="font-serif font-black text-lg text-amber-500 uppercase tracking-wide">
                    {eraName}
                  </h3>
                  <span className="text-xs font-bold text-[var(--text-muted)]">({eraEvents.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eraEvents.map((evt) => {
                    const isSelected = activeEvent?.id === evt.id;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setActiveEvent(evt)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                          isSelected
                            ? 'bg-[var(--bg-card)] border-amber-500 shadow-xl shadow-amber-500/20 scale-[1.02] ring-2 ring-amber-500/40'
                            : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-amber-500/40 hover:scale-[1.01] shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl group-hover:scale-110 transition-transform">{evt.icon}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {evt.category}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-[var(--text-muted)] block">{evt.timePeriod}</span>
                          <h4 className="font-serif font-bold text-sm text-[var(--text-main)] line-clamp-2">{evt.title}</h4>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-card)] text-[11px] font-bold text-amber-500">
                          <span>{isSelected ? 'Đang chọn' : 'Xem chi tiết'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Selected Event & Interactive Space (Fixed / Sticky Preview) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            {activeEvent ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

                {/* Event Header Meta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-black uppercase tracking-widest">
                      {activeEvent.eraName}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">{activeEvent.timePeriod}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[var(--text-main)] flex items-center gap-3">
                    <span className="text-4xl">{activeEvent.icon}</span>
                    {activeEvent.title}
                  </h2>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Tóm Tắt Sự Kiện</h4>
                  <p className="text-[var(--text-main)] text-sm sm:text-base leading-relaxed font-medium">
                    {activeEvent.summary}
                  </p>
                </div>

                {/* Theological Meaning */}
                {activeEvent.theologicalMeaning && (
                  <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Ý Nghĩa Thần Học
                    </h4>
                    <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                      {activeEvent.theologicalMeaning}
                    </p>
                  </div>
                )}

                {/* Scripture Reference */}
                {activeEvent.scripture && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Kinh Thánh Tham Chiếu</span>
                      <span className="font-serif font-bold text-base text-amber-600 dark:text-amber-400">{activeEvent.scripture}</span>
                    </div>
                    <Link 
                      href="/doc-kinh-thanh"
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Đọc Ngay
                    </Link>
                  </div>
                )}

                {/* Interactive Article Button Trigger */}
                {(activeEvent.articleSlug || activeEvent.interactiveHtmlUrl || activeEvent.contentHtml) && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenArticle(activeEvent)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01]"
                    >
                      <FileText className="w-5 h-5" /> 
                      <span>Khám Phá Bài Viết Tương Tác .HTML</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]">
                Chọn một sự kiện ở bên trái để xem nội dung chi tiết và bài viết tương tác.
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW 2: CLASSIC VERTICAL TIMELINE */}
      {viewMode === 'vertical' && (
        <div className="max-w-4xl mx-auto relative py-8 space-y-12">
          {/* Vertical Connecting Line */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 w-1 bg-gradient-to-b from-amber-500 via-indigo-500 to-amber-500 -translate-x-1/2 z-0"></div>

          {filteredEvents.map((evt, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={evt.id} className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                
                {/* Timeline Node Icon */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[var(--bg-card)] border-4 border-amber-500 shadow-xl flex items-center justify-center text-xl z-20">
                  {evt.icon}
                </div>

                {/* Content Card Positioned Alternatingly on Desktop */}
                <div className={`w-full sm:w-[calc(50%-2rem)] pl-16 sm:pl-0 ${isEven ? 'sm:mr-auto sm:text-right' : 'sm:ml-auto sm:text-left'}`}>
                  <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-4 hover:border-amber-500/40 transition-all">
                    <div className={`flex items-center gap-2 ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {evt.eraName}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-muted)]">{evt.timePeriod}</span>
                    </div>

                    <h3 className="font-serif font-black text-xl text-[var(--text-main)]">{evt.title}</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{evt.summary}</p>

                    {(evt.articleSlug || evt.interactiveHtmlUrl) && (
                      <button
                        onClick={() => handleOpenArticle(evt)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:underline pt-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Xem bài viết tương tác &rarr;
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* POP-UP MODAL: INTERACTIVE HTML ARTICLE READER */}
      {isArticleModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border-card)] flex items-center justify-between bg-[var(--bg-main)]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeEvent.icon}</span>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">{activeEvent.eraName}</span>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)]">{activeEvent.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {isArticleLoading ? (
                <div className="py-20 text-center space-y-3">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto animate-spin" />
                  <p className="text-sm font-bold text-[var(--text-muted)]">Đang tải bài viết tương tác .HTML...</p>
                </div>
              ) : activeEvent.interactiveHtmlUrl ? (
                /* External / Dedicated Interactive HTML iFrame Embed */
                <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-[var(--border-card)]">
                  <iframe 
                    src={activeEvent.interactiveHtmlUrl} 
                    className="w-full h-full border-0" 
                    title={activeEvent.title}
                  />
                </div>
              ) : articleContent?.interactiveHtml ? (
                /* Interactive HTML injected directly */
                <div 
                  className="prose dark:prose-invert max-w-none font-sans"
                  dangerouslySetInnerHTML={{ __html: articleContent.interactiveHtml }}
                />
              ) : articleContent?.contentHtml ? (
                /* Standard Article Content HTML */
                <div 
                  className="prose dark:prose-invert max-w-none font-sans text-[var(--text-main)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: articleContent.contentHtml }}
                />
              ) : (
                /* Default Fallback Event Content */
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <h4 className="font-serif font-bold text-lg text-amber-500 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Ý Nghĩa Thần Học & Sự Kiện
                    </h4>
                    <p className="text-sm sm:text-base leading-relaxed text-[var(--text-main)]">
                      {activeEvent.theologicalMeaning || activeEvent.summary}
                    </p>
                  </div>
                  {activeEvent.scripture && (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-card)]">
                      <span className="text-xs font-bold text-[var(--text-muted)] block mb-1">Kinh Thánh Tham Chiếu</span>
                      <span className="font-serif font-bold text-amber-500 text-base">{activeEvent.scripture}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-card)] bg-[var(--bg-main)] flex items-center justify-between gap-4">
              {activeEvent.articleSlug && (
                <Link
                  href={`/thu-vien/${activeEvent.articleSlug}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Xem Đầy Đủ Trong Thư Viện
                </Link>
              )}
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-[var(--text-main)] font-bold text-xs hover:bg-slate-300 transition-colors ml-auto"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
