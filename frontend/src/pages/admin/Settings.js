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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || "");
  const [downloading, setDownloading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const publicUrl = useMemo(() => {
    const slug = (form.businessSlug || "").trim();
    if (!slug) return null;
    return `/${slug}/giftcards`;
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

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      restaurantName: value,
      // If user hasn't manually edited slug, keep it in sync with name
      businessSlug: prev.businessSlug ? prev.businessSlug : slugify(value),
    }));
  };

  const regenerateSlug = () => {
    setForm((prev) => ({ ...prev, businessSlug: slugify(prev.restaurantName || "") }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await axios.put("/api/v1/admin/settings", form);
      setMessage("Settings saved");
    } catch (e) {
      setMessage(e?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyPublicLink = async () => {
    if (!publicUrl) return;
    const absolute = `${window.location.origin}${publicUrl}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setMessage("Link copied");
      setTimeout(() => setMessage(""), 1500);
    } catch (_) {
      setMessage("Copy failed");
      setTimeout(() => setMessage(""), 1500);
    }
  };

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    setUploadingLogo(true);
    setMessage("");
    try {
      const res = await axios.post("/api/v1/admin/settings/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoUrl(res.data.logoUrl);
      setMessage("Logo uploaded");
    } catch (e) {
      setMessage(e?.response?.data?.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const downloadQrPoster = async () => {
    setDownloading(true);
    setMessage("");
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
          a.download = `${safeName}_QR_Poster.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }, "image/png");
        setDownloading(false);
      };
      img.onerror = () => {
        setDownloading(false);
        setMessage("Failed to render poster");
      };
      img.src = svgDataUrl;
    } catch (e) {
      setMessage(e?.response?.data?.message || "Failed to generate poster");
      setDownloading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1 className="heading">Settings</h1>

      <div className="settings-grid">
        {/* Branding & QR */}
        <div className="settings-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Branding & QR Poster</h2>
              <p className="card-subtitle">Upload your logo and download a printable QR poster.</p>
            </div>
          </div>

          <div className="form-row">
            <label>Business Logo</label>
            <div className="logo-row">
              {logoUrl ? <img src={logoUrl} alt="logo" className="logo-thumb" /> : <div className="logo-thumb" />}
              <input type="file" accept="image/*" onChange={handleLogoFile} />
              <button
                disabled={uploadingLogo}
                type="button"
                className="mini-btn"
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                {uploadingLogo ? "Uploading..." : "Upload"}
              </button>
            </div>
            <div className="hint">PNG/JPG preferred. Stored securely on Cloudinary.</div>
          </div>

          <div className="form-row">
            <label>QR Poster</label>
            <button
              type="button"
              className="primary-btn"
              disabled={downloading || !publicUrl}
              onClick={downloadQrPoster}
            >
              {downloading ? "Preparing..." : "Download QR Poster"}
            </button>
            {!publicUrl && <div className="hint">Set your business slug to enable your public link.</div>}
          </div>
        </div>

        {/* Business Card */}
        <div className="settings-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Business Profile</h2>
              <p className="card-subtitle">Update your business display name and public slug.</p>
            </div>
          </div>

          <div className="form-row">
            <label>Restaurant/Business Name</label>
            <input
              name="restaurantName"
              value={form.restaurantName}
              onChange={handleNameChange}
              placeholder="e.g., Starbucks"
            />
          </div>

          <div className="form-row">
            <label>Business Slug</label>
            <div className="input-with-action">
              <input
                name="businessSlug"
                value={form.businessSlug}
                onChange={handleChange}
                placeholder="e.g., starbucks"
              />
              <button type="button" className="mini-btn" onClick={regenerateSlug} title="Regenerate from name">
                Regenerate
              </button>
            </div>
            {publicUrl && (
              <div className="hint">
                Public gift cards page:{" "}
                <span className="copy-row">
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    {publicUrl}
                  </a>
                  <button type="button" className="mini-btn" onClick={copyPublicLink}>
                    Copy
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="save-row">
            <button onClick={handleSave} disabled={saving} className="primary-btn">
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {message ? <span className="inline-msg">{message}</span> : null}
          </div>
        </div>

        {/* Payments Card */}
        <div className="settings-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Square Payments</h2>
              <p className="card-subtitle">Set your Square credentials to receive payments directly.</p>
            </div>
          </div>

          <div className="form-row">
            <label>Square Application ID</label>
            <input
              name="squareApplicationId"
              value={form.squareApplicationId}
              onChange={handleChange}
              placeholder="sandbox-sq0idb-..."
            />
          </div>

          <div className="form-row">
            <label>Square Location ID</label>
            <input
              name="squareLocationId"
              value={form.squareLocationId}
              onChange={handleChange}
              placeholder="LXXXXXXXXXXX"
            />
          </div>

          <div className="form-row">
            <label>Square Access Token</label>
            <div className="input-with-action">
              <input
                name="squareAccessToken"
                type={showToken ? "text" : "password"}
                value={form.squareAccessToken}
                onChange={handleChange}
                placeholder="EAAA..."
              />
              <button type="button" className="mini-btn" onClick={() => setShowToken((s) => !s)}>
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
            <div className="hint">We store this token on your account and use it only to process your sales.</div>
          </div>

          <div className="save-row">
            <button onClick={handleSave} disabled={saving} className="primary-btn">
              {saving ? "Saving..." : "Save Square Settings"}
            </button>
            {message ? <span className="inline-msg">{message}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
