"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useGlobalStore } from "@/lib/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const theme = useGlobalStore(state => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isLight: boolean) => {
      if (isLight) {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }
    };

    if (theme === 'System') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      applyTheme(mediaQuery.matches);
      
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'Light');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
