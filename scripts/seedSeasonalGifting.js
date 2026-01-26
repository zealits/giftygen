const mongoose = require("mongoose");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
require("dotenv").config({ path: "./config/config.env" });

// Tier 1 cities in India with coordinates
const tier1Cities = [
  { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
];

// Seasonal Gifting business names
const giftingNames = [
  "Gift Gallery",
  "Present Perfect",
  "Gift Express",
  "Surprise Store",
  "Gift Corner",
  "Wrapped Delights",
  "Gift Paradise",
  "Thoughtful Gifts",
  "Gift Boutique",
  "Celebration Gifts",
  "Gift Emporium",
  "Joyful Presents",
  "Gift Haven",
  "Memorable Gifts",
  "Gift Studio",
  "Special Occasions",
  "Gift World",
  "Cherished Gifts",
  "Gift Collection",
  "Heartfelt Gifts",
  "Gift Central",
  "Precious Presents",
  "Gift Lounge",
  "Elegant Gifts",
  "Gift Palace",
  "Luxury Gifts",
  "Gift Treasures",
  "Premium Presents",
  "Gift Vault",
  "Exclusive Gifts",
  "Gift Showcase",
  "Artisan Gifts",
  "Gift Craft",
  "Handmade Gifts",
  "Gift Creations",
  "Custom Gifts",
  "Gift Design",
  "Personalized Gifts",
  "Gift Workshop",
  "Unique Gifts",
  "Gift Innovations",
  "Creative Gifts",
  "Gift Solutions",
  "Perfect Presents",
  "Gift Experts",
  "Gift Masters",
  "Gift Specialists",
  "Gift Consultants",
  "Gift Advisors",
  "Gift Planners",
  "Gift Coordinators",
  "Gift Organizers",
  "Gift Curators",
  "Gift Selectors",
  "Gift Finders",
];

// Seasonal Gifting categories for descriptions
const giftingCategories = [
  "Festival Gifts",
  "Birthday Gifts",
  "Anniversary Gifts",
  "Wedding Gifts",
  "Corporate Gifts",
  "Holiday Gifts",
  "Diwali Gifts",
  "Christmas Gifts",
  "New Year Gifts",
  "Eid Gifts",
  "Holi Gifts",
  "Raksha Bandhan Gifts",
  "Valentine's Day Gifts",
  "Mother's Day Gifts",
  "Father's Day Gifts",
  "Graduation Gifts",
  "Baby Shower Gifts",
  "Housewarming Gifts",
  "Thank You Gifts",
  "Congratulations Gifts",
];

// Generate seasonal gifting data
const generateGiftingBusinesses = () => {
  const businesses = [];
  let businessIndex = 0;

  tier1Cities.forEach((cityData, cityIndex) => {
    // Distribute businesses across cities (5-6 businesses per city to get 50+ total)
    const businessesPerCity = cityIndex < 5 ? 6 : 5; // First 5 cities get 6 businesses, rest get 5
    
    for (let i = 0; i < businessesPerCity; i++) {
      const giftingName = giftingNames[businessIndex % giftingNames.length];
      const giftingNumber = Math.floor(businessIndex / giftingNames.length) + 1;
      const displayName = giftingNumber > 1 ? `${giftingName} ${giftingNumber}` : giftingName;
      
      // Generate unique email
      const email = `gifting${businessIndex + 1}${cityData.city.toLowerCase()}@testgiftygen.com`;
      
      // Generate business slug
      const businessSlug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${cityData.city.toLowerCase()}-${businessIndex + 1}`;
      
      // Generate street address
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = ["MG Road", "Park Street", "Commercial Street", "Main Road", "Highway Road", "Residency Road", "Gift Street", "Present Row", "Celebration Avenue", "Joy Lane", "Festival Boulevard", "Gift Plaza"][Math.floor(Math.random() * 12)];
      const streetAddress = `${streetNumber}, ${streetName}`;
      
      // Generate zip code (6 digits for India)
      const zipCode = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Generate phone number (10 digits)
      const phone = `9${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      // Select random gifting category
      const category = giftingCategories[Math.floor(Math.random() * giftingCategories.length)];
      
      businesses.push({
        name: `${displayName} - ${cityData.city}`,
        email: email,
        password: "password", // Will be hashed automatically
        phone: phone,
        restaurantName: `${displayName} - ${cityData.city}`,
        businessSlug: businessSlug,
        industry: "Seasonal Gifting",
        businessDescription: `${displayName} specializes in premium ${category} in ${cityData.city}, ${cityData.state}. Discover thoughtfully curated gift collections for every occasion. From elegant hampers to personalized presents, we help you celebrate special moments with the perfect gift. Experience seamless gifting with our expert selection and delivery services.`,
        restaurantAddress: {
          street: streetAddress,
          city: cityData.city,
          state: cityData.state,
          zipCode: zipCode,
          latitude: cityData.lat + (Math.random() * 0.1 - 0.05), // Add slight variation
          longitude: cityData.lng + (Math.random() * 0.1 - 0.05),
        },
        isVerified: true, // Set as verified for testing
        role: "Admin",
      });
      
      businessIndex++;
    }
  });

  return businesses;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Seed seasonal gifting businesses
const seedGiftingBusinesses = async () => {
  try {
    await connectDB();

    const businesses = generateGiftingBusinesses();
    console.log(`\nGenerating ${businesses.length} Seasonal Gifting Businesses...\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const businessData of businesses) {
      try {
        // Check if business already exists
        const existing = await RestaurantAdmin.findOne({ 
          $or: [
            { email: businessData.email },
            { businessSlug: businessData.businessSlug }
          ]
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${businessData.restaurantName} (already exists)`);
          skipped++;
          continue;
        }

        // Create new business
        const business = new RestaurantAdmin(businessData);
        await business.save();
        
        console.log(`✅ Created: ${businessData.restaurantName}`);
        console.log(`   Email: ${businessData.email}`);
        console.log(`   Location: ${businessData.restaurantAddress.city}, ${businessData.restaurantAddress.state}`);
        console.log(`   Password: password\n`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${businessData.restaurantName}:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully created: ${created} gifting businesses`);
    console.log(`⏭️  Skipped (already exists): ${skipped} gifting businesses`);
    console.log(`❌ Errors: ${errors} gifting businesses`);
    console.log(`📊 Total processed: ${businesses.length} gifting businesses`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("Error seeding gifting businesses:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Run the script
seedGiftingBusinesses();
