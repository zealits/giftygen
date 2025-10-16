// Geolocation and language detection utilities
import i18n from '../i18n';

// Language mapping based on country codes
const COUNTRY_LANGUAGE_MAP = {
  // North America
  'US': 'en',
  'CA': 'en', // Could be 'fr' for Quebec
  'MX': 'es',
  
  // Europe
  'GB': 'en',
  'IE': 'en',
  'FR': 'fr',
  'DE': 'de',
  'ES': 'es',
  'IT': 'it',
  'PT': 'pt',
  'NL': 'nl',
  'BE': 'nl', // Could be 'fr' for Wallonia
  'CH': 'de', // Could be 'fr' or 'it' based on region
  'AT': 'de',
  'SE': 'sv',
  'NO': 'no',
  'DK': 'da',
  'FI': 'fi',
  'PL': 'pl',
  'CZ': 'cs',
  'HU': 'hu',
  'RO': 'ro',
  'BG': 'bg',
  'HR': 'hr',
  'SI': 'sl',
  'SK': 'sk',
  'LT': 'lt',
  'LV': 'lv',
  'EE': 'et',
  'GR': 'el',
  'CY': 'el',
  'MT': 'mt',
  'LU': 'fr', // Could be 'de' or 'lb'
  
  // Asia Pacific
  'CN': 'zh',
  'JP': 'ja',
  'KR': 'ko',
  'TW': 'zh-TW',
  'HK': 'zh-HK',
  'SG': 'en',
  'MY': 'ms',
  'TH': 'th',
  'VN': 'vi',
  'PH': 'en',
  'ID': 'id',
  'IN': 'hi', // Could be 'en' or regional languages
  'AU': 'en',
  'NZ': 'en',
  
  // Middle East & Africa
  'AE': 'ar',
  'SA': 'ar',
  'EG': 'ar',
  'ZA': 'en',
  'NG': 'en',
  'KE': 'en',
  'MA': 'ar',
  'TN': 'ar',
  'DZ': 'ar',
  'LY': 'ar',
  'IQ': 'ar',
  'IR': 'fa',
  'TR': 'tr',
  'IL': 'he',
  
  // South America
  'BR': 'pt',
  'AR': 'es',
  'CL': 'es',
  'CO': 'es',
  'PE': 'es',
  'VE': 'es',
  'UY': 'es',
  'PY': 'es',
  'BO': 'es',
  'EC': 'es',
  'GY': 'en',
  'SR': 'nl',
  
  // Central America & Caribbean
  'GT': 'es',
  'HN': 'es',
  'SV': 'es',
  'NI': 'es',
  'CR': 'es',
  'PA': 'es',
  'CU': 'es',
  'DO': 'es',
  'HT': 'fr',
  'JM': 'en',
  'TT': 'en',
  'BB': 'en',
  'BZ': 'en',
  
  // Other regions
  'RU': 'ru',
  'UA': 'uk',
  'BY': 'be',
  'KZ': 'kk',
  'UZ': 'uz',
  'KG': 'ky',
  'TJ': 'tg',
  'TM': 'tk',
  'AF': 'fa',
  'PK': 'ur',
  'BD': 'bn',
  'LK': 'si',
  'NP': 'ne',
  'BT': 'dz',
  'MV': 'dv',
  'MM': 'my',
  'LA': 'lo',
  'KH': 'km',
  'BN': 'ms',
  'TL': 'pt',
  'FJ': 'en',
  'PG': 'en',
  'SB': 'en',
  'VU': 'en',
  'NC': 'fr',
  'PF': 'fr',
  'WF': 'fr',
  'WS': 'en',
  'TO': 'en',
  'KI': 'en',
  'TV': 'en',
  'NR': 'en',
  'PW': 'en',
  'FM': 'en',
  'MH': 'en',
  'CK': 'en',
  'NU': 'en',
  'TK': 'en',
  'AS': 'en',
  'GU': 'en',
  'MP': 'en',
  'VI': 'en',
  'PR': 'es',
};

