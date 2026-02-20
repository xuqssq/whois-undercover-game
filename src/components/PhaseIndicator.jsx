import { Fragment } from 'react';
import { useWorkMode } from '../context/WorkModeContext';

export default function PhaseIndicator({ phase, status }) {
  const { isWorkMode: w } = useWorkMode();

  const steps = w
    ? [
        { key: 'waiting', label: '规划' },
        { key: 'speaking', label: '汇报' },
        { key: 'voting', label: '评审' },
      ]
    : [
        { key: 'waiting', label: '等待' },
        { key: 'speaking', label: '发言' },
        { key: 'voting', label: '投票' },
      ];

  const currentIdx =
    status === 'ended' ? 3 : steps.findIndex((s) => s.key === phase);

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <Fragment key={s.key}>
          {i > 0 && (
            <div
              className={`w-5 h-0.5 rounded ${i <= currentIdx ? 'bg-primary-500' : 'bg-warm-100'}`}
            />
          )}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
              i === currentIdx
                ? 'bg-primary-500 text-white'
                : i < currentIdx
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-cream-300 text-warm-300'
            }`}
          >
            {i === currentIdx && status === 'playing' && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-white"
                style={{ animation: 'dotPulse 1.5s ease-in-out infinite' }}
              />
            )}
            {s.label}
          </div>
        </Fragment>
      ))}
      {status === 'ended' && (
        <>
          <div className="w-5 h-0.5 rounded bg-rose-500" />
          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500 text-white">
            {w ? '结项' : '结束'}
          </div>
        </>
      )}
    </div>
  );
}
