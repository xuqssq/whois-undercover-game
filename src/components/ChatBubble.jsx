import PlayerAvatar from './PlayerAvatar';
import { fmtTime } from '../utils/constants';

export default function ChatBubble({ msg, isSelf, playerIndex }) {
  if (msg.playerId === 'system') {
    return (
      <div className="flex justify-center my-2 animate-bubble">
        <div className="bg-amber-50 border border-amber-500/20 rounded-full px-3 py-1 text-[11px] text-amber-600 max-w-[85%] text-center">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`flex gap-2 mb-2.5 animate-bubble ${isSelf ? 'flex-row-reverse' : ''}`}
    >
      <PlayerAvatar name={msg.name} index={playerIndex} size="sm" />
      <div
        className={`max-w-[70%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <div
          className={`flex items-center gap-1.5 mb-0.5 ${isSelf ? 'flex-row-reverse' : ''}`}
        >
          <span className="text-[11px] font-medium text-warm-700">
            {msg.name}
          </span>
          <span className="text-[10px] text-warm-300">
            {fmtTime(msg.ts)}
          </span>
        </div>
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isSelf
              ? 'bg-primary-500 text-white rounded-tr-sm'
              : 'bg-cream-200 text-warm-900 rounded-tl-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}
