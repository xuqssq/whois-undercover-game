import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';
import PlayerAvatar from './PlayerAvatar';

export default function GameResult() {
  const { state, dispatch } = useContext(GameContext);
  const { isWorkMode: w } = useWorkMode();
  if (!state.showResult || !state.resultSnapshot) return null;
  const snap = state.resultSnapshot;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/40 backdrop-blur-sm animate-fade"
      onClick={() => dispatch({ type: 'HIDE_RESULT' })}
    >
      <div
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 w-full max-w-sm p-6 animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          {!w && (
            <div className="text-4xl mb-2">
              {snap.civilianWin ? '🎉' : '🕵️'}
            </div>
          )}
          <h2 className={`${w ? 'text-lg' : 'font-serif text-2xl'} font-bold text-warm-900`}>
            {w
              ? (snap.civilianWin ? '评审通过 — 项目完成' : '评审未通过 — 需返工')
              : (snap.civilianWin ? '平民获胜!' : '卧底获胜!')}
          </h2>
          {snap.myRole && (
            <p className="text-sm text-warm-500 mt-1">
              {w ? '你的角色' : '你的身份'}: {snap.myRole === 'undercover' ? (w ? '评审员' : '卧底') : (w ? '执行者' : '平民')}
            </p>
          )}
        </div>
        <div className="flex gap-3 mb-5">
          <div className="flex-1 rounded-xl bg-sage-50 border border-sage-500/30 p-3 text-center">
            <div className="text-[10px] text-sage-600 mb-1">{w ? '主题 A' : '平民词'}</div>
            <div className={`${w ? 'text-base' : 'font-serif text-lg'} font-bold text-warm-900`}>
              {snap.wordCommon || '?'}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-rose-50 border border-rose-500/30 p-3 text-center">
            <div className="text-[10px] text-rose-500 mb-1">{w ? '主题 B' : '卧底词'}</div>
            <div className={`${w ? 'text-base' : 'font-serif text-lg'} font-bold text-warm-900`}>
              {snap.wordUndercover || '?'}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mb-5">
          {snap.players.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <PlayerAvatar
                name={p.name}
                index={i}
                size="sm"
                alive={p.alive}
              />
              <span
                className={`flex-1 ${p.alive ? 'text-warm-900' : 'text-warm-300 line-through'}`}
              >
                {p.name}
              </span>
              {p.role === 'undercover' ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200">
                  {w ? '评审员' : '卧底'} · {snap.wordUndercover}
                </span>
              ) : p.role === 'civilian' ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sage-50 text-sage-600 border border-sage-200">
                  {w ? '执行者' : '平民'} · {snap.wordCommon}
                </span>
              ) : (
                <span className="text-[10px] text-warm-300">未知</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch({ type: 'HIDE_RESULT' })}
            className="btn-lift rounded-xl border-2 border-warm-100 text-warm-500 hover:border-warm-300 px-5 py-2.5 text-sm font-medium transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
