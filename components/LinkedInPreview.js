'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from '../app/SessionWrapper';

const LINKEDIN_BLUE = '#0a66c2';
const LINKEDIN_DARK = '#004182';

export default function LinkedInPreview({ content = '', imageUrl = '' }) {
  const { data: session } = useSession();
  const name = session?.user?.name || 'Your Name';
  const title = 'Product Manager';

  const formatContent = (text) => {
    if (!text || (typeof text === 'string' && text.trim() === '')) {
      return (
        <span className="italic text-slate-400">No content yet...</span>
      );
    }
    const parts = text.split(/(#[\w-]+|@[\w-]+|https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith('#') || part.startsWith('@')) {
        return (
          <span
            key={index}
            className="cursor-pointer font-medium hover:underline"
            style={{ color: LINKEDIN_BLUE }}
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all hover:underline"
            style={{ color: LINKEDIN_BLUE }}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="p-4 pb-2">
        <div className="mb-3 flex gap-3">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
            style={{
              background: `linear-gradient(to bottom right, ${LINKEDIN_BLUE}, ${LINKEDIN_DARK})`,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1">
              <span
                className="cursor-pointer text-sm font-semibold hover:underline"
                style={{ color: 'rgba(0,0,0,0.9)' }}
              >
                {name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500">1st</span>
            </div>
            <div className="text-xs text-slate-500">{title}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>1h</span>
              <span>•</span>
              <span className="cursor-pointer hover:underline">Follow</span>
            </div>
          </div>
          <button
            type="button"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        <div
          className="mb-3 whitespace-pre-wrap break-words text-sm leading-relaxed"
          style={{ color: 'rgba(0,0,0,0.9)' }}
        >
          {formatContent(content)}
        </div>

        {imageUrl && (
          <div className="-mx-4 mb-3 mt-3">
            <img
              src={imageUrl}
              alt="Post"
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {content && (
          <div className="flex items-center justify-between border-t border-slate-100 py-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="cursor-pointer hover:underline">123 reactions</span>
            </div>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:underline">5 comments</span>
              <span className="cursor-pointer hover:underline">2 shares</span>
            </div>
          </div>
        )}
      </div>

      {content && (
        <div className="flex border-t border-slate-100">
          {['Like', 'Comment', 'Share', 'Send'].map((label) => (
            <button
              key={label}
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
