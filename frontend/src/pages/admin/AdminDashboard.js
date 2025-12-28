import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { formatCurrency } from "../../utils/currency";
import "./AdminDashboard.css";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalGiftCards, setTotalGiftCards] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [view, setView] = useState("sales");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRedemption, setTotalRedemption] = useState(0);
  const [salesData, setSalesData] = useState({
    labels: [],
    sales: [], // Store sales data
  });
  const [revenueData, setRevenueData] = useState({
    labels: [],
    revenue: [], // Store revenue data
  });

  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("30"); // Default to 30 days
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";

  const hasFetched = useRef(false); // ✅ Prevent duplicate API calls

  // Function to calculate date range based on filter
  const getDateRange = () => {
    if (dateFilter === "custom" && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }

    const endDate = new Date();
    const startDate = new Date();
    const days = parseInt(dateFilter);
    startDate.setDate(endDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Function to fetch graph data based on current filter
  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      const [salesResponse, revenueGraphResponse] = await Promise.all([
        axios.get(
          `/api/v1/admin/sales-data?businessSlug=${encodeURIComponent(businessSlug)}&startDate=${startDate}&endDate=${endDate}`
        ),
        axios.get(
          `/api/v1/admin/last-30-days?businessSlug=${encodeURIComponent(businessSlug)}&startDate=${startDate}&endDate=${endDate}`
        ),
      ]);

      // Sort sales data
      const salesDataArray = salesResponse.data.map((item) => ({
        date: item.date,
        sales: item.sales,
      }));
      salesDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSalesData({
        labels: salesDataArray.map((item) => item.date),
        sales: salesDataArray.map((item) => item.sales),
      });

      // Sort revenue data
      const revenueDataArray = Object.entries(revenueGraphResponse.data.revenueByDate).map(([date, revenue]) => ({
        date,
        revenue,
      }));
      revenueDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));
      setRevenueData({
        labels: revenueDataArray.map((item) => item.date),
        revenue: revenueDataArray.map((item) => item.revenue),
      });
    } catch (error) {
      console.error("❌ Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return; // ✅ Stop if already fetched
    hasFetched.current = true; // ✅ Mark as fetched

    console.log("🔄 useEffect triggered!");

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("📡 Fetching data...");

        const [
          giftCardResponse,
          soldResponse,
          revenueResponse,
          redemptionResponse,
        ] = await Promise.all([
          axios.get(`/api/v1/admin/list?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/total-sold?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/total-revenue?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/total-redemption?businessSlug=${encodeURIComponent(businessSlug)}`),
        ]);

        // Fetch graph data separately
        await fetchGraphData();

        console.log("✅ API responses received!");
        console.log("🎟️ Total Gift Cards:", giftCardResponse.data.giftCardCount);
        console.log("🎫 Total Sold:", soldResponse.data.totalSold);
        console.log("💰 Total Revenue:", revenueResponse.data.totalRevenue);
        console.log("💸 Total Redemption:", redemptionResponse.data.totalRedemption);

        setTotalGiftCards(giftCardResponse.data.giftCardCount);
        setTotalSold(soldResponse.data.totalSold);
        setTotalRevenue(revenueResponse.data.totalRevenue);
        setTotalRedemption(redemptionResponse.data.totalRedemption);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
        console.log("✅ Fetching completed.");
      }
    };

    fetchData();

    return () => {
      console.log("🛑 Cleanup function executed (if necessary)");
    };
  }, [businessSlug]);

  // Fetch graph data when filter changes (only for non-custom filters)
  useEffect(() => {
    if (hasFetched.current && businessSlug && dateFilter !== "custom") {
      fetchGraphData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, view, businessSlug]);

  // // Line chart data and options for gift card sales
  // const chartData = {
  //   labels: salesData.labels,
  //   datasets: [
  //     {
  //       label: "Gift Cards Sold",
  //       data: salesData.data,
  //       borderColor: "rgb(255, 255, 255)",
  //       fill: true,
  //       tension: 0.3, // Smooth curves
  //       pointRadius: 6, // Slightly larger points for better visibility
  //       pointBackgroundColor: "rgb(255, 255, 255)", // Point color matching the line
  //       borderWidth: 3, // Thicker line
  //       hoverBorderWidth: 4, // Border width on hover for points
  //       hoverBackgroundColor: "rgba(0, 0, 0, 0.6)", // Highlight color for hover
  //       // Apply gradient effect for filling
  //       backgroundColor: (context) => {
  //         const chart = context.chart;
  //         const { ctx, chartArea } = chart;
  //         if (!chartArea) return; // if chart isn't rendered yet
  //         const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  //         gradient.addColorStop(0, "rgba(6, 6, 6, 0.2)");
  //         gradient.addColorStop(1, "rgba(0, 0, 0, 0.05)");
  //         return gradient;
  //       },
  //     },
  //   ],
  // };

  // const chartOptions = {
  //   responsive: true,
  //   scales: {
  //     x: {
  //       title: {
  //         display: true,
  //         text: "Date",
  //         color: "rgba(0, 0, 0, 0.6)",
  //       },
  //       grid: {
  //         display: true,
  //         color: "rgba(0, 0, 0, 0.1)", // Lighter grid lines for the x-axis
  //       },
  //     },
  //     y: {
  //       title: {
  //         display: true,
  //         text: "Sales",
  //         color: "rgba(0, 0, 0, 0.6)",
  //       },
  //       beginAtZero: true,
  //       grid: {
  //         color: "rgba(0, 0, 0, 0.1)", // Lighter grid lines for the y-axis
  //       },
  //     },
  //   },
  //   plugins: {
  //     tooltip: {
  //       backgroundColor: "rgba(0, 0, 0, 0.8)", // Darker background for tooltips
  //       titleColor: "#fff", // White color for tooltip title
  //       bodyColor: "#fff", // White color for tooltip body text
  //       borderColor: "rgb(0, 0, 0)", // Border color matching the line
  //       borderWidth: 2, // Tooltip border width
  //       padding: 10,
  //       displayColors: false, // Hide color box in tooltip
  //     },
  //     legend: {
  //       position: "top",
  //       labels: {
  //         fontColor: "rgba(0, 0, 0, 0.7)", // Legend font color
  //         fontSize: 14, // Increase font size for readability
  //       },
  //     },
  //   },
  //   interaction: {
  //     mode: "nearest", // Nearest point hover effect
  //     intersect: false, // Allow hover over lines to highlight data points
  //   },
  //   elements: {
  //     line: {
  //       borderWidth: 3, // Line thickness
  //       borderColor: "rgb(0, 0, 0)", // Line color
  //       tension: 0.3, // Smooth line
  //     },
  //     point: {
  //       radius: 6, // Point size
  //       hitRadius: 10, // Area for hover detection
  //       backgroundColor: "rgb(0, 0, 0)", // Point color matching the line
  //     },
  //   },
  //   animation: {
  //     duration: 1500, // Animation duration (slow for smooth effects)
  //     easing: "easeInOutCubic", // Smooth easing effect
  //   },
  // };
  // Line chart data and options for gift card sales and revenue
  const chartData = {
    labels: salesData.labels,
    datasets: [
      {
        label: "Gift Cards Sold",
        data: salesData.sales,
        borderColor: "rgb(236, 72, 153)", // Pink color matching the image
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgb(236, 72, 153)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: "rgb(236, 72, 153)",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(236, 72, 153, 0.4)"); // Stronger pink at bottom
          gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.3)"); // Purple in middle
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.05)"); // Fade to transparent at top
          return gradient;
        },
      },
    ],
  };

  const revenueChartData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: "Revenue Generated",
        data: revenueData.revenue,
        borderColor: "rgb(59, 130, 246)", // Blue color for revenue
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: "rgb(59, 130, 246)",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
          gradient.addColorStop(0.5, "rgba(14, 165, 233, 0.3)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.05)");
          return gradient;
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "rgb(168, 85, 247)", // Purple text matching the image
          font: {
            size: 14,
            weight: "500",
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "rect",
        },
      },
      tooltip: {
        backgroundColor: "rgba(30, 41, 59, 0.95)",
        titleColor: "rgb(168, 85, 247)",
        bodyColor: "#fff",
        borderColor: "rgba(168, 85, 247, 0.3)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "600",
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(148, 163, 184, 0.8)",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        title: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "rgba(148, 163, 184, 0.8)",
          font: {
            size: 11,
          },
          stepSize: 1,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Sales",
          color: "rgba(148, 163, 184, 0.9)",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 3,
        tension: 0.4,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
        hitRadius: 10,
        borderWidth: 2,
      },
    },
    animation: {
      duration: 1200,
      easing: "easeInOutQuart",
    },
  };

  const revenueChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        labels: {
          ...chartOptions.plugins.legend.labels,
          color: "rgb(59, 130, 246)", // Blue for revenue
        },
      },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        titleColor: "rgb(59, 130, 246)",
        borderColor: "rgba(59, 130, 246, 0.3)",
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          ...chartOptions.scales.y.title,
          text: "Revenue",
        },
      },
    },
  };

  const handleSalesView = () => {
    setView("sales");
  };

  const handleRevenueView = () => {
    setView("revenue");
  };

  const handleFilterChange = (filterValue) => {
    setDateFilter(filterValue);
    if (filterValue !== "custom") {
      setShowCustomDatePicker(false);
    } else {
      setShowCustomDatePicker(true);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate && new Date(customStartDate) <= new Date(customEndDate)) {
      fetchGraphData();
    } else {
      alert("Please select valid start and end dates");
    }
  };

  const getFilterLabel = () => {
    if (dateFilter === "custom") {
      return customStartDate && customEndDate
        ? `${customStartDate} to ${customEndDate}`
        : "Custom Range";
    }
    const days = parseInt(dateFilter);
    if (days === 7) return "Last 7 Days";
    if (days === 30) return "Last 30 Days";
    if (days === 90) return "Last 90 Days";
    if (days === 180) return "Last 6 Months";
    if (days === 365) return "Last Year";
    return `Last ${days} Days`;
  };

  return (
    <div>
      <h1 className="heading">Dashboard</h1>
      <div className="dashboard-container">
        <div
          className="stat-card"
          onClick={() => navigate("/giftcards")} // Navigate to GiftCards page on click
          style={{ cursor: "pointer" }} // Make it look clickable
        >
          <h3>Types Of Gift Card</h3>
          {loading ? <div className="skeleton" /> : <p>{totalGiftCards}</p>}
        </div>

        <div
          className="stat-card"
          onClick={() => navigate("/orders")} // Navigate to Orders page on click
          style={{ cursor: "pointer" }} // Make it look clickable
        >
          <h3>Total Gift Cards Sold</h3>
          {loading ? <div className="skeleton" /> : <p>{totalSold}</p>}
        </div>

        <div className="stat-card">
          <h3>Total Redemption</h3>
          {loading ? <div className="skeleton" /> : <p>{formatCurrency(totalRedemption, 'INR')}</p>}
        </div>

        <div className="stat-card">
          <h3>Total Revenue </h3>
          {loading ? <div className="skeleton" /> : <p>{formatCurrency(totalRevenue, 'INR')}</p>}
        </div>
      </div>

      <div className="admin-view-toggle-buttons">
        <button onClick={handleSalesView} className={view === "sales" ? "active-view-button" : "view-button"}>
          Sales
        </button>
        <button onClick={handleRevenueView} className={view === "revenue" ? "active-view-button" : "view-button"}>
          Revenue
        </button>
      </div>

      {/* Sales View */}
      {view === "sales" && (
        <div className="graphs-section">
          <div className="graph-header">
            <h3>Gift Card Sales ({getFilterLabel()})</h3>
            <div className="filter-container">
              <select
                value={dateFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              {showCustomDatePicker && (
                <div className="custom-date-picker">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="date-input"
                    max={customEndDate || new Date().toISOString().split("T")[0]}
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                    min={customStartDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <button onClick={handleCustomDateApply} className="apply-date-button">
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="chart-wrapper">
            {loading ? <div className="skeleton-graph" /> : <Line data={chartData} options={chartOptions} />}
          </div>
        </div>
      )}

      {/* Revenue View */}
      {view === "revenue" && (
        <div className="graphs-section">
          <div className="graph-header">
            <h3>Gift Card Revenue ({getFilterLabel()})</h3>
            <div className="filter-container">
              <select
                value={dateFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 6 Months</option>
                <option value="365">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              {showCustomDatePicker && (
                <div className="custom-date-picker">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="date-input"
                    max={customEndDate || new Date().toISOString().split("T")[0]}
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="date-input"
                    min={customStartDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <button onClick={handleCustomDateApply} className="apply-date-button">
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="chart-wrapper">
            {loading ? <div className="skeleton-graph" /> : <Line data={revenueChartData} options={revenueChartOptions} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
