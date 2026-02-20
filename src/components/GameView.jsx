import { useContext, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';
import GameHeader from './GameHeader';
import WordCard from './WordCard';
import HostControls from './HostControls';
import PlayersPanel from './PlayersPanel';
import ChatPanel from './ChatPanel';
import GameResult from './GameResult';

export default function GameView() {
  const { state, api } = useContext(GameContext);
  const { isWorkMode } = useWorkMode();

  useEffect(() => {
    if (state.gameId && state.playerId)
      api.fetchWord(state.gameId, state.playerId);
  }, [
    state.gameId,
    state.playerId,
    state.status,
    state.round,
    state.wordVersion,
  ]);

  return (
    <div className={`${isWorkMode ? 'h-full' : 'h-screen'} flex flex-col`}>
      <div className="max-w-4xl w-full mx-auto p-3 md:p-4 flex flex-col gap-3 animate-fade flex-1 min-h-0">
        <GameHeader />
        {(state.word || state.playerId === state.hostId) && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 px-4 py-2.5 flex items-center justify-between gap-3">
            <WordCard />
            <HostControls />
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] flex-1 min-h-0">
          <PlayersPanel />
          <ChatPanel />
        </div>
      </div>
      <GameResult />
    </div>
  );
}
