/**
 * Format a number as currency (KES)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a phone number to a standard format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's a Kenyan number
  if (digitsOnly.startsWith('254')) {
    return `+${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6, 9)} ${digitsOnly.substring(9)}`;
  }
  
  // If it starts with 0, assume it's a Kenyan number without country code
  if (digitsOnly.startsWith('0')) {
    return `+254 ${digitsOnly.substring(1, 4)} ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7)}`;
  }
  
  // Otherwise, just format with spaces
  return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '+$1 $2 $3 $4');
};
