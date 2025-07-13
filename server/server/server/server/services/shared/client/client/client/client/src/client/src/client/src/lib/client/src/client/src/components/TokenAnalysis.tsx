import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, TrendingUp, Shield, Users, ExternalLink } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface TokenAnalysisProps {
  userFid?: number;
  onTokenAnalyzed?: (analysis: any) => void;
}

export function TokenAnalysis({ userFid, onTokenAnalyzed }: TokenAnalysisProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState<any>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { contractAddress: string; userFid?: number }) => {
      return apiRequest('/api/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setSelectedToken(data);
      onTokenAnalyzed?.(data);
      queryClient.invalidateQueries({ queryKey: ['/api/recent'] });
    },
  });

  const { data: recentAnalyses } = useQuery({
    queryKey: ['/api/recent'],
    queryFn: () => apiRequest('/api/recent?limit=5'),
  });

  const handleAnalyze = async () => {
    if (!contractAddress.trim()) return;
    
    try {
      await analyzeMutation.mutateAsync({
        contractAddress: contractAddress.trim(),
        userFid,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Analyze Token
        </h2>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter contract address (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!contractAddress.trim() || analyzeMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={18} />
            {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {selectedToken && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedToken.tokenName} ({selectedToken.tokenSymbol})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedToken.contractAddress}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Price</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(selectedToken.priceUsd)}
              </p>
              <p className={`text-sm ${selectedToken.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h?.toFixed(2)}%
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Security Score</span>
              </div>
              <p className={`text-lg font-semibold ${getScoreColor(selectedToken.securityScore)}`}>
                {selectedToken.securityScore || 'N/A'}/100
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Holders</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedToken.holderCount?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Analyses */}
      {recentAnalyses && recentAnalyses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Analyses
          </h3>
          <div className="space-y-3">
            {recentAnalyses.map((analysis: any) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => setSelectedToken(analysis)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {analysis.tokenName} ({analysis.tokenSymbol})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(analysis.priceUsd)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getScoreColor(analysis.securityScore)}`}>
                    {analysis.securityScore}/100
                  </span>
                  <ExternalLink size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
