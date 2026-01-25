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

// Hotel names and types
const hotelNames = [
  "Grand Palace Hotel",
  "Royal Residency",
  "Luxury Suites",
  "Heritage Inn",
  "Grandeur Resort",
  "Elite Hotel",
  "Prestige Resorts",
  "Majestic Hotel",
  "Regal Palace",
  "Crown Plaza",
  "Imperial Resort",
  "Sapphire Hotel",
  "Emerald Resorts",
  "Diamond Palace",
  "Golden Sands Resort",
  "Silver Star Hotel",
  "Platinum Residency",
  "Pearl Hotel",
  "Coral Resort",
  "Azure Hotel",
  "Marble Palace",
  "Crystal Resorts",
  "Ivory Hotel",
  "Jade Residency",
  "Ruby Palace",
  "Topaz Resort",
  "Amber Hotel",
  "Saffron Resorts",
  "Crimson Palace",
  "Violet Hotel",
  "Indigo Resort",
  "Turquoise Hotel",
  "Onyx Residency",
  "Opal Resort",
  "Garnet Hotel",
  "Citrine Resorts",
  "Peridot Palace",
  "Aquamarine Hotel",
  "Zircon Resort",
  "Beryl Hotel",
  "Chalcedony Resorts",
  "Jasper Palace",
  "Agate Hotel",
  "Quartz Resort",
  "Feldspar Hotel",
  "Mica Residency",
  "Talc Resort",
  "Gypsum Hotel",
  "Calcite Resorts",
  "Fluorite Palace",
  "Apatite Hotel",
  "Orthoclase Resort",
  "Plagioclase Hotel",
  "Hornblende Resorts",
  "Biotite Palace",
  "Muscovite Hotel",
];

// Generate hotel data
const generateHotels = () => {
  const hotels = [];
  let hotelIndex = 0;

  tier1Cities.forEach((cityData, cityIndex) => {
    // Distribute hotels across cities (5-6 hotels per city to get 50+ total)
    const hotelsPerCity = cityIndex < 5 ? 6 : 5; // First 5 cities get 6 hotels, rest get 5
    
    for (let i = 0; i < hotelsPerCity; i++) {
      const hotelName = hotelNames[hotelIndex % hotelNames.length];
      const hotelNumber = Math.floor(hotelIndex / hotelNames.length) + 1;
      const displayName = hotelNumber > 1 ? `${hotelName} ${hotelNumber}` : hotelName;
      
      // Generate unique email
      const email = `hotel${hotelIndex + 1}${cityData.city.toLowerCase()}@testgiftygen.com`;
      
      // Generate business slug
      const businessSlug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${cityData.city.toLowerCase()}-${hotelIndex + 1}`;
      
      // Generate street address
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = ["MG Road", "Park Street", "Commercial Street", "Main Road", "Highway Road", "Residency Road"][Math.floor(Math.random() * 6)];
      const streetAddress = `${streetNumber}, ${streetName}`;
      
      // Generate zip code (6 digits for India)
      const zipCode = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Generate phone number (10 digits)
      const phone = `9${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      hotels.push({
        name: `${displayName} - ${cityData.city}`,
        email: email,
        password: "password", // Will be hashed automatically
        phone: phone,
        restaurantName: `${displayName} - ${cityData.city}`,
        businessSlug: businessSlug,
        industry: "Hotels & Resorts",
        businessDescription: `Premium ${displayName} located in the heart of ${cityData.city}, ${cityData.state}. Offering world-class hospitality and luxury accommodations.`,
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
      
      hotelIndex++;
    }
  });

  return hotels;
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

// Seed hotels
const seedHotels = async () => {
  try {
    await connectDB();

    const hotels = generateHotels();
    console.log(`\nGenerating ${hotels.length} Hotels & Resorts...\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const hotelData of hotels) {
      try {
        // Check if hotel already exists
        const existing = await RestaurantAdmin.findOne({ 
          $or: [
            { email: hotelData.email },
            { businessSlug: hotelData.businessSlug }
          ]
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${hotelData.restaurantName} (already exists)`);
          skipped++;
          continue;
        }

        // Create new hotel
        const hotel = new RestaurantAdmin(hotelData);
        await hotel.save();
        
        console.log(`✅ Created: ${hotelData.restaurantName}`);
        console.log(`   Email: ${hotelData.email}`);
        console.log(`   Location: ${hotelData.restaurantAddress.city}, ${hotelData.restaurantAddress.state}`);
        console.log(`   Password: password\n`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${hotelData.restaurantName}:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully created: ${created} hotels`);
    console.log(`⏭️  Skipped (already exists): ${skipped} hotels`);
    console.log(`❌ Errors: ${errors} hotels`);
    console.log(`📊 Total processed: ${hotels.length} hotels`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("Error seeding hotels:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Run the script
seedHotels();
