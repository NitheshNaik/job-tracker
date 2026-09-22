import mongoose from 'mongoose';
import JobApplication from '../models/JobApplication.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok   = (res, data, status = 200) => res.status(status).json({ success: true,  data });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error });

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    const data = { ...req.body };

    // Support field name aliases (company / title / link / etc.)
    if (data.company   && !data.companyName)     data.companyName     = data.company;
    if (data.title     && !data.jobTitle)         data.jobTitle        = data.title;
    if (data.position  && !data.jobTitle)         data.jobTitle        = data.position;
    if (data.link      && !data.jobLink)          data.jobLink         = data.link;
    if (data.url       && !data.jobLink)          data.jobLink         = data.url;
    if (data.resume    && !data.resumeUsed)       data.resumeUsed      = data.resume;

    // Clean empty string dates so Mongoose defaults kick in / avoids CastError
    if (!data.dateApplied)  delete data.dateApplied;

    // ── Bind to the authenticated user ────────────────────────────────────────
    data.user = req.user.id;

    const job = await JobApplication.create(data);
    return ok(res, job, 201);
  } catch (err) {
    if (err.name === 'ValidationError') return fail(res, err.message, 400);
    if (err.name === 'CastError')       return fail(res, `Invalid data for ${err.path}`, 400);
    return fail(res, err.message || 'Server error while creating job application');
  }
};

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
// Supports: ?status=  ?source=  ?sort=newest|oldest
export const getJobs = async (req, res) => {
  try {
    const { status, source, sort } = req.query;

    // ── Always scope to the current user ──────────────────────────────────────
    const filter = { user: req.user.id };
    if (status && status !== 'All')          filter.status = status;
    if (source && source !== 'All Sources')  filter.source = source;

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const jobs = await JobApplication
      .find(filter)
      .sort({ createdAt: sortOrder, dateApplied: sortOrder });

    return ok(res, jobs);
  } catch (err) {
    return fail(res, 'Server error while fetching job applications');
  }
};

// ─── PUT /api/jobs/:id ────────────────────────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.company && !data.companyName) data.companyName = data.company;
    if (data.title   && !data.jobTitle)   data.jobTitle    = data.title;
    if (!data.dateApplied)  delete data.dateApplied;

    // Scope to owner — prevents users editing each other's applications
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      data,
      { new: true, runValidators: true }
    );

    if (!job) return fail(res, 'Job application not found', 404);
    return ok(res, job);
  } catch (err) {
    if (err.name === 'ValidationError') return fail(res, err.message, 400);
    if (err.name === 'CastError')       return fail(res, 'Invalid job application ID', 400);
    return fail(res, 'Server error while updating job application');
  }
};

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    // Scope to owner
    const job = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!job) return fail(res, 'Job application not found', 404);
    return ok(res, { message: 'Job application deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') return fail(res, 'Invalid job application ID', 400);
    return fail(res, 'Server error while deleting job application');
  }
};

// ─── GET /api/jobs/stats ──────────────────────────────────────────────────────
export const getJobStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now    = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = thisMonthStart;
    const followUpCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [result] = await JobApplication.aggregate([
      // ── Scope entire pipeline to the current user ─────────────────────────
      { $match: { user: userId } },

      {
        $facet: {
          total: [{ $count: 'count' }],

          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],

          thisMonth: [
            { $match: { dateApplied: { $gte: thisMonthStart, $lt: thisMonthEnd } } },
            { $count: 'count' },
          ],

          lastMonth: [
            { $match: { dateApplied: { $gte: lastMonthStart, $lt: lastMonthEnd } } },
            { $count: 'count' },
          ],

          needingFollowUp: [
            { $match: { status: 'Applied', dateApplied: { $lt: followUpCutoff } } },
            { $project: { _id: 1, companyName: 1, jobTitle: 1, dateApplied: 1 } },
          ],
        },
      },
    ]);

    const totalApplied = result.total[0]?.count ?? 0;

    const STATUS_VALUES = ['Applied', 'Assessment', 'Interviewing', 'Rejected', 'Offer', 'Ghosted'];
    const statusCounts  = Object.fromEntries(STATUS_VALUES.map((s) => [s, 0]));
    for (const { _id, count } of result.byStatus) {
      if (_id) statusCounts[_id] = count;
    }

    const responded    = (statusCounts.Interviewing ?? 0) + (statusCounts.Offer ?? 0) + (statusCounts.Rejected ?? 0);
    const responseRate  = totalApplied > 0 ? Math.round((responded / totalApplied) * 1000) / 10 : 0;
    const rejectionRate = totalApplied > 0 ? Math.round(((statusCounts.Rejected ?? 0) / totalApplied) * 1000) / 10 : 0;

    return ok(res, {
      totalApplied,
      statusCounts,
      responseRate,
      rejectionRate,
      appliedThisMonth: result.thisMonth[0]?.count ?? 0,
      appliedLastMonth: result.lastMonth[0]?.count ?? 0,
      needingFollowUp:  result.needingFollowUp,
    });
  } catch (err) {
    console.error('[getJobStats]', err);
    return fail(res, 'Server error while computing stats');
  }
};
