import { useEffect, useRef } from 'react';
import { ThreeScene } from '../three/ThreeScene';

export function useThreeScene(gameState) {
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById('three-canvas');
    if (!container || sceneRef.current) return;
    sceneRef.current = new ThreeScene();
    sceneRef.current.init(container);
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updatePlayers(gameState.players);
  }, [gameState.players]);

  useEffect(() => {
    sceneRef.current?.setPhase(gameState.phase, gameState.status);
  }, [gameState.phase, gameState.status]);

  useEffect(() => {
    if (gameState.phase === 'speaking') {
      sceneRef.current?.setSpeaker(gameState.currentSpeakerId);
    }
  }, [gameState.currentSpeakerId, gameState.phase]);

  useEffect(() => {
    if (gameState.phase === 'voting') {
      sceneRef.current?.setVoted(gameState.votedPlayerIds || []);
    }
  }, [gameState.votedPlayerIds, gameState.phase]);

  useEffect(() => {
    if (gameState.status === 'ended' && gameState.resultSnapshot) {
      sceneRef.current?.showResult(gameState.resultSnapshot.civilianWin);
    }
  }, [gameState.status]);
}
