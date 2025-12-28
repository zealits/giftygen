import React, { useEffect, useState, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { loadUser } from "./services/Actions/authActions.js";
import { LoadingProvider } from "./context/LoadingContext";
import "./App.css";

// Lazy load components
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Register"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.js"));
const UserLanding = lazy(() => import("./pages/user/UserLanding.js"));
const LandingPage = lazy(() => import("./pages/marketing/LandingPage"));
const PrivacyPolicy = lazy(() => import("./pages/marketing/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/marketing/TermsOfService"));
const BenefitDetail = lazy(() => import("./pages/marketing/BenefitDetail"));
const Sidebar = lazy(() => import("./pages/admin/Sidebar.js"));
const GiftCards = lazy(() => import("./pages/admin/GiftCards.js"));
const Orders = lazy(() => import("./pages/admin/Orders.js"));
const Customers = lazy(() => import("./pages/admin/Customers.js"));
const Reports = lazy(() => import("./pages/admin/Reports.js"));
const Settings = lazy(() => import("./pages/admin/Settings.js"));
const RedeemGiftCard = lazy(() => import("./pages/admin/RedeemGiftCard.js"));
const GiftCardDetails = lazy(() => import("./pages/user/GiftCardDetails.js"));
const SuperAdminLogin = lazy(() => import("./components/SuperAdmin/SuperAdminLogin"));
const SuperAdminDashboard = lazy(() => import("./components/SuperAdmin/SuperAdminDashboard"));
const VideoModal = lazy(() => import("./components/VideoModal/VideoModal"));
const SubscriptionManagement = lazy(() => import("./components/subscriptionManagement"));
// import 'font-awesome/css/font-awesome.min.css';

function AppRoutes() {
  const location = useLocation();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const userDetails = user?.user;

  if (authLoading) {
    return null;
  }

  const currentPathname = location.pathname;
  const adminPaths = ["/dashboard", "/giftcards", "/orders", "/customers", "/reports", "/settings", "/redeem", "/subscription"];
  const isAdminRoute = adminPaths.some((p) => currentPathname && currentPathname.startsWith(p));

  return (
    <>
      {userDetails?.role === "Admin" && isAdminRoute ? (
        <Suspense fallback={<div className="content">Loading...</div>}>
          <Sidebar />
        </Suspense>
      ) : null}

      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
        <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={userDetails?.role === "Admin" ? "/dashboard" : "/explore"} /> : <Login />}
        />
        <Route path="/register" element={<Register />} />

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
             <Route path="/subscription" element={
              <div className="content">
                <SubscriptionManagement />
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

        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/benefit/:benefitId" element={<BenefitDetail />} />
        <Route path="/explore" element={<UserLanding />} />
        <Route path="/gift-card/:id" element={<GiftCardDetails />} />
        <Route path="/:businessSlug/giftcards" element={<UserLanding />} />
        <Route path="/:businessSlug/gift-card/:id" element={<GiftCardDetails />} />

        {/* Super Admin Routes */}
        <Route path="/superlogin" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  const dispatch = useDispatch();
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    dispatch(loadUser());

    // Show video modal after a short delay when the app loads
    const timer = setTimeout(() => {
      setShowVideoModal(true);
    }, 1000); // 1 second delay to ensure the app is fully loaded

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
  };

  return (
    <LoadingProvider>
      <div className="app">
        <Router>
          <AppRoutes />
        </Router>
        <Suspense fallback={null}>
          <VideoModal isOpen={showVideoModal} onClose={handleCloseVideoModal} />
        </Suspense>
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
