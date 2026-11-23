'use client';

/**
 * Cloudflare Turnstile "are you human" check for public forms.
 * Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 *
 * Props:
 *   onToken(token)  called with a fresh token, or '' when it expires/errors
 *   resetKey        change this value to get a new token (tokens are single-use,
 *                   so bump it after every submit attempt)
 */

import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const turnstileEnabled = SITE_KEY.length > 0;

let scriptPromise = null;
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export default function TurnstileWidget({ onToken, resetKey = 0 }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!turnstileEnabled) return undefined;
    let cancelled = false;
    loadScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          appearance: 'interaction-only',
          callback: (token) => onTokenRef.current?.(token),
          'expired-callback': () => onTokenRef.current?.(''),
          'error-callback': () => onTokenRef.current?.(''),
        });
      })
      .catch(() => onTokenRef.current?.(''));
    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!turnstileEnabled || resetKey === 0) return;
    onTokenRef.current?.('');
    if (widgetIdRef.current !== null && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  if (!turnstileEnabled) return null;
  return <div ref={containerRef} className="flex justify-center my-4" />;
}
