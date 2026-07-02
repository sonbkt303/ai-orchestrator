import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import healthRoutes from './routes/health.routes';
import publicRoutes from './routes/public.routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/v1/public', publicRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[homepage-platform] running on port ${config.port} (${config.nodeEnv})`);
});

export default app;
