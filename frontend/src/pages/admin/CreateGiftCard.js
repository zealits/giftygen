import React, { useState, useEffect } from "react";
import "./GiftCards.css";
import "./CreateGiftCard.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { createGiftCard, getGiftCardDetails, updateGiftCard } from "../../services/Actions/giftCardActions";
import { CREATE_GIFTCARD_RESET, UPDATE_GIFTCARD_RESET } from "../../services/Constants/giftCardConstants";
import { Link2, Gift, X, Pencil, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const CreateGiftCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";
  const giftCardCreate = useSelector((state) => state.giftCardCreate);
  const giftCardUpdate = useSelector((state) => state.giftCardUpdate);
  const { giftCard: editCard, loading: editCardLoading } = useSelector((state) => state.giftCardDetails);
  const [editPreFilled, setEditPreFilled] = useState(false);

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

  // AI content assistant (Call 1)
  const [aiNameIdea, setAiNameIdea] = useState(""); // Gift Card Name Idea (rough concept)
  const [aiContext, setAiContext] = useState(""); // Description / Context (what the card offers)
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
    if (editId) {
      dispatch(getGiftCardDetails(editId));
      setEditPreFilled(false);
    }
    return () => {
      dispatch({ type: CREATE_GIFTCARD_RESET });
      if (editId) dispatch({ type: UPDATE_GIFTCARD_RESET });
    };
  }, [dispatch, editId]);

  useEffect(() => {
    if (!editId || !editCard || editCard._id !== editId || editCardLoading || editPreFilled) return;
    const card = editCard;
    const expDate = card.expirationDate
      ? (typeof card.expirationDate === "string"
          ? card.expirationDate.split("T")[0]
          : new Date(card.expirationDate).toISOString().split("T")[0])
      : "";
    setFormData({
      giftCardName: card.giftCardName || "",
      giftCardTag: card.giftCardTag || "🎂 Birthday Special",
      description: card.description || "",
      amount: card.amount != null && card.amount !== "" ? String(card.amount) : "",
      discount: card.discount != null && card.discount !== "" ? String(card.discount) : "",
      expirationDate: expDate,
      giftCardImg: card.giftCardImg || "",
      quantity: card.quantity != null ? String(card.quantity) : "",
      status: card.status || "active",
    });
    setTags(
      Array.isArray(card.tags) && card.tags.length > 0 ? card.tags : card.giftCardTag ? [card.giftCardTag] : []
    );
    setSelectedFile({ file: null, name: card.giftCardImg ? "Current image" : "" });
    setAiGeneratedFile(null);
    setEditPreFilled(true);
  }, [editId, editCard, editCardLoading, editPreFilled]);

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

  useEffect(() => {
    if (editId && giftCardUpdate.success) {
      setCreateSuccessModalOpen(true);
      setTimeout(() => {
        setCreateSuccessModalOpen(false);
        dispatch({ type: UPDATE_GIFTCARD_RESET });
        navigate("/giftcards");
      }, 2000);
    }
  }, [editId, giftCardUpdate.success, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Clamp numeric fields to non-negative (and optional max). Prevents spinner/arrow key changes. */
  const handlePricingNumberChange = (e, field, min = 0, max = null) => {
    const raw = e.target.value;
    if (raw === "" || raw === undefined) {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    const num = field === "amount" ? parseFloat(raw) : parseInt(raw, 10);
    if (Number.isNaN(num)) return;
    let clamped = Math.max(min, num);
    if (max != null) clamped = Math.min(max, clamped);
    setFormData((prev) => ({ ...prev, [field]: String(clamped) }));
  };

  const preventArrowKeys = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
  };

  const handleGenerateWithAi = async () => {
    const effectiveName = (aiNameIdea || formData.giftCardName || "").trim();
    const context = aiContext.trim();

    if (!effectiveName || !context) {
      setAiError("Please enter both a gift card name idea and what this gift card is for.");
      return;
    }
    try {
      setIsAiLoading(true);
      setAiError("");
      const { data } = await axios.post("/api/ai/describe", {
        giftcard_name: effectiveName,
        prompt: context,
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
    if (!editId && !imageFile) {
      setAiImageError("Please upload an image or generate one with AI.");
      return;
    }
    setAiImageError("");
    const formDataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "image" && key !== "giftCardImg" && key !== "quantity") {
        const val = formData[key];
        if (val !== undefined && val !== null) formDataToSubmit.append(key, val);
      }
    });
    formDataToSubmit.append("tags", JSON.stringify(tags.length ? tags : [formData.giftCardTag]));
    const qVal = formData.quantity;
    const quantityNum =
      qVal !== undefined && qVal !== "" && qVal != null
        ? (() => {
            const n = Number(qVal);
            return Number.isFinite(n) && n >= 0 ? n : null;
          })()
        : null;
    formDataToSubmit.append("quantity", quantityNum != null ? String(quantityNum) : "");
    if (imageFile) {
      formDataToSubmit.append("image", imageFile);
    }
    if (businessSlug) {
      formDataToSubmit.append("businessSlug", businessSlug);
    }
    if (editId) {
      if (formData.status !== undefined) formDataToSubmit.append("status", formData.status);
      dispatch(updateGiftCard(editId, formDataToSubmit));
    } else {
      dispatch(createGiftCard(formDataToSubmit));
    }
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
    const nameTrimmed = (formData.giftCardName || "").trim();
    if (!nameTrimmed) {
      setAiImageError("Gift card name is required to save as draft.");
      return;
    }
    setAiImageError("");
    const formDataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "image" && key !== "giftCardImg") {
        const val = formData[key];
        if (val !== undefined && val !== null) formDataToSubmit.append(key, val);
      }
    });
    formDataToSubmit.append("tags", JSON.stringify(tags.length ? tags : [formData.giftCardTag]));
    const draftQVal = formData.quantity;
    const draftQuantityNum =
      draftQVal !== undefined && draftQVal !== "" && draftQVal != null
        ? (() => {
            const n = Number(draftQVal);
            return Number.isFinite(n) && n >= 0 ? n : null;
          })()
        : null;
    formDataToSubmit.append("quantity", draftQuantityNum != null ? String(draftQuantityNum) : "");
    formDataToSubmit.append("status", "draft");
    const imageFile = selectedFile.file || aiGeneratedFile;
    if (imageFile) {
      formDataToSubmit.append("image", imageFile);
    }
    if (businessSlug) {
      formDataToSubmit.append("businessSlug", businessSlug);
    }
    if (editId) {
      dispatch(updateGiftCard(editId, formDataToSubmit));
    } else {
      dispatch(createGiftCard(formDataToSubmit));
    }
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
        <h1 className="heading">{editId ? "Edit Gift Card Template" : "Create a Gift Card Template"}</h1>
        <p className="page-subtitle">
          {editId
            ? "Update details below. Same layout as creating."
            : "Fill details manually or switch to AI mode to auto-generate content & images"}
        </p>
        {editId && editCardLoading && !editPreFilled && (
          <p className="page-subtitle" style={{ color: "var(--dashboard-accent-light)" }}>Loading gift card...</p>
        )}

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
              {/* Combined AI Content Assistant + Call 1 card (shown only in AI mode) */}
              {creationMode === "ai" && (
                <div className="ai-helper-card create-giftcard-ai-block">
                  <div className="ai-helper-header">
                    <span className="ai-helper-pill ai-helper-pill-main">AI Content Assistant</span>
                    <p className="ai-helper-title">
                      Describe your card idea → get name suggestions, description & tags
                    </p>
                  </div>
                  <div className="ai-helper-header-sub">
                    <span className="ai-helper-pill">✦ AI Call 1 — Content Generation</span>
                  </div>

                  <div className="ai-helper-inputs-row">
                    <div className="giftcards-page-form-group ai-helper-input-group">
                      <label htmlFor="aiNameIdea">
                        Gift Card Name Idea <span className="create-giftcard-field-hint">(your rough concept)</span>
                      </label>
                      <textarea
                        id="aiNameIdea"
                        name="aiNameIdea"
                        rows="2"
                        placeholder="e.g. Premium Wellness Escape, Diwali Celebration Feast, Team Rewards Pass"
                        value={aiNameIdea}
                        onChange={(e) => setAiNameIdea(e.target.value)}
                      />
                    </div>
                    <div className="giftcards-page-form-group ai-helper-input-group">
                      <label htmlFor="aiContext">
                        Description / Context{" "}
                        <span className="create-giftcard-field-hint">(what does this card offer?)</span>
                      </label>
                      <textarea
                        id="aiContext"
                        name="aiContext"
                        rows="2"
                        placeholder="e.g. Redeemable for unlimited buffet dinner, festive desserts, and drinks for two at our partner restaurant"
                        value={aiContext}
                        onChange={(e) => setAiContext(e.target.value)}
                      />
                    </div>
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
              {/* Preset tag dropdown temporarily disabled as requested */}
              {false && (
                <>
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
                  <button
                    type="button"
                    className="create-giftcard-add-preset-tag"
                    onClick={() => {
                      const t = formData.giftCardTag;
                      if (t && !tags.includes(t)) setTags((p) => [...p, t]);
                    }}
                  >
                    Add preset tag
                  </button>
                </>
              )}
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
                onChange={(e) => handlePricingNumberChange(e, "amount", 0)}
                onKeyDown={preventArrowKeys}
                placeholder="50.00"
                min="0"
                step="0.01"
                required
                className="create-giftcard-number-input"
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
                onChange={(e) => handlePricingNumberChange(e, "discount", 0, 100)}
                onKeyDown={preventArrowKeys}
                placeholder="0"
                className="create-giftcard-number-input"
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
                onChange={(e) => handlePricingNumberChange(e, "quantity", 1)}
                onKeyDown={preventArrowKeys}
                className="create-giftcard-number-input"
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
                <div className="image-current-preview">
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
                  </div>
                  <div className="preview-dash-content">
                    <h2 className="preview-dash-title">{formData.giftCardName || "Your Card Name"}</h2>
                    <p className="preview-dash-desc">
                      {(formData.description || "").trim() ? (formData.description || "").slice(0, 80) + ((formData.description || "").length > 80 ? "..." : "") : "Description will appear here."}
                    </p>
                    {(tags.length ? tags : (formData.giftCardTag ? [formData.giftCardTag] : [])).length > 0 && (
                      <div className="preview-dash-tags">
                        {(tags.length ? tags : [formData.giftCardTag]).map((t, idx) => (
                          <span key={idx} className="preview-dash-tag">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="preview-dash-info">
                      <div className="preview-dash-price-wrap">
                        {(() => {
                          const base = Number(formData.amount) || 0;
                          const disc = Number(formData.discount) || 0;
                          const hasDiscount = disc > 0 && disc < 100;
                          const final = hasDiscount ? base * (1 - disc / 100) : base;
                          const baseText = formatCurrency(base, "INR");
                          const finalText = formatCurrency(final, "INR");

                          return hasDiscount ? (
                            <>
                              <span className="preview-dash-price preview-dash-price-original">
                                {baseText}
                              </span>
                              <span className="preview-dash-price preview-dash-price-final">
                                {finalText}
                              </span>
                            </>
                          ) : (
                            <span className="preview-dash-price">{baseText}</span>
                          );
                        })()}
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
                    {formData.amount
                      ? (() => {
                          const base = Number(formData.amount) || 0;
                          const disc = Number(formData.discount) || 0;
                          const hasDiscount = disc > 0 && disc < 100;
                          const final = hasDiscount ? base * (1 - disc / 100) : base;
                          const save = hasDiscount ? base - final : 0;
                          const finalText = formatCurrency(final, "INR");
                          const saveText = save > 0 ? formatCurrency(save, "INR") : null;
                          return hasDiscount && saveText
                            ? `${finalText} (Save ${saveText})`
                            : finalText;
                        })()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="create-giftcard-submit-card">
              {(giftCardCreate.error || giftCardUpdate.error) && (
                <p className="create-giftcard-submit-error" role="alert">
                  {giftCardCreate.error || giftCardUpdate.error}
                </p>
              )}
              <ul className="create-giftcard-checklist">
                <li className={formData.giftCardName?.trim() ? "done" : ""}><span className="dot" />Gift card name</li>
                <li className={formData.amount ? "done" : ""}><span className="dot" />Price set</li>
                <li className={formData.expirationDate ? "done" : ""}><span className="dot" />Expiry date</li>
                <li className={formData.quantity !== "" && formData.quantity != null ? "done" : ""}><span className="dot" />Quantity defined</li>
              </ul>
              <button type="submit" form="createGiftCardForm" className="create-giftcard-submit-btn" disabled={giftCardCreate.loading || giftCardUpdate.loading}>
                🎁 {giftCardCreate.loading || giftCardUpdate.loading
                  ? (editId ? "Updating..." : "Creating...")
                  : (editId ? "Update Gift Card" : "Publish Gift Card")}
              </button>
              <button type="button" className="create-giftcard-save-draft-btn" onClick={handleSaveDraft} disabled={giftCardCreate.loading || giftCardUpdate.loading}>
                Save as Draft
              </button>
            </div>
          </div>
        </div>

        {showImagePreview && formData.giftCardImg && (
            <div className="image-preview-modal create-giftcard-image-preview-modal" role="dialog" aria-modal="true" aria-label="Gift card image preview">
              <div className="image-preview-content">
                <button type="button" className="close-preview-btn" onClick={() => setShowImagePreview(false)} aria-label="Close preview">
                  <X size={24} />
                </button>
                <div className="image-preview-inner">
                  <img
                    src={formData.giftCardImg}
                    alt="Gift Card Preview"
                    className="preview-image"
                  />
                </div>
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
