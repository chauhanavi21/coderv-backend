import { Webhook } from 'svix';
import * as userModel from '../models/userModel.js';

/**
 * Handles incoming Clerk webhook events.
 *
 * Clerk → POST /api/webhooks/clerk
 *
 * Supported events:
 *  user.created  → upsert user in Supabase
 *  user.updated  → upsert user in Supabase
 *  user.deleted  → delete user (and their progress via CASCADE) from Supabase
 */
export async function handleClerkWebhook(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[webhook] CLERK_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured on server.' });
  }

  // svix signature headers
  const svixId        = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix signature headers.' });
  }

  // Verify signature — req.body is a raw Buffer (express.raw middleware)
  const wh = new Webhook(secret);
  let event;
  try {
    event = wh.verify(req.body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const { type, data } = event;
  console.log(`[webhook] Received: ${type} (user: ${data?.id})`);

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmail = data.email_addresses?.find(
          (e) => e.id === data.primary_email_address_id
        )?.email_address ?? data.email_addresses?.[0]?.email_address ?? null;

        await userModel.upsertUser({
          id:         data.id,
          email:      primaryEmail,
          first_name: data.first_name ?? null,
          last_name:  data.last_name  ?? null,
          image_url:  data.image_url  ?? null,
        });
        break;
      }

      case 'user.deleted':
        if (data.id) await userModel.deleteUser(data.id);
        break;

      default:
        // Unhandled event type — acknowledge and ignore
        break;
    }

    return res.json({ received: true, type });
  } catch (err) {
    console.error(`[webhook] Error processing ${type}:`, err.message);
    return res.status(500).json({ error: err.message });
  }
}
