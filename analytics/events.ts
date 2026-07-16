export const EVENTS = {
  // Donation funnel
  DONATION_PAGE_VIEWED: 'donation_page_viewed',
  DONOR_STARTED_CHECKOUT: 'donor_started_checkout',
  DONATION_COMPLETED: 'donation_completed',
  DONATION_FAILED: 'donation_failed',
  MONTHLY_SUBSCRIPTION_STARTED: 'monthly_subscription_started',
  MONTHLY_SUBSCRIPTION_CANCELLED: 'monthly_subscription_cancelled',

  // Family assistance pipeline
  FAMILY_APPLICATION_STARTED: 'family_application_started',
  FAMILY_APPLICATION_SUBMITTED: 'family_application_submitted',
  FAMILY_APPLICATION_APPROVED: 'family_application_approved',
  FAMILY_APPLICATION_DENIED: 'family_application_denied',
  MEAL_BOX_ASSIGNED: 'meal_box_assigned',
  MEAL_BOX_DELIVERED: 'meal_box_delivered',
  DELIVERY_FAILED: 'delivery_failed',

  // SpoonAssist (classic wizard, /spoonassist/classic)
  SPOONASSIST_SESSION_STARTED: 'spoonassist_session_started',
  SPOONASSIST_QUERY_SUBMITTED: 'spoonassist_query_submitted',
  SPOONASSIST_RESPONSE_RECEIVED: 'spoonassist_response_received',
  SPOONASSIST_RECOMMENDATION_ACCEPTED: 'spoonassist_recommendation_accepted',
  SPOONASSIST_RECOMMENDATION_REJECTED: 'spoonassist_recommendation_rejected',
  SPOONASSIST_ERROR: 'spoonassist_error',

  // SpoonAssist v2 (/spoonassist -- plan/list/compare/handoff funnel, spec Phase 5)
  SPOONASSIST_V2_PLAN_CREATED: 'plan_created',
  SPOONASSIST_V2_LIST_BUILT: 'list_built',
  SPOONASSIST_V2_COMPARE_VIEWED: 'compare_viewed',
  SPOONASSIST_V2_HANDOFF_CLICKED: 'handoff_clicked',
  SPOONASSIST_V2_SAVINGS_SHOWN: 'savings_shown',
  SPOONASSIST_V2_RETAILER_DEEPLINK_CLICKED: 'retailer_deeplink_clicked',

  // Link-in-bio hub (/links)
  LINKS_PAGE_VIEW: 'links_page_view',
  LINKS_PAGE_CLICK: 'links_page_click',
} as const
