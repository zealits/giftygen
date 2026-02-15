 import React from "react";
 import ExampleIndustryPage from "./ExampleIndustryPage";

 const giftCards = [
   {
     title: "Everyday Fashion Gift Card",
     tag: "All Occasions",
     amount: 3000,
     discount: 18,
     image:
       "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Perfect for birthdays, quick surprises, or just‑because gifts—valid across all casual and workwear collections.",
   },
   {
     title: "Festive Shopping Gift Card",
     tag: "Festive",
     amount: 7000,
     discount: 22,
     image:
       "https://images.pexels.com/photos/5632403/pexels-photo-5632403.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Ideal for Diwali, Christmas, and wedding seasons; redeemable on outfits, accessories, and curated festive edits.",
   },
   {
     title: "Premium Wardrobe Upgrade",
     tag: "Premium",
     amount: 12000,
     discount: 25,
     image:
       "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "High‑value card for statement pieces, occasion wear, or complete wardrobe refresh sessions with an in‑store stylist.",
   },
 ];

 const ExampleRetail = () => {
   return (
     <ExampleIndustryPage
       industryLabel="Retail & E‑commerce"
       businessName="Nova Streetwear Co."
       locationText="Pan‑India · Online + Flagship Stores in Mumbai & Bengaluru"
       subtitle="A modern streetwear and lifestyle label built for everyday comfort and bold personal expression."
       heroImage="https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1600"
       heroChips={["Online + In‑store", "Free Size Exchanges", "Easy Gifting"]}
       about="Nova Streetwear Co. blends minimal silhouettes with playful colours across tees, jackets, cargos, and accessories. With both online and offline presence, it’s built for shoppers who browse on their phone but love trying key pieces in‑store."
       highlights={[
         "Redeemable on website, app, and flagship stores",
         "Size‑friendly policies with free first exchange",
         "New drops every month for repeat shoppers",
         "Gift cards that work across clothing, footwear, and accessories",
         "Digital delivery with options to schedule for special dates",
       ]}
       howItWorks={[
         "Select the gift card value that matches the occasion or budget.",
         "Complete the payment and choose email delivery to yourself or directly to the recipient.",
         "The receiver gets a unique code and link usable on the website, app, or selected stores.",
         "They add items to cart and redeem the card at checkout—any remaining balance stays active until expiry.",
       ]}
       faqs={[
         {
           q: "Where can this gift card be used?",
           a: "Gift cards are redeemable on the brand’s official website, mobile app, and flagship stores listed on the store locator page.",
         },
         {
           q: "Can it be combined with ongoing offers?",
           a: "In most cases, gift cards can be combined with seasonal offers unless specifically mentioned in the campaign terms.",
         },
         {
           q: "What happens if the order amount is lower or higher than the card value?",
           a: "If the cart value is lower, the remaining balance stays on the card. If higher, the customer simply pays the difference via regular payment methods.",
         },
       ]}
       meta={["Usable across online and flagship stores", "No additional convenience fee", "Standard return and exchange policies apply"]}
       kpis={[
         { label: "Ideal for", value: "Birthdays, festivals & rewards", sub: "Friends, family, and team incentives" },
         { label: "Average order", value: "₹2,500–₹4,500", sub: "Per transaction using a gift card" },
         { label: "Delivery", value: "Instant email delivery", sub: "Option to schedule for later dates" },
       ]}
       giftCards={giftCards}
       cardsSubtitle="Retail‑style gift cards that behave like store credit while you manage everything from your Giftygen dashboard."
     />
   );
 };

 export default ExampleRetail;

