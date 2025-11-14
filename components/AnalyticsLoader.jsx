'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { onConsent, hasConsent, logAnalytics } from '@/lib/consent';

/**
 * AnalyticsLoader Component
 *
 * Loads analytics scripts only after user consent is granted.
 * GDPR/CCPA compliant - no tracking before consent.
 *
 * Supports:
 * - Plausible Analytics (privacy-first, required)
 * - Meta Pixel (required)
 * - Google Analytics 4 (optional)
 * - TikTok Pixel (optional)
 * - Snapchat Pixel (optional)
 * - Pinterest Tag (optional)
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN (default: seedandspoon.org)
 * - NEXT_PUBLIC_META_PIXEL_ID
 * - NEXT_PUBLIC_GA4_ID (optional)
 * - NEXT_PUBLIC_TIKTOK_PIXEL_ID (optional)
 * - NEXT_PUBLIC_SNAP_PIXEL_ID (optional)
 * - NEXT_PUBLIC_PINTEREST_TAG_ID (optional)
 */
export default function AnalyticsLoader() {
  // Track which analytics have been loaded to prevent duplicates
  const [loadedAnalytics, setLoadedAnalytics] = useState({
    plausible: false,
    meta: false,
    ga4: false,
    tiktok: false,
    snap: false,
    pinterest: false,
  });

  // Prevent hydration mismatch by only loading client-side
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for consent changes and load appropriate analytics
  useEffect(() => {
    if (!isMounted) return;

    const cleanup = onConsent((consent) => {
      // Analytics category - includes Plausible and GA4
      if (consent.analytics && !loadedAnalytics.plausible) {
        logAnalytics('Plausible', 'consent_granted', 'Loading Plausible Analytics');
        setLoadedAnalytics((prev) => ({ ...prev, plausible: true }));
      }

      if (consent.analytics && !loadedAnalytics.ga4) {
        logAnalytics('GA4', 'consent_granted', 'Loading Google Analytics 4');
        setLoadedAnalytics((prev) => ({ ...prev, ga4: true }));
      }

      // Marketing category - includes Meta, TikTok, Snap, Pinterest
      if (consent.marketing && !loadedAnalytics.meta) {
        logAnalytics('Meta', 'consent_granted', 'Loading Meta Pixel');
        setLoadedAnalytics((prev) => ({ ...prev, meta: true }));
      }

      if (consent.marketing && !loadedAnalytics.tiktok) {
        logAnalytics('TikTok', 'consent_granted', 'Loading TikTok Pixel');
        setLoadedAnalytics((prev) => ({ ...prev, tiktok: true }));
      }

      if (consent.marketing && !loadedAnalytics.snap) {
        logAnalytics('Snap', 'consent_granted', 'Loading Snap Pixel');
        setLoadedAnalytics((prev) => ({ ...prev, snap: true }));
      }

      if (consent.marketing && !loadedAnalytics.pinterest) {
        logAnalytics('Pinterest', 'consent_granted', 'Loading Pinterest Tag');
        setLoadedAnalytics((prev) => ({ ...prev, pinterest: true }));
      }
    });

    return cleanup;
  }, [isMounted, loadedAnalytics]);

  // Don't render anything server-side to prevent hydration mismatch
  if (!isMounted) return null;

  // Get environment variables
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'seedandspoon.org';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const snapPixelId = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID;
  const pinterestTagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID;

  return (
    <>
      {/* ========================================
          PLAUSIBLE ANALYTICS (Privacy-First)
          Category: analytics
          ======================================== */}
      {loadedAnalytics.plausible && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
          onLoad={() => {
            logAnalytics('Plausible', 'loaded', plausibleDomain);
          }}
          onError={() => {
            console.error('[Plausible] Failed to load analytics script');
          }}
        />
      )}

      {/* ========================================
          META PIXEL (Facebook)
          Category: marketing
          ======================================== */}
      {loadedAnalytics.meta && metaPixelId && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            onLoad={() => {
              logAnalytics('Meta', 'loaded', metaPixelId);
            }}
          >
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ========================================
          GOOGLE ANALYTICS 4 (Optional)
          Category: analytics
          ======================================== */}
      {loadedAnalytics.ga4 && ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
            onLoad={() => {
              logAnalytics('GA4', 'loaded', ga4Id);
            }}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}

      {/* ========================================
          TIKTOK PIXEL (Optional)
          Category: marketing
          ======================================== */}
      {loadedAnalytics.tiktok && tiktokPixelId && (
        <>
          <Script
            id="tiktok-pixel"
            strategy="afterInteractive"
            onLoad={() => {
              logAnalytics('TikTok', 'loaded', tiktokPixelId);
            }}
          >
            {`
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `}
          </Script>
        </>
      )}

      {/* ========================================
          SNAPCHAT PIXEL (Optional)
          Category: marketing
          ======================================== */}
      {loadedAnalytics.snap && snapPixelId && (
        <>
          <Script
            id="snap-pixel"
            strategy="afterInteractive"
            onLoad={() => {
              logAnalytics('Snap', 'loaded', snapPixelId);
            }}
          >
            {`
              (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
              a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
              r.src=n;var u=t.getElementsByTagName(s)[0];
              u.parentNode.insertBefore(r,u);})(window,document,
              'https://sc-static.net/scevent.min.js');
              snaptr('init', '${snapPixelId}', {
                'user_email': '__INSERT_USER_EMAIL__'
              });
              snaptr('track', 'PAGE_VIEW');
            `}
          </Script>
        </>
      )}

      {/* ========================================
          PINTEREST TAG (Optional)
          Category: marketing
          ======================================== */}
      {loadedAnalytics.pinterest && pinterestTagId && (
        <>
          <Script
            id="pinterest-tag"
            strategy="afterInteractive"
            onLoad={() => {
              logAnalytics('Pinterest', 'loaded', pinterestTagId);
            }}
          >
            {`
              !function(e){if(!window.pintrk){window.pintrk = function () {
              window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
                n=window.pintrk;n.queue=[],n.version="3.0";var
                t=document.createElement("script");t.async=!0,t.src=e;var
                r=document.getElementsByTagName("script")[0];
                r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
              pintrk('load', '${pinterestTagId}', {em: '<user_email_address>'});
              pintrk('page');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://ct.pinterest.com/v3/?event=init&tid=${pinterestTagId}&pd[em]=<hashed_email_address>&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
