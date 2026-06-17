'use client';

import { useState } from 'react';
import FormField from '@/components/get-help/FormField';
import FormSection from '@/components/get-help/FormSection';
import Alert from '@/components/get-help/Alert';

const INITIAL_STATE = {
  household_id: '',
  survey_date: new Date().toISOString().split('T')[0],
  trips_per_week: '',
  miles_round_trip: '',
  delivery_times_per_week: '',
  delivery_fee_each: '',
  meals_from_stock: '',
  hours_per_week: '',
  recommend_score: '',
  feeding_ease: '',
  kit_difference: '',
  improvement_suggestions: '',
};

export default function EndlineSurvey() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.household_id.trim()) errs.household_id = 'Household code is required';
    if (!form.trips_per_week && form.trips_per_week !== 0) errs.trips_per_week = 'Required';
    if (!form.hours_per_week && form.hours_per_week !== 0) errs.hours_per_week = 'Required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phase: 'endline' }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: 'success', message: 'End-of-pilot survey recorded. Thank you for being part of the program!' });
        setForm(INITIAL_STATE);
      } else {
        setResult({ type: 'error', message: data.message || 'Something went wrong.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Could not reach the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormSection title="Household Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Household Code" name="household_id" value={form.household_id} onChange={handleChange} error={errors.household_id} required placeholder="e.g. HH-07" />
          <FormField label="Date" name="survey_date" type="date" value={form.survey_date} onChange={handleChange} />
        </div>
      </FormSection>

      <FormSection title="Your Week Now" description="These repeat the baseline questions to capture how things changed.">
        <FormField
          label="E1. Trips per week now"
          name="trips_per_week"
          type="number"
          value={form.trips_per_week}
          onChange={handleChange}
          error={errors.trips_per_week}
          required
          placeholder="Trips per week"
        />
        <FormField
          label="E2. Round-trip distance now (if it changed)"
          name="miles_round_trip"
          type="number"
          value={form.miles_round_trip}
          onChange={handleChange}
          placeholder="Miles round trip"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="E3. Delivery times per week now"
            name="delivery_times_per_week"
            type="number"
            value={form.delivery_times_per_week}
            onChange={handleChange}
            placeholder="Times per week"
          />
          <FormField
            label="Typical delivery fee"
            name="delivery_fee_each"
            type="number"
            value={form.delivery_fee_each}
            onChange={handleChange}
            placeholder="$ amount"
          />
        </div>
        <FormField
          label="E4. Meals per week from your own stock now"
          name="meals_from_stock"
          type="number"
          value={form.meals_from_stock}
          onChange={handleChange}
          placeholder="Meals per week"
        />
        <FormField
          label="E5. Hours per week getting groceries/meals now"
          name="hours_per_week"
          type="number"
          value={form.hours_per_week}
          onChange={handleChange}
          error={errors.hours_per_week}
          required
          placeholder="Hours per week"
        />
      </FormSection>

      <FormSection title="Satisfaction & Impact">
        <FormField
          label="E6. How likely are you to recommend this program to another family? (0 = not at all, 10 = extremely)"
          name="recommend_score"
          type="select"
          value={form.recommend_score}
          onChange={handleChange}
          placeholder="Select a score"
          options={Array.from({ length: 11 }, (_, i) => ({
            value: String(i),
            label: `${i}${i === 0 ? ' — Not at all likely' : i === 10 ? ' — Extremely likely' : ''}`,
          }))}
        />
        <FormField
          label="E7. Over the 6 weeks, the kits made feeding my family:"
          name="feeding_ease"
          type="radio"
          value={form.feeding_ease}
          onChange={handleChange}
          options={[
            { value: 'much_easier', label: 'Much easier' },
            { value: 'a_little_easier', label: 'A little easier' },
            { value: 'no_change', label: 'No change' },
            { value: 'harder', label: 'Harder' },
          ]}
        />
        <FormField
          label="E8. What difference did the kits make for your household?"
          name="kit_difference"
          type="textarea"
          value={form.kit_difference}
          onChange={handleChange}
          rows={3}
          placeholder="Tell us in your own words..."
        />
        <FormField
          label="E9. What would make the program better?"
          name="improvement_suggestions"
          type="textarea"
          value={form.improvement_suggestions}
          onChange={handleChange}
          rows={3}
          placeholder="Any suggestions..."
        />
      </FormSection>

      {result && (
        <Alert type={result.type} message={result.message} onClose={() => setResult(null)} />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit End-of-Pilot Survey'}
      </button>
    </form>
  );
}
