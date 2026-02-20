const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

// ==== 配置 ====
const PORT = process.env.PORT || 4444;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'games.json');

// 从 JSON 文件加载词语对
const WORDS_FILE = path.join(__dirname, 'words.json');
const WORD_PAIRS = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));

// ==== 简单文件“数据库” ====
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadGames() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('加载游戏数据失败:', e);
    return {};
  }
}

function saveGames(games) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2), 'utf8');
  } catch (e) {
    console.error('保存游戏数据失败:', e);
  }
}

// 内存中的游戏状态（启动时从文件加载一次）
const games = loadGames();

// ==== 游戏逻辑结构 ====
// game: {
//   id,
//   wordCommon,      // 平民词
//   wordUndercover,  // 卧底词
//   status,          // 'waiting' | 'playing' | 'ended'
//   phase,           // 'waiting' | 'speaking' | 'voting' | 'ended'
//   hostId,          // 房主 playerId
//   players: { playerId: { id, name, role, alive } },
//   chat: [ { id, playerId, name, text, ts } ],
//   votes: { round: number, records: [ { from, to } ] },
//   round,
//   turnOrder: [playerId, ...],
//   turnIndex,
//   currentSpeakerId
// }

function createGame() {
  const id = uuidv4().slice(0, 6); // 短一点方便输入
  const pair =
    WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)] ||
    WORD_PAIRS[0];
  const game = {
    id,
    wordCommon: pair.common,
    wordUndercover: pair.undercover,
    status: 'waiting',
    phase: 'waiting',
    hostId: null,
    players: {},
    chat: [],
    votes: {
      round: 1,
      records: []
    },
    round: 1,
    turnOrder: [],
    turnIndex: 0,
    currentSpeakerId: null,
    undercoverCount: 1
  };
  games[id] = game;
  saveGames(games);
  return game;
}

function joinGame(gameId, name) {
  const game = games[gameId];
  if (!game) return null;
  // 简单限制：游戏结束后不能加入
  if (game.status === 'ended') return null;

  const isFirstPlayer = Object.keys(game.players).length === 0;

  // 如果同名玩家已经存在（无论存活与否），则认为是同一个玩家（例如刷新页面重连）
  const existing = Object.values(game.players).find(
    (p) => p.name === name
  );
  if (existing) {
    return { game, player: existing };
  }

  const playerId = uuidv4();
  game.players[playerId] = {
    id: playerId,
    name,
    role: 'unknown', // 开局时暂不分配，开始游戏时统一分配
    alive: true
  };
  if (isFirstPlayer) {
    game.hostId = playerId;
    addSystemChat(game, `玩家【${name}】创建了房间，并成为房主。`);
  } else {
    addSystemChat(game, `玩家【${name}】加入了房间。`);
  }
  saveGames(games);
  return { game, player: game.players[playerId] };
}

// 离开房间逻辑
function leaveGame(gameId, playerId, reason) {
  const game = games[gameId];
  if (!game) return null;
  const player = game.players[playerId];
  if (!player) return null;

  const kicked = reason === 'kicked';

  if (game.status === 'waiting') {
    // 未开始时离开，直接从房间移除
    delete game.players[playerId];
    addSystemChat(game, kicked ? `玩家【${player.name}】被房主踢出了房间。` : `玩家【${player.name}】离开了房间。`);
  } else if (game.status === 'playing') {
    // 游戏中离开视为出局
    if (player.alive) {
      player.alive = false;
      addSystemChat(game, kicked ? `玩家【${player.name}】被房主踢出，视为出局。` : `玩家【${player.name}】中途离开，视为出局。`);
      // 如果正轮到他发言，则直接切到下一位或进入投票
      if (game.currentSpeakerId === playerId) {
        if (Array.isArray(game.turnOrder) && game.turnOrder.length > 0) {
          const idx = game.turnOrder.indexOf(playerId);
          if (idx !== -1) {
            const nextIndex = idx + 1;
            if (nextIndex >= game.turnOrder.length) {
              game.phase = 'voting';
              game.currentSpeakerId = null;
              addSystemChat(game, `第 ${game.round} 轮发言结束，请大家投票。`);
            } else {
              game.turnIndex = nextIndex;
              game.currentSpeakerId = game.turnOrder[nextIndex];
              const current = game.players[game.currentSpeakerId];
              if (current) {
                addSystemChat(game, `轮到【${current.name}】发言。`);
              }
            }
          }
        }
      }
      checkGameEnd(game);
    }
  }

  // 房主离开时，顺延给下一个存活玩家
  if (game.hostId === playerId) {
    transferHost(game);
  }

  saveGames(games);
  broadcastGameState(gameId);
  return game;
}

