/**
 * Subscription Service
 *
 * Reads subscription status from Supabase and creates
 * Stripe Checkout / Portal sessions via Edge Functions.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch the current user's subscription record.
 * @returns {Promise<Object|null>} Subscription row or null (free tier)
 */
export async function getSubscription() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // No row yet means free tier
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Create a Stripe Checkout session and return the redirect URL.
 * @param {string} priceId - Stripe price ID (monthly or annual)
 * @returns {Promise<{url: string}>}
 */
export async function createCheckoutSession(priceId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Stripe Customer Portal session and return the redirect URL.
 * @returns {Promise<{url: string}>}
 */
export async function createPortalSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'Failed to create portal session');
  }

  return response.json();
}
