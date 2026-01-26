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

// Fitness & Wellness business names
const fitnessNames = [
  "Power Gym",
  "Fit Zone",
  "Strength Center",
  "Elite Fitness",
  "Prime Gym",
  "Apex Fitness",
  "Peak Performance",
  "Iron Strength",
  "Muscle Factory",
  "Body Builders",
  "Fit Life",
  "Health Hub",
  "Wellness Center",
  "Active Zone",
  "Vitality Gym",
  "Energy Fitness",
  "Dynamic Gym",
  "Flex Fitness",
  "Core Strength",
  "Balance Gym",
  "Zen Fitness",
  "Harmony Wellness",
  "Tranquil Gym",
  "Serenity Fitness",
  "Peaceful Workout",
  "Calm Strength",
  "Mindful Fitness",
  "Yoga Studio",
  "Pilates Place",
  "Meditation Center",
  "CrossFit Zone",
  "Boxing Club",
  "Martial Arts",
  "Dance Fitness",
  "Aqua Fitness",
  "Cycling Studio",
  "Running Club",
  "Triathlon Training",
  "Endurance Gym",
  "Speed Fitness",
  "Agility Center",
  "Rehab Clinic",
  "Physical Therapy",
  "Sports Medicine",
  "Recovery Center",
  "Therapy Gym",
  "Rehabilitation",
  "Wellness Clinic",
  "Health Studio",
  "Fitness Academy",
  "Training Center",
  "Coaching Hub",
  "Personal Training",
  "Group Fitness",
  "Community Gym",
];

// Fitness & Wellness service categories for descriptions
const fitnessCategories = [
  "Gym & Weight Training",
  "Cardio & Aerobics",
  "Yoga & Meditation",
  "Pilates & Flexibility",
  "CrossFit & Functional Training",
  "Boxing & Martial Arts",
  "Swimming & Aqua Fitness",
  "Cycling & Spinning",
  "Dance Fitness",
  "Personal Training",
  "Group Fitness Classes",
  "Sports Training",
  "Rehabilitation & Physical Therapy",
  "Nutrition Counseling",
  "Wellness Coaching",
  "Mindfulness & Stress Management",
  "Weight Loss Programs",
  "Muscle Building",
  "Senior Fitness",
  "Women's Fitness",
];

// Generate fitness & wellness data
const generateFitnessBusinesses = () => {
  const businesses = [];
  let businessIndex = 0;

  tier1Cities.forEach((cityData, cityIndex) => {
    // Distribute businesses across cities (5-6 businesses per city to get 50+ total)
    const businessesPerCity = cityIndex < 5 ? 6 : 5; // First 5 cities get 6 businesses, rest get 5
    
    for (let i = 0; i < businessesPerCity; i++) {
      const fitnessName = fitnessNames[businessIndex % fitnessNames.length];
      const fitnessNumber = Math.floor(businessIndex / fitnessNames.length) + 1;
      const displayName = fitnessNumber > 1 ? `${fitnessName} ${fitnessNumber}` : fitnessName;
      
      // Generate unique email
      const email = `fitness${businessIndex + 1}${cityData.city.toLowerCase()}@testgiftygen.com`;
      
      // Generate business slug
      const businessSlug = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${cityData.city.toLowerCase()}-${businessIndex + 1}`;
      
      // Generate street address
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetName = ["MG Road", "Park Street", "Commercial Street", "Main Road", "Highway Road", "Residency Road", "Fitness Street", "Gym Row", "Wellness Avenue", "Health Lane", "Sports Boulevard", "Active Street"][Math.floor(Math.random() * 12)];
      const streetAddress = `${streetNumber}, ${streetName}`;
      
      // Generate zip code (6 digits for India)
      const zipCode = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      // Generate phone number (10 digits)
      const phone = `9${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      // Select random fitness category
      const category = fitnessCategories[Math.floor(Math.random() * fitnessCategories.length)];
      
      businesses.push({
        name: `${displayName} - ${cityData.city}`,
        email: email,
        password: "password", // Will be hashed automatically
        phone: phone,
        restaurantName: `${displayName} - ${cityData.city}`,
        businessSlug: businessSlug,
        industry: "Fitness and Wellness memberships",
        businessDescription: `${displayName} offers premium ${category} services in ${cityData.city}, ${cityData.state}. Join our fitness community with state-of-the-art equipment, expert trainers, and personalized workout plans. Achieve your health and wellness goals with our comprehensive membership programs designed for all fitness levels.`,
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

// Seed fitness & wellness businesses
const seedFitnessBusinesses = async () => {
  try {
    await connectDB();

    const businesses = generateFitnessBusinesses();
    console.log(`\nGenerating ${businesses.length} Fitness & Wellness Membership Businesses...\n`);

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
    console.log(`✅ Successfully created: ${created} fitness businesses`);
    console.log(`⏭️  Skipped (already exists): ${skipped} fitness businesses`);
    console.log(`❌ Errors: ${errors} fitness businesses`);
    console.log(`📊 Total processed: ${businesses.length} fitness businesses`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("Error seeding fitness businesses:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

// Run the script
seedFitnessBusinesses();
