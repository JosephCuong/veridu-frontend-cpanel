'use client';

import React from 'react';
import Image from 'next/image';
import { calculateLevelInfo } from '@/lib/gamification';

interface UserAvatarFrameProps {
  avatarUrl?: string | null;
  christianName?: string | null;
  displayName?: string | null;
  points?: number;
  selectedTitle?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTitleRibbon?: boolean;
  showProgressBar?: boolean;
  className?: string;
}

export default function UserAvatarFrame({
  avatarUrl,
  christianName,
  displayName,
  points = 100,
  selectedTitle,
  size = 'lg',
  showTitleRibbon = true,
  showProgressBar = true,
  className = ''
}: UserAvatarFrameProps) {
  const levelInfo = calculateLevelInfo(points, selectedTitle || undefined);

  // Size configurations
  const sizeMap = {
    sm: { container: 'w-10 h-10', text: 'text-xs', ribbonText: 'text-[9px]', padding: 'p-0.5' },
    md: { container: 'w-16 h-16', text: 'text-sm', ribbonText: 'text-[10px]', padding: 'p-1' },
    lg: { container: 'w-28 h-28', text: 'text-2xl', ribbonText: 'text-[11px]', padding: 'p-1.5' },
    xl: { container: 'w-36 h-36', text: 'text-3xl', ribbonText: 'text-xs', padding: 'p-2' }
  };

  const currentSize = sizeMap[size];

  // Metallic Frame Colors by Tier (Pure Typography & Sacred Metallics, NO Icons)
  const tierFrameStyles = {
    'bronze': {
      border: 'border-amber-800/60 bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-transparent',
      ring: 'ring-1 ring-amber-700/30',
      ribbonBg: 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 border-amber-700/50',
      progressBg: 'bg-amber-700',
      glow: 'shadow-md'
    },
    'bronze-bright': {
      border: 'border-amber-600 bg-gradient-to-br from-amber-800/40 via-amber-700/20 to-transparent',
      ring: 'ring-2 ring-amber-500/40',
      ribbonBg: 'bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 text-amber-100 border-amber-500/60',
      progressBg: 'bg-amber-600',
      glow: 'shadow-md shadow-amber-900/30'
    },
    'silver': {
      border: 'border-slate-300 dark:border-slate-400 bg-gradient-to-br from-slate-200/40 via-slate-400/20 to-transparent',
      ring: 'ring-2 ring-cyan-400/40',
      ribbonBg: 'bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 text-slate-100 border-cyan-400/50',
      progressBg: 'bg-cyan-500',
      glow: 'shadow-lg shadow-cyan-500/20'
    },
    'gold': {
      border: 'border-amber-400 bg-gradient-to-br from-amber-400/40 via-amber-300/20 to-amber-600/30',
      ring: 'ring-3 ring-amber-400/60 ring-offset-1 ring-offset-amber-950',
      ribbonBg: 'bg-gradient-to-r from-amber-950 via-amber-600 to-amber-950 text-amber-50 border-amber-300 shadow-md',
      progressBg: 'bg-amber-400',
      glow: 'shadow-xl shadow-amber-500/30'
    },
    'platinum': {
      border: 'border-indigo-300 dark:border-indigo-400 bg-gradient-to-br from-indigo-500/40 via-indigo-300/20 to-purple-600/30',
      ring: 'ring-4 ring-indigo-400/60 ring-offset-2 ring-offset-slate-950',
      ribbonBg: 'bg-gradient-to-r from-indigo-950 via-indigo-700 to-indigo-950 text-indigo-50 border-indigo-300 shadow-lg',
      progressBg: 'bg-indigo-400',
      glow: 'shadow-2xl shadow-indigo-500/40'
    },
    'aureole': {
      border: 'border-amber-300 bg-gradient-to-br from-amber-300/50 via-rose-400/30 to-amber-500/50',
      ring: 'ring-4 ring-rose-400/70 ring-offset-2 ring-offset-amber-950 animate-pulse',
      ribbonBg: 'bg-gradient-to-r from-rose-950 via-amber-600 to-rose-950 text-white border-amber-300 shadow-xl',
      progressBg: 'bg-gradient-to-r from-amber-400 to-rose-500',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]'
    }
  };

  const style = tierFrameStyles[levelInfo.tierColor];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      
      {/* ── METALLIC AUREOLE AVATAR FRAME ── */}
      <div className={`relative ${currentSize.container} rounded-3xl ${currentSize.padding} border-2 ${style.border} ${style.ring} ${style.glow} transition-all duration-300 flex items-center justify-center backdrop-blur-md`}>
        
        {/* Inner Avatar Image */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName || 'User Avatar'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100px, 150px"
              priority
            />
          ) : (
            <span className={`font-serif font-black ${currentSize.text} text-amber-400 uppercase`}>
              {christianName ? christianName[0] : displayName ? displayName[0] : 'V'}
            </span>
          )}
        </div>

        {/* Small Level Indicator Badge at bottom corner for smaller sizes */}
        {!showTitleRibbon && (
          <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-black/90 border border-amber-500/60 text-[9px] font-mono font-black text-amber-300 shadow-sm">
            C{levelInfo.level}
          </div>
        )}

      </div>

      {/* ── 3D TYPOGRAPHY RIBBON BADGE (NO ICONS / EMOJIS) ── */}
      {showTitleRibbon && (
        <div className="w-full max-w-[240px] mt-2.5 flex flex-col items-center space-y-1.5">
          
          {/* Ribbon Title Bar */}
          <div className={`w-full py-1 px-2.5 rounded-xl border ${style.ribbonBg} text-center shadow-md`}>
            <span className={`font-serif uppercase font-black tracking-widest ${currentSize.ribbonText} block truncate drop-shadow-sm`}>
              CẤP {levelInfo.level} · {levelInfo.title}
            </span>
          </div>

          {/* EXP Progress Bar */}
          {showProgressBar && (
            <div className="w-full space-y-1">
              <div className="w-full h-1.5 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full ${style.progressBg} rounded-full transition-all duration-500`}
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)] px-0.5">
                <span>{levelInfo.currentExp} EXP</span>
                <span>{levelInfo.level >= 100 ? 'TỐI ĐA' : `${levelInfo.progressPercent}%`}</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
