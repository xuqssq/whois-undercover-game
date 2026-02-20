import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export default function WordCard() {
  const { state } = useContext(GameContext);
  if (!state.word) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-warm-500">你的词语</span>
      <span className="font-serif text-lg font-bold text-warm-900 tracking-wider">
        {state.word}
      </span>
    </div>
  );
}
