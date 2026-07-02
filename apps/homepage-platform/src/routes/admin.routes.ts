import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as homepageService from '../modules/homepage/homepage.service';
import * as publishService from '../modules/publish/publish.service';
import { AppError } from '../utils/app-error';

const router = Router();

router.post('/homepage/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await homepageService.generateAndSaveDraft(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/homepage/:clinicId/draft', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clinicId = req.params.clinicId as string;
    const draft = await homepageService.getDraft(clinicId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }
    res.json({ draft });
  } catch (err) {
    next(err);
  }
});

router.patch('/homepage/:clinicId/draft', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clinicId = req.params.clinicId as string;
    const draft = await homepageService.patchDraft(clinicId, req.body);
    res.json({ draft });
  } catch (err) {
    next(err);
  }
});

router.get('/slugs/suggest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.query.name as string | undefined;
    if (!name) {
      res.status(400).json({ error: 'name query parameter is required' });
      return;
    }
    const district = req.query.district as string | undefined;
    const city = req.query.city as string | undefined;
    const suggestedSlugs = await homepageService.suggestSlugNames(name, district, city);
    res.json({ suggestedSlugs });
  } catch (err) {
    next(err);
  }
});

router.post('/homepage/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.body as { slug?: string };
    if (!slug) {
      res.status(400).json({ error: 'slug is required' });
      return;
    }
    const result = await publishService.publish(slug);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export function adminErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.code === 'SLUG_CONFLICT') {
      res.status(err.statusCode).json(publishService.formatSlugConflict(err));
      return;
    }
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.errors });
    return;
  }

  next(err);
}

export default router;
