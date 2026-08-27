'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, 
  Award, 
  Flame, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Coins, 
  Shield, 
  Zap, 
  Star, 
  ShoppingBag, 
  Users, 
  Check, 
  Play, 
  Volume2,
  Tv,
  Cross
} from 'lucide-react';
import { getStoredUser, addFaithPoints } from '@/lib/auth';
import { ARCADE_GAMES, MANNA_STORE_ITEMS, GameEvent } from '@/lib/gamesData';
import { supabase } from '@/lib/supabaseClient';

export default function GameArcadeHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    level: 1,
    total_xp: 150,
    manna: 120,
    current_title: 'Tân Tòng Nhỏ',
    badges: ['tan_tong']
  });
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // Smooth Launcher Splash State
  const [launchingGame, setLaunchingGame] = useState<any | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    if (u) {
      setProfile((prev: any) => ({
        ...prev,
        total_xp: u.points !== undefined ? u.points : prev.total_xp,
        manna: u.manna !== undefined ? u.manna : prev.manna,
        current_title: (u as any).current_title || prev.current_title,
        badges: u.badges || prev.badges
      }));
    }
    loadGameEvents();
    if (u && u.id) {
      loadGameProfile(u.id);
    }

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
        setProfile((prev: any) => ({
          ...prev,
          total_xp: e.detail.points !== undefined ? e.detail.points : prev.total_xp,
          manna: e.detail.manna !== undefined ? e.detail.manna : prev.manna,
          current_title: e.detail.current_title || prev.current_title,
          badges: e.detail.badges || prev.badges
        }));
      }
    };

    window.addEventListener('veridu_user_updated', handleUserUpdate);
    return () => window.removeEventListener('veridu_user_updated', handleUserUpdate);
  }, []);

  const loadGameProfile = async (userId: string | number) => {
    try {
      const res = await fetch(`/api/game/profile?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {}
  };

  const loadGameEvents = async () => {
    try {
      const { data } = await supabase
        .from('game_events')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (e) {}
  };

  // Play Sacred Chime on Launch
  const playLaunchSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const freqs = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5 (Sacred major chord)
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
      });
    } catch (e) {}
  };

  const handleLaunchGame = (game: any) => {
    setLaunchingGame(game);
    setLaunchProgress(15);
    playLaunchSound();

    const interval = setInterval(() => {
      setLaunchProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      setLaunchProgress(100);
      setTimeout(() => {
        router.push(game.play_url);
      }, 200);
    }, 600);
  };

  const handleRedeemItem = (item: any) => {
    if (profile.manna < item.cost) {
      alert(`Bạn cần thêm ${item.cost - profile.manna} Bánh Manna để đổi vật phẩm này! Hãy hoàn thành các ải game để nhận thêm Manna.`);
      return;
    }

    const newManna = profile.manna - item.cost;
    setProfile((prev: any) => ({ ...prev, manna: newManna }));
    addFaithPoints(0, -item.cost, undefined, item.id);
    setRedeemSuccess(`Chúc mừng! Bạn đã đổi thành công "${item.name}"!`);
    setTimeout(() => setRedeemSuccess(null), 4000);

    if (user && user.id) {
      fetch('/api/game/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameSlug: 'store_redeem',
          addManna: -item.cost
        })
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 pb-24 pt-16 md:pt-20">
      
      {/* ── 1. SACRED ARCADE HERO BANNER ── */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.03] to-[var(--bg-main)] dark:from-stone-950 dark:via-stone-900 dark:to-[var(--bg-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-serif font-bold tracking-wider backdrop-blur-md shadow-sm">
            <Gamepad2 className="w-4 h-4 text-amber-500" />
            <span>CỔNG WEBGAME GIÁO LÝ THIẾU NHI &amp; GIA ĐÌNH</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] tracking-tight leading-tight">
            Đấu Trường Đức Tin{' '}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent">
              Học Mà Chơi
            </span>
          </h1>

          <p className="text-slate-600 dark:text-stone-300 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed font-serif italic">
            Bước vào thế giới game hóa giáo lý sống động: Chinh phục bản đồ chiến đấu Kinh Thánh 2D, đấu trí đỉnh cao tại Ai Là Triệu Phú Đức Tin, tích lũy Faith XP và rinh về Bánh Manna đổi quà!
          </p>

          {/* Quick HUD Player Status Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                Lv.{profile.level || 1}
              </span>
              <div className="text-left">
                <span className="text-[10px] text-[var(--text-muted)] font-serif block">Danh Hiệu</span>
                <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-300">{profile.current_title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg">
              <Coins className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <span className="text-[10px] text-[var(--text-muted)] font-serif block">Bánh Manna</span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{profile.manna || 100} Manna</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-lg">
              <Star className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <span className="text-[10px] text-[var(--text-muted)] font-serif block">Kinh Nghiệm</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{profile.total_xp || 0} Faith XP</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. FEATURED GAMES SHOWCASE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
          <div>
            <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Sảnh Trò Chơi Trực Tuyến
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-main)]">
              Tựa Game Giáo Lý Nổi Bật
            </h2>
          </div>
          <span className="text-xs font-serif text-[var(--text-muted)]">
            Tối ưu 100% Mobile · Zero Lag
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARCADE_GAMES.map((game, idx) => (
            <div
              key={game.id}
              className="group rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-card)] hover:border-amber-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden p-6 sm:p-8 relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-serif font-bold text-xs">
                    {game.badge}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-serif flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-500" /> {game.target_age}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-black text-2xl text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs font-serif text-amber-700/80 dark:text-amber-400/80 font-bold mt-1">
                    {game.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif leading-relaxed line-clamp-3">
                  {game.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 text-xs font-serif">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3" /> +{game.reward_xp} XP
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3" /> +{game.reward_manna} Manna
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-card)] text-[var(--text-muted)]">
                    ⏱️ {game.estimated_time}
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[var(--border-card)] flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
                  {idx === 0 ? '🗺️ 4 Vùng Đất · 12 Trạm' : '👑 15 Câu Hỏi · 4 Trợ Giúp'}
                </span>

                <button
                  onClick={() => handleLaunchGame(game)}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all group-hover:scale-105 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Vào Game Ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── 3. EVENTS & TOURNAMENTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">
                Sự Kiện &amp; Đấu Trường Tuần
              </h3>
            </div>
            <span className="text-xs font-serif text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Đang Diễn Ra
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length > 0 ? (
              events.map((evt) => (
                <div key={evt.id} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      {evt.event_type === 'weekly_tournament' ? 'Đấu Trường Tuần' : 'Sự Kiện Mùa'}
                    </span>
                    <span className="text-xs font-mono text-amber-500 font-bold">
                      +{evt.reward_xp} XP / +{evt.reward_manna} Manna
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[var(--text-main)]">
                    {evt.title}
                  </h4>

                  <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                    {evt.description || evt.subtitle}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs font-serif">
                    <span className="text-amber-700 dark:text-amber-300 font-bold">
                      🏆 Thưởng: {evt.reward_badge || 'Huy Hiệu Vinh Danh'}
                    </span>
                    <button onClick={() => handleLaunchGame(ARCADE_GAMES[0])} className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                      <span>Tham gia</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  Sự Kiện Tuần
                </span>
                <h4 className="font-serif font-bold text-base text-[var(--text-main)]">
                  Thử Thách Thập Giới: Mười Điều Răn Chúa
                </h4>
                <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
                  Vượt qua Trạm 5 Núi Sinai với 3 sao tuyệt đối để nhận ngay Huy Hiệu Hiệp Sĩ Mười Điều Răn.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. MANNA STORE (REWARDS) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-card)] pb-4">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-serif font-bold text-xl text-[var(--text-main)]">
                  Cửa Tiệm Hồng Ân (Manna Store)
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-serif">
                  Dùng Bánh Manna tích lũy được qua từng trận đấu để đổi quà tặng ý nghĩa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs bg-[var(--bg-main)] px-3 py-1.5 rounded-xl border border-[var(--border-card)]">
              <span>Số Manna của bạn:</span>
              <strong className="text-amber-600 dark:text-amber-400">{profile.manna || 100} 🍞</strong>
            </div>
          </div>

          {redeemSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-serif font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{redeemSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {MANNA_STORE_ITEMS.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-card)] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-3xl">{item.icon}</div>
                  <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] font-serif leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {item.cost} Manna
                  </span>
                  <button
                    onClick={() => handleRedeemItem(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-serif font-bold shadow-sm transition cursor-pointer"
                  >
                    Đổi Quà
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. IMMERSIVE SACRED GAME LAUNCHER OVERLAY ── */}
      {launchingGame && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          
          <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
            {/* Pulsing Golden Halo */}
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-amber-500/30 blur-md" />
            
            <div className="relative w-24 h-24 rounded-3xl bg-stone-900 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-4xl shadow-amber-500/30">
              <Cross className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
              ✦ VERIDU FAITH ENGINE · ĐANG KHỞI ĐỘNG ✦
            </span>
            <h3 className="font-serif font-black text-2xl text-stone-100">
              {launchingGame.title}
            </h3>
            <p className="text-xs text-stone-400 font-serif italic">
              {launchingGame.subtitle}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-stone-800 rounded-full mt-6 overflow-hidden relative border border-stone-700">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-150 rounded-full"
              style={{ width: `${launchProgress}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-stone-400 mt-2">
            Đang tải dữ liệu {launchProgress}%...
          </span>

        </div>
      )}

    </div>
  );
}
