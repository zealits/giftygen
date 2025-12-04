const GiftCard = require("../models/giftCardSchema");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

// Helper function to format date consistently (DD/MM/YYYY)
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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

// Helper function to generate and download Excel (.xlsx)
const downloadExcel = async (res, data, headers, filename, sheetName = "Report") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName.substring(0, 31) || "Sheet1");

  // Add header row
  worksheet.addRow(headers);

  // Add data rows in the same order as headers
  data.forEach((row) => {
    worksheet.addRow(headers.map((header) => row[header] ?? ""));
  });

  // Basic styling
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? String(cell.value) : "";
      maxLength = Math.max(maxLength, cellValue.length + 2);
    });
    column.width = Math.min(maxLength, 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
};

// Build HTML string for a clean, professional-looking report
const buildReportHtml = (title, data, headers) => {
  const currentDate = formatDate(new Date());

  const headerCells = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  const rowsHtml = data
    .map((row, rowIndex) => {
      const cells = headers
        .map((header) => {
          const value = row[header] !== undefined && row[header] !== null ? row[header] : "";
          return `<td>${escapeHtml(value)}</td>`;
        })
        .join("");

      const rowClass = rowIndex % 2 === 0 ? "even" : "odd";
      return `<tr class="${rowClass}">${cells}</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          font-size: 11px;
          color: #222;
          margin: 0;
          padding: 24px 24px 40px 24px;
        }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 16px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }
        .report-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .report-meta {
          font-size: 10px;
          color: #666;
          text-align: right;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
        }
        thead th {
          background: #f5f5f5;
          font-weight: 600;
          font-size: 10px;
          text-align: left;
          padding: 6px 8px;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
        }
        tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
          font-size: 10px;
        }
        tbody tr.even {
          background: #fafafa;
        }
        tbody tr.odd {
          background: #ffffff;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div class="report-title">${escapeHtml(title)}</div>
        <div class="report-meta">
          <div>Generated on: ${escapeHtml(currentDate)}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
  </html>`;
};

// Helper function to generate PDF using Puppeteer (HTML to PDF)
const generatePDF = async (title, data, headers) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const html = buildReportHtml(title, data, headers);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "40px",
        right: "20px",
        bottom: "40px",
        left: "20px",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

// Sales Report
const getSalesReport = async (req, res) => {
  try {
    const { businessSlug, startDate, endDate, format } = req.query;
    
    // Validate required dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const filter = businessSlug ? { businessSlug } : {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include all purchases on that day
    end.setHours(23, 59, 59, 999);

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: start,
        $lte: end,
      },
    };

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    // Aggregate sales data
    const salesData = [];
    giftCards.forEach((card) => {
      card.buyers.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        // Filter buyers by date range
        if (purchaseDate >= start && purchaseDate <= end) {
          const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
          const revenue = (card.amount || 0) * (1 - discount);
          salesData.push({
            Date: formatDate(purchaseDate),
            "Gift Card Name": card.giftCardName,
            "Gift Card Tag": card.giftCardTag || "N/A",
            Amount: card.amount || 0,
            Discount: card.discount ? `${card.discount}%` : "0%",
            Revenue: revenue.toFixed(2),
            "Buyer Name": buyer.purchaseType === "self" ? buyer.selfInfo?.name : buyer.giftInfo?.senderName,
            "Buyer Email": buyer.purchaseType === "self" ? buyer.selfInfo?.email : buyer.giftInfo?.senderEmail,
            "Transaction ID": buyer.paymentDetails?.transactionId || buyer.qrCode?.uniqueCode || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            _sortDate: purchaseDate, // Store actual date for sorting
          });
        }
      });
    });

    // Sort by actual date object
    salesData.sort((a, b) => a._sortDate - b._sortDate);
    // Remove temporary sorting field
    salesData.forEach(item => delete item._sortDate);

    const headers = ["Date", "Gift Card Name", "Gift Card Tag", "Amount", "Discount", "Revenue", "Buyer Name", "Buyer Email", "Transaction ID"];

    if (format === "pdf") {
      const pdfBytes = await generatePDF("Sales Report", salesData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=sales-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else if (format === "xlsx") {
      await downloadExcel(res, salesData, headers, `sales-report-${Date.now()}.xlsx`, "Sales Report");
    } else {
      res.json({ success: true, data: salesData, totalRecords: salesData.length });
    }
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ success: false, message: "Failed to generate sales report" });
  }
};

