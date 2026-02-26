const Invoice = require("../models/invoiceSchema");
const Subscription = require("../models/subscriptionSchema");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const puppeteer = require("puppeteer");
const { sendEmail } = require("../utils/sendEmail");
const { getTaxBreakdown } = require("../utils/taxCalculator");

// Helper function to format date consistently (DD/MM/YYYY)
const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format date for display (Mon DD, YYYY)
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Helper function to escape HTML for safe rendering
const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Build HTML string for invoice
const buildInvoiceHtml = (invoice, businessInfo) => {
  const invoiceDate = formatDate(invoice.invoiceDate);
  const dueDate = formatDate(invoice.dueDate);
  const planTypeMap = {
    monthly: "Monthly Plan",
    quarterly: "Quarterly Plan (Small Business)",
    biannual: "Biannual Plan (Small Business)",
    yearly: "Yearly Plan (Small Business)",
    medium_quarterly: "Quarterly Plan (Medium Business)",
    medium_biannual: "Biannual Plan (Medium Business)",
    medium_yearly: "Yearly Plan (Medium Business)",
    large_quarterly: "Quarterly Plan (Large Business)",
    large_biannual: "Biannual Plan (Large Business)",
    large_yearly: "Yearly Plan (Large Business)",
  };
  const planName = planTypeMap[invoice.planType] || invoice.planType;

  // Get subscription data (could be from subscriptionId populated or subscription property)
  let subscription = invoice.subscriptionId || invoice.subscription;

  // If subscription is an ObjectId, try to get dates from invoice dates as fallback
  if (!subscription || (subscription && !subscription.startDate && !subscription.endDate)) {
    // Use invoice dates as fallback for subscription period
    subscription = {
      startDate: invoice.invoiceDate,
      endDate: invoice.dueDate || invoice.invoiceDate
    };
  }

  // Company information (GiftyGen)
  const companyInfo = {
    name: "GiftyGen",
    email: "contact@giftygen.com",
    address: {
      street: "Digital Gift Card Management Platform",
      city: "",
      state: "",
      zipCode: "",
    },
  };

  // Business address formatting
  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          font-size: 12px;
          color: #222;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        .invoice-title-section {
          flex: 1;
        }
        .invoice-title {
          font-size: 48px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -1px;
        }
        .invoice-logo {
          width: 80px;
          height: 50px;
        }
        .invoice-addresses {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 40px;
        }
        .invoice-company-info,
        .invoice-bill-to {
          flex: 1;
        }
        .address-heading {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .address-content {
          font-size: 14px;
          color: #1a1a1a;
          line-height: 1.6;
        }
        .bill-to-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .invoice-amount-due {
          margin-bottom: 20px;
        }
        .amount-due-text {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .invoice-divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 30px 0;
        }
        .invoice-items-section {
          margin-bottom: 30px;
        }
        .invoice-items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .invoice-items-table thead {
          border-bottom: 1px solid #e0e0e0;
        }
        .invoice-items-table th {
          text-align: left;
          padding: 12px 0;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .invoice-items-table td {
          padding: 16px 0;
          font-size: 14px;
          color: #1a1a1a;
          border-bottom: 1px solid #f0f0f0;
        }
        .col-description {
          width: 50%;
        }
        .col-qty {
          width: 10%;
          text-align: center;
        }
        .col-unit-price {
          width: 20%;
          text-align: right;
        }
        .col-amount {
          width: 20%;
          text-align: right;
          font-weight: 600;
        }
        .item-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .item-period {
          font-size: 12px;
          color: #666;
        }
        .invoice-summary {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          margin-top: 20px;
          margin-bottom: 40px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          width: 300px;
          font-size: 14px;
        }
        .summary-label {
          color: #666;
        }
        .summary-value {
          color: #1a1a1a;
          font-weight: 500;
        }
        .summary-total {
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
          font-size: 16px;
        }
        .summary-total .summary-value {
          font-weight: 600;
        }
        .summary-amount-due {
          font-size: 18px;
          font-weight: 700;
          margin-top: 8px;
        }
        .summary-amount-due .summary-value {
          font-weight: 700;
        }
        .invoice-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 11px;
          color: #6c757d;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-paid {
          background: #d4edda;
          color: #155724;
        }
        .status-pending {
          background: #fff3cd;
          color: #856404;
        }
        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="invoice-title-section">
            <h1 class="invoice-title">Invoice</h1>
          </div>
          <div class="invoice-logo">
            <svg width="80" height="50" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#FF6B6B" />
                  <stop offset="20%" stop-color="#FFD93D" />
                  <stop offset="40%" stop-color="#6BCF7F" />
                  <stop offset="60%" stop-color="#4D96FF" />
                  <stop offset="80%" stop-color="#9B59B6" />
                  <stop offset="100%" stop-color="#FF6B6B" />
                </linearGradient>
              </defs>
              <rect x="5" y="35" width="90" height="50" rx="6" fill="none" stroke="url(#rectGradient)" stroke-width="2.5" />
              <text x="50" y="68" font-size="18" font-weight="600" fill="#1a1a1a" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" letter-spacing="0.5">giftygen</text>
              ${Array.from({ length: 6 }, (_, col) =>
    Array.from({ length: 8 }, (_, row) => {
      const x = 110 + col * 12;
      const y = 40 + row * 10;
      const totalPos = col + row;
      let color;
      if (totalPos < 3) color = "#FF6B6B";
      else if (totalPos < 6) color = "#FFD93D";
      else if (totalPos < 9) color = "#6BCF7F";
      else if (totalPos < 12) color = "#4D96FF";
      else color = "#9B59B6";
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" />`;
    }).join('')
  ).join('')}
            </svg>
          </div>
        </div>

        <div class="invoice-addresses">
          <div class="invoice-company-info">
            <h2 class="address-heading">GIFTYGEN</h2>
            <div class="address-content">
              <div>${escapeHtml(companyInfo.address.street)}</div>
              <div>${escapeHtml(companyInfo.email)}</div>
            </div>
          </div>
          <div class="invoice-bill-to">
            <h2 class="address-heading">BILL TO</h2>
            <div class="address-content">
              <div class="bill-to-name">${escapeHtml(businessInfo.restaurantName || businessInfo.name || "N/A")}</div>
              <div>${escapeHtml(invoice.businessSlug || "N/A")}</div>
              <div>${escapeHtml(formatAddress(businessInfo.restaurantAddress) || "N/A")}</div>
              <div>${escapeHtml(businessInfo.email || "N/A")}</div>
            </div>
          </div>
        </div>

        <div class="invoice-amount-due">
          <div class="amount-due-text">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.totalAmount.toFixed(2))} due ${escapeHtml(formatDateForDisplay(invoice.dueDate || invoice.invoiceDate))}</div>
        </div>

        <div class="invoice-divider"></div>

        <div class="invoice-items-section">
          <table class="invoice-items-table">
            <thead>
              <tr>
                <th class="col-description">Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-unit-price">Unit price</th>
                <th class="col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="col-description">
                  <div class="item-name">${escapeHtml(planName)}</div>
                  ${(() => {
      const sub = subscription;
      if (sub && sub.startDate && sub.endDate) {
        return `<div class="item-period">${escapeHtml(formatDateForDisplay(sub.startDate))} – ${escapeHtml(formatDateForDisplay(sub.endDate))}</div>`;
      } else if (sub && (sub.startDate || sub.endDate)) {
        const start = sub.startDate ? formatDateForDisplay(sub.startDate) : formatDateForDisplay(invoice.invoiceDate);
        const end = sub.endDate ? formatDateForDisplay(sub.endDate) : formatDateForDisplay(invoice.dueDate || invoice.invoiceDate);
        return `<div class="item-period">${escapeHtml(start)} – ${escapeHtml(end)}</div>`;
      } else {
        // Fallback: calculate dates based on plan type
        const startDate = invoice.invoiceDate;
        const endDate = new Date(startDate);
        if (invoice.planType === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (invoice.planType === 'quarterly' || invoice.planType === 'medium_quarterly' || invoice.planType === 'large_quarterly') {
          endDate.setMonth(endDate.getMonth() + 3);
        } else if (invoice.planType === 'biannual' || invoice.planType === 'medium_biannual' || invoice.planType === 'large_biannual') {
          endDate.setMonth(endDate.getMonth() + 6);
        } else if (invoice.planType === 'yearly' || invoice.planType === 'medium_yearly' || invoice.planType === 'large_yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        return `<div class="item-period">${escapeHtml(formatDateForDisplay(startDate))} – ${escapeHtml(formatDateForDisplay(endDate))}</div>`;
      }
    })()}
                </td>
                <td class="col-qty">1</td>
                <td class="col-unit-price">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.amount.toFixed(2))}</td>
                <td class="col-amount">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.amount.toFixed(2))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="invoice-summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal</span>
            <span class="summary-value">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.amount.toFixed(2))}</span>
          </div>
          ${invoice.taxAmount > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Tax</span>
            <span class="summary-value">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.taxAmount.toFixed(2))}</span>
          </div>
          ` : ""}
          <div class="summary-row summary-total">
            <span class="summary-label">Total</span>
            <span class="summary-value">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.totalAmount.toFixed(2))}</span>
          </div>
          <div class="summary-row summary-amount-due">
            <span class="summary-label">Amount due</span>
            <span class="summary-value">${escapeHtml(invoice.currency === "INR" ? "₹" : invoice.currency)} ${escapeHtml(invoice.totalAmount.toFixed(2))}</span>
          </div>
        </div>

        <div class="invoice-footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p style="margin-top: 10px;">For any queries, please contact us at ${escapeHtml(companyInfo.email)}</p>
        </div>
      </div>
    </body>
  </html>`;
};

