/**
 * Industry-specific options and placeholders for Business Profile > Page Customization.
 * Used for Subtitle/Category, Known For/Highlights, and dynamic placeholders.
 */

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

export const INDUSTRY_PAGE_CONFIG = {
  "Restaurant And Fine Dining": {
    customTabLabel: "Menu",
    customTabPlaceholder: "e.g. STARTERS — Paneer Tikka, Mushroom...\nMAIN COURSE — Biryani, Curry...",
    tagsLabel: "Cuisine tags (comma-separated)",
    tagsPlaceholder: "North Indian, European, BBQ, Desserts",
    subtitleOptions: [
      "Fine Dining",
      "Casual Dining",
      "Cafe",
      "North Indian",
      "South Indian",
      "European",
      "Asian",
      "BBQ",
      "Seafood",
      "Vegetarian",
      "Desserts",
      "Bar",
      "Rooftop",
      "Family-friendly",
    ],
    subtitlePlaceholder: "e.g. Fine Dining, European, BBQ — or add your own above",
    knownForOptions: [
      "Great Buffet",
      "Signature Dishes",
      "Ambience",
      "Friendly Service",
      "Live Music",
      "Private Dining",
      "Outdoor Seating",
      "Quick Service",
      "Chef's Special",
      "Wine Selection",
    ],
    knownForPlaceholder: "e.g. Great Buffet, Friendly Service — or add your own above",
    statusBadgePlaceholder: "Set using Business Hours below",
    timingsPlaceholder: "Set using Business Hours below",
    amenitiesPlaceholder: "Dinner, Lunch, Brunch, Outdoor Seating, WiFi, Parking, Card Accepted",
    disclaimerPlaceholder: "e.g. * Buffet prices may vary on festive dates",
    photoFilterLabelsPlaceholder: "e.g. All (24), Food (18), Ambience (6)",
    photoFilterLabelOptions: ["All", "Food", "Ambience"],
    businessDescriptionPlaceholder: "Describe your restaurant — cuisine, vibe, and what makes it special",
  },
  "Hotels & Resorts": {
    customTabLabel: "Rooms",
    customTabPlaceholder: "e.g. SEA VIEW DELUXE — King bed, balcony...\nSUITE — Living area, pool access...",
    hasStructuredRooms: true,
    tagsLabel: "Room type tags (optional, comma-separated)",
    tagsPlaceholder: "Sea View, Pool View, Suite, Family Room",
    subtitleOptions: [
      "Premium Rooms & Suites",
      "Fine Dining",
      "Spa",
      "Pool",
      "Gym",
      "Concierge Services",
      "Premium Pricing",
      "Beach Resort",
      "Business Hotel",
      "Boutique",
      "All-inclusive",
      "Wedding Venue",
      "Conference Facilities",
    ],
    subtitlePlaceholder: "e.g. Premium Rooms, Spa, Pool — or add your own above",
    knownForOptions: [
      "Sea View",
      "Pool Access",
      "Spa & Wellness",
      "Concierge",
      "Breakfast Included",
      "Kids Club",
      "Private Beach",
      "In-room Dining",
      "Wedding Hosting",
      "Business Center",
    ],
    knownForPlaceholder: "e.g. Sea View, Concierge — or add your own above",
    statusBadgePlaceholder: "Set using Business Hours below",
    timingsPlaceholder: "Set using Business Hours below",
    amenitiesPlaceholder: "Pool, Spa, Gym, WiFi, Parking, Room Service, Minibar, AC",
    disclaimerPlaceholder: "e.g. * Room rates may vary by season",
    photoFilterLabelsPlaceholder: "e.g. All (32), Rooms (12), Pool (8), Dining (6)",
    photoFilterLabelOptions: ["All", "Rooms", "Pool", "Dining"],
    businessDescriptionPlaceholder: "Describe your hotel — location, amenities, and guest experience",
  },
  "Fitness and Wellness memberships": {
    customTabLabel: "Classes",
    customTabPlaceholder: "e.g. STRENGTH — Full-body workouts...\nYOGA — Flexibility, recovery...",
    tagsLabel: "Class types (comma-separated)",
    tagsPlaceholder: "Strength, Yoga, HIIT, Personal Training",
    subtitleOptions: [
      "Gym",
      "Yoga",
      "HIIT",
      "Personal Training",
      "Pilates",
      "CrossFit",
      "Zumba",
      "Swimming",
      "Spa",
      "Wellness Programs",
      "Nutrition Counseling",
      "Group Classes",
      "Membership Plans",
    ],
    subtitlePlaceholder: "e.g. Yoga, HIIT, Personal Training — or add your own above",
    knownForOptions: [
      "Expert Trainers",
      "Modern Equipment",
      "Group Classes",
      "Personal Training",
      "Clean Facilities",
      "Flexible Timings",
      "Women-only Options",
      "Recovery Zone",
      "Diet Plans",
      "Transformation Programs",
    ],
    knownForPlaceholder: "e.g. Expert Trainers, Group Classes — or add your own above",
    statusBadgePlaceholder: "Set using Business Hours below",
    timingsPlaceholder: "Set using Business Hours below",
    amenitiesPlaceholder: "Lockers, Shower, Towel Service, WiFi, Parking, AC, Steam",
    disclaimerPlaceholder: "e.g. * First-time visitors may need to complete a fitness assessment",
    photoFilterLabelsPlaceholder: "e.g. All (18), Gym (8), Classes (6), Spa (4)",
    photoFilterLabelOptions: ["All", "Gym", "Classes", "Spa"],
    businessDescriptionPlaceholder: "Describe your fitness center — classes, equipment, and membership benefits",
  },
  "Retail & E-commerce": {
    customTabLabel: "Collections",
    customTabPlaceholder: "e.g. CASUAL — Tees, jackets...\nFESTIVE — Diwali, Christmas edits...",
    tagsLabel: "Categories (comma-separated)",
    tagsPlaceholder: "Tees, Jackets, Footwear, Accessories",
    subtitleOptions: [
      "Fashion",
      "Electronics",
      "Home & Living",
      "Beauty",
      "Gifting",
      "Luxury",
      "Sustainable",
      "Unisex",
      "Kids",
      "Premium Brands",
      "Fast Delivery",
      "Easy Returns",
      "Gift Wrapping",
    ],
    subtitlePlaceholder: "e.g. Fashion, Gifting, Premium Brands — or add your own above",
    knownForOptions: [
      "Curated Collections",
      "Fast Delivery",
      "Easy Returns",
      "Gift Wrapping",
      "Loyalty Program",
      "New Arrivals",
      "Best Sellers",
      "Exclusive Deals",
      "Premium Quality",
      "Customer Service",
    ],
    knownForPlaceholder: "e.g. Curated Collections, Fast Delivery — or add your own above",
    statusBadgePlaceholder: "Set using Business Hours below",
    timingsPlaceholder: "Set using Business Hours below",
    amenitiesPlaceholder: "Free Shipping, COD, Exchange, Gift Cards, Wishlist",
    disclaimerPlaceholder: "e.g. * Delivery timelines may vary by pin code",
    photoFilterLabelsPlaceholder: "e.g. All (40), New (12), Bestsellers (10)",
    photoFilterLabelOptions: ["All", "New", "Bestsellers"],
    businessDescriptionPlaceholder: "Describe your store — what you sell, brands, and what makes you unique",
  },
  "Beauty and Personal care": {
    customTabLabel: "Services",
    customTabPlaceholder: "e.g. HAIR — Haircut, colour...\nSPA — Massage, steam...",
    tagsLabel: "Service types (comma-separated)",
    tagsPlaceholder: "Hair, Skin, Spa, Makeup",
    subtitleOptions: [
      "Hair Salon",
      "Skin Care",
      "Spa",
      "Makeup",
      "Nails",
      "Bridal",
      "Men's Grooming",
      "Laser",
      "Threading",
      "Massage",
      "Facials",
      "Body Treatments",
      "Premium Products",
    ],
    subtitlePlaceholder: "e.g. Hair, Spa, Bridal — or add your own above",
    knownForOptions: [
      "Expert Stylists",
      "Bridal Packages",
      "Skin Treatments",
      "Luxury Experience",
      "Hygiene Standards",
      "Personalized Consultations",
      "Organic Products",
      "Men's Grooming",
      "Quick Services",
      "Membership Benefits",
    ],
    knownForPlaceholder: "e.g. Expert Stylists, Bridal Packages — or add your own above",
    statusBadgePlaceholder: "Set using Business Hours below",
    timingsPlaceholder: "Set using Business Hours below",
    amenitiesPlaceholder: "AC, WiFi, Parking, Card Accepted, Home Service, Product Sales",
    disclaimerPlaceholder: "e.g. * Advance booking recommended for weekends",
    photoFilterLabelsPlaceholder: "e.g. All (20), Hair (8), Spa (6), Makeup (4)",
    photoFilterLabelOptions: ["All", "Hair", "Spa", "Makeup"],
    businessDescriptionPlaceholder: "Describe your salon or spa — services, expertise, and ambiance",
  },
  "Seasonal Gifting": {
    customTabLabel: "Campaigns",
    customTabPlaceholder: "e.g. DIWALI — Dining, shopping redeemable...\nNEW YEAR — Celebration experiences...",
    tagsLabel: "Campaign tags (comma-separated)",
    tagsPlaceholder: "Diwali, Christmas, New Year, Corporate",
    subtitleOptions: [
      "Corporate Gifting",
      "Diwali",
      "Christmas",
      "New Year",
      "Rakhi",
      "Wedding",
      "Bulk Orders",
      "Custom Hampers",
      "Multi-brand",
      "Luxury Hampers",
      "Same-day Delivery",
      "Personalization",
    ],
    subtitlePlaceholder: "e.g. Corporate, Diwali, Custom Hampers — or add your own above",
    knownForOptions: [
      "Curated Hampers",
      "Corporate Packages",
      "Same-day Delivery",
      "Personalization",
      "Premium Brands",
      "Bulk Discounts",
      "Festive Collections",
      "E-vouchers",
      "Gift Wrapping",
      "Pan-India Delivery",
    ],
    knownForPlaceholder: "e.g. Curated Hampers, Corporate Packages — or add your own above",
    statusBadgePlaceholder: "Set using Business Hours below",
    timingsPlaceholder: "Set using Business Hours below",
    amenitiesPlaceholder: "Pan-India, Custom Messaging, Bulk Orders, E-vouchers, Express Delivery",
    disclaimerPlaceholder: "e.g. * Delivery during peak festive season may take 2–3 days",
    photoFilterLabelsPlaceholder: "e.g. All (16), Diwali (6), Corporate (4)",
    photoFilterLabelOptions: ["All", "Diwali", "Corporate"],
    businessDescriptionPlaceholder: "Describe your gifting business — occasions, products, and delivery",
  },
};

