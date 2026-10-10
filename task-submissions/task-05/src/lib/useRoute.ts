import { useMemo, useSyncExternalStore } from 'react';
import { matchRoute, parseLocationHash, type RouteMatch } from './router';

/** Thin React binding for the hash router in router.ts. */
const listeners = new Set<() => void>();
let hasNavigated = false;

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    hasNavigated = true;
    notify();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => window.location.hash;
const getServerSnapshot = () => '';

/** Changes the route. Notifies subscribers synchronously so state and route update in one render. */
export function navigate(to: string) {
  window.location.hash = to;
  hasNavigated = true;
  notify();
}

/** True once the user has moved inside the app (used to avoid stealing focus on first load). */
export function hasNavigatedInApp() {
  return hasNavigated;
}

export interface CurrentRoute {
  path: string;
  query: URLSearchParams;
  match: RouteMatch;
}

export function useRoute(): CurrentRoute {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    const { path, query } = parseLocationHash(hash);
    return { path, query, match: matchRoute(path) };
  }, [hash]);
}