// Language preferences for countries with multiple official languages
const COUNTRY_LANGUAGE_PREFERENCES = {
  'CA': (region) => region === 'QC' ? 'fr' : 'en',
  'BE': (region) => region === 'WAL' ? 'fr' : 'nl',
  'CH': (region) => {
    if (region === 'FR') return 'fr';
    if (region === 'IT') return 'it';
    return 'de';
  },
  'LU': (region) => region === 'DE' ? 'de' : 'fr',
  'IN': (region) => {
    // Major Indian states language mapping
    const stateLanguages = {
      'TN': 'ta', 'KL': 'ml', 'KA': 'kn', 'AP': 'te', 'TG': 'te',
      'MH': 'mr', 'GJ': 'gu', 'RJ': 'hi', 'UP': 'hi', 'MP': 'hi',
      'WB': 'bn', 'AS': 'as', 'OR': 'or', 'PB': 'pa', 'HP': 'hi',
      'JK': 'ur', 'UT': 'hi', 'CT': 'hi', 'JH': 'hi', 'BR': 'hi',
      'DL': 'hi', 'CH': 'hi', 'AN': 'hi', 'LD': 'hi', 'PY': 'hi',
      'GA': 'hi', 'MN': 'hi', 'MZ': 'hi', 'NL': 'hi', 'SK': 'hi',
      'TR': 'hi', 'AR': 'hi', 'ML': 'hi', 'MI': 'hi', 'NA': 'hi',
      'MZ': 'hi', 'NL': 'hi', 'SK': 'hi', 'TR': 'hi', 'AR': 'hi',
      'ML': 'hi', 'MI': 'hi', 'NA': 'hi'
    };
    return stateLanguages[region] || 'en';
  }
};

// Fallback language detection based on browser settings
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  return browserLang.split('-')[0]; // Get language code without region
};

// Get supported languages from i18n configuration
const getSupportedLanguages = () => {
  return i18n.options.supportedLngs || ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'ro', 'bg', 'hr', 'sl', 'sk', 'lt', 'lv', 'et', 'el', 'mt', 'zh', 'ja', 'ko', 'zh-TW', 'zh-HK', 'ms', 'th', 'vi', 'hi', 'ar', 'fa', 'tr', 'he', 'ru', 'uk', 'be', 'kk', 'uz', 'ky', 'tg', 'tk', 'ur', 'bn', 'si', 'ne', 'dz', 'dv', 'my', 'lo', 'km', 'ta', 'ml', 'kn', 'te', 'mr', 'gu', 'pa', 'as', 'or'];
};

// Check if a language is supported
const isLanguageSupported = (lang) => {
  const supportedLanguages = getSupportedLanguages();
  return supportedLanguages.includes(lang) || supportedLanguages.includes(lang.split('-')[0]);
};

// Get the best matching language
const getBestLanguage = (preferredLang) => {
  const supportedLanguages = getSupportedLanguages();
  
  // Exact match
  if (supportedLanguages.includes(preferredLang)) {
    return preferredLang;
  }
  
  // Language code match (without region)
  const langCode = preferredLang.split('-')[0];
  const exactMatch = supportedLanguages.find(lang => lang.startsWith(langCode));
  if (exactMatch) {
    return exactMatch;
  }
  
  // Fallback to English
  return 'en';
};

// Detect language based on geolocation
export const detectLanguageFromLocation = async (countryCode, regionCode = null) => {
  try {
    // Check if country has language preferences based on region
    if (COUNTRY_LANGUAGE_PREFERENCES[countryCode] && regionCode) {
      const regionLang = COUNTRY_LANGUAGE_PREFERENCES[countryCode](regionCode);
      if (isLanguageSupported(regionLang)) {
        return getBestLanguage(regionLang);
      }
    }
    
    // Use country-based language mapping
    const countryLang = COUNTRY_LANGUAGE_MAP[countryCode];
    if (countryLang && isLanguageSupported(countryLang)) {
      return getBestLanguage(countryLang);
    }
    
    // Fallback to browser language
    const browserLang = getBrowserLanguage();
    return getBestLanguage(browserLang);
  } catch (error) {
    console.error('Error detecting language from location:', error);
    return 'en';
  }
};

