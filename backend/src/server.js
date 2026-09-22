import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import jobRoutes  from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev fallback — tighten in production if needed
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);   // register, login, /me
app.use('/api/jobs', jobRoutes);    // all job CRUD (protected)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'Job Tracker API is running 🚀' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
