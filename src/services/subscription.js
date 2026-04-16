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
    .maybeSingle();

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

  const res = await window.fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ priceId }),
    },
  );

  console.log('Checkout status:', res.status);
  const data = await res.json();
  console.log('Checkout response:', data);

  if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
  return data;
}

/**
 * Create a Stripe Customer Portal session and return the redirect URL.
 * @returns {Promise<{url: string}>}
 */
export async function createPortalSession() {
  const { data, error } = await supabase.functions.invoke('create-portal-session');

  if (error) throw error;
  return data;
}
