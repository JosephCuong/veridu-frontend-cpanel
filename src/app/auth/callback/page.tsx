'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { saveAuthSession } from '@/lib/auth';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Đang xác thực tài khoản Google với hệ thống VERIDU...');

  useEffect(() => {
    let cancelled = false;

    const runCallback = async () => {
      try {
        const oauthError = searchParams.get('error');
        const oauthErrorDesc = searchParams.get('error_description');
        if (oauthError) {
          if (!cancelled) {
            const isCancelled =
              oauthError === 'access_denied' ||
              String(oauthErrorDesc || '').toLowerCase().includes('cancel');
            window.location.replace(
              `/dang-nhap?error=${encodeURIComponent(isCancelled ? 'oauth_cancelled' : 'oauth_provider_error')}`
            );
          }
          return;
        }

        const rawRedirect = searchParams.get('redirect') || '/ho-so';
        const safeRedirect =
          rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/ho-so';
        const rememberMe = searchParams.get('remember') === '1';
        const authType = searchParams.get('type') || '';

        let accessToken = '';
        let refreshToken = '';

        // 1. PKCE flow (?code=...) — runs in browser where code_verifier is stored in localStorage
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error || !data?.session?.access_token) {
            console.error('PKCE exchangeCodeForSession failed:', error);
            if (!cancelled) {
              setStatus('error');
              setMessage(
                'Phiên xác thực Google đã hết hạn hoặc được mở trên một trình duyệt khác. Vui lòng thử đăng nhập lại.'
              );
            }
            return;
          }
          accessToken = data.session.access_token;
          refreshToken = data.session.refresh_token || '';
        } else {
          // 2. Implicit hash fallback (#access_token=...&refresh_token=...) or existing Supabase session
          const hash = typeof window !== 'undefined' ? window.location.hash : '';
          if (hash && hash.includes('access_token=')) {
            const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
            const hAccess = hashParams.get('access_token') || '';
            const hRefresh = hashParams.get('refresh_token') || '';
            const hType = hashParams.get('type') || '';
            if (hAccess && hRefresh) {
              await supabase.auth.setSession({ access_token: hAccess, refresh_token: hRefresh });
              accessToken = hAccess;
              refreshToken = hRefresh;
              if (hType === 'recovery') {
                window.location.replace('/dat-lai-mat-khau');
                return;
              }
            }
          }

          if (!accessToken) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              accessToken = sessionData.session.access_token;
              refreshToken = sessionData.session.refresh_token || '';
            }
          }
        }

        if (authType === 'recovery') {
          window.location.replace('/dat-lai-mat-khau');
          return;
        }

        if (!accessToken) {
          window.location.replace('/dang-nhap?error=missing_code');
          return;
        }

        // 3. Exchange verified token with VERIDU server to mint HttpOnly session cookies & sync profile
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            rememberMe,
          }),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok || !result?.success || !result?.user) {
          if (!cancelled) {
            setStatus('error');
            setMessage(result?.error || 'Không thể đồng bộ hồ sơ đăng nhập với máy chủ VERIDU.');
          }
          return;
        }

        saveAuthSession('veridu_active_session', result.user, rememberMe);

        if (!cancelled) {
          setStatus('success');
          setMessage('Đăng nhập thành công! Đang chuyển vào hệ thống VERIDU...');
          const target =
            result.needsOnboarding && safeRedirect === '/ho-so'
              ? '/ho-so?welcome=1'
              : safeRedirect;
          setTimeout(() => {
            window.location.replace(target);
          }, 400);
        }
      } catch (err) {
        console.error('Unhandled auth callback error:', err);
        if (!cancelled) {
          setStatus('error');
          setMessage('Đã xảy ra sự cố kết nối khi hoàn tất đăng nhập. Vui lòng thử lại.');
        }
      }
    };

    runCallback();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center px-4 pt-20 pb-16">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl text-center space-y-5">
        {status === 'processing' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h1 className="font-serif font-black text-2xl">Đang Hoàn Tất Đăng Nhập</h1>
            <p className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-black text-2xl text-emerald-600 dark:text-emerald-400">
              Xác Thực Thành Công
            </h1>
            <p className="text-xs font-serif text-[var(--text-muted)]">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-black text-2xl">Không Thể Hoàn Tất Đăng Nhập</h1>
            <p className="text-xs font-serif text-[var(--text-muted)] leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/dang-nhap"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif font-bold text-xs shadow-lg transition"
              >
                Quay Lại Trang Đăng Nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