// Revenue Report
const getRevenueReport = async (req, res) => {
  try {
    const { businessSlug, startDate, endDate, format, groupBy } = req.query;
    
    // Validate required dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const filter = businessSlug ? { businessSlug } : {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include all purchases on that day
    end.setHours(23, 59, 59, 999);

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: start,
        $lte: end,
      },
    };

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    // Aggregate revenue data
    const revenueMap = {};
    let totalRevenue = 0;
    const periodSortMap = {}; // Store sort keys for chronological sorting

    giftCards.forEach((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);

      card.buyers.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        // Filter buyers by date range
        if (purchaseDate >= start && purchaseDate <= end) {
          let key;
          let sortKey;
          
          if (groupBy === "giftcard") {
            key = card.giftCardName;
            sortKey = card.giftCardName;
          } else if (groupBy === "day") {
            // Format date consistently (DD/MM/YYYY)
            const day = String(purchaseDate.getDate()).padStart(2, '0');
            const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
            const year = purchaseDate.getFullYear();
            key = `${day}/${month}/${year}`;
            sortKey = purchaseDate.toISOString().split('T')[0]; // YYYY-MM-DD for sorting
          } else if (groupBy === "week") {
            const weekStart = new Date(purchaseDate);
            weekStart.setDate(purchaseDate.getDate() - purchaseDate.getDay());
            weekStart.setHours(0, 0, 0, 0);
            // Format date consistently (DD/MM/YYYY)
            key = `Week of ${formatDate(weekStart)}`;
            sortKey = weekStart.toISOString();
          } else if (groupBy === "month") {
            const monthYear = purchaseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            key = monthYear;
            // Create sort key: YYYY-MM for proper chronological sorting
            sortKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
          } else {
            key = "Total";
            sortKey = "9999-12-31"; // Put total at the end
          }

          if (!revenueMap[key]) {
            revenueMap[key] = { revenue: 0, count: 0, sortKey };
            periodSortMap[key] = sortKey;
          }
          revenueMap[key].revenue += cardRevenue;
          revenueMap[key].count += 1;
          totalRevenue += cardRevenue;
        }
      });
    });

    const revenueData = Object.entries(revenueMap)
      .map(([key, value]) => ({
        Period: key,
        "Total Revenue": value.revenue.toFixed(2),
        "Number of Sales": value.count,
        "Average Revenue": (value.revenue / value.count).toFixed(2),
        _sortKey: value.sortKey, // Store sort key for sorting
      }))
      .sort((a, b) => {
        // Sort chronologically, but put TOTAL at the end
        if (a.Period === "TOTAL") return 1;
        if (b.Period === "TOTAL") return -1;
        return a._sortKey.localeCompare(b._sortKey);
      });

    // Remove temporary sorting field
    revenueData.forEach(item => delete item._sortKey);

    // Add total row at the end
    const totalSales = revenueData.reduce((sum, row) => sum + parseInt(row["Number of Sales"]), 0);
    revenueData.push({
      Period: "TOTAL",
      "Total Revenue": totalRevenue.toFixed(2),
      "Number of Sales": totalSales,
      "Average Revenue": totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : "0.00",
    });

    const headers = ["Period", "Total Revenue", "Number of Sales", "Average Revenue"];

    if (format === "pdf") {
      const pdfBytes = await generatePDF("Revenue Report", revenueData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=revenue-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else if (format === "xlsx") {
      await downloadExcel(res, revenueData, headers, `revenue-report-${Date.now()}.xlsx`, "Revenue Report");
    } else {
      res.json({ success: true, data: revenueData, totalRevenue: totalRevenue.toFixed(2) });
    }
  } catch (error) {
    console.error("Error generating revenue report:", error);
    res.status(500).json({ success: false, message: "Failed to generate revenue report" });
  }
};

