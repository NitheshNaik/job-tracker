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

// ─── GET /api/jobs/stats ──────────────────────────────────────────────────────
export const getJobStats = async (req, res) => {
  try {
    const now = new Date();

    // Start/end of current calendar month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Start/end of previous calendar month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = thisMonthStart;

    // 14-day cutoff for follow-up detection
    const followUpCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [result] = await JobApplication.aggregate([
      {
        $facet: {
          // ── Total count ──────────────────────────────────────────────────
          total: [{ $count: 'count' }],

          // ── Count per status ─────────────────────────────────────────────
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],

          // ── Applied this calendar month ──────────────────────────────────
          thisMonth: [
            {
              $match: {
                dateApplied: { $gte: thisMonthStart, $lt: thisMonthEnd },
              },
            },
            { $count: 'count' },
          ],

          // ── Applied last calendar month ──────────────────────────────────
          lastMonth: [
            {
              $match: {
                dateApplied: { $gte: lastMonthStart, $lt: lastMonthEnd },
              },
            },
            { $count: 'count' },
          ],

          // ── Needing follow-up: Applied + older than 14 days ──────────────
          needingFollowUp: [
            {
              $match: {
                status: 'Applied',
                dateApplied: { $lt: followUpCutoff },
              },
            },
            {
              $project: {
                _id: 1,
                companyName: 1,
                jobTitle: 1,
                dateApplied: 1,
              },
            },
          ],
        },
      },
    ]);

    // ── Flatten facet results ─────────────────────────────────────────────────
    const totalApplied = result.total[0]?.count ?? 0;

    // Build statusCounts map with every enum value defaulting to 0
    const STATUS_VALUES = [
      'Applied', 'Assessment', 'Interviewing', 'Rejected', 'Offer', 'Ghosted',
    ];
    const statusCounts = Object.fromEntries(STATUS_VALUES.map((s) => [s, 0]));
    for (const { _id, count } of result.byStatus) {
      if (_id) statusCounts[_id] = count;
    }

    // ── Derived rates ─────────────────────────────────────────────────────────
    const responded =
      (statusCounts.Interviewing ?? 0) +
      (statusCounts.Offer ?? 0) +
      (statusCounts.Rejected ?? 0);

    const responseRate =
      totalApplied > 0
        ? Math.round((responded / totalApplied) * 1000) / 10  // 1 decimal %
        : 0;

    const rejectionRate =
      totalApplied > 0
        ? Math.round(((statusCounts.Rejected ?? 0) / totalApplied) * 1000) / 10
        : 0;

    return ok(res, {
      totalApplied,
      statusCounts,
      responseRate,      // e.g. 42.3  (percent)
      rejectionRate,     // e.g. 18.5  (percent)
      appliedThisMonth: result.thisMonth[0]?.count ?? 0,
      appliedLastMonth: result.lastMonth[0]?.count ?? 0,
      needingFollowUp:  result.needingFollowUp,
    });
  } catch (err) {
    return fail(res, 'Server error while computing stats');
  }
};