function startGame(gameId, undercoverCount = 1) {
  const game = games[gameId];
  if (!game) return null;
  game.undercoverCount = undercoverCount;
  const playerIds = Object.keys(game.players);
  if (playerIds.length < undercoverCount + 2) {
    throw new Error('玩家过少，无法开始游戏');
  }
  // 仅在角色尚未分配时才随机分配卧底（更换词语时已分配则跳过）
  const alreadyAssigned = playerIds.some(id => game.players[id].role !== 'unknown');
  if (!alreadyAssigned) {
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const undercoverIds = new Set(shuffled.slice(0, undercoverCount));
    for (const id of playerIds) {
      if (undercoverIds.has(id)) {
        game.players[id].role = 'undercover';
      } else {
        game.players[id].role = 'civilian';
      }
    }
  }
  game.status = 'playing';
  game.round = 1;
  game.phase = 'speaking';
  game.votes = { round: 1, records: [] };
  initTurnOrder(game);
  saveGames(games);
  return game;
}

function addChat(gameId, playerId, text) {
  const game = games[gameId];
  if (!game) return null;
  const player = game.players[playerId];
  if (!player) return null;
  const msg = {
    id: uuidv4(),
    playerId,
    name: player.name,
    text: String(text).slice(0, 200),
    ts: Date.now()
  };
  game.chat.push(msg);
  if (game.chat.length > 200) {
    game.chat = game.chat.slice(-200);
  }
  saveGames(games);
  return msg;
}

function castVote(gameId, fromPlayerId, toPlayerId) {
  const game = games[gameId];
  if (!game || game.status !== 'playing' || game.phase !== 'voting') {
    return null;
  }
  const from = game.players[fromPlayerId];
  const to = game.players[toPlayerId];
  if (!from || !to || !from.alive || !to.alive) return null;

  const currentRound = game.votes.round;
  const currentRoundRecords = game.votes.records.filter(
    (r) => r.round === currentRound
  );

  // 已经投过票，本轮不允许再次投票
  if (currentRoundRecords.some((r) => r.from === fromPlayerId)) {
    return game;
  }

  game.votes.records.push({
    round: currentRound,
    from: fromPlayerId,
    to: toPlayerId
  });

  // 检查是否所有存活玩家都投票了
  const aliveIds = Object.values(game.players)
    .filter((p) => p.alive)
    .map((p) => p.id);
  const votedIds = new Set(
    game.votes.records
      .filter((r) => r.round === currentRound)
      .map((r) => r.from)
  );

  if (aliveIds.every((id) => votedIds.has(id))) {
    // 统计票数
    const counter = {};
    const roundRecords = game.votes.records.filter(
      (r) => r.round === currentRound
    );
    for (const r of roundRecords) {
      counter[r.to] = (counter[r.to] || 0) + 1;
    }

    // 票数汇总系统提示
    const summaryParts = Object.entries(counter).map(([pid, count]) => {
      const player = game.players[pid];
      const name = player ? player.name : '未知玩家';
      return `【${name}】${count}票`;
    });
    if (summaryParts.length) {
      addSystemChat(
        game,
        `第 ${game.round} 轮票数汇总：${summaryParts.join('，')}。`
      );
    }

    const entries = Object.entries(counter);
    if (entries.length > 0) {
      // 找到最高票数
      const maxCount = Math.max(...entries.map(([, c]) => c));
      const topIds = entries
        .filter(([, c]) => c === maxCount)
        .map(([pid]) => pid);

      if (topIds.length === 1) {
        // 只有一人最高票，正常出局
        const outId = topIds[0];
        if (game.players[outId]) {
          game.players[outId].alive = false;
          addSystemChat(
            game,
            `第 ${game.round} 轮投票结束，玩家【${game.players[outId].name}】出局`
          );
        }
        // 判断游戏是否结束
        checkGameEnd(game);
      } else {
        // 多人并列最高票，本轮无人出局
        addSystemChat(
          game,
          `第 ${game.round} 轮出现平票，本轮无人出局，进入下一轮发言。`
        );
      }
    }

    // 进入下一轮（只要游戏还在进行，无论是否有人出局）
    if (game.status === 'playing') {
      game.round += 1;
      game.votes.round = game.round;
      game.phase = 'speaking';
      initTurnOrder(game);
    }
  }

  saveGames(games);
  return game;
}

