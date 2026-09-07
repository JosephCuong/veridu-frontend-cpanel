'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Globe, 
  Compass, 
  UserCheck, 
  ScrollText, 
  Heart, 
  Cross, 
  Church, 
  Sparkles, 
  Layers, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Filter, 
  ArrowRight, 
  Bookmark, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  PenTool, 
  Clock, 
  Flame, 
  HelpCircle 
} from 'lucide-react';

import {
  RESEARCH_CATEGORIES,
  RESEARCH_SUBJECTS,
  THEOLOGICAL_THEMES,
  HISTORICAL_CONTEXTS,
  KNOWLEDGE_GAPS,
  CURATED_RESEARCH_TOPICS,
  ResearchCategory,
  CuratedTopic,
  ResearchSubject,
  TheologicalTheme,
  HistoricalContext,
  KnowledgeGapItem
} from '@/lib/researchData';

// Helper to render icon by name
function CategoryIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  switch (name) {
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'UserCheck': return <UserCheck className={className} />;
    case 'ScrollText': return <ScrollText className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Cross': return <Cross className={className} />;
    case 'Church': return <Church className={className} />;
    default: return <Sparkles className={className} />;
  }
}

export default function ResearchLandingPage() {
  // ── State Management ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeMethodologyTab, setActiveMethodologyTab] = useState<string>('kinh-thanh');
  
  // Hero Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // 3-Axis Smart Explorer State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ap-raham');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('th-giao-uoc');
  const [selectedContextId, setSelectedContextId] = useState<string>('era-patriarchs');

  // Copy Feedback State
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);
  const [copiedOutline, setCopiedOutline] = useState(false);
  const [copiedExplorer, setCopiedExplorer] = useState(false);

  // Section refs for smooth scrolling
  const methodologyRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);

  // ── Hero Carousel Auto-Play ──
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % RESEARCH_CATEGORIES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Current Active Methodology Category
  const activeMethodology = useMemo(() => {
    return RESEARCH_CATEGORIES.find((c) => c.id === activeMethodologyTab) || RESEARCH_CATEGORIES[0];
  }, [activeMethodologyTab]);

  // Current Selected Explorer Items
  const currentSubject = useMemo(() => {
    return RESEARCH_SUBJECTS.find((s) => s.id === selectedSubjectId) || RESEARCH_SUBJECTS[0];
  }, [selectedSubjectId]);

  const currentTheme = useMemo(() => {
    return THEOLOGICAL_THEMES.find((t) => t.id === selectedThemeId) || THEOLOGICAL_THEMES[0];
  }, [selectedThemeId]);

  const currentContext = useMemo(() => {
    return HISTORICAL_CONTEXTS.find((c) => c.id === selectedContextId) || HISTORICAL_CONTEXTS[0];
  }, [selectedContextId]);

  // Synthesized Research Proposal from 3 Axes
  const synthesizedProposal = useMemo(() => {
    const isOT = currentSubject.testament === 'Cựu Ước';
    const isNT = currentSubject.testament === 'Tân Ước';

    const title = `${currentTheme.title}: Khảo Cứu Thần Học Qua Ơn Gọi Và Biến Cố Của ${currentSubject.name} (${currentContext.period})`;
    
    let keyQuestion = `Làm thế nào biến cố lịch sử và kinh nghiệm đức tin của ${currentSubject.name} trong thời kỳ ${currentContext.period} (${currentContext.yearRange}) làm sáng tỏ mầu nhiệm ${currentTheme.title.toLowerCase()}?`;
    if (isOT) {
      keyQuestion += ` Chiều kích Tiên trưng (Typology) này quy hướng và được hoàn tất nơi Đức Kitô như thế nào?`;
    } else if (isNT) {
      keyQuestion += ` Chiều kích này được Hội Thánh thời sơ khởi đón nhận và tuyên tín trong Phụng vụ ra sao?`;
    } else {
      keyQuestion += ` Giáo huấn của Huấn quyền và truyền thống các Thánh Giáo phụ làm phong phú thêm mầu nhiệm này thế nào?`;
    }

    const methodologyAngle = isOT 
      ? 'Chú giải bản văn Cựu Ước nguyên ngữ Hebrew (Masoretic / LXX), đối chiếu thần học Giao ước và hoàn tất Tiên trưng trong Tân Ước.'
      : isNT
      ? 'Phân tích văn tự Hy Lạp Koine, văn phong Tân Ước, bối cảnh Do Thái - La Mã thế kỷ I và sự hoàn tất Giao ước Mới.'
      : 'Phương pháp lịch sử tín lý (Dogmengeschichte), khảo cứu thủ bản Patristic và đối chiếu Huấn quyền Hội Thánh.';

    return {
      title,
      keyQuestion,
      methodologyAngle,
      biblicalPassages: currentSubject.keyScriptures,
      contextYear: currentContext.yearRange,
      significance: currentContext.significance
    };
  }, [currentSubject, currentTheme, currentContext]);

  // ── Filtered Topics Matrix ──
  const filteredTopics = useMemo(() => {
    return CURATED_RESEARCH_TOPICS.filter((topic) => {
      // Category filter
      if (selectedCategory !== 'all' && topic.categoryId !== selectedCategory) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && topic.priority !== selectedPriority) {
        return false;
      }
      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = topic.title.toLowerCase().includes(query);
        const matchSubtitle = topic.subtitle.toLowerCase().includes(query);
        const matchScope = topic.scope.toLowerCase().includes(query);
        const matchCategory = topic.categoryName.toLowerCase().includes(query);
        const matchTags = topic.tags.some((t) => t.toLowerCase().includes(query));
        const matchBiblical = topic.targetBiblicalPassages.some((p) => p.toLowerCase().includes(query));
        return matchTitle || matchSubtitle || matchScope || matchCategory || matchTags || matchBiblical;
      }
      return true;
    });
  }, [selectedCategory, selectedPriority, searchQuery]);

  // ── Copy Handlers ──
  const handleCopyTopic = (topic: CuratedTopic) => {
    const text = `[ĐỀ TÀI NGHIÊN CỨU HỌC THUẬT VERIDU]\n` +
      `Tiêu đề: ${topic.title}\n` +
      `Phụ đề: ${topic.subtitle}\n` +
      `Chuyên mục: ${topic.categoryName} (${topic.priority})\n` +
      `Phạm vi khảo cứu: ${topic.scope}\n` +
      `Phương pháp tiếp cận: ${topic.methodologyBrief}\n` +
      `Bản văn đối chiếu: ${topic.targetBiblicalPassages.join(', ')}\n` +
      `Từ khóa: ${topic.tags.join(', ')}\n` +
      `Nguồn tham khảo: VERIDU Academic Portal (https://www.thapgia.com/noi-dung-can-thiet)`;
    
    navigator.clipboard.writeText(text);
    setCopiedTopicId(topic.id);
    setTimeout(() => setCopiedTopicId(null), 2500);
  };

  const handleCopyOutline = () => {
    const m = activeMethodology;
    let text = `[DÀN Ý NGHIÊN CỨU CHUẨN - ${m.name.toUpperCase()}]\n` +
      `Phương pháp: ${m.methodology.frameworkName}\n` +
      `Mô tả: ${m.methodology.subtitle}\n\n` +
      `--- CÁC BƯỚC THỰC HIỆN ---\n`;
    
    m.methodology.steps.forEach((s) => {
      text += `Bước ${s.step}: ${s.name}\n- Mô tả: ${s.desc}\n- Câu hỏi then chốt: ${s.keyQuestions}\n\n`;
    });

    text += `--- DÀN Ý 4 PHẦN CHUẨN MỰC ---\n`;
    m.methodology.structureTemplate.forEach((st) => {
      text += `[${st.section}]: ${st.guidance}\n`;
    });

    text += `\n--- NGUỒN TƯ LIỆU BẮT BUỘC ---\n` + m.methodology.requiredSources.join('\n');
    text += `\n\nNguồn: Cổng Nghiên Cứu VERIDU (https://www.thapgia.com/noi-dung-can-thiet)`;

    navigator.clipboard.writeText(text);
    setCopiedOutline(true);
    setTimeout(() => setCopiedOutline(false), 2500);
  };

  const handleCopyExplorer = () => {
    const text = `[ĐỀ TÀI GỢI Ý TỪ TRÌNH KHÁM PHÁ VERIDU]\n` +
      `Đề tài: ${synthesizedProposal.title}\n` +
      `Nhân vật / Đối tượng: ${currentSubject.name} (${currentSubject.role} - ${currentSubject.testament})\n` +
      `Chủ đề Thần học: ${currentTheme.title} (${currentTheme.scope})\n` +
      `Bối cảnh Lịch sử: ${currentContext.period} (${synthesizedProposal.contextYear})\n` +
      `Câu hỏi nghiên cứu: ${synthesizedProposal.keyQuestion}\n` +
      `Phương pháp luận: ${synthesizedProposal.methodologyAngle}\n` +
      `Bản văn Kinh Thánh: ${synthesizedProposal.biblicalPassages}\n` +
      `Nguồn: https://www.thapgia.com/noi-dung-can-thiet`;

    navigator.clipboard.writeText(text);
    setCopiedExplorer(true);
    setTimeout(() => setCopiedExplorer(false), 2500);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Academic Dignity & Quick Stats)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden border-b border-[var(--border-card)]">
        {/* Subtle Stained-Glass Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-3xl rounded-full" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Catholic Academic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 backdrop-blur-md text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-serif font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>VIA • VITA • VERITAS — CỔNG THAM KHẢO & KHƠI NGUỒN HỌC THUẬT</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Danh Mục Đề Tài &{' '}
              <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Phương Pháp Luận
              </span>{' '}
              Nghiên Cứu
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[var(--text-muted)] font-serif max-w-3xl mx-auto leading-relaxed">
              Khám phá 8 chuyên ngành học thuật Công giáo chuẩn mực, tiếp cận quy trình nghiên cứu từ Chú giải Kinh Thánh 6 tầng đến Mystagogy phụng vụ, và tương tác cùng Trình khám phá ma trận tri thức.
            </p>
          </div>

          {/* Quick Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-500">8</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Chuyên Ngành Học Thuật</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-500">24</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Đề Tài Tuyển Chọn Mẫu</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-500">5</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Khoảng Trống Tri Thức Ưu Tiên</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-card)] shadow-sm">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-500">100%</div>
              <div className="text-xs text-[var(--text-muted)] font-serif mt-1">Chuẩn Huấn Quyền & CCC</div>
            </div>
          </div>

          {/* Live Search & Quick Jump Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-amber-500/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh đề tài, nhân vật (Áp-ra-ham, Phaolô), sách Kinh Thánh hoặc từ khóa..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-sm focus:outline-none focus:border-amber-500/80 shadow-md font-serif text-[var(--text-main)] placeholder-[var(--text-muted)] transition"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 px-3 py-1.5 text-xs rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 transition font-serif font-semibold"
                >
                  Xóa tìm
                </button>
              ) : (
                <button
                  onClick={() => scrollToSection(topicsRef)}
                  className="absolute right-3 px-3 py-1.5 text-xs rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition font-serif font-bold flex items-center gap-1"
                >
                  <span>Duyệt Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURED HERO CAROUSEL (Chuyên Mục Nổi Bật)
      ───────────────────────────────────────────────────────────── */}
      <section 
        className="py-12 border-b border-[var(--border-card)] relative overflow-hidden bg-gradient-to-b from-transparent via-[var(--bg-card)]/30 to-transparent"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Carousel Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
                Khám Phá Từng Chuyên Ngành
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-main)]">
                Toàn Cảnh 8 Chuyên Mục Học Thuật
              </h2>
            </div>
            {/* Prev / Next controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCarouselIndex((prev) => (prev === 0 ? RESEARCH_CATEGORIES.length - 1 : prev - 1))}
                aria-label="Chuyên mục trước"
                className="p-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-main)] transition shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCarouselIndex((prev) => (prev + 1) % RESEARCH_CATEGORIES.length)}
                aria-label="Chuyên mục tiếp theo"
                className="p-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-main)] transition shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Carousel Card */}
          {(() => {
            const currentCat = RESEARCH_CATEGORIES[carouselIndex];
            return (
              <div className="relative rounded-3xl overflow-hidden border border-[var(--border-card)] bg-[var(--bg-card)] shadow-xl transition-all duration-500 min-h-[420px] flex flex-col lg:flex-row">
                {/* Background image & gradient overlay */}
                <div 
                  className="lg:w-1/2 min-h-[260px] lg:min-h-full bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${currentCat.heroImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
                  
                  {/* Category Quote on Image */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white space-y-2">
                    <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-amber-200/90">
                      {currentCat.quote}
                    </p>
                    <div className="text-[11px] font-mono tracking-wide text-amber-400/80">
                      — {currentCat.scriptureRef}
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Badge and index */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold border ${currentCat.badgeColor}`}>
                        <CategoryIcon name={currentCat.iconName} className="w-4 h-4" />
                        <span>{currentCat.name}</span>
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {String(carouselIndex + 1).padStart(2, '0')} / {String(RESEARCH_CATEGORIES.length).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">
                      {currentCat.name}
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif leading-relaxed">
                      {currentCat.description}
                    </p>

                    {/* Key Focal Points */}
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-serif font-semibold text-amber-500 uppercase tracking-wider">
                        Trọng tâm khảo cứu:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentCat.focalPoints.map((fp, i) => (
                          <span 
                            key={i} 
                            className="px-2.5 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] font-serif"
                          >
                            • {fp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Methodology & Topics (No "Nhận viết") */}
                  <div className="pt-4 border-t border-[var(--border-card)] flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveMethodologyTab(currentCat.id);
                        scrollToSection(methodologyRef);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs sm:text-sm hover:bg-amber-400 transition shadow-md cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Xem Sổ Tay Phương Pháp Luận</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory(currentCat.id);
                        scrollToSection(topicsRef);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-[var(--text-main)] font-serif font-semibold text-xs sm:text-sm transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Xem Đề Tài Trong Mục Này</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Carousel Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {RESEARCH_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setCarouselIndex(idx)}
                aria-label={`Chuyển tới chuyên mục ${cat.name}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === carouselIndex ? 'w-8 bg-amber-500' : 'w-2 bg-[var(--border-card)] hover:bg-amber-500/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. BENTO GRID 8 CHUYÊN MỤC NGHIÊN CỨU
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-[var(--border-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
              Kiến Trúc Học Thuật VERIDU
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)]">
              Ma Trận 8 Chuyên Ngành Nghiên Cứu
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
              Mỗi chuyên ngành đại diện cho một lăng kính đức tin và lý trí (Fides et Ratio), được trang bị các tiêu chuẩn học thuật nghiêm ngặt.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RESEARCH_CATEGORIES.map((cat, idx) => {
              // Highlight 2 main categories as larger cards
              const isLarge = cat.id === 'kinh-thanh' || cat.id === 'than-hoc';

              return (
                <div
                  key={cat.id}
                  className={`group relative rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 transition-all duration-300 shadow-sm flex flex-col justify-between ${
                    isLarge ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${cat.badgeColor} border`}>
                        <CategoryIcon name={cat.iconName} className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-amber-500 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif mt-2 line-clamp-3 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    {/* Focal Points Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cat.focalPoints.slice(0, isLarge ? 4 : 2).map((fp, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-lg bg-[var(--bg-main)] text-[11px] text-[var(--text-muted)] font-serif border border-[var(--border-card)]"
                        >
                          {fp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Click to Explore */}
                  <div className="pt-6 mt-4 border-t border-[var(--border-card)] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveMethodologyTab(cat.id);
                        scrollToSection(methodologyRef);
                      }}
                      className="text-xs font-serif font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Sổ tay phương pháp</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        scrollToSection(topicsRef);
                      }}
                      className="text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
                    >
                      Lọc đề tài →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE METHODOLOGY PLAYBOOK (Sổ Tay Phương Pháp)
      ───────────────────────────────────────────────────────────── */}
      <section 
        ref={methodologyRef} 
        id="methodology-section"
        className="py-16 border-b border-[var(--border-card)] bg-gradient-to-b from-transparent via-[var(--bg-card)]/40 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
              Quy Chuẩn Học Thuật Đặc Thù
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)]">
              Sổ Tay Phương Pháp Luận Nghiên Cứu
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
              Mỗi phân môn yêu cầu một quy trình thẩm định và tiếp cận khoa học riêng biệt nhằm bảo đảm tính chân lý, lòng trung thành với Huấn Quyền và sự phong phú của Thần học.
            </p>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center">
            {RESEARCH_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeMethodologyTab;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveMethodologyTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-serif font-bold whitespace-nowrap transition cursor-pointer border ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-105' 
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-amber-500/40 hover:text-[var(--text-main)]'
                  }`}
                >
                  <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Methodology Details Container */}
          <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-lg overflow-hidden p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Header: Framework Title & Description */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-card)]">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-semibold text-amber-500 tracking-wider uppercase">
                  Khung Quy Trình: {activeMethodology.methodology.frameworkName}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">
                  {activeMethodology.methodology.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                  {activeMethodology.methodology.subtitle}
                </p>
              </div>

              {/* Copy Outline Button */}
              <button
                onClick={handleCopyOutline}
                className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-serif font-bold transition shadow-sm cursor-pointer"
              >
                {copiedOutline ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Đã Sao Chép Dàn Ý!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Dàn Ý Chuẩn</span>
                  </>
                )}
              </button>
            </div>

            {/* Methodology Step-by-Step Flow */}
            <div className="space-y-4">
              <h4 className="text-sm font-serif font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Quy Trình Triển Khai Từng Bước:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMethodology.methodology.steps.map((step) => (
                  <div
                    key={step.step}
                    className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3 relative group hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-serif font-bold text-xs">
                        {step.step}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Bước {step.step}
                      </span>
                    </div>

                    <h5 className="font-serif font-bold text-sm text-[var(--text-main)] leading-snug">
                      {step.name}
                    </h5>

                    <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                      {step.desc}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-card)]/60">
                      <div className="text-[11px] font-serif italic text-amber-500/90">
                        <span className="font-semibold">Câu hỏi then chốt:</span> &ldquo;{step.keyQuestions}&rdquo;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Column: Required Primary Sources & Structure Template */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              
              {/* Column 1: Required Sources */}
              <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4">
                <h4 className="text-sm font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Nguồn Tư Liệu Bắt Buộc Trích Dẫn:</span>
                </h4>
                <ul className="space-y-2.5">
                  {activeMethodology.methodology.requiredSources.map((source, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-serif text-[var(--text-muted)] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: 4-Part Structure Template */}
              <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-4">
                <h4 className="text-sm font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Cấu Trúc Bài Nghiên Cứu Mẫu (Dàn Ý 4 Phần):</span>
                </h4>
                <div className="space-y-3">
                  {activeMethodology.methodology.structureTemplate.map((part, i) => (
                    <div key={i} className="text-xs font-serif space-y-1">
                      <div className="font-bold text-[var(--text-main)] text-amber-600 dark:text-amber-400">
                        {part.section}
                      </div>
                      <div className="text-[var(--text-muted)] pl-2 border-l-2 border-amber-500/30">
                        {part.guidance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Exemplary Research Question Box */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-serif font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Đề Tài Mẫu Khởi Điểm:
                </div>
                <div className="text-sm sm:text-base font-serif font-bold text-[var(--text-main)] italic">
                  &ldquo;{activeMethodology.methodology.exemplaryQuestion}&rdquo;
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(activeMethodology.id);
                  scrollToSection(topicsRef);
                }}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-serif font-bold hover:bg-amber-400 transition shadow-sm cursor-pointer"
              >
                Xem Các Đề Tài Cùng Mục →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SMART RESEARCH EXPLORER (3 TRỤC: AI? VẤN ĐỀ GÌ? BỐI CẢNH?)
      ───────────────────────────────────────────────────────────── */}
      <section 
        ref={explorerRef}
        id="explorer-section"
        className="py-16 border-b border-[var(--border-card)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-500 text-xs font-serif font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>TRÌNH TỔNG HỢP & GỢI Ý THÔNG MINH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)]">
              Trình Khám Phá Đề Tài 3 Trục (Smart Research Explorer)
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] font-serif">
              Tương quan hóa giữa [Nhân Vật / Đối Tượng] × [Vấn Đề Thần Học] × [Bối Cảnh Lịch Sử] để kích hoạt các góc nhìn nghiên cứu mới lạ và phát hiện cơ hội học thuật.
            </p>
          </div>

          {/* 3-Axis Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* AXIS 1: WHO? (Nhân vật / Thần học gia) */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif font-bold text-sm text-[var(--text-main)]">
                    1. Đối Tượng / Nhân Vật
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-500 font-bold">
                  {RESEARCH_SUBJECTS.length} nhân vật
                </span>
              </div>

              {/* Scrollable list of subjects */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {RESEARCH_SUBJECTS.map((subject) => {
                  const isSelected = subject.id === selectedSubjectId;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-serif transition border cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                          : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:border-amber-500/40'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{subject.name}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-800' : 'text-[var(--text-muted)]'}`}>
                          {subject.role}
                        </div>
                      </div>

                      {/* Status indicator */}
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isSelected 
                          ? 'bg-slate-950/20 text-slate-950'
                          : subject.hasArticle 
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                      }`}>
                        {subject.hasArticle ? 'Có bài sẵn' : 'Khoảng trống'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AXIS 2: WHAT? (Chủ đề Thần học) */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <Cross className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif font-bold text-sm text-[var(--text-main)]">
                    2. Chủ Đề Thần Học
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-500 font-bold">
                  {THEOLOGICAL_THEMES.length} chủ đề
                </span>
              </div>

              {/* List of theological themes */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {THEOLOGICAL_THEMES.map((theme) => {
                  const isSelected = theme.id === selectedThemeId;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-serif transition border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                          : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="font-bold">{theme.title}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-800' : 'text-[var(--text-muted)]'}`}>
                        {theme.scope}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AXIS 3: CONTEXT? (Bối cảnh lịch sử) */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif font-bold text-sm text-[var(--text-main)]">
                    3. Bối Cảnh / Thời Kỳ
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-500 font-bold">
                  {HISTORICAL_CONTEXTS.length} thời kỳ
                </span>
              </div>

              {/* List of historical contexts */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {HISTORICAL_CONTEXTS.map((context) => {
                  const isSelected = context.id === selectedContextId;
                  return (
                    <button
                      key={context.id}
                      onClick={() => setSelectedContextId(context.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-serif transition border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                          : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-card)] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="font-bold">{context.period}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-800' : 'text-amber-500'}`}>
                        {context.yearRange}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Real-time Dynamic Synthesized Proposal Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] to-amber-500/5 border-2 border-amber-500/40 shadow-xl space-y-6">
            
            {/* Top Bar: Badges and Copy */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-card)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-serif font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đề Tài Khảo Cứu Tự Động Kiến Tạo</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-mono font-semibold">
                  Thời kỳ: {synthesizedProposal.contextYear}
                </span>
                {!currentSubject.hasArticle && (
                  <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 text-xs font-serif font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Cơ Hội Học Thuật: Chưa Có Bài Trong Thư Viện</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleCopyExplorer}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-serif font-bold text-xs transition shadow-sm cursor-pointer"
              >
                {copiedExplorer ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Đã Sao Chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Đề Tài Gợi Ý</span>
                  </>
                )}
              </button>
            </div>

            {/* Synthesized Title & Question */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[var(--text-main)] leading-snug">
                {synthesizedProposal.title}
              </h3>
              
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-2">
                <div className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Câu Hỏi Khảo Cứu Trọng Tâm:</span>
                </div>
                <p className="text-sm font-serif italic text-[var(--text-main)] leading-relaxed">
                  &ldquo;{synthesizedProposal.keyQuestion}&rdquo;
                </p>
              </div>
            </div>

            {/* Methodology & Passages details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1.5">
                <div className="font-bold text-[var(--text-main)] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Phương Pháp Tiếp Cận Gợi Ý:</span>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {synthesizedProposal.methodologyAngle}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-1.5">
                <div className="font-bold text-[var(--text-main)] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bản Văn Kinh Thánh Đối Chiếu:</span>
                </div>
                <p className="text-[var(--text-muted)] font-mono leading-relaxed">
                  {synthesizedProposal.biblicalPassages}
                </p>
              </div>
            </div>

            {/* Database Cross-References & Reference Links (No "Nhận viết") */}
            <div className="pt-4 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-serif">
                <span className="text-[var(--text-muted)]">Tài nguyên đối chiếu trong CSDL:</span>
                {currentSubject.hasArticle && currentSubject.articleSlug ? (
                  <Link
                    href={`/thu-vien/${currentSubject.articleSlug}`}
                    className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>Đọc bài về {currentSubject.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-500 font-bold">
                    Chưa có bài trong thư viện
                  </span>
                )}
                <Link
                  href="/khao-co"
                  className="px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 transition inline-flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>Bản đồ khảo cổ 3D</span>
                </Link>
                <Link
                  href="/dong-thoi-gian"
                  className="px-3 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-amber-500 transition inline-flex items-center gap-1"
                >
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>Dòng thời gian cứu độ</span>
                </Link>
              </div>

              {/* Link to Creator Studio if author wants to write on their own */}
              <Link
                href={`/dang-bai?topic=${encodeURIComponent(synthesizedProposal.title)}`}
                className="text-xs font-serif text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1 transition"
              >
                <span>Soạn thảo bài viết độc lập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              RADAR KHOẢNG TRỐNG TRI THỨC (KNOWLEDGE GAPS RADAR)
          ───────────────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-card)]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-rose-500 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Radar Khoảng Trống Tri Thức (Knowledge Gaps)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-main)] mt-1">
                  5 Chủ Đề & Nhân Vật Cốt Lõi Cần Nghiên Cứu Chuyên Sâu
                </h3>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-serif max-w-xs text-right">
                Được tổng hợp từ thống kê kho dữ liệu bài viết và sách Kinh Thánh của VERIDU.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {KNOWLEDGE_GAPS.map((gap) => {
                const isUrgent = gap.importance === 'Khẩn Cấp';
                return (
                  <div
                    key={gap.id}
                    className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-rose-500/40 transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isUrgent ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        }`}>
                          {gap.importance}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {gap.type}
                        </span>
                      </div>

                      <h4 className="text-base font-serif font-bold text-[var(--text-main)]">
                        {gap.title}
                      </h4>

                      <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                        {gap.reason}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-card)] text-[11px] font-serif text-amber-600 dark:text-amber-400">
                      <span className="font-bold">Gợi ý góc nhìn:</span> {gap.suggestedAngle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CURATED RESEARCH TOPICS DIRECTORY (24 Đề Tài Tuyển Chọn)
      ───────────────────────────────────────────────────────────── */}
      <section 
        ref={topicsRef}
        id="topics-section"
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-500">
                Kho Đề Tài Chuẩn Mực
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)] mt-1">
                Danh Mục 24 Đề Tài Trọng Điểm Tuyển Chọn
              </h2>
              <p className="text-sm text-[var(--text-muted)] font-serif mt-1 max-w-2xl">
                Các đề tài đã được định hình cấu trúc, phương pháp luận và nguồn bản văn đối chiếu nhằm phục vụ các nhà nghiên cứu, chủng sinh và độc giả Công giáo.
              </p>
            </div>

            {/* Total Results Count */}
            <div className="text-xs sm:text-sm font-serif text-[var(--text-muted)]">
              Hiển thị <span className="font-bold text-amber-500">{filteredTopics.length}</span> / {CURATED_RESEARCH_TOPICS.length} đề tài
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                }`}
              >
                Tất Cả ({CURATED_RESEARCH_TOPICS.length})
              </button>
              {RESEARCH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Priority Filter & Reset */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif text-[var(--text-muted)] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Ưu tiên:</span>
              </span>
              {(['all', 'Khẩn Cấp', 'Ưu Tiên Cao', 'Mở Rộng'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif transition cursor-pointer ${
                    selectedPriority === p
                      ? 'bg-amber-500/20 text-amber-500 font-bold border border-amber-500/40'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {p === 'all' ? 'Tất Cả' : p}
                </button>
              ))}

              {(selectedCategory !== 'all' || selectedPriority !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPriority('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-serif text-amber-500 hover:underline ml-2 cursor-pointer"
                >
                  Đặt lại
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredTopics.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500/50 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Không Tìm Thấy Đề Tài Phù Hợp
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto font-serif">
                Không có đề tài nào khớp với tiêu chí lọc hoặc từ khóa &ldquo;{searchQuery}&rdquo;. Bạn có thể đặt lại bộ lọc hoặc khởi tạo đề tài trong phòng biên tập.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSelectedPriority('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-serif font-bold text-xs hover:bg-amber-400 transition"
              >
                Xem Toàn Bộ 24 Đề Tài
              </button>
            </div>
          ) : (
            /* Cards Grid (2-columns on large screens) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTopics.map((topic) => {
                const isUrgent = topic.priority === 'Khẩn Cấp';
                const isHigh = topic.priority === 'Ưu Tiên Cao';
                const isCopied = copiedTopicId === topic.id;

                return (
                  <article
                    key={topic.id}
                    className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-sm transition-all flex flex-col justify-between space-y-5 group"
                  >
                    {/* Card Top: Category & Priority */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-serif font-bold text-xs">
                          {topic.categoryName}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isUrgent 
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' 
                            : isHigh 
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                            : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        }`}>
                          {topic.priority}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-amber-500 transition-colors leading-snug">
                          {topic.title}
                        </h3>
                        <p className="text-xs font-serif text-amber-600/90 dark:text-amber-400/90 italic mt-1">
                          {topic.subtitle}
                        </p>
                      </div>

                      {/* Scope & Methodology Brief */}
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
                        {topic.scope}
                      </p>

                      <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif space-y-1">
                        <div className="font-bold text-amber-500 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Phương pháp khảo cứu:</span>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          {topic.methodologyBrief}
                        </div>
                      </div>

                      {/* Biblical Passages */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-serif font-semibold text-[var(--text-muted)]">
                          Bản văn đối chiếu chính:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {topic.targetBiblicalPassages.map((passage, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-[11px] font-mono text-amber-500"
                            >
                              {passage}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topic.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 rounded-lg bg-[var(--bg-main)] text-[11px] text-[var(--text-muted)] font-serif"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions: Reference & Copy (NO "Nhận viết") */}
                    <div className="pt-4 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyTopic(topic)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-serif font-bold transition cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Đã Sao Chép!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao Chép Đề Tài & Dàn Ý</span>
                            </>
                          )}
                        </button>

                        <Link
                          href="/kinh-thanh"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] hover:border-amber-500/40 text-[var(--text-muted)] hover:text-amber-500 text-xs font-serif transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Tra Kinh Thánh</span>
                        </Link>
                      </div>

                      <Link
                        href={`/dang-bai?topic=${encodeURIComponent(topic.title)}&category=${encodeURIComponent(topic.categoryName)}`}
                        className="text-xs font-serif text-[var(--text-muted)] hover:text-amber-500 flex items-center gap-1 transition"
                      >
                        <span>Soạn bài độc lập</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </article>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FOOTER INSPIRATION & GUIDELINES CALLOUT
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[var(--border-card)] bg-gradient-to-b from-transparent to-[var(--bg-card)]/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>

          <blockquote className="text-base sm:text-lg md:text-xl font-serif italic text-[var(--text-main)] max-w-2xl mx-auto leading-relaxed">
            &ldquo;Đức tin tìm kiếm sự hiểu biết (Fides quaerens intellectum) — sự hiểu biết lại dẫn tới tình yêu sâu thẳm hơn nơi Thiên Chúa và Lời Người.&rdquo;
          </blockquote>
          
          <div className="text-xs font-serif uppercase tracking-widest text-amber-500 font-bold">
            — Thánh Anselmô thành Canterbury & Thánh Tôma Aquinô
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quy-chuan"
              className="px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 text-xs font-serif font-semibold text-[var(--text-main)] transition"
            >
              Xem Quy Chuẩn Biên Tập & Trích Dẫn
            </Link>
            <Link
              href="/thu-vien"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-serif font-bold hover:bg-amber-400 transition shadow-md"
            >
              Khám Phá Thư Viện Bài Viết VERIDU
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
