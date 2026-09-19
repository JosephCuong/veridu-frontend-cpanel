'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Share2, Copy, Check, ExternalLink, Sparkles, 
  Send, MessageCircle, Mail, Globe, Layers, ArrowLeft, RefreshCw,
  Search, CheckCircle2, Bookmark, Flame
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import QuoteCardModal from '@/components/QuoteCardModal';

interface PostItem {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author_name?: string;
  created_at?: string;
}

type Channel = 'facebook' | 'zalo' | 'telegram' | 'email';

const CHANNELS: { id: Channel; name: string; iconName: string; color: string; bg: string; border: string }[] = [
  { id: 'facebook', name: 'Facebook Post / Group', iconName: 'FB', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'zalo', name: 'Zalo Group / Nhật Ký', iconName: 'Zalo', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  { id: 'telegram', name: 'Telegram Broadcast', iconName: 'TG', color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { id: 'email', name: 'Bản Tin Email Công Giáo', iconName: 'Mail', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
];

export default function SocialCampaignAdminPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel>('facebook');
  const [campaignName, setCampaignName] = useState('mua-phung-vu');
  const [customCTA, setCustomCTA] = useState('Kính mời quý cộng đoàn cùng tìm hiểu và chia sẻ chân lý cứu độ!');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, category, author_name, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        setPosts(data as PostItem[]);
        setSelectedPost(data[0] as PostItem);
      }
    } catch (e) {
      console.error('Fetch posts error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cleanTitle = selectedPost?.title?.replace(/<[^>]+>/g, '') || 'Bài Viết VERIDU';
  const cleanExcerpt = selectedPost?.excerpt?.replace(/<[^>]+>/g, '') || 'Khám phá kho tàng thần học và linh đạo Công giáo trên VERIDU.';
  const author = selectedPost?.author_name || 'Ban Học Vụ VERIDU';
  const category = selectedPost?.category || 'Thánh Kinh & Thần Học';

  // UTM Tracking Link
  const baseUrl = selectedPost ? ('https://www.thapgia.com/' + selectedPost.slug) : 'https://www.thapgia.com';
  const utmUrl = baseUrl + '?utm_source=' + selectedChannel + '&utm_medium=social&utm_campaign=' + encodeURIComponent(campaignName) + '&utm_content=' + (selectedPost?.slug || 'home');

  // Generate Social Copy tailored to Catholic community
  const generateCopy = (): string => {
    const hashtags = '#VERIDU #ThapGia #KinhThanh #ThanHocCongGiao #LoiChuaMoiNgay #HocVienVeridu';

    if (selectedChannel === 'facebook') {
      return '✨ [TRẦM TƯ & HỌC HỎI ĐỨC TIN] ' + cleanTitle.toUpperCase() + '\n\n' +
        '🕊️ "' + cleanExcerpt.slice(0, 220) + '..."\n\n' +
        '📖 Chuyên mục: ' + category + '\n' +
        '✍️ Biên soạn: ' + author + '\n\n' +
        '👉 Đọc trọn vẹn tài liệu & suy niệm tại:\n' + utmUrl + '\n\n' +
        customCTA + '\n\n' +
        hashtags;
    }

    if (selectedChannel === 'zalo') {
      return '🌿 GỬI CỘNG ĐOÀN BÀI HỌC ĐỨC TIN HÔM NAY:\n\n' +
        '📌 ' + cleanTitle + '\n' +
        '"' + cleanExcerpt.slice(0, 160) + '..."\n\n' +
        '🔗 Kính mời anh chị em cùng đọc:\n' + utmUrl + '\n\n' +
        'Chúc quý cộng đoàn một ngày an lành trong Chúa!';
    }

    if (selectedChannel === 'telegram') {
      return '⚡️ *' + cleanTitle + '*\n\n' +
        '_"' + cleanExcerpt.slice(0, 200) + '..."_\n\n' +
        '📚 *Chuyên mục:* ' + category + '\n' +
        '👤 *Biên soạn:* ' + author + '\n\n' +
        '🔗 [Đọc bài viết đầy đủ trên VERIDU](' + utmUrl + ')\n\n' +
        hashtags;
    }

    if (selectedChannel === 'email') {
      return 'Kính gửi quý độc giả & anh chị em trong Đức Kitô,\n\n' +
        'Ban Học Vụ VERIDU xin trân trọng giới thiệu bài nghiên cứu mới nhất:\n\n' +
        '▶ ' + cleanTitle + '\n' +
        'Tác giả: ' + author + ' | Chuyên mục: ' + category + '\n\n' +
        cleanExcerpt + '\n\n' +
        'Kính mời quý vị bấm vào đường dẫn dưới đây để xem toàn văn tài liệu và các bản đồ khảo cổ liên quan:\n' +
        utmUrl + '\n\n' +
        'Nguyện xin bình an của Chúa Kitô ở cùng quý vị!\n' +
        'Ban Học Vụ & Truyền Thông VERIDU';
    }

    return '';
  };

  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCopy());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(utmUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const openSocialChannel = () => {
    if (selectedChannel === 'facebook') {
      window.open('https://www.facebook.com', '_blank');
    } else if (selectedChannel === 'zalo') {
      window.open('https://chat.zalo.me', '_blank');
    } else if (selectedChannel === 'telegram') {
      window.open('https://web.telegram.org', '_blank');
    } else if (selectedChannel === 'email') {
      window.open('mailto:?subject=' + encodeURIComponent(cleanTitle) + '&body=' + encodeURIComponent(generateCopy()), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-amber-500 transition-colors"
                title="Quay lại Admin"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
                  Chiến Dịch Quảng Bá & Lan Tỏa Mạng Xã Hội
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif pl-12">
              Bộ công cụ truyền thông miễn phí: Tự động tạo kịch bản đăng bài Facebook, Zalo, Telegram kèm mã theo dõi Google Analytics (UTM Tracking)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 text-xs font-serif font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo Thẻ Ảnh</span>
            </button>
            <button
              onClick={fetchPosts}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw className={'w-4 h-4 ' + (isLoading ? 'animate-spin' : '')} />
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Post Picker & Settings (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Search Posts */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  1. Chọn Bài Viết Mục Tiêu ({filteredPosts.length})
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết theo tiêu đề..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Scrollable list */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={'w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 cursor-pointer ' + (
                      selectedPost?.id === post.id
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                        : 'bg-[var(--bg-main)]/50 border-[var(--border-card)] hover:border-slate-500/30 text-[var(--text-muted)]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-amber-500/90 truncate">
                        {post.category || 'Bài viết'}
                      </span>
                      {selectedPost?.id === post.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className={'font-serif font-bold line-clamp-2 ' + (
                      selectedPost?.id === post.id ? 'text-[var(--text-main)]' : 'text-[var(--text-main)]/80'
                    )}>
                      {post.title?.replace(/<[^>]+>/g, '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Parameters */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                2. Thiết Lập Tham Số Theo Dõi (UTM)
              </span>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                  Tên Chiến Dịch (Campaign Name)
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="VD: mua-chay, giang-sinh, phuc-sinh, loan-bao-tin-mung"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                  Lời Kêu Gọi Tùy Biến (Custom CTA)
                </label>
                <input
                  type="text"
                  value={customCTA}
                  onChange={(e) => setCustomCTA(e.target.value)}
                  placeholder="Nhập lời kêu gọi tương tác..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Social Generator & Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Channel Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={'p-3 rounded-2xl border text-xs font-bold font-serif transition-all flex flex-col items-center gap-1.5 cursor-pointer ' + (
                    selectedChannel === ch.id
                      ? ch.bg + ' ' + ch.border + ' ' + ch.color + ' shadow-md scale-[1.02]'
                      : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  )}
                >
                  <span className="text-sm font-black">{ch.iconName}</span>
                  <span className="text-[11px] truncate">{ch.name.split('/')[0]}</span>
                </button>
              ))}
            </div>

            {/* Generated UTM Link Box */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Đường dẫn UTM Tracking (Đo lường Google Analytics)
                </span>
                <button
                  onClick={copyLinkToClipboard}
                  className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã sao chép link!' : 'Sao chép link'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-card)] font-mono text-xs text-amber-400 break-all select-all">
                {utmUrl}
              </div>
            </div>

            {/* Content Preview & Generator */}
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Nội Dung Bài Đăng Sẵn Sàng Gửi Đi
                  </span>
                </div>
                <span className="text-[11px] text-amber-500 font-serif">
                  Chuẩn hóa văn phong phụng vụ
                </span>
              </div>

              <textarea
                rows={12}
                readOnly
                value={generateCopy().replace(/\n/g, '\n')}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl p-4 text-xs font-serif leading-relaxed text-[var(--text-main)] resize-none focus:outline-none focus:border-amber-500 whitespace-pre-wrap select-all"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={copyTextToClipboard}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Đã Sao Chép Toàn Bộ Kịch Bản!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Bài Đăng Để Dán</span>
                    </>
                  )}
                </button>

                <button
                  onClick={openSocialChannel}
                  className="py-3 px-4 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-main)]/80 text-[var(--text-main)] border border-[var(--border-card)] font-serif font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4 text-amber-500" />
                  <span>Mở Trực Tiếp {selectedChannel.toUpperCase()}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Quote Card Modal integration for the campaign */}
      {selectedPost && (
        <QuoteCardModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          initialQuote={cleanExcerpt.slice(0, 180)}
          initialTitle={cleanTitle}
          initialAuthor={author}
          category={category}
        />
      )}

    </div>
  );
}
