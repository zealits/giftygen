# Reports Feature Documentation

## Overview
The Reports feature provides comprehensive analytics and downloadable reports for your gift card business. You can generate various types of reports in CSV or PDF format with optional date filtering.

## Available Report Types

### 1. Sales Report 📊
**Description:** Detailed sales data with dates, gift cards, and buyer information.

**Data Included:**
- Date of purchase
- Gift Card Name
- Gift Card Tag
- Amount
- Discount percentage
- Revenue (after discount)
- Buyer Name
- Buyer Email

**Use Cases:**
- Track daily sales performance
- Analyze which gift cards are selling best
- Review customer purchase patterns

---

### 2. Revenue Report 💰
**Description:** Revenue analysis grouped by day, week, month, or gift card type.

**Grouping Options:**
- **Day:** Daily revenue breakdown
- **Week:** Weekly aggregated revenue
- **Month:** Monthly revenue summary
- **Gift Card Type:** Revenue per gift card type

**Data Included:**
- Period (day/week/month/gift card)
- Total Revenue
- Number of Sales
- Average Revenue per sale

**Use Cases:**
- Financial planning and forecasting
- Identifying peak revenue periods
- Comparing performance across gift card types

---

### 3. Customer Purchase Report 👥
**Description:** Complete customer purchase history and spending analysis.

**Data Included:**
- Customer Name
- Customer Email
- Total Purchases (count)
- Total Spent
- Gift Cards Purchased (list)

**Use Cases:**
- Customer segmentation
- Identifying top customers
- Marketing campaign targeting
- Customer lifetime value analysis

---

### 4. Gift Card Performance Report 🎁
**Description:** Performance metrics for each gift card type.

**Data Included:**
- Gift Card Name
- Gift Card Tag
- Amount
- Discount percentage
- Total Sales (count)
- Total Revenue
- Total Redeemed
- Redemption Rate (%)
- Status (active/sold/expired/redeemed)

**Use Cases:**
- Product performance analysis
- Identifying best/worst performing cards
- Inventory management decisions
- Pricing strategy optimization

---

### 5. Redemption Report 🔄
**Description:** Detailed redemption activity and remaining balances.

**Data Included:**
- Date of redemption
- Gift Card Name
- Customer Name
- Customer Email
- Redeemed Amount
- Remaining Balance
- Original Amount

**Use Cases:**
- Track redemption patterns
- Monitor unused balances
- Identify customers with high redemption rates
- Financial reconciliation

---

### 6. Financial Summary Report 📈
**Description:** Overall financial metrics including revenue, redemption, and profit.

**Data Included:**
- Total Revenue
- Total Redemption
- Net Profit (Revenue - Redemption)
- Total Sales (count)
- Average Order Value

**Use Cases:**
- Financial overview and reporting
- Profitability analysis
- Business performance dashboard
- Accounting and tax preparation

---

## How to Use

### Step 1: Access Reports Page
1. Log in as an Admin
2. Navigate to the "Reports" section from the sidebar

### Step 2: Select Report Type
- Click on any report type card to select it
- The selected card will be highlighted

### Step 3: Set Date Range (Optional)
- **Start Date:** Beginning of the date range
- **End Date:** End of the date range
- If no dates are selected, the report includes all data

### Step 4: Additional Options
- For Revenue Reports, select grouping option:
  - Day, Week, Month, or Gift Card Type

### Step 5: Generate Report
Choose one of three options:

1. **📥 Download CSV**
   - Generates a CSV file
   - Opens download dialog
   - File name: `{report-type}-report-{date}.csv`
   - Can be opened in Excel, Google Sheets, etc.

2. **📄 Download PDF**
   - Generates a formatted PDF document
   - Includes title, date, and formatted table
   - File name: `{report-type}-report-{date}.pdf`
   - Professional format for presentations

3. **👁️ Preview Data**
   - Shows first 50 records in a table
   - Displays summary statistics
   - Useful for quick review before downloading

