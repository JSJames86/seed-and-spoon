'use client';

import { useSpoonAssistTheme } from '@/components/spoonassist/ThemeProvider';

const ROWS = [
  { label: 'Household settings', hint: '4 people · $85/week' },
  { label: 'Dietary & allergens', hint: 'Vegetarian' },
  { label: 'Pantry', hint: 'Manage what you have on hand' },
  { label: 'Saved recipes', hint: 'Collections' },
  { label: 'List history', hint: 'Past shopping lists' },
  { label: 'Stores & ZIP', hint: 'Not set' },
];

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SpoonAssistProfilePage() {
  const { theme, toggleTheme } = useSpoonAssistTheme();

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Profile</h1>
      <p className="mt-1 text-[15px] text-[var(--sa-ink-soft)]">
        Sign up to save your household, pantry, and lists across visits.
      </p>

      <div className="mt-6 divide-y divide-[var(--sa-surface-alt)] overflow-hidden rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] shadow-[var(--sa-shadow-card)]">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center justify-between px-5 py-4 text-left spoon-transition hover:bg-[var(--sa-surface-alt)]"
        >
          <div>
            <p className="text-[15px] font-medium text-[var(--sa-ink)]">Appearance</p>
            <p className="text-[13px] text-[var(--sa-ink-soft)]">{theme === 'dark' ? 'Dark' : 'Light'}</p>
          </div>
          <span
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Toggle dark mode"
            className={`flex h-6 w-11 shrink-0 items-center rounded-[var(--sa-radius-pill)] p-0.5 spoon-transition ${
              theme === 'dark' ? 'bg-[var(--sa-green-deep)]' : 'bg-[var(--sa-surface-alt)]'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-[var(--sa-on-dark)] spoon-transition ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </span>
        </button>

        {ROWS.map((row) => (
          <button
            key={row.label}
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left spoon-transition hover:bg-[var(--sa-surface-alt)]"
          >
            <div>
              <p className="text-[15px] font-medium text-[var(--sa-ink)]">{row.label}</p>
              <p className="text-[13px] text-[var(--sa-ink-soft)]">{row.hint}</p>
            </div>
            <span className="text-[var(--sa-ink-soft)]">
              <ChevronIcon />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