export { DAYS, DAY_LABELS };

/**
 * Compute open/closed status and human-readable timings from businessHours.
 * businessHours: { mon: { open: "09:00", close: "18:00" }, tue: ..., sun: null }
 * Returns { statusBadge, timings } for display.
 */
export function getStatusFromBusinessHours(businessHours) {
  if (!businessHours || typeof businessHours !== "object") return { statusBadge: null, timings: null };

  const now = new Date();
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayKey = dayNames[now.getDay()];
  const today = businessHours[todayKey];
  const timeStr = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (s) => {
    if (!s) return null;
    const [h, m] = String(s).split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };

  let statusBadge = null;
  if (today && today.open != null && today.close != null) {
    const openM = parseTime(today.open);
    const closeM = parseTime(today.close);
    if (openM != null && closeM != null) {
      if (nowMinutes >= openM && nowMinutes < closeM) {
        const closeIn = closeM - nowMinutes;
        statusBadge = closeIn <= 60 ? `Closes in ${closeIn} mins` : "Open now";
      } else if (nowMinutes < openM) {
        const h = Math.floor(openM / 60), m = openM % 60;
        statusBadge = `Opens at ${timeStr(h, m)}`;
      } else {
        statusBadge = "Closed";
      }
    }
  } else {
    statusBadge = "Closed";
  }

  const parts = [];
  DAYS.forEach((key) => {
    const d = businessHours[key];
    if (d && d.open != null && d.close != null) {
      parts.push(`${DAY_LABELS[key]} ${d.open}–${d.close}`);
    }
  });
  const timings = parts.length ? parts.join(", ") : null;

  return { statusBadge, timings };
}

