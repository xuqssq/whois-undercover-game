import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';
import PhaseIndicator from './PhaseIndicator';

export default function GameHeader() {
  const { state, dispatch, api } = useContext(GameContext);
  const { isWorkMode: w } = useWorkMode();
  const [copied, setCopied] = useState(false);

  function copyRoomId() {
    const text = state.gameId;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          dispatch({ type: 'ADD_TOAST', payload: w ? '项目编号已复制' : '房间号已复制' });
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      dispatch({ type: 'ADD_TOAST', payload: w ? '项目编号已复制' : '房间号已复制' });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleLeave() {
    try {
      await api.leaveGame(state.gameId, state.playerId);
      dispatch({ type: 'LEAVE_GAME' });
    } catch (e) {
      dispatch({ type: 'ADD_TOAST', payload: e.message });
    }
  }

  const hostPlayer = state.players.find((p) => p.id === state.hostId);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 cursor-pointer group"
            onClick={copyRoomId}
          >
            <span className="text-xs text-warm-500">{w ? '项目' : '房间'}</span>
            <span className="font-mono text-sm font-medium text-warm-900 group-hover:text-primary-500 transition">
              {state.gameId}
            </span>
            <svg
              className="w-3.5 h-3.5 text-warm-300 group-hover:text-primary-500 transition"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </div>
          <div className="h-4 w-px bg-warm-100" />
          <span className="text-xs text-warm-500">
            {w ? 'Sprint ' : '第 '}
            <span className="font-medium text-warm-700">{state.round}</span>
            {w ? '' : ' 轮'}
          </span>
          {hostPlayer && (
            <>
              <div className="h-4 w-px bg-warm-100" />
              <span className="text-xs text-warm-500">
                {w ? '负责人' : '房主'}:{' '}
                <span className="font-medium text-warm-700">
                  {hostPlayer.name}
                </span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <PhaseIndicator phase={state.phase} status={state.status} />
          <button
            onClick={handleLeave}
            className="text-xs text-warm-300 hover:text-rose-500 transition ml-1"
          >
            退出
          </button>
        </div>
      </div>
    </div>
  );
}
