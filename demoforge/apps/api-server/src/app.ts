import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { proxyRouter } from './routes/proxy';
import { aiRouter } from './routes/ai';

const required = ['DATABASE_URL', 'SESSION_SECRET', 'ANTHROPIC_API_KEY'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('Missing required env vars:', missing.join(', '));
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/proxy', proxyRouter);
app.use('/api/ai', aiRouter);

// Fallback for demo/template routes returning placeholders
app.get('/api/templates', (req, res) => res.json([]));
app.get('/api/demos/:id/player', (req, res) => res.json({}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