// Generate PDF invoice using Puppeteer
const generateInvoicePDF = async (invoice, businessInfo) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const html = buildInvoiceHtml(invoice, businessInfo);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

// Create invoice after subscription payment
exports.createInvoice = async (subscription, businessInfo) => {
  try {
    // Use tax amounts from subscription if available, otherwise calculate
    let taxAmount, totalAmount;

    if (subscription.taxAmount && subscription.totalAmount) {
      // Use stored tax amounts from subscription
      taxAmount = subscription.taxAmount;
      totalAmount = subscription.totalAmount;
    } else {
      // Calculate tax breakdown (for backward compatibility with old subscriptions)
      const taxBreakdown = getTaxBreakdown(subscription.amount);
      taxAmount = taxBreakdown.taxAmount;
      totalAmount = taxBreakdown.totalAmount;
    }

    // Calculate due date (same as invoice date for paid invoices)
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);

    // Generate unique invoice number
    const count = await Invoice.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${timestamp}-${String(count + 1).padStart(4, "0")}`;

    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber,
      subscriptionId: subscription._id,
      businessSlug: subscription.businessSlug,
      restaurantName: businessInfo.restaurantName || businessInfo.name,
      businessEmail: businessInfo.email,
      businessAddress: businessInfo.restaurantAddress || {},
      planType: subscription.planType,
      amount: subscription.amount, // Base amount
      currency: subscription.currency || "INR",
      taxAmount: taxAmount,
      totalAmount: totalAmount, // Total with tax (matches Razorpay payment)
      paymentId: subscription.razorpayPaymentId,
      orderId: subscription.razorpayOrderId,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      status: "paid",
    });

    // Attach subscription object for invoice HTML generation (temporary, not saved to DB)
    invoice.subscription = subscription;

    return invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// Send invoice via email
exports.sendInvoiceEmail = async (invoice, businessInfo) => {
  try {
    const pdfBuffer = await generateInvoicePDF(invoice, businessInfo);

    // Generate the invoice HTML template for email
    const invoiceHtml = buildInvoiceHtml(invoice, businessInfo);

    // Create email wrapper with the invoice embedded
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-wrapper {
              max-width: 900px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .email-header {
              background-color: #ffffff;
              padding: 20px;
              text-align: center;
              border-bottom: 1px solid #e0e0e0;
            }
            .email-header h2 {
              margin: 0;
              color: #1a1a1a;
              font-size: 18px;
            }
            .email-message {
              padding: 20px;
              background-color: #f8f9fa;
              border-bottom: 1px solid #e0e0e0;
            }
            .email-message p {
              margin: 10px 0;
              color: #333;
              font-size: 14px;
            }
            .invoice-embed {
              background-color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-header">
              <h2>Invoice Generated - GiftyGen</h2>
            </div>
            <div class="email-message">
              <p>Dear ${escapeHtml(businessInfo.restaurantName || businessInfo.name || "Valued Customer")},</p>
              <p>Thank you for your subscription to GiftyGen! Your invoice has been generated and is displayed below. A PDF copy is also attached to this email for your records.</p>
            </div>
            <div class="invoice-embed">
              ${invoiceHtml}
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      email: businessInfo.email,
      subject: `Invoice ${invoice.invoiceNumber} - GiftyGen Subscription`,
      html: emailHtml,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
};

// Get invoice by ID
exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId).populate("subscriptionId");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invoice" });
  }
};

// Get invoices by business slug
exports.getInvoicesByBusiness = async (req, res) => {
  try {
    const { businessSlug } = req.params;

    const invoices = await Invoice.find({ businessSlug })
      .sort({ createdAt: -1 })
      .populate("subscriptionId");

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
};

// Download invoice PDF
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId).populate("subscriptionId");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Ensure subscription data is available for template
    if (invoice.subscriptionId && typeof invoice.subscriptionId === 'object') {
      invoice.subscription = invoice.subscriptionId;
    }

    // Get business information
    const businessInfo = await RestaurantAdmin.findOne({
      businessSlug: invoice.businessSlug,
    });

    if (!businessInfo) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const pdfBuffer = await generateInvoicePDF(invoice, businessInfo);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    res.status(500).json({ success: false, message: "Failed to generate invoice PDF" });
  }
};

