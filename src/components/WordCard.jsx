import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';

export default function WordCard() {
  const { state } = useContext(GameContext);
  const { isWorkMode: w } = useWorkMode();
  if (!state.word) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-warm-500">{w ? '当前任务' : '你的词语'}</span>
      <span className={`${w ? 'text-base' : 'font-serif text-lg'} font-bold text-warm-900 tracking-wider`}>
        {state.word}
      </span>
    </div>
  );
}
