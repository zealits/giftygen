const GiftCard = require("../models/giftCardSchema");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// Helper function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => headers.map((header) => {
    const value = row[header] || "";
    // Escape commas and quotes in CSV
    if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(","));
  return [csvHeaders, ...csvRows].join("\n");
};

// Helper function to download CSV
const downloadCSV = (res, csvContent, filename) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csvContent);
};

// Helper function to generate PDF
const generatePDF = async (title, data, headers) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 800;
  const fontSize = 12;
  const titleFontSize = 18;
  const lineHeight = 20;
  const margin = 50;
  const pageWidth = 495; // 595 - 2*margin

  // Add title
  page.drawText(title, {
    x: margin,
    y: yPosition,
    size: titleFontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Add date
  const currentDate = new Date().toLocaleDateString();
  page.drawText(`Generated on: ${currentDate}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  yPosition -= 30;

  // Calculate column widths
  const numColumns = headers.length;
  const columnWidth = pageWidth / numColumns;

  // Draw table headers
  let xPosition = margin;
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: xPosition + 5,
      y: yPosition,
      size: fontSize - 2,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    // Draw border
    page.drawRectangle({
      x: xPosition,
      y: yPosition - 15,
      width: columnWidth,
      height: 20,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    xPosition += columnWidth;
  });

  yPosition -= 30;

  // Draw table data
  data.forEach((row) => {
    if (yPosition < 100) {
      // New page if needed
      page = pdfDoc.addPage([595, 842]);
      yPosition = 800;
      xPosition = margin;
      headers.forEach((header, index) => {
        page.drawText(header, {
          x: xPosition + 5,
          y: yPosition,
          size: fontSize - 2,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        page.drawRectangle({
          x: xPosition,
          y: yPosition - 15,
          width: columnWidth,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        xPosition += columnWidth;
      });
      yPosition -= 30;
    }

    xPosition = margin;
    headers.forEach((header) => {
      const value = String(row[header] || "");
      // Truncate if too long
      const displayValue = value.length > 20 ? value.substring(0, 17) + "..." : value;
      page.drawText(displayValue, {
        x: xPosition + 5,
        y: yPosition,
        size: fontSize - 3,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawRectangle({
        x: xPosition,
        y: yPosition - 15,
        width: columnWidth,
        height: 20,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });
      xPosition += columnWidth;
    });
    yPosition -= lineHeight;
  });

  return await pdfDoc.save();
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

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    // Aggregate sales data
    const salesData = [];
    giftCards.forEach((card) => {
      card.buyers.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        if (purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate)) {
          const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
          const revenue = (card.amount || 0) * (1 - discount);
          salesData.push({
            Date: purchaseDate.toLocaleDateString(),
            "Gift Card Name": card.giftCardName,
            "Gift Card Tag": card.giftCardTag || "N/A",
            Amount: card.amount || 0,
            Discount: card.discount ? `${card.discount}%` : "0%",
            Revenue: revenue.toFixed(2),
            "Buyer Name": buyer.purchaseType === "self" ? buyer.selfInfo?.name : buyer.giftInfo?.senderName,
            "Buyer Email": buyer.purchaseType === "self" ? buyer.selfInfo?.email : buyer.giftInfo?.senderEmail,
          });
        }
      });
    });

    // Sort by date
    salesData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const headers = ["Date", "Gift Card Name", "Gift Card Tag", "Amount", "Discount", "Revenue", "Buyer Name", "Buyer Email"];

    if (format === "csv") {
      const csv = convertToCSV(salesData, headers);
      downloadCSV(res, csv, `sales-report-${Date.now()}.csv`);
    } else if (format === "pdf") {
      const pdfBytes = await generatePDF("Sales Report", salesData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=sales-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
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

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    // Aggregate revenue data
    const revenueMap = {};
    let totalRevenue = 0;

    giftCards.forEach((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);

      card.buyers.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        let key;
          if (groupBy === "giftcard") {
            key = card.giftCardName;
          } else if (groupBy === "day") {
            key = purchaseDate.toLocaleDateString();
          } else if (groupBy === "week") {
            const weekStart = new Date(purchaseDate);
            weekStart.setDate(purchaseDate.getDate() - purchaseDate.getDay());
            key = `Week of ${weekStart.toLocaleDateString()}`;
          } else if (groupBy === "month") {
            key = purchaseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          } else {
            key = "Total";
          }

          if (!revenueMap[key]) {
            revenueMap[key] = { revenue: 0, count: 0 };
          }
          revenueMap[key].revenue += cardRevenue;
          revenueMap[key].count += 1;
          totalRevenue += cardRevenue;
      });
    });

    const revenueData = Object.entries(revenueMap).map(([key, value]) => ({
      Period: key,
      "Total Revenue": value.revenue.toFixed(2),
      "Number of Sales": value.count,
      "Average Revenue": (value.revenue / value.count).toFixed(2),
    }));

    // Add total row
    revenueData.push({
      Period: "TOTAL",
      "Total Revenue": totalRevenue.toFixed(2),
      "Number of Sales": revenueData.reduce((sum, row) => sum + parseInt(row["Number of Sales"]), 0),
      "Average Revenue": (totalRevenue / revenueData.reduce((sum, row) => sum + parseInt(row["Number of Sales"]), 0)).toFixed(2),
    });

    const headers = ["Period", "Total Revenue", "Number of Sales", "Average Revenue"];

    if (format === "csv") {
      const csv = convertToCSV(revenueData, headers);
      downloadCSV(res, csv, `revenue-report-${Date.now()}.csv`);
    } else if (format === "pdf") {
      const pdfBytes = await generatePDF("Revenue Report", revenueData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=revenue-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
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

    const dateFilter = {
      "buyers.purchaseDate": {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
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
        const email = buyer.purchaseType === "self" ? buyer.selfInfo?.email : buyer.giftInfo?.senderEmail;
        const name = buyer.purchaseType === "self" ? buyer.selfInfo?.name : buyer.giftInfo?.senderName;

        if (!customerMap[email]) {
          customerMap[email] = {
            "Customer Name": name,
            "Customer Email": email,
            "Total Purchases": 0,
            "Total Spent": 0,
            "Gift Cards Purchased": "",
          };
        }
        customerMap[email]["Total Purchases"] += 1;
        customerMap[email]["Total Spent"] += cardRevenue;
        if (customerMap[email]["Gift Cards Purchased"]) {
          customerMap[email]["Gift Cards Purchased"] += ", ";
        }
        customerMap[email]["Gift Cards Purchased"] += card.giftCardName;
      });
    });

    const customerData = Object.values(customerMap).map((customer) => ({
      ...customer,
      "Total Spent": customer["Total Spent"].toFixed(2),
    }));

    // Sort by total spent
    customerData.sort((a, b) => parseFloat(b["Total Spent"]) - parseFloat(a["Total Spent"]));

    const headers = ["Customer Name", "Customer Email", "Total Purchases", "Total Spent", "Gift Cards Purchased"];

    if (format === "csv") {
      const csv = convertToCSV(customerData, headers);
      downloadCSV(res, csv, `customer-report-${Date.now()}.csv`);
    } else if (format === "pdf") {
      const pdfBytes = await generatePDF("Customer Purchase Report", customerData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=customer-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
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

    if (format === "csv") {
      const csv = convertToCSV(performanceData, headers);
      downloadCSV(res, csv, `giftcard-performance-report-${Date.now()}.csv`);
    } else if (format === "pdf") {
      const pdfBytes = await generatePDF("Gift Card Performance Report", performanceData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=giftcard-performance-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
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
    if (startDate && endDate) {
      dateFilter = {
        "buyers.redemptionHistory.redemptionDate": {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const giftCards = await GiftCard.find({ ...filter, ...dateFilter });

    const redemptionData = [];

    giftCards.forEach((card) => {
      card.buyers?.forEach((buyer) => {
        buyer.redemptionHistory?.forEach((redemption) => {
          const redemptionDate = new Date(redemption.redemptionDate);
          redemptionData.push({
            Date: redemptionDate.toLocaleDateString(),
            "Gift Card Name": card.giftCardName,
            "Customer Name": buyer.purchaseType === "self" ? buyer.selfInfo?.name : buyer.giftInfo?.senderName,
            "Customer Email": buyer.purchaseType === "self" ? buyer.selfInfo?.email : buyer.giftInfo?.senderEmail,
            "Redeemed Amount": redemption.redeemedAmount.toFixed(2),
            "Remaining Balance": redemption.remainingAmount?.toFixed(2) || "0.00",
            "Original Amount": redemption.originalAmount?.toFixed(2) || "0.00",
          });
        });
      });
    });

    // Sort by date
    redemptionData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const headers = ["Date", "Gift Card Name", "Customer Name", "Customer Email", "Redeemed Amount", "Remaining Balance", "Original Amount"];

    if (format === "csv") {
      const csv = convertToCSV(redemptionData, headers);
      downloadCSV(res, csv, `redemption-report-${Date.now()}.csv`);
    } else if (format === "pdf") {
      const pdfBytes = await generatePDF("Redemption Report", redemptionData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=redemption-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
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

    let totalRevenue = 0;
    let totalRedemption = 0;
    let totalSales = 0;

    giftCards.forEach((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);

      card.buyers?.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate);
        totalRevenue += cardRevenue;
        totalSales += 1;
        totalRedemption += buyer.usedAmount || 0;
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

    if (format === "csv") {
      const csv = convertToCSV(summaryData, headers);
      downloadCSV(res, csv, `financial-summary-report-${Date.now()}.csv`);
    } else if (format === "pdf") {
      const pdfBytes = await generatePDF("Financial Summary Report", summaryData, headers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=financial-summary-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBytes));
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

