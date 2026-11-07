// Formatting utilities for analytics

export const peso = (n, digits = 2) =>
  '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const pct = (n, digits = 1) => `${n.toFixed(digits)}%`
