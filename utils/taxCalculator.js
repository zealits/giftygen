/**
 * Tax calculation utility
 * Centralized tax calculation for subscriptions and invoices
 */

// Tax rate (18% GST for India - can be made configurable)
const TAX_RATE = 0.18; // 18%

/**
 * Calculate tax amount from base amount
 * @param {number} baseAmount - The base amount before tax
 * @returns {number} - The tax amount
 */
const calculateTax = (baseAmount) => {
  return baseAmount * TAX_RATE;
};

/**
 * Calculate total amount including tax
 * @param {number} baseAmount - The base amount before tax
 * @returns {number} - The total amount including tax
 */
const calculateTotalWithTax = (baseAmount) => {
  const taxAmount = calculateTax(baseAmount);
  return baseAmount + taxAmount;
};

/**
 * Get tax breakdown for an amount
 * @param {number} baseAmount - The base amount before tax
 * @returns {object} - Object containing baseAmount, taxAmount, and totalAmount
 */
const getTaxBreakdown = (baseAmount) => {
  const taxAmount = calculateTax(baseAmount);
  const totalAmount = baseAmount + taxAmount;

  return {
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    taxRate: TAX_RATE,
  };
};

/**
 * Get tax rate
 * @returns {number} - The current tax rate
 */
const getTaxRate = () => {
  return TAX_RATE;
};

module.exports = {
  calculateTax,
  calculateTotalWithTax,
  getTaxBreakdown,
  getTaxRate,
};







