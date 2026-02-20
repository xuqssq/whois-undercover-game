import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export default function HostControls() {
  const { state, api, dispatch } = useContext(GameContext);
  const isHost = state.playerId === state.hostId;
  if (!isHost) return null;

  const uc = state.undercoverCount || 1;
  const minPlayers = uc + 2;
  const isWaitingOrEnded =
    state.status === 'waiting' || state.status === 'ended';
  const canStart = state.players.length >= minPlayers && isWaitingOrEnded;
  const canReroll = isWaitingOrEnded;
  const canChangeSetting = state.status === 'waiting';

  async function handleStart() {
    try {
      if (state.status === 'ended')
        await api.restartGame(state.gameId, state.playerId);
      else await api.startGame(state.gameId, state.playerId, uc);
      await api.fetchWord(state.gameId, state.playerId);
    } catch (e) {
      dispatch({ type: 'ADD_TOAST', payload: e.message });
    }
  }

  async function handleReroll() {
    try {
      await api.rerollWords(state.gameId, state.playerId);
    } catch (e) {
      dispatch({ type: 'ADD_TOAST', payload: e.message });
    }
  }

  async function handleUcChange(val) {
    try {
      await api.updateSettings(state.gameId, state.playerId, {
        undercoverCount: val,
      });
    } catch (e) {
      dispatch({ type: 'ADD_TOAST', payload: e.message });
    }
  }

  return (
    <div className="flex items-center gap-2">
      {canChangeSetting && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-warm-500">卧底</span>
          <div className="flex rounded-lg border border-warm-100 overflow-hidden">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => handleUcChange(n)}
                className={`px-2.5 py-1 text-xs font-medium transition ${uc === n ? 'bg-primary-500 text-white' : 'bg-white text-warm-500 hover:bg-cream-200'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      {canReroll && (
        <button
          onClick={handleReroll}
          className="btn-lift rounded-xl border-2 border-warm-100 text-warm-500 hover:border-primary-500 hover:text-primary-500 px-4 py-2 text-sm font-medium transition"
        >
          更换词语
        </button>
      )}
      {isWaitingOrEnded && (
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn-lift rounded-xl bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 text-sm font-medium shadow-md shadow-primary-500/25 disabled:opacity-50 transition"
        >
          {state.status === 'ended'
            ? '再来一局'
            : `开始游戏${!canStart ? ` (需${minPlayers}人)` : ''}`}
        </button>
      )}
    </div>
  );
}
