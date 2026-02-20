<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="谁是卧底" />
</p>

<h1 align="center">谁是卧底 · 在线版</h1>

<p align="center">
  多人实时在线"谁是卧底"网页游戏，支持轮流发言、在线投票、3D 场景动画<br/>
  内置<strong>伪装模式</strong> —— 一键切换为企业管理后台界面，让你在工作时间也能安心"开会"
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?logo=vite" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Three.js-0.183-000?logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs" alt="Express" />
  <img src="https://img.shields.io/badge/WebSocket-实时通信-4353ff" alt="WebSocket" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT" />
</p>

---

## 目录

- [使用场景](#使用场景)
- [功能特性](#功能特性)
- [游戏模式](#-游戏模式)
- [伪装模式](#-伪装模式)
- [游戏玩法](#游戏玩法)
- [快速开始](#快速开始)
- [部署](#部署)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [词语配置](#词语配置)
- [License](#license)

---

## 使用场景

| 场景 | 说明 |
|---|---|
| **团建破冰** | 创建房间分享房间号，同事扫码即可加入，无需安装任何 App |
| **午休摸鱼** | 开启伪装模式，整个页面变成"企业协同平台"管理后台，浏览器标签页标题和图标同步切换，老板路过也看不出端倪 |
| **线上聚会** | 远程好友输入房间号即可开玩，实时聊天 + 投票，体验流畅 |
| **课堂互动** | 老师创建房间，学生加入，用游戏的方式活跃课堂气氛 |

---

## 功能特性

- **房间系统** — 创建房间后分享 6 位房间号，好友输入即可加入；支持浏览所有房间列表一键加入
- **房主管理** — 房主可开始游戏、更换词语、调整卧底人数（1~3 人）、踢出玩家
- **随机词语分配** — 从词库随机抽取词语对，平民和卧底各拿到不同但相近的词
- **轮流发言** — 每轮随机发言顺序，发送消息后自动轮到下一位
- **在线投票** — 实时显示每位玩家的投票进度，票数最高者出局（平票则无人出局）
- **胜负判定** — 所有卧底出局则平民胜，卧底人数 ≥ 平民则卧底胜
- **结算面板** — 游戏结束时揭晓词语与身份，房主可一键重开
- **3D 场景** — Three.js 渲染的低多边形动态背景，角色随游戏状态实时变化
- **伪装模式** — 一键切换为企业管理后台 UI，标题/图标/配色/布局全面伪装
- **响应式设计** — 手机、平板、桌面端均可流畅使用

---

## 🎭 游戏模式

游戏模式是默认界面，具有完整的游戏视觉体验：

- **暖色调设计** — 奶油色背景（`#FFF8F0`）、陶土橙主题色（`#E07A5F`），温馨舒适
- **3D 动态背景** — Three.js 渲染的低多边形角色场景，角色会随发言、投票、淘汰等状态实时动画
- **玩家头像** — 根据玩家昵称哈希算法自动生成唯一颜色，色彩丰富鲜明
- **系统消息** — 琥珀色气泡，标注游戏进度与事件
- **右上角控制** — 伪装模式切换按钮 + 连接状态指示器

---

## 🏢 伪装模式

点击右上角「伪装模式」按钮，整个页面瞬间变身为一个专业的企业管理后台，伪装效果覆盖所有视觉细节：

| 维度 | 游戏模式 | 伪装模式 |
|---|---|---|
| **页面标题** | 谁是卧底 - 在线版 | 运维管理平台 v3.2 |
| **浏览器图标** | 🎭 面具图标（暖色） | 💻 显示器图标（蓝色） |
| **整体布局** | 居中卡片式 | 左侧菜单 + 顶栏 + 内容区 |
| **配色方案** | 暖色调（奶油色/陶土橙） | 冷色调（白色/蓝色/灰色） |
| **字体** | Noto Serif SC（衬线） | 系统 UI 字体（无衬线） |
| **侧边菜单** | 无 | 工作台/项目管理/文档中心/团队管理/即时通讯/数据报表/日程安排 |
| **顶部导航** | 无 | EP 企业协同平台 Logo + 在线状态 + 用户头像 |
| **3D 背景** | 显示 | 隐藏 |
| **文案标签** | 游戏术语（房间/昵称/投票…） | 工作术语（项目/成员/评审…） |
| **系统消息** | 琥珀色气泡 | 蓝色气泡 |
| **头像颜色** | 全色相鲜明色彩 | 蓝/靛/紫冷色调 |
| **面包屑** | 无 | 项目管理 / 项目 #xxx / Sprint N |

伪装状态通过 `localStorage` 持久化，刷新页面后保持上次的模式选择。

---

## 游戏玩法

### 规则简介

"谁是卧底"是一款经典的语言推理桌游。每位玩家会收到一个词语，其中大多数人（平民）收到相同的词，少数人（卧底）收到一个相近但不同的词。玩家通过轮流描述自己的词语来找出卧底。

### 游戏流程

```
创建/加入房间 → 房主分配词语 → 开始游戏
     ↓
┌─→ 查看自己的词语
│   ↓
│   按随机顺序轮流发言（描述词语，不能直接说出）
│   ↓
│   全员发言结束，进入投票环节
│   ↓
│   票数最高者出局（平票则无人出局）
│   ↓
│   判定胜负 ── 满足条件？→ 结算画面 → 再来一局
│        ↓ 不满足
└────────┘
```

### 胜负条件

- **平民胜利** — 所有卧底被投票淘汰
- **卧底胜利** — 存活的卧底人数 ≥ 存活的平民人数

### 游戏技巧

- 描述词语时既要让队友认出你，又不能太明显让卧底猜到真实词语
- 卧底需要根据其他人的描述推测平民词是什么，伪装自己的描述
- 注意观察每个人的表情和描述方式，找出可疑之处

---

## 快速开始

### 环境要求

- Node.js >= 20
- yarn 或 npm

### 本地开发

```bash
# 克隆项目
git clone <repo-url>
cd whois-undercover-game

# 安装依赖
yarn install

# 启动后端（端口 4444）
yarn dev:server

# 另一个终端，启动前端（Vite dev server，自动代理 API 和 WebSocket）
yarn dev
```

浏览器打开 Vite 提供的地址（默认 `http://localhost:5173`）。

### 生产构建

```bash
# 构建前端
yarn build

# 启动生产服务
yarn start
```

生产模式下 Express 直接服务 `dist/` 目录的静态文件，访问 `http://localhost:4444`。端口可通过环境变量 `PORT` 修改。

---

## 部署

项目提供一键部署脚本 `deploy.sh`：

```bash
bash deploy.sh
```

脚本流程：

1. 本地执行 `yarn build` 构建前端
2. 打包项目（排除 `node_modules`、`src`、`.git` 等开发文件）
3. `scp` 上传到服务器
4. SSH 到服务器解压、安装生产依赖
5. 使用 `pm2` 启动/重启服务

部署前需修改 `deploy.sh` 中的 `SERVER` 变量为你的服务器地址。

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                     浏览器                            │
│  ┌──────────────────────────────────────────────┐   │
│  │           React 19 + Tailwind CSS 4           │   │
│  │  ┌────────────┐ ┌───────────┐ ┌───────────┐  │   │
│  │  │ 游戏模式 UI │ │ 伪装模式 UI│ │ Three.js  │  │   │
│  │  └────────────┘ └───────────┘ └───────────┘  │   │
│  │  ┌────────────────────────────────────────┐   │   │
│  │  │    Context (GameContext + WorkMode)     │   │   │
│  │  └────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│       │ REST API (fetch)      │ WebSocket            │
└───────┼───────────────────────┼──────────────────────┘
        ▼                       ▼
┌─────────────────────────────────────────────────────┐
│                  Node.js 服务端                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Express API  │  │  WebSocket   │  │ 静态文件   │  │
│  │  (游戏逻辑)   │  │  (实时广播)   │  │ (dist/)   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┘  │
│         └────────┬────────┘                          │
│           ┌──────▼──────┐                            │
│           │  JSON 文件   │                            │
│           │  (持久化)    │                            │
│           └─────────────┘                            │
└─────────────────────────────────────────────────────┘
```

### 技术栈

| 层 | 技术 | 版本 | 说明 |
|---|---|---|---|
| **前端框架** | React | 19 | 函数式组件 + Hooks |
| **构建工具** | Vite | 7 | 开发热更新 + 生产构建 |
| **样式方案** | Tailwind CSS | 4 | `@theme` 自定义主题色，双模式切换 |
| **3D 渲染** | Three.js | 0.183 | 低多边形角色场景动画 |
| **后端框架** | Express | 4 | RESTful API |
| **实时通信** | ws | 8 | WebSocket 双向实时消息 |
| **进程管理** | pm2 | — | 生产环境守护进程 |
| **数据存储** | JSON 文件 | — | 轻量级本地持久化 |

### 前端架构

**状态管理** — 使用 React Context + `useReducer` 管理全局游戏状态（`GameContext`），`useState` 管理伪装模式状态（`WorkModeContext`）。

**主题切换** — Tailwind CSS 4 的 `@theme` 指令定义自定义色彩变量，伪装模式通过 `html.work-mode` 选择器覆盖主题变量，实现 CSS 级别的无缝切换。

**组件设计** — 14 个功能组件，职责分离：

- `WorkModeShell` — 伪装模式布局壳（侧边栏/顶栏/面包屑）
- `LobbyView` — 大厅（创建/加入房间 + 房间列表弹窗）
- `GameView` — 游戏主界面容器
- `ChatPanel` / `ChatBubble` — 聊天面板与消息气泡
- `PlayersPanel` / `PlayerCard` / `PlayerAvatar` — 玩家列表与头像
- `WordCard` — 词语展示卡片
- `HostControls` — 房主操作面板
- `PhaseIndicator` — 游戏阶段指示器
- `GameResult` — 结算面板
- `GameHeader` — 游戏头部信息

**自定义 Hooks** — 业务逻辑与 UI 解耦：

- `useWebSocket` — WebSocket 连接管理与消息处理
- `useApi` — REST API 调用封装
- `useAutoScroll` — 聊天消息自动滚动
- `useThreeScene` — Three.js 场景生命周期管理

### 后端架构

**API 设计** — RESTful 风格，核心接口：

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/games` | 列出所有可加入的房间 |
| `POST` | `/api/games` | 创建新房间 |
| `POST` | `/api/games/:id/join` | 加入房间 |
| `POST` | `/api/games/:id/leave` | 离开房间 |
| `POST` | `/api/games/:id/start` | 开始游戏 |
| `POST` | `/api/games/:id/kick` | 踢出玩家 |
| `POST` | `/api/games/:id/settings` | 修改设置 |
| `POST` | `/api/games/:id/restart` | 重新开始 |
| `POST` | `/api/games/:id/reroll-words` | 更换词语 |
| `GET` | `/api/games/:id/word` | 查询自己的词语 |
| `GET` | `/api/games/:id/preview-words` | 房主预览词语 |

**WebSocket 消息** — 双向实时通信：

| 类型 | 方向 | 说明 |
|---|---|---|
| `chat` | 客户端 → 服务端 | 发送聊天消息 |
| `vote` | 客户端 → 服务端 | 投票 |
| `finish_turn` | 客户端 → 服务端 | 发言完毕 |
| `state` | 服务端 → 客户端 | 广播游戏状态 |
| `chat` | 服务端 → 客户端 | 广播新消息 |
| `kicked` | 服务端 → 客户端 | 被踢出通知 |

---

## 项目结构

```
whois-undercover-game/
├── index.html                  # Vite 入口 HTML
├── vite.config.js              # Vite 配置（React、Tailwind、代理、分包）
├── server.js                   # Express + WebSocket 后端服务
├── words.json                  # 词语对配置文件
├── deploy.sh                   # 一键部署脚本
├── package.json
│
├── public/
│   ├── favicon.svg             # 游戏模式图标（面具）
│   └── favicon-work.svg        # 伪装模式图标（显示器）
│
├── src/
│   ├── main.jsx                # React 入口
│   ├── App.jsx                 # 根组件
│   ├── index.css               # Tailwind 主题 + 自定义样式 + 伪装模式覆盖
│   │
│   ├── components/
│   │   ├── LobbyView.jsx       # 大厅 — 创建/加入房间、房间列表弹窗
│   │   ├── GameView.jsx        # 游戏主界面
│   │   ├── ChatPanel.jsx       # 聊天面板
│   │   ├── ChatBubble.jsx      # 聊天气泡
│   │   ├── PlayersPanel.jsx    # 玩家列表
│   │   ├── PlayerCard.jsx      # 玩家卡片
│   │   ├── PlayerAvatar.jsx    # 玩家头像（name 哈希生成颜色）
│   │   ├── WordCard.jsx        # 词语展示
│   │   ├── HostControls.jsx    # 房主操作
│   │   ├── PhaseIndicator.jsx  # 游戏阶段指示
│   │   ├── GameHeader.jsx      # 游戏头部
│   │   ├── GameResult.jsx      # 结算面板
│   │   ├── WorkModeShell.jsx   # 伪装模式布局壳
│   │   ├── ConnectionBadge.jsx # 连接状态徽章
│   │   └── Toast.jsx           # 轻提示
│   │
│   ├── context/
│   │   ├── GameContext.jsx      # 游戏状态 Context + Reducer
│   │   └── WorkModeContext.jsx  # 伪装模式 Context（标题/图标/CSS 切换）
│   │
│   ├── hooks/
│   │   ├── useWebSocket.js     # WebSocket 连接管理
│   │   ├── useApi.js           # REST API 封装
│   │   ├── useAutoScroll.js    # 聊天自动滚动
│   │   └── useThreeScene.js    # Three.js 场景管理
│   │
│   ├── three/
│   │   └── ThreeScene.js       # Three.js 3D 场景与角色动画
│   │
│   └── utils/
│       └── constants.js        # 常量、工具函数、头像颜色算法
│
├── scripts/
│   └── getwords.mjs            # 词语采集脚本
│
└── data/
    └── games.json              # 游戏数据持久化（运行时自动生成）
```

---

## 词语配置

编辑 `words.json`，格式如下：

```json
[
  { "common": "苹果", "undercover": "梨" },
  { "common": "咖啡", "undercover": "奶茶" },
  { "common": "篮球", "undercover": "排球" }
]
```

每对词语包含 `common`（平民词）和 `undercover`（卧底词），两个词应当相似但有区别。修改后重启服务即可生效。

也可以运行 `yarn words` 执行词语采集脚本批量补充词库。

---

## License

[MIT](LICENSE)
