export class MemStorage {
  constructor() {
    this.tokenAnalyses = new Map();
    this.searchHistory = [];
    this.idCounter = 0;
  }

  async saveTokenAnalysis(analysis) {
    const id = `analysis_${++this.idCounter}`;
    const savedAnalysis = {
      ...analysis,
      id,
      analyzedAt: new Date().toISOString(),
    };
    
    this.tokenAnalyses.set(analysis.contractAddress, savedAnalysis);
    return savedAnalysis;
  }

  async getTokenAnalysis(contractAddress) {
    return this.tokenAnalyses.get(contractAddress) || null;
  }

  async getRecentAnalyses(limit = 10) {
    return Array.from(this.tokenAnalyses.values())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
      .slice(0, limit);
  }

  async saveSearchHistory(search) {
    const id = `search_${++this.idCounter}`;
    const savedSearch = {
      ...search,
      id,
      searchedAt: new Date().toISOString(),
    };
    
    this.searchHistory.push(savedSearch);
    return savedSearch;
  }

  async getUserSearchHistory(userFid, limit = 10) {
    return this.searchHistory
      .filter(search => search.userFid === userFid)
      .sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime())
      .slice(0, limit);
  }

  async getPopularTokens(limit = 10) {
    const tokenCounts = new Map();
    
    this.searchHistory.forEach(search => {
      const count = tokenCounts.get(search.contractAddress) || 0;
      tokenCounts.set(search.contractAddress, count + 1);
    });

    return Array.from(tokenCounts.entries())
      .map(([contractAddress, searchCount]) => ({ contractAddress, searchCount }))
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
