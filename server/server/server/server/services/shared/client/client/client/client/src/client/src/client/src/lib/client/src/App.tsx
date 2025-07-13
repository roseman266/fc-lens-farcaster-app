import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sdk } from '@farcaster/miniapp-sdk';
import { TokenAnalysis } from '@/components/TokenAnalysis';
import { ShareCast } from '@/components/ShareCast';
import { TrendingUp, Shield, Users, Search } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'share'>('analyze');

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        const url = new URL(window.location.href);
        const isMiniApp = url.pathname.startsWith('/mini') || 
                         url.searchParams.get('miniApp') === 'true';
        
        if (isMiniApp) {
          await sdk.actions.ready();
          const context = await sdk.context;
          setUser(context.user);
        }
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFarcaster();
  }, []);

  const handleTokenAnalyzed = (analysis: any) => {
    setSelectedToken(analysis);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading FC Lens...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Search size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    FC Lens
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive Token Analysis
                  </p>
                </div>
              </div>
              
              {user && (
                <div className="flex items-center gap-2">
                  <img
                    src={user.pfpUrl}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.displayName}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'analyze'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingUp size={18} />
                Analyze
              </button>
              {selectedToken && (
                <button
                  onClick={() => setActiveTab('share')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'share'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Shield size={18} />
                  Share
                </button>
              )}
            </div>
          </nav>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:gri
