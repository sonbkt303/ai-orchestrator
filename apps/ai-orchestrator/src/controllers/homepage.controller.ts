import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as homepageGenerator from '../services/homepage-generator.service';

export async function generateHomepage(req: Request, res: Response): Promise<void> {
  try {
    const result = await homepageGenerator.generateHomepage(req.body);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }

    if (err instanceof Error && err.message.startsWith('Failed to generate')) {
      res.status(422).json({ error: err.message });
      return;
    }

    console.error('[homepage.controller] generate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
