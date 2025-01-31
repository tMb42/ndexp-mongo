const { formatDate, TimeDifference } = require('../helper/dateHelper');

class UserResource {

  constructor(user) {this.user = user;}

  toJSON() {
    const {
      id,
      name,
      email,
      email_verified_at,
      gender,
      dob,
      mobile_no,
      created_at,
      updated_at,
      display,
      inforce,
      remarks,
      aboutMe
    } = this.user;

    const safeName = name ? name.trim() : ''; 
   // Split the full name into first, middle, and last names using regex
   const splitName = safeName.trim().split(/\s+/); // Split by one or more spaces
   let first_name = '';
   let middle_name = '';
   let last_name = '';

   if (splitName.length > 0) {
    first_name = splitName[0]; // First name
   }
   if (splitName.length > 1) {
     // If there are multiple words, assign the last one as last name
     last_name = splitName[splitName.length - 1];
     
     // Middle name is everything between first and last name
     if (splitName.length > 2) {
      middle_name = splitName.slice(1, -1).join(' '); // Join middle name parts
     }
    }

    // Split the mobile number (country code and local number)
    const mobileNumber = mobile_no;
    let countryCode = null;
    let localNumber = mobileNumber;
    // Ensure mobile number is defined and contains a space
    if (mobileNumber && mobileNumber.includes(" ")) {
      const splitMobileNo = mobileNumber.split(" ");
      // Check if the first part starts with '+', treat it as the country code
      if (splitMobileNo[0] && splitMobileNo[0].startsWith('+')) {
        countryCode = splitMobileNo[0];
        localNumber = splitMobileNo[1] || null;
      }
    } else {
      console.warn("Mobile number is not in the expected format or is missing.");
    }

    // Map role details from the populated roles array
    const roleDetails = this.user.roles ? 
      this.user.roles.map((x) => ({
        id: x._id,
        name: x.name,
        label: x.label,
      })) : [];

    // Extract only the 'name' field from the roles
    const roles = this.user.roles ? this.user.roles.map((x) => x.name) : [];
    // Extract only the 'label' field from the roles
     const roleLabels = this.user.roles ? 
     this.user.roles.map((role) => role.label).filter(Boolean) : [];
    
    // Date formatting (dob)
    const formatDob = (dob) => {
      return dob ? new Intl.DateTimeFormat('en-GB', {
        weekday: 'long', 
        day: '2-digit',  
        month: 'short',  
        year: 'numeric'  
      }).format(new Date(dob)) : null;
    };

    const dobFormatted = formatDob(dob);
    // Get raw dob (SQL format)
    const dobSQL = dob;

    return {
      id,
      name,
      first_name,
      middle_name,
      last_name,
      email,
      email_verified_at: email_verified_at ? formatDate(email_verified_at) : null,
      created_at: formatDate(created_at),
      updated_at: formatDate(updated_at),
      roleId: roleDetails, // Full role details
      roles, // Only role names
      roleLabels,
      gender,
      dobSQL: dobSQL, // Raw DOB (SQL format)
      dob: dobFormatted, // Formatted DOB (e.g., "Tuesday, 31 Dec 2024")
      age: TimeDifference(dob),
      countryCode,
      localNumber,
      mobile: mobile_no,
      display,
      inforce,
      remarks,
      aboutMe
    };
  }
}

module.exports = UserResource;
