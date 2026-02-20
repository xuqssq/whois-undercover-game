import { useContext, useState, useMemo } from 'react';
import { GameContext } from '../context/GameContext';
import { useWorkMode } from '../context/WorkModeContext';
import { useAutoScroll } from '../hooks/useAutoScroll';
import ChatBubble from './ChatBubble';

export default function ChatPanel() {
  const { state, ws } = useContext(GameContext);
  const { isWorkMode: w } = useWorkMode();
  const [text, setText] = useState('');
  const messages = useMemo(
    () => (state.chat || []).slice().sort((a, b) => a.ts - b.ts),
    [state.chat],
  );
  const chatRef = useAutoScroll(messages);

  const me = state.players.find((p) => p.id === state.playerId);
  const amDead = me && !me.alive && state.status === 'playing';
  const isSpeakingPhase =
    state.status === 'playing' && state.phase === 'speaking';
  const isMyTurn =
    isSpeakingPhase && state.currentSpeakerId === state.playerId;
  const disableInput = amDead;
  const disableSend =
    amDead || (isSpeakingPhase && state.currentSpeakerId && !isMyTurn);

  function getPlaceholder() {
    if (amDead) return w ? '你已离线，无法发言' : '你已出局，无法发言';
    if (isMyTurn) return w ? '输入工作汇报...（发送后结束汇报）' : '描述你的词语...（发送后自动结束发言）';
    if (isSpeakingPhase) return w ? '等待其他成员汇报...' : '等待其他玩家发言...';
    if (state.phase === 'voting') return w ? '讨论评审意见...' : '自由讨论...';
    return w ? '发送消息...' : '发送消息...';
  }

  function handleSend() {
    if (!text.trim() || disableSend) return;
    ws.send({ type: 'chat', text: text.trim() });
    setText('');
  }

  const playerIndexMap = useMemo(() => {
    const map = {};
    state.players.forEach((p, i) => {
      map[p.id] = i;
    });
    return map;
  }, [state.players]);

  const currentSpeaker = state.players.find(
    (p) => p.id === state.currentSpeakerId,
  );
  const turnHint = isMyTurn
    ? (w ? '轮到你汇报了!' : '轮到你发言了!')
    : isSpeakingPhase && currentSpeaker
      ? (w ? `等待 ${currentSpeaker.name} 汇报...` : `等待 ${currentSpeaker.name} 发言...`)
      : state.phase === 'voting'
        ? (w ? '评审阶段，请在左侧选择评审' : '投票阶段，请在左侧选择投票')
        : null;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-4 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-warm-500 uppercase tracking-wider">
          {w ? '工作沟通' : '聊天'}
        </h3>
        {turnHint && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              isMyTurn
                ? 'bg-primary-100 text-primary-600 font-medium'
                : 'bg-cream-200 text-warm-500'
            }`}
          >
            {turnHint}
          </span>
        )}
      </div>
      <div
        ref={chatRef}
        className="scroll-thin flex-1 min-h-0 overflow-y-auto mb-3 px-1"
      >
        {messages.length === 0 && (
          <div className="text-xs text-warm-300 text-center py-8">
            {w ? '暂无消息' : '暂无消息'}
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble
            key={m.id || i}
            msg={m}
            isSelf={m.playerId === state.playerId}
            playerIndex={playerIndexMap[m.playerId] || 0}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={disableInput}
          placeholder={getPlaceholder()}
          className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
            disableInput
              ? 'bg-cream-300/50 border-warm-100 text-warm-300 cursor-not-allowed'
              : isMyTurn
                ? 'bg-white border-primary-500 ring-2 ring-primary-500/20'
                : 'bg-cream-50 border-warm-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          }`}
          maxLength={200}
        />
        <button
          onClick={handleSend}
          disabled={disableSend || !text.trim()}
          className="btn-lift rounded-xl bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 text-sm font-medium shadow-sm disabled:opacity-40 transition"
        >
          发送
        </button>
      </div>
    </div>
  );
}
