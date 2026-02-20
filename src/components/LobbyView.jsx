import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';

export default function LobbyView() {
  const { state, dispatch, api } = useContext(GameContext);
  const { isWorkMode } = useWorkMode();
  const [nickname, setNickname] = useState(() => {
    return (
      localStorage.getItem('wis_nickname') ||
      state.nickname ||
      '玩家-' + Math.random().toString(36).slice(2, 6)
    );
  });
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!nickname.trim()) {
      setError(isWorkMode ? '请输入姓名' : '请输入昵称');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.createGame();
      const joinData = await api.joinGame(data.gameId, nickname.trim());
      dispatch({ type: 'SET_NICKNAME', payload: nickname.trim() });
      localStorage.setItem('wis_nickname', nickname.trim());
      dispatch({ type: 'JOIN_SUCCESS', payload: joinData });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!nickname.trim()) {
      setError(isWorkMode ? '请输入姓名' : '请输入昵称');
      return;
    }
    if (!joinId.trim()) {
      setError(isWorkMode ? '请输入项目编号' : '请输入房间号');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.joinGame(joinId.trim(), nickname.trim());
      dispatch({ type: 'SET_NICKNAME', payload: nickname.trim() });
      localStorage.setItem('wis_nickname', nickname.trim());
      dispatch({ type: 'JOIN_SUCCESS', payload: data });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  const w = isWorkMode;

  return (
    <div className={`${w ? 'min-h-full' : 'min-h-screen'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-sm animate-fade">
        <div className="text-center mb-8">
          {!w && (
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-3xl">🎭</span>
            </div>
          )}
          <h1 className={`${w ? 'text-xl' : 'font-serif text-3xl'} font-bold text-warm-900 mb-2`}>
            {w ? '加入项目协作' : '谁是卧底'}
          </h1>
          <p className={`text-sm ${w ? 'text-warm-500' : 'text-white'}`}>
            {w ? '输入项目编号加入已有项目，或创建新项目' : '随机词语 · 轮流发言 · 在线投票'}
          </p>
        </div>
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">
                {w ? '你的姓名' : '你的昵称'}
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-warm-100 bg-cream-50 px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                placeholder={w ? '输入姓名' : '输入昵称'}
                maxLength={20}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full btn-lift rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 text-sm shadow-md shadow-primary-500/25 disabled:opacity-50 transition"
            >
              {loading ? (w ? '创建中...' : '创建中...') : (w ? '创建新项目' : '创建新房间')}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-warm-100"></div>
              <span className="text-xs text-warm-300">或</span>
              <div className="flex-1 h-px bg-warm-100"></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">
                {w ? '加入已有项目' : '加入已有房间'}
              </label>
              <div className="flex gap-2">
                <input
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="flex-1 rounded-xl border border-warm-100 bg-cream-50 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
                  placeholder={w ? '输入项目编号' : '输入房间号'}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="btn-lift rounded-xl border-2 border-primary-500 text-primary-500 hover:bg-primary-50 font-medium px-4 py-2.5 text-sm disabled:opacity-50 transition"
                >
                  加入
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-500/30 px-3 py-2 text-xs text-rose-500">
                {error}
              </div>
            )}
          </div>
        </div>
        <p className={`text-center text-xs mt-4 ${w ? 'text-warm-300' : 'text-white'}`}>
          {w ? '创建项目后分享编号给同事即可开始协作' : '创建房间后分享房间号给好友即可开始游戏'}
        </p>
      </div>
    </div>
  );
}
