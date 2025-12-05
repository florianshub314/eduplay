/**
 * Returns up to `count` unique items from `list` in random order.
 * Items are not mutated; the original list stays untouched.
 */
export function pickUniqueRandomItems(list, count) {
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }

  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  if (typeof count !== "number" || count < 0) {
    return pool;
  }

  return pool.slice(0, Math.min(count, pool.length));
}
