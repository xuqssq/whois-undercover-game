import { useCallback, useMemo } from 'react';

export function useApi(dispatch) {
  const toast = useCallback(
    (msg) => dispatch({ type: 'ADD_TOAST', payload: msg }),
    [dispatch],
  );

  return useMemo(
    () => ({
      async listRooms() {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '获取房间列表失败');
        return data;
      },
      async createGame() {
        const res = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '创建房间失败');
        return data;
      },
      async joinGame(gameId, name) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/join`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '加入房间失败');
        return data;
      },
      async leaveGame(gameId, playerId) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/leave`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '离开房间失败');
        return data;
      },
      async startGame(gameId, playerId, undercoverCount) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/start`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ undercoverCount, playerId }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '开始游戏失败');
        return data;
      },
      async restartGame(gameId, playerId) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/restart`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ undercoverCount: 1, playerId }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '重新开始失败');
        return data;
      },
      async rerollWords(gameId, playerId) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/reroll-words`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '更换词语失败');
        toast('词语已更换');
        return data;
      },
      async updateSettings(gameId, playerId, settings) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/settings`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, ...settings }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '修改设置失败');
        return data;
      },
      async fetchWord(gameId, playerId) {
        try {
          const res = await fetch(
            `/api/games/${encodeURIComponent(gameId)}/word?playerId=${encodeURIComponent(playerId)}`,
          );
          const data = await res.json();
          if (res.ok) dispatch({ type: 'WORD_LOADED', payload: data });
        } catch (e) {
          console.warn(e);
        }
      },
      async kickPlayer(gameId, playerId, targetPlayerId) {
        const res = await fetch(
          `/api/games/${encodeURIComponent(gameId)}/kick`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, targetPlayerId }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '踢出玩家失败');
        return data;
      },
    }),
    [dispatch, toast],
  );
}