/**
 * Group consecutive days with same hours for compact display.
 * Returns e.g. ["Mon–Sat 07:00–10:00", "Sun 00:00–23:59"] or ["Mon–Fri 09:00–18:00", "Sat 10:00–16:00", "Sun Closed"].
 */
export function formatBusinessHoursGrouped(businessHours) {
  if (!businessHours || typeof businessHours !== "object") return [];

  const key = (d) => {
    if (!d || (d.open == null && d.close == null)) return "closed";
    return `${d.open || ""}-${d.close || ""}`;
  };

  const groups = [];
  let i = 0;
  while (i < DAYS.length) {
    const k = key(businessHours[DAYS[i]]);
    let j = i;
    while (j + 1 < DAYS.length && key(businessHours[DAYS[j + 1]]) === k) j += 1;
    const first = DAY_LABELS[DAYS[i]];
    const last = DAY_LABELS[DAYS[j]];
    const dayRange = first === last ? first : `${first}–${last}`;
    const slot = businessHours[DAYS[i]];
    if (slot && slot.open != null && slot.close != null) {
      groups.push(`${dayRange} ${slot.open}–${slot.close}`);
    } else {
      groups.push(`${dayRange} Closed`);
    }
    i = j + 1;
  }
  return groups;
}

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];
const SAT_KEY = "sat";
const SUN_KEY = "sun";

