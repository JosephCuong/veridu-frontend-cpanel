import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[var(--bg-main)]">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-6" />
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800/50 rounded-lg animate-pulse w-1/3 mx-auto"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-md animate-pulse w-full mt-8"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-md animate-pulse w-11/12"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-md animate-pulse w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-md animate-pulse w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded-md animate-pulse w-4/5"></div>
      </div>
    </div>
  );
}
