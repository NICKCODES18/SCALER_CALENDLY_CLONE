import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function Root() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Toaster position="bottom-right" richColors closeButton />
          <Outlet />
        </AppProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
