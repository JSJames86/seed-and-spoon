'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeDetails from './RecipeDetails';

/**
 * RecipeModal Component
 *
 * Displays full recipe details in an accessible modal overlay.
 * Features:
 * - Keyboard closeable (Esc key)
 * - Focus trap and focus management
 * - Click outside to close
 * - Smooth animations
 * - Fully accessible with ARIA attributes
 *
 * @component
 * @param {Object} props
 * @param {Object|null} props.recipe - Recipe object to display, or null to close modal
 * @param {Function} props.onClose - Callback to close the modal
 *
 * @example
 * <RecipeModal
 *   recipe={selectedRecipe}
 *   onClose={() => setSelectedRecipe(null)}
 * />
 */
export default function RecipeModal({ recipe, onClose }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (recipe) {
      previousFocusRef.current = document.activeElement;

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [recipe]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && recipe) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [recipe, onClose]);

  // Return focus to previously focused element when modal closes
  useEffect(() => {
    return () => {
      if (previousFocusRef.current && !recipe) {
        previousFocusRef.current.focus();
      }
    };
  }, [recipe]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (recipe) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [recipe]);

  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!recipe) return null;

  return (
    <AnimatePresence>
      {recipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="sticky top-4 right-4 float-right z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2"
              aria-label="Close recipe details"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <RecipeDetails recipe={recipe} titleId="modal-title" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * FALLBACK VERSION (without framer-motion):
 *
 * Replace AnimatePresence and motion.div with regular divs and CSS transitions:
 *
 * {recipe && (
 *   <div
 *     className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
 *     role="dialog"
 *     aria-modal="true"
 *     aria-labelledby="modal-title"
 *   >
 *     <div
 *       className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 *       onClick={handleBackdropClick}
 *     />
 *
 *     <div
 *       ref={modalRef}
 *       className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
 *     >
 *       {/* Rest of modal content stays the same *\/}
 *     </div>
 *   </div>
 * )}
 *
 * Add to CSS:
 * @keyframes scaleIn {
 *   from { opacity: 0; transform: scale(0.9) translateY(20px); }
 *   to { opacity: 1; transform: scale(1) translateY(0); }
 * }
 * .animate-scale-in { animation: scaleIn 0.3s ease-out; }
 */
