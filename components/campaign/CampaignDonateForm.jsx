'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';

const PRESET_AMOUNTS = [2500, 5000, 10000, 25000]; // $25, $50, $100, $250

export default function CampaignDonateForm({ campaignSlug }) {
  const [frequency, setFrequency] = useState('one_time');
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxAcknowledged, setTaxAcknowledged] = useState(false);

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(null);
    setError(null);
  };

  const handleDonate = async () => {
    setError(null);

    let finalAmount;
    if (isCustom) {
      const dollars = parseFloat(customAmount);
      if (isNaN(dollars) || dollars < 1) {
        setError('Please enter an amount of at least $1.00');
        return;
      }
      finalAmount = Math.round(dollars * 100);
    } else if (selectedAmount) {
      finalAmount = selectedAmount;
    } else {
      setError('Please select an amount');
      return;
    }

    setIsLoading(true);

    captureEvent(EVENTS.DONOR_STARTED_CHECKOUT, {
      tier: isCustom ? 'custom' : `preset_${finalAmount / 100}`,
      amount: finalAmount / 100,
      frequency: frequency === 'month' ? 'monthly' : 'one_time',
      campaign: campaignSlug,
    });

    try {
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'usd',
          interval: frequency,
          source: 'campaign_page',
          campaign_slug: campaignSlug,
        }),
      });

      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'Failed to create checkout session');

      window.location.href = result.data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const displayAmount = isCustom && customAmount
    ? `$${customAmount}`
    : selectedAmount
    ? `$${selectedAmount / 100}`
    : '';

  return (
    <div className="space-y-4">
      {/* Frequency toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setFrequency('one_time')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            frequency === 'one_time'
              ? 'bg-primary-soil text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          One-time
        </button>
        <button
          onClick={() => setFrequency('month')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            frequency === 'month'
              ? 'bg-gradient-green text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleAmountClick(amount)}
            className={`py-3 rounded-lg font-bold text-lg transition-all ${
              selectedAmount === amount && !isCustom
                ? 'bg-primary-soil text-white shadow ring-2 ring-primary-soil/30'
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ${amount / 100}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <button
        onClick={handleCustomClick}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
          isCustom
            ? 'bg-primary-soil text-white shadow ring-2 ring-primary-soil/30'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        Custom amount
      </button>

      {isCustom && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="w-full py-3 pl-8 pr-4 text-lg font-bold border-2 border-primary-soil/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil/30"
            autoFocus
          />
        </motion.div>
      )}

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {/* Tax disclaimer */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={taxAcknowledged}
          onChange={(e) => setTaxAcknowledged(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-soil focus:ring-primary-soil cursor-pointer shrink-0"
        />
        <span className="text-xs text-gray-500 leading-snug">
          I understand that Seed and Spoon Incorporated&apos;s 501(c)(3) status is pending and contributions are not currently tax-deductible.
        </span>
      </label>

      {/* Donate button */}
      <button
        onClick={handleDonate}
        disabled={isLoading || !taxAcknowledged}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
          isLoading || !taxAcknowledged
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-primary-soil text-white hover:bg-gradient-green shadow-lg hover:shadow-xl hover:scale-[1.02]'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </span>
        ) : (
          `Donate ${displayAmount}${frequency === 'month' ? '/month' : ''}`
        )}
      </button>

      <p className="text-xs text-center text-gray-400">Secure payment via Stripe</p>
    </div>
  );
}
