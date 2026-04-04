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
  const [customTopic, setCustomTopic] = React.useState('');
  const selected = Array.isArray(value) ? value : [];

  function toggleTopic(topic) {
    const newSelection = selected.includes(topic)
      ? selected.filter((t) => t !== topic)
      : [...selected, topic];
    onChange?.(newSelection);
  }

  function addCustomTopic() {
    if (customTopic.trim() && !selected.includes(customTopic.trim())) {
      const newSelection = [...selected, customTopic.trim()];
      onChange?.(newSelection);
      setCustomTopic('');
    }
  }

  function removeTopic(topic) {
    const newSelection = selected.filter((t) => t !== topic);
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
      <div className="flex flex-wrap gap-3 mb-4">
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

      {/* Selected custom topics */}
      {selected.length > 0 && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2">Selected Topics:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((topic) => (
              <motion.div
                key={topic}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
              >
                {topic}
                <button
                  onClick={() => removeTopic(topic)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Custom topic input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
          placeholder="Add custom topic..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <button
          onClick={addCustomTopic}
          disabled={!customTopic.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}
