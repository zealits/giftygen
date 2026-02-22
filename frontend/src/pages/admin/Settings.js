import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import MapLocationPicker from "../../components/MapLocationPicker";
import {
  INDUSTRY_PAGE_CONFIG,
  getStatusFromBusinessHours,
  formatBusinessHoursGrouped,
  businessHoursToGrouped,
  groupedToBusinessHours,
} from "../../data/industryPageConfig";
import "./Settings.css";

const Settings = ({ section: sectionProp }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which section to show based on route or prop
  const getSection = () => {
    if (sectionProp) return sectionProp;
    const path = location.pathname;
    if (path === "/settings/security") return "security";
    if (path === "/settings/business-profile") return "business-profile";
    if (path === "/settings/payment") return "payment";
    // Default to security if just /settings
    if (path === "/settings") return "security";
    return "security";
  };

  const currentSection = getSection();
  const { user } = useSelector((state) => state.auth);
  const initial = user?.user || {};
  const [form, setForm] = useState({
    restaurantName: initial.restaurantName || "",
    businessSlug: initial.businessSlug || "",
    industry: initial.industry || "",
    businessDescription: initial.businessDescription || "",
    restaurantAddress: {
      street: initial.restaurantAddress?.street || "",
      city: initial.restaurantAddress?.city || "",
      state: initial.restaurantAddress?.state || "",
      zipCode: initial.restaurantAddress?.zipCode || "",
      latitude: initial.restaurantAddress?.latitude || null,
      longitude: initial.restaurantAddress?.longitude || null,
    },
    pageCustomization: initial.pageCustomization || {},
    razorpayKeyId: initial.razorpayKeyId || "",
    razorpayKeySecret: initial.razorpayKeySecret || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showRazorpayToken, setShowRazorpayToken] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || "");
  const [galleryImages, setGalleryImages] = useState(initial.galleryImages || []);
  const [downloading, setDownloading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  // SQUARE API COMMENTED OUT
  // const [showSquareInstructions, setShowSquareInstructions] = useState(false);
  const [showRazorpayInstructions, setShowRazorpayInstructions] = useState(false);

  const publicUrl = useMemo(() => {
    const slug = (form.businessSlug || "").trim();
    if (!slug) return null;
    return `${window.location.origin}/${slug}/giftcards`;
  }, [form.businessSlug]);

  const toArray = (v) =>
    Array.isArray(v) ? v : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const pc = initial.pageCustomization || {};
    const sub = toArray(pc.subtitle);
    const known = toArray(pc.knownFor);
    const mergedKnownFor = [...new Set([...sub, ...known])];
    const pageCustomization = { ...pc, knownFor: mergedKnownFor, subtitle: [] };

    setForm({
      restaurantName: initial.restaurantName || "",
      businessSlug: initial.businessSlug || "",
      industry: initial.industry || "",
      businessDescription: initial.businessDescription || "",
      restaurantAddress: {
        street: initial.restaurantAddress?.street || "",
        city: initial.restaurantAddress?.city || "",
        state: initial.restaurantAddress?.state || "",
        zipCode: initial.restaurantAddress?.zipCode || "",
        latitude: initial.restaurantAddress?.latitude || null,
        longitude: initial.restaurantAddress?.longitude || null,
      },
      pageCustomization,
      razorpayKeyId: initial.razorpayKeyId || "",
      razorpayKeySecret: initial.razorpayKeySecret || "",
    });
    setLogoUrl(initial.logoUrl || "");
    setGalleryImages(initial.galleryImages || []);
  }, [
    initial.restaurantName,
    initial.businessSlug,
    initial.industry,
    initial.businessDescription,
    initial.restaurantAddress,
    // SQUARE API COMMENTED OUT
    // initial.squareApplicationId,
    // initial.squareLocationId,
    // initial.squareAccessToken,
    initial.razorpayKeyId,
    initial.razorpayKeySecret,
    initial.logoUrl,
    initial.galleryImages,
    initial.pageCustomization,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      restaurantAddress: {
        ...prev.restaurantAddress,
        [name]: value,
      },
    }));
  };

  const handlePageCustomizationChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      pageCustomization: {
        ...(prev.pageCustomization || {}),
        [field]: value,
      },
    }));
  };

  const handlePageCustomizationArrayChange = (field, value) => {
    const arr = typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : value;
    handlePageCustomizationChange(field, arr);
  };

  const handleKnownForToggle = (item) => {
    const arr = toArray(form.pageCustomization?.knownFor);
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    handlePageCustomizationChange("knownFor", next);
  };

  const handleKnownForAddCustom = (e) => {
    if (e.key !== "Enter") return;
    const value = e.target.value?.trim();
    if (!value) return;
    const arr = toArray(form.pageCustomization?.knownFor);
    if (arr.includes(value)) return;
    handlePageCustomizationChange("knownFor", [...arr, value]);
    e.target.value = "";
  };

  const handleBusinessHoursChange = (day, field, value) => {
    const next = { ...(form.pageCustomization?.businessHours || {}) };
    if (!next[day]) next[day] = {};
    if (value === null || value === "") {
      delete next[day][field];
      if (Object.keys(next[day]).length === 0) delete next[day];
    } else {
      next[day][field] = value;
    }
    handlePageCustomizationChange("businessHours", next);
  };

  const groupedHours = useMemo(
    () => businessHoursToGrouped(form.pageCustomization?.businessHours),
    [form.pageCustomization?.businessHours]
  );

  const setGroupedHours = (group, value) => {
    const next = {
      weekdays: groupedHours.weekdays,
      sat: groupedHours.sat,
      sun: groupedHours.sun,
      [group]: value,
    };
    handlePageCustomizationChange("businessHours", groupedToBusinessHours(next));
  };

  const statusPreviewLines = useMemo(
    () => formatBusinessHoursGrouped(form.pageCustomization?.businessHours || {}),
    [form.pageCustomization?.businessHours]
  );

  const INDUSTRY_CONFIG = INDUSTRY_PAGE_CONFIG;

  const knownForList = useMemo(
    () => toArray(form.pageCustomization?.knownFor),
    [form.pageCustomization?.knownFor]
  );

  const knownForAllOptions = useMemo(() => {
    const sub = INDUSTRY_CONFIG[form.industry]?.subtitleOptions || [];
    const known = INDUSTRY_CONFIG[form.industry]?.knownForOptions || [];
    return [...new Set([...sub, ...known])];
  }, [form.industry]);

  const businessHours = form.pageCustomization?.businessHours || {};
  const dynamicStatus = useMemo(
    () => getStatusFromBusinessHours(businessHours),
    [businessHours]
  );

  const handleMapLocationSelect = (lat, lng, address = null) => {
    // Ensure lat and lng are numbers, not strings
    const latitude = typeof lat === "number" ? lat : parseFloat(lat);
    const longitude = typeof lng === "number" ? lng : parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setSettingsMessage("Invalid location coordinates. Please try again.");
      setTimeout(() => setSettingsMessage(""), 3000);
      return;
    }

    // Auto-fill address fields if address data is available
    setForm((prev) => ({
      ...prev,
      restaurantAddress: {
        ...prev.restaurantAddress,
        latitude: latitude,
        longitude: longitude,
        // Auto-fill address fields if available
        street: address?.street || prev.restaurantAddress.street || "",
        city: address?.city || prev.restaurantAddress.city || "",
        state: address?.state || prev.restaurantAddress.state || "",
        zipCode: address?.zipCode || prev.restaurantAddress.zipCode || "",
      },
    }));

    // Show confirmation message with address info
    if (address && address.fullAddress) {
      setSettingsMessage(
        `Location selected: ${address.fullAddress}. Don't forget to click 'Save Business Profile' to save your changes.`,
      );
    } else {
      setSettingsMessage("Location selected! Don't forget to click 'Save Business Profile' to save your changes.");
    }
    setTimeout(() => setSettingsMessage(""), 5000);
  };

  const handleClearLocation = () => {
    setForm((prev) => ({
      ...prev,
      restaurantAddress: {
        ...prev.restaurantAddress,
        latitude: null,
        longitude: null,
      },
    }));
    setSettingsMessage("Location cleared! Don't forget to click 'Save Business Profile' to save your changes.");
    setTimeout(() => setSettingsMessage(""), 3000);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      restaurantName: value,
      businessSlug: slugify(value),
    }));
  };

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSettingsMessage("");
    try {
      const pc = form.pageCustomization || {};
      const bh = pc.businessHours;
      const { statusBadge: computedStatus, timings: computedTimings } =
        getStatusFromBusinessHours(bh);

      const { priceRange: _removed, ...pcRest } = pc;
      const pageCustomization = {
        ...pcRest,
        subtitle: [], // merged into knownFor; single "Known For / Highlights" section
        knownFor: Array.isArray(pc.knownFor) ? pc.knownFor : toArray(pc.knownFor),
        ...(bh && Object.keys(bh).length > 0
          ? { statusBadge: computedStatus || pc.statusBadge, timings: computedTimings || pc.timings }
          : {}),
      };

      const formData = {
        ...form,
        pageCustomization,
        restaurantAddress: {
          ...form.restaurantAddress,
          latitude: form.restaurantAddress.latitude
            ? typeof form.restaurantAddress.latitude === "number"
              ? form.restaurantAddress.latitude
              : parseFloat(form.restaurantAddress.latitude) || null
            : null,
          longitude: form.restaurantAddress.longitude
            ? typeof form.restaurantAddress.longitude === "number"
              ? form.restaurantAddress.longitude
              : parseFloat(form.restaurantAddress.longitude) || null
            : null,
        },
      };

      await axios.put("/api/v1/admin/settings", formData);
      setSettingsMessage("Settings saved successfully!");
      setTimeout(() => setSettingsMessage(""), 3000);
    } catch (e) {
      setSettingsMessage(e?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setPasswordMessage("");
    try {
      await axios.put("/api/v1/admin/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (e) {
      setPasswordMessage(e?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const copyPublicLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setSettingsMessage("Link copied to clipboard!");
      setTimeout(() => setSettingsMessage(""), 2000);
    } catch (_) {
      setSettingsMessage("Copy failed");
      setTimeout(() => setSettingsMessage(""), 2000);
    }
  };

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    setUploadingLogo(true);
    setSettingsMessage("");
    try {
      const res = await axios.post("/api/v1/admin/settings/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoUrl(res.data.logoUrl);
      setSettingsMessage("Logo uploaded successfully!");
      setTimeout(() => setSettingsMessage(""), 3000);
    } catch (e) {
      setSettingsMessage(e?.response?.data?.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePhotoFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 10 - galleryImages.length;
    if (remainingSlots <= 0) {
      setSettingsMessage("Maximum 10 photos allowed");
      setTimeout(() => setSettingsMessage(""), 3000);
      return;
    }

    if (files.length > remainingSlots) {
      setSettingsMessage(`You can only upload ${remainingSlots} more photo(s)`);
      setTimeout(() => setSettingsMessage(""), 3000);
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));

    setUploadingPhotos(true);
    setSettingsMessage("");
    try {
      const res = await axios.post("/api/v1/admin/settings/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGalleryImages(res.data.galleryImages || []);
      setSettingsMessage(`${files.length} photo(s) uploaded successfully!`);
      setTimeout(() => setSettingsMessage(""), 3000);
    } catch (e) {
      setSettingsMessage(e?.response?.data?.message || "Photo upload failed");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = async (photoUrl) => {
    const updatedGallery = galleryImages.filter((url) => url !== photoUrl);
    setGalleryImages(updatedGallery);

    try {
      await axios.put("/api/v1/admin/settings", {
        ...form,
        galleryImages: updatedGallery,
      });
      setSettingsMessage("Photo removed successfully!");
      setTimeout(() => setSettingsMessage(""), 3000);
    } catch (e) {
      setSettingsMessage(e?.response?.data?.message || "Failed to remove photo");
      // Revert on error
      setGalleryImages(galleryImages);
    }
  };

  const downloadQrPoster = async () => {
    setDownloading(true);
    try {
      const res = await axios.get("/api/v1/admin/settings/qr-poster");
      const svgDataUrl = res.data.svg;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 1600;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const safeName = (form.restaurantName || initial.restaurantName || "giftcards").replace(
            /[^a-z0-9-_]+/gi,
            "_",
          );
          a.download = `${safeName}_Digital_Ad.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }, "image/png");
        setDownloading(false);
      };
      img.onerror = () => {
        setDownloading(false);
        setSettingsMessage("Failed to generate digital ad");
      };
      img.src = svgDataUrl;
    } catch (e) {
      setSettingsMessage(e?.response?.data?.message || "Failed to generate digital ad");
      setDownloading(false);
    }
  };

  // Redirect to specific section if on base /settings route
  useEffect(() => {
    if (location.pathname === "/settings" && !sectionProp) {
      navigate("/settings/security", { replace: true });
    }
  }, [location.pathname, navigate, sectionProp]);

  const renderSecuritySection = () => (
    <div className="settings-section">
      <div className="section-header">
        <div className="section-icon">🔐</div>
        <div>
          <h2 className="section-title">Security & Access</h2>
          <p className="section-description">Manage your account security and access credentials</p>
        </div>
      </div>

      <div className="settings-card security-card">
        <div className="card-content">
          <h3 className="card-title">Password Management</h3>
          <p className="card-subtitle">Update your login password for enhanced security</p>

          <div className="form-grid">
            <div className="form_group">
              <label className="form_label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInputChange}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>

            <div className="form_group">
              <label className="form_label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                placeholder="Enter new password"
                className="form-input"
              />
            </div>

            <div className="form_group">
              <label className="form_label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                placeholder="Confirm new password"
                className="form-input"
              />
            </div>
          </div>

          <div className="action-row">
            <button onClick={handlePasswordChange} disabled={saving} className="btn btn-primary">
              {saving ? "Updating..." : "Update Password"}
            </button>
            {passwordMessage && <span className="message success">{passwordMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessProfileSection = () => (
    <div className="settings-section">
      <div className="section-header">
        <div className="section-icon">🏢</div>
        <div>
          <h2 className="section-title">Business Profile</h2>
          <p className="section-description">Customize your business branding and public information</p>
        </div>
      </div>

      <div className="settings-card business-card">
        <div className="card-content">
          <div className="profile-section">
            <h3 className="card-title">Branding & Identity</h3>

            <div className="logo-section">
              <label className="form_label">Business Logo</label>
              <div className="logo-upload">
                <div className="logo-preview">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Business Logo" className="logo-image" />
                  ) : (
                    <div className="logo-placeholder">
                      <span>📷</span>
                      <span>No Logo</span>
                    </div>
                  )}
                </div>
                <div className="logo-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFile}
                    className="file-input"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="btn btn-secondary">
                    Choose File
                  </label>
                  <button
                    disabled={uploadingLogo}
                    type="button"
                    className="btn btn-outline"
                    onClick={() => document.getElementById("logo-upload").click()}
                  >
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </button>
                </div>
              </div>
              <p className="form-hint">PNG/JPG preferred. Stored securely on Cloudinary.</p>
            </div>

            <div className="form_group">
              <label className="form_label">Business Name</label>
              <input
                name="restaurantName"
                value={form.restaurantName}
                onChange={handleNameChange}
                placeholder="Enter your business name"
                className="form-input"
              />
            </div>

            <div className="form_group">
              <label className="form_label">Industry</label>
              <select name="industry" value={form.industry} onChange={handleChange} className="form-input">
                <option value="">Select an industry</option>
                <option value="Restaurant And Fine Dining">Restaurant And Fine Dining</option>
                <option value="Hotels & Resorts">Hotels & Resorts</option>
                <option value="Fitness and Wellness memberships">Fitness and Wellness memberships</option>
                <option value="Retail & E-commerce">Retail & E-commerce</option>
                <option value="Beauty and Personal care">Beauty and Personal care</option>
                <option value="Seasonal Gifting">Seasonal Gifting</option>
              </select>
            </div>

            <div className="form_group" style={{ gridColumn: "1 / -1" }}>
              <label className="form_label">Business Description</label>
              <textarea
                name="businessDescription"
                value={form.businessDescription}
                onChange={handleChange}
                placeholder={form.industry && INDUSTRY_CONFIG[form.industry]?.businessDescriptionPlaceholder ? INDUSTRY_CONFIG[form.industry].businessDescriptionPlaceholder : "Describe your business..."}
                className="form-input"
                rows="4"
                style={{ resize: "vertical", minHeight: "100px" }}
              />
            </div>
          </div>

          {form.industry && (
            <div className="page-customization-section" style={{ marginTop: "24px" }}>
              <h3 className="card-title">Page Customization</h3>
              <p className="form-hint" style={{ marginBottom: 16 }}>
                Customize how your public business page displays. These fields appear on your gift cards page.
              </p>
              <div className="form-grid">
                <div className="form_group page-customization-full">
                  <label className="form_label">Business Hours (dynamic Open/Closed status)</label>
                  <p className="form-hint" style={{ marginBottom: 10 }}>
                    Set hours for weekdays, then override Saturday/Sunday if different. Status updates automatically.
                  </p>
                  <div className="business-hours-compact">
                    <div className="business-hours-block">
                      <span className="business-hours-block-label">Weekdays (Mon–Fri)</span>
                      <label className="business-hours-closed-label">
                        <input
                          type="checkbox"
                          checked={groupedHours.weekdays.closed === true}
                          onChange={(e) =>
                            setGroupedHours("weekdays", e.target.checked ? { closed: true } : { open: "09:00", close: "18:00" })
                          }
                        />
                        Closed
                      </label>
                      {!groupedHours.weekdays.closed && (
                        <div className="business-hours-inline">
                          <input
                            type="time"
                            className="form-input business-hours-input-sm"
                            value={groupedHours.weekdays.open ?? ""}
                            onChange={(e) =>
                              setGroupedHours("weekdays", {
                                ...groupedHours.weekdays,
                                open: e.target.value || "",
                                close: groupedHours.weekdays.close || "",
                              })
                            }
                          />
                          <span className="business-hours-sep">–</span>
                          <input
                            type="time"
                            className="form-input business-hours-input-sm"
                            value={groupedHours.weekdays.close ?? ""}
                            onChange={(e) =>
                              setGroupedHours("weekdays", {
                                ...groupedHours.weekdays,
                                open: groupedHours.weekdays.open || "",
                                close: e.target.value || "",
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                    <div className="business-hours-block">
                      <span className="business-hours-block-label">Saturday</span>
                      <label className="business-hours-same-label">
                        <input
                          type="checkbox"
                          checked={groupedHours.sat.sameAsWeekdays === true}
                          onChange={(e) =>
                            setGroupedHours(
                              "sat",
                              e.target.checked ? { sameAsWeekdays: true } : { closed: true }
                            )
                          }
                        />
                        Same as weekdays
                      </label>
                      {!groupedHours.sat.sameAsWeekdays && (
                        <>
                          <label className="business-hours-closed-label">
                            <input
                              type="checkbox"
                              checked={groupedHours.sat.closed === true}
                              onChange={(e) =>
                                setGroupedHours("sat", e.target.checked ? { closed: true } : { open: "09:00", close: "18:00" })
                              }
                            />
                            Closed
                          </label>
                          {!groupedHours.sat.closed && (
                            <div className="business-hours-inline">
                              <input
                                type="time"
                                className="form-input business-hours-input-sm"
                                value={groupedHours.sat.open ?? ""}
                                onChange={(e) =>
                                  setGroupedHours("sat", {
                                    ...groupedHours.sat,
                                    open: e.target.value || "",
                                    close: groupedHours.sat.close || "",
                                  })
                                }
                              />
                              <span className="business-hours-sep">–</span>
                              <input
                                type="time"
                                className="form-input business-hours-input-sm"
                                value={groupedHours.sat.close ?? ""}
                                onChange={(e) =>
                                  setGroupedHours("sat", {
                                    ...groupedHours.sat,
                                    open: groupedHours.sat.open || "",
                                    close: e.target.value || "",
                                  })
                                }
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="business-hours-block">
                      <span className="business-hours-block-label">Sunday</span>
                      <label className="business-hours-same-label">
                        <input
                          type="checkbox"
                          checked={groupedHours.sun.sameAsWeekdays === true}
                          onChange={(e) =>
                            setGroupedHours(
                              "sun",
                              e.target.checked ? { sameAsWeekdays: true } : { closed: true }
                            )
                          }
                        />
                        Same as weekdays
                      </label>
                      {!groupedHours.sun.sameAsWeekdays && (
                        <>
                          <label className="business-hours-closed-label">
                            <input
                              type="checkbox"
                              checked={groupedHours.sun.closed === true}
                              onChange={(e) =>
                                setGroupedHours("sun", e.target.checked ? { closed: true } : { open: "09:00", close: "18:00" })
                              }
                            />
                            Closed
                          </label>
                          {!groupedHours.sun.closed && (
                            <div className="business-hours-inline">
                              <input
                                type="time"
                                className="form-input business-hours-input-sm"
                                value={groupedHours.sun.open ?? ""}
                                onChange={(e) =>
                                  setGroupedHours("sun", {
                                    ...groupedHours.sun,
                                    open: e.target.value || "",
                                    close: groupedHours.sun.close || "",
                                  })
                                }
                              />
                              <span className="business-hours-sep">–</span>
                              <input
                                type="time"
                                className="form-input business-hours-input-sm"
                                value={groupedHours.sun.close ?? ""}
                                onChange={(e) =>
                                  setGroupedHours("sun", {
                                    ...groupedHours.sun,
                                    open: groupedHours.sun.open || "",
                                    close: e.target.value || "",
                                  })
                                }
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="dynamic-status-preview">
                    <strong>Status:</strong>{" "}
                    {dynamicStatus.statusBadge || "Set hours above to see status"}
                    {statusPreviewLines.length > 0 && (
                      <div className="dynamic-status-lines">
                        {statusPreviewLines.map((line, idx) => (
                          <span key={idx} className="dynamic-status-line">{line}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form_group page-customization-full">
                  <label className="form_label">Disclaimer</label>
                  <input
                    value={form.pageCustomization?.disclaimer || ""}
                    onChange={(e) =>
                      handlePageCustomizationChange("disclaimer", e.target.value)
                    }
                    placeholder={INDUSTRY_CONFIG[form.industry]?.disclaimerPlaceholder || "e.g. * Terms may apply"}
                    className="form-input"
                  />
                </div>

                <div className="form_group page-customization-full">
                  <label className="form_label">Known For / Highlights</label>
                  <p className="form-hint" style={{ marginBottom: 8 }}>
                    Select from options below or type your own and press Enter to add. Categories and highlights in one place.
                  </p>
                  <div className="tag-options-wrap">
                    {knownForAllOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`tag-option-chip ${knownForList.includes(opt) ? "tag-option-chip--selected" : ""}`}
                        onClick={() => handleKnownForToggle(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="tag-selected-wrap">
                    {knownForList.map((item) => (
                      <span key={item} className="tag-selected-chip">
                        {item}
                        <button
                          type="button"
                          className="tag-selected-remove"
                          onClick={() => handleKnownForToggle(item)}
                          aria-label={`Remove ${item}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={INDUSTRY_CONFIG[form.industry]?.knownForPlaceholder || "e.g. Sea View, Concierge — or add your own above"}
                    onKeyDown={handleKnownForAddCustom}
                    style={{ marginTop: 8 }}
                  />
                </div>
                <div className="form_group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form_label">
                    {INDUSTRY_CONFIG[form.industry]?.tagsLabel || "Tags"}
                  </label>
                  <input
                    value={
                      Array.isArray(form.pageCustomization?.tags)
                        ? form.pageCustomization.tags.join(", ")
                        : (form.pageCustomization?.tags || "")
                    }
                    onChange={(e) =>
                      handlePageCustomizationArrayChange("tags", e.target.value)
                    }
                    placeholder={INDUSTRY_CONFIG[form.industry]?.tagsPlaceholder || "Comma-separated tags"}
                    className="form-input"
                  />
                </div>
                <div className="form_group page-customization-full">
                  <label className="form_label">Amenities / Features</label>
                  <input
                    value={
                      Array.isArray(form.pageCustomization?.amenities)
                        ? form.pageCustomization.amenities.join(", ")
                        : (form.pageCustomization?.amenities || "")
                    }
                    onChange={(e) =>
                      handlePageCustomizationArrayChange("amenities", e.target.value)
                    }
                    placeholder={INDUSTRY_CONFIG[form.industry]?.amenitiesPlaceholder || "Comma-separated: Dinner, Lunch, Pool, WiFi..."}
                    className="form-input"
                  />
                </div>
                <div className="form_group">
                  <label className="form_label">
                    {INDUSTRY_CONFIG[form.industry]?.customTabLabel || "Custom Tab"} Content
                  </label>
                  <textarea
                    value={form.pageCustomization?.customTabContent || ""}
                    onChange={(e) =>
                      handlePageCustomizationChange("customTabContent", e.target.value)
                    }
                    placeholder={
                      INDUSTRY_CONFIG[form.industry]?.customTabPlaceholder ||
                      "Add content for your custom tab..."
                    }
                    className="form-input"
                    rows="4"
                    style={{ resize: "vertical", minHeight: "80px" }}
                  />
                </div>
                <div className="form_group page-customization-full">
                  <label className="form_label">Photo Filter Labels (comma-separated)</label>
                  <input
                    value={
                      Array.isArray(form.pageCustomization?.photoFilterLabels)
                        ? form.pageCustomization.photoFilterLabels.join(", ")
                        : (form.pageCustomization?.photoFilterLabels || "")
                    }
                    onChange={(e) =>
                      handlePageCustomizationArrayChange("photoFilterLabels", e.target.value)
                    }
                    placeholder={INDUSTRY_CONFIG[form.industry]?.photoFilterLabelsPlaceholder || "e.g. All (24), Food (18), Ambience (6)"}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="gallery-section" style={{ marginTop: "24px" }}>
            <h3 className="card-title">Business Photos Gallery</h3>
            <p className="form-hint">Upload up to 10 photos to showcase your business</p>

            <div
              className="gallery-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "16px",
                marginTop: "16px",
                marginBottom: "16px",
              }}
            >
              {galleryImages.map((photoUrl, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={`Business photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photoUrl)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}

              {galleryImages.length < 10 && (
                <div
                  className="gallery-upload-placeholder"
                  style={{
                    aspectRatio: "1",
                    borderRadius: "12px",
                    border: "2px dashed #d1d5db",
                    backgroundColor: "#f9fafb",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => document.getElementById("photos-upload").click()}
                >
                  <span style={{ fontSize: "32px", marginBottom: "8px" }}>📷</span>
                  <span style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", padding: "0 8px" }}>
                    Add Photo
                  </span>
                  <span style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>
                    {galleryImages.length}/10
                  </span>
                </div>
              )}
            </div>

            <div className="photo-upload-actions">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoFiles}
                className="file-input"
                id="photos-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="photos-upload" className="btn btn-secondary">
                Choose Photos
              </label>
              <button
                disabled={uploadingPhotos || galleryImages.length >= 10}
                type="button"
                className="btn btn-outline"
                onClick={() => document.getElementById("photos-upload").click()}
              >
                {uploadingPhotos ? "Uploading..." : `Upload Photos (${galleryImages.length}/10)`}
              </button>
            </div>
          </div>

          <div className="address-section">
            <h3 className="card-title">Business Address</h3>
            <div className="form-grid">
              <div className="form_group" style={{ gridColumn: "1 / -1" }}>
                <label className="form_label">Street Address</label>
                <input
                  name="street"
                  value={form.restaurantAddress.street}
                  onChange={handleAddressChange}
                  placeholder="Enter street address"
                  className="form-input"
                />
              </div>
              <div className="form_group">
                <label className="form_label">City</label>
                <input
                  name="city"
                  value={form.restaurantAddress.city}
                  onChange={handleAddressChange}
                  placeholder="Enter city"
                  className="form-input"
                />
              </div>
              <div className="form_group">
                <label className="form_label">State</label>
                <input
                  name="state"
                  value={form.restaurantAddress.state}
                  onChange={handleAddressChange}
                  placeholder="Enter state"
                  className="form-input"
                />
              </div>
              <div className="form_group">
                <label className="form_label">Zip Code</label>
                <input
                  name="zipCode"
                  value={form.restaurantAddress.zipCode}
                  onChange={handleAddressChange}
                  placeholder="Enter zip code"
                  className="form-input"
                />
              </div>
              <div className="form_group">
                <label className="form_label">Latitude</label>
                <input
                  name="latitude"
                  type="text"
                  value={form.restaurantAddress.latitude !== null ? form.restaurantAddress.latitude : ""}
                  placeholder="Not set"
                  className="form-input"
                  readOnly
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    cursor: "not-allowed",
                    color: "rgba(203, 213, 225, 0.6)",
                  }}
                />
                <p className="form-hint">Set via map picker below</p>
              </div>
              <div className="form_group">
                <label className="form_label">Longitude</label>
                <input
                  name="longitude"
                  type="text"
                  value={form.restaurantAddress.longitude !== null ? form.restaurantAddress.longitude : ""}
                  placeholder="Not set"
                  className="form-input"
                  readOnly
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    cursor: "not-allowed",
                    color: "rgba(203, 213, 225, 0.6)",
                  }}
                />
                <p className="form-hint">Set via map picker below</p>
              </div>
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  console.log("Opening map picker...");
                  setShowMapPicker(true);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>📍</span>
                Pick Location on Map
              </button>
              {form.restaurantAddress.latitude && form.restaurantAddress.longitude && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleClearLocation}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>🗑️</span>
                    Clear Location
                  </button>
                  <span className="form-hint" style={{ margin: 0 }}>
                    Location set: {form.restaurantAddress.latitude.toFixed(6)},{" "}
                    {form.restaurantAddress.longitude.toFixed(6)}
                  </span>
                </>
              )}
            </div>
            {form.restaurantAddress.latitude && form.restaurantAddress.longitude && (
              <div className="map-preview" style={{ marginTop: "16px" }}>
                <iframe
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: "12px" }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${form.restaurantAddress.latitude},${form.restaurantAddress.longitude}&output=embed`}
                ></iframe>
                <p className="form-hint" style={{ marginTop: "8px" }}>
                  <a
                    href={`https://www.google.com/maps?q=${form.restaurantAddress.latitude},${form.restaurantAddress.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#6366f1", textDecoration: "underline" }}
                  >
                    View in Google Maps
                  </a>
                </p>
              </div>
            )}
          </div>

          {publicUrl && (
            <div className="url-section">
              <h3 className="card-title">Public Access</h3>
              <div className="url-display">
                <div className="url-info">
                  <label className="form_label">Public Gift Cards Page</label>
                  <div className="url-text">{publicUrl}</div>
                </div>
                <button type="button" className="btn btn-outline" onClick={copyPublicLink}>
                  Copy URL
                </button>
              </div>
            </div>
          )}

          <div className="action-row">
            <button onClick={handleSaveSettings} disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save Business Profile"}
            </button>
            <button
              type="button"
              className="btn btn-success"
              disabled={downloading || !publicUrl}
              onClick={downloadQrPoster}
            >
              {downloading ? "Generating..." : "Print Your Digital Ad"}
            </button>
            {settingsMessage && <span className="message success">{settingsMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="settings-section">
      <div className="section-header">
        <div className="section-icon">💳</div>
        <div>
          <h2 className="section-title">Payment Configuration</h2>
          <p className="section-description">Set up Razorpay payments to receive customer payments directly</p>
        </div>
      </div>

      <div className="settings-card payment-card">
        <div className="card-content">
          <div className="setup-header">
            <h3 className="card-title">Razorpay Payments Setup</h3>
            <button
              type="button"
              className="btn btn-info"
              onClick={() => setShowRazorpayInstructions(!showRazorpayInstructions)}
            >
              {showRazorpayInstructions ? "Hide" : "Show"} Setup Guide
            </button>
          </div>

          {showRazorpayInstructions && (
            <div className="setup-guide">
              <h4>How to get your Razorpay credentials:</h4>
              <ol className="setup-steps">
                <li>
                  Log into your{" "}
                  <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">
                    Razorpay Dashboard
                  </a>
                </li>
                <li>Go to "Settings" → "API Keys"</li>
                <li>Copy your Key ID (e.g., rzp_test_... or rzp_live_...)</li>
                <li>Click "Reveal Key Secret" to get your Key Secret</li>
                <li>Copy both Key ID and Key Secret (keep them secure)</li>
                <li>Paste them below to use your own Razorpay account</li>
              </ol>
              <p className="form-hint">
                <strong>Note:</strong> If you leave these empty, the system will use global Razorpay credentials from
                environment variables.
              </p>
            </div>
          )}

          <div className="form-grid">
            <div className="form_group">
              <label className="form_label">Razorpay Key ID</label>
              <input
                name="razorpayKeyId"
                value={form.razorpayKeyId}
                onChange={handleChange}
                placeholder="rzp_test_... or rzp_live_..."
                className="form-input"
              />
              <p className="form-hint">Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)</p>
            </div>

            <div className="form_group">
              <label className="form_label">Razorpay Key Secret</label>
              <div className="input-with-action">
                <input
                  name="razorpayKeySecret"
                  type={showRazorpayToken ? "text" : "password"}
                  value={form.razorpayKeySecret}
                  onChange={handleChange}
                  placeholder="Enter your Razorpay Key Secret"
                  className="form-input"
                />
                <button type="button" className="btn btn-outline" onClick={() => setShowRazorpayToken((s) => !s)}>
                  {showRazorpayToken ? "Hide" : "Show"}
                </button>
              </div>
              <p className="form-hint">We store this key securely and use it only to process your sales.</p>
            </div>
          </div>

          <div className="action-row">
            <button onClick={handleSaveSettings} disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save Payment Settings"}
            </button>
            {settingsMessage && <span className="message success">{settingsMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  // SQUARE API COMMENTED OUT - Payment Configuration Section
  {
    /* <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">💳</div>
            <div>
              <h2 className="section-title">Payment Configuration</h2>
              <p className="section-description">Set up Square payments to receive customer payments directly</p>
            </div>
          </div>

          <div className="settings-card payment-card">
            <div className="card-content">
              <div className="setup-header">
                <h3 className="card-title">Square Payments Setup</h3>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={() => setShowSquareInstructions(!showSquareInstructions)}
                >
                  {showSquareInstructions ? "Hide" : "Show"} Setup Guide
                </button>
              </div>

              {showSquareInstructions && (
                <div className="setup-guide">
                  <h4>How to get your Square credentials:</h4>
                  <ol className="setup-steps">
                    <li>
                      Log into your{" "}
                      <a href="https://developer.squareup.com" target="_blank" rel="noopener noreferrer">
                        Square Developer Dashboard
                      </a>
                    </li>
                    <li>Go to "Applications" and create a new application</li>
                    <li>Copy the Application ID from your app</li>
                    <li>Go to "Locations" and copy your Location ID</li>
                    <li>Generate an Access Token with "PAYMENTS_WRITE" permission</li>
                    <li>Copy the Access Token (keep it secure)</li>
                  </ol>
                </div>
              )}

              <div className="form-grid">
                <div className="form_group">
                  <label className="form_label">Square Application ID</label>
                  <input
                    name="squareApplicationId"
                    value={form.squareApplicationId}
                    onChange={handleChange}
                    placeholder="sandbox-sq0idb-..."
                    className="form-input"
                  />
                </div>

                <div className="form_group">
                  <label className="form_label">Square Location ID</label>
                  <input
                    name="squareLocationId"
                    value={form.squareLocationId}
                    onChange={handleChange}
                    placeholder="LXXXXXXXXXXX"
                    className="form-input"
                  />
                </div>

                <div className="form_group">
                  <label className="form_label">Square Access Token</label>
                  <div className="input-with-action">
                    <input
                      name="squareAccessToken"
                      type={showToken ? "text" : "password"}
                      value={form.squareAccessToken}
                      onChange={handleChange}
                      placeholder="EAAA..."
                      className="form-input"
                    />
                    <button type="button" className="btn btn-outline" onClick={() => setShowToken((s) => !s)}>
                      {showToken ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="form-hint">We store this token securely and use it only to process your sales.</p>
                </div>
              </div>

              <div className="action-row">
                <button onClick={handleSaveSettings} disabled={saving} className="btn btn-primary">
                  {saving ? "Saving..." : "Save Payment Settings"}
                </button>
                {settingsMessage && <span className="message success">{settingsMessage}</span>}
              </div>
            </div>
          </div>
        </div> */
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your business profile, security, and payment settings</p>
      </div>

      <div className="settings-container">
        {currentSection === "security" && renderSecuritySection()}
        {currentSection === "business-profile" && renderBusinessProfileSection()}
        {currentSection === "payment" && renderPaymentSection()}
      </div>

      {showMapPicker && (
        <MapLocationPicker
          latitude={form.restaurantAddress.latitude || null}
          longitude={form.restaurantAddress.longitude || null}
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};

export default Settings;
