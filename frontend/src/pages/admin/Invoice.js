import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/currency";
import "./Invoice.css";

// Dark-themed GiftyGen Logo Component
const GiftyGenLogo = () => {
  return (
    <svg
      width="80"
      height="50"
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="giftygen-logo-svg"
    >
      <defs>
        <linearGradient id="rectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="20%" stopColor="#FFD93D" />
          <stop offset="40%" stopColor="#6BCF7F" />
          <stop offset="60%" stopColor="#4D96FF" />
          <stop offset="80%" stopColor="#9B59B6" />
          <stop offset="100%" stopColor="#FF6B6B" />
        </linearGradient>
      </defs>
      
      {/* Rounded rectangle with gradient border */}
      <rect
        x="5"
        y="35"
        width="90"
        height="50"
        rx="6"
        fill="none"
        stroke="url(#rectGradient)"
        strokeWidth="2.5"
      />
      
      {/* Text "giftygen" - dark theme */}
      <text
        x="50"
        y="68"
        fontSize="18"
        fontWeight="600"
        fill="#1a1a1a"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
        letterSpacing="0.5"
      >
        giftygen
      </text>
      
      {/* Grid of colorful dots */}
      {Array.from({ length: 6 }, (_, col) =>
        Array.from({ length: 8 }, (_, row) => {
          const x = 110 + col * 12;
          const y = 40 + row * 10;
          // Create gradient effect across the grid
          const totalPos = col + row;
          let color;
          if (totalPos < 3) color = "#FF6B6B"; // Red/Orange
          else if (totalPos < 6) color = "#FFD93D"; // Yellow
          else if (totalPos < 9) color = "#6BCF7F"; // Green
          else if (totalPos < 12) color = "#4D96FF"; // Blue
          else color = "#9B59B6"; // Purple
          
          return (
            <circle
              key={`${col}-${row}`}
              cx={x}
              cy={y}
              r="3.5"
              fill={color}
            />
          );
        })
      )}
    </svg>
  );
};

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";

  useEffect(() => {
    fetchInvoices();
  }, [businessSlug]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/invoices/business/${businessSlug}`);
      if (response.data.success) {
        setInvoices(response.data.invoices || []);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await axios.get(`/api/v1/invoices/${invoiceId}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${selectedInvoice?.invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Failed to download invoice. Please try again.");
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getPlanName = (planType) => {
    const planMap = {
      monthly: "Monthly Plan",
      quarterly: "Quarterly Plan",
      yearly: "Yearly Plan",
    };
    return planMap[planType] || planType;
  };

  if (loading) {
    return (
      <div className="invoice-container">
        <div className="loading">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="invoice-page-container">
      <h1 className="invoice-page-heading">INVOICES</h1>

      {!selectedInvoice ? (
        <div className="invoices-list-container">
          {invoices.length === 0 ? (
            <div className="no-invoices">
              <p>No invoices found.</p>
            </div>
          ) : (
            <div className="invoices-grid">
              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="invoice-card"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="invoice-card-header">
                    <div className="invoice-card-number">{invoice.invoiceNumber}</div>
                    <div className={`invoice-status ${invoice.status}`}>
                      {invoice.status}
                    </div>
                  </div>
                  <div className="invoice-card-body">
                    <div className="invoice-card-info">
                      <div className="invoice-card-label">Date</div>
                      <div className="invoice-card-value">
                        {formatDate(invoice.invoiceDate)}
                      </div>
                    </div>
                    <div className="invoice-card-info">
                      <div className="invoice-card-label">Amount</div>
                      <div className="invoice-card-amount">
                        {formatCurrency(invoice.totalAmount, invoice.currency || "INR")}
                      </div>
                    </div>
                    <div className="invoice-card-info">
                      <div className="invoice-card-label">Plan</div>
                      <div className="invoice-card-value">
                        {getPlanName(invoice.planType)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="invoice-detail-container">
          <button className="back-button" onClick={() => setSelectedInvoice(null)}>
            ← Back to Invoices
          </button>

          <div className="invoice-document">
            {/* Header */}
            <div className="invoice-header">
              <div className="invoice-title-section">
                <h1 className="invoice-title">Invoice</h1>
              </div>
              <div className="invoice-logo">
                <GiftyGenLogo />
              </div>
            </div>

            {/* Company and Bill To Section */}
            <div className="invoice-addresses">
              <div className="invoice-company-info">
                <h2 className="address-heading">GiftyGen</h2>
                <div className="address-content">
                  <div>Digital Gift Card Management Platform</div>
                  <div>contact@giftygen.com</div>
                </div>
              </div>
              <div className="invoice-bill-to">
                <h2 className="address-heading">Bill to</h2>
                <div className="address-content">
                  <div className="bill-to-name">{selectedInvoice.restaurantName || "N/A"}</div>
                  <div>{formatAddress(selectedInvoice.businessAddress) || selectedInvoice.businessSlug || "N/A"}</div>
                  <div>{selectedInvoice.businessEmail || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Amount Due Section */}
            <div className="invoice-amount-due">
              <div className="amount-due-text">
                {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency || "INR")} due{" "}
                {formatDateForDisplay(selectedInvoice.dueDate || selectedInvoice.invoiceDate)}
              </div>
              {selectedInvoice.status === "pending" && (
                <a href="/subscription" className="pay-online-link">
                  Pay online
                </a>
              )}
            </div>

            {/* Divider */}
            <div className="invoice-divider"></div>

            {/* Items Table */}
            <div className="invoice-items-section">
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th className="col-description">Description</th>
                    <th className="col-qty">Qty</th>
                    <th className="col-unit-price">Unit price</th>
                    <th className="col-amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="col-description">
                      <div className="item-name">{getPlanName(selectedInvoice.planType)}</div>
                      {selectedInvoice.subscriptionId && (
                        <div className="item-period">
                          {(() => {
                            const subscription = typeof selectedInvoice.subscriptionId === 'object' 
                              ? selectedInvoice.subscriptionId 
                              : null;
                            const startDate = subscription?.startDate || selectedInvoice.invoiceDate;
                            const endDate = subscription?.endDate || selectedInvoice.dueDate || selectedInvoice.invoiceDate;
                            return `${formatDateForDisplay(startDate)} – ${formatDateForDisplay(endDate)}`;
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="col-qty">1</td>
                    <td className="col-unit-price">
                      {formatCurrency(selectedInvoice.amount, selectedInvoice.currency || "INR")}
                    </td>
                    <td className="col-amount">
                      {formatCurrency(selectedInvoice.amount, selectedInvoice.currency || "INR")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Summary */}
            <div className="invoice-summary">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency || "INR")}
                </span>
              </div>
              {selectedInvoice.taxAmount > 0 && (
                <div className="summary-row">
                  <span className="summary-label">Tax</span>
                  <span className="summary-value">
                    {formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency || "INR")}
                  </span>
                </div>
              )}
              <div className="summary-row summary-total">
                <span className="summary-label">Total</span>
                <span className="summary-value">
                  {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency || "INR")}
                </span>
              </div>
              <div className="summary-row summary-amount-due">
                <span className="summary-label">Amount due</span>
                <span className="summary-value">
                  {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency || "INR")}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
              <div className="footer-info">
                <div className="footer-company">GiftyGen, Inc.</div>
                <div className="footer-details">
                  Digital Gift Card Management Platform
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="invoice-actions">
              <button
                className="download-pdf-button"
                onClick={() => handleDownloadPDF(selectedInvoice._id)}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;

