 import React from "react";
 import ExampleIndustryPage from "./ExampleIndustryPage";

 const giftCards = [
   {
     title: "Diwali Celebration Pack",
     tag: "Diwali",
     amount: 5000,
     discount: 20,
     image:
       "https://images.pexels.com/photos/1667859/pexels-photo-1667859.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Curated festive experiences—dining, shopping, or spa—redeemable across partner brands during the Diwali season.",
   },
   {
     title: "New Year’s Eve Experience",
     tag: "New Year",
     amount: 9000,
     discount: 22,
     image:
       "https://images.pexels.com/photos/2608519/pexels-photo-2608519.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Entry to New Year celebrations at select venues with food, beverages, and live entertainment included.",
   },
   {
     title: "Corporate Festive Bundle",
     tag: "Corporate",
     amount: 25000,
     discount: 30,
     image:
       "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Bulk‑friendly card designed for teams and clients—redeemable on multiple partner brands across categories.",
   },
 ];

 const ExampleSeasonal = () => {
   return (
     <ExampleIndustryPage
       industryLabel="Seasonal & Campaign‑based Gifting"
       businessName="Festive Favourites by Giftygen"
       locationText="Pan‑India · Multi‑brand digital experiences"
       subtitle="A seasonal microsite showcasing curated gift cards for festivals, year‑end rewards, and special campaigns."
       heroImage="https://images.pexels.com/photos/1667859/pexels-photo-1667859.jpeg?auto=compress&cs=tinysrgb&w=1600"
       heroChips={["Multi‑brand", "Perfect for Festivals", "Great for Corporate Gifting"]}
       about="Festive Favourites brings together hand‑picked experiences from restaurants, hotels, salons, fitness studios, and retail brands into one seasonal catalogue. It’s designed for individuals and companies who want gifting to feel personal, but easy to manage at scale."
       highlights={[
         "Pre‑curated bundles for Diwali, Christmas, New Year, Eid, and more",
         "Works beautifully as a seasonal microsite link from email or social campaigns",
         "Supports individual gifting and bulk corporate orders from the same interface",
         "Digital delivery ensures gifts arrive instantly—no logistics or shipping needed",
         "Clear validity and branding so recipients know exactly where and how to redeem",
       ]}
       howItWorks={[
         "Pick a seasonal theme (Diwali, New Year, Year‑end rewards, etc.) and choose gift cards or bundles.",
         "For individuals, complete payment and send the gift instantly via email or WhatsApp.",
         "For bulk orders, upload a recipient list or connect with sales via a corporate enquiry CTA.",
         "Recipients choose or redeem experiences as per the campaign rules before the validity date.",
       ]}
       faqs={[
         {
           q: "Are seasonal gift cards valid only until the festival date?",
           a: "No. While campaigns are themed around specific festivals, cards usually remain valid for 3–6 months from purchase, unless stated otherwise.",
         },
         {
           q: "Can companies add their logo or message?",
           a: "Yes. Corporate clients can white‑label parts of the experience with their logo, greeting line, and custom email copy.",
         },
         {
           q: "Can I mix experiences from different categories in one order?",
           a: "Absolutely. A single campaign can include restaurant, hotel, beauty, fitness, and retail experiences depending on how you configure it.",
         },
       ]}
       meta={["Limited‑time campaigns", "Bulk enquiry support", "Ideal for HR, marketing & CX teams"]}
       kpis={[
         { label: "Ideal for", value: "Festivals & year‑end rewards", sub: "HR teams, CX campaigns, and brand promos" },
         { label: "Campaign window", value: "2–8 weeks", sub: "With 3–6 months redemption validity in most cases" },
         { label: "Scale", value: "10–10,000 recipients", sub: "Supports both small teams and large enterprises" },
       ]}
       giftCards={giftCards}
       cardsSubtitle="An example seasonal microsite layout that can be reused across Diwali, New Year, or any custom campaign."
     />
   );
 };

 export default ExampleSeasonal;

