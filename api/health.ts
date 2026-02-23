import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { corsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Quick DB check
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);

    return res.status(200).json({
      status: error ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      message: 'Linheim Finance API is running',
      database: error ? 'disconnected' : 'connected',
    });
  } catch (error) {
    return res.status(200).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      message: 'Linheim Finance API is running',
      database: 'disconnected',
    });
  }
}
