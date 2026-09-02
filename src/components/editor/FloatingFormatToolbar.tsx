'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading2, 
  Heading3, 
  Heading4, 
  Pilcrow, 
  BookOpen, 
  Quote, 
  Link as LinkIcon, 
  RemoveFormatting, 
  Check, 
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface FloatingFormatToolbarProps {
  editorRef: React.RefObject<HTMLElement>;
  onContentChange?: () => void;
}

// Map common Vietnamese Catholic bible book prefixes to canonical URL slugs
const BIBLE_BOOK_SLUG_MAP: Record<string, string> = {
  'st': 'st', 'sangthe': 'st', 'sáng thế': 'st',
  'xh': 'xh', 'xuathanh': 'xh', 'xuất hành': 'xh',
  'lv': 'lv', 'levy': 'lv', 'lêvi': 'lv',
  'ds': 'ds', 'danso': 'ds', 'dân số': 'ds',
  'dnl': 'dnl', 'dnlv': 'dnl', 'deunhi': 'dnl', 'đệ nhị luật': 'dnl',
  'gs': 'gs', 'gie-su': 'gs', 'giô-suê': 'gs',
  'tl': 'tl', 'thu-lanh': 'tl', 'thủ lãnh': 'tl',
  'rt': 'rt', 'rut': 'rt',
  '1sm': '1sm', '2sm': '2sm',
  '1v': '1v', '2v': '2v', '1vr': '1v', '2vr': '2v',
  '1sb': '1sb', '2sb': '2sb',
  'ezr': 'ezr', 'ne': 'ne', 'tb': 'tb', 'jdt': 'jdt', 'est': 'est',
  '1mcb': '1mcb', '2mcb': '2mcb',
  'jb': 'jb', 'giop': 'jb',
  'tv': 'tv', 'thanhvinh': 'tv', 'thánh vịnh': 'tv',
  'cn': 'cn', 'chamngon': 'cn', 'châm ngôn': 'cn',
  'ggh': 'ggh', 'giangvien': 'ggh', 'giảng viên': 'ggh',
  'dc': 'dc', 'diemca': 'dc', 'diễm ca': 'dc',
  'kn': 'kn', 'khonngoan': 'kn', 'khôn ngoan': 'kn',
  'hc': 'hc', 'huan-ca': 'hc', 'huấn ca': 'hc',
  'is': 'is', 'isaia': 'is',
  'gr': 'gr', 'gieremia': 'gr',
  'tc': 'tc', 'thanca': 'tc',
  'br': 'br', 'baruc': 'br',
  'ez': 'ez', 'ezekiel': 'ez',
  'dn': 'dn', 'danien': 'dn',
  'hs': 'hs', 'hose': 'hs',
  'ge': 'ge', 'gioel': 'ge',
  'am': 'am', 'amos': 'am',
  'ob': 'ob', 'obadia': 'ob',
  'gn': 'gn', 'giona': 'gn',
  'mi': 'mi', 'mikha': 'mi',
  'na': 'na', 'nakhum': 'na',
  'kk': 'kk', 'khabacuc': 'kk',
  'xp': 'xp', 'xophonia': 'xp',
  'hg': 'hg', 'khang-gai': 'hg',
  'zc': 'zc', 'daccaria': 'zc',
  'ml': 'ml', 'malakhi': 'ml',
  // Tân Ước
  'mt': 'mt', 'mattheu': 'mt', 'mátthêu': 'mt',
  'mc': 'mc', 'macco': 'mc', 'mác-cô': 'mc',
  'lc': 'lc', 'luca': 'lc',
  'ga': 'ga', 'gioan': 'ga', 'gio-an': 'ga',
  'cv': 'cv', 'tvd': 'cv', 'tongdocongvu': 'cv', 'công vụ': 'cv',
  'rm': 'rm', 'roma': 'rm', 'rô-ma': 'rm',
  '1cr': '1cr', '2cr': '2cr', '1corinto': '1cr', '2corinto': '2cr',
  'gl': 'gl', 'galata': 'gl',
  'ep': 'ep', 'epheso': 'ep', 'êphêsô': 'ep',
  'pl': 'pl', 'philipphe': 'pl', 'philípphê': 'pl',
  'cl': 'cl', 'colose': 'cl', 'côlôsê': 'cl',
  '1ts': '1ts', '2ts': '2ts', '1thessalonica': '1ts', '2thessalonica': '2ts',
  '1tm': '1tm', '2tm': '2tm', '1timothe': '1tm', '2timothe': '2tm',
  'tt': 'tt', 'tito': 'tt', 'titô': 'tt',
  'pm': 'pm', 'philemon': 'pm',
  'dt': 'dt', 'dothai': 'dt', 'do thái': 'dt',
  'gc': 'gc', 'giacobe': 'gc', 'giacôbê': 'gc',
  '1pr': '1pr', '2pr': '2pr', '1phero': '1pr', '2phero': '2pr',
  '1ga': '1ga', '2ga': '2ga', '3ga': '3ga',
  'gd': 'gd', 'giuda': 'gd',
  'kh': 'kh', 'khai-huyen': 'kh', 'khải huyền': 'kh'
};

