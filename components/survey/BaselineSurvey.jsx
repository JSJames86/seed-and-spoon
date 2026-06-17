'use client';

import { useState } from 'react';
import FormField from '@/components/get-help/FormField';
import FormSection from '@/components/get-help/FormSection';
import Alert from '@/components/get-help/Alert';

const INITIAL_STATE = {
  household_id: '',
  survey_date: new Date().toISOString().split('T')[0],
  children_served: '',
  adults_in_home: '',
  zip: '',
  trips_per_week: '',
  miles_round_trip: '',
  delivery_times_per_week: '',
  delivery_fee_each: '',
  meals_from_stock: '',
  hours_per_week: '',
  food_ran_out: '',
  hardest_part: '',
};

export default function BaselineSurvey() {
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
    if (!form.miles_round_trip && form.miles_round_trip !== 0) errs.miles_round_trip = 'Required';
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
        body: JSON.stringify({ ...form, phase: 'baseline' }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: 'success', message: 'Baseline survey recorded. Thank you!' });
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
      <FormSection title="Household Information" description="This information helps us match your surveys across the program.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Household Code" name="household_id" value={form.household_id} onChange={handleChange} error={errors.household_id} required placeholder="e.g. HH-07" />
          <FormField label="Date" name="survey_date" type="date" value={form.survey_date} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Children served by kits" name="children_served" type="number" value={form.children_served} onChange={handleChange} placeholder="0" />
          <FormField label="Adults in home" name="adults_in_home" type="number" value={form.adults_in_home} onChange={handleChange} placeholder="0" />
          <FormField label="ZIP code" name="zip" value={form.zip} onChange={handleChange} placeholder="07102" />
        </div>
      </FormSection>

      <FormSection title="Your Normal Week" description="These questions ask about a typical week BEFORE receiving kits.">
        <FormField
          label="B1. How many separate trips does your household make to get groceries or prepared meals?"
          name="trips_per_week"
          type="number"
          value={form.trips_per_week}
          onChange={handleChange}
          error={errors.trips_per_week}
          required
          placeholder="Trips per week"
          helpText="Count each separate trip, even to different stores."
        />
        <FormField
          label="B2. About how far is one round trip to where you usually get groceries?"
          name="miles_round_trip"
          type="number"
          value={form.miles_round_trip}
          onChange={handleChange}
          error={errors.miles_round_trip}
          required
          placeholder="Miles round trip"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="B3. How many times per week do you pay for grocery/meal delivery?"
            name="delivery_times_per_week"
            type="number"
            value={form.delivery_times_per_week}
            onChange={handleChange}
            placeholder="Times per week"
          />
          <FormField
            label="Typical delivery fee each time"
            name="delivery_fee_each"
            type="number"
            value={form.delivery_fee_each}
            onChange={handleChange}
            placeholder="$ amount"
          />
        </div>
        <FormField
          label="B4. How many meals does your household put together mostly from food you already have at home?"
          name="meals_from_stock"
          type="number"
          value={form.meals_from_stock}
          onChange={handleChange}
          placeholder="Meals per week"
        />
        <FormField
          label="B5. About how much total time does your household spend planning, shopping for, and traveling to get groceries or meals?"
          name="hours_per_week"
          type="number"
          value={form.hours_per_week}
          onChange={handleChange}
          error={errors.hours_per_week}
          required
          placeholder="Hours per week"
        />
      </FormSection>

      <FormSection title="Context (optional)">
        <FormField
          label="B6. In the last month, how often did your household run out of food before there was money to get more?"
          name="food_ran_out"
          type="radio"
          value={form.food_ran_out}
          onChange={handleChange}
          options={[
            { value: 'never', label: 'Never' },
            { value: 'sometimes', label: 'Sometimes' },
            { value: 'often', label: 'Often' },
          ]}
        />
        <FormField
          label="B7. What's the hardest part of getting meals on the table in a normal week?"
          name="hardest_part"
          type="textarea"
          value={form.hardest_part}
          onChange={handleChange}
          rows={3}
          placeholder="Tell us in your own words..."
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
        {submitting ? 'Submitting...' : 'Submit Baseline Survey'}
      </button>
    </form>
  );
}
