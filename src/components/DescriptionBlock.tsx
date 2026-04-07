'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function DescriptionBlock({ text }: { text: string }) {
  const [clamped, setClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      // Check if text overflows 10 lines (line-clamp-[10])
      setClamped(el.scrollHeight > el.clientHeight + 2);
    }
  }, [text]);

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Aircraft</h2>
      <p
        ref={ref}
        className="text-gray-700 leading-relaxed mb-2 whitespace-pre-line"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 10,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
      {clamped && (
        <button
          onClick={() => setExpanded(true)}
          className="text-amber-500 hover:text-amber-600 font-medium text-sm mb-6"
        >
          Read more...
        </button>
      )}
      {!clamped && <div className="mb-6" />}

      {/* Full description modal */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold">About This Aircraft</h2>
              <button onClick={() => setExpanded(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setExpanded(false)}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
