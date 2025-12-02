import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Reports.css";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";

  const reportTypes = [
    {
      id: "sales",
      name: "Sales Report",
      description: "Detailed sales data with dates, gift cards, and buyer information",
      icon: "📊",
    },
    {
      id: "revenue",
      name: "Revenue Report",
      description: "Revenue analysis grouped by day, week, month, or gift card type",
      icon: "💰",
    },
    {
      id: "customers",
      name: "Customer Purchase Report",
      description: "Complete customer purchase history and spending analysis",
      icon: "👥",
    },
    {
      id: "giftcard-performance",
      name: "Gift Card Performance Report",
      description: "Performance metrics for each gift card type",
      icon: "🎁",
    },
    {
      id: "redemption",
      name: "Redemption Report",
      description: "Detailed redemption activity and remaining balances",
      icon: "🔄",
    },
    {
      id: "financial-summary",
      name: "Financial Summary Report",
      description: "Overall financial metrics including revenue, redemption, and profit",
      icon: "📈",
    },
  ];

  const handleGenerateReport = async (format) => {
    if (!selectedReport) {
      setError("Please select a report type");
      return;
    }

    // Validate that both dates are provided
    if (!startDate || !endDate) {
      setError("Please select both start date and end date");
      return;
    }

    // Validate that end date is after start date
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after or equal to start date");
      return;
    }

    // Set loading state for the specific action
    if (format === "csv") {
      setLoadingCSV(true);
    } else if (format === "pdf") {
      setLoadingPDF(true);
    } else {
      setLoadingPreview(true);
    }

    setError("");
    if (format !== "json") {
      setPreviewData(null);
    }

    try {
      const params = new URLSearchParams({
        businessSlug: businessSlug,
        format: format,
        startDate: startDate,
        endDate: endDate,
      });
      if (selectedReport === "revenue" && groupBy) {
        params.append("groupBy", groupBy);
      }

      const response = await axios.get(`/api/v1/admin/reports/${selectedReport}?${params.toString()}`, {
        responseType: format === "csv" || format === "pdf" ? "blob" : "json",
      });

      if (format === "csv" || format === "pdf") {
        // Download file
        const blob = new Blob([response.data], {
          type: format === "csv" ? "text/csv" : "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().split("T")[0];
        link.download = `${selectedReport}-report-${timestamp}.${format === "csv" ? "csv" : "pdf"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Preview data
        setPreviewData(response.data);
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.response?.data?.message || "Failed to generate report. Please try again.");
    } finally {
      // Reset loading state for the specific action
      if (format === "csv") {
        setLoadingCSV(false);
      } else if (format === "pdf") {
        setLoadingPDF(false);
      } else {
        setLoadingPreview(false);
      }
    }
  };

  return (
    <div className="reports-container">
      <h1 className="reports-heading">REPORTS</h1>

      <div className="reports-content">
        <div className="reports-description">
          <p>Purpose: Provide detailed insights into sales and customer behavior.</p>
          <ul>
            <li>Daily, weekly, and monthly sales reports.</li>
            <li>Performance metrics for each gift card type.</li>
            <li>Downloadable CSV or PDF reports.</li>
          </ul>
        </div>

        <div className="reports-section">
          <h2>Select Report Type</h2>
          <div className="report-types-grid">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`report-type-card ${selectedReport === report.id ? "selected" : ""}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="report-icon">{report.icon}</div>
                <h3>{report.name}</h3>
                <p>{report.description}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedReport && (
          <div className="report-filters">
            <h2>Report Options</h2>

            <div className="filter-group">
              <label>
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
                required
              />
            </div>

            <div className="filter-group">
              <label>
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
                required
              />
            </div>

            {selectedReport === "revenue" && (
              <div className="filter-group">
                <label>Group By</label>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="select-input">
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="giftcard">Gift Card Type</option>
                </select>
              </div>
            )}

            <div className="action-buttons">
              <button
                onClick={() => handleGenerateReport("csv")}
                disabled={loadingCSV}
                className="download-btn csv-btn"
              >
                {loadingCSV ? "Generating..." : "📥 Download CSV"}
              </button>
              <button
                onClick={() => handleGenerateReport("pdf")}
                disabled={loadingPDF}
                className="download-btn pdf-btn"
              >
                {loadingPDF ? "Generating..." : "📄 Download PDF"}
              </button>
              <button
                onClick={() => handleGenerateReport("json")}
                disabled={loadingPreview}
                className="preview-btn"
              >
                {loadingPreview ? "Loading..." : "👁️ Preview Data"}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {previewData && (
          <div className="preview-section">
            <h2>Report Preview</h2>
            {previewData.data && Array.isArray(previewData.data) && previewData.data.length > 0 ? (
              <>
                <div className="preview-stats">
                  {previewData.totalRevenue && (
                    <div className="stat-item">
                      <strong>Total Revenue:</strong> ${previewData.totalRevenue}
                    </div>
                  )}
                  {previewData.totalRedeemed && (
                    <div className="stat-item">
                      <strong>Total Redeemed:</strong> ${previewData.totalRedeemed}
                    </div>
                  )}
                  {previewData.totalRecords && (
                    <div className="stat-item">
                      <strong>Total Records:</strong> {previewData.totalRecords}
                    </div>
                  )}
                  {previewData.totalCustomers && (
                    <div className="stat-item">
                      <strong>Total Customers:</strong> {previewData.totalCustomers}
                    </div>
                  )}
                  {previewData.netProfit && (
                    <div className="stat-item">
                      <strong>Net Profit:</strong> ${previewData.netProfit}
                    </div>
                  )}
                </div>
                <div className="preview-table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {Object.keys(previewData.data[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.slice(0, 50).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex}>{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.data.length > 50 && (
                    <p className="preview-note">Showing first 50 of {previewData.data.length} records</p>
                  )}
                </div>
              </>
            ) : (
              <p className="no-data">No data available for the selected criteria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
