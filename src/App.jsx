import { useReducer, useMemo } from 'react';
import { GameContext, initialState, reducer } from './context/GameContext';
import { WorkModeProvider } from './context/WorkModeContext';
import { useWebSocket } from './hooks/useWebSocket';
import { useApi } from './hooks/useApi';
import { useThreeScene } from './hooks/useThreeScene';
import WorkModeShell from './components/WorkModeShell';
import LobbyView from './components/LobbyView';
import GameView from './components/GameView';
import Toast from './components/Toast';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const ws = useWebSocket(state.gameId, state.playerId, dispatch);
  const api = useApi(dispatch);
  useThreeScene(state);
  const ctx = useMemo(
    () => ({ state, dispatch, ws, api }),
    [state, ws, api],
  );
  return (
    <WorkModeProvider>
      <GameContext.Provider value={ctx}>
        <WorkModeShell>
          {state.screen === 'lobby' ? <LobbyView /> : <GameView />}
        </WorkModeShell>
        <Toast />
      </GameContext.Provider>
    </WorkModeProvider>
  );
}
