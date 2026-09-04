'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AuthorCommunityNav from '@/components/AuthorCommunityNav';
import { 
  Compass, 
  Search, 
  PenTool, 
  Filter, 
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
  AlertCircle
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
    tags: ['Bia Tel Dan', 'Nhà Đavít', 'Văn Khắc Cổ', ' Levant']
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
    tags: ['Cận Đông ANE', 'Hammurabi', 'Ngũ Kinh', 'Luật Môsê']
  },
  {
    id: 'bc-02',
    category: 'Bối Cảnh Kinh Thánh',
    categorySlug: 'boi-canh',
    title: 'Văn Hóa Hy Lạp Hóa (Hellenism) Và Sự Kháng Cự Của Nhà Maccabê',
    scope: 'Bối cảnh thời kỳ chuyển giao Cựu Ước - Tân Ước, phong trào Maccabê và sự ra đời của ngày lễ Cung Hiến (Hanukkah).',
    priority: 'Ưu Tiên Cao',
    tags: ['Maccabê', 'Hellenism', 'Thời Kỳ Chuyển Tiếp']
  },
  {
    id: 'bc-03',
    category: 'Bối Cảnh Kinh Thánh',
    categorySlug: 'boi-canh',
    title: 'Các Nhóm Xã Hội - Tôn Giáo Thời Chúa Giêsu: Pharisêu, Sađốc, Essene Và Zealot',
    scope: 'Phân tích cơ cấu chính trị, thần học và thái độ của Chúa Kitô đối với từng trào lưu đương thời.',
    priority: 'Ưu Tiên Cao',
    tags: ['Pharisêu', 'Sađốc', 'Essene', 'Thế Kỷ I']
  },

  // 4. Nhân Vật
  {
    id: 'nv-01',
    category: 'Nhân Vật',
    categorySlug: 'nhan-vat',
    title: 'Đức Maria - Hòm Bia Giao Ước Mới Trong Tin Mừng Luca',
    scope: 'Nghiên cứu mô thức Loại Hình Học (Typology) giữa Hòm Bia Giao Ước Cựu Ước và Đức Mẹ trong bài ca Magnificat.',
    priority: 'Khẩn Cấp',
    tags: ['Đức Maria', 'Hòm Bia Mới', 'Luca', 'Typology']
  },
  {
    id: 'nv-02',
    category: 'Nhân Vật',
    categorySlug: 'nhan-vat',
    title: 'Thánh Phaolô Tông Đồ: Cuộc Trở Lại Đamát Và Tư Tưởng Thần Học Cốt Lõi',
    scope: 'Khám phá chuyển biến tâm linh của Saolô, thần học về Đức Tin và Ơn Công Chính Hóa.',
    priority: 'Ưu Tiên Cao',
    tags: ['Thánh Phaolô', 'Đamát', 'Công Chính Hóa']
  },
  {
    id: 'nv-03',
    category: 'Nhân Vật',
    categorySlug: 'nhan-vat',
    title: 'Vua Đa-vít: Giữa Bất Toàn Con Người Và Trái Tim Hướng Về Thiên Chúa',
    scope: 'Chân dung vị vua lý tưởng, sự sám hối trong Thánh Vịnh 51 (Miserere) và lời hứa cứu độ vĩnh cửu.',
    priority: 'Mở Rộng',
    tags: ['Đavít', 'Thánh Vịnh', 'Sám Hối']
  },

  // 5. Chú Giải Kinh Thánh
  {
    id: 'cg-01',
    category: 'Chú Giải',
    categorySlug: 'chu-giai',
    title: 'Chú Giải Tám Mối Phúc Thật (Bài Giảng Trên Núi - Mt 5:1-12)',
    scope: 'Áp dụng quy trình 6 tầng chú giải: Từ ngữ Hy Lạp Makarioi, bối cảnh Cựu Ước, ý nghĩa Kitô học và ứng dụng luân lý.',
    priority: 'Khẩn Cấp',
    tags: ['Bát Phúc', 'Mt 5', 'Bài Giảng Trên Núi', 'Makarioi']
  },
  {
    id: 'cg-02',
    category: 'Chú Giải',
    categorySlug: 'chu-giai',
    title: 'Diễn Từ Bánh Hằng Sống Trong Tin Mừng Gioan (Ga 6:22-59)',
    scope: 'Phân tích thần học Bí tích Thánh Thể qua từ ngữ Hy Lạp Sarx và Trogo, đối chiếu với Manna trong sa mạc.',
    priority: 'Khẩn Cấp',
    tags: ['Bánh Hằng Sống', 'Ga 6', 'Thánh Thể', 'Sarx']
  },

  // 6. Suy Niệm
  {
    id: 'sn-01',
    category: 'Suy Niệm',
    categorySlug: 'suy-niem',
    title: 'Phương Pháp Lectio Divina: 4 Bước Cầu Nguyện Với Lời Chúa Cho Gia Đình',
    scope: 'Hướng dẫn cụ thể Đọc (Lectio), Suy niệm (Meditatio), Cầu nguyện (Oratio), và Chiêm niệm (Contemplatio).',
    priority: 'Ưu Tiên Cao',
    tags: ['Lectio Divina', 'Cầu Nguyện', 'Linh Đạo']
  },
  {
    id: 'sn-02',
    category: 'Suy Niệm',
    categorySlug: 'suy-niem',
    title: 'Suy Niệm Biến Cố Chúa Biến Hình Trên Núi Tabor: Ánh Sáng Phục Sinh Giữa Thử Thách',
    scope: 'Ý nghĩa sự hiện diện của Môsê và Êlia, tiếng Chúa Cha và niềm hy vọng cho người Kitô hữu hôm nay.',
    priority: 'Mở Rộng',
    tags: ['Biến Hình', 'Tabor', 'Môsê', 'Êlia']
  },

  // 7. Các Thánh
  {
    id: 'ct-01',
    category: 'Các Thánh',
    categorySlug: 'cac-thanh',
    title: 'Thánh Tôma Aquinô Và Năm Con Đường Chứng Minh Thiên Chúa Hiện Hữu (Quinque Viae)',
    scope: 'Giới thiệu tư tưởng triết học - thần học trong bộ Tổng Luận Thần Học (Summa Theologiae).',
    priority: 'Khẩn Cấp',
    tags: ['Tôma Aquinô', 'Quinque Viae', 'Summa Theologiae', 'Triết Học']
  },
  {
    id: 'ct-02',
    category: 'Các Thánh',
    categorySlug: 'cac-thanh',
    title: 'Các Thánh Tử Đạo Việt Nam: Chứng Tá Trung Tín Của Thánh Anrê Dũng Lạc',
    scope: 'Bối cảnh bách hại thế kỷ XIX, lòng kiên trung bảo vệ Đức Tin và tình yêu quê hương đất nước.',
    priority: 'Ưu Tiên Cao',
    tags: ['Tử Đạo VN', 'Anrê Dũng Lạc', 'Lịch Sử Giáo Hội VN']
  },
  {
    id: 'ct-03',
    category: 'Các Thánh',
    categorySlug: 'cac-thanh',
    title: 'Linh Đạo Thơ Ấu Tâm Linh Của Thánh Nữ Têrêsa Hài Đồng Giêsu',
    scope: 'Con đường bé nhỏ nên thánh giữa cuộc sống thường nhật và ý nghĩa học vị Tiến sĩ Hội Thánh.',
    priority: 'Mở Rộng',
    tags: ['Têrêsa Hài Đồng', 'Con Đường Bé Nhỏ', 'Tiến Sĩ Hội Thánh']
  },

  // 8. Phụng Vụ
  {
    id: 'pv-01',
    category: 'Phụng Vụ',
    categorySlug: 'phung-vu',
    title: 'Thần Học Phụng Vụ Thánh Lễ: Từ Lời Đến Bàn Tiệc Thánh Thể',
    scope: 'Giải thích chi tiết các cử hành Phụng Vụ Lời Chúa, Kinh Tiền Tụng, Kinh Nguyện Thánh Thể và sự hiện diện thực sự.',
    priority: 'Khẩn Cấp',
    tags: ['Thánh Lễ', 'Phụng Vụ Lời Chúa', 'Thánh Thể', 'Bí Tích']
  },
  {
    id: 'pv-02',
    category: 'Phụng Vụ',
    categorySlug: 'phung-vu',
    title: 'Ý Nghĩa Thần Học Của Năm Phụng Vụ Và Các Mùa Phụng Vụ Trong Giáo Hội Công Giáo',
    scope: 'Mùa Vọng, Mùa Giáng Sinh, Mùa Chay, Tam Nhật Vượt Qua, Mùa Phục Sinh và Mùa Thường Niên.',
    priority: 'Ưu Tiên Cao',
    tags: ['Năm Phụng Vụ', 'Mùa Chay', 'Phục Sinh', 'Tam Nhật Vượt Qua']
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả 8 Chuyên Mục', icon: Compass },
  { id: 'kinh-thanh', label: '📖 Kinh Thánh', icon: BookOpen },
  { id: 'khao-co', label: '🏺 Khảo Cổ Kinh Thánh', icon: Globe },
  { id: 'boi-canh', label: '🏛️ Bối Cảnh Lịch Sử', icon: ScrollText },
  { id: 'nhan-vat', label: '👤 Nhân Vật', icon: UserCheck },
  { id: 'chu-giai', label: '🔍 Chú Giải (Exegesis)', icon: Sparkles },
  { id: 'suy-niem', label: '🕊️ Suy Niệm Lời Chúa', icon: Heart },
  { id: 'cac-thanh', label: '✨ Các Thánh & Linh Đạo', icon: Cross },
  { id: 'phung-vu', label: '⛪ Phụng Vụ & Bí Tích', icon: Church },
];

