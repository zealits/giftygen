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

// Retail & E-commerce business names
const retailNames = [
  "Fashion Hub",
  "Style Mart",
  "Trendy Store",
  "Elite Boutique",
  "Premium Shop",
  "Luxury Retail",
  "Designer Outlet",
  "Chic Collection",
  "Modern Marketplace",
  "Urban Store",
  "Fashion Forward",
  "Style Station",
  "Trend Zone",
  "Elite Fashion",
  "Premium Collection",
  "Luxury Lane",
  "Designer Depot",
  "Chic Corner",
  "Modern Mart",
  "Urban Outlet",
  "Fashion First",
  "Style Street",
  "Trend Tower",
  "Elite Emporium",
  "Premium Plaza",
  "Luxury Lounge",
  "Designer Den",
  "Chic Choice",
  "Modern Market",
  "Urban Unisex",
  "Fashion Factory",
  "Style Studio",
  "Trend Terrace",
  "Elite Express",
  "Premium Point",
  "Luxury Link",
  "Designer Direct",
  "Chic Central",
  "Modern Mode",
  "Urban Union",
  "Fashion Focus",
  "Style Select",
  "Trend Trade",
  "Elite Edge",
  "Premium Plus",
  "Luxury Line",
  "Designer Drive",
  "Chic Connect",
  "Modern Mix",
  "Urban Unity",
  "Fashion Fusion",
  "Style Source",
  "Trend Target",
  "Elite Element",
  "Premium Prime",
];

// Retail categories for descriptions
const retailCategories = [
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Home & Living",
  "Beauty & Cosmetics",
  "Footwear & Accessories",
  "Jewelry & Watches",
  "Sports & Fitness",
  "Books & Stationery",
  "Toys & Games",
  "Health & Wellness",
  "Kitchen & Dining",
  "Furniture & Decor",
  "Mobile & Accessories",
  "Laptop & Computers",
  "Audio & Video",
  "Gaming & Entertainment",
  "Automotive Accessories",
  "Pet Supplies",
  "Baby & Kids",
  "Gifts & Novelties",
];

// Generate retail & e-commerce data
const generateRetailBusinesses = () => {
  const businesses = [];
  let businessIndex = 0;

  tier1Cities.forEach((cityData, cityIndex) => {
    // Distribute businesses across cities (5-6 businesses per city to get 50+ total)
    const businessesPerCity = cityIndex < 5 ? 6 : 5; // First 5 cities get 6 businesses, rest get 5
    
    for (let i = 0; i < businessesPerCity; i++) {
      const retailName = retailNames[businessIndex % retailNames.length];
      const retailNumber = Math.floor(businessIndex / retailNames.length) + 1;
      const displayName = retailNumber > 1 ? `${retailName} ${retailNumber}` : retailName;
      
      // Generate unique email
      const email = `retail${businessIndex + 1}${cityData.city.toLowerCase()}@testgiftygen.com`;
      
      // Generate business slug
      const businessSlug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${cityData.city.toLowerCase()}-${businessIndex + 1}`;
      
      // Generate street address
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = ["MG Road", "Park Street", "Commercial Street", "Main Road", "Highway Road", "Residency Road", "Shopping Street", "Retail Row", "Market Avenue", "Trade Lane", "Commerce Street", "Business Boulevard"][Math.floor(Math.random() * 12)];
      const streetAddress = `${streetNumber}, ${streetName}`;
      
      // Generate zip code (6 digits for India)
      const zipCode = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Generate phone number (10 digits)
      const phone = `9${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      // Select random retail category
      const category = retailCategories[Math.floor(Math.random() * retailCategories.length)];
      
      businesses.push({
        name: `${displayName} - ${cityData.city}`,
        email: email,
        password: "password", // Will be hashed automatically
        phone: phone,
        restaurantName: `${displayName} - ${cityData.city}`,
        businessSlug: businessSlug,
        industry: "Retail & E-commerce",
        businessDescription: `${displayName} offers premium ${category} products in ${cityData.city}, ${cityData.state}. Shop the latest trends, exclusive collections, and quality merchandise both online and in-store. Experience seamless shopping with excellent customer service.`,
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

// Seed retail & e-commerce businesses
const seedRetailBusinesses = async () => {
  try {
    await connectDB();

    const businesses = generateRetailBusinesses();
    console.log(`\nGenerating ${businesses.length} Retail & E-commerce Businesses...\n`);

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
    console.log(`✅ Successfully created: ${created} retail businesses`);
    console.log(`⏭️  Skipped (already exists): ${skipped} retail businesses`);
    console.log(`❌ Errors: ${errors} retail businesses`);
    console.log(`📊 Total processed: ${businesses.length} retail businesses`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("Error seeding retail businesses:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Run the script
seedRetailBusinesses();
