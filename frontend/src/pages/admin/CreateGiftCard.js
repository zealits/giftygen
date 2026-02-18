import React, { useState, useEffect } from "react";
import "./GiftCards.css";
import "./CreateGiftCard.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createGiftCard } from "../../services/Actions/giftCardActions";
import { CREATE_GIFTCARD_RESET } from "../../services/Constants/giftCardConstants";
import { Link2, Gift, X, Pencil, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const CreateGiftCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";
  const giftCardCreate = useSelector((state) => state.giftCardCreate);

  const [formData, setFormData] = useState({
    giftCardName: "",
    giftCardTag: "🎂 Birthday Special",
    description: "",
    amount: "",
    discount: "",
    expirationDate: "",
    giftCardImg: "",
    quantity: "",
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState({ file: null, name: "" });
  const [aiGeneratedFile, setAiGeneratedFile] = useState(null);
  const [isAiImageLoading, setIsAiImageLoading] = useState(false);
  const [aiImageError, setAiImageError] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const imageInputRef = React.useRef(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState({
    descriptions_medium: [],
    descriptions_short: [],
    tags: [],
    giftcard_name_suggestions: [],
  });
  const [aiSelection, setAiSelection] = useState({
    name: "",
    description: "",
    tag: "",
  });

  const [isCreateSuccessModalOpen, setCreateSuccessModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState("manual"); // "manual" | "ai"
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiImagePanelOpen, setAiImagePanelOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      dispatch({ type: CREATE_GIFTCARD_RESET });
    };
  }, [dispatch]);

  useEffect(() => {
    if (giftCardCreate.success) {
      setCreateSuccessModalOpen(true);
      setTimeout(() => {
        setCreateSuccessModalOpen(false);
        dispatch({ type: CREATE_GIFTCARD_RESET });
        navigate("/giftcards");
      }, 2000);
    }
  }, [giftCardCreate.success, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiPromptChange = (e) => setAiPrompt(e.target.value);

  const handleGenerateWithAi = async () => {
    if (!formData.giftCardName || !aiPrompt) {
      setAiError("Please enter both a gift card name and what this gift card is for.");
      return;
    }
    try {
      setIsAiLoading(true);
      setAiError("");
      const { data } = await axios.post("/api/ai/describe", {
        giftcard_name: formData.giftCardName,
        prompt: aiPrompt,
      });
      setAiSuggestions({
        descriptions_medium: data.descriptions_medium || [],
        descriptions_short: data.descriptions_short || [],
        tags: data.tags || [],
        giftcard_name_suggestions: data.giftcard_name_suggestions || [],
      });
    } catch (err) {
      setAiError("Could not fetch suggestions right now. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectAiName = (name) => {
    setFormData((prev) => ({ ...prev, giftCardName: name }));
    setAiSelection((prev) => ({ ...prev, name }));
  };
  const handleSelectAiDescription = (description) => {
    setFormData((prev) => ({ ...prev, description }));
    setAiSelection((prev) => ({ ...prev, description }));
  };
  const handleSelectAiTag = (tag) => {
    setFormData((prev) => ({ ...prev, giftCardTag: tag }));
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setAiSelection((prev) => ({ ...prev, tag }));
  };

  const addTag = (e) => {
    e?.preventDefault?.();
    const t = (typeof tagInput === "string" ? tagInput : "").trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const imageFile = selectedFile.file || aiGeneratedFile;
    if (!imageFile) {
      setAiImageError("Please upload an image or generate one with AI.");
      return;
    }
    setAiImageError("");
    const formDataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "image" && key !== "giftCardImg") {
        formDataToSubmit.append(key, formData[key]);
      }
    });
    formDataToSubmit.append("tags", JSON.stringify(tags.length ? tags : [formData.giftCardTag]));
    if (formData.quantity !== undefined && formData.quantity !== "") {
      formDataToSubmit.append("quantity", formData.quantity);
    }
    formDataToSubmit.append("image", imageFile);
    if (businessSlug) {
      formDataToSubmit.append("businessSlug", businessSlug);
    }
    dispatch(createGiftCard(formDataToSubmit));
  };

  /** Convert base64 string from API to a File for upload */
  const base64ToFile = (base64, mediaType = "image/png", filename = "ai-generated.png") => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mediaType });
    return new File([blob], filename, { type: mediaType });
  };

  const handleGenerateAiImage = async () => {
    const desc = (imagePrompt || formData.description || "").trim();
    if (!formData.giftCardName?.trim() || !desc) {
      setAiImageError("Please enter Gift Card Name and an image description (or use a style preset).");
      return;
    }
    setAiImageError("");
    setIsAiImageLoading(true);
    try {
      const { data } = await axios.post(
        "/api/ai/image",
        {
          giftcard_name: formData.giftCardName.trim(),
          description: desc,
        },
        {
          headers: { "Content-Type": "application/json", accept: "application/json" },
        }
      );
      const base64 = data?.image_base64;
      const mediaType = data?.media_type || "image/png";
      if (!base64) {
        setAiImageError("No image was returned. Please try again.");
        return;
      }
      const file = base64ToFile(base64, mediaType);
      const dataUrl = `data:${mediaType};base64,${base64}`;
      setAiGeneratedFile(file);
      setSelectedFile({ file: null, name: "" });
      setFormData((prev) => ({ ...prev, giftCardImg: dataUrl }));
      setShowImagePreview(true);
      setAiImagePanelOpen(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (err) {
      const res = err.response;
      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setAiImageError("Network error. Check your connection or try again later.");
      } else if (err.code === "ERR_BAD_REQUEST" && res?.status === 400) {
        setAiImageError(res?.data?.message || "Invalid request. Check name and description.");
      } else if (res?.status === 500) {
        setAiImageError("Image service is temporarily unavailable. Try again later or upload an image.");
      } else {
        const msg = res?.data?.message || res?.data?.error || (res?.status ? `Error ${res.status}` : null);
        setAiImageError(msg || "Could not generate image. Please try again.");
      }
    } finally {
      setIsAiImageLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile({ file: null, name: "" });
    setAiGeneratedFile(null);
    setFormData((prev) => ({ ...prev, giftCardImg: "" }));
    setShowImagePreview(false);
    setAiImageError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAiGeneratedFile(null);
      setAiImageError("");
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile({ file, name: file.name });
      setFormData((prev) => ({ ...prev, giftCardImg: previewUrl }));
      setShowImagePreview(true);
    }
  };

  const formatFileName = (fileName) => {
    if (!fileName) return "";
    const maxLength = 20;
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - 3)}...${extension}`;
  };

  const stylePresets = [
    { label: "Minimalist", text: "Minimalist and clean, generous white space, elegant typography-focused layout" },
    { label: "Luxury", text: "Luxury gold foil texture, deep dark background, ornate borders, premium feel" },
    { label: "Playful", text: "Vibrant and playful, confetti, bright bold colors, fun celebratory mood" },
    { label: "Botanical", text: "Soft floral botanical with watercolor textures, pastel palette, organic feel" },
    { label: "Geometric", text: "Modern geometric abstract shapes, bold contrast, sharp lines, editorial style" },
  ];

  const applyStylePreset = (presetText) => {
    setImagePrompt((prev) => (prev === presetText ? "" : presetText));
  };

  const handleSaveDraft = () => {
    navigate("/giftcards");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      setAiGeneratedFile(null);
      setAiImageError("");
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile({ file, name: file.name });
      setFormData((prev) => ({ ...prev, giftCardImg: previewUrl }));
      setShowImagePreview(true);
    }
  };

  const tagOptions = [
    { value: "🎂 Birthday Special", label: "Birthday Special" },
    { value: "💍 Anniversary Delight", label: "Anniversary Delight" },
    { value: "🎉 Festive Cheers", label: "Festive Cheers" },
    { value: "🙏 Thank You", label: "Thank You" },
    { value: "🎉 Congratulations", label: "Congratulations" },
    { value: "💐 Get Well Soon", label: "Get Well Soon" },
    { value: "🏠 Housewarming Gift", label: "Housewarming Gift" },
    { value: "🍽 Fine Dining", label: "Fine Dining" },
    { value: "🍷 Romantic Dinner", label: "Romantic Dinner" },
    { value: "🥞 Weekend Brunch", label: "Weekend Brunch" },
    { value: "🍗 Family Feast", label: "Family Feast" },
    { value: "🍳 Chef's Special", label: "Chef's Special" },
    { value: "🍴 All-You-Can-Eat Buffet", label: "All-You-Can-Eat Buffet" },
    { value: "🏖 Relaxing Staycation", label: "Relaxing Staycation" },
    { value: "💆‍♀ Spa & Dine Combo", label: "Spa & Dine Combo" },
    { value: "🌴 Luxury Escape", label: "Luxury Escape" },
    { value: "🍷 Gourmet Experience", label: "Gourmet Experience" },
    { value: "🍇 Wine & Dine", label: "Wine & Dine" },
    { value: "🏖 Beachside Bliss", label: "Beachside Bliss" },
    { value: "🏞 Mountain Retreat", label: "Mountain Retreat" },
    { value: "🌆 City Lights Dining", label: "City Lights Dining" },
    { value: "🍛 Exotic Flavors", label: "Exotic Flavors" },
    { value: "👔 Employee Appreciation", label: "Employee Appreciation" },
    { value: "🎁 Loyalty Rewards", label: "Loyalty Rewards" },
    { value: "🧳 Client Gifting", label: "Client Gifting" },
    { value: "🏢 Corporate Thank You", label: "Corporate Thank You" },
    { value: "💖 Just Because", label: "Just Because" },
    { value: "🍷 Date Night", label: "Date Night" },
    { value: "☀ Summer Treats", label: "Summer Treats" },
    { value: "❄ Winter Warmth", label: "Winter Warmth" },
    { value: "🌷 Spring Refresh", label: "Spring Refresh" },
    { value: "🍂 Autumn Flavors", label: "Autumn Flavors" },
    { value: "🍽 For Food Lovers", label: "For Food Lovers" },
    { value: "👨 For Him", label: "For Him" },
    { value: "👩 For Her", label: "For Her" },
    { value: "👨‍👩‍👧‍👦 For the Family", label: "For the Family" },
    { value: "👥 For the Team", label: "For the Team" },
    { value: "💝 For You", label: "For You" },
  ];

  return (
    <div className="create-giftcard-page">
      <div className="main-content create-giftcard-form-wrapper">
        <h1 className="heading">Create a Gift Card Template</h1>
        <p className="page-subtitle">Fill details manually or switch to AI mode to auto-generate content & images</p>

        <div className="create-giftcard-tabs">
          <button
            type="button"
            className={`create-giftcard-tab ${creationMode === "manual" ? "active" : ""}`}
            onClick={() => { setCreationMode("manual"); setAiPanelOpen(false); setAiImagePanelOpen(false); }}
          >
            <Pencil size={18} />
            <span>Manual</span>
          </button>
          <button
            type="button"
            className={`create-giftcard-tab ${creationMode === "ai" ? "active" : ""}`}
            onClick={() => setCreationMode("ai")}
          >
            <Sparkles size={18} />
            <span>AI-Assisted</span>
          </button>
        </div>

        <div className="create-giftcard-layout">
          <form id="createGiftCardForm" className="create-giftcard-form-area" onSubmit={handleSubmit}>
            <div className="create-giftcard-left">
              {/* Collapsible AI Content Assistant - only when AI mode */}
              <div
                className={`create-giftcard-ai-trigger ${creationMode !== "ai" ? "disabled" : ""} ${aiPanelOpen ? "open" : ""}`}
                onClick={() => creationMode === "ai" && setAiPanelOpen((o) => !o)}
                role="button"
                tabIndex={creationMode === "ai" ? 0 : -1}
                onKeyDown={(e) => creationMode === "ai" && (e.key === "Enter" || e.key === " ") && setAiPanelOpen((o) => !o)}
              >
                <div className="create-giftcard-ai-trigger-icon">✦</div>
                <div className="create-giftcard-ai-trigger-text">
                  <h4>AI Content Assistant</h4>
                  <p>Describe your card idea → get name suggestions, description & tags</p>
                </div>
                <span className="create-giftcard-ai-trigger-arrow">▾</span>
              </div>

              {creationMode === "ai" && aiPanelOpen && (
            <div className="ai-helper-card create-giftcard-ai-block">
            <div className="ai-helper-header">
              <span className="ai-helper-pill">✦ AI Call 1 — Content Generation</span>
            </div>
            <div className="giftcards-page-form-group ai-helper-input-group">
              <label htmlFor="aiPrompt">What is this gift card for?</label>
              <textarea
                id="aiPrompt"
                name="aiPrompt"
                rows="2"
                placeholder="e.g. create real estate birthday giftcard"
                value={aiPrompt}
                onChange={handleAiPromptChange}
              />
            </div>
            <button
              type="button"
              className="ai-helper-generate-btn"
              onClick={handleGenerateWithAi}
              disabled={isAiLoading}
            >
              {isAiLoading ? "Generating suggestions..." : "Generate Name Suggestions, Description & Tags"}
            </button>
            {aiError && <p className="ai-helper-error">{aiError}</p>}
            {(aiSuggestions.giftcard_name_suggestions?.length > 0 ||
              aiSuggestions.descriptions_medium?.length > 0 ||
              aiSuggestions.tags?.length > 0) && (
              <div className="ai-helper-suggestions">
                {aiSuggestions.giftcard_name_suggestions?.length > 0 && (
                  <div className="ai-helper-section">
                    <h4 className="ai-helper-section-title">Name suggestions</h4>
                    <div className="ai-helper-chip-row">
                      {aiSuggestions.giftcard_name_suggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className={`ai-chip ${aiSelection.name === name ? "ai-chip-selected" : ""}`}
                          onClick={() => handleSelectAiName(name)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {aiSuggestions.descriptions_medium?.length > 0 && (
                  <div className="ai-helper-section">
                    <h4 className="ai-helper-section-title">Description ideas</h4>
                    <div className="ai-helper-card-grid">
                      {aiSuggestions.descriptions_medium.map((desc) => (
                        <button
                          key={desc}
                          type="button"
                          className={`ai-description-card ${aiSelection.description === desc ? "ai-description-card-selected" : ""}`}
                          onClick={() => handleSelectAiDescription(desc)}
                        >
                          <span>{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {aiSuggestions.tags?.length > 0 && (
                  <div className="ai-helper-section">
                    <h4 className="ai-helper-section-title">Tag suggestions</h4>
                    <div className="ai-helper-chip-row">
                      {aiSuggestions.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`ai-chip ${aiSelection.tag === tag ? "ai-chip-selected" : ""}`}
                          onClick={() => handleSelectAiTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
            )}

            <div className="create-giftcard-studio-card">
            <h2 className="create-giftcard-section-title">Basic Information</h2>
            <div className="giftcards-page-form-group">
              <label htmlFor="giftCardName">Gift Card Name *</label>
              <input
                type="text"
                id="giftCardName"
                name="giftCardName"
                value={formData.giftCardName}
                onChange={handleChange}
                placeholder="e.g. Premium Wellness Gift Card"
                required
              />
            </div>
            <div className="giftcards-page-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this gift card offers, how to redeem, terms..."
                required
              />
            </div>
            <div className="giftcards-page-form-group">
              <label>Tags</label>
              <p className="create-giftcard-field-hint">Type a tag and press Enter.</p>
              <div className="create-giftcard-tags-wrap">
                {tags.map((t, i) => (
                  <span key={i} className="create-giftcard-tag-chip">
                    {t}
                    <button type="button" className="create-giftcard-tag-remove" onClick={() => removeTag(i)} aria-label="Remove tag">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="create-giftcard-tag-input"
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag(e)}
                />
              </div>
              <select
                id="giftCardTag"
                name="giftCardTag"
                value={formData.giftCardTag}
                onChange={handleChange}
                className="create-giftcard-quick-tag-select"
                aria-label="Quick add preset tag"
              >
                {tagOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button type="button" className="create-giftcard-add-preset-tag" onClick={() => { const t = formData.giftCardTag; if (t && !tags.includes(t)) setTags((p) => [...p, t]); }}>
                Add preset tag
              </button>
            </div>
            </div>

            <div className="create-giftcard-studio-card">
            <h2 className="create-giftcard-section-title">Pricing & Availability</h2>
            <div className="create-giftcard-price-row">
            <div className="giftcards-page-form-group">
              <label htmlFor="amount">Price ($) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="50.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="giftcards-page-form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="giftcards-page-form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                placeholder="100"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            </div>
            <div className="giftcards-page-form-group" style={{ marginTop: 16 }}>
              <label htmlFor="expirationDate">Expiry Date *</label>
              <input
                type="date"
                id="expirationDate"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            </div>

            <div className="create-giftcard-studio-card">
            <h2 className="create-giftcard-section-title">Card Image</h2>
            {(selectedFile.file || aiGeneratedFile) ? (
              <div className="image-current-wrapper">
                <div className="image-current-preview" onClick={() => setShowImagePreview(true)}>
                  <img src={formData.giftCardImg} alt="Gift card" />
                  <span className="image-current-badge">{aiGeneratedFile ? "AI generated" : "Uploaded"}</span>
                </div>
                <div className="create-giftcard-upload-actions">
                  <button type="button" className="create-giftcard-upload-btn ai-gen" onClick={() => { setAiImagePanelOpen(true); setImagePrompt(formData.description || ""); }} disabled={creationMode !== "ai"}>
                    ✦ Regenerate
                  </button>
                  <button type="button" className="create-giftcard-upload-btn manual" onClick={clearImage}>
                    ✕ Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
              <div
                className={`create-giftcard-upload-area ${dragOver ? "drag-over" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="create-giftcard-upload-icon">🖼️</span>
                <div className="create-giftcard-upload-text">Drop an image here or choose an option below</div>
                <div className="create-giftcard-upload-hint">PNG, JPG, SVG · Recommended 1600×900px</div>
                <div className="create-giftcard-upload-actions">
                  <button type="button" className="create-giftcard-upload-btn manual" onClick={() => imageInputRef.current?.click()}>
                    📁 Browse File
                  </button>
                  <button
                    type="button"
                    className={`create-giftcard-upload-btn ai-gen ${creationMode !== "ai" ? "disabled" : ""}`}
                    onClick={() => { setAiImagePanelOpen(true); setImagePrompt(formData.description || ""); }}
                    disabled={creationMode !== "ai"}
                  >
                    ✦ Generate with AI
                  </button>
                </div>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {aiImagePanelOpen && creationMode === "ai" && (
                <div className="ai-helper-card create-giftcard-ai-block" style={{ marginTop: 16 }}>
                  <div className="create-giftcard-section-title">✦ AI Call 2 — Image Generation</div>
                  <div className="create-giftcard-locked-field">
                    <span className="lock-icon">🔒</span>
                    <div className="create-giftcard-locked-content">
                      <div className="create-giftcard-locked-label">Gift Card Name (used as image context)</div>
                      <div className="create-giftcard-locked-value">{formData.giftCardName || "(no name entered yet)"}</div>
                    </div>
                    <span className="create-giftcard-locked-badge">Locked</span>
                  </div>
                  <div className="create-giftcard-divider-or">Describe the visual style for the image</div>
                  <label className="create-giftcard-ai-image-label">Image Prompt <em>— pre-filled from description, freely editable</em></label>
                  <textarea
                    className="create-giftcard-image-desc-input"
                    placeholder="e.g. Elegant gold and emerald design with soft floral patterns, luxurious spa mood..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={3}
                  />
                  <div className="create-giftcard-style-presets-label">Quick Style Presets</div>
                  <div className="create-giftcard-style-presets">
                    {stylePresets.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        className={`create-giftcard-style-preset ${imagePrompt === p.text ? "active" : ""}`}
                        onClick={() => applyStylePreset(p.text)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {isAiImageLoading && (
                    <div className="create-giftcard-generating-overlay">
                      <div className="create-giftcard-spinner" />
                      <div className="create-giftcard-generating-text">Generating your image...<br /><span style={{ opacity: 0.5, fontSize: 11 }}>This usually takes a few seconds</span></div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="create-giftcard-ai-img-btn"
                    onClick={handleGenerateAiImage}
                    disabled={isAiImageLoading || !(imagePrompt || formData.description)?.trim()}
                  >
                    ✦ Generate Image
                  </button>
                </div>
              )}
              </>
            )}
            {aiImageError && <p className="image-source-error">{aiImageError}</p>}
            </div>
          </div>
          </form>

          <div className="create-giftcard-right">
            <div className="create-giftcard-preview-card">
              <div className="create-giftcard-live-preview-title">
                Live Preview
                <span className="create-giftcard-live-dot" />
              </div>
              {/* Dashboard-style card: same layout as UserLanding gift cards */}
              <div className="create-giftcard-dashboard-preview">
                <div className="preview-dash-card">
                  <div className="preview-dash-image">
                    {formData.giftCardImg ? (
                      <img src={formData.giftCardImg} alt="Gift card" />
                    ) : (
                      <div className="preview-dash-image-placeholder">Card image</div>
                    )}
                    <div className="preview-dash-tags">
                      {(tags.length ? tags : (formData.giftCardTag ? [formData.giftCardTag] : [])).slice(0, 3).map((t, idx) => (
                        <span key={idx} className={`preview-dash-tag ${idx === 1 ? "preview-dash-tag-right" : ""}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="preview-dash-content">
                    <h2 className="preview-dash-title">{formData.giftCardName || "Your Card Name"}</h2>
                    <p className="preview-dash-desc">
                      {(formData.description || "").trim() ? (formData.description || "").slice(0, 80) + ((formData.description || "").length > 80 ? "..." : "") : "Description will appear here."}
                    </p>
                    <div className="preview-dash-info">
                      <div className="preview-dash-price-wrap">
                        <span className="preview-dash-price">{formatCurrency(formData.amount || 0, "INR")}</span>
                        <span className="preview-dash-price-label">Gift Value</span>
                      </div>
                      <div className="preview-dash-discount-wrap">
                        {formData.discount ? (
                          <span className="preview-dash-discount">{formData.discount}% OFF</span>
                        ) : null}
                      </div>
                    </div>
                    <button type="button" className="preview-dash-btn" disabled>
                      <Gift size={18} />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="create-giftcard-info-section">
                <div className="create-giftcard-info-row">
                  <span className="create-giftcard-info-label">Quantity</span>
                  <span className="create-giftcard-info-value">{formData.quantity !== "" && formData.quantity != null ? `${Number(formData.quantity).toLocaleString()} cards` : "—"}</span>
                </div>
                <div className="create-giftcard-info-row">
                  <span className="create-giftcard-info-label">Discount</span>
                  <span className="create-giftcard-info-value">{formData.discount ? `${formData.discount}% off` : "None"}</span>
                </div>
                <div className="create-giftcard-info-row">
                  <span className="create-giftcard-info-label">Final Price</span>
                  <span className="create-giftcard-info-value price-val">
                    {formData.amount && formData.discount != null && formData.discount !== ""
                      ? formatCurrency(formData.amount * (1 - Number(formData.discount) / 100), "INR")
                      : formData.amount ? formatCurrency(formData.amount, "INR") : "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="create-giftcard-submit-card">
              <ul className="create-giftcard-checklist">
                <li className={formData.giftCardName?.trim() ? "done" : ""}><span className="dot" />Gift card name</li>
                <li className={formData.amount ? "done" : ""}><span className="dot" />Price set</li>
                <li className={formData.expirationDate ? "done" : ""}><span className="dot" />Expiry date</li>
                <li className={formData.quantity !== "" && formData.quantity != null ? "done" : ""}><span className="dot" />Quantity defined</li>
              </ul>
              <button type="submit" form="createGiftCardForm" className="create-giftcard-submit-btn" disabled={giftCardCreate.loading}>
                🎁 {giftCardCreate.loading ? "Creating..." : "Publish Gift Card"}
              </button>
              <button type="button" className="create-giftcard-save-draft-btn" onClick={handleSaveDraft}>
                Save as Draft
              </button>
            </div>
          </div>
        </div>

        {showImagePreview && formData.giftCardImg && (
            <div className="image-preview-modal">
              <div className="image-preview-content">
                <button className="close-preview-btn" onClick={() => setShowImagePreview(false)}>
                  &times;
                </button>
                <img
                  src={formData.giftCardImg}
                  alt="Gift Card Preview"
                  className="preview-image"
                  style={{ maxWidth: "100%", borderRadius: "10px" }}
                />
            </div>
          </div>
        )}
      </div>

      {isCreateSuccessModalOpen && (
        <div className="create-success-modal-overlay">
          <div className="create-success-modal-container">
            <div className="create-success-modal-content">
              <div className="create-success-modal-icon">
                <svg viewBox="0 0 24 24" className="checkmark-svg">
                  <path
                    className="checkmark-path"
                    d="M3.7 14.3l5.6 5.6L20.3 4.7"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 className="create-success-modal-title">Success!</h2>
              <p className="create-success-modal-message">Gift Card Created Successfully</p>
              <div className="create-success-modal-confetti"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGiftCard;
