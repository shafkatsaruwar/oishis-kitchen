import { QueryClient } from '@tanstack/react-query';
import { isOnline } from '@/lib/offline/network';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount) => isOnline() && failureCount < 1,
			gcTime: 7 * 24 * 60 * 60 * 1000,
			staleTime: 30 * 1000,
			networkMode: 'offlineFirst',
		},
		mutations: {
			retry: 0,
			networkMode: 'offlineFirst',
		},
	},
});