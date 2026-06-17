-- 5 Loaves Pilot: Participant Survey Responses
-- Within-household pre/post design. Each family is its own baseline.
-- household_id is the coded ID (e.g. HH-07), NOT linked to any child identity.

CREATE TABLE public.survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id text NOT NULL,
  phase text NOT NULL CHECK (phase IN ('baseline', 'weekly', 'endline')),
  week_number smallint CHECK (week_number BETWEEN 1 AND 6),
  survey_date date NOT NULL DEFAULT CURRENT_DATE,

  -- Demographics (baseline only)
  children_served smallint,
  adults_in_home smallint,
  zip text,

  -- B1/W1/E1: Trips per week
  trips_per_week numeric,

  -- B2/E2: Miles round trip to groceries
  miles_round_trip numeric,

  -- B3/W2/E3: Delivery frequency and fees
  delivery_times_per_week numeric,
  delivery_fee_each numeric,
  delivery_total_paid numeric,

  -- B4/W3/E4: Meals assembled from food already at home
  meals_from_stock numeric,

  -- B5/W4/E5: Hours spent planning/shopping/traveling for groceries
  hours_per_week numeric,

  -- B6: Food insecurity context (baseline only)
  food_ran_out text CHECK (food_ran_out IS NULL OR food_ran_out IN ('never', 'sometimes', 'often')),

  -- B7: Hardest part (baseline open-ended)
  hardest_part text,

  -- W5: Kit condition check (weekly only, feeds cold-chain QA)
  kit_condition_ok boolean,
  kit_condition_issue text,

  -- E6: NPS-style recommendation score
  recommend_score smallint CHECK (recommend_score IS NULL OR recommend_score BETWEEN 0 AND 10),

  -- E7: Feeding ease
  feeding_ease text CHECK (feeding_ease IS NULL OR feeding_ease IN ('much_easier', 'a_little_easier', 'no_change', 'harder')),

  -- E8: Open-ended difference
  kit_difference text,

  -- E9: Open-ended improvement
  improvement_suggestions text,

  created_at timestamptz DEFAULT now(),

  CONSTRAINT weekly_needs_week_number CHECK (
    (phase = 'weekly' AND week_number IS NOT NULL) OR
    (phase != 'weekly')
  ),
  CONSTRAINT baseline_endline_no_week CHECK (
    (phase IN ('baseline', 'endline') AND week_number IS NULL) OR
    (phase = 'weekly')
  )
);

CREATE INDEX idx_survey_responses_household ON public.survey_responses (household_id, phase);
CREATE INDEX idx_survey_responses_phase ON public.survey_responses (phase);

CREATE UNIQUE INDEX idx_survey_baseline_unique ON public.survey_responses (household_id) WHERE phase = 'baseline';
CREATE UNIQUE INDEX idx_survey_endline_unique ON public.survey_responses (household_id) WHERE phase = 'endline';
CREATE UNIQUE INDEX idx_survey_weekly_unique ON public.survey_responses (household_id, week_number) WHERE phase = 'weekly';

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on survey_responses"
  ON public.survey_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can submit survey responses"
  ON public.survey_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read survey responses"
  ON public.survey_responses
  FOR SELECT
  TO authenticated
  USING (true);

-- Computed metrics view: baseline vs pilot for the five friction metrics
CREATE OR REPLACE VIEW public.survey_metrics AS
WITH baseline AS (
  SELECT household_id, trips_per_week, miles_round_trip,
         delivery_times_per_week, delivery_fee_each,
         meals_from_stock, hours_per_week
  FROM public.survey_responses
  WHERE phase = 'baseline'
),
weekly_avg AS (
  SELECT household_id,
         AVG(trips_per_week) AS avg_trips,
         AVG(delivery_times_per_week) AS avg_delivery_times,
         AVG(COALESCE(delivery_total_paid, delivery_times_per_week * COALESCE(delivery_fee_each, 0))) AS avg_delivery_cost,
         AVG(meals_from_stock) AS avg_meals_from_stock,
         AVG(hours_per_week) AS avg_hours,
         COUNT(*) AS weeks_completed
  FROM public.survey_responses
  WHERE phase = 'weekly'
  GROUP BY household_id
),
endline AS (
  SELECT household_id, trips_per_week, miles_round_trip,
         delivery_times_per_week, delivery_fee_each,
         meals_from_stock, hours_per_week,
         recommend_score, feeding_ease
  FROM public.survey_responses
  WHERE phase = 'endline'
)
SELECT
  b.household_id,
  b.trips_per_week AS baseline_trips,
  COALESCE(e.trips_per_week, wa.avg_trips) AS pilot_trips,
  b.trips_per_week - COALESCE(e.trips_per_week, wa.avg_trips) AS trips_avoided,
  b.miles_round_trip,
  (b.trips_per_week - COALESCE(e.trips_per_week, wa.avg_trips))
    * COALESCE(e.miles_round_trip, b.miles_round_trip) AS miles_not_traveled,
  (b.delivery_times_per_week * COALESCE(b.delivery_fee_each, 0)) AS baseline_delivery_cost_weekly,
  COALESCE(
    wa.avg_delivery_cost,
    e.delivery_times_per_week * COALESCE(e.delivery_fee_each, 0)
  ) AS pilot_delivery_cost_weekly,
  (b.delivery_times_per_week * COALESCE(b.delivery_fee_each, 0))
    - COALESCE(
        wa.avg_delivery_cost,
        e.delivery_times_per_week * COALESCE(e.delivery_fee_each, 0)
      ) AS delivery_fees_averted_weekly,
  b.meals_from_stock AS baseline_meals_from_stock,
  COALESCE(e.meals_from_stock, wa.avg_meals_from_stock) AS pilot_meals_from_stock,
  COALESCE(e.meals_from_stock, wa.avg_meals_from_stock) - b.meals_from_stock AS meals_from_stock_change,
  b.hours_per_week AS baseline_hours,
  COALESCE(e.hours_per_week, wa.avg_hours) AS pilot_hours,
  b.hours_per_week - COALESCE(e.hours_per_week, wa.avg_hours) AS hours_saved,
  e.recommend_score,
  e.feeding_ease,
  wa.weeks_completed
FROM baseline b
LEFT JOIN weekly_avg wa ON wa.household_id = b.household_id
LEFT JOIN endline e ON e.household_id = b.household_id;