function slotEquals(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.open === b.open && a.close === b.close;
}

/**
 * Convert full businessHours to grouped form for editing: weekdays (Mon–Fri), Saturday, Sunday.
 * Each group: { sameAsWeekdays: true } | { closed: true } | { open, close }.
 */
export function businessHoursToGrouped(businessHours) {
  if (!businessHours || typeof businessHours !== "object") {
    return {
      weekdays: { closed: true },
      sat: { sameAsWeekdays: true },
      sun: { sameAsWeekdays: true },
    };
  }
  const getSlot = (key) => {
    const d = businessHours[key];
    if (!d || (d.open == null && d.close == null)) return { closed: true };
    return { open: d.open || "", close: d.close || "" };
  };
  const monSlot = businessHours.mon;
  const weekdays = getSlot("mon");
  const satSame = slotEquals(businessHours[SAT_KEY], monSlot);
  const sunSame = slotEquals(businessHours[SUN_KEY], monSlot);

  return {
    weekdays,
    sat: satSame ? { sameAsWeekdays: true } : getSlot(SAT_KEY),
    sun: sunSame ? { sameAsWeekdays: true } : getSlot(SUN_KEY),
  };
}

/**
 * Convert grouped form back to full businessHours.
 */
export function groupedToBusinessHours(grouped) {
  const out = {};
  const w = grouped.weekdays;
  const wSlot = w.closed ? null : { open: w.open, close: w.close };
  WEEKDAY_KEYS.forEach((key) => {
    if (wSlot) out[key] = { ...wSlot };
  });
  if (grouped.sat.sameAsWeekdays && wSlot) {
    out[SAT_KEY] = { ...wSlot };
  } else if (grouped.sat.closed) {
    out[SAT_KEY] = null;
  } else if (grouped.sat.open && grouped.sat.close) {
    out[SAT_KEY] = { open: grouped.sat.open, close: grouped.sat.close };
  }
  if (grouped.sun.sameAsWeekdays && wSlot) {
    out[SUN_KEY] = { ...wSlot };
  } else if (grouped.sun.closed) {
    out[SUN_KEY] = null;
  } else if (grouped.sun.open && grouped.sun.close) {
    out[SUN_KEY] = { open: grouped.sun.open, close: grouped.sun.close };
  }
  return out;
}
