'use client';

import { useState } from 'react';
import FormField from '@/components/get-help/FormField';
import FormSection from '@/components/get-help/FormSection';
import Alert from '@/components/get-help/Alert';

const INITIAL_STATE = {
  household_id: '',
  week_number: '',
  trips_per_week: '',
  delivery_times_per_week: '',
  delivery_total_paid: '',
  meals_from_stock: '',
  hours_per_week: '',
  kit_condition_ok: '',
  kit_condition_issue: '',
};

export default function WeeklyCheckin() {
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
    if (!form.week_number) errs.week_number = 'Week number is required';
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
      const payload = {
        ...form,
        phase: 'weekly',
        kit_condition_ok: form.kit_condition_ok === 'yes' ? true : form.kit_condition_ok === 'no' ? false : null,
      };

      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: 'success', message: `Week ${form.week_number} check-in recorded. Thank you!` });
        setForm(prev => ({ ...INITIAL_STATE, household_id: prev.household_id }));
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
      <FormSection title="Weekly Check-In" description="Quick questions about THIS week. Should take under a minute.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Household Code" name="household_id" value={form.household_id} onChange={handleChange} error={errors.household_id} required placeholder="e.g. HH-07" />
          <FormField
            label="Week Number"
            name="week_number"
            type="select"
            value={form.week_number}
            onChange={handleChange}
            error={errors.week_number}
            required
            placeholder="Select week"
            options={[
              { value: '1', label: 'Week 1' },
              { value: '2', label: 'Week 2' },
              { value: '3', label: 'Week 3' },
              { value: '4', label: 'Week 4' },
              { value: '5', label: 'Week 5' },
              { value: '6', label: 'Week 6' },
            ]}
          />
        </div>
      </FormSection>

      <FormSection title="This Week">
        <FormField
          label="W1. How many grocery/meal trips did you make THIS week?"
          name="trips_per_week"
          type="number"
          value={form.trips_per_week}
          onChange={handleChange}
          error={errors.trips_per_week}
          required
          placeholder="Number of trips"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="W2. How many times did you pay for delivery THIS week?"
            name="delivery_times_per_week"
            type="number"
            value={form.delivery_times_per_week}
            onChange={handleChange}
            placeholder="Times"
          />
          <FormField
            label="Total delivery fees paid"
            name="delivery_total_paid"
            type="number"
            value={form.delivery_total_paid}
            onChange={handleChange}
            placeholder="$ total"
          />
        </div>
        <FormField
          label="W3. How many meals this week came from food you already had at home (not the kit)?"
          name="meals_from_stock"
          type="number"
          value={form.meals_from_stock}
          onChange={handleChange}
          placeholder="Number of meals"
        />
        <FormField
          label="W4. About how much time did you spend getting groceries/meals THIS week?"
          name="hours_per_week"
          type="number"
          value={form.hours_per_week}
          onChange={handleChange}
          error={errors.hours_per_week}
          required
          placeholder="Hours"
        />
      </FormSection>

      <FormSection title="Kit Condition">
        <FormField
          label="W5. Did the kit arrive in good condition (cold/frozen as expected)?"
          name="kit_condition_ok"
          type="radio"
          value={form.kit_condition_ok}
          onChange={handleChange}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />
        {form.kit_condition_ok === 'no' && (
          <FormField
            label="What was wrong?"
            name="kit_condition_issue"
            type="textarea"
            value={form.kit_condition_issue}
            onChange={handleChange}
            rows={2}
            placeholder="Describe the issue..."
          />
        )}
      </FormSection>

      {result && (
        <Alert type={result.type} message={result.message} onClose={() => setResult(null)} />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Weekly Check-In'}
      </button>
    </form>
  );
}
