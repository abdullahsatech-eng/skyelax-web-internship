import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { loadAppData, saveAppData } from '../lib/storage';
import type { AppData } from '../types';
import { appReducer, type AppAction } from './appReducer';

interface AppDataContextValue {
  data: AppData;
  dispatch: Dispatch<AppAction>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

/** The single source of truth for projects and change requests. Persists to this browser's localStorage. */
export function AppDataProvider({ children, initialData }: { children: ReactNode; initialData?: AppData }) {
  const [data, dispatch] = useReducer(appReducer, undefined, () => initialData ?? loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const value = useMemo(() => ({ data, dispatch }), [data]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside <AppDataProvider>.');
  return context;
}
