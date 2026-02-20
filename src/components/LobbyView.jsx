import { useContext, useState, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';

const STATUS_MAP = { waiting: '等待中', playing: '进行中' };

function RoomListModal({ open, onClose, rooms, loading, onRefresh, onJoin, isWorkMode: w }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden animate-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100">
          <h2 className="text-sm font-semibold text-warm-800">
            {w ? '项目列表' : '房间列表'}
            {rooms && <span className="ml-1.5 text-warm-400 font-normal">({rooms.length})</span>}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-xs text-primary-500 hover:text-primary-600 transition disabled:opacity-50"
            >
              {loading ? '刷新中...' : '刷新'}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-warm-400 hover:text-warm-600 hover:bg-warm-50 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-[30vh] max-h-[60vh] overflow-y-auto">
          {!rooms || loading ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex items-center justify-center text-warm-400 mb-4">
                <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="50 20" strokeLinecap="round" className="text-warm-400" />
                </svg>
              </div>
              <div className="text-sm text-warm-400">加载中...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex items-center justify-center text-warm-400 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div className="text-warm-300 text-sm">{w ? '暂无可加入的项目' : '暂无可加入的房间'}</div>
              <div className="text-warm-200 text-xs mt-1">{w ? '返回创建一个新项目吧' : '返回创建一个新房间吧'}</div>
            </div>
          ) : (
            <div className="divide-y divide-warm-100/60">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-warm-50/50 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-warm-700">{room.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        room.status === 'waiting'
                          ? 'bg-green-50 border-green-200 text-green-600'
                          : 'bg-amber-50 border-amber-200 text-amber-600'
                      }`}>
                        {STATUS_MAP[room.status] || room.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-warm-400 mt-0.5 truncate">
                      {room.playerNames.length > 0 ? room.playerNames.join('、') : '暂无玩家'}
                      {' · '}{room.playerCount}人
                    </div>
                  </div>
                  <button
                    onClick={() => onJoin(room.id)}
                    className="shrink-0 ml-3 text-xs px-3.5 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition"
                  >
                    加入
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const w = isWorkMode;

  async function handleCreate() {
    if (!nickname.trim()) {
      setError(w ? '请输入姓名' : '请输入昵称');
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

  async function handleJoin(id) {
    const gameId = id || joinId.trim();
    if (!nickname.trim()) {
      setError(w ? '请输入姓名' : '请输入昵称');
      return;
    }
    if (!gameId) {
      setError(w ? '请输入项目编号' : '请输入房间号');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.joinGame(gameId, nickname.trim());
      dispatch({ type: 'SET_NICKNAME', payload: nickname.trim() });
      localStorage.setItem('wis_nickname', nickname.trim());
      dispatch({ type: 'JOIN_SUCCESS', payload: data });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function fetchRooms() {
    setRoomsLoading(true);
    try {
      const list = await api.listRooms();
      setRooms(list);
    } catch (e) {
      setError(e.message);
    }
    setRoomsLoading(false);
  }

  function handleOpenModal() {
    setModalOpen(true);
    fetchRooms();
  }

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
              {loading ? '创建中...' : (w ? '创建新项目' : '创建新房间')}
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
                  onClick={() => handleJoin()}
                  disabled={loading}
                  className="btn-lift rounded-xl border-2 border-primary-500 text-primary-500 hover:bg-primary-50 font-medium px-4 py-2.5 text-sm disabled:opacity-50 transition"
                >
                  加入
                </button>
              </div>
            </div>

            <button
              onClick={handleOpenModal}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 text-sm shadow-md shadow-primary-500/25 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {w ? '浏览已有项目' : '浏览房间列表'}
            </button>

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

      <RoomListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rooms={rooms}
        loading={roomsLoading}
        onRefresh={fetchRooms}
        onJoin={(id) => { setModalOpen(false); handleJoin(id); }}
        isWorkMode={w}
      />
    </div>
  );
}
