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

// Restaurant names and types
const restaurantNames = [
  "Spice Garden",
  "Royal Kitchen",
  "Tandoori Delight",
  "Curry House",
  "Masala Express",
  "Biryani Paradise",
  "Dum Pukht",
  "Kebabs & More",
  "Naan Stop",
  "Butter Chicken Co",
  "Paneer Palace",
  "Dal Makhani",
  "Roti & Curry",
  "Saffron Spice",
  "Garam Masala",
  "Turmeric Leaf",
  "Cardamom Kitchen",
  "Cumin & Coriander",
  "Fenugreek Fine Dining",
  "Mustard Seed",
  "Black Pepper",
  "Star Anise",
  "Cinnamon Club",
  "Clove Restaurant",
  "Bay Leaf Bistro",
  "Fennel Fine Dining",
  "Nutmeg Kitchen",
  "Mace Restaurant",
  "Asafoetida",
  "Tamarind Tree",
  "Mango Leaf",
  "Coconut Grove",
  "Banana Leaf",
  "Lotus Restaurant",
  "Jasmine Fine Dining",
  "Rose Garden",
  "Marigold Kitchen",
  "Hibiscus Bistro",
  "Lavender Lounge",
  "Basil & Thyme",
  "Oregano Oven",
  "Rosemary Restaurant",
  "Sage Kitchen",
  "Thyme & Dine",
  "Mint Leaf",
  "Coriander Corner",
  "Parsley Place",
  "Dill Delight",
  "Chive Chateau",
  "Tarragon Table",
  "Lemongrass Lounge",
  "Ginger Garden",
  "Garlic & Onion",
  "Shallot Shrine",
  "Leek & Leek",
  "Scallion Station",
];

// Cuisine types for descriptions
const cuisineTypes = [
  "North Indian",
  "South Indian",
  "Mughlai",
  "Punjabi",
  "Gujarati",
  "Rajasthani",
  "Bengali",
  "Hyderabadi",
  "Chettinad",
  "Kerala",
  "Maharashtrian",
  "Awadhi",
  "Kashmiri",
  "Goan",
  "Continental",
  "Italian",
  "Chinese",
  "Thai",
  "Fusion",
  "Multi-cuisine",
];

// Generate restaurant data
const generateRestaurants = () => {
  const restaurants = [];
  let restaurantIndex = 0;

  tier1Cities.forEach((cityData, cityIndex) => {
    // Distribute restaurants across cities (5-6 restaurants per city to get 50+ total)
    const restaurantsPerCity = cityIndex < 5 ? 6 : 5; // First 5 cities get 6 restaurants, rest get 5
    
    for (let i = 0; i < restaurantsPerCity; i++) {
      const restaurantName = restaurantNames[restaurantIndex % restaurantNames.length];
      const restaurantNumber = Math.floor(restaurantIndex / restaurantNames.length) + 1;
      const displayName = restaurantNumber > 1 ? `${restaurantName} ${restaurantNumber}` : restaurantName;
      
      // Generate unique email
      const email = `restaurant${restaurantIndex + 1}${cityData.city.toLowerCase()}@testgiftygen.com`;
      
      // Generate business slug
      const businessSlug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${cityData.city.toLowerCase()}-${restaurantIndex + 1}`;
      
      // Generate street address
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = ["MG Road", "Park Street", "Commercial Street", "Main Road", "Highway Road", "Residency Road", "Food Street", "Restaurant Row", "Culinary Avenue", "Gastronomy Lane"][Math.floor(Math.random() * 10)];
      const streetAddress = `${streetNumber}, ${streetName}`;
      
      // Generate zip code (6 digits for India)
      const zipCode = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Generate phone number (10 digits)
      const phone = `9${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      // Select random cuisine type
      const cuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
      
      restaurants.push({
        name: `${displayName} - ${cityData.city}`,
        email: email,
        password: "password", // Will be hashed automatically
        phone: phone,
        restaurantName: `${displayName} - ${cityData.city}`,
        businessSlug: businessSlug,
        industry: "Restaurant And Fine Dining",
        businessDescription: `Exquisite ${cuisine} cuisine at ${displayName} in ${cityData.city}, ${cityData.state}. Experience authentic flavors, premium ingredients, and exceptional service in an elegant dining atmosphere.`,
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
      
      restaurantIndex++;
    }
  });

  return restaurants;
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

// Seed restaurants
const seedRestaurants = async () => {
  try {
    await connectDB();

    const restaurants = generateRestaurants();
    console.log(`\nGenerating ${restaurants.length} Restaurants & Fine Dining...\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const restaurantData of restaurants) {
      try {
        // Check if restaurant already exists
        const existing = await RestaurantAdmin.findOne({ 
          $or: [
            { email: restaurantData.email },
            { businessSlug: restaurantData.businessSlug }
          ]
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${restaurantData.restaurantName} (already exists)`);
          skipped++;
          continue;
        }

        // Create new restaurant
        const restaurant = new RestaurantAdmin(restaurantData);
        await restaurant.save();
        
        console.log(`✅ Created: ${restaurantData.restaurantName}`);
        console.log(`   Email: ${restaurantData.email}`);
        console.log(`   Location: ${restaurantData.restaurantAddress.city}, ${restaurantData.restaurantAddress.state}`);
        console.log(`   Password: password\n`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${restaurantData.restaurantName}:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully created: ${created} restaurants`);
    console.log(`⏭️  Skipped (already exists): ${skipped} restaurants`);
    console.log(`❌ Errors: ${errors} restaurants`);
    console.log(`📊 Total processed: ${restaurants.length} restaurants`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("Error seeding restaurants:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Run the script
seedRestaurants();
