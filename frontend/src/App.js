import React, { useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { loadUser } from "./services/Actions/authActions.js";
import { LoadingProvider } from "./context/LoadingContext";
import "./App.css";

// Ensure lazy-loaded modules have a default export (avoids React #130 in production)
function safeLazy(importFn, name) {
  return lazy(() =>
    importFn().then((m) => {
      if (m == null || m.default == null) {
        const err = new Error(`Lazy module "${name}" has no default export. Fix the export in that file.`);
        if (typeof console !== "undefined") console.error(err.message, m);
        throw err;
      }
      return m;
    })
  );
}

// Lazy load components
const Login = safeLazy(() => import("./components/Auth/Login"), "Auth/Login");
const Register = safeLazy(() => import("./components/Register"), "Register");
const ResetPassword = safeLazy(() => import("./components/Auth/ResetPassword"), "ResetPassword");
const AdminDashboard = safeLazy(() => import("./pages/admin/AdminDashboard.js"), "AdminDashboard");
const UserLanding = safeLazy(() => import("./pages/user/UserLanding.js"), "UserLanding");
const Explore = safeLazy(() => import("./pages/user/Explore.js"), "Explore");
const ExploreCategory = safeLazy(() => import("./pages/user/ExploreCategory.js"), "ExploreCategory");
const ExploreBrand = safeLazy(() => import("./pages/user/ExploreBrand.js"), "ExploreBrand");
const LandingPage = safeLazy(() => import("./pages/marketing/LandingPage"), "LandingPage");
const PrivacyPolicy = safeLazy(() => import("./pages/marketing/PrivacyPolicy"), "PrivacyPolicy");
const TermsOfService = safeLazy(() => import("./pages/marketing/TermsOfService"), "TermsOfService");
const BenefitDetail = safeLazy(() => import("./pages/marketing/BenefitDetail"), "BenefitDetail");
const BusinessCategoryDetail = safeLazy(() => import("./pages/marketing/BusinessCategoryDetail"), "BusinessCategoryDetail");
const ExampleRestaurant = safeLazy(() => import("./pages/marketing/ExampleRestaurant"), "ExampleRestaurant");
const ExampleHotel = safeLazy(() => import("./pages/marketing/ExampleHotel"), "ExampleHotel");
const ExampleFitness = safeLazy(() => import("./pages/marketing/ExampleFitness"), "ExampleFitness");
const ExampleRetail = safeLazy(() => import("./pages/marketing/ExampleRetail"), "ExampleRetail");
const ExampleBeauty = safeLazy(() => import("./pages/marketing/ExampleBeauty"), "ExampleBeauty");
const ExampleSeasonal = safeLazy(() => import("./pages/marketing/ExampleSeasonal"), "ExampleSeasonal");
const BusinessPage = safeLazy(() => import("./pages/marketing/BusinessPage"), "BusinessPage");
const Sidebar = safeLazy(() => import("./pages/admin/Sidebar.js"), "Sidebar");
const GiftCards = safeLazy(() => import("./pages/admin/GiftCards.js"), "GiftCards");
const CreateGiftCard = safeLazy(() => import("./pages/admin/CreateGiftCard.js"), "CreateGiftCard");
const Orders = safeLazy(() => import("./pages/admin/Orders.js"), "Orders");
const Customers = safeLazy(() => import("./pages/admin/Customers.js"), "Customers");
const Reports = safeLazy(() => import("./pages/admin/Reports.js"), "Reports");
const Settings = safeLazy(() => import("./pages/admin/Settings.js"), "Settings");
const RedeemGiftCard = safeLazy(() => import("./pages/admin/RedeemGiftCard.js"), "RedeemGiftCard");
const GiftCardDetails = safeLazy(() => import("./pages/user/GiftCardDetails.js"), "GiftCardDetails");
const SuperAdminLogin = safeLazy(() => import("./components/SuperAdmin/SuperAdminLogin"), "SuperAdminLogin");
const SuperAdminDashboard = safeLazy(() => import("./components/SuperAdmin/SuperAdminDashboard"), "SuperAdminDashboard");
const SubscriptionManagement = safeLazy(() => import("./components/subscriptionManagement"), "subscriptionManagement");
// import 'font-awesome/css/font-awesome.min.css';

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const userDetails = user?.user;

  // If we're on a business subdomain like grand-plaza-hotel.giftygen.com,
  // show that business page instead of the generic landing page.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { hostname, pathname } = window.location;

    // Skip in local development
    if (hostname === "localhost" || hostname === "127.0.0.1") return;

    const parts = hostname.split(".");
    if (parts.length <= 2) return; // No subdomain present

    const subdomain = parts.slice(0, -2).join(".");
    if (!subdomain || subdomain.toLowerCase() === "www") return;

    // Only redirect from root path to business page
    if (pathname === "/" || pathname === "") {
      navigate(`/${subdomain}/giftcards`, { replace: true });
    }
  }, [location.pathname, navigate]);

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
          element={user ? <Navigate to={userDetails?.role === "Admin" ? "/dashboard" : "/oldexplore"} /> : <Login />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
              path="/giftcards/create/:id"
              element={
                <div className="content">
                  <CreateGiftCard />
                </div>
              }
            />
            <Route
              path="/giftcards/create"
              element={
                <div className="content">
                  <CreateGiftCard />
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
              path="/settings/security"
              element={
                <div className="content">
                  <Settings section="security" />
                </div>
              }
            />
            <Route
              path="/settings/business-profile"
              element={
                <div className="content">
                  <Settings section="business-profile" />
                </div>
              }
            />
            <Route
              path="/settings/payment"
              element={
                <div className="content">
                  <Settings section="payment" />
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
        <Route path="/category/:categoryId" element={<BusinessCategoryDetail />} />
        <Route path="/exampleresturant" element={<ExampleRestaurant />} />
        <Route path="/examplehotel" element={<ExampleHotel />} />
        <Route path="/examplefitness" element={<ExampleFitness />} />
        <Route path="/exampleretail" element={<ExampleRetail />} />
        <Route path="/examplebeauty" element={<ExampleBeauty />} />
        <Route path="/exampleseasonal" element={<ExampleSeasonal />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:categoryId" element={<ExploreCategory />} />
        <Route path="/explore/:categoryId/:brandId" element={<ExploreBrand />} />
        <Route path="/oldexplore" element={<UserLanding />} />
        <Route path="/gift-card/:id" element={<GiftCardDetails />} />
        <Route path="/:businessSlug/giftcards" element={<BusinessPage />} />
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

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <LoadingProvider>
      <div className="app">
        <Router>
          <AppRoutes />
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
