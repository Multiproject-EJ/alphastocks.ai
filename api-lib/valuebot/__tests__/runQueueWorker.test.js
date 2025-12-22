import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUEUE_STATUS, getConfiguredMaxJobs } from '../runQueueWorker.js';

/**
 * Tests for ValueBot Queue Worker race condition fixes
 */

test('QUEUE_STATUS constants are properly defined', () => {
  assert.equal(QUEUE_STATUS.PENDING, 'pending');
  assert.equal(QUEUE_STATUS.RUNNING, 'running');
  assert.equal(QUEUE_STATUS.COMPLETED, 'completed');
  assert.equal(QUEUE_STATUS.FAILED, 'failed');
  assert.equal(QUEUE_STATUS.CANCELLED, 'cancelled');
});

test('getConfiguredMaxJobs returns default when no input', () => {
  // Clear any env var for this test
  const originalEnv = process.env.VALUEBOT_CRON_MAX_JOBS;
  delete process.env.VALUEBOT_CRON_MAX_JOBS;
  
  const result = getConfiguredMaxJobs();
  assert.equal(result, 5); // DEFAULT_CRON_MAX_JOBS
  
  // Restore env var
  if (originalEnv !== undefined) {
    process.env.VALUEBOT_CRON_MAX_JOBS = originalEnv;
  }
});

test('getConfiguredMaxJobs respects environment variable', () => {
  const originalEnv = process.env.VALUEBOT_CRON_MAX_JOBS;
  process.env.VALUEBOT_CRON_MAX_JOBS = '10';
  
  const result = getConfiguredMaxJobs();
  assert.equal(result, 10);
  
  // Restore env var
  if (originalEnv !== undefined) {
    process.env.VALUEBOT_CRON_MAX_JOBS = originalEnv;
  } else {
    delete process.env.VALUEBOT_CRON_MAX_JOBS;
  }
});

test('getConfiguredMaxJobs prefers provided input over env var', () => {
  const originalEnv = process.env.VALUEBOT_CRON_MAX_JOBS;
  process.env.VALUEBOT_CRON_MAX_JOBS = '10';
  
  const result = getConfiguredMaxJobs(3);
  assert.equal(result, 3);
  
  // Restore env var
  if (originalEnv !== undefined) {
    process.env.VALUEBOT_CRON_MAX_JOBS = originalEnv;
  } else {
    delete process.env.VALUEBOT_CRON_MAX_JOBS;
  }
});

test('getConfiguredMaxJobs ignores invalid inputs', () => {
  const result1 = getConfiguredMaxJobs('invalid');
  assert.equal(result1, 5); // Falls back to default
  
  const result2 = getConfiguredMaxJobs(-5);
  assert.equal(result2, 5); // Falls back to default
  
  const result3 = getConfiguredMaxJobs(0);
  assert.equal(result3, 5); // Falls back to default
});

/**
 * Integration test concept (would need mock Supabase client):
 * 
 * test('runQueueWorker excludes RUNNING jobs from fetch', async () => {
 *   // Mock Supabase to verify query excludes RUNNING status
 *   // Assert that query only includes 'status.is.null' and 'status.eq.pending'
 * });
 * 
 * test('runQueueWorker atomically claims jobs before processing', async () => {
 *   // Mock Supabase to verify atomic update is called
 *   // Assert update sets status to RUNNING for all job IDs
 * });
 * 
 * test('runQueueWorker fails jobs after MAX_ATTEMPTS', async () => {
 *   // Mock job with attempts >= 3
 *   // Assert job is marked as FAILED without processing
 * });
 * 
 * test('remaining count query excludes RUNNING jobs', async () => {
 *   // Mock Supabase to verify remaining count query
 *   // Assert query only includes pending/null status
 * });
 */
