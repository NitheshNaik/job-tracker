import { Router } from 'express';
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobStats,
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All job routes require a valid JWT — apply protect globally to this router
router.use(protect);

// POST   /api/jobs        – create a new job application
// GET    /api/jobs        – list all (with optional ?status= ?source= ?sort=)
router.route('/').post(createJob).get(getJobs);

// GET    /api/jobs/stats  – aggregated dashboard stats
// NOTE: must be declared before /:id so "stats" isn't treated as a Mongo ObjectId
router.get('/stats', getJobStats);

// PUT    /api/jobs/:id    – update a job application
// DELETE /api/jobs/:id    – delete a job application
router.route('/:id').put(updateJob).delete(deleteJob);

export default router;
