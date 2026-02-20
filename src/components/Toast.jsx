import { useContext, useEffect } from 'react';
import { GameContext } from '../context/GameContext';

export default function Toast() {
  const { state, dispatch } = useContext(GameContext);

  useEffect(() => {
    state.toasts.forEach((t) => {
      if (!t._timer) {
        t._timer = true;
        setTimeout(
          () => dispatch({ type: 'REMOVE_TOAST', payload: t.id }),
          3000,
        );
      }
    });
  }, [state.toasts]);

  if (!state.toasts.length) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {state.toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in bg-warm-900 text-white px-4 py-2 rounded-xl text-sm shadow-lg"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
