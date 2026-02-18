import React, { useState, useEffect } from "react";
import "./GiftCards.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { createGiftCard, listGiftCards, updateGiftCard, deleteGiftCard } from "../../services/Actions/giftCardActions";
import {
  CREATE_GIFTCARD_RESET,
  UPDATE_GIFTCARD_RESET,
  DELETE_GIFTCARD_RESET,
} from "../../services/Constants/giftCardConstants";
import { Link2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const GiftCards = () => {
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateSuccessModalOpen, setCreateSuccessModalOpen] = useState(false);
  const [isUpdateSuccessModalOpen, setUpdateSuccessModalOpen] = useState(false);
  const [isDeleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
  const [hasShownCreateSuccess, setHasShownCreateSuccess] = useState(false);
  const [hasShownUpdateSuccess, setHasShownUpdateSuccess] = useState(false);
  const [hasShownDeleteSuccess, setHasShownDeleteSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState({
    file: null,
    name: "",
  });
  const [showImagePreview, setShowImagePreview] = useState(false);

  //Add state to manage the delete confirmation modal.
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";

  useEffect(() => {
    dispatch(listGiftCards(searchTerm, businessSlug)); // scope to this business
  }, [dispatch, searchTerm, businessSlug]);

  // Accessing state from the Redux store
  const giftCardCreate = useSelector((state) => state.giftCardCreate);
  const giftCardUpdate = useSelector((state) => state.giftCardUpdate);
  const giftCardDelete = useSelector((state) => state.giftCardDelete);
  const { giftCards, loading, error } = useSelector((state) => state.giftCardList);

  useEffect(() => {
    // This will run when the component unmounts
    return () => {
      dispatch({ type: CREATE_GIFTCARD_RESET });
      dispatch({ type: UPDATE_GIFTCARD_RESET });
      dispatch({ type: DELETE_GIFTCARD_RESET });
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(listGiftCards(searchTerm, businessSlug));

    // Reset all success states on initial mount
    dispatch({ type: CREATE_GIFTCARD_RESET });
    dispatch({ type: UPDATE_GIFTCARD_RESET });
    dispatch({ type: DELETE_GIFTCARD_RESET });
  }, [dispatch, searchTerm]);

  useEffect(() => {
    if (giftCardCreate.success && !hasShownUpdateSuccess) {
      setCreateSuccessModalOpen(true);
      setModalOpen(false);
      dispatch(listGiftCards("", businessSlug));

      // Mark that we've shown this success modal
      setHasShownCreateSuccess(true);

      setTimeout(() => {
        setCreateSuccessModalOpen(false);
      }, 3000);
    } else if (giftCardCreate.error) {
      // Handle create error
    }
  }, [giftCardCreate, dispatch, hasShownUpdateSuccess,businessSlug]);

  // Modified update success handler with flag
  useEffect(() => {
    if (giftCardUpdate.success && !hasShownUpdateSuccess) {
      setUpdateSuccessModalOpen(true);
      setModalOpen(false);
      dispatch(listGiftCards("", businessSlug)); // Refresh the list

      // Mark that we've shown this success modal
      setHasShownUpdateSuccess(true);

      setTimeout(() => {
        setUpdateSuccessModalOpen(false);
      }, 3000);
    } else if (giftCardUpdate.error) {
      // Handle update error
    }
  }, [giftCardUpdate, dispatch, hasShownUpdateSuccess]);

  // Modified delete success handler with flag
  useEffect(() => {
    if (giftCardDelete.success && !hasShownDeleteSuccess) {
      setDeleteSuccessModalOpen(true);

      dispatch(listGiftCards("", businessSlug)); // Refresh the list

      // Mark that we've shown this success modal
      setHasShownDeleteSuccess(true);

      setTimeout(() => {
        setDeleteSuccessModalOpen(false);
      }, 3000);
    } else if (giftCardUpdate.error) {
      // Handle update error
    }
  }, [giftCardDelete, dispatch, hasShownDeleteSuccess]);

  const [formData, setFormData] = useState({
    giftCardName: "",
    giftCardTag: "birthday", // Default value matches the first option
    description: "",
    amount: "",
    discount: "",
    expirationDate: "",
    giftCardImg: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAiPromptChange = (e) => {
    setAiPrompt(e.target.value);
  };

  const handleGenerateWithAi = async () => {
    if (!formData.giftCardName || !aiPrompt) {
      console.warn("[AI Describe] Missing fields", {
        giftCardNamePresent: !!formData.giftCardName,
        aiPromptPresent: !!aiPrompt,
      });
      setAiError("Please enter both a gift card name and what this gift card is for.");
      return;
    }

    try {
      setIsAiLoading(true);
      setAiError("");

      const payload = {
        giftcard_name: formData.giftCardName,
        prompt: aiPrompt,
      };

      console.log("[AI Describe] Sending request", {
        url: "/api/ai/describe",
        payload,
      });

      const { data } = await axios.post("/api/ai/describe", payload);

      console.log("[AI Describe] Response received", data);

      setAiSuggestions({
        descriptions_medium: data.descriptions_medium || [],
        descriptions_short: data.descriptions_short || [],
        tags: data.tags || [],
        giftcard_name_suggestions: data.giftcard_name_suggestions || [],
      });
    } catch (error) {
      console.error("[AI Describe] Error fetching AI suggestions", {
        message: error.message,
        code: error.code,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      });
      setAiError("Could not fetch suggestions right now. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectAiName = (name) => {
    setFormData((prev) => ({
      ...prev,
      giftCardName: name,
    }));
    setAiSelection((prev) => ({ ...prev, name }));
  };

  const handleSelectAiDescription = (description) => {
    setFormData((prev) => ({
      ...prev,
      description,
    }));
    setAiSelection((prev) => ({ ...prev, description }));
  };

  const handleSelectAiTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      giftCardTag: tag,
    }));
    setAiSelection((prev) => ({ ...prev, tag }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();

    // Append all non-file fields
    Object.keys(formData).forEach((key) => {
      if (key !== "image" && key !== "giftCardImg") {
        formDataToSubmit.append(key, formData[key]);
      }
    });

    // Append new image file if selected
    if (selectedFile.file) {
      formDataToSubmit.append("image", selectedFile.file);
    }

    // Ensure businessSlug is included for scoping on create
    if (!isEditing && businessSlug) {
      formDataToSubmit.append("businessSlug", businessSlug);
    }

    if (isEditing) {
      setHasShownUpdateSuccess(false);
      dispatch(updateGiftCard(editingCardId, formDataToSubmit));
    } else {
      setHasShownCreateSuccess(false);
      dispatch(createGiftCard(formDataToSubmit));
    }
  };

  const handleOpenModal = () => {
    setFormData({
      giftCardName: "",
      giftCardTag: "birthday",
      description: "",
      amount: "",
      discount: "",
      expirationDate: "",
    });
    setAiPrompt("");
    setAiSuggestions({
      descriptions_medium: [],
      descriptions_short: [],
      tags: [],
      giftcard_name_suggestions: [],
    });
    setAiSelection({
      name: "",
      description: "",
      tag: "",
    });
    setIsEditing(false);
    setEditingCardId(null);
    setModalOpen(true);
  };

  const handleEdit = (card) => {
    setFormData({
      giftCardName: card.giftCardName,
      giftCardTag: card.giftCardTag,
      description: card.description,
      amount: card.amount,
      discount: card.discount,
      expirationDate: card.expirationDate.split("T")[0],
      giftCardImg: card.giftCardImg,
    });

    setSelectedFile({
      file: null,
      name: card.giftCardImg,
    });

    setIsEditing(true);
    setEditingCardId(card._id);
    setModalOpen(true);
  };

  /*
  const handleDelete = (cardId) => {
    if (window.confirm("Are you sure you want to delete this gift card?")) {
      dispatch(deleteGiftCard(cardId));
    }
  };
*/

  const handleDelete = (cardId) => {
    setCardToDelete(cardId); // Store the card ID for deletion
    setDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      setHasShownDeleteSuccess(false); // Reset delete success flag
      dispatch(deleteGiftCard(cardToDelete));
      setDeleteModalOpen(false); // Close the modal after confirming
      setCardToDelete(null); // Clear the stored card ID
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const closeModal = () => {
    setMessageModalOpen(false);
    setModalMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile({
        file: file,
        name: file.name,
      });

      setFormData((prev) => ({
        ...prev,
        giftCardImg: previewUrl,
      }));

      // Automatically open the preview
      setShowImagePreview(true);
    }
  };
  const handleImagePreviewClick = () => {
    if (formData.giftCardImg) {
      setShowImagePreview(true);
    }
  };

  // Add this function to close image preview
  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
  };

  const viewImage = (imageData) => {
    if (!imageData) {
      alert("No image data found.");
      return;
    }
    // setSelectedImage(`data:image/jpeg;base64,${imageData}`);
    setSelectedImage(imageData);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value); // Update the state
    console.log(value); // Log the user's input
  };

  const formatFileName = (fileName) => {
    if (!fileName) return "";
    const maxLength = 20;
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

    return `${nameWithoutExt.substring(0, maxLength - 3)}...${extension}`;
  };

  return (
    <div>
      <h1 className="heading">GiftCards</h1>
      <div>
        <div className="main-content">
          <div className="actions">
            <button className="create-giftcard cbtn white" onClick={handleOpenModal}>
              Create Giftcard
            </button>
            <input
              type="text"
              id="search-giftcards"
              className="search-box"
              placeholder="Search Giftcards"
              value={searchTerm}
              onChange={handleInputChange}
            />
          </div>
          <table className="giftcards-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Sale Price</th>
                <th>Deadline</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7">Error: {error}</td>
                </tr>
              ) : giftCards && giftCards.length > 0 ? (
                giftCards.map((card) => {
                  const expirationDate = new Date(card.expirationDate);
                  const now = new Date();
                  const isExpired = expirationDate < now || card.status === "expired";
                  
                  return (
                    <tr key={card._id} className={isExpired ? "expired-row" : ""}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {card.giftCardName}
                          {isExpired && (
                            <span className="expired-badge">Expired</span>
                          )}
                        </div>
                      </td>
                      <td>{formatCurrency(card.amount, 'INR')}</td>
                      <td>{card.discount}%</td>
                      <td>{formatCurrency(card.amount - (card.amount * card.discount) / 100, 'INR')}</td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <span>{new Date(card.expirationDate).toLocaleDateString("en-GB")}</span>
                          {isExpired && (
                            <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "600" }}>
                              (Expired)
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <button className="cbtn edit" onClick={() => handleEdit(card)}>
                          Edit
                        </button>
                        <button className="cbtn delete" onClick={() => handleDelete(card._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No gift cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="creategiftcard-modal-content">
            <button className="create-update-modal-close-btn" onClick={handleCloseModal}>
              &times;
            </button>
            <h2 className="gc-page-modal-heading">{isEditing ? "Edit Gift Card" : "Create a Gift Card"}</h2>
            <form className="giftcard-form" onSubmit={handleSubmit}>
              <div className="giftcards-page-form-group">
                <label htmlFor="giftCardName">Gift Card Name</label>
                <input
                  type="text"
                  id="giftCardName"
                  name="giftCardName"
                  value={formData.giftCardName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ai-helper-card">
                <div className="ai-helper-header">
                  <span className="ai-helper-pill">AI Assist</span>
                  <p className="ai-helper-title">Describe what this gift card is for</p>
                  <p className="ai-helper-subtitle">
                    We will suggest a refined gift card name, description, and tags tailored to your prompt.
                  </p>
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
                  {isAiLoading ? "Generating suggestions..." : "Generate with AI"}
                </button>
                {aiError && <p className="ai-helper-error">{aiError}</p>}

                {(aiSuggestions.giftcard_name_suggestions.length > 0 ||
                  aiSuggestions.descriptions_medium.length > 0 ||
                  aiSuggestions.tags.length > 0) && (
                  <div className="ai-helper-suggestions">
                    {aiSuggestions.giftcard_name_suggestions.length > 0 && (
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

                    {aiSuggestions.descriptions_medium.length > 0 && (
                      <div className="ai-helper-section">
                        <h4 className="ai-helper-section-title">Description ideas</h4>
                        <div className="ai-helper-card-grid">
                          {aiSuggestions.descriptions_medium.map((desc) => (
                            <button
                              key={desc}
                              type="button"
                              className={`ai-description-card ${
                                aiSelection.description === desc ? "ai-description-card-selected" : ""
                              }`}
                              onClick={() => handleSelectAiDescription(desc)}
                            >
                              <span>{desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSuggestions.tags.length > 0 && (
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
              <div className="giftcards-page-form-group">
                <label htmlFor="giftCardTag">Gift Card Tag</label>
                <select
                  id="giftCardTag"
                  name="giftCardTag"
                  value={formData.giftCardTag}
                  onChange={handleChange}
                  required
                >
                  <option value="🎂 Birthday Special" className="option-birthday">
                    <i className="react-icons">🎂</i> Birthday Special
                  </option>
                  <option value="💍 Anniversary Delight" className="option-anniversary">
                    <i className="react-icons">💍</i> Anniversary Delight
                  </option>
                  <option value="🎉 Festive Cheers" className="option-festive">
                    <i className="react-icons">🎉</i> Festive Cheers
                  </option>
                  <option value="🙏 Thank You" className="option-thank-you">
                    <i className="react-icons">🙏</i> Thank You
                  </option>
                  <option value="🎉 Congratulations" className="option-congratulations">
                    <i className="react-icons">🎉</i> Congratulations
                  </option>
                  <option value="💐 Get Well Soon" className="option-get-well-soon">
                    <i className="react-icons">💐</i> Get Well Soon
                  </option>
                  <option value="🏠 Housewarming Gift" className="option-housewarming">
                    <i className="react-icons">🏠</i> Housewarming Gift
                  </option>
                  <option value="🍽 Fine Dining" className="option-fine-dining">
                    <i className="react-icons">🍽</i> Fine Dining
                  </option>
                  <option value="🍷 Romantic Dinner" className="option-romantic-dinner">
                    <i className="react-icons">🍷</i> Romantic Dinner
                  </option>
                  <option value="🥞 Weekend Brunch" className="option-weekend-brunch">
                    <i className="react-icons">🥞</i> Weekend Brunch
                  </option>
                  <option value="🍗 Family Feast" className="option-family-feast">
                    <i className="react-icons">🍗</i> Family Feast
                  </option>
                  <option value="🍳 Chef's Special" className="option-chefs-special">
                    <i className="react-icons">🍳</i> Chef's Special
                  </option>
                  <option value="🍴 All-You-Can-Eat Buffet" className="option-buffet">
                    <i className="react-icons">🍴</i> All-You-Can-Eat Buffet
                  </option>
                  <option value="🏖 Relaxing Staycation" className="option-staycation">
                    <i className="react-icons">🏖</i> Relaxing Staycation
                  </option>
                  <option value="💆‍♀ Spa & Dine Combo" className="option-spa-combo">
                    <i className="react-icons">💆‍♀</i> Spa & Dine Combo
                  </option>
                  <option value="🌴 Luxury Escape" className="option-luxury-escape">
                    <i className="react-icons">🌴</i> Luxury Escape
                  </option>
                  <option value="🍷 Gourmet Experience" className="option-gourmet-experience">
                    <i className="react-icons">🍷</i> Gourmet Experience
                  </option>
                  <option value="🍇 Wine & Dine" className="option-wine-dine">
                    <i className="react-icons">🍇</i> Wine & Dine
                  </option>
                  <option value="🏖 Beachside Bliss" className="option-beachside-bliss">
                    <i className="react-icons">🏖</i> Beachside Bliss
                  </option>
                  <option value="🏞 Mountain Retreat" className="option-mountain-retreat">
                    <i className="react-icons">🏞</i> Mountain Retreat
                  </option>
                  <option value="🌆 City Lights Dining" className="option-city-lights">
                    <i className="react-icons">🌆</i> City Lights Dining
                  </option>
                  <option value="🍛 Exotic Flavors" className="option-exotic-flavors">
                    <i className="react-icons">🍛</i> Exotic Flavors
                  </option>
                  <option value="👔 Employee Appreciation" className="option-employee-appreciation">
                    <i className="react-icons">👔</i> Employee Appreciation
                  </option>
                  <option value="🎁 Loyalty Rewards" className="option-loyalty-rewards">
                    <i className="react-icons">🎁</i> Loyalty Rewards
                  </option>
                  <option value="🧳 Client Gifting" className="option-client-gifting">
                    <i className="react-icons">🧳</i> Client Gifting
                  </option>
                  <option value="🏢 Corporate Thank You" className="option-corporate-thank-you">
                    <i className="react-icons">🏢</i> Corporate Thank You
                  </option>
                  <option value="💖 Just Because" className="option-just-because">
                    <i className="react-icons">💖</i> Just Because
                  </option>
                  <option value="🍷 Date Night" className="option-date-night">
                    <i className="react-icons">🍷</i> Date Night
                  </option>
                  <option value="☀ Summer Treats" className="option-summer-treats">
                    <i className="react-icons">☀</i> Summer Treats
                  </option>
                  <option value="❄ Winter Warmth" className="option-winter-warmth">
                    <i className="react-icons">❄</i> Winter Warmth
                  </option>
                  <option value="🌷 Spring Refresh" className="option-spring-refresh">
                    <i className="react-icons">🌷</i> Spring Refresh
                  </option>
                  <option value="🍂 Autumn Flavors" className="option-autumn-flavors">
                    <i className="react-icons">🍂</i> Autumn Flavors
                  </option>
                  <option value="🍽 For Food Lovers" className="option-for-food-lovers">
                    <i className="react-icons">🍽</i> For Food Lovers
                  </option>
                  <option value="👨 For Him" className="option-for-him">
                    <i className="react-icons">👨</i> For Him
                  </option>
                  <option value="👩 For Her" className="option-for-her">
                    <i className="react-icons">👩</i> For Her
                  </option>
                  <option value="👨‍👩‍👧‍👦 For the Family" className="option-for-family">
                    <i className="react-icons">👨‍👩‍👧‍👦</i> For the Family
                  </option>
                  <option value="👥 For the Team" className="option-for-team">
                    <i className="react-icons">👥</i> For the Team
                  </option>
                  <option value="💝 For You" className="option-for-you">
                    <i className="react-icons">💝</i> For You
                  </option>
                </select>
              </div>
              <div className="giftcards-page-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="giftcards-page-form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
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
                  required
                />
              </div>
              <div className="giftcards-page-form-group">
                <label htmlFor="expirationDate">Expiration Date</label>
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

              <div className="giftcards-page-form-group">
                <label htmlFor="image">{isEditing ? "Edit Image" : "Upload Image"}</label>
                <div className="file-input-wrapper">
                  {isEditing && (formData.giftCardImg || selectedFile.name) && (
                    <div className="current-file-preview">
                      <Link2 size={16} className="file-icon" />
                      <span className="current-file-name" onClick={handleImagePreviewClick} title={selectedFile.name}>
                        {formatFileName(selectedFile.name)}
                      </span>
                    </div>
                  )}
                  <div className="file-input-container">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="actual-file-input"
                      required={!isEditing}
                    />
                    <button type="button" className="file-choose-btn">
                      Choose File
                    </button>
                  </div>
                </div>
              </div>

              {showImagePreview && (
  <div className="image-preview-modal">
    <div className="image-preview-content">
      <button className="close-preview-btn" onClick={() => setShowImagePreview(false)}>
        &times;
      </button>
      {formData.giftCardImg ? (
        <img
          src={formData.giftCardImg}
          alt="Gift Card Preview"
          className="preview-image"
          style={{ maxWidth: "100%", borderRadius: "10px" }}
        />
      ) : (
        <p>No image available</p>
      )}
    </div>
  </div>
)}
              <button type="submit" className="sub-updt-btn">
                {isEditing ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="image-modal-overlay">
          <div className="image-modal">
            <button className="image-modal-close" onClick={closeImageModal}>
              &times;
            </button>
            <img src={selectedImage} alt="Gift Card" className="image-modal-content" loading="lazy" />
          </div>
        </div>
      )}
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

      {isUpdateSuccessModalOpen && (
        <div className="update-success-modal-overlay">
          <div className="update-success-modal-container">
            <div className="update-success-modal-content">
              <div className="update-success-modal-icon">
                <svg viewBox="0 0 24 24" className="update-checkmark-svg">
                  <path
                    className="update-checkmark-path"
                    d="M3.7 14.3l5.6 5.6L20.3 4.7"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 className="update-success-modal-title">Updated!</h2>
              <p className="update-success-modal-message">Gift Card Updated Successfully</p>
              <div className="update-success-modal-ripple"></div>
            </div>
          </div>
        </div>
      )}

      {isDeleteSuccessModalOpen && (
        <div className="delete-success-modal-overlay">
          <div className="delete-success-modal-container">
            <div className="delete-success-modal-content">
              <div className="delete-success-modal-icon">
                <svg viewBox="0 0 24 24" className="delete-checkmark-svg">
                  <path
                    className="delete-checkmark-path"
                    d="M3.7 14.3l5.6 5.6L20.3 4.7"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 className="delete-success-modal-title">Deleted!</h2>
              <p className="delete-success-modal-message">Gift Card Deleted Successfully</p>
              <div className="delete-success-modal-fade"></div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="delete-confirmation-modal-overlay">
          <div className="delete-confirmation-modal-container">
            <p className="delete-confirmation-modal-text">Are you sure you want to delete this gift card?</p>
            <div className="delete-confirmation-button-group">
              <button className="delete-confirmation-yes-button" onClick={confirmDelete}>
                Yes
              </button>
              <button className="delete-confirmation-no-button" onClick={() => setDeleteModalOpen(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCards;
