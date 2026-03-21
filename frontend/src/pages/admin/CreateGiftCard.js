import React, { useState, useEffect } from "react";
import "./CreateGiftCardConsolidated.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { createGiftCard, getGiftCardDetails, updateGiftCard } from "../../services/Actions/giftCardActions";
import { CREATE_GIFTCARD_RESET, UPDATE_GIFTCARD_RESET } from "../../services/Constants/giftCardConstants";
import { Link2, Gift, X, Pencil, Sparkles, HelpCircle, Info } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const CreateGiftCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";
  const businessIndustry = user?.user?.industry || "";
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
    walletColor: "#3B5BDB",
  });
  const [templateType, setTemplateType] = useState("standard"); // "standard" | "dailyFree"
  const [dailyFreeConfig, setDailyFreeConfig] = useState({
    dailyQuota: "",
    validDaysFromIssue: "3",
    minCartValue: "",
    rewardType: "PERCENT",
    rewardPercent: "",
    rewardFixedAmount: "",
    rewardItemSku: "",
    customerSegment: "ALL",
    startDate: "",
    endDate: "",
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
  const getDailyPassOfferText = () => {
    const minCart = Number(dailyFreeConfig.minCartValue) || 0;
    if (dailyFreeConfig.rewardType === "PERCENT" && dailyFreeConfig.rewardPercent) {
      return `${dailyFreeConfig.rewardPercent}% OFF on orders above ${formatCurrency(minCart, "INR")}`;
    }
    if (dailyFreeConfig.rewardType === "FIXED" && dailyFreeConfig.rewardFixedAmount) {
      return `Flat ${formatCurrency(dailyFreeConfig.rewardFixedAmount, "INR")} OFF on orders above ${formatCurrency(minCart, "INR")}`;
    }
    if (dailyFreeConfig.rewardType === "FREE_ITEM" && dailyFreeConfig.rewardItemSku) {
      return `Free ${dailyFreeConfig.rewardItemSku} on orders above ${formatCurrency(minCart, "INR")}`;
    }
    return `Offer unlocks above ${formatCurrency(minCart, "INR")}`;
  };

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
      walletColor: card.walletColor || "#3B5BDB",
    });
    setTags(
      Array.isArray(card.tags) && card.tags.length > 0 ? card.tags : card.giftCardTag ? [card.giftCardTag] : []
    );
    setSelectedFile({ file: null, name: card.giftCardImg ? "Current image" : "" });
    setAiGeneratedFile(null);
    setTemplateType(card.templateType === "dailyFree" ? "dailyFree" : "standard");
    setDailyFreeConfig({
      dailyQuota: card.dailyFreeConfig?.dailyQuota != null ? String(card.dailyFreeConfig.dailyQuota) : "",
      validDaysFromIssue:
        card.dailyFreeConfig?.validDaysFromIssue != null ? String(card.dailyFreeConfig.validDaysFromIssue) : "3",
      minCartValue: card.dailyFreeConfig?.minCartValue != null ? String(card.dailyFreeConfig.minCartValue) : "",
      rewardType: card.dailyFreeConfig?.rewardType || "PERCENT",
      rewardPercent: card.dailyFreeConfig?.rewardPercent != null ? String(card.dailyFreeConfig.rewardPercent) : "",
      rewardFixedAmount:
        card.dailyFreeConfig?.rewardFixedAmount != null ? String(card.dailyFreeConfig.rewardFixedAmount) : "",
      rewardItemSku: card.dailyFreeConfig?.rewardItemSku || "",
      customerSegment: card.dailyFreeConfig?.customerSegment || "ALL",
      startDate: card.dailyFreeConfig?.campaignStartDate
        ? new Date(card.dailyFreeConfig.campaignStartDate).toISOString().split("T")[0]
        : "",
      endDate: card.dailyFreeConfig?.campaignEndDate
        ? new Date(card.dailyFreeConfig.campaignEndDate).toISOString().split("T")[0]
        : "",
    });
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

  const handleDailyFreeChange = (e) => {
    const { name, value } = e.target;
    setDailyFreeConfig((prev) => ({ ...prev, [name]: value }));
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
    const context = aiContext.trim();
    const industryType = (businessIndustry || "").trim();

    if (!context) {
      setAiError("Please describe what this gift card is for.");
      return;
    }

    if (!industryType) {
      setAiError("Please select your business industry in Business Profile before using AI suggestions.");
      return;
    }
    try {
      setIsAiLoading(true);
      setAiError("");
      const { data } = await axios.post("/api/ai/describe", {
        prompt: context,
        industry_type: industryType,
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

  // Enhanced validation with helpful error messages
  const validateForm = () => {
    const errors = [];
    
    if (!formData.giftCardName?.trim()) {
      errors.push("Gift card name is required");
    }
    
    if (templateType !== "dailyFree" && (!formData.amount || formData.amount <= 0)) {
      errors.push("Price must be greater than 0 for discount cards");
    }
    
    if (!formData.expirationDate) {
      errors.push("Expiry date is required");
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      errors.push("Quantity must be at least 1");
    }
    
    const imageFile = selectedFile.file || aiGeneratedFile;
    if (!editId && !imageFile && !formData.giftCardImg) {
      errors.push("Please upload an image or generate one with AI");
    }
    
    // Daily pass specific validation
    if (templateType === "dailyFree") {
      if (!dailyFreeConfig.dailyQuota || dailyFreeConfig.dailyQuota <= 0) {
        errors.push("Daily quota must be at least 1");
      }
      if (!dailyFreeConfig.minCartValue || dailyFreeConfig.minCartValue <= 0) {
        errors.push("Minimum cart value must be greater than 0");
      }
      if (dailyFreeConfig.rewardType === "PERCENT" && (!dailyFreeConfig.rewardPercent || dailyFreeConfig.rewardPercent <= 0)) {
        errors.push("Reward percentage must be greater than 0");
      }
      if (dailyFreeConfig.rewardType === "FIXED" && (!dailyFreeConfig.rewardFixedAmount || dailyFreeConfig.rewardFixedAmount <= 0)) {
        errors.push("Fixed reward amount must be greater than 0");
      }
      if (dailyFreeConfig.rewardType === "FREE_ITEM" && !dailyFreeConfig.rewardItemSku?.trim()) {
        errors.push("Free item/SKU is required");
      }
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setAiImageError(`Please fix the following issues:\n• ${validationErrors.join('\n• ')}`);
      return;
    }
    
    setAiImageError("");
    const imageFile = selectedFile.file || aiGeneratedFile;
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("templateType", templateType);
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
    if (templateType === "dailyFree") {
      formDataToSubmit.append("templateType", "dailyFree");
      formDataToSubmit.append("dailyQuota", dailyFreeConfig.dailyQuota);
      formDataToSubmit.append("validDaysFromIssue", dailyFreeConfig.validDaysFromIssue);
      formDataToSubmit.append("minCartValue", dailyFreeConfig.minCartValue);
      formDataToSubmit.append("rewardType", dailyFreeConfig.rewardType);
      if (dailyFreeConfig.rewardType === "PERCENT") {
        formDataToSubmit.append("rewardPercent", dailyFreeConfig.rewardPercent);
      } else if (dailyFreeConfig.rewardType === "FIXED") {
        formDataToSubmit.append("rewardFixedAmount", dailyFreeConfig.rewardFixedAmount);
      } else if (dailyFreeConfig.rewardType === "FREE_ITEM") {
        formDataToSubmit.append("rewardItemSku", dailyFreeConfig.rewardItemSku);
      }
      formDataToSubmit.append("customerSegment", dailyFreeConfig.customerSegment);
      if (dailyFreeConfig.startDate) formDataToSubmit.append("campaignStartDate", dailyFreeConfig.startDate);
      if (dailyFreeConfig.endDate) formDataToSubmit.append("campaignEndDate", dailyFreeConfig.endDate);
    }
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
    formDataToSubmit.append("templateType", templateType);
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
    if (templateType === "dailyFree") {
      formDataToSubmit.append("templateType", "dailyFree");
      formDataToSubmit.append("dailyQuota", dailyFreeConfig.dailyQuota);
      formDataToSubmit.append("validDaysFromIssue", dailyFreeConfig.validDaysFromIssue);
      formDataToSubmit.append("minCartValue", dailyFreeConfig.minCartValue);
      formDataToSubmit.append("rewardType", dailyFreeConfig.rewardType);
      if (dailyFreeConfig.rewardType === "PERCENT") {
        formDataToSubmit.append("rewardPercent", dailyFreeConfig.rewardPercent);
      } else if (dailyFreeConfig.rewardType === "FIXED") {
        formDataToSubmit.append("rewardFixedAmount", dailyFreeConfig.rewardFixedAmount);
      } else if (dailyFreeConfig.rewardType === "FREE_ITEM") {
        formDataToSubmit.append("rewardItemSku", dailyFreeConfig.rewardItemSku);
      }
      formDataToSubmit.append("customerSegment", dailyFreeConfig.customerSegment);
      if (dailyFreeConfig.startDate) formDataToSubmit.append("campaignStartDate", dailyFreeConfig.startDate);
      if (dailyFreeConfig.endDate) formDataToSubmit.append("campaignEndDate", dailyFreeConfig.endDate);
    }
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

  // Helper component for field tooltips
  const FieldTooltip = ({ tooltip }) => (
    <span 
      className="field-help-icon" 
      data-tooltip={tooltip}
      title={tooltip}
    >
      ?
    </span>
  );

  // Progress calculation for step indicator
  const getFormProgress = () => {
    let completed = 0;
    const total = 5;
    
    if (formData.giftCardName?.trim()) completed++;
    if (formData.amount && templateType !== "dailyFree") completed++;
    if (formData.expirationDate) completed++;
    if (formData.quantity !== "" && formData.quantity != null) completed++;
    if (selectedFile.file || aiGeneratedFile || formData.giftCardImg) completed++;
    
    return Math.round((completed / total) * 100);
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
        <h1 className="heading">{editId ? "Edit Gift Card Template" : "Create Your Gift Card Template"}</h1>
        <p className="page-subtitle">
          {editId
            ? "Update your gift card details below. All changes will be reflected in new purchases."
            : "Create beautiful gift cards that customers love. Use the Manual mode for full control, or try AI-Assisted mode to generate content and images automatically. Follow the progress indicators above to complete all required steps."}
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

        <div className="create-giftcard-template-toggle create-giftcard-studio-card">
          <div className="create-giftcard-template-header">
            <span className="create-giftcard-section-title">
              Template Type 
              <FieldTooltip tooltip="Discount Card = customers buy now, use later (traditional gift card). Daily Pass = customers claim free, get limited-time offers." />
            </span>
            <p className="create-giftcard-field-hint">
              Choose your gift card type. Each has different use cases and customer benefits.
            </p>
          </div>
          <div className="create-giftcard-template-pills">
            <button
              type="button"
              className={`template-pill ${templateType === "standard" ? "active" : ""}`}
              onClick={() => setTemplateType("standard")}
            >
              💳 Discount Card
            </button>
            <button
              type="button"
              className={`template-pill ${templateType === "dailyFree" ? "active" : ""}`}
              onClick={() => setTemplateType("dailyFree")}
            >
              🎟️ Daily Pass
            </button>
          </div>
          {templateType === "standard" && (
            <p className="create-giftcard-field-hint">
              <strong>Discount Card:</strong> Customers purchase for a specific amount and can redeem the full value later. Perfect for gifts and prepaid credits.
            </p>
          )}
          {templateType === "dailyFree" && (
            <p className="create-giftcard-field-hint">
              <strong>Daily Pass:</strong> Customers claim for free (limited daily quota) and unlock discounts when they meet minimum order requirements. Great for promotions and customer acquisition.
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="create-giftcard-step-indicator">
          <div className={`step-item ${formData.giftCardName?.trim() ? 'completed' : 'current'}`}>
            <div className="step-number">1</div>
            <div className="step-label">Basic Info</div>
          </div>
          <div className={`step-item ${formData.amount && formData.expirationDate ? 'completed' : getFormProgress() > 40 ? 'current' : 'pending'}`}>
            <div className="step-number">2</div>
            <div className="step-label">Pricing</div>
          </div>
          <div className={`step-item ${(selectedFile.file || aiGeneratedFile || formData.giftCardImg) ? 'completed' : getFormProgress() > 60 ? 'current' : 'pending'}`}>
            <div className="step-number">3</div>
            <div className="step-label">Image</div>
          </div>
          <div className={`step-item ${getFormProgress() === 100 ? 'completed' : getFormProgress() > 80 ? 'current' : 'pending'}`}>
            <div className="step-number">4</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        <div className="create-giftcard-progress-bar">
          <div 
            className="create-giftcard-progress-fill" 
            style={{ width: `${getFormProgress()}%` }}
          />
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
                  {/* <div className="ai-helper-header-sub">
                    <span className="ai-helper-pill">✦ AI Call 1 — Content Generation</span>
                  </div> */}

                  <div className="ai-helper-inputs-row">
                    <div className="giftcards-page-form-group ai-helper-input-group" style={{ flex: 1 }}>
                      {/* <label htmlFor="aiContext">
                        Description / Context{" "}
                        <span className="create-giftcard-field-hint">(what does this card offer?)</span>
                      </label> */}
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
              <label htmlFor="giftCardName" className="required-field">
                Gift Card Name 
                <FieldTooltip tooltip="Choose a clear, appealing name that customers will recognize. This appears prominently on the card and in their wallets." />
              </label>
              <input
                type="text"
                id="giftCardName"
                name="giftCardName"
                value={formData.giftCardName}
                onChange={handleChange}
                placeholder="e.g. Premium Wellness Gift Card, Birthday Special, Holiday Treat"
                required
              />
            </div>
            <div className="giftcards-page-form-group">
              <label htmlFor="description" className="required-field">
                Description 
                <FieldTooltip tooltip="Explain what the gift card offers, how to use it, and any important terms. This helps customers understand the value." />
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this gift card offers, how to redeem, terms, and what makes it special..."
                required
              />
            </div>
            <div className="giftcards-page-form-group">
              <label>
                Tags 
                <FieldTooltip tooltip="Add descriptive tags to help customers find this gift card. Examples: Birthday, Anniversary, Spa Day, Fine Dining. Press Enter after typing each tag." />
              </label>
              <p className="create-giftcard-field-hint">Add relevant tags to help customers discover this gift card. Type a tag and press Enter to add it.</p>
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
              <label htmlFor="amount" className={templateType !== "dailyFree" ? "required-field" : ""}>
                Price (₹)
                <FieldTooltip tooltip={templateType === "dailyFree" 
                  ? "Optional for Daily Pass cards. Leave empty if the pass is completely free to claim." 
                  : "Set the face value of your gift card. This is what customers will pay and what they can redeem."} />
                {templateType === "dailyFree" && (
                  <span className="create-giftcard-field-hint-inline"> Optional for Daily Pass.</span>
                )}
              </label>
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
                required={templateType !== "dailyFree"}
                className="create-giftcard-number-input"
              />
            </div>
            <div className="giftcards-page-form-group">
              <label htmlFor="discount">
                Discount (%) 
                <FieldTooltip tooltip="Optional promotional discount. For example, 20% off means customers pay ₹40 for a ₹50 gift card. Leave empty for no discount." />
              </label>
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
              <label htmlFor="quantity" className="required-field">
                Quantity 
                <FieldTooltip tooltip="How many gift cards are available for sale? Once sold out, customers won't be able to purchase more. You can always create more later." />
              </label>
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
              <label htmlFor="expirationDate" className="required-field">
                Expiry Date 
                <FieldTooltip tooltip="When should this gift card expire? Choose a date that gives customers enough time to use it, typically 1-2 years from now." />
              </label>
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
            <div className="giftcards-page-form-group" style={{ marginTop: 16 }}>
              <label htmlFor="walletColor">
                Google Wallet Color 
                <FieldTooltip tooltip="Choose the background color for your gift card in Google Wallet. This helps customers identify your brand in their digital wallet." />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="color"
                  id="walletColor"
                  name="walletColor"
                  value={formData.walletColor}
                  onChange={handleChange}
                  style={{ width: 40, height: 40, borderRadius: 8, border: "none", padding: 0, cursor: "pointer" }}
                />
                <span className="create-giftcard-field-hint">
                  This color appears as the background in Google Wallet passes.
                </span>
              </div>
            </div>
            </div>

            {templateType === "dailyFree" && (
              <div className="create-giftcard-studio-card">
                <h2 className="create-giftcard-section-title">
                  Daily Free Campaign Settings
                </h2>
                <p className="create-giftcard-field-hint">
                  Configure how many free passes can be claimed per day, how long they stay valid, and what reward they unlock.
                </p>
                <div className="create-giftcard-price-row">
                  <div className="giftcards-page-form-group">
                    <label htmlFor="dailyQuota">
                      Daily Quota 
                      <FieldTooltip tooltip="Maximum number of free passes that can be claimed per calendar day. This helps control costs and creates urgency." />
                      <span className="create-giftcard-field-hint-inline"> Max free claims per calendar day.</span>
                    </label>
                    <input
                      type="number"
                      id="dailyQuota"
                      name="dailyQuota"
                      min="1"
                      value={dailyFreeConfig.dailyQuota}
                      onChange={handleDailyFreeChange}
                      onKeyDown={preventArrowKeys}
                      placeholder="e.g. 100"
                      className="create-giftcard-number-input"
                    />
                  </div>
                  <div className="giftcards-page-form-group">
                    <label htmlFor="validDaysFromIssue">
                      Validity Period (days)
                      <FieldTooltip tooltip="How many days after claiming should the pass remain valid? Shorter periods create urgency, longer periods offer convenience." />
                    </label>
                    <input
                      type="number"
                      id="validDaysFromIssue"
                      name="validDaysFromIssue"
                      min="1"
                      value={dailyFreeConfig.validDaysFromIssue}
                      onChange={handleDailyFreeChange}
                      onKeyDown={preventArrowKeys}
                      placeholder="3"
                      className="create-giftcard-number-input"
                    />
                  </div>
                  <div className="giftcards-page-form-group">
                    <label htmlFor="minCartValue">
                      Minimum Order Value (₹)
                      <FieldTooltip tooltip="Customers must spend at least this amount to use the pass. This ensures profitability and prevents abuse of free offers." />
                    </label>
                    <input
                      type="number"
                      id="minCartValue"
                      name="minCartValue"
                      min="0"
                      value={dailyFreeConfig.minCartValue}
                      onChange={handleDailyFreeChange}
                      onKeyDown={preventArrowKeys}
                      placeholder="e.g. 799"
                      className="create-giftcard-number-input"
                    />
                  </div>
                </div>

                <div className="giftcards-page-form-group">
                  <label htmlFor="rewardType">
                    Reward Type 
                    <FieldTooltip tooltip="Choose how customers will save: percentage discount (% off), fixed amount (₹ off), or a free item added to their order." />
                  </label>
                  <select
                    id="rewardType"
                    name="rewardType"
                    value={dailyFreeConfig.rewardType}
                    onChange={handleDailyFreeChange}
                  >
                    <option value="PERCENT">Percentage off</option>
                    <option value="FIXED">Fixed amount off</option>
                    <option value="FREE_ITEM">Free item</option>
                  </select>
                </div>

                {dailyFreeConfig.rewardType === "PERCENT" && (
                  <div className="giftcards-page-form-group">
                    <label htmlFor="rewardPercent">
                      Discount Percentage (%)
                      <FieldTooltip tooltip="What percentage discount should customers get? For example, 15% off their total order when they meet the minimum spend." />
                    </label>
                    <input
                      type="number"
                      id="rewardPercent"
                      name="rewardPercent"
                      min="1"
                      max="100"
                      value={dailyFreeConfig.rewardPercent}
                      onChange={handleDailyFreeChange}
                      onKeyDown={preventArrowKeys}
                      placeholder="e.g. 15"
                      className="create-giftcard-number-input"
                    />
                  </div>
                )}

                {dailyFreeConfig.rewardType === "FIXED" && (
                  <div className="giftcards-page-form-group">
                    <label htmlFor="rewardFixedAmount">
                      Fixed Discount Amount (₹)
                      <FieldTooltip tooltip="A fixed rupee amount to discount from their order. For example, ₹200 off when they meet the minimum spend." />
                    </label>
                    <input
                      type="number"
                      id="rewardFixedAmount"
                      name="rewardFixedAmount"
                      min="1"
                      value={dailyFreeConfig.rewardFixedAmount}
                      onChange={handleDailyFreeChange}
                      onKeyDown={preventArrowKeys}
                      placeholder="e.g. 200"
                      className="create-giftcard-number-input"
                    />
                  </div>
                )}

                {dailyFreeConfig.rewardType === "FREE_ITEM" && (
                  <div className="giftcards-page-form-group">
                    <label htmlFor="rewardItemSku">
                      Free Item/Product 
                      <FieldTooltip tooltip="Specify the exact item customers get for free. Use your product SKU or a descriptive name. This item will be automatically added to their order." />
                      <span className="create-giftcard-field-hint-inline">
                        {" "}
                        This item will be added as a free line item when the pass is used.
                      </span>
                    </label>
                    <input
                      type="text"
                      id="rewardItemSku"
                      name="rewardItemSku"
                      value={dailyFreeConfig.rewardItemSku}
                      onChange={handleDailyFreeChange}
                      placeholder="e.g. FREE-DESSERT, APPETIZER-001, or Complimentary Drink"
                    />
                  </div>
                )}

                <div className="create-giftcard-price-row">
                  <div className="giftcards-page-form-group">
                    <label htmlFor="customerSegment">
                      Target Customers 
                      <FieldTooltip tooltip="Choose who can claim this pass. 'All customers' = everyone, 'New customers' = first-time buyers, 'App users' = mobile app only." />
                    </label>
                    <select
                      id="customerSegment"
                      name="customerSegment"
                      value={dailyFreeConfig.customerSegment}
                      onChange={handleDailyFreeChange}
                    >
                      <option value="ALL">All customers</option>
                      <option value="NEW_CUSTOMERS">New customers only</option>
                      <option value="APP_ONLY">App users only</option>
                    </select>
                  </div>
                  <div className="giftcards-page-form-group">
                    <label htmlFor="startDate">
                      Campaign Start Date 
                      <FieldTooltip tooltip="When should this campaign begin? Leave empty to start immediately when published." />
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={dailyFreeConfig.startDate}
                      onChange={handleDailyFreeChange}
                    />
                  </div>
                  <div className="giftcards-page-form-group">
                    <label htmlFor="endDate">
                      Campaign End Date 
                      <FieldTooltip tooltip="When should this campaign stop? Leave empty to run indefinitely. You can always end it manually later." />
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={dailyFreeConfig.endDate}
                      onChange={handleDailyFreeChange}
                    />
                  </div>
                </div>
              </div>
            )}

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

                          if (templateType === "dailyFree") {
                            return (
                              <>
                                <span className="preview-dash-price preview-dash-price-final">Daily Pass</span>
                                <span className="preview-dash-price-label-inline">
                                  {getDailyPassOfferText()}
                                </span>
                              </>
                            );
                          }

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
                        <span className="preview-dash-price-label">
                          {templateType === "dailyFree" ? "Offer Pass" : "Gift Value"}
                        </span>
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
              {/* Google Wallet style preview */}
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    maxWidth: 320,
                    margin: "0 auto",
                    background: "#F5F7FB",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: formData.walletColor || "#3B5BDB",
                      padding: "16px 18px 14px",
                      color: "#fff",
                    }}
                  >
                    <div style={{ fontSize: 13, opacity: 0.9 }}>
                      {formData.giftCardName || "Wallet Preview Gift Card"}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>
                      {(() => {
                        if (templateType === "dailyFree") {
                          const expiryLabel = formData.expirationDate
                            ? (() => {
                                const d = new Date(formData.expirationDate);
                                if (Number.isNaN(d.getTime())) return "";
                                return d.toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                });
                              })()
                            : "";
                          return expiryLabel
                            ? `${getDailyPassOfferText()} • Valid till: ${expiryLabel}`
                            : getDailyPassOfferText();
                        }
                        const amount = formData.amount || "0";
                        const expiryLabel = formData.expirationDate
                          ? (() => {
                              const d = new Date(formData.expirationDate);
                              if (Number.isNaN(d.getTime())) return "";
                              return d.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              });
                            })()
                          : "";
                        return expiryLabel ? `INR ${amount} • Expires: ${expiryLabel}` : `INR ${amount}`;
                      })()}
                    </div>
                    <div style={{ fontSize: 18, marginTop: 10 }}>
                      Name will appear here
                    </div>
                    <div
                      style={{
                        marginTop: 16,
                        borderRadius: 12,
                        background: "#fff",
                        padding: 12,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 104,
                          height: 104,
                          background:
                            "repeating-linear-gradient(45deg,#e0e0e0 0,#e0e0e0 4px,#ffffff 4px,#ffffff 8px)",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </div>
                  {formData.giftCardImg && (
                    <div style={{ height: 120, overflow: "hidden" }}>
                      <img
                        src={formData.giftCardImg}
                        alt="Wallet card hero"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Apple Wallet style preview */}
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    borderRadius: 28,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    maxWidth: 320,
                    margin: "0 auto",
                    backgroundColor: formData.walletColor || "#4158D0",
                    color: "#fff",
                  }}
                >
                  {/* Hero image */}
                  {formData.giftCardImg && (
                    <div style={{ height: 120, overflow: "hidden" }}>
                      <img
                        src={formData.giftCardImg}
                        alt="Apple wallet hero"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  {/* Info row under image */}
                  <div style={{ padding: "14px 16px 8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.9 }}>
                      <span>TO:</span>
                      <span>GIFT CARD TYPE</span>
                      <span>VALID UNTIL</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      <span>{formData.giftCardName ? "Name will appear" : "Name will appear"}</span>
                      <span>
                        {(formData.giftCardName || "").trim()
                          ? (formData.giftCardName || "").slice(0, 18) +
                            ((formData.giftCardName || "").length > 18 ? "…" : "")
                          : "Gift Card"}
                      </span>
                      <span>
                        {formData.expirationDate
                          ? (() => {
                              const d = new Date(formData.expirationDate);
                              if (Number.isNaN(d.getTime())) return "—";
                              return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                            })()
                          : "—"}
                      </span>
                    </div>
                    {/* Amount shown as watermark-style text, not over the hero image */}
                    <div style={{ fontSize: 20, fontWeight: 600, marginTop: 10 }}>
                      {templateType === "dailyFree" ? "Daily Pass Offer" : `₹ ${formData.amount || "0"}`}
                    </div>
                    {/* QR placeholder */}
                    <div
                      style={{
                        marginTop: 14,
                        borderRadius: 12,
                        background: "#fff",
                        padding: 10,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 110,
                          height: 110,
                          background:
                            "repeating-linear-gradient(45deg,#e0e0e0 0,#e0e0e0 4px,#ffffff 4px,#ffffff 8px)",
                          borderRadius: 8,
                        }}
                      />
                    </div>
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
                    {templateType === "dailyFree"
                      ? "Free to claim"
                      : formData.amount
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
                <li className={formData.giftCardName?.trim() ? "done" : ""}><span className="dot" />Gift card name added</li>
                <li className={formData.amount || templateType === "dailyFree" ? "done" : ""}><span className="dot" />Pricing configured</li>
                <li className={formData.expirationDate ? "done" : ""}><span className="dot" />Expiry date set</li>
                <li className={formData.quantity !== "" && formData.quantity != null ? "done" : ""}><span className="dot" />Quantity specified</li>
                <li className={(selectedFile.file || aiGeneratedFile || formData.giftCardImg) ? "done" : ""}><span className="dot" />Card image ready</li>
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
