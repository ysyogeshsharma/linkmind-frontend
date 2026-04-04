'use client';
import { motion } from 'framer-motion';

export default function JobDetailsForm({ jobDetails = {}, onChange, visible = false }) {
  const handleChange = (field, value) => {
    onChange({
      ...jobDetails,
      [field]: value,
    });
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Job Details
      </h3>
      
      <div className="space-y-4">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            value={jobDetails.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Senior React Developer"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={jobDetails.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="e.g., Tech Company Inc."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            value={jobDetails.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., San Francisco, CA or Remote"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Type *
          </label>
          <select
            value={jobDetails.jobType || ''}
            onChange={(e) => handleChange('jobType', e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">Select job type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Salary Range (Optional)
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={jobDetails.salaryMin || ''}
                onChange={(e) => handleChange('salaryMin', e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Min"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <span className="flex items-center text-slate-500">-</span>
            <div className="flex-1">
              <input
                type="number"
                value={jobDetails.salaryMax || ''}
                onChange={(e) => handleChange('salaryMax', e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Max"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Currency */}
        {(jobDetails.salaryMin || jobDetails.salaryMax) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={jobDetails.currency || 'USD'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        )}

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Description
          </label>
          <textarea
            value={jobDetails.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the job responsibilities, requirements, and benefits..."
            rows={4}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
