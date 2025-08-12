// ** Currency Formatting Utilities for South African Rand

/**
 * Format a number as South African Rand currency
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted currency string
 */
export const formatRand = (amount, showDecimals = true) => {
  const value = parseFloat(amount || 0)
  
  if (showDecimals) {
    return `R${value.toFixed(2)}`
  }
  
  return `R${Math.round(value)}`
}

/**
 * Format a number as South African Rand with space
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with space
 */
export const formatRandWithSpace = (amount) => {
  const value = parseFloat(amount || 0)
  return `R ${value.toFixed(2)}`
}

/**
 * Format a number with thousands separator
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with thousands separator
 */
export const formatRandWithSeparator = (amount) => {
  const value = parseFloat(amount || 0)
  return `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Get currency symbol
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = () => 'R'

/**
 * Get currency code
 * @returns {string} Currency code
 */
export const getCurrencyCode = () => 'ZAR'

/**
 * Parse a currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} Parsed number value
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0
  
  // Remove currency symbol and spaces
  const cleanString = currencyString.toString().replace(/[R\s,]/g, '')
  return parseFloat(cleanString) || 0
}