import { getAutoQueueEnabled, setAutoQueueEnabled } from './lib/valuebot/settings.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const autoQueueEnabled = await getAutoQueueEnabled();
    return res.status(200).json({ autoQueueEnabled });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { autoQueueEnabled } = body;

      if (typeof autoQueueEnabled !== 'boolean') {
        return res.status(400).json({ error: 'autoQueueEnabled must be boolean' });
      }

      await setAutoQueueEnabled(autoQueueEnabled);
      return res.status(200).json({ autoQueueEnabled });
    } catch (err) {
      console.error('[ValueBot auto-settings] POST failed', err);
      return res.status(500).json({ error: 'Failed to update autoQueueEnabled' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
