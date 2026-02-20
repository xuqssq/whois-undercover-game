import PlayerAvatar from './PlayerAvatar';

export default function PlayerCard({
  player,
  index,
  isHost,
  isSelf,
  isSpeaking,
  isVoteTarget,
  canVote,
  onVote,
  canKick,
  onKick,
  voteStatus,
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
        !player.alive
          ? 'opacity-50 bg-cream-300/50'
          : isSpeaking
            ? 'bg-primary-50 border-2 border-primary-500/50 animate-pulse-speaker'
            : isVoteTarget
              ? 'bg-amber-50 border-2 border-amber-500/50'
              : 'bg-white border-2 border-warm-100'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <PlayerAvatar
          name={player.name}
          index={index}
          alive={player.alive}
        />
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-medium ${player.alive ? 'text-warm-900' : 'text-warm-300 line-through'}`}
            >
              {player.name}
              {isSelf ? ' (你)' : ''}
            </span>
            {isHost && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[10px] font-medium">
                房主
              </span>
            )}
            {isSpeaking && (
              <span className="px-1.5 py-0.5 rounded-md bg-primary-100 text-primary-600 text-[10px] font-medium">
                发言中
              </span>
            )}
            {voteStatus === 'voted' && (
              <span className="px-1.5 py-0.5 rounded-md bg-sage-100 text-sage-600 text-[10px] font-medium">
                已投票
              </span>
            )}
            {voteStatus === 'pending' && (
              <span className="px-1.5 py-0.5 rounded-md bg-warm-100 text-warm-400 text-[10px] font-medium">
                投票中
              </span>
            )}
          </div>
          {!player.alive && (
            <span className="text-[10px] text-warm-300">已淘汰</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {canVote && (
          <button
            onClick={() => onVote(player.id)}
            disabled={isVoteTarget}
            className={`btn-lift px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isVoteTarget
                ? 'bg-amber-500 text-white'
                : 'bg-cream-200 text-warm-700 hover:bg-amber-100 hover:text-amber-600'
            }`}
          >
            {isVoteTarget ? '已投' : '投票'}
          </button>
        )}
        {canKick && (
          <button
            onClick={() => onKick(player.id)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition text-rose-400 hover:bg-rose-50 hover:text-rose-500"
          >
            踢出
          </button>
        )}
      </div>
    </div>
  );
}
