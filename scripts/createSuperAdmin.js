const mongoose = require("mongoose");
const SuperAdmin = require("../models/superAdminSchema");
require("dotenv").config({ path: "../config/config.env" });

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Super Admin data
const superAdminData = {
  name: "Super Admin",
  email: "superadmin@giftygen.com",
  password: "SuperAdmin123!",
  role: "SuperAdmin",
  isActive: true,
};

// Create Super Admin
const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: superAdminData.email });

    if (existingAdmin) {
      console.log("Super Admin already exists with email:", superAdminData.email);
      return;
    }

    // Create new super admin
    const superAdmin = new SuperAdmin(superAdminData);
    await superAdmin.save();

    console.log("Super Admin created successfully!");
    console.log("Email:", superAdminData.email);
    console.log("Password:", superAdminData.password);
    console.log("Role:", superAdminData.role);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createSuperAdmin();
