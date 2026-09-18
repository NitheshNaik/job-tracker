import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },

    jobLink: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      enum: ['LinkedIn', 'Wellfound', 'Company Website', 'Referral', 'Cold Email', 'Other'],
      default: 'Other',
    },

    resumeUsed: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['Applied', 'Assessment', 'Interviewing', 'Rejected', 'Offer', 'Ghosted'],
      default: 'Applied',
    },

    referralContact: {
      type: String,
      trim: true,
    },

    dateApplied: {
      type: Date,
      default: Date.now,
    },

    followUpDate: {
      type: Date,
    },

    nextSteps: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt — used for "applied X days ago" logic
  }
);

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
