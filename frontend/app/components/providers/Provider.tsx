'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from "@/context/LanguageContext"; // Ensure path is correct

export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient inside useState to avoid sharing cache across users during SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10,       // Data ko 10 min tak fresh samjho (No duplicate calls)
            gcTime: 1000 * 60 * 15,          // Unused data 15 min tak cache me rakho
            retry: false,                    // ❌ Duplicate/Failed request retry stop
            refetchOnMount: false,           // ❌ Component remount par refetch stop
            refetchOnWindowFocus: false,     // ❌ Tab switch hone par automatic fetch stop
            refetchOnReconnect: false,       // ❌ Network reconnect hone par fetch stop
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </QueryClientProvider>
  );
}