function addSystemChat(game, text) {
  game.chat.push({
    id: uuidv4(),
    playerId: 'system',
    name: '系统',
    text,
    ts: Date.now()
  });
}

function checkGameEnd(game) {
  const alivePlayers = Object.values(game.players).filter((p) => p.alive);
  const aliveUndercover = alivePlayers.filter(
    (p) => p.role === 'undercover'
  ).length;
  const aliveCivil = alivePlayers.filter((p) => p.role === 'civilian').length;

  if (aliveUndercover === 0) {
    game.status = 'ended';
    game.phase = 'ended';
    addSystemChat(game, '所有卧底已被淘汰，平民获胜！');
    addSystemChat(game, `本局词语揭晓 — 平民词：${game.wordCommon}，卧底词：${game.wordUndercover}`);
  } else if (aliveUndercover >= aliveCivil) {
    game.status = 'ended';
    game.phase = 'ended';
    addSystemChat(game, '卧底人数大于等于平民，卧底获胜！');
    addSystemChat(game, `本局词语揭晓 — 平民词：${game.wordCommon}，卧底词：${game.wordUndercover}`);
  }
}

// 重新开始一局游戏（保留房间和玩家，只重置状态）
function restartGame(gameId) {
  const game = games[gameId];
  if (!game || game.status !== 'ended') return null;

  // 所有玩家复活，身份重置
  Object.values(game.players).forEach((p) => {
    p.alive = true;
    p.role = 'unknown';
  });

  game.status = 'waiting';
  game.phase = 'waiting';
  game.round = 1;
  game.votes = { round: 1, records: [] };
  game.turnOrder = [];
  game.turnIndex = 0;
  game.currentSpeakerId = null;

  // 重新随机分配一组词语
  const pair =
    WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)] ||
    WORD_PAIRS[0];
  game.wordCommon = pair.common;
  game.wordUndercover = pair.undercover;

  // 保留聊天记录，追加系统提示
  addSystemChat(game, '房主重新开始了一局新游戏，请房主点击"更换词语"分配词语后再开始。');

  saveGames(games);
  return game;
}

// 更换词语并直接分配给所有玩家（等待阶段或游戏结束后均可）
function rerollWords(gameId) {
  const game = games[gameId];
  if (!game || (game.status !== 'waiting' && game.status !== 'ended')) return null;

  // 如果游戏已结束，先重置为等待状态
  if (game.status === 'ended') {
    Object.values(game.players).forEach((p) => {
      p.alive = true;
      p.role = 'unknown';
    });
    game.status = 'waiting';
    game.phase = 'waiting';
    game.round = 1;
    game.votes = { round: 1, records: [] };
    game.turnOrder = [];
    game.turnIndex = 0;
    game.currentSpeakerId = null;
    game.chat = [];
    addSystemChat(game, '房主重新开始了一局新游戏。');
  }

  const pair =
    WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)] ||
    WORD_PAIRS[0];
  game.wordCommon = pair.common;
  game.wordUndercover = pair.undercover;

  // 直接分配角色给所有玩家
  const playerIds = Object.keys(game.players);
  const ucCount = game.undercoverCount || 1;
  if (playerIds.length >= ucCount + 2) {
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const undercoverIds = new Set(shuffled.slice(0, ucCount));
    for (const id of playerIds) {
      game.players[id].role = undercoverIds.has(id) ? 'undercover' : 'civilian';
    }
    addSystemChat(game, '房主更换了词语，已分配给所有玩家，请查看自己的词语。');
  } else {
    addSystemChat(game, `房主更换了词语（玩家不足${ucCount + 2}人，暂未分配）。`);
  }

  saveGames(games);
  return game;
}

