import { useContext } from 'react';
import { useWorkMode } from '../context/WorkModeContext';
import { GameContext } from '../context/GameContext';

function SidebarIcon({ d }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const MENU = [
  { key: 'dashboard', label: '工作台', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { key: 'projects', label: '项目管理', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { key: 'docs', label: '文档中心', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'team', label: '团队管理', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { key: 'chat', label: '即时通讯', badge: 3, icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155' },
  { key: 'reports', label: '数据报表', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  { key: 'calendar', label: '日程安排', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
];

function WorkTopBar({ toggleWorkMode, nickname, connected }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
          EP
        </div>
        <span className="text-sm font-semibold text-slate-800 hidden sm:block">
          企业协同平台
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${
          connected
            ? 'bg-green-50 border-green-300 text-green-600'
            : 'bg-red-50 border-red-300 text-red-500'
        }`}>
          {connected ? '在线' : '离线'}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
            {(nickname || '管')[0]}
          </div>
          <span className="text-sm text-slate-600 hidden sm:block">{nickname || '管理员'}</span>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <button
          onClick={toggleWorkMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition text-xs"
          title="切回游戏模式"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
          <span className="hidden sm:inline">开发模式</span>
        </button>
      </div>
    </header>
  );
}

function WorkSidebar({ activeKey }) {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 shrink-0 hidden md:flex md:flex-col">
      <nav className="flex-1 py-3">
        {MENU.map((item) => {
          const active = item.key === activeKey;
          return (
            <a
              key={item.key}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm cursor-default transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <SidebarIcon d={item.icon} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 py-3">
        <a className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-400 hover:text-slate-600 cursor-default transition-colors">
          <SidebarIcon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <span>系统设置</span>
        </a>
      </div>
    </aside>
  );
}

function GameModeToggle({ toggleWorkMode, connected }) {
  return (
    <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
      <button
        onClick={toggleWorkMode}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-medium shadow-md shadow-primary-500/25 transition text-xs"
        title="伪装模式"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
        <span className="hidden sm:inline">伪装模式</span>
      </button>
      <div
        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
          connected
            ? 'bg-sage-50 border-sage-500/40 text-sage-600'
            : 'bg-rose-50 border-rose-500/40 text-rose-500'
        }`}
      >
        {connected ? '已连接' : '未连接'}
      </div>
    </div>
  );
}

export default function WorkModeShell({ children }) {
  const { isWorkMode, toggleWorkMode } = useWorkMode();
  const { state } = useContext(GameContext);

  if (!isWorkMode) {
    return (
      <>
        {children}
        <GameModeToggle toggleWorkMode={toggleWorkMode} connected={state.connected} />
      </>
    );
  }

  const breadcrumb =
    state.screen === 'lobby'
      ? '项目管理 / 新建项目'
      : `项目管理 / 项目 #${state.gameId || '—'} / Sprint ${state.round || 1}`;

  return (
    <div className="h-screen flex flex-col">
      <WorkTopBar
        toggleWorkMode={toggleWorkMode}
        nickname={state.nickname}
        connected={state.connected}
      />
      <div className="flex flex-1 min-h-0">
        <WorkSidebar activeKey="projects" />
        <main className="flex-1 min-h-0 flex flex-col bg-slate-50">
          <div className="text-xs text-slate-400 px-6 pt-4 pb-2 shrink-0">{breadcrumb}</div>
          <div className="work-content flex-1 min-h-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
