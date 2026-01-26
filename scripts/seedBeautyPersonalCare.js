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

// Beauty & Personal Care business names
const beautyNames = [
  "Glow Salon",
  "Radiance Spa",
  "Beauty Bliss",
  "Elegance Studio",
  "Luxury Beauty",
  "Serenity Spa",
  "Glamour Hub",
  "Pristine Beauty",
  "Divine Spa",
  "Aura Salon",
  "Enchant Beauty",
  "Velvet Touch",
  "Crystal Clear",
  "Pearl Beauty",
  "Diamond Spa",
  "Rose Petal",
  "Lily Beauty",
  "Jasmine Spa",
  "Lotus Salon",
  "Orchid Beauty",
  "Blossom Spa",
  "Bloom Salon",
  "Garden Beauty",
  "Spring Spa",
  "Summer Glow",
  "Autumn Beauty",
  "Winter Spa",
  "Sunset Salon",
  "Sunrise Beauty",
  "Moonlight Spa",
  "Starlight Salon",
  "Cosmic Beauty",
  "Celestial Spa",
  "Heavenly Beauty",
  "Angel Salon",
  "Divine Glow",
  "Sacred Beauty",
  "Temple Spa",
  "Zen Salon",
  "Harmony Beauty",
  "Balance Spa",
  "Wellness Salon",
  "Vitality Beauty",
  "Energy Spa",
  "Revive Salon",
  "Refresh Beauty",
  "Renew Spa",
  "Restore Salon",
  "Rejuvenate Beauty",
  "Revitalize Spa",
  "Transform Salon",
  "Elevate Beauty",
  "Enhance Spa",
  "Perfect Salon",
  "Flawless Beauty",
];

// Beauty service categories for descriptions
const beautyCategories = [
  "Hair Care & Styling",
  "Facial Treatments",
  "Skin Care & Rejuvenation",
  "Manicure & Pedicure",
  "Bridal Makeup",
  "Hair Color & Highlights",
  "Hair Spa & Treatment",
  "Threading & Waxing",
  "Eyebrow & Eyelash",
  "Body Massage & Therapy",
  "Aromatherapy",
  "Anti-Aging Treatments",
  "Acne Treatment",
  "Hair Transplant",
  "Laser Hair Removal",
  "Skin Whitening",
  "Tan Removal",
  "Hair Straightening",
  "Hair Perming",
  "Full Body Care",
];

// Generate beauty & personal care data
const generateBeautyBusinesses = () => {
  const businesses = [];
  let businessIndex = 0;

  tier1Cities.forEach((cityData, cityIndex) => {
    // Distribute businesses across cities (5-6 businesses per city to get 50+ total)
    const businessesPerCity = cityIndex < 5 ? 6 : 5; // First 5 cities get 6 businesses, rest get 5
    
    for (let i = 0; i < businessesPerCity; i++) {
      const beautyName = beautyNames[businessIndex % beautyNames.length];
      const beautyNumber = Math.floor(businessIndex / beautyNames.length) + 1;
      const displayName = beautyNumber > 1 ? `${beautyName} ${beautyNumber}` : beautyName;
      
      // Generate unique email
      const email = `beauty${businessIndex + 1}${cityData.city.toLowerCase()}@testgiftygen.com`;
      
      // Generate business slug
      const businessSlug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${cityData.city.toLowerCase()}-${businessIndex + 1}`;
      
      // Generate street address
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = ["MG Road", "Park Street", "Commercial Street", "Main Road", "Highway Road", "Residency Road", "Beauty Street", "Salon Row", "Spa Avenue", "Wellness Lane", "Glamour Boulevard", "Care Street"][Math.floor(Math.random() * 12)];
      const streetAddress = `${streetNumber}, ${streetName}`;
      
      // Generate zip code (6 digits for India)
      const zipCode = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Generate phone number (10 digits)
      const phone = `9${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      // Select random beauty category
      const category = beautyCategories[Math.floor(Math.random() * beautyCategories.length)];
      
      businesses.push({
        name: `${displayName} - ${cityData.city}`,
        email: email,
        password: "password", // Will be hashed automatically
        phone: phone,
        restaurantName: `${displayName} - ${cityData.city}`,
        businessSlug: businessSlug,
        industry: "Beauty and Personal care",
        businessDescription: `${displayName} offers premium ${category} services in ${cityData.city}, ${cityData.state}. Experience professional beauty treatments, expert care, and personalized services in a relaxing and luxurious environment. Transform your look and boost your confidence with our skilled beauty professionals.`,
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

// Seed beauty & personal care businesses
const seedBeautyBusinesses = async () => {
  try {
    await connectDB();

    const businesses = generateBeautyBusinesses();
    console.log(`\nGenerating ${businesses.length} Beauty & Personal Care Businesses...\n`);

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
    console.log(`✅ Successfully created: ${created} beauty businesses`);
    console.log(`⏭️  Skipped (already exists): ${skipped} beauty businesses`);
    console.log(`❌ Errors: ${errors} beauty businesses`);
    console.log(`📊 Total processed: ${businesses.length} beauty businesses`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("Error seeding beauty businesses:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Run the script
seedBeautyBusinesses();
