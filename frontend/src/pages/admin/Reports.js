import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/currency";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./Reports.css";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const rowsPerPage = 25;

  const reportOptionsRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Quick date preset handlers
  const setQuickDateRange = (preset) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "today":
        start = new Date(today);
        end = new Date(today);
        break;
      case "last7days":
        start.setDate(today.getDate() - 7);
        end = new Date(today);
        break;
      case "last30days":
        start.setDate(today.getDate() - 30);
        end = new Date(today);
        break;
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today);
        break;
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "thisYear":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // Calculate date range difference
  const getDateRangeInfo = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    };

    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportDropdownOpen]);

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

  // Custom smooth scroll function with easing
  const smoothScrollTo = (targetElement, offset = 20) => {
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800; // milliseconds
    let start = null;

    // Easing function for smooth acceleration and deceleration
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // Scroll to report options when a report is selected
  useEffect(() => {
    if (selectedReport && reportOptionsRef.current) {
      // Small delay to ensure DOM is fully updated
      const timer = setTimeout(() => {
        const element = reportOptionsRef.current;
        if (element) {
          // Use custom smooth scroll
          smoothScrollTo(element, 20);

          // Add a subtle highlight effect
          element.style.transition = 'box-shadow 0.5s ease-in-out';
          element.style.boxShadow = '0 0 30px rgba(168, 85, 247, 0.5)';
          
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 1200);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedReport]);

  const handleGenerateReport = async (format) => {
    if (!selectedReport) {
      setError("Please select a report type");
      return;
    }

    // Validate that both dates are provided (except for gift card performance and redemption reports)
    if (selectedReport !== "giftcard-performance" && selectedReport !== "redemption" && (!startDate || !endDate)) {
      setError("Please select both start date and end date");
      return;
    }
    
    // For redemption report, dates are optional but recommended for better insights
    if (selectedReport === "redemption" && (!startDate || !endDate)) {
      // Allow preview without dates, but warn user
      console.warn("Redemption report generated without date filter");
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
      });
      
      // Add dates if provided (required for most reports, optional for gift card performance and redemption)
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
      
      if (selectedReport === "revenue" && groupBy) {
        params.append("groupBy", groupBy);
      }

      const response = await axios.get(`/api/v1/admin/reports/${selectedReport}?${params.toString()}`, {
        responseType: format === "pdf" || format === "xlsx" ? "blob" : "json",
      });

      if (format === "pdf" || format === "xlsx") {
        // Check if response data is valid
        if (!response.data || response.data.size === 0) {
          throw new Error("Received empty file from server");
        }
        
        // Download file
        const blob = new Blob([response.data], {
          type:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        
        // Verify blob is valid
        if (blob.size === 0) {
          throw new Error("Created blob is empty");
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().split("T")[0];
        const extension = format === "pdf" ? "pdf" : "xlsx";
        link.download = `${selectedReport}-report-${timestamp}.${extension}`;
        document.body.appendChild(link);
        
        // Add a small delay to ensure the link is ready
        setTimeout(() => {
          link.click();
          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        }, 10);
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

  // Helper function to prepare chart data for Revenue Report
  const prepareRevenueChartData = () => {
    if (!previewData?.data || !Array.isArray(previewData.data)) return null;
    
    const data = previewData.data.filter(item => item.Period !== "TOTAL");
    if (data.length === 0) return null;

    return {
      labels: data.map(item => item.Period),
      datasets: [
        {
          label: "Total Revenue",
          data: data.map(item => parseFloat(item["Total Revenue"]) || 0),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Helper function to prepare chart data for Sales Report
  const prepareSalesChartData = () => {
    if (!previewData?.data || !Array.isArray(previewData.data)) return null;
    
    // Group sales by date
    const salesByDate = {};
    previewData.data.forEach(item => {
      const date = item.Date || "";
      if (date) {
        if (!salesByDate[date]) {
          salesByDate[date] = { count: 0, revenue: 0 };
        }
        salesByDate[date].count += 1;
        salesByDate[date].revenue += parseFloat(item.Revenue || 0);
      }
    });

    const dates = Object.keys(salesByDate).sort();
    if (dates.length === 0) return null;

    return {
      labels: dates,
      datasets: [
        {
          label: "Number of Sales",
          data: dates.map(date => salesByDate[date].count),
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Helper function to prepare chart data for Customer Purchase Report
  const prepareCustomerChartData = () => {
    if (!previewData?.data || !Array.isArray(previewData.data)) return null;
    
    // Get top 10 customers by spending
    const sortedCustomers = [...previewData.data]
      .sort((a, b) => parseFloat(b["Total Spent"] || 0) - parseFloat(a["Total Spent"] || 0))
      .slice(0, 10);

    if (sortedCustomers.length === 0) return null;

    return {
      labels: sortedCustomers.map(item => {
        const name = item["Customer Name"] || "Unknown";
        return name.length > 15 ? name.substring(0, 15) + "..." : name;
      }),
      datasets: [
        {
          label: "Total Spent",
          data: sortedCustomers.map(item => parseFloat(item["Total Spent"] || 0)),
          backgroundColor: "rgba(16, 185, 129, 0.6)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Helper function to prepare chart data for Gift Card Performance Report
  const prepareGiftCardPerformanceChartData = () => {
    if (!previewData?.data || !Array.isArray(previewData.data)) return null;
    
    // Get top 10 gift cards by revenue
    const sortedCards = [...previewData.data]
      .sort((a, b) => parseFloat(b["Total Revenue"] || 0) - parseFloat(a["Total Revenue"] || 0))
      .slice(0, 10);

    if (sortedCards.length === 0) return null;

    return {
      labels: sortedCards.map(item => {
        const name = item["Gift Card Name"] || "Unknown";
        return name.length > 15 ? name.substring(0, 15) + "..." : name;
      }),
      datasets: [
        {
          label: "Total Revenue",
          data: sortedCards.map(item => parseFloat(item["Total Revenue"] || 0)),
          backgroundColor: "rgba(251, 191, 36, 0.6)",
          borderColor: "rgb(251, 191, 36)",
          borderWidth: 1,
        },
        {
          label: "Total Sales",
          data: sortedCards.map(item => parseInt(item["Total Sales"] || 0)),
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Helper function to prepare chart data for Redemption Report
  const prepareRedemptionChartData = () => {
    if (!previewData?.data || !Array.isArray(previewData.data)) return null;
    
    // Group redemptions by date
    const redemptionByDate = {};
    previewData.data.forEach(item => {
      const date = item.Date || "";
      if (date) {
        if (!redemptionByDate[date]) {
          redemptionByDate[date] = 0;
        }
        redemptionByDate[date] += parseFloat(item["Redeemed Amount"] || 0);
      }
    });

    const dates = Object.keys(redemptionByDate).sort();
    if (dates.length === 0) return null;

    return {
      labels: dates,
      datasets: [
        {
          label: "Redeemed Amount",
          data: dates.map(date => redemptionByDate[date]),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Helper function to prepare chart data for Financial Summary Report
  const prepareFinancialSummaryChartData = () => {
    if (!previewData?.data || !Array.isArray(previewData.data)) return null;
    
    // Extract values from the data array
    let revenue = 0;
    let redemption = 0;
    let profit = 0;

    previewData.data.forEach(item => {
      if (item.Metric === "Total Revenue") {
        revenue = parseFloat(item.Value || 0);
      } else if (item.Metric === "Total Redemption") {
        redemption = parseFloat(item.Value || 0);
      } else if (item.Metric === "Net Profit") {
        profit = parseFloat(item.Value || 0);
      }
    });

    // Fallback to direct properties if available
    if (revenue === 0 && previewData.totalRevenue) {
      revenue = parseFloat(previewData.totalRevenue);
    }
    if (redemption === 0 && previewData.totalRedemption) {
      redemption = parseFloat(previewData.totalRedemption);
    }
    if (profit === 0 && previewData.netProfit) {
      profit = parseFloat(previewData.netProfit);
    }

    if (revenue === 0 && redemption === 0 && profit === 0) return null;

    return {
      labels: ["Total Revenue", "Total Redemption", "Net Profit"],
      datasets: [
        {
          label: "Amount",
          data: [revenue, redemption, profit],
          backgroundColor: [
            "rgba(16, 185, 129, 0.6)",
            "rgba(239, 68, 68, 0.6)",
            "rgba(59, 130, 246, 0.6)",
          ],
          borderColor: [
            "rgb(16, 185, 129)",
            "rgb(239, 68, 68)",
            "rgb(59, 130, 246)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Common chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#e2e8f0",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(168, 85, 247, 0.3)",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(168, 85, 247, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#cbd5e1",
          font: {
            size: 11,
          },
          callback: function(value) {
            if (selectedReport === "revenue" || selectedReport === "customers" || selectedReport === "financial-summary") {
              return formatCurrency(value, 'INR');
            }
            return value;
          },
        },
        grid: {
          color: "rgba(168, 85, 247, 0.1)",
        },
      },
    },
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
          <div className="report-filters" ref={reportOptionsRef}>
            <div className="report-options-header">
              <h2>Report Options</h2>
              {startDate && endDate && (
                <div className="date-range-badge">
                  <span className="badge-icon">📅</span>
                  <span className="badge-text">
                    {getDateRangeInfo()} {getDateRangeInfo() === 1 ? 'day' : 'days'} selected
                  </span>
                </div>
              )}
            </div>

            {selectedReport !== "giftcard-performance" && (
              <div className="quick-date-presets">
                <span className="presets-label">Quick Select:</span>
                <div className="preset-buttons">
                  <button 
                    type="button"
                    className="preset-btn" 
                    onClick={() => setQuickDateRange("today")}
                    title="Today"
                  >
                    Today
                  </button>
                  <button 
                    type="button"
                    className="preset-btn" 
                    onClick={() => setQuickDateRange("last7days")}
                    title="Last 7 Days"
                  >
                    7 Days
                  </button>
                  <button 
                    type="button"
                    className="preset-btn" 
                    onClick={() => setQuickDateRange("last30days")}
                    title="Last 30 Days"
                  >
                    30 Days
                  </button>
                  <button 
                    type="button"
                    className="preset-btn" 
                    onClick={() => setQuickDateRange("thisMonth")}
                    title="This Month"
                  >
                    This Month
                  </button>
                  <button 
                    type="button"
                    className="preset-btn" 
                    onClick={() => setQuickDateRange("lastMonth")}
                    title="Last Month"
                  >
                    Last Month
                  </button>
                  <button 
                    type="button"
                    className="preset-btn" 
                    onClick={() => setQuickDateRange("thisYear")}
                    title="This Year"
                  >
                    This Year
                  </button>
                </div>
              </div>
            )}

            <div className="report-options-content">
              <div className="filter-fields-row">
                {selectedReport !== "giftcard-performance" && (
                  <>
                    <div className="filter-group">
                      <label>
                        <span className="label-icon">📆</span>
                        Start Date {selectedReport !== "redemption" && <span className="required">*</span>}
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                        required={selectedReport !== "redemption"}
                      />
                    </div>

                    <div className="filter-group">
                      <label>
                        <span className="label-icon">📆</span>
                        End Date {selectedReport !== "redemption" && <span className="required">*</span>}
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                        required={selectedReport !== "redemption"}
                      />
                    </div>
                  </>
                )}

                {selectedReport === "revenue" && (
                  <div className="filter-group">
                    <label>
                      <span className="label-icon">📊</span>
                      Group By
                    </label>
                    <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="select-input">
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="giftcard">Gift Card Type</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => handleGenerateReport("json")}
                  disabled={loadingPreview}
                  className="preview-btn"
                >
                  {loadingPreview ? "Loading..." : "👁️ Preview"}
                </button>
                
                <div className="export-dropdown-container" ref={exportDropdownRef}>
                  <button
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    disabled={loadingExcel || loadingPDF}
                    className={`export-btn ${exportDropdownOpen ? 'dropdown-open' : ''}`}
                  >
                    {(loadingExcel || loadingPDF) ? "Exporting..." : "📥 Export"}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  
                  {exportDropdownOpen && (
                    <div className="export-dropdown">
                      <button
                        onClick={() => {
                          handleGenerateReport("xlsx");
                          setExportDropdownOpen(false);
                        }}
                        disabled={loadingExcel}
                        className="export-option excel-option"
                      >
                        <span className="option-icon">📊</span>
                        <span>Excel</span>
                        {loadingExcel && <span className="loading-spinner">⏳</span>}
                      </button>
                      <button
                        onClick={() => {
                          handleGenerateReport("pdf");
                          setExportDropdownOpen(false);
                        }}
                        disabled={loadingPDF}
                        className="export-option pdf-option"
                      >
                        <span className="option-icon">📄</span>
                        <span>PDF</span>
                        {loadingPDF && <span className="loading-spinner">⏳</span>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

                {/* Charts Section */}
                <div className="charts-section">
                  {selectedReport === "revenue" && prepareRevenueChartData() && (
                    <div className="chart-container">
                      <h3>Revenue Trend</h3>
                      <div className="chart-wrapper">
                        <Line data={prepareRevenueChartData()} options={commonChartOptions} />
                      </div>
                    </div>
                  )}

                  {selectedReport === "sales" && prepareSalesChartData() && (
                    <div className="chart-container">
                      <h3>Sales Over Time</h3>
                      <div className="chart-wrapper">
                        <Bar data={prepareSalesChartData()} options={commonChartOptions} />
                      </div>
                    </div>
                  )}

                  {selectedReport === "customers" && prepareCustomerChartData() && (
                    <div className="chart-container">
                      <h3>Top Customers by Spending</h3>
                      <div className="chart-wrapper">
                        <Bar data={prepareCustomerChartData()} options={commonChartOptions} />
                      </div>
                    </div>
                  )}

                  {selectedReport === "giftcard-performance" && prepareGiftCardPerformanceChartData() && (
                    <div className="chart-container">
                      <h3>Gift Card Performance</h3>
                      <div className="chart-wrapper">
                        <Bar data={prepareGiftCardPerformanceChartData()} options={commonChartOptions} />
                      </div>
                    </div>
                  )}

                  {selectedReport === "redemption" && startDate && endDate && prepareRedemptionChartData() && (
                    <div className="chart-container">
                      <h3>Redemption Trend</h3>
                      <div className="chart-wrapper">
                        <Line data={prepareRedemptionChartData()} options={commonChartOptions} />
                      </div>
                    </div>
                  )}

                  {selectedReport === "financial-summary" && prepareFinancialSummaryChartData() && (
                    <div className="chart-container">
                      <h3>Financial Overview</h3>
                      <div className="chart-wrapper">
                        <Bar data={prepareFinancialSummaryChartData()} options={commonChartOptions} />
                      </div>
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
