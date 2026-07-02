import { Router, Request, Response } from 'express';
import { PublishedSnapshotSchema } from '@clever-dent/shared-contracts';
import { mockPublishedSnapshot } from '../fixtures/mock-snapshot';
import * as snapshotRepo from '../db/repositories/snapshot.repository';
import config from '../config';

const router = Router();

router.get('/sites/:slug', async (req: Request, res: Response) => {
  const slug = String(req.params.slug);

  try {
    const snapshot = await snapshotRepo.getLatestSnapshotBySlug(slug);

    if (snapshot) {
      if (!snapshot.siteEnabled) {
        res.status(404).json({
          error: 'Site unavailable',
          maintenance: true,
          slug,
        });
        return;
      }

      const parsed = PublishedSnapshotSchema.parse(snapshot);
      res.json(parsed);
      return;
    }
  } catch (err) {
    console.error('[public.routes] DB error:', err);
  }

  if (config.nodeEnv === 'development' && slug === mockPublishedSnapshot.slug) {
    if (!mockPublishedSnapshot.siteEnabled) {
      res.status(404).json({
        error: 'Site unavailable',
        maintenance: true,
        slug,
      });
      return;
    }

    const parsed = PublishedSnapshotSchema.parse(mockPublishedSnapshot);
    res.json(parsed);
    return;
  }

  res.status(404).json({ error: 'Site not found' });
});

export default router;