// Get detailed location information
export const getDetailedLocation = async () => {
  try {
    // Try to get location from IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
   /*  const response = "109.172.80.0"; */
    if (!response.ok) {


      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    return {
      country: data.country_code,
      countryName: data.country_name,
      region: data.region_code,
      regionName: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      currency: data.currency,
      languages: data.languages ? data.languages.split(',') : [],
      isp: data.org,
      ip: data.ip
    };
  } catch (error) {
    console.error('Error getting detailed location:', error);
    
    // Fallback to browser geolocation API
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false
        });
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (geoError) {
      console.error('Browser geolocation also failed:', geoError);
      return null;
    }
  }
};

// Main function to detect and set language based on geolocation
export const detectAndSetLanguage = async (i18nInstance) => {
  try {
    // Get location data
    const locationData = await getDetailedLocation();
    
    if (!locationData || !locationData.country) {
      // Fallback to browser language
      const browserLang = getBrowserLanguage();
      const detectedLang = getBestLanguage(browserLang);
      
      if (i18nInstance.language !== detectedLang) {
        await i18nInstance.changeLanguage(detectedLang);
      }
      
      return detectedLang;
    }
    
    // Detect language based on location
    const detectedLang = await detectLanguageFromLocation(
      locationData.country,
      locationData.region
    );
    
    // Change language if different from current
    if (i18nInstance.language !== detectedLang) {
      await i18nInstance.changeLanguage(detectedLang);
    }
    
    // Store location and language preferences
    localStorage.setItem('giftygen_user_location', JSON.stringify(locationData));
    localStorage.setItem('giftygen_detected_language', detectedLang);
    
    return detectedLang;
  } catch (error) {
    console.error('Error in detectAndSetLanguage:', error);
    
    // Fallback to stored preferences or browser language
    const storedLang = localStorage.getItem('giftygen_detected_language');
    const browserLang = getBrowserLanguage();
    const fallbackLang = storedLang || getBestLanguage(browserLang);
    
    if (i18nInstance.language !== fallbackLang) {
      await i18nInstance.changeLanguage(fallbackLang);
    }
    
    return fallbackLang;
  }
};

// Get user's preferred language with fallbacks
export const getUserPreferredLanguage = () => {
  // 1. Check stored language preference
  const storedLang = localStorage.getItem('giftygen_detected_language');
  if (storedLang && isLanguageSupported(storedLang)) {
    return storedLang;
  }
  
  // 2. Check browser language
  const browserLang = getBrowserLanguage();
  if (isLanguageSupported(browserLang)) {
    return getBestLanguage(browserLang);
  }
  
  // 3. Default to English
  return 'en';
};

// Update language based on user selection
export const updateLanguage = async (i18nInstance, newLanguage) => {
  try {
    await i18nInstance.changeLanguage(newLanguage);
    localStorage.setItem('giftygen_detected_language', newLanguage);
    localStorage.setItem('giftygen_user_language_override', 'true');
    return true;
  } catch (error) {
    console.error('Error updating language:', error);
    return false;
  }
};

// Check if user has manually overridden language
export const hasUserOverriddenLanguage = () => {
  return localStorage.getItem('giftygen_user_language_override') === 'true';
};

// Reset language detection (useful for testing or user preference reset)
export const resetLanguageDetection = () => {
  localStorage.removeItem('giftygen_detected_language');
  localStorage.removeItem('giftygen_user_language_override');
  localStorage.removeItem('giftygen_user_location');
};