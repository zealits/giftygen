/**
 * Currency utility functions
 * Defaults to INR (Indian Rupees) for India
 */

// Default currency configuration
const DEFAULT_CURRENCY = 'INR';
const DEFAULT_CURRENCY_SYMBOL = '₹';

/**
 * Get currency symbol based on currency code
 * @param {string} currencyCode - Currency code (e.g., 'INR', 'USD')
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = DEFAULT_CURRENCY) => {
  const currencyMap = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
  };
  
  return currencyMap[currencyCode.toUpperCase()] || DEFAULT_CURRENCY_SYMBOL;
};

/**
 * Format amount with currency symbol
 * @param {number|string} amount - Amount to format
 * @param {string} currencyCode - Currency code (default: INR)
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY, options = {}) => {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
    locale = 'en-IN', // Indian locale for proper formatting
  } = options;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? `${getCurrencySymbol(currencyCode)} 0` : '0';
  }

  // Format number with Indian locale (uses comma for thousands separator)
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);

  if (showCode) {
    return `${formattedAmount} ${currencyCode}`;
  }

  if (showSymbol) {
    const symbol = getCurrencySymbol(currencyCode);
    // For INR, symbol comes before the amount
    if (currencyCode.toUpperCase() === 'INR') {
      return `${symbol} ${formattedAmount}`;
    }
    // For other currencies like USD, symbol comes before
    return `${symbol}${formattedAmount}`;
  }

  return formattedAmount;
};

/**
 * Get default currency (INR for India)
 * @returns {string} Currency code
 */
export const getDefaultCurrency = () => DEFAULT_CURRENCY;

/**
 * Get default currency symbol (₹ for India)
 * @returns {string} Currency symbol
 */
export const getDefaultCurrencySymbol = () => DEFAULT_CURRENCY_SYMBOL;

