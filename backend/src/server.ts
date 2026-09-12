import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { env } from './env.js';
import api from './routes.js';
import workflows from './workflows.js';
import analytics from './analytics.js';
import chat from './chat.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN === '*' ? [] : env.CORS_ORIGIN.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.CORS_ORIGIN === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

app.use(rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const xff = req.header('x-forwarded-for');
    if (xff) {
      const first = xff.split(',')[0].trim();
      if (first) return first;
    }
    return req.ip ?? 'unknown';
  },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const xff = req.header('x-forwarded-for');
    if (xff) {
      const first = xff.split(',')[0].trim();
      if (first) return first;
    }
    return req.ip ?? 'unknown';
  },
  message: { error: 'Too many attempts, please try again later' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/password-reset', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api', api);
app.use('/api', workflows);
app.use('/api', chat);
app.use('/api/analytics', analytics);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError || (err as { code?: string })?.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ error: 'File is invalid or exceeds the upload limit' });
  return res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test')
  app.listen(env.PORT, '0.0.0.0', () => console.log(`NIRIKSHAN API listening on ${env.PORT}`));
