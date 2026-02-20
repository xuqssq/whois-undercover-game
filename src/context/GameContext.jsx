import { createContext } from 'react';

export const GameContext = createContext(null);

export const initialState = {
  screen: 'lobby',
  connected: false,
  gameId: null,
  playerId: null,
  nickname: '',
  status: 'waiting',
  phase: 'waiting',
  round: 1,
  hostId: null,
  currentSpeakerId: null,
  players: [],
  chat: [],
  word: null,
  role: 'unknown',
  myVoteTargetId: null,
  error: null,
  toasts: [],
  showResult: false,
  wordCommon: null,
  wordUndercover: null,
  wordVersion: 0,
  resultSnapshot: null,
  undercoverCount: 1,
  votedPlayerIds: [],
};

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'JOIN_SUCCESS':
      return {
        ...state,
        screen: 'game',
        gameId: action.payload.gameId,
        playerId: action.payload.playerId,
        error: null,
      };
    case 'LEAVE_GAME':
      return { ...initialState, nickname: state.nickname };
    case 'WS_CONNECTED':
      return { ...state, connected: true };
    case 'WS_DISCONNECTED':
      return { ...state, connected: false };
    case 'GAME_STATE_UPDATE': {
      const g = action.payload;
      const roundChanged = g.round !== state.round;
      const statusChanged = g.status !== state.status;
      let wordCommon = state.wordCommon;
      let wordUndercover = state.wordUndercover;
      if (g.status === 'ended' && g.chat) {
        const revealMsg = [...g.chat]
          .reverse()
          .find(
            (m) =>
              m.playerId === 'system' &&
              m.text &&
              m.text.includes('词语揭晓'),
          );
        if (revealMsg) {
          const match = revealMsg.text.match(
            /平民词[：:]\s*(.+?)[，,]\s*卧底词[：:]\s*(.+)/,
          );
          if (match) {
            wordCommon = match[1];
            wordUndercover = match[2];
          }
        }
      }
      const newChat = g.chat || [];
      const oldChatLen = state.chat.length;
      let wordVer = state.wordVersion;
      if (newChat.length > oldChatLen) {
        const newMsgs = newChat.slice(oldChatLen);
        if (
          newMsgs.some(
            (m) =>
              m.playerId === 'system' &&
              m.text &&
              (m.text.includes('已分配给所有玩家') ||
                m.text.includes('词语已分配')),
          )
        ) {
          wordVer = state.wordVersion + 1;
        }
      }
      let resultSnapshot = state.resultSnapshot;
      let showResult = state.showResult;
      if (statusChanged && g.status === 'ended') {
        const winMsg = [...(g.chat || [])]
          .reverse()
          .find(
            (m) =>
              m.playerId === 'system' &&
              m.text &&
              (m.text.includes('平民获胜') || m.text.includes('卧底获胜')),
          );
        const civilianWin = winMsg
          ? winMsg.text.includes('平民获胜')
          : true;
        resultSnapshot = {
          players: g.players || [],
          wordCommon,
          wordUndercover,
          civilianWin,
          myRole: state.role,
        };
        showResult = true;
      }
      return {
        ...state,
        status: g.status,
        phase: g.phase || 'waiting',
        round: g.round,
        hostId: g.hostId,
        currentSpeakerId: g.currentSpeakerId,
        players: g.players || [],
        chat: newChat,
        wordCommon,
        wordUndercover,
        wordVersion: wordVer,
        undercoverCount: g.undercoverCount || state.undercoverCount,
        myVoteTargetId:
          roundChanged || g.status !== 'playing'
            ? null
            : state.myVoteTargetId,
        votedPlayerIds: g.votedPlayerIds || [],
        showResult,
        resultSnapshot,
      };
    }
    case 'CHAT_MESSAGE':
      return { ...state, chat: [...state.chat, action.payload] };
    case 'WORD_LOADED':
      return {
        ...state,
        word: action.payload.word,
        role: action.payload.role,
      };
    case 'VOTE_CAST':
      return { ...state, myVoteTargetId: action.payload };
    case 'SHOW_RESULT':
      return { ...state, showResult: true };
    case 'HIDE_RESULT':
      return { ...state, showResult: false, resultSnapshot: null };
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { id: Date.now(), text: action.payload, leaving: false },
        ],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}
