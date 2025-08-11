import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { loadUser } from "./services/Actions/authActions.js";
import Login from "./components/Auth/Login";
import Register from "./components/Register";
import AdminDashboard from "./pages/admin/AdminDashboard.js";
import UserLanding from "./pages/user/UserLanding.js";
import LandingPage from "./pages/marketing/LandingPage";
import Sidebar from "./pages/admin/Sidebar.js";
import GiftCards from "./pages/admin/GiftCards.js"; // GiftCards page
import Orders from "./pages/admin/Orders.js"; // GiftCards page
import Customers from "./pages/admin/Customers.js"; // GiftCards page
import Reports from "./pages/admin/Reports.js"; // GiftCards page
import Settings from "./pages/admin/Settings.js"; // GiftCards page
import RedeemGiftCard from "./pages/admin/RedeemGiftCard.js";
import { LoadingProvider } from "./context/LoadingContext";
import GiftCardDetails from "./pages/user/GiftCardDetails.js";
import "./App.css";
// import 'font-awesome/css/font-awesome.min.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser()); // Load user data on app load
  }, [dispatch]);

  const { pathname } = useSelector((state) => state.location);

  // const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const userDetails = user?.user; // Safely access user.user

  return (
    <LoadingProvider>
      <div className="app">
        <Router>
          {/* Conditionally render Sidebar only on admin routes */}
          {(() => {
            const currentPathname =
              typeof window !== "undefined" && window.location ? window.location.pathname : pathname;
            const adminPaths = [
              "/dashboard",
              "/giftcards",
              "/orders",
              "/customers",
              "/reports",
              "/settings",
              "/redeem",
            ];
            const isAdminRoute = adminPaths.some((p) => currentPathname && currentPathname.startsWith(p));
            return userDetails?.role === "Admin" && isAdminRoute ? <Sidebar /> : null;
          })()}

          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={user ? <Navigate to={userDetails?.role === "Admin" ? "/dashboard" : "/explore"} /> : <Login />}
            />
            <Route path="/register" element={<Register />} />

            {/* Conditional Admin Routes */}

            {userDetails?.role === "Admin" && (
              <>
                <Route
                  path="/dashboard"
                  element={
                    <div className="content">
                      <AdminDashboard />
                    </div>
                  }
                />
                <Route
                  path="/giftcards"
                  element={
                    <div className="content">
                      <GiftCards />
                    </div>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <div className="content">
                      <Orders />
                    </div>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <div className="content">
                      <Customers />
                    </div>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <div className="content">
                      <Reports />
                    </div>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <div className="content">
                      <Settings />
                    </div>
                  }
                />
                <Route
                  path="/redeem"
                  element={
                    <div className="content">
                      <RedeemGiftCard />
                    </div>
                  }
                />
              </>
            )}

            {/* Marketing landing page */}
            <Route path="/" element={<LandingPage />} />
            {/* Explore/buy gift cards */}
            <Route path="/explore" element={<UserLanding />} />
            <Route path="/gift-card/:id" element={<GiftCardDetails />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>
    </LoadingProvider>
  );
}

export default App;

/* 
# Occasion-Based Tags
Birthday Special
Anniversary Delight
Festive Cheers (e.g., Christmas, Diwali, Eid, New Year)
Thank You
Congratulations
Get Well Soon
Housewarming Gift
# Experience-Based Tags
Fine Dining
Romantic Dinner
Weekend Brunch
Family Feast
Chef's Special
All-You-Can-Eat Buffet
Relaxing Staycation
Spa & Dine Combo
# Theme-Based Tags
Luxury Escape
Gourmet Experience
Wine & Dine
Beachside Bliss
Mountain Retreat
City Lights Dining
Exotic Flavors
# Purpose-Based Tags
Employee Appreciation
Loyalty Rewards
Client Gifting
Corporate Thank You
Just Because
Date Night
# Seasonal Tags
Summer Treats
Winter Warmth
Spring Refresh
Autumn Flavors
# Recipient-Oriented Tags
For Food Lovers
For Him
For Her
For the Family
For the Team
For You




 <h3>Create Gift Card: Form to create a new gift card (fields like amount, expiration date, discount, etc.).</h3>
        <h3>Manage Gift Cards: View, edit, or delete existing gift cards.</h3>
        <h3></h3>
*/

/* Card titles
### **Occasion-Based Titles**
- **Birthday Bliss Gift Card**
- **Anniversary Celebration Card**
- **Festive Feast Gift Card**
- **Cheers to You! Gift Card**
- **Special Day Delight**

### **Experience-Based Titles**
- **Fine Dining Experience**
- **Romantic Rendezvous Card**
- **Sunday Brunch Gift Card**
- **Family Feast Card**
- **Luxury Staycation Voucher**
- **Gastronomic Adventure Gift Card**
- **Pamper & Dine Combo**

### **Theme-Based Titles**
- **Taste of Elegance**
- **Flavors of the World**
- **A Night to Remember**
- **Beachside Escape Gift Card**
- **City Lights Dinner Card**
- **Mountain Retreat Experience**

### **Purpose-Based Titles**
- **Employee Appreciation Card**
- **Loyalty Rewards Voucher**
- **Corporate Thank You Card**
- **Just Because Treat**
- **Date Night Gift Card**

### **Seasonal Titles**
- **Winter Warmers Gift Card**
- **Summer Sizzlers Card**
- **Spring Flavors Voucher**
- **Autumn Harvest Gift Card**
- **Holiday Cheers Gift Card**

### **Fun and Creative Titles**
- **Eat, Drink, and Be Merry Card**
- **Table for Two Gift Card**
- **Feast on Us!**
- **Dine Your Heart Out**
- **Savor the Moment**
- **Bon Appétit Card**
- **Ultimate Indulgence Card**

### **Recipient-Oriented Titles**
- **Gourmet Gift for Foodies**
- **For Him: The Perfect Treat**
- **For Her: A Special Delight**
- **Family Dining Gift Card**
- **A Gift for You**
 */
