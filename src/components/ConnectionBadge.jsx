import { useWorkMode } from '../context/WorkModeContext';

export default function ConnectionBadge({ connected }) {
  const { isWorkMode } = useWorkMode();

  if (isWorkMode) return null;

  return (
    <div
      className={`fixed top-3 right-3 z-40 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        connected
          ? 'bg-sage-50 border-sage-500/40 text-sage-600'
          : 'bg-rose-50 border-rose-500/40 text-rose-500'
      }`}
    >
      {connected ? '已连接' : '未连接'}
    </div>
  );
}
