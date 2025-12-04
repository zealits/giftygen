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
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";

  const hasFetched = useRef(false); // ✅ Prevent duplicate API calls

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
          salesResponse,
          redemptionResponse,
          revenueGraphResponse,
        ] = await Promise.all([
          axios.get(`/api/v1/admin/list?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/total-sold?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/total-revenue?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/sales-data?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/total-redemption?businessSlug=${encodeURIComponent(businessSlug)}`),
          axios.get(`/api/v1/admin/last-30-days?businessSlug=${encodeURIComponent(businessSlug)}`),
        ]);

        console.log("✅ API responses received!");
        console.log("🎟️ Total Gift Cards:", giftCardResponse.data.giftCardCount);
        console.log("🎫 Total Sold:", soldResponse.data.totalSold);
        console.log("💰 Total Revenue:", revenueResponse.data.totalRevenue);
        console.log("📊 Sales Data:", salesResponse.data);
        console.log("💸 Total Redemption:", redemptionResponse.data.totalRedemption);
        console.log("📈 Revenue Data:", revenueGraphResponse.data.revenueByDate);

        setTotalGiftCards(giftCardResponse.data.giftCardCount);
        setTotalSold(soldResponse.data.totalSold);
        setTotalRevenue(revenueResponse.data.totalRevenue);

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
        borderColor: "rgb(255, 99, 132)", // Different color for sales
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: "rgb(255, 99, 132)",
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: "rgba(255, 99, 132, 0.6)",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(255, 99, 132, 0.2)");
          gradient.addColorStop(1, "rgba(255, 99, 132, 0.05)");
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
        borderColor: "rgb(54, 162, 235)", // Different color for revenue
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: "rgb(54, 162, 235)",
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: "rgba(54, 162, 235, 0.6)",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(54, 162, 235, 0.2)");
          gradient.addColorStop(1, "rgba(54, 162, 235, 0.05)");
          return gradient;
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "rgba(168, 163, 163, 0.6)",
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Sales",
          color: "rgba(223, 216, 216, 0.6)",
        },
        beginAtZero: true,
        grid: {
          color: "rgba(208, 207, 207, 0.1)",
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(142, 139, 139, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgb(8, 77, 81)",
        borderWidth: 2,
        padding: 10,
        displayColors: false,
      },
      legend: {
        position: "top",
        labels: {
          fontColor: "rgba(0, 0, 0, 0.7)",
          fontSize: 14,
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
        borderColor: "rgb(0, 0, 0)",
        tension: 0.3,
      },
      point: {
        radius: 6,
        hitRadius: 10,
        backgroundColor: "rgb(0, 0, 0)",
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutCubic",
    },
  };

  const handleSalesView = () => {
    setView("sales");
  };

  const handleRevenueView = () => {
    setView("revenue");
    // Fetch buyers when switching to the "User" view
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
          <h3>Gift Card Sales (Last 30 Days)</h3>
          {loading ? <div className="skeleton-graph" /> : <Line data={chartData} options={chartOptions} />}
        </div>
      )}

      {/* Sales View */}
      {view === "revenue" && (
        <div className="graphs-section">
          <h3>Gift Card Revenue (Last 30 Days)</h3>
          {loading ? <div className="skeleton-graph" /> : <Line data={revenueChartData} options={chartOptions} />}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
