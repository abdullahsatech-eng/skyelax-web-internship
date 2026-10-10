/** Creates a short unique id such as `cr_k3f9a2x1`. Used when records are created, never inside reducers. */
export function createId(prefix: string): string {
  const bytes = new Uint8Array(5);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const suffix = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 8);
  return `${prefix}_${suffix}`;
}