// 初始化一轮的发言顺序
function initTurnOrder(game) {
  const aliveIds = Object.values(game.players)
    .filter((p) => p.alive)
    .map((p) => p.id);
  const order = [...aliveIds].sort(() => Math.random() - 0.5);
  game.turnOrder = order;
  game.turnIndex = 0;
  game.currentSpeakerId = order[0] || null;
  if (order.length) {
    const names = order
      .map((id) => (game.players[id] ? game.players[id].name : '玩家'))
      .join(' → ');
    addSystemChat(game, `第 ${game.round} 轮发言顺序：${names}`);
    if (game.currentSpeakerId) {
      const current = game.players[game.currentSpeakerId];
      if (current) {
        addSystemChat(game, `首先由【${current.name}】开始发言。`);
      }
    }
  }
}

// 房主顺延：选第一个仍然存活的玩家作为新房主
function transferHost(game) {
  const alive = Object.values(game.players).filter((p) => p.alive);
  if (!alive.length) {
    game.hostId = null;
    return;
  }
  const next = alive[0];
  if (next && game.hostId !== next.id) {
    game.hostId = next.id;
    addSystemChat(game, `玩家【${next.name}】成为新的房主。`);
  }
}

// ==== Express + WebSocket ====
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// 创建游戏
app.post('/api/games', (req, res) => {
  const game = createGame();
  res.json({ gameId: game.id });
});

// 加入游戏
app.post('/api/games/:id/join', (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'name 必填' });
  }
  const result = joinGame(req.params.id, String(name).slice(0, 20));
  if (!result) return res.status(404).json({ error: '游戏不存在或已结束' });

  // 有玩家加入/重连时，广播一次最新状态，让已在房间的玩家看到最新列表
  broadcastGameState(req.params.id);

  res.json({
    gameId: result.game.id,
    playerId: result.player.id
  });
});

// 离开游戏
app.post('/api/games/:id/leave', (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) {
    return res.status(400).json({ error: 'playerId 必填' });
  }
  const game = leaveGame(req.params.id, String(playerId));
  if (!game) return res.status(404).json({ error: '游戏或玩家不存在' });
  res.json({ ok: true });
});

// 踢出玩家（仅房主）
app.post('/api/games/:id/kick', (req, res) => {
  const { playerId, targetPlayerId } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId 必填' });
  if (!targetPlayerId) return res.status(400).json({ error: 'targetPlayerId 必填' });
  const game = games[req.params.id];
  if (!game) return res.status(404).json({ error: '游戏不存在' });
  if (game.hostId !== playerId) return res.status(403).json({ error: '只有房主可以踢出玩家' });
  if (playerId === targetPlayerId) return res.status(400).json({ error: '不能踢出自己' });
  if (!game.players[targetPlayerId]) return res.status(404).json({ error: '目标玩家不存在' });

  // 通知被踢玩家并关闭其连接
  const targetWs = findPlayerSocket(req.params.id, targetPlayerId);
  if (targetWs) {
    targetWs.send(JSON.stringify({ type: 'kicked' }));
    sockets.delete(targetWs);
    targetWs.close();
  }

  leaveGame(req.params.id, targetPlayerId, 'kicked');
  res.json({ ok: true });
});

// 修改游戏设置（卧底人数等）
app.post('/api/games/:id/settings', (req, res) => {
  const { playerId, undercoverCount } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId 必填' });
  const game = games[req.params.id];
  if (!game) return res.status(404).json({ error: '游戏不存在' });
  if (game.hostId && game.hostId !== playerId) return res.status(403).json({ error: '只有房主可以修改设置' });
  if (game.status !== 'waiting') return res.status(400).json({ error: '只能在等待阶段修改设置' });
  if (undercoverCount !== undefined) {
    const uc = Math.max(1, Math.min(3, Number(undercoverCount) || 1));
    game.undercoverCount = uc;
  }
  saveGames(games);
  broadcastGameState(req.params.id);
  res.json({ ok: true });
});

