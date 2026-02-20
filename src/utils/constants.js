export const AVATAR_COLORS = [
  '#E07A5F',
  '#81B29A',
  '#F2CC8F',
  '#D4726A',
  '#7EB5D6',
  '#C49BBB',
  '#E8A87C',
  '#85C1E9',
];

export function fmtTime(ts) {
  const d = new Date(ts || Date.now());
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function getAvatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}
