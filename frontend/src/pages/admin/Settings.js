import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Settings.css";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const initial = user?.user || {};
  const [form, setForm] = useState({
    restaurantName: initial.restaurantName || "",
    businessSlug: initial.businessSlug || "",
    squareApplicationId: initial.squareApplicationId || "",
    squareLocationId: initial.squareLocationId || "",
    squareAccessToken: initial.squareAccessToken || "",
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
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || "");
  const [downloading, setDownloading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showSquareInstructions, setShowSquareInstructions] = useState(false);

  const publicUrl = useMemo(() => {
    const slug = (form.businessSlug || "").trim();
    if (!slug) return null;
    return `${window.location.origin}/${slug}/giftcards`;
  }, [form.businessSlug]);

  useEffect(() => {
    setForm({
      restaurantName: initial.restaurantName || "",
      businessSlug: initial.businessSlug || "",
      squareApplicationId: initial.squareApplicationId || "",
      squareLocationId: initial.squareLocationId || "",
      squareAccessToken: initial.squareAccessToken || "",
    });
    setLogoUrl(initial.logoUrl || "");
  }, [
    initial.restaurantName,
    initial.businessSlug,
    initial.squareApplicationId,
    initial.squareLocationId,
    initial.squareAccessToken,
    initial.logoUrl,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await axios.put("/api/v1/admin/settings", form);
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
            "_"
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

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your business profile, security, and payment settings</p>
      </div>

      <div className="settings-container">
        {/* Security Section */}
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
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter current password"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter new password"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
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

        {/* Business Profile Section */}
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
                  <label className="form-label">Business Logo</label>
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

                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input
                    name="restaurantName"
                    value={form.restaurantName}
                    onChange={handleNameChange}
                    placeholder="Enter your business name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Slug (Auto-generated)</label>
                  <input
                    name="businessSlug"
                    value={form.businessSlug}
                    readOnly
                    className="form-input readonly"
                    placeholder="Business slug will be generated automatically"
                  />
                  <p className="form-hint">
                    This is automatically generated from your business name and cannot be edited.
                  </p>
                </div>
              </div>

              {publicUrl && (
                <div className="url-section">
                  <h3 className="card-title">Public Access</h3>
                  <div className="url-display">
                    <div className="url-info">
                      <label className="form-label">Public Gift Cards Page</label>
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

        {/* Payment Configuration Section */}
        <div className="settings-section">
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
                <div className="form-group">
                  <label className="form-label">Square Application ID</label>
                  <input
                    name="squareApplicationId"
                    value={form.squareApplicationId}
                    onChange={handleChange}
                    placeholder="sandbox-sq0idb-..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Square Location ID</label>
                  <input
                    name="squareLocationId"
                    value={form.squareLocationId}
                    onChange={handleChange}
                    placeholder="LXXXXXXXXXXX"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Square Access Token</label>
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
