'use client';

import { useState, useEffect } from 'react';
import { SubscribeForm } from './SubscribeForm';

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ModalContent({ onClose, showDismiss }: { onClose: () => void; showDismiss?: boolean }) {
  return (
    <div className="relative bg-[var(--cream)] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-[var(--charcoal)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-full p-1"
        aria-label="Close"
      >
        <CloseIcon />
      </button>
      <p className="footer-heading mb-2">STAY CONNECTED</p>
      <h2 className="heading-h3 text-[var(--charcoal)] mb-2">
        Get <span className="text-[var(--green-primary)]">Updates</span>
      </h2>
      <p className="body-sm text-slate-600 mb-6">
        Fresh food resources, volunteer opportunities, and impact stories—straight to your inbox.
      </p>
      <SubscribeForm onSuccess={onClose} />
      {showDismiss && (
        <button
          onClick={onClose}
          className="mt-4 body-sm text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded"
        >
          No thanks
        </button>
      )}
    </div>
  );
}

export function SubscribePopupTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('subscribe-popup-dismissed')) return;
    const timer = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('subscribe-popup-dismissed', '1');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Newsletter signup"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <ModalContent onClose={handleClose} showDismiss />
    </div>
  );
}

export default function SubscribeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Newsletter signup"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <ModalContent onClose={onClose} />
    </div>
  );
}
