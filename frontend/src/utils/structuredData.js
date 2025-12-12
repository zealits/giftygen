/**
 * Utility functions for generating structured data (JSON-LD)
 * These help search engines understand your content better
 */

/**
 * Generate Organization structured data
 */
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GiftyGen",
  "url": "https://giftygen.com",
  "logo": "https://giftygen.com/logo512.png",
  "description": "Digital gift card platform for restaurants and businesses",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@giftygen.com",
    "contactType": "Customer Service"
  },
  "sameAs": [
    // Add your social media profiles here
    // "https://www.facebook.com/giftygen",
    // "https://www.twitter.com/giftygen",
    // "https://www.linkedin.com/company/giftygen"
  ]
});

/**
 * Generate Website structured data
 */
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GiftyGen",
  "url": "https://giftygen.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://giftygen.com/explore?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

/**
 * Generate Product/Service structured data for gift cards
 */
export const getServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Digital Gift Card Platform",
  "provider": {
    "@type": "Organization",
    "name": "GiftyGen"
  },
  "areaServed": "Worldwide",
  "description": "Digital gift card creation and management platform for restaurants and businesses"
});

/**
 * Generate BreadcrumbList structured data
 */
export const getBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Generate Product structured data for a specific gift card
 */
export const getGiftCardProductSchema = (giftCard) => {
  if (!giftCard) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": giftCard.title || giftCard.name || "Gift Card",
    "description": giftCard.description || "Digital gift card",
    "image": giftCard.image || "https://giftygen.com/logo512.png",
    "offers": {
      "@type": "Offer",
      "price": giftCard.price || giftCard.amount || "0",
      "priceCurrency": giftCard.currency || "USD",
      "availability": "https://schema.org/InStock",
      "url": `https://giftygen.com/gift-card/${giftCard.id}`
    },
    "brand": {
      "@type": "Brand",
      "name": giftCard.businessName || "GiftyGen"
    }
  };
};

/**
 * Generate FAQPage structured data
 */
export const getFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};



