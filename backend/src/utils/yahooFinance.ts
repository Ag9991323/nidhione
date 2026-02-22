import axios from 'axios';

export interface YahooFinanceQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function getStockPrice(symbol: string): Promise<number | null> {
  try {
    // Yahoo Finance API v8
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await axios.get(url);
    
    const data = response.data;
    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleStockPrices(symbols: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  
  // Fetch prices in parallel
  const promises = symbols.map(async (symbol) => {
    const price = await getStockPrice(symbol);
    if (price !== null) {
      priceMap.set(symbol, price);
    }
  });
  
  await Promise.all(promises);
  return priceMap;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

/**
 * Search for stocks using Yahoo Finance API
 * Supports global stock markets including Indian NSE/BSE stocks
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    // Yahoo Finance search/quote lookup API
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&enableFuzzyQuery=false`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const quotes = response.data?.quotes || [];
    
    // Filter and map results
    const results: StockSearchResult[] = quotes
      .filter((quote: any) => {
        // Only include equity stocks
        return quote.quoteType === 'EQUITY' && quote.symbol && quote.longname;
      })
      .map((quote: any) => {
        // Determine exchange
        let exchange = 'OTHER';
        if (quote.symbol.endsWith('.NS')) {
          exchange = 'NSE';
        } else if (quote.symbol.endsWith('.BO')) {
          exchange = 'BSE';
        } else if (quote.exchDisp) {
          exchange = quote.exchDisp;
        }
        
        return {
          symbol: quote.symbol,
          name: quote.longname || quote.shortname,
          exchange: exchange,
          type: quote.quoteType || 'EQUITY',
        };
      })
      .slice(0, 15);
    
    return results;
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}
