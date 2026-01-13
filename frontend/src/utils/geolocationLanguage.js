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

// Mapping from ISO language codes to i18n language keys
const ISO_TO_I18N_MAP = {
  'ta': 'Tamil',
  'ml': 'Malay',
  'kn': 'kan',
  'te': 'telu',
  'gu': 'Guja',
  'pa': 'panja',
  'bn': 'ben',
  'or': 'Odi',
  'ur': 'urdu',
  'mr': 'mr',
  'hi': 'hi',
  'en': 'en'
};

// Indian state code variations (handle different formats from geolocation APIs)
const INDIAN_STATE_CODES = {
  // Tamil Nadu
  'TN': 'Tamil', 'Tamil Nadu': 'Tamil', 'TAMIL NADU': 'Tamil', 'tamil nadu': 'Tamil',
  // Kerala
  'KL': 'Malay', 'Kerala': 'Malay', 'KERALA': 'Malay', 'kerala': 'Malay',
  // Karnataka
  'KA': 'kan', 'Karnataka': 'kan', 'KARNATAKA': 'kan', 'karnataka': 'kan',
  // Andhra Pradesh / Telangana
  'AP': 'telu', 'TG': 'telu', 'Andhra Pradesh': 'telu', 'Telangana': 'telu',
  'ANDHRA PRADESH': 'telu', 'TELANGANA': 'telu', 'andhra pradesh': 'telu', 'telangana': 'telu',
  // Maharashtra
  'MH': 'mr', 'Maharashtra': 'mr', 'MAHARASHTRA': 'mr', 'maharashtra': 'mr',
  // Gujarat
  'GJ': 'Guja', 'Gujarat': 'Guja', 'GUJARAT': 'Guja', 'gujarat': 'Guja',
  // Punjab
  'PB': 'panja', 'Punjab': 'panja', 'PUNJAB': 'panja', 'punjab': 'panja',
  // West Bengal
  'WB': 'ben', 'West Bengal': 'ben', 'WEST BENGAL': 'ben', 'west bengal': 'ben',
  // Odisha
  'OR': 'Odi', 'Odisha': 'Odi', 'ODISHA': 'Odi', 'odisha': 'Odi', 'Orissa': 'Odi',
  // Jammu & Kashmir
  'JK': 'urdu', 'Jammu and Kashmir': 'urdu', 'JAMMU AND KASHMIR': 'urdu', 'jammu and kashmir': 'urdu',
  // Other states default to Hindi
  'RJ': 'hi', 'UP': 'hi', 'MP': 'hi', 'HP': 'hi', 'UT': 'hi', 'CT': 'hi', 'JH': 'hi',
  'BR': 'hi', 'DL': 'hi', 'CH': 'hi', 'AN': 'hi', 'LD': 'hi', 'PY': 'hi', 'GA': 'hi',
  'MN': 'hi', 'MZ': 'hi', 'NL': 'hi', 'SK': 'hi', 'TR': 'hi', 'AR': 'hi', 'ML': 'hi',
  'MI': 'hi', 'NA': 'hi', 'AS': 'hi' // Assam - no Assamese translation available, defaulting to Hindi
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
    if (!region) return 'hi'; // Default to Hindi if no region
    
    // Normalize region code (handle case variations)
    const normalizedRegion = typeof region === 'string' ? region.trim() : String(region);
    
    // Check direct mapping (case-insensitive)
    const directMatch = INDIAN_STATE_CODES[normalizedRegion];
    if (directMatch) {
      return directMatch;
    }
    
    // Try case-insensitive lookup
    const upperRegion = normalizedRegion.toUpperCase();
    const lowerRegion = normalizedRegion.toLowerCase();
    const titleRegion = normalizedRegion.charAt(0).toUpperCase() + normalizedRegion.slice(1).toLowerCase();
    
    if (INDIAN_STATE_CODES[upperRegion]) {
      return INDIAN_STATE_CODES[upperRegion];
    }
    if (INDIAN_STATE_CODES[lowerRegion]) {
      return INDIAN_STATE_CODES[lowerRegion];
    }
    if (INDIAN_STATE_CODES[titleRegion]) {
      return INDIAN_STATE_CODES[titleRegion];
    }
    
    // Fallback to Hindi for unknown states
    console.log(`Unknown Indian state/region code: ${region}, defaulting to Hindi`);
    return 'hi';
  }
};

// Fallback language detection based on browser settings
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  return browserLang.split('-')[0]; // Get language code without region
};

