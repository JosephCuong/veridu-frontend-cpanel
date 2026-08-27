'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CatechismParagraph } from '@/lib/api';
import { 
  Sparkles, 
  RotateCw, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Award, 
  BookOpen, 
  Cross, 
  Sun, 
  Shield, 
  Flame,
  FlameKindling,
  Shuffle
} from 'lucide-react';

interface CatechismFlashcardClientProps {
  allParagraphs: CatechismParagraph[];
}

const PILLARS_FLASH = [
  { number: -1, title: 'Tất Cả' },
  { number: 0, title: 'Mở Đầu (CCC 1-25)' },
  { number: 1, title: 'Phần I: Đức Tin' },
  { number: 2, title: 'Phần II: Bí Tích' },
  { number: 3, title: 'Phần III: Luân Lý' },
  { number: 4, title: 'Phần IV: Kinh Nguyện' }
];

export default function CatechismFlashcardClient({ allParagraphs }: CatechismFlashcardClientProps) {
  const [selectedPart, setSelectedPart] = useState<number>(-1);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [faithXP, setFaithXP] = useState<number>(150);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const savedXP = localStorage.getItem('veridu_faith_xp');
      if (savedXP) setFaithXP(parseInt(savedXP));
      const savedMaster = localStorage.getItem('veridu_mastered_cards');
      if (savedMaster) setMasteredCards(new Set(JSON.parse(savedMaster)));
    } catch (e) {}
  }, []);

  // Filter cards: In Brief or representative paragraphs
  const deck = useMemo(() => {
    return allParagraphs.filter(p => {
      if (selectedPart >= 0 && p.part_number !== selectedPart) return false;
      return p.is_in_brief || (p.paragraph_number && p.paragraph_number % 5 === 0) || p.part_number === 0;
    });
  }, [allParagraphs, selectedPart]);

  const currentCard = deck[cardIndex] || deck[0] || allParagraphs[0];

  const handleMasterCard = (pId: number) => {
    const updated = new Set(masteredCards).add(pId);
    setMasteredCards(updated);
    const newXP = faithXP + 25;
    setFaithXP(newXP);
    try {
      localStorage.setItem('veridu_faith_xp', newXP.toString());
      localStorage.setItem('veridu_mastered_cards', JSON.stringify(Array.from(updated)));
    } catch (e) {}

    setIsFlipped(false);
    if (cardIndex < deck.length - 1) {
      setCardIndex(prev => prev + 1);
    }
  };

  const shuffleDeck = () => {
    setIsFlipped(false);
    setCardIndex(Math.floor(Math.random() * deck.length));
  };

  const level = Math.floor(faithXP / 100) + 1;
  const xpInLevel = faithXP % 100;

  return (
    <div className="space-y-8 w-full">
      
      {/* Gamified XP Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-serif font-black text-base flex flex-col items-center justify-center shadow-md">
            <span className="text-[8px] uppercase font-sans font-bold">Cấp</span>
            <span>{level}</span>
          </div>
          <div className="space-y-1">
            <div className="font-serif font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Tiến Trình Học Tín Lý</span>
            </div>
            <p className="text-xs font-serif text-[var(--text-muted)]">
              Đã thuộc <strong>{masteredCards.size}</strong> thẻ • Tổng cộng <strong>{faithXP} XP</strong>
            </p>
          </div>
        </div>

        <button
          onClick={shuffleDeck}
          className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-amber-500 text-xs font-serif font-bold text-amber-500 flex items-center gap-1.5 transition"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Xáo Trộn Thẻ Ngẫu Nhiên</span>
        </button>
      </div>

      {/* Part Filter Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
        {PILLARS_FLASH.map(p => (
          <button
            key={p.number}
            onClick={() => {
              setSelectedPart(p.number);
              setCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition ${
              selectedPart === p.number
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* 3D Flashcard Canvas */}
      {currentCard ? (
        <div className="space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[340px] p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-amber-500/10 border-2 border-amber-500/40 shadow-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.01]"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
              <span className="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-serif font-black text-xs shadow-sm">
                {currentCard.title}
              </span>
              <span className="text-xs font-serif text-[var(--text-muted)] flex items-center gap-1.5 font-bold">
                <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                <span>{isFlipped ? 'Mặt Sau (Lời Giải)' : 'Mặt Trước (Vấn Nạn)'}</span>
              </span>
            </div>

            {/* Card Body */}
            {!isFlipped ? (
              <div className="space-y-4 py-8 text-center sm:text-left">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  Đề Mục / Vấn Nạn Tín Lý:
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)] leading-relaxed">
                  {currentCard.full_path}
                </h3>
                <p className="text-xs font-serif italic text-stone-400 pt-4">
                  (Nhấp chuột vào bất cứ đâu trên thẻ để lật xem lời giải tín lý)
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4 animate-in fade-in duration-300">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">
                  Giáo Huấn Chính Thức Của Hội Thánh:
                </span>
                <div 
                  className="prose dark:prose-invert max-w-none font-serif text-sm sm:text-base leading-relaxed text-[var(--text-main)]"
                  dangerouslySetInnerHTML={{ __html: currentCard.content_html }}
                />
              </div>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-card)] text-xs font-serif">
              <span className="text-[var(--text-muted)]">
                Thẻ số <strong>{cardIndex + 1}</strong> / {deck.length}
              </span>
              {masteredCards.has(currentCard.id) && (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đã Thuộc
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              disabled={cardIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(prev => Math.max(0, prev - 1));
              }}
              className="px-5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] font-serif font-bold text-xs flex items-center gap-2 hover:border-amber-500 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thẻ Trước</span>
            </button>

            <button
              onClick={() => handleMasterCard(currentCard.id)}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-emerald-400 transition"
            >
              <Check className="w-4 h-4" />
              <span>Đã Thuộc (+25 XP)</span>
            </button>

            <button
              disabled={cardIndex >= deck.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(prev => Math.min(deck.length - 1, prev + 1));
              }}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center gap-2 hover:bg-amber-400 disabled:opacity-30 shadow-md"
            >
              <span>Thẻ Kế Tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-card)] space-y-3">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto opacity-50" />
          <h4 className="font-serif font-bold text-lg text-[var(--text-main)]">Không tìm thấy thẻ nào cho mục này</h4>
        </div>
      )}

    </div>
  );
}