export default function NeededContentPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

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
      {/* Community Sub-navigation */}
      <AuthorCommunityNav currentTab="needed" />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-[var(--border-card)] bg-gradient-to-b from-amber-500/10 via-[var(--bg-main)] to-[var(--bg-main)] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-serif font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Danh Mục Đề Tài Ưu Tiên (Research Want List)</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-main)] leading-tight mb-4">
            Nội Dung Cần Thiết Cho Nghiên Cứu
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl mx-auto font-serif leading-relaxed">
            Dưới đây là danh sách các đề tài nghiên cứu trọng điểm được Hội Đồng Thần Học VERIDU tuyển chọn theo 8 lĩnh vực cốt lõi. Hãy chọn một đề tài bạn có thế mạnh và bắt đầu viết bài để cùng làm phong phú kho tàng tri thức Công giáo.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          
          {/* Search Box & Priority Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo từ khóa, nhân vật, câu Kinh Thánh (ví dụ: Giao ước, Qumran, Ga 6)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-serif font-bold text-[var(--text-muted)] hidden sm:inline">Ưu tiên:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-main)] outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Tất Cả Mức Độ</option>
                <option value="Khẩn Cấp">🔴 Khẩn Cấp</option>
                <option value="Ưu Tiên Cao">🟠 Ưu Tiên Cao</option>
                <option value="Mở Rộng">🟢 Mở Rộng</option>
              </select>
            </div>
          </div>

          {/* 8 Categories Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[var(--border-card)]">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Topics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs sm:text-sm font-serif text-[var(--text-muted)]">
            Đang hiển thị <strong className="text-[var(--text-main)]">{filteredTopics.length}</strong> đề tài nghiên cứu
          </span>
          <Link
            href="/huong-dan-viet-bai"
            className="text-xs font-serif font-bold text-amber-500 hover:underline flex items-center gap-1"
          >
            <span>Xem Quy Chuẩn Soạn Thảo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-amber-500/50 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-[var(--text-main)] mb-1">
              Không tìm thấy đề tài phù hợp
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-serif mb-4">
              Bạn có thể thử tìm với từ khóa khác hoặc gửi đề xuất đề tài mới cho Ban Biên Tập.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSelectedPriority('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-serif font-bold cursor-pointer"
            >
              Đặt Lại Bộ Lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => {
              const priorityColor = 
                topic.priority === 'Khẩn Cấp' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' :
                topic.priority === 'Ưu Tiên Cao' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

              return (
                <div
                  key={topic.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500/50 rounded-3xl p-6 shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold">
                        {topic.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityColor}`}>
                        {topic.priority}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] group-hover:text-amber-500 transition mb-3 leading-snug">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-3">
                      {topic.scope}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {topic.tags.map((tag, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-card)] text-[10px] font-serif text-[var(--text-muted)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Action to Editor */}
                  <Link
                    href={`/dang-bai?title=${encodeURIComponent(topic.title)}&category=${encodeURIComponent(topic.category)}`}
                    className="w-full py-2.5 px-4 rounded-2xl bg-[var(--bg-main)] hover:bg-amber-500 hover:text-slate-950 border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold text-[var(--text-main)] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-500 group-hover/btn:text-slate-950" />
                    <span>Nhận Đề Tài & Viết Bài</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Suggest a Topic Banner */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-indigo-500/10 border border-amber-500/30 rounded-3xl p-8 text-center space-y-3 shadow-lg">
          <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">
            Bạn Muốn Đề Xuất Một Đề Tài Mới?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif max-w-xl mx-auto">
            Nếu bạn có một công trình nghiên cứu ngoài danh mục trên, đừng ngần ngại khởi tạo bài viết mới hoặc liên hệ Ban Biên Tập để cùng thảo luận hướng đi.
          </p>
          <div className="pt-2">
            <Link
              href="/dang-bai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-serif font-bold shadow-md transition"
            >
              <PenTool className="w-4 h-4" />
              <span>Khởi Tạo Bài Viết Tự Do</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
