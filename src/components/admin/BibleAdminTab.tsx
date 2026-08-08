'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Upload, Link as LinkIcon, Save, ChevronDown, ChevronUp, BookOpen, Languages, FileText, Headphones, Video } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BibleBook { id: number; name: string; code: string; testament: string; chapters_count: number; }
interface BibleTranslation { id: number; slug: string; name: string; }
interface BibleCommentary { id?: number; book_id: number; chapter: number; audio_url: string; video_url: string; historical_context: string; theological_meaning: string; practical_application: string; }

type SubTab = 'translations' | 'books' | 'verses' | 'commentary';

// ─── Helper: parse CSV text ──────────────────────────────────────────────────
function parseCsvText(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BibleAdminTab() {
  const [subTab, setSubTab] = useState<SubTab>('verses');
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // --- New Translation Form ---
  const [newTrans, setNewTrans] = useState({ slug: '', name: '' });
  // --- New Book Form ---
  const [newBook, setNewBook] = useState({ name: '', code: '', testament: 'Cựu Ước', chapters_count: 50, order_index: 0 });
  // --- Import Verses ---
  const [importMode, setImportMode] = useState<'csv' | 'gsheet'>('csv');
  const [gSheetUrl, setGSheetUrl] = useState('');
  const [importTranslation, setImportTranslation] = useState('');
  const [importPreview, setImportPreview] = useState<Record<string, string>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  // --- Commentary Form ---
  const [selBookId, setSelBookId] = useState('');
  const [selChapter, setSelChapter] = useState(1);
  const [commentary, setCommentary] = useState<BibleCommentary>({ book_id: 0, chapter: 1, audio_url: '', video_url: '', historical_context: '', theological_meaning: '', practical_application: '' });

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    const [bRes, tRes] = await Promise.all([
      supabase.from('bible_books').select('id, name, code, testament, chapters_count').order('order_index'),
      supabase.from('bible_translations').select('id, slug, name').order('id')
    ]);
    if (bRes.data) setBooks(bRes.data);
    if (tRes.data) setTranslations(tRes.data);
    if (tRes.data && tRes.data.length > 0) setImportTranslation(tRes.data[0].slug);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAddTranslation = async () => {
    if (!newTrans.slug || !newTrans.name) return showMsg('Vui lòng nhập đủ Slug và Tên bản dịch.', 'error');
    const { error } = await supabase.from('bible_translations').insert([newTrans]);
    if (error) return showMsg('Lỗi: ' + error.message, 'error');
    showMsg('Đã thêm bản dịch: ' + newTrans.name);
    setNewTrans({ slug: '', name: '' });
    loadData();
  };

  const handleDeleteTranslation = async (id: number) => {
    if (!confirm('Xóa bản dịch này? Các câu Kinh Thánh liên quan sẽ mất translation_id.')) return;
    await supabase.from('bible_translations').delete().eq('id', id);
    loadData();
  };

  const handleAddBook = async () => {
    if (!newBook.name || !newBook.code) return showMsg('Vui lòng nhập Tên và Code sách.', 'error');
    const { error } = await supabase.from('bible_books').insert([newBook]);
    if (error) return showMsg('Lỗi: ' + error.message, 'error');
    showMsg('Đã thêm sách: ' + newBook.name);
    setNewBook({ name: '', code: '', testament: 'Cựu Ước', chapters_count: 50, order_index: 0 });
    loadData();
  };

  // CSV file upload handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      let rows: Record<string, string>[] = [];

      if (file.name.endsWith('.csv')) {
        rows = parseCsvText(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Dynamic import of xlsx to avoid SSR issues
        try {
          const XLSX = await import('xlsx');
          const wb = XLSX.read(text, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
          // Normalize keys to lowercase
          rows = rows.map(r => {
            const normalized: Record<string, string> = {};
            Object.entries(r).forEach(([k, v]) => { normalized[k.toLowerCase().trim()] = String(v); });
            return normalized;
          });
        } catch (err) {
          return showMsg('Không thể đọc file .xlsx. Vui lòng thử lại với file .csv.', 'error');
        }
      }

      setImportPreview(rows.slice(0, 5));
      if (rows.length > 0) {
        showMsg(`Đọc được ${rows.length} dòng. Kiểm tra xem trước rồi bấm Nhập Dữ Liệu.`);
        // Store all rows in a ref for actual import
        (window as any)._bibleImportRows = rows;
      } else {
        showMsg('Không tìm thấy dữ liệu. Kiểm tra format file.', 'error');
      }
    };
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }
  };

  // Google Sheet import
  const handleGSheetFetch = async () => {
    if (!gSheetUrl) return showMsg('Vui lòng nhập URL Google Sheet.', 'error');
    let sheetId = '';
    const match = gSheetUrl.match(/\/spreadsheets\/d\/([\w-]+)/);
    if (match) sheetId = match[1];
    else return showMsg('URL Google Sheet không hợp lệ.', 'error');

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('Không tải được dữ liệu. Hãy kiểm tra sheet đã được chia sẻ công khai chưa.');
      const text = await res.text();
      const rows = parseCsvText(text);
      setImportPreview(rows.slice(0, 5));
      (window as any)._bibleImportRows = rows;
      showMsg(`Đọc được ${rows.length} dòng từ Google Sheet.`);
    } catch (err: any) {
      showMsg('Lỗi: ' + (err.message || 'Không kết nối được.'), 'error');
    }
  };

  const handleImportVerses = async () => {
    const rows: Record<string, string>[] = (window as any)._bibleImportRows || [];
    if (rows.length === 0) return showMsg('Chưa có dữ liệu để nhập. Vui lòng tải file hoặc kết nối Google Sheet trước.', 'error');

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    // Get translation ID
    let transId: number | null = null;
    if (importTranslation) {
      const found = translations.find(t => t.slug === importTranslation);
      if (found) transId = found.id;
    }

    // Build batch — hỗ trợ nhiều tên cột khác nhau (chuẩn hóa và từ file cũ)
    const batchInserts: any[] = [];
    for (const row of rows) {
      // book code: hỗ trợ book_code, book_slug, Book_Slug, book, sach
      const bookCode = row['book_code'] || row['book_slug'] || row['book'] || row['sach'] || '';
      const book = books.find(b => b.code === bookCode.trim() || b.name === bookCode.trim());
      if (!book) { errorCount++; continue; }

      // chapter & verse: hỗ trợ tiếng Anh lẫn tiếng Việt
      const chapter = parseInt(row['chapter'] || row['chuong'] || '0', 10);
      const verse   = parseInt(row['verse'] || row['cau'] || '0', 10);

      // nội dung: hỗ trợ text, content, Content, noi_dung
      const text = row['text'] || row['content'] || row['noi_dung'] || '';
      if (!chapter || !verse || !text) { errorCount++; continue; }

      // tiêu đề mục: hỗ trợ heading, Heading
      const heading = row['heading'] || null;

      // chú thích: hỗ trợ footnote, footnotes, Footnotes, chu_thich
      const footnote = row['footnote'] || row['footnotes'] || row['chu_thich'] || null;

      batchInserts.push({
        book_id: book.id,
        translation_id: transId,
        chapter,
        verse,
        text,
        heading,
        footnote
      });
      successCount++;
    }

    // Insert in chunks of 500
    const chunkSize = 500;
    for (let i = 0; i < batchInserts.length; i += chunkSize) {
      const chunk = batchInserts.slice(i, i + chunkSize);
      const { error } = await supabase.from('bible_verses').upsert(chunk, { onConflict: 'book_id,chapter,verse,translation_id' });
      if (error) errorCount += chunk.length;
    }

    setIsImporting(false);
    showMsg(`Nhập xong: ${successCount} câu thành công${errorCount > 0 ? `, ${errorCount} dòng bị bỏ qua (thiếu dữ liệu/không khớp sách)` : ''}.`, errorCount > 0 && successCount === 0 ? 'error' : 'success');
    (window as any)._bibleImportRows = [];
    setImportPreview([]);
  };

  const handleLoadCommentary = async () => {
    if (!selBookId) return;
    const { data } = await supabase
      .from('bible_commentary')
      .select('*')
      .eq('book_id', selBookId)
      .eq('chapter', selChapter)
      .maybeSingle();

    if (data) {
      setCommentary({
        id: data.id,
        book_id: Number(selBookId),
        chapter: selChapter,
        audio_url: data.audio_url || '',
        video_url: data.video_url || '',
        historical_context: data.historical_context || '',
        theological_meaning: data.theological_meaning || '',
        practical_application: data.practical_application || ''
      });
    } else {
      setCommentary({ book_id: Number(selBookId), chapter: selChapter, audio_url: '', video_url: '', historical_context: '', theological_meaning: '', practical_application: '' });
    }
  };

  const handleSaveCommentary = async () => {
    if (!commentary.book_id) return showMsg('Chọn sách trước.', 'error');
    const payload = { ...commentary, book_id: Number(selBookId), chapter: selChapter };
    delete (payload as any).id;
    const { error } = await supabase.from('bible_commentary').upsert(payload, { onConflict: 'book_id,chapter' });
    if (error) return showMsg('Lỗi: ' + error.message, 'error');
    showMsg('Đã lưu chú giải!');
    handleLoadCommentary();
  };

  const tabBtn = (tab: SubTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setSubTab(tab)}
      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${subTab === tab ? 'bg-teal-600 text-white shadow-lg' : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-card)]'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-teal-500 flex items-center gap-2 font-serif mb-4">
          <BookOpen className="w-5 h-5" /> Quản Trị Kinh Thánh
        </h2>
        <div className="flex flex-wrap gap-2">
          {tabBtn('verses', 'Nhập Câu KT', <Upload className="w-4 h-4" />)}
          {tabBtn('translations', 'Bản Dịch', <Languages className="w-4 h-4" />)}
          {tabBtn('books', 'Danh Sách Sách', <FileText className="w-4 h-4" />)}
          {tabBtn('commentary', 'Chú Giải', <Headphones className="w-4 h-4" />)}
        </div>
      </div>

      {/* Message Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-4 ${msg.type === 'error' ? 'bg-rose-600' : 'bg-teal-600'}`}>
          {msg.text}
        </div>
      )}

      {/* ─── SUB TAB: NHẬP CÂU KINH THÁNH ─────────────────────────────────── */}
      {subTab === 'verses' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="font-bold text-teal-400 font-serif text-lg">📥 Nhập Câu Kinh Thánh (Excel / CSV / Google Sheet)</h3>

          <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl text-xs text-teal-200 space-y-3">
            <p className="font-bold uppercase tracking-wide">📋 Hệ thống tự nhận dạng các tên cột phổ biến:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-teal-500/30">
                    <th className="pb-1 pr-4 text-teal-300 font-bold">Dữ liệu</th>
                    <th className="pb-1 pr-4 text-slate-400">Tên cột chấp nhận</th>
                    <th className="pb-1 text-slate-500">Bắt buộc?</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  <tr className="border-b border-slate-700/40">
                    <td className="py-1 pr-4 text-teal-200 font-medium">Mã sách</td>
                    <td className="py-1 pr-4"><code className="bg-slate-800 px-1 rounded text-amber-300">book_code</code> <code className="bg-slate-800 px-1 rounded text-amber-300">Book_Slug</code> <code className="bg-slate-800 px-1 rounded text-amber-300">book_slug</code></td>
                    <td className="py-1 text-rose-400 font-bold">✓ Bắt buộc</td>
                  </tr>
                  <tr className="border-b border-slate-700/40">
                    <td className="py-1 pr-4 text-teal-200 font-medium">Chương</td>
                    <td className="py-1 pr-4"><code className="bg-slate-800 px-1 rounded text-amber-300">chapter</code> <code className="bg-slate-800 px-1 rounded text-amber-300">Chapter</code></td>
                    <td className="py-1 text-rose-400 font-bold">✓ Bắt buộc</td>
                  </tr>
                  <tr className="border-b border-slate-700/40">
                    <td className="py-1 pr-4 text-teal-200 font-medium">Số câu</td>
                    <td className="py-1 pr-4"><code className="bg-slate-800 px-1 rounded text-amber-300">verse</code> <code className="bg-slate-800 px-1 rounded text-amber-300">Verse</code></td>
                    <td className="py-1 text-rose-400 font-bold">✓ Bắt buộc (số nguyên)</td>
                  </tr>
                  <tr className="border-b border-slate-700/40">
                    <td className="py-1 pr-4 text-teal-200 font-medium">Nội dung câu</td>
                    <td className="py-1 pr-4"><code className="bg-slate-800 px-1 rounded text-amber-300">text</code> <code className="bg-slate-800 px-1 rounded text-amber-300">content</code> <code className="bg-slate-800 px-1 rounded text-amber-300">Content</code></td>
                    <td className="py-1 text-rose-400 font-bold">✓ Bắt buộc</td>
                  </tr>
                  <tr className="border-b border-slate-700/40">
                    <td className="py-1 pr-4 text-teal-200 font-medium">Tiêu đề mục</td>
                    <td className="py-1 pr-4"><code className="bg-slate-800 px-1 rounded text-slate-400">heading</code> <code className="bg-slate-800 px-1 rounded text-slate-400">Heading</code></td>
                    <td className="py-1 text-slate-500">Tùy chọn</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 text-teal-200 font-medium">Chú thích</td>
                    <td className="py-1 pr-4"><code className="bg-slate-800 px-1 rounded text-slate-400">footnote</code> <code className="bg-slate-800 px-1 rounded text-slate-400">footnotes</code> <code className="bg-slate-800 px-1 rounded text-slate-400">Footnotes</code></td>
                    <td className="py-1 text-slate-500">Tùy chọn</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-slate-400 text-[11px]">💡 Các cột thêm như <code>Is_Paragraph</code>, <code>Is_Poetry</code> sẽ tự động bị bỏ qua. Tên cột không phân biệt hoa/thường.</p>
          </div>

          {/* Bản dịch */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Bản dịch của file sẽ nhập</label>
            <select
              value={importTranslation}
              onChange={e => setImportTranslation(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none"
            >
              {translations.map(t => <option key={t.id} value={t.slug}>{t.name} ({t.slug})</option>)}
              {translations.length === 0 && <option value="">Chưa có bản dịch — Thêm bản dịch trước</option>}
            </select>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-3">
            <button onClick={() => setImportMode('csv')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${importMode === 'csv' ? 'bg-teal-600 text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-card)]'}`}>
              📄 Upload File Excel / CSV
            </button>
            <button onClick={() => setImportMode('gsheet')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${importMode === 'gsheet' ? 'bg-teal-600 text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-card)]'}`}>
              🔗 Google Sheet
            </button>
          </div>

          {importMode === 'csv' && (
            <label className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-teal-500/40 rounded-2xl cursor-pointer hover:border-teal-500 transition-colors group">
              <Upload className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-bold text-[var(--text-main)]">Tải lên file Excel (.xlsx) hoặc CSV (.csv)</p>
                <p className="text-xs text-[var(--text-muted)]">Click để chọn file hoặc kéo thả vào đây</p>
              </div>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleCsvUpload} className="hidden" />
            </label>
          )}

          {importMode === 'gsheet' && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={gSheetUrl}
                onChange={e => setGSheetUrl(e.target.value)}
                className="flex-1 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none"
              />
              <button onClick={handleGSheetFetch} className="px-5 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Tải dữ liệu
              </button>
            </div>
          )}

          {/* Preview */}
          {importPreview.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-bold uppercase">Xem trước (5 dòng đầu):</p>
              <div className="overflow-x-auto rounded-xl border border-[var(--border-card)]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>{Object.keys(importPreview[0]).map(k => <th key={k} className="px-3 py-2 font-bold">{k}</th>)}</tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, i) => (
                      <tr key={i} className="border-t border-[var(--border-card)] hover:bg-slate-800/30">
                        {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-slate-300 max-w-[200px] truncate">{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleImportVerses}
                disabled={isImporting}
                className="mt-4 w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isImporting ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                {isImporting ? 'Đang nhập dữ liệu...' : `Nhập Dữ Liệu Vào Supabase`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── SUB TAB: BẢN DỊCH ─────────────────────────────────────────────── */}
      {subTab === 'translations' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="font-bold text-teal-400 font-serif text-lg">🌐 Quản Lý Bản Dịch Kinh Thánh</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Slug (vi_pdv, ntt, en_kjv...)" value={newTrans.slug} onChange={e => setNewTrans({ ...newTrans, slug: e.target.value.toLowerCase().replace(/\s/g, '_') })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            <input type="text" placeholder="Tên bản dịch (hiển thị)" value={newTrans.name} onChange={e => setNewTrans({ ...newTrans, name: e.target.value })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            <button onClick={handleAddTranslation} className="px-6 py-3 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Thêm Bản Dịch
            </button>
          </div>

          <div className="space-y-2">
            {translations.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)]">
                <div>
                  <span className="font-bold text-teal-400 text-sm">{t.name}</span>
                  <span className="ml-3 text-xs text-slate-500 font-mono">slug: {t.slug}</span>
                </div>
                <button onClick={() => handleDeleteTranslation(t.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {translations.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">Chưa có bản dịch nào.</p>}
          </div>
        </div>
      )}

      {/* ─── SUB TAB: DANH SÁCH SÁCH ───────────────────────────────────────── */}
      {subTab === 'books' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="font-bold text-teal-400 font-serif text-lg">📚 Quản Lý Danh Sách Sách KT</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Tên sách (VD: Sáng Thế)" value={newBook.name} onChange={e => setNewBook({ ...newBook, name: e.target.value })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            <input type="text" placeholder="Code / slug URL (VD: sang-the)" value={newBook.code} onChange={e => setNewBook({ ...newBook, code: e.target.value.toLowerCase() })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            <select value={newBook.testament} onChange={e => setNewBook({ ...newBook, testament: e.target.value })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none">
              <option value="Cựu Ước">Cựu Ước</option>
              <option value="Tân Ước">Tân Ước</option>
            </select>
            <input type="number" placeholder="Số chương" value={newBook.chapters_count} onChange={e => setNewBook({ ...newBook, chapters_count: Number(e.target.value) })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            <input type="number" placeholder="Thứ tự hiển thị" value={newBook.order_index} onChange={e => setNewBook({ ...newBook, order_index: Number(e.target.value) })} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            <button onClick={handleAddBook} className="px-6 py-3 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Thêm Sách
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {books.map(b => (
              <div key={b.id} className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-card)] text-xs">
                <div className="font-bold text-[var(--text-main)]">{b.name}</div>
                <div className="text-slate-500 mt-0.5 font-mono">{b.code} • {b.chapters_count} chương</div>
                <div className={`mt-1 text-[10px] font-bold ${b.testament === 'Tân Ước' ? 'text-blue-400' : 'text-amber-400'}`}>{b.testament}</div>
              </div>
            ))}
            {books.length === 0 && <p className="text-sm text-[var(--text-muted)] col-span-4 text-center py-4">Chưa có sách nào.</p>}
          </div>
        </div>
      )}

      {/* ─── SUB TAB: CHÚ GIẢI ─────────────────────────────────────────────── */}
      {subTab === 'commentary' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="font-bold text-teal-400 font-serif text-lg">🎧 Chú Giải & Bối Cảnh Chương</h3>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Chọn Sách</label>
              <select value={selBookId} onChange={e => setSelBookId(e.target.value)} className="bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none">
                <option value="">-- Chọn sách --</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Chương</label>
              <input type="number" min={1} value={selChapter} onChange={e => setSelChapter(Number(e.target.value))} className="w-24 bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
            </div>
            <button onClick={handleLoadCommentary} disabled={!selBookId} className="px-5 py-2 bg-slate-700 text-white font-bold text-xs rounded-xl hover:bg-slate-600 flex items-center gap-2 disabled:opacity-40">
              Tải Chú Giải
            </button>
          </div>

          {selBookId && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase mb-1"><Headphones className="w-4 h-4 text-teal-400" /> Audio URL</label>
                  <input type="text" placeholder="https://..." value={commentary.audio_url} onChange={e => setCommentary({ ...commentary, audio_url: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase mb-1"><Video className="w-4 h-4 text-blue-400" /> Video URL (YouTube/Vimeo)</label>
                  <input type="text" placeholder="https://youtube.com/..." value={commentary.video_url} onChange={e => setCommentary({ ...commentary, video_url: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Bối Cảnh Lịch Sử</label>
                <textarea rows={3} value={commentary.historical_context} onChange={e => setCommentary({ ...commentary, historical_context: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Ý Nghĩa Thần Học</label>
                <textarea rows={3} value={commentary.theological_meaning} onChange={e => setCommentary({ ...commentary, theological_meaning: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Ứng Dụng Thực Hành</label>
                <textarea rows={3} value={commentary.practical_application} onChange={e => setCommentary({ ...commentary, practical_application: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border-card)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:border-teal-500 focus:outline-none resize-none" />
              </div>
              <button onClick={handleSaveCommentary} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Lưu Chú Giải Chương {selChapter}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
