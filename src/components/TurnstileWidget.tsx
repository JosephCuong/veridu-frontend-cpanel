'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { TURNSTILE_SITE_KEY, type TurnstileAction } from '@/lib/turnstile';
import { ShieldCheck, RefreshCw } from 'lucide-react';

type TurnstileWidgetId = string;

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme?: 'light' | 'dark' | 'auto';
      language?: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
  remove: (widgetId: TurnstileWidgetId) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  action: TurnstileAction;
  onToken: (token: string) => void;
  resetSignal?: number;
  className?: string;
}

export default function TurnstileWidget({
  action,
  onToken,
  resetSignal = 0,
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'error'>('loading');

  const mountWidget = () => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current !== null) return;

    try {
      setStatus('ready');
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action,
        theme: 'auto',
        language: 'vi',
        callback: (token: string) => {
          setStatus('verified');
          onTokenRef.current(token);
        },
        'expired-callback': () => {
          setStatus('ready');
          onTokenRef.current('');
        },
        'error-callback': () => {
          setStatus('error');
          onTokenRef.current('');
        },
      });
    } catch {
      setStatus('error');
    }
  };

  // Mount immediately if Turnstile script is already loaded from another page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.turnstile) {
      mountWidget();
    }
    return () => {
      if (widgetIdRef.current !== null && typeof window !== 'undefined' && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  // Reset single-use token whenever parent increments resetSignal
  useEffect(() => {
    if (resetSignal === 0) return;
    if (widgetIdRef.current !== null && typeof window !== 'undefined' && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        setStatus('ready');
        onTokenRef.current('');
      } catch {}
    }
  }, [resetSignal]);

  const handleManualReset = () => {
    if (widgetIdRef.current !== null && typeof window !== 'undefined' && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        setStatus('ready');
        onTokenRef.current('');
        return;
      } catch {}
    }
    mountWidget();
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={mountWidget}
        onLoad={mountWidget}
      />
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-card)] p-2.5 min-h-[74px]">
        <div ref={containerRef} className="flex justify-center" />
        {status === 'loading' && (
          <span className="text-[11px] font-serif text-[var(--text-muted)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Đang tải lớp bảo vệ chống bot Cloudflare...
          </span>
        )}
        {status === 'error' && (
          <button
            type="button"
            onClick={handleManualReset}
            className="text-[11px] font-serif text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tải lại hộp xác thực bảo mật
          </button>
        )}
      </div>
    </div>
  );
}
