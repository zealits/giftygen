const axios = require("axios");

// Proxy to external AI describe endpoint so frontend avoids CORS
exports.describeGiftcard = async (req, res) => {
  try {
    const { giftcard_name, prompt } = req.body || {};

    if (!giftcard_name || !prompt) {
      return res.status(400).json({ message: "giftcard_name and prompt are required" });
    }

    console.log("[AI Describe][Backend] Incoming request", {
      giftcard_name,
      promptSnippet: String(prompt).slice(0, 80),
    });

    const { data } = await axios.post(
      "https://giftifyai.giftygen.com/tier2/describe",
      { giftcard_name, prompt },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("[AI Describe][Backend] Response OK", {
      hasMedium: Array.isArray(data.descriptions_medium),
      hasShort: Array.isArray(data.descriptions_short),
      tagCount: Array.isArray(data.tags) ? data.tags.length : 0,
      nameSuggestionCount: Array.isArray(data.giftcard_name_suggestions)
        ? data.giftcard_name_suggestions.length
        : 0,
    });

    return res.json(data);
  } catch (err) {
    console.error("[AI Describe][Backend] Error calling external API", {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      responseData: err.response?.data,
    });

    if (err.response) {
      return res
        .status(err.response.status)
        .json({ message: "AI service error", details: err.response.data });
    }

    return res.status(502).json({ message: "AI service unavailable" });
  }
};

// Proxy to external AI image endpoint so frontend avoids CORS
exports.generateGiftcardImage = async (req, res) => {
  try {
    const { giftcard_name, description } = req.body || {};

    if (!giftcard_name || !description) {
      return res.status(400).json({ message: "giftcard_name and description are required" });
    }

    const { data } = await axios.post(
      "https://giftifyai.giftygen.com/tier2/image",
      { giftcard_name: giftcard_name.trim(), description: description.trim() },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 60000,
      }
    );

    if (!data || !data.image_base64) {
      return res.status(502).json({ message: "No image returned from AI service" });
    }

    return res.json({
      image_base64: data.image_base64,
      media_type: data.media_type || "image/png",
    });
  } catch (err) {
    console.error("[AI Image][Backend] Error calling external API", {
      message: err.message,
      code: err.code,
      status: err.response?.status,
    });

    if (err.response) {
      return res
        .status(err.response.status)
        .json({ message: err.response.data?.message || "Image generation failed", details: err.response.data });
    }

    return res.status(502).json({ message: "Image service unavailable" });
  }
};