// 开始游戏（房主逻辑简化：任何人都能调用）
app.post('/api/games/:id/start', (req, res) => {
  const { undercoverCount = 1, playerId } = req.body || {};
  if (!playerId) {
    return res.status(400).json({ error: 'playerId 必填' });
  }
  const game = games[req.params.id];
  if (!game) {
    return res.status(404).json({ error: '游戏不存在' });
  }
  if (game.hostId && game.hostId !== playerId) {
    return res.status(403).json({ error: '只有房主可以开始游戏' });
  }
  if (!game.players[playerId] || !game.players[playerId].alive) {
    return res.status(403).json({ error: '只有在场的房主可以开始游戏' });
  }
  try {
    const started = startGame(req.params.id, Number(undercoverCount) || 1);
    if (!started) return res.status(404).json({ error: '游戏不存在' });
    broadcastGameState(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 重新开始游戏（仅房主，且游戏已结束）
app.post('/api/games/:id/restart', (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) {
    return res.status(400).json({ error: 'playerId 必填' });
  }
  const game = games[req.params.id];
  if (!game) {
    return res.status(404).json({ error: '游戏不存在' });
  }
  if (game.status !== 'ended') {
    return res.status(400).json({ error: '游戏未结束，无法重新开始' });
  }
  if (game.hostId && game.hostId !== playerId) {
    return res.status(403).json({ error: '只有房主可以重新开始游戏' });
  }
  try {
    const restarted = restartGame(req.params.id);
    if (!restarted) {
      return res.status(404).json({ error: '游戏不存在或重置失败' });
    }
    broadcastGameState(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 更换本局词语（仅房主，等待中或游戏结束后可用）
app.post('/api/games/:id/reroll-words', (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) {
    return res.status(400).json({ error: 'playerId 必填' });
  }
  const game = games[req.params.id];
  if (!game) {
    return res.status(404).json({ error: '游戏不存在' });
  }
  if (game.status !== 'waiting' && game.status !== 'ended') {
    return res.status(400).json({ error: '游戏进行中，无法更换词语' });
  }
  if (game.hostId && game.hostId !== playerId) {
    return res.status(403).json({ error: '只有房主可以更换词语' });
  }
  try {
    const updated = rerollWords(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: '更换词语失败' });
    }
    broadcastGameState(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 获取游戏状态
app.get('/api/games/:id', (req, res) => {
  const game = games[req.params.id];
  if (!game) return res.status(404).json({ error: '游戏不存在' });
  res.json(publicGameState(game));
});

// ==== WebSocket 部分 ====
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 每个连接记录其所在游戏和玩家
const sockets = new Map(); // ws -> { gameId, playerId }

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.replace(/^.*\?/, ''));
  const gameId = params.get('gameId');
  const playerId = params.get('playerId');
  const game = games[gameId];

  if (!game || !game.players[playerId]) {
    ws.close();
    return;
  }

  sockets.set(ws, { gameId, playerId });
  console.log(`玩家 ${playerId} 连接到游戏 ${gameId}`);

  // 发送当前游戏状态
  ws.send(
    JSON.stringify({
      type: 'state',
      data: publicGameState(game)
    })
  );

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const game = games[gameId];
      if (!game) {
        return;
      }
      if (msg.type === 'chat') {
        // 已出局的玩家不能发消息
        const player = game.players[playerId];
        if (player && !player.alive && game.status === 'playing') {
          return;
        }
        // 发言阶段只允许当前发言玩家发消息
        const isSpeakingTurn =
          game.status === 'playing' &&
          game.phase === 'speaking' &&
          game.currentSpeakerId &&
          game.currentSpeakerId === playerId;
        if (
          game.status === 'playing' &&
          game.phase === 'speaking' &&
          game.currentSpeakerId &&
          game.currentSpeakerId !== playerId
        ) {
          return;
        }
        const added = addChat(gameId, playerId, msg.text || '');
        if (added) {
          broadcast(gameId, {
            type: 'chat',
            data: added
          });
        }
        // 发言阶段发送消息后自动结束本轮发言
        if (isSpeakingTurn && Array.isArray(game.turnOrder) && game.turnOrder.length > 0) {
          const nextIndex = (game.turnIndex || 0) + 1;
          if (nextIndex >= game.turnOrder.length) {
            game.turnIndex = nextIndex;
            game.currentSpeakerId = null;
            game.phase = 'voting';
            addSystemChat(game, `第 ${game.round} 轮发言结束，请大家投票。`);
          } else {
            game.turnIndex = nextIndex;
            game.currentSpeakerId = game.turnOrder[nextIndex];
            const current = game.players[game.currentSpeakerId];
            if (current) {
              addSystemChat(game, `轮到【${current.name}】发言。`);
            }
          }
          saveGames(games);
          broadcastGameState(gameId);
        }
      } else if (msg.type === 'vote') {
        const { targetId } = msg;
        const updatedGame = castVote(gameId, playerId, targetId);
        if (updatedGame) {
          broadcastGameState(gameId);
        }
      } else if (msg.type === 'finish_turn') {
        // 当前发言玩家点击“发言完毕”
        if (
          game.status !== 'playing' ||
          game.phase !== 'speaking' ||
          game.currentSpeakerId !== playerId
        ) {
          return;
        }
        if (!Array.isArray(game.turnOrder) || game.turnOrder.length === 0) {
          return;
        }
        const nextIndex = (game.turnIndex || 0) + 1;
        if (nextIndex >= game.turnOrder.length) {
          // 本轮所有人发言结束，进入投票阶段
          game.turnIndex = nextIndex;
          game.currentSpeakerId = null;
          game.phase = 'voting';
          addSystemChat(game, `第 ${game.round} 轮发言结束，请大家投票。`);
        } else {
          game.turnIndex = nextIndex;
          game.currentSpeakerId = game.turnOrder[nextIndex];
          const current = game.players[game.currentSpeakerId];
          if (current) {
            addSystemChat(game, `轮到【${current.name}】发言。`);
          }
        }
        saveGames(games);
        broadcastGameState(gameId);
      }
    } catch (e) {
      console.error('处理 WebSocket 消息失败:', e);
    }
  });

  ws.on('close', () => {
    const info = sockets.get(ws);
    sockets.delete(ws);
    // 关闭标签或断开连接视为离开房间
    if (info && info.gameId && info.playerId) {
      leaveGame(info.gameId, info.playerId);
    }
  });
});

function findPlayerSocket(gameId, playerId) {
  for (const [ws, info] of sockets.entries()) {
    if (info.gameId === gameId && info.playerId === playerId) return ws;
  }
  return null;
}

function broadcast(gameId, payload) {
  const text = JSON.stringify(payload);
  for (const [ws, info] of sockets.entries()) {
    if (info.gameId === gameId && ws.readyState === ws.OPEN) {
      ws.send(text);
    }
  }
}

function broadcastGameState(gameId) {
  const game = games[gameId];
  if (!game) return;
  broadcast(gameId, {
    type: 'state',
    data: publicGameState(game)
  });
}

// 前端只需要看到的公共状态（不暴露词语）
function publicGameState(game) {
  return {
    id: game.id,
    status: game.status,
    round: game.round,
    phase: game.phase || 'waiting',
    hostId: game.hostId || null,
    currentSpeakerId: game.currentSpeakerId || null,
    players: Object.values(game.players).map((p) => ({
      id: p.id,
      name: p.name,
      alive: p.alive,
      ...(game.status === 'ended' ? { role: p.role } : {})
    })),
    chat: game.chat,
    undercoverCount: game.undercoverCount || 1,
    votedPlayerIds: game.phase === 'voting'
      ? game.votes.records.filter((r) => r.round === game.votes.round).map((r) => r.from)
      : [],
    // 提示词语信息只在本地显示：前端根据当前玩家 id 再查询
    hasStarted: game.status !== 'waiting'
  };
}

// 供前端查询自己的词语
app.get('/api/games/:id/word', (req, res) => {
  const { playerId } = req.query;
  const game = games[req.params.id];
  if (!game || !playerId || !game.players[playerId]) {
    return res.status(404).json({ error: '游戏或玩家不存在' });
  }
  const player = game.players[playerId];
  if (player.role === 'undercover') {
    return res.json({ word: game.wordUndercover, role: 'undercover' });
  }
  if (player.role === 'civilian') {
    return res.json({ word: game.wordCommon, role: 'civilian' });
  }
  // 游戏未开始
  return res.json({ word: null, role: 'unknown' });
});

// 供房主在等待阶段预览当前词语对（仅房主可用）
app.get('/api/games/:id/preview-words', (req, res) => {
  const { playerId } = req.query;
  const game = games[req.params.id];
  if (!game || !playerId) {
    return res.status(404).json({ error: '游戏或玩家不存在' });
  }
  if (game.status !== 'waiting') {
    return res.status(400).json({ error: '只有等待开始时才能预览词语' });
  }
  if (game.hostId && game.hostId !== playerId) {
    return res.status(403).json({ error: '只有房主可以预览当前词语' });
  }
  return res.json({
    common: game.wordCommon,
    undercover: game.wordUndercover
  });
});

server.listen(PORT, () => {
  console.log(`谁是卧底游戏服务器已启动：http://localhost:${PORT}`);
});

