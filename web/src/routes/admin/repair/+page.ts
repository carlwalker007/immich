import { authenticate } from '$lib/utils/auth';
import { getAuditFiles } from '@immich/sdk';
import type { PageLoad } from './$types';

export const load = (async () => {
  await authenticate({ admin: true });
  const { orphans, extras } = await getAuditFiles();

  return {
    orphans,
    extras,
    meta: {
      title: '修复',
    },
  };
}) satisfies PageLoad;