function parseBibleReferenceToUrl(refText: string): { href: string; label: string } | null {
  const clean = refText.trim();
  if (!clean) return null;

  // Match pattern like "Ga 3,16", "Ga 3:16", "1Cr 13,1-13", "Tv 23", "Mt 5:1-12"
  const match = clean.match(/^([0-3]?[a-zA-ZÀ-ỹđĐ]+)\s*(\d+)[\s,:._-]?([\d,-]*)/i);
  if (!match) return null;

  const rawBook = match[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').trim();
  const chapter = match[2];
  const verses = match[3] ? match[3].replace(/,/g, ':').trim() : '';

  const bookSlug = BIBLE_BOOK_SLUG_MAP[rawBook] || rawBook;
  const href = `/kinh-thanh/${bookSlug}/${chapter}${verses ? `#verse-${verses.split(/[:-]/)[0]}` : ''}`;
  
  const displayLabel = verses ? `${match[1]} ${chapter}:${verses}` : `${match[1]} ${chapter}`;
  return { href, label: displayLabel };
}

export default function FloatingFormatToolbar({
  editorRef,
  onContentChange
}: FloatingFormatToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    blockType: string;
  }>({
    bold: false,
    italic: false,
    underline: false,
    blockType: 'p'
  });

  // Sub-popovers inside toolbar
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showBibleInput, setShowBibleInput] = useState(false);
  const [bibleInputVal, setBibleInputVal] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputVal, setLinkInputVal] = useState('');

  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Save selection before clicking buttons
  const saveCurrentSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore selection
  const restoreSavedSelection = useCallback(() => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  }, []);

  const updateToolbarPositionAndState = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      // Don't close if user is typing in the Bible or Link sub-popover
      if (!showBibleInput && !showLinkInput && !showHeadingMenu) {
        setIsVisible(false);
      }
      return;
    }

    const range = selection.getRangeAt(0);
    // Ensure the selection is within our editor
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      setIsVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setIsVisible(false);
      return;
    }

    // Calculate floating toolbar position
    const toolbarWidth = 420;
    const toolbarHeight = 44;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    let top = rect.top + scrollY - toolbarHeight - 12;
    let left = rect.left + scrollX + rect.width / 2 - toolbarWidth / 2;

    // Boundary constraints
    if (top < scrollY + 10) {
      top = rect.bottom + scrollY + 10; // Flip below if too close to top
    }
    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    setPosition({ top, left });
    setIsVisible(true);
    savedRangeRef.current = range.cloneRange();

    // Check active formats
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      
      let block = 'p';
      let parentEl: HTMLElement | null = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? (range.commonAncestorContainer as HTMLElement)
        : range.commonAncestorContainer.parentElement;

      while (parentEl && parentEl !== editorRef.current) {
        const tag = parentEl.tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'].includes(tag)) {
          block = tag;
          break;
        }
        parentEl = parentEl.parentElement;
      }

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        blockType: block
      });
    } catch {
      // ignore queryCommandState errors in edge cases
    }
  }, [editorRef, showBibleInput, showLinkInput, showHeadingMenu]);

  useEffect(() => {
    const handleSelectionChange = () => {
      // Small debounce
      setTimeout(updateToolbarPositionAndState, 20);
    };

    const handleMouseUp = () => {
      setTimeout(updateToolbarPositionAndState, 20);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setTimeout(updateToolbarPositionAndState, 20);
      }
    };

    const handleScroll = () => {
      if (isVisible) {
        updateToolbarPositionAndState();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible, updateToolbarPositionAndState]);

  // Execute standard formatting commands
  const execFormat = (cmd: string, value: string | undefined = undefined) => {
    restoreSavedSelection();
    document.execCommand(cmd, false, value);
    updateToolbarPositionAndState();
    if (onContentChange) onContentChange();
  };

  const handleHeadingChange = (tag: 'h2' | 'h3' | 'h4' | 'p') => {
    restoreSavedSelection();
    document.execCommand('formatBlock', false, `<${tag}>`);
    setShowHeadingMenu(false);
    updateToolbarPositionAndState();
    if (onContentChange) onContentChange();
  };

  // 📖 Insert Bible Verse Badge Link
  const handleInsertBibleLink = () => {
    if (!bibleInputVal.trim()) return;
    restoreSavedSelection();

    const parsed = parseBibleReferenceToUrl(bibleInputVal);
    const href = parsed ? parsed.href : `/kinh-thanh`;
    const label = parsed ? parsed.label : bibleInputVal.trim();

    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    const displayText = selectedText || label;

    const linkHtml = `<a href="${href}" target="_blank" rel="noopener noreferrer" title="Tra cứu ${displayText} trong Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group not-prose"><span>${displayText}</span><span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span></a>&nbsp;`;

    document.execCommand('insertHTML', false, linkHtml);
    setShowBibleInput(false);
    setBibleInputVal('');
    setIsVisible(false);
    if (onContentChange) onContentChange();
  };

  // “ ” Wrap in Sacred Scripture Callout Block
  const handleWrapScriptureQuote = () => {
    restoreSavedSelection();
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : 'Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.';
    
    // Check if user selected something like "Ga 3:30" or extract it
    const quoteHtml = `<div class="sacred-scripture veridu-scripture-quote my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-4 border-amber-500 shadow-lg backdrop-blur-sm relative overflow-hidden not-prose">
  <div class="flex items-start gap-4">
    <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
    </div>
    <div class="space-y-2.5 flex-1">
      <blockquote class="font-serif italic text-lg sm:text-xl text-amber-950 dark:text-amber-100 leading-relaxed m-0 p-0 border-0 bg-transparent">
        “${selectedText}”
      </blockquote>
      <div class="flex items-center gap-2 pt-1">
        <a href="/kinh-thanh" target="_blank" rel="noopener noreferrer" title="Tra cứu Kinh Thánh VERIDU" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all shadow-xs group">
          <span>Kinh Thánh</span>
          <span class="text-[10px] text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      </div>
    </div>
  </div>
</div><p><br></p>`;

    document.execCommand('insertHTML', false, quoteHtml);
    setIsVisible(false);
    if (onContentChange) onContentChange();
  };

  // 🔗 Insert Generic URL Link
  const handleInsertLink = () => {
    if (!linkInputVal.trim()) return;
    restoreSavedSelection();
    let url = linkInputVal.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    document.execCommand('createLink', false, url);
    setShowLinkInput(false);
    setLinkInputVal('');
    setIsVisible(false);
    if (onContentChange) onContentChange();
  };

  // ⌫ Clear Formatting
  const handleClearFormat = () => {
    restoreSavedSelection();
    document.execCommand('removeFormat', false);
    document.execCommand('formatBlock', false, '<p>');
    updateToolbarPositionAndState();
    if (onContentChange) onContentChange();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Thanh công cụ định dạng trực quan"
      className="fixed z-[9999] flex items-center bg-slate-900/95 text-slate-100 p-1.5 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-xl animate-scaleIn select-none transition-all duration-150"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      onMouseDown={(e) => {
        // Prevent losing editor selection when clicking buttons
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {/* 1. Heading Switcher Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            saveCurrentSelection();
            setShowHeadingMenu(!showHeadingMenu);
            setShowBibleInput(false);
            setShowLinkInput(false);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono hover:bg-white/10 text-amber-300 transition-all cursor-pointer"
          title="Đổi cấp độ tiêu đề / đoạn văn"
        >
          <span>{activeFormats.blockType.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-2 w-36 bg-slate-950 rounded-2xl border border-amber-500/30 shadow-2xl p-1.5 space-y-1 z-50">
            <button
              type="button"
              onClick={() => handleHeadingChange('h2')}
              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-serif font-bold text-amber-400 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span>Tiêu đề H2</span>
            </button>
            <button
              type="button"
              onClick={() => handleHeadingChange('h3')}
              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-serif font-bold text-amber-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>Tiêu đề H3</span>
            </button>
            <button
              type="button"
              onClick={() => handleHeadingChange('h4')}
              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-serif font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Heading4 className="w-3.5 h-3.5" />
              <span>Tiêu đề H4</span>
            </button>
            <button
              type="button"
              onClick={() => handleHeadingChange('p')}
              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-sans text-slate-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer border-t border-white/5 pt-1"
            >
              <Pilcrow className="w-3.5 h-3.5" />
              <span>Đoạn văn (P)</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-white/15 mx-1" />

      {/* 2. Bold */}
      <button
        type="button"
        onClick={() => execFormat('bold')}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          activeFormats.bold 
            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
            : 'hover:bg-white/10 text-slate-200'
        }`}
        title="In Đậm (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* 3. Italic */}
      <button
        type="button"
        onClick={() => execFormat('italic')}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          activeFormats.italic 
            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
            : 'hover:bg-white/10 text-slate-200'
        }`}
        title="In Nghiêng (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* 4. Underline */}
      <button
        type="button"
        onClick={() => execFormat('underline')}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          activeFormats.underline 
            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
            : 'hover:bg-white/10 text-slate-200'
        }`}
        title="Gạch Chân (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-white/15 mx-1" />

      {/* 5. 📖 Bible Verse Link Inserter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            saveCurrentSelection();
            const sel = window.getSelection()?.toString().trim() || '';
            setBibleInputVal(sel);
            setShowBibleInput(!showBibleInput);
            setShowLinkInput(false);
            setShowHeadingMenu(false);
          }}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            showBibleInput 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'hover:bg-amber-500/20 text-amber-400'
          }`}
          title="Chèn Link Đối Chiếu Kinh Thánh (VD: Ga 3:30 ↗)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">Ga 3:30 ↗</span>
        </button>

        {showBibleInput && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-slate-950 rounded-2xl border border-amber-500/40 shadow-2xl p-3 space-y-2 z-50 animate-fadeIn">
            <div className="text-[11px] font-bold text-amber-400 font-serif flex items-center justify-between">
              <span>📖 Tra Cứu Kinh Thánh VERIDU</span>
              <button 
                type="button" 
                onClick={() => setShowBibleInput(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={bibleInputVal}
                onChange={(e) => setBibleInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertBibleLink();
                  }
                }}
                placeholder="VD: Ga 3:30, Tv 23, Mt 5:1-12"
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleInsertBibleLink}
                className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-sm"
                title="Tạo Link"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Hệ thống tự nhận diện sách (Ga, Mt, Mc, Lc, Tv, 1Cr...) và liên kết trực tiếp bản dịch phụng vụ.
            </p>
          </div>
        )}
      </div>

      {/* 6. “ ” Sacred Scripture Quote Wrapper */}
      <button
        type="button"
        onClick={handleWrapScriptureQuote}
        className="p-2 rounded-xl hover:bg-amber-500/20 text-amber-400 transition-all cursor-pointer"
        title="Đóng khung Khối Lời Chúa Soi Đường (Stained-Glass Scripture Callout)"
      >
        <Quote className="w-4 h-4" />
      </button>

      {/* 7. 🔗 URL Link Inserter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            saveCurrentSelection();
            setShowLinkInput(!showLinkInput);
            setShowBibleInput(false);
            setShowHeadingMenu(false);
          }}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            showLinkInput 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'hover:bg-white/10 text-slate-200'
          }`}
          title="Chèn Siêu Liên Kết (URL Link)"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {showLinkInput && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-slate-950 rounded-2xl border border-indigo-500/40 shadow-2xl p-3 space-y-2 z-50 animate-fadeIn">
            <div className="text-[11px] font-bold text-indigo-400 flex items-center justify-between">
              <span>🔗 Chèn Liên Kết</span>
              <button 
                type="button" 
                onClick={() => setShowLinkInput(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={linkInputVal}
                onChange={(e) => setLinkInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
                placeholder="https://... hoặc /duong-dan"
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleInsertLink}
                className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-sm"
                title="Lưu Link"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-white/15 mx-1" />

      {/* 8. ⌫ Clear Formatting */}
      <button
        type="button"
        onClick={handleClearFormat}
        className="p-2 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
        title="Xóa Định Dạng (Clear Formatting)"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
}
