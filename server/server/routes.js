import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage.js';
import { tokenAnalysisService } from './services/tokenAnalysis.js';
import { insertTokenAnalysisSchema, insertTokenSearchHistorySchema } from '../shared/schema.js';

const router = Router();

// Analyze Token Route
router.post('/api/analyze', async (req, res) => {
  try {
    const { contractAddress, chainId = 1, userFid } = req.body;

    // Validate input
    const schema = z.object({
      contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
      chainId: z.number().optional().default(1),
      userFid: z.number().optional()
    });

    const { contractAddress: validatedAddress, chainId: validatedChainId, userFid: validatedUserFid } = schema.parse({
      contractAddress,
      chainId,
      userFid
    });

    // Check if we have recent analysis
    const existingAnalysis = await storage.getTokenAnalysis(validatedAddress);
    if (existingAnalysis) {
      const analysisAge = Date.now() - new Date(existingAnalysis.analyzedAt).getTime();
      // Return cached analysis if less than 5 minutes old
      if (analysisAge < 5 * 60 * 1000) {
        return res.json(existingAnalysis);
      }
    }

    // Perform new analysis
    const analysisResult = await tokenAnalysisService.analyzeToken(validatedAddress, validatedChainId);

    // Save analysis to storage
    const analysisData = insertTokenAnalysisSchema.parse({
      contractAddress: validatedAddress,
      tokenName: analysisResult.tokenName,
      tokenSymbol: analysisResult.tokenSymbol,
      priceUsd: analysisResult.priceData.price,
      priceChange24h: analysisResult.priceData.priceChange24h,
      marketCap: analysisResult.priceData.marketCap,
      volume24h: analysisResult.priceData.volume24h,
      liquidityUsd: analysisResult.securityData.liquidityUsd,
      holderCount: analysisResult.securityData.holderCount,
      securityScore: analysisResult.securityScore,
      isOwnershipRenounced: analysisResult.securityData.isOwnershipRenounced,
      isOpenTrading: analysisResult.securityData.isOpenTrading,
      hasValidContract: analysisResult.securityData.hasValidContract,
      hasLiquidity: analysisResult.securityData.hasLiquidity,
      farcasterMentions: analysisResult.socialData.farcasterMentions,
      socialGraphHolders: analysisResult.socialData.socialGraphHolders,
      chainId: validatedChainId
    });

    const savedAnalysis = await storage.saveTokenAnalysis(analysisData);

    // Save search history if user provided
    if (validatedUserFid) {
      const searchData = insertTokenSearchHistorySchema.parse({
        contractAddress: validatedAddress,
        userFid: validatedUserFid
      });
      await storage.saveSearchHistory(searchData);
    }

    res.json(savedAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze token' });
  }
});

// Get Token Analysis Route
router.get('/api/token/:contractAddress', async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const analysis = await storage.getTokenAnalysis(contractAddress);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Token analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get token error:', error);
    res.status(500).json({ error: 'Failed to get token analysis' });
  }
});

// Get Recent Analyses Route
router.get('/api/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const analyses = await storage.getRecentAnalyses(limit);
    res.json(analyses);
  } catch (error) {
    console.error('Get recent analyses error:', error);
    res.status(500).json({ error: 'Failed to get recent analyses' });
  }
});

// Get Popular Tokens Route
router.get('/api/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const popularTokens = await storage.getPopularTokens(limit);
    res.json(popularTokens);
  } catch (error) {
    console.error('Get popular tokens error:', error);
    res.status(500).json({ error: 'Failed to get popular tokens' });
  }
});

// Get User Search History Route
router.get('/api/history/:userFid', async (req, res) => {
  try {
    const userFid = parseInt(req.params.userFid);
    const limit = parseInt(req.query.limit) || 10;
    const history = await storage.getUserSearchHistory(userFid, limit);
    res.json(history);
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ error: 'Failed to get user history' });
  }
});

export default router;