// Customer Purchase Report
const getCustomerReport = async (req, res) => {
  try {
    const { businessSlug, startDate, endDate, format } = req.query;
    
    // Validate required dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const filter = businessSlug ? { businessSlug } : {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include all purchases on that day
    end.setHours(23, 59, 59, 999);

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: start,
        $lte: end,
      },
    };

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    // Aggregate customer data
    const customerMap = {};

    giftCards.forEach((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);

      card.buyers.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        // Filter buyers by date range
        if (purchaseDate >= start && purchaseDate <= end) {
          const email = buyer.purchaseType === "self" ? buyer.selfInfo?.email : buyer.giftInfo?.senderEmail;
          const name = buyer.purchaseType === "self" ? buyer.selfInfo?.name : buyer.giftInfo?.senderName;

          if (!email) return; // Skip if no email

          if (!customerMap[email]) {
            customerMap[email] = {
              "Customer Name": name || "N/A",
              "Customer Email": email,
              "Total Purchases": 0,
              "Total Spent": 0,
              "Gift Cards Purchased": [],
            };
          }
          customerMap[email]["Total Purchases"] += 1;
          customerMap[email]["Total Spent"] += cardRevenue;
          // Use array to avoid duplicates and maintain order
          if (!customerMap[email]["Gift Cards Purchased"].includes(card.giftCardName)) {
            customerMap[email]["Gift Cards Purchased"].push(card.giftCardName);
          }
        }
      });
    });

    const customerData = Object.values(customerMap).map((customer) => ({
      ...customer,
      "Total Spent": customer["Total Spent"].toFixed(2),
      "Gift Cards Purchased": customer["Gift Cards Purchased"].join(", "), // Convert array to string
    }));

    // Sort by total spent
    customerData.sort((a, b) => parseFloat(b["Total Spent"]) - parseFloat(a["Total Spent"]));

    const headers = ["Customer Name", "Customer Email", "Total Purchases", "Total Spent", "Gift Cards Purchased"];

    if (format === "pdf") {
      const pdfBytes = await generatePDF("Customer Purchase Report", customerData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=customer-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else if (format === "xlsx") {
      await downloadExcel(res, customerData, headers, `customer-report-${Date.now()}.xlsx`, "Customer Report");
    } else {
      res.json({ success: true, data: customerData, totalCustomers: customerData.length });
    }
  } catch (error) {
    console.error("Error generating customer report:", error);
    res.status(500).json({ success: false, message: "Failed to generate customer report" });
  }
};

