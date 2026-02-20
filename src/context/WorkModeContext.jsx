import { createContext, useState, useContext, useCallback, useEffect } from 'react';

const WorkModeContext = createContext(null);

export function WorkModeProvider({ children }) {
  const [isWorkMode, setIsWorkMode] = useState(() => {
    return localStorage.getItem('wis_work_mode') === 'true';
  });

  const toggleWorkMode = useCallback(() => {
    setIsWorkMode((prev) => {
      const next = !prev;
      localStorage.setItem('wis_work_mode', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('work-mode', isWorkMode);
    document.title = isWorkMode ? '运维管理平台 v3.2' : '谁是卧底 - 在线版';
    const link = document.querySelector("link[rel='icon']");
    if (link) link.href = isWorkMode ? '/favicon-work.svg' : '/favicon.svg';
  }, [isWorkMode]);

  return (
    <WorkModeContext.Provider value={{ isWorkMode, toggleWorkMode }}>
      {children}
    </WorkModeContext.Provider>
  );
}

export function useWorkMode() {
  return useContext(WorkModeContext);
}
