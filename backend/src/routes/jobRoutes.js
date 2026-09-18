import { Router } from 'express';
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';

const router = Router();

// POST   /api/jobs        – create a new job application
// GET    /api/jobs        – list all (with optional ?status= ?source= ?sort=)
router.route('/').post(createJob).get(getJobs);

// PUT    /api/jobs/:id    – update a job application
// DELETE /api/jobs/:id    – delete a job application
router.route('/:id').put(updateJob).delete(deleteJob);

export default router;
