import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for managing meta tags, Open Graph, Twitter Cards, and structured data
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (default: "GiftyGen - Digital Gift Cards")
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Comma-separated keywords
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (website, article, product, etc.)
 * @param {Object} props.structuredData - JSON-LD structured data object
 * @param {boolean} props.noindex - Set to true to prevent indexing
 * @param {string} props.author - Page author
 */
const SEO = ({
  title = 'GiftyGen - Digital Gift Cards for Restaurants & Businesses',
  description = 'Create and sell digital gift cards for your restaurant or business. No setup fees, instant QR code delivery, custom branded cards, and real-time analytics. Increase revenue by 25% and build customer loyalty with GiftyGen\'s commission-free platform.',
  keywords = 'digital gift card platform for restaurants, restaurant gift card software, gift card system for small business, create gift cards for my business, online gift card solution, e-gift card provider, custom branded gift cards, gift card management platform, QR code gift cards, contactless gift card sales, gift card POS integration, sell gift cards online restaurant',
  image = 'https://giftygen.com/logo512.png',
  url = 'https://giftygen.com',
  type = 'website',
  structuredData = null,
  noindex = false,
  author = 'GiftyGen',
  hreflang = null, // Array of { lang: 'en', url: 'https://...' }
}) => {
  const fullTitle = title.includes('GiftyGen') ? title : `${title} | GiftyGen`;
  const fullUrl = url.startsWith('http') ? url : `https://giftygen.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://giftygen.com${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="GiftyGen" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@giftygen" />
      <meta name="twitter:site" content="@giftygen" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Hreflang tags for multi-language support */}
      {hreflang && Array.isArray(hreflang) && hreflang.map((item, index) => (
        <link key={index} rel="alternate" hreflang={item.lang} href={item.url} />
      ))}
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((schema, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Helmet>
  );
};

export default SEO;


