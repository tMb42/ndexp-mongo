
/**
 * Format a given date into a human-readable string.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date in the "DD/MM/YYYY HH:MM:SS AM/PM" format.
 */
function formatDate(date) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // AM/PM format
    };
  
    return new Date(date).toLocaleString('en-GB', options);
  }
  
  /**
   * Calculate age in years, months, and days from a given date of birth (dob)
   * @param {string|Date} dob - Date of birth.
   * @returns {string} Age in the format "X years, Y months, Z days" or "Date of birth not provided" if dob is missing.
   */
  function calculateAge(dob) {
    if (!dob) {
      return "Date of birth not provided"; // Default message if dob is not provided
    }
  
    const birthDate = new Date(dob); // Convert dob to Date object
    const currentDate = new Date(); // Get current date
  
    let years = currentDate.getFullYear() - birthDate.getFullYear(); // Calculate year difference
    let months = currentDate.getMonth() - birthDate.getMonth(); // Calculate month difference
    let days = currentDate.getDate() - birthDate.getDate(); // Calculate day difference
  
    // Adjust for negative month difference
    if (months < 0) {
      years--;
      months += 12; // Add 12 months to balance the negative months
    }
  
    // Adjust for negative day difference
    if (days < 0) {
      months--;
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); // Get last day of the previous month
      days += lastMonth.getDate(); // Add the number of days in the previous month
    }
  
    return `${years} years, ${months} months, ${days} days`;
  }
  
  module.exports = { formatDate, calculateAge };
  