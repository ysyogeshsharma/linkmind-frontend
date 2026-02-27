'use client';
import React from 'react';
import { motion } from 'framer-motion';

const availableTopics = [
  'Web Development',
  'Career Growth',
  'AI & Machine Learning',
  'Productivity',
  'Design Thinking',
  'Remote Work',
  'Startups',
  'Leadership',
  'Personal Branding',
];

export default function TopicSelector({ value = [], onChange }) {
  const selected = Array.isArray(value) ? value : [];

  function toggleTopic(topic) {
    const newSelection = selected.includes(topic)
      ? selected.filter((t) => t !== topic)
      : [...selected, topic];
    onChange?.(newSelection);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        Select Topics
      </h3>
      <div className="flex flex-wrap gap-3">
        {availableTopics.map((topic) => {
          const isSelected = selected.includes(topic);
          return (
            <motion.button
              key={topic}
              onClick={() => toggleTopic(topic)}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {topic}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
