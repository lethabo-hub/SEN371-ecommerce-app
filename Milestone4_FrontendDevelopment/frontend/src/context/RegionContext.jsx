import { createContext, useContext, useState, useEffect } from 'react';

// Each region has a hemisphere and a default currency code.
const REGIONS = {
  ZA: { label: 'South Africa', hemisphere: 'south', currency: 'ZAR' },
  US: { label: 'United States', hemisphere: 'north', currency: 'USD' },
  UK: { label: 'United Kingdom', hemisphere: 'north', currency: 'GBP' },
  AU: { label: 'Australia', hemisphere: 'south', currency: 'AUD' },
  EU: { label: 'European Union', hemisphere: 'north', currency: 'EUR' },
};

// Works out the current season from the real date and the hemisphere.
// Northern hemisphere months are used first, then flipped for the south.
function getSeason(hemisphere) {
  const month = new Date().getMonth(); // 0 = January, 11 = December

  let northernSeason;
  if (month === 11 || month === 0 || month === 1) {
    northernSeason = 'Winter';
  } else if (month >= 2 && month <= 4) {
    northernSeason = 'Spring';
  } else if (month >= 5 && month <= 7) {
    northernSeason = 'Summer';
  } else {
    northernSeason = 'Autumn';
  }

  if (hemisphere === 'north') {
    return northernSeason;
  }

  // Southern hemisphere is six months out of sync with the north.
  if (northernSeason === 'Winter') return 'Summer';
  if (northernSeason === 'Summer') return 'Winter';
  if (northernSeason === 'Spring') return 'Autumn';
  return 'Spring';
}

const SEASON_CATEGORY_HINTS = {
  Spring: ['Footwear', 'Backpacks'],
  Summer: ['Accessories', 'Footwear'],
  Autumn: ['Shelter', 'Backpacks'],
  Winter: ['Shelter', 'Accessories'],
};

const RegionContext = createContext(null);

export const RegionProvider = ({ children }) => {
  const [regionCode, setRegionCode] = useState(() => localStorage.getItem('shopwave_region') || 'ZA');

  useEffect(() => {
    localStorage.setItem('shopwave_region', regionCode);
  }, [regionCode]);

  const region = REGIONS[regionCode] || REGIONS.ZA;
  const season = getSeason(region.hemisphere);
  const seasonalCategories = SEASON_CATEGORY_HINTS[season] || [];

  return (
    <RegionContext.Provider value={{ regionCode, setRegionCode, regions: REGIONS, region, season, seasonalCategories }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
