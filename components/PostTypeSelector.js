'use client';
import { motion } from 'framer-motion';

export default function PostTypeSelector({ value = 'regular', onChange }) {
  const postTypes = [
    {
      id: 'regular',
      label: 'Regular Post',
      description: 'Share your thoughts and ideas',
      icon: '💬',
    },
    {
      id: 'job',
      label: 'Job Posting',
      description: 'Post a job opportunity',
      icon: '💼',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Post Type
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {postTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => onChange(type.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 transition-all ${
              value === type.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="text-sm font-medium text-slate-800">
              {type.label}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {type.description}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
