import { supabase } from '@/lib/supabase';

function isUniqueViolation(error) {
  return error?.code === '23505' || /duplicate key|unique constraint/i.test(String(error?.message || ''));
}

/**
 * Replay a queued insert against the existing Supabase project.
 * A unique-constraint hit means the row already landed — treat as success
 * so we never insert twice.
 */
export async function executeQueuedWrite(job, client = supabase) {
  if (job.op !== 'insert') {
    throw new Error(`Refusing to replay unsafe op "${job.op}"`);
  }
  const { data, error } = await client.from(job.table).insert(job.payload).select();
  if (error) {
    if (isUniqueViolation(error)) return { ok: true, duplicate: true };
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error('The queued write did not save. It is still waiting on this device.');
  }
  return { ok: true, data };
}
