import { useState, useEffect, useCallback } from 'react';
import api from '../api/jobApi';

/**
 * Custom hook to fetch job application statistics from GET /api/jobs/stats
 */
export function useJobStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/jobs/stats');
      setStats(response.data?.data ?? null);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK'
          ? 'Unable to connect to the database. Make sure backend server is running on port 5000.'
          : 'Failed to fetch job stats.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Custom hook to fetch and manage job applications from GET /api/jobs
 * @param {Object} options Filter and sort options
 */
export function useJobs({ status = 'All', source = 'All Sources', sort = 'newest' } = {}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status && status !== 'All') params.status = status;
      if (source && source !== 'All Sources') params.source = source;
      if (sort) params.sort = sort;

      const response = await api.get('/jobs', { params });
      setJobs(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK'
          ? 'Unable to connect to the database. Make sure backend server is running on port 5000.'
          : 'Failed to load job applications.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [status, source, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /**
   * Optimistically / seamlessly updates status via PUT /api/jobs/:id
   */
  const updateJobStatus = useCallback(async (id, newStatus) => {
    try {
      const response = await api.put(`/jobs/${id}`, { status: newStatus });
      const updated = response.data?.data;
      if (updated) {
        setJobs((prev) => prev.map((j) => (j._id === id ? updated : j)));
      }
      return { success: true, data: updated };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update status';
      return { success: false, error: errMsg };
    }
  }, []);

  /**
   * Adds a new job application via POST /api/jobs
   */
  const addJob = useCallback(async (jobData) => {
    try {
      const payload = { ...jobData };

      // Normalise aliases
      if (payload.company && !payload.companyName) payload.companyName = payload.company;
      if (payload.title && !payload.jobTitle) payload.jobTitle = payload.title;

      // Clean empty optional strings
      ['jobLink', 'referralContact', 'resumeUsed', 'notes', 'followUpDate'].forEach((k) => {
        if (!payload[k] || (typeof payload[k] === 'string' && !payload[k].trim())) {
          delete payload[k];
        }
      });

      const response = await api.post('/jobs', payload);
      const created = response.data?.data;
      if (created) {
        setJobs((prev) => [created, ...prev]);
      }
      return { success: true, data: created };
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Network error: Cannot reach the backend API server. Is it running on port 5000?'
          : err.message || 'Failed to add job application.');
      return { success: false, error: errMsg };
    }
  }, []);

  /**
   * Deletes an application via DELETE /api/jobs/:id
   */
  const deleteJob = useCallback(async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to delete job';
      return { success: false, error: errMsg };
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    updateJobStatus,
    addJob,
    deleteJob,
    setJobs,
  };
}
