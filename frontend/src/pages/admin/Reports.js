import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/currency";
import "./Reports.css";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

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

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId);
    // Reset form fields and state when switching reports
    setStartDate("");
    setEndDate("");
    setGroupBy("day");
    setError("");
    setPreviewData(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

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
    if (format === "pdf") {
      setLoadingPDF(true);
    } else if (format === "xlsx") {
      setLoadingExcel(true);
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
        responseType: format === "pdf" || format === "xlsx" ? "blob" : "json",
      });

      if (format === "pdf" || format === "xlsx") {
        // Download file
        const blob = new Blob([response.data], {
          type:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().split("T")[0];
        const extension = format === "pdf" ? "pdf" : "xlsx";
        link.download = `${selectedReport}-report-${timestamp}.${extension}`;
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
      if (format === "pdf") {
        setLoadingPDF(false);
      } else if (format === "xlsx") {
        setLoadingExcel(false);
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
            <li>Downloadable Excel or PDF reports.</li>
          </ul>
        </div>

        <div className="reports-section">
          <h2>Select Report Type</h2>
          <div className="report-types-grid">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`report-type-card ${selectedReport === report.id ? "selected" : ""}`}
                onClick={() => handleReportSelect(report.id)}
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
                onClick={() => handleGenerateReport("xlsx")}
                disabled={loadingExcel}
                className="download-btn csv-btn"
              >
                {loadingExcel ? "Generating..." : "📊 Download Excel"}
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
                      <strong>Total Revenue:</strong> {formatCurrency(parseFloat(previewData.totalRevenue), 'INR')}
                    </div>
                  )}
                  {previewData.totalRedeemed && (
                    <div className="stat-item">
                      <strong>Total Redeemed:</strong> {formatCurrency(parseFloat(previewData.totalRedeemed), 'INR')}
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
                      <strong>Net Profit:</strong> {formatCurrency(parseFloat(previewData.netProfit), 'INR')}
                    </div>
                  )}
                </div>
                <div className="preview-table-controls">
                  <div className="preview-search">
                    <input
                      type="text"
                      placeholder="Search in results..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="preview-table-container">
                  {(() => {
                    const allRows = previewData.data || [];
                    const filteredRows = searchTerm
                      ? allRows.filter((row) =>
                          Object.values(row).some((value) =>
                            String(value || "")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                        )
                      : allRows;

                    const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
                    const safeCurrentPage = Math.min(currentPage, totalPages);
                    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
                    const pageRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

                    const headers =
                      (filteredRows[0] && Object.keys(filteredRows[0])) ||
                      (allRows[0] && Object.keys(allRows[0])) ||
                      [];

                    return (
                      <>
                        <table className="preview-table">
                          <thead>
                            <tr>
                              {headers.map((key) => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {pageRows.map((row, index) => {
                              // Create a unique key from row data
                              const rowKey = row.Date
                                ? `${row.Date}-${row["Buyer Email"] || row["Customer Email"] || ""}-${index}`
                                : `${index}-${JSON.stringify(row).substring(0, 50)}`;
                              return (
                                <tr key={rowKey}>
                                  {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex}>{String(value || "")}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        <div className="preview-pagination">
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safeCurrentPage === 1}
                          >
                            Previous
                          </button>
                          <span>
                            Page {safeCurrentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>

                        <p className="preview-note">
                          Showing {pageRows.length} of {filteredRows.length} matching records
                          {searchTerm && filteredRows.length !== allRows.length
                            ? ` (filtered from ${allRows.length} total)`
                            : ""}
                        </p>
                      </>
                    );
                  })()}
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
