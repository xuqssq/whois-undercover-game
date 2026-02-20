import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(gameId, playerId, dispatch) {
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!gameId || !playerId) return;
    function connect() {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(
        `${proto}://${location.host}/ws?gameId=${encodeURIComponent(gameId)}&playerId=${encodeURIComponent(playerId)}`,
      );
      wsRef.current = ws;
      ws.onopen = () => dispatch({ type: 'WS_CONNECTED' });
      ws.onclose = () => {
        dispatch({ type: 'WS_DISCONNECTED' });
        timerRef.current = setTimeout(connect, 2000);
      };
      ws.onerror = () => {};
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'state')
            dispatch({ type: 'GAME_STATE_UPDATE', payload: msg.data });
          else if (msg.type === 'chat')
            dispatch({ type: 'CHAT_MESSAGE', payload: msg.data });
          else if (msg.type === 'kicked') {
            dispatch({ type: 'ADD_TOAST', payload: '你已被房主踢出房间' });
            dispatch({ type: 'LEAVE_GAME' });
          }
        } catch (e) {
          console.error(e);
        }
      };
    }
    connect();
    return () => {
      clearTimeout(timerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [gameId, playerId]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(data));
  }, []);

  return { send };
}
