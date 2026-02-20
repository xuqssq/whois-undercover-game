import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';
import PlayerCard from './PlayerCard';

export default function PlayersPanel() {
  const { state, ws, api, dispatch } = useContext(GameContext);
  const { isWorkMode: w } = useWorkMode();
  const me = state.players.find((p) => p.id === state.playerId);
  const amAlive = me && me.alive;
  const isVoting = state.status === 'playing' && state.phase === 'voting';
  const isHost = state.playerId === state.hostId;

  function handleVote(targetId) {
    if (state.myVoteTargetId) return;
    ws.send({ type: 'vote', targetId });
    dispatch({ type: 'VOTE_CAST', payload: targetId });
  }

  async function handleKick(targetId) {
    if (!confirm(w ? '确定要移出该成员吗？' : '确定要踢出该玩家吗？')) return;
    try {
      await api.kickPlayer(state.gameId, state.playerId, targetId);
    } catch (e) {
      dispatch({ type: 'ADD_TOAST', payload: e.message });
    }
  }

  const votedSet = new Set(state.votedPlayerIds);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-4 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
          {w ? '团队成员' : '玩家'} ({state.players.length})
        </h3>
        {isVoting && (
          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {w ? '评审阶段' : '投票阶段'}
          </span>
        )}
        {!isVoting && state.status !== 'playing' && (
          <span className="text-[10px] text-warm-300 bg-cream-200 px-2 py-0.5 rounded-full">
            {w ? '评审员' : '卧底'}{state.undercoverCount}{w ? '人 · 至少' : '人 · 至少'}
            {(state.undercoverCount || 1) + 2}人
          </span>
        )}
      </div>
      <div className="space-y-2 scroll-thin overflow-y-auto flex-1 min-h-0">
        {state.players.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            index={i}
            isHost={p.id === state.hostId}
            isSelf={p.id === state.playerId}
            isSpeaking={
              state.currentSpeakerId === p.id && state.phase === 'speaking'
            }
            isVoteTarget={state.myVoteTargetId === p.id}
            canVote={
              isVoting &&
              amAlive &&
              p.alive &&
              p.id !== state.playerId &&
              !state.myVoteTargetId
            }
            onVote={handleVote}
            canKick={
              isHost && p.id !== state.playerId && state.status !== 'ended'
            }
            onKick={handleKick}
            voteStatus={
              isVoting && p.alive
                ? votedSet.has(p.id)
                  ? 'voted'
                  : 'pending'
                : null
            }
          />
        ))}
        {!state.players.length && (
          <div className="text-xs text-warm-300 text-center py-4">
            {w ? '等待成员加入...' : '等待玩家加入...'}
          </div>
        )}
      </div>
    </div>
  );
}
