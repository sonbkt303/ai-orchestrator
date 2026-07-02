import { Router } from 'express';
import * as homepageController from '../controllers/homepage.controller';

const router = Router();

router.post('/generate', homepageController.generateHomepage);

export default router;
