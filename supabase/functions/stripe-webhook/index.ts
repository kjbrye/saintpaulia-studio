import { createClient } from 'jsr:@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function stripeGet(endpoint: string) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
  });
  return res.json();
}

async function verifySignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts: Record<string, string> = {};
  for (const part of sigHeader.split(',')) {
    const [k, v] = part.split('=');
    parts[k] = v;
  }

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return expectedSig === signature;
}

Deno.serve(async (req) => {
  const sigHeader = req.headers.get('stripe-signature');
  if (!sigHeader) {
    return new Response('Missing signature', { status: 400 });
  }

  const body = await req.text();

  if (WEBHOOK_SECRET) {
    const valid = await verifySignature(body, sigHeader, WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Invalid signature', { status: 400 });
    }
  }

  const event = JSON.parse(body);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode !== 'subscription') break;

      const subscriptionId = session.subscription;
      const customerId = session.customer;
      const userId = session.metadata?.supabase_user_id;

      const stripeSub = await stripeGet(`/subscriptions/${subscriptionId}`);

      let targetUserId = userId;
      if (!targetUserId) {
        const { data } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();
        targetUserId = data?.user_id;
      }

      if (!targetUserId) {
        console.error('Could not resolve user for checkout session', session.id);
        break;
      }

      await supabase.from('subscriptions').upsert(
        {
          user_id: targetUserId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: 'premium',
          status: stripeSub.status === 'active' ? 'active' : stripeSub.status,
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (!sub) break;

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', sub.user_id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