// Get supported languages from i18n configuration
const getSupportedLanguages = () => {
  // Get actual language keys from i18n resources
  const i18nLanguages = i18n.options.resources ? Object.keys(i18n.options.resources) : [];
  
  // If i18n has supportedLngs, use that, otherwise use resource keys
  return i18n.options.supportedLngs || i18nLanguages.length > 0 ? i18nLanguages : [
    'en', 'de', 'hi', 'mr', 'Guja', 'panja', 'Tamil', 'telu', 'kan', 
    'Malay', 'ben', 'Odi', 'urdu', 'ru', 'th', 'ch'
  ];
};

// Check if a language is supported
const isLanguageSupported = (lang) => {
  if (!lang) return false;
  
  const supportedLanguages = getSupportedLanguages();
  
  // Exact match
  if (supportedLanguages.includes(lang)) {
    return true;
  }
  
  // Check ISO to i18n mapping
  if (ISO_TO_I18N_MAP[lang] && supportedLanguages.includes(ISO_TO_I18N_MAP[lang])) {
    return true;
  }
  
  // Case-insensitive match
  if (supportedLanguages.some(supported => 
    supported.toLowerCase() === lang.toLowerCase()
  )) {
    return true;
  }
  
  // Language code match (without region)
  const langCode = lang.split('-')[0];
  if (supportedLanguages.some(supported => 
    supported.toLowerCase().startsWith(langCode.toLowerCase())
  )) {
    return true;
  }
  
  return false;
};

// Get the best matching language
const getBestLanguage = (preferredLang) => {
  if (!preferredLang) return 'en';
  
  const supportedLanguages = getSupportedLanguages();
  
  // Exact match
  if (supportedLanguages.includes(preferredLang)) {
    return preferredLang;
  }
  
  // Check ISO to i18n mapping (for Indian languages)
  if (ISO_TO_I18N_MAP[preferredLang]) {
    const mappedLang = ISO_TO_I18N_MAP[preferredLang];
    if (supportedLanguages.includes(mappedLang)) {
      return mappedLang;
    }
  }
  
  // Case-insensitive match
  const caseInsensitiveMatch = supportedLanguages.find(
    lang => lang.toLowerCase() === preferredLang.toLowerCase()
  );
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch;
  }
  
  // Language code match (without region)
  const langCode = preferredLang.split('-')[0];
  const exactMatch = supportedLanguages.find(lang => 
    lang.toLowerCase().startsWith(langCode.toLowerCase())
  );
  if (exactMatch) {
    return exactMatch;
  }
  
  // Fallback to English
  return 'en';
};

// Detect language based on geolocation
export const detectLanguageFromLocation = async (countryCode, regionCode = null) => {
  try {
    // Log for debugging
    console.log('Language detection:', { countryCode, regionCode });
    
    // Check if country has language preferences based on region
    if (COUNTRY_LANGUAGE_PREFERENCES[countryCode] && regionCode) {
      const regionLang = COUNTRY_LANGUAGE_PREFERENCES[countryCode](regionCode);
      console.log('Region-based language detected:', regionLang);
      
      if (isLanguageSupported(regionLang)) {
        const bestLang = getBestLanguage(regionLang);
        console.log('Using region language:', bestLang);
        return bestLang;
      } else {
        console.log('Region language not supported, trying fallback');
      }
    }
    
    // Use country-based language mapping
    const countryLang = COUNTRY_LANGUAGE_MAP[countryCode];
    if (countryLang && isLanguageSupported(countryLang)) {
      const bestLang = getBestLanguage(countryLang);
      console.log('Using country language:', bestLang);
      return bestLang;
    }
    
    // Fallback to browser language
    const browserLang = getBrowserLanguage();
    const bestLang = getBestLanguage(browserLang);
    console.log('Using browser language:', bestLang);
    return bestLang;
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
    
    // Log the API response for debugging
    console.log('Geolocation API response:', {
      country_code: data.country_code,
      region_code: data.region_code,
      region: data.region,
      city: data.city
    });
    
    // Handle different region code formats from ipapi.co
    // Sometimes it returns region_code, sometimes region name
    let regionCode = data.region_code || data.region;
    
    // If region is a full name, try to extract code or use the name
    if (!regionCode && data.region) {
      regionCode = data.region;
    }
    
    return {
      country: data.country_code,
      countryName: data.country_name,
      region: regionCode, // Use the best available region identifier
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