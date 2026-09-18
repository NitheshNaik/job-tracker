import JobApplication from '../models/JobApplication.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res, error, status = 500) =>
  res.status(status).json({ success: false, error });

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    const data = { ...req.body };

    // Support field name aliases (e.g., company vs companyName, title vs jobTitle)
    if (data.company && !data.companyName) data.companyName = data.company;
    if (data.title && !data.jobTitle) data.jobTitle = data.title;
    if (data.position && !data.jobTitle) data.jobTitle = data.position;
    if (data.link && !data.jobLink) data.jobLink = data.link;
    if (data.url && !data.jobLink) data.jobLink = data.url;
    if (data.referral && !data.referralContact) data.referralContact = data.referral;
    if (data.resume && !data.resumeUsed) data.resumeUsed = data.resume;

    // Clean empty string dates so Mongoose doesn't fail with CastError
    if (data.followUpDate === '' || data.followUpDate === null) {
      delete data.followUpDate;
    }
    if (data.dateApplied === '' || data.dateApplied === null) {
      delete data.dateApplied;
    }

    const job = await JobApplication.create(data);
    return ok(res, job, 201);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return fail(res, err.message, 400);
    }
    if (err.name === 'CastError') {
      return fail(res, `Invalid data format for ${err.path}: ${err.value}`, 400);
    }
    return fail(res, err.message || 'Server error while creating job application');
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

    // sort: newest (desc: -1) is the default; "oldest" flips to asc (1)
    const sortOrder = sort === 'oldest' ? 1 : -1;

    // Fetch from MongoDB, sorting newest by createdAt: -1 (or dateApplied)
    const jobs = await JobApplication.find(filter).sort({ createdAt: sortOrder, dateApplied: sortOrder });

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
    if (data.title && !data.jobTitle) data.jobTitle = data.title;
    if (data.followUpDate === '' || data.followUpDate === null) delete data.followUpDate;
    if (data.dateApplied === '' || data.dateApplied === null) delete data.dateApplied;

    const job = await JobApplication.findByIdAndUpdate(
      req.params.id,
      data,
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
