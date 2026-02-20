import { useReducer, useMemo } from 'react';
import { GameContext, initialState, reducer } from './context/GameContext';
import { useWebSocket } from './hooks/useWebSocket';
import { useApi } from './hooks/useApi';
import { useThreeScene } from './hooks/useThreeScene';
import LobbyView from './components/LobbyView';
import GameView from './components/GameView';
import ConnectionBadge from './components/ConnectionBadge';
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
    <GameContext.Provider value={ctx}>
      {state.screen === 'lobby' ? <LobbyView /> : <GameView />}
      <ConnectionBadge connected={state.connected} />
      <Toast />
    </GameContext.Provider>
  );
}
