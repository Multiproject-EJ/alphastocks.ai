import { getAutoSettings, setAutoQueueEnabled } from '../api-lib/valuebot/settings.js';
import { getConfiguredMaxJobs, SECONDS_PER_JOB_ESTIMATE } from '../api-lib/valuebot/runQueueWorker.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { autoQueueEnabled, lastAutoRunAt } = await getAutoSettings();
    const maxJobs = getConfiguredMaxJobs();
    return res.status(200).json({
      autoQueueEnabled,
      lastAutoRunAt,
      maxJobs,
      secondsPerJobEstimate: SECONDS_PER_JOB_ESTIMATE
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { autoQueueEnabled } = body;

      if (typeof autoQueueEnabled !== 'boolean') {
        return res.status(400).json({ error: 'autoQueueEnabled must be boolean' });
      }

      await setAutoQueueEnabled(autoQueueEnabled);
      const { lastAutoRunAt } = await getAutoSettings();
      const maxJobs = getConfiguredMaxJobs();
      return res.status(200).json({
        autoQueueEnabled,
        lastAutoRunAt,
        maxJobs,
        secondsPerJobEstimate: SECONDS_PER_JOB_ESTIMATE
      });
    } catch (err) {
      console.error('[ValueBot auto-settings] POST failed', err);
      return res.status(500).json({ error: 'Failed to update autoQueueEnabled' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