---

## Technical Details

### Backend API Endpoints

All report endpoints are under `/api/v1/admin/reports/`:

- `GET /api/v1/admin/reports/sales`
- `GET /api/v1/admin/reports/revenue`
- `GET /api/v1/admin/reports/customers`
- `GET /api/v1/admin/reports/giftcard-performance`
- `GET /api/v1/admin/reports/redemption`
- `GET /api/v1/admin/reports/financial-summary`

### Query Parameters

- `businessSlug` (required): Automatically included from user session
- `startDate` (optional): ISO date string (YYYY-MM-DD)
- `endDate` (optional): ISO date string (YYYY-MM-DD)
- `format` (required): `csv`, `pdf`, or `json`
- `groupBy` (optional, revenue only): `day`, `week`, `month`, or `giftcard`

### Example API Call

```javascript
GET /api/v1/admin/reports/sales?businessSlug=my-business&startDate=2024-01-01&endDate=2024-01-31&format=csv
```

### Authentication

All report endpoints require:
- User authentication (JWT token)
- Admin role authorization

---

## File Formats

### CSV Format
- Comma-separated values
- UTF-8 encoding
- Headers in first row
- Compatible with Excel, Google Sheets, and other spreadsheet applications
- Easy to import into databases or analytics tools

### PDF Format
- Professional formatted document
- Includes title and generation date
- Table format with borders
- Automatic pagination for large datasets
- Suitable for printing and sharing

### JSON Format (Preview)
- Structured data format
- Includes metadata (totals, counts, etc.)
- Used for preview functionality
- Can be used for API integrations

---

## Data Filtering

### Date Range Filtering
- If both `startDate` and `endDate` are provided, only records within that range are included
- If only one date is provided, it's ignored (both required for filtering)
- Date comparison is inclusive (includes records on start and end dates)

### Business Filtering
- All reports are automatically filtered by the logged-in admin's `businessSlug`
- Ensures data isolation between different businesses
- No manual business selection needed

---

## Performance Considerations

- Reports are generated on-demand (not cached)
- Large datasets may take a few seconds to process
- PDF generation for very large datasets (>1000 rows) may take longer
- CSV format is faster than PDF for large datasets
- Consider using date ranges to limit data size for faster generation

---

## Error Handling

### Common Errors

1. **"Please select a report type"**
   - Solution: Click on a report type card first

2. **"Failed to generate report"**
   - Check your internet connection
   - Verify you're logged in as an Admin
   - Check browser console for detailed error

3. **No data in report**
   - Verify date range (if used)
   - Check if there's data in the selected period
   - Ensure gift cards have buyers (for sales reports)

---

## Best Practices

1. **Use Date Ranges**
   - Always specify date ranges for better performance
   - Monthly reports are easier to analyze than all-time data

2. **Preview Before Download**
   - Use "Preview Data" to verify the report contains expected data
   - Check summary statistics before downloading large files

3. **Regular Reporting**
   - Generate reports weekly/monthly for trend analysis
   - Keep historical reports for comparison

4. **Data Analysis**
   - Export to CSV for detailed analysis in Excel
   - Use PDF for presentations and sharing
   - Combine multiple reports for comprehensive insights

---

## Troubleshooting

### Report shows no data
- Verify date range includes dates with actual sales
- Check if gift cards have associated buyers
- Ensure you're viewing the correct business data

### Download not working
- Check browser popup blocker settings
- Verify file download permissions
- Try a different browser

### PDF formatting issues
- PDFs are optimized for A4 size
- Very long text may be truncated (first 20 characters shown)
- For full data, use CSV format

---

## Future Enhancements

Potential features for future versions:
- Scheduled report generation
- Email report delivery
- Custom report builder
- Chart visualizations
- Export to Excel (.xlsx) format
- Report templates
- Comparison reports (period over period)

---

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify API endpoints are accessible
4. Contact system administrator

---

**Last Updated:** January 2024

