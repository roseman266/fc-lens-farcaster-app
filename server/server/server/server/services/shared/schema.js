import { z } from 'zod';

export const insertTokenAnalysisSchema = z.object({
  contractAddress: z.string(),
  tokenName: z.string(),
  tokenSymbol: z.string(),
  priceUsd: z.number(),
  priceChange24h: z.number(),
  marketCap: z.number(),
  volume24h: z.number(),
  liquidityUsd: z.number(),
  holderCount: z.number(),
  securityScore: z.number(),
  isOwnershipRenounced: z.boolean(),
  isOpenTrading: z.boolean(),
  hasValidContract: z.boolean(),
  hasLiquidity: z.boolean(),
  farcasterMentions: z.number(),
  socialGraphHolders: z.number(),
  chainId: z.number()
});

export const insertTokenSearchHistorySchema = z.object({
  contractAddress: z.string(),
  userFid: z.number()
});
