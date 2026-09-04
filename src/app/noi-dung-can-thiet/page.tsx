'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Search, 
  PenTool, 
  Sparkles, 
  BookOpen, 
  Flame, 
  Globe, 
  UserCheck, 
  ScrollText, 
  Heart, 
  Cross, 
  Church, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Filter,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface TopicItem {
  id: string;
  category: string;
  categorySlug: string;
  title: string;
  scope: string;
  priority: 'Khẩn Cấp' | 'Ưu Tiên Cao' | 'Mở Rộng';
  tags: string[];
}

const TOPICS_DATA: TopicItem[] = [
  // 1. Kinh Thánh
  {
    id: 'kb-01',
    category: 'Kinh Thánh',
    categorySlug: 'kinh-thanh',
    title: 'Thần Học Giao Ước: Từ Giao Ước Sinai Đến Giao Ước Mới Trong Máu Đức Kitô',
    scope: 'Khảo cứu sự tiến triển của khái niệm Berit (Giao ước) qua các giai đoạn lịch sử cứu độ, đối chiếu sách Xuất Hành và Thư gửi tín hữu Do Thái.',
    priority: 'Khẩn Cấp',
    tags: ['Giao Ước', 'Xuất Hành', 'Thư Do Thái', 'Berit']
  },
  {
    id: 'kb-02',
    category: 'Kinh Thánh',
    categorySlug: 'kinh-thanh',
    title: "Biểu Tượng 'Đấng Tôi Tớ Đau Khổ' Trong Sách Ngôn Sứ Isaia (Bài Ca Thứ IV)",
    scope: 'Phân tích bản văn Isaia 52:13 - 53:12 dưới lăng kính Kitô học và tiên báo về Cuộc Khổ Nạn của Chúa Giêsu.',
    priority: 'Ưu Tiên Cao',
    tags: ['Isaia', 'Đấng Tôi Tớ', 'Cựu Ước', 'Kitô Học']
  },
  {
    id: 'kb-03',
    category: 'Kinh Thánh',
    categorySlug: 'kinh-thanh',
    title: 'Cấu Trúc Thần Học Của Sách Khải Huyền: Bảy Dấu Ấn, Bảy Kèn Và Chiên Thiên Chúa',
    scope: 'Giải mã văn phong Khải huyền theo truyền thống Giáo Hội, tránh khuynh hướng tiên tri thế tục cực đoan.',
    priority: 'Mở Rộng',
    tags: ['Khải Huyền', 'Chiên Thiên Chúa', 'Tận Thế Luận']
  },

  // 2. Khảo Cổ Kinh Thánh
  {
    id: 'kc-01',
    category: 'Khảo Cổ Kinh Thánh',
    categorySlug: 'khao-co',
    title: "Bia Đá Tel Dan Và Bằng Chứng Khảo Cổ Về 'Nhà Đa-vít' (Bayt David)",
    scope: 'Phân tích văn khắc Aram thế kỷ IX TCN, đối chiếu với các ghi chép trong Sách Các Vua và tầm quan trọng trong hộ giáo Kinh Thánh.',
    priority: 'Khẩn Cấp',
    tags: ['Bia Tel Dan', 'Nhà Đavít', 'Văn Khắc Cổ', 'Levant']
  },
  {
    id: 'kc-02',
    category: 'Khảo Cổ Kinh Thánh',
    categorySlug: 'khao-co',
    title: 'Cuộn Sách Biển Chết Tại Hang Động Qumran: Ý Nghĩa Với Bản Văn Kinh Thánh',
    scope: 'Khảo cứu phát hiện vĩ đại năm 1947, bản sao cổ xưa nhất của sách Isaia và sự hình thành bản văn Cựu Ước.',
    priority: 'Ưu Tiên Cao',
    tags: ['Qumran', 'Cuộn Sách Biển Chết', 'Masoretic', 'Bản Cổ']
  },
  {
    id: 'kc-03',
    category: 'Khảo Cổ Kinh Thánh',
    categorySlug: 'khao-co',
    title: 'Khảo Cổ Học Thành Giêrusalem Thời Đệ Nhất Đền Thờ Của Vua Salômôn',
    scope: 'Các di chỉ khảo cổ tại Đồi Ophel, Suối Gihon và Đường hầm Hezekiah củng cố bối cảnh lịch sử Cựu Ước.',
    priority: 'Mở Rộng',
    tags: ['Giêrusalem', 'Đền Thờ', 'Salomon', 'Hezekiah']
  },

  // 3. Bối Cảnh Kinh Thánh
  {
    id: 'bc-01',
    category: 'Bối Cảnh Kinh Thánh',
    categorySlug: 'boi-canh',
    title: 'Bối Cảnh Cận Đông Cổ Đại (ANE) Và Luật Pháp Trong Bộ Ngũ Kinh',
    scope: 'So sánh Luật Giao ước Môsê với Bộ Luật Hammurabi và các giao ước chư hầu Hittite thế kỷ II TCN.',
    priority: 'Khẩn Cấp',
    tags: ['ANE', 'Hammurabi', 'Ngũ Kinh', 'Luật Môsê']
  },
  {
    id: 'bc-02',
    category: 'Bối Cảnh Kinh Thánh',
    categorySlug: 'boi-canh',
    title: 'Xã Hội Do Thái Dưới Ách Thống Trị La Mã Thế Kỷ I: Pharisêu, Sa-đốc Và Essenes',
    scope: 'Khảo cứu các đảng phái chính trị tôn giáo thời Chúa Giêsu, bối cảnh đền thờ và xung đột tôn giáo Tân Ước.',
    priority: 'Ưu Tiên Cao',
    tags: ['La Mã', 'Pharisêu', 'Sa-đốc', 'Thế Kỷ I']
  },

  // 4. Nhân Vật
  {
    id: 'nv-01',
    category: 'Nhân Vật',
    categorySlug: 'nhan-vat',
    title: 'Môsê: Nhà Lập Pháp, Ngôn Sứ Và Hình Bóng Của Đức Kitô',
    scope: 'Phân tích cuộc đời Môsê từ cuộc giải thoát Ai Cập đến Núi Nebo, vai trò trung gian giao ước trong thần học Kinh Thánh.',
    priority: 'Ưu Tiên Cao',
    tags: ['Môsê', 'Xuất Hành', 'Tiên Tri', 'Giao Ước']
  },
  {
    id: 'nv-02',
    category: 'Nhân Vật',
    categorySlug: 'nhan-vat',
    title: 'Thánh Phaolô: Cuộc Biến Đổi Trên Đường Đamát Và Chiến Lược Truyền Giáo Dân Ngoại',
    scope: 'Hành trình 3 chuyến truyền giáo, các thư tín và thần học ơn công chính hóa bởi đức tin.',
    priority: 'Khẩn Cấp',
    tags: ['Thánh Phaolô', 'Đamát', 'Truyền Giáo', 'Thư Tín']
  },
  {
    id: 'nv-03',
    category: 'Nhân Vật',
    categorySlug: 'nhan-vat',
    title: 'Gioan Tẩy Giả: Tiếng Hô Trong Sa Mạc Và Cầu Nối Cựu - Tân Ước',
    scope: 'Sứ mạng dọn đường, nghi thức thanh tẩy bên bờ sông Giođan và cái chết vì bảo vệ luân lý hôn nhân.',
    priority: 'Mở Rộng',
    tags: ['Gioan Tẩy Giả', 'Sông Giođan', 'Tiền Hô', 'Tử Đạo']
  },

  // 5. Chú Giải
  {
    id: 'cg-01',
    category: 'Chú Giải',
    categorySlug: 'chu-giai',
    title: "Chú Giải Diễn Từ Bánh Ban Sự Sống (Gioan 6:22-59): Nền Tảng Bí Tích Thánh Thể",
    scope: 'Áp dụng chú giải văn tự Hy Lạp (Sarx vs Soma, Trogo vs Phago) khẳng định sự hiện diện thực sự của Đức Kitô.',
    priority: 'Khẩn Cấp',
    tags: ['Gioan 6', 'Thánh Thể', 'Bản Hy Lạp', 'Chú Giải Văn Tự']
  },
  {
    id: 'cg-02',
    category: 'Chú Giải',
    categorySlug: 'chu-giai',
    title: 'Bài Giảng Trên Núi (Mát-thêu 5-7): Hiến Chương Nước Trời Và Luật Yêu Thương',
    scope: 'Phân tích 8 Mối Phúc Thật, đối chiếu với Thập Điều Sinai và chuẩn mực đạo đức của người môn đệ Đức Kitô.',
    priority: 'Ưu Tiên Cao',
    tags: ['Mát-thêu 5', 'Bát Phúc', 'Hiến Chương Nước Trời']
  },

  // 6. Suy Niệm
  {
    id: 'sn-01',
    category: 'Suy Niệm',
    categorySlug: 'suy-niem',
    title: 'Phương Pháp Lectio Divina: 4 Bước Lắng Nghe Và Cầu Nguyện Với Lời Chúa Mỗi Ngày',
    scope: 'Hướng dẫn thực hành Đọc (Lectio), Suy niệm (Meditatio), Cầu nguyện (Oratio) và Chiêm niệm (Contemplatio).',
    priority: 'Khẩn Cấp',
    tags: ['Lectio Divina', 'Cầu Nguyện', 'Linh Thao', 'Lời Chúa']
  },
  {
    id: 'sn-02',
    category: 'Suy Niệm',
    categorySlug: 'suy-niem',
    title: 'Mầu Nhiệm Thập Giá: Suy Niệm 14 Chặng Đàng Thánh Giá Dưới Ánh Sáng Tình Yêu Cứu Độ',
    scope: 'Gợi ý suy niệm chiều sâu theo từng chặng đàng thương khó, kết nối đau khổ của con người với Hy tế Canvê.',
    priority: 'Ưu Tiên Cao',
    tags: ['Thập Giá', '14 Chặng Đàng', 'Khổ Nạn', 'Tuần Thánh']
  },

  // 7. Các Thánh
  {
    id: 'ct-01',
    category: 'Các Thánh',
    categorySlug: 'cac-thanh',
    title: 'Thánh Âu-tinh Và Tác Phẩm Tự Thuật (Confessiones): Hành Trình Hoán Cải Vĩ Đại',
    scope: 'Khảo cứu tư tưởng ân sủng, tâm lý học Kitô giáo và những đóng góp thần học nền tảng cho Hội Thánh phương Tây.',
    priority: 'Khẩn Cấp',
    tags: ['Thánh Âu-tinh', 'Tự Thuật', 'Ân Sủng', 'Giáo Phụ']
  },
  {
    id: 'ct-02',
    category: 'Các Thánh',
    categorySlug: 'cac-thanh',
    title: 'Thánh Tôma Aquinô: Tổng Luận Thần Học (Summa Theologiae) Và Năm Con Đường Chứng Minh Thiên Chúa',
    scope: 'Tóm lược ngũ luận (Quinque Viae), triết học kinh viện và sự hòa hợp giữa Đức Tin và Lý Trí (Fides et Ratio).',
    priority: 'Ưu Tiên Cao',
    tags: ['Thánh Tôma Aquinô', 'Tổng Luận', 'Lý Trí Và Đức Tin', 'Kinh Viện']
  },

  // 8. Phụng Vụ
  {
    id: 'pv-01',
    category: 'Phụng Vụ',
    categorySlug: 'phung-vu',
    title: 'Ý Nghĩa Thần Học Và Biểu Tượng Các Màu Phụng Vụ Trong Năm Phụng Vụ Công Giáo',
    scope: 'Phân tích nguồn gốc và ý nghĩa tâm linh của các màu Trắng, Đỏ, Xanh lá, Tím, Hồng và Vàng kim trong thánh lễ.',
    priority: 'Ưu Tiên Cao',
    tags: ['Màu Phụng Vụ', 'Năm Phụng Vụ', 'Thánh Lễ', 'Biểu Tượng']
  },
  {
    id: 'pv-02',
    category: 'Phụng Vụ',
    categorySlug: 'phung-vu',
    title: 'Hiến Chế Về Phụng Vụ Thánh Sacrosanctum Concilium: Tinh Thần Canh Tân Phụng Vụ Vatican II',
    scope: 'Sự tham gia tích cực (Participatio Actuosa) của cộng đoàn tín hữu và bản chất thánh thiêng của Hy lễ Tạ Ơn.',
    priority: 'Khẩn Cấp',
    tags: ['Vatican II', 'Sacrosanctum Concilium', 'Canh Tân Phụng Vụ']
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả Chuyên Mục', icon: Layers },
  { id: 'kinh-thanh', label: 'Kinh Thánh', icon: BookOpen },
  { id: 'khao-co', label: 'Khảo Cổ Kinh Thánh', icon: Globe },
  { id: 'boi-canh', label: 'Bối Cảnh Kinh Thánh', icon: Compass },
  { id: 'nhan-vat', label: 'Nhân Vật', icon: UserCheck },
  { id: 'chu-giai', label: 'Chú Giải', icon: ScrollText },
  { id: 'suy-niem', label: 'Suy Niệm', icon: Heart },
  { id: 'cac-thanh', label: 'Các Thánh & Linh Đạo', icon: Cross },
  { id: 'phung-vu', label: 'Phụng Vụ & Bí Tích', icon: Church },
];

export default function NeededContentPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOPICS_DATA.length };
    TOPICS_DATA.forEach((item) => {
      counts[item.categorySlug] = (counts[item.categorySlug] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredTopics = useMemo(() => {
    return TOPICS_DATA.filter((item) => {
      const matchCat = activeCategory === 'all' || item.categorySlug === activeCategory;
      const matchPriority = selectedPriority === 'all' || item.priority === selectedPriority;
      const matchSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchPriority && matchSearch;
    });
  }, [activeCategory, selectedPriority, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Danh Mục Đề Tài Nghiên Cứu Ưu Tiên</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Nội Dung Cần Thiết Cho VERIDU
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Tuyển tập các đề tài nghiên cứu trọng điểm được tuyển chọn theo 8 chuyên mục học thuật Công giáo. Hãy chọn đề tài bạn am tường để bắt đầu viết bài và chia sẻ tri thức cùng cộng đoàn.
          </p>
        </div>
      </section>

      {/* Main 2-Column Content Layout (Sidebar 30% - Topics 70%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 30% (lg:col-span-4) - STICKY FILTER SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Search Box Card */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-3">
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Tìm Kiếm Đề Tài
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Giao ước, Qumran, Ga 6, Môsê..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Priority Filter */}
              <div className="pt-2">
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Mức Độ Ưu Tiên
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-main)] outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">Tất Cả Mức Độ</option>
                  <option value="Khẩn Cấp">🔴 Khẩn Cấp (Cần gấp)</option>
                  <option value="Ưu Tiên Cao">🟠 Ưu Tiên Cao</option>
                  <option value="Mở Rộng">🟢 Mở Rộng</option>
                </select>
              </div>
            </div>

            {/* 8 Categories Navigation List */}
            <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  8 Chuyên Mục Nghiên Cứu
                </span>
                <span className="text-[11px] font-mono text-amber-500 font-bold">
                  {TOPICS_DATA.length} Đề tài
                </span>
              </div>

              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-serif transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'text-[var(--text-main)] hover:bg-[var(--bg-main)] hover:text-amber-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                        <span>{cat.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggest New Topic Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-transparent border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider">
                  Đề Xuất Đề Tài Mới
                </h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-serif">
                Bạn có công trình khảo cứu hoặc ý tưởng đề tài chưa có trong danh sách? Hãy tự do khởi tạo bài viết mới ngay trong phòng soạn thảo!
              </p>
              <Link
                href="/dang-bai"
                className="w-full py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Viết Đề Tài Tự Chọn</span>
              </Link>
            </div>

          </aside>

          {/* RIGHT COLUMN: 70% (lg:col-span-8) - TOPIC CARDS LIST */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
              <div className="text-xs sm:text-sm font-serif text-[var(--text-muted)]">
                Hiển thị <span className="font-bold text-amber-500">{filteredTopics.length}</span> đề tài 
                {activeCategory !== 'all' && (
                  <span> trong chuyên mục <strong className="text-[var(--text-main)]">{CATEGORIES.find(c => c.id === activeCategory)?.label}</strong></span>
                )}
              </div>
              {(activeCategory !== 'all' || selectedPriority !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setActiveCategory('all'); setSelectedPriority('all'); setSearchQuery(''); }}
                  className="text-xs font-serif text-amber-500 hover:underline cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredTopics.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4">
                <AlertCircle className="w-12 h-12 text-amber-500/50 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  Không Tìm Thấy Đề Tài Phù Hợp
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto font-serif">
                  Không có đề tài nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;. Bạn có thể tự do khởi tạo đề tài này trong phòng soạn thảo.
                </p>
                <Link
                  href={`/dang-bai?topic=${encodeURIComponent(searchQuery)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs shadow-md hover:bg-amber-400 transition"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Soạn Thảo Đề Tài Này Ngay</span>
                </Link>
              </div>
            ) : (
              /* Topic Cards List */
              <div className="space-y-4">
                {filteredTopics.map((topic) => {
                  const isUrgent = topic.priority === 'Khẩn Cấp';
                  const isHigh = topic.priority === 'Ưu Tiên Cao';
                  const writeUrl = `/dang-bai?topic=${encodeURIComponent(topic.title)}&category=${encodeURIComponent(topic.category)}`;

                  return (
                    <article
                      key={topic.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/40 shadow-sm transition-all space-y-4 group"
                    >
                      {/* Card Header: Category & Priority */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-serif font-bold text-xs">
                          {topic.category}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isUrgent 
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' 
                            : isHigh 
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                            : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        }`}>
                          {isUrgent ? '🔴 Khẩn Cấp' : isHigh ? '🟠 Ưu Tiên Cao' : '🟢 Mở Rộng'}
                        </span>
                      </div>

                      {/* Title & Scope */}
                      <div>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] group-hover:text-amber-500 transition-colors leading-snug mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed">
                          {topic.scope}
                        </p>
                      </div>

                      {/* Tags & Action Button */}
                      <div className="pt-3 border-t border-[var(--border-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {topic.tags.map((tag, tIdx) => (
                            <span 
                              key={tIdx}
                              className="px-2 py-0.5 rounded-lg bg-[var(--bg-main)] text-[10px] text-[var(--text-muted)] font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={writeUrl}
                          className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 font-serif font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-auto"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Nhận Viết Đề Tài Này</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          </main>

        </div>
      </section>
    </div>
  );
}