// Gift Card Performance Report
const getGiftCardPerformanceReport = async (req, res) => {
  try {
    const { businessSlug, format } = req.query;
    const filter = businessSlug ? { businessSlug } : {};

    const giftCards = await GiftCard.find(filter);

    const performanceData = giftCards.map((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);
      const totalSales = card.buyers?.length || 0;
      const totalRevenue = cardRevenue * totalSales;

      // Calculate redemption rate
      let totalRedeemed = 0;
      let totalRedemptions = 0;
      card.buyers?.forEach((buyer) => {
        totalRedeemed += buyer.usedAmount || 0;
        totalRedemptions += buyer.redemptionHistory?.length || 0;
      });

      const redemptionRate = totalSales > 0 ? ((totalRedemptions / totalSales) * 100).toFixed(2) : "0.00";

      return {
        "Gift Card Name": card.giftCardName,
        "Gift Card Tag": card.giftCardTag || "N/A",
        Amount: card.amount || 0,
        Discount: card.discount ? `${card.discount}%` : "0%",
        "Total Sales": totalSales,
        "Total Revenue": totalRevenue.toFixed(2),
        "Total Redeemed": totalRedeemed.toFixed(2),
        "Redemption Rate": `${redemptionRate}%`,
        Status: card.status || "active",
      };
    });

    // Sort by total revenue
    performanceData.sort((a, b) => parseFloat(b["Total Revenue"]) - parseFloat(a["Total Revenue"]));

    const headers = ["Gift Card Name", "Gift Card Tag", "Amount", "Discount", "Total Sales", "Total Revenue", "Total Redeemed", "Redemption Rate", "Status"];

    if (format === "pdf") {
      const pdfBytes = await generatePDF("Gift Card Performance Report", performanceData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=giftcard-performance-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else if (format === "xlsx") {
      await downloadExcel(res, performanceData, headers, `giftcard-performance-report-${Date.now()}.xlsx`, "Giftcard Performance");
    } else {
      res.json({ success: true, data: performanceData });
    }
  } catch (error) {
    console.error("Error generating gift card performance report:", error);
    res.status(500).json({ success: false, message: "Failed to generate gift card performance report" });
  }
};

// Redemption Report
const getRedemptionReport = async (req, res) => {
  try {
    const { businessSlug, startDate, endDate, format } = req.query;
    const filter = businessSlug ? { businessSlug } : {};

    let dateFilter = {};
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      // Set end date to end of day to include all redemptions on that day
      end.setHours(23, 59, 59, 999);
      dateFilter = {
        "buyers.redemptionHistory.redemptionDate": {
          $gte: start,
          $lte: end,
        },
      };
    }

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    const redemptionData = [];

    giftCards.forEach((card) => {
      card.buyers?.forEach((buyer) => {
        buyer.redemptionHistory?.forEach((redemption) => {
          const redemptionDate = new Date(redemption.redemptionDate);
          // Filter redemptions by date range if dates are provided
          if (!startDate || !endDate || (redemptionDate >= start && redemptionDate <= end)) {
            redemptionData.push({
              Date: formatDate(redemptionDate),
              "Gift Card Name": card.giftCardName,
              "Customer Name": buyer.purchaseType === "self" ? buyer.selfInfo?.name : buyer.giftInfo?.senderName,
              "Customer Email": buyer.purchaseType === "self" ? buyer.selfInfo?.email : buyer.giftInfo?.senderEmail,
              "Redeemed Amount": redemption.redeemedAmount.toFixed(2),
              "Remaining Balance": redemption.remainingAmount?.toFixed(2) || "0.00",
              "Original Amount": redemption.originalAmount?.toFixed(2) || "0.00",
              _sortDate: redemptionDate, // Store actual date for sorting
            });
          }
        });
      });
    });

    // Sort by actual date object
    redemptionData.sort((a, b) => a._sortDate - b._sortDate);
    // Remove temporary sorting field
    redemptionData.forEach(item => delete item._sortDate);

    const headers = ["Date", "Gift Card Name", "Customer Name", "Customer Email", "Redeemed Amount", "Remaining Balance", "Original Amount"];

    if (format === "pdf") {
      const pdfBytes = await generatePDF("Redemption Report", redemptionData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=redemption-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else if (format === "xlsx") {
      await downloadExcel(res, redemptionData, headers, `redemption-report-${Date.now()}.xlsx`, "Redemption Report");
    } else {
      const totalRedeemed = redemptionData.reduce((sum, row) => sum + parseFloat(row["Redeemed Amount"]), 0);
      res.json({ success: true, data: redemptionData, totalRedeemed: totalRedeemed.toFixed(2) });
    }
  } catch (error) {
    console.error("Error generating redemption report:", error);
    res.status(500).json({ success: false, message: "Failed to generate redemption report" });
  }
};

// Financial Summary Report
const getFinancialSummaryReport = async (req, res) => {
  try {
    const { businessSlug, startDate, endDate, format } = req.query;
    
    // Validate required dates
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const filter = businessSlug ? { businessSlug } : {};

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day to include all purchases on that day
    end.setHours(23, 59, 59, 999);

    let totalRevenue = 0;
    let totalRedemption = 0;
    let totalSales = 0;

    giftCards.forEach((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);

      card.buyers?.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        // Filter buyers by date range
        if (purchaseDate >= start && purchaseDate <= end) {
          totalRevenue += cardRevenue;
          totalSales += 1;
          totalRedemption += buyer.usedAmount || 0;
        }
      });
    });

    const netProfit = totalRevenue - totalRedemption;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const summaryData = [
      {
        Metric: "Total Revenue",
        Value: totalRevenue.toFixed(2),
      },
      {
        Metric: "Total Redemption",
        Value: totalRedemption.toFixed(2),
      },
      {
        Metric: "Net Profit",
        Value: netProfit.toFixed(2),
      },
      {
        Metric: "Total Sales",
        Value: totalSales.toString(),
      },
      {
        Metric: "Average Order Value",
        Value: averageOrderValue.toFixed(2),
      },
    ];

    const headers = ["Metric", "Value"];

    if (format === "pdf") {
      const pdfBytes = await generatePDF("Financial Summary Report", summaryData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=financial-summary-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else if (format === "xlsx") {
      await downloadExcel(res, summaryData, headers, `financial-summary-report-${Date.now()}.xlsx`, "Financial Summary");
    } else {
      res.json({
        success: true,
        data: summaryData,
        totalRevenue: totalRevenue.toFixed(2),
        totalRedemption: totalRedemption.toFixed(2),
        netProfit: netProfit.toFixed(2),
      });
    }
  } catch (error) {
    console.error("Error generating financial summary report:", error);
    res.status(500).json({ success: false, message: "Failed to generate financial summary report" });
  }
};

module.exports = {
  getSalesReport,
  getRevenueReport,
  getCustomerReport,
  getGiftCardPerformanceReport,
  getRedemptionReport,
  getFinancialSummaryReport,
};

