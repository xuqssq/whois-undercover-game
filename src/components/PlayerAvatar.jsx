import { getAvatarColor } from '../utils/constants';

export default function PlayerAvatar({ name, index, size = 'md', alive = true }) {
  const color = getAvatarColor(index);
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${!alive ? 'opacity-40 grayscale' : ''}`}
      style={{ backgroundColor: color }}
    >
      {(name || '?')[0]}
    </div>
  );
}
