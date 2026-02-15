 import React from "react";
 import ExampleIndustryPage from "./ExampleIndustryPage";

 const giftCards = [
   {
     title: "14‑Day Trial Membership",
     tag: "Starter",
     amount: 2499,
     discount: 40,
     image:
       "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Unlimited gym floor access, 4 group classes, and one complimentary fitness assessment with a certified coach.",
   },
   {
     title: "3‑Month Transformation Pack",
     tag: "Most Popular",
     amount: 11999,
     discount: 28,
     image:
       "https://images.pexels.com/photos/7991652/pexels-photo-7991652.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Full gym membership with personalized workout plan, nutrition guidance, and progress tracking every 4 weeks.",
   },
   {
     title: "Wellness & Recovery Pack",
     tag: "Wellness",
     amount: 6999,
     discount: 25,
     image:
       "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=1200",
     description:
       "Yoga, mobility, and guided stretching sessions designed for stress relief, posture correction, and recovery.",
   },
 ];

 const ExampleFitness = () => {
   return (
     <ExampleIndustryPage
       industryLabel="Fitness & Wellness Memberships"
       businessName="PulseFit Studio"
       locationText="Koramangala, Bengaluru · Karnataka, India"
       subtitle="A boutique fitness and wellness studio focused on strength, mobility, and long‑term health."
       heroImage="https://images.pexels.com/photos/7991652/pexels-photo-7991652.jpeg?auto=compress&cs=tinysrgb&w=1600"
       heroChips={["Strength Training", "Yoga & Mobility", "Coach‑Led Sessions"]}
       about="PulseFit Studio bridges the gap between a traditional gym and a performance lab. Small‑group training, guided classes, and personalised programs make it easy for beginners and enthusiasts to build sustainable fitness habits."
       highlights={[
         "Certified coaches with experience across strength, mobility, and conditioning",
         "Small class sizes with form correction and individual attention",
         "Goal‑based programming—from fat loss to strength or mobility",
         "Locker rooms, showers, and complimentary recovery routines",
         "Beginner‑friendly onboarding and assessment session",
       ]}
       howItWorks={[
         "Select a membership or program gift card based on duration and focus area.",
         "Pay online and share the digital gift card with the recipient instantly.",
         "They schedule their first visit using the QR code or link in the email.",
         "The team activates the membership on their first visit after a quick fitness assessment.",
       ]}
       faqs={[
         {
           q: "Does the membership start from purchase date or first visit?",
           a: "Membership validity starts from the first activation/visit date, not the purchase date—making it easy to gift in advance.",
         },
         {
           q: "Can sessions be paused or extended?",
           a: "Short freezes are allowed for travel or illness, as per studio policy. The team helps with date adjustments at the front desk.",
         },
         {
           q: "Is this suitable for beginners?",
           a: "Yes. Every new member starts with a guided assessment so coaches can adapt intensity and movements to their current level.",
         },
       ]}
       meta={["KYC required at first visit", "Non‑transferable once activated", "Medical clearance advised for existing conditions"]}
       kpis={[
         { label: "Ideal for", value: "Beginners & busy professionals", sub: "People who want structured guidance" },
         { label: "Session format", value: "45–60 mins", sub: "Coach‑led small groups & personal training" },
         { label: "Peak hours", value: "6–9 AM & 6–9 PM", sub: "Off‑peak benefits with flexible passes" },
       ]}
       giftCards={giftCards}
       cardsSubtitle="Membership‑style gift cards that feel like a dedicated studio website while running fully on Giftygen."
     />
   );
 };

 export default ExampleFitness;

