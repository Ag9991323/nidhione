import axios from 'axios';

export interface AMFINAVData {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
}

// AMFI India NAV API endpoint
const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

let navCache: Map<string, AMFINAVData> = new Map();
let lastFetchTime: Date | null = null;

export async function fetchAllNAVs(): Promise<Map<string, AMFINAVData>> {
  try {
    const response = await axios.get(AMFI_NAV_URL);
    const data = response.data;
    
    const navMap = new Map<string, AMFINAVData>();
    const lines = data.split('\n');
    
    for (const line of lines) {
      const parts = line.split(';');
      if (parts.length >= 5 && parts[0] && !isNaN(Number(parts[0]))) {
        const schemeCode = parts[0].trim();
        const schemeName = parts[3].trim();
        const nav = parseFloat(parts[4].trim());
        const date = parts[7]?.trim() || '';
        
        if (!isNaN(nav)) {
          navMap.set(schemeCode, {
            schemeCode,
            schemeName,
            nav,
            date,
          });
        }
      }
    }
    
    navCache = navMap;
    lastFetchTime = new Date();
    
    return navMap;
  } catch (error) {
    console.error('Error fetching AMFI NAV data:', error);
    return navCache; // Return cached data if fetch fails
  }
}

export async function getNAVBySchemeCode(schemeCode: string): Promise<number | null> {
  // Fetch fresh data if cache is older than 1 hour
  if (!lastFetchTime || (Date.now() - lastFetchTime.getTime()) > 3600000) {
    await fetchAllNAVs();
  }
  
  const navData = navCache.get(schemeCode);
  return navData?.nav || null;
}

export async function searchMutualFund(query: string): Promise<AMFINAVData[]> {
  if (navCache.size === 0) {
    await fetchAllNAVs();
  }
  
  const results: AMFINAVData[] = [];
  const searchTerm = query.toLowerCase();
  
  for (const navData of navCache.values()) {
    if (navData.schemeName.toLowerCase().includes(searchTerm)) {
      results.push(navData);
    }
  }
  
  return results.slice(0, 20); // Return top 20 results
}
