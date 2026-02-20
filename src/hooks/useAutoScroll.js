import { useEffect, useRef } from 'react';

export function useAutoScroll(dep) {
  const ref = useRef(null);
  const atBottom = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      atBottom.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (atBottom.current && ref.current)
      ref.current.scrollTop = ref.current.scrollHeight;
  }, [dep]);

  return ref;
}
