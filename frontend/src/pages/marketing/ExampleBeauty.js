 import React from "react";
 import ExampleIndustryPage from "./ExampleIndustryPage";

 const giftCards = [
   {
     title: "Signature Spa Day",
     tag: "Relax",
     amount: 6000,
     discount: 20,
     image:
       "https://images.pexels.com/photos/3738340/pexels-photo-3738340.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Full‑body massage, steam session, and herbal tea service designed to reset mind and body in one visit.",
   },
   {
     title: "Salon Makeover Session",
     tag: "Makeover",
     amount: 4500,
     discount: 18,
     image:
       "https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Premium haircut, nourishing hair spa, and finishing style—ideal before events, shoots, or celebrations.",
   },
   {
     title: "Bridal & Occasion Prep",
     tag: "Occasion",
     amount: 11000,
     discount: 25,
     image:
       "https://images.pexels.com/photos/3762653/pexels-photo-3762653.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Pre‑event facial, hair styling, and makeup session with advance consultation included for the bride or main guest.",
   },
 ];

 const ExampleBeauty = () => {
   return (
     <ExampleIndustryPage
       industryLabel="Beauty & Personal Care"
       businessName="Aura Salon & Spa"
       locationText="Bandra West, Mumbai · Maharashtra, India"
       subtitle="A design‑driven salon and spa focused on conscious beauty, relaxation, and expert‑led treatments."
       heroImage="https://images.pexels.com/photos/3738340/pexels-photo-3738340.jpeg?auto=compress&cs=tinysrgb&w=1600"
       heroChips={["Unisex Salon & Spa", "Dermat‑approved Products", "Great Gift for Her & Him"]}
       about="Aura Salon & Spa combines international techniques with dermatologist‑backed products. With dedicated zones for hair, skin, and spa, the space is crafted for people who see beauty and self‑care as part of their weekly routine—not just a one‑time splurge."
       highlights={[
         "Expert stylists and therapists trained on global techniques",
         "Separate areas for hair, skin, and spa to keep experiences calm and focused",
         "Use of leading professional brands for hair and skin care",
         "Bridal, pre‑wedding, and event‑ready packages available",
         "Hygiene‑first approach with sanitized tools and disposable kits where needed",
       ]}
       howItWorks={[
         "Pick a gift card based on occasion—relaxation, makeover, or bridal prep.",
         "Pay online and share the digital card with the recipient via email or WhatsApp.",
         "They call or message the salon to book an appointment in their preferred slot.",
         "On visit, they show the QR code or code from the email; the treatment is adjusted to their hair/skin needs within the card value.",
       ]}
       faqs={[
         {
           q: "Is prior appointment mandatory?",
           a: "Yes, appointments are required so the right stylist or therapist can be reserved. Same‑day slots are subject to availability.",
         },
         {
           q: "Can treatments be customised?",
           a: "Absolutely. Within the value of the gift card, the team recommends the best combination of services based on hair and skin analysis.",
         },
         {
           q: "Are there any health restrictions?",
           a: "Certain spa and skin treatments may not be suitable during pregnancy or for specific skin conditions. The team reviews this during the consultation and suggests safer alternatives where needed.",
         },
       ]}
       meta={["Appointment required", "Patch test recommended for colour services", "Late‑cancellation/no‑show fees may apply"]}
       kpis={[
         { label: "Ideal for", value: "Birthdays, anniversaries, self‑care days", sub: "Friends, partners, and family" },
         { label: "Session length", value: "60–150 mins", sub: "Depending on package and add‑ons" },
         { label: "Best days", value: "Weekdays", sub: "Quieter slots and more flexibility" },
       ]}
       giftCards={giftCards}
       cardsSubtitle="Salon‑style gift experiences that look like a dedicated beauty website, fully powered by Giftygen behind the scenes."
     />
   );
 };

 export default ExampleBeauty;

