import { authenticate } from '$lib/utils/auth';
import { getAllJobsStatus } from '@immich/sdk';
import type { PageLoad } from './$types';

export const load = (async () => {
  await authenticate({ admin: true });

  const jobs = await getAllJobsStatus();

  return {
    jobs,
    meta: {
      title: '任务状态',
    },
  };
}) satisfies PageLoad;
