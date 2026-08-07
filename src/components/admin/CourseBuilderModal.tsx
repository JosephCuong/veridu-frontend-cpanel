'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, GripVertical, Trash2, Edit2, Check, Video, FileText, FileCode2, Link as LinkIcon, BookOpen, Save
} from 'lucide-react';
import { updateCourse, saveCourseStructure, deleteCourseModule, deleteLesson } from '@/lib/adminApi';

interface CourseBuilderModalProps {
  course: any;
  onClose: () => void;
  onSaveComplete: () => void;
}

export default function CourseBuilderModal({ course, onClose, onSaveComplete }: CourseBuilderModalProps) {
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: course.title || '',
    description: course.description || '',
    category: course.category || 'Kinh Thánh',
    level: course.level || 'Cơ Bản',
    thumbnail: course.thumbnail || ''
  });

  // modules contains [{ id, title, description, lessons: [{ id, title, type, content, ... }] }]
  const [modules, setModules] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);

  useEffect(() => {
    if (course && course.course_modules && course.course_modules.length > 0) {
      setModules(JSON.parse(JSON.stringify(course.course_modules)));
    } else if (course && course.lessons && course.lessons.length > 0) {
      // Migrate old structure on the fly for UI
      setModules([{
        id: `temp-${Date.now()}`,
        title: 'Chương 1',
        lessons: course.lessons
      }]);
    } else {
      setModules([]);
    }
  }, [course]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save basic info
      await updateCourse(course.id, courseData);
      // Save structure
      await saveCourseStructure(course.id, modules);
      onSaveComplete();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu cấu trúc khóa học.');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setModules([...modules, { id: `temp-${Date.now()}`, title: 'Chương mới', lessons: [] }]);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      id: `temp-${Date.now()}-${Math.random()}`,
      title: 'Bài học mới',
      type: 'text',
      content: ''
    });
    setModules(newModules);
  };

  const updateModuleTitle = (index: number, title: string) => {
    const newModules = [...modules];
    newModules[index].title = title;
    setModules(newModules);
  };

  const removeModule = async (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chương này và toàn bộ bài học bên trong?')) {
      const mod = modules[index];
      if (!String(mod.id).startsWith('temp-')) {
        await deleteCourseModule(mod.id);
      }
      const newModules = [...modules];
      newModules.splice(index, 1);
      setModules(newModules);
    }
  };

  const removeLesson = async (mIndex: number, lIndex: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      const les = modules[mIndex].lessons[lIndex];
      if (!String(les.id).startsWith('temp-')) {
        await deleteLesson(les.id);
      }
      const newModules = [...modules];
      newModules[mIndex].lessons.splice(lIndex, 1);
      setModules(newModules);
      if (activeLesson && activeLesson.mIndex === mIndex && activeLesson.lIndex === lIndex) {
        setActiveLesson(null);
      }
    }
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newModules = [...modules];
      const temp = newModules[index];
      newModules[index] = newModules[index - 1];
      newModules[index - 1] = temp;
      setModules(newModules);
    } else if (direction === 'down' && index < modules.length - 1) {
      const newModules = [...modules];
      const temp = newModules[index];
      newModules[index] = newModules[index + 1];
      newModules[index + 1] = temp;
      setModules(newModules);
    }
  };

  const moveLesson = (mIndex: number, lIndex: number, direction: 'up' | 'down') => {
    const newModules = [...modules];
    const lessons = newModules[mIndex].lessons;
    if (direction === 'up' && lIndex > 0) {
      const temp = lessons[lIndex];
      lessons[lIndex] = lessons[lIndex - 1];
      lessons[lIndex - 1] = temp;
      setModules(newModules);
    } else if (direction === 'down' && lIndex < lessons.length - 1) {
      const temp = lessons[lIndex];
      lessons[lIndex] = lessons[lIndex + 1];
      lessons[lIndex + 1] = temp;
      setModules(newModules);
    }
  };

  const openLessonEditor = (mIndex: number, lIndex: number) => {
    setActiveLesson({ ...modules[mIndex].lessons[lIndex], mIndex, lIndex });
  };

  const saveActiveLesson = () => {
    if (activeLesson) {
      const newModules = [...modules];
      newModules[activeLesson.mIndex].lessons[activeLesson.lIndex] = { ...activeLesson };
      setModules(newModules);
      setActiveLesson(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Course Builder</h2>
              <p className="text-xs text-slate-400">Chỉnh sửa nội dung & cấu trúc khóa học</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-5 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? <span className="animate-spin text-lg block w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent" /> : <Save className="w-4 h-4" />}
              Lưu Khóa Học
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Basic Info & Modules List */}
          <div className="w-full md:w-1/3 border-r border-slate-700 flex flex-col h-full bg-slate-900/80">
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Thông Tin Chung</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tên Khóa Học</label>
                  <input type="text" value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mô tả ngắn</label>
                  <textarea value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ảnh Thumbnail URL</label>
                  <input type="text" value={courseData.thumbnail} onChange={e => setCourseData({...courseData, thumbnail: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">Cấu Trúc Chương</h3>
                  <button onClick={addModule} className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {modules.map((mod, mIndex) => (
                    <div key={mod.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2 p-3 bg-slate-800/80 border-b border-slate-700/50">
                        <div className="flex flex-col gap-1 text-slate-500">
                          <button onClick={() => moveModule(mIndex, 'up')} disabled={mIndex === 0} className="hover:text-amber-500 disabled:opacity-30 p-0.5"><GripVertical className="w-4 h-4" /></button>
                        </div>
                        <input 
                          type="text" 
                          value={mod.title} 
                          onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                          className="flex-1 bg-transparent border-none text-sm font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-2"
                        />
                        <button onClick={() => removeModule(mIndex)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      {/* Lessons in Module */}
                      <div className="p-2 space-y-1 bg-slate-900/50">
                        {mod.lessons.map((les: any, lIndex: number) => (
                          <div key={les.id} onClick={() => openLessonEditor(mIndex, lIndex)} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${activeLesson?.mIndex === mIndex && activeLesson?.lIndex === lIndex ? 'bg-amber-500/20 border border-amber-500/50' : 'hover:bg-slate-700 border border-transparent'}`}>
                            <div className="flex flex-col gap-0.5 text-slate-500" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => moveLesson(mIndex, lIndex, 'up')} disabled={lIndex === 0} className="hover:text-amber-500 disabled:opacity-30 text-[10px] leading-none">▲</button>
                              <button onClick={() => moveLesson(mIndex, lIndex, 'down')} disabled={lIndex === mod.lessons.length - 1} className="hover:text-amber-500 disabled:opacity-30 text-[10px] leading-none">▼</button>
                            </div>
                            {les.type === 'video' ? <Video className="w-4 h-4 text-blue-400 shrink-0" /> : les.type === 'interactive' ? <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <FileText className="w-4 h-4 text-slate-400 shrink-0" />}
                            <span className="flex-1 text-xs truncate font-medium text-slate-200">{les.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeLesson(mIndex, lIndex); }} className="text-red-400/50 hover:text-red-400 p-1"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        <button onClick={() => addLesson(mIndex)} className="w-full py-2 mt-2 border border-dashed border-slate-600 rounded-xl text-xs text-slate-400 hover:text-amber-500 hover:border-amber-500/50 flex items-center justify-center gap-1 transition-colors">
                          <Plus className="w-3 h-3" /> Thêm Bài Học
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Lesson Editor */}
          <div className="w-full md:w-2/3 flex flex-col h-full bg-slate-950">
            {activeLesson ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    {activeLesson.type === 'video' ? <Video className="w-5 h-5 text-blue-400" /> : activeLesson.type === 'interactive' ? <FileCode2 className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={activeLesson.title} 
                      onChange={e => setActiveLesson({...activeLesson, title: e.target.value})}
                      className="w-full bg-transparent border-none text-xl font-bold font-serif text-white focus:outline-none focus:ring-0"
                      placeholder="Tên Bài Học"
                    />
                    <div className="text-xs text-slate-400 flex items-center gap-4 mt-1">
                      <select 
                        value={activeLesson.type || 'text'}
                        onChange={e => setActiveLesson({...activeLesson, type: e.target.value})}
                        className="bg-slate-800 border-none rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="text">Văn bản (HTML)</option>
                        <option value="video">Video</option>
                        <option value="interactive">Tương tác 3D</option>
                        <option value="document">Tài liệu đính kèm</option>
                      </select>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={activeLesson.is_free_preview} onChange={e => setActiveLesson({...activeLesson, is_free_preview: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/50" />
                        <span>Học thử miễn phí</span>
                      </label>
                    </div>
                  </div>
                  <button onClick={saveActiveLesson} className="px-4 py-2 bg-amber-500 text-slate-900 text-sm font-bold rounded-xl hover:bg-amber-400">Lưu Tạm</button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Dynamic Fields based on type */}
                  {activeLesson.type === 'video' && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-blue-400" /> Đường dẫn Video (YouTube/Vimeo/MP4)</label>
                      <input 
                        type="text" 
                        value={activeLesson.video_url || ''} 
                        onChange={e => setActiveLesson({...activeLesson, video_url: e.target.value})}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {activeLesson.type === 'interactive' && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2"><FileCode2 className="w-4 h-4 text-emerald-400" /> Mã HTML Tương Tác</label>
                      <textarea 
                        value={activeLesson.interactive_html || ''} 
                        onChange={e => setActiveLesson({...activeLesson, interactive_html: e.target.value})}
                        placeholder="<div class='interactive-wrapper'>...</div>"
                        className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none resize-y"
                      />
                    </div>
                  )}

                  {/* Always show text editor for descriptions or text lessons */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Nội dung bài học (Rich Text / HTML)</label>
                    <textarea 
                      value={activeLesson.content || ''} 
                      onChange={e => setActiveLesson({...activeLesson, content: e.target.value})}
                      placeholder="<p>Nhập nội dung bài học...</p>"
                      className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <Edit2 className="w-16 h-16 mb-4 opacity-20" />
                <p>Chọn một bài học ở cột bên trái để chỉnh sửa nội dung</p>
                <p className="text-xs mt-2 text-amber-500">Nhớ nhấn Lưu Tạm (OK) trước khi chuyển bài khác nhé!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
