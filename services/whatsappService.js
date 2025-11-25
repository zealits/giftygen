const axios = require("axios");

const WHATSAPP_GRAPH_BASE_URL = "https://graph.facebook.com/v20.0";

const DEFAULT_MAX_PARAM_LENGTH = 200;
const LONG_PARAM_LENGTH = 500;

const sanitizeTemplateParam = (value, maxLength = DEFAULT_MAX_PARAM_LENGTH) => {
  if (value === undefined || value === null) {
    return "";
  }
  const text = String(value);
  if (text.length <= maxLength) {
    return text;
  }
  console.warn(`Trimming WhatsApp template parameter from ${text.length} to ${maxLength} characters.`);
  return text.slice(0, maxLength);
};

const sendGiftCardTemplateMessage = async ({
  to,
  recipientName = "Customer",
  greetingText = "Thanks for your purchase!",
  amountText = "",
  expirationDateText = "",
  walletUrl = "",
  headerImageUrl,
} = {}) => {
  const accessToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "giftcard";
  const fallbackWalletLink = walletUrl || process.env.WHATSAPP_DEFAULT_LINK || "https://giftygen.com";
  const safeRecipientName = sanitizeTemplateParam(recipientName);
  const safeGreetingText = sanitizeTemplateParam(greetingText, LONG_PARAM_LENGTH);
  const safeAmountText = sanitizeTemplateParam(amountText);
  const safeExpirationText = sanitizeTemplateParam(expirationDateText);
  const safeWalletLink = sanitizeTemplateParam(fallbackWalletLink, LONG_PARAM_LENGTH);

  if (!accessToken) throw new Error("WHATSAPP_TOKEN missing");
  if (!phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID missing");
  if (!to) throw new Error("Recipient number missing");

  const components = [];

  if (headerImageUrl) {
    components.push({
      type: "header",
      parameters: [
        {
          type: "image",
          image: { link: headerImageUrl },
        },
      ],
    });
  }

  components.push({
    type: "body",
    parameters: [
      { type: "text", text: safeRecipientName },
      { type: "text", text: safeGreetingText },
      { type: "text", text: safeAmountText },
      { type: "text", text: safeExpirationText },
      { type: "text", text: safeWalletLink },
    ],
  });

  try {
    const response = await axios({
      url: `${WHATSAPP_GRAPH_BASE_URL}/${phoneNumberId}/messages`,
      method: "post",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components,
        },
      },
    });

    console.log("WhatsApp message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp message:");
    if (error.response) console.error(error.response.data);
    else console.error(error.message);
    throw error;
  }
};

module.exports = { sendGiftCardTemplateMessage };
