import { useState } from 'react';
import { Share2, Copy, ExternalLink } from 'lucide-react';

interface ShareCastProps {
  tokenAnalysis: any;
}

export function ShareCast({ tokenAnalysis }: ShareCastProps) {
  const [copied, setCopied] = useState(false);

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const generateCastText = () => {
    const scoreEmoji = (score: number | null) => {
      if (!score) return '⚠️';
      if (score >= 80) return '🟢';
      if (score >= 60) return '🟡';
      if (score >= 40) return '🟠';
      return '🔴';
    };

    return `🔍 Token Analysis: ${tokenAnalysis.tokenName} (${tokenAnalysis.tokenSymbol})

💰 Price: ${formatNumber(tokenAnalysis.priceUsd)}
📈 24h Change: ${tokenAnalysis.priceChange24h ? `${tokenAnalysis.priceChange24h.toFixed(2)}%` : 'N/A'}
🏪 Market Cap: ${formatNumber(tokenAnalysis.marketCap)}
👥 Holders: ${tokenAnalysis.holderCount?.toLocaleString() || 'N/A'}

${scoreEmoji(tokenAnalysis.securityScore)} Security Score: ${tokenAnalysis.securityScore || 'N/A'}/100

✅ Contract Valid: ${tokenAnalysis.hasValidContract ? 'Yes' : 'No'}
✅ Ownership Renounced: ${tokenAnalysis.isOwnershipRenounced ? 'Yes' : 'No'}
✅ Open Trading: ${tokenAnalysis.isOpenTrading ? 'Yes' : 'No'}
✅ Sufficient Liquidity: ${tokenAnalysis.hasLiquidity ? 'Yes' : 'No'}

📊 FC Mentions: ${tokenAnalysis.farcasterMentions || 0}
🤝 Social Graph Holders: ${tokenAnalysis.socialGraphHolders || 0}

Analyzed with FC Lens 🔍`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCastText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToWarpcast = () => {
    const text = encodeURIComponent(generateCastText());
    const url = `https://warpcast.com/~/compose?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={20} className="text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Share Analysis
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Cast Preview:
          </p>
          <div className="text-sm text-gray-900 dark:text-white whitespace-pre-line max-h-32 overflow-y-auto">
            {generateCastText()}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          
          <button
            onClick={shareToWarpcast}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ExternalLink size={16} />
            Share on Warpcast
          </button>
        </div>
      </div>
    </div>
  );
}
