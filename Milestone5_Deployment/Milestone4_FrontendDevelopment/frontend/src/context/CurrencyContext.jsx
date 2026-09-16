import { createContext, useContext, useEffect, useState } from 'react';

// Base prices in the store are stored in South African Rand (ZAR).
// Rates below convert that base figure for display only — checkout always
// settles in ZAR, and the UI makes that clear next to the selector.
const CURRENCIES = {
  ZAR: { symbol: 'R', label: 'South African Rand', rate: 1 },
  USD: { symbol: '$', label: 'US Dollar', rate: 0.054 },
  GBP: { symbol: '£', label: 'British Pound', rate: 0.043 },
  EUR: { symbol: '€', label: 'Euro', rate: 0.05 },
  AUD: { symbol: 'A$', label: 'Australian Dollar', rate: 0.082 },
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('shopwave_currency') || 'ZAR');

  useEffect(() => {
    localStorage.setItem('shopwave_currency', currency);
  }, [currency]);

  const formatPrice = (zarAmount) => {
    const info = CURRENCIES[currency] || CURRENCIES.ZAR;
    const converted = zarAmount * info.rate;
    return `${info.symbol} ${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
