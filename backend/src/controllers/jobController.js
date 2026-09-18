import JobApplication from '../models/JobApplication.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res, error, status = 500) =>
  res.status(status).json({ success: false, error });

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    const job = await JobApplication.create(req.body);
    return ok(res, job, 201);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return fail(res, err.message, 400);
    }
    return fail(res, 'Server error while creating job application');
  }
};

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
// Supports: ?status=  ?source=  ?sort=newest|oldest
export const getJobs = async (req, res) => {
  try {
    const { status, source, sort } = req.query;

    // Build filter object directly — no post-fetch JS filtering
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;

    // sort: newest (desc) is the default; "oldest" flips to asc
    const sortOrder = sort === 'oldest' ? 1 : -1;

    const jobs = await JobApplication.find(filter).sort({ dateApplied: sortOrder });

    return ok(res, jobs);
  } catch (err) {
    return fail(res, 'Server error while fetching job applications');
  }
};

// ─── PUT /api/jobs/:id ────────────────────────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    const job = await JobApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return fail(res, 'Job application not found', 404);
    }

    return ok(res, job);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return fail(res, err.message, 400);
    }
    if (err.name === 'CastError') {
      return fail(res, 'Invalid job application ID', 400);
    }
    return fail(res, 'Server error while updating job application');
  }
};

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findByIdAndDelete(req.params.id);

    if (!job) {
      return fail(res, 'Job application not found', 404);
    }

    return ok(res, { message: 'Job application deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return fail(res, 'Invalid job application ID', 400);
    }
    return fail(res, 'Server error while deleting job application');
  }
};
