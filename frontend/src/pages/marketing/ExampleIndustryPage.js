 import React from "react";
 import { MapPin, Gift } from "lucide-react";
 import "../user/UserLanding.css";
 import "./ExampleIndustryPage.css";

 const ExampleIndustryPage = ({
   industryLabel,
   businessName,
   locationText,
   subtitle,
   heroImage,
   heroChips = [],
   giftCards = [],
   about,
   highlights = [],
   howItWorks = [],
   faqs = [],
   meta = [],
   kpis = [],
   cardsSubtitle,
 }) => {
   return (
     <div className="body example-page">
       <header className="business-hero-with-gallery">
         <div
           className="carousel-image-container"
           style={{
             backgroundImage: `url(${heroImage})`,
             backgroundSize: "cover",
             backgroundPosition: "center",
           }}
         >
           <div className="carousel-overlay" />
           <div className="business-info-overlay">
             <div className="business-overlay-content">
               <div className="business-branding">
                 <div
                   className="business-logo-hero"
                   style={{
                     backgroundImage: `url(${heroImage})`,
                     backgroundSize: "cover",
                     backgroundPosition: "center",
                   }}
                 />
                 <div className="business-name-section">
                   <p className="example-breadcrumb">{industryLabel}</p>
                   <h1 className="business-name-hero">{businessName}</h1>
                   {subtitle && <p className="business-subtitle-hero">{subtitle}</p>}
                 </div>
               </div>

               <div className="business-address-hero">
                 <MapPin size={18} className="address-icon" />
                 <span className="address-text-hero">{locationText}</span>
               </div>

               {heroChips?.length > 0 && (
                 <div className="example-hero-chip-row">
                   {heroChips.map((chip) => (
                     <span key={chip} className="example-hero-chip">
                       {chip}
                     </span>
                   ))}
                 </div>
               )}

               <div className="example-hero-cta-row">
                 <button type="button" className="example-hero-cta-primary">
                   <Gift size={18} />
                   <span>Buy Gift Card</span>
                 </button>
                 <button type="button" className="example-hero-cta-secondary">
                   View Experience Details
                 </button>
               </div>
             </div>
           </div>
         </div>
       </header>

       <main className="example-main">
         <section className="example-search-banner">
           <div className="example-search-label">
             <strong>Looking for something specific?</strong>
             <div className="example-section-tagline">
               Guests typically search by occasion, budget, or who they’re gifting.
             </div>
           </div>
           <div className="example-search-tags">
             <span className="example-search-tag">Birthday</span>
             <span className="example-search-tag">Anniversary</span>
             <span className="example-search-tag">For the Team</span>
             <span className="example-search-tag">Weekend Plan</span>
           </div>
         </section>

         <section className="example-layout">
           <div className="example-layout-column">
             <article className="example-section-card">
               <div className="example-section-title">About</div>
               <h2 className="example-section-heading">Experience Overview</h2>
               <p className="example-section-body">{about}</p>

               {kpis?.length > 0 && (
                 <div className="example-kpi-row">
                   {kpis.map((kpi) => (
                     <div key={kpi.label} className="example-kpi-item">
                       <div className="example-kpi-label">{kpi.label}</div>
                       <div className="example-kpi-value">{kpi.value}</div>
                       {kpi.sub && <div className="example-kpi-sub">{kpi.sub}</div>}
                     </div>
                   ))}
                 </div>
               )}
             </article>

             {highlights?.length > 0 && (
               <article className="example-section-card">
                 <div className="example-section-title">Highlights</div>
                 <h2 className="example-section-heading">Why guests love this place</h2>
                 <ul className="example-list">
                   {highlights.map((item) => (
                     <li key={item} className="example-list-item">
                       <span className="example-list-item-bullet" />
                       <span>{item}</span>
                     </li>
                   ))}
                 </ul>
               </article>
             )}
           </div>

           <div className="example-layout-column">
             {howItWorks?.length > 0 && (
               <article className="example-section-card">
                 <div className="example-section-title">How it works</div>
                 <h2 className="example-section-heading">Gifting made simple</h2>
                 <ol className="example-list">
                   {howItWorks.map((step, index) => (
                     <li key={step} className="example-list-item">
                       <span className="example-meta-pill">{`Step ${index + 1}`}</span>
                       <span>{step}</span>
                     </li>
                   ))}
                 </ol>
               </article>
             )}

             {faqs?.length > 0 && (
               <article className="example-section-card">
                 <div className="example-section-title">FAQs</div>
                 <h2 className="example-section-heading">Good to know before you gift</h2>
                 <div className="example-faq-list">
                   {faqs.map((faq) => (
                     <div key={faq.q}>
                       <div className="example-faq-item-question">{faq.q}</div>
                       <div className="example-faq-item-answer">{faq.a}</div>
                       <div className="example-section-divider" />
                     </div>
                   ))}
                 </div>
               </article>
             )}

             {meta?.length > 0 && (
               <article className="example-section-card">
                 <div className="example-section-title">Details & Policies</div>
                 <div className="example-meta-row">
                   {meta.map((m) => (
                     <div key={m} className="example-meta-pill">
                       {m}
                     </div>
                   ))}
                 </div>
               </article>
             )}
           </div>
         </section>

         <section className="example-cards-heading">
           <div>
             <h2 className="example-cards-title">Gift Cards curated for this experience</h2>
             {cardsSubtitle && <p className="example-cards-subtitle">{cardsSubtitle}</p>}
           </div>
           <div className="example-chip-row">
             <span className="example-chip">Occasion based</span>
             <span className="example-chip">Experience first</span>
             <span className="example-chip">Digital delivery</span>
           </div>
         </section>

         <section className="purchase-card-container">
           {giftCards.map((card) => (
             <article key={card.title} className="purchase-card modern-card">
               <div className="purchase-card-image modern-card-image">
                 <img src={card.image} alt={card.title} loading="lazy" />
                 <div className="card-image-overlay" />
                 {card.tag && (
                   <div className="purchase-card-tag modern-tag">
                     <i className="fa-solid fa-gift" /> {card.tag}
                   </div>
                 )}
                 <div className="business-card-badge modern-badge">
                   <span className="business-badge-text">{businessName}</span>
                 </div>
               </div>
               <div className="purchase-card-content modern-card-content">
                 <h3 className="purchase-card-title modern-card-title">{card.title}</h3>
                 <p className="purchase-card-description modern-card-description">{card.description}</p>
                 <div className="purchase-card-info modern-card-info">
                   <div className="price-section">
                     <span className="purchase-card-price modern-price">₹ {card.amount.toLocaleString("en-IN")}</span>
                     <span className="price-label">Gift value</span>
                   </div>
                   <div className="discount-section">
                     <span className="purchase-card-discount modern-discount">{card.discount}% OFF</span>
                   </div>
                 </div>
                 <button type="button" className="purchase-card-button modern-card-button">
                   <Gift size={18} />
                   <span>Buy now</span>
                 </button>
               </div>
             </article>
           ))}
         </section>
       </main>

       <footer className="footer">
         <div className="footer-bottom">
           <p>&copy; 2025 {businessName}. All rights reserved. Powered by Giftygen.</p>
         </div>
       </footer>
     </div>
   );
 };

 export default ExampleIndustryPage;

