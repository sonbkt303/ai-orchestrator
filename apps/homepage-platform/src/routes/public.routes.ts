import { Router, Request, Response } from 'express';
import { PublishedSnapshotSchema } from '@clever-dent/shared-contracts';
import { mockPublishedSnapshot } from '../fixtures/mock-snapshot';

const router = Router();

router.get('/sites/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;

  if (slug !== mockPublishedSnapshot.slug) {
    res.status(404).json({ error: 'Site not found' });
    return;
  }

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
});

export default router;